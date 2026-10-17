/* Approved original SE + BGM. Audio never gates game progress. */
(function (root) {
  'use strict';
  const FILES = Object.freeze({confirm:'01_confirm.wav',dice:'02_dice.wav',move:'03_move.wav',card:'04_card.wav',correct:'05_correct.wav',retry:'06_retry.wav',badge:'07_badge.wav'});
  const PRIORITY = {confirm:1,move:1,dice:2,card:2,correct:3,retry:3,badge:4};
  const COOLDOWN = {confirm:240,move:220,dice:750,card:400,correct:650,retry:550,badge:1100};
  const VOLUME_KEY = 'emamon-sugoroku-se-volume-v1';
  const BGM_VOLUME_KEY = 'emamon-sugoroku-bgm-volume-v1';
  const MUSIC = Object.freeze({title:{file:'title-sparkling.mp3',loop:true},play:{file:'play-friendly-light-bounce.mp3',loop:true},clear:{file:'clear-warm.mp3',loop:false}});
  // One lazy-decoded BGM at a time, with a separate gain path from the short cues.
  // Full songs retain their natural fade-outs. Play uses the approved Light Bounce revision.
  function createMusic(env) {
    let enabled=false,volume=.3,scene=null,active=null,pending=null,epoch=0,held=false,blocked=false,finished=false,issue='';
    let cached=null; const loads=new Map(),failed=new Set();
    try { const value=env.storage?.getItem(BGM_VOLUME_KEY);if(value!==null&&value!==undefined&&value!==''&&Number.isFinite(Number(value)))volume=Math.max(0,Math.min(1,Number(value))); } catch {}
    const snapshot=()=>({volume,scene,playing:!!active,held,blocked,finished,issue});
    const notify=()=>{try{env.onChange?.();}catch{}};
    function halt(hold=held){epoch++;pending=null;held=hold;const previous=active;active=null;if(previous){try{previous.source.stop();}catch{}try{previous.source.disconnect();previous.gain.disconnect();}catch{}}}
    function load(name,context){
      if(cached?.name===name)return Promise.resolve(cached.buffer);
      if(!loads.has(name))loads.set(name,Promise.resolve().then(()=>env.fetch('assets/audio/bgm/'+MUSIC[name].file)).then(r=>{if(!r.ok)throw Error('music unavailable');return r.arrayBuffer()}).then(bytes=>context.decodeAudioData(bytes)).then(buffer=>{if(scene===name&&enabled)cached={name,buffer};return buffer}).catch(()=>{failed.add(name);if(scene===name&&enabled){issue='BGMを読み込めませんでした。音なしでも遊べます。音ONを押し直すと再試行できます。';notify();}return null}).finally(()=>loads.delete(name)));
      return loads.get(name);
    }
    function start(){
      const context=env.getContext();
      if(!enabled||!volume||!scene||held||blocked||finished||active||pending||failed.has(scene)||env.hidden?.()||!context)return Promise.resolve(false);
      const name=scene,generation=epoch,task={};pending=task;
      return Promise.all([env.getReady(),load(name,context)]).then(([,buffer])=>{
        if(pending===task)pending=null;
        if(!buffer||generation!==epoch||name!==scene||!enabled||!volume||held||blocked||finished||env.hidden?.()||context.state!=='running')return false;
        const source=context.createBufferSource(),gain=context.createGain();
        source.buffer=buffer;source.loop=MUSIC[name].loop;source.connect(gain);gain.connect(context.destination);
        const level=volume*.5,t=context.currentTime||0;
        if(gain.gain.setValueAtTime&&gain.gain.linearRampToValueAtTime){gain.gain.setValueAtTime(0,t);gain.gain.linearRampToValueAtTime(level,t+.7)}else gain.gain.value=level;
        const voice={source,gain,name};active=voice;
        source.onended=()=>{if(active===voice){active=null;if(!MUSIC[name].loop)finished=true;notify()}try{source.disconnect();gain.disconnect()}catch{}};
        try{source.start(0)}catch(error){halt();throw error}issue='';notify();return true;
      }).catch(()=>{if(pending===task)pending=null;issue='BGMを再生できませんでした。音なしでも遊べます。';notify();return false});
    }
    function setScene(value){const next=MUSIC[value]?value:null;if(next===scene)return;halt();scene=next;finished=false;start();}
    function setEnabled(value){enabled=!!value;halt(false);finished=false;if(enabled){failed.clear();issue=''}notify();}
    function setVolume(value){const n=Number(value);if(!Number.isFinite(n))return;volume=Math.max(0,Math.min(1,n));if(!volume)halt();else if(active){const g=active.gain.gain,t=env.getContext()?.currentTime||0;g.cancelScheduledValues?.(t);if(g.setTargetAtTime)g.setTargetAtTime(volume*.5,t,.08);else g.value=volume*.5;}else start();try{env.storage?.setItem(BGM_VOLUME_KEY,String(volume))}catch{}notify();}
    function resume(){held=false;finished=false;failed.clear();start();}
    function unlock(){if(env.hidden?.())return;blocked=false;start();}
    function leave(){blocked=true;halt();}
    return {snapshot,setScene,setEnabled,setVolume,resume,unlock,leave,stop:()=>halt(true)};
  }
  function createAudio(env) {
    let context, master, ready = Promise.resolve(), active = null, suspending = null;
    let enabled = false, volume = .5, epoch = 0, request = 0, blocked = false, issue = '';
    const buffers = new Map(), loads = new Map(), last = new Map();
    const now = () => env.now ? env.now() : Date.now();
    try { const value = env.storage?.getItem(VOLUME_KEY); if (value !== null && value !== undefined && value !== '' && Number.isFinite(Number(value))) volume = Math.max(0,Math.min(1,Number(value))); } catch {}
    const snapshot = () => ({enabled,volume,issue});
    const notify = () => { try { env.onChange?.(snapshot()); } catch {} };
    const music=createMusic({...env,getContext:()=>context,getReady:()=>ready,onChange:notify});
    function applyVolume() { if (master) master.gain.value = enabled ? volume * .7 : 0; }
    function stop() {
      epoch++; request++;
      const playing = active; active = null;
      if (playing) { try { playing.source.stop(); } catch {} try { playing.source.disconnect(); } catch {} }
    }
    function load(name) {
      if (buffers.has(name)) return Promise.resolve(buffers.get(name));
      if (!loads.has(name)) {
        loads.set(name, Promise.resolve().then(() => env.fetch('assets/audio/' + FILES[name]))
          .then(r => { if (!r.ok) throw Error('audio unavailable'); return r.arrayBuffer(); })
          .then(bytes => context.decodeAudioData(bytes))
          .then(buffer => { buffers.set(name,buffer); return buffer; })
          .catch(() => { issue='一部の効果音を読み込めませんでした。音なしでも遊べます。'; notify(); return null; }));
      }
      return loads.get(name);
    }
    function unlock() {
      if (env.hidden?.()) return;
      blocked = false;
      try {
        if (!context) {
          if (!env.AudioContext) throw Error('audio unsupported');
          context = new env.AudioContext(); master = context.createGain(); master.connect(context.destination); applyVolume();
        }
        // Called synchronously from the user's gesture, including Safari/iOS resume.
        if (context.state !== 'running' || suspending) {
          // Request resume inside the gesture, then reconcile a pending hide/suspend.
          // A rapid foreground gesture must not be overtaken by the earlier suspend.
          ready = Promise.all([Promise.resolve(context.resume()),suspending]).then(() => {
            if(!blocked&&!env.hidden?.()&&context.state!=='running')return context.resume();
          }).then(() => { if (issue==='音を再生できませんでした。音ONを押し直すと再試行できます。') { issue=''; notify(); } }).catch(() => { issue='音を再生できませんでした。音ONを押し直すと再試行できます。'; notify(); });
        }
        Object.keys(FILES).forEach(load); music.unlock();
      } catch { issue='この端末では効果音を準備できません。音なしでも遊べます。'; notify(); }
    }
    function play(name) {
      if (!FILES[name] || !enabled || !volume || blocked || env.hidden?.() || !context) return Promise.resolve(false);
      const ticket=++request, generation=epoch, began=now();
      return Promise.all([ready,load(name)]).then(([,buffer]) => {
        // Discard stale decodes and sounds requested before mute, pause or page exit.
        if (!buffer || ticket!==request || generation!==epoch || !enabled || !volume || blocked || env.hidden?.() || context.state!=='running' || now()-began>350) return false;
        if (now()-(last.get(name)??-Infinity)<COOLDOWN[name]) return false;
        if (active && PRIORITY[active.name]>PRIORITY[name]) return false;
        const previous=active; active=null;
        if (previous) { try { previous.source.stop(); } catch {} try { previous.source.disconnect(); } catch {} }
        const source=context.createBufferSource(); source.buffer=buffer; source.connect(master);
        active={name,source}; source.onended=()=>{if(active?.source===source)active=null;try{source.disconnect();}catch{}};
        source.start(0); last.set(name,now()); return true;
      }).catch(() => false);
    }
    function setEnabled(value) {
      enabled=!!value; stop(); applyVolume(); music.setEnabled(enabled);
      if(enabled) { unlock(); play('confirm'); } notify();
    }
    function setVolume(value) {
      const n=Number(value); if(!Number.isFinite(n))return;
      volume=Math.max(0,Math.min(1,n)); if(!volume)stop(); applyVolume();
      try { env.storage?.setItem(VOLUME_KEY,String(volume)); } catch {}
      notify();
    }
    function leave() {
      blocked=true; stop(); music.leave();
      try { if(context){const pending=Promise.all([suspending,Promise.resolve(context.suspend()).catch(()=>{})]);suspending=pending;pending.finally(()=>{if(suspending===pending)suspending=null;});} } catch {}
    }
    return {unlock,play,stop,leave,setEnabled,setVolume,snapshot,music};
  }
  if(typeof module!=='undefined')module.exports={createAudio,createMusic,FILES,MUSIC,COOLDOWN,VOLUME_KEY,BGM_VOLUME_KEY,setupSoundMarkup};
  if(!root?.document)return;
  const doc=root.document, find=id=>doc.getElementById(id);
  const update=s=>{
    const bgm=root.EmamonAudio?.music.snapshot()||{volume:.3,issue:''};
    const toggle=find('soundToggle');
    if(toggle){toggle.textContent=s.enabled?'音：ON':'音：OFF';toggle.setAttribute('aria-pressed',String(s.enabled));}
    for(const [id,selected] of [['setupSoundOff',!s.enabled],['setupSoundOn',s.enabled]])find(id)?.setAttribute('aria-pressed',String(selected));
    for(const prefix of ['sound','setupSound']){
      const test=find(prefix+'Test'),volume=find(prefix+'Volume'),label=find(prefix+'VolumeValue'),status=find(prefix+'Status');
      if(test)test.disabled=!s.enabled;
      if(volume)volume.value=String(Math.round(s.volume*100));
      if(label)label.textContent=Math.round(s.volume*100)+'%';
      const musicVolume=find(prefix+'BgmVolume'),musicLabel=find(prefix+'BgmVolumeValue');
      if(musicVolume)musicVolume.value=String(Math.round(bgm.volume*100));
      if(musicLabel)musicLabel.textContent=Math.round(bgm.volume*100)+'%';
      if(status){const issue=[s.issue,bgm.issue].filter(Boolean).join(' ');status.hidden=!issue;status.textContent=issue;}
    }
  };
  const audio=root.EmamonAudio=createAudio({AudioContext:root.AudioContext||root.webkitAudioContext,fetch:(...args)=>root.fetch(...args),storage:{getItem:key=>root.localStorage.getItem(key),setItem:(key,value)=>root.localStorage.setItem(key,value)},hidden:()=>doc.hidden,onChange:update});
  // Keep preparation tied to actual gestures; restoring a saved game never starts sound.
  const resumeEnabled=()=>{if(audio.snapshot().enabled)audio.unlock();};
  doc.addEventListener('pointerdown',resumeEnabled,{capture:true,passive:true});
  doc.addEventListener('keydown',event=>{if(event.key==='Enter'||event.key===' ')resumeEnabled();},{capture:true});
  doc.addEventListener('click',resumeEnabled,{capture:true});
  doc.addEventListener('visibilitychange',()=>{if(doc.hidden)audio.leave();});
  root.addEventListener('pagehide',()=>audio.leave());
  if(find('soundToggle'))find('soundToggle').onclick=()=>audio.setEnabled(!audio.snapshot().enabled);
  if(find('soundVolume'))find('soundVolume').oninput=event=>audio.setVolume(Number(event.target.value)/100);
  if(find('soundBgmVolume'))find('soundBgmVolume').oninput=event=>audio.music.setVolume(Number(event.target.value)/100);
  const testSound=()=>{audio.play('confirm');audio.music.resume();};
  if(find('soundTest'))find('soundTest').onclick=testSound;
  // Setup is rebuilt by render(). Bind its controls after each render without
  // resetting the shared audio state or starting audio during a rerender.
  audio.bindSetup=()=>{
    if(find('setupSoundOff'))find('setupSoundOff').onclick=()=>audio.setEnabled(false);
    if(find('setupSoundOn'))find('setupSoundOn').onclick=()=>audio.setEnabled(true);
    if(find('setupSoundTest'))find('setupSoundTest').onclick=testSound;
    if(find('setupSoundBgmVolume'))find('setupSoundBgmVolume').oninput=event=>audio.music.setVolume(Number(event.target.value)/100);
    if(find('setupSoundVolume'))find('setupSoundVolume').oninput=event=>audio.setVolume(Number(event.target.value)/100);
    update(audio.snapshot());
  };
  update(audio.snapshot());
})(typeof window!=='undefined'?window:null);
function playSound(name){try{const pending=typeof window!=='undefined'&&window.EmamonAudio?.play(name);pending?.catch?.(()=>{});}catch{}}
function stopSound(){try{if(typeof window!=='undefined'){window.EmamonAudio?.stop();window.EmamonAudio?.music?.stop();}}catch{}}
function setMusicScene(scene){try{if(typeof window!=='undefined')window.EmamonAudio?.music?.setScene(scene);}catch{}}
function resumeMusic(){try{if(typeof window!=='undefined')window.EmamonAudio?.music?.resume();}catch{}}

function setupSoundMarkup(){return `<fieldset class="setupSound soundSettings" aria-describedby="setupSoundHelp"><legend>音の設定</legend><div class="soundButtons" role="group" aria-label="BGMと効果音のオン・オフ"><button type="button" id="setupSoundOff" class="secondary" aria-pressed="true">音：OFF</button><button type="button" id="setupSoundOn" class="secondary" aria-pressed="false">音：ON</button><button type="button" id="setupSoundTest" class="secondary" disabled>音をためす</button></div><label for="setupSoundVolume">効果音の音量 <output id="setupSoundVolumeValue" for="setupSoundVolume">50%</output></label><input id="setupSoundVolume" type="range" min="0" max="100" step="5" value="50" aria-describedby="setupSoundHelp"><label for="setupSoundBgmVolume">BGMの音量 <output id="setupSoundBgmVolumeValue" for="setupSoundBgmVolume">30%</output></label><input id="setupSoundBgmVolume" type="range" min="0" max="100" step="5" value="30" aria-describedby="setupSoundHelp"><p id="setupSoundHelp" class="caption">はじめは音OFFです。音ONを押すとBGMと効果音が鳴ります。音量は別々に変えられます。あとでメニューから変えられます。</p><p id="setupSoundStatus" class="caption" role="status" hidden></p></fieldset>`;}
function bindSetupSound(){if(typeof window!=='undefined')window.EmamonAudio?.bindSetup?.();}
