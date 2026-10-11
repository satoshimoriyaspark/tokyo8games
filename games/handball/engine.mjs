import {TEAMS,SHOTS} from './data.mjs';
export const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const dist=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y);
export function segmentDistance(p,a,b){let dx=b.x-a.x,dy=b.y-a.y,t=clamp(((p.x-a.x)*dx+(p.y-a.y)*dy)/(dx*dx+dy*dy||1),0,1);return Math.hypot(p.x-a.x-dx*t,p.y-a.y-dy*t);}
export class Match {
 constructor(home=0,away=1,{random=Math.random,duration=180,autoplay=false,shortScenes=false}={}){
  this.teams=[TEAMS[home],TEAMS[away]];this.random=random;this.time=duration;this.autoplay=autoplay;this.shortScenes=shortScenes;this.score=[0,0];this.gauge=[25,25];this.passes=[0,0];this.shots=[0,0];this.saves=[0,0];this.steals=[0,0];this.t=0;this.state='playing';this.scene=null;this.paused=false;this.combo=0;this.comboTime=0;this.charge=0;this.charging=false;this.shotType=0;this.selected=0;this.ball={mode:'held',x:0,y:0,z:0};this.events=[];this.restartTimer=0;this.aiTimer=.7;
  this.players=[];for(let side=0;side<2;side++)for(const [slot,roster] of [0,1,2,6].entries())this.players.push({...this.teams[side].players[roster],side,slot,roster,id:side*4+slot,x:0,y:0,vx:0,vy:0,face:side? -1:1,pose:'idle',poseTime:0,step:0,cooldown:0,protect:0,block:0,cut:0,runTo:0});
  this.kickoff(0);this.notify('仲間につないで、ゴールへ！');
 }
 get controlled(){return this.players[this.selected];}
 get owner(){return this.players[this.ownerId]??null;}
 get attacking(){return this.owner?.side===0 || this.ball.mode==='pass'&&this.ball.side===0;}
 notify(text){this.message=text;this.messageTime=2.5;this.events.push(text);if(this.events.length>12)this.events.shift();}
 field(side){return this.players.filter(p=>p.side===side&&p.slot<3);}
 keeper(side){return this.players[side*4+3];}
 setOwner(p){const prev=this.possession;if(prev!==p.side){this.combo=0;this.comboTime=0;}this.possession=p.side;this.ownerId=p.id;this.ball.mode='held';this.ball.target=null;p.protect=.6;if(p.side===0&&p.slot<3)this.selected=p.id;this.aiTimer=.65;}
 kickoff(side){for(const p of this.players){let x=p.slot===3?38:410-p.slot*70;let y=p.slot===3?250:[250,105,395][p.slot];p.x=p.side?1000-x:x;p.y=y;p.vx=p.vy=0;p.block=p.cut=p.protect=0;p.pose='idle';}this.setOwner(this.players[side*4]);this.selected=0;this.combo=0;this.charging=false;this.charge=0;}
 move(p,dx,dy,dt,speedScale=1){const length=Math.hypot(dx,dy),speed=(128+p.stats[0]*21)*speedScale;if(length>.04){const k=length>1?1/length:1;p.vx=dx*k*speed;p.vy=dy*k*speed;p.x+=p.vx*dt;p.y+=p.vy*dt;p.face=Math.abs(dx)>.08?Math.sign(dx):p.face;p.step+=dt*(speed/205);if(p.poseTime<=0)p.pose=p===this.owner?'dribble':'run';}else{p.vx=p.vy=0;if(p.poseTime<=0)p.pose='idle';}p.x=clamp(p.x,25,975);p.y=clamp(p.y,30,470);if(p.slot<3){const arc=155*Math.sqrt(Math.max(0,1-((p.y-250)/175)**2));p.x=clamp(p.x,25+arc,975-arc);}}
 towards(p,x,y,dt,scale=1){let dx=x-p.x,dy=y-p.y,m=Math.hypot(dx,dy);if(m<8)return this.move(p,0,0,dt);this.move(p,dx/m,dy/m,Math.min(dt,m/250),scale);}
 switchPlayer(dir=1){if(this.scene||this.state!=='playing')return;const f=this.field(0);this.selected=f[(this.controlled.slot+(dir<0?2:1))%3].id;this.charging=false;this.charge=0;}
 passTarget(from,input={x:0,y:0}){const dir=from.side?-1:1;return this.field(from.side).filter(p=>p!==from).sort((a,b)=>{const value=p=>{const d=dist(from,p);let aim=Math.hypot(input.x,input.y)>.2?((p.x-from.x)*input.x+(p.y-from.y)*input.y)/(d||1)*250:dir*(p.x-from.x)*.65;let lane=Math.min(...this.field(1-from.side).map(q=>segmentDistance(q,from,p)));return aim+lane*.8-d*.18;};return value(b)-value(a);})[0];}
 pass(from=this.controlled,input={x:0,y:0},link=false){if(this.scene||this.state!=='playing'||this.owner!==from)return false;const target=this.passTarget(from,input);if(!target)return false;this.ownerId=null;this.charging=false;this.charge=0;from.pose='pass';from.poseTime=.34;from.runTo=link?1.6:0;this.ball={mode:'pass',x:from.x+from.face*17,y:from.y,z:23,from:from.id,target:target.id,side:from.side,elapsed:0,ttl:2.2};this.notify(link?'ワンツー！ 走り込め！':'パス！ '+from.name+' → '+target.name);return true;}
 pressShoot(){if(this.scene||this.state!=='playing'||this.paused)return;if(this.owner===this.controlled){this.charging=true;this.charge=0;}else this.defend('block');}
 releaseShoot(input={x:0,y:0}){if(this.charging){this.charging=false;this.shoot(this.controlled,this.charge,input);this.charge=0;}}
 defend(type){let p=this.controlled;if(p.side===this.owner?.side||p.cooldown>0||this.scene)return false;p.cooldown=type==='steal'?.8:.45;p.pose=type==='block'?'block':'pass';p.poseTime=.4;if(type==='block'){p.block=.9;this.notify('ブロック！ シュートコースをふさげ');}if(type==='cut'){p.cut=.85;this.notify('パスカット！');}if(type==='steal'){const target=this.owner;if(target&&target.slot<3&&target.protect<=0&&dist(p,target)<78&&this.random()<.52+p.stats[4]*.065){this.setOwner(p);this.steals[0]++;this.gauge[0]=clamp(this.gauge[0]+12,0,100);this.notify('スティール成功！ 速攻だ！');}else this.notify('相手に近づいてスティール！');}return true;}
 feint(input={x:0,y:0}){const p=this.controlled;if(this.owner!==p)return this.defend('steal');if(p.cooldown>0||this.scene)return false;p.cooldown=1.2;p.protect=.8;p.pose='feint';p.poseTime=.32;this.move(p,p.face,input.y||((p.y>250)?-1:1),.16,1.6);this.notify('フェイント！');return true;}
 actionA(input){if(this.owner===this.controlled)this.pass(this.controlled,input);else this.defend('cut');}
 link(input){if(this.scene)return;if(this.owner===this.controlled)this.pass(this.controlled,input,true);else{this.teamPress=1.3;this.notify('チーム守備！ 仲間と挟み込め！');}}
 shoot(p,charge=0,input={x:0,y:0}){
  if(this.owner!==p||this.scene||this.state!=='playing'||p.slot===3)return false;
  const side=p.side,dir=side?-1:1,gx=side?25:975,keeper=this.keeper(1-side),distance=Math.abs(gx-p.x),angle=Math.abs(p.y-250)/250,special=p.roster===0&&this.gauge[side]>=100&&charge>=.55,type=special?this.teams[side].special:(charge<.15?'通常':SHOTS[this.shotType]);
  let aimY=250+(Math.abs(input.y)>.1?input.y*64:(this.random()-.5)*105);aimY=clamp(aimY,182,318);
  const defenders=this.field(1-side).filter(q=>dir*(q.x-p.x)>0&&Math.abs(q.x-p.x)<230&&segmentDistance(q,p,{x:gx,y:aimY})<(q.block>0?78:27));
  let blockChance=defenders.reduce((n,q)=>n+(q.block>0?.37:.07)+q.stats[4]*.018,0);if(special)blockChance*=.4;
  let accuracy=clamp(.91-distance*.00062-angle*.15+p.stats[2]*.022+Math.min(charge,1.2)*.07,.26,.98);
  const reach=Math.abs(aimY-keeper.y),reaction=keeper.stats[0]*.02,quality=keeper.stats[4]*.04;
  let saveChance=clamp(.26+quality+reaction+distance*.00044-p.stats[2]*.046-Math.min(charge,1.2)*.08-this.combo*.045-reach*.0011,.1,.78);
  if(type==='ループ'&&Math.abs(keeper.x-gx)>35)saveChance-=.1;
  if(type==='サイド')blockChance*=.7;
  if(special){saveChance-=.19;if(this.teams[side].effect==='mirage')saveChance-=.045;this.gauge[side]=0;}
  const outcome=this.random()<blockChance?'block':this.random()>accuracy?'miss':this.random()<clamp(saveChance,.05,.85)?'save':'goal';
  this.ownerId=null;this.ball.mode='shot';p.pose='shoot';p.poseTime=.65;this.shots[side]++;this.gauge[side]=clamp(this.gauge[side]+(special?0:8),0,100);
  this.scene={t:0,duration:this.shortScenes?(special?.75:.27):(special?1.5:.55),side,shooter:p.id,keeper:keeper.id,fromX:p.x,fromY:p.y,aimY,type,special,outcome};this.combo=0;this.comboTime=0;this.charging=false;return true;
 }
 finishShot(){const s=this.scene,keeper=this.players[s.keeper];this.scene=null;this.charging=false;this.charge=0;
  if(s.outcome==='goal'){this.score[s.side]++;this.gauge[s.side]=clamp(this.gauge[s.side]+20,0,100);this.gauge[1-s.side]=clamp(this.gauge[1-s.side]+10,0,100);this.notify('GOAL！ '+this.players[s.shooter].name);this.players[s.shooter].pose='celebrate';this.players[s.shooter].poseTime=.85;this.restartSide=1-s.side;this.restartTimer=1;this.ball.mode='dead';}
  else{if(s.outcome==='save'){this.saves[keeper.side]++;this.gauge[keeper.side]=clamp(this.gauge[keeper.side]+14,0,100);this.notify(keeper.name+' がセーブ！');keeper.pose='save';keeper.poseTime=.55;}else this.notify(s.outcome==='block'?'ディフェンスがブロック！':'惜しい！ ゴールの外へ');this.setOwner(keeper);this.aiTimer=.6;}
 }
 tick(dt,input={x:0,y:0}){
  if(this.paused||this.state!=='playing')return;dt=clamp(dt,0,.05);this.t+=dt;this.messageTime=Math.max(0,this.messageTime-dt);
  for(const p of this.players){for(const k of ['cooldown','protect','block','cut','poseTime','runTo'])p[k]=Math.max(0,p[k]-dt);if(p.poseTime===0&&['pass','shoot','feint','celebrate','block','save'].includes(p.pose))p.pose='idle';}
  if(this.scene){const s=this.scene;s.t+=dt;const k=this.players[s.keeper];k.y+=(s.aimY-k.y)*Math.min(1,dt*(3+k.stats[0]));k.pose='save';k.step+=dt;if(s.t>=s.duration)this.finishShot();return;}
  if(this.restartTimer>0){this.restartTimer-=dt;if(this.restartTimer<=0)this.kickoff(this.restartSide);return;}
  this.time=Math.max(0,this.time-dt);if(this.time===0){this.state='finished';this.charging=false;return;}
  this.comboTime-=dt;if(this.comboTime<=0)this.combo=0;
  this.teamPress=Math.max(0,(this.teamPress||0)-dt);if(this.charging)this.charge=Math.min(1.4,this.charge+dt);
  for(const p of this.players){if(p.slot===3){if(this.owner===p){this.aiTimer-=dt;if(this.aiTimer<=0)this.pass(p);}else{const target=clamp(250+((this.owner?.y??this.ball.y)-250)*.5,186,314);p.y+=(target-p.y)*Math.min(1,dt*(2+p.stats[0]*.25));p.step+=dt;}continue;}
   if(p.id===this.selected&&!this.autoplay){this.move(p,input.x,input.y,dt,this.charging?.68:1);continue;}
   this.updateAI(p,dt);
  }
  // Prevent players occupying the same point; goal-area constraints are reapplied.
  const f=this.players.filter(p=>p.slot<3);for(let i=0;i<f.length;i++)for(let j=i+1;j<f.length;j++){const a=f[i],b=f[j],d=dist(a,b);if(d<27&&d>.01){const push=(27-d)*.32,dx=(a.x-b.x)/d,dy=(a.y-b.y)/d;a.x+=dx*push;a.y+=dy*push;b.x-=dx*push;b.y-=dy*push;}}
  if(this.ball.mode==='pass')this.updatePass(dt);
  if(this.owner){const p=this.owner;this.ball.x=p.x+p.face*19;this.ball.y=p.y;this.ball.z=Math.abs(p.vx)+Math.abs(p.vy)>20?8+Math.abs(Math.cos(p.step*9*Math.PI))*22:24;}
 }
 updatePass(dt){const b=this.ball,target=this.players[b.target];b.elapsed+=dt;b.ttl-=dt;const speed=560+this.players[b.from].stats[1]*35,dx=target.x-b.x,dy=target.y-b.y,m=Math.hypot(dx,dy),old={x:b.x,y:b.y};let length=Math.min(m,speed*dt);b.x+=dx/(m||1)*length;b.y+=dy/(m||1)*length;b.z=20+Math.sin(Math.min(1,b.elapsed/.5)*Math.PI)*15;
  const intercept=this.field(1-b.side).find(q=>segmentDistance(q,old,b)<(q.cut>0?65:20)&&b.elapsed>.075);
  if(intercept){this.setOwner(intercept);this.steals[intercept.side]++;this.gauge[intercept.side]=clamp(this.gauge[intercept.side]+10,0,100);this.notify('パスカット！ '+intercept.name);return;}
  if(m<speed*dt+10){this.setOwner(target);this.combo=Math.min(3,this.combo+1);this.comboTime=7;this.passes[target.side]++;this.gauge[target.side]=clamp(this.gauge[target.side]+15,0,100);this.notify('ナイスパス！ 連携 '+this.combo);}
  else if(b.ttl<=0){let nearest=this.players.reduce((a,p)=>dist(p,b)<dist(a,b)?p:a);this.setOwner(nearest);this.notify('ルーズボール！');}
 }
 updateAI(p,dt){const dir=p.side?-1:1,owner=this.owner,side=owner?.side??this.ball.side??this.possession,attack=side===p.side;
  if(owner===p){this.aiTimer-=dt;const gx=p.side?25:975,goalDistance=Math.abs(gx-p.x),near=Math.min(...this.field(1-p.side).map(q=>dist(q,p)));this.towards(p,gx-dir*160,250+Math.sin(this.t*.8+p.id)*70,dt,.87);
   if(this.aiTimer<=0){if(goalDistance<340&&(Math.abs(p.y-250)<150)){this.shoot(p,this.gauge[p.side]>=100?.9:.45,{x:dir,y:this.random()>.5?.8:-.8});this.aiTimer=.8;}else if(near<120||this.random()<.23){this.pass(p,{x:dir,y:0});this.aiTimer=1.1;}else this.aiTimer=.6;}return;
  }
  if(attack){const ox=owner?.x??this.ball.x;let tx=clamp(ox+dir*(p.runTo>0?195:110+(p.slot===0?25:0)),205,795),ty=p.slot===1?112:p.slot===2?388:250;if(owner?.slot===3)tx=p.side?645:355;if(this.ball.mode==='pass'&&this.ball.target===p.id)tx=p.x;this.towards(p,tx,ty,dt,.89);return;}
  const target=owner??this.ball;const defenders=this.field(p.side);const closest=defenders.reduce((a,q)=>dist(q,target)<dist(a,target)?q:a);if(p===closest||(this.teamPress>0&&p.side===0)){this.towards(p,target.x-dir*20,target.y,dt,p.side===1?.84:.89);
   if(owner&&owner.slot<3&&owner.protect<=0&&dist(p,owner)<48&&p.cooldown<=0){p.cooldown=.85;if(p.id!==this.selected||this.autoplay){if(this.random()<.27+p.stats[4]*.055){this.setOwner(p);this.steals[p.side]++;this.gauge[p.side]=clamp(this.gauge[p.side]+10,0,100);this.notify(p.name+' がボール奪取！');}}}
  }else{const opponent=this.field(1-p.side)[p.slot];this.towards(p,clamp((target.x+opponent.x)*.5-dir*100,170,830),opponent.y*.7+250*.3,dt,.8);}
 }
 snapshot(){return {state:this.state,time:this.time,score:this.score,owner:this.owner?.name,side:this.owner?.side,ball:this.ball.mode,selected:this.controlled.name,passes:this.passes,shots:this.shots,saves:this.saves,gauge:this.gauge,scene:this.scene?.type,players:this.players.map(p=>({name:p.name,x:p.x,y:p.y}))};}
}
