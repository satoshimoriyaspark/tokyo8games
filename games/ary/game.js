'use strict';const c=document.querySelector('#game'),g=c.getContext('2d');g.setTransform(3,0,0,3,0,0);g.imageSmoothingEnabled=false;
const $=s=>document.querySelector(s);let state='intro',tick=0,score=0,coins=0,clues=0,hits=0,scroll=0,paused=false,items=[],p={y:113,vy:0,j:0,slide:0,jumpAge:0,land:0},last=null,acc=0;
let controlKey='',damageTaken=0;
const MAX_LIFE=5;
const POWER_TICKS={shield:360,boost:300};
let shieldUntil=0,boostUntil=0,hurtUntil=0,speedFactor=1,particles=[],notices=[];
function burst(x,y,color,count=10){
 for(let i=0;i<count;i++){const a=i*Math.PI*2/count;particles.push({x,y,vx:Math.cos(a)*1.2,vy:Math.sin(a)*1.2-.4,color,born:tick})}
 particles=particles.slice(-96);
}
function notice(text,color){notices.push({text,color,until:tick+75});notices=notices.slice(-2)}
function takePower(kind){
 if(kind==='shield')shieldUntil=tick+POWER_TICKS.shield;
 else boostUntil=tick+POWER_TICKS.boost;
 const color=kind==='shield'?'#91edff':'#ffc76e';
 burst(65,p.y-12,color,16);notice(kind==='shield'?'無敵！ 6秒':'加速！ 5秒',color);
}

let pickupFx=[],memoUntil=0,tips=[],activeTip=null,seenTips=new Set();
function teach(key,text){if(!seenTips.has(key)){seenTips.add(key);tips.push(text)}}
let previous={y:113,scroll:0};
const T=()=>Math.floor(tick/60),DURATION=115,ground=138;
// Course units are game distances, not real-world metres.
const STAGE={id:'kameari',number:1,name:'亀有',length:115*60*2.25,goal:'狛亀',next:'金町'};
const PLANNED_STAGES=15;
let finishAge=0,clearAwarded=false,clearRecord={cleared:false,best:0};
try{const r=JSON.parse(localStorage.getItem('ary-stage-kameari-v1'));if(r&&Number.isFinite(r.best))clearRecord={cleared:!!r.cleared,best:Math.max(0,r.best)}}catch(_){}
function stageProgress(){return Math.max(0,Math.min(1,scroll/STAGE.length))}
function stageZone(){return stageProgress()<.4?'商店街':stageProgress()<.82?'モール周辺':'狛亀へ'}
function beginFinish(){
 if(clearAwarded)return;
 clearAwarded=true;scroll=STAGE.length;state='finish';finishAge=0;
 items=[];tips=[];activeTip=null;notices=[];pickupFx=[];particles=[];
 shieldUntil=boostUntil=hurtUntil=0;p.slide=0;
 score+=5000+(damageTaken===0?3000:0)+clues*100;
 clearRecord={cleared:true,best:Math.max(clearRecord.best,score)};
 try{localStorage.setItem('ary-stage-kameari-v1',JSON.stringify(clearRecord))}catch(_){}
}
function updateFinish(){
 if(paused||!ArySprites.ready())return;
 previous={y:p.y,scroll};tick++;finishAge++;
 speedFactor=Math.max(0,1-finishAge/60);scroll+=2.25*speedFactor;
 p.vy+=.29;p.y=Math.min(113,p.y+p.vy);if(p.y>=113){p.vy=0;p.j=0}
 if(finishAge>=90){state='story';p.y=113;p.j=0;speedFactor=0}
}

function reset(){if(!ArySprites.ready())return;state='play';finishAge=0;clearAwarded=false;damageTaken=0;shieldUntil=0;boostUntil=0;hurtUntil=0;speedFactor=1;particles=[];notices=[];pickupFx=[];memoUntil=0;tips=[];activeTip=null;seenTips.clear();tick=0;score=0;coins=0;clues=0;hits=0;scroll=0;items=[];paused=false;p={y:113,vy:0,j:0,slide:0,jumpAge:0,land:0};last=null;acc=0;runtimeError='';previous={y:p.y,scroll}}
function next(){if((state==='play'||state==='finish')&&paused){paused=false;return}if(state==='intro'||state==='fail'||state==='result')reset();else if(state==='story')state='result';else if(state==='play')jump()}
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
 $('#fullscreen').textContent=document.fullscreenElement?'全画面を終了':'全画面';
});
$('#action').onclick=next;$('#jump').onclick=()=>state==='intro'?next():jump();$('#slide').onpointerdown=e=>{if(e.button===0){e.preventDefault();slide()}};$('#slide').onclick=e=>{if(!e||e.detail===0)slide()};$('#pause').onclick=()=>{if(state==='play'||state==='finish')paused=!paused};
let touchY=0,touchX=0,pointerStart=null,swipeHandled=false;
function isDownSwipe(e){const dy=e.clientY-touchY,dx=e.clientX-touchX;return dy>=18&&dy>Math.abs(dx)*1.1}
c.addEventListener('contextmenu',e=>e.preventDefault());
c.addEventListener('dragstart',e=>e.preventDefault());
c.addEventListener('pointerdown',e=>{
 if(pointerStart!==null||(e.pointerType==='mouse'&&e.button!==0))return;
 touchY=e.clientY;touchX=e.clientX;pointerStart=e.pointerId;swipeHandled=false;
 try{c.setPointerCapture(e.pointerId)}catch(_){}
});
c.addEventListener('pointermove',e=>{
 if(pointerStart!==e.pointerId||swipeHandled)return;
 if(isDownSwipe(e)){swipeHandled=true;slide()}
});
c.addEventListener('pointercancel',()=>{pointerStart=null;swipeHandled=false});
c.addEventListener('pointerup',e=>{
 if(pointerStart!==e.pointerId)return;
 pointerStart=null;
 if(swipeHandled){swipeHandled=false;return}
 const dy=e.clientY-touchY,dx=e.clientX-touchX;
 if(isDownSwipe(e))slide();
 else if(Math.abs(dx)<45&&dy>-35){if(state==='play')jump();else next()}
});document.addEventListener('keydown',e=>{if(['Space','ArrowUp','ArrowDown','Escape','Enter'].includes(e.code))e.preventDefault();if(e.repeat)return;if(e.code==='Space'||e.code==='ArrowUp')state==='intro'?next():jump();if(e.code==='ArrowDown')slide();if(e.code==='Escape'&&(state==='play'||state==='finish'))paused=!paused;if(e.code==='Enter'&&state!=='play')next()});
function rect(x,y,w,h,col){g.fillStyle=col;g.fillRect(Math.round(x*3)/3,Math.round(y*3)/3,w,h)}function txt(s,x,y,size=9,col='#fff'){g.font='bold '+size+'px monospace';g.fillStyle=col;g.fillText(s,x,y)}function box(x,y,w,h){rect(x,y,w,h,'#172a46');rect(x,y,w,2,'#ffdd64');rect(x,y+h-2,w,2,'#ffdd64')}
function building(x,i,layer){const w=44+(i%3)*8,y=46+(i%3)*9;rect(x,y,w,ground-y,['#dba38d','#b7c4bc','#e8c99e','#aeb8d5'][i%4]);rect(x-2,y-3,w+4,4,'#5c6579');rect(x+5,y+14,w-10,12,'#f9e5b6');rect(x+8,y+32,11,17,'#6e9cad');rect(x+25,y+32,12,17,'#6e9cad');rect(x+2,ground-21,w-4,4,['#b55c6c','#638d9a'][i%2]);if(layer===0){rect(x+4,ground-16,w-8,12,'#e7c9a0');rect(x+7,ground-14,14,9,'#719b9d')}}
function background(viewScroll=scroll){rect(0,0,320,180,'#9bd8ed');rect(0,55,320,85,'#d6e9cf');rect(0,27,320,8,'#c4e4ec');for(let i=0;i<8;i++){const x=((i*65-viewScroll*.25)%460+460)%460-65;rect(x,54+(i%3)*7,45,84,'#9db6ae')}for(let i=0;i<9;i++){const x=((i*54-viewScroll*.55)%486+486)%486-54;building(x,i,0)}rect(0,138,320,42,'#6e7886');rect(0,136,320,3,'#ead9b4');for(let i=0;i<10;i++){let x=((i*42-viewScroll*1.8)%420+420)%420;rect(x,161,19,2,'#eee3bb')}}
// Stylized scenery drawn on the same pixel grid, preserving the approved Ary PNGs.
function mallBlock(x){
 rect(x,49,210,87,'#ece2d0');rect(x,46,210,7,'#737789');
 rect(x+10,62,190,24,'#69abc0');
 for(let i=0;i<12;i++)rect(x+12+i*16,62,2,24,'#d4edf0');
 rect(x+65,53,90,8,'#bf5777');txt('SHOPPING MALL',x+69,59,6,'#fff3dc');
 rect(x+85,96,42,40,'#355c76');rect(x+89,100,34,34,'#8bcedc');rect(x+105,100,2,34,'#ecf4ee');
 for(let i=0;i<3;i++){rect(x+10+i*24,98,20,30,'#cf9b77');rect(x+138+i*22,98,17,30,'#c6b189')}
 for(let i=0;i<5;i++){rect(x+8+i*45,131,20,5,'#75886b');rect(x+10+i*45,120,16,11,'#7ca677')}
}
function stoneTurtle(x,flip=false){
 g.save();g.translate(x,0);if(flip){g.translate(30,0);g.scale(-1,1)}
 rect(0,128,34,8,'#7d8590');rect(3,118,28,10,'#a9afb4');rect(1,116,32,3,'#d0d2cb');
 rect(8,102,17,3,'#687977');rect(5,105,23,9,'#81918a');rect(9,103,15,8,'#aeb8a9');
 rect(13,104,2,8,'#647a72');rect(7,108,19,2,'#647a72');
 rect(26,101,5,10,'#879a8a');rect(28,98,7,6,'#acb8a7');rect(32,99,1,1,'#334745');
 rect(5,111,5,5,'#657f74');rect(22,111,5,5,'#657f74');rect(2,110,5,2,'#879a8a');
 g.restore();
}
function stageScenery(viewScroll){
 const progress=Math.max(0,Math.min(1,viewScroll/STAGE.length));
 // Fade into the mall, then trees near the goal, without hiding gameplay.
 const mallAlpha=Math.min(1,Math.max(0,(progress-.35)/.06))*Math.min(1,Math.max(0,(.84-progress)/.06));
 if(mallAlpha>0){g.save();g.globalAlpha=mallAlpha;rect(0,43,320,93,'#dde4d9');for(let i=0;i<3;i++)mallBlock(((i*240-viewScroll*.35)%720+720)%720-220);g.restore()}
 if(progress>.8){g.save();g.globalAlpha=Math.min(1,(progress-.8)/.04);rect(0,43,320,93,'#d5e4ca');for(let i=0;i<7;i++){const x=((i*57-viewScroll*.2)%399+399)%399-30;rect(x+10,82,6,54,'#8b806e');rect(x,53,28,42,'#779679');rect(x+5,47,19,35,'#91b188')}g.restore()}
 if(progress>.94){
  const x=183+Math.max(0,STAGE.length-viewScroll)*.16;
  rect(x+15,62,7,74,'#a3aaa8');rect(x+82,62,7,74,'#a3aaa8');
  rect(x+7,59,91,7,'#737e81');rect(x+11,73,83,5,'#b8beb4');rect(x+44,65,18,16,'#667877');txt('亀',x+49,76,7,'#fff3dc');
  stoneTurtle(x-10);stoneTurtle(x+87,true);
  rect(x+28,119,52,17,'#ece4ce');txt('狛亀',x+35,131,11,'#4b6264');
 }
 if(state==='play'){rect(103,28,87,13,'#172a46');txt('01 亀有 / '+stageZone(),107,37,6,'#fff3dc')}
}
// The PNG renderer is independent of physics and scoring.
function avatar(viewY=p.y){
 const y=Number.isFinite(viewY)?Math.max(35,Math.min(113,viewY)):113;
 const pose=state==='finish'&&p.j===0?{key:'ride',frame:finishAge<60?Math.floor((finishAge-finishAge*finishAge/120)/5)%6:0}:state==='story'||state==='result'?{key:'ride',frame:0}:ArySprites.pose(p,tick);
 ArySprites.draw(g,pose,78,y+25);
}
function mysteryCat(){
 if(['play','intro','finish','story'].includes(state))ArySprites.draw(g,{key:'cat',frame:Math.floor(tick/8)%2},state==='finish'?264+finishAge*1.4:state==='story'?400:264,138,.55);
}
function spawn(){
 if(stageProgress()>.94)return;
 if(tick%39===0){items.push({x:328,y:95+(tick%3)*8,k:'coin',done:false});teach('coin','チップを集めよう！')}
 if(tick%165===70){items.push({x:328,y:112,k:'clue',done:false});teach('clue','取材メモを見つけよう！')}
 if(tick%1200===300){items.push({x:328,y:100,k:'shield',done:false});teach('shield','盾を取ると6秒間むてき！')}
 if(tick%1200===660){items.push({x:328,y:100,k:'boost',done:false});teach('boost','稲妻を取ると5秒間かそく！')}
 if(tick%1200===540){items.push({x:328,y:100,k:'heart',done:false});teach('heart','ハートでライフを1つ回復！')}
 // Alternate encounters, three seconds apart. Crow starts offscreen for advance warning.
 if(tick%360===90)items.push({x:328,y:119,k:'cone',done:false});
 if(tick%360===270)items.push({x:400,y:84,k:'crow',done:false});
}
function overlaps(a,b){return a.x<b.x+b.w&&a.x+a.w>b.x&&a.y<b.y+b.h&&a.y+a.h>b.y}
function hazardHit(o){
 const player={x:51,y:p.y-(p.slide>0?8:23),w:24,h:p.slide>0?30:45};
 // Solid body only: the crow's wing tips and the cone's ground shadow are decorative.
 const hazard=o.k==='crow'?{x:o.x+4,y:o.y+1,w:22,h:10}:{x:o.x+4,y:o.y+2,w:14,h:17};
 return overlaps(player,hazard);
}
function update(){
 if(state!=='play'||paused||!ArySprites.ready())return;
 previous={y:p.y,scroll};
 tick++;
 const targetSpeed=tick<boostUntil?1.35:1;
 speedFactor+=Math.max(-.02,Math.min(.02,targetSpeed-speedFactor));
 scroll+=2.25*speedFactor;
 particles=particles.filter(f=>tick-f.born<28);notices=notices.filter(f=>tick<f.until);
 if(!Number.isFinite(p.y)||!Number.isFinite(p.vy)){p.y=113;p.vy=0;p.j=0}
 if(p.land>0)p.land--;
 if(p.j>0)p.jumpAge++;
 p.vy+=.29;p.y+=p.vy;
 if(p.y<35){p.y=35;p.vy=Math.max(0,p.vy)}
 if(p.y>=113){if(p.j>0)p.land=7;p.y=113;p.vy=0;p.j=0}
 if(p.slide>0)p.slide--;
 spawn();
 pickupFx=pickupFx.filter(f=>tick-f.born<36);
 if(activeTip&&tick>=activeTip.until)activeTip=null;
 if(!activeTip&&tips.length)activeTip={text:tips.shift(),until:tick+120};
 for(const o of items){
  o.previousX=o.x;o.x-=(o.k==='crow'?3:2.25)*speedFactor;if(o.done)continue;
  const near=o.x>=43&&o.x<=69;
  if(o.k==='cone'||o.k==='crow'){
   if(hazardHit(o)){
    o.done=true;
    if(tick<shieldUntil){burst(o.x+10,o.y+8,'#91edff',12);notice('ガード！','#91edff')}
    else if(tick>=hurtUntil){
     hurtUntil=tick+60;hits++;damageTaken++;score=Math.max(0,score-500);
     burst(65,p.y-10,'#ff839f',16);notice('ヒット！','#ff9fb3');
     if(hits>=MAX_LIFE){state='fail';break}
    }
   }
   continue;
  }
  if(!near)continue;
  if(o.k==='coin'&&Math.abs(o.y-(p.y-8))<28){o.done=true;coins++;score+=10;pickupFx.push({x:o.x,y:o.y,born:tick});burst(o.x+8,o.y+8,'#ffe18b',8)}
  else if(o.k==='clue'&&Math.abs(o.y-(p.y-7))<31){o.done=true;clues++;score+=500;memoUntil=tick+75;burst(o.x+8,o.y+8,'#91e3d2',12)}
  else if(o.k==='heart'&&Math.abs(o.y-(p.y-8))<28){
   o.done=true;const recovered=hits>0;hits=Math.max(0,hits-1);
   burst(o.x+8,o.y+8,'#ff9fb3',14);notice(recovered?'ハート＋1':'ライフ満タン','#ffb5cd');
  }
  else if((o.k==='shield'||o.k==='boost')&&Math.abs(o.y-(p.y-8))<28){o.done=true;takePower(o.k)}

 }
 items=items.filter(o=>o.x>-20&&!o.done);
 if(state==='play'&&scroll>=STAGE.length)beginFinish();
}
function hexChip(x,y){
 if(ArySprites.drawChip(g,x,y,tick))return;
 // Preserve a readable chip if its optional PNG fails to load.
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
// Code-native pixel artwork, using the same logical pixel grid as the street.
function drawCone(x,y){
 rect(x,y+18,24,2,'#50596b');
 rect(x+9,y,5,3,'#293147');rect(x+8,y+3,7,3,'#293147');
 rect(x+6,y+6,11,5,'#293147');rect(x+4,y+11,15,6,'#293147');
 rect(x+10,y+1,3,4,'#ff974e');rect(x+9,y+5,5,3,'#f8eee0');
 rect(x+7,y+8,9,4,'#f27739');rect(x+6,y+12,11,3,'#f8eee0');
 rect(x+5,y+15,13,2,'#e45e2c');rect(x+2,y+17,20,3,'#293147');
 rect(x+4,y+17,16,1,'#fb974b');
}
function drawCrow(x,y){
 const phase=Math.floor(tick/7)%4;
 // Pointed beak faces the player; blue highlights distinguish it from the story cat.
 rect(x+5,136,23,2,'#596577');
 rect(x+6,y+3,16,8,'#192238');rect(x+3,y+1,8,7,'#192238');
 rect(x,y+4,5,3,'#bbad83');rect(x+4,y+2,2,2,'#f8eee0');
 rect(x+9,y+3,10,3,'#435675');rect(x+21,y+6,7,3,'#192238');
 rect(x+25,y+4,4,3,'#192238');
 if(phase===0||phase===3){
  rect(x+13,y-4,7,8,'#25324d');rect(x+17,y-9,6,7,'#25324d');
  rect(x+21,y-12,3,6,'#192238');rect(x+15,y-4,2,6,'#536a88');
 }else{
  rect(x+12,y+5,9,5,'#25324d');rect(x+15,y+9,8,4,'#25324d');
  rect(x+20,y+12,4,3,'#192238');rect(x+14,y+7,4,2,'#536a88');
 }
 rect(x+9,y+11,2,2,'#b6a580');rect(x+15,y+11,2,2,'#b6a580');
}
function drawMemo(x,y,scale=1){
 g.save();g.translate(x,y);g.scale(scale,scale);
 // 24px blue notebook: white pages, bound spine and a separate yellow pencil.
 rect(2,2,17,21,'#172a46');rect(3,1,15,2,'#172a46');
 rect(3,3,15,18,'#398fbf');rect(5,3,2,18,'#24618e');
 rect(8,4,9,14,'#fff3dc');rect(10,7,5,1,'#68809a');
 rect(10,10,5,1,'#68809a');rect(10,13,3,1,'#68809a');
 for(let i=0;i<4;i++)rect(1,5+i*4,4,1,'#c6eaf0');
 rect(8,19,9,1,'#8edbdc');
 for(let i=0;i<10;i++){rect(20-Math.floor(i/3),7+i,3,2,'#624329');rect(21-Math.floor(i/3),7+i,1,2,'#ffdc65')}
 rect(20,5,3,3,'#f59bb8');rect(17,18,2,2,'#e8c69a');rect(17,20,1,1,'#172a46');
 g.restore();
}
function drawPower(x,y,kind){
 rect(x,y,20,20,'#172a46');rect(x+1,y+1,18,18,kind==='shield'?'#286882':'#925432');
 const rows=kind==='shield'?['#######','#######','##.#.##','##.#.##','##...##','.#####.','..###..','...#...']:['...###.','..###..','.###...','######.','...##..','..##...','.##....'];
 for(let j=0;j<rows.length;j++)for(let i=0;i<rows[j].length;i++)if(rows[j][i]==='#')rect(x+3+i*2,y+2+j*2,2,2,kind==='shield'?'#91edff':'#ffe18b');
}
function playerEffects(viewY){
 if(state!=='play')return;
 if(tick<boostUntil){for(let i=0;i<5;i++){const x=28-((tick*2+i*9)%30);rect(x,viewY-25+i*10,10+i%3*3,1,'#ffc76e')}}
 if(tick<shieldUntil||tick<hurtUntil){
  const color=tick<shieldUntil?'#91edff':'#ff9fb3';
  // Outline only: never tint, hide or replace the approved character PNG.
  g.strokeStyle=color;g.lineWidth=1;g.beginPath();g.ellipse(64,viewY-8,30,36,0,0,Math.PI*2);g.stroke();
 }
}
function pickupFeedback(){
 if(state!=='play'&&state!=='fail')return;
 for(const f of particles){const age=tick-f.born;rect(f.x+f.vx*age,f.y+f.vy*age+age*age*.025,age<14?2:1,age<14?2:1,f.color)}
 if(notices.length){const n=notices[notices.length-1];box(8,74,95,17);txt(n.text,12,86,8,n.color)}
 if(state!=='play')return;
 let statusY=29;
 for(const [kind,until,label,color] of [['shield',shieldUntil,'無敵','#91edff'],['boost',boostUntil,'加速','#ffc76e']]){
  if(tick>=until)continue;
  box(7,statusY,91,19);txt(label+' '+((until-tick)/60).toFixed(1)+'秒',12,statusY+10,8,color);
  rect(12,statusY+13,80,2,'#43516a');rect(12,statusY+13,80*(until-tick)/POWER_TICKS[kind],2,color);statusY+=21;
 }

 for(const f of pickupFx){const y=f.y-4-(tick-f.born)*.35;txt('+10',f.x+1,y+1,8,'#69421e');txt('+10',f.x,y,8,'#fff0a2')}
 if(tick<memoUntil){box(104,52,119,19);txt('取材メモ発見！',110,65,9,'#91e3d2')}
 if(activeTip){box(7,148,142,20);txt(activeTip.text,12,161,8,'#fff3dc')}
}
function drawItems(alpha=1){
 for(const item of items){
  const o={...item,x:Number.isFinite(item.previousX)?item.previousX+(item.x-item.previousX)*alpha:item.x};
  if(o.k==='coin')hexChip(o.x,o.y);
  else if(o.k==='clue')drawMemo(o.x-5,o.y-6+Math.sin(tick/18)*2);
  else if(o.k==='heart'){
   g.save();g.translate(o.x,o.y+Math.sin(tick/18)*2);g.scale(2.5,2.5);heart(0,0,true);
   rect(1,1,1,1,'#fff3dc');rect(5,4,3,1,'#fff3dc');rect(6,3,1,3,'#fff3dc');g.restore();
  }
  else if(o.k==='shield'||o.k==='boost')drawPower(o.x,o.y+Math.sin(tick/18)*2,o.k);
  else if(o.k==='cone')drawCone(o.x,o.y);
  else if(o.k==='crow')drawCrow(o.x,o.y);
 }
 const approaching=items.find(o=>(o.k==='crow'||o.k==='cone')&&!o.done&&o.x>82);
 if(approaching){
  const crow=approaching.k==='crow';
  box(193,29,122,19);txt(crow?'↓ くぐろう！':'↑ ジャンプ！',199,42,10,'#ffe18b');
  if(crow&&approaching.x>285){rect(302,80,12,15,'#172a46');txt('!',305,92,12,'#ffdd64')}
 }
}
function overlay(title,lines){box(19,49,282,85);txt(title,31,67,13,'#ffe18b');lines.forEach((s,i)=>txt(s,31,86+i*13,9))}
function goalProgress(){
 const progress=stageProgress();
 txt('GOAL '+Math.floor(progress*100)+'%',174,10,7,'#dce4f5');
 rect(174,15,111,6,'#dce4f5');rect(175,16,109,4,'#34445e');
 const width=Math.floor(109*progress);
 if(width>0)rect(175,16,width,4,progress===1?'#ffdd64':'#7de4ca');
 rect(278,2,1,9,'#dce4f5');
 for(let y=0;y<3;y++)for(let x=0;x<3;x++)rect(279+x*2,2+y*2,2,2,(x+y)%2?'#172a46':'#fff3dc');
}
function heart(x,y,filled){
 const rows=['.##.##.','#######','#######','.#####.','..###..','...#...'];
 for(let j=0;j<rows.length;j++)for(let i=0;i<7;i++)if(rows[j][i]==='#')rect(x+i,y+j,1,1,filled?'#f59bb8':'#43516a');
}
function hud(){
 rect(0,0,320,26,'#172a46');rect(0,25,320,1,'#e0bf75');
 hexChip(6,5);txt('チップ',24,7,6,'#ffdd78');txt(String(coins).padStart(3,'0'),24,16,8,'#ffdd78');
 drawMemo(49,3,.65);txt('取材メモ',67,7,6,'#91e3d2');
 txt(String(clues).padStart(2,'0'),67,16,8,'#91e3d2');
 // First five collected memos fill in; total count above continues beyond five.
 for(let i=0;i<5;i++){rect(67+i*5,19,3,4,i<clues?'#91e3d2':'#43516a');if(i<clues)rect(68+i*5,20,1,2,'#fff3dc')}
 for(let i=0;i<MAX_LIFE;i++)heart(104+i*11,7,i<MAX_LIFE-hits);
 txt('SCORE '+score,6,23,6,'#dce4f5');txt('LIFE',105,23,6,'#dce4f5');
 goalProgress();
}
function syncControls(){
 const key=state+':'+paused+':'+ArySprites.ready();if(key===controlKey)return;controlKey=key;
 const playing=state==='play'||state==='finish',active=state==='play'&&!paused;
 $('#action').hidden=active||(state==='finish'&&!paused);
 $('#action').textContent=paused&&playing?'つづける':state==='story'?'結果を見る':state==='fail'||state==='result'?'もう一度遊ぶ':'スタート';
 $('#jump').hidden=!active;$('#slide').hidden=!active;$('#pause').hidden=!playing;
 $('#pause').textContent=paused?'▶':'Ⅱ';
 $('#pause').setAttribute('aria-label',paused?'ゲームを再開':'一時停止');
}
function render(alpha=1){
 drawLayer('background',()=>background(previous.scroll+(scroll-previous.scroll)*alpha));
 drawLayer('scenery',()=>stageScenery(previous.scroll+(scroll-previous.scroll)*alpha));
 drawLayer('items',()=>drawItems(alpha));
 drawLayer('cat',mysteryCat);
 drawLayer('power-effects',()=>playerEffects(previous.y+(p.y-previous.y)*alpha));
 drawLayer('avatar',()=>avatar(previous.y+(p.y-previous.y)*alpha));
drawLayer('feedback',pickupFeedback);drawLayer('hud',hud);syncControls();
if(state==='intro')overlay('STAGE 01 / 亀有',['商店街 → モール周辺 → 狛亀','謎の猫を追ってゴールへ！',clearRecord.cleared?'取材済み / BEST '+clearRecord.best:'全15面予定・まずは亀有から']);
if(state==='finish'){box(25,147,270,24);txt('狛亀に到着！',102,163,12,'#ffe18b')}
if(state==='story'){box(12,29,296,46);txt('亀有・狛亀  取材完了！',23,44,12,'#ffe18b');txt('アリィ「あの猫、金町の方へ行ったよ！」',23,61,9)}
if(state==='result')overlay('STAGE CLEAR',['SCORE '+score+'   ?CHIP '+coins,'MEMO '+clues+'  / 取材の記録','次の街：金町（準備中）']);
if(state==='fail')overlay('GAME OVER',['ライフがなくなりました。','SCORE '+score+'  ?CHIP '+coins,'もう一度、猫を追いかけよう！']);
if(paused&&(state==='play'||state==='finish'))overlay('PAUSE',['一時停止中','つづけるボタン / Escで再開'])}
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
 if(document.hidden&&(state==='play'||state==='finish'))paused=true;
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
  if((state==='play'||state==='finish')&&!paused&&ArySprites.ready()){
   acc+=delta;let n=0;
   while(acc>=1000/60&&n++<5&&(state==='play'||state==='finish')&&!paused){if(state==='finish')updateFinish();else update();acc-=1000/60}
  }else acc=0;
 }catch(error){reportError('update',error);paused=true;acc=0}
 // A broken item draw cannot skip the character or stop requestAnimationFrame.
 try{render(state==='play'&&!paused?Math.min(1,acc/(1000/60)):1)}catch(error){reportError('render',error)}
 if(runtimeError){rect(0,166,320,14,'#8b173b');txt('ERROR '+runtimeError.slice(0,42),4,176,8)}
}
// Read-only diagnostics for QA; no cheats or state setters in the shipped game.
window.aryDiagnostics=()=>({stage:{...STAGE,progress:stageProgress(),zone:stageZone(),planned:PLANNED_STAGES,finishAge,clearAwarded},state,tick,score,coins,clues,hits,damageTaken,paused,life:MAX_LIFE-hits,maxLife:MAX_LIFE,
 powers:{shield:Math.max(0,shieldUntil-tick),boost:Math.max(0,boostUntil-tick),hurt:Math.max(0,hurtUntil-tick),speedFactor},effects:particles.length,player:{...p},pose:ArySprites.pose(p,tick),assets:ArySprites.status(),runtimeError});
requestAnimationFrame(loop);
