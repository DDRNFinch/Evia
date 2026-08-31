(()=>{'use strict';
const YELLOW='#f5c400';
const GEAR=`<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="${YELLOW}" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M9.6 3.1 10 1.8h4l.4 1.3c.8.2 1.5.5 2.2.9l1.2-.6 2 3.4-1.1.8c.2.8.2 1.6 0 2.4l1.1.8-2 3.4-1.2-.6c-.7.4-1.4.7-2.2.9L14 17.8h-4l-.4-1.3c-.8-.2-1.5-.5-2.2-.9l-1.2.6-2-3.4 1.1-.8a7.5 7.5 0 0 1 0-2.4l-1.1-.8 2-3.4 1.2.6c.7-.4 1.4-.7 2.2-.9Z" transform="translate(0 2.2) scale(1 .9)"/><circle cx="12" cy="12" r="2.8"/></svg>`;
function applyGear(){
  const icon=document.querySelector('[data-evia-tool="settings"] .evia-tool-icon');
  if(!icon)return;
  if(icon.dataset.eviaGear==='1')return;
  icon.innerHTML=GEAR;
  icon.dataset.eviaGear='1';
}
function start(){
  applyGear();
  const menu=document.getElementById('eviaToolsMenu');
  if(menu)new MutationObserver(applyGear).observe(menu,{childList:true,subtree:true});
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();
