/* Draw once; two compositor animations replace 84 independent particle animations. */
(function(){
 const shown=new Set(),tones=['#E3AE45','#A8BFA0','#E9B79C','#F3D58A','#698362'];
 class SaveCelebration extends HTMLElement {
  static get observedAttributes(){return ['record-id'];}
  connectedCallback(){this.play();}
  attributeChangedCallback(){if(this.isConnected)this.play();}
  disconnectedCallback(){this.stop();}
  stop(){clearTimeout(this.timer);this.timer=null;this.motion?.removeEventListener?.('change',this.onMotion);this.replaceChildren();}
  play(){
   const id=this.getAttribute('record-id'),motion=window.matchMedia?.('(prefers-reduced-motion: reduce)');
   if(!id||shown.has(id)||motion?.matches)return;
   shown.add(id);this.stop();this.setAttribute('aria-hidden','true');this.motion=motion;
   this.onMotion=()=>{if(motion?.matches)this.stop();};motion?.addEventListener?.('change',this.onMotion);
   const rect=this.getBoundingClientRect(),width=rect.width||Math.min(window.innerWidth,440),height=rect.height||window.innerHeight;
   const ratio=Math.min(window.devicePixelRatio||1,1.5);
   const layers=[];
   for(let layer=0;layer<2;layer++){
    const canvas=this.ownerDocument.createElement('canvas'),ctx=canvas.getContext('2d');if(!ctx)continue;
    canvas.width=Math.round(width*ratio);canvas.height=Math.round(height*1.2*ratio);ctx.setTransform(ratio,0,0,ratio,0,0);
    for(let i=0;i<42;i++){
     const n=i+layer*42,x=((i*37+layer*17)%101)*width/100,y=((i*43+layer*29)%101)*height*1.2/100,w=4+n%4,h=7+n%5;
     ctx.save();ctx.globalAlpha=.94;ctx.fillStyle=tones[n%tones.length];ctx.translate(x,y);ctx.rotate(n*2.4);
     if(n%5===0){ctx.beginPath();ctx.arc(0,0,w/2,0,Math.PI*2);ctx.fill();}else ctx.fillRect(-w/2,-h/2,w,h);
     ctx.restore();
    }
    layers.push(canvas);
   }
   if(!layers.length){this.stop();return;}
   this.replaceChildren(...layers);this.timer=setTimeout(()=>this.stop(),3700);
  }
 }
 if(!customElements.get('mew-save-celebration'))customElements.define('mew-save-celebration',SaveCelebration);
})();
