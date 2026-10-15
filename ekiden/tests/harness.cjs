const fs=require('fs'),path=require('path'),vm=require('vm'),assert=require('assert');
const {createCanvas,Image}=require('@napi-rs/canvas');
const GAME_DIR=path.resolve(__dirname,'..');
const html=fs.readFileSync(path.join(GAME_DIR,'index.html'),'utf8');
function makeEnv(failFirst=false,storage=new Map()){
 const nodes={},listeners={};let now=0,fail=failFirst;
 function el(tag='div',id=''){
  const obj=tag==='canvas'?createCanvas(['game','profile','resultScene','exchangeCanvas'].includes(id)?320:96,id==='game'?180:id==='profile'?70:id==='resultScene'?144:id==='exchangeCanvas'?120:96):{};
  Object.assign(obj,{id,tagName:tag.toUpperCase(),hidden:false,disabled:false,inert:false,children:[],style:{},textContent:'',attrs:{},classList:{add(){},remove(){},toggle(){}},addEventListener(k,fn){this.events??={};this.events[k]=fn},setAttribute(k,v){this.attrs[k]=v},appendChild(v){this.children.push(v)},replaceChildren(){this.children=[]},querySelector(){return el()},focus(){document.activeElement=this},scrollIntoView(){}});
  return obj;
 }
 for(const m of html.matchAll(/<(\w+)[^>]*\bid="([^"]+)"[^>]*>/g)){nodes[m[2]]=el(m[1],m[2]);nodes[m[2]].hidden=/\bhidden\b/.test(m[0]);nodes[m[2]].disabled=/\bdisabled\b/.test(m[0]);}
 const document={getElementById:id=>{assert(nodes[id],'Missing ID '+id);return nodes[id]},createElement:tag=>el(tag),createTextNode:text=>({textContent:text}),body:el('body'),addEventListener(k,v){listeners[k]=v},hidden:false,activeElement:null};
 class LocalImage extends Image{
  get naturalWidth(){return this.width} get naturalHeight(){return this.height}
  set src(value){if(fail&&value.includes('jog_right')){fail=false;queueMicrotask(()=>this.onerror(new Error('simulated failure')));return}super.src=path.resolve(GAME_DIR,value)}
 }
 const context=vm.createContext({document,window:{matchMedia:()=>({matches:false})},Image:LocalImage,localStorage:{getItem:k=>storage.get(k)||null,setItem:(k,v)=>storage.set(k,v)},performance:{now:()=>now},requestAnimationFrame(){},console,queueMicrotask});
 const code=html.match(/<script>([\s\S]*?)<\/script>/)[1].replace(/\}\)\(\);\s*$/,'globalThis.testApi={courses,playModes,chooseMode,beginRun,resumeRelay,readSave,saveRelay,completeLeg,resultNext,finishExchange,recordClock,standing,renderResult,drawResultScene,drawExchange,relayTotals,get relay(){return relay},get views(){return resultViews},get view(){return resultView},get playMode(){return playMode},showStory,finishStory,advanceCountdown,frame,loadSprites,chooseTeam,chooseCourse,chooseDifficulty,reset,tap,dash,pause,tick,draw,drawCharacterCards,showStep,menu,rank,opening,teamSheet,blitRunner,get state(){return s},get ready(){return spriteReady},get sheets(){return spriteSheets},get teams(){return teamColors}};})();');
 vm.runInContext(code,context,{filename:'ekiden/index.html'});
 return {storage,api:context.testApi,nodes,document,listeners,advance(ms){now+=ms},getNow:()=>now};
}
async function ready(e){for(let i=0;i<100&&!e.api.ready&&e.nodes.reloadSprites.hidden;i++)await new Promise(r=>setTimeout(r,10));}

module.exports={makeEnv,ready};
