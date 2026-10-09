'use strict';const c=document.querySelector('#game'),g=c.getContext('2d');g.setTransform(3,0,0,3,0,0);g.imageSmoothingEnabled=false;
const $=s=>document.querySelector(s);let state='intro',tick=0,score=0,coins=0,clues=0,hits=0,scroll=0,paused=false,items=[],p={y:113,vy:0,j:0,slide:0,jumpAge:0,land:0},last=null,acc=0;
const T=()=>Math.floor(tick/60),DURATION=115,ground=138;
function reset(){if(!ArySprites.ready())return;state='play';tick=0;score=0;coins=0;clues=0;hits=0;scroll=0;items=[];paused=false;p={y:113,vy:0,j:0,slide:0,jumpAge:0,land:0};last=null;acc=0;runtimeError=''}
function next(){if(state==='intro'||state==='fail'||state==='result')reset();else if(state==='story')state='result';else if(state==='play')jump()}
function jump(){if(state!=='play'||paused)return;if(p.j<2){p.vy=-5.3;p.j++;p.slide=0;p.jumpAge=0;p.land=0}}
function slide(){if(state==='play'&&!paused&&p.j===0&&p.y>=112){p.slide=42;p.vy=0;p.land=0}}
$('#fullscreen').onclick=async()=>{
 const root=document.querySelector('main');
 try{
  if(document.fullscreenElement){await document.exitFullscreen()}
  else if(root.requestFullscreen){await root.requestFullscreen({navigationUI:'hide'})}
  else{$('#fullscreen').textContent='横画面で表示'}
 }catch(_){$('#fullscreen').textContent='横画面で表示'}
};
document.addEventListener('fullscreenchange',()=>{
 $('#fullscreen').textContent=document.fullscreenElement?'EXIT':'FULL';
});
$('#action').onclick=next;$('#jump').onclick=()=>state==='intro'?next():jump();$('#slide').onclick=slide;$('#pause').onclick=()=>{if(state==='play')paused=!paused};
let touchY=0,touchX=0,pointerStart=null;
c.addEventListener('contextmenu',e=>e.preventDefault());
c.addEventListener('dragstart',e=>e.preventDefault());
c.addEventListener('pointerdown',e=>{
 if(pointerStart!==null||(e.pointerType==='mouse'&&e.button!==0))return;
 touchY=e.clientY;touchX=e.clientX;pointerStart=e.pointerId;
 try{c.setPointerCapture(e.pointerId)}catch(_){}
});
c.addEventListener('pointercancel',()=>{pointerStart=null});
c.addEventListener('pointerup',e=>{
 if(pointerStart!==e.pointerId)return;
 pointerStart=null;
 const dy=e.clientY-touchY,dx=e.clientX-touchX;
 if(dy>25&&Math.abs(dy)>Math.abs(dx)*1.1)slide();
 else if(Math.abs(dx)<45&&dy>-35){if(state==='play')jump();else next()}
});document.addEventListener('keydown',e=>{if(['Space','ArrowUp','ArrowDown','Escape','Enter'].includes(e.code))e.preventDefault();if(e.repeat)return;if(e.code==='Space'||e.code==='ArrowUp')state==='intro'?next():jump();if(e.code==='ArrowDown')slide();if(e.code==='Escape'&&state==='play')paused=!paused;if(e.code==='Enter'&&state!=='play')next()});
function rect(x,y,w,h,col){g.fillStyle=col;g.fillRect(Math.round(x),Math.round(y),w,h)}function txt(s,x,y,size=9,col='#fff'){g.font='bold '+size+'px monospace';g.fillStyle=col;g.fillText(s,x,y)}function box(x,y,w,h){rect(x,y,w,h,'#172a46');rect(x,y,w,2,'#ffdd64');rect(x,y+h-2,w,2,'#ffdd64')}
function building(x,i,layer){const w=44+(i%3)*8,y=46+(i%3)*9;rect(x,y,w,ground-y,['#dba38d','#b7c4bc','#e8c99e','#aeb8d5'][i%4]);rect(x-2,y-3,w+4,4,'#5c6579');rect(x+5,y+14,w-10,12,'#f9e5b6');rect(x+8,y+32,11,17,'#6e9cad');rect(x+25,y+32,12,17,'#6e9cad');rect(x+2,ground-21,w-4,4,['#b55c6c','#638d9a'][i%2]);if(layer===0){rect(x+4,ground-16,w-8,12,'#e7c9a0');rect(x+7,ground-14,14,9,'#719b9d')}}
function background(){rect(0,0,320,180,'#9bd8ed');rect(0,55,320,85,'#d6e9cf');rect(0,27,320,8,'#c4e4ec');for(let i=0;i<8;i++){const x=((i*65-scroll*.25)%460+460)%460-65;rect(x,54+(i%3)*7,45,84,'#9db6ae')}for(let i=0;i<9;i++){const x=((i*54-scroll*.55)%486+486)%486-54;building(x,i,0)}rect(0,138,320,42,'#6e7886');rect(0,136,320,3,'#ead9b4');for(let i=0;i<10;i++){let x=((i*42-scroll*1.8)%420+420)%420;rect(x,161,19,2,'#eee3bb')}}
// The PNG renderer is independent of physics and scoring.
function avatar(){
 const y=Number.isFinite(p.y)?Math.max(35,Math.min(113,p.y)):113;
 ArySprites.draw(g,ArySprites.pose(p,tick),78,y+25);
}
function mysteryCat(){
 if(state==='play'||state==='intro')ArySprites.draw(g,{key:'cat',frame:Math.floor(tick/8)%2},264,138,.55);
}
function spawn(){if(tick%39===0)items.push({x:328,y:95+(tick%3)*8,k:'coin',done:false});if(tick%165===70)items.push({x:328,y:112,k:'clue',done:false});if(tick%115===0)items.push({x:328,y:126,k:'cone',done:false});if(tick%210===105)items.push({x:328,y:88,k:'sign',done:false})}
function update(){
 if(state!=='play'||paused||!ArySprites.ready())return;
 tick++;scroll+=2.25;
 if(!Number.isFinite(p.y)||!Number.isFinite(p.vy)){p.y=113;p.vy=0;p.j=0}
 if(p.land>0)p.land--;
 if(p.j>0)p.jumpAge++;
 p.vy+=.29;p.y+=p.vy;
 if(p.y<35){p.y=35;p.vy=Math.max(0,p.vy)}
 if(p.y>=113){if(p.j>0)p.land=7;p.y=113;p.vy=0;p.j=0}
 if(p.slide>0)p.slide--;
 spawn();
 for(const o of items){
  o.x-=2.25;if(o.done)continue;
  const near=o.x>=43&&o.x<=69;if(!near)continue;
  if(o.k==='coin'&&Math.abs(o.y-(p.y-8))<28){o.done=true;coins++;score+=10}
  else if(o.k==='clue'&&Math.abs(o.y-(p.y-7))<31){o.done=true;clues++;score+=500}
  else if((o.k==='cone'&&p.y>103)||(o.k==='sign'&&p.slide<=0&&p.y>90)){
   o.done=true;hits++;score=Math.max(0,score-500);
   if(hits>=3){state='fail';break}
  }
 }
 items=items.filter(o=>o.x>-20&&!o.done);
 if(state==='play'&&tick>=DURATION*60){score+=5000+(hits===0?3000:0)+clues*100;state='story'}
}
function hexChip(x,y){
 // 12x12 pixel-grid hexagon: dark rim, gold edge, light face and centered question mark.
 const rows=['....####....','..########..','.##########.','############','############','############','############','############','.##########.','..########..','....####....'];
 for(let j=0;j<rows.length;j++)for(let i=0;i<rows[j].length;i++)if(rows[j][i]==='#'){
  let color='#9c611c';
  if(j>=1&&j<=10&&i>=2&&i<=9)color='#e6a42a';
  if(j>=3&&j<=8&&i>=3&&i<=8)color='#f9d768';
  rect(x+i,y+j,1,1,color);
 }
 // Question mark rendered as pixel blocks, not antialiased browser text.
 const q=['.###.','##.##','...##','..##.','..#..','.....','..#..'];
 for(let j=0;j<q.length;j++)for(let i=0;i<q[j].length;i++)if(q[j][i]==='#')rect(x+4+i,y+2+j,1,1,'#64431e');
}
function drawItems(){for(const o of items){if(o.k==='coin'){hexChip(o.x,o.y)}else if(o.k==='clue'){rect(o.x,o.y,13,12,'#4d99b8');rect(o.x+2,o.y+2,9,8,'#f7df8b');txt('?',o.x+4,o.y+9,8,'#344e7c')}else if(o.k==='sign'){rect(o.x,o.y,20,4,'#293c62');rect(o.x+1,o.y+4,18,9,'#e9c65b');rect(o.x+2,o.y+6,16,4,'#83582d');rect(o.x+17,o.y-4,2,4,'#293c62')}else{rect(o.x+3,o.y,8,13,'#f07845');rect(o.x+1,o.y+11,12,3,'#fff3dc')}}}
function overlay(title,lines){box(19,49,282,85);txt(title,31,67,13,'#ffe18b');lines.forEach((s,i)=>txt(s,31,86+i*13,9))}
function render(){
 drawLayer('background',background);
 drawLayer('items',drawItems);
 drawLayer('cat',mysteryCat);
 drawLayer('avatar',avatar);
rect(0,0,320,24,'#172a46');txt('?CHIP '+coins+'  MEMO '+clues+'  HIT '+hits+'/3',6,10,8);txt('SCORE '+score+'   '+Math.min(T(),DURATION)+'/'+DURATION+'s',6,20,8);
if(state==='intro')overlay('KAMEARI / 01',['謎の猫を追って、亀有の街へ！','街の「？」を集めよう。','STARTで走行開始']);
if(state==='story')overlay('取材完了！',['取材メモを '+clues+' 個発見。','アリィ「あの猫、次はどこへ？」','タップでリザルトへ']);
if(state==='result')overlay('STAGE CLEAR',['SCORE '+score+'   ?CHIP '+coins,'MEMO '+clues+'  / 取材の記録','STARTで再挑戦']);
if(state==='fail')overlay('GAME OVER',['障害物に3回接触しました。','SCORE '+score+'  ?CHIP '+coins,'STARTで再挑戦']);
if(paused&&state==='play')overlay('PAUSE',['一時停止中','PAUSE / Escで再開'])}
let runtimeError='';
function reportError(layer,error){
 const message=layer+': '+String(error&&error.message||error);
 if(runtimeError!==message)console.error('[ARY]',message);
 runtimeError=message;
}
function drawLayer(name,draw){
 g.save();
 try{draw()}catch(error){reportError(name,error)}finally{g.restore()}
}
window.addEventListener('error',e=>reportError('script',e.message||'Unknown error'));
window.addEventListener('unhandledrejection',e=>reportError('async',e.reason));
document.addEventListener('visibilitychange',()=>{
 if(document.hidden&&state==='play')paused=true;
 last=null;acc=0;pointerStart=null;
});
function syncAssetStatus(){
 const ready=ArySprites.ready(),errors=ArySprites.errors();
 $('#action').disabled=!ready;$('#jump').disabled=!ready;$('#slide').disabled=!ready;
 $('#asset-status').textContent=ready?'':errors.length?'アリィの画像を読み込めませんでした。再読み込みしてください。':'アリィの画像を読み込み中…';
 $('#retry-assets').hidden=errors.length===0;
}
ArySprites.onChange(syncAssetStatus);
$('#retry-assets').onclick=()=>ArySprites.loadAll();
ArySprites.loadAll();
function loop(now){
 requestAnimationFrame(loop);
 if(last===null)last=now;
 const delta=Math.max(0,Math.min(80,now-last));last=now;
 try{
  if(state==='play'&&!paused&&ArySprites.ready()){
   acc+=delta;let n=0;
   while(acc>=1000/60&&n++<5&&state==='play'&&!paused){update();acc-=1000/60}
  }else acc=0;
 }catch(error){reportError('update',error);paused=true;acc=0}
 // A broken item draw cannot skip the character or stop requestAnimationFrame.
 try{render()}catch(error){reportError('render',error)}
 if(runtimeError){rect(0,166,320,14,'#8b173b');txt('ERROR '+runtimeError.slice(0,42),4,176,8)}
}
// Read-only diagnostics for QA; no cheats or state setters in the shipped game.
window.aryDiagnostics=()=>({state,tick,score,coins,clues,hits,paused,
 player:{...p},pose:ArySprites.pose(p,tick),assets:ArySprites.status(),runtimeError});
requestAnimationFrame(loop);
