// Game balance, not a claim about real handball scoring statistics.
export const clamp = (n, lo, hi) => Math.max(lo, Math.min(hi, n));
export const COURSES = [
  {id:'left-high',col:-1,row:0,label:'左上'}, {id:'center-high',col:0,row:0,label:'中央上'}, {id:'right-high',col:1,row:0,label:'右上'},
  {id:'left-low',col:-1,row:1,label:'左下'}, {id:'center-low',col:0,row:1,label:'中央下'}, {id:'right-low',col:1,row:1,label:'右下'}
];
export const DIFFICULTIES = {
  easy:{label:'やさしい',speed:.65,steal:.07,attackWait:8,shotScale:.84},
  normal:{label:'ふつう',speed:.77,steal:.12,attackWait:6,shotScale:1}
};
export function shotPosition(p){
  const distance=p.side===0?975-p.x:p.x-25;
  // Left/right is always viewed by the attacker looking toward the opposing goal.
  const lateral=(p.y-250)*(p.side===0?1:-1);
  const type=Math.abs(lateral)>112&&distance<450?'side':distance<=230&&Math.abs(lateral)<=112?'post':'long';
  return {type,distance,lateral,wing:lateral<0?'左':'右',label:type==='side'?(lateral<0?'左':'右')+'サイドシュート':type==='post'?'ポストシュート':'ロングシュート'};
}
export function shotCourses({player,passes=0,defenders=[],keeper,chain=false,counter=false,special=false,difficulty='easy',openings=[]}){
  const position=shotPosition(player),hand=player.hand||'R',natural=hand==='R'?-1:1;
  const passBonus=Math.min(5,passes)*.05,chainBonus=chain?.16:0,counterBonus=counter?.14:0,specialBonus=special?.18:0;
  const openHand=position.type==='side'&&((position.lateral<0&&hand==='R')||(position.lateral>0&&hand==='L'));
  return COURSES.map((course,index)=>{
    const near=position.type==='side'&&course.col===Math.sign(position.lateral);
    const far=position.type==='side'&&course.col===-Math.sign(position.lateral);
    let zone=position.type==='long'?.34:position.type==='side'?.40:.56;
    zone-=clamp((position.distance-300)/1000,-.08,.19);
    let courseBonus=position.type==='long'?(course.col===0?.055:-.015):position.type==='post'?(course.col!==0?.065:.025):(far?.055:near?-.025:-.01);
    if(course.row===1)courseBonus+=position.type==='post'&&course.col===0?.045:.025;
    let handBonus=course.col===natural?.045:course.col===0?0:-.025;
    if(position.type==='side')handBonus+=(openHand?.06:-.055)+(far&&openHand?.025:0);
    const pressure=defenders.filter(q=>Math.abs(q.x-player.x)<155&&Math.abs(q.y-player.y)<65).length*.045;
    const opening=openings[index]??0;
    const keeperCost=((keeper?.stats?.[4]||3)-3)*.012;
    let goal=clamp(zone+(player.stats[2]-3)*.025+courseBonus+handBonus+passBonus+chainBonus+counterBonus+specialBonus+opening-pressure-keeperCost,.12,.94);
    if(player.side===1)goal=clamp(goal*DIFFICULTIES[difficulty].shotScale,.1,.9);
    goal=Math.round(goal*100)/100;
    const catchChance=(1-goal)*.58;
    const route=position.type==='long'?(course.row===0?'強打':'バウンド'):position.type==='post'?(course.col===0&&course.row===1?'股下':course.row===0?'浮かせる':'足元'):far?(course.row===0?'ファー上':'ファーバウンド'):near?'ニア狙い':'中央抜き';
    return {...course,route,near,far,goal,catch:catchChance,parry:1-goal-catchChance,position,bonuses:{passes:passBonus,hand:handBonus,chain:chainBonus,counter:counterBonus,special:specialBonus,opening,pressure:-pressure}};
  });
}
export function keeperProbabilities(shot,chosen,mode,ability=4){
  const actual=COURSES.find(c=>c.id===shot.courseId),choice=COURSES.find(c=>c.id===chosen);
  const exact=choice.id===actual.id,sameSide=choice.col===actual.col;
  const read=exact?.42:sameSide?.18:Math.abs(choice.col-actual.col)===1?.025:-.14;
  const save=clamp(.49+read+(ability-3)*.018+(mode==='parry'?.1:0)-(shot.special?.11:0)-(shot.chain?.075:0)-(shot.counter?.065:0)-(shot.goal-.5)*.2,.14,.96);
  const caught=save*(mode==='catch'?.86:.08);
  return {goal:1-save,catch:caught,parry:save-caught};
}
export function resolveOutcome(probabilities,random){const r=random();return r<probabilities.goal?'goal':r<probabilities.goal+probabilities.catch?'catch':'parry';}
