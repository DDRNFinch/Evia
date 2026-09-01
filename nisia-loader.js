(() => {
  'use strict';

  const AUTH_STORAGE_KEY = 'nisia-evia-auth-v1';
  const SUPABASE_SCRIPT = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2';
  const NISIA_SYNC_SCRIPT = './nisia-sync.js?v=2';

  let activationPromise = null;
  let boundButton = null;

  function hasNisiaSessionHint() {
    try {
      const raw = localStorage.getItem(AUTH_STORAGE_KEY);
      return Boolean(raw && raw !== 'null' && raw !== '{}' && raw !== 'undefined');
    } catch {
      return false;
    }
  }

  function loadScript(src, id) {
    const existing = document.getElementById(id);
    if (existing) {
      if (existing.dataset.loaded === 'true') return Promise.resolve();
      return new Promise((resolve, reject) => {
        existing.addEventListener('load', () => resolve(), { once: true });
        existing.addEventListener('error', () => reject(new Error(`Could not load ${id}.`)), { once: true });
      });
    }

    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.id = id;
      script.src = src;
      script.async = false;
      script.addEventListener('load', () => {
        script.dataset.loaded = 'true';
        resolve();
      }, { once: true });
      script.addEventListener('error', () => reject(new Error(`Could not load ${id}.`)), { once: true });
      document.head.appendChild(script);
    });
  }

  async function activateNisia() {
    if (window.__eviaNisiaRuntimeActive) return;
    if (activationPromise) return activationPromise;

    activationPromise = (async () => {
      if (!window.supabase?.createClient) {
        await loadScript(SUPABASE_SCRIPT, 'evia-nisia-supabase-sdk');
      }
      if (!window.supabase?.createClient) throw new Error('Nisia connection library is unavailable.');

      if (!document.querySelector('script[data-evia-nisia-sync="true"]')) {
        const script = document.createElement('script');
        script.src = NISIA_SYNC_SCRIPT;
        script.async = false;
        script.dataset.eviaNisiaSync = 'true';
        await new Promise((resolve, reject) => {
          script.addEventListener('load', resolve, { once: true });
          script.addEventListener('error', () => reject(new Error('Nisia sync could not be loaded.')), { once: true });
          document.head.appendChild(script);
        });
      }

      window.__eviaNisiaRuntimeActive = true;
    })();

    try {
      await activationPromise;
    } catch (error) {
      activationPromise = null;
      throw error;
    }
  }

  function setStandaloneLabel(button) {
    if (!button || window.__eviaNisiaRuntimeActive) return;
    button.textContent = hasNisiaSessionHint() ? 'Sync with Nisia' : 'Connect Nisia';
  }

  function bindConnectionButton() {
    const button = document.getElementById('uploadPortfolio');
    if (!button || boundButton === button) return;
    boundButton = button;
    setStandaloneLabel(button);

    button.addEventListener('click', async (event) => {
      if (window.__eviaNisiaRuntimeActive) return;

      event.preventDefault();
      event.stopImmediatePropagation();

      const label = hasNisiaSessionHint() ? 'Sync with Nisia' : 'Connect Nisia';
      button.disabled = true;
      button.textContent = 'Opening…';

      try {
        await activateNisia();
        button.disabled = false;
        button.textContent = label;
        queueMicrotask(() => button.click());
      } catch (error) {
        console.warn('Nisia remains optional and is currently unavailable', error);
        button.disabled = false;
        button.textContent = label;
      }
    }, true);
  }

  function boot() {
    bindConnectionButton();
    const observer = new MutationObserver(bindConnectionButton);
    observer.observe(document.documentElement, { childList: true, subtree: true });

    if (hasNisiaSessionHint()) {
      activateNisia().catch((error) => console.warn('Nisia connection will retry when online', error));
    }

    window.addEventListener('online', () => {
      if (hasNisiaSessionHint() && !window.__eviaNisiaRuntimeActive) {
        activateNisia().catch(() => {});
      }
    });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot, { once: true });
  else boot();
})();
