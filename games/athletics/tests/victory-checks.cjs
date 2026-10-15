const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const sharp=require(require.resolve('sharp',{paths:[process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES]}));
const {armEdge}=require('../tools/align-victory-arms.cjs');
(async()=>{
 const before=await sharp(path.join(__dirname,'evidence/victory-before.png')).ensureAlpha().raw().toBuffer();
 const {data:after,info}=await sharp(path.join(__dirname,'../assets/sprites/cute_v2/victory_front.png')).ensureAlpha().raw().toBuffer({resolveWithObject:true});
 assert.equal(info.width,144);assert.equal(info.height,48);let changed=0;
 for(let frame=0;frame<3;frame++)for(let y=0;y<48;y++)for(let x=0;x<48;x++){
  const k=(y*144+frame*48+x)*4,mirror=(frame===2?48:47)-x;
  const arm=mirror>=0&&mirror<=armEdge(frame,y);
  if(arm){const j=(y*144+frame*48+mirror)*4;assert.deepEqual(after.subarray(k,k+4),after.subarray(j,j+4),'Both arms must match');}
  else assert.deepEqual(after.subarray(k,k+4),before.subarray(k,k+4),'Pixels outside edited arm must stay unchanged');
  if(!after.subarray(k,k+4).equals(before.subarray(k,k+4)))changed++;
  assert.ok(after[k+3]===0||after[k+3]===255,'No translucent edge pixels');
 }
 const html=fs.readFileSync(path.join(__dirname,'../index.html'),'utf8');
 const source=html.match(/function victoryFrameAt\(seconds\)\{[^}]+\}/)[0];
 const pick=new Function(source+';return victoryFrameAt')();
 assert.deepEqual([.05,.25,.45,.65,.85,1.05].map(pick),[2,0,1,1,0,2]);
 assert.equal(pick(1.24),2);assert.equal(pick(-1),2);
 console.log('PASS: 3 mirrored arm masks, all other pixels unchanged, binary alpha, 6-step raise/hold/lower; '+changed+' changed pixels.');
})();
