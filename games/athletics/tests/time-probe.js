showOpening('game');
window.timeQA={ready:()=>spriteReady,checks(){
 const passed=[],check=(name,ok)=>{if(!ok)throw Error(name);passed.push(name)};
 check('100m 20 simulation seconds = 16.00',label(0,20)==='16.00秒');
 check('1500m 20 simulation seconds = 7:50.00',label(1,20)==='7:50.00');
 check('hurdles 16 simulation seconds = 28.00',label(2,16)==='28.00秒');
 check('field record unchanged',label(3,5.2)==='5.20m'&&label(4,30)==='30.00m');
 check('minute rounding carries',timeText(1,479.999)==='8:00.00');
 selected=1;resetRun();mode='run';pos=119.9;input('B');check('early B does not consume spurt',!spurtUsed);pos=120;sta=40;input('B');check('B activates at 1200m',spurtUsed&&spurtActive);sta=0;step(1/60,0);check('empty stamina ends spurt',!spurtActive);sta=50;input('B');check('cannot reactivate',!spurtActive);resetRun();check('retry restores spurt',!spurtUsed&&!spurtActive);
 const races=[];for(const boost of [false,true]){selected=1;resetRun();mode='run';let n=0;while(mode==='run'&&n<6000){if(n%30===0)input('A');if(boost&&pos>=120&&!spurtUsed)input('B');step(1/60,0);n++}check('30-40 second race '+boost,finishDashRecord>=30&&finishDashRecord<=40);races.push(finishDashRecord)}check('spurt improves finish',races[1]<races[0]);
 console.log('1500m actual seconds',races,'CPU',rivals.map((r,j)=>cpuRaceTime(j,1)));
 for(let i=0;i<3;i++){
 check('clock starts at zero '+i,raceSeconds(i,0,0)===0);
 let previous=-1;for(let n=0;n<=100;n++){const value=raceSeconds(i,n*.2,n/100);check('clock monotonic '+i+' '+n,value>=previous);previous=value}
 check('no cap '+i,raceSeconds(i,100)>raceSeconds(i,30));
 check('CPU ordering '+i,raceSeconds(i,cpuRaceTime(0,i))<raceSeconds(i,cpuRaceTime(2,i)));
 check('saved v1 best uses same conversion '+i,label(i,20)===timeText(i,raceSeconds(i,20))+(i===1?'':'秒'));
 }
 return {count:passed.length,passed};
},spurt(){selected=1;resetRun();showOpening('game');mode='run';pos=120;elapsed=27;spd=10;sta=55;input('B');draw(1000)},scene(i=0){selected=i;resetRun();showOpening('game');pos=i===1?150:i===2?110:100;elapsed=i===0?20:i===1?33.63:16;finishDashRecord=elapsed;mode='finishDash';draw(1000);return $('#screen')},result(i=0){this.scene(i);finish(elapsed);mode='result';$('#resultPanel').hidden=false;draw(1000)}};
