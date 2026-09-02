from pathlib import Path

path = Path('nisia-sync.js')
text = path.read_text(encoding='utf-8')
marker = "  async function boot() {"
if marker not in text:
    raise SystemExit('Nisia boot marker not found')
if '__eviaNisiaDeveloper' in text:
    raise SystemExit('Nisia developer API already exists')

block = r'''  async function developerConnectionStatus() {
    const connected = await isConnected();
    const assignment = readJson(ASSIGNMENT_KEY, {});
    const state = readJson(SYNC_STATE_KEY, {});
    const baseline = new Set(readJson(BASELINE_KEY, []));
    const entries = await portfolioEntries();
    const tracked = Object.keys(state || {});
    const queuedEvidence = entries.filter((entry) => {
      const id = String(entry?.id || '');
      return id && !baseline.has(id) && !state[id]?.complete;
    }).length;
    const syncTimes = Object.values(state || {})
      .map((item) => new Date(item?.synced_at || 0).getTime())
      .filter(Number.isFinite);
    let serverOk = false;
    if (connected && navigator.onLine) {
      try {
        const { data, error } = await getClient().functions.invoke('evia-bootstrap', { body: {} });
        serverOk = !error && Boolean(data?.connected);
      } catch {}
    }
    return {
      connected,
      serverOk,
      assignmentPresent: Boolean(assignment?.learner_id || assignment?.enrolment_id),
      queuedEvidence,
      trackedEvidence: tracked.length,
      lastSync: syncTimes.length ? new Date(Math.max(...syncTimes)).toISOString() : '',
      recoveryAvailable: serverOk,
    };
  }

  async function developerResetConnection() {
    try { await getClient().auth.signOut(); } catch {}
    bootstrapData = null;
    [AUTH_STORAGE_KEY, ASSIGNMENT_KEY, BASELINE_KEY, SYNC_STATE_KEY, CONNECTED_AT_KEY, COURSE_HASH_KEY, COURSE_BACKUP_KEY]
      .forEach((key) => { try { localStorage.removeItem(key); } catch {} });
    updateConnectionButton();
    return true;
  }

  window.__eviaNisiaDeveloper = Object.freeze({
    status: developerConnectionStatus,
    forceSync: () => syncNewEvidence({ force: true }),
    resetConnection: developerResetConnection,
  });

'''
text = text.replace(marker, block + marker, 1)
for expected in ['developerConnectionStatus', 'developerResetConnection', 'window.__eviaNisiaDeveloper', 'forceSync: () => syncNewEvidence({ force: true })']:
    if expected not in text:
        raise SystemExit(f'Missing developer API marker: {expected}')
path.write_text(text, encoding='utf-8')
print('Approved Nisia developer API inserted')
