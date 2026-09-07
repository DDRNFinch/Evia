(()=>{'use strict';
// Teach/Test AI endpoint only. This does not expose or control Evia's other app functions.
globalThis.EVIA_TEACH_TEST_ENDPOINT=globalThis.EVIA_TEACH_TEST_ENDPOINT||'https://evia-teach-test.finchyisnow.workers.dev/v1/teach-test';
if(typeof document!=='undefined'&&!document.querySelector('script[data-evia-6570-05-completion-rules]')){
  const script=document.createElement('script');
  script.src='./evia-approved-6570-05-completion-rules-v1.js?v=1';
  script.async=false;
  script.dataset.evia657005CompletionRules='1';
  document.head.appendChild(script);
}
})();