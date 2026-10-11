import {TEAMS} from './data.mjs';
import {COURSES,DIFFICULTIES,shotCourses,shotPosition,keeperProbabilities,resolveOutcome,clamp} from './tactics.mjs';
import {PLANS,localPoint,worldPoint,newAttack,formation,openingForCourse,receiveProgress} from './settled.mjs';
export {clamp};
const dist=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y);
export function segmentDistance(p,a,b){const dx=b.x-a.x,dy=b.y-a.y,t=clamp(((p.x-a.x)*dx+(p.y-a.y)*dy)/(dx*dx+dy*dy||1),0,1);return Math.hypot(p.x-a.x-dx*t,p.y-a.y-dy*t);}
export class Match {
 constructor(home=0,away=1,{random=Math.random,duration=180,shortScenes=false,difficulty='easy'}={}){
  this.teams=[TEAMS[home],TEAMS[away]];this.random=random;this.time=duration;this.shortScenes=shortScenes;this.difficulty=DIFFICULTIES[difficulty]?difficulty:'easy';
  this.score=[0,0];this.gauge=[25,25];this.passes=[0,0];this.shots=[0,0];this.saves=[0,0];this.catches=[0,0];this.parries=[0,0];this.steals=[0,0];
  this.t=0;this.playTime=0;this.state='playing';this.scene=null;this.choice=null;this.choiceId=0;this.paused=false;this.selected=0;this.ball={mode:'held',x:0,y:0,z:0};
  this.combo=0;this.possessionAge=0;this.ownerId=null;this.possession=0;this.events=[];this.restartTimer=0;this.counter=[0,0];this.chain=[false,false];this.orb=null;this.orbTimer=8;this.teamPress=[0,0];
  this.attacks=[newAttack(),newAttack()];this.defenseShift=[0,0];
  this.players=[];
  for(let side=0;side<2;side++)for(const [slot,roster] of [0,1,2,6].entries())this.players.push({...this.teams[side].players[roster],side,slot,roster,id:side*4+slot,x:0,y:0,vx:0,vy:0,face:side?-1:1,pose:'idle',poseTime:0,step:0,cooldown:0,protect:0,block:0,cut:0,decision:2.8});
  this.kickoff(0);this.notify('味方はオート！ 左右の展開とクロスで、守備を崩そう');
 }
 get attack(){return this.attacks[this.possession];}
 get phaseLabel(){return this.counter[this.possession]>0?'速攻':this.attack.phase==='settled'?'遅攻':'組み立て';}
 get controlled(){return this.players[this.selected];}
 get owner(){return this.ownerId===null?null:this.players[this.ownerId];}
 get attacking(){return this.possession===0;}
 get canAim(){return !this.paused&&!this.scene&&!this.choice&&this.state==='playing'&&!this.restartTimer&&this.owner?.side===0&&this.owner.slot<3;}
 field(side){return this.players.filter(p=>p.side===side&&p.slot<3);}
 keeper(side){return this.players[side*4+3];}
 notify(message){this.message=message;this.messageTime=3.8;this.events.push(message);if(this.events.length>20)this.events.shift();}
 setOwner(p){
  const previous=this.owner;if(previous&&previous!==p&&previous.pose==='dribble')previous.pose='idle';p.pose='dribble';p.poseTime=0;
  if(this.possession!==p.side){this.combo=0;this.possessionAge=0;this.counter[1-p.side]=0;this.chain[1-p.side]=false;this.attacks[p.side]=newAttack();}
  this.possession=p.side;this.ownerId=p.id;this.ball.mode='held';this.ball.target=null;p.protect=p.side===0?2.1:1.3;p.decision=p.slot===3?.8:(this.counter[p.side]>0?1.6:this.attacks[p.side].phase==='settled'?3.5:2.8);
  if(p.side===0&&p.slot<3)this.selected=p.id;
 }
 kickoff(side){
  this.restartTimer=0;this.attacks[side]=newAttack();this.defenseShift=[0,0];
  for(const p of this.players){let x=p.slot===3?38:side===p.side?(p.slot===0?380:300):350;const y=p.slot===3?250:[250,105,375][p.slot];p.x=p.side?1000-x:x;p.y=y;p.vx=p.vy=0;p.block=p.cut=0;p.pose='idle';p.poseTime=0;}
  this.possessionAge=0;this.combo=0;this.setOwner(this.players[side*4]);this.selected=0;this.owner.protect=3.2;
 }
 move(p,dx,dy,dt,scale=1){
  const length=Math.hypot(dx,dy),speed=(99+p.stats[0]*14)*scale*(this.counter[p.side]>0?1.25:1);
  if(length>.05){const k=length>1?1/length:1;p.vx=dx*k*speed;p.vy=dy*k*speed;p.x+=p.vx*dt;p.y+=p.vy*dt;if(Math.abs(dx)>.08)p.face=Math.sign(dx);p.step+=dt*(speed/165);if(p.poseTime<=0)p.pose=p===this.owner?'dribble':'run';}
  else {p.vx=p.vy=0;p.step+=dt*.7;if(p.poseTime<=0)p.pose=p===this.owner?'dribble':'idle';}
  p.x=clamp(p.x,25,975);p.y=clamp(p.y,30,470);
  if(p.slot<3){const arc=155*Math.sqrt(Math.max(0,1-((p.y-250)/175)**2));p.x=clamp(p.x,25+arc,975-arc);}
 }
 towards(p,x,y,dt,scale=1){const dx=x-p.x,dy=y-p.y,m=Math.hypot(dx,dy);this.move(p,m>8?dx/m:0,m>8?dy/m:0,dt,scale);}
 switchPlayer(dir=1){if(this.scene||this.choice)return;this.selected=this.field(0)[(this.controlled.slot+(dir<0?2:1))%3].id;}
 setTactic(plan,side=0){
  if(!PLANS[plan]||this.paused||this.choice||this.scene||this.restartTimer||this.state!=='playing'||this.possession!==side)return false;
  const a=this.attacks[side];a.plan=plan;
  if(plan==='cross'&&a.crossCooldown<=0&&!a.play&&a.phase==='settled')this.startCross(side);
  if(this.owner?.slot<3)this.owner.decision=Math.min(this.owner.decision,1.1);
  this.notify(PLANS[plan]+'！ 味方が動いてパスコースを作る');return true;
 }
 startCross(side){const a=this.attacks[side];if(a.play||a.crossCooldown>0)return false;a.play={age:0};a.crossCooldown=10;this.notify(this.teams[side].name+'：クロスからポストへ！');return true;}
 passTarget(from,input={x:0,y:0}){
  const a=this.attacks[from.side],manual=Math.hypot(input.x,input.y)>.2;
  const cycle=[1,0,2,0];let preferred=cycle[a.cursor%4];
  if(a.plan==='left')preferred=from.slot===1?0:1;
  if(a.plan==='right')preferred=from.slot===2?0:2;
  if(a.play)preferred=a.play.age>2?(from.slot===1?2:1):(from.slot===0?2:0);
  const choices=this.field(from.side).filter(p=>p!==from);
  return choices.sort((x,y)=>{
   const value=p=>{const d=dist(from,p),aim=manual?((p.x-from.x)*input.x+(p.y-from.y)*input.y)/(d||1)*220:0,lane=Math.min(...this.field(1-from.side).map(q=>segmentDistance(q,from,p)));
    return aim+Math.min(140,lane)*.7-d*.06+(!manual&&p.slot===preferred?180:0);
   };return value(y)-value(x);
  })[0];
 }
 pass(from=this.owner,input={x:0,y:0}){
  if(!from||this.owner!==from||this.scene||this.choice||this.state!=='playing')return false;
  const target=this.passTarget(from,input);if(!target)return false;
  this.ownerId=null;from.pose='pass';from.poseTime=.5;
  this.ball={mode:'pass',x:from.x+from.face*17,y:from.y,z:23,from:from.id,target:target.id,side:from.side,elapsed:0,ttl:2.5,windup:.5,launch:localPoint(from,from.side)};
  this.notify('パス！ '+from.name+' → '+target.name);return true;
 }
 actionA(input){if(this.choice||this.scene)return;if(this.owner?.side===0)this.pass(this.owner,input);else this.defend('cut');}
 defend(type){
  const p=this.controlled;if(this.choice||this.scene||this.owner?.side===0||p.cooldown>0)return;
  p.cooldown=.9;p.pose='block';p.poseTime=.4;
  if(type==='block'){p.block=1.2;this.notify('チームでシュートコースを絞る！');}
  if(type==='cut'){p.cut=1.3;this.notify('パスカットを狙う！');}
  if(type==='steal'){const q=this.owner;if(q&&q.slot<3&&q.protect<=0&&dist(p,q)<75&&this.random()<.60){this.setOwner(p);this.steals[0]++;this.notify('スティール！ 仲間につなごう');}else this.notify('近づいてCでスティール');}
 }
 feint(input={x:0,y:0}){const p=this.owner?.side===0?this.owner:this.controlled;if(this.scene||this.choice)return;if(this.owner!==p)return this.defend('steal');if(p.cooldown>0)return;p.cooldown=1.3;p.protect=1.7;p.pose='feint';p.poseTime=.35;this.move(p,p.face,input.y||((p.y>250)?-1:1),.17,1.2);this.notify('フェイント！ シュートのチャンス');}
 courseOptions(p=this.owner,special=false){if(!p)return [];const defenders=this.field(1-p.side),keeper=this.keeper(1-p.side);return shotCourses({openings:COURSES.map(c=>openingForCourse(p,defenders,keeper,c)),player:p,passes:this.combo,defenders:this.field(1-p.side),keeper:this.keeper(1-p.side),chain:this.chain[p.side],counter:this.counter[p.side]>0,special,difficulty:this.difficulty});}
 aim(){
  if(!this.canAim){if(!this.choice&&!this.scene)this.notify('味方がボールを持つとコースを選べます');return false;}
  const p=this.owner;this.selected=p.id;
  this.choice={id:++this.choiceId,kind:'attack',shooter:p.id,position:shotPosition(p),specialAvailable:p.roster===0&&this.gauge[0]>=100,special:false};return true;
 }
 cancelAim(){if(this.choice?.kind==='attack'){this.choice=null;this.owner.protect=Math.max(this.owner.protect,.8);}}
 chooseShot(courseId,special=false){
  if(this.paused||this.choice?.kind!=='attack'||!COURSES.some(c=>c.id===courseId))return false;
  const p=this.players[this.choice.shooter];if(this.owner!==p)return false;
  special=Boolean(special&&this.choice.specialAvailable);const rates=this.courseOptions(p,special).find(c=>c.id===courseId);
  this.choice=null;this.beginShot(p,rates,resolveOutcome(rates,this.random),special);return true;
 }
 beginShot(p,rates,outcome,special=false,keeperChoice=null,keeperMode=null){
  const side=p.side,flags={chain:this.chain[side],counter:this.counter[side]>0};
  this.ownerId=null;this.ball.mode='shot';p.pose='shoot';p.poseTime=.7;this.shots[side]++;
  this.scene={kind:'shot',t:0,duration:this.shortScenes?.75:(special?1.8:1.4),side,shooter:p.id,keeper:this.keeper(1-side).id,courseId:rates.id,route:rates.route,col:rates.col,row:rates.row,type:special?this.teams[side].special:rates.position.label,position:rates.position,aimY:rates.row===0?198:305,special,outcome,keeperChoice,keeperMode,...flags};
  this.gauge[side]=special?0:clamp(this.gauge[side]+8,0,100);this.combo=0;this.chain[side]=false;this.counter[side]=0;
  Object.assign(this.attacks[side],{warning:false,passesLeft:4,warningAge:0,stagnation:0});this.possessionAge=0;
 }
 prepareCpuShot(p){
  if(this.choice||this.scene||this.owner!==p||p.side!==1||p.slot===3)return false;
  const special=p.roster===0&&this.gauge[1]>=100,options=this.courseOptions(p,special);
  // Weighted choice, never reads the human's future goalkeeper selection.
  const total=options.reduce((n,c)=>n+c.goal,0);let value=this.random()*total,chosen=options[5];for(const c of options){value-=c.goal;if(value<=0){chosen=c;break;}}
  const cue=this.random()<.70?chosen.id:options.filter(c=>c.id!==chosen.id)[Math.floor(this.random()*5)].id;
  this.choice={id:++this.choiceId,kind:'defense',shooter:p.id,position:chosen.position,shot:{...chosen,courseId:chosen.id,special,chain:this.chain[1],counter:this.counter[1]>0},cue,special};
  this.notify('相手がシュート！ GKの移動と止め方を選ぼう');return true;
 }
 chooseKeeper(courseId,mode='catch'){
  if(this.paused||this.choice?.kind!=='defense'||!COURSES.some(c=>c.id===courseId)||!['catch','parry'].includes(mode))return false;
  const choice=this.choice,p=this.players[choice.shooter],rates=keeperProbabilities(choice.shot,courseId,mode,this.keeper(0).stats[4]);
  this.choice=null;this.beginShot(p,choice.shot,resolveOutcome(rates,this.random),choice.special,courseId,mode);return true;
 }
 finishShot(){
  const s=this.scene,k=this.players[s.keeper];this.scene=null;
  if(s.outcome==='goal'){
   this.score[s.side]++;this.gauge[s.side]=clamp(this.gauge[s.side]+18,0,100);this.gauge[k.side]=clamp(this.gauge[k.side]+10,0,100);
   this.notify('GOAL！ '+this.players[s.shooter].name);this.restartSide=k.side;this.restartTimer=1;this.ball.mode='dead';
  }else if(s.outcome==='catch'){
   this.saves[k.side]++;this.catches[k.side]++;this.setOwner(k);this.counter[k.side]=10;this.attacks[k.side].phase='fast';this.gauge[k.side]=clamp(this.gauge[k.side]+14,0,100);k.pose='celebrate';k.poseTime=.5;
   this.notify('キャッチ！ 速攻！ 次のシュート +14%');
  }else{
   this.saves[k.side]++;this.parries[k.side]++;this.ownerId=null;this.ball={mode:'loose',x:k.side?805:195,y:clamp(250+s.col*85,70,430),z:8,side:k.side,lock:.45,ttl:3};
   this.notify('弾いた！ ルーズボールを拾え！');
  }
 }
 spawnOrb(){const p=this.owner;this.orb={x:clamp((p?.x??500)+(p?.side===1?-80:80),230,770),y:clamp((p?.y??250)+(this.random()>.5?85:-85),70,430),ttl:13};this.orbTimer=22+this.random()*8;this.notify('連携玉が出現！ 触れて特殊連携！');}
 collectOrb(p){
  if(!this.orb)return;this.orb=null;this.chain[p.side]=true;this.gauge[p.side]=clamp(this.gauge[p.side]+20,0,100);
  if(this.possession===p.side&&this.owner?.slot<3){const start=this.owner,others=this.field(p.side).filter(q=>q!==start);this.scene={kind:'link',t:0,duration:1.25,side:p.side,path:[start.id,...others.map(q=>q.id)],stage:0};this.notify('トライアングル・ラッシュ！ 次のシュート +16%');}
  else{this.teamPress[p.side]=4;this.notify('連携プレス！ 奪ってからのシュート +16%');}
 }
 updatePass(dt){
  const b=this.ball;b.elapsed+=dt;b.ttl-=dt;if(b.elapsed<b.windup)return;
  const from=this.players[b.from];from.poseTime=0;from.pose='run';
  const target=this.players[b.target],speed=440+from.stats[1]*25,dx=target.x-b.x,dy=target.y-b.y,m=Math.hypot(dx,dy),old={x:b.x,y:b.y},length=Math.min(m,speed*dt);
  b.x+=dx/(m||1)*length;b.y+=dy/(m||1)*length;b.z=22+Math.sin(Math.min(1,(b.elapsed-b.windup)/.6)*Math.PI)*13;
  const interceptor=this.field(1-b.side).find(q=>q.cooldown<=0&&segmentDistance(q,old,b)<(q.cut>0?40:q.side===1?11:17));
  if(interceptor){interceptor.cooldown=1.8;const chance=interceptor.side===0?.52:.27;if(this.random()<chance){this.setOwner(interceptor);this.steals[interceptor.side]++;this.notify('パスカット！ '+interceptor.name);return;}}
  if(m<speed*dt+8){this.setOwner(target);if(!this.recordPass(b.launch,localPoint(target,target.side),target.side))return;this.combo=Math.min(8,this.combo+1);this.passes[target.side]++;this.gauge[target.side]=clamp(this.gauge[target.side]+12,0,100);this.notify('つながった！ '+this.combo+'連携 / シュート +'+Math.min(5,this.combo)*5+'%');}
  else if(b.ttl<=0){this.setOwner(this.players.reduce((a,p)=>dist(p,b)<dist(a,b)?p:a));this.notify('ルーズボールを回収！');}
 }
 recordPass(from,to,side){
  if(!receiveProgress(this.attacks[side],from,to)){this.passiveTurnover();return false;}return true;
 }
 passiveTurnover(){const side=1-this.possession;this.kickoff(side);this.notify('パッシブ！ 相手ボールで再開');}
 updateAttack(dt){
  const a=this.attack,side=this.possession,owner=this.owner,point=localPoint(owner??this.ball,side),fast=this.counter[side]>0;
  a.crossCooldown=Math.max(0,a.crossCooldown-dt);
  if(a.play){a.play.age+=dt;if(a.play.age>=6.5)a.play=null;}
  if(fast)a.phase='fast';
  else if(a.phase==='fast'||point.x>=570)a.phase='settled';
  if(a.phase==='settled'){
   a.settledTime+=dt;
   if(!a.play&&a.crossCooldown===0&&(a.plan==='cross'||a.plan==='auto'&&a.cursor>0&&a.cursor%4===2))this.startCross(side);
  }
  // A compact referee approximation: movement toward goal / wide circulation earns time.
  a.stagnation+=dt;
  if(owner&&point.x>a.bestAdvance+85){a.bestAdvance=point.x;a.stagnation=Math.max(0,a.stagnation-1.5);}
  if(!a.warning&&a.stagnation>=16){a.warning=true;a.passesLeft=4;a.warningAge=0;this.notify('パッシブ予告！ あと4パスでシュートを狙おう');}
  if(a.warning){a.warningAge+=dt;if(a.warningAge>=20){this.passiveTurnover();return false;}}
  const defense=1-side,extra=a.lastWing&&a.repeatedWing>=1?a.lastWing*Math.min(18,a.repeatedWing*6):0;
  const target=clamp((point.y-250)*.52+extra,-100,100);
  this.defenseShift[defense]+=(target-this.defenseShift[defense])*Math.min(1,dt*.75);
  return true;
 }
 tacticalRead(side=0){
  if(this.possession!==side)return '守備を整えて、GKの予兆を読もう';
  if(this.counter[side]>0)return '速攻！ '+Math.ceil(this.counter[side])+'秒 / 次の一撃 +14pt';
  const a=this.attacks[side];if(a.warning)return a.passesLeft>0?'パッシブ予告：あと'+a.passesLeft+'パス / '+Math.ceil(20-a.warningAge)+'秒':'パッシブ予告：今、シュート！';
  if(a.phase!=='settled')return '前へ運び、左右に広がろう';
  const spots=this.field(side).map(p=>({p,b:Math.max(...this.courseOptions(p).map(c=>c.bonuses.opening))})).sort((x,y)=>y.b-x.b);
  if(spots[0].b>.065){const p=spots[0].p;return p.name+'が空いた！ '+shotPosition(p).label+'の好機';}
  if(a.play)return 'クロス → ポストが動く。受け渡しの隙を狙おう';
  const shift=this.defenseShift[1-side];return Math.abs(shift)>34?'守備が'+(shift<0?'左':'右')+'寄り。'+(shift<0?'右':'左')+'へ展開しよう':'左右にパスを回し、守備を動かそう';
 }
 updateAI(p,dt){
  const owner=this.owner,attack=this.possession===p.side,setting=DIFFICULTIES[this.difficulty],a=this.attacks[p.side];
  if(this.orb&&dist(p,this.orb)<145){const nearest=this.field(p.side).reduce((x,q)=>dist(q,this.orb)<dist(x,this.orb)?q:x);if(p===nearest){this.towards(p,this.orb.x,this.orb.y,dt,p.side===0?.85:setting.speed);return;}}
  if(this.ball.mode==='loose'){this.towards(p,this.ball.x,this.ball.y,dt,.9);return;}
  if(attack){
   const pos=localPoint(p,p.side),ball=localPoint(owner??this.ball,p.side),fast=this.counter[p.side]>0,spots=fast?[{x:760,y:245},{x:800,y:95},{x:794,y:385}]:formation(a),target={...spots[p.slot]};
   if(a.phase==='build'||owner?.slot===3)target.x=Math.min(target.x,ball.x+155);
   if(this.ball.mode==='pass'&&this.ball.target===p.id){this.move(p,0,0,dt);return;}
   const goal=worldPoint(target,p.side),speed=fast?.95:a.phase==='settled'?.61:.87;
   this.towards(p,goal.x,goal.y,dt,p.side===0?speed:speed*setting.speed/.77);
   if(owner===p){p.decision-=dt;if(p.decision<=0){
    const chance=Math.max(...this.courseOptions(p).map(c=>c.goal));
    if(p.side===1&&pos.x>565&&((fast&&this.possessionAge>4)||(this.possessionAge>setting.attackWait&&(this.combo>=2&&chance>.47||this.possessionAge>16))||a.warning&&a.passesLeft<=1)){this.prepareCpuShot(p);return;}
    this.pass(p);
   }}return;
  }
  // Zone defense slides toward the actual ball, with a finite response speed.
  const side=this.possession,ball=localPoint(owner??this.ball,side),shift=this.defenseShift[p.side],order=[1,0,2],lane=order[p.slot],ys=[125,250,375];
  const zones=this.field(p.side).map(q=>({q,y:ys[order[q.slot]]+shift*.68}));
  const pressing=zones.reduce((x,z)=>Math.abs(z.y-ball.y)<Math.abs(x.y-ball.y)?z:x).q;
  let target={x:lane===1?795:808,y:clamp(ys[lane]+shift*.68,65,435)};
  const opponentAttack=this.attack;
  if(opponentAttack.play&&opponentAttack.play.age<2.8&&p.slot===0){const runner=localPoint(this.field(side)[0],side);target.y=clamp(runner.y+15,110,395);target.x=clamp(runner.x+62,735,815);}
  else if((p===pressing&&ball.x>550)||this.teamPress[p.side]>0){target={x:clamp(ball.x+44,650,860),y:clamp(ball.y,65,435)};}
  const goal=worldPoint(target,side);this.towards(p,goal.x,goal.y,dt,p.side===1?setting.speed*.73:.61);
  if(owner&&owner.slot<3&&owner.protect<=0&&dist(p,owner)<39&&p.cooldown<=0){p.cooldown=p.side===1?2.2:1.8;const probability=p.side===1?setting.steal+p.stats[4]*.012:.11+p.stats[4]*.018;if(this.random()<probability){this.setOwner(p);this.steals[p.side]++;this.notify(p.name+' がボール奪取！');}}
 }
 tick(dt,input={x:0,y:0}){
  if(this.paused||this.choice||this.state!=='playing')return;dt=clamp(dt,0,.05);this.t+=dt;this.messageTime=Math.max(0,this.messageTime-dt);
  for(const p of this.players){for(const key of ['cooldown','protect','block','cut','poseTime'])p[key]=Math.max(0,p[key]-dt);if(p.poseTime===0&&['pass','shoot','feint','celebrate','block'].includes(p.pose))p.pose='idle';}
  if(this.scene){const s=this.scene;s.t+=dt;if(s.kind==='link'){
    const stage=Math.min(2,Math.floor(s.t/.42));if(stage>s.stage){s.stage=stage;const from=localPoint(this.owner,s.side),target=this.players[s.path[stage]];this.setOwner(target);if(!this.recordPass(from,localPoint(target,s.side),s.side)){this.scene=null;return;}this.combo=Math.min(8,this.combo+1);this.passes[s.side]++;}
    if(s.t>=s.duration){this.scene=null;this.owner.protect=2.2;}
   }else {if(s.t>=s.duration)this.finishShot();}return;
  }
  if(this.restartTimer>0){this.restartTimer-=dt;if(this.restartTimer<=0)this.kickoff(this.restartSide);return;}
  this.time=Math.max(0,this.time-dt);this.playTime+=dt;if(this.time===0){this.state='finished';return;}
  this.possessionAge+=dt;this.teamPress=this.teamPress.map(n=>Math.max(0,n-dt));this.counter=this.counter.map(n=>Math.max(0,n-dt));
  if(!this.updateAttack(dt))return;
  this.orbTimer-=dt;if(!this.orb&&this.orbTimer<=0)this.spawnOrb();if(this.orb){this.orb.ttl-=dt;if(this.orb.ttl<=0)this.orb=null;}
  for(const p of this.players){
   if(this.scene||this.choice)break;
   if(p.slot===3){if(this.owner===p){p.decision-=dt;if(p.decision<=0)this.pass(p);}else{const target=clamp(250+((this.owner?.y??this.ball.y)-250)*.42,192,308);p.y+=(target-p.y)*Math.min(1,dt*2);p.step+=dt;}continue;}
   if(p.id===this.selected&&Math.hypot(input.x,input.y)>.12){this.move(p,input.x,input.y,dt);continue;}
   this.updateAI(p,dt);
  }
  if(this.scene||this.choice)return;
  const field=this.players.filter(p=>p.slot<3);
  for(let i=0;i<field.length;i++)for(let j=i+1;j<field.length;j++){const a=field[i],b=field[j],d=dist(a,b);if(d<25&&d>.01){const push=(25-d)*.25,dx=(a.x-b.x)/d,dy=(a.y-b.y)/d;a.x+=dx*push;a.y+=dy*push;b.x-=dx*push;b.y-=dy*push;}}
  if(this.orb){const collector=field.find(p=>dist(p,this.orb)<31);if(collector){this.collectOrb(collector);return;}}
  if(this.ball.mode==='pass')this.updatePass(dt);
  if(this.ball.mode==='loose'){this.ball.lock-=dt;this.ball.ttl-=dt;const nearest=field.reduce((a,p)=>dist(p,this.ball)<dist(a,this.ball)?p:a);if(this.ball.lock<=0&&(dist(nearest,this.ball)<32||this.ball.ttl<=0))this.setOwner(nearest);}
  if(this.owner){this.ball.x=this.owner.x+this.owner.face*19;this.ball.y=this.owner.y;this.ball.z=24;}
 }
 snapshot(){return {state:this.state,time:this.time,score:this.score,owner:this.owner?.name,side:this.owner?.side,ball:this.ball.mode,selected:this.controlled.name,passes:this.passes,shots:this.shots,catches:this.catches,parries:this.parries,combo:this.combo,choice:this.choice?.kind,scene:this.scene?.kind,counter:this.counter,chain:this.chain,phase:this.phaseLabel,plan:this.attack.plan,passive:this.attack.warning,passesLeft:this.attack.passesLeft};}
}
