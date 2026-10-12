const {makeEnv,ready}=require('./harness.cjs'),assert=require('assert'),fs=require('fs');
const getTimes=s=>s.legTimes;
const click=(e,id)=>e.nodes[id].events.click({target:e.nodes[id]});
function go(e){e.advance(5001);e.api.advanceCountdown(e.getNow());assert(e.api.state.active,JSON.stringify({mode:e.api.playMode,leg:e.api.state.course.id,counting:e.api.state.counting,elapsed:e.api.state.elapsed,now:e.getNow(),start:e.api.state.countdownStartedAt}));}
function run(e,passive=false){let n=0;while(e.api.state.active&&n<30000){e.advance(1000/30);if(!passive&&n%9===0)e.api.tap(n%18===0?'left':'right');e.api.tick(1/30);n++;}assert(e.api.state.done);assert(e.api.state.ai.every(r=>r.finishTime!==null));assert.equal(e.api.views[0].times.length,20);assert(e.api.views[0].times.every(t=>Number.isFinite(t)&&t>0));}
(async()=>{
 const e=makeEnv();await ready(e);assert(e.api.ready);
 assert.equal(e.api.courses.length,10);assert.equal(e.api.courses.reduce((n,c)=>n+Math.round(c.km*10),0),2171);
 for(const c of e.api.courses){assert.equal(c.profile[0][0],0);assert.equal(c.profile.at(-1)[0],c.km);for(let i=1;i<c.profile.length;i++)assert(c.profile[i][0]>c.profile[i-1][0]);}
 const individual=[];
 for(let i=0;i<10;i++){
  e.api.opening();e.api.chooseMode('single');e.api.chooseCourse(i);e.api.chooseDifficulty(1);e.api.beginRun();e.api.finishStory();assert(e.api.state.counting);const initial=e.api.state.player.km;e.api.tap('left');assert.equal(initial,e.api.state.player.km);go(e);
  for(let k=0;k<30;k++){e.advance(300);e.api.tap(k%2?'right':'left');e.api.tick(.3)}e.api.draw();
  run(e);individual.push({leg:i+1,seconds:e.api.state.elapsed,rank:e.api.standing(e.api.views[0].times).find(r=>r.team===1).rank});assert.equal(e.api.views.length,1);
 }
 e.api.opening();e.api.chooseMode('full');e.api.chooseDifficulty(1);e.api.beginRun(true);e.api.finishStory();
 const relay=[];
 for(let i=0;i<10;i++){
  assert.equal(e.api.state.course.id,i+1);assert.equal(e.api.state.player.energy,100);
  if(i){const totals=e.api.relayTotals(),p=totals[1];for(const a of e.api.state.ai)assert(Math.abs(a.startAt-(totals[e.api.teams.indexOf(a.team)]-p))<1e-7);}
  go(e);run(e);assert.equal(e.api.relay.runs.length,i+1);
  const legTimes=Array.from(e.api.views[0].times);relay.push({leg:i+1,time:legTimes[1],rank:e.api.standing(legTimes).find(r=>r.team===1).rank});
  assert.deepEqual(e.api.views.map(v=>v.kind).join(','),i===4?'区間,往路':i===9?'区間,復路,総合':'区間');
  if(i===4){const own=e.api.relay.runs.reduce((n,r)=>n+Math.round(r.times[1]*100),0)/100;assert.equal(e.api.views[1].times[1],own);}
  if(i===2){
   const resumed=makeEnv(false,e.storage);await ready(resumed);resumed.api.resumeRelay();assert(resumed.api.state.done);assert.equal(resumed.api.relay.runs.length,3);assert.equal(resumed.api.state.course.id,3);assert.deepEqual(Array.from(resumed.api.views[0].times),legTimes);
   resumed.api.resultNext();resumed.api.finishExchange();assert.equal(resumed.api.state.course.id,4);assert.equal(resumed.api.relay.runs.length,3);
   const checkpoint=makeEnv(false,e.storage);await ready(checkpoint);checkpoint.api.resumeRelay();assert(checkpoint.api.state.counting);assert.equal(checkpoint.api.state.course.id,4);assert.equal(checkpoint.api.state.player.km,0);
  }
  while(e.api.view<e.api.views.length-1)e.api.resultNext();
  if(i<9){e.api.resultNext();assert(!e.nodes.exchange.hidden);e.api.finishExchange();assert(e.api.state.counting);}
 }
 const totals=e.api.relayTotals(),returnTimes=e.api.relayTotals(6,10);
 assert.equal(e.api.views[2].times[1],totals[1]);assert.equal(e.api.views[1].times[1],returnTimes[1]);
 assert.equal(e.nodes.resultTable.children.length,20);
 
 // Replay and new-game confirmations never silently erase a completed save.
 const saved=e.storage.get('tokyo8games.ekiden.relay.v1');e.api.resultNext();assert(!e.nodes.saveChoice.hidden);assert.equal(e.storage.get('tokyo8games.ekiden.relay.v1'),saved);click(e,'cancelOverwrite');assert(e.nodes.saveChoice.hidden);
 for(const mode of ['out','back']){
  const m=makeEnv();await ready(m);m.api.chooseMode(mode);m.api.beginRun(true);m.api.finishStory();
  for(let i=0;i<5;i++){go(m);run(m);if(i<4){m.api.resultNext();m.api.finishExchange();}}
  assert.equal(m.api.views.length,2);assert.equal(m.api.views[1].kind,mode==='out'?'往路':'復路');
 }
 // Ties have shared place, no tie-break on team color.
 const tied=e.api.standing(Array(20).fill(100));assert(tied.every(r=>r.rank===1&&r.gap===0));assert.equal(e.api.recordClock(59.999),'01:00.00');
 const invalid=new Map([['tokyo8games.ekiden.relay.v1','{"version":1,"mode":"full","runs":[]}']]);const bad=makeEnv(false,invalid);await ready(bad);assert.equal(bad.api.readSave(),null);
 const failStorage={get(){throw Error('denied')},set(){throw Error('denied')}};const denied=makeEnv(false,failStorage);await ready(denied);denied.api.chooseMode('full');denied.api.beginRun(true);denied.api.finishStory();assert(denied.api.state.counting);assert(denied.nodes.saveStatus.textContent.includes('保存できません'));
 console.log(JSON.stringify({individual,relay,totals:totals[1],returnTime:returnTimes[1],checks:'all 10 legs; full/outbound/inbound; 20 standings; inherited gaps; stage/result resume; overwrite; invalid/unavailable storage; shared ranks',device:'Node VM canvas simulation, not an iPhone'},null,2));
})().catch(e=>{console.error(e);process.exitCode=1});
