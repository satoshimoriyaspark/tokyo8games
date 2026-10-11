import {clamp} from './engine.mjs';
import {COURSES} from './commands.mjs';
export const project=(x,y)=>({x:80+x*.8+(y-250)*.105,y:158+y*.455});
const TAU=Math.PI*2;
// Every frame is a complete, unchanged 48×48 crop from the supplied PNG.
export function createSprites(images,canvasFactory,manifest){
 const atlases={};
 for(const [name,img] of Object.entries(images)){
  const meta=manifest[name],frames={};
  for(const [pose,animation] of Object.entries(meta.animations)){
   frames[pose]=[];
   for(let i=0;i<animation.count;i++){
    const frame=animation.start+i,c=canvasFactory(meta.frameWidth,meta.frameHeight),g=c.getContext('2d');g.imageSmoothingEnabled=false;
    g.drawImage(img,(frame%meta.columns)*meta.frameWidth,Math.floor(frame/meta.columns)*meta.frameHeight,meta.frameWidth,meta.frameHeight,0,0,meta.frameWidth,meta.frameHeight);frames[pose].push(c);
   }
   frames[pose].fps=animation.fps;
  }
  // The source has no dedicated keeper / feint sheets. Reuse whole source poses.
  frames.feint=frames.run;frames.block=frames.celebrate;frames.save=frames.celebrate;
  atlases[name]=frames;
 }
 return atlases;
}
export class Renderer{
 constructor(canvas,sprites,canvasFactory=null){this.background=canvasFactory?.(960,540);this.backgroundKey=null;this.canvas=canvas;this.g=canvas.getContext('2d');this.sprites=sprites;this.g.imageSmoothingEnabled=false;}
 polygon(points,fill,stroke,width=2){const g=this.g;g.beginPath();points.forEach((p,i)=>i?g.lineTo(p.x,p.y):g.moveTo(p.x,p.y));g.closePath();if(fill){g.fillStyle=fill;g.fill();}if(stroke){g.strokeStyle=stroke;g.lineWidth=width;g.stroke();}}
 line(points,color,width=2){const g=this.g;g.beginPath();points.forEach((p,i)=>i?g.lineTo(p.x,p.y):g.moveTo(p.x,p.y));g.strokeStyle=color;g.lineWidth=width;g.stroke();}
 text(text,x,y,size=16,color='#fff',align='center'){const g=this.g;g.font=`900 ${size}px "Noto Sans JP", sans-serif`;g.textAlign=align;g.fillStyle=color;g.fillText(text,x,y);}
 field(match){const g=this.g,key=match.teams.map(t=>t.id).join(':');if(this.background&&this.backgroundKey===key){g.drawImage(this.background,0,0);return;}g.fillStyle='#091723';g.fillRect(0,0,960,540);g.fillStyle='#142c3e';g.fillRect(0,55,960,66);
  for(let row=0;row<3;row++)for(let i=0;i<55;i++){const x=i*19+(row%2)*8,y=68+row*17,v=(i*17+row*9)%7;g.fillStyle=['#546378','#394859','#465873','#725955','#4b6980','#485964','#777065'][v];g.fillRect(x,y,7,6);g.fillStyle=i%3===0?match.teams[0].dark:i%3===1?match.teams[1].dark:'#243b50';g.fillRect(x-2,y+6,11,7);}
  g.fillStyle='#203e53';g.fillRect(0,108,960,17);this.text('TOKYO 8 GAMES   /   HIGH SCHOOL HANDBALL',480,120,10,'#a4bdc9');
  this.polygon([project(0,0),project(1000,0),project(1000,500),project(0,500)],'#dba762','#fff0c6',3);
  for(let x=0;x<1000;x+=40)this.polygon([project(x,0),project(x+20,0),project(x+20,500),project(x,500)],'#dfaE6d');
  for(let y=50;y<500;y+=50)this.line([project(0,y),project(1000,y)],'#c18a4e',.8);
  const area=(side,r,fill)=>{const points=[project(side?1000:0,250-r)];for(let t=-Math.PI/2;t<=Math.PI/2+.02;t+=.04)points.push(project(side?1000-Math.cos(t)*r*.86:Math.cos(t)*r*.86,250+Math.sin(t)*r));points.push(project(side?1000:0,250+r));this.polygon(points,fill,'#fff4d8',2);};
  area(0,175,'#5d94a7');area(1,175,'#5d94a7');g.setLineDash([7,6]);area(0,220,null);area(1,220,null);g.setLineDash([]);
  this.line([project(500,0),project(500,500)],'#fff4d8',2);const center=project(500,250);g.strokeStyle='#fff4d8';g.lineWidth=2;g.beginPath();g.ellipse(center.x,center.y,47,33,0,0,TAU);g.stroke();
  this.text('熱血',center.x,center.y+4,22,'#ba854a');
  this.goal(0);this.goal(1);
  g.fillStyle='#071624';g.fillRect(0,414,960,126);g.fillStyle='#244358';g.fillRect(0,414,960,2);
  if(this.background){this.background.getContext('2d').drawImage(this.canvas,0,0);this.backgroundKey=key;}
 }
 goal(side){const g=this.g,x=side?1000:0,p1=project(x,180),p2=project(x,320),depth=side?25:-25;this.polygon([{x:p1.x,y:p1.y-55},{x:p2.x,y:p2.y-55},p2,p1],'#122639aa','#e4f5ec',3);this.polygon([{x:p1.x,y:p1.y-55},{x:p1.x+depth,y:p1.y-61},{x:p2.x+depth,y:p2.y-61},{x:p2.x,y:p2.y-55}],'#d3ddc122','#cce7df',1);for(let t=0;t<=1;t+=.2){const x=p1.x+(p2.x-p1.x)*t,y=p1.y+(p2.y-p1.y)*t;this.line([{x,y:y-54},{x,y}],'#abc5c180',1);}for(let y=10;y<55;y+=11)this.line([{x:p1.x,y:p1.y-y},{x:p2.x,y:p2.y-y}],'#abc5c180',1);for(let y=0;y<55;y+=12){g.fillStyle='#dc424b';g.fillRect(p2.x-2,p2.y-y-6,5,6);}}
 player(p,match,{x,y,scale=1.3,pose,frame,labels=true,face}={}){const g=this.g,point=x===undefined?project(p.x,p.y):{x,y};
  const animation=pose||p.pose,atlas=this.sprites[match.teams[p.side].sprite],frames=atlas?.[animation]||atlas?.idle;
  let index=frame??Math.floor((animation==='run'?p.step:match.t)*(frames?.fps||7));
  if(frame===undefined&&animation==='pass'&&p.poseTime>0)index=Math.floor((.5-p.poseTime)/.5*frames.length);
  const sprite=frames?.[((index%frames.length)+frames.length)%frames.length];
  g.fillStyle='#343b3b40';g.beginPath();g.ellipse(point.x,point.y+2,15*scale,4*scale,0,0,TAU);g.fill();
  if(p.id===match.selected&&labels){g.strokeStyle='#fff07a';g.lineWidth=2;g.beginPath();g.ellipse(point.x,point.y+3,20,7,0,0,TAU);g.stroke();this.text('▼',point.x,point.y-58,14,'#fff07a');}
  g.save();g.translate(Math.round(point.x),Math.round(point.y));g.scale(face??p.face,1);if(sprite)g.drawImage(sprite,-24*scale,-44*scale,48*scale,48*scale);g.restore();
  if(labels){const label=(p.slot===3?'GK ':p.roster===0?'★':'')+p.name,w=Math.max(44,label.length*10+10);g.fillStyle=p.side?'#102d4ecc':'#54252dcc';g.fillRect(point.x-w/2,point.y+8,w,15);this.text(label,point.x,point.y+20,11,p.id===match.selected?'#fff29e':'#fff');}
 }
 ball(x,y,z=22,effect=null,size=7){const g=this.g,p=project(x,y);g.fillStyle='#1f26394a';g.beginPath();g.ellipse(p.x,p.y,6,2,0,0,TAU);g.fill();g.fillStyle=effect||'#ffcf66';g.strokeStyle='#63332c';g.lineWidth=2;g.beginPath();g.arc(p.x,p.y-z,size,0,TAU);g.fill();g.stroke();this.line([{x:p.x-size+1,y:p.y-z},{x:p.x+size-1,y:p.y-z}],'#9d5730',1);this.line([{x:p.x,y:p.y-z-size+1},{x:p.x,y:p.y-z+size-1}],'#9d5730',1);}
 draw(match){
  this.field(match);const g=this.g;
  const defenders=match.field(1-match.possession).sort((a,b)=>a.y-b.y);
  this.line(defenders.map(q=>project(q.x,q.y)),'#b9e0ef99',3);
  if(match.owner&&!match.scene&&!match.choice&&match.attacking){const target=match.passTarget();if(target){g.setLineDash([5,6]);this.line([project(match.owner.x,match.owner.y),project(target.x,target.y)],'#fff0a488',2);g.setLineDash([]);}}
  if(match.orb){const q=match.players[match.orb.side*4+match.orb.slot],v=project(q.x,q.y),pulse=1+Math.sin(match.t*6)*.12;g.save();g.shadowColor='#89ffec';g.shadowBlur=22;g.fillStyle='#9affed';g.beginPath();g.arc(v.x+29,v.y-22,9*pulse,0,TAU);g.fill();g.restore();this.text('連携玉',v.x+28,v.y-42,10,'#dcfff1');}
  for(const q of [...match.players].sort((a,b)=>a.y-b.y))this.player(q,match,{scale:1.15});
  if(match.ball.mode==='pass'&&match.ball.elapsed>=match.ball.windup)this.ball(match.ball.x,match.ball.y,match.ball.z);
  const s=match.scene;
  if(s?.kind==='shot'){this.shotScene(match);return;}
  if(s?.kind==='link'){
   const points=s.path.map(id=>project(match.players[id].x,match.players[id].y));g.save();g.shadowColor='#77fff3';g.shadowBlur=18;this.line([...points,points[0]],'#8cffee',4);g.restore();
   this.banner('トライアングル・ラッシュ！','特殊連携で、次の一撃を強化','#b4fff0');
  }else if(s?.kind==='rush'){
   for(const q of match.field(match.possession)){const v=project(q.x,q.y),dir=match.possession?-1:1;this.line([{x:v.x-dir*90,y:v.y-18},{x:v.x-dir*28,y:v.y-18}],'#fff0a699',3);}
   this.banner('速攻！','相手が戻る前にシュートチャンス！','#ffe49a');
  }else if(s?.kind==='stop')this.banner(s.stopType==='cut'?'CUT！ パスを奪った！':'BLOCK！ シュートを止めた！','タイミング一致 → 攻守交代','#b1edff');
  else if(s?.kind==='set')this.banner('遅攻','センターから。守備陣形を整えて勝負！','#ffe7aa');
  else if(s?.kind==='stay')this.banner('STAY！ 攻撃継続','センターから組み直し、次の一撃を強化','#b7f8e2');
 }
 banner(title,detail,color){const g=this.g;g.fillStyle='#071c36df';g.fillRect(170,222,620,72);this.text(title,480,252,26,color);this.text(detail,480,278,14,'#e7f2f8');}
 shotScene(match){const g=this.g,s=match.scene,k=match.players[s.keeper],p=match.players[s.shooter],progress=clamp(s.t/s.duration,0,1),color=match.teams[s.side].color;
  g.fillStyle='#071422';g.fillRect(0,74,960,340);
  for(let i=0;i<23;i++){const y=90+i*14,x=((i*147-progress*760)%1100+1100)%1100;this.line([{x:x-240,y:y+45},{x,y}],s.special?color+'80':'#38617f',i%3?2:4);}
  g.fillStyle='#ae7b47';g.fillRect(0,344,960,70);g.fillStyle='#e8c790';g.fillRect(0,345,960,3);this.text(s.type,480,111,s.special?32:25,s.special?'#ffe09c':'#e5f7ff');
  const flight=clamp((progress-.48)/.48,0,1),windup=clamp(progress/.48,0,1),jump=Math.sin(windup*Math.PI)*42;
  this.player(p,match,{x:236,y:334-jump,scale:2.6,pose:progress<.48?'shoot':'idle',frame:progress<.48?Math.min(7,Math.floor(windup*8)):0,labels:false,face:1});
  const gy=340,top=179;g.fillStyle='#bce5f712';g.fillRect(778,top,106,gy-top);for(let x=778;x<890;x+=18)this.line([{x,y:top},{x,y:gy}],'#c2dce355',1);for(let y=top;y<gy;y+=16)this.line([{x:778,y},{x:884,y}],'#c2dce355',1);g.strokeStyle='#f9f5dd';g.lineWidth=8;g.strokeRect(778,top,106,gy-top);
  for(let y=top;y<gy;y+=28){g.fillStyle='#f3525b';g.fillRect(774,y,8,13);}
  const keeperCol=COURSES.find(c=>c.id===s.keeperChoice)?.col??s.col,chosen=s.keeperChoice==='nutmeg'?1:0,keeperY=340-(chosen===0?58:8)*Math.sin(flight*Math.PI/2),failed=s.outcome==='goal'&&flight>.75;
  this.player(k,match,{x:738+flight*(keeperCol*23-13),y:keeperY,scale:2.7,pose:failed?'down':flight>.1?'save':'idle',frame:Math.floor(flight*3),labels:false,face:-1});
  if(progress>=.48){
   const endX=s.outcome==='goal'?820+s.col*15:725,endY=s.row===0?205:306;
   let bx=287+flight*(endX-287),by=228+flight*(endY-228);
   if(s.route?.includes('バウンド'))by+=Math.sin(flight*Math.PI)*55;
   if(s.route==='浮かせる')by-=Math.sin(flight*Math.PI)*48;
   if(s.outcome==='parry'&&flight>.78){bx-=170*(flight-.78)/.22;by-=Math.sin((flight-.78)/.22*Math.PI)*55;}
   if(s.outcome!=='catch'||flight<.93){for(let i=7;i>=1;i--){g.fillStyle=s.special?color+(20+i*7).toString(16).padStart(2,'0'):'#fff1a52a';g.fillRect(bx-i*13,by-6,13,12);}g.fillStyle='#ffd974';g.strokeStyle='#7a3a2e';g.lineWidth=3;g.beginPath();g.arc(bx,by,10,0,TAU);g.fill();g.stroke();
    if(s.special&&match.teams[s.side].effect==='lightning')this.line([{x:bx-80,y:by+5},{x:bx-42,y:by-23},{x:bx-55,y:by+3},{x:bx,y:by-12}],'#e4f9ff',4);
    if(s.special&&match.teams[s.side].effect==='mirage'){g.fillStyle='#d8b6ff66';for(const off of [-27,27]){g.beginPath();g.arc(bx-18,by+off,8,0,TAU);g.fill();}}
    if(s.special&&match.teams[s.side].effect==='meteor'){g.strokeStyle='#89f599';g.lineWidth=4;g.strokeRect(bx-14,by-14,28,28);}
    if(s.special&&match.teams[s.side].effect==='fire')this.polygon([{x:bx-9,y:by-11},{x:bx-47,y:by-24},{x:bx-34,y:by-4},{x:bx-62,y:by+10},{x:bx-8,y:by+12}],'#ff733e');
   }
  }
  const course=COURSES.find(c=>c.id===s.courseId)?.label||'';
  this.text(progress>.88?({goal:'GOAL！',catch:'キャッチ！ 速攻！',parry:'ストップ！ 攻守交代！'}[s.outcome]):course+'へ！'+(s.counter?' 速攻ボーナス':s.chain?' 特殊連携ボーナス':''),480,390,19,'#ffe3a0');
 }
}
