/* Recovery never removes the original stored value before a verified backup. */
function validateAdventure(raw){
 const obj=x=>x&&typeof x==='object'&&!Array.isArray(x),ints=(x,max)=>Array.isArray(x)&&x.length<=1000&&x.every(n=>Number.isInteger(n)&&n>=0&&n<=max),texts=x=>Array.isArray(x)&&x.length<=100&&x.every(s=>typeof s==='string'&&s.length<1000);
 let s;try{s=JSON.parse(raw)}catch{return {state:fresh(),blocked:true,message:'保存データを読み取れませんでした。元データは残しています。「最初から」で確認すると、新しい冒険を始められます。'}}
 if(!obj(s)||s.v!==1)return {state:fresh(),blocked:true,message:'この保存形式は読み込めません。元データは残しています。「最初から」で確認するまで上書きしません。'};
 let t={...fresh(),...s},notes=[];const repair=(key,value)=>{if(JSON.stringify(t[key])!==JSON.stringify(value)){t[key]=value;notes.push(key)}};
 repair('badges',Array.isArray(s.badges)?[...new Set(s.badges.filter(n=>Number.isInteger(n)&&n>=0&&n<5))]:[]);
 repair('items',Array.isArray(s.items)?[...new Set(s.items.filter(x=>Object.values(EVENTS).some(e=>e[3]===x)))]:[]);
 repair('log',texts(s.log)?s.log:[]);repair('players',[2,3,4,5,6].includes(s.players)?s.players:4);repair('difficulty',s.difficulty==='high'?'high':'low');
 if(s.avatar!==undefined)repair('avatar',s.avatar==='sora'?'sora':'haru');
 for(const k of ['spent','turn'])repair(k,Number.isFinite(s[k])&&s[k]>=0?(k==='turn'?Math.floor(s[k]):s[k]):0);
 repair('last',Number.isInteger(s.last)&&s.last>=0&&s.last<=6?s.last:0);
 let pos=Number.isInteger(s.pos)&&s.pos>=0&&s.pos<=25?s.pos:0;const next=MISSIONS.find(m=>!t.badges.includes(m.id));if(next)pos=Math.min(pos,next.at);else pos=25;repair('pos',pos);
 let phase=s.phase;if(!next)phase='done';else if(pos===next.at)phase='mission';else if(phase==='event'&&!EVENTS[pos])phase='roll';else if(!['setup','roll','event'].includes(phase))phase='roll';if(phase==='setup'&&(pos||t.badges.length))phase='roll';repair('phase',phase);
 let a=t.card,valid=obj(a)&&obj(a.definition)&&typeof a.id==='string'&&a.definition.attribute===next?.id;
 if(valid){const c=a.definition;valid=['select','memory','order','physical','hunt','pack','floor','route','clues'].includes(c.type)&&['title','prompt','hint','explain'].every(k=>typeof c[k]==='string')&&ints(a.answers,30)&&typeof a.solved==='boolean';if(['select','memory','order'].includes(c.type))valid=valid&&texts(c.options)&&c.options.length>0&&ints(c.answer,c.options.length-1)&&(!a.order||(ints(a.order,c.options.length-1)&&new Set(a.order).size===c.options.length));if(c.type==='physical')valid=valid&&texts(c.criteria)&&c.criteria.length>0;
 if(a.game!=null){let g=a.game;valid=valid&&obj(g)&&typeof g.notice==='string';if(c.type==='hunt')valid=valid&&ints(g.found,5);if(c.type==='pack')valid=valid&&ints(g.selected,7)&&(c.high||['cold','rain'].includes(g.weather));if(['floor','route'].includes(c.type))valid=valid&&Number.isInteger(g.at)&&g.at>=0&&g.at<25&&ints(g.path,24)&&typeof g.closed==='boolean'&&(!c.high||(typeof g.closed2==='boolean'&&typeof g.key==='boolean'));if(c.type==='clues'&&g.kind==='meeting')valid=valid&&Number.isInteger(g.step)&&g.step>=0&&g.step<=3&&typeof g.visible==='boolean'&&ints(g.wrong,7);else if(c.type==='clues')valid=false;}
 }
 if(t.phase!=='mission'||(a!==null&&!valid))repair('card',null);
 t.running=false;t.since=0;
 return {state:t,repaired:notes.length>0,blocked:false,message:notes.length?'保存データの不完全な部分を修復しました。獲得済みの証は維持しています。途中の問題が壊れていた場合は、そのSTOPから引き直せます。':''};
}
function loadAdventure(storage){let raw;try{raw=storage.getItem(KEY)}catch{return {state:fresh(),storageOK:false,blocked:false,message:'このブラウザでは保存を利用できません。ページを閉じると進行が消えます。'}}if(raw===null)return {state:fresh(),storageOK:true,blocked:false,message:''};let r=validateAdventure(raw);if(r.repaired){try{const backup=KEY+'-backup-'+Date.now();storage.setItem(backup,raw);if(storage.getItem(backup)!==raw)throw Error('backup');}catch{r.blocked=true;r.message+=' 元データの控えを保存できないため、自動保存を止めています。「最初から」で確認するまで元データを上書きしません。'}}return {...r,storageOK:true};}
if(typeof module!=='undefined')module.exports={validateAdventure,loadAdventure};
