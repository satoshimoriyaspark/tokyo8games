/* Image preparation is independent of audio. Keep decoded Image objects alive for reuse. */
(function(root){
 'use strict';
 const IMAGE_ASSETS=[
  'emamon-leaders-mission-logo.png','guardian-popup-room.png','guild-town.webp','guild-room.webp','guild-props.webp','guild-props-extra.webp',
  'haru-pawn.webp','sora-pawn.webp','G001.webp','G002.webp','G003.webp','G005.webp','G006.webp',
  'PI01.webp','PI02.webp','PI03.webp','PI04.webp','PI05.webp'
 ].map(name=>'assets/'+name);
 function createImageLoader(env){
  const ready=new Map(),pending=new Map();
  function once(url){return new Promise(resolve=>{
   let image,settled=false,decoding=false;
   const finish=ok=>{if(settled)return;settled=true;env.clearTimer(timer);if(image){image.onload=image.onerror=null;}if(ok)ready.set(url,image);resolve(ok);};
   const timer=env.timer(()=>finish(false),env.timeout||6500);
   try{image=env.createImage();image.decoding='async';
    image.onerror=()=>finish(false);
    image.onload=()=>{if(settled||decoding)return;decoding=true;if(!image.naturalWidth){finish(false);return;}if(typeof image.decode==='function'){Promise.resolve().then(()=>image.decode()).then(()=>finish(true),()=>finish(false));}else finish(true);};
    image.src=url;if(image.complete&&image.naturalWidth)image.onload();
   }catch{finish(false);}
  });}
  function load(url){if(ready.has(url))return Promise.resolve(true);if(pending.has(url))return pending.get(url);const promise=(async()=>{let ok=await once(url);if(!ok)ok=await once(url);pending.delete(url);return ok;})();pending.set(url,promise);return promise;}
  async function prepare(notify=()=>{}){const total=IMAGE_ASSETS.length;let finished=0;const failed=[];notify({finished,ready:ready.size,total,failed:0});await Promise.all(IMAGE_ASSETS.map(async url=>{const ok=await load(url);if(!ok)failed.push(url);finished++;notify({finished,ready:ready.size,total,failed:failed.length});}));return {ok:failed.length===0,failed,total};}
  return {prepare,get ready(){return IMAGE_ASSETS.every(url=>ready.has(url))},get count(){return ready.size}};
 }
 if(typeof module!=='undefined')module.exports={IMAGE_ASSETS,createImageLoader};
 if(!root?.document)return;
 const loader=createImageLoader({createImage:()=>new root.Image(),timer:(fn,ms)=>root.setTimeout(fn,ms),clearTimer:id=>root.clearTimeout(id)});
 const byId=id=>root.document.getElementById(id);let generation=0,busy=false,proceed=null;
 function restore(){busy=false;byId('enterAdventure').disabled=false;byId('titleReset').disabled=false;}
 function cancel(){generation++;proceed=null;byId('imageLoading').hidden=true;byId('imageLoading').setAttribute('aria-busy','false');restore();byId('enterAdventure').focus({preventScroll:true});}
 async function run(){if(busy)return;busy=true;const ticket=++generation;byId('imageLoading').hidden=false;byId('imageLoadError').hidden=true;byId('retryImages').hidden=true;byId('enterAdventure').disabled=true;byId('titleReset').disabled=true;byId('imageLoading').setAttribute('aria-busy','true');byId('imageLoadStatus').textContent='冒険の絵を準備しています…';byId('cancelImages').focus({preventScroll:true});
  const result=await loader.prepare(progress=>{if(ticket!==generation)return;byId('imageLoadProgress').max=progress.total;byId('imageLoadProgress').value=progress.ready;byId('imageLoadCount').textContent=`${progress.ready} / ${progress.total}`;});
  if(ticket!==generation)return;byId('imageLoading').setAttribute('aria-busy','false');restore();
  if(result.ok){byId('imageLoading').hidden=true;const next=proceed;proceed=null;next?.();}
  else{byId('imageLoadStatus').textContent='一部の絵を読み込めませんでした。';byId('imageLoadError').hidden=false;byId('retryImages').hidden=false;byId('retryImages').focus({preventScroll:true});}
 }
 root.prepareAdventureImages=next=>{if(busy)return;if(loader.ready){next();return;}proceed=next;run();};
 root.EmamonImages=loader;
 byId('retryImages').onclick=()=>run();byId('cancelImages').onclick=cancel;
 root.document.addEventListener('keydown',event=>{if(!byId('imageLoading').hidden&&event.key==='Escape'){event.preventDefault();cancel();}});
 root.addEventListener('pagehide',()=>{generation++;proceed=null;byId('imageLoading').hidden=true;restore();});
})(typeof window==='undefined'?null:window);
