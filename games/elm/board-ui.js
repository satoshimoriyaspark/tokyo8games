let boardFocus=true,boardBusy=false,boardOverview=window.innerWidth>=700,boardViewPos=null,toastTimer,boardToastText="";
function boardPoint(n){const row=Math.floor(n/5),col=row%2===0?n%5:4-n%5;return {x:col*100+50,y:(5-row)*100+50}}
// Follow the pawn when a short landscape viewport must scroll even in overview.
function boardNeedsTracking(){const view=$('boardViewport');return !boardOverview||view.scrollHeight>view.clientHeight+1||view.scrollWidth>view.clientWidth+1}
function centerBoardAt(n,smooth=true){const q=boardPoint(n),world=$('boardWorld'),view=$('boardViewport');view.scrollTo({left:q.x/500*world.clientWidth-view.clientWidth/2,top:q.y/600*world.clientHeight-view.clientHeight/2,behavior:smooth?'smooth':'auto'})}
// Static map artwork stays mounted. Moving the pawn never replaces the background SVG.
let boardMounted=false,boardAvatar=null,pawnDrawPos=null,pawnHopParity=false;
// Motion touches only the portrait. The pawn container remains the tile-foot anchor.
function syncPawnMotion(){
 const pawn=$('pawn'),intro=typeof isBoardIntroActive==='function'&&isBoardIntroActive();
 const active=state.running&&state.phase!=='setup'&&state.phase!=='done'&&!document.hidden&&!(typeof titleVisible!=='undefined'&&titleVisible)&&!intro;
 pawn.classList.toggle('motionDisabled',!active);
 pawn.classList.toggle('idle',!!active&&!boardBusy);
}
document.addEventListener?.('visibilitychange',syncPawnMotion);
window.addEventListener('pagehide',()=>$('pawn').classList.add('motionDisabled'));
window.addEventListener('pageshow',syncPawnMotion);
function drawBoard(pos=state.pos){
 const world=$('boardWorld'),view=$('boardViewport');view.classList.toggle('overview',boardOverview);$('overviewBoard').textContent=boardOverview?'拡大して見る':'全体を見る';
 if(!boardMounted){
  const road=Array.from({length:26},(_,i)=>{const p=boardPoint(i);return `${i?'L':'M'}${p.x} ${p.y}`}).join(' ');
  $('boardRoad').innerHTML=(typeof regionMarkup==='function'?regionMarkup():'')+`<path d="${road}" fill="none" stroke="#071727" stroke-width="37" stroke-linejoin="round"/><path d="${road}" fill="none" stroke="#ffffff" stroke-width="27" stroke-linejoin="round"/><path d="${road}" fill="none" stroke="#84cada" stroke-width="2" stroke-dasharray="6 9"/>`;
  $('boardTiles').innerHTML=Array.from({length:26},(_,i)=>{const q=boardPoint(i),m=MISSIONS.find(m=>m.at===i);return `<button class="boardTile ${m?'guardianTile':''}" data-board-pos="${i}" style="left:${q.x/5}%;top:${q.y/6}%;${m?'--zone:'+m.color:''}">${m?`<span class="stopFlag">★ STOP</span><img src="assets/${m.art}.webp" alt=""><span class="tileCaption">${m.name}</span>`:`<span class="tileEmoji">${i===0?'🏕️':EVENTS[i]?.[0]||'·'}</span>`}<b class="tileNum">${i===0?'START':i}</b></button>`}).join('');
  $('boardTiles').querySelectorAll('[data-board-pos]').forEach(b=>b.onclick=()=>{if(typeof isBoardIntroActive==='function'&&isBoardIntroActive())return;const i=Number(b.dataset.boardPos),m=MISSIONS.find(m=>m.at===i);if(i===state.pos&&state.phase!=='roll'){boardFocus=true;updateBoard();return}showBoardToast(i===0?'START：みんなで冒険を始めよう':m?`${i}：${m.guardian}／${m.name}の試練（必ずSTOP）`:`${i}：${EVENTS[i][1]}`)});
  boardMounted=true;
 }
 $('boardTiles').querySelectorAll('[data-board-pos]').forEach(b=>{
  const i=Number(b.dataset.boardPos),m=MISSIONS.find(m=>m.at===i),earned=!!m&&state.badges.includes(m.id);
  b.classList.toggle('here',i===pos);b.classList.toggle('cleared',earned);
  b.setAttribute('aria-label',`${i===0?'スタート':i+'マス'} ${m?m.guardian+' STOP '+m.name:EVENTS[i]?.[1]||''}${i===pos?' 現在地':''}`);
  if(m){const flag=b.querySelector('.stopFlag'),label=earned?'✓ CLEAR':'★ STOP';if(flag.textContent!==label)flag.textContent=label;}
 });
 const avatar=state.avatar==='sora'?'sora':'haru';
 if(boardAvatar!==avatar){$('pawn').innerHTML=`<img src="assets/${avatar}-pawn.webp" alt="${avatar==='sora'?'ソラ':'ハル'}"><span class="pawnBase"></span>`;boardAvatar=avatar;}
 const pawn=$('pawn'),q=boardPoint(pos),stepping=boardBusy&&!(typeof isBoardIntroActive==='function'&&isBoardIntroActive());
 if(stepping&&pawnDrawPos!==null&&pos!==pawnDrawPos){pawnHopParity=!pawnHopParity;}
 pawn.classList.toggle('hopAlternate',pawnHopParity);pawn.classList.toggle('walking',stepping);
 pawn.style.left=q.x/5+'%';pawn.style.top=q.y/6+'%';pawnDrawPos=pos;syncPawnMotion();
}
function boardStatusText(){return state.phase==='setup'?'冒険の準備':state.phase==='done'?'5つの証を集めた！ 冒険クリア':!state.running?`一時停止中 · 現在地 ${state.pos} / 25`:`現在地 ${state.pos} / 25${state.phase==='mission'?' · ミッション':''}`}
function updateBoard(){if(typeof titleVisible!=='undefined'&&titleVisible){if($('playDialog').open)$('playDialog').close();$('enterAdventure').focus?.({preventScroll:true});return}$('closePlay').textContent=state.phase==='setup'?'× タイトルへ':'× 盤面へ';$('closePlay').setAttribute?.('aria-label',state.phase==='setup'?'タイトルへ戻る':'盤面に戻る');drawBoard(boardViewPos??state.pos);const modal=state.phase!=='roll'||!state.running;const dialog=$('playDialog'),panel=$('panel');if(modal){if(panel.parentElement!==dialog)dialog.appendChild(panel);$('returnPlay').hidden=false;$('returnPlay').textContent=state.phase==='setup'?'冒険の準備をする':state.phase==='done'?'クリアの記録を見る':!state.running?'続きから再開する':state.phase==='mission'?'ミッションカードに戻る':'マスのイベントを見る';if(boardFocus&&!dialog.open)dialog.showModal();if(!boardFocus&&dialog.open)dialog.close();}else{if(dialog.open)dialog.close();$('actionDock').appendChild(panel);$('returnPlay').hidden=true;}
 $('boardMessage').textContent=boardToastText||(boardBusy?'コマが進んでいるよ…':boardStatusText());
 if(typeof isBoardIntroActive==='function'&&isBoardIntroActive())syncBoardIntro();
 requestAnimationFrame(()=>{if(boardNeedsTracking()&&!(typeof isBoardIntroActive==='function'&&isBoardIntroActive()))centerBoardAt(boardViewPos??state.pos,false)});}
function clearBoardToast(){clearTimeout(toastTimer);boardToastText='';$('adventureToast').hidden=true;$('adventureToast').textContent='';}
function showBoardToast(text){clearBoardToast();boardToastText=text;$('boardMessage').textContent=text;toastTimer=setTimeout(()=>{clearBoardToast();$('boardMessage').textContent=boardStatusText();},1600)}
const DIE_ROTATIONS={1:[0,0],2:[0,-90],3:[90,0],4:[-90,0],5:[0,90],6:[0,180]};
function dieMarkup(value=1){const dots={1:[5],2:[1,9],3:[1,5,9],4:[1,3,7,9],5:[1,3,5,7,9],6:[1,3,4,6,7,9]};const [x,y]=DIE_ROTATIONS[value||1];return `<div class="dice diceScene" role="img" aria-label="サイコロ ${value||1}"><div class="diceCube" id="diceCube" style="transform:rotateX(${x}deg) rotateY(${y}deg)">${[1,2,3,4,5,6].map(n=>`<div class="dieFace face${n}">${Array.from({length:9},(_,i)=>`<i class="${dots[n].includes(i+1)?'pip':''}"></i>`).join('')}</div>`).join('')}</div></div>`}
function boardCelebrate(name){showBoardToast('✦ '+name+'の証を手に入れた！');$('badges').classList.add('badgePop');setTimeout(()=>$('badges').classList.remove('badgePop'),800)}
async function takeBoardTurn(){if(boardBusy||state.phase!=='roll'||!state.running)return;clearBoardToast();boardBusy=true;if(typeof playSound==='function')playSound('dice');$('roll').disabled=true;$('roll').textContent='サイコロ回転中…';$('pause').disabled=true;$('menuBtn').disabled=true;
const die=Math.floor(Math.random()*6)+1,target=move(state,die),reduced=window.matchMedia?.('(prefers-reduced-motion: reduce)').matches,sleep=ms=>new Promise(r=>setTimeout(r,ms)),cube=$('diceCube');
try{const [x,y]=DIE_ROTATIONS[die];if(cube){cube.style.transition=reduced?'none':'transform 850ms cubic-bezier(.18,.65,.25,1)';cube.style.transform=`rotateX(${x+720}deg) rotateY(${y+720}deg)`;}await sleep(reduced?0:900);$('roll').textContent='コマが進んでいるよ…';showBoardToast(`${die}が出た！${state.pos+die>target.pos?' STOPで余りはおしまい':''}`);
for(let i=state.pos+1;i<=target.pos;i++){if((!reduced||i===state.pos+1)&&typeof playSound==='function')playSound('move');boardViewPos=i;drawBoard(i);if(boardNeedsTracking())centerBoardAt(i);await sleep(reduced?0:240)}state=target;boardFocus=true;save();
}finally{boardViewPos=null;boardBusy=false;$('pause').disabled=false;$('menuBtn').disabled=false;clearBoardToast();render()}}
$('returnPlay').onclick=()=>{boardFocus=true;updateBoard();if(typeof resumeMusic==='function')resumeMusic()};$('closePlay').onclick=()=>{if(typeof finishMissionFlip==='function')finishMissionFlip();if(typeof stopSound==='function')stopSound();if(state.phase==='setup'&&typeof showSetupTitle==='function'){showSetupTitle();return}boardFocus=false;$('playDialog').close()};$('playDialog').addEventListener('cancel',event=>{if(typeof finishMissionFlip==='function')finishMissionFlip();if(typeof stopSound==='function')stopSound();if(state.phase==='setup'&&typeof showSetupTitle==='function'){event.preventDefault();showSetupTitle();return}boardFocus=false});$('centerBoard').onclick=()=>{if($('menuDialog').open)$('menuDialog').close();centerBoardAt(state.pos)};$('overviewBoard').onclick=()=>{if($('menuDialog').open)$('menuDialog').close();boardOverview=!boardOverview;drawBoard();requestAnimationFrame(()=>centerBoardAt(state.pos,false))};$('menuBtn').onclick=()=>{if(boardBusy)return;$('pawnChoice').value=state.avatar==='sora'?'sora':'haru';$('menuDialog').showModal();$('menuDialog').scrollTop=0};$('pawnChoice').onchange=()=>{state.avatar=$('pawnChoice').value==='sora'?'sora':'haru';save();drawBoard()};$('closeMenu').onclick=()=>$('menuDialog').close();window.addEventListener('resize',()=>{if(typeof isBoardIntroActive==='function'&&isBoardIntroActive())return;if(window.innerWidth>=700)boardOverview=true;drawBoard();requestAnimationFrame(()=>centerBoardAt(state.pos,false))});
if(typeof module!=='undefined')module.exports={boardPoint};
