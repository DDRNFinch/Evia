from pathlib import Path
p=Path('index.html');s=p.read_text()
def rep(a,b,label):
 c=s.count(a)
 if c!=1: raise SystemExit(f'{label}:{c}')
 return s.replace(a,b,1)
s=rep('''    function closeArchDetail() {
      archDetailOpen = false;''','''    function clearArchPreviewUrls(){archPreviewUrls.forEach(url=>URL.revokeObjectURL(url));archPreviewUrls=[]}

    function closeArchDetail() {
      clearArchPreviewUrls();
      archDetailOpen = false;''','close')
s=rep('''    function pushArchView(renderer, title) {
      archDetailStack.push({ html: archDetailContent.innerHTML, title: archDetailTitle.textContent });''','''    function pushArchView(renderer, title) {
      clearArchPreviewUrls();
      archDetailStack.push({ html: archDetailContent.innerHTML, title: archDetailTitle.textContent });''','push')
s=rep('''    function restoreArchView() {
      const previous = archDetailStack.pop();''','''    function restoreArchView() {
      clearArchPreviewUrls();
      const previous = archDetailStack.pop();''','restore')
start=s.index('    function completedPathsWithoutLearning() {')
end=s.index('    function loadLearningEntries() {',start)
new='''    function completedPathsWithoutLearning() {
      const learned=new Set(learningEntries.filter(x=>Array.isArray(x.evidencePath)&&x.evidencePath.length).map(x=>evidencePathKey(x.evidencePath)));
      const result=[];
      completedEvidencePaths.forEach(key=>{try{const path=JSON.parse(key);if(Array.isArray(path)&&path.length&&!learned.has(key))result.push(path)}catch(error){}});
      return result;
    }

    function entriesForEvidencePath(entries,path){const key=evidencePathKey(path);return (entries||[]).filter(entry=>Array.isArray(entry.path)&&evidencePathKey(entry.path)===key).sort((a,b)=>Date.parse(a.createdAt||0)-Date.parse(b.createdAt||0))}
    function completedEvidenceDate(entries){const stamps=(entries||[]).map(entry=>Date.parse(entry.createdAt||'')).filter(Number.isFinite);return stamps.length?new Date(Math.max(...stamps)).toLocaleDateString(undefined,{day:'numeric',month:'short',year:'numeric'}):''}

    async function renderCatchupPage(){
      const paths=completedPathsWithoutLearning();let entries=[];try{entries=await getPortfolioEntries()}catch(error){}
      const cards=paths.map(path=>{const evidence=entriesForEvidencePath(entries,path),date=completedEvidenceDate(evidence),encoded=encodeURIComponent(JSON.stringify(path));return `<div class="catchup-evidence-card"><strong>${escapeDetailHtml(path[path.length-1])}</strong><span>${escapeDetailHtml(path.slice(0,-1).join(' › '))}</span><span>${date?`Evidence completed ${escapeDetailHtml(date)}`:'Evidence completion date unavailable'}</span><div class="catchup-evidence-actions"><button type="button" data-catchup-path="${encoded}">Add Learning</button>${evidence.length?`<button type="button" data-catchup-view="${encoded}">View Evidence</button>`:'<button type="button" disabled>Evidence unavailable</button>'}</div></div>`}).join('');
      archDetailContent.innerHTML=`<div class="detail-card"><strong>Evia catch-up</strong><p>These are completed evidence tasks where no Learn entry is currently attached. Review the evidence and date before adding learning. Only record learning that actually happened.</p></div>${paths.length?`<div class="mapping-list">${cards}</div>`:'<div class="detail-card"><strong>No missing evidence-linked learning entries found</strong><p>Every completed evidence task currently has a Learn entry attached.</p></div>'}<button class="catchup-button" id="openOtjIdeas" type="button"><strong>Other OTJ ideas</strong><span>See eligible non-college learning areas Evia has not found in your Learn entries yet.</span></button>`;
    }

    async function renderCatchupEvidence(path){
      let entries=[];try{entries=entriesForEvidencePath(await getPortfolioEntries(),path)}catch(error){}const date=completedEvidenceDate(entries);
      archDetailContent.innerHTML=`<div class="detail-card"><strong>${escapeDetailHtml(path[path.length-1])}</strong><p>${escapeDetailHtml(path.slice(0,-1).join(' › '))}</p><p>${date?`Evidence completed ${escapeDetailHtml(date)}`:'Evidence completion date unavailable'}</p></div><div class="evidence-gallery" id="catchupEvidenceGallery"></div><button class="catchup-button" type="button" data-catchup-path="${encodeURIComponent(JSON.stringify(path))}"><strong>Add learning from this evidence</strong><span>Only add learning that actually happened.</span></button>`;
      const gallery=document.getElementById('catchupEvidenceGallery');if(!entries.length){gallery.innerHTML='<div class="detail-card"><strong>Evidence file unavailable</strong><p>No saved portfolio file is currently linked to this completed task.</p></div>';return}
      for(const entry of entries){const item=document.createElement('div');item.className='evidence-gallery-item';const meta=document.createElement('div');meta.className='evidence-gallery-meta';meta.textContent=[entry.methodHeading,entry.methodLabel,entry.createdAt?new Date(entry.createdAt).toLocaleString():''].filter(Boolean).join(' · ');const preview=document.createElement('div');preview.className='evidence-gallery-preview';const mime=cleanText(entry.mimeType||entry.blob?.type).toLowerCase();if(entry.type==='text'||mime.startsWith('text/')){const text=document.createElement('div');text.className='portfolio-preview-text';text.textContent=await entry.blob.text();preview.appendChild(text)}else{const url=URL.createObjectURL(entry.blob);archPreviewUrls.push(url);if(entry.type==='photo'||mime.startsWith('image/')){const image=document.createElement('img');image.src=url;image.alt=entry.evidenceLabel||'Evidence photo';preview.appendChild(image)}else if(entry.type==='video'||mime.startsWith('video/')){const video=document.createElement('video');video.src=url;video.controls=true;video.playsInline=true;preview.appendChild(video)}else if(entry.type==='audio'||mime.startsWith('audio/')){const audio=document.createElement('audio');audio.src=url;audio.controls=true;preview.appendChild(audio)}else{const link=document.createElement('a');link.className='secondary-button';link.href=url;link.target='_blank';link.rel='noopener';link.textContent=`Open ${entry.originalFileName||entry.fileName||'evidence file'}`;preview.appendChild(link)}}item.append(meta,preview);gallery.appendChild(item)}
    }

    async function renderCatchupEntryForm(path){
      let entries=[];try{entries=entriesForEvidencePath(await getPortfolioEntries(),path)}catch(error){}const date=completedEvidenceDate(entries),encoded=encodeURIComponent(JSON.stringify(path));
      archDetailContent.innerHTML=`<div class="detail-card"><strong>${escapeDetailHtml(path[path.length-1])}</strong><p>${escapeDetailHtml(path.slice(0,-1).join(' › '))}</p><p>${date?`Evidence completed ${escapeDetailHtml(date)}`:'Evidence completion date unavailable'}</p>${entries.length?`<button class="detail-action-button" type="button" data-catchup-view="${encoded}" style="margin-top:10px">View Evidence</button>`:''}</div><div class="learn-catchup-form"><textarea id="catchupLearningText" placeholder="What did you learn?"></textarea><input id="catchupLearningHours" type="number" min="0" step="0.25" inputmode="decimal" placeholder="Learning hours"><button class="secondary-button" id="saveCatchupLearning" type="button">Save to Learn</button><div class="detail-muted" id="catchupLearningStatus"></div></div>`;
      document.getElementById('saveCatchupLearning')?.addEventListener('click',()=>{const text=document.getElementById('catchupLearningText').value.trim(),hours=Number(document.getElementById('catchupLearningHours').value||0),status=document.getElementById('catchupLearningStatus');if(!text){status.textContent='Add what you learned before saving.';return}saveLearningReflection(text,hours,path,path[path.length-1]);status.textContent='Saved to Learn.';setTimeout(()=>{archDetailStack=[];renderLearnPage()},250)})
    }

    function handleArchDetailAction(event){
      const targetButton=event.target.closest('[data-course-target]');if(targetButton){const id=targetButton.dataset.courseTarget;pushArchView(()=>renderTargetDetail(id),id);return}
      const unitButton=event.target.closest('[data-nvq-unit]');if(unitButton){const unit=unitButton.dataset.nvqUnit;pushArchView(()=>renderNvqUnitDetail(unit),inferredCourseMeta().unitTitles?.[unit]||`Unit ${unit}`);return}
      const evidenceButton=event.target.closest('[data-evidence-path]');if(evidenceButton){try{goToEvidencePath(JSON.parse(decodeURIComponent(evidenceButton.dataset.evidencePath)))}catch(error){}return}
      if(event.target.closest('#openLearnCatchup')){pushArchView(renderCatchupPage,'Catch Up');return}
      if(event.target.closest('#openOtjIdeas')){pushArchView(renderOtjIdeasPage,'OTJ Ideas');return}
      const viewButton=event.target.closest('[data-catchup-view]');if(viewButton){try{const path=JSON.parse(decodeURIComponent(viewButton.dataset.catchupView));pushArchView(()=>renderCatchupEvidence(path),'Evidence')}catch(error){}return}
      const catchupButton=event.target.closest('[data-catchup-path]');if(catchupButton){try{const path=JSON.parse(decodeURIComponent(catchupButton.dataset.catchupPath));pushArchView(()=>renderCatchupEntryForm(path),'Add Learning')}catch(error){}}
    }

'''
s=s[:start]+new+s[end:]
p.write_text(s)
