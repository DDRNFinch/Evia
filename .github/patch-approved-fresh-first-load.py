from pathlib import Path

path = Path('index.html')
text = path.read_text(encoding='utf-8')

marker = '\n</body>'
if text.count(marker) != 1:
    raise SystemExit(f'Expected exactly one closing body marker; found {text.count(marker)}')
if 'Current Evia runtime: direct first-load path' in text:
    raise SystemExit('Fresh-load runtime block already exists')

runtime = '''
  <!-- Current Evia runtime: direct first-load path; the service worker skips runtime files already present here. -->
  <script src="./evia-approved-features.js"></script>
  <script src="./evia-approved-learning-ui.js"></script>
  <script src="./evia-approved-menu-support.js"></script>
  <script src="./evia-approved-epa.js"></script>
  <script src="./evia-approved-targets.js"></script>
  <script src="./evia-approved-target-plan-v1.js"></script>
  <script src="./evia-approved-updates-stable-v1.js"></script>
  <script src="./evia-sw-update-hardening-v1.js"></script>
  <script src="./evia-approved-runtime-fixes-v1.js"></script>
  <script src="./evia-ui-polish-v1.js"></script>
  <script src="./evia-ui-polish-visible-v1.js?v=2"></script>
  <script src="./evia-approved-settings-stable-v1.js"></script>
  <script src="./evia-developer-mode-v1.js?v=1"></script>
  <script src="./evia-approved-support-preview-visual-v1.js"></script>
  <script src="./evia-approved-naxos-evidence-contract-v2.js"></script>
  <script src="./evia-approved-naxos-evidence-existing-v2.js"></script>
  <script src="./evia-approved-speech-landing-fix.js"></script>
  <script src="./evia-approved-evidence-capture-layout-v1.js"></script>
  <script src="./evia-approved-portfolio-hub-icon-v1.js"></script>
  <script src="./evia-approved-update-system-v1.js?v=2"></script>
  <script src="./evia-approved-ux-cleanup-v1.js?v=2"></script>
  <script src="./evia-approved-ux-cleanup-v3.js?v=2"></script>
  <script src="./nisia-loader.js?v=3"></script>
  <script src="./evia-approved-attend-learn-render-v4.js?v=1"></script>
  <script src="./evia-approved-attend-learn-final-v5.js?v=2"></script>
'''

text = text.replace(marker, runtime + marker, 1)
path.write_text(text, encoding='utf-8')
print('Added current Evia runtime directly to index.html for first-ever visits')
