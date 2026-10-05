const RECIPIENT='satoshimoriya@gmail.com';

function clean(value,max){
  return String(value??'').trim().slice(0,max);
}
function escapeHtml(str){
  return str.replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
}

module.exports=async function handler(req,res){
  if(req.method!=='POST'){
    res.setHeader('Allow','POST');
    return res.status(405).json({error:'Method not allowed'});
  }

  const origin=req.headers.origin||'';
  if(origin && !/^https:\/\/(www\.)?tokyo8games\.com$/i.test(origin) && !/\.vercel\.app$/i.test(origin)){
    return res.status(403).json({error:'Invalid origin'});
  }

  const body=req.body||{};
  const website=clean(body.website,200);
  if(website) return res.status(200).json({ok:true});

  const name=clean(body.name,80);
  const email=clean(body.email,160);
  const type=clean(body.type,80);
  const subject=clean(body.subject,120);
  const message=clean(body.message,3000);

  if(!name||!email||!type||!subject||!message){
    return res.status(400).json({error:'入力内容を確認してください'});
  }
  if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)){
    return res.status(400).json({error:'メールアドレスを確認してください'});
  }

  const apiKey=process.env.RESEND_API_KEY;
  if(!apiKey){
    return res.status(503).json({error:'メール送信設定が未完了です'});
  }

  const from=process.env.RESEND_FROM || 'TOKYO 8 GAMES <onboarding@resend.dev>';
  const mailSubject='【TOKYO 8 GAMES】'+subject;
  const text=[
    'TOKYO 8 GAMES Webサイトからのお問い合わせ',
    '',
    'お名前: '+name,
    'メールアドレス: '+email,
    'お問い合わせ種別: '+type,
    '件名: '+subject,
    '',
    'お問い合わせ内容:',
    message
  ].join('\n');

  const html='<h2>TOKYO 8 GAMES Webサイトからのお問い合わせ</h2>'+
    '<table cellpadding="8" cellspacing="0" border="1" style="border-collapse:collapse">'+
    '<tr><th align="left">お名前</th><td>'+escapeHtml(name)+'</td></tr>'+
    '<tr><th align="left">メールアドレス</th><td>'+escapeHtml(email)+'</td></tr>'+
    '<tr><th align="left">お問い合わせ種別</th><td>'+escapeHtml(type)+'</td></tr>'+
    '<tr><th align="left">件名</th><td>'+escapeHtml(subject)+'</td></tr></table>'+
    '<h3>お問い合わせ内容</h3><p style="white-space:pre-wrap">'+escapeHtml(message)+'</p>';

  try{
    const r=await fetch('https://api.resend.com/emails',{
      method:'POST',
      headers:{
        'Authorization':'Bearer '+apiKey,
        'Content-Type':'application/json'
      },
      body:JSON.stringify({
        from,
        to:[RECIPIENT],
        reply_to:email,
        subject:mailSubject,
        text,
        html
      })
    });
    const result=await r.json().catch(()=>({}));
    if(!r.ok){
      console.error('Resend error',r.status,result);
      return res.status(502).json({error:'メール送信に失敗しました'});
    }
    return res.status(200).json({ok:true,id:result.id||null});
  }catch(err){
    console.error('Contact error',err);
    return res.status(500).json({error:'メール送信に失敗しました'});
  }
};