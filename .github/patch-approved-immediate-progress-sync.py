from pathlib import Path

path = Path('nisia-sync.js')
text = path.read_text(encoding='utf-8')

insert_before = '  function createModal() {'
if insert_before not in text:
    raise SystemExit('Expected connector marker not found')

hook = r'''  function installCompletionSyncHook() {
    try {
      if (typeof markEvidencePathComplete === 'function' && !markEvidencePathComplete.__nisiaCompletionSync) {
        const originalMark = markEvidencePathComplete;
        const wrappedMark = function() {
          const result = originalMark.apply(this, arguments);
          queueMicrotask(() => syncNewEvidence({ force: true }).catch(() => {}));
          return result;
        };
        wrappedMark.__nisiaCompletionSync = true;
        markEvidencePathComplete = wrappedMark;
      }
    } catch {}
    try {
      if (typeof clearEvidencePathComplete === 'function' && !clearEvidencePathComplete.__nisiaCompletionSync) {
        const originalClear = clearEvidencePathComplete;
        const wrappedClear = function() {
          const result = originalClear.apply(this, arguments);
          queueMicrotask(() => syncNewEvidence({ force: true }).catch(() => {}));
          return result;
        };
        wrappedClear.__nisiaCompletionSync = true;
        clearEvidencePathComplete = wrappedClear;
      }
    } catch {}
  }

'''
if 'function installCompletionSyncHook()' not in text:
    text = text.replace(insert_before, hook + insert_before, 1)

old_boot = "  async function boot() {\n    installPairingQrHandler();"
new_boot = "  async function boot() {\n    installCompletionSyncHook();\n    installPairingQrHandler();"
if old_boot not in text:
    raise SystemExit('Expected boot marker not found')
text = text.replace(old_boot, new_boot, 1)

for marker in ['function installCompletionSyncHook()', 'syncNewEvidence({ force: true })', 'installCompletionSyncHook();']:
    if marker not in text:
        raise SystemExit(f'Missing completion-sync marker: {marker}')

path.write_text(text, encoding='utf-8')
print('Immediate Evia completion sync hook installed')
