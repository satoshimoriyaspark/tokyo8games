const recovery=typeof loadAdventure==='function'?loadAdventure({getItem:key=>localStorage.getItem(key),setItem:(key,value)=>localStorage.setItem(key,value)}):{state:fresh(),storageOK:true};let state=recovery.state,storageOK=recovery.storageOK,saveLocked=!!recovery.blocked,titleVisible=true,resumeNotice=false;
const $=id=>document.getElementById(id);const elapsed=()=>state.spent+(state.running?Date.now()-state.since:0);function save(){if(saveLocked)return;try{localStorage.setItem(KEY,JSON.stringify({...state,spent:elapsed(),since:0,running:false}))}catch(e){storageOK=false;$('saveNotice').hidden=false;$('saveNotice').textContent='このブラウザでは保存できません。ページを閉じると進行が消えます。';}}
function clock(){const n=Math.floor(elapsed()/1000);$('timer').textContent=String(Math.floor(n/60)).padStart(2,'0')+':'+String(n%60).padStart(2,'0');}
function pause(){const resuming=!state.running;if(typeof stopSound==='function')stopSound();if(state.running){state.spent=elapsed();state.running=false;state.since=0}else{state.running=true;state.since=Date.now()}save();render();if(resuming&&typeof resumeMusic==='function')resumeMusic()}
function requestTopReturn(){
 if(state.phase==='setup'||(typeof boardBusy!=='undefined'&&boardBusy))return;
 $('topReturnTitle').textContent=state.phase==='done'?'クリアの記録を保存してTOPへ戻りますか？':'ここまで保存してTOPへ戻りますか？';
 $('topReturnDescription').textContent=state.phase==='done'?'5つの証とクリアの記録を残します。TOPから記録を見直したり、新しい冒険を始めたりできます。':'現在地・証・道具・回答・時間をこのブラウザに保存します。TOPの「つづきから」で再開できます。';
 $('topReturnError').hidden=true;$('topReturnError').textContent='';
 if(!$('topReturnDialog').open)$('topReturnDialog').showModal();
}
function confirmTopReturn(){
 if(!$('topReturnDialog').open||(typeof boardBusy!=='undefined'&&boardBusy))return false;
 const next={...state,spent:elapsed(),since:0,running:false};
 // Preserve the exact adventure or completed record; do not leave on an unverified write.
 try{if(saveLocked)throw Error('save locked');const raw=JSON.stringify(next);localStorage.setItem(KEY,raw);if(localStorage.getItem(KEY)!==raw)throw Error('save verification');}
 catch{$('topReturnError').hidden=false;$('topReturnError').textContent='進行の保存を確認できませんでした。まだTOPには戻っていません。「続きに戻る」で画面に戻れます。';return false;}
 if(typeof cancelMissionReveal==='function')cancelMissionReveal();if(typeof stopSound==='function')stopSound();state=next;saveLocked=false;storageOK=true;titleVisible=true;
 if(typeof boardFocus!=='undefined')boardFocus=true;
 if(typeof clearBoardToast==='function')clearBoardToast();
 for(const id of ['redrawDialog','deckDialog','mapDialog','menuDialog','resetDialog','topReturnDialog','playDialog'])if($(id).open)$(id).close();
 resumeNotice=state.phase!=='done';$('saveNotice').hidden=false;$('saveNotice').textContent=state.phase==='done'?'クリアの記録を保存しました。':'ここまで保存しました。続きから再開できます。';render();return true;
}
function openAdventure(){
 if(typeof prepareAdventureImages==='function'){prepareAdventureImages(enterPreparedAdventure);return;}
 enterPreparedAdventure();
}
function enterPreparedAdventure(){
 if(typeof boardBusy!=='undefined'&&boardBusy)return;
 titleVisible=false;
 if(typeof playSound==='function')playSound('confirm');
 if(resumeNotice){$('saveNotice').hidden=true;$('saveNotice').textContent='';resumeNotice=false;}
 if(typeof boardFocus!=='undefined')boardFocus=true;
 if(!['setup','done'].includes(state.phase)&&!state.running){state.running=true;state.since=Date.now();save();}
 render();if(typeof resumeMusic==='function')resumeMusic();
}
function showSetupTitle(){
 if(state.phase!=='setup')return;
 titleVisible=true;
 if(typeof stopSound==='function')stopSound();
 if($('playDialog').open)$('playDialog').close();
 render();if(typeof resumeMusic==='function')resumeMusic();
}
function requestReset(){
 if(typeof boardBusy!=='undefined'&&boardBusy)return;
 $('resetError').hidden=true;$('resetError').textContent='';
 if(!$('resetDialog').open)$('resetDialog').showModal();
}
function confirmReset(){
 if(!$('resetDialog').open||(typeof boardBusy!=='undefined'&&boardBusy))return false;
 const next=fresh();
 try{const raw=JSON.stringify(next);localStorage.setItem(KEY,raw);if(localStorage.getItem(KEY)!==raw)throw Error('save verification');}
 catch{$('resetError').hidden=false;$('resetError').textContent='リセットの保存を確認できませんでした。画面の冒険はそのままです。「続きに戻る」で冒険を続けられます。';return false;}
 if(typeof cancelMissionReveal==='function')cancelMissionReveal();if(typeof stopSound==='function')stopSound();state=next;saveLocked=false;storageOK=true;titleVisible=true;
 if(typeof boardFocus!=='undefined')boardFocus=true;
 if(typeof clearBoardToast==='function')clearBoardToast();
 for(const id of ['redrawDialog','deckDialog','mapDialog','menuDialog','resetDialog','topReturnDialog','playDialog'])if($(id).open)$(id).close();
 $('saveNotice').hidden=true;render();return true;
}
function symbol(m){return `<img src="assets/${m.symbol}.webp" alt="" class="attricon">`}
function icon(i){return i===0?'🏕️':(MISSIONS.find(m=>m.at===i)?symbol(MISSIONS.find(m=>m.at===i)):null)||EVENTS[i]?.[0]||'⭐'}
function render(){if(typeof setMusicScene==='function')setMusicScene(titleVisible||state.phase==='setup'?'title':state.phase==='done'?'clear':state.running?'play':null);clock();$('titleScreen').hidden=!titleVisible;$('gameHeader').hidden=titleVisible;$('adventureMain').hidden=titleVisible;$('enterAdventure').innerHTML=(state.phase==='setup'?'はじめる':state.phase==='done'?'クリアの記録を見る':'つづきから')+' <span aria-hidden="true">▶</span>';$('titleReset').hidden=!saveLocked&&state.phase==='setup';$('titleReset').textContent=saveLocked?'保存データを確認して最初から':'はじめから';$('titleSaveNotice').hidden=$('saveNotice').hidden;$('titleSaveNotice').className='titleSaveNotice'+(resumeNotice&&storageOK&&!saveLocked?' isResume':'');$('titleSaveNotice').textContent=typeof EmamonRuby!=='undefined'?EmamonRuby.textContent($('saveNotice')):$('saveNotice').textContent;$('topReturnBtn').hidden=state.phase==='setup';$('pause').hidden=['setup','done'].includes(state.phase);$('pause').textContent=state.running?'一時停止':'再開';$('turn').textContent=state.phase==='setup'?'冒険の準備':state.phase==='done'?'5つの証、コンプリート！':`${state.difficulty==='high'?'高学年':'低学年'} · 係 ${state.turn%state.players+1} / ${state.players}人`;
 $('count').textContent=`${state.badges.length} / 5`;$('badges').innerHTML=MISSIONS.map(m=>typeof badgeMarkup==='function'?badgeMarkup(m,state.badges.includes(m.id)):`<div class="badge ${state.badges.includes(m.id)?'earned':''}"><span class="symbol">${symbol(m)}</span><span>${m.name}</span><small>${state.badges.includes(m.id)?'✓ 獲得':m.at+'マス'}</small></div>`).join('');$('items').innerHTML=state.items.length?state.items.map(x=>`<span class="item">${x}</span>`).join(''):'道具マスに止まると手に入るよ。';$('trail').innerHTML=Array.from({length:26},(_,i)=>`<div class="tile ${i&&i%5===0?'stop':''} ${i===state.pos?'current':''}" ${i===state.pos?'aria-current="step"':''}><span class="ico">${icon(i)}</span>${i===0?'START':i%5===0?'★ '+i:i}</div>`).join('');
 const p=$('panel');p.className='panel';if(state.phase==='setup'){p.innerHTML=`<h2>冒険の準備</h2><div class="setupFields"><fieldset class="setupField"><legend>難易度</legend><select id="difficulty"><option value="low">低学年向け</option><option value="high">高学年向け</option></select></fieldset><fieldset class="setupField"><legend>コマのキャラクター</legend><select id="avatar"><option value="haru">ハル</option><option value="sora">ソラ</option></select></fieldset><fieldset class="setupField"><legend>チームの人数</legend><select id="players" aria-describedby="smallTeamHelp"><option value="2">2人</option><option value="3">3人</option><option value="4">4人</option><option value="5">5人</option><option value="6">6人</option></select><p id="smallTeamHelp" class="caption smallTeamHelp" hidden>2〜3人でも遊べます。サイコロ係・読み上げ係などを兼任し、3つのヒントは順番に見て伝え合おう。</p></fieldset></div>${typeof setupSoundMarkup==='function'?setupSoundMarkup():''}<div class="buttons"><button id="start">冒険をはじめる →</button></div>`;$('difficulty').value=state.difficulty;$('players').value=String(state.players);$('avatar').value=state.avatar==='sora'?'sora':'haru';$('players').onchange=()=>{$('smallTeamHelp').hidden=Number($('players').value)>3;};$('players').onchange();if(typeof bindSetupSound==='function')bindSetupSound();$('start').onclick=()=>{if(typeof playSound==='function')playSound('confirm');titleVisible=false;state.players=[2,3,4,5,6].includes(Number($('players').value))?Number($('players').value):4;state.avatar=$('avatar').value==='sora'?'sora':'haru';state.difficulty=$('difficulty').value==='high'?'high':'low';state.phase='roll';state.running=true;state.since=Date.now();save();render();if(typeof resumeMusic==='function')resumeMusic();if(typeof startBoardIntro==='function')startBoardIntro()};}
 else if(state.phase==='done'){p.classList.add('done');p.innerHTML=`<div class="doneActions"><button id="doneTopReturn" class="secondary">TOPへ戻る</button></div><div class="clearScene" id="clearScene"><p class="eyebrow">MISSION COMPLETE</p><div class="clearBadges">${MISSIONS.map(m=>`<img src="assets/${m.symbol}.webp" alt="${m.name}の証">`).join('')}</div><button id="skipClear" class="textbutton">演出を止める</button></div><h2 class="award">キッズ防災リーダー<br>トレーニング クリア！</h2><p>5つの証がそろったね。<br>自分の安全を大切に、困ったら大人に相談しよう。</p><div class="hint"><strong>家族に伝える、今日のひとこと</strong><p>「いっしょに備えを確認しよう」<br>今日気づいたことを1つ話してみよう。</p></div><p class="caption">ゲーム内の独自認定です。体験と話し合いのふりかえりに使ってください。</p>`;}
 else if(!state.running){p.innerHTML=`<div class="iconhero">🌱</div><h2>ひと休み中</h2><p>ここまでの証はそのまま。準備ができたら、続きから始めよう。</p><div class="buttons"><button id="resume">続きから再開する</button><button id="pausedTopReturn" class="secondary">TOPへ戻る</button></div>`;$('resume').onclick=pause;$('pausedTopReturn').onclick=requestTopReturn;}
 else if(state.phase==='roll'){const next=MISSIONS.find(m=>!state.badges.includes(m.id));p.innerHTML=`<p class="eyebrow">YOUR TURN · 係 ${state.turn%state.players+1}</p><h2>サイコロをふろう！</h2><p>次のガーディアンまで <strong>あと ${next.at-state.pos} マス</strong>。<br>${next.at}マスでは、必ず止まるよ。</p><div class="dicearea">${typeof dieMarkup==='function'?dieMarkup(state.last||1):'<div class="dice">'+(state.last||'?')+'</div>'}<button class="rollbutton" id="roll">サイコロをふる</button></div><p class="caption">1〜6の普通のサイコロ。STOPで余った分は持ち越しません。</p>`;$('roll').onclick=()=>{if(typeof takeBoardTurn==='function')takeBoardTurn();else{state=move(state,Math.floor(Math.random()*6)+1);save();render();}};}
 else if(state.phase==='mission'){renderMission(p);}
 else{const e=EVENTS[state.pos];p.innerHTML=`<span class="number">${state.last}が出た！ → ${state.pos}マス</span><div class="iconhero">${e[0]}</div><h2>${e[1]}</h2><p class="lead">${e[2]}</p><div class="buttons"><button id="next">${e[3]?'道具を受け取って交代':'話してみたら、次の人へ'} →</button></div><p class="caption">目安20〜30秒。みんなでひとことずつ話そう。</p>`;$('next').onclick=()=>{if(typeof playSound==='function')playSound('confirm');if(e[3]&&!state.items.includes(e[3]))state.items.push(e[3]);state.phase='roll';state.turn++;save();render();};}
 if(state.phase==='done'&&$('doneTopReturn'))$('doneTopReturn').onclick=requestTopReturn;
 if(state.phase==='done'&&$('skipClear'))$('skipClear').onclick=()=>{if(typeof stopSound==='function')stopSound();$('clearScene').classList.add('still');$('skipClear').hidden=true;};
 if(typeof updateBoard==='function')updateBoard();
 requestAnimationFrame(()=>{const c=$('trail').querySelector('.current');$('trail').scrollTo({left:Math.max(0,c.offsetLeft-$('trail').offsetLeft-$('trail').clientWidth/2+c.clientWidth/2),behavior:'smooth'})});}
$('enterAdventure').onclick=openAdventure;$('titleReset').onclick=requestReset;$('topReturnBtn').onclick=requestTopReturn;$('cancelTopReturn').onclick=()=>$('topReturnDialog').close();$('confirmTopReturn').onclick=confirmTopReturn;
$('pause').onclick=()=>{if($('menuDialog').open)$('menuDialog').close();if(typeof boardFocus!=='undefined')boardFocus=true;pause()};$('resetBtn').onclick=requestReset;$('cancelReset').onclick=()=>$('resetDialog').close();$('confirmReset').onclick=confirmReset;$('mapBtn').onclick=()=>{$('map').innerHTML=Array.from({length:26},(_,i)=>`<button class="${i&&i%5===0?'stop':''} ${i===state.pos?'current':''}" data-pos="${i}"><span class="ico">${icon(i)}</span>${i===0?'START':i%5===0?'★ '+i:i}</button>`).join('');$('mapInfo').textContent='現在地 '+state.pos+' / 25。マスを押してもコマは移動しません。';$('map').querySelectorAll('button').forEach(b=>b.onclick=()=>{const i=Number(b.dataset.pos),m=MISSIONS.find(m=>m.at===i);$('mapInfo').textContent=i===0?'START：チームで冒険を始めよう。':m?`${i}：${m.guardian}／${m.name}の証。「${m.title}」`:i+'：'+EVENTS[i][1]+'。'+EVENTS[i][2]});$('mapDialog').showModal()};$('closeMap').onclick=()=>$('mapDialog').close();if(recovery.message){$('saveNotice').hidden=false;$('saveNotice').textContent=recovery.message;}else if(state.phase!=='setup'&&state.phase!=='done'){resumeNotice=true;$('saveNotice').hidden=false;$('saveNotice').textContent='前の冒険から再開できます'}setInterval(()=>{clock();if(state.running)save()},1000);window.addEventListener('pagehide',save);
