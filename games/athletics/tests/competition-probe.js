showOpening('game');
window.competitionQA={ready:()=>spriteReady,scene(kind='hurdle',value=0){
 selected=kind==='angle'?4:kind==='false'?0:2;resetRun();mode='run';elapsed=5;spd=10;pos=12;guide();
 if(kind==='hurdle'){fallenHurdles.set(0,5);elapsed=5+Number(value);pos=12+Number(value)*3;}
 if(kind==='angle'){pos=20;bHeld=true;angle=Number(value);}
 if(kind==='false'){mode='ready';deadline=performance.now()+3000;input('A');}
 if(kind==='menu'){mode='menu';render();}
 syncUI();draw(1000);return cv;
},demo(misses=0){
 selected=2;difficulty=2;cup=false;resetRun();mode='run';guide();let tick=0,pressed=-1;
 const token=this.demoToken=(this.demoToken||0)+1;
 const frame=()=>{if(this.demoToken!==token)return;
  if(mode==='run'){
   if(tick%10===0)input('A');
   const n=Math.max(0,Math.ceil((pos-12)/10)),lead=(12+n*10-pos)/Math.max(.1,spd*1.1);
   if(n>=misses&&n<10&&pressed!==n&&lead<=.27&&lead>=.08){input('B');pressed=n;}
  }
  step(1/60,performance.now());draw(performance.now());tick++;
  if(['run','finishDash','ceremony'].includes(mode))requestAnimationFrame(frame);
 };requestAnimationFrame(frame);
},checks(){
 const passed=[],check=(name,ok)=>{if(!ok)throw Error(name);passed.push(name)};
 for(let event=0;event<3;event++)for(const phase of [0,1]){
  selected=event;resetRun();mode='ready';startPhase=phase;deadline=performance.now()+1000;input('A');
  check('false start '+event+'/'+phase,mode==='falseStart'&&elapsed===0&&pos===0&&rivals.every(r=>r.dist===0));
  const end=falseStartUntil;step(1/60,end-1);check('warning holds',mode==='falseStart');step(0,end);check('restart marks',mode==='ready'&&startPhase===0);step(0,deadline-1000);check('restart set',startPhase===1);step(0,deadline);input('A');check('gun accepts input',mode==='run'&&spd>0);
 }
 selected=2;resetRun();mode='run';pos=11.99;spd=10;step(1/60,0);check('collision falls and slows',fallenHurdles.has(0)&&spd>7&&spd<7.3);resetRun();mode='run';pos=11.99;spd=10;invuln=1;step(1/60,0);check('jump keeps hurdle',!fallenHurdles.has(0)&&spd>9);resetRun();check('retry clears hurdles',fallenHurdles.size===0);
 const balance=[];
 for(let level=0;level<5;level++){
  difficulty=level;const times=[];
  for(const misses of [0,1,3,10]){
   selected=2;resetRun();mode='run';let pressed=-1;
   for(let tick=0;tick<3600&&mode==='run';tick++){
    if(tick%10===0)input('A');
    const n=Math.max(0,Math.ceil((pos-12)/10)),lead=(12+n*10-pos)/Math.max(.1,spd*1.1);
    if(n>=misses&&n<10&&pressed!==n&&lead<=.27&&lead>=.08){input('B');pressed=n;}
    step(1/60,0);
   }
   check('expected collisions '+level+'/'+misses,fallenHurdles.size===misses);
   times.push(+finishDashRecord.toFixed(3));
  }
  check('mistakes cost time '+level,times[0]<times[1]&&times[1]<times[2]&&times[2]<times[3]);
  balance.push({level:level+1,clean:times[0],oneHit:times[1],threeHits:times[2],allHits:times[3],cpu:+cpuRaceTime(0,2).toFixed(3)});
 }
 selected=2;resetRun();mode='run';pos=8.5;spd=12;elapsed=1;input('B');const firstJump=jumpStarted;elapsed+=.1;input('B');check('B spam cannot extend jump',jumpStarted===firstJump&&invuln===firstJump+.44);
 resetRun();mode='run';pos=8;spd=2;input('B');check('slow early jump rejected',jumpStarted===-10);
 check('normal permits recovery from one hit',balance[2].oneHit<balance[2].cpu);
 check('normal punishes repeated hits',balance[2].threeHits>balance[2].cpu);
 difficulty=4;selected=2;resetRun();mode='run';let hardJump=-1;
 for(let tick=0;tick<3600&&mode==='run';tick++){
  if(tick%7===0)input('A');
  const n=Math.max(0,Math.ceil((pos-12)/10)),lead=(12+n*10-pos)/Math.max(.1,spd*1.1);
  if(n<10&&hardJump!==n&&lead<=.27&&lead>=.08){input('B');hardJump=n;}
  step(1/60,0);
 }
 check('expert clean run can win level five',fallenHurdles.size===0&&finishDashRecord<cpuRaceTime(0,2));
 const cpu=[];for(let level=0;level<5;level++){
  difficulty=level;cpu.push([0,1,2].map(i=>cpuRaceTime(0,i)));
  for(let event=0;event<3;event++){
   selected=event;resetRun();mode='run';for(let n=0;n<60;n++)step(1/60,0);
   check('CPU actual pace '+level+'/'+event,Math.abs(rivals[0].dist-cpuPace(0,event,0))<.0001);
   if(level)check('harder faster '+level+'/'+event,cpu[level][event]<cpu[level-1][event]);
  }
 }
 check('normal hurdles competitive',cpu[2][2]<10);check('normal sprint competitive',cpu[2][0]<20);
 selected=4;resetRun();mode='run';input('B');check('angle starts zero',angle===0);let peak=0;for(let n=0;n<144;n++){step(1/60,0);peak=Math.max(peak,angle);check('angle in range '+n,angle>=0&&angle<=90)}check('reaches ninety',Math.abs(peak-90)<.001);check('returns zero',angle<.001);
 spd=10;angle=45;release('B');check('release records angle',mode==='between'&&Math.abs(records.at(-1)-40)<.001);
 check('low and vertical shorter',throwDistance(10,0)<throwDistance(10,45)&&throwDistance(10,90)<throwDistance(10,45));
 difficulty=2;resetRun();return {count:passed.length,passed,cpu,balance};
}};
