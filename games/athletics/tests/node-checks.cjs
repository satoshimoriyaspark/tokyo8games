// Deterministic simulation + native Canvas rendering. This is not a browser/device test.
// Requires @napi-rs/canvas (provided by the development runtime).
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const {createCanvas,Image}=require(require.resolve('@napi-rs/canvas',{paths:[process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES||process.cwd()]}));
const game=path.resolve(__dirname,'..');
async function load(entry,probe){
 const html=fs.readFileSync(entry,'utf8'),nodes=new Map();
 class Element{
  constructor(){this.children=[];this._text='';this.hidden=false;this.classList={add(){},remove(){}};}
  set textContent(v){this._text=String(v);this.children=[];} get textContent(){return this._text+this.children.map(c=>c.textContent).join('');}
  appendChild(c){this.children.push(c);return c;} append(...c){this.children.push(...c);} replaceChildren(...c){this._text='';this.children=c;}
  setAttribute(){} addEventListener(){} focus(){} click(){this.onclick?.();}
 }
 const cv=createCanvas(384,320);cv.focus=()=>{};nodes.set('#screen',cv);nodes.set('#openingArt',createCanvas(384,152));
 const document={querySelector(s){if(!nodes.has(s))nodes.set(s,new Element());return nodes.get(s);},querySelectorAll(){return [];},createElement(tag){return tag==='canvas'?createCanvas(300,150):new Element();},addEventListener(){}};
 class LocalImage extends Image{set src(value){super.src=fs.readFileSync(path.join(game,value));}get src(){return super.src;}}
 const context={document,Image:LocalImage,console,performance:{now:()=>1000},localStorage:{getItem:()=>null,setItem(){}},requestAnimationFrame(){},setTimeout,clearTimeout};
 context.window=context;context.matchMedia=()=>({matches:false});context.scrollTo=()=>{};context.addEventListener=()=>{};
 vm.createContext(context);
 const script=html.split('<script>')[1].split('</script>')[0].replace('render();requestAnimationFrame(loop);',fs.readFileSync(probe,'utf8')+'\nrender();');
 vm.runInContext(script,context);
 for(let i=0;i<100;i++){if((context.competitionQA||context.timeQA||context.longJumpQA||context.javeQA||context.qa||context.motionQA)?.ready())return context;await new Promise(r=>setTimeout(r,20));}
 throw Error('PNG loading failed');
}
(async()=>{
 const output=path.join(__dirname,'evidence');fs.mkdirSync(output,{recursive:true});
 const competition=await load(path.join(game,'index.html'),path.join(__dirname,'competition-probe.js'));console.log('Competition PASS',competition.competitionQA.checks());
 const time=await load(path.join(game,'index.html'),path.join(__dirname,'time-probe.js'));
 console.log('Time conversion PASS',time.timeQA.checks().count);
 const current=await load(path.join(game,'index.html'),path.join(__dirname,'javeball-probe.js'));
 const jump=await load(path.join(game,'index.html'),path.join(__dirname,'long-jump-probe.js'));
 const jumpResult=jump.longJumpQA.checks();console.log('Long jump PASS',jumpResult.count);
 fs.writeFileSync(path.join(output,'long-jump-checks.json'),JSON.stringify({environment:'Node + native Canvas; not a browser/device test',...jumpResult},null,2));
 const result=current.javeQA.checks();console.log('Javeball PASS',result.count);
 const prior=await load(path.join(__dirname,'javeball-baseline/index.html'),path.join(__dirname,'javeball-probe.js'));
 if(process.argv.includes('--render')){
 for(const kind of ['run','hold']){
  const sheet=createCanvas(8*96,96),ctx=sheet.getContext('2d');ctx.imageSmoothingEnabled=false;
  for(let i=0;i<8;i++){
   const r=current.javeQA.scene(kind,i);
   // Crop the actual game rendering for inspection; no PNG assets are edited.
   const anchor=r.anchor;ctx.drawImage(r.canvas,anchor.dx,anchor.dy,48,48,i*96,0,96,96);
  }
  fs.writeFileSync(path.join(output,'jave-'+kind+'-local.png'),sheet.toBuffer('image/png'));
 }
 for(const [kind,frame] of [['run',3],['flight',.5],['land',0]]){
  const pair=createCanvas(768,320),ctx=pair.getContext('2d');ctx.imageSmoothingEnabled=false;
  [prior,current].forEach((a,i)=>ctx.drawImage(a.javeQA.scene(kind,frame).canvas,i*384,0));
  fs.writeFileSync(path.join(output,'jave-'+kind+'-comparison-local.png'),pair.toBuffer('image/png'));
 }
 }
 const old=await load(path.join(__dirname,'baseline/index.html'),path.join(__dirname,'probe.js'));
 const updated=await load(path.join(game,'index.html'),path.join(__dirname,'probe.js'));
 const before=old.qa.checks(),after=updated.qa.checks();
 const rulesOnly=rows=>rows.filter(r=>r.event!==1&&r.event!==4&&r.event!==undefined).map(({display,points,...rules})=>({...rules,points:parseInt(points,10)}));
 if(JSON.stringify(rulesOnly(before.snapshots))!==JSON.stringify(rulesOnly(after.snapshots)))throw Error('Game rules regression');
 console.log('Displayed records',after.snapshots.filter(r=>r.display).map(r=>r.display));
 console.log('Regression PASS',after.checks,'100m, hurdles and long jump player records/points match baseline');
 const motion=await load(path.join(game,'index.html'),path.join(__dirname,'motion-probe.js'));
 console.log('Running/start PASS',motion.motionQA.checks().count);
 fs.writeFileSync(path.join(output,'jave-checks.json'),JSON.stringify({environment:'Node + @napi-rs/canvas; not a browser/device test',javeball:result,regression:after,running:motion.motionQA.checks()},null,2));
})().catch(e=>{console.error(e);process.exitCode=1});
