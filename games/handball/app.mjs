import {TEAMS} from './data.mjs';
import {Match} from './engine.mjs';
import {COURSES,LABELS,shotPosition} from './commands.mjs';
import {Renderer,createSprites} from './render.mjs';
const $=id=>document.getElementById(id),factory=(w,h)=>{const c=document.createElement('canvas');c.width=w;c.height=h;return c;};
let chosen=0,match=null,renderer=null,sprites={},last=0,resultShown=false;
const handLabel=p=>p.hand==='L'?'左利き':'右利き';
function text(id,value){const str=String(value);if($(id).textContent!==str)$(id).textContent=str;}
function roster(){const t=TEAMS[chosen];$('roster-list').innerHTML='<div class="roster-grid">'+t.players.map((p,i)=>`<div class="roster-player"><strong>${i===0?'★ ':''}${p.name}</strong> ${p.role} / ${handLabel(p)}（暫定）<small>${p.trait}</small><small>${i<3||i===6?'試遊版スタメン':'登録選手（交代は今後実装）'}</small></div>`).join('')+'</div>';}
function selectTeam(index){chosen=index;document.querySelectorAll('.team-card').forEach((b,i)=>{b.classList.toggle('selected',i===index);b.setAttribute('aria-pressed',String(i===index));});const old=+$('opponent').value;$('opponent').innerHTML=TEAMS.map((t,i)=>i!==index?`<option value="${i}">${t.name}</option>`:'').join('');$('opponent').value=String(old!==index&&Number.isFinite(old)?old:(index+1)%4);roster();}
function menuCards(){$('team-cards').innerHTML=TEAMS.map((t,i)=>`<button class="team-card${i===0?' selected':''}" style="--team:${t.color}" data-team="${i}" aria-pressed="${i===0}"><canvas width="96" height="96" aria-label="${t.players[0].name}"></canvas><h3>${t.name}</h3><p>★ ${t.players[0].name} / ${t.type}</p><strong>${t.special}</strong><small>${t.label}</small></button>`).join('');document.querySelectorAll('.team-card').forEach(b=>b.onclick=()=>selectTeam(+b.dataset.team));selectTeam(0);}
function start(){match=new Match(chosen,+$('opponent').value,{difficulty:$('difficulty').value,shortScenes:$('short-scenes').checked||matchMedia('(prefers-reduced-motion: reduce)').matches});resultShown=false;$('menu').hidden=true;$('game').hidden=false;$('result').hidden=true;$('pause-screen').hidden=true;document.body.classList.add('playing');text('home-name',match.teams[0].name);text('away-name',match.teams[1].name);$('home-name').style.setProperty('--color',match.teams[0].color);$('away-name').style.setProperty('--color',match.teams[1].color);last=performance.now();updateHud();}
function goMenu(){match=null;$('game').hidden=true;$('menu').hidden=false;document.body.classList.remove('playing');$('start').focus();}
function pause(){if(!match||match.state!=='playing')return;match.paused=true;$('pause-screen').hidden=false;document.querySelector('.controls').inert=true;$('resume').focus();}
function resume(){match.paused=false;$('pause-screen').hidden=true;document.querySelector('.controls').inert=false;last=performance.now();}
function press(slot){
 if(!match?.inputReady)return;
 const button=match.buttons()[slot];if(!button||button.disabled)return;
 if(match.choice)match.chooseCourse(button.id);else if(match.stayPending&&match.attacking)match.confirmStay();else match.command(button.id);
 updateHud();
}
document.querySelectorAll('[data-slot]').forEach(b=>b.onclick=()=>press(+b.dataset.slot));
function trapFocus(e,root){const nodes=[...root.querySelectorAll('button')].filter(n=>!n.disabled),first=nodes[0],end=nodes.at(-1);if(e.shiftKey&&document.activeElement===first){e.preventDefault();end.focus();}else if(!e.shiftKey&&document.activeElement===end){e.preventDefault();first.focus();}}
const keySlots={Digit1:0,Digit2:1,Digit3:2,KeyZ:0,KeyX:1,KeyC:2};
window.addEventListener('keydown',e=>{if(!match)return;if(e.code==='Escape'){e.preventDefault();if(!e.repeat)match.paused?resume():pause();return;}if(match.paused){if(e.code==='Tab')trapFocus(e,$('pause-screen'));return;}if(e.code in keySlots){e.preventDefault();if(!e.repeat)press(keySlots[e.code]);}});
window.addEventListener('blur',pause);document.addEventListener('visibilitychange',()=>{if(document.hidden)pause();});
$('start').onclick=start;$('pause').onclick=pause;$('resume').onclick=resume;$('return-menu').onclick=goMenu;$('result-menu').onclick=goMenu;$('rematch').onclick=start;$('reload').onclick=()=>location.reload();
function updateHud(){
 const m=match;document.querySelector('.controls').inert=m.paused;text('score-home',m.score[0]);text('score-away',m.score[1]);const time=Math.ceil(m.time);text('timer',Math.floor(time/60)+':'+String(time%60).padStart(2,'0'));
 const attack=m.attacking,keeper=m.choice?.kind==='keeper',course=m.choice?.kind==='attack';
 text('possession',(attack?'攻撃 / ':'守備 / ')+m.phaseLabel);text('selected-name',m.owner?m.owner.name+' / '+handLabel(m.owner):'');text('message',m.message);
 text('turn-title',keeper?'GK勝負':course?'4拍目 / コースを選んでシュート':attack?'攻撃 / '+Math.min(4,m.beat+1)+'拍目':'守備 / '+Math.min(4,m.beat+1)+'拍目');
 text('turn-hint',keeper?'予兆の的中率65%':course?'押したコースへシュート':m.fast?'速攻！ すぐコース選択':'考える間は時計停止');
 const displayed=attack?m.commands:m.defense;
 $('beat-track').innerHTML=Array.from({length:4},(_,i)=>{const val=displayed[i],active=!keeper&&i===m.beat;const opponent=!attack&&m.commands[i]?`<em>相手：${LABELS[m.commands[i]]??'―'}</em>`:'';return `<div class="beat ${active?'current':''} ${val?'done':''} ${val==='skip'?'skipped':''}"><small>${i+1}</small><b>${val?LABELS[val]??val:i===3&&attack?(m.stayPending?'ステイ':'コース'):'？'}</b>${opponent}</div>`;}).join('');
 const buttons=m.buttons();document.querySelectorAll('[data-slot]').forEach((b,i)=>{const opt=buttons[i];b.disabled=opt.disabled;b.dataset.command=opt.id;b.classList.toggle('course-mode',course||keeper);b.classList.toggle('cue',keeper&&m.choice.cue===opt.id);b.setAttribute('aria-label',opt.label+(course?' 得点目安 '+opt.sub:''));text('label-'+i,opt.label);text('sub-'+i,opt.sub);});
 $('gauge-fill').style.width=m.gauge[0]+'%';text('gauge-text',m.gauge[0]>=100?'MAX！ エースの必殺':Math.floor(m.gauge[0])+'%');
 const bonus=m.stayBonus[m.possession],pass=m.combo;
 text('bonus-status',`パス連携 ${pass}回`+(bonus?' / ステイ蓄積 '+Math.round(bonus*10)+'回':'')+(m.chain[m.possession]?' / 特殊連携 READY':'')+(m.fast?' / 速攻 BONUS':''));
 text('command-note',keeper?'予兆を読んでGKを動かそう。能力と確率でストップ！':course?'得点率は守備通過後の目安。GKの選択で変化します。':m.stayPending&&attack?'3パス成立！ 4拍目はどのボタンでもステイ。':attack?'1〜3拍目はコマンド。4拍目は右・左・股下。':m.defenseUsed?'カット／ブロック使用済み。残りはステイ。':'カットかブロックは合計1回。ステイは3回まで。');
 const p=m.owner;let tactical=attack?'センターから遅攻。パスは左右へ順番に折り返す。':'相手は遅攻。どの拍でパス・シュートが来る？';
 if(m.fast)tactical='速攻！ 相手が戻る前に、すぐコースを選ぼう！';
 else if(course)tactical=shotPosition(p).label+' / '+(m.context().special?'必殺技が発動！':m.feints?'フェイントで守備を崩した！':'コースを選んで決めよう');
 else if(keeper)tactical='最後の砦！ '+m.keeper(0).name+' / GK能力 '+m.keeper(0).stats[4];
 text('tactical-message',tactical);
 if(m.state==='finished'&&!resultShown){resultShown=true;$('result').hidden=false;text('result-title',m.score[0]>m.score[1]?'勝利！ 読み合いを制した。':m.score[0]===m.score[1]?'引き分け！ 次こそ決めよう。':'敗北。もう一度、作戦勝負！');text('result-score',`${m.score[0]} — ${m.score[1]}`);$('result-stats').innerHTML='<div class="stats">'+[['パス',m.passes[0]],['シュート',m.shots[0]],['カット',m.cuts[0]],['ブロック',m.blocks[0]],['GKセーブ',m.saves[0]]].map(([s,n])=>`<span>${s}<b>${n}</b></span>`).join('')+'</div>';$('rematch').focus();}
}
function tick(now){const dt=Math.min(.25,Math.max(0,(now-last)/1000||0));last=now;if(match){let remaining=dt;while(remaining>0){const step=Math.min(.05,remaining);match.tick(step);remaining-=step;}renderer.draw(match);updateHud();}else if(sprites.ryuji){document.querySelectorAll('.team-card canvas').forEach((c,i)=>{const g=c.getContext('2d');g.imageSmoothingEnabled=false;g.clearRect(0,0,96,96);const frames=sprites[TEAMS[i].sprite].idle;g.drawImage(frames[Math.floor(now/143)%frames.length],0,0,96,96);});}requestAnimationFrame(tick);}
menuCards();
try{const [loaded,manifest]=await Promise.all([Promise.all(TEAMS.map(t=>new Promise((resolve,reject)=>{const img=new Image();img.onload=()=>resolve([t.sprite,img]);img.onerror=reject;img.src='/games/handball/assets/sprites/'+t.sprite+'.png';}))),fetch('/games/handball/assets/sprites/manifest.json').then(r=>{if(!r.ok)throw new Error('Sprite manifest unavailable');return r.json();})]);sprites=createSprites(Object.fromEntries(loaded),factory,manifest);renderer=new Renderer($('court'),sprites,factory);$('start').disabled=false;text('start','試合開始 →');requestAnimationFrame(tick);}catch(error){console.error('Handball sprite load failed',error);$('load-error').hidden=false;text('start','読み込みに失敗しました');}
