(()=>{'use strict';
const YELLOW='#f5c400';
const GEAR=`<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="${YELLOW}" stroke-width="1.65" stroke-linecap="round" stroke-linejoin="round"><path d="M9.50 4.30 L10.44 2.12 L13.56 2.12 L14.50 4.30 L15.68 4.78 L17.88 3.91 L20.09 6.12 L19.22 8.32 L19.70 9.50 L21.88 10.44 L21.88 13.56 L19.70 14.50 L19.22 15.68 L20.09 17.88 L17.88 20.09 L15.68 19.22 L14.50 19.70 L13.56 21.88 L10.44 21.88 L9.50 19.70 L8.32 19.22 L6.12 20.09 L3.91 17.88 L4.78 15.68 L4.30 14.50 L2.12 13.56 L2.12 10.44 L4.30 9.50 L4.78 8.32 L3.91 6.12 L6.12 3.91 L8.32 4.78 Z"/><circle cx="12" cy="12" r="3.15"/></svg>`;
function applyGear(){
  const icon=document.querySelector('[data-evia-tool="settings"] .evia-tool-icon');
  if(!icon)return;
  if(icon.dataset.eviaGear==='2')return;
  icon.innerHTML=GEAR;
  icon.dataset.eviaGear='2';
}
function start(){
  applyGear();
  const menu=document.getElementById('eviaToolsMenu');
  if(menu)new MutationObserver(applyGear).observe(menu,{childList:true,subtree:true});
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();
