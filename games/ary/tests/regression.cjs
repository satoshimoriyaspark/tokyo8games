/* Run: node games/ary/tests/regression.cjs
 * Uses the real JS + real PNG decode/Canvas via @napi-rs/canvas.
 * DOM/input events are simulated: this is NOT real-device/browser verification.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const {createCanvas, Image: NativeImage} = require('@napi-rs/canvas');
const root = path.resolve(__dirname, '../../..');
const captureDir = process.env.ARY_QA_OUTPUT;
if(captureDir) fs.mkdirSync(captureDir,{recursive:true});
async function harness(failFile = '') {
  const canvas = createCanvas(960,540), ctx = canvas.getContext('2d');
  const elements = new Map(), documentEvents={}, windowEvents={}, frames=[], timers=new Map();
  const images=[], draws=[], errors=[], pending=[];
  let fail = failFile, timer=0;
  function el(id) {
    if(!elements.has(id))elements.set(id,{textContent:'',hidden:false,disabled:false,events:{},
      addEventListener(name,fn){this.events[name]=fn},setPointerCapture(){},setAttribute(name,value){this[name]=value},
      getContext(){return ctx}});
    return elements.get(id);
  }
  const realDraw = ctx.drawImage.bind(ctx);
  ctx.drawImage = (img,...coords) => {
    assert(img._native,'PNG must be decoded before drawing');
    const [sx,sy,sw,sh]=coords;
    assert(sx>=0&&sy>=0&&sx+sw<=img.naturalWidth&&sy+sh<=img.naturalHeight,'frame bounds');
    assert(coords.every(Number.isFinite),'finite source and destination coordinates');
    assert.equal(ctx.imageSmoothingEnabled,false,'nearest-neighbor rendering');
    draws.push({file:img.url,coords});realDraw(img._native,...coords);
  };
  class Image {
    set src(url) {
      this.url=url; images.push(this);
      pending.push(new Promise(resolve=>setImmediate(async()=>{
        if(url.endsWith(fail)&&fail){this.onerror();resolve();return}
        this._native=new NativeImage();
        this._native.src=fs.readFileSync(path.join(root,url));
        await this._native.decode();
        this.naturalWidth=this._native.width;this.naturalHeight=this._native.height;
        this.onload();resolve();
      })));
    }
  }
  const document={hidden:false,fullscreenElement:null,querySelector:el,
    addEventListener(name,fn){documentEvents[name]=fn}};
  const sandbox={Image,document,console:{error(...args){errors.push(args.join(' '))}},
    requestAnimationFrame(fn){frames.push(fn)},setTimeout(fn){timers.set(++timer,fn);return timer},
    clearTimeout(id){timers.delete(id)},addEventListener(name,fn){windowEvents[name]=fn}};
  sandbox.window=sandbox;
  const context=vm.createContext(sandbox);
  const run=code=>vm.runInContext(code,context);
  run(fs.readFileSync(path.join(root,'games/ary/sprites.js'),'utf8'));
  run(fs.readFileSync(path.join(root,'games/ary/game.js'),'utf8'));
  const flush=async()=>{await Promise.all(pending);};
  const capture=name=>{if(captureDir)fs.writeFileSync(path.join(captureDir,name+'.png'),canvas.toBuffer('image/png'));};
  const pinkPixels=()=>{
    const pixels=ctx.getImageData(60,72,225,345).data;let pink=0;
    for(let i=0;i<pixels.length;i+=4)if(pixels[i]>160&&pixels[i+1]<155&&pixels[i+2]>95&&pixels[i]-pixels[i+1]>45)pink++;
    return pink;
  };
  return {run,flush,el,draws,errors,frames,timers,document,documentEvents,images,capture,canvas,pinkPixels,
    recover(){fail=''},diagnostics:()=>sandbox.aryDiagnostics()};
}
async function main(){
  const h=await harness();
  h.run('reset()');assert.equal(h.diagnostics().state,'intro','start waits for PNGs');
  await h.flush();assert(Object.values(h.diagnostics().assets).every(x=>x==='ready'));
  assert.equal(h.el('#action').disabled,false);
  h.run('reset();render()');h.capture('01-run');
  const runFrames=new Set();
  for(let t=0;t<36;t++){h.run(`tick=${t};render()`);runFrames.add(h.diagnostics().pose.frame);assert(h.pinkPixels()>400,'visible pink-haired PNG every run frame')}
  assert.equal(runFrames.size,6);
  assert(h.draws.filter(d=>d.file.endsWith('ary_ride_game.png')).every(d=>d.coords[2]===64));
  const jumpFrames=new Set();
  h.run('reset();jump()');
  for(let t=0;t<50;t++){
    h.run('items=[];render()');const p=h.diagnostics().pose;
    if(p.key==='jump')jumpFrames.add(p.frame);
    if(t===12)h.capture('02-jump');
    h.run('update()');
  }
  assert.equal(jumpFrames.size,5,'all five jump phases reached');
  h.run('reset();jump();update();jump()');assert.equal(h.diagnostics().player.j,2);
  const vy=h.diagnostics().player.vy;h.run('jump()');assert.equal(h.diagnostics().player.vy,vy);
  h.run('render()');h.capture('03-double-jump');
  const slideFrames=new Set();h.run('reset();slide()');
  for(let t=0;t<43;t++){
    h.run('items=[];render()');const p=h.diagnostics().pose;
    if(p.key==='slide')slideFrames.add(p.frame);
    if(t===12)h.capture('04-slide');h.run('update()');
  }
  assert.equal(slideFrames.size,3);assert.equal(h.diagnostics().pose.key,'ride');
  h.run("reset();items=[{k:'coin',x:62,y:105},{k:'clue',x:62,y:112}];update();render()");
  assert.equal(h.diagnostics().coins,1);assert.equal(h.diagnostics().clues,1);assert.equal(h.diagnostics().score,510);
  h.run("items=[{k:'cone',x:62,y:119}];update()");assert.equal(h.diagnostics().hits,1);assert.equal(h.diagnostics().score,10);
  h.run("reset();slide();items=[{k:'crow',x:62,y:84}];update()");assert.equal(h.diagnostics().hits,0,'slide avoids flying crow');
  h.run("reset();items=[{k:'crow',x:62,y:84}];update()");assert.equal(h.diagnostics().hits,1);
  // Colliders follow vertical position: jumping over cones is safe; landing into a crow is not.
  h.run("reset();p.y=88;p.vy=0;p.j=1;items=[{k:'cone',x:62,y:119}];update()");assert.equal(h.diagnostics().hits,0);
  h.run("reset();p.y=96;p.vy=1;p.j=1;items=[{k:'crow',x:62,y:84}];update()");assert.equal(h.diagnostics().hits,1);
  h.run("reset();items=[{k:'cone',x:160,y:119},{k:'crow',x:255,y:84}];render()");h.capture('06-obstacles');
  h.run("reset();slide();items=[{k:'crow',x:60,y:84}];render()");h.capture('07-crow-slide');
  // Fractional render frames move smoothly without advancing simulation or collisions.
  h.run('reset();jump();update();render(0)');const before=h.draws.filter(d=>d.file.endsWith('ary_jump.png')).at(-1).coords[5];
  const fixedTick=h.diagnostics().tick;
  h.run('render(.5)');const middle=h.draws.filter(d=>d.file.endsWith('ary_jump.png')).at(-1).coords[5];
  h.run('render(1)');const after=h.draws.filter(d=>d.file.endsWith('ary_jump.png')).at(-1).coords[5];
  assert(before>middle&&middle>after,'interpolated jump position at half tick');
  assert.equal(h.diagnostics().tick,fixedTick,'render does not advance gameplay');
  h.run('reset();render()');assert(h.el('#action').hidden);assert(!h.el('#jump').hidden);assert(!h.el('#pause').hidden);
  h.el('#pause').onclick();h.run('render()');assert(!h.el('#action').hidden);assert(h.el('#jump').hidden);
  h.el('#action').onclick();assert.equal(h.diagnostics().paused,false);
  h.run('reset();paused=true;update()');assert.equal(h.diagnostics().tick,0);
  h.el('#pause').onclick();h.run('update()');assert.equal(h.diagnostics().tick,1);
  h.document.hidden=true;h.documentEvents.visibilitychange();assert(h.diagnostics().paused);
  h.document.hidden=false;h.el('#pause').onclick();
  h.run('reset()');
  h.el('#game').events.pointerdown({pointerType:'touch',pointerId:1,clientX:100,clientY:100});
  h.el('#game').events.pointerup({pointerId:1,clientX:101,clientY:101});assert.equal(h.diagnostics().player.j,1);
  h.run('reset()');
  h.el('#game').events.pointerdown({pointerType:'touch',pointerId:2,clientX:100,clientY:100});
  h.el('#game').events.pointerup({pointerId:2,clientX:101,clientY:150});assert.equal(h.diagnostics().player.slide,42);
  h.run('reset()');
  const input=h.el('#game').events;
  input.pointerdown({pointerType:'touch',pointerId:3,clientX:100,clientY:100});
  input.pointermove({pointerId:3,clientX:102,clientY:118});
  assert.equal(h.diagnostics().player.slide,42,'swipe starts before release');
  h.run('update();update();update()');
  assert.equal(h.diagnostics().pose.frame,1,'crouched pose within 50ms');
  input.pointermove({pointerId:3,clientX:103,clientY:160});
  input.pointerup({pointerId:3,clientX:103,clientY:160});
  assert.equal(h.diagnostics().player.slide,39,'release does not restart slide');
  assert.equal(h.diagnostics().player.j,0,'swipe release never jumps');
  h.run('reset()');input.pointerdown({pointerType:'touch',pointerId:4,clientX:100,clientY:100});
  input.pointermove({pointerId:4,clientX:140,clientY:119});assert.equal(h.diagnostics().player.slide,0,'horizontal movement is not a slide');
  input.pointercancel();input.pointerup({pointerId:4,clientX:100,clientY:100});assert.equal(h.diagnostics().player.j,0);
  h.el('#slide').onpointerdown({button:0,preventDefault(){}});assert.equal(h.diagnostics().player.slide,42,'button reacts on press');
  h.run('update()');h.el('#slide').onclick({detail:1});assert.equal(h.diagnostics().player.slide,41,'click does not retrigger pointer press');
  h.run('reset();tick=DURATION*60-1;items=[];update()');assert.equal(h.diagnostics().state,'story');
  const finalScore=h.diagnostics().score;h.run('update();update()');assert.equal(h.diagnostics().score,finalScore,'clear awarded only once');
  h.run('next();render()');h.capture('05-clear');assert.equal(h.diagnostics().state,'result');
  h.run('next()');assert.equal(h.diagnostics().tick,0);
  h.run("hits=4;items=[{k:'cone',x:62,y:119}];update()");assert.equal(h.diagnostics().state,'fail');
  h.run('next()');assert.equal(h.diagnostics().hits,0);
  h.run('reset()');assert.equal(h.diagnostics().life,5);assert.equal(h.diagnostics().maxLife,5);
  h.run("hits=3;items=[{k:'cone',x:62,y:119}];update()");assert.equal(h.diagnostics().state,'play');assert.equal(h.diagnostics().life,1,'four hits leave one heart');
  h.run("items=[{k:'heart',x:62,y:100}];update()");assert.equal(h.diagnostics().life,2);
  h.run("hits=0;items=[{k:'heart',x:62,y:100}];update()");assert.equal(h.diagnostics().life,5,'recovery cannot exceed five');
  // Hearts recover one life, cap at five, and do not erase damage history.
  h.run("reset();items=[{k:'cone',x:62,y:119}];update();items=[{k:'heart',x:62,y:100}];update();render()");
  assert.equal(h.diagnostics().hits,0);assert.equal(h.diagnostics().damageTaken,1);
  assert(h.diagnostics().effects>0);
  h.run("items=[{k:'heart',x:62,y:100}];update()");assert.equal(h.diagnostics().hits,0,'full life is capped');
  h.run("hits=2;items=[{k:'heart',x:62,y:100}];update();update()");assert.equal(h.diagnostics().hits,1,'one recovery per item');
  h.run("hits=0;tick=DURATION*60-1;items=[];update()");assert.equal(h.diagnostics().score,5000,'healing does not award no-hit bonus');
  h.run("reset();paused=true;hits=1;items=[{k:'heart',x:62,y:100}];update()");assert.equal(h.diagnostics().hits,1,'pause freezes pickups');
  h.run("paused=false;items=[{k:'heart',x:62,y:30}];update()");assert.equal(h.diagnostics().hits,1,'must overlap heart');
  h.run('reset();tick=539;items=[];update()');assert(h.run("items.some(o=>o.k==='heart')"),'heart spawns during play');
  // Powerups affect gameplay, expire on game time, and never survive a retry.
  h.run("reset();items=[{k:'shield',x:62,y:100}];update();render()");
  assert.equal(h.diagnostics().powers.shield,360);
  assert(h.diagnostics().effects>0,'pickup particles');
  h.run("items=[{k:'cone',x:62,y:119}];update();render()");
  assert.equal(h.diagnostics().hits,0,'shield blocks damage');
  h.run('paused=true;update()');assert.equal(h.diagnostics().powers.shield,359,'pause freezes duration');
  h.run("paused=false;tick=shieldUntil-1;items=[{k:'cone',x:62,y:119}];update()");
  assert.equal(h.diagnostics().hits,1,'damage resumes on expiry');
  h.run("items=[{k:'crow',x:62,y:84}];update()");assert.equal(h.diagnostics().hits,1,'hit grace blocks consecutive damage');
  h.run("tick=hurtUntil-1;items=[{k:'cone',x:62,y:119}];update()");assert.equal(h.diagnostics().hits,2);
  h.run("reset();items=[{k:'boost',x:62,y:100}];update()");
  assert.equal(h.diagnostics().powers.boost,300);
  h.run('for(let i=0;i<25;i++){items=[];update()}');
  assert(Math.abs(h.diagnostics().powers.speedFactor-1.35)<.0001);
  h.run("items=[{k:'cone',x:62,y:119}];update()");assert.equal(h.diagnostics().hits,1,'boost does not grant invulnerability');
  h.run("items=[{k:'shield',x:62,y:100}];update();render()");
  assert(h.diagnostics().powers.shield>0&&h.diagnostics().powers.boost>0,'powers combine');
  h.capture('08-powers');
  h.run('tick=boostUntil;for(let i=0;i<25;i++){items=[];update()}');
  assert.equal(h.diagnostics().powers.speedFactor,1,'speed eases back to normal');
  h.run('reset()');assert.equal(h.diagnostics().powers.shield,0);assert.equal(h.diagnostics().powers.boost,0);assert.equal(h.diagnostics().effects,0);
  // Render failure is injected only in the VM and must not hide the avatar.
  h.run("var savedDrawItems=drawItems;drawItems=()=>{throw Error('injected item failure')};render()");
  assert(h.diagnostics().runtimeError.includes('injected item failure'));
  assert(h.draws.slice(-2).some(d=>d.file.endsWith('ary_ride_game.png')));
  h.run('drawItems=savedDrawItems;reset()');
  // 180 seconds at 60Hz: real collisions, collects, retries, and renders every frame.
  for(let t=0;t<10800;t++){
    h.run("if(state!=='play')next();if(tick%87===20)jump();if(tick%131===35)slide();update();render()");
    assert.equal(h.diagnostics().runtimeError,'');
    if(h.diagnostics().state==='play')assert(h.pinkPixels()>200,'avatar remains visibly rendered');
  }
  assert.equal(h.frames.length,1,'one animation loop scheduled at boot');
  h.run('loop(1000);loop(1017)');assert.equal(h.frames.length,3);
  assert(h.draws.length>10800);
  // Failed action image: no crash, no substitute character, explicit retry.
  const failed=await harness('ary_slide.png');await failed.flush();
  assert.equal(failed.diagnostics().assets.slide,'error');assert(failed.el('#action').disabled);
  failed.run('reset();loop(0)');assert.equal(failed.diagnostics().state,'intro');
  assert.equal(failed.el('#retry-assets').hidden,false);
  failed.recover();failed.el('#retry-assets').onclick();await failed.flush();
  failed.run('reset();slide();render()');assert.equal(failed.diagnostics().pose.key,'slide');
  assert.equal(failed.diagnostics().assets.slide,'ready');assert.equal(failed.timers.size,0);
  console.log('PASS: PNG load/retry, 6 run frames at 12fps, 5 jump phases, double-jump limit, 3 slide phases, chips/memos/score, collisions/crow avoidance, pause/resume, touch input, clear/retry, isolated render failure, 10,800 rendered simulation frames (180s).');
  console.log('LIMIT: Node Canvas + simulated DOM; not iPhone Safari / Android Chrome / PC browser or real-time endurance.');
  if(captureDir){
    const record=await harness();await record.flush();record.run('reset()');
    for(let t=0;t<420;t++){
      if([84,138].includes(t))record.run('jump()');
      if(t===149)record.run('jump()');
      if([234,318].includes(t))record.run('slide()');
      record.run('items=[];update();render()');
      if(t%3===0)record.capture('video-'+String(t/3).padStart(4,'0'));
    }
  }
}
main().catch(error=>{console.error(error);process.exitCode=1});
