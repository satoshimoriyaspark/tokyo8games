// Injected into isolated copies by javeball.html; never loaded by the game.
showOpening('game');
window.javeQA={
 ready:()=>spriteReady,
 scene(kind,frame=0){
  selected=4;cup=false;begin();step(1/60,deadline+1);pos=24;spd=12;elapsed=2;
  runnerMotion[0].moving=true;runnerMotion[0].frameTime=frame;runnerMotion[0].travel=pos;
  if(kind==='hold'){bHeld=true;throwHeldStart=elapsed-.5;}
  if(kind==='flight'||kind==='land'){
   finishAttempt();throwAge=kind==='land'?(typeof javeFlightDuration==='function'?javeFlightDuration():1.2):frame*(typeof javeFlightDuration==='function'?javeFlightDuration():1.2);
  }
  draw(0);return this.paint();
 },
 paint(){draw(0);return {canvas:cv,anchor:{...spriteDebug.last[0]},mode,age:throwAge,attempt,view:typeof javeView==='function'?javeView():null};},
 start(){selected=4;cup=false;begin();step(1/60,deadline+1);this.clock=0;this.frames=0;},
 tick(){
  this.clock+=1000/60;this.frames++;
  if(mode==='run'){
   if(this.frames%6===0)input('A');
   if(pos>25&&!bHeld)input('B');
   if(bHeld&&elapsed-throwHeldStart>.4)release('B');
  }
  step(1/60,mode==='ready'?deadline+1:performance.now());
  if(mode==='ceremony')drawCeremony(0);else draw(0);
  return {canvas:cv,anchor:{...spriteDebug.last[0]},mode,age:throwAge,attempt,view:typeof javeView==='function'?javeView():null};
 },
 checks(){
  const passed=[],assert=(name,v)=>{if(!v)throw Error(name);passed.push(name);};
  this.start();input('A');step(1/60,0);draw(0);assert('A accelerates and uses running legs',spriteDebug.last[0].runFrame!==undefined);
  const original=c.drawImage.bind(c);let integer=true;
  c.drawImage=(...args)=>{integer&&=args.slice(1).every(Number.isInteger);return original(...args);};
  for(const kind of ['run','hold']){
   const frames=new Set();for(let i=0;i<8;i++){this.scene(kind,i);frames.add(spriteDebug.last[0].runFrame);}
   assert(kind+' plays all eight approved running frames',frames.size===8&&!frames.has(undefined));
  }
  c.drawImage=original;assert('all layered PNG crops and draws are integer pixels',integer&&!c.imageSmoothingEnabled);
  this.scene('run');spd=0;step(1/60,0);draw(0);assert('stopped run-up returns to still carrying pose',spriteDebug.last[0].runFrame===undefined);
  for(const [speed,deg,origin] of [[0,42,0],[12.5,42,40],[8,20,10]]){
   this.start();spd=speed;angle=deg;pos=origin;finishAttempt();
   const record=records[0],expected=typeof throwDistance==='function'?throwDistance(speed,deg):lim(4+speed*3.6*Math.max(0,1-Math.abs(deg-42)/60),0,55);
   assert('angle distance formula '+speed,record===expected);
   const duration=javeFlightDuration();let visible=true,forward=true,previous=-Infinity;
   for(let i=0;i<=120;i++){
    throwAge=duration*i/120;const v=javeView(),screen=v.ball.x-v.camera;
    visible&&=screen>=8&&screen<=376&&v.ball.y>=100&&v.ball.y<=JAVE_GROUND;
    forward&&=v.camera>=previous;previous=v.camera;draw(0);
   }
   assert('ball stays visible through landing '+speed,visible&&forward);
   const end=javeView();assert('landing agrees with ground ruler and record '+speed,Math.abs((end.ball.x-JAVE_LINE)/JAVE_SCALE-record)<1e-8&&end.landed);
   throwAge=0;step(1/60,deadline+100000);assert('wall clock cannot skip flight '+speed,mode==='between'&&attempt===1);
   throwAge=duration+.5;step(1/60,deadline+100000);assert('landing is held before retry '+speed,mode==='between');
   throwAge=duration+JAVE_LANDING_HOLD;step(1/60,deadline+100000);
   assert('retry clears camera and motion '+speed,attempt===2&&mode==='ready'&&throwAge===0&&javeView().camera===0&&runnerMotion.every(m=>!m.moving));
  }
  this.start();const values=[];
  for(let n=1;n<=3;n++){
   if(mode==='ready')step(1/60,deadline+1);spd=4+n*2;angle=42;pos=25;finishAttempt();values.push(records.at(-1));
   for(let i=0;mode==='between'&&i<360;i++)step(1/60,0);
   assert('attempt finishes after landing '+n,n<3?mode==='ready'&&attempt===n+1:mode==='ceremony');
  }
  assert('three attempts retain best distance',records.length===3&&$('#resultRecord').textContent===label(4,Math.max(...values)));
  $('#reset').click();assert('title clears flight',mode==='menu'&&throwAge===0&&javeView().camera===0);
  this.scene('run',3);return {count:passed.length,passed};
 }
};
