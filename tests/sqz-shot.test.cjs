// Run: node --test tests/sqz-shot.test.cjs (no external dependencies).
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const path=require('node:path');
const root=path.join(__dirname,'..');
const source=fs.readFileSync(path.join(root,'games/sqz/shot.js'),'utf8');
function env(reduced=false){
 const queue=new Map();let id=0;
 const ctx=vm.createContext({setTimeout,clearTimeout,performance:{now:()=>0},matchMedia:()=>({matches:reduced}),requestAnimationFrame:fn=>{queue.set(++id,fn);return id;},cancelAnimationFrame:id=>queue.delete(id)});
 vm.runInContext(source,ctx);
 const nodes=new Map();
 const element={dataset:{},isConnected:true,querySelector(s){if(!nodes.has(s))nodes.set(s,{style:{},complete:true,naturalWidth:640,addEventListener(){}});return nodes.get(s);}};
 return {api:ctx.SQZShot,element,queue,tick(ms){for(const [id,fn] of [...queue]){queue.delete(id);fn(ms);}}};
}
test('both directions use all 8 poses, continuous body movement and common artwork scale',()=>{
 const {api}=env();
 for(const side of ['left','right']){
  const frames=new Set();let last=null;
  for(let ms=0;ms<=1750;ms+=5){const p=api.pose(ms,false,side);frames.add(p.keeper.frame);
   if(last!==null)assert.ok(Math.abs(p.keeper.x-last)<1, 'no travel teleport');last=p.keeper.x;
   assert.ok(p.keeper.x>=118&&p.keeper.x<=202);
  }
  assert.deepEqual([...frames],[0,1,2,3,4,5,6,7]);
 }
});
test('goal misses keeper, save contacts glove, only goal moves net',()=>{
 const {api}=env();
 for(const side of ['left','right']){
  const before=api.pose(789.99,false,side),contact=api.pose(790,false,side);
  assert.ok(Math.hypot(contact.ball.x-before.ball.x,contact.ball.y-before.ball.y)<.05);
  assert.equal(contact.caught,true);assert.equal(contact.banner,false);
  const goal=api.pose(850,true,side),save=api.pose(850,false,side);
  assert.ok(Math.abs(goal.ball.x-goal.keeper.x)>75);
  assert.notEqual(goal.net,0);assert.equal(save.net,0);
  assert.equal(api.pose(900,false,side).banner,true);
 }
});
test('skip is idempotent and cancels all scheduled animation frames',()=>{
 const e=env();let finished=0;
 const c=e.api.create(e.element,{ok:true,onComplete:()=>finished++});
 c.begin();e.tick(350);c.skip();c.skip();e.tick(2000);
 assert.equal(finished,1);assert.equal(e.queue.size,0);assert.equal(c.active,false);
 assert.equal(e.element.dataset.shotState,'complete');
});
test('screen navigation cancels without completing detached content',()=>{
 const e=env();let finished=0;
 const c=e.api.create(e.element,{ok:false,onComplete:()=>finished++});
 c.begin();c.cancel();e.element.isConnected=false;c.begin();c.skip();e.tick(2000);
 assert.equal(finished,0);assert.equal(e.queue.size,0);
});
test('natural end and reduced motion each complete once',()=>{
 for(const reduced of [false,true]){const e=env(reduced);let finished=0;
  const c=e.api.create(e.element,{ok:true,superShot:true,onComplete:()=>finished++});
  c.begin();e.tick(900);e.tick(1750);e.tick(3000);
  assert.equal(finished,1);assert.equal(e.queue.size,0);assert.equal(e.element.dataset.superShot,'true');
 }
});
test('missing sprite cannot block feedback',()=>{
 const e=env();e.element.querySelector('.keeper-sprite img').naturalWidth=0;let finished=0;
 const c=e.api.create(e.element,{ok:false,onComplete:()=>finished++});c.begin();assert.equal(finished,1);
});
test('question bank retains 200 valid unique questions and inline scripts parse',()=>{
 const html=fs.readFileSync(path.join(root,'games/sqz/index.html'),'utf8');
 const scripts=[...html.matchAll(/<script>([\s\S]*?)<\/script>/g)].map(m=>m[1]);
 scripts.forEach(s=>new vm.Script(s));
 const ctx=vm.createContext({window:{}});vm.runInContext(scripts[0],ctx);
 const bank=ctx.window.QUIZ_BANK;
 assert.equal(bank.length,200);assert.equal(new Set(bank.map(q=>q.id)).size,200);
 for(const q of bank){assert.equal(q.choices.length,4);assert.equal(new Set(q.choices).size,4);assert.ok(q.choices.includes(q.answer));}
 const {api}=env();
 const atlas=JSON.parse(fs.readFileSync(path.join(root,'games/sqz/assets/characters-v3/frames.json')));
 assert.equal(api.keeperFrames.length,8);assert.equal(api.strikerFrames.length,8);
 assert.equal(api.scale,.30);
 assert.deepEqual(JSON.parse(JSON.stringify(api.keeperFrames)),atlas.keeperRight);
 for(const [x,y,w,h,ax,ay] of [...atlas.keeperRight,...atlas.striker]){
  assert.ok(x>=0&&y>=0&&x+w<=1254&&y+h<=1254);assert.ok(ax>=x&&ax<=x+w&&ay>=y&&ay<=y+h);
 }
 assert.match(api.markup(),/shot-trail" hidden/);
 assert.match(api.markup(),/striker-sprite/);
 assert.doesNotMatch(api.markup(),/class="player striker"/);
});

// Executes the real game scripts with a minimal DOM adapter. This verifies
// storage/state/event integration; it does not claim browser layout coverage.
function game(speechSupported=true){
 const e=env(),nodes=new Map(),events=new Map(),storage=new Map();
 function node(key){if(!nodes.has(key)){
  const classes=new Set();nodes.set(key,{style:{},dataset:{},isConnected:true,complete:true,naturalWidth:640,
   hidden:false,textContent:'',classList:{add:x=>classes.add(x),contains:x=>classes.has(x),toggle(){}},
   setAttribute(){},addEventListener(){},focus(){},querySelector:s=>node(key+' '+s)});
 }return nodes.get(key);}
 const document={hidden:false,querySelector:node,getElementById:id=>node('#'+id),querySelectorAll:()=>[],addEventListener:(n,fn)=>events.set(n,fn)};
 const calls=[],spoken=[],audioEvents=[],gainValues=[];
 const navigator={audioSession:{set type(value){audioEvents.push('session:'+value);}}};let speechCancels=0;
 const speechSynthesis=speechSupported?{cancel(){speechCancels++;},getVoices:()=>[{lang:"en-US"},{lang:"ja-JP"}],speak:u=>spoken.push(u)}:undefined;
 class SpeechSynthesisUtterance{constructor(text){this.text=text;}}
 class AudioContext{constructor(){audioEvents.push('context');this.currentTime=0;this.sampleRate=44100;this.destination={};}createBuffer(){return {silent:true};}async resume(){audioEvents.push('resume');}async decodeAudioData(bytes){return bytes;}createBufferSource(){const o={connect:()=>({connect(){}}),start(){if(o.buffer?.silent){audioEvents.push('unlock');return;}calls.push({buffer:o.buffer,stopped:false});o.call=calls.at(-1);},stop(){if(o.call)o.call.stopped=true;},disconnect(){}};return o;}createGain(){return{gain:{setValueAtTime(value){gainValues.push(value);}},disconnect(){}};}}

 const ctx=vm.createContext({navigator,speechSynthesis,SpeechSynthesisUtterance,fetch:async url=>({ok:true,arrayBuffer:async()=>url}),document,localStorage:{getItem:k=>storage.get(k),setItem:(k,v)=>storage.set(k,v)},setTimeout,clearTimeout,setInterval:()=>1,clearInterval(){},performance:{now:()=>0},requestAnimationFrame:()=>1,cancelAnimationFrame(){},matchMedia:()=>({matches:false}),scrollTo(){},addEventListener:(n,fn)=>events.set(n,fn),AudioContext});
 vm.runInContext('globalThis.window=globalThis',ctx);vm.runInContext(source,ctx);
 const html=fs.readFileSync(path.join(root,'games/sqz/index.html'),'utf8');
 for(const m of html.matchAll(/<script>([\s\S]*?)<\/script>/g))vm.runInContext(m[1],ctx);
 return {run:s=>vm.runInContext(s,ctx),node,events,calls,spoken,audioEvents,gainValues,get speechCancels(){return speechCancels;}};
}
test('real game: double answer, next lock, skip, combo, wrong answer, resume and result',()=>{
 const g=game();g.run("start('training')");
 for(let i=0;i<3;i++){
  g.run('answer(current().answer);answer(current().answer)');
  assert.equal(g.run('P.total'),i+1);assert.equal(g.run('S.picks.length'),i+1);
  g.node('#next').onclick();assert.equal(g.run('S.i'),i);
  if(i===2)assert.equal(g.node('.answer-pitch').dataset.superShot,'true');
  g.node('#skip').onclick();g.node('#skip').onclick();
  assert.equal(g.node('.feedback').hidden,false);g.node('#next').onclick();
 }
 g.run("answer(current().choices.find(a=>a!==current().answer))");
 assert.equal(g.run('P.correct'),3);assert.equal(g.run('P.mistakes.length'),1);
 g.node('#pause').onclick();assert.equal(g.run('view'),'home');
 g.node('#resume').onclick();assert.equal(g.run('P.total'),4);assert.equal(g.run('shot.active'),false);
 g.node('#next').onclick();
 while(g.run('!S.done')){g.run('answer(current().answer);shot.skip()');g.node('#next').onclick();}
 assert.equal(g.run('view'),'result');assert.equal(g.run('P.total'),10);
});
test('real game: crowd recordings, mute and cancellation during loading',async()=>{
 const g=game();g.run('P.sound=true');await g.run('tone(true)');await g.run('tone(false)');
 assert.deepEqual(g.calls.map(n=>n.buffer),['/games/sqz/assets/audio/goal-crowd.mp3?v=20261012-2','/games/sqz/assets/audio/boo.mp3?v=20261013-boo-1']);
 assert.deepEqual(g.gainValues,[.65,.65]); // Balance is in the boo asset; correct-answer playback is unchanged.
 const html=fs.readFileSync(path.join(root,'games/sqz/index.html'),'utf8');
 for(const call of g.calls)assert.ok(html.includes('href="'+call.buffer+'"'), 'preload matches runtime cache version');
 await g.run('tone(true,()=>false)');assert.equal(g.calls.length,2);
 const pending=g.run('tone(true)');g.run('silence()');await pending;
 assert.equal(g.calls.length,2);assert.ok(g.calls.every(n=>n.stopped));
 g.run('P.sound=false');await g.run('tone(false)');assert.equal(g.calls.length,2);
});
test('real game: timeout and hidden-page interruption retain one answer',()=>{
 const g=game();g.run("start('cup');S.ms=0;answer(current().answer)");
 assert.equal(g.run('S.picks[0]'),null);assert.equal(g.run('P.total'),1);
 g.run('document.hidden=true');g.events.get('visibilitychange')();
 assert.equal(g.run('shot.active'),false);assert.equal(g.node('.feedback').hidden,false);
 assert.equal(g.run('P.total'),1);
});

test('reading speaks only question and visible choice order, then cancels on answer/navigation',()=>{
 const g=game();g.run("start('training')");assert.equal(g.spoken.length,0);
 g.node('#read-toggle').onclick();assert.equal(g.spoken.length,1);
 const expected=g.run("current().text+'。'+S.order[current().id].map((a,i)=>['エー','ビー','シー','ディー'][i]+'。'+a+'。').join(' ')");
 assert.equal(g.spoken[0].text,expected);assert.equal(g.spoken[0].voice.lang,'ja-JP');
 g.node('#read-again').onclick();assert.equal(g.spoken.length,2);
 const before=g.speechCancels;g.run('answer(current().answer);shot.skip()');assert.ok(g.speechCancels>before);
 g.node('#next').onclick();assert.equal(g.spoken.length,3);
 g.node('#read-toggle').onclick();const n=g.spoken.length;g.run('readQuestion()');assert.equal(g.spoken.length,n);
 g.run('P.readAloud=true;readQuestion();home()');assert.equal(g.run('speechUtterance'),null);
 const unsupported=game(false);unsupported.run("P.readAloud=true;start('training')");assert.equal(unsupported.spoken.length,0);
});

test('crowd reaction starts once at ball contact; skipping never triggers it',()=>{
 const e=env();let hits=0;const c=e.api.create(e.element,{ok:true,onImpact:()=>hits++});c.begin();
 e.tick(0);e.tick(789);assert.equal(hits,0);e.tick(790);assert.equal(hits,1);e.tick(1000);e.tick(1750);assert.equal(hits,1);
 const skip=env();skip.api.create(skip.element,{ok:true,onImpact:()=>hits++}).skip();assert.equal(hits,1);
});

test('reading controls keep live status inline and omit the extra timer explanation',()=>{
 const g=game();
 for(const kind of ['cup','training']){
  g.run(`start('${kind}')`);
  const markup=g.run('readingControls()');
  assert.match(markup,/<div class="reading-controls">.*<button id="read-toggle".*<button id="read-again".*<span id="read-status" class="muted" role="status">.*<\/span><\/div>$/);
  assert.doesNotMatch(markup,/<p\b|読み上げ中も制限時間は進みます/);
 }
 const html=fs.readFileSync(path.join(root,'games/sqz/index.html'),'utf8');
 assert.match(html,/\.reading-controls\{[^}]*align-items:center/);
 assert.match(html,/#read-status\{margin:0\}#read-status:empty\{display:none\}/);
});

test('compact reading status preserves errors, retry, completion and unsupported-browser help',()=>{
 const g=game();g.run("P.readAloud=true;start('training')");
 assert.equal(g.node('#read-status').textContent,'読み上げ中');
 g.spoken.at(-1).onerror({error:'unavailable'});
 assert.equal(g.node('#read-status').textContent,'読み上げできませんでした。「もう一度読む」を押してください。');
 g.node('#read-again').onclick();
 assert.equal(g.spoken.length,2);assert.equal(g.node('#read-status').textContent,'読み上げ中');
 g.spoken.at(-1).onend();assert.equal(g.node('#read-status').textContent,'');
 g.node('#read-toggle').onclick();
 assert.equal(g.node('#read-toggle').textContent,'読み上げ OFF');assert.equal(g.node('#read-again').disabled,true);
 assert.match(g.run('readingControls()'),/aria-pressed="false"/);
 g.node('#read-toggle').onclick();
 assert.equal(g.node('#read-toggle').textContent,'読み上げ ON');assert.equal(g.node('#read-again').disabled,false);
 assert.match(g.run('readingControls()'),/aria-pressed="true"/);
 const unsupported=game(false);unsupported.run("start('training')");
 const markup=unsupported.run('readingControls()');
 assert.match(markup,/<button id="read-toggle"[^>]*disabled/);
 assert.match(markup,/<button id="read-again"[^>]*disabled/);
 assert.match(markup,/<span id="read-status" class="muted" role="status">このブラウザは読み上げに対応していません。<\/span>/);
});

test('shipped crowd MP3s contain decodable audio of the intended length',()=>{
 const {execFileSync}=require('node:child_process');
 for(const [name,min,max] of [['goal-crowd',2.7,3],['boo',1.4,1.7]]){
  const file=path.join(root,'games/sqz/assets/audio',name+'.mp3');
  const info=JSON.parse(execFileSync('ffprobe',['-v','error','-show_entries','format=duration,size','-of','json',file],{encoding:'utf8'})).format;
  assert.ok(+info.duration>=min&&+info.duration<=max);assert.ok(+info.size>1000);
  execFileSync('ffmpeg',['-v','error','-i',file,'-f','null','-']);
 }
});

test('iOS sound opt-in sets playback session and unlocks synchronously before download',async()=>{
 const g=game();g.run('P.sound=true');const pending=g.run('tone(true)');
 assert.deepEqual(g.audioEvents,['session:playback','context','resume','unlock']);
 assert.equal(g.calls.length,0);await pending;assert.equal(g.calls.length,1);
 g.run('navigator.audioSession=undefined');await g.run('tone(false)');assert.equal(g.calls.length,2);
});

// Guard against another nearly inaudible boo clip or a clipping replacement.
test('boo loudness meets the balance target with headroom at the unchanged game gain',()=>{
 const {spawnSync}=require('node:child_process');
 const file=path.join(root,'games/sqz/assets/audio/boo.mp3');
 const result=spawnSync('ffmpeg',['-hide_banner','-nostats','-i',file,'-af','loudnorm=print_format=json','-f','null','-'],{encoding:'utf8'});
 assert.equal(result.status,0,result.stderr);
 const stats=JSON.parse(result.stderr.match(/\{[\s\S]*"input_i"[\s\S]*?\}/)[0]);
 assert.ok(+stats.input_i>=-16&&+stats.input_i<=-13,'boo should stay between -16 and -13 LUFS');
 assert.ok(+stats.input_tp<=-1.5,'boo keeps at least 1.5 dB true-peak headroom before game gain');
});
