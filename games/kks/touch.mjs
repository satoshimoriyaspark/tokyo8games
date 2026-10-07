// Commit a touch on release, but never turn a scroll into a card selection.
export function bindCardTap(button, onTap, now=()=>performance.now()) {
  let contact=null, suppressClickUntil=0;
  button.addEventListener('pointerdown',e=>{
    if(button.disabled||!e.isPrimary||e.button!==0)return;
    contact={id:e.pointerId,x:e.clientX,y:e.clientY,moved:false};
    button.classList.add('pressed');
  });
  button.addEventListener('pointermove',e=>{
    if(contact?.id!==e.pointerId)return;
    if(Math.hypot(e.clientX-contact.x,e.clientY-contact.y)>12){contact.moved=true;button.classList.remove('pressed')}
  });
  button.addEventListener('pointerup',e=>{
    button.classList.remove('pressed');
    if(contact?.id!==e.pointerId)return;
    const moved=contact.moved||Math.hypot(e.clientX-contact.x,e.clientY-contact.y)>12;
    contact=null;
    if(e.pointerType==='touch'||e.pointerType==='pen'){
      suppressClickUntil=now()+600;
      if(!moved&&!button.disabled){e.preventDefault();onTap()}
    }
  });
  const cancel=()=>{contact=null;button.classList.remove('pressed');suppressClickUntil=now()+600};
  button.addEventListener('pointercancel',cancel);
  button.addEventListener('pointerleave',()=>{if(contact)contact.moved=true;button.classList.remove('pressed')});
  button.addEventListener('click',e=>{
    // Keyboard activation has detail=0 and must remain available.
    if(button.disabled||(e.detail!==0&&now()<suppressClickUntil))return;
    onTap();
  });
}
