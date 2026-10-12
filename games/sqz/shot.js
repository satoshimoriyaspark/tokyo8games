/* Supplied keeper v2: 8 fixed-size, 80 × 80 RGBA frames per direction.
 * One clock drives kick, ball, keeper, net and banner. No CSS loop/restart. */
(function (root) {
  'use strict';
  const ASSET = '/games/sqz/assets/keeper-v2/keeper_atlas.png';
  const clamp = n => Math.max(0, Math.min(1, n));
  const lerp = (a, b, t) => a + (b - a) * t;
  const smooth = t => t * t * (3 - 2 * t);
  const DIVE_START = 350, FRAME_MS = 110, CONTACT = 790, END = 1750;
  // Glove centers in the original 80px cells, measured without editing the PNG.
  const GLOVES = [[48,39],[48,30],[49,20],[43,8],[35,3],[37,6],[48,20],[52,39]];
  function pose(ms, ok, side = 'right', superShot = false) {
    const sign = side === 'right' ? 1 : -1;
    const progress = clamp((ms - DIVE_START) / (7 * FRAME_MS));
    const frame = Math.min(7, Math.floor(Math.max(0, ms - DIVE_START) / FRAME_MS));
    const travel = smooth(progress);
    const keeper = {frame, x:120 + sign * 66 * travel, y:28 - Math.sin(progress * Math.PI) * 8};
    const g = GLOVES[frame];
    const glove = {x:keeper.x + (side === 'right' ? g[0] : 80-g[0]), y:keeper.y+g[1]};
    // Contact is deliberately aligned with frame 4. From then on the caught
    // ball follows the same glove anchor as landing, never an independent path.
    const cp = clamp((CONTACT-DIVE_START)/(7*FRAME_MS));
    const contact = {x:120+sign*66*smooth(cp)+(side==='right'?35:45), y:28-Math.sin(cp*Math.PI)*8+3};
    const target = ok ? {x:side==='right'?96:224,y:48} : contact;
    const flight = clamp((ms-280)/(CONTACT-280));
    let ball = {x:lerp(111,target.x,flight),y:lerp(142,target.y,flight)-Math.sin(flight*Math.PI)*21,scale:lerp(1,.68,flight)};
    if (ms >= CONTACT) ball = ok
      ? {x:target.x,y:lerp(target.y,80,clamp((ms-CONTACT)/270)),scale:.68}
      : {...glove,scale:.68};
    return {keeper,ball,flight,caught:!ok&&ms>=CONTACT,goal:ok&&ms>=CONTACT,
      net:ok&&ms>=CONTACT?Math.sin((ms-CONTACT)/45)*Math.exp(-(ms-CONTACT)/230)*5:0,
      banner:ms>=CONTACT+110,superShot:ok&&superShot,kick:Math.sin(clamp((ms-110)/430)*Math.PI)*-76,
      run:Math.sin(clamp(ms/280)*Math.PI)*4,done:ms>=END};
  }
  function markup() {
    return `<div class="shot-world" aria-hidden="true"><div class="shot-goal"><div class="goal-net"></div></div><div class="keeper-sprite"><img src="${ASSET}" width="640" height="160" alt="" draggable="false"></div><div class="player striker"><i class="head"></i><i class="body"></i><i class="arm"></i><i class="arm right"></i><i class="leg"></i><i class="leg right"></i></div><div class="shot-trail" hidden></div><div class="ball"></div><div class="shot-banner" hidden></div><div class="shot-combo" hidden>SUPER SHOT!</div></div>`;
  }
  function create(element, options) {
    const {ok,side='right',superShot=false,onComplete=()=>{}}=options;
    const $=s=>element.querySelector(s),sprite=$('.keeper-sprite'),img=$('.keeper-sprite img');
    const ball=$('.ball'),net=$('.goal-net'),leg=$('.striker .leg.right'),striker=$('.striker');
    const banner=$('.shot-banner'),trail=$('.shot-trail'),combo=$('.shot-combo');
    let active=true,raf=0,started=false,start=0,loadTimer=0;
    element.dataset.shotState='waiting';
    element.dataset.shotSide=side;
    element.dataset.superShot=String(ok&&superShot);
    function draw(ms) {
      const p=pose(ms,ok,side,superShot);
      img.style.transform=`translate(${-80*p.keeper.frame}px, ${side==='right'?0:-80}px)`;
      sprite.style.transform=`translate(${p.keeper.x}px, ${p.keeper.y}px)`;
      ball.style.transform=`translate(${p.ball.x}px, ${p.ball.y}px) translate(-50%, -50%) scale(${p.ball.scale}) rotate(${ms/4}deg)`;
      net.style.transform=`translateX(${p.net}px)`;
      leg.style.transform=`rotate(${p.kick}deg)`;
      striker.style.transform=`translateX(${p.run}px)`;
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
  root.SQZShot=Object.freeze({markup,create,pose,duration:END});
})(typeof window!=='undefined'?window:globalThis);
