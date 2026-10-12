/* Reference-matched character v3 atlas: constant anatomical scale, 8 dive poses.
 * One clock drives kick, ball, keeper, net and banner. No CSS loop/restart. */
(function (root) {
  'use strict';
  const ASSET = '/games/sqz/assets/characters-v3/characters-atlas.png';
  const SCALE=.30, ATLAS_SIZE=1254;
  // Source rectangles and body anchors preserve the generated art without stretching.
  const KEEPER=[[60, 98, 178, 216, 152, 236, 205, 237], [349, 115, 220, 199, 460, 250, 539, 238], [662, 103, 234, 211, 768, 241, 862, 239], [962, 61, 273, 247, 1102, 209, 1195, 140], [35, 402, 301, 198, 172, 527, 301, 480], [344, 418, 299, 182, 486, 546, 607, 510], [656, 473, 292, 157, 788, 587, 914, 578], [964, 500, 282, 138, 1105, 604, 1218, 609]];
  const STRIKER=[[60, 703, 175, 233, 150, 927], [349, 703, 200, 239, 450, 933], [674, 703, 205, 239, 778, 933], [981, 695, 232, 247, 1075, 933], [57, 961, 225, 257, 147, 1207], [378, 974, 176, 244, 465, 1207], [684, 976, 223, 249, 787, 1214], [1018, 1015, 181, 210, 1081, 1214]];
  const clamp = n => Math.max(0, Math.min(1, n));
  const lerp = (a, b, t) => a + (b - a) * t;
  const smooth = t => t * t * (3 - 2 * t);
  const DIVE_START = 350, FRAME_MS = 110, CONTACT = 790, END = 1750;
  function keeperAt(ms,side){
    const sign=side==='right'?1:-1,progress=clamp((ms-DIVE_START)/(7*FRAME_MS));
    const frame=Math.min(7,Math.floor(Math.max(0,ms-DIVE_START)/FRAME_MS));
    const x=160+sign*42*smooth(progress);
    const y=74-Math.sin(progress*Math.PI)*18+20*smooth(clamp((progress-.65)/.35));
    const k=KEEPER[frame];
    return {frame,x,y,glove:{x:x+sign*(k[6]-k[4])*SCALE,y:y+(k[7]-k[5])*SCALE}};
  }
  function pose(ms, ok, side = 'right', superShot = false) {
    const keeper=keeperAt(ms,side),glove=keeper.glove;
    const contact=keeperAt(CONTACT,side).glove;
    const target = ok ? {x:side==='right'?96:224,y:48} : contact;
    const flight = clamp((ms-280)/(CONTACT-280));
    let ball = {x:lerp(122,target.x,flight),y:lerp(149,target.y,flight)-Math.sin(flight*Math.PI)*21,scale:lerp(1,.68,flight)};
    if(ms<280){const approach=smooth(clamp((ms-100)/180));ball={x:lerp(112,122,approach),y:lerp(168,149,approach),scale:1};}
    if (ms >= CONTACT) ball = ok
      ? {x:target.x,y:lerp(target.y,80,clamp((ms-CONTACT)/270)),scale:.68}
      : {...glove,scale:.68};
    return {keeper,ball,flight,caught:!ok&&ms>=CONTACT,goal:ok&&ms>=CONTACT,
      net:ok&&ms>=CONTACT?Math.sin((ms-CONTACT)/45)*Math.exp(-(ms-CONTACT)/230)*5:0,
      banner:ms>=CONTACT+110,superShot:ok&&superShot,kick:Math.sin(clamp((ms-110)/430)*Math.PI)*-76,
      run:4*smooth(clamp(ms/280)),strikerFrame:ms<70?0:ms<150?1:ms<260?2:ms<360?3:ms<470?4:ms<900?5:ok?6:7,done:ms>=END};
  }
  function spriteStyle(frame,x,y,mirror=false){
    const [sx,sy,w,h,ax,ay]=frame;
    const anchorX=mirror?w-(ax-sx):ax-sx;
    return {box:`width:${w*SCALE}px;height:${h*SCALE}px;transform:translate(${x-anchorX*SCALE}px,${y-(ay-sy)*SCALE}px)${mirror?' scaleX(-1)':''}`,
      image:`width:${ATLAS_SIZE*SCALE}px;height:${ATLAS_SIZE*SCALE}px;transform:translate(${-sx*SCALE}px,${-sy*SCALE}px)`};
  }
  function spriteMarkup(name,frame,x,y,mirror=false){
    const style=spriteStyle(frame,x,y,mirror);
    return `<div class="character-sprite ${name}-sprite" style="${style.box}"><img src="${ASSET}" width="1254" height="1254" style="${style.image}" alt="" draggable="false"></div>`;
  }
  function markup() {
    return `<div class="shot-world" aria-hidden="true"><div class="shot-goal"><div class="goal-net"></div></div>${spriteMarkup('keeper',KEEPER[0],160,74,true)}${spriteMarkup('striker',STRIKER[0],85,174)}<div class="shot-trail" hidden></div><div class="ball"></div><div class="shot-banner" hidden></div><div class="shot-combo" hidden>SUPER SHOT!</div></div>`;
  }
  function create(element, options) {
    const {ok,side='right',superShot=false,onComplete=()=>{}}=options;
    const $=s=>element.querySelector(s),sprite=$('.keeper-sprite'),img=$('.keeper-sprite img');
    const ball=$('.ball'),net=$('.goal-net'),striker=$('.striker-sprite'),strikerImg=$('.striker-sprite img');
    const banner=$('.shot-banner'),trail=$('.shot-trail'),combo=$('.shot-combo');
    let active=true,raf=0,started=false,start=0,loadTimer=0;
    element.dataset.shotState='waiting';
    element.dataset.shotSide=side;
    element.dataset.superShot=String(ok&&superShot);
    function draw(ms) {
      const p=pose(ms,ok,side,superShot);
      // Face the striker while set; turn toward the selected side on take-off.
      const kStyle=spriteStyle(KEEPER[p.keeper.frame],p.keeper.x,p.keeper.y,p.keeper.frame===0||side==='left');
      sprite.style.cssText=kStyle.box;img.style.cssText=kStyle.image;
      const sStyle=spriteStyle(STRIKER[p.strikerFrame],85+p.run,174);
      striker.style.cssText=sStyle.box;strikerImg.style.cssText=sStyle.image;
      ball.style.transform=`translate(${p.ball.x}px, ${p.ball.y}px) translate(-50%, -50%) scale(${p.ball.scale}) rotate(${ms/4}deg)`;
      net.style.transform=`translateX(${p.net}px)`;
      banner.hidden=!p.banner;
      banner.innerHTML=ok?`GOAL!<small>${superShot?'スーパーゴール！':'ナイスシュート！'}</small>`:'SAVE!<small>キーパーがセーブ！</small>';
      combo.hidden=!(p.superShot&&ms<CONTACT);
      trail.hidden=!(p.superShot&&p.flight>0&&p.flight<1);
      trail.style.transform=`translate(${p.ball.x-32}px, ${p.ball.y}px) rotate(-45deg)`;
      element.dataset.shotState=p.banner?'result':p.caught?'caught':p.goal?'goal':ms>=280?'flight':'kick';
    }
    function finish() {
      if(!active)return;
      active=false;clearTimeout(loadTimer);cancelAnimationFrame(raf);draw(END);element.dataset.shotState='complete';onComplete();
    }
    function tick(now) {
      if(!active||!element.isConnected)return;
      const elapsed=now-start;draw(elapsed);
      if(elapsed>=END)finish();else raf=requestAnimationFrame(tick);
    }
    function begin() {
      if(!active||started)return;
      started=true;
      if(root.matchMedia?.('(prefers-reduced-motion: reduce)').matches){finish();return;}
      const launch=()=>{if(!active)return;clearTimeout(loadTimer);start=performance.now();raf=requestAnimationFrame(tick);};
      // A missing sprite must not strand the quiz or be replaced by fake art.
      if(img.complete){if(img.naturalWidth)launch();else finish();}
      else {loadTimer=setTimeout(finish,3000);img.addEventListener('load',launch,{once:true});img.addEventListener('error',finish,{once:true});}
    }
    draw(0);
    return {begin,skip:finish,cancel(){active=false;clearTimeout(loadTimer);cancelAnimationFrame(raf);},get active(){return active;}};
  }
  root.SQZShot=Object.freeze({markup,create,pose,duration:END,asset:ASSET,scale:SCALE,keeperFrames:KEEPER,strikerFrames:STRIKER});
})(typeof window!=='undefined'?window:globalThis);
