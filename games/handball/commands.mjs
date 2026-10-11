// β6 balance values are game rules, not real-world handball statistics.
export const clamp=(n,lo,hi)=>Math.max(lo,Math.min(hi,n));
export const COURSES=[{id:'right',col:1,row:0,label:'右'},{id:'left',col:-1,row:0,label:'左'},{id:'nutmeg',col:0,row:1,label:'股下'}];
export const ATTACK_COMMANDS=['pass','post','shoot'];
export const DEFENSE_COMMANDS=['cut','block','stay'];
export const LABELS={pass:'パス',post:'ポスト',feint:'フェイント',shoot:'シュート',cut:'カット',block:'ブロック',stay:'ステイ',skip:'―',course:'コース'};
export const pick=(items,random)=>items[Math.min(items.length-1,Math.floor(random()*items.length))];
export function cpuAttack(random,difficulty='easy'){
 const patterns=difficulty==='easy'?
  [['pass','pass','shoot'],['pass','post','shoot'],['pass','post','post'],['pass','pass','pass'],['pass','shoot','skip'],['shoot','skip','skip'],['pass','post','pass']]:
  [['pass','post','shoot'],['pass','shoot','skip'],['shoot','skip','skip'],['pass','post','post'],['pass','post','pass'],['post','pass','shoot']];
 const commands=[...pick(patterns,random)];
 const explicit=commands.indexOf('shoot');
 const stay=commands.every(c=>c==='pass');
 return {commands,shotBeat:explicit>=0?explicit:stay?null:3,course:pick(COURSES,random).id};
}
export function cpuDefense(random,difficulty='easy'){
 const beat=Math.floor(random()*4),type=pick(difficulty==='easy'?['cut','block','block']:['cut','cut','block'],random);
 return {commands:Array.from({length:4},(_,i)=>i===beat?type:'stay'),keeper:pick(COURSES,random).id};
}
export function isDefenseHit(command,attack){return command==='cut'&&attack==='pass'||command==='block'&&attack==='shoot';}
export function shotPosition(p){
 const x=p.side?1000-p.x:p.x,y=p.side?500-p.y:p.y;
 const lateral=y-250,type=Math.abs(lateral)>115?'side':x>=750?'post':'long';
 return {type,lateral,label:type==='side'?(lateral<0?'左':'右')+'サイドシュート':type==='post'?'ポストシュート':'ロングシュート'};
}
export function shotThreat({player,course,passes=0,stay=0,feints=0,chain=false,fast=false,special=false,difficulty='easy'}){
 const position=shotPosition(player),natural=player.hand==='L'?1:-1;
 const openHand=position.type==='side'&&((position.lateral<0&&player.hand==='R')||(position.lateral>0&&player.hand==='L'));
 const hand=course.col===0?0:course.col===natural?.045:-.025;
 const angle=position.type==='side'?(openHand?.055:-.04)+(course.col===-Math.sign(position.lateral)?.04:-.02):position.type==='post'&&course.col===0?.055:0;
 const bonuses={passes:Math.min(5,passes)*.035,stay:Math.min(.20,stay),feint:Math.min(.12,feints*.06),chain:chain?.12:0,fast:fast?.16:0,special:special?.16:0,hand,angle};
 const base={long:.48,side:.52,post:.59}[position.type];
 let threat=base+(player.stats[2]-3)*.025+Object.values(bonuses).reduce((a,b)=>a+b,0);
 if(player.side===1&&difficulty==='easy')threat-=.07;
 return {threat:clamp(threat,.15,.93),position,bonuses};
}
export function keeperRates(threat,actual,chosen,ability=3){
 const exact=actual===chosen;
 const save=clamp(.43-(threat-.5)*.75+(ability-3)*.045+(exact?.28:-.10),.08,.94);
 return {goal:1-save,catch:save*.68,parry:save*.32,save,exact};
}
export function courseOptions(context,keeper){
 return COURSES.map(c=>{
  const value=shotThreat({...context,course:c});
  const goal=COURSES.reduce((sum,k)=>sum+keeperRates(value.threat,c.id,k.id,keeper.stats[4]).goal,0)/3;
  return {...c,...value,goal,route:value.position.type==='long'?(c.col===0?'低く抜く':'強打'):value.position.type==='post'?(c.col===0?'股下を抜く':'近距離'):c.col===-Math.sign(value.position.lateral)?'ファー':'ニア'};
 });
}
export function resolveOutcome(rates,random){const n=random();return n<rates.goal?'goal':n<rates.goal+rates.catch?'catch':'parry';}
