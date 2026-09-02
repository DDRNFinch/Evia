(() => {
  'use strict';

  const ROOT_ID = 'archDetailContent';
  const TITLE_ID = 'archDetailTitle';
  let applying = false;
  let queued = false;

  const norm = (node) => String(node?.textContent || '').replace(/\s+/g, ' ').trim();

  function injectStyles() {
    if (document.getElementById('eviaAttendLearnFinalV5Styles')) return;
    const style = document.createElement('style');
    style.id = 'eviaAttendLearnFinalV5Styles';
    style.textContent = `
      #${ROOT_ID}.evia-learn-final-v5 #eviaLearnActionsV4,
      #${ROOT_ID}.evia-learn-final-v5 .evia-v5-learn-stack{
        width:100%!important;
        display:flex!important;
        flex-direction:column!important;
        gap:10px!important;
        grid-template-columns:none!important;
        margin:10px 0 0!important;
        padding:0!important;
      }
      #${ROOT_ID}.evia-learn-final-v5 #openManualLearning,
      #${ROOT_ID}.evia-learn-final-v5 #openLearnCatchup,
      #${ROOT_ID}.evia-learn-final-v5 #openOtjIdeas,
      #${ROOT_ID}.evia-learn-final-v5 .evia-v5-pill{
        width:100%!important;
        max-width:none!important;
        min-width:0!important;
        min-height:54px!important;
        height:auto!important;
        grid-column:1/-1!important;
        flex:0 0 auto!important;
        margin:0!important;
        border-radius:999px!important;
        border:1.5px solid rgba(245,196,0,.36)!important;
        background:rgba(250,249,242,.96)!important;
        box-shadow:0 6px 16px rgba(35,35,35,.035)!important;
        padding:9px 44px 9px 18px!important;
        display:flex!important;
        flex-direction:column!important;
        align-items:flex-start!important;
        justify-content:center!important;
        gap:2px!important;
        text-align:left!important;
        position:relative!important;
      }
      #${ROOT_ID}.evia-learn-final-v5 #openManualLearning{
        background:rgba(245,196,0,.09)!important;
        border-color:rgba(245,196,0,.50)!important;
      }
      #${ROOT_ID}.evia-learn-final-v5 #openManualLearning::after,
      #${ROOT_ID}.evia-learn-final-v5 #openLearnCatchup::after,
      #${ROOT_ID}.evia-learn-final-v5 #openOtjIdeas::after,
      #${ROOT_ID}.evia-learn-final-v5 .evia-v5-pill::after{
        content:'›'!important;
        position:absolute!important;
        right:18px!important;
        top:50%!important;
        transform:translateY(-50%)!important;
        font-size:24px!important;
        font-weight:400!important;
        color:rgba(45,45,45,.32)!important;
      }
      #${ROOT_ID}.evia-learn-final-v5 #openManualLearning strong,
      #${ROOT_ID}.evia-learn-final-v5 #openLearnCatchup strong,
      #${ROOT_ID}.evia-learn-final-v5 #openOtjIdeas strong{
        font-size:13.5px!important;
        line-height:1.2!important;
        font-weight:800!important;
        color:rgba(45,45,45,.82)!important;
        margin:0!important;
      }
      #${ROOT_ID}.evia-learn-final-v5 #openManualLearning span,
      #${ROOT_ID}.evia-learn-final-v5 #openLearnCatchup span,
      #${ROOT_ID}.evia-learn-final-v5 #openOtjIdeas span,
      #${ROOT_ID}.evia-learn-final-v5 #openManualLearning small,
      #${ROOT_ID}.evia-learn-final-v5 #openLearnCatchup small,
      #${ROOT_ID}.evia-learn-final-v5 #openOtjIdeas small{
        font-size:9.8px!important;
        line-height:1.25!important;
        font-weight:500!important;
        color:rgba(45,45,45,.50)!important;
        margin:0!important;
      }
      #${ROOT_ID}.evia-learn-final-v5 .learn-action-count{display:none!important}
      #${ROOT_ID}.evia-attend-final-v5 [data-evia-v5-nisia]{display:none!important}
      @media(max-width:390px){
        #${ROOT_ID}.evia-learn-final-v5 #openManualLearning,
        #${ROOT_ID}.evia-learn-final-v5 #openLearnCatchup,
        #${ROOT_ID}.evia-learn-final-v5 #openOtjIdeas{min-height:52px!important;padding:8px 42px 8px 15px!important}
      }
    `;
    document.head.appendChild(style);
  }

  function cleanEmptyAncestors(node, root) {
    let current = node;
    for (let i = 0; i < 3 && current && current !== root; i += 1) {
      const parent = current.parentElement;
      if (!current.querySelector('button,[role="button"],input,textarea,select,a[href]') && !norm(current)) current.remove();
      current = parent;
    }
  }

  function removeNisiaFromAttend(root) {
    const removedParents = [];
    const interactive = [...root.querySelectorAll('button,[role="button"],a,[tabindex]')];
    interactive.forEach((node) => {
      if (!/\bnisia\b/i.test(norm(node))) return;
      removedParents.push(node.parentElement);
      node.remove();
    });

    [...root.querySelectorAll('*')].forEach((node) => {
      if (!node.isConnected) return;
      const value = norm(node);
      if (!/^nisia(?:\s+(?:connect|sync|connect\s+or\s+sync|connect\s+nisia|sync\s+with\s+nisia))?$/i.test(value)) return;
      if (node.children.length > 3) return;
      removedParents.push(node.parentElement);
      node.remove();
    });

    const upload = root.querySelector('#uploadPortfolio');
    if (upload) {
      removedParents.push(upload.parentElement);
      upload.remove();
    }

    removedParents.forEach((parent) => cleanEmptyAncestors(parent, root));
  }

  function findLearnControl(root, id, pattern) {
    const byId = root.querySelector(`#${id}`);
    if (byId) return byId;
    return [...root.querySelectorAll('button,[role="button"],a,[tabindex],.learn-action-card')]
      .find((node) => pattern.test(norm(node))) || null;
  }

  function ensureLearnStack(root) {
    let stack = root.querySelector('#eviaLearnActionsV4');
    if (!stack) stack = root.querySelector('.evia-v5-learn-stack');
    if (!stack) {
      stack = document.createElement('div');
      stack.className = 'evia-v5-learn-stack';
      root.appendChild(stack);
    }
    return stack;
  }

  function fixLearn(root) {
    root.classList.add('evia-learn-final-v5');
    const add = findLearnControl(root, 'openManualLearning', /^add\s+learning\b/i);
    const catchup = findLearnControl(root, 'openLearnCatchup', /^catch\s*up\b/i);
    const ideas = findLearnControl(root, 'openOtjIdeas', /(learning\s+ideas|explore\s+(?:otj|learning)\s+ideas)/i);
    if (!add && !catchup && !ideas) return;

    const stack = ensureLearnStack(root);
    const oldParents = [];
    [add, catchup, ideas].filter(Boolean).forEach((node) => {
      if (node.parentElement !== stack) oldParents.push(node.parentElement);
      node.removeAttribute('style');
      node.classList.add('evia-v5-pill');
      stack.appendChild(node);
    });

    [add, catchup, ideas].filter(Boolean).forEach((node) => {
      node.style.setProperty('width', '100%', 'important');
      node.style.setProperty('max-width', 'none', 'important');
      node.style.setProperty('grid-column', '1 / -1', 'important');
    });

    oldParents.forEach((parent) => cleanEmptyAncestors(parent, root));
  }

  function apply() {
    queued = false;
    if (applying) return;
    const root = document.getElementById(ROOT_ID);
    const title = norm(document.getElementById(TITLE_ID));
    if (!root) return;
    applying = true;
    try {
      if (title === 'Attend') {
        root.classList.add('evia-attend-final-v5');
        root.classList.remove('evia-learn-final-v5');
        removeNisiaFromAttend(root);
      } else if (title === 'Learn') {
        root.classList.add('evia-learn-final-v5');
        root.classList.remove('evia-attend-final-v5');
        fixLearn(root);
      } else {
        root.classList.remove('evia-attend-final-v5','evia-learn-final-v5');
      }
    } finally {
      applying = false;
    }
  }

  function queue() {
    if (queued || applying) return;
    queued = true;
    requestAnimationFrame(apply);
  }

  function boot() {
    injectStyles();
    const root = document.getElementById(ROOT_ID);
    const title = document.getElementById(TITLE_ID);
    const target = root?.parentElement || document.body;
    const observer = new MutationObserver(queue);
    observer.observe(target, { childList:true, subtree:true, characterData:true, attributes:true, attributeFilter:['class','style'] });
    if (title && title !== target && !target.contains(title)) observer.observe(title, { childList:true, subtree:true, characterData:true });
    document.addEventListener('click', (event) => {
      if (event.target.closest('#attendanceArch,#learnArch,.arch-detail-back,.back-button')) setTimeout(queue, 0);
    }, true);
    queue();
    window.__eviaAttendLearnFinalV5 = true;
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot, { once:true });
  else boot();
})();
