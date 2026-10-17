// Initial OFF on every page load. One BGM element and one SE element only.
(()=>{'use strict';
const bgm=document.getElementById('bgm'),se=document.getElementById('se'),dialog=document.getElementById('soundDialog'),status=document.getElementById('audioStatus');
const tracks={title:'Sparkling Adventure Theme.mp3',play:'Friendly Game Groove.mp3',ending:'Warm Marimba Motif.mp3'};
const effects={confirm:'01_confirm.wav',correct:'05_correct.wav',retry:'06_retry.wav',badge:'07_badge.wav'};
let enabled={bgm:false,se:false},volume={bgm:.3,se:.65},current='title',track=null,ctx=null,gains=null,active=false;let suspending=null,recovering=null;let seSource=null,seSerial=0,lastSE='none';const bytes=new Map(),decoded=new Map();const musicFiles=new Map();let loadingTrack=null,playPending=null;
function prepareMusic(name){if(!musicFiles.has(name))musicFiles.set(name,fetch('audio/'+name).then(r=>{if(!r.ok)throw Error('BGM '+r.status);return r.blob()}).then(blob=>URL.createObjectURL(blob)).catch(e=>{musicFiles.delete(name);throw e}));return musicFiles.get(name)}
// Fetch compressed music completely before playing; no streaming dependency during a track.
for(const name of [tracks.title,tracks.play])prepareMusic(name).catch(()=>{});
// Persist only explicit volume changes; sound remains OFF at every launch.
const levelKey='emamon_audio_levels_v1';try{const saved=JSON.parse(localStorage.getItem(levelKey));for(const k of ['bgm','se'])if(typeof saved?.[k]==='number'&&saved[k]>=0&&saved[k]<=1)volume[k]=saved[k]}catch{}
for(const k of ['bgm','se']){document.getElementById(k+'Volume').value=String(Math.round(volume[k]*100));document.getElementById(k+'Value').textContent=Math.round(volume[k]*100)+'%'}
function tell(text){status.textContent=text;window.EMAMON_RUBY?.apply(status)}
function pause(el){el.pause();try{el.currentTime=0}catch{}}
function stopSE(){seSerial++;if(seSource){try{seSource.stop()}catch{}seSource=null}pause(se)}
function stop(){pause(bgm);stopSE()}
function leave(){active=false;bgm.pause();stopSE();if(ctx){const pending=Promise.all([suspending,Promise.resolve(ctx.suspend()).catch(()=>{})]);suspending=pending;pending.finally(()=>{if(suspending===pending)suspending=null})}}
function resumeEnabled(){if(document.hidden||!(enabled.bgm||enabled.se))return;unlock();music()}
function graph(){if(ctx)return;const AC=window.AudioContext||window.webkitAudioContext;if(!AC)return;try{ctx=new AC();ctx.addEventListener?.('statechange',()=>{bgm.dataset.contextState=ctx.state;if(!active||document.hidden||!(enabled.bgm||enabled.se))return;if(ctx.state==='running'){music();return}if(!recovering&&['suspended','interrupted'].includes(ctx.state)){recovering=Promise.resolve().then(()=>ctx.resume()).then(()=>{if(active&&!document.hidden)music()}).catch(()=>tell('音声が一時停止しています。「音を再試行」を押してください。')).finally(()=>{recovering=null})}});gains={bgm:ctx.createGain(),se:ctx.createGain()};for(const key of ['bgm','se']){gains[key].gain.value=volume[key];gains[key].connect(ctx.destination)}ctx.createMediaElementSource(bgm).connect(gains.bgm);bgm.volume=1}catch{gains=null}}
function getBytes(kind){if(!bytes.has(kind))bytes.set(kind,fetch('audio/'+effects[kind]).then(r=>{if(!r.ok)throw Error('audio '+r.status);return r.arrayBuffer()}).catch(e=>{bytes.delete(kind);throw e}));return bytes.get(kind)}
// Optional warming only: never part of the image loader's completion condition.
for(const kind of Object.keys(effects))getBytes(kind).catch(()=>{});
function getBuffer(kind){if(!decoded.has(kind))decoded.set(kind,getBytes(kind).then(b=>ctx.decodeAudioData(b.slice(0))).catch(e=>{decoded.delete(kind);throw e}));return decoded.get(kind)}
function levels(){for(const [key,el] of Object.entries({bgm,se})){if(gains)gains[key].gain.value=volume[key];else el.volume=volume[key]}}
function unlock(){active=true;graph();if(ctx&&(ctx.state!=='running'||suspending)){try{const resumed=Promise.all([Promise.resolve(ctx.resume()),suspending]).then(()=>{if(active&&!document.hidden&&ctx.state!=='running')return ctx.resume()}).then(()=>{if(active&&!document.hidden)music()});resumed?.catch(()=>tell('音を始められませんでした。「音を再試行」を押してください。'));const prime=ctx.createBufferSource();prime.buffer=ctx.createBuffer(1,1,22050);prime.connect(gains?.se||ctx.destination);prime.start()}catch{}}}
function play(el){try{const p=el.play();p?.catch(e=>{if(e.name!=='AbortError')tell('音を始められませんでした。音なしで続けるか、「音を再試行」を押してください。')})}catch{tell('音を始められませんでした。音なしでも遊べます。')}}
function music(){
 if(!enabled.bgm||!active||document.hidden){bgm.pause();return}
 const next=tracks[current];
 if(track!==next){
   if(loadingTrack===next)return;
   pause(bgm);loadingTrack=next;bgm.dataset.loading='true';
   prepareMusic(next).then(url=>{
     if(loadingTrack!==next)return;loadingTrack=null;if(tracks[current]!==next)return;
     track=next;bgm.src=url;bgm.preload='auto';bgm.dataset.track=next;bgm.dataset.loading='false';bgm.load();music();
   }).catch(()=>{if(loadingTrack!==next)return;loadingTrack=null;bgm.dataset.loading='failed';tell('BGMの準備ができませんでした。「音を再試行」を押してください。')});
   return;
 }
 if(bgm.paused&&!playPending){
   try{const request=bgm.play();playPending=request;Promise.resolve(request).catch(e=>{if(e.name!=='AbortError'&&enabled.bgm&&!document.hidden)tell('BGMを始めるには、もう一度画面をタップしてください。')}).finally(()=>{if(playPending===request)playPending=null})}catch{tell('BGMを始めるには、もう一度画面をタップしてください。')}
 }
}
function effect(kind){if(!enabled.se||!active||document.hidden)return;stopSE();const serial=seSerial;lastSE='preparing:'+kind;se.dataset.playback=lastSE;
 if(ctx&&gains){Promise.all([ctx.state==='running'?Promise.resolve():ctx.resume(),getBuffer(kind)]).then(([,buffer])=>{if(serial!==seSerial||!enabled.se||!active||document.hidden)return;seSource=ctx.createBufferSource();seSource.buffer=buffer;seSource.connect(gains.se);seSource.onended=()=>{if(serial===seSerial){lastSE='ended:'+kind;se.dataset.playback=lastSE;seSource=null}};seSource.start();lastSE='playing:'+kind;se.dataset.playback=lastSE;se.dataset.duration=String(buffer.duration);se.dataset.contextStarted=String(ctx.currentTime);}).catch(()=>{if(serial===seSerial){lastSE='failed:'+kind;se.dataset.playback=lastSE;tell('効果音を準備できませんでした。「音を再試行」を押してください。')}});
 }else{se.src='audio/'+effects[kind];se.load();play(se);lastSE='media:'+kind;se.dataset.playback=lastSE}}
function badge(){effect('badge')}
function updateLabel(){document.getElementById('soundSettings').setAttribute('aria-pressed',String(enabled.bgm||enabled.se));document.getElementById('soundSettings').textContent='音：'+(enabled.bgm&&enabled.se?'ON':enabled.bgm?'BGM':enabled.se?'SE':'OFF');window.EMAMON_RUBY?.apply(document.getElementById('soundSettings'))}
for(const key of ['bgm','se']){
 document.getElementById(key+'On').onchange=e=>{enabled[key]=e.target.checked;tell('');unlock();levels();if(key==='bgm')music();else if(enabled.se)effect('confirm');else stopSE();updateLabel()};
 document.getElementById(key+'Volume').oninput=e=>{volume[key]=Number(e.target.value)/100;document.getElementById(key+'Value').textContent=e.target.value+'%';try{localStorage.setItem(levelKey,JSON.stringify(volume))}catch{}levels()};
}
document.getElementById('soundSettings').onclick=()=>{const on=!(enabled.bgm||enabled.se);enabled={bgm:on,se:on};for(const key of ['bgm','se'])document.getElementById(key+'On').checked=on;tell('');if(on){unlock();levels();music();effect('confirm')}else stop();updateLabel()};
document.getElementById('audioDetails').onclick=()=>{document.getElementById('titleMenu').close();window.EMAMON_RUBY?.apply(dialog);dialog.showModal()};
document.getElementById('soundClose').onclick=()=>dialog.close();
document.getElementById('audioRetry').onclick=()=>{tell('');unlock();music();effect('confirm')};
for(const el of [bgm,se])el.addEventListener('error',()=>tell('音の読み込みに失敗しました。音なしでも遊べます。「音を再試行」でやり直せます。'));
// Recover only when sound was explicitly enabled; never enable sound on behalf of the user.
document.addEventListener('pointerdown',resumeEnabled,{capture:true,passive:true});
document.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' ')resumeEnabled()},true);
document.addEventListener('click',resumeEnabled,true);
document.addEventListener('click',e=>{const target=e.target.closest('[data-act],[data-hero],[data-answer],#confirmOk');if(!target)return;if(enabled.bgm||enabled.se){unlock();music()}
 if(target.dataset.answer!==undefined)return; // Answer SE is chosen by game logic, not the answer's position.
 if(target.dataset.act==='clear')badge();else effect('confirm');
},true);
document.addEventListener('visibilitychange',()=>{if(document.hidden)leave();else resumeEnabled()});
window.addEventListener('pagehide',leave);
window.addEventListener('pageshow',resumeEnabled);
if(new URLSearchParams(location.search).get('audioDebug')==='1'){
 const box=document.createElement('output');box.id='audioDebug';box.style.cssText='position:fixed;left:4px;bottom:4px;z-index:99999;background:#111e;color:#fff;padding:6px;font:11px monospace;pointer-events:none;white-space:pre';document.body.appendChild(box);
 setInterval(()=>{const end=bgm.buffered.length?bgm.buffered.end(bgm.buffered.length-1):0;box.textContent='BGM '+(enabled.bgm?'ON':'OFF')+' '+(bgm.dataset.loading==='true'?'準備中':bgm.paused?'停止':'再生')+'\n'+bgm.currentTime.toFixed(1)+' / '+(Number.isFinite(bgm.duration)?bgm.duration.toFixed(1):'?')+'s 読込 '+end.toFixed(1)+'s\nAudio '+(ctx?.state||'未開始')+' / ready '+bgm.readyState},500);
}
window.EMAMON_AUDIO={scene(screen){current=['ending','clear'].includes(screen)?'ending':['title','opening','select','name'].includes(screen)?'title':'play';music()},answer(correct){effect(correct?'correct':'retry')},stop};
})();
