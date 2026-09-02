(() => {
  'use strict';

  const ROOT_ID = 'archDetailContent';
  const TITLE_ID = 'archDetailTitle';
  let applying = false;
  let queued = false;

  const text = (node) => String(node?.textContent || '').replace(/\s+/g, ' ').trim();

  function injectStyles() {
    if (document.getElementById('eviaAttendLearnRenderV4Styles')) return;
    const style = document.createElement('style');
    style.id = 'eviaAttendLearnRenderV4Styles';
    style.textContent = `
      #${ROOT_ID}.evia-attend-live-v4 .evia-v4-action-stack,
      #${ROOT_ID}.evia-learn-live-v4 .evia-v4-action-stack{
        width:100%!important;
        display:flex!important;
        flex-direction:column!important;
        gap:10px!important;
        grid-template-columns:none!important;
        margin:10px 0 0!important;
        padding:0!important;
      }
      #${ROOT_ID}.evia-attend-live-v4 .evia-v4-action-stack>button,
      #${ROOT_ID}.evia-learn-live-v4 .evia-v4-action-stack>button{
        width:100%!important;
        max-width:none!important;
        min-width:0!important;
        min-height:54px!important;
        height:auto!important;
        margin:0!important;
        border-radius:999px!important;
        border:1.5px solid rgba(245,196,0,.36)!important;
        background:rgba(250,249,242,.96)!important;
        box-shadow:0 6px 16px rgba(35,35,35,.035)!important;
        padding:9px 18px!important;
        display:flex!important;
        flex-direction:row!important;
        align-items:center!important;
        justify-content:space-between!important;
        gap:14px!important;
        text-align:left!important;
        position:relative!important;
      }
      #${ROOT_ID}.evia-attend-live-v4 .evia-v4-action-stack>button:first-child,
      #${ROOT_ID}.evia-learn-live-v4 .evia-v4-action-stack>button:first-child{
        background:rgba(245,196,0,.09)!important;
        border-color:rgba(245,196,0,.50)!important;
      }
      #${ROOT_ID}.evia-attend-live-v4 .evia-v4-action-stack>button strong,
      #${ROOT_ID}.evia-attend-live-v4 .evia-v4-action-stack>button>span:first-child,
      #${ROOT_ID}.evia-learn-live-v4 .evia-v4-action-stack>button strong{
        font-size:13.5px!important;
        line-height:1.2!important;
        font-weight:800!important;
        color:rgba(45,45,45,.82)!important;
        margin:0!important;
      }
      #${ROOT_ID}.evia-attend-live-v4 .evia-v4-action-stack>button small,
      #${ROOT_ID}.evia-attend-live-v4 .evia-v4-action-stack>button>span:not(:first-child),
      #${ROOT_ID}.evia-learn-live-v4 .evia-v4-action-stack>button span,
      #${ROOT_ID}.evia-learn-live-v4 .evia-v4-action-stack>button small{
        font-size:9.8px!important;
        line-height:1.25!important;
        font-weight:500!important;
        color:rgba(45,45,45,.50)!important;
        margin:0!important;
      }
      #${ROOT_ID}.evia-learn-live-v4 .evia-v4-action-stack>button{
        padding-right:44px!important;
        flex-direction:column!important;
        align-items:flex-start!important;
        justify-content:center!important;
        gap:2px!important;
      }
      #${ROOT_ID}.evia-learn-live-v4 .evia-v4-action-stack>button::after{
        content:'›'!important;
        position:absolute!important;
        right:18px!important;
        top:50%!important;
        transform:translateY(-50%)!important;
        font-size:24px!important;
        font-weight:400!important;
        color:rgba(45,45,45,.32)!important;
      }
      #${ROOT_ID}.evia-learn-live-v4 .evia-v4-action-stack .learn-action-count{
        display:none!important;
      }
      #${ROOT_ID}.evia-attend-live-v4 [data-evia-v4-hidden],
      #${ROOT_ID}.evia-learn-live-v4 [data-evia-v4-hidden]{display:none!important}
      #${ROOT_ID}.evia-attend-live-v4 .evia-v4-action-stack:empty,
      #${ROOT_ID}.evia-learn-live-v4 .evia-v4-action-stack:empty{display:none!important}
      @media(max-width:390px){
        #${ROOT_ID}.evia-attend-live-v4 .evia-v4-action-stack>button,
        #${ROOT_ID}.evia-learn-live-v4 .evia-v4-action-stack>button{min-height:52px!important;padding-top:8px!important;padding-bottom:8px!important}
      }
    `;
    document.head.appendChild(style);
  }

  function findButton(root, pattern, excluded = new Set()) {
    return [...root.querySelectorAll('button,[role="button"]')].find((button) => !excluded.has(button) && pattern.test(text(button))) || null;
  }

  function removeEmptyContainers(root, candidates) {
    [...new Set(candidates.filter(Boolean))].forEach((node) => {
      let current = node;
      for (let depth = 0; depth < 3 && current && current !== root; depth += 1) {
        const parent = current.parentElement;
        if (!current.querySelector('button,[role="button"],input,textarea,select') && !text(current)) current.remove();
        current = parent;
      }
    });
  }

  function getOrCreateStack(root, id) {
    let stack = root.querySelector(`#${id}`);
    if (!stack) {
      stack = document.createElement('div');
      stack.id = id;
      stack.className = 'evia-v4-action-stack';
      root.appendChild(stack);
    }
    return stack;
  }

  function applyAttend(root) {
    root.classList.add('evia-attend-live-v4');
    root.classList.remove('evia-learn-live-v4');
    root.dataset.eviaAttendLearnLayout = 'attend-v4';

    const nisiaControls = [...root.querySelectorAll('button,[role="button"]')].filter((button) => /\bnisia\b/i.test(text(button)));
    const oldParents = [];
    nisiaControls.forEach((button) => {
      oldParents.push(button.parentElement);
      button.remove();
    });

    const used = new Set();
    const manual = findButton(root, /manual\s*update/i, used);
    if (manual) used.add(manual);
    const qr = findButton(root, /(qr\s*code|scan\s*(an\s*)?attendance|receive\s+an\s+update)/i, used);
    if (qr) used.add(qr);

    if (manual || qr) {
      const stack = getOrCreateStack(root, 'eviaAttendActionsV4');
      [manual, qr].filter(Boolean).forEach((button) => {
        if (button.parentElement !== stack) oldParents.push(button.parentElement);
        button.removeAttribute('style');
        button.classList.add('evia-v4-pill');
        stack.appendChild(button);
      });

      const oldHeading = [...root.querySelectorAll('strong,h2,h3,h4,p,div,span')]
        .find((node) => node !== stack && node.children.length === 0 && /^update attendance$/i.test(text(node)));
      if (oldHeading) {
        oldHeading.dataset.eviaV4Hidden = 'true';
        if (!stack.previousElementSibling?.classList?.contains('evia-v4-section-label')) {
          const heading = document.createElement('div');
          heading.className = 'evia-v4-section-label';
          heading.textContent = 'Update attendance';
          heading.style.cssText = 'font-size:12px;font-weight:800;color:rgba(45,45,45,.74);margin:4px 4px 0;';
          root.insertBefore(heading, stack);
        }
      }
    }

    removeEmptyContainers(root, oldParents);
  }

  function applyLearn(root) {
    root.classList.add('evia-learn-live-v4');
    root.classList.remove('evia-attend-live-v4');
    root.dataset.eviaAttendLearnLayout = 'learn-v4';

    const used = new Set();
    const add = findButton(root, /^add\s+learning\b/i, used);
    if (add) used.add(add);
    const catchup = findButton(root, /^catch\s*up\b/i, used);
    if (catchup) used.add(catchup);
    const ideas = findButton(root, /(learning\s+ideas|explore\s+(otj|learning)\s+ideas)/i, used);
    if (ideas) used.add(ideas);

    if (!add && !catchup && !ideas) return;
    const stack = getOrCreateStack(root, 'eviaLearnActionsV4');
    const oldParents = [];
    [add, catchup, ideas].filter(Boolean).forEach((button) => {
      if (button.parentElement !== stack) oldParents.push(button.parentElement);
      button.removeAttribute('style');
      button.classList.add('evia-v4-pill');
      stack.appendChild(button);
    });
    removeEmptyContainers(root, oldParents);
  }

  function clearPageClasses(root) {
    root.classList.remove('evia-attend-live-v4', 'evia-learn-live-v4');
    delete root.dataset.eviaAttendLearnLayout;
  }

  function applyVisibleLayout() {
    queued = false;
    if (applying) return;
    const root = document.getElementById(ROOT_ID);
    const title = text(document.getElementById(TITLE_ID));
    if (!root) return;

    applying = true;
    try {
      if (title === 'Attend') applyAttend(root);
      else if (title === 'Learn') applyLearn(root);
      else clearPageClasses(root);
    } finally {
      applying = false;
    }
  }

  function queueApply() {
    if (queued || applying) return;
    queued = true;
    requestAnimationFrame(applyVisibleLayout);
  }

  function boot() {
    injectStyles();
    const root = document.getElementById(ROOT_ID);
    const title = document.getElementById(TITLE_ID);
    const target = root?.parentElement || document.body;
    const observer = new MutationObserver(queueApply);
    observer.observe(target, { childList:true, subtree:true, characterData:true, attributes:true, attributeFilter:['class','style'] });
    if (title && title !== target && !target.contains(title)) observer.observe(title, { childList:true, subtree:true, characterData:true });
    document.addEventListener('click', (event) => {
      if (event.target.closest('#attendanceArch,#learnArch,.arch-detail-back,.back-button')) setTimeout(queueApply, 0);
    }, true);
    queueApply();
    window.__eviaAttendLearnRenderV4 = true;
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot, { once:true });
  else boot();
})();
