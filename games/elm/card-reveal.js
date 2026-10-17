/* A draw is saved before this presentation begins. A reload never redraws the card. */
(function(root){
 'use strict';
 function createCardReveal(env){
  let stage='idle',frame=0,timer=0;
  function clear(){if(frame)env.cancelFrame(frame);if(timer)env.clearTimer(timer);frame=timer=0;}
  function finish(){if(stage!=='flipping')return;clear();stage='reading';env.show();}
  function start(){if(stage!=='idle')return false;stage='flipping';if(env.reduced()){finish();return true;}frame=env.frame(()=>{if(stage==='flipping')frame=env.frame(()=>{if(stage==='flipping')env.turn();});});timer=env.timer(finish,1000);return true;}
  function dispose(){clear();stage='idle';}
  return {start,finish,dispose,get stage(){return stage}};
 }
 if(typeof module!=='undefined')module.exports={createCardReveal};
 if(!root?.document)return;
 const byId=id=>root.document.getElementById(id);let reveal=null;
 function show(){if(!reveal)return;const card=byId('missionFlip');if(!card)return;card.classList.add('isFlipped','isReady');card.setAttribute('aria-busy','false');byId('missionFlipFront').setAttribute('aria-hidden','false');byId('missionFlipBack').setAttribute('aria-hidden','true');byId('missionFlipFront').inert=false;byId('flipContinue').disabled=false;byId('flipContinue').hidden=false;const focusNext=root.document.activeElement===byId('skipCardFlip');byId('skipCardFlip').hidden=true;if(focusNext)byId('flipContinue').focus({preventScroll:true});byId('flipStatus').textContent='カードを読み終えたら、ミッションに挑戦しよう。';}
 root.beginMissionReveal=card=>{reveal?.controller.dispose();reveal={card,controller:createCardReveal({frame:fn=>root.requestAnimationFrame(fn),cancelFrame:id=>root.cancelAnimationFrame(id),timer:(fn,ms)=>root.setTimeout(fn,ms),clearTimer:id=>root.clearTimeout(id),reduced:()=>root.matchMedia?.('(prefers-reduced-motion: reduce)').matches,turn(){byId('missionFlip')?.classList.add('isFlipped');},show})};};
 root.cancelMissionReveal=()=>{reveal?.controller.dispose();reveal=null;};
 root.finishMissionFlip=()=>reveal?.controller.finish();
 root.renderMissionReveal=(panel,mission,card,current)=>{
  if(!reveal||reveal.card!==current)return false;
  panel.innerHTML=`<span class="missionlabel">★ ${mission.at}マス · ${mission.name}の試練</span><p class="number">${mission.guardian}からのミッション</p><div class="missionFlipStage"><div id="missionFlip" class="missionFlip" aria-busy="true"><div id="missionFlipBack" class="missionFlipBack" aria-hidden="false">${missionCardBack(mission)}</div><article id="missionFlipFront" class="missionFlipFront" aria-hidden="true" inert>${missionCardArt(card,mission)}<div class="missionFlipCopy"><p class="eyebrow">MISSION CARD</p><h2>${esc(card.title)}</h2><p class="lead">${esc(card.prompt)}</p></div></article></div></div><p id="flipStatus" class="flipStatus" role="status">カードをめくっています…</p><div class="flipActions"><button id="skipCardFlip" class="secondary">演出をスキップ</button><button id="flipContinue" disabled hidden>ミッションに挑戦 →</button></div>`;
  byId('skipCardFlip').onclick=()=>{reveal?.controller.finish();byId('flipContinue')?.focus({preventScroll:true});};
  byId('flipContinue').onclick=()=>{if(!reveal||reveal.controller.stage!=='reading')return;reveal.controller.dispose();reveal=null;render();byId('missionTitle')?.focus({preventScroll:true});};
  if(reveal.controller.stage==='reading')show();else if(reveal.controller.stage==='idle'){byId('skipCardFlip').focus({preventScroll:true});reveal.controller.start();}else byId('missionFlip').classList.add('isFlipped');
  return true;
 };
 root.document.addEventListener('visibilitychange',()=>{if(root.document.hidden)root.finishMissionFlip();});
 root.addEventListener('pagehide',()=>root.finishMissionFlip());
 root.matchMedia?.('(prefers-reduced-motion: reduce)').addEventListener?.('change',event=>{if(event.matches)root.finishMissionFlip();});
})(typeof window==='undefined'?null:window);
