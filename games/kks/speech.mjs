// Browser speech adapter: no third-party service, microphone, or audio uploads.
// Keep the initial speak() synchronous with the player's tap (mobile activation).
export class KarutaSpeech {
  constructor({scope=globalThis,startTimeout=5000,retryDelay=800}={}) {
    this.scope=scope;
    this.synth=scope.speechSynthesis;
    this.Utterance=scope.SpeechSynthesisUtterance;
    this.startTimeout=startTimeout;
    this.retryDelay=retryDelay;
    this.voices=[];
    this.job=null;
    this.poll=null;
    this.onVoices=()=>this.refreshVoices();
    this.synth?.addEventListener?.('voiceschanged',this.onVoices);
    this.prime();
  }
  get supported() {
    return !!this.synth&&typeof this.Utterance==='function'&&
      typeof this.synth.speak==='function'&&typeof this.synth.cancel==='function';
  }
  refreshVoices() {
    try { this.voices=Array.from(this.synth?.getVoices?.()||[]); }
    catch { this.voices=[]; }
    return this.voices.filter(v=>/^ja(?:[-_]|$)/i.test(v.lang||''))
      .sort((a,b)=>(Number(!!b.localService)*2+Number(!!b.default))-
                    (Number(!!a.localService)*2+Number(!!a.default)));
  }
  prime() {
    clearTimeout(this.poll);
    if(!this.supported)return;
    let remaining=15;
    const poll=()=>{
      if(this.refreshVoices().length||remaining--<=0)return;
      this.poll=setTimeout(poll,150);
    };
    poll();
  }
  detach(job) {
    clearTimeout(job?.timer);
    if(job?.utterance)job.utterance.onstart=job.utterance.onend=job.utterance.onerror=null;
  }
  cancelNative() {
    try { this.synth?.cancel(); } catch { /* Some in-app browsers expose an incomplete API. */ }
  }
  cancel() {
    const old=this.job;
    this.job=null; // Invalidate callbacks BEFORE cancel(), which can dispatch synchronously.
    this.detach(old);
    if(old||this.synth?.speaking||this.synth?.pending)this.cancelNative();
  }
  read(text,{rate=1,onstart=()=>{},onend=()=>{},onerror=()=>{}}={}) {
    this.cancel();
    if(!this.supported){onerror('unsupported');return;}
    if(typeof text!=='string'||!text.trim()){onerror('invalid-argument');return;}
    const job={text,rate:Number.isFinite(Number(rate))?Math.min(2,Math.max(0.5,Number(rate))):1,
      onstart,onend,onerror,attempt:0,started:false,utterance:null,timer:null,previousVoice:null};
    this.job=job;
    this.attempt(job); // No await, Promise, or timer before the first speak().
  }
  attempt(job) {
    if(this.job!==job)return;
    this.detach(job);
    const voices=this.refreshVoices();
    // After a failed named voice, try another Japanese voice or the system's ja-JP choice.
    const voice=job.attempt?voices.find(v=>v!==job.previousVoice):voices[0];
    let u;
    try { u=new this.Utterance(job.text); }
    catch { this.finish(job,'unsupported');return; }
    job.utterance=u; // Keep a strong reference until completion/cancellation.
    u.lang='ja-JP';u.rate=job.rate;u.pitch=1;u.volume=1;
    if(voice)u.voice=voice;
    job.previousVoice=voice;
    const current=()=>this.job===job&&job.utterance===u;
    u.onstart=()=>{
      if(!current()||job.started)return;
      job.started=true;clearTimeout(job.timer);job.onstart();
    };
    u.onend=()=>{
      if(!current())return;
      this.finish(job,job.started?null:'start-unconfirmed');
    };
    u.onerror=e=>{if(current())this.fail(job,e?.error||'synthesis-failed');};
    job.timer=setTimeout(()=>{
      if(current()&&!job.started)this.fail(job,'start-timeout');
    },this.startTimeout);
    try {
      // Avoid an unconditional resume() before every phrase on mobile engines.
      if(this.synth.paused)this.synth.resume?.();
      this.synth.speak(u);
    } catch(e) {
      if(current())this.fail(job,e?.name==='NotAllowedError'?'not-allowed':'synthesis-failed');
    }
  }
  fail(job,code) {
    if(this.job!==job)return;
    const retryable=['voice-unavailable','language-unavailable','synthesis-unavailable',
      'synthesis-failed','audio-busy','network','start-timeout'].includes(code);
    if(!job.started&&job.attempt===0&&retryable){
      this.detach(job);
      job.utterance=null; // Ignore even previously captured callbacks from the old utterance.
      this.cancelNative();
      job.attempt=1;
      job.timer=setTimeout(()=>this.attempt(job),this.retryDelay);
      return;
    }
    this.finish(job,code);
  }
  finish(job,error) {
    if(this.job!==job)return;
    this.job=null;
    this.detach(job);
    if(error){this.cancelNative();job.onerror(error);}
    else job.onend();
  }
  dispose() {
    this.cancel();clearTimeout(this.poll);
    this.synth?.removeEventListener?.('voiceschanged',this.onVoices);
  }
}

export function speechHelp(code,userAgent=globalThis.navigator?.userAgent||'') {
  const android=/Android/i.test(userAgent);
  if(code==='not-allowed')return '再生が許可されませんでした。音声ボタンを直接タップしてください。アプリ内で開いている場合は、ChromeやSafariで開きなおしてください。';
  if(code==='unsupported')return android?
    'このブラウザーでは読み上げ機能を使えません。Chromeで開いて、もういちどお試しください。':
    'このブラウザーでは読み上げ機能を使えません。SafariやChromeで開いて、もういちどお試しください。';
  if(android)return 'メディア音量を確認してください。端末の「設定」で「テキスト読み上げ」を検索し、日本語の音声データとサンプル再生を確認してください。アプリ内で開いている場合は、Chromeで開きなおしてください。';
  return '音量と出力先を確認して、もういちどお試しください。端末の日本語読み上げ設定や、Safari・Chromeでの再生も確認してください。';
}
