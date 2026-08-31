(() => {
  'use strict';

  const SUPPORT_KEY = 'eviaLearningSupportV1';
  const YELLOW = '#f5c400';

  const defaults = {
    textScale: 1,
    dyslexiaFriendly: false,
    tint: 'none',
    lineSpacing: false,
    letterSpacing: false,
    highContrast: false,
    reduceMotion: false,
    simplifiedReading: false,
    readingFocus: false,
    focusY: 50,
    extraThinkingTime: false
  };

  const labels = {
    textScale: ['Text size', 'Compare your current text size with the new size before applying it.'],
    dyslexiaFriendly: ['Dyslexia-friendly text', 'Compare the standard Evia type with the clearer reading font.'],
    tint: ['Screen tint', 'Compare the screen without the selected overlay and with the selected tint.'],
    readingFocus: ['Reading Focus', 'Preview the clear reading window with the surrounding content dimmed.'],
    lineSpacing: ['More line spacing', 'Compare standard spacing with extra space between lines.'],
    letterSpacing: ['More word and letter spacing', 'Compare standard text with wider word and letter spacing.'],
    highContrast: ['Higher contrast', 'Compare Evia with stronger contrast around text and interface details.'],
    reduceMotion: ['Reduce movement', 'Compare normal interface movement with non-essential movement removed.'],
    simplifiedReading: ['Simplified reading', 'Compare the normal view with a calmer, more spacious reading layout.'],
    extraThinkingTime: ['Extra thinking time', 'Review the preference before saving it for questions and timed activities.']
  };

  const tintColours = {
    none: 'transparent',
    cream: 'rgba(255, 231, 130, .22)',
    blue: 'rgba(129, 200, 255, .18)',
    green: 'rgba(145, 219, 157, .18)',
    grey: 'rgba(120, 120, 120, .12)'
  };

  let previewState = null;
  let focusDragging = false;

  function loadState() {
    try {
      const saved = JSON.parse(localStorage.getItem(SUPPORT_KEY) || '{}');
      return { ...defaults, ...(saved && typeof saved === 'object' ? saved : {}) };
    } catch (error) {
      return { ...defaults };
    }
  }

  function saveState(state) {
    try { localStorage.setItem(SUPPORT_KEY, JSON.stringify(state)); } catch (error) {}
  }

  function injectStyles() {
    if (document.getElementById('eviaSupportPreviewStyles')) return;
    const style = document.createElement('style');
    style.id = 'eviaSupportPreviewStyles';
    style.textContent = `
      .evia-screen-tint{position:fixed;inset:0;z-index:9000;pointer-events:none;background:transparent;display:none}
      .evia-support-preview{position:fixed;inset:0;z-index:10001;background:rgba(255,255,255,.96);display:none;overflow:auto;padding:calc(max(16px,env(safe-area-inset-top)) + 10px) 16px calc(max(20px,env(safe-area-inset-bottom)) + 18px)}
      .evia-support-preview.open{display:block}
      .evia-preview-shell{width:min(100%,500px);margin:0 auto}
      .evia-preview-head{display:flex;align-items:center;gap:11px;margin-bottom:15px}
      .evia-preview-mark{width:42px;height:42px;border:1.7px solid rgba(245,196,0,.55);border-radius:50%;display:grid;place-items:center;color:${YELLOW};font-size:17px;font-weight:800;flex:0 0 42px}
      .evia-preview-head strong{display:block;font-size:20px;color:#333}.evia-preview-head span{display:block;margin-top:3px;font-size:11px;line-height:1.4;color:#656565}
      .evia-preview-grid{display:grid;grid-template-columns:1fr 1fr;gap:10px}
      .evia-preview-column{min-width:0}.evia-preview-label{display:block;margin:0 0 6px 4px;font-size:10px;font-weight:800;letter-spacing:.08em;text-transform:uppercase;color:#777}
      .evia-preview-sample{position:relative;overflow:hidden;min-height:190px;border:1.5px solid rgba(245,196,0,.24);border-radius:22px;background:#fff;padding:15px;box-shadow:0 8px 22px rgba(0,0,0,.035);font-family:Arial,sans-serif;font-size:14px;line-height:1.42;color:#3f3f3f}
      .evia-preview-sample strong{display:block;font-size:15px;margin-bottom:8px;color:#333}.evia-preview-sample p{margin:0 0 10px}.evia-preview-pill{min-height:36px;border:1.5px solid rgba(245,196,0,.34);border-radius:999px;background:rgba(250,249,242,.98);display:flex;align-items:center;padding:0 12px;font-size:11px;font-weight:600;color:#555}
      .evia-preview-motion{width:9px;height:9px;margin:12px auto 0;border-radius:50%;background:${YELLOW};animation:eviaPreviewPulse 1s ease-in-out infinite}
      .evia-preview-sample.preview-reduced .evia-preview-motion{animation:none!important}
      @keyframes eviaPreviewPulse{0%,100%{transform:translateX(-16px);opacity:.55}50%{transform:translateX(16px);opacity:1}}
      .evia-preview-focus-top,.evia-preview-focus-bottom{position:absolute;left:0;right:0;background:rgba(35,35,35,.46);display:none;pointer-events:none}.evia-preview-focus-top{top:0;height:60px}.evia-preview-focus-bottom{top:116px;bottom:0}.preview-focus .evia-preview-focus-top,.preview-focus .evia-preview-focus-bottom{display:block}.preview-focus::after{content:'';position:absolute;left:0;right:0;top:60px;height:56px;border-top:1.5px solid rgba(245,196,0,.75);border-bottom:1.5px solid rgba(245,196,0,.75);pointer-events:none}
      .evia-preview-tint{position:absolute;inset:0;pointer-events:none;display:none}.evia-preview-tint.on{display:block}
      .evia-preview-actions{display:grid;grid-template-columns:1fr 1fr;gap:9px;margin-top:14px}.evia-preview-actions button{min-height:48px;border-radius:999px;font-size:13px;font-weight:700;cursor:pointer}.evia-preview-cancel{border:1.5px solid rgba(45,45,45,.15);background:#fff;color:#555}.evia-preview-accept{border:1.5px solid rgba(245,196,0,.55);background:rgba(245,196,0,.13);color:#514500}
      @media(max-width:390px){.evia-preview-grid{grid-template-columns:1fr}.evia-preview-sample{min-height:155px}}
    `;
    document.head.appendChild(style);
  }

  function ensureUi() {
    if (!document.getElementById('eviaScreenTint')) {
      const tint = document.createElement('div');
      tint.id = 'eviaScreenTint';
      tint.className = 'evia-screen-tint';
      tint.setAttribute('aria-hidden', 'true');
      document.body.appendChild(tint);
    }
    if (!document.getElementById('eviaSupportPreview')) {
      const preview = document.createElement('section');
      preview.id = 'eviaSupportPreview';
      preview.className = 'evia-support-preview';
      preview.setAttribute('aria-hidden', 'true');
      preview.innerHTML = '<div class="evia-preview-shell" id="eviaPreviewShell"></div>';
      document.body.appendChild(preview);
      preview.addEventListener('click', (event) => {
        const action = event.target.closest('[data-preview-action]')?.dataset.previewAction;
        if (action === 'accept') acceptPreview();
        if (action === 'cancel') cancelPreview();
      });
    }
  }

  function sampleStyle(state) {
    const scale = Math.max(.9, Math.min(1.35, Number(state.textScale) || 1));
    return [
      `font-size:${14 * scale}px`,
      `font-family:${state.dyslexiaFriendly ? 'Verdana,Tahoma,Arial,sans-serif' : 'Arial,sans-serif'}`,
      `line-height:${state.lineSpacing ? '1.72' : (state.simplifiedReading ? '1.62' : '1.42')}`,
      `letter-spacing:${state.letterSpacing ? '.045em' : 'normal'}`,
      `word-spacing:${state.letterSpacing ? '.12em' : 'normal'}`,
      `filter:${state.highContrast ? 'contrast(1.25)' : 'none'}`
    ].join(';');
  }

  function sampleMarkup(state) {
    const tint = tintColours[state.tint] || 'transparent';
    const classes = [
      'evia-preview-sample',
      state.readingFocus ? 'preview-focus' : '',
      state.reduceMotion ? 'preview-reduced' : ''
    ].filter(Boolean).join(' ');
    const supportNote = state.extraThinkingTime ? '<p><strong style="display:inline;font-size:inherit">Extra thinking time:</strong> your preference will be remembered for supported questions and activities.</p>' : '';
    return `<div class="${classes}" style="${sampleStyle(state)}"><strong>Learning in Evia</strong><p>Read the task carefully, identify the important information and work through one step at a time.</p>${supportNote}<div class="evia-preview-pill">Example Evia learning option</div><div class="evia-preview-motion" aria-hidden="true"></div><div class="evia-preview-focus-top"></div><div class="evia-preview-focus-bottom"></div><div class="evia-preview-tint${state.tint !== 'none' ? ' on' : ''}" style="background:${tint}"></div></div>`;
  }

  function openPreview(key, candidate) {
    ensureUi();
    const current = loadState();
    previewState = { key, current, candidate };
    const [title, description] = labels[key] || ['Learning Support', 'Preview this change before applying it.'];
    const shell = document.getElementById('eviaPreviewShell');
    shell.innerHTML = `<div class="evia-preview-head"><div class="evia-preview-mark">Aa</div><div><strong>${title}</strong><span>${description}</span></div></div><div class="evia-preview-grid"><div class="evia-preview-column"><span class="evia-preview-label">Before</span>${sampleMarkup(current)}</div><div class="evia-preview-column"><span class="evia-preview-label">After</span>${sampleMarkup(candidate)}</div></div><div class="evia-preview-actions"><button class="evia-preview-cancel" type="button" data-preview-action="cancel">Cancel</button><button class="evia-preview-accept" type="button" data-preview-action="accept">Accept</button></div>`;
    const preview = document.getElementById('eviaSupportPreview');
    preview.classList.add('open');
    preview.setAttribute('aria-hidden', 'false');
    preview.scrollTop = 0;
  }

  function closePreview() {
    const preview = document.getElementById('eviaSupportPreview');
    preview?.classList.remove('open');
    preview?.setAttribute('aria-hidden', 'true');
    previewState = null;
  }

  function acceptPreview() {
    if (!previewState) return;
    saveState(previewState.candidate);
    applyPatchedSupport();
    closePreview();
    syncSettingsUi();
  }

  function cancelPreview() {
    closePreview();
    syncSettingsUi();
  }

  function applyPatchedSupport() {
    ensureUi();
    const state = loadState();
    const root = document.documentElement;
    root.style.setProperty('--evia-text-scale', String(Math.max(.9, Math.min(1.35, Number(state.textScale) || 1))));
    root.classList.toggle('evia-dyslexia', Boolean(state.dyslexiaFriendly));
    root.classList.toggle('evia-line-spacing', Boolean(state.lineSpacing));
    root.classList.toggle('evia-letter-spacing', Boolean(state.letterSpacing));
    root.classList.toggle('evia-high-contrast', Boolean(state.highContrast));
    root.classList.toggle('evia-reduce-motion', Boolean(state.reduceMotion));
    root.classList.toggle('evia-simple-reading', Boolean(state.simplifiedReading));

    root.style.removeProperty('--bg');
    document.body.style.background = '';
    const tint = document.getElementById('eviaScreenTint');
    const colour = tintColours[state.tint] || 'transparent';
    if (tint) {
      tint.style.background = colour;
      tint.style.display = state.tint === 'none' ? 'none' : 'block';
    }

    const focus = document.getElementById('eviaReadingFocus');
    if (focus) {
      focus.classList.toggle('on', Boolean(state.readingFocus));
      focus.setAttribute('aria-hidden', state.readingFocus ? 'false' : 'true');
      const y = Math.max(8, Math.min(92, Number(state.focusY) || 50));
      focus.style.setProperty('--focus-y', `${y}vh`);
    }
  }

  function syncSettingsUi() {
    const state = loadState();
    document.querySelectorAll('[data-support-toggle]').forEach((button) => {
      const key = button.dataset.supportToggle;
      const on = Boolean(state[key]);
      button.classList.toggle('on', on);
      button.setAttribute('aria-pressed', String(on));
    });
    const range = document.getElementById('eviaTextScale');
    if (range) range.value = String(Number(state.textScale) || 1);
    document.querySelectorAll('[data-tint]').forEach((button) => button.classList.toggle('selected', button.dataset.tint === state.tint));
  }

  function candidateForToggle(key) {
    const current = loadState();
    return { ...current, [key]: !Boolean(current[key]) };
  }

  function interceptControls(event) {
    const toggle = event.target.closest?.('[data-support-toggle]');
    if (toggle) {
      event.preventDefault();
      event.stopImmediatePropagation();
      const key = toggle.dataset.supportToggle;
      if (!key) return;
      openPreview(key, candidateForToggle(key));
      return;
    }

    const tint = event.target.closest?.('[data-tint]');
    if (tint) {
      event.preventDefault();
      event.stopImmediatePropagation();
      const current = loadState();
      openPreview('tint', { ...current, tint: tint.dataset.tint || 'none' });
    }
  }

  function interceptRangeInput(event) {
    if (event.target?.id !== 'eviaTextScale') return;
    event.stopImmediatePropagation();
  }

  function interceptRangeChange(event) {
    if (event.target?.id !== 'eviaTextScale') return;
    event.preventDefault();
    event.stopImmediatePropagation();
    const current = loadState();
    const next = Math.max(.9, Math.min(1.35, Number(event.target.value) || 1));
    openPreview('textScale', { ...current, textScale: next });
  }

  function interceptFocusDrag(event) {
    const handle = event.target.closest?.('.evia-focus-handle');
    if (event.type === 'pointerdown' && handle) {
      event.preventDefault();
      event.stopImmediatePropagation();
      focusDragging = true;
      updateFocusPosition(event.clientY, false);
      return;
    }
    if (!focusDragging) return;
    if (event.type === 'pointermove') {
      event.preventDefault();
      event.stopImmediatePropagation();
      updateFocusPosition(event.clientY, false);
    } else if (event.type === 'pointerup' || event.type === 'pointercancel') {
      event.preventDefault();
      event.stopImmediatePropagation();
      updateFocusPosition(event.clientY, true);
      focusDragging = false;
    }
  }

  function updateFocusPosition(clientY, save) {
    const height = Math.max(1, window.innerHeight);
    const percent = Math.max(8, Math.min(92, (Number(clientY) / height) * 100));
    const state = loadState();
    state.focusY = Math.round(percent * 10) / 10;
    const focus = document.getElementById('eviaReadingFocus');
    focus?.style.setProperty('--focus-y', `${state.focusY}vh`);
    if (save) saveState(state);
  }

  injectStyles();
  ensureUi();
  applyPatchedSupport();

  document.addEventListener('click', interceptControls, true);
  document.addEventListener('input', interceptRangeInput, true);
  document.addEventListener('change', interceptRangeChange, true);
  document.addEventListener('pointerdown', interceptFocusDrag, true);
  document.addEventListener('pointermove', interceptFocusDrag, true);
  document.addEventListener('pointerup', interceptFocusDrag, true);
  document.addEventListener('pointercancel', interceptFocusDrag, true);

  document.addEventListener('click', (event) => {
    if (event.target.closest?.('[data-evia-tool="settings"]')) setTimeout(syncSettingsUi, 0);
  }, true);

  const observer = new MutationObserver(() => {
    if (document.getElementById('eviaTextScale')) syncSettingsUi();
  });
  observer.observe(document.body, { childList:true, subtree:true });
})();