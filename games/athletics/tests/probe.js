// Injected by visual.html into isolated copies of the real game, never the game URL.
const qaPaint=()=>{draw(0);if(mode==='finishDash')drawTapeBurst(0);if(mode==='ceremony')drawCeremony(0);return cv};
const qaState=()=>({selected,mode,pos,elapsed,finishDashTime,finishDashRecord,throwAge,throwOrigin,bHeld,ceremonyTime,attempt,records:[...records],results:results.map(r=>({...r})),anchors:spriteDebug.last.map(r=>({...r})),smoothing:c.imageSmoothingEnabled});
window.qa={
 ready:()=>spriteReady,
 paint:qaPaint,
 state:qaState,
 sheets:()=>spriteVariants,
 counts:SPRITE_COUNTS,
 scene(s){
  resetRun();cup=false;results=[];cpuTotal=[0,0,0];records=[];attempt=1;
  selected=s.event||0;mode=s.mode||'run';pos=s.pos??96;elapsed=s.elapsed??19.2;spd=12;
  rivals.forEach((r,j)=>r.dist=pos-3-j*2);currentRank=1;
  finishDashTime=s.dash??0;finishDashRecord=elapsed;finishDashSpeed=7;
  ceremonyTime=s.ceremony??0;ceremonyTotal=!!s.total;ceremonyRank=1;
  ceremonyScores=[{name:'YOU',score:4200},...rivals.map((r,j)=>({name:r.name,score:3800-j*300}))];
  bHeld=!!s.held;throwHeldStart=elapsed-(s.heldAge??0);throwAge=s.throwAge??0;throwOrigin=s.pos??36;
  if(s.jumpAge!=null)jumpStarted=elapsed-s.jumpAge;
  deadline=performance.now()+(s.attemptRemain??1.2)*1000;
  render();qaPaint();return qaState();
 },
 sprite(row,frame,bg,cpu=-1){
  rect(0,0,384,320,bg);blitSprite(0,0,row,frame,cpu);return cv;
 },
 checks(){
  const checks=[];const check=(name,value)=>{checks.push({name,pass:!!value});if(!value)throw Error(name)};
  const originalDrawImage=c.drawImage.bind(c);let draws=0;
  c.drawImage=(...a)=>{draws++;check('integer draw coordinates '+draws,a.slice(1).every(Number.isInteger));return originalDrawImage(...a)};
  for(let row=0;row<SPRITE_COUNTS.length;row++)for(let f=0;f<SPRITE_COUNTS[row];f++)for(let cpu=-1;cpu<3;cpu++)blitSprite(40.35,80.72,row,f,cpu,true);
  drawProp(0,32.7,100.2);drawProp(1,120.3,100.9);c.drawImage=originalDrawImage;
  check('nearest-neighbor canvas',!c.imageSmoothingEnabled);
  const snapshots=[];
  for(let ev=0;ev<3;ev++){
   selected=ev;cup=false;begin();check('ready reset '+ev,pos===0&&finishDashTime===0&&throwAge===0&&!bHeld);
   step(1/60,deadline+1);check('ready to run '+ev,mode==='run');
   let n=0;
   while(mode==='run'&&n<10000){
    if(n%6===0){input(ev===0?(n%12===0?'A':'B'):'A')}
    if(ev===2){const h=12+Math.ceil(Math.max(0,pos-12)/10)*10;if(h-pos<2.4&&h-pos>1&&elapsed-jumpStarted>.7)input('B')}
    step(1/60,performance.now());n++;
   }
   const goal=ev===0?100:ev===1?150:110;
   check('goal locks at distance '+ev,mode==='finishDash'&&pos===goal);
   qaPaint();const a=qaState();const scale=ev===0?6:ev===1?10:8,follow=ev===0?35:ev===1?22:27;
   check('chest aligned to finish stripe '+ev,a.anchors[0].chestX===54+follow*scale);
   const locked=finishDashRecord,clock=elapsed;
   step(1/60,performance.now());check('run through to right '+ev,pos>goal&&finishDashRecord===locked&&elapsed===clock);
   while(mode==='finishDash')step(1/60,performance.now());
   check('ceremony after finish '+ev,mode==='ceremony');
   while(mode==='ceremony')step(1/60,performance.now());
   check('result displayed '+ev,mode==='result'&&!$('#resultPanel').hidden);
   snapshots.push({event:ev,time:locked,display:$('#resultRecord').textContent,points:$('#resultMeta').textContent});
   begin();check('retry clears effects '+ev,pos===0&&elapsed===0&&finishDashTime===0&&throwOrigin===0&&throwAge===0&&ceremonyTime===0);
  }
  selected=4;begin();step(1/60,deadline+1);input('B');check('javeball hold',bHeld);release('B');check('javeball release',mode==='between'&&!bHeld&&records.length===1);
  step(1/60,deadline+1);check('javeball next attempt clears flight',attempt===2&&throwAge===0&&throwOrigin===0&&mode==='ready');
  selected=3;begin();step(1/60,deadline+1);pos=36;spd=12;input('B');check('long jump attempt',mode==='between'&&records[0]>0);
  // Exercise the real five-event tournament transition and totals.
  cup=true;results=[];cpuTotal=[0,0,0];
  for(let ev=0;ev<5;ev++){
   selected=ev;cpuRecords=[4,3,2];finish(ev<3?25:ev===3?5:35);
   while(mode==='ceremony')step(1/60,performance.now());
   check('tournament records '+ev,results.length===ev+1);
   if(ev<4){$('#start').click();check('next event guide '+ev,selected===ev+1&&mode==='tutorial');}
  }
  check('tournament podium and result',ceremonyTotal&&mode==='finished'&&results.length===5);
  snapshots.push({total:results.reduce((sum,r)=>sum+r.p,0),scores:[...cpuTotal]});
  $('#reset').click();check('title clears effects',mode==='menu'&&pos===0&&finishDashTime===0&&throwAge===0&&results.length===0);
  return {checks:checks.length,failed:checks.filter(t=>!t.pass),snapshots};
 }
};
