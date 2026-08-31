from pathlib import Path

p=Path('index.html')
s=p.read_text()

def replace_once(old,new,label):
    global s
    if old not in s: raise SystemExit(f'missing {label}')
    s=s.replace(old,new,1)

def insert_before(marker,block,label):
    global s
    if marker not in s: raise SystemExit(f'missing {label}')
    s=s.replace(marker,block+marker,1)

def replace_block(start,end,new,label):
    global s
    i=s.find(start)
    if i<0: raise SystemExit(f'missing start {label}')
    j=s.find(end,i)
    if j<0: raise SystemExit(f'missing end {label}')
    s=s[:i]+new+s[j:]

replace_block('    function parseNaxosPackPointer(rawValue) {','    async function fetchNaxosJson(url) {',r'''    function parseNaxosPackPointer(rawValue) {
      try {
        const parsed = JSON.parse(rawValue);
        if (!parsed || typeof parsed !== 'object') return null;
        if (parsed.type !== 'evia-mapping-pack-url-v1') return null;
        const courseType = cleanText(parsed.courseType).toLowerCase();
        if (!['ksb','nvq'].includes(courseType)) return null;
        if (!cleanText(parsed.packUrl)) return null;
        return { ...parsed, courseType };
      } catch (error) {
        return null;
      }
    }

''','pack pointer')

helpers=r'''    function uniqueStrings(values) { return [...new Set((values||[]).map(cleanText).filter(Boolean))]; }

    function mappedPathsFromCourse(items, field) {
      const map = {};
      function walk(nodes,path=[]) {
        (nodes||[]).forEach(node=>{
          const next=[...path,node.label];
          if(Array.isArray(node.children)&&node.children.length) walk(node.children,next);
          else (Array.isArray(node[field])?node[field]:[]).forEach(id=>{const key=cleanText(id);if(key)(map[key] ||= []).push(next);});
        });
      }
      walk(items);
      return map;
    }

    function buildKsbCourseMeta(pack, registry, items) {
      const officialItems = registry?.items && typeof registry.items === 'object' ? registry.items : {};
      const qualification = pack?.qualification || {};
      const learning = pack?.learning || qualification?.learning || {};
      return {
        courseType:'ksb',
        qualificationId:cleanText(qualification.id),
        title:cleanText(qualification.title),
        version:cleanText(qualification.version),
        source:cleanText(qualification.source),
        officialItems,
        ksbOrder:Object.keys(officialItems),
        mappings:mappedPathsFromCourse(items,'ksbTargets'),
        learning,
        learningRequiredHours:Number(learning.requiredHours || qualification.otjHours || qualification.learningHours || 0) || null,
        qualification:{ id:cleanText(qualification.id), title:cleanText(qualification.title), version:cleanText(qualification.version), otjHours:Number(qualification.otjHours||0)||null }
      };
    }

    function nvqParentAc(id) {
      const parts=cleanText(id).split('.');
      return parts.length>=3?`${parts[0]}.${parts[1]}.${parts[2]}`:cleanText(id);
    }

    function nvqChildUrl(packUrl,path) {
      return new URL(path,new URL('./',packUrl)).href;
    }

    function flatNvqTasks(categories) {
      return (categories||[]).flatMap(category=>(category.subcategories||[]).flatMap(subcategory=>(subcategory.tasks||[]).map(task=>({task,category,subcategory}))));
    }

    async function loadNvqRequiredTargets(pack, packUrl) {
      const active=new Set(pack?.route?.activeUnits||[]), keep=id=>active.has(String(id||'').split('.')[0]);
      const sourceIds=[];
      for(const sourcePath of (pack.coverageSourcePacks||[])) {
        const sourcePackUrl=nvqChildUrl(packUrl,sourcePath);
        const sourcePack=await fetchNaxosJson(sourcePackUrl);
        const sourceCats=await Promise.all((sourcePack.categoryFiles||[]).map(path=>fetchNaxosJson(nvqChildUrl(sourcePackUrl,path))));
        if(sourcePack.routeMappings){
          const mappings=await fetchNaxosJson(nvqChildUrl(sourcePackUrl,sourcePack.routeMappings));
          for(const [taskId,ids] of Object.entries(mappings.taskMappings||{})){
            const found=flatNvqTasks(sourceCats).find(row=>row.task.id===taskId);
            if(found)found.task.mappedAtomicTargets=uniqueStrings([...(found.task.mappedAtomicTargets||[]),...ids]);
          }
        }
        sourceIds.push(...uniqueStrings(flatNvqTasks(sourceCats).flatMap(({task})=>[...(task.directLo7Targets||[]),...(task.mappedAtomicTargets||[])])).filter(keep));
      }
      for(const sourcePath of (pack.coverageSourceFiles||[])){
        const category=await fetchNaxosJson(nvqChildUrl(packUrl,sourcePath));
        sourceIds.push(...uniqueStrings(flatNvqTasks([category]).flatMap(({task})=>[...(task.directLo7Targets||[]),...(task.mappedAtomicTargets||[])])).filter(keep));
      }
      const requiredDocs=await Promise.all((pack.requiredTargetFiles||[]).map(path=>fetchNaxosJson(nvqChildUrl(packUrl,path))));
      return uniqueStrings([...sourceIds,...requiredDocs.flatMap(doc=>doc.targets||[]),...(pack.requiredAtomicTargets||[])]).filter(keep);
    }

    async function prepareNvqCategories(pack, packUrl, categories, requiredTargets) {
      const cloned=JSON.parse(JSON.stringify(categories||[]));
      const active=new Set(pack?.route?.activeUnits||[]), keep=id=>active.has(String(id||'').split('.')[0]);
      const optionalUnit=String(pack?.route?.optionalUnit||'');
      const optionalCategory=cloned.find(category=>String(category.id)==='5');
      if(optionalCategory&&pack?.qualification?.id==='6570-04')optionalCategory.title=pack.route.title||optionalCategory.title;
      flatNvqTasks(cloned).forEach(({task})=>{
        if(task.primaryUnit==='OPTIONAL')task.primaryUnit=optionalUnit;
        task.directLo7Targets=uniqueStrings(task.directLo7Targets||[]).filter(keep);
        task.mappedAtomicTargets=uniqueStrings(task.mappedAtomicTargets||[]).filter(keep);
        if(requiredTargets.length&&(task.targetPrefixes||[]).length){
          const prefixes=task.targetPrefixes.map(prefix=>String(prefix).replaceAll('$OPTIONAL',optionalUnit));
          const matched=requiredTargets.filter(id=>prefixes.some(prefix=>id===prefix||id.startsWith(`${prefix}.`)));
          task.mappedAtomicTargets=uniqueStrings([...task.mappedAtomicTargets,...matched]).filter(keep);
        }
      });
      if(pack.routeMappings){
        const mappings=await fetchNaxosJson(nvqChildUrl(packUrl,pack.routeMappings));
        for(const [taskId,ids] of Object.entries(mappings.taskMappings||{})){
          const found=flatNvqTasks(cloned).find(row=>row.task.id===taskId);
          if(found)found.task.mappedAtomicTargets=uniqueStrings([...(found.task.mappedAtomicTargets||[]),...ids.filter(keep)]);
        }
      }
      return cloned;
    }

    function resolvedNvqProfile(task, profiles) {
      const title=cleanText(task?.title).toLowerCase(), tags=new Set(task?.tags||[]);
      let id=cleanText(task?.evidenceProfile);
      if(!id&&task?.id==='1.1.4')id='job-information';
      if(!id&&/(dpc|cavity tray|insulation|wall tie|fire barrier|fire break|support angle|wind post|movement joint|weep|vent|reinforcement|soffit|temporary|prop|support|bedding|backfill|pipework|chamber|gully)/i.test(title))id='hidden-work';
      if(!id&&task?.type==='trade')id='practical';
      if(!id&&task?.type==='optional-knowledge')id='knowledge';
      if(!id&&task?.type==='common'&&/^(summarise|explain|discuss|describe)/i.test(title))id='knowledge';
      if(!id&&tags.has('SAFE_WORK'))id='safety';
      if(!id&&tags.has('COMMUNICATION'))id='communication';
      if(!id&&(tags.has('RESOURCES')||tags.has('TOOLS')))id='resources';
      if(!id&&tags.has('QUALITY'))id='quality';
      if(!id&&tags.has('PROGRAMME'))id='programme';
      if(!id)id='knowledge';
      return profiles[id]||profiles.knowledge||{};
    }

    function buildNaxosNvqCourse(categories,evidenceRules) {
      const profiles=evidenceRules?.profiles||{};
      return (categories||[]).slice(0,5).map(category=>({
        label:cleanText(category.title)||`Route ${category.id||''}`.trim(),
        children:(category.subcategories||[]).slice(0,5).map(subcategory=>({
          label:cleanText(subcategory.title)||`Section ${subcategory.id||''}`.trim(),
          children:(subcategory.tasks||[]).slice(0,5).map(task=>{
            const profile=resolvedNvqProfile(task,profiles);
            const requirementItems=naxosTaskRequirements(task,null,profile);
            const atomicTargets=uniqueStrings([...(task.directLo7Targets||[]),...(task.mappedAtomicTargets||[])]);
            const acTargets=uniqueStrings(atomicTargets.map(nvqParentAc));
            return { label:cleanText(task.title)||cleanText(task.id)||'Task', recommended:naxosPreferredOption(profile), alternative:naxosAlternativeOption(profile), requirementsHeading:'What the evidence must show or explain', requirementItems, requirements:requirementItems.join('\n'), acTargets, atomicTargets, primaryUnit:cleanText(task.primaryUnit) };
          })
        }))
      })).filter(category=>category.label&&category.children.length);
    }

    function buildNvqCourseMeta(pack,items,categories,requiredTargets) {
      const qualification=pack?.qualification||{}, units=(pack?.route?.activeUnits||[]).map(String), unitTitles={};
      (qualification.optionalUnits||[]).forEach(unit=>{if(cleanText(unit?.id)&&cleanText(unit?.title))unitTitles[String(unit.id)]=cleanText(unit.title)});
      if(pack?.route?.optionalUnit&&pack?.route?.title)unitTitles[String(pack.route.optionalUnit)]=cleanText(pack.route.title);
      if(qualification.unitTitles&&typeof qualification.unitTitles==='object')Object.assign(unitTitles,qualification.unitTitles);
      const atomsByParent=new Map();
      flatNvqTasks(categories).forEach(({task})=>uniqueStrings([...(task.directLo7Targets||[]),...(task.mappedAtomicTargets||[])]).forEach(atom=>{const parent=nvqParentAc(atom);if(!atomsByParent.has(parent))atomsByParent.set(parent,new Set());atomsByParent.get(parent).add(atom)}));
      const wordingSource=pack.criteriaWording||qualification.criteriaWording||{};
      const criteria=[...atomsByParent.entries()].map(([id,atoms])=>({id,wording:cleanText(wordingSource[id]),atoms:[...atoms].sort((a,b)=>a.localeCompare(b,undefined,{numeric:true}))})).sort((a,b)=>a.id.localeCompare(b.id,undefined,{numeric:true}));
      return { courseType:'nvq', qualificationId:cleanText(qualification.id), title:cleanText(qualification.title), source:cleanText(qualification.source), glh:Number(qualification.glh||0)||null, tqt:Number(qualification.tqt||0)||null, units, unitTitles, criteria, mappings:mappedPathsFromCourse(items,'acTargets'), atomicTargetCount:requiredTargets.length, qualification:{id:cleanText(qualification.id),title:cleanText(qualification.title),glh:Number(qualification.glh||0)||null,tqt:Number(qualification.tqt||0)||null} };
    }

    async function importNaxosNvqPack(pointer) {
      scannerStatus.textContent='Loading Naxos NVQ course...';
      const packUrl=new URL(pointer.packUrl,window.location.href).href;
      const pack=await fetchNaxosJson(packUrl);
      const type=cleanText(pack?.qualification?.courseType||pack?.courseType).toLowerCase();
      if(type!=='nvq')throw new Error('The Naxos pack is not an NVQ course.');
      const categoryUrls=(pack.categoryFiles||[]).map(path=>nvqChildUrl(packUrl,path));
      const evidencePath=pack.evidenceRules||pack.evidence?.rulesFile||'../evidence-rules.json';
      const [evidenceRules,...rawCategories]=await Promise.all([fetchNaxosJson(nvqChildUrl(packUrl,evidencePath)),...categoryUrls.map(fetchNaxosJson)]);
      const requiredTargets=await loadNvqRequiredTargets(pack,packUrl);
      const categories=await prepareNvqCategories(pack,packUrl,rawCategories,requiredTargets);
      const items=buildNaxosNvqCourse(categories,evidenceRules);
      if(!items.length)throw new Error('The Naxos NVQ pack contains no course structure.');
      const meta=buildNvqCourseMeta(pack,items,categories,requiredTargets);
      applyImportedCourse(items,cleanText(pack?.qualification?.title),meta);
      updateArchBars().catch(()=>{});
      closeScanner(false);
    }

'''
insert_before('    async function importNaxosKsbPack(pointer) {',helpers,'nvq helpers')

replace_once("      applyImportedCourse(items, cleanText(pack?.qualification?.title));\n", "      const meta = buildKsbCourseMeta(pack, registry, items);\n      applyImportedCourse(items, cleanText(pack?.qualification?.title), meta);\n", 'ksb meta import')

replace_block('    function applyImportedCourse(items, title = \'\') {','    function handleQrRawValue(rawValue) {',r'''    function applyImportedCourse(items, title = '', meta = {}) {
      courseItems = items.slice(0, 5);
      activeCourseTitle = cleanText(title);
      saveCourse(courseItems, activeCourseTitle);
      saveCourseMeta(meta);
      renderCourseTitle();
      closeEvidence();
      resetPills();
      screen.classList.add('active', 'pills-ready');
      setSpeech(menuSpeechLines(1));
      scannerStatus.textContent = 'Naxos course imported.';
      updateBackButton();
    }

''','apply imported course')

replace_block('    function handleQrRawValue(rawValue) {','    async function startScanner() {',r'''    function handleQrRawValue(rawValue) {
      const pointer = parseNaxosPackPointer(rawValue);
      if (pointer) {
        const importer = pointer.courseType === 'nvq' ? importNaxosNvqPack : importNaxosKsbPack;
        importer(pointer).catch((error) => {
          console.error('Could not import Naxos course pack', error);
          scannerStatus.textContent = 'Could not load that Naxos course.';
          scannerBusy = false;
          if (scannerPanel.classList.contains('open') && scannerStream) scannerFrame = requestAnimationFrame(scanFrame);
        });
        return true;
      }
      const items = parseNaxosPayload(rawValue);
      if (items) {
        applyImportedCourse(items,'',{});
        closeScanner(false);
        return true;
      }
      scannerStatus.textContent = 'That QR code is not a valid Naxos course code.';
      return false;
    }

''','handle qr')

p.write_text(s)
print('Naxos progress metadata import patch applied')
