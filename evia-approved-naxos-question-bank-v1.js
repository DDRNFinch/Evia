(()=>{'use strict';
const STYLE_ID='eviaNaxosQuestionBankV1Styles';
const ENGINE_URL='https://ddrnfinch.github.io/Naxos-Mapping_Engine/question-banks/question-bank-engine-v1.js';
let enginePromise=null;
const banks={maths:[],english:[],trade:[],epa:[]};

function injectStyles(){
  if(document.getElementById(STYLE_ID))return;
  const style=document.createElement('style');style.id=STYLE_ID;style.textContent=`
    .evia-inline-chat-options{
      width:calc(100% - 64px)!important;
      margin:8px 12px 4px 52px!important;
      padding:0!important;
      display:flex!important;
      flex-direction:column!important;
      align-items:flex-end!important;
      gap:8px!important;
      align-self:stretch!important;
    }
    .evia-inline-chat-options .chat-option{
      width:auto!important;
      min-width:62%!important;
      max-width:100%!important;
      min-height:48px!important;
      height:auto!important;
      display:flex!important;
      align-items:center!important;
      justify-content:flex-start!important;
      text-align:left!important;
      white-space:normal!important;
      line-height:1.3!important;
      padding:11px 16px!important;
      border-radius:22px!important;
    }
    .bottom-arches .evia-circle-marker-v2,
    .bottom-arches .evia-ring-dot-orbit,
    .bottom-arches .evia-ring-marker-group{display:none!important}
    @media(max-width:380px){
      .evia-inline-chat-options{width:calc(100% - 54px)!important;margin-left:42px!important}
      .evia-inline-chat-options .chat-option{min-width:68%!important}
    }
  `;document.head.appendChild(style)
}

function removeRingDots(){document.querySelectorAll('.evia-circle-marker-v2,.evia-ring-dot-orbit,.evia-ring-marker-group').forEach(node=>node.remove())}

function clearLegacyBanks(){
  try{if(typeof quickTestBanks==='object'&&quickTestBanks){Object.keys(quickTestBanks).forEach(key=>{quickTestBanks[key]=[]})}}catch{}
  try{if(typeof epaQuestionBanks==='object'&&epaQuestionBanks){Object.keys(epaQuestionBanks).forEach(key=>{epaQuestionBanks[key]=[]})}}catch{}
}

function currentContext(){
  let meta={};try{if(typeof inferredCourseMeta==='function')meta=inferredCourseMeta()||{}}catch{}
  let items=[];try{if(typeof courseItems!=='undefined'&&Array.isArray(courseItems))items=courseItems}catch{}
  const courseId=String(meta?.qualificationId||meta?.qualification?.id||'').trim();
  return{courseId,meta,courseItems:items};
}
function normalise(question){
  return{
    q:String(question?.question||''),
    a:Array.isArray(question?.answers)?question.answers.map(String):[],
    correct:Number(question?.correct),
    explanation:String(question?.explanation||''),
    id:String(question?.id||''),
    difficulty:String(question?.difficulty||''),
    mappings:Array.isArray(question?.mappings)?question.mappings.slice():[],
    source:'Naxos'
  }
}

function loadEngine(){
  if(window.NaxosQuestionBankV1?.build)return Promise.resolve(window.NaxosQuestionBankV1);
  if(enginePromise)return enginePromise;
  enginePromise=new Promise((resolve,reject)=>{
    const existing=document.querySelector(`script[data-evia-naxos-question-engine="1"]`);
    if(existing){
      const ready=()=>window.NaxosQuestionBankV1?.build?resolve(window.NaxosQuestionBankV1):reject(new Error('Naxos question engine did not initialise.'));
      existing.addEventListener('load',ready,{once:true});existing.addEventListener('error',()=>reject(new Error('Could not load Naxos question engine.')),{once:true});setTimeout(ready,0);return;
    }
    const script=document.createElement('script');script.src=ENGINE_URL;script.async=true;script.dataset.eviaNaxosQuestionEngine='1';
    script.onload=()=>window.NaxosQuestionBankV1?.build?resolve(window.NaxosQuestionBankV1):reject(new Error('Naxos question engine did not initialise.'));
    script.onerror=()=>reject(new Error('Could not load Naxos question engine.'));
    document.head.appendChild(script)
  }).catch(error=>{enginePromise=null;throw error});
  return enginePromise
}

async function rebuildBanks(){
  const engine=await loadEngine(),context=currentContext();
  for(const category of ['maths','english','trade','epa']){
    let questions=[];try{questions=engine.build(category,context)||[]}catch{questions=[]}
    banks[category]=questions.filter(q=>q&&q.active!==false&&Array.isArray(q.answers)&&q.answers.length===4).map(normalise)
  }
  return banks
}

function installBankOverride(){
  try{
    if(typeof testBankForCategory!=='function'||testBankForCategory.__eviaNaxosV1)return;
    const wrapped=function(category){return banks[String(category||'').toLowerCase()]||[]};
    wrapped.__eviaNaxosV1=true;testBankForCategory=wrapped
  }catch{}
}

function installTestMenuOverride(){
  try{
    if(typeof startTestMe!=='function'||startTestMe.__eviaNaxosV1)return;
    const wrapped=async function(){
      try{testState=null}catch{}
      try{
        await rebuildBanks();installBankOverride();
        const options=[
          banks.maths.length?{label:'Maths',action:'test-category',value:'maths'}:null,
          banks.english.length?{label:'English',action:'test-category',value:'english'}:null,
          banks.trade.length?{label:'Trade',action:'test-category',value:'trade'}:null,
          banks.epa.length?{label:'EPA',action:'test-category',value:'epa'}:null
        ].filter(Boolean);
        if(!options.length){await chatSay('I cannot load the Naxos question bank right now. Try again when the app has a connection.');return}
        await chatSay('What should I test you on?',options)
      }catch(error){
        await chatSay('I cannot load the Naxos question bank right now. Try again when the app has a connection.')
      }
    };
    wrapped.__eviaNaxosV1=true;startTestMe=wrapped
  }catch{}
}

function install(){
  injectStyles();clearLegacyBanks();installBankOverride();installTestMenuOverride();removeRingDots();
  const host=document.getElementById('screen')||document.body;
  if(host&&!host.__eviaQuestionBankObserver){host.__eviaQuestionBankObserver=true;new MutationObserver(()=>removeRingDots()).observe(host,{childList:true,subtree:true})}
  loadEngine().then(()=>{}).catch(()=>{});
  window.EviaNaxosQuestionBankV1=Object.freeze({version:1,rebuild:rebuildBanks,counts:()=>Object.fromEntries(Object.entries(banks).map(([key,value])=>[key,value.length]))})
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install,{once:true});else install();
setInterval(()=>{installBankOverride();installTestMenuOverride();removeRingDots()},2500);
})();
