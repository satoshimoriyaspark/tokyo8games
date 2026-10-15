window.audioQA={ready:()=>spriteReady,report:()=>({mode,openingPage,rank:ceremonyRank,newRecord:resultNewRecord,...music.status()}),async scene(kind){
 await unlockStartAudio();
 if(kind==='opening'){mode='menu';showOpening('title');}
 else if(kind==='menu'){mode='menu';showOpening('game');}
 else if(kind==='ready'){selected=0;showOpening('game');begin();}
 else if(kind==='go'){selected=0;showOpening('game');mode='ready';deadline=performance.now();step(0,deadline);}
 else if(kind==='goal'){mode='finishDash';syncUI();}
 else if(kind==='retry'){begin();}
 else if(kind==='mute'){toggleSound();}
 else{selected=0;cup=false;showOpening('game');best[0]=kind==='record'||kind==='both'?100:1;finish(kind==='champion'||kind==='both'?10:40);ceremonyTime=3.7;step(0,performance.now());}
 syncUI();draw(1000);
}};
