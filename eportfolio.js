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
  /* Crops a photo to a centred square that fills the tile, with softly rounded corners (white, to match the page). */
  async function squareTile(src,px=640){
    const img=await loadImage(src);if(!img||!img.naturalWidth)return null;
    const side=Math.min(img.naturalWidth,img.naturalHeight),sx=(img.naturalWidth-side)/2,sy=(img.naturalHeight-side)/2;
    const c=document.createElement("canvas");c.width=c.height=px;const g=c.getContext("2d");
    g.fillStyle="#fff";g.fillRect(0,0,px,px);
    const r=px*.05;g.beginPath();g.moveTo(r,0);g.arcTo(px,0,px,px,r);g.arcTo(px,px,0,px,r);g.arcTo(0,px,0,0,r);g.arcTo(0,0,px,0,r);g.closePath();g.clip();
    g.drawImage(img,sx,sy,side,side,0,0,px,px);
    return c.toDataURL("image/jpeg",.85);
  }
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
    const ink=[23,32,51],muted=[102,112,133],accent=accentRgb();
    let y=M;
    const need=h=>{if(y+h>BOTTOM){doc.addPage();y=M;return true}return false};
    const label=(t,x,yy)=>{doc.setFont("helvetica","bold");doc.setFontSize(7.5);doc.setTextColor(...muted);doc.setCharSpace(.35);doc.text(pdfText(t).toUpperCase(),x,yy);doc.setCharSpace(0)};

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
      if(i>0){doc.addPage();y=M} /* each evidence occasion starts on its own page */
      need(20);
      label("Evidence "+(i+1)+" of "+entries.length+" · "+ukDate(entryTime(e)||e.d),M,y+3);y+=7;
      // Photos: four square tiles per row, each cropped from the centre to fill its tile.
      const cols=4,gap=3,tile=(CW-gap*(cols-1))/cols;
      for(let p=0;p<photos.length;p+=cols){
        const row=[];
        for(const src of photos.slice(p,p+cols)){const t=await squareTile(src);if(t)row.push(t)}
        if(!row.length)continue;
        need(tile+gap);
        row.forEach((t,j)=>{
          const x=M+j*(tile+gap);
          try{doc.addImage(t,"JPEG",x,y,tile,tile,undefined,"FAST");doc.setDrawColor(234,236,240);doc.setLineWidth(.25);doc.roundedRect(x,y,tile,tile,tile*.05,tile*.05,"S")}catch(err){console.warn("Evia PDF photo skipped",err)}
        });
        y+=tile+gap;
      }
      y+=1;
      if(e.w){
        /* The write-up sits in a tile with a light grey outline; a long one carries on in a new tile on the next page. */
        need(14);label("Write-up",M,y+3);y+=5.5;
        const PAD=4.5,size=10.5,lh=size*.3528*1.45;
        doc.setFont("helvetica","normal");doc.setFontSize(size);
        let lines=doc.splitTextToSize(pdfText(e.w),CW-PAD*2);
        while(lines.length){
          if(BOTTOM-y<PAD*2+lh*2){doc.addPage();y=M}
          const fit=Math.max(1,Math.min(lines.length,Math.floor((BOTTOM-y-PAD*2)/lh))),chunk=lines.splice(0,fit),h=chunk.length*lh+PAD*2-1;
          doc.setFillColor(250,251,252);doc.setDrawColor(223,227,233);doc.setLineWidth(.3);doc.roundedRect(M,y,CW,h,2.5,2.5,"FD");
          doc.setFont("helvetica","normal");doc.setFontSize(size);doc.setTextColor(52,64,84);
          chunk.forEach((l,n)=>doc.text(l,M+PAD,y+PAD+lh*.75+n*lh));
          y+=h+(lines.length?0:5);
          if(lines.length){doc.addPage();y=M}
        }
      }
      const ksbs=(e.k||[]).filter(Boolean);
      if(ksbs.length){
        /* Small grey pills, wrapping onto new lines as needed. */
        need(12);label("KSBs covered",M,y+3);y+=5.5;
        doc.setFont("helvetica","bold");doc.setFontSize(7.5);
        const ph=5,px=2.4,pg=1.6;let x=M;
        ksbs.forEach(k=>{
          const t=pdfText(k),w=doc.getTextWidth(t)+px*2;
          if(x+w>W-M){x=M;y+=ph+pg}
          need(ph+2);
          doc.setFillColor(242,244,247);doc.setDrawColor(228,231,236);doc.setLineWidth(.2);doc.roundedRect(x,y,w,ph,ph/2,ph/2,"FD");
          doc.setTextColor(71,84,103);doc.text(t,x+px,y+ph/2+1.05);
          x+=w+pg;
        });
        y+=ph+5;
      }
      if(e.signature){
        need(22);
        try{doc.addImage(e.signature,"PNG",M,y,48,14,undefined,"FAST")}catch(_){}
        y+=15;
        doc.setFont("helvetica","normal");doc.setFontSize(8);doc.setTextColor(...muted);
        doc.text(pdfText("Signed by "+((e.learnerProfile&&e.learnerProfile.name)||learner)+" · "+ukDate(entryTime(e)||e.d)),M,y+2.5);y+=5;
      }
    }

    const pages=doc.getNumberOfPages();
    for(let n=1;n<=pages;n++){
      doc.setPage(n);doc.setFont("helvetica","normal");doc.setFontSize(7.5);doc.setTextColor(...muted);
      doc.text(pdfText(learner+" · "+unitName),M,H-9);
      doc.text("Page "+n+" of "+pages,W-M,H-9,{align:"right"});
      /* Branding: a tiny Evia (yellow square, two eyes) and "Created using Evia", centred. */
      const brand="Created using Evia",bw=doc.getTextWidth(brand),s=3.4,bx=W/2-(s+1.6+bw)/2,by=H-9-2.6;
      doc.setFillColor(229,188,2);doc.roundedRect(bx,by,s,s,.7,.7,"F");
      doc.setFillColor(255,255,255);doc.ellipse(bx+s*.2835,by+s*.49,s*.111,s*.168,"F");doc.ellipse(bx+s*.7165,by+s*.49,s*.111,s*.168,"F");
      doc.setTextColor(...muted);doc.text(brand,bx+s+1.6,H-9);
    }
    const out=doc.output("blob");out.evPages=pages;return out;
  }

  function saveFile(file){
    const a=document.createElement("a");a.href=URL.createObjectURL(file);a.download=file.name;
    document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(a.href),60000);
  }
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
      .eport-files{display:grid;gap:10px;margin-bottom:13px}
      .eport-pdf{display:grid;gap:12px;margin:0!important}
      .eport-sheet{position:relative;display:flex;flex-direction:column;gap:6px;width:min(230px,70%);aspect-ratio:1/1.414;margin:4px auto 0;padding:16px 14px;border-radius:6px;border:1px solid #e4e7ec;background:#fff;box-shadow:0 10px 26px rgba(16,24,40,.12),0 2px 4px rgba(16,24,40,.06);text-align:left;font:inherit;color:#172033;cursor:pointer;overflow:hidden;transition:transform .2s ease,box-shadow .2s ease}
      .eport-sheet:active{transform:scale(.98)}
      .eport-sheet-kicker{font-size:6.5px;font-weight:800;letter-spacing:.14em;color:#667085}
      .eport-sheet-title{font-size:14px;line-height:1.15;font-weight:800}
      .eport-sheet-sub{font-size:7.5px;color:#667085}
      .eport-sheet-rule{height:2px;background:var(--yellow);border-radius:2px;margin:2px 0}
      .eport-sheet-photos{display:grid;grid-template-columns:repeat(4,1fr);gap:3px}
      .eport-sheet-photos img{width:100%;aspect-ratio:1/1;object-fit:cover;object-position:center;border-radius:2px;background:#f2f4f7}
      .eport-sheet-text{font-size:7.5px;line-height:1.45;color:#344054;display:-webkit-box;-webkit-line-clamp:5;-webkit-box-orient:vertical;overflow:hidden}
      .eport-sheet-ksbs{display:flex;flex-wrap:wrap;gap:3px}
      .eport-sheet-ksbs i{font-style:normal;font-size:6.5px;font-weight:800;padding:1.5px 4px;border-radius:3px;background:var(--soft);color:var(--yellow-ink)}
      .eport-sheet-open{position:absolute;left:0;right:0;bottom:0;padding:8px;background:linear-gradient(transparent,rgba(255,255,255,.96) 40%);font-size:10px;font-weight:800;color:var(--yellow-ink);text-align:center}
      .eport-sheet.is-loading{cursor:default;gap:10px;box-shadow:0 6px 18px rgba(16,24,40,.08)}
      .eport-sheet.is-loading span{display:block;height:10px;border-radius:4px;background:linear-gradient(90deg,#f2f4f7,#e9edf2,#f2f4f7);background-size:200% 100%;animation:eportShimmer 1.2s linear infinite}
      .eport-sheet.is-loading span:nth-child(1){width:60%;height:14px}.eport-sheet.is-loading span:nth-child(3){height:70px}
      @keyframes eportShimmer{to{background-position:-200% 0}}
      .eport-status{margin:0;text-align:center;font-size:12px;color:#667085}
      .eport-status strong{color:#172033}
      .eport-main{display:grid;grid-template-columns:1fr 1fr;gap:8px}
      .eport-main.single{grid-template-columns:1fr}
      .eport-main button{min-height:50px;border-radius:14px;display:flex;align-items:center;justify-content:center;gap:8px;font-size:14.5px}
      .eport-main svg,.eport-zip svg{width:19px;height:19px;fill:none;stroke:currentColor;stroke-width:1.9;stroke-linecap:round;stroke-linejoin:round;flex:0 0 auto}
      .eport-zip{display:flex;align-items:center;justify-content:space-between;gap:12px;width:100%;padding:13px 16px;border-radius:16px;border:1px dashed #d0d5dd;background:transparent;font:inherit;text-align:left;color:#344054;cursor:pointer}
      .eport-zip span{display:grid;gap:2px}
      .eport-zip strong{font-size:13.5px;color:#172033}
      .eport-zip small{font-size:11.5px;color:#667085}
      .eport-zip:disabled{opacity:.6}
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
        '<div class="card eport-intro"><div class="section-title">SEND TO E-PORTFOLIO</div><h2>'+escHtml(unitName)+'</h2><p>Upload this PDF to Aptem or your e-portfolio. It’s named so your assessor can see what it is.</p><span class="eport-sent" id="eport-sent">'+(sent?"Last sent "+escHtml(ukDate(sent)):"")+'</span></div>'+
        '<div class="card"><div class="section-title">KSBS COVERED</div><div class="eport-ksbs">'+ksbs.map(k=>'<span>'+escHtml(k)+'</span>').join("")+'</div><button type="button" class="eport-copy" id="eport-copy">Copy KSB codes</button></div>'+
        '<div class="eport-files" id="eport-files"><div class="card eport-pdf"><div class="eport-sheet is-loading" aria-hidden="true"><span></span><span></span><span></span></div><p class="eport-status">Preparing your evidence PDF…</p></div></div>'+
        '<div class="card"><div class="section-title">HOW TO UPLOAD</div><ol class="eport-steps"><li>Tap <strong>Share PDF</strong> to send it straight to Aptem or another app, or <strong>Save PDF</strong> to keep it on your phone.</li><li>In Aptem (or your e-portfolio), add new evidence and upload the PDF.</li><li>Tag the KSBs listed above.</li></ol></div>'+
      '</div>';
    $("#eport-back").onclick=()=>nav("portfolio");
    $("#eport-copy").onclick=async()=>{
      const text=ksbs.join(", ");
      try{await navigator.clipboard.writeText(text);if(typeof showEvidenceToast==="function")showEvidenceToast("KSB codes copied")}
      catch(_){prompt("Copy these KSB codes:",text)}
    };

    // Prepare the files up front so Share still counts as a direct tap when it is pressed.
    /* Each part is prepared on its own, so one unreadable photo or a PDF problem never blocks the rest. */
    const files=[],problems=[];
    const photosByEntry=[];let expected=0;
    for(const e of entries){
      expected+=Array.isArray(e.photoIds)&&e.photoIds.length?e.photoIds.length:Array.isArray(e.p)?e.p.length:0;
      try{photosByEntry.push(window.eviaGetEvidencePhotoData?await window.eviaGetEvidencePhotoData(e):(e.p||[]))}
      catch(err){console.error("Evia photo read failed",err);photosByEntry.push([])}
    }
    const lastDate=isoDate(entryTime(entries[entries.length-1])||Date.now());
    try{
      const pdf=await buildUnitPdf(unitName,entries,photosByEntry);
      files.push({kind:"pdf",title:"Evidence PDF",pages:pdf.evPages,file:new File([pdf],base+"_evidence_"+lastDate+".pdf",{type:"application/pdf"})});
    }catch(err){console.error("Evia PDF failed",err);problems.push(/PDF library/.test(err&&err.message)?"The PDF couldn’t be made because part of Evia hasn’t downloaded yet. Open Evia once with signal, then try again.":"The PDF couldn’t be made on this phone ("+escHtml((err&&err.message)||"unknown error")+").")}
    let n=0,unreadable=Math.max(0,expected-photosByEntry.flat().length);
    for(const src of photosByEntry.flat()){
      try{
        const blob=await (await fetch(src)).blob();
        n++;
        const ext=/png/i.test(blob.type)?"png":"jpg";
        files.push({kind:"photo",title:"Photo "+n,src,file:new File([blob],base+"_photo-"+String(n).padStart(2,"0")+"."+ext,{type:blob.type||"image/jpeg"})});
      }catch(err){console.error("Evia photo file failed",err);unreadable++}
    }
    if(unreadable)problems.push(unreadable+" photo"+(unreadable===1?"":"s")+" couldn’t be read on this phone and "+(unreadable===1?"was":"were")+" left out. If this evidence came from a backup, restore the backup again from your profile.");
    const list=$("#eport-files");
    if(!files.length){
      if(list)list.innerHTML='<div class="card"><p>Evia couldn’t prepare the files. '+(problems.join(" ")||"Please try again.")+'</p></div>';
      return;
    }
    if(!document.getElementById("eport-files"))return; // learner navigated away
    /* The PDF is the main download, with a preview of its first page; the zip (PDF plus every photo) is there just in case. */
    const pdf=files.find(f=>f.kind==="pdf"),photos=files.filter(f=>f.kind==="photo");
    const shareOk=pdf&&canShareFiles([pdf.file]);
    const first=entries[0]||{},firstPhotos=(photosByEntry[0]||[]).slice(0,4);
    const excerpt=String(first.w||"").trim();
    const preview=pdf?'<button type="button" class="eport-sheet" id="eport-preview" aria-label="Open the full evidence PDF">'+
        '<span class="eport-sheet-kicker">EVIA · EVIDENCE PACK</span>'+
        '<strong class="eport-sheet-title">'+escHtml(unitName)+'</strong>'+
        '<span class="eport-sheet-sub">'+escHtml(readJson("evia7-profile",{}).name||"Apprentice")+' · '+entries.length+' evidence entr'+(entries.length===1?"y":"ies")+'</span>'+
        '<span class="eport-sheet-rule"></span>'+
        (firstPhotos.length?'<span class="eport-sheet-photos">'+firstPhotos.map(src=>'<img src="'+src+'" alt="">').join("")+'</span>':"")+
        (excerpt?'<span class="eport-sheet-text">'+escHtml(excerpt.length>150?excerpt.slice(0,150).trim()+"…":excerpt)+'</span>':"")+
        '<span class="eport-sheet-ksbs">'+ksbs.slice(0,8).map(k=>'<i>'+escHtml(k)+'</i>').join("")+(ksbs.length>8?'<i>+'+(ksbs.length-8)+'</i>':"")+'</span>'+
        '<span class="eport-sheet-open">Tap to open the full PDF</span>'+
      '</button>':"";
    $("#eport-files").innerHTML=
      (problems.length?'<div class="card eport-note" role="status"><p>'+problems.join("<br>")+'</p></div>':"")+
      (pdf?'<div class="card eport-pdf">'+preview+
        '<p class="eport-status"><strong>Evidence PDF</strong> · '+(pdf.pages?pdf.pages+" page"+(pdf.pages===1?"":"s")+" · ":"")+formatBytes(pdf.file.size)+'</p>'+
        '<div class="eport-main'+(shareOk?"":" single")+'">'+(shareOk?'<button type="button" class="primary" id="eport-share">'+icon.share+'Share PDF</button>':"")+'<button type="button" class="'+(shareOk?"secondary":"primary")+'" id="eport-save">'+icon.save+'Save PDF</button></div>'+
      '</div>':"")+
      '<button type="button" class="eport-zip" id="eport-zip"><span><strong>Download everything (.zip)</strong><small>'+(pdf?"The PDF and ":"")+photos.length+' photo'+(photos.length===1?"":"s")+', just in case</small></span>'+icon.save+'</button>';
    if(pdf){
      const pdfUrl=URL.createObjectURL(pdf.file);
      $("#eport-preview").onclick=()=>{const w=window.open(pdfUrl,"_blank");if(!w)saveFile(pdf.file)};
      const shareBtn=$("#eport-share");if(shareBtn)shareBtn.onclick=async()=>{if(await shareFiles([pdf.file]))markSent(unitName)};
      $("#eport-save").onclick=()=>{saveFile(pdf.file);markSent(unitName)};
    }
    $("#eport-zip").onclick=async()=>{
      const btn=$("#eport-zip"),label=btn.querySelector("strong");btn.disabled=true;label.textContent="Preparing zip…";
      try{
        const zip=await makeStoredZip(files.map(f=>({path:f.file.name,blob:f.file})));
        saveFile(new File([zip],base+"_"+isoDate(Date.now())+".zip",{type:"application/zip"}));markSent(unitName);
      }catch(err){console.error("Evia zip failed",err);alert("Evia couldn't create the zip. Please try again.")}
      finally{btn.disabled=false;label.textContent="Download everything (.zip)"}
    };
  }

  window.eviaOpenSendToPortfolio=openSendToPortfolio;
})();
