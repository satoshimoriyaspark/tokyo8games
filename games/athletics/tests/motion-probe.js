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
    pos+=speed*dt;rivals.forEach(r=>r.dist+=speed*r.skill*dt);advanceRunnerMotion(dt);draw(0);
    const a=spriteDebug.last[0];if(a.row===1)starts.add(a.frame);if(a.row===(event===1?3:2))frames.add(a.frame);
   }
   return {clock:runnerMotion[0].frameTime,starts:[...starts],frames:[...frames]};
  };
  for(const speed of [.5,5,10,30]){
   const r=simulate(0,speed,1/60,3);
   assert('all three start frames at speed '+speed,r.starts.join(',')==='0,1,2');
   assert('all eight running frames at speed '+speed,r.frames.length===8);
  }
  const fast=simulate(0,30,1/60,1.24);assert('sprint capped at 12 fps',Math.abs(fast.clock-12)<.0001);
  const jog=simulate(1,30,1/60,1.24);assert('jog capped at 12 fps',Math.abs(jog.clock-12)<.0001&&jog.frames.length===6);
  const a=simulate(0,7,1/60,2),b=simulate(0,7,1/30,2);assert('same clock at 30 and 60 fps',Math.abs(a.clock-b.clock)<.0001);
  selected=0;resetRun();mode='ready';advanceRunnerMotion(1/60);draw(0);assert('ready is still',spriteDebug.last[0].row===0);
  simulate(0,7,1/60,1);advanceRunnerMotion(1/60);draw(0);assert('stopped athlete is still',spriteDebug.last[0].row===0);
  simulate(0,7,1/60,1);mode='finishDash';finishDashTime=0;finishDashSpeed=7;finishDashRecord=elapsed;const before=runnerMotion[0].frameTime,record=elapsed;step(1/60,0);draw(0);
  assert('finish continues cycle without restart',runnerMotion[0].frameTime>before&&spriteDebug.last[0].row===2);
  assert('finish time unchanged',elapsed===record&&finishDashRecord===record);
  resetRun();assert('retry resets all four clocks',runnerMotion.every(m=>m.age===0&&m.frameTime===0&&!m.moving));
  return {count:passed.length,passed};
 }
};
