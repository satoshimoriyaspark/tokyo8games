/* The tour is presentation only. Progress is already saved; no intro flag is persisted. */
(function(root){
 'use strict';
 function createBoardIntro(env){
  let stage='idle',frame=0,deadline=0,announcement=0,startTime=null;
  const motionTime=6200,goalHold=500,startHold=850;
  function clear(){if(frame)env.cancelFrame(frame);if(deadline)env.clearTimer(deadline);if(announcement)env.clearTimer(announcement);frame=deadline=announcement=0;}
  function finish(){if(stage==='idle')return;clear();stage='idle';env.finish();}
  function showStart(){if(stage!=='tour')return;clear();stage='start';env.showStart();announcement=env.timer(finish,startHold);}
  function tick(time){if(stage!=='tour')return;if(startTime===null)startTime=time;const progress=Math.max(0,Math.min(1,(time-startTime-goalHold)/motionTime));env.move(25*(1-progress));if(progress===1)showStart();else frame=env.frame(tick);}
  function start(){if(stage!=='idle')return false;stage='tour';startTime=null;try{env.begin();if(env.reduced()){showStart();return true;}env.move(25);frame=env.frame(tick);deadline=env.timer(showStart,goalHold+motionTime+500);}catch{finish();}return true;}
  return {start,skip:showStart,finish,get stage(){return stage},get active(){return stage!=='idle'}};
 }
 if(typeof module!=='undefined')module.exports={createBoardIntro};
 if(!root?.document)return;
 let previousOverview=false;
 const byId=id=>root.document.getElementById(id);
 function syncBoardIntro(){
  const active=boardIntro.active;
  for(const id of ['menuBtn','pause','roll']){const el=byId(id);if(el)el.disabled=active;}
  byId('boardViewport').inert=active;byId('actionDock').inert=active;
  byId('boardViewport').setAttribute('aria-busy',String(active));
  if(active){byId('roll').textContent=boardIntro.stage==='start'?'もうすぐスタート！':'盤面を見ているよ…';byId('boardMessage').textContent=boardIntro.stage==='start'?'スタート！':'ゴールからスタートへ';}
 }
 function restoreCamera(){
  byId('boardViewport').classList.remove('introCamera');boardOverview=previousOverview;drawBoard();centerBoardAt(state.pos,false);
 }
 const boardIntro=createBoardIntro({
  frame:fn=>root.requestAnimationFrame(fn),cancelFrame:id=>root.cancelAnimationFrame(id),timer:(fn,ms)=>root.setTimeout(fn,ms),clearTimer:id=>root.clearTimeout(id),
  reduced:()=>root.matchMedia?.('(prefers-reduced-motion: reduce)').matches,
  begin(){
   previousOverview=boardOverview;boardOverview=false;boardBusy=true;clearBoardToast();drawBoard();
   byId('boardViewport').classList.add('introCamera');byId('boardIntro').hidden=false;byId('introStart').hidden=true;byId('introGuide').hidden=false;byId('skipBoardIntro').hidden=false;
   syncBoardIntro();byId('skipBoardIntro').focus({preventScroll:true});
  },
  move(position){
   const lower=Math.floor(position),upper=Math.min(25,Math.ceil(position)),a=boardPoint(lower),b=boardPoint(upper),t=position-lower,world=byId('boardWorld'),view=byId('boardViewport');
   view.scrollTo({left:(a.x+(b.x-a.x)*t)/500*world.clientWidth-view.clientWidth/2,top:(a.y+(b.y-a.y)*t)/600*world.clientHeight-view.clientHeight/2,behavior:'auto'});
  },
  showStart(){
   restoreCamera();byId('introGuide').hidden=true;byId('skipBoardIntro').hidden=true;byId('introStart').hidden=false;syncBoardIntro();
  },
  finish(){
   boardBusy=false;byId('boardIntro').hidden=true;byId('introStart').hidden=true;restoreCamera();syncBoardIntro();
   if(!titleVisible){render();if(state.phase==='roll'&&state.running&&!root.document.hidden)byId('roll').focus({preventScroll:true});}
  }
 });
 root.startBoardIntro=()=>boardIntro.start();root.syncBoardIntro=syncBoardIntro;root.isBoardIntroActive=()=>boardIntro.active;
 root.skipBoardIntro=()=>boardIntro.skip();root.finishBoardIntro=()=>boardIntro.finish();
 byId('skipBoardIntro').onclick=()=>boardIntro.skip();
 root.document.addEventListener('keydown',event=>{if(boardIntro.active&&event.key==='Escape'){event.preventDefault();boardIntro.skip();}});
 root.document.addEventListener('visibilitychange',()=>{if(root.document.hidden)boardIntro.finish();});
 root.addEventListener('pagehide',()=>boardIntro.finish());
 root.addEventListener('resize',()=>boardIntro.skip());
 root.matchMedia?.('(prefers-reduced-motion: reduce)').addEventListener?.('change',event=>{if(event.matches)boardIntro.skip();});
})(typeof window==='undefined'?null:window);
