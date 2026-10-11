// Compact 3-player interpretation of a set attack; not a full 6-player formation.
import {clamp} from './tactics.mjs';
export const PLANS={auto:'おまかせ',left:'左へ展開',right:'右へ展開',cross:'クロス・ポスト'};
export const localPoint=(p,side)=>side===0?{x:p.x,y:p.y}:{x:1000-p.x,y:500-p.y};
export const worldPoint=(p,side)=>localPoint(p,side);
export function newAttack(){return {phase:'build',plan:'auto',cursor:0,play:null,crossCooldown:0,stagnation:0,warning:false,passesLeft:4,warningAge:0,bestAdvance:0,lastWing:0,repeatedWing:0,settledTime:0};}
export function formation(state){
 if(state.play){const late=state.play.age>2;
  return late?[{x:730,y:350},{x:798,y:237},{x:700,y:220}]:[{x:644,y:335},{x:785,y:268},{x:646,y:208}];
 }
 const bias=state.plan==='left'?-1:state.plan==='right'?1:0;
 return [{x:625,y:250+bias*53},{x:754,y:88},{x:754,y:412}];
}
const segment=(p,a,b)=>{const dx=b.x-a.x,dy=b.y-a.y,t=clamp(((p.x-a.x)*dx+(p.y-a.y)*dy)/(dx*dx+dy*dy||1),0,1);return Math.hypot(p.x-a.x-dx*t,p.y-a.y-dy*t);};
export function openingForCourse(player,defenders,keeper,course){
 if(!defenders.length)return 0;
 const p=localPoint(player,player.side),foes=defenders.map(d=>localPoint(d,player.side)),goal={x:985,y:250+course.col*58};
 const nearest=Math.min(...foes.map(q=>Math.hypot(q.x-p.x,q.y-p.y)));
 const space=clamp((nearest-42)/150,0,1)*.095;
 const blocks=foes.filter(q=>q.x>p.x-8).reduce((n,q)=>n+clamp(1-segment(q,p,goal)/44,0,1)*(course.row===0?.13:.095),0);
 const k=keeper?localPoint(keeper,player.side):{y:250};
 const keeperRead=clamp(1-Math.abs(k.y-goal.y)/72,0,1)*.025;
 return clamp(space+.045-blocks-keeperRead,-.18,.14);
}
export function receiveProgress(state,from,to){
 const wide=Math.abs(to.y-from.y)>185,forward=to.x-from.x>85;
 if(wide||forward)state.stagnation=Math.max(0,state.stagnation-2.1);
 const wing=to.y<160?-1:to.y>340?1:0;
 if(wing){state.repeatedWing=state.lastWing===wing?Math.min(3,state.repeatedWing+1):0;state.lastWing=wing;}
 state.cursor++;
 if(state.warning){if(state.passesLeft===0)return false;state.passesLeft--;}
 return true;
}
