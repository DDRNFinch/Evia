(()=>{'use strict';
const ID='eviaEpaUiFixV1Styles';
if(document.getElementById(ID))return;
const s=document.createElement('style');
s.id=ID;
s.textContent=`
#screen .evia-epa-avatar-v2{
  position:relative;
  background:transparent!important;
  border:3px solid var(--evia-yellow,#f5c400)!important;
  box-shadow:none!important;
  filter:drop-shadow(0 0 4px rgba(245,196,0,.55)) drop-shadow(0 0 11px rgba(245,196,0,.28)) drop-shadow(0 0 24px rgba(245,196,0,.13));
  overflow:visible;
}
#screen .evia-epa-avatar-v2::before{
  content:"";
  position:absolute;
  inset:10%;
  border-radius:50%;
  background:radial-gradient(circle at center,rgba(245,196,0,.22),rgba(245,196,0,.08) 46%,rgba(245,196,0,0) 76%);
  filter:blur(10px);
  transform:scale(1.12);
  pointer-events:none;
  z-index:0;
}
#screen .evia-epa-eyes-v2{position:relative;z-index:1;gap:13px!important;}
#screen .evia-epa-eye-v2{
  width:28px!important;
  height:28px!important;
  border:2.6px solid var(--evia-yellow,#f5c400)!important;
  background:transparent!important;
  border-radius:50%;
}
#screen .evia-epa-zone-v2.settled .evia-epa-avatar-v2{border-width:2px!important;}
#screen .evia-epa-zone-v2.settled .evia-epa-eyes-v2{gap:8px!important;}
#screen .evia-epa-zone-v2.settled .evia-epa-eye-v2{width:18px!important;height:18px!important;border-width:1.8px!important;}
#screen .evia-epa-speech-v2{
  width:min(calc(100vw - 38px),470px)!important;
  min-height:48px!important;
  padding:12px 16px!important;
  border:1px solid rgba(245,196,0,.16)!important;
  border-radius:22px!important;
  background:rgba(250,249,242,.98)!important;
  box-shadow:0 7px 22px rgba(0,0,0,.12)!important;
  color:#333!important;
  display:flex;
  align-items:center;
  justify-content:center;
}
#screen .evia-epa-zone-v2.settled .evia-epa-speech-v2{margin-top:8px!important;font-size:13px!important;}
#screen .evia-epa-panel-v2{top:calc(max(16px,env(safe-area-inset-top)) + 166px)!important;}
#screen .evia-epa-zone-v2 .epa-v2-card>strong{color:#fff7d2!important;}
#screen .evia-epa-zone-v2 .epa-v2-card p,
#screen .evia-epa-zone-v2 .epa-v2-list,
#screen .evia-epa-zone-v2 .epa-v2-note{color:rgba(250,245,219,.84)!important;}
#screen .evia-epa-zone-v2 .epa-v2-btn{color:#f5e7a9!important;}
#screen .evia-epa-zone-v2 .epa-v2-btn.primary{color:#fff2b6!important;}
#screen .evia-epa-zone-v2 .epa-v2-answer{color:#f3efdb!important;}
#screen .evia-epa-zone-v2 .epa-v2-q{color:#fff7d2!important;}
#screen .evia-epa-zone-v2 .epa-v2-timer,
#screen .evia-epa-zone-v2 .epa-v2-record,
#screen .evia-epa-zone-v2 .epa-v2-score{color:#ebca53!important;}
#screen .evia-epa-zone-v2 .epa-v2-status{color:rgba(250,245,219,.68)!important;}
`;
document.head.appendChild(s);
Object.defineProperty(globalThis,'EVIA_EPA_UI_FIX_V1',{value:true,writable:false,configurable:false});
})();
