'use strict';
// One catalog entry per researched, playable stage. No placeholder destinations.
window.AryPlaces = (() => {
 const entries = [{
  id:'kameari-katori',stageId:'kameari',stageNumber:1,area:'亀有',storageKey:'ary-stage-kameari-v1',
  name:'亀有香取神社と狛亀',reading:'かめありかとりじんじゃ と こまがめ',
  image:'/games/ary/assets/kameari-katori-guide.png',
  alt:'亀有香取神社の実景をもとにした紹介イラスト。石の鳥居と参道、入口右側の狛亀と奥の社殿。',
  lines:['1276年にできた、亀有のまちを見守る神社。','アリオ亀有側の鳥居では、めずらしい「狛亀」がお出迎え。','参道の入り口で、カメの顔をよく見てみよう！'],
  quote:'「犬じゃなくて、カメなんだ！ これは取材メモに書いておこう！」',
  sources:[
   {label:'亀有香取神社：神社諸案内',url:'https://kameari-katori.or.jp/information/'},
   {label:'葛飾区観光協会：亀有香取神社',url:'https://katsushika-kanko.jp/kame-ao/003katori.html'}
  ]
 }];
 let records={},revision=0,storageWarning=false;
 function read(entry){
  try{
   const raw=localStorage.getItem(entry.storageKey);
   let r;try{r=JSON.parse(raw)}catch(_){return {cleared:false,best:0}}
   if(!r||typeof r!=='object'||Array.isArray(r))return {cleared:false,best:0};
   return {...r,cleared:r.cleared===true,best:Number.isFinite(r.best)?Math.max(0,r.best):0};
  }catch(_){storageWarning=true;return {cleared:false,best:0}}
 }
 function refresh(){for(const entry of entries)records[entry.stageId]=read(entry);revision++}
 function record(stageId){return {...(records[stageId]||{cleared:false,best:0})}}
 function markCleared(stageId,score){
  const entry=entries.find(e=>e.stageId===stageId);if(!entry)return record(stageId);
  const latest=read(entry),previous=record(stageId);
  const r={...previous,...latest,cleared:true,best:Math.max(latest.best,previous.best,Number.isFinite(score)?score:0)};
  records[stageId]=r;revision++;
  try{localStorage.setItem(entry.storageKey,JSON.stringify(r))}catch(_){storageWarning=true}
  return {...r};
 }
 function unlocked(id){const entry=entries.find(e=>e.id===id);return !!entry&&record(entry.stageId).cleared}
 refresh();
 return {entries,record,markCleared,refresh,unlocked,revision:()=>revision,storageWarning:()=>storageWarning};
})();

// Presentation only: these views never write clear records or award score.
window.AryAlbum = (() => {
 const $=s=>document.querySelector(s);
 let callbacks={},imagePath='',lastView='',lastEntry='';
 function textNode(tag,text,className){const n=document.createElement(tag);n.textContent=text;if(className)n.className=className;return n}
 function link(source){const a=textNode('a',source.label);a.href=source.url;a.target='_blank';a.rel='noopener noreferrer';return a}
 function imageFailed(){$('#landmark-image').hidden=true;$('#landmark-image-error').hidden=false}
 function loadImage(path){imagePath=path;$('#landmark-image').hidden=false;$('#landmark-image-error').hidden=true;$('#landmark-image').src=path}
 function init(handlers){
  callbacks=handlers;
  $('#collection-back').onclick=()=>callbacks.back();
  $('#collection-retry').onclick=()=>callbacks.retry();
  $('#collection-title').onclick=()=>callbacks.title();
  $('#landmark-image').addEventListener('error',imageFailed);
  $('#landmark-image-retry').onclick=()=>loadImage(imagePath);
 }
 function list(){
  const cards=AryPlaces.entries.map(entry=>{
   const open=AryPlaces.unlocked(entry.id),card=document.createElement('button');
   card.type='button';card.className='album-card';card.disabled=!open;
   card.setAttribute('aria-label',entry.name+(open?'を読む':'：'+entry.area+'をクリアすると開放'));
   const art=textNode('span',open?'取材済み':'？','album-card-art');
   if(open){const img=document.createElement('img');img.src=entry.image;img.alt='';img.loading='lazy';art.replaceChildren(img)}
   const body=document.createElement('span');body.className='album-card-copy';
   body.append(textNode('small','STAGE '+String(entry.stageNumber).padStart(2,'0')+' / '+entry.area),textNode('strong',entry.name),textNode('span',open?'紹介を見る →':entry.area+'をクリアすると開放'));
   card.append(art,body);card.onclick=()=>{if(AryPlaces.unlocked(entry.id))callbacks.open(entry.id)};
   return card;
  });
  $('#album-list').replaceChildren(...cards);
  const count=AryPlaces.entries.filter(e=>AryPlaces.unlocked(e.id)).length;
  $('#album-count').textContent='訪れた名所 '+count+' / '+AryPlaces.entries.length;
 }
 function detail(entry,origin){
  $('#landmark-name').textContent=entry.name;$('#landmark-reading').textContent=entry.reading;
  $('#landmark-number').textContent='取材ノート '+String(entry.stageNumber).padStart(2,'0')+' / '+entry.area;
  $('#landmark-copy').replaceChildren(...entry.lines.map(line=>textNode('p',line)));
  $('#landmark-quote').textContent=entry.quote;
  $('#landmark-sources').replaceChildren(...entry.sources.map(source=>{const li=document.createElement('li');li.append(link(source));return li}));
  $('#landmark-image').alt=entry.alt;
  if(lastEntry!==entry.id){loadImage(entry.image);$('#source-details').open=false}
  $('#collection-retry').hidden=origin!=='clear';
  $('#collection-back').textContent=origin==='clear'?'← 結果へ':'← アルバムへ';
  lastEntry=entry.id;
 }
 function render(view,id,origin){
  const showing=view==='album'||view==='landmark';
  $('.stage').hidden=showing;$('#collection-screen').hidden=!showing;
  $('main').setAttribute('data-view',showing?'collection':'game');
  if(!showing){lastView=view;return}
  $('#album-overview').hidden=view!=='album';$('#album-detail').hidden=view!=='landmark';
  $('#collection-heading').textContent=view==='album'?'アリィの取材アルバム':'亀有の名所を発見！';
  $('#collection-save-note').textContent=AryPlaces.storageWarning()?'記録を端末に保存できません。この画面を閉じると今回の記録が残らない場合があります。':'記録は同じURL・同じブラウザに保存されます。';
  if(view==='album'){$('#collection-back').textContent='← タイトルへ';list()}
  else {const entry=AryPlaces.entries.find(e=>e.id===id);if(entry&&AryPlaces.unlocked(id))detail(entry,origin)}
  if(view!==lastView){$('#collection-heading').focus({preventScroll:true});$('#collection-screen').scrollTop=0}
  lastView=view;
 }
 return {init,render};
})();
