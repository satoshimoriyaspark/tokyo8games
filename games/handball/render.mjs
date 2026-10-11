import {clamp} from './engine.mjs';
export const project=(x,y)=>({x:80+x*.8+(y-250)*.105,y:116+y*.565});
const TAU=Math.PI*2;
export function createSprites(images,canvasFactory){
 const atlases={};
 for(const [name,img] of Object.entries(images)){
  const frames={};for(const pose of ['idle','run','dribble','pass','shoot','feint','block','save','celebrate']){frames[pose]=[];for(let frame=0;frame<8;frame++){
   const c=canvasFactory(48,48),g=c.getContext('2d');g.imageSmoothingEnabled=false;const phase=frame/8*TAU,run=pose==='run'||pose==='dribble',bob=run?Math.round(Math.abs(Math.sin(phase))*2):pose==='idle'?Math.round(Math.sin(phase)*.5):0;
   const dark='#231f32',skin='#f9b98b',shade='#ba7257',uniform={ryuji:'#d93a43',hayato:'#287cda',gouta:'#289557',ren:'#f2e9ff'}[name],trim=name==='ren'?'#925bc4':'#fff3dc';
   const rect=(x,y,w,h,color)=>{g.fillStyle=color;g.fillRect(Math.round(x),Math.round(y),w,h);};
   function limb(points,color,width=4){g.lineCap='square';g.lineJoin='miter';for(const [w,col] of [[width+3,dark],[width,color]]){g.strokeStyle=col;g.lineWidth=w;g.beginPath();points.forEach(([x,y],i)=>i?g.lineTo(Math.round(x),Math.round(y)):g.moveTo(Math.round(x),Math.round(y)));g.stroke();}}
   const kick=run?Math.sin(phase)*7:0,hipY=32+bob,shoot=pose==='shoot',jump=shoot?Math.sin(frame/7*Math.PI)*4:0;
   let backLeg=[[22,hipY-jump],[21-kick*.7,36-jump],[20-kick,42-Math.max(0,kick*.6)-jump]],frontLeg=[[27,hipY-jump],[29+kick*.6,36-jump],[30+kick,42-Math.max(0,-kick*.6)-jump]];
   if(shoot){backLeg=[[23,32-jump],[18,36-jump],[14,34-jump]];frontLeg=[[27,32-jump],[32,35-jump],[30,41-jump]];}
   limb(backLeg,shade,4);rect(backLeg[2][0]-3,backLeg[2][1],8,4,dark);rect(backLeg[2][0]-2,backLeg[2][1],6,2,trim);
   let rearArm=[[19,25+bob-jump],[15+kick*.4,29+bob-jump],[13+kick*.8,26+bob-jump]];
   limb(rearArm,shade,4);
   rect(18,23+bob-jump,name==='gouta'?16:13,11,dark);rect(19,23+bob-jump,name==='gouta'?14:11,9,uniform);rect(19,24+bob-jump,3,6,trim);rect(20,32+bob-jump,12,4,dark);rect(21,32+bob-jump,4,2,uniform);
   limb(frontLeg,skin,4);rect(frontLeg[2][0]-2,frontLeg[2][1],9,4,dark);rect(frontLeg[2][0]-1,frontLeg[2][1],7,2,trim);
   // Retain the supplied 48px source head. Articulate limbs in a separate runtime layer.
   g.drawImage(img,13,2,26,23,13,bob-jump+2,26,23);
   let arm=[[30,25+bob-jump],[33-kick*.6,30+bob-jump],[36-kick*.9,27+bob-jump]];
   if(pose==='dribble')arm=[[30,25+bob],[35,29+bob],[40,29+Math.abs(Math.sin(phase))*6]];
   if(pose==='pass')arm=[[30,25+bob],[35,24-frame*.35],[40,22-frame*.15]];
   if(shoot)arm=frame<4?[[30,25-jump],[34,16-jump],[29,10-jump]]:[[30,25-jump],[37,20-jump],[42,19-jump]];
   if(pose==='block'||pose==='save'||pose==='celebrate'){arm=[[30,25],[37,20],[39,10]];limb([[19,25],[13,20],[11,10]],skin,4);}
   if(pose==='feint')arm=[[30,25],[34,29],[28,31]];
   limb(arm,skin,4);rect(arm[2][0]-2,arm[2][1]-2,5,5,skin);frames[pose].push(c);
  }}atlases[name]=frames;
 }return atlases;
}
export class Renderer{
 constructor(canvas,sprites){this.canvas=canvas;this.g=canvas.getContext('2d');this.sprites=sprites;this.g.imageSmoothingEnabled=false;}
 polygon(points,fill,stroke,width=2){const g=this.g;g.beginPath();points.forEach((p,i)=>i?g.lineTo(p.x,p.y):g.moveTo(p.x,p.y));g.closePath();if(fill){g.fillStyle=fill;g.fill();}if(stroke){g.strokeStyle=stroke;g.lineWidth=width;g.stroke();}}
 line(points,color,width=2){const g=this.g;g.beginPath();points.forEach((p,i)=>i?g.lineTo(p.x,p.y):g.moveTo(p.x,p.y));g.strokeStyle=color;g.lineWidth=width;g.stroke();}
 text(text,x,y,size=16,color='#fff',align='center'){const g=this.g;g.font=`900 ${size}px "Noto Sans JP", sans-serif`;g.textAlign=align;g.fillStyle=color;g.fillText(text,x,y);}
 field(match){const g=this.g;g.fillStyle='#091723';g.fillRect(0,0,960,540);g.fillStyle='#142c3e';g.fillRect(0,55,960,66);
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
 }
 goal(side){const g=this.g,x=side?1000:0,p1=project(x,180),p2=project(x,320),depth=side?25:-25;this.polygon([{x:p1.x,y:p1.y-55},{x:p2.x,y:p2.y-55},p2,p1],'#122639aa','#e4f5ec',3);this.polygon([{x:p1.x,y:p1.y-55},{x:p1.x+depth,y:p1.y-61},{x:p2.x+depth,y:p2.y-61},{x:p2.x,y:p2.y-55}],'#d3ddc122','#cce7df',1);for(let t=0;t<=1;t+=.2){const x=p1.x+(p2.x-p1.x)*t,y=p1.y+(p2.y-p1.y)*t;this.line([{x,y:y-54},{x,y}],'#abc5c180',1);}for(let y=10;y<55;y+=11)this.line([{x:p1.x,y:p1.y-y},{x:p2.x,y:p2.y-y}],'#abc5c180',1);for(let y=0;y<55;y+=12){g.fillStyle='#dc424b';g.fillRect(p2.x-2,p2.y-y-6,5,6);}}
 player(p,match,{x,y,scale=1.3,pose,frame,labels=true,face}={}){const g=this.g,point=x===undefined?project(p.x,p.y):{x,y};let animation=pose||p.pose,index=frame??Math.floor((p.poseTime>0?match.t:p.step)*11)%8;const atlas=this.sprites[match.teams[p.side].sprite],sprite=atlas?.[animation]?.[index]??atlas?.idle[0];g.fillStyle='#343b3b40';g.beginPath();g.ellipse(point.x,point.y+2,15*scale,4*scale,0,0,TAU);g.fill();
  if(p.id===match.selected&&labels){g.strokeStyle='#fff07a';g.lineWidth=2;g.beginPath();g.ellipse(point.x,point.y+3,20,7,0,0,TAU);g.stroke();this.text('▼',point.x,point.y-58,14,'#fff07a');}
  g.save();g.translate(Math.round(point.x),Math.round(point.y));g.scale(face??p.face,1);if(sprite)g.drawImage(sprite,-24*scale,-44*scale,48*scale,48*scale);if(p.slot===3){g.fillStyle='#ffd45b';g.fillRect(-4*scale,-20*scale,11*scale,8*scale);g.fillStyle='#352c41';g.fillRect(-3*scale,-18*scale,2*scale,3*scale);}g.restore();
  if(labels){const w=Math.max(44,p.name.length*10+10);g.fillStyle=p.side?'#102d4ecc':'#54252dcc';g.fillRect(point.x-w/2,point.y+8,w,15);this.text((p.roster===0?'★':'')+p.name,point.x,point.y+20,11,p.id===match.selected?'#fff29e':'#fff');}
 }
 ball(x,y,z=22,effect=null,size=7){const g=this.g,p=project(x,y);g.fillStyle='#1f26394a';g.beginPath();g.ellipse(p.x,p.y,6,2,0,0,TAU);g.fill();g.fillStyle=effect||'#ffcf66';g.strokeStyle='#63332c';g.lineWidth=2;g.beginPath();g.arc(p.x,p.y-z,size,0,TAU);g.fill();g.stroke();this.line([{x:p.x-size+1,y:p.y-z},{x:p.x+size-1,y:p.y-z}],'#9d5730',1);this.line([{x:p.x,y:p.y-z-size+1},{x:p.x,y:p.y-z+size-1}],'#9d5730',1);}
 draw(match,input={x:0,y:0}){this.field(match);const g=this.g,p=match.controlled;
  if(match.owner===p&&!match.scene&&!match.restartTimer){const target=match.passTarget(p,input);if(target){g.setLineDash([6,7]);this.line([project(p.x,p.y),project(target.x,target.y)],'#fffaaba0',2);g.setLineDash([]);const v=project(target.x,target.y);g.strokeStyle='#fce68a';g.lineWidth=2;g.beginPath();g.arc(v.x,v.y,24,0,TAU);g.stroke();}}
  for(const q of [...match.players].sort((a,b)=>a.y-b.y))this.player(q,match);
  if(match.ball.mode==='held'||match.ball.mode==='pass')this.ball(match.ball.x,match.ball.y,match.ball.z);
  if(match.charging){const v=project(p.x,p.y);g.fillStyle='#112c3b';g.fillRect(v.x-24,v.y-74,48,6);g.fillStyle=match.gauge[0]>=100&&p.roster===0?'#fca1ee':'#ffda61';g.fillRect(v.x-24,v.y-74,48*clamp(match.charge/1.2,0,1),6);}
  if(match.scene)this.shotScene(match);
  if(match.restartTimer>0){g.fillStyle='#0a132877';g.fillRect(0,140,960,174);this.text('GOAL!',480,260,76,'#fff1a5');this.text(match.message,480,299,22,'#fff');}
 }
 shotScene(match){const g=this.g,s=match.scene,k=match.players[s.keeper],p=match.players[s.shooter],progress=clamp(s.t/s.duration,0,1),color=match.teams[s.side].color;g.fillStyle='#071422';g.fillRect(0,74,960,340);
  for(let i=0;i<23;i++){let y=90+i*14,x=((i*147-progress*760)%1100+1100)%1100;this.line([{x:x-240,y:y+45},{x,y}],s.special?color+'80':'#38617f',i%3?2:4);}
  g.fillStyle='#ae7b47';g.fillRect(0,344,960,70);g.fillStyle='#e8c790';g.fillRect(0,345,960,3);this.text(s.special?s.type:s.type+'シュート',480,117,s.special?34:25,s.special?'#ffe09c':'#e5f7ff');
  const jump=Math.sin(clamp(progress/.65,0,1)*Math.PI)*58;this.player(p,match,{x:236+progress*25,y:334-jump,scale:2.6,pose:'shoot',frame:Math.min(7,Math.floor(progress*10)),labels:false,face:1});
  const gy=340,top=179;g.fillStyle='#bce5f712';g.fillRect(778,top,106,gy-top);for(let x=778;x<890;x+=18)this.line([{x,y:top},{x,y:gy}],'#c2dce355',1);for(let y=top;y<gy;y+=16)this.line([{x:778,y},{x:884,y}],'#c2dce355',1);g.strokeStyle='#f9f5dd';g.lineWidth=8;g.strokeRect(778,top,106,gy-top);for(let y=top;y<gy;y+=28){g.fillStyle='#f3525b';g.fillRect(774,y,8,13);}
  const flight=clamp((progress-.25)/.7,0,1),high=(s.aimY-182)/136,saveJump=(1-high)*65*Math.sin(flight*Math.PI/2);this.player(k,match,{x:744-(s.outcome==='save'?flight*20:0),y:340-saveJump,scale:2.7,pose:'save',frame:Math.floor(progress*7),labels:false,face:-1});
  if(progress>.22){let bx=287+flight*(s.outcome==='save'?441:s.outcome==='block'?240:575),by=235+(high*94-13)*flight-(s.type==='ループ'?Math.sin(flight*Math.PI)*60:0);if(s.outcome==='miss')by-=flight*110;for(let i=7;i>=1;i--){g.fillStyle=s.special?color+(20+i*7).toString(16).padStart(2,'0'):'#fff1a52a';g.fillRect(bx-i*13,by-6,13,12);}g.fillStyle='#ffd974';g.strokeStyle='#7a3a2e';g.lineWidth=3;g.beginPath();g.arc(bx,by,10,0,TAU);g.fill();g.stroke();if(s.special&&match.teams[s.side].effect==='lightning')this.line([{x:bx-80,y:by+5},{x:bx-42,y:by-23},{x:bx-55,y:by+3},{x:bx,y:by-12}],'#e4f9ff',4);if(s.special&&match.teams[s.side].effect==='mirage'){g.fillStyle='#d8b6ff66';for(const off of [-27,27]){g.beginPath();g.arc(bx-18,by+off,8,0,TAU);g.fill();}}if(s.special&&match.teams[s.side].effect==='meteor'){g.strokeStyle='#89f599';g.lineWidth=4;g.strokeRect(bx-14,by-14,28,28);}if(s.special&&match.teams[s.side].effect==='fire')this.polygon([{x:bx-9,y:by-11},{x:bx-47,y:by-24},{x:bx-34,y:by-4},{x:bx-62,y:by+10},{x:bx-8,y:by+12}],'#ff733e');}
  this.text(s.special?'エースの一撃！':'狙ったコースへ！',480,390,15,'#b8d2e2');
 }
}
