import {TEAMS} from './data.mjs';
import {clamp,COURSES,ATTACK_COMMANDS,DEFENSE_COMMANDS,LABELS,pick,cpuAttack,cpuDefense,isDefenseHit,courseOptions,keeperRates,resolveOutcome} from './commands.mjs';
export {clamp};
const world=(p,side)=>side?{x:1000-p.x,y:500-p.y}:{...p};
const local=world;
const shape=[{x:638,y:250},{x:733,y:75},{x:733,y:425}];
export class Match{
 constructor(home=0,away=1,{random=Math.random,duration=180,shortScenes=false,difficulty='easy'}={}){
  this.teams=[TEAMS[home],TEAMS[away]];this.random=random;this.time=duration;this.shortScenes=shortScenes;this.difficulty=difficulty==='normal'?'normal':'easy';
  this.score=[0,0];this.gauge=[25,25];this.passes=[0,0];this.shots=[0,0];this.saves=[0,0];this.catches=[0,0];this.parries=[0,0];this.cuts=[0,0];this.blocks=[0,0];this.fastBreaks=[0,0];
  this.stayBonus=[0,0];this.chain=[false,false];this.passChain=[0,0];this.round=0;this.t=0;this.state='playing';this.paused=false;this.scene=null;this.choice=null;this.events=[];this.orb=null;this.pendingTransition=null;
  this.players=[];
  for(let side=0;side<2;side++)for(const [slot,roster] of [0,1,2,6].entries())this.players.push({...this.teams[side].players[roster],side,slot,roster,id:side*4+slot,x:0,y:0,face:side?-1:1,pose:'idle',poseTime:0,step:0});
  this.ball={mode:'held',x:0,y:0,z:22};this.startPossession(0,{initial:true});
 }
 get owner(){return this.ownerId===null?null:this.players[this.ownerId];}
 get controlled(){return this.players[this.selected];}
 get attacking(){return this.possession===0;}
 get phaseLabel(){return this.fast?'速攻':'遅攻';}
 get combo(){return this.passChain[this.possession];}
 get inputReady(){return this.state==='playing'&&!this.paused&&!this.scene&&!this.pendingTransition;}
 field(side){return this.players.filter(p=>p.side===side&&p.slot<3);}
 keeper(side){return this.players[side*4+3];}
 notify(text){this.message=text;this.events.push(text);if(this.events.length>30)this.events.shift();}
 setOwner(p){if(this.owner)this.owner.pose='idle';this.ownerId=p.id;p.pose='dribble';if(p.side===0)this.selected=p.id;this.ball={mode:'held',x:p.x,y:p.y,z:22};}
 startPossession(side,{initial=false,stay=false,fast=false}={}){
  if(this.time<=0){this.state='finished';this.scene=null;this.choice=null;this.pendingTransition=null;return;}
  const previous=this.possession;
  if(!stay){this.passChain[side]=0;this.stayBonus[side]=0;if(previous!==undefined&&previous!==side){this.passChain[previous]=0;this.stayBonus[previous]=0;this.chain[previous]=false;}}
  this.possession=side;this.fast=fast;this.round++;this.beat=fast?3:0;this.commands=[];this.defense=[];this.defenseUsed=false;this.stayCount=0;this.shotBeat=fast?3:null;this.pendingShot=null;this.pendingBlock=false;this.stayPending=false;this.feints=0;this.postSlot=null;this.direction=this.round%2? -1:1;this.scene=null;this.choice=null;this.pendingTransition=null;
  // Commit both CPU plans before any human command. They are not adapted to user input.
  this.cpuAttack=cpuAttack(this.random,this.difficulty);this.cpuDefense=cpuDefense(this.random,this.difficulty);
  if(fast){this.cpuAttack={commands:['skip','skip','skip'],shotBeat:3,course:pick(COURSES,this.random).id};this.fastBreaks[side]++;}
  this.orb=!fast&&!this.chain[side]&&this.random()<.23?{slot:pick([1,2],this.random),side}:null;
  const targets=this.formationTargets();
  for(const p of this.players){const target=targets[p.id];p.target={...target};p.face=side===p.side?(side?-1:1):(side?1:-1);p.pose='idle';p.poseTime=0;if(initial){p.x=target.x;p.y=target.y;}}
  this.selected=side===0?0:4;this.setOwner(this.players[side*4]);if(side===1)this.selected=0;
  if(fast){for(const p of this.field(side)){const q=world({x:300-p.slot*65,y:[250,85,415][p.slot]},side);p.x=q.x;p.y=q.y;}}
  this.scene={kind:fast?'rush':'set',t:0,duration:fast?1.6:initial?1:1.25};
  this.notify(fast?'速攻！ 味方が駆け上がる！':stay?'ステイ！ 守備を揺さぶった。センターからもう一度':'遅攻：センターから。相手の守備陣形が整った');
 }
 formationTargets(){
  const side=this.possession,ball=local(this.owner??world(shape[0],side),side),shift=clamp((ball.y-250)*.15,-25,25),targets={};
  for(const p of this.players){
   let q;
   if(p.slot===3)q={x:p.side===side?38:962,y:250};
   else if(p.side===side){q={...shape[p.slot]};if(this.fast)q={x:p.slot===0?795:765,y:[250,95,405][p.slot]};if(p.slot===this.postSlot)q={x:800,y:250+(this.feints%2?38:-18)};}
   else q={x:this.fast?560:824,y:[250,100,400][p.slot]+shift};
   targets[p.id]=world(q,side);
  }
  return targets;
 }
 passTarget(from=this.owner){
  if(!from)return null;
  const order=[1,0,2],index=order.indexOf(from.slot);let next=index+this.direction;
  if(next<0||next>=order.length)next=index-this.direction;
  return this.players[from.side*4+order[next]];
 }
 context(p=this.owner){return {player:p,passes:this.combo,stay:this.stayBonus[p.side],feints:this.feints,chain:this.chain[p.side],fast:this.fast,special:p.roster===0&&this.gauge[p.side]>=100,difficulty:this.difficulty};}
 courseOptions(p=this.owner){return p?courseOptions(this.context(p),this.keeper(1-p.side)):[];}
 consumeBeat(){this.time=Math.max(0,this.time-3);}
 command(value){
  if(!this.inputReady||this.choice)return false;
  if(this.attacking){
   if(this.beat===3){if(this.stayPending)return this.confirmStay();return false;}
   if(!ATTACK_COMMANDS.includes(value))return false;
   const beat=this.beat;this.commands[beat]=value;this.consumeBeat();
   const defense=this.cpuDefense.commands[beat];this.defense[beat]=defense;
   this.resolveBeat(value,defense,beat,()=>{
    if(value==='shoot'){
     this.shotBeat=beat;
     for(let i=beat+1;i<3;i++){this.commands[i]='skip';this.consumeBeat();}
     this.beat=3;this.openCourse();
    }else{this.beat=beat+1;if(this.beat===3){this.stayPending=this.commands.every(c=>c==='pass');if(!this.stayPending){this.shotBeat=3;this.openCourse();}else this.notify('パス3回！ 4拍目でステイ。次のシュート確率アップ');}}
   });return true;
  }
  if(!DEFENSE_COMMANDS.includes(value)||value==='stay'&&this.stayCount>=3||value!=='stay'&&this.defenseUsed)return false;
  if(value==='stay')this.stayCount++;else this.defenseUsed=true;
  const beat=this.beat;this.defense[beat]=value;this.consumeBeat();
  const action=beat===3?(this.cpuAttack.shotBeat===3?'shoot':'skip'):this.cpuAttack.commands[beat];
  this.commands[beat]=action;
  this.resolveBeat(action,value,beat,()=>{
   this.beat=beat+1;
   if(this.beat>=4){
    if(this.cpuAttack.shotBeat===null)this.completeStay();
    else{this.shotBeat=this.cpuAttack.shotBeat;this.openKeeper();}
   }
  });return true;
 }
 resolveBeat(action,defense,beat,done){
  if(isDefenseHit(defense,action)&&this.attacking&&action==='shoot'){
   this.pendingBlock=true;this.pendingShot=this.owner.id;this.owner.pose='shoot';this.owner.poseTime=.55;this.animate('ready',.65,{},done);return;
  }
  if(isDefenseHit(defense,action)){
   const defender=1-this.possession;this[defense==='cut'?'cuts':'blocks'][defender]++;
   const fast=defense==='cut'&&this.random()<1/3;
   this.notify((defense==='cut'?'パスにカットが一致！':'シュートにブロックが一致！')+(fast?' 速攻チャンス！':' 攻守交代'));
   this.animate('stop',.9,{stopType:defense,defender,beat},()=>this.startPossession(defender,{fast}));return;
  }
  if(action==='pass'){
   const from=this.owner,target=this.passTarget(from),start={x:from.x,y:from.y};this.direction=Math.sign([1,0,2].indexOf(target.slot)-[1,0,2].indexOf(from.slot));this.postSlot=null;
   from.pose='pass';from.poseTime=.5;this.ownerId=null;this.ball={mode:'pass',from:from.id,target:target.id,x:from.x,y:from.y,z:24,elapsed:0,windup:.5};
   this.notify(`パス！ ${from.name} → ${target.name}`);
   this.animate('pass',.8,{from:from.id,target:target.id,start},()=>{this.setOwner(target);this.passes[this.possession]++;this.passChain[this.possession]++;this.gauge[this.possession]=clamp(this.gauge[this.possession]+12,0,100);this.checkOrb(target,done);});
  }else if(action==='post'){
   const from=this.owner,repeated=this.postSlot===from.slot;
   if(repeated){this.feints++;this.commands[beat]='feint';from.pose='feint';from.poseTime=.7;this.notify('ポストでもう一度！ フェイントで揺さぶる');this.animate('post',.8,{},done);}
   else{const target=this.players[this.possession*4+(from.slot===0?1:0)];this.postSlot=target.slot;this.ownerId=null;this.ball={mode:'pass',from:from.id,target:target.id,x:from.x,y:from.y,z:24,elapsed:0,windup:.5};from.pose='pass';from.poseTime=.5;this.notify('ポストへ！ '+target.name+' がゴール前に入る');this.animate('post',1,{from:from.id,target:target.id,start:{x:from.x,y:from.y}},()=>{this.setOwner(target);this.gauge[this.possession]=clamp(this.gauge[this.possession]+8,0,100);done();});}
  }else if(action==='shoot'){
   this.pendingShot=this.owner.id;this.owner.pose='shoot';this.owner.poseTime=.55;this.notify(this.attacking?`${beat+1}拍目：シュート！ 4拍目でコースを選ぶ`:`相手が${beat+1}拍目にシュート！ 残りの守備入力後にGK勝負`);this.animate('ready',.65,{},done);
  }else{this.notify('相手はシュートを準備中。4拍目のあとGKで守る');this.animate('wait',.4,{},done);}
 }
 animate(kind,duration,extra,done){const length=this.shortScenes?Math.max(.62,duration*.7):duration;this.scene={kind,t:0,duration:length,...extra,done};}
 checkOrb(p,done){
  if(this.orb?.side===p.side&&this.orb.slot===p.slot){this.orb=null;this.chain[p.side]=true;this.notify('連携玉！ トライアングル・ラッシュ！ 次の一撃を強化');this.animate('link',1,{side:p.side,path:this.field(p.side).map(q=>q.id)},done);}else done();
 }
 openCourse(){this.choice={kind:'attack'};this.notify(this.shotBeat<3?'シュート確定！ 残りのコマンドは無効。4拍目のコースを選ぼう':'4拍目：右・左・股下を選んでシュート！');}
 confirmStay(){if(!this.inputReady||!this.attacking||this.beat!==3||!this.stayPending)return false;this.consumeBeat();this.commands[3]='stay';this.completeStay();return true;}
 completeStay(){
  const side=this.possession;this.stayBonus[side]=Math.min(.20,this.stayBonus[side]+.10);this.notify('ステイ！ 次のシュートを強化して攻撃を継続');
  this.animate('stay',1,{},()=>this.startPossession(side,{stay:true}));
 }
 chooseCourse(id){
  if(!this.inputReady||!this.choice||!COURSES.some(c=>c.id===id))return false;
  if(this.choice.kind==='keeper')return this.chooseKeeper(id);
  this.consumeBeat();this.commands[3]='course';this.choice=null;
  // A shot on beat 4 can be blocked here; an earlier shot was checked on its own beat.
  if(this.pendingBlock||this.shotBeat===3&&this.cpuDefense.commands[3]==='block'&&!this.fast){this.blocks[1]++;this.defense[this.shotBeat]='block';this.notify((this.shotBeat+1)+'拍目のシュートをブロック！ 攻守交代');this.animate('stop',.9,{stopType:'block',defender:1,beat:this.shotBeat},()=>this.startPossession(1));return true;}
  const p=this.players[this.pendingShot??this.ownerId],shot=this.courseOptions(p).find(c=>c.id===id),keeperChoice=this.cpuDefense.keeper;
  const rates=keeperRates(shot.threat,id,keeperChoice,this.keeper(1-p.side).stats[4]);
  this.beginShot(p,shot,resolveOutcome(rates,this.random),keeperChoice);return true;
 }
 openKeeper(){
  const p=this.players[this.pendingShot??this.ownerId],id=this.cpuAttack.course,shot=this.courseOptions(p).find(c=>c.id===id);
  const cue=this.random()<.65?id:pick(COURSES.filter(c=>c.id!==id),this.random).id;
  this.choice={kind:'keeper',shooter:p.id,shot,cue};this.notify('フィールド守備を抜けた！ GKは右・左・股下で勝負');
 }
 chooseKeeper(id){
  if(!this.inputReady||this.choice?.kind!=='keeper'||!COURSES.some(c=>c.id===id))return false;
  const {shot,shooter}=this.choice,rates=keeperRates(shot.threat,shot.id,id,this.keeper(0).stats[4]);this.choice=null;this.beginShot(this.players[shooter],shot,resolveOutcome(rates,this.random),id);return true;
 }
 beginShot(p,shot,outcome,keeperChoice){
  const side=p.side,special=p.roster===0&&this.gauge[side]>=100;
  this.shots[side]++;this.ownerId=null;this.ball.mode='shot';p.pose='shoot';
  this.scene={kind:'shot',t:0,duration:this.shortScenes?.8:1.8,side,shooter:p.id,keeper:this.keeper(1-side).id,courseId:shot.id,col:shot.col,row:shot.row,route:shot.route,type:special?this.teams[side].special:shot.position.label,position:shot.position,outcome,special,keeperChoice,chain:this.chain[side],counter:this.fast};
  this.gauge[side]=special?0:clamp(this.gauge[side]+8,0,100);this.passChain[side]=0;this.stayBonus[side]=0;this.chain[side]=false;
 }
 finishShot(){
  const s=this.scene,side=1-s.side;
  if(s.outcome==='goal'){this.score[s.side]++;this.gauge[s.side]=clamp(this.gauge[s.side]+18,0,100);this.notify('GOAL！ '+this.players[s.shooter].name);}
  else{this.saves[side]++;this[s.outcome==='catch'?'catches':'parries'][side]++;this.gauge[side]=clamp(this.gauge[side]+10,0,100);this.notify(s.outcome==='catch'?'キャッチ！ 速攻チャンス！':'キーパーが弾いてストップ！ 攻守交代');}
  this.scene=null;this.pendingTransition={remaining:.8,side,fast:s.outcome==='catch'};
 }
 buttons(){
  if(this.choice)return COURSES.map(c=>({id:c.id,label:c.label,sub:this.choice.kind==='attack'?Math.round(this.courseOptions().find(q=>q.id===c.id).goal*100)+'% 目安':this.choice.cue===c.id?'予兆あり':'このコースを守る',disabled:!this.inputReady}));
  if(this.attacking&&this.stayPending)return COURSES.map((c,i)=>({id:'stay',label:'ステイ',sub:i===1?'攻撃継続 / 次の一撃を強化':'どのボタンでも継続',disabled:!this.inputReady}));
  const ids=this.attacking?ATTACK_COMMANDS:DEFENSE_COMMANDS;
  return ids.map(id=>({id,label:LABELS[id],sub:this.attacking?({pass:'コースはオート',post:this.postSlot!==null?'もう一度でフェイント':'ゴール前へ',shoot:'4拍目でコース選択'}[id]):({cut:'パスと同じ拍で奪う',block:'シュートと同じ拍で止める',stay:'相手の出方を読む'}[id]),disabled:!this.inputReady||(!this.attacking&&(id==='stay'?this.stayCount>=3:this.defenseUsed))}));
 }
 tick(dt){
  if(this.paused||this.state!=='playing')return;dt=clamp(dt,0,.05);this.t+=dt;
  if(this.pendingTransition){this.pendingTransition.remaining-=dt;if(this.pendingTransition.remaining<=0){const p=this.pendingTransition;this.startPossession(p.side,{fast:p.fast});}return;}
  const targets=this.formationTargets();
  for(const p of this.players){
   const target=targets[p.id],dx=target.x-p.x,dy=target.y-p.y,d=Math.hypot(dx,dy),max=(this.scene?.kind==='rush'?450:this.scene?.kind==='set'?600:['post','pass'].includes(this.scene?.kind)?400:250)*dt;
   if(d>1){p.x+=dx/d*Math.min(d,max);p.y+=dy/d*Math.min(d,max);p.step+=dt*1.4;if(p.poseTime<=0)p.pose=p===this.owner?'dribble':'run';}else if(p.poseTime<=0)p.pose=p===this.owner?'dribble':'idle';
   p.poseTime=Math.max(0,p.poseTime-dt);
  }
  if(this.owner){this.ball.x=this.owner.x;this.ball.y=this.owner.y;}
  const s=this.scene;if(!s)return;s.t+=dt;
  if(this.ball.mode==='pass'&&s.start){const target=this.players[s.target],v=clamp((s.t-this.ball.windup)/(s.duration-this.ball.windup),0,1);this.ball.elapsed=s.t;this.ball.x=s.start.x+(target.x-s.start.x)*v;this.ball.y=s.start.y+(target.y-s.start.y)*v;this.ball.z=24+Math.sin(v*Math.PI)*20;}
  if(s.t>=s.duration){
   if(s.kind==='shot'){this.finishShot();return;}
   this.scene=null;
   if(s.kind==='rush'){this.setOwner(this.players[this.possession*4]);if(this.attacking)this.openCourse();else this.openKeeper();return;}
   s.done?.();
  }
 }
 snapshot(){return {state:this.state,time:this.time,score:this.score,side:this.possession,beat:this.beat,commands:this.commands,defense:this.defense,choice:this.choice?.kind,scene:this.scene?.kind,owner:this.owner?.name,fast:this.fast,stayBonus:this.stayBonus,passes:this.passes,shots:this.shots,cuts:this.cuts,blocks:this.blocks};}
}
