/* Evia7 "Send to e-portfolio": per-unit files (evidence PDF + original photos) ready to upload to Aptem or any e-portfolio. */
(function(){
  const SENT_KEY="evia7-downloaded-unit-pdfs";
  const escHtml=s=>String(s??"").replace(/[&<>"']/g,x=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[x]));
  const readJson=(k,f)=>{try{const v=JSON.parse(localStorage.getItem(k)||"null");return v??f}catch(_){return f}};
  const slug=s=>String(s||"").normalize("NFKD").replace(/[\u0300-\u036f]/g,"").replace(/[^a-z0-9]+/gi,"-").replace(/^-+|-+$/g,"").slice(0,60)||"Evidence";
  const isoDate=d=>{const x=new Date(d);return isNaN(x)?new Date().toISOString().slice(0,10):x.getFullYear()+"-"+String(x.getMonth()+1).padStart(2,"0")+"-"+String(x.getDate()).padStart(2,"0")};
  const ukDate=d=>{const x=new Date(d);return isNaN(x)?String(d||""):x.toLocaleDateString("en-GB",{day:"2-digit",month:"short",year:"numeric"})};
  const formatBytes=n=>n<1024*1024?Math.max(1,Math.round(n/1024))+" KB":(n/1024/1024).toFixed(1)+" MB";
  const canShareFiles=files=>{try{return !!(navigator.canShare&&navigator.share&&navigator.canShare({files}))}catch(_){return false}};
  const entryTime=e=>{const t=Date.parse(e.savedAt||"");if(!isNaN(t))return t;const m=String(e.d||"").match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})/);return m?new Date(+m[3],m[2]-1,+m[1]).getTime():0};

  let jspdfPromise=null;
  function loadJsPdf(){
    if(window.jspdf)return Promise.resolve(window.jspdf);
    return jspdfPromise||(jspdfPromise=new Promise((resolve,reject)=>{
      const s=document.createElement("script");s.src="vendor/jspdf.umd.min.js";
      s.onload=()=>window.jspdf?resolve(window.jspdf):reject(new Error("PDF library unavailable"));
      s.onerror=()=>{jspdfPromise=null;reject(new Error("PDF library unavailable"))};
      document.head.appendChild(s);
    }));
  }
  const loadImage=src=>new Promise(resolve=>{const img=new Image();img.onload=()=>resolve(img);img.onerror=()=>resolve(null);img.src=src});
  /* The built-in PDF fonts only cover Latin-1, so swap smart punctuation and drop anything else (e.g. emoji). */
  const pdfText=s=>String(s||"").replace(/[‘’′]/g,"'").replace(/[“”″]/g,'"').replace(/[–—−]/g,"-").replace(/…/g,"...").replace(/•/g,"-").replace(/[^\n\x20-\x7E\u00A0-\u00FF]/g,"").replace(/[ \t]{2,}/g," ");
  function accentRgb(){
    const v=getComputedStyle(document.documentElement).getPropertyValue("--yellow").trim()||"#e7b900";
    const m=v.match(/^#?([0-9a-f]{6})$/i);if(!m)return[231,185,0];
    const n=parseInt(m[1],16);return[(n>>16)&255,(n>>8)&255,n&255];
  }

  async function buildUnitPdf(unitName,entries,photosByEntry){
    const {jsPDF}=await loadJsPdf();
    const doc=new jsPDF({unit:"mm",format:"a4",compress:true});
    const profile=readJson("evia7-profile",{}),learner=profile.name||"Apprentice";
    const W=210,H=297,M=16,CW=W-2*M,BOTTOM=H-M-8;
    const ink=[23,32,51],muted=[102,112,133],line=[228,231,236],accent=accentRgb();
    const wording=new Map(allK());
    let y=M;
    const need=h=>{if(y+h>BOTTOM){doc.addPage();y=M;return true}return false};
    const label=(t,x,yy)=>{doc.setFont("helvetica","bold");doc.setFontSize(7.5);doc.setTextColor(...muted);doc.setCharSpace(.35);doc.text(pdfText(t).toUpperCase(),x,yy);doc.setCharSpace(0)};
    const para=(t,size,color,style="normal",indent=0,gap=1.45)=>{
      doc.setFont("helvetica",style);doc.setFontSize(size);doc.setTextColor(...color);
      const lh=size*.3528*gap;
      doc.splitTextToSize(pdfText(t),CW-indent).forEach(l=>{need(lh);doc.text(l,M+indent,y+lh*.75);y+=lh});
    };

    // Header
    label("Evia · Evidence pack",M,y+3);y+=6;
    doc.setFont("helvetica","bold");doc.setFontSize(21);doc.setTextColor(...ink);doc.text(pdfText(unitName),M,y+7);y+=11;
    const details=[["Learner",learner],["Course",data().name],["Standard",data().std],["Evidence entries",String(entries.length)]];
    if(profile.start)details.push(["Start date",ukDate(profile.start)]);
    if(profile.end)details.push(["End date",ukDate(profile.end)]);
    details.push(["PDF created",ukDate(Date.now())]);
    doc.setFontSize(9);
    details.forEach((d,i)=>{const x=M+(i%2)*(CW/2),yy=y+Math.floor(i/2)*5.2;doc.setFont("helvetica","bold");doc.setTextColor(...ink);doc.text(pdfText(d[0])+":",x,yy+3.5);const lw=doc.getTextWidth(pdfText(d[0])+": ");doc.setFont("helvetica","normal");doc.setTextColor(71,84,103);doc.text(pdfText(d[1]),x+lw,yy+3.5)});
    y+=Math.ceil(details.length/2)*5.2+3;
    doc.setDrawColor(...accent);doc.setLineWidth(.8);doc.line(M,y,W-M,y);y+=8;

    for(let i=0;i<entries.length;i++){
      const e=entries[i],photos=photosByEntry[i]||[];
      need(20);
      label("Evidence "+(i+1)+" of "+entries.length+" · "+ukDate(entryTime(e)||e.d),M,y+3);y+=7;
      // Photos, two per row, keeping their shape.
      const colW=(CW-6)/2;
      for(let p=0;p<photos.length;p+=2){
        const row=[];
        for(const src of photos.slice(p,p+2)){const img=await loadImage(src);if(img&&img.naturalWidth)row.push({src,img})}
        if(!row.length)continue;
        const h=Math.min(95,Math.max(...row.map(r=>colW*r.img.naturalHeight/r.img.naturalWidth)));
        need(h+4);
        row.forEach((r,j)=>{
          const ratio=r.img.naturalWidth/r.img.naturalHeight;let w=colW,ih=w/ratio;if(ih>h){ih=h;w=h*ratio}
          const x=M+j*(colW+6)+(colW-w)/2;
          try{doc.addImage(r.src,/^data:image\/png/i.test(r.src)?"PNG":"JPEG",x,y,w,ih,undefined,"FAST")}catch(err){console.warn("Evia PDF photo skipped",err)}
        });
        y+=h+4;
      }
      if(e.w){need(10);label("Write-up",M,y+3);y+=5;para(e.w,10.5,[52,64,84]);y+=3}
      const ksbs=(e.k||[]).filter(Boolean);
      if(ksbs.length){
        need(10);label("KSBs covered",M,y+3);y+=5.5;
        ksbs.forEach(k=>{
          doc.setFont("helvetica","normal");doc.setFontSize(8.8);
          const lines=doc.splitTextToSize(pdfText(wording.get(k)||""),CW-16);
          need(Math.max(1,lines.length)*4+1.5);
          doc.setFont("helvetica","bold");doc.setTextColor(...ink);doc.text(pdfText(k),M,y+3);
          doc.setFont("helvetica","normal");doc.setTextColor(71,84,103);
          lines.forEach((l,n)=>doc.text(l,M+16,y+3+n*4));
          y+=Math.max(1,lines.length)*4+1.5;
        });
        y+=2;
      }
      if(e.signature){
        need(22);
        try{doc.addImage(e.signature,"PNG",M,y,48,14,undefined,"FAST")}catch(_){}
        y+=15;
        doc.setFont("helvetica","normal");doc.setFontSize(8);doc.setTextColor(...muted);
        doc.text(pdfText("Signed by "+((e.learnerProfile&&e.learnerProfile.name)||learner)+" · "+ukDate(entryTime(e)||e.d)),M,y+2.5);y+=5;
      }
      if(i<entries.length-1){need(8);doc.setDrawColor(...line);doc.setLineWidth(.3);doc.line(M,y+3,W-M,y+3);y+=9}
    }

    const pages=doc.getNumberOfPages();
    for(let n=1;n<=pages;n++){
      doc.setPage(n);doc.setFont("helvetica","normal");doc.setFontSize(7.5);doc.setTextColor(...muted);
      doc.text(pdfText(learner+" · "+unitName),M,H-9);
      doc.text("Page "+n+" of "+pages,W-M,H-9,{align:"right"});
    }
    return doc.output("blob");
  }

  function saveFile(file){
    const a=document.createElement("a");a.href=URL.createObjectURL(file);a.download=file.name;
    document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(a.href),60000);
  }
  /* Chrome on Android refuses shares of more than 10 files (or very large ones), so Share all only appears within that. */
  const SHARE_MAX_FILES=10,SHARE_MAX_BYTES=45*1024*1024;
  const withinShareLimits=files=>files.length<=SHARE_MAX_FILES&&files.reduce((n,f)=>n+f.size,0)<=SHARE_MAX_BYTES;
  function notify(message){if(typeof showEvidenceToast==="function")showEvidenceToast(message,true);else alert(message)}
  /* Resolves true once shared. Never falls back to downloading: a failed share says so and leaves Save for the learner. */
  async function shareFiles(files){
    try{await navigator.share({files});return true}
    catch(err){
      if(err&&err.name==="AbortError")return false;
      console.warn("Evia share failed",err);
      notify(err&&err.name==="NotAllowedError"?"Sharing isn't allowed here. Use Save instead.":"Your phone couldn't open sharing. Use Save instead.");
      return false;
    }
  }
  function markSent(unitName){
    const state=readJson(SENT_KEY,{});state[course+"|"+unitName]=Date.now();
    localStorage.setItem(SENT_KEY,JSON.stringify(state));
    const el=document.getElementById("eport-sent");if(el)el.textContent="Last sent "+ukDate(Date.now());
  }

  const icon={
    pdf:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z"/><path d="M14 3v5h5"/><path d="M9 13h6M9 17h4"/></svg>',
    share:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 15V3"/><path d="m7 8 5-5 5 5"/><path d="M5 12v7a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-7"/></svg>',
    save:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3v12"/><path d="m7 10 5 5 5-5"/><path d="M5 21h14"/></svg>'
  };

  function injectStyles(){
    if(document.getElementById("evia-eport-styles"))return;
    const style=document.createElement("style");style.id="evia-eport-styles";
    style.textContent=`
      .eport-page{display:grid;gap:12px}
      .eport-intro h2{margin:2px 0 6px}
      .eport-intro p{margin:0;font-size:12.5px;line-height:1.5;color:#667085}
      .eport-sent{display:inline-block;margin-top:10px;font-size:11px;font-weight:700;color:var(--yellow-ink);background:var(--soft);border-radius:999px;padding:4px 10px}
      .eport-sent:empty{display:none}
      .eport-ksbs{display:flex;flex-wrap:wrap;gap:6px;margin:8px 0 12px}
      .eport-ksbs span{font-size:11px;font-weight:750;color:var(--yellow-ink);background:var(--soft);border:1px solid var(--yellow-line);border-radius:999px;padding:3px 9px}
      .eport-copy{min-height:40px;padding:8px 14px;border-radius:12px;border:1px solid #e3e7ed;background:#fff;font-size:12px;font-weight:700;cursor:pointer}
      .eport-files{display:grid;gap:8px}
      .eport-file{display:flex;align-items:center;gap:12px;padding:10px!important;margin:0!important}
      .eport-thumb{width:48px;height:48px;flex:0 0 48px;border-radius:12px;object-fit:cover;background:#f2f4f7;display:grid;place-items:center;color:var(--yellow-ink)}
      .eport-thumb svg,.eport-btn svg{width:20px;height:20px;fill:none;stroke:currentColor;stroke-width:1.8;stroke-linecap:round;stroke-linejoin:round}
      .eport-thumb.pdf{background:var(--soft)}
      .eport-meta{flex:1;min-width:0;display:grid;gap:3px}
      .eport-meta strong{font-size:13px;line-height:1.25}
      .eport-meta span{font-size:10.5px;color:#667085;overflow-wrap:anywhere;line-height:1.3}
      .eport-actions{display:flex;gap:6px;flex:0 0 auto}
      .eport-btn{width:40px;height:40px;border-radius:12px;border:1px solid #e3e7ed;background:#fff;display:grid;place-items:center;color:#273244;cursor:pointer}
      .eport-btn:disabled{opacity:.4}
      .eport-all{display:grid;grid-template-columns:1fr 1fr;gap:8px}
      .eport-all.single{grid-template-columns:1fr}
      .eport-all button{min-height:48px;border-radius:14px}
      .eport-steps{margin:0;padding-left:18px;font-size:12px;line-height:1.6;color:#475467}
    `;
    document.head.appendChild(style);
  }

  async function openSendToPortfolio(unitName){
    injectStyles();
    const profileBtn=document.getElementById("profile-btn");if(profileBtn)profileBtn.style.display="none";
    const unitIndex=data().u.findIndex(u=>u[0]===unitName);
    const entries=evidence.filter(e=>e.c===course&&e.u===unitName).sort((a,b)=>entryTime(a)-entryTime(b));
    const learnerSlug=slug(readJson("evia7-profile",{}).name||"");
    const base=(learnerSlug&&learnerSlug!=="Evidence"?learnerSlug+"_":"")+slug(unitName);
    const sent=readJson(SENT_KEY,{})[course+"|"+unitName];
    $("#page-title").textContent="Send to e-portfolio";
    const back='<button class="secondary" id="eport-back" type="button">‹ Back to portfolio</button>';
    if(!entries.length){
      $("#screen").innerHTML=back+'<div class="eport-page"><div class="card eport-intro"><div class="section-title">SEND TO E-PORTFOLIO</div><h2>'+escHtml(unitName)+'</h2><p>There is no evidence saved for this unit yet. Capture some evidence first, then come back here to send it to your e-portfolio.</p></div>'+(unitIndex>=0?'<button class="primary" id="eport-open-unit" type="button">Open unit</button>':"")+'</div>';
      $("#eport-back").onclick=()=>nav("portfolio");
      const openBtn=$("#eport-open-unit");if(openBtn)openBtn.onclick=()=>openUnit(unitIndex);
      return;
    }
    const ksbs=[...new Set(entries.flatMap(e=>e.k||[]))];
    $("#screen").innerHTML=back+
      '<div class="eport-page">'+
        '<div class="card eport-intro"><div class="section-title">SEND TO E-PORTFOLIO</div><h2>'+escHtml(unitName)+'</h2><p>Upload these files to Aptem or your e-portfolio. Each file is named so your assessor can see what it is.</p><span class="eport-sent" id="eport-sent">'+(sent?"Last sent "+escHtml(ukDate(sent)):"")+'</span></div>'+
        '<div class="card"><div class="section-title">KSBS COVERED</div><div class="eport-ksbs">'+ksbs.map(k=>'<span>'+escHtml(k)+'</span>').join("")+'</div><button type="button" class="eport-copy" id="eport-copy">Copy KSB codes</button></div>'+
        '<div class="section-title">FILES</div><div class="eport-files" id="eport-files"><div class="card eport-file"><span class="eport-thumb pdf">'+icon.pdf+'</span><span class="eport-meta"><strong>Evidence PDF</strong><span>Preparing…</span></span></div></div>'+
        '<div class="eport-all" id="eport-all"></div>'+
        '<div class="card"><div class="section-title">HOW TO UPLOAD</div><ol class="eport-steps"><li>Tap <strong>Share</strong> to send a file straight to another app, or <strong>Save</strong> to keep it on your phone.</li><li>In Aptem (or your e-portfolio), add new evidence and upload the PDF and any photos.</li><li>Tag the KSBs listed above.</li></ol></div>'+
      '</div>';
    $("#eport-back").onclick=()=>nav("portfolio");
    $("#eport-copy").onclick=async()=>{
      const text=ksbs.join(", ");
      try{await navigator.clipboard.writeText(text);if(typeof showEvidenceToast==="function")showEvidenceToast("KSB codes copied")}
      catch(_){prompt("Copy these KSB codes:",text)}
    };

    // Prepare the files up front so Share still counts as a direct tap when it is pressed.
    const files=[];
    try{
      const photosByEntry=[];
      for(const e of entries)photosByEntry.push(window.eviaGetEvidencePhotoData?await window.eviaGetEvidencePhotoData(e):(e.p||[]));
      const lastDate=isoDate(entryTime(entries[entries.length-1])||Date.now());
      const pdf=await buildUnitPdf(unitName,entries,photosByEntry);
      files.push({kind:"pdf",title:"Evidence PDF",file:new File([pdf],base+"_evidence_"+lastDate+".pdf",{type:"application/pdf"})});
      let n=0;
      for(const src of photosByEntry.flat()){
        n++;
        const blob=await (await fetch(src)).blob();
        const ext=/png/i.test(blob.type)?"png":"jpg";
        files.push({kind:"photo",title:"Photo "+n,src,file:new File([blob],base+"_photo-"+String(n).padStart(2,"0")+"."+ext,{type:blob.type||"image/jpeg"})});
      }
    }catch(err){
      console.error("Evia e-portfolio files failed",err);
      const list=$("#eport-files");
      if(list)list.innerHTML='<div class="card"><p>Evia couldn\'t prepare the files. Check you are online the first time you use this, then try again.</p></div>';
      return;
    }
    if(!document.getElementById("eport-files"))return; // learner navigated away
    const shareOk=canShareFiles([files[0].file]);
    $("#eport-files").innerHTML=files.map((f,i)=>
      '<div class="card eport-file">'+
        (f.kind==="pdf"?'<span class="eport-thumb pdf">'+icon.pdf+'</span>':'<img class="eport-thumb" src="'+f.src+'" alt="">')+
        '<span class="eport-meta"><strong>'+escHtml(f.title)+'</strong><span>'+escHtml(f.file.name)+' · '+formatBytes(f.file.size)+'</span></span>'+
        '<span class="eport-actions">'+(shareOk?'<button type="button" class="eport-btn" data-eport-share="'+i+'" aria-label="Share '+escHtml(f.title)+'">'+icon.share+'</button>':"")+'<button type="button" class="eport-btn" data-eport-save="'+i+'" aria-label="Save '+escHtml(f.title)+'">'+icon.save+'</button></span>'+
      '</div>').join("");
    document.querySelectorAll("[data-eport-share]").forEach(b=>b.onclick=async()=>{const f=files[+b.dataset.eportShare];if(await shareFiles([f.file]))markSent(unitName)});
    document.querySelectorAll("[data-eport-save]").forEach(b=>b.onclick=()=>{saveFile(files[+b.dataset.eportSave].file);markSent(unitName)});
    const all=files.map(f=>f.file),shareAll=files.length>1&&withinShareLimits(all)&&canShareFiles(all);
    const allEl=$("#eport-all");
    allEl.classList.toggle("single",!shareAll);
    allEl.innerHTML=(shareAll?'<button type="button" class="primary" id="eport-share-all">Share all files</button>':"")+'<button type="button" class="secondary" id="eport-zip">Download all (.zip)</button>';
    const shareAllBtn=$("#eport-share-all");
    if(shareAllBtn)shareAllBtn.onclick=async()=>{if(await shareFiles(all))markSent(unitName)};
    $("#eport-zip").onclick=async()=>{
      const btn=$("#eport-zip");btn.disabled=true;btn.textContent="Preparing zip…";
      try{
        const zip=await makeStoredZip(files.map(f=>({path:f.file.name,blob:f.file})));
        saveFile(new File([zip],base+"_"+isoDate(Date.now())+".zip",{type:"application/zip"}));markSent(unitName);
      }catch(err){console.error("Evia zip failed",err);alert("Evia couldn't create the zip. Please try again.")}
      finally{btn.disabled=false;btn.textContent="Download all (.zip)"}
    };
  }

  window.eviaOpenSendToPortfolio=openSendToPortfolio;
})();
