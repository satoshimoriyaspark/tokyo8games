// Reuse the approved middle frame's exact head pixels; never rescale the face.
const sharp=require(require.resolve('sharp',{paths:[process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES]}));
const path=require('path'),{armEdge}=require('./align-victory-arms.cjs');
function headPixel(frame,x,y){const edge=armEdge(frame,y);return y<=24&&x>edge&&x<(frame===2?48:47)-edge;}
async function unify(file=path.resolve(__dirname,'../assets/sprites/cute_v2/victory_front.png')){
 const {data,info}=await sharp(file).ensureAlpha().raw().toBuffer({resolveWithObject:true});
 if(info.width!==144||info.height!==48)throw Error('Unexpected victory dimensions');
 const old=Buffer.from(data);
 for(const frame of [0,2])for(let y=0;y<=24;y++)for(let x=0;x<48;x++){
  const dest=(y*144+frame*48+x)*4,source=(y*144+48+x)*4;
  if(headPixel(frame,x,y))data.fill(0,dest,dest+4);
  if(headPixel(frame,x,y)&&headPixel(1,x,y)&&old[source+3])old.copy(data,dest,source,source+4);
 }
 await sharp(data,{raw:{width:144,height:48,channels:4}}).png().toFile(file);
}
module.exports={unify,headPixel};
if(require.main===module)unify().then(()=>console.log('All 3 victory heads use the exact middle frame.'));
