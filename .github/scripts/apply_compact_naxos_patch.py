from pathlib import Path

path = Path('index.html')
text = path.read_text()
marker = "    function applyNaxosKsbCustomisations(categories, customisations) {"
if marker not in text:
    raise SystemExit('Naxos customisation importer marker not found')
insert = r'''    function naxosEvidenceFromPatch(value) {
      if (!Array.isArray(value)) return null;
      const profileId = cleanText(value[0]);
      const rows = Array.isArray(value[1]) ? value[1] : [];
      const preferred = rows.map((row) => ({
        type: cleanText(row?.[0]),
        label: cleanText(row?.[1]),
        instruction: cleanText(row?.[2])
      })).filter((item) => item.type || item.label || item.instruction);
      const evidence = {};
      if (profileId) evidence.profileId = profileId;
      if (preferred.length) evidence.preferred = preferred;
      return Object.keys(evidence).length ? evidence : null;
    }

    function naxosExpandedRequirements(targets, facets) {
      const items = facets?.items || {};
      return (targets || []).flatMap((id) => {
        const rows = Array.isArray(items[id]) ? items[id] : [];
        return rows.length ? rows.map((row) => `${id}.${cleanText(row?.[0])}`).filter((value) => !value.endsWith('.')) : [id];
      });
    }

    function applyNaxosKsbPatch(categories, patch, facets) {
      const cloned = JSON.parse(JSON.stringify(categories || []));
      const compact = patch && typeof patch === 'object' ? patch : {};

      (Array.isArray(compact.c) ? compact.c : []).forEach((row) => {
        const ci = Number(row?.[0]), title = cleanText(row?.[1]);
        if (Number.isInteger(ci) && cloned[ci] && title) cloned[ci].title = title;
      });
      (Array.isArray(compact.s) ? compact.s : []).forEach((row) => {
        const ci = Number(row?.[0]), si = Number(row?.[1]), title = cleanText(row?.[2]);
        const subcategory = cloned[ci]?.subcategories?.[si];
        if (Number.isInteger(ci) && Number.isInteger(si) && subcategory && title) subcategory.title = title;
      });
      (Array.isArray(compact.t) ? compact.t : []).forEach((row) => {
        const ci = Number(row?.[0]), si = Number(row?.[1]), ti = Number(row?.[2]), title = cleanText(row?.[3]);
        const task = cloned[ci]?.subcategories?.[si]?.tasks?.[ti];
        if (Number.isInteger(ci) && Number.isInteger(si) && Number.isInteger(ti) && task && title) task.title = title;
      });
      (Array.isArray(compact.e) ? compact.e : []).forEach((row) => {
        const ci = Number(row?.[0]), si = Number(row?.[1]), ti = Number(row?.[2]);
        const task = cloned[ci]?.subcategories?.[si]?.tasks?.[ti];
        const evidence = naxosEvidenceFromPatch(row?.[3]);
        if (Number.isInteger(ci) && Number.isInteger(si) && Number.isInteger(ti) && task && evidence) task.naxosEvidenceOverride = evidence;
      });
      (Array.isArray(compact.a) ? compact.a : []).forEach((row, index) => {
        const ci = Number(row?.[0]), si = Number(row?.[1]), title = cleanText(row?.[2]);
        const targets = Array.isArray(row?.[3]) ? row[3].map(cleanText).filter(Boolean) : [];
        const subcategory = cloned[ci]?.subcategories?.[si];
        if (!Number.isInteger(ci) || !Number.isInteger(si) || !subcategory || !title || !targets.length) return;
        const evidence = naxosEvidenceFromPatch(row?.[4]);
        subcategory.tasks = Array.isArray(subcategory.tasks) ? subcategory.tasks : [];
        subcategory.tasks.push({
          id: `custom-${ci}-${si}-${index + 1}`,
          title,
          ksbTargets: targets,
          evidenceRequirements: naxosExpandedRequirements(targets, facets),
          evidenceProfile: cleanText(evidence?.profileId) || 'knowledge',
          naxosEvidenceOverride: evidence,
          naxosCustom: true
        });
      });
      return cloned;
    }

'''
text = text.replace(marker, insert + marker, 1)
old = r'''      const registryUrl = new URL(pack.ksbRegistry, packDir).href;
      const evidenceRulesUrl = new URL(pack.evidenceRules, packDir).href;
      const categoryUrls = (pack.categoryFiles || []).map((file) => new URL(file, packDir).href);
      const [registry, evidenceRules, ...categories] = await Promise.all([
        fetchNaxosJson(registryUrl),
        fetchNaxosJson(evidenceRulesUrl),
        ...categoryUrls.map(fetchNaxosJson)
      ]);
      const customisedCategories = applyNaxosKsbCustomisations(categories, pointer.customisations);'''
new = r'''      const registryUrl = new URL(pack.ksbRegistry, packDir).href;
      const facetsUrl = new URL(pack.facetRegistry, packDir).href;
      const evidenceRulesUrl = new URL(pack.evidenceRules, packDir).href;
      const categoryUrls = (pack.categoryFiles || []).map((file) => new URL(file, packDir).href);
      const [registry, facets, evidenceRules, ...categories] = await Promise.all([
        fetchNaxosJson(registryUrl),
        fetchNaxosJson(facetsUrl),
        fetchNaxosJson(evidenceRulesUrl),
        ...categoryUrls.map(fetchNaxosJson)
      ]);
      const customisedCategories = pointer.patch
        ? applyNaxosKsbPatch(categories, pointer.patch, facets)
        : applyNaxosKsbCustomisations(categories, pointer.customisations);'''
if old not in text:
    raise SystemExit('Naxos import fetch block not found')
text = text.replace(old, new, 1)
path.write_text(text)
