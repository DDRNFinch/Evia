(()=>{'use strict';
const STYLE_ID='eviaCaptureControlsRingsV2Styles';
const SVG_NS='http://www.w3.org/2000/svg';
const YELLOW='#f5c400';
let bypassNative=false;
let audioStartedAt=0;
let audioTimerId=0;

function root(){try{return typeof screen!=='undefined'&&screen?.classList?screen:document.getElementById('screen')}catch{return document.getElementById('screen')}}
function liveRecorder(){try{return typeof recorder!=='undefined'&&recorder&&recorder.state==='recording'}catch{return false}}
function formatTime(ms){const total=Math.max(0,Math.floor(Number(ms||0)/1000)),m=Math.floor(total/60),s=total%60;return `${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`}

function injectStyles(){
  if(document.getElementById(STYLE_ID))return;
  const style=document.createElement('style');style.id=STYLE_ID;style.textContent=`
    .bottom-arches{height:78px!important;align-items:end!important;padding:0 5px 3px!important;overflow:visible!important}
    .bottom-arches .status-arch{position:relative!important;width:min(100%,68px)!important;height:76px!important;padding:0!important;overflow:visible!important;display:block!important;background:transparent!important;border:0!important;box-shadow:none!important}
    .bottom-arches .status-arch .arch-progress-svg{position:absolute!important;left:50%!important;top:0!important;width:60px!important;height:60px!important;transform:translateX(-50%)!important;overflow:visible!important;z-index:1!important}
    .bottom-arches .status-arch-value{position:absolute!important;left:50%!important;top:30px!important;transform:translate(-50%,-50%)!important;width:54px!important;font-size:13px!important;line-height:1!important;font-weight:700!important;text-align:center!important;z-index:4!important}
    .bottom-arches .status-arch-label{position:absolute!important;left:50%!important;top:62px!important;bottom:auto!important;transform:translateX(-50%)!important;font-size:9.5px!important;line-height:1!important;font-weight:700!important;white-space:nowrap!important;text-align:center!important;z-index:4!important}
    .bottom-arches .evia-circle-track-v2,.bottom-arches .evia-circle-fill-v2{fill:none;vector-effect:non-scaling-stroke;stroke-width:4}
    .bottom-arches .evia-circle-track-v2{stroke:rgba(245,196,0,.19)}
    .bottom-arches .evia-circle-fill-v2{stroke:${YELLOW};stroke-linecap:round;transform:rotate(-90deg);transform-origin:50px 50px;transition:stroke-dasharray 900ms cubic-bezier(.22,1,.36,1)}
    .bottom-arches .evia-circle-marker-v2{fill:${YELLOW};stroke:#fff;stroke-width:3;vector-effect:non-scaling-stroke;transition:cx 900ms cubic-bezier(.22,1,.36,1),cy 900ms cubic-bezier(.22,1,.36,1),opacity 160ms ease}
    .bottom-arches .evia-ring-dot-orbit,.bottom-arches .evia-ring-marker-group{display:none!important}
    #evidenceTop #recordToggle.evia-guided-record-toggle-hidden,#evidenceTop #audioToggle.evia-guided-record-toggle-hidden{display:inline-flex!important}
    #evidenceTop #recordToggle.evia-witness-start-hidden{display:inline-flex!important}
    #evidenceTop .evia-guided-next,#evidenceTop .evia-witness-actions{display:none!important}
    #evidenceTop .audio-panel{position:relative}
    #evidenceTop .evia-audio-recording-timer{min-height:24px;margin:0 0 12px;font-size:20px;line-height:1;font-weight:600;color:rgba(45,45,45,.72);font-variant-numeric:tabular-nums;opacity:.55}
    #evidenceTop .evia-audio-recording-timer.is-recording{opacity:1;color:${YELLOW}}
    @media(max-width:380px){
      .bottom-arches{height:74px!important}
      .bottom-arches .status-arch{width:min(100%,64px)!important;height:72px!important}
      .bottom-arches .status-arch .arch-progress-svg{width:56px!important;height:56px!important}
      .bottom-arches .status-arch-value{top:28px!important}
      .bottom-arches .status-arch-label{top:58px!important;font-size:9px!important}
    }
  `;document.head.appendChild(style)
}

function ringValue(button){const n=Number(button?.style?.getPropertyValue('--arch-progress'));return Number.isFinite(n)?Math.max(0,Math.min(100,n)):0}
function ensureCircle(button){
  const svg=button?.querySelector('.arch-progress-svg');if(!svg)return null;
  if(!svg.dataset.eviaCircleV2){
    svg.dataset.eviaCircleV2='1';svg.setAttribute('viewBox','0 0 100 100');svg.setAttribute('preserveAspectRatio','xMidYMid meet');
    svg.innerHTML='';
    const track=document.createElementNS(SVG_NS,'circle');track.setAttribute('class','evia-circle-track-v2');track.setAttribute('cx','50');track.setAttribute('cy','50');track.setAttribute('r','43');track.setAttribute('pathLength','100');
    const fill=document.createElementNS(SVG_NS,'circle');fill.setAttribute('class','evia-circle-fill-v2');fill.setAttribute('cx','50');fill.setAttribute('cy','50');fill.setAttribute('r','43');fill.setAttribute('pathLength','100');
    const marker=document.createElementNS(SVG_NS,'circle');marker.setAttribute('class','evia-circle-marker-v2');marker.setAttribute('r','5');
    svg.append(track,fill,marker);
  }
  return svg
}
function syncCircle(button){
  const svg=ensureCircle(button);if(!svg)return;
  const p=ringValue(button),fill=svg.querySelector('.evia-circle-fill-v2'),marker=svg.querySelector('.evia-circle-marker-v2');
  if(fill)fill.style.strokeDasharray=`${p} ${Math.max(0,100-p)}`;
  if(marker){
    const angle=(-90+(p*3.6))*Math.PI/180,r=43;
    marker.setAttribute('cx',String(50+(r*Math.cos(angle))));
    marker.setAttribute('cy',String(50+(r*Math.sin(angle))));
    marker.style.opacity=(p>0&&button.classList.contains('progress-ready'))?'1':'0';
  }
}
function installCircles(){
  document.querySelectorAll('.bottom-arches .status-arch').forEach(button=>{
    syncCircle(button);
    if(button.dataset.eviaCircleV2Observer)return;
    button.dataset.eviaCircleV2Observer='1';
    new MutationObserver(()=>syncCircle(button)).observe(button,{attributes:true,attributeFilter:['style','class']});
  })
}

function newestGuidedProxy(){const list=[...document.querySelectorAll('#evidenceTop .evia-guided-next')].filter(x=>x.isConnected);return list[list.length-1]||null}
function witnessProxy(){return document.querySelector('#evidenceTop .evia-witness-actions .capture-button')}
function cleanGuidedProxies(){const list=[...document.querySelectorAll('#evidenceTop .evia-guided-next')].filter(x=>x.isConnected);list.slice(0,-1).forEach(x=>x.remove())}
function activeWitness(){return !!root()?.classList.contains('evia-witness-video-active')}

function ensureAudioTimer(){
  const panel=document.querySelector('#evidenceTop .audio-panel');const toggle=document.getElementById('audioToggle');if(!panel||!toggle)return null;
  let timer=panel.querySelector('.evia-audio-recording-timer');
  if(!timer){timer=document.createElement('div');timer.className='evia-audio-recording-timer';timer.textContent='00:00';panel.insertBefore(timer,toggle)}
  return timer
}
function stopAudioTimer(){if(audioTimerId){clearInterval(audioTimerId);audioTimerId=0}audioStartedAt=0;const timer=document.querySelector('#evidenceTop .evia-audio-recording-timer');timer?.classList.remove('is-recording')}
function startAudioTimer(){
  const timer=ensureAudioTimer();if(!timer)return;
  if(audioTimerId)clearInterval(audioTimerId);
  audioStartedAt=Date.now();timer.textContent='00:00';timer.classList.add('is-recording');
  audioTimerId=setInterval(()=>{
    const current=ensureAudioTimer();if(!current){stopAudioTimer();return}
    if(!liveRecorder()){if(audioStartedAt)current.textContent=formatTime(Date.now()-audioStartedAt);stopAudioTimer();return}
    current.textContent=formatTime(Date.now()-audioStartedAt)
  },250)
}

function syncRecordingControl(){
  cleanGuidedProxies();
  const live=liveRecorder();
  if(activeWitness()){
    const toggle=document.getElementById('recordToggle'),proxy=witnessProxy();
    if(toggle&&live&&proxy)toggle.textContent=proxy.textContent;
    return
  }
  const video=document.getElementById('recordToggle'),audio=document.getElementById('audioToggle');
  const toggle=video||audio,proxy=newestGuidedProxy();
  if(toggle&&live&&proxy)toggle.textContent=proxy.textContent;
  if(audio)ensureAudioTimer()
}

function handleToggleCapture(event){
  const toggle=event.target?.closest?.('#recordToggle,#audioToggle');if(!toggle||!document.getElementById('evidenceTop')?.contains(toggle))return;
  if(bypassNative)return;
  const isAudio=toggle.id==='audioToggle';
  if(!liveRecorder()){
    setTimeout(()=>{if(isAudio&&liveRecorder())startAudioTimer();syncRecordingControl()},60);
    return
  }
  const proxy=activeWitness()?witnessProxy():newestGuidedProxy();
  if(!proxy)return;
  event.preventDefault();event.stopImmediatePropagation();
  const finish=/^finish\b/i.test(String(proxy.textContent||'').trim());
  if(!activeWitness()&&finish)bypassNative=true;
  try{proxy.click()}finally{if(!activeWitness()&&finish)bypassNative=false}
  if(isAudio&&finish)setTimeout(stopAudioTimer,0);
  requestAnimationFrame(syncRecordingControl);setTimeout(syncRecordingControl,40)
}

function sync(){installCircles();syncRecordingControl();if(document.getElementById('audioToggle'))ensureAudioTimer();else stopAudioTimer()}
function boot(){
  injectStyles();sync();
  document.addEventListener('click',handleToggleCapture,true);
  const host=document.getElementById('screen')||document.body;new MutationObserver(()=>requestAnimationFrame(sync)).observe(host,{childList:true,subtree:true});
  window.addEventListener('resize',()=>requestAnimationFrame(sync));
  window.EviaCaptureControlsRingsV2=Object.freeze({version:2,sync})
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();