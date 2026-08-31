from pathlib import Path
p=Path('index.html'); t=p.read_text()
start=t.find('    function extensionForMime(mimeType, type) {')
end=t.find('    function parseNaxosPayload(rawValue) {',start)
if start<0 or end<0: raise SystemExit('capture boundaries missing')
new=r'''    function extensionForMime(mimeType, type) {
      if (type === 'text') return 'txt';
      if (type === 'photo') return /png/i.test(mimeType) ? 'png' : 'jpg';
      if (/mp4/i.test(mimeType)) return 'mp4';
      if (/ogg/i.test(mimeType)) return 'ogg';
      return 'webm';
    }

    function captureEvidenceContext(type) {
      return {
        path: activeEvidencePath.slice(),
        evidenceLabel: activeEvidencePath[activeEvidencePath.length - 1] || activeEvidence?.label || 'Evidence',
        method: activeEvidenceMethod ? { ...activeEvidenceMethod } : { heading: type, label: type, type },
        requirements: cleanText(activeEvidence?.requirements),
        learner: officialLearnerProfile()
      };
    }

    async function saveEvidenceBlob(blob, type, savedContext = null) {
      const createdAt = new Date().toISOString();
      const context = savedContext || captureEvidenceContext(type);
      const method = context.method;
      const label = context.evidenceLabel;
      const extension = extensionForMime(blob.type, type);
      const compactDate = createdAt.replace(/[-:]/g, '').replace(/\..+/, '').replace('T', '-');
      const entry = {
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
        createdAt,
        type,
        mimeType: blob.type || (type === 'text' ? 'text/plain' : 'application/octet-stream'),
        fileName: `${compactDate}-${safeFilename(label)}.${extension}`,
        path: context.path.slice(),
        evidenceLabel: label,
        methodHeading: method.heading,
        methodLabel: method.label,
        requirements: context.requirements,
        learner: context.learner || officialLearnerProfile(),
        blob
      };
      await addPortfolioEntry(entry);
      updateArchBars().catch(() => {});
      return entry;
    }

    function showCaptureStatus(message) {
      const status = document.getElementById('captureStatus');
      if (status) status.textContent = message;
    }

    function captureKindFromDetail(detail, fallbackType = 'text') {
      const text = `${detail?.displayType || ''} ${detail?.label || ''} ${detail?.instruction || ''}`.toLowerCase();
      if (/\bvideo\b/.test(text)) return 'video';
      if (/\bphotos?\b|\bcamera\b|\bimages?\b/.test(text)) return 'photo';
      if (/\baudio\b|\bvoice\b|\bmicrophone\b|\breflection\b/.test(text)) return 'audio';
      if (/\bwritten\b|\bwrite\b|\btext\b|\bstatement\b|\btyping\b/.test(text)) return 'text';
      if (fallbackType === 'camera') return 'photo';
      if (fallbackType === 'audio') return 'audio';
      return 'text';
    }

    function captureQuantity(detail, type) {
      const label = cleanText(detail?.label);
      const instruction = cleanText(detail?.instruction);
      const source = `${label} ${instruction}`;
      const words = type === 'photo' ? 'photos?|images?'
        : type === 'video' ? 'videos?|recordings?'
        : type === 'audio' ? 'audio|recordings?|voice notes?'
        : 'written|text|statements?|entries';
      const direct = source.match(new RegExp(`\\b(\\d+)\\s*(?:x\\s*)?(?:${words})\\b`, 'i'));
      const leading = label.match(/^\s*(\d+)\b/);
      const raw = Number(direct?.[1] || leading?.[1] || 1);
      return Number.isFinite(raw) ? Math.max(1, Math.min(12, raw)) : 1;
    }

    function buildCapturePlan(option) {
      const details = Array.isArray(option?.details) && option.details.length
        ? option.details
        : [{ displayType: option?.displayType || '', label: option?.label || '', instruction: option?.instruction || '' }];
      const fallback = option?.type || 'text';
      const steps = [];
      details.forEach((detail) => {
        const cleanDetail = normaliseEvidenceDetail(detail) || detail || {};
        const type = captureKindFromDetail(cleanDetail, fallback);
        const quantity = captureQuantity(cleanDetail, type);
        for (let index = 0; index < quantity; index += 1) {
          steps.push({ type, label: cleanText(cleanDetail.label) || evidenceTypeDisplayLabel(type), instruction: cleanText(cleanDetail.instruction), itemIndex: index + 1, itemTotal: quantity });
        }
      });
      if (!steps.length) steps.push({ type: fallback === 'audio' ? 'audio' : fallback === 'camera' ? 'photo' : 'text', label: option?.label || 'Evidence', instruction: '', itemIndex: 1, itemTotal: 1 });
      return steps;
    }

    function clearCaptureSequence() {
      captureSessionId += 1;
      capturePlan = [];
      captureStepIndex = 0;
    }

    function captureStepStatus(step) {
      const typeName = step.type === 'photo' ? 'Photo' : step.type === 'video' ? 'Video' : step.type === 'audio' ? 'Audio' : 'Written evidence';
      if (step.itemTotal > 1) return `${typeName} ${step.itemIndex} of ${step.itemTotal}`;
      if (capturePlan.length > 1) return `${typeName} · step ${captureStepIndex + 1} of ${capturePlan.length}`;
      return typeName;
    }

    async function completeCaptureStep(sessionId) {
      if (sessionId !== captureSessionId) return;
      stopCapture();
      captureStepIndex += 1;
      if (captureStepIndex < capturePlan.length) {
        await wait(280);
        if (sessionId !== captureSessionId) return;
        runCaptureStep();
        return;
      }
      await completeEvidenceExperience();
    }

    async function openPhotoCapture(step, sessionId) {
      stopCapture(); captureMode = 'photo';
      evidenceTop.innerHTML = '<div class="capture-surface"><div class="capture-square"><video id="captureVideo" playsinline muted></video><div class="capture-controls"><button class="capture-button" id="photoCapture" type="button">Take photo</button></div></div><div class="capture-status" id="captureStatus"></div></div>';
      evidenceTop.style.gridTemplateRows = '1fr';
      const video=document.getElementById('captureVideo'), capture=document.getElementById('photoCapture');
      updateBackButton(); fitUiText();
      try {
        captureStream=await navigator.mediaDevices.getUserMedia({video:{facingMode:{ideal:'environment'},width:{ideal:1600},height:{ideal:1600},aspectRatio:{ideal:1}},audio:false});
        if(sessionId!==captureSessionId){stopCapture();return}
        video.srcObject=captureStream; await video.play(); showCaptureStatus(captureStepStatus(step));
        capture.addEventListener('click',async()=>{
          if(sessionId!==captureSessionId)return; capture.disabled=true;
          const canvas=document.createElement('canvas'); canvas.width=video.videoWidth||1280; canvas.height=video.videoHeight||1280;
          canvas.getContext('2d').drawImage(video,0,0,canvas.width,canvas.height);
          const blob=await new Promise(resolve=>canvas.toBlob(resolve,'image/jpeg',.9));
          if(!blob||sessionId!==captureSessionId){capture.disabled=false;return}
          try{await saveEvidenceBlob(blob,'photo');showCaptureStatus('Saved');await completeCaptureStep(sessionId)}catch(error){capture.disabled=false;showCaptureStatus('Could not save this photo.')}
        });
      } catch(error){evidenceTop.innerHTML='<div class="capture-surface">Camera access is required to take this photo.</div>'}
    }

    async function openVideoCapture(step, sessionId) {
      stopCapture(); captureMode='video';
      evidenceTop.innerHTML='<div class="capture-surface"><div class="capture-square"><video id="captureVideo" playsinline muted></video><div class="recording-timer" id="recordingTimer">00:00</div><div class="capture-controls"><button class="capture-button" id="recordToggle" type="button">Record video</button></div></div><div class="capture-status" id="captureStatus"></div></div>';
      evidenceTop.style.gridTemplateRows='1fr';
      const video=document.getElementById('captureVideo'),toggle=document.getElementById('recordToggle'),timer=document.getElementById('recordingTimer');
      updateBackButton();fitUiText();
      try{
        captureStream=await navigator.mediaDevices.getUserMedia({video:{facingMode:{ideal:'environment'},width:{ideal:1280},height:{ideal:1280},aspectRatio:{ideal:1},frameRate:{ideal:24,max:30}},audio:{channelCount:{ideal:1},echoCancellation:true,noiseSuppression:true,autoGainControl:true}});
        if(sessionId!==captureSessionId){stopCapture();return} video.srcObject=captureStream;await video.play();showCaptureStatus(captureStepStatus(step));
        toggle.addEventListener('click',()=>{
          if(!window.MediaRecorder){showCaptureStatus('Recording is not supported by this browser.');return}
          if(!recorder||recorder.state==='inactive'){
            const chunks=[],recordingContext=captureEvidenceContext('video'),mimeType=preferredVideoMimeType(),options={videoBitsPerSecond:1200000,audioBitsPerSecond:64000};if(mimeType)options.mimeType=mimeType;
            const currentRecorder=new MediaRecorder(captureStream,options);recorder=currentRecorder;
            currentRecorder.ondataavailable=e=>{if(e.data&&e.data.size)chunks.push(e.data)};
            currentRecorder.onstop=async()=>{stopRecordingTimer();if(recorder===currentRecorder)recorder=null;if(sessionId!==captureSessionId)return;const blob=new Blob(chunks,{type:currentRecorder.mimeType||mimeType||'video/webm'});try{if(blob.size){await saveEvidenceBlob(blob,'video',recordingContext);showCaptureStatus('Saved');await completeCaptureStep(sessionId)}}catch(error){showCaptureStatus('Could not save this video.')}};
            currentRecorder.start(1000);startRecordingTimer(timer);toggle.textContent='Stop video';showCaptureStatus(captureStepStatus(step));fitUiText();
          }else{recorder.stop();toggle.disabled=true}
        });
      }catch(error){evidenceTop.innerHTML='<div class="capture-surface">Camera and microphone access is required for this video.</div>'}
    }

    async function openAudioCapture(step, sessionId) {
      stopCapture(); captureMode='audio';
      evidenceTop.innerHTML='<div class="capture-surface"><div class="audio-panel"><div class="microphone-mark" aria-label="Microphone">🎙</div><button class="capture-button" id="audioToggle" type="button">Record audio</button><div class="capture-status" id="captureStatus"></div></div></div>';
      evidenceTop.style.gridTemplateRows='1fr';const toggle=document.getElementById('audioToggle');updateBackButton();fitUiText();
      try{
        captureStream=await navigator.mediaDevices.getUserMedia({audio:{channelCount:{ideal:1},echoCancellation:true,noiseSuppression:true,autoGainControl:true}});showCaptureStatus(captureStepStatus(step));
        toggle.addEventListener('click',()=>{
          if(!window.MediaRecorder){showCaptureStatus('Recording is not supported by this browser.');return}
          if(!recorder||recorder.state==='inactive'){
            const chunks=[],recordingContext=captureEvidenceContext('audio'),mimeType=preferredAudioMimeType(),options={audioBitsPerSecond:48000};if(mimeType)options.mimeType=mimeType;
            const currentRecorder=new MediaRecorder(captureStream,options);recorder=currentRecorder;currentRecorder.ondataavailable=e=>{if(e.data&&e.data.size)chunks.push(e.data)};
            currentRecorder.onstop=async()=>{if(recorder===currentRecorder)recorder=null;if(sessionId!==captureSessionId)return;const blob=new Blob(chunks,{type:currentRecorder.mimeType||mimeType||'audio/webm'});try{if(blob.size){await saveEvidenceBlob(blob,'audio',recordingContext);showCaptureStatus('Saved');await completeCaptureStep(sessionId)}}catch(error){showCaptureStatus('Could not save this audio.')}};
            currentRecorder.start(1000);toggle.textContent='Stop audio';showCaptureStatus(captureStepStatus(step));fitUiText();
          }else{recorder.stop();toggle.disabled=true}
        });
      }catch(error){evidenceTop.innerHTML='<div class="capture-surface">Microphone access is required for this audio evidence.</div>'}
    }

    function openTextCapture(step, sessionId) {
      stopCapture(); captureMode='text';
      evidenceTop.innerHTML='<div class="capture-surface"><textarea class="text-evidence" id="textEvidence" aria-label="Written evidence" placeholder="Write your evidence here..."></textarea><div class="text-save-row"><button class="capture-button" id="saveTextEvidence" type="button">Save evidence</button></div><div class="capture-status" id="captureStatus"></div></div>';
      evidenceTop.style.gridTemplateRows='1fr';updateBackButton();fitUiText();const textarea=document.getElementById('textEvidence');showCaptureStatus(captureStepStatus(step));
      document.getElementById('saveTextEvidence').addEventListener('click',async()=>{const value=textarea.value.trim();if(!value){showCaptureStatus('Write some evidence before saving.');return}const blob=new Blob([value],{type:'text/plain;charset=utf-8'});try{await saveEvidenceBlob(blob,'text');showCaptureStatus('Saved');await completeCaptureStep(sessionId)}catch(error){showCaptureStatus('Could not save this evidence.')}});
    }

    function runCaptureStep(){const step=capturePlan[captureStepIndex],sessionId=captureSessionId;if(!step)return;if(step.type==='photo')openPhotoCapture(step,sessionId);else if(step.type==='video')openVideoCapture(step,sessionId);else if(step.type==='audio')openAudioCapture(step,sessionId);else openTextCapture(step,sessionId)}

    function beginEvidenceCollection(option, heading){clearCaptureSequence();captureSessionId+=1;capturePlan=buildCapturePlan(option);captureStepIndex=0;activeEvidenceMethod={type:option?.type||'text',heading,label:option?.label||heading};evidenceRequirements.style.display='none';evidenceScreen.style.gridTemplateRows='1fr';runCaptureStep()}

    function cancelEvidenceCollectionToChoices(){clearCaptureSequence();stopCapture();captureMode=null;activeEvidenceMethod=null;const hasRequirements=renderEvidenceRequirements(activeEvidence);evidenceRequirements.style.display=hasRequirements?'block':'none';evidenceScreen.style.gridTemplateRows=hasRequirements?'1fr 1fr':'1fr';setSpeech(evidenceSpeechLines());evidenceRequirements.classList.remove('evidence-enter','reveal-step');renderEvidenceChoices(false);screen.classList.add('evidence-ready')}

'''
t=t[:start]+new+t[end:]
close='''    function closeEvidence() {\n      stopCapture();\n      captureMode = null;'''
if close not in t: raise SystemExit('close marker missing')
t=t.replace(close,'''    function closeEvidence() {\n      stopCapture();\n      clearCaptureSequence();\n      captureMode = null;''',1)
listener='''    evidenceTop.addEventListener('click', (event) => {\n      const choice = event.target.closest('.evidence-choice');\n      if (!choice) return;\n      openEvidenceType(\n        choice.dataset.evidenceType || 'text',\n        choice.dataset.evidenceHeading || 'Evidence',\n        choice.dataset.evidenceLabel || 'Evidence'\n      );\n    });'''
replacement='''    evidenceTop.addEventListener('click', (event) => {\n      const choice = event.target.closest('.evidence-choice');\n      if (!choice) return;\n      const option = choice.dataset.evidenceChoice === 'alternative' ? activeEvidence?.alternative : activeEvidence?.recommended;\n      beginEvidenceCollection(option, choice.dataset.evidenceHeading || 'Evidence');\n    });'''
if listener not in t: raise SystemExit('listener missing')
t=t.replace(listener,replacement,1)
p.write_text(t)
