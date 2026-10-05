const form=document.querySelector('#contact-form');
const statusEl=document.querySelector('#form-status');
const submitBtn=form?.querySelector('button[type="submit"]');
form?.addEventListener('submit',async(e)=>{
  e.preventDefault();
  if(!form.reportValidity()) return;
  const data=new FormData(form);
  if(data.get('_honey')) return;
  const payload={
    name:String(data.get('お名前')||'').trim(),
    email:String(data.get('email')||'').trim(),
    type:String(data.get('お問い合わせ種別')||'').trim(),
    subject:String(data.get('件名')||'').trim(),
    message:String(data.get('お問い合わせ内容')||'').trim(),
    website:String(data.get('_honey')||'').trim()
  };
  if(statusEl) statusEl.textContent='SENDING...';
  if(submitBtn){submitBtn.disabled=true;submitBtn.textContent='SENDING...';}
  try{
    const res=await fetch('/api/contact',{
      method:'POST',
      headers:{'Content-Type':'application/json','Accept':'application/json'},
      body:JSON.stringify(payload)
    });
    const body=await res.json().catch(()=>({}));
    if(!res.ok) throw new Error(body.error||'送信に失敗しました');
    window.location.href='/thanks.html';
  }catch(err){
    if(statusEl) statusEl.textContent='送信できませんでした。時間をおいてもう一度お試しください。';
    if(submitBtn){submitBtn.disabled=false;submitBtn.textContent='MESSAGE SEND ▶';}
  }
});