// Isolated QA only: no storage writes, no hidden test controls on the game page.
showOpening('game');
window.longJumpQA={
 ready:()=>spriteReady,
 scene(u=0,hold=0){
  selected=3;cup=false;begin();step(1/60,deadline+1);pos=36;spd=12;input('B');
  if(typeof longJumpAge!=='undefined')longJumpAge=u*longJumpDuration()+hold;
  else deadline=performance.now()+1200*(1-u);
  draw(0);return cv;
 },
 foul(){selected=3;cup=false;begin();step(1/60,deadline+1);pos=(typeof FIELD_FOUL_POS==='number'?FIELD_FOUL_POS:40)-.01;spd=12;step(1/60,0);draw(0);return cv;},
 checks(){
  const passed=[],assert=(name,ok)=>{if(!ok)throw Error(name);passed.push(name);};
  for(const origin of [32,36,40]){
   selected=3;cup=false;begin();step(1/60,deadline+1);pos=origin;spd=12;input('B');
   const expected=lim(1.1+12*.37+(origin-32)*.12,0,7.8),record=records[0];
   assert('unchanged take-off rule and distance '+origin,mode==='between'&&record===expected&&longJumpOrigin===origin);
   const duration=longJumpDuration();let visible=true,rising=false,integer=true;
   for(let i=0;i<=60;i++){
    longJumpAge=duration*i/60;draw(0);const view=longJumpView(),sprite=spriteDebug.last[0];
    visible&&=sprite.dx>=0&&sprite.dx+48<=384&&sprite.dy>100&&sprite.dy<=241;
    rising||=sprite.dy<200;integer&&=Number.isInteger(sprite.dx)&&Number.isInteger(sprite.dy);
   }
   assert('athlete rises and remains in camera '+origin,visible&&rising&&integer);
   const end=longJumpView();assert('landing matches recorded distance '+origin,Math.abs((end.x-LONG_JUMP_LINE)/LONG_JUMP_SCALE-record)<1e-8&&end.landed);
   assert('heel meets the landing marker '+origin,spriteDebug.last[0].dx+11===Math.round(end.x-end.camera)&&spriteDebug.last[0].dy===241);
   longJumpAge=duration+.5;draw(0);assert('standing keeps the same landing point '+origin,spriteDebug.last[0].dx+15===Math.round(end.x-end.camera));
   longJumpAge=.2;step(1/60,deadline+100000);assert('deadline cannot cut off jump '+origin,mode==='between'&&attempt===1);
   longJumpAge=duration+.5;step(1/60,deadline+100000);assert('landing is held '+origin,mode==='between');
   longJumpAge=duration+LONG_JUMP_HOLD;step(1/60,deadline+100000);assert('retry resets jump and camera '+origin,mode==='ready'&&attempt===2&&longJumpAge===0&&longJumpOrigin===0&&longJumpView().camera===0);
  }
  for(const origin of [31.99,FIELD_FOUL_POS+.01]){
   selected=3;cup=false;begin();step(1/60,deadline+1);pos=origin;spd=12;input('B');
   assert('foul stays a foul '+origin,records[0]===0&&!longJumpView().valid&&longJumpView().camera===0);
   for(let i=0;mode==='between'&&i<100;i++)step(1/60,0);
   assert('foul advances to next attempt '+origin,attempt===2&&mode==='ready');
  }
  selected=3;cup=false;begin();step(1/60,deadline+1);pos=40;spd=1;step(1/60,0);assert('old boundary remains playable before yellow board',mode==='run'&&records.length===0);
  for(const speed of [1,12.5]){
   selected=3;cup=false;begin();step(1/60,deadline+1);pos=FIELD_FOUL_POS-.001;spd=speed;step(1/60,0);
   assert('running past board without B is foul '+speed,mode==='between'&&records.length===1&&records[0]===0&&longJumpFoul==='踏切線を踏みました');
   input('B');assert('late B cannot rescue attempt '+speed,records.length===1&&records[0]===0&&!longJumpView().valid);
   longJumpAge=LONG_JUMP_HOLD;step(1/60,0);assert('foul consumes exactly one attempt '+speed,attempt===2&&mode==='ready'&&longJumpFoul==='');
  }
  selected=3;cup=false;begin();step(1/60,deadline+1);pos=FIELD_FOUL_POS-.001;spd=12;input('B');assert('B immediately before line valid',records[0]>0&&longJumpFoul==='');
  selected=3;cup=false;begin();step(1/60,deadline+1);pos=36;elapsed=150;step(1/60,0);assert('timeout never auto jumps',records[0]===0&&longJumpFoul==='時間切れ');
  selected=3;cup=false;begin();const values=[];
  for(let n=1;n<=3;n++){
   step(1/60,deadline+1);pos=36;spd=6+n;input('B');values.push(records.at(-1));
   for(let i=0;mode==='between'&&i<240;i++)step(1/60,0);
  }
  assert('three landings retain highest record',mode==='ceremony'&&records.length===3&&$('#resultRecord').textContent===label(3,Math.max(...values)));
  $('#reset').click();assert('title clears jump',longJumpAge===0&&longJumpOrigin===0&&longJumpView().camera===0);
  return {count:passed.length,passed};
 }
};
