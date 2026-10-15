// Correct only the right arm from the matching left arm in the existing PNG.
// Masks stop at the head/chin and shirt contours; face, hair and body stay intact.
const sharp=require(require.resolve('sharp',{paths:[process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES]}));
const path=require('path');
function armEdge(frame,y){
 if(frame===0){if(y<10||y>28)return -1;return y<21?13:y<24?14:y===24?16:18;}
 if(frame===1){if(y<9||y>28)return -1;return y<19?14:y<23?15:y<25?16:18;}
 return y>=24&&y<=30?18:-1;
}
async function align(file=path.resolve(__dirname,'../assets/sprites/cute_v2/victory_front.png')){
 const {data,info}=await sharp(file).ensureAlpha().raw().toBuffer({resolveWithObject:true});
 if(info.width!==144||info.height!==48)throw Error('Victory sheet must remain 144 × 48');
 const old=Buffer.from(data);
 for(let frame=0;frame<3;frame++)for(let y=0;y<48;y++)for(let x=0;x<=armEdge(frame,y);x++){
  const mirrored=(frame===2?48:47)-x;if(mirrored>=48)continue;
  const source=(y*144+frame*48+x)*4,destination=(y*144+frame*48+mirrored)*4;
  old.copy(data,destination,source,source+4);
 }
 await sharp(data,{raw:{width:144,height:48,channels:4}}).png().toFile(file);
}
module.exports={align,armEdge};
if(require.main===module)align().then(()=>console.log('Victory arms aligned in all 3 frames.'));
