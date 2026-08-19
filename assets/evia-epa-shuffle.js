(()=>{
"use strict";
function hashText(s){let h=2166136261;for(let i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,16777619)}return h>>>0}
function rank(seed,n){let x=(seed^Math.imul(n+1,2654435761))>>>0;x^=x<<13;x^=x>>>17;x^=x<<5;return x>>>0}
function arrange(){
  document.querySelectorAll('.evia-answer-list:not([data-evia-arranged])').forEach(list=>{
    const buttons=[...list.querySelectorAll('.evia-answer')];
    if(buttons.length!==4){list.dataset.eviaArranged='1';return}
    const question=list.closest('.evia-tools-body')?.querySelector('.evia-question-title')?.textContent||'';
    const seed=hashText(question);
    buttons.sort((a,b)=>rank(seed,Number(a.dataset.answer))-rank(seed,Number(b.dataset.answer)));
    buttons.forEach((button,index)=>{
      list.appendChild(button);
      const letter=button.querySelector(':scope > span');
      if(letter)letter.textContent=String.fromCharCode(65+index);
    });
    list.dataset.eviaArranged='1';
  });
}
const observer=new MutationObserver(arrange);
observer.observe(document.documentElement,{subtree:true,childList:true});
window.addEventListener('load',arrange);
setTimeout(arrange,150);
})();