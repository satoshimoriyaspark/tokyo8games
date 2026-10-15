const {makeEnv,ready}=require('./harness.cjs');
const {createCanvas,loadImage}=require('@napi-rs/canvas');
const path=require('path'),assert=require('assert');
const defs={idle:['idle_right',1],jog:['jog_right',8],sprint:['sprint_right',8],victory:['victory_front',3],podium:['podium_front',1]};
function islands(canvas){
 const p=canvas.getContext('2d').getImageData(0,0,48,48).data,seen=new Set();let count=0;
 for(let i=0;i<2304;i++){
  if(!p[i*4+3]||seen.has(i))continue;count++;const stack=[i];seen.add(i);
  while(stack.length){const n=stack.pop(),x=n%48,y=Math.floor(n/48);
   for(let dy=-1;dy<=1;dy++)for(let dx=-1;dx<=1;dx++){
    const xx=x+dx,yy=y+dy,m=yy*48+xx;
    if(xx<0||yy<0||xx>=48||yy>=48||seen.has(m)||!p[m*4+3])continue;seen.add(m);stack.push(m);
   }
  }
 }
 return count;
}
(async()=>{
 const e=makeEnv();await ready(e);assert(e.api.ready);let removed=0,frames=0;
 for(const [key,[file,n]] of Object.entries(defs)){
  const img=await loadImage(path.resolve(__dirname,'../assets/sprites/athletics-v15',file+'.png'));
  for(let team=0;team<20;team++){
   const original=e.api.teamSheet(img,e.api.teams[team],key),clean=e.api.sheets[key][team];
   const a=original.getContext('2d').getImageData(0,0,original.width,48).data,b=clean.getContext('2d').getImageData(0,0,clean.width,48).data;
   for(let k=0;k<a.length;k+=4){
    if(a[k+3]!==b[k+3]){assert.equal(b[k+3],0);assert.deepEqual(Array.from(a.slice(k,k+3)),[184,189,200]);assert(Math.floor(k/4/original.width)<38);removed++;}
    else assert.deepEqual(Array.from(a.slice(k,k+4)),Array.from(b.slice(k,k+4)),'Unexpected change to skin, clothing, outline or shoes');
   }
   for(let f=0;f<n;f++){
    const c=createCanvas(48,48);e.api.blitRunner(c.getContext('2d'),key==='jog'?26:key==='sprint'?29:28,46,e.api.teams[team],key,f,1);
    assert.equal(islands(c),1,`${key} ${f}, team ${team}: detached pixels`);frames++;
   }
  }
 }
 assert(removed>0);console.log(`PASS: ${frames} rendered frames across 20 colors; only exterior matte removed; shoes/details preserved; no detached pixels`);
})().catch(error=>{console.error(error);process.exitCode=1});
