'use strict';
// All artwork is loaded as original PNG files. No palette, base64 or pixel decoding.
window.ArySprites = (() => {
  const specs = {
    ride: { file: 'ary_ride_game.png', width: 64, height: 80, count: 6,
      anchors: [[55,78],[51,77],[49,77],[46,77],[55,77],[45,76]] },
    jump: { file: 'ary_jump.png', width: 72, height: 88, count: 5 },
    double: { file: 'ary_double_jump.png', width: 72, height: 88, count: 3 },
    slide: { file: 'ary_slide.png', width: 72, height: 88, count: 3 },
    chip: { file:'hatena-chip.png', width:16, height:16, count:4, optional:true },
    cat: { file: 'ary_cat.png', width: 48, height: 48, count: 2, optional: true }
  };
  const assets = Object.fromEntries(Object.keys(specs).map(key => [key, {state:'loading', image:null}]));
  let notify = () => {};
  function ready() { return Object.entries(specs).every(([key,s]) => s.optional || assets[key].state === 'ready'); }
  function status() { return Object.fromEntries(Object.entries(assets).map(([key,a]) => [key,a.state])); }
  function load(key) {
    const spec = specs[key], asset = assets[key], img = new Image();
    asset.state = 'loading'; asset.error = ''; notify();
    return new Promise(resolve => {
      let finished = false;
      const finish = error => {
        if(finished) return;
        finished = true; clearTimeout(timeout);
        asset.state = error ? 'error' : 'ready'; asset.error = error || '';
        if(!error) asset.image = img;
        notify(); resolve();
      };
      const timeout = setTimeout(() => finish('画像の読み込みがタイムアウトしました'), 15000);
      img.onload = () => finish(img.naturalWidth === spec.width * spec.count && img.naturalHeight === spec.height
        ? '' : 'スプライト画像のサイズが一致しません');
      img.onerror = () => finish('画像を読み込めませんでした');
      img.src = '/games/ary/assets/' + spec.file;
    });
  }
  async function loadAll() { await Promise.all(Object.keys(specs).filter(key => assets[key].state !== 'ready').map(load)); }
  function pose(p, tick) {
    if(p.slide > 0) return {key:'slide', frame:p.slide > 36 ? 0 : p.slide > 6 ? 1 : 2};
    if(p.j > 0) {
      if(p.j === 2) return {key:'double', frame:p.jumpAge < 5 ? 0 : p.vy < .6 ? 1 : 2};
      return {key:'jump', frame:p.jumpAge < 5 ? 0 : p.vy < -.8 ? 1 : p.vy <= .8 ? 2 : 3};
    }
    if(p.land > 0) return {key:'jump', frame:4};
    return {key:'ride', frame:Math.floor(tick / 5) % 6}; // 60Hz simulation / 5 = 12fps
  }
  let lastPose = {key:'ride',frame:0};
  function draw(ctx, selected, frontX, roadY, scale = .75) {
    let {key,frame} = selected;
    if(specs[key].optional && assets[key].state !== 'ready') return false;
    if(assets[key].state !== 'ready') { key = 'ride'; frame = lastPose.key === 'ride' ? lastPose.frame : 0; }
    const asset = assets[key], spec = specs[key];
    if(!asset || !asset.image) return false;
    frame = Math.max(0, Math.min(spec.count - 1, frame | 0));
    const anchor = spec.anchors ? spec.anchors[frame] : [spec.width - 9, spec.height - 3];
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(asset.image, frame*spec.width, 0, spec.width, spec.height,
      Math.round((frontX-anchor[0]*scale)*3)/3, Math.round((roadY-anchor[1]*scale)*3)/3, spec.width*scale, spec.height*scale);
    lastPose = {key,frame};
    return true;
  }
  function drawChip(ctx,x,y,tick){
    if(assets.chip.state!=='ready')return false;
    const phase=tick%120,frame=phase<30?1+Math.floor(phase/10):0;
    ctx.imageSmoothingEnabled=false;
    ctx.drawImage(assets.chip.image,frame*16,0,16,16,Math.round((x-2)*3)/3,Math.round((y-2)*3)/3,16,16);
    return true;
  }
  return {ready, status, loadAll, pose, draw, drawChip, specs,
    onChange(fn) { notify = fn; notify(); },
    errors() { return Object.values(assets).filter(a => a.error).map(a => a.error); }
  };
})();
