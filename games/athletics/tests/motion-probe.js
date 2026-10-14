if(typeof showOpening==='function')showOpening('game');
// Isolated comparison hook, loaded only by motion.html.
window.motionQA={
 ready:()=>spriteReady,
 reset(event){selected=event;resetRun();mode='run';pos=40;elapsed=1;rivals.forEach((r,i)=>r.dist=39-i*2);if(typeof runnerMotion!=='undefined')runnerMotion.forEach((m,i)=>m.travel=i?rivals[i-1].dist:pos);},
 tick(dt,speed){
  const factor=selected===0?.39:selected===1?1.85:1.1;
  spd=speed/factor;elapsed+=dt;pos+=speed*dt;rivals.forEach((r,i)=>r.dist+=speed*r.skill*dt);
  if(typeof runnerMotion!=='undefined')advanceRunnerMotion(dt);
  draw(0);const a=spriteDebug.last[0];
  return {canvas:cv,frame:a.frame,row:a.row,dx:a.dx,dy:a.dy,feet:a.dy+45};
 },
 checks(){
  if(typeof runnerMotion==='undefined')return {baseline:true};
  const passed=[];const assert=(name,ok)=>{if(!ok)throw Error(name);passed.push(name)};
  const simulate=(event,speed,dt,seconds)=>{
   selected=event;resetRun();mode='run';const starts=new Set(),frames=new Set();
   for(let i=0;i<Math.round(seconds/dt);i++){
    elapsed+=dt;pos+=speed*dt;rivals.forEach(r=>r.dist+=speed*r.skill*dt);advanceRunnerMotion(dt);draw(0);
    const a=spriteDebug.last[0];if(a.row===1)starts.add(a.frame);if(a.row===(event===1?3:2))frames.add(a.frame);
   }
   return {clock:runnerMotion[0].frameTime,starts:[...starts],frames:[...frames]};
  };
  for(const speed of [.5,5,10,30]){
   const r=simulate(0,speed,1/60,3);
   assert('no crouch after gun at speed '+speed,r.starts.every(f=>f===2));
   assert('all eight running frames at speed '+speed,r.frames.length===8);
  }
  // Running cycle starts at the gun; 75 fixed steps at 12 fps = 15 frames.
  const fast=simulate(0,30,1/60,1.25);assert('sprint capped at 12 fps',Math.abs(fast.clock-15)<.0001);
  const jog=simulate(1,30,1/60,1.25);assert('jog capped at 12 fps',Math.abs(jog.clock-15)<.0001&&jog.frames.length===6);
  const a=simulate(0,7,1/60,2),b=simulate(0,7,1/30,2);assert('same clock at 30 and 60 fps',Math.abs(a.clock-b.clock)<.0001);
  selected=0;resetRun();mode='ready';advanceRunnerMotion(1/60);draw(0);assert('ready holds marks pose',spriteDebug.last[0].row===1&&spriteDebug.last[0].frame===0);
  simulate(0,7,1/60,1);advanceRunnerMotion(1/60);draw(0);assert('stopped athlete is still',spriteDebug.last[0].row===0);
  simulate(0,7,1/60,1);mode='finishDash';finishDashTime=0;finishDashSpeed=7;finishDashRecord=elapsed;const before=runnerMotion[0].frameTime,record=elapsed;step(1/60,0);draw(0);
  assert('finish continues cycle without restart',runnerMotion[0].frameTime>before&&spriteDebug.last[0].row===2);
  assert('finish time unchanged',elapsed===record&&finishDashRecord===record);
  resetRun();assert('retry resets all four clocks',runnerMotion.every(m=>m.age===0&&m.frameTime===0&&!m.moving));
  for(const ev of [0,2]){
   selected=ev;begin();const gun=deadline;
   for(const [time,frame] of [[gun-2500,0],[gun-1600,0],[gun-1400,1],[gun-1,1]]){
    step(1/60,time);draw(0);
    assert('pre-gun pose '+ev+' '+time,spriteDebug.last.every(a=>a.row===1&&a.frame===frame));
    assert('no movement or clock before gun '+ev+' '+time,pos===0&&elapsed===0&&rivals.every(r=>r.dist===0));
   }
   step(1/60,gun);draw(0);assert('gun uses launch pose '+ev,mode==='run'&&spriteDebug.last.every(a=>a.row===1&&a.frame===2));
   for(let n=0;n<15;n++){input(ev===0&&n%2?'B':'A');step(1/60,gun+20+n*17)}draw(0);
   assert('running after gun '+ev,spriteDebug.last[0].row===2);
   begin();draw(0);assert('retry returns to marks '+ev,startPhase===0&&spriteDebug.last[0].frame===0);
  }
  return {count:passed.length,passed};
 }
};
