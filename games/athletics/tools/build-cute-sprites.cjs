// Integrate imagegen face artwork into original frame masks; retain original poses/anchors.
const sharp=require(require.resolve('sharp',{paths:[process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES]})),fs=require('fs'),path=require('path');
const dir=path.resolve(__dirname,'../assets/sprites'),map=JSON.parse(fs.readFileSync(dir+'/cute_v2/frame-map.json'));
const skin=(p,i)=>p[i+3]>127&&p[i]>180&&p[i+1]>110&&p[i+2]>60&&p[i+2]<180&&p[i]-p[i+1]>25;
function components(p,test){const seen=new Set(),out=[];for(let n=0;n<2304;n++){if(seen.has(n)||!test(p,n*4))continue;let stack=[n],a=[];seen.add(n);while(stack.length){let v=stack.pop();a.push(v);for(const [dx,dy] of [[1,0],[-1,0],[0,1],[0,-1]]){let x=v%48+dx,y=Math.floor(v/48)+dy,j=y*48+x;if(x>=0&&x<48&&y>=0&&y<48&&!seen.has(j)&&test(p,j*4)){seen.add(j);stack.push(j)}}}out.push(a)}return out;}
function face(p){return components(p,skin).filter(a=>a.length>12).sort((a,b)=>b.length-a.length)[0]}
function box(a){return {x:Math.min(...a.map(i=>i%48)),y:Math.min(...a.map(i=>Math.floor(i/48))),right:Math.max(...a.map(i=>i%48)),bottom:Math.max(...a.map(i=>Math.floor(i/48)))}}
const palette=[[20,19,15],[67,44,16],[249,191,28],[255,221,75],[219,160,28],[249,197,126],[231,166,85],[250,246,239]];
function quantize(p){return palette.reduce((best,q)=>{const d=q.reduce((s,v,j)=>s+(v-p[j])**2,0);return d<best.d?{q,d}:best},{q:palette[0],d:Infinity}).q}
(async()=>{const generated=await sharp(dir+'/cute_v2/face-design-source.png').resize(384,240,{kernel:'nearest'}).raw().toBuffer();let outputs={},report=[];
for(const item of map){const {name,frame,index}=item;const old=await sharp(dir+'/approved_v15/'+name+'.png').extract({left:frame*48,top:0,width:48,height:48}).raw().toBuffer();const fresh=Buffer.alloc(48*48*4);for(let y=0;y<48;y++)generated.copy(fresh,y*48*4,((Math.floor(index/8)*48+y)*384+index%8*48)*4,((Math.floor(index/8)*48+y)*384+index%8*48+48)*4);
const targetFace=face(old),sourceFace=face(fresh);if(!targetFace||!sourceFace)throw Error('Missing face '+name+frame);const a=box(targetFace),b=box(sourceFace),out=Buffer.from(old);let changed=0,removed=0;
// Fill only each existing face row; all external contours and body positions remain original.
for(let y=a.y;y<=a.bottom;y++){const xs=targetFace.filter(i=>Math.floor(i/48)===y).map(i=>i%48);if(!xs.length)continue;for(let x=Math.min(...xs);x<=Math.max(...xs);x++){const sx=Math.round(b.x+(x-a.x)*(b.right-b.x)/Math.max(1,a.right-a.x)),sy=Math.round(b.y+(y-a.y)*(b.bottom-b.y)/Math.max(1,a.bottom-a.y)),j=(sy*48+sx)*4,k=(y*48+x)*4;if(!old[k+3])continue;const q=fresh[j+3]>127?quantize(fresh.subarray(j,j+3)):palette[5];for(let c=0;c<3;c++)out[k+c]=q[c];changed++;}}
for(let i=0;i<out.length;i+=4){if(!out[i+3])continue;const color=[...out.subarray(i,i+3)].join(',');const q=({'41,31,17':[67,44,16],'255,216,149':[249,197,126],'202,130,53':[231,166,85],'184,189,200':[250,246,239]})[color];if(q)out.set(q,i);}
// Remove only disconnected 1-2 pixel specks; balls/hands/shoes are larger connected shapes.
for(const cc of components(out,(p,i)=>p[i+3]>0))if(cc.length<=2)for(const n of cc){out.fill(0,n*4,n*4+4);removed++;}
(outputs[name]??=[]).push({input:await sharp(out,{raw:{width:48,height:48,channels:4}}).png().toBuffer(),left:frame*48,top:0});report.push({name,frame,face:a,sourceFace:b,facePixels:changed,specksRemoved:removed});
}
for(const [name,frames] of Object.entries(outputs))await sharp({create:{width:frames.length*48,height:48,channels:4,background:'#00000000'}}).composite(frames).png().toFile(dir+'/cute_v2/'+name+'.png');await require('./align-victory-arms.cjs').align();await require('./unify-victory-face.cjs').unify();fs.writeFileSync(dir+'/cute_v2/build-report.json',JSON.stringify(report,null,2));console.log('39 frames rebuilt; original frame sizes, poses and anchors retained. Removed speck pixels:',report.reduce((s,r)=>s+r.specksRemoved,0));})();
