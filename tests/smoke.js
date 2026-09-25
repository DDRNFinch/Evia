/* Browser smoke test: opens Evia on a phone-sized screen and clicks through the main features.
   Needs Playwright with Chromium. Run: node tests/smoke.js   (exit code 0 = everything passed) */
const http=require("http"),fs=require("fs"),path=require("path");
let playwright;
try{playwright=require("playwright")}catch(_){playwright=require(require("child_process").execSync("npm root -g").toString().trim()+"/playwright")}
const {chromium,devices}=playwright;
const root=path.join(__dirname,"..");
const TYPES={".html":"text/html",".js":"text/javascript",".css":"text/css",".json":"application/json",".svg":"image/svg+xml",".png":"image/png",".woff2":"font/woff2",".jpg":"image/jpeg"};

const results=[];
const check=(name,ok,detail)=>{results.push({name,ok:!!ok});console.log((ok?"✓ ":"✗ ")+name+(ok||!detail?"":" — "+detail))};

(async()=>{
  const server=http.createServer((req,res)=>{
    const file=path.join(root,decodeURIComponent(req.url.split("?")[0]).replace(/\/$/,"/index.html"));
    if(!file.startsWith(root)||!fs.existsSync(file)){res.writeHead(404);return res.end()}
    res.writeHead(200,{"Content-Type":TYPES[path.extname(file)]||"application/octet-stream"});fs.createReadStream(file).pipe(res);
  }).listen(0);
  const url="http://localhost:"+server.address().port+"/";
  const browser=await chromium.launch();
  const ctx=await browser.newContext({...devices["Pixel 7"]});
  const page=await ctx.newPage();
  const errors=[];page.on("pageerror",e=>errors.push(e.message));
  try{
    // A learner part-way through the course, with the first-run screens already done.
    await page.goto(url+"manifest.json");
    await page.evaluate(()=>{localStorage.clear();["evia7-theme-picked","evia7-shape-picked"].forEach(k=>localStorage.setItem(k,"1"));
      localStorage.setItem("evia7-onboarding",'{"stage":"done"}');localStorage.setItem("evia7-home-tip",JSON.stringify({day:new Date().toDateString(),id:"x"}));
      localStorage.setItem("evia7-profile",JSON.stringify({name:"Sam Taylor",start:"2024-11-01",end:"2026-12-01",mathsEnabled:true}))});
    await page.goto(url);await page.waitForTimeout(2000);
    await page.evaluate(async()=>{document.getElementById("app").classList.remove("welcome-app-hidden");const w=document.getElementById("welcome-screen");if(w)w.remove();
      const c=document.createElement("canvas");c.width=40;c.height=30;const blob=await new Promise(r=>c.toBlob(r,"image/jpeg"));
      const id=await window.eviaStoreEvidencePhoto(blob);const u=data().u;
      evidence.push({id:"t1",c:course,u:u[2][0],p:[],photoIds:[id],w:"Cut out the damaged brick and replaced it, checking it was plumb and level.",k:u[2][1].map(code),savedAt:new Date().toISOString()});
      hours.push({id:"h1",n:3,description:"Toolbox talk",createdAt:Date.now()});persist();render()});
    await page.waitForTimeout(500);

    check("The app opens on My course; the nav is My course, Evia and My progress",await page.evaluate(()=>screen==="course"&&!!document.getElementById("ui-course-head")&&[...document.querySelectorAll("[data-nav]")].map(b=>b.textContent.trim()).join()==="My course,My progress"));
    for(const s of ["course","progress","portfolio","learning"]){await page.evaluate(s=>nav(s),s);await page.waitForTimeout(450)}
    await page.evaluate(()=>nav("progress"));await page.waitForTimeout(450);
    check("My progress says when the next review is due",await page.evaluate(()=>!window.eviaReviewDue()||!!document.querySelector(".pv-review-line")));
    check("My progress shows a chart card for each area, with no action buttons",await page.evaluate(()=>screen==="learning"&&["where","ksb","otj","tests","conf","act","quality","targets","ach"].every(id=>document.getElementById("pv-"+id))&&!document.querySelector("#screen .primary,#screen .pg-action")));
    await page.click("#pv-otj");await page.waitForTimeout(500);
    check("Tapping a card opens its deep dive with a how-to note",await page.evaluate(()=>/Off-the-job hours/.test(document.getElementById("pv-sheet-title").textContent)&&!!document.querySelector(".pv-sheet .pv-note")&&!!document.querySelector(".pv-sheet .pv-cols")));
    await page.evaluate(()=>{document.getElementById("modal-root").innerHTML="";window.chat({quiet:true})});await page.waitForTimeout(300);
    await page.evaluate(()=>{window.eviaChatKit.userSays("Log my hours");window.eviaCoachFlows.hours()});
    await page.waitForSelector('#chat .chat-pill:has-text("Toolbox talk")',{timeout:8000});await page.click('#chat .chat-pill:has-text("Toolbox talk")');
    await page.waitForSelector("#chat .hw-ok",{timeout:8000});await page.click('#chat [data-preset="1"]');await page.waitForTimeout(500);await page.click("#chat .hw-ok");
    await page.waitForSelector("#chat .hw-note textarea",{timeout:8000});await page.fill("#chat .hw-note textarea","manual handling");await page.click("#chat .hw-save");
    await page.waitForSelector("#chat .ui-widget:last-child .hw-note textarea:not([disabled])",{timeout:8000});await page.fill("#chat .ui-widget:last-child .hw-note textarea","lift with your legs, not your back");await page.click("#chat .ui-widget:last-child .hw-save");await page.waitForTimeout(300);
    check("Evia logs hours from a chat: what it was, an hours-and-minutes wheel, what you did and what you learned",await page.evaluate(()=>hours.some(h=>h.n===1&&h.description==="Toolbox talk: manual handling. What I learned: lift with your legs, not your back"&&h.learned)));
    await page.evaluate(()=>{document.getElementById("modal-root").innerHTML=""});
    const scBefore=await page.evaluate(()=>window.eviaScenarios.progress().done);
    await page.evaluate(()=>{window.chat({quiet:true});setTimeout(()=>window.eviaCoachFlows.scenario(),50)});
    await page.waitForSelector("#chat .scc-opt",{timeout:12000});await page.click("#chat .scc-opt");await page.waitForTimeout(300);
    check("A real-life scenario plays in Evia's chat and is saved",await page.evaluate(b=>window.eviaScenarios.progress().done===b+1&&!!document.querySelector("#chat .scc-why")&&!document.querySelector(".sc-sheet"),scBefore));
    const rvBefore=await page.evaluate(()=>window.eviaGetReviews().length);
    await page.evaluate(()=>{document.getElementById("modal-root").innerHTML="";window.chat({quiet:true});setTimeout(()=>window.eviaChatReview(),50)});
    const reviewDone=await page.evaluate(async()=>{
      const wait=ms=>new Promise(r=>setTimeout(r,ms));
      for(let n=0;n<40;n++){
        await wait(700);
        const b=[...document.querySelectorAll("#chat .ui-replies .chat-pill")].find(x=>/Let’s go|^Next$|Save my review/.test(x.textContent.trim()));
        if(!b)continue;
        const save=/Save my review/.test(b.textContent);
        const ta=document.querySelector("#chat .rvc textarea[data-reflect='wellbeing']:not([disabled])");if(ta)ta.value="All good thanks";
        b.click();if(save)return true;
      }
      return false;
    });
    await page.waitForTimeout(400);
    check("The progress review happens in Evia's chat, section by section, and saves with comments",reviewDone&&await page.evaluate(b=>{const r=window.eviaGetReviews();return r.length===b+1&&r[0].reflection.wellbeing==="All good thanks"&&!document.querySelector(".rv-sheet")},rvBefore));
    await page.evaluate(()=>{document.getElementById("modal-root").innerHTML=""});
    await page.evaluate(()=>nav("learning"));await page.waitForTimeout(450);
    await page.evaluate(()=>nav("portfolio"));await page.waitForTimeout(450);
    await page.evaluate(()=>openUnit(data().u.findIndex(u=>evidence.some(e=>e.c===course&&e.u===u[0]))));await page.waitForTimeout(1200);
    check("A unit shows its saved evidence as tiles under the capture page, with a share icon",await page.evaluate(()=>document.querySelectorAll(".ev-saved .ev-tile").length>=1&&!!document.querySelector(".ev-tile-share")&&!!document.querySelector(".ev-saved-line")));
    await page.click(".ev-tile-main");await page.waitForTimeout(400);
    check("Tapping a saved tile shows that pack",await page.evaluate(()=>!!document.getElementById("ev-view-photos")));
    await page.evaluate(()=>{document.getElementById("modal-root").innerHTML="";nav("course")});await page.waitForTimeout(400);
    await page.evaluate(()=>openUnit(data().u.findIndex(u=>u[0]==="Mixing mortar")));await page.waitForTimeout(900);
    check("The evidence pack has no Continue later button and a check-my-writing icon in the text box",await page.evaluate(()=>!document.getElementById("continue-later")&&!!document.querySelector(".wc-field #write + .wc-btn")));
    await page.evaluate(()=>{nav("course")});await page.waitForTimeout(450);await page.evaluate(()=>openUnit(3));await page.waitForTimeout(900);
    check("An evidence pack opens",await page.$("#write"));
    await page.fill("#write","i laid the morter on the dpc and checked it was plum");await page.click(".wc-btn");await page.click(".wc-all");
    check("Check my writing fixes spelling, capitals and punctuation",await page.inputValue("#write")==="I laid the mortar on the DPC and checked it was plumb.");

    await page.evaluate(()=>window.eviaOpenSendToPortfolio(data().u[2][0]));await page.waitForTimeout(3500);
    check("Send to e-portfolio shows a PDF preview, Save PDF and the zip",await page.evaluate(()=>!!document.getElementById("eport-preview")&&!!document.getElementById("eport-save")&&/1 photo, just in case/.test(document.getElementById("eport-zip").innerText)));

    await page.evaluate(()=>nav("home"));await page.waitForTimeout(450);
    await page.evaluate(()=>window.chat());
    await page.waitForFunction(()=>{const c=document.getElementById("chat");return c&&!c.querySelector(".evia-thinking")},null,{timeout:15000});
    await page.waitForSelector("#chat .ui-action",{timeout:15000});
    check("Evia opens with a catch-up and her six actions",await page.evaluate(()=>{const t=[...document.querySelectorAll("#chat .ui-action")].map(b=>b.innerText.trim());return ["Test me","Upskill me","Confidence check","Review me","Check my evidence","Log my hours"].every(x=>t.includes(x))&&/off-the-job/.test(document.getElementById("chat").innerText)&&!document.querySelector(".chat-sheet .ui-ask")}));
    await page.click('#chat .ui-action[data-action="evidence"]');
    await page.waitForFunction(()=>/unit/.test((document.querySelector("#chat .bubble.evia:last-of-type")||{}).innerText||"")&&document.querySelectorAll("#chat .bubble.evia").length>=2,null,{timeout:15000});
    check("Check my evidence goes through the units with evidence",await page.evaluate(()=>/I’ve been through/.test(document.getElementById("chat").innerText)));
    check("Targets are set from Evia's stats",await page.evaluate(()=>{window.eviaTargets.ensure();return window.eviaTargets.mine().length>=3}));
    await page.click('#x');await page.waitForTimeout(300);
    check("Profile button comes back after closing the chat",await page.evaluate(()=>getComputedStyle(document.getElementById("profile-btn")).display!=="none"));

    await page.evaluate(()=>window.eviaStartTest("epa",5,"EPA quick quiz"));await page.waitForTimeout(500);
    check("Answer buttons stay hidden while Evia is thinking",await page.evaluate(()=>{const r=document.querySelector("#chat .rating-options");return !r||getComputedStyle(r).display==="none"}));
    await page.waitForSelector("[data-test-answer]",{state:"visible",timeout:10000});
    check("A test question appears with answers",true);
    await page.click("#x");await page.waitForTimeout(300);

    await page.evaluate(()=>window.eviaPractice.openConfidence());await page.waitForTimeout(300);
    await page.evaluate(()=>document.querySelectorAll(".cf-row input").forEach((inp,i)=>{inp.value=i%4+1;inp.dispatchEvent(new Event("input",{bubbles:true}))}));
    check("Confidence sliders update the overall score",await page.evaluate(()=>/%/.test(document.getElementById("cf-score").textContent)));
    await page.click("#pr-save");await page.waitForTimeout(300);
    check("Confidence check saves and shows a training plan",await page.evaluate(()=>/training plan/i.test(document.getElementById("pr-title").textContent)));
    check("A college practice task is suggested",await page.$("[data-task]"));

    await page.evaluate(()=>document.getElementById("profile-btn").click());await page.waitForTimeout(300);
    await page.evaluate(()=>document.getElementById("profile-dsl-name").closest("details").open=true);await page.fill("#profile-dsl-name","Jo Smith");await page.fill("#profile-dsl-phone","01234 567890");await page.click("#save-profile");await page.waitForTimeout(200);
    await page.evaluate(()=>window.eviaScenarios.openTopics());await page.waitForTimeout(300);
    check("A safeguarding lead saved in Profile shows on the Who to talk to card",await page.evaluate(()=>/Jo Smith/.test(document.querySelector(".sc-contacts").innerText)&&!!document.querySelector('.sc-contacts a[href="tel:01234567890"]')));
    await page.click('[data-topic="values"]');await page.waitForTimeout(300);await page.click('[data-opt="0"]');await page.waitForTimeout(200);
    check("A real-life scenario explains every choice",await page.evaluate(()=>document.querySelectorAll(".sc-why").length===3));
    await page.evaluate(()=>{document.getElementById("modal-root").innerHTML=""});

    await page.evaluate(()=>{document.body.classList.add("evia-onboarding");nav("progress")});await page.waitForTimeout(200);
    check("The first-run demo can point at the KSB card on My progress",!!await page.$("#pv-ksb"));
    await page.evaluate(()=>nav("course"));await page.waitForTimeout(200);
    check("My course has Learning logs and Progress reviews side by side under the units, for the demo to point at",await page.evaluate(()=>{const g=document.getElementById("ui-logs-grid");return !!g&&g.querySelectorAll("button").length===2&&!!g.previousElementSibling}));
    await page.evaluate(()=>{document.body.classList.remove("evia-onboarding");nav("home")});await page.waitForTimeout(450);

    await page.evaluate(()=>window.eviaStartReview());await page.waitForTimeout(400);
    for(let i=0;i<12;i++){const t=await page.evaluate(()=>document.getElementById("rv-next").textContent);await page.click("#rv-next");await page.waitForTimeout(200);if(t==="Save review")break}
    check("The review ends with a sign-off step for employer and tutor",await page.evaluate(()=>true)&&!!(await page.evaluate(()=>{const r=JSON.parse(localStorage.getItem("evia7-progress-reviews")||"[]").pop();return r&&r.format===2})));
    await page.waitForSelector("#rvp-save",{timeout:20000}).catch(()=>{});
    check("Saving a review offers the two-page review PDF to share and sign",await page.evaluate(()=>!!document.getElementById("rvp-save")&&/2 pages/.test(document.querySelector(".eport-status").textContent)));
    await page.evaluate(()=>{document.getElementById("modal-root").innerHTML=""});
    check("A full review clicks through and replaces the targets",await page.evaluate(()=>{const r=JSON.parse(localStorage.getItem("evia7-progress-reviews")||"[]").pop();return r&&r.format===2&&window.eviaTargets.mine().every(t=>t.reviewId===r.id)}));
    await page.evaluate(()=>window.eviaSetShape("gear"));
    check("Outline Evia shapes draw on the Evia button",await page.$("#evia-fab .evia-outline"));
    await page.evaluate(()=>window.eviaSetShape("circle"));

    // Trowel Occupations L3 (NVQ): packs and questions by unit, shared answers, witness testimony.
    await page.evaluate(()=>{course="trowel3";persist();nav("course")});await page.waitForTimeout(450);
    check("The NVQ course groups site jobs into dropdowns by type of work, with one knowledge pack",await page.evaluate(()=>{const g=[...document.querySelectorAll(".nvq-group summary strong")].map(x=>x.textContent);return ["Setting out","Walls and structures","Features and specialist work","Repairs and maintenance"].every(t=>g.includes(t))&&!g.includes("Drainage")&&!document.querySelector(".nvq-group[open]")&&document.querySelectorAll("[data-u]").length===23&&document.querySelectorAll("[data-nvq-knowledge]").length===1}));
    await page.click('.nvq-group[data-group="walls"] summary');
    check("A dropdown opens to show its jobs",await page.evaluate(()=>{const d=document.querySelector('.nvq-group[data-group="walls"]');return d.open&&d.querySelector("[data-u]").getBoundingClientRect().height>0}));
    await page.click("[data-nvq-knowledge]");await page.click('[data-topic="info"]');await page.click("[data-q]");
    await page.fill("#nvq-answer","I would stop work and report it to my supervisor straight away, then wait until the drawings or materials are put right.");await page.click("#nvq-save");
    check("One answer ticks the same question in every unit that asks it",await page.evaluate(()=>["234.1.3","235.1.3","313.1.3","701.1.3","690.1.3"].every(c=>window.eviaNvq.evidenced().has(c))));
    await page.evaluate(()=>{document.getElementById("modal-root").innerHTML="";const e=data().u;["Arches","Chimney stack","Fireplace"].forEach((t,i)=>{const u=e.find(x=>x[0]===t);evidence.push({id:"n"+i,c:course,u:t,k:u[1].map(code),w:"x",p:[],savedAt:new Date().toISOString()})});persist()});
    check("Three different 313 jobs complete the at-least-three criterion",await page.evaluate(()=>window.eviaNvq.evidenced().has("313.7.3")));
    await page.evaluate(()=>{const e=data().u;["Cavity wall","Blockwork","Solid wall","Openings"].forEach((t,i)=>{const u=e.find(x=>x[0]===t);evidence.push({id:"w"+i,c:course,u:t,k:u[1].map(code),w:"x",p:[],savedAt:new Date().toISOString()})});persist()});
    check("Unit 235 needs all six of its jobs, not just some",await page.evaluate(()=>{const before=window.eviaNvq.evidenced().has("235.7.3");const u=data().u.find(x=>x[0]==="Cills, cappings and copings");evidence.push({id:"w9",c:course,u:u[0],k:u[1].map(code),w:"x",p:[],savedAt:new Date().toISOString()});return !before&&window.eviaNvq.evidenced().has("235.7.3")}));
    await page.evaluate(()=>nav("progress"));await page.waitForTimeout(450);
    check("NVQ My progress says criteria, not KSBs, and its units deep dive shows unit rings",await page.evaluate(async()=>{const ok=!/KSB/.test(document.getElementById("screen").innerText);window.eviaProgressDeep("ksb");await new Promise(r=>setTimeout(r,300));const r=ok&&!!document.querySelector(".pv-sheet [data-nvq-unit='313']");document.getElementById("modal-root").innerHTML="";return r}));
    await page.evaluate(()=>{course="bricklayer";persist();nav("home")});await page.waitForTimeout(450);

    // Page headings, draft tags, the strength key, the backup reminder, clean test screens and the OTJ PDF.
    await page.evaluate(()=>{localStorage.setItem("evia7-working-evidence-packs",JSON.stringify({["bricklayer|"+data().u[5][0]]:{course:"bricklayer",unit:data().u[5][0],photos:[],write:"Started"}}));nav("course")});await page.waitForTimeout(450);
    check("My course has a heading and a Draft tag",await page.evaluate(()=>/My course/.test(document.querySelector(".ui-page-head h1").textContent)&&document.querySelectorAll(".draft-chip").length===1));
    check("Evia reminds learners to back up once they have a few packs",await page.evaluate(()=>{localStorage.removeItem("evia7-last-backup");return window.eviaStats.nudges(window.eviaStats.compute()).some(n=>n.id==="backup")}));
    await page.evaluate(()=>{document.getElementById("modal-root").innerHTML="";window.eviaStartTest("maths",5,"Maths")});await page.waitForSelector("[data-test-answer]",{state:"visible",timeout:12000});
    check("A test from Practice opens on its own screen, without the chat menu",await page.evaluate(()=>/Maths/.test(document.querySelector(".chat-sheet h2").textContent)&&!document.querySelector("#chat [data-chat-option]")));
    await page.click("#x");await page.waitForTimeout(300);
    await page.evaluate(()=>{document.getElementById("modal-root").innerHTML="";nav("learning")});await page.waitForTimeout(500);
    await page.evaluate(()=>window.eviaOpenLearningLogs());await page.waitForSelector("#download-otj",{timeout:5000});
    await page.evaluate(()=>document.getElementById("download-otj").click());await page.waitForSelector("#eport-save",{timeout:15000});
    check("The OTJ log downloads as a PDF with a preview",await page.evaluate(()=>!!document.getElementById("eport-preview")&&/OTJ PDF/.test(document.querySelector(".eport-status").textContent)));
    await page.evaluate(()=>window.eviaOpenLearningLogs());await page.waitForTimeout(600);
    check("Learning logs then only offers new entries, and past downloads can be downloaded again",await page.evaluate(()=>!document.getElementById("download-otj")&&document.querySelectorAll("[data-batch]").length>=1&&/Everything’s downloaded/.test(document.getElementById("screen").innerText)));
    await page.evaluate(()=>nav("home"));await page.waitForTimeout(400);

    // Evidence strength: judged on the unit's prompts, not just counts.
    check("Evidence strength rewards covering the prompts, not padding",await page.evaluate(()=>{
      const S=window.eviaStrength,pr={photos:"mixing mortar · ratio · silos",writeup:"ratio · teamwork · PPE · silos"},H=36e5,t=Date.now();
      const ph=n=>Array.from({length:n},(_,i)=>({takenAt:t-(n-i)*H,prompt:["mixing mortar","ratio","silos"][i%3],q:{b:120,s:40,h:(i*1111111111111111).toString(16).padStart(16,"0").slice(0,16)}}));
      const pad=S.score({photos:ph(1),write:"brick ".repeat(150)},pr);
      const good=S.score({photos:ph(6),write:"First I checked the ratio, 1:4, then mixed it with my team. I wore PPE, gloves and goggles, and took sand from the silos. Finally I cleaned the 2 shovels. I learned to gauge carefully and next time I would mix a smaller batch."},pr);
      return pad.level==="weak"&&good.level==="strong"&&good.written.missing.length===0&&good.photos.covered.length===3&&pad.next.length>0;
    }));
    await page.evaluate(()=>{course="bricklayer";persist();openUnit(0)});await page.waitForTimeout(700);
    await page.evaluate(()=>{const w=document.getElementById("write");w.value="I checked the ratio and worked with my team.";w.dispatchEvent(new Event("input"))});await page.waitForTimeout(200);
    check("The evidence pack shows a live strength meter and ticks the things to mention",await page.evaluate(()=>!!document.querySelector("#st-meter .st-meter-num")&&document.querySelectorAll("#st-men .st-chip.on").length>=2&&!!document.querySelector("#st-meter .st-next-i")));
    await page.evaluate(()=>{const w=document.getElementById("write");w.value="";w.dispatchEvent(new Event("input"));nav("learning")});await page.waitForTimeout(600);
    await page.evaluate(()=>document.getElementById("pv-guide").click());await page.waitForTimeout(400);
    check("My progress explains how to build a strong portfolio",await page.evaluate(()=>/strong portfolio/.test(document.getElementById("st-title").textContent)&&document.querySelectorAll(".st-tip").length===8));
    await page.evaluate(()=>{document.getElementById("modal-root").innerHTML=""});

    // Backup and restore: a learner's portfolio survives being restored and the app reloading.
    const keep=await page.evaluate(()=>evidence.length);
    const [bk]=await Promise.all([page.waitForEvent("download",{timeout:20000}),page.evaluate(()=>window.eviaStorage.backup())]);
    const b64=fs.readFileSync(await bk.path()).toString("base64");
    await page.evaluate(async b64=>{evidence.length=0;persist();const bytes=Uint8Array.from(atob(b64),c=>c.charCodeAt(0));await window.eviaStorage.restore(new File([bytes],"backup.zip"))},b64);
    await page.reload();await page.waitForTimeout(2500);
    check("Backup and restore brings the portfolio back after a reload",await page.evaluate(n=>evidence.length===n&&n>0,keep));

    // Offline: once everything is saved, Evia opens with no connection.
    await page.evaluate(()=>navigator.serviceWorker.ready);await page.waitForTimeout(1500);
    await ctx.setOffline(true);await page.reload();await page.waitForTimeout(2500);
    check("Evia opens offline",await page.evaluate(()=>typeof render==="function"&&!!document.getElementById("evia-fab")&&!!window.eviaStats));
    await ctx.setOffline(false);

    check("No script errors",!errors.length,errors.join(" | "));
  }catch(e){check("Test run finished",false,e.message)}
  await browser.close();server.close();
  const failed=results.filter(r=>!r.ok).length;
  console.log(failed?"\n"+failed+" check(s) failed.":"\nAll "+results.length+" checks passed.");
  process.exit(failed?1:0);
})();
