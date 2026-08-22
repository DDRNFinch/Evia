(()=>{
"use strict";
const VERSION=95;
const VISITS_KEY="evia-mini-milos-visits-v2";
const NEXT_KEY="evia-milos-next-visit-v1";
const NAME_KEY="evia-full-name";
const REF_KEY="evia-mini-milos-learner-ref-v1";
let greetingShown=false;
let syncQueued=false;
let targetQueued=false;

function read(key,fallback){try{const value=JSON.parse(localStorage.getItem(key)||"null");return value??fallback}catch{return fallback}}
function write(key,value){try{localStorage.setItem(key,JSON.stringify(value));return true}catch{return false}}
function clean(value,max=160){return String(value??"").replace(/\s+/g," ").trim().slice(0,max)}
function safeDate(value){const text=clean(value,10);if(!/^\d{4}-\d{2}-\d{2}$/.test(text))return "";const d=new Date(`${text}T12:00:00`);return Number.isFinite(d.getTime())?text:""}
function fmtDate(value){const date=safeDate(value);if(!date)return "Not booked yet";return new Date(`${date}T12:00:00`).toLocaleDateString("en-GB",{day:"numeric",month:"long",year:"numeric"})}
function currentRoute(){const c=window.EviaCourseContext?.current?.();if(!c||c.noCourse)return "";if(c.courseId==="st0095-v1-2")return "ST0095";if(c.courseId==="st0264-v1-4")return c.pathway==="architectural-joiner"?"ST0264-AJ":"ST0264-SITE";if(c.courseId==="6570-05"){const p=String(c.pathway||"thin").toUpperCase();return ({THIN:"6570-05-THIN",REPAIR:"6570-05-REPAIR",SPECIALIST:"6570-05-SPECIALIST",DRAINAGE:"6570-05-DRAINAGE"})[p]||""}return ""}
function firstName(){return clean(localStorage.getItem(NAME_KEY)||"",80).split(/\s+/).filter(Boolean)[0]||"there"}
function statusText(value){const status=clean(value,80).toLowerCase();if(!status)return "";return status==="on track"||status.startsWith("on track ")?"on track":"off track"}
function getNext(){const item=read(NEXT_KEY,null);return item&&typeof item==="object"&&!Array.isArray(item)?item:null}
function latestReview(){const items=read(VISITS_KEY,[]);if(!Array.isArray(items))return null;const ref=clean(localStorage.getItem(REF_KEY)||"",80),route=currentRoute();return items.filter(item=>item&&item.t==="review"&&(!ref||String(item.r||"")===ref)&&(!route||String(item.c||"")===route)).sort((a,b)=>Number(b.u||0)-Number(a.u||0))[0]||null}
function syncFromVisits(){syncQueued=false;const review=latestReview();if(!review)return getNext();const data=review.data&&typeof review.data==="object"?review.data:{};const date=safeDate(data.nextReviewDate||review.nextVisitDate||review.n);if(!date)return getNext();const next={date,status:clean(data.overallStatus||review.progressStatus||review.summary,80),reviewId:clean(review.i,100),reviewDate:safeDate(review.d),importedAt:Number(review.u)||Date.now()};const current=getNext();if(!current||JSON.stringify(current)!==JSON.stringify(next)){write(NEXT_KEY,next);document.dispatchEvent(new CustomEvent("evia:milos-next-visit-changed",{detail:next}))}patchTargets();return next}
function queueSync(){if(syncQueued)return;syncQueued=true;queueMicrotask(syncFromVisits)}

function ensureStyle(){if(document.getElementById("evia-next-visit-v95-style"))return;const style=document.createElement("style");style.id="evia-next-visit-v95-style";style.textContent=`
.evia-next-visit-greeting{position:fixed;z-index:9;left:50%;width:min(88vw,390px);text-align:center;pointer-events:none;opacity:0;transform:translate(-50%,8px);transition:opacity .55s ease,transform .55s ease;color:#2b2b2d;font-family:inherit;letter-spacing:-.01em}
.evia-next-visit-greeting.is-visible{opacity:1;transform:translate(-50%,0)}
.evia-next-visit-greeting.is-leaving{opacity:0;transform:translate(-50%,-5px)}
.evia-next-visit-greeting strong,.evia-next-visit-greeting span{display:block}.evia-next-visit-greeting strong{font-size:clamp(1rem,4vw,1.16rem);font-weight:620;margin-bottom:.28rem}.evia-next-visit-greeting span{font-size:clamp(.78rem,3.1vw,.9rem);line-height:1.45;color:#66666b}
.evia-milos-next-visit-target{display:flex;align-items:center;justify-content:space-between;gap:1rem;margin:.75rem 0 1rem;padding:.9rem 1rem;border-radius:1rem;background:rgba(61,126,204,.08);border:1px solid rgba(61,126,204,.12);color:#30343a}
.evia-milos-next-visit-target span{display:grid;gap:.15rem}.evia-milos-next-visit-target small{font-size:.69rem;text-transform:uppercase;letter-spacing:.06em;color:#52769d}.evia-milos-next-visit-target b{font-size:.9rem;font-weight:650}.evia-milos-next-visit-target em{font-style:normal;font-size:.72rem;color:#6c7680;text-align:right;white-space:nowrap}
`;document.head.appendChild(style)}

function positionGreeting(node){const anchor=document.querySelector(".evia-app .evia-anchor");if(!anchor||!node)return;const rect=anchor.getBoundingClientRect();node.style.top=`${Math.min(window.innerHeight-112,rect.bottom+10)}px`}
function showGreeting(){if(greetingShown)return;const next=syncFromVisits()||getNext();if(!next||!safeDate(next.date))return;if(localStorage.getItem("evia-onboarding-complete")!=="true")return;const anchor=document.querySelector(".evia-app.is-ready .evia-anchor");if(!anchor)return;greetingShown=true;ensureStyle();document.querySelector(".evia-next-visit-greeting")?.remove();const node=document.createElement("div");node.className="evia-next-visit-greeting";const state=statusText(next.status);node.innerHTML=`<strong>Hi ${escapeHtml(firstName())}</strong>${state?`<span>You are currently ${escapeHtml(state)}</span>`:""}<span>Your next visit is on ${escapeHtml(fmtDate(next.date))}</span>`;document.body.appendChild(node);positionGreeting(node);requestAnimationFrame(()=>node.classList.add("is-visible"));const resize=()=>positionGreeting(node);window.addEventListener("resize",resize);setTimeout(()=>node.classList.add("is-leaving"),5000);setTimeout(()=>{window.removeEventListener("resize",resize);node.remove()},5650)}
function escapeHtml(value){return String(value??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]))}

function targetMarkup(){const next=getNext();const date=next&&safeDate(next.date);return `<span><small>Next assessor visit</small><b>${escapeHtml(date?fmtDate(date):"Not booked yet")}</b></span><em>${date?"Booked in Milos":"Scan your Milos review QR"}</em>`}
function patchTargets(){targetQueued=false;ensureStyle();document.querySelectorAll(".evia-target-layer .evia-tools-body").forEach(body=>{let card=body.querySelector(".evia-milos-next-visit-target");if(!card){card=document.createElement("div");card.className="evia-milos-next-visit-target";const dateField=body.querySelector(".evia-target-date"),hero=body.querySelector(".evia-target-hero");if(dateField)body.insertBefore(card,dateField);else if(hero)hero.insertAdjacentElement("afterend",card);else body.prepend(card)}const html=targetMarkup();if(card.innerHTML!==html)card.innerHTML=html})}
function queueTargets(){if(targetQueued)return;targetQueued=true;requestAnimationFrame(patchTargets)}

function startObserver(){const root=document.getElementById("root")||document.body;if(!root||typeof MutationObserver!=="function")return;new MutationObserver(records=>{let needsTargets=false,needsGreeting=false;for(const record of records){for(const node of record.addedNodes||[]){if(node.nodeType!==1)continue;if(node.matches?.(".evia-target-layer,.evia-tools-body")||node.querySelector?.(".evia-target-layer,.evia-tools-body"))needsTargets=true;if(!greetingShown&&(node.matches?.(".evia-app.is-ready,.evia-anchor")||node.querySelector?.(".evia-app.is-ready .evia-anchor")))needsGreeting=true}}if(needsTargets)queueTargets();if(needsGreeting)requestAnimationFrame(showGreeting)}).observe(root,{childList:true,subtree:true})}

const nativeSetItem=Storage.prototype.setItem;if(!nativeSetItem.__eviaNextVisitV95){const wrapped=function(key,value){const result=nativeSetItem.call(this,key,value);if(this===localStorage&&String(key)===VISITS_KEY)queueSync();return result};wrapped.__eviaNextVisitV95=true;wrapped.__eviaNextVisitPrevious=nativeSetItem;Storage.prototype.setItem=wrapped}

document.addEventListener("evia:milos-next-visit-changed",queueTargets);
window.addEventListener("storage",event=>{if(event.key===VISITS_KEY||event.key===NEXT_KEY){queueSync();queueTargets()}});
window.addEventListener("pageshow",()=>{queueSync();queueTargets();requestAnimationFrame(showGreeting)});
document.addEventListener("visibilitychange",()=>{if(document.visibilityState==="visible"){queueSync();queueTargets()}});
ensureStyle();syncFromVisits();startObserver();queueTargets();if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",()=>requestAnimationFrame(showGreeting),{once:true});else requestAnimationFrame(showGreeting);
window.EviaNextVisit=Object.freeze({version:VERSION,storageKey:NEXT_KEY,get:getNext,sync:syncFromVisits,patchTargets});
})();
