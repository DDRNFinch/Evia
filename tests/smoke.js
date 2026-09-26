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

    check("The app opens on My course; the nav is Course, Progress, Evia, Teach me and Rewards",await page.evaluate(()=>screen==="course"&&!!document.getElementById("ui-course-head")&&[...document.querySelectorAll("[data-nav]")].map(b=>b.textContent.trim()).join()==="Course,Progress,Teach me,Rewards"));
    for(const s of ["course","progress","portfolio","learning"]){await page.evaluate(s=>nav(s),s);await page.waitForTimeout(450)}
    await page.evaluate(()=>nav("progress"));await page.waitForTimeout(450);
    check("My progress starts with the progress review, and each section has its way in",await page.evaluate(()=>{const first=document.querySelector(".pv-grid .pv-card");return first&&first.id==="pv-review"&&!document.querySelector(".pv-grid .pv-act")}));
    const deepActs=await page.evaluate(async()=>{const w=ms=>new Promise(r=>setTimeout(r,ms)),out={};
      for(const id of ["review","otj","conf"]){document.getElementById("pv-"+id).click();await w(250);out[id]=[...document.querySelectorAll("#modal-root .pv-deep-acts .pv-act")].map(b=>b.textContent);document.getElementById("modal-root").innerHTML="";await w(50)}
      return out});
    check("Each section's buttons are inside its deep dive",deepActs.review.includes("Start my review")&&deepActs.otj.includes("Log hours")&&deepActs.conf.includes("Find a college task"),JSON.stringify(deepActs));
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
    check("Evia opens with a catch-up and her four actions",await page.evaluate(()=>{const t=[...document.querySelectorAll("#chat .ui-action")].map(b=>b.innerText.trim());return t.join()==="Evidence check,Quick review,Show targets,EPA mocks"&&/off-the-job/.test(document.getElementById("chat").innerText)&&!document.querySelector(".chat-sheet .ui-ask")}));
    await page.click('#chat .ui-action[data-action="evidence"]');
    await page.waitForFunction(()=>[...document.querySelectorAll("#chat .ui-replies button")].length>=2,null,{timeout:15000});
    await page.evaluate(()=>document.querySelector("#chat .ui-replies button").click());
    await page.waitForFunction(()=>!!document.querySelector("#chat .ev-check")&&[...document.querySelectorAll("#chat .ui-replies button")].some(b=>/Add photos/.test(b.textContent)),null,{timeout:15000});
    check("Evidence check rates a piece of evidence, lists what's still to mention and offers ways to fix it",await page.evaluate(()=>{const t=[...document.querySelectorAll("#chat .ui-replies button")].map(b=>b.textContent);return /Weak|Good|Strong/.test(document.querySelector("#chat .ev-check").textContent)&&["Add photos","Improve my write-up","Let Evia guide me","Check another"].every(x=>t.includes(x))}));
    await page.evaluate(()=>[...document.querySelectorAll("#chat .ui-replies button")].find(b=>b.textContent==="Something else").click());
    await page.waitForSelector('#chat .ui-actions .ui-action[data-action="quick"]',{timeout:15000});await page.click('#chat .ui-actions .ui-action[data-action="quick"]');
    await page.waitForSelector("#chat .qr",{timeout:15000});
    check("Quick review shows every area at a glance and offers the ones needing work",await page.evaluate(()=>document.querySelectorAll("#chat .qr-row").length>=7&&[...document.querySelectorAll("#chat .ui-replies button")].filter(b=>/^Open /.test(b.textContent)).length>=1));
    await page.evaluate(()=>[...document.querySelectorAll("#chat .ui-replies button")].find(b=>b.textContent==="Something else").click());
    await page.waitForSelector('#chat .ui-actions .ui-action[data-action="epa"]',{timeout:15000});await page.click('#chat .ui-actions .ui-action[data-action="epa"]');
    await page.waitForFunction(()=>[...document.querySelectorAll("#chat .ui-replies button")].some(b=>/Discussion guide/.test(b.textContent)),null,{timeout:15000});
    check("EPA mocks darkens the chat and offers quick practice, a full mock, a full discussion and the guide",await page.evaluate(()=>{const t=[...document.querySelectorAll("#chat .ui-replies button")].map(b=>b.textContent);return document.body.classList.contains("evia-epa")&&["Quick practice","Full mock","Full discussion","Discussion guide"].every(x=>t.includes(x))}));
    await page.evaluate(()=>[...document.querySelectorAll("#chat .ui-replies button")].find(b=>b.textContent==="Discussion guide").click());
    await page.waitForFunction(()=>[...document.querySelectorAll("#chat .ui-replies button")].length>=5,null,{timeout:15000});
    await page.evaluate(()=>document.querySelector("#chat .ui-replies button").click());
    await page.waitForSelector("#chat .dg-model",{timeout:15000});
    await page.waitForFunction(()=>[...document.querySelectorAll("#chat .ui-replies button")].some(b=>/read it/.test(b.textContent)),null,{timeout:15000});
    await page.evaluate(()=>[...document.querySelectorAll("#chat .ui-replies button")].find(b=>/read it/.test(b.textContent)).click());
    await page.waitForFunction(()=>!!document.querySelector("#chat .dg-prompts")||/can’t turn your voice/.test(document.getElementById("chat").innerText),null,{timeout:15000});
    check("The discussion guide goes from a model answer to answering out loud with prompts: a microphone, no typing, no transcript",await page.evaluate(()=>!document.querySelector("#chat textarea")&&(!!document.querySelector("#chat .vc-chat .dr-mic")||(!window.eviaDiscussion.supported()&&/Chrome/.test(document.getElementById("chat").innerText)))));
    const disc=await page.evaluate(()=>{
      const D=window.eviaDiscussion,q=EPA_DISCUSSIONS.bricklaying[0],m=window.EVIA_EPA_GUIDE.bricklaying[0].model;
      const strong=D.grade(q,m,"").score,weak=D.grade(q,"I would build the wall and make it look nice.","").score;
      const prompted=D.grade(q,"I would read the drawings, set out from the datum, mix the mortar and keep it level.","I’d wear gloves and boots and use a trowel.");
      return {strong,weak,half:prompted.pts.find(p=>p.label==="Tools & PPE").follow&&prompted.prompted.includes("Tools & PPE")};
    });
    check("Recorded discussions are graded from the transcript: a model answer scores high, a vague one low, and follow-up answers count",disc.strong>=75&&disc.weak<30&&disc.half,JSON.stringify(disc));
    await page.click('#x');await page.waitForTimeout(400);
    check("EPA mode ends when the chat closes",await page.evaluate(()=>!document.body.classList.contains("evia-epa")));
    await page.evaluate(()=>window.chat());await page.waitForSelector("#chat .ui-action",{timeout:15000});
    check("Targets are set from Evia's stats",await page.evaluate(()=>{window.eviaTargets.ensure();return window.eviaTargets.mine().length>=3}));
    await page.click('#x');await page.waitForTimeout(300);
    check("Profile button comes back after closing the chat",await page.evaluate(()=>getComputedStyle(document.getElementById("profile-btn")).display!=="none"));

    // Tests run as a serious exam on their own screen: no hints until the end.
    await page.evaluate(()=>window.eviaStartTest("epa",5,"EPA quick quiz"));
    await page.waitForSelector(".ex #ex-start",{state:"visible",timeout:10000});
    check("Test me opens the test as an exam on its own screen",await page.evaluate(()=>/EPA quick quiz/.test(document.querySelector(".ex").textContent)&&!document.querySelector(".chat-sheet")));
    const exam=await page.evaluate(async()=>{
      const w=ms=>new Promise(r=>setTimeout(r,ms));document.querySelector("#ex-start").click();await w(60);
      let hint=false;
      for(let k=0;k<5;k++){document.querySelector(".ex-opt").click();await w(20);if(document.querySelector(".ex .correct,.ex .wrong,.ex-ex"))hint=true;document.querySelector("#ex-next").click();await w(40)}
      const before=JSON.parse(localStorage.getItem("evia7-test-results")||"[]").length;
      return {hint,results:!!document.querySelector(".ex-score")&&document.querySelectorAll(".ex-review li").length===5,saved:before>0};
    });
    check("The exam gives no hints while answering, then shows the score and every answer",!exam.hint&&exam.results);
    check("The exam result is saved for the progress review",exam.saved);
    await page.evaluate(()=>document.querySelector("#ex-done").click());await page.waitForTimeout(300);

    // The confidence check: one skill at a time in the Teach me style.
    await page.evaluate(()=>window.eviaPractice.openConfidence());await page.waitForTimeout(300);
    const conf=await page.evaluate(async()=>{
      const w=ms=>new Promise(r=>setTimeout(r,ms));document.querySelector("#cf-start").click();await w(60);
      const one=!!document.querySelector(".cf-ask")&&document.querySelectorAll(".cf-opt").length===4;
      let k=0;while(document.querySelector(".cf-opt")&&k<40){document.querySelectorAll(".cf-opt")[k%4].click();k++;await w(320)}
      return {one,summary:/course confidence/.test(document.querySelector(".tm").textContent),saved:JSON.parse(localStorage.getItem("evia7-confidence")||"[]").some(x=>x.course===course)};
    });
    check("The confidence check asks one skill at a time with four clear answers",conf.one);
    check("Confidence check saves and shows a summary",conf.summary&&conf.saved);
    await page.evaluate(()=>document.querySelector("#cf-task").click());await page.waitForTimeout(500);
    check("A college practice task is suggested",await page.evaluate(()=>/COLLEGE TASK/.test((document.querySelector(".pr-sheet .chat-kicker")||{}).textContent||"")));
    await page.evaluate(()=>{document.getElementById("modal-root").innerHTML=""});

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
    check("My course has Learning logs under the units, for the demo to point at (reviews moved to My progress)",await page.evaluate(()=>{const g=document.getElementById("ui-logs-grid");return !!g&&g.querySelectorAll(".ui-log-tile").length===1&&!document.getElementById("ui-open-reviews")&&!!g.previousElementSibling}));
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
    await page.evaluate(()=>{document.getElementById("modal-root").innerHTML="";window.eviaStartTest("maths",5,"Maths")});await page.waitForSelector(".ex #ex-start",{state:"visible",timeout:12000});
    check("A maths test from Practice opens as an exam",await page.evaluate(()=>/Maths test/.test(document.querySelector(".ex").textContent)));
    await page.evaluate(()=>document.querySelector(".ex-x").click());await page.waitForTimeout(300);
    await page.evaluate(()=>{document.getElementById("modal-root").innerHTML="";nav("learning")});await page.waitForTimeout(500);
    await page.evaluate(()=>window.eviaOpenLearningLogs());await page.waitForSelector("#download-otj",{timeout:5000});
    await page.evaluate(()=>document.getElementById("download-otj").click());await page.waitForSelector("#eport-save",{timeout:15000});
    check("The OTJ log downloads as a PDF with a preview",await page.evaluate(()=>!!document.getElementById("eport-preview")&&/OTJ PDF/.test(document.querySelector(".eport-status").textContent)));
    await page.evaluate(()=>window.eviaOpenLearningLogs());await page.waitForTimeout(600);
    check("Learning logs then only offers new entries, and past downloads can be downloaded again",await page.evaluate(()=>!document.getElementById("download-otj")&&document.querySelectorAll("[data-batch]").length>=1&&/Everything’s downloaded/.test(document.getElementById("screen").innerText)));
    await page.evaluate(()=>nav("home"));await page.waitForTimeout(400);

    // Evidence strength: photos by count, write-up by the areas it talks about; areas answered with Evia count in full.
    check("Evidence strength: under 5 photos weak, 10+ strong; areas answered with Evia count in full",await page.evaluate(()=>{
      const S=window.eviaStrength,pr={writeup:"ratio · teamwork · PPE · silos"},ph=n=>Array.from({length:n},()=>({id:"x"}));
      const few=S.pack({photos:ph(4),write:"I checked the ratio, worked with my team, wore PPE and used the silos."},pr);
      const lots=S.pack({photos:ph(10),write:"I checked the ratio, worked with my team, wore PPE and used the silos."},pr);
      const mid=S.pack({photos:ph(7),write:"I checked the ratio."},pr);
      const guided=S.pack({photos:ph(10),write:"Some words here.",guide:{v:2,answers:{doing:"a"},covered:{doing:["ratio","teamwork","PPE"]}}},pr);
      return few==="weak"&&lots==="strong"&&mid==="weak"&&guided==="strong";
    }));
    await page.evaluate(()=>{course="bricklayer";persist();openUnit(0)});await page.waitForTimeout(700);
    check("The evidence pack shows no score, just a link to how to build a strong portfolio",await page.evaluate(()=>!document.getElementById("st-meter")&&!!document.getElementById("st-how")&&document.querySelectorAll(".writeup-section .compact-prompts").length===1));
    await page.evaluate(()=>{const w=document.getElementById("write");w.value="";w.dispatchEvent(new Event("input"));nav("learning")});await page.waitForTimeout(600);
    await page.evaluate(()=>document.getElementById("pv-guide").click());await page.waitForTimeout(400);
    check("My progress explains how to build a strong portfolio",await page.evaluate(()=>/strong portfolio/.test(document.getElementById("st-title").textContent)&&document.querySelectorAll(".st-tip").length===8));
    await page.evaluate(()=>{document.getElementById("modal-root").innerHTML=""});

    // Guided evidence: Evia asks a question for each thing to mention and puts the answers together as the statement.
    await page.evaluate(()=>{course="bricklayer";persist();openUnit(data().u.findIndex(u=>u[0]==="Cavity opening"))});await page.waitForTimeout(700);
    await page.evaluate(()=>document.getElementById("eg-start").click());await page.waitForTimeout(300);
    await page.evaluate(()=>[...document.querySelectorAll(".eg-sheet button")].find(b=>/questions/.test(b.textContent)).click());await page.waitForTimeout(300);
    const q1=await page.evaluate(()=>document.querySelector(".eg-q").textContent+" "+(document.querySelector(".eg-think")||{}).textContent);
    await page.evaluate(()=>{document.getElementById("eg-text").value="I fitted the cavity closer at the reveal.";[...document.querySelectorAll(".eg-sheet button")].find(b=>/Save and continue/.test(b.textContent)).click()});await page.waitForTimeout(300);
    await page.evaluate(()=>{document.getElementById("eg-text").value="The ties go in at 450 centres.";[...document.querySelectorAll(".eg-sheet button")].find(b=>/Save and continue/.test(b.textContent)).click()});await page.waitForTimeout(300);
    for(let i=0;i<12;i++){const more=await page.evaluate(()=>{const b=[...document.querySelectorAll(".eg-sheet button")].find(b=>/^Skip$/.test(b.textContent));if(b){b.click();return true}return false});if(!more)break;await page.waitForTimeout(200)}
    await page.evaluate(()=>[...document.querySelectorAll(".eg-sheet button")].find(b=>/Use this statement/.test(b.textContent)).click());await page.waitForTimeout(700);
    check("Evia guides a pack through the stages of the job, then the answers become the statement",/step by step/i.test(q1)&&/cavity closure/.test(q1)&&await page.evaluate(()=>document.getElementById("write").value==="I fitted the cavity closer at the reveal.\n\nThe ties go in at 450 centres."));
    await page.evaluate(()=>{const w=document.getElementById("write");w.value="";w.dispatchEvent(new Event("input"))});

    // Teach me: the tile, a lesson played through, and Evia's view in the confidence check.
    await page.evaluate(()=>{course="bricklayer";persist();document.getElementById("modal-root").innerHTML="";nav("course")});await page.waitForTimeout(500);
    await page.evaluate(()=>{window.chat({quiet:true});setTimeout(()=>window.eviaCoachFlows.upskill(),200)});await page.waitForTimeout(2500);
    const upskillHasTeach=await page.evaluate(()=>[...document.querySelectorAll(".ui-replies button")].some(b=>/Teach me/.test(b.textContent)));
    await page.evaluate(()=>{document.getElementById("modal-root").innerHTML="";nav("teach")});await page.waitForTimeout(600);
    check("Teach me is a tab with the course, maths, English and EDI, and it's no longer in Upskill me",!upskillHasTeach&&await page.evaluate(()=>{const t=[...document.querySelectorAll("[data-go] strong")].map(b=>b.textContent);return t.join()==="Bricklayer,Maths,English,EDI"&&!document.querySelector(".tm-tile")}));
    check("EDI opens from Teach me with its lessons, and Up next goes straight into a lesson",await page.evaluate(async()=>{const w=t=>new Promise(r=>setTimeout(r,t));
      document.querySelector('[data-go="edi"]').click();await w(400);const edi=!!document.querySelector('[data-lesson="edi-what"]')&&/EDI/.test(document.querySelector(".tm-bar").textContent);
      document.querySelector(".tm-x").click();await w(400);nav("teach");await w(300);document.querySelector("[data-play]").click();await w(500);
      const inLesson=!!document.querySelector(".tm")&&!document.querySelector(".tm-path");document.querySelector(".tm-x").click();await w(300);const x=document.querySelector(".tm-x");if(x)x.click();await w(300);nav("teach");await w(300);return edi&&inLesson}));
    await page.evaluate(()=>document.querySelector('[data-go="course"]').click());await page.waitForTimeout(600);
    // Rewards: free starters, locked items, buying, and loot boxes that refund duplicates and guarantee an epic.
    await page.evaluate(()=>{const x=document.querySelector(".tm-x");if(x)x.click()});await page.waitForTimeout(300);
    const rw=await page.evaluate(async()=>{
      const w=ms=>new Promise(r=>setTimeout(r,ms)),R=window.eviaRewards,out={};
      const keep=localStorage.getItem("evia7-rewards"),rnd=Math.random;
      localStorage.setItem("evia7-rewards",JSON.stringify({bank:1000,spent:0,owned:[],hat:"",pity:0,seenAch:[],lastXp:0,day:""}));
      out.free=!R.locked("shape","cloud")&&!R.locked("colour","green")&&R.locked("shape","gear")==="epic"&&R.locked("colour","orange")==="common";
      nav("rewards");await w(500);
      out.page=!!document.getElementById("rw-page")&&document.querySelectorAll(".rw-item").length===10&&/Loot box only/.test(document.getElementById("rw-hat-glow").textContent);
      document.querySelector('[data-buy="hat-blue"]').click();await w(300);
      out.bought=JSON.parse(localStorage.getItem("evia7-rewards")).owned.includes("hat-blue")&&!!document.querySelector("#evia-fab .evia-kit");
      document.querySelectorAll(".rw-over").forEach(o=>o.remove());
      const box=async()=>{document.getElementById("rw-open").click();await w(1700);document.querySelectorAll(".rw-over").forEach(o=>o.remove())};
      Math.random=()=>0.01;await box();
      const s1=JSON.parse(localStorage.getItem("evia7-rewards"));
      out.dupe=["shape-oval","colour-orange","expr-wink","expr-surprised","ppe-specs","ppe-hivis"].some(id=>s1.owned.includes(id));
      for(let k=0;k<5;k++)await box();
      const s2=JSON.parse(localStorage.getItem("evia7-rewards"));out.refund=s2.bank>1000;
      const st=JSON.parse(localStorage.getItem("evia7-rewards"));st.pity=9;localStorage.setItem("evia7-rewards",JSON.stringify(st));
      await box();const s3=JSON.parse(localStorage.getItem("evia7-rewards"));
      out.pity=s3.owned.some(id=>["hat-gold","shape-gear","shape-shield","colour-teal","colour-midnight","expr-focused","expr-stars","ppe-ears-gold"].includes(id))&&s3.pity===0;
      const s5=JSON.parse(localStorage.getItem("evia7-rewards"));["ppe-specs","ppe-ears","ppe-hivis"].forEach(id=>{if(!s5.owned.includes(id))s5.owned.push(id)});localStorage.setItem("evia7-rewards",JSON.stringify(s5));
      nav("rewards");await w(400);for(const id of ["ppe-specs","ppe-ears","ppe-hivis"]){const b=document.querySelector('[data-use="'+id+'"]');if(b&&!b.classList.contains("on"))b.click();await w(150)}
      const fab=document.getElementById("evia-fab");
      out.ppe=fab.dataset.eyes==="ppe-specs"&&!!fab.querySelector(".ek-eyes .ek-lens")&&!!fab.querySelector(".evia-kit .ek-ears")&&!!fab.querySelector(".evia-kit .ek-vest");
      out.orbLocked=R.locked("shape","particle-aqua")==="legendary"&&R.locked("shape","glass-ember")==="legendary";
      const s6=JSON.parse(localStorage.getItem("evia7-rewards"));s6.owned.push("shape-particle-aqua");localStorage.setItem("evia7-rewards",JSON.stringify(s6));
      const shapeBefore=window.eviaCurrentShape();window.eviaSetShape("particle-aqua");await w(400);
      const fo=document.querySelector("#evia-fab > .evia-orb");
      out.orb=!!fo&&fo.classList.contains("orb-particle")&&!!fo.querySelector("canvas")&&document.getElementById("evia-fab").classList.contains("evia-orb-host");
      window.eviaSetShape(shapeBefore);await w(100);
      const s4=JSON.parse(localStorage.getItem("evia7-rewards"));s4.owned.push("expr-wink");localStorage.setItem("evia7-rewards",JSON.stringify(s4));
      nav("rewards");await w(400);document.querySelector('[data-tab="expr"]').click();await w(200);
      out.faces=document.querySelectorAll(".rw-item").length===7&&/Loot box only/.test(document.getElementById("rw-expr-hearts").textContent);
      document.querySelector('[data-use="expr-wink"]').click();await w(200);
      out.expr=document.documentElement.getAttribute("data-evia-expr")==="wink";
      document.querySelector('[data-use="expr-wink"]').click();await w(200);
      out.exprOff=!document.documentElement.hasAttribute("data-evia-expr");
      Math.random=rnd;if(keep)localStorage.setItem("evia7-rewards",keep);else localStorage.removeItem("evia7-rewards");R.wearOn();
      return out;
    });
    check("Rewards: three shapes and colours are free, others are locked by rarity, and the glowing hat is loot box only",rw.free&&rw.page,JSON.stringify(rw));
    check("Buying a hard hat puts it on Evia",rw.bought);
    check("PPE: specs, ear defenders and hi-vis can be worn together on Evia, with a hard hat",rw.ppe,JSON.stringify(rw));
    check("Loot boxes give items you don't have, refund tokens for duplicates, and guarantee an epic after 9 without one",rw.dupe&&rw.refund&&rw.pity,JSON.stringify(rw));
    check("Advanced Evias: six legendary orbs, drawn on the Evia button with the particle sphere animated",rw.orbLocked&&rw.orb,JSON.stringify(rw));
    // Coins: real work pays (evidence by strength, upgrades pay the difference, off-the-job hours capped per week), and Teach me shows coins, not XP.
    const cn=await page.evaluate(async()=>{
      const w=ms=>new Promise(r=>setTimeout(r,ms)),R=window.eviaRewards,out={},keep=localStorage.getItem("evia7-rewards"),hs=hours.slice();
      const reset=(paid,seenAch)=>localStorage.setItem("evia7-rewards",JSON.stringify({bank:0,spent:0,owned:[],hat:"",pity:0,seenAch:seenAch||[],lastXp:1e9,day:"",workV:1,paid}));
      const u=[...new Set(evidence.filter(e=>e.c===course).map(e=>e.u))].find(n=>window.eviaStrength.unit(n)),lv=window.eviaStrength.unit(u),key="ev|"+course+"|"+u;
      hours.length=0;const now=Date.now();hours.push({id:"a",n:3,createdAt:now},{id:"b",n:20,createdAt:now});
      reset({});const r1=R.sync();
      out.ev=r1.paid[key]===R.EV_PAY[lv];out.otjCap=Object.entries(r1.paid).some(([k,v])=>k.startsWith("otj|")&&v===40);
      const b1=r1.bank;out.once=R.sync().bank===b1;
      const p=Object.assign({},r1.paid);p[key]=10;reset(p,r1.seenAch);const r2=R.sync();out.upgrade=r2.bank===R.EV_PAY[lv]-10;
      out.toast=!!document.querySelector(".rw-toast");
      hours.length=0;hs.forEach(h=>hours.push(h));
      nav("teach");await w(400);document.querySelector('[data-go="course"]').click();await w(700);
      out.pill=!!document.querySelector(".tm-pill.coins .rw-coin")&&!document.querySelector(".tm-pill.xp");
      const x=document.querySelector(".tm-x");if(x)x.click();await w(300);
      if(keep)localStorage.setItem("evia7-rewards",keep);else localStorage.removeItem("evia7-rewards");
      document.querySelectorAll(".rw-toast").forEach(t=>t.remove());
      return out;
    });
    check("Coins: evidence pays by strength, an upgrade pays the difference, hours are capped at 40 a week, and Teach me shows coins",cn.ev&&cn.otjCap&&cn.once&&cn.upgrade&&cn.toast&&cn.pill,JSON.stringify(cn));
    // Mini games: locked until unlocked in Rewards, played from Teach me, small coins with a daily cap.
    const gm=await page.evaluate(async()=>{
      const w=ms=>new Promise(r=>setTimeout(r,ms)),R=window.eviaRewards,G=window.eviaGames,out={},keep=localStorage.getItem("evia7-rewards");
      localStorage.setItem("evia7-rewards",JSON.stringify({bank:500,spent:0,owned:[],hat:"",pity:0,seenAch:[],lastXp:1e9,day:"",workV:1,paid:{}}));
      nav("teach");await w(500);
      out.locked=document.querySelectorAll(".tt-game.locked").length===3;
      document.querySelector('[data-game="game-brickle"]').click();await w(700);
      out.toRewards=screen==="rewards"&&!!document.querySelector('#rw-game-brickle [data-buy]');
      document.querySelector('#rw-game-brickle [data-buy]').click();await w(300);document.querySelectorAll(".rw-over").forEach(o=>o.remove());
      out.owned=R.owns("game-brickle");
      out.score=G.score("ALLEY","LEVEL").join()==="no,near,near,hit,no";
      nav("teach");await w(400);document.querySelector('[data-game="game-brickle"]').click();await w(400);
      const d=new Date(),L=G.WORDS[G.group()],word=L[Math.floor(Date.UTC(d.getFullYear(),d.getMonth(),d.getDate())/864e5)%L.length][0];
      for(const k of word)document.querySelector('[data-k="'+k+'"]').click();document.querySelector('[data-k="⏎"]').click();await w(1600);
      const end=document.querySelector(".gm-end");out.brickle=!!end&&/\+8/.test(end.querySelector(".gm-end-coins").textContent)&&!!end.querySelector(".gm-learn");
      document.querySelector('.gm-end [data-a="done"]').click();await w(200);
      const r=JSON.parse(localStorage.getItem("evia7-rewards"));r.owned.push("game-crossword","game-flappy");localStorage.setItem("evia7-rewards",JSON.stringify(r));
      G.open("crossword");await w(300);
      const cells=[...document.querySelectorAll(".cw-c")];out.cwGrid=cells.length>10&&/Across|Down/.test(document.querySelector(".cw-clue").textContent);
      document.querySelector('[data-t="reveal"]').click();await w(50);
      for(let n=0;n<cells.length&&!document.querySelector(".gm-end");n++){const b=[...document.querySelectorAll(".cw-c")].find(c=>!c.querySelector("b").textContent);if(!b)break;b.click();document.querySelector('[data-t="reveal"]').click();await w(20)}
      await w(900);
      const e2=document.querySelector(".gm-end");out.crossword=!!e2&&e2.querySelectorAll(".gm-list li").length===7&&/\+8/.test(e2.querySelector(".gm-end-coins").textContent);
      const mg=JSON.parse(localStorage.getItem("evia7-rewards"));mg.owned.push("game-hazard");localStorage.setItem("evia7-rewards",JSON.stringify(mg));
      out.migrated=R.owns("game-crossword")&&!R.owns("game-hazard");
      out.cap=R.gameCoins(100)===44&&R.gameRoom()===0;
      document.querySelector(".gm-x").click();G.open("flappy");await w(400);
      out.flappy=!!document.querySelector(".gm-flappy canvas")&&!!document.querySelector(".fl-tip");
      document.querySelector(".gm-x").click();await w(100);
      out.closed=!document.querySelector(".gm")&&!document.documentElement.classList.contains("gm-open");
      if(keep)localStorage.setItem("evia7-rewards",keep);else localStorage.removeItem("evia7-rewards");
      return out;
    });
    check("Mini games: locked until bought in Rewards, then Brickle, the crossword and Flappy Evia play from Teach me and pay capped coins",Object.values(gm).every(Boolean),JSON.stringify(gm));
    check("Expressions: seven faces (heart eyes loot box only); using one shows it on Evia, and tapping again goes back to classic",rw.faces&&rw.expr&&rw.exprOff,JSON.stringify(rw));
    await page.evaluate(()=>nav("teach"));await page.waitForTimeout(600);
    await page.evaluate(()=>document.querySelector('[data-go="course"]').click());await page.waitForTimeout(600);
    // Teach me: play the whole Mixing mortar unit (every kind of screen, a mistake to fix and a surprise question),
    // then an older-style lesson, then leave one part-way and carry on from the same screen.
    await page.addScriptTag({path:path.join(__dirname,"teach-solver.js")});
    const played=await page.evaluate(async()=>{
      const w=ms=>new Promise(r=>setTimeout(r,ms)),kinds=new Set(),types=new Set(),again=[];
      window.EVIA_TEACH.surpriseChance=1;
      const play=async(id,wrongAt)=>{
        document.querySelector('[data-lesson="'+id+'"]').click();await w(120);
        for(let n=0;n<90&&window.eviaTeach.current();n++){const c=window.eviaTeach.current();kinds.add(c.kind);types.add(c.step.t);if(c.kind==="review")again.push(c.step.t);
          await window.__teachSolve({wrong:id==="mm4"&&c.step.t==="hot"&&c.kind==="main"?2:n===wrongAt});await w(50)}
        const ok=/(Lesson|Unit) complete/.test(document.querySelector(".tm").textContent);document.querySelector("#tm-path").click();await w(120);return ok;
      };
      const results=[];for(const id of ["mm1","mm2","mm3","mm4","mm5","mm6","bk-joint1"])results.push(await play(id,id==="mm3"?3:-1));
      const mortar=[...document.querySelectorAll(".tm-unit")].find(u=>/Mixing mortar/.test(u.textContent));
      return {all:results.every(Boolean),done:mortar?mortar.querySelectorAll(".tm-node.done").length:0,trophy:!!(mortar&&mortar.querySelector(".tm-node.trophy.done")),kinds:[...kinds],types:[...types],again,stats:window.eviaTeach.stats()};
    });
    check("The Mixing mortar unit plays through, ending in a unit challenge, and older lessons still play",played.all&&played.done===6&&played.trophy,JSON.stringify(played));
    const every=["teach","explore","watch","cards","choice","tf","tap","gap","build","order","match","sort","judge","spot","scene","hot","label","load","quick","banner"];
    check("Teach me has every kind of screen, a round to fix mistakes and a surprise question",every.every(t=>played.types.includes(t))&&played.kinds.includes("review")&&played.kinds.includes("bonus"),every.filter(t=>!played.types.includes(t)).join(",")+" "+played.kinds.join(","));
    check("A question never got right comes back at the end asked a different way",played.again.includes("tf"),played.again.join(","));
    check("XP and a daily streak are kept",played.stats.xp>0&&played.stats.streak===1&&played.stats.today);
    const resumed=await page.evaluate(async()=>{
      const w=ms=>new Promise(r=>setTimeout(r,ms));
      document.querySelector('[data-lesson="mm3"]').click();await w(120);
      for(let k=0;k<3;k++){await window.__teachSolve();await w(50)}
      const at=window.eviaTeach.current().step;document.querySelector(".tm-x").click();await w(150);
      document.querySelector('[data-lesson="mm3"]').click();await w(150);
      const back=window.eviaTeach.current()&&window.eviaTeach.current().step===at;document.querySelector(".tm-x").click();await w(150);return back;
    });
    check("Leaving a lesson part-way carries on from the same screen",resumed);
    await page.evaluate(()=>document.querySelector(".tm-x").click());await page.waitForTimeout(300);
    await page.evaluate(()=>window.eviaPractice.openConfidence());await page.waitForTimeout(400);
    const view=await page.evaluate(async()=>{const w=ms=>new Promise(r=>setTimeout(r,ms));document.querySelector("#cf-start").click();await w(60);
      while(document.querySelector(".cf-area")&&document.querySelector(".cf-area").textContent!=="Mortar mixing"){document.querySelectorAll(".cf-opt")[2].click();await w(320)}
      const t=document.querySelector(".cf-tag.evia");const ok=!!t&&/Confident|Mastered/.test(t.closest(".cf-opt").textContent);document.querySelector(".tm-x").click();await w(250);return ok});
    check("The confidence check marks Evia's view from the lessons beside the learner's own answer",view);
    // Off-the-job time: trade lessons and write-ups are logged automatically; maths and English aren't.
    const otj=await page.evaluate(async()=>{
      const w=ms=>new Promise(r=>setTimeout(r,ms)),O=window.eviaOtj,before=hours.length;
      O.start("teach|Mixing mortar",{description:"Teach me: interactive lessons with Evia on Mixing mortar"});O._add("teach|Mixing mortar",125000);O.stop("teach|Mixing mortar",{learned:"Mixing it"});
      const e=hours.find(x=>x.auto&&x.autoKey&&x.autoKey.startsWith("teach|Mixing mortar"));
      const p=JSON.parse(localStorage.getItem("evia7-profile")||"{}");p.mathsEnabled=true;localStorage.setItem("evia7-profile",JSON.stringify(p));
      window.eviaTeach.open("maths");await w(100);const b=document.querySelector('[data-lesson="m2-num"]');if(b)b.click();await w(100);
      const mathsTimed=O.running("teach|Maths");document.querySelector(".tm-x").click();await w(80);document.querySelector(".tm-x").click();await w(250);
      return {logged:!!e&&e.mins===2&&hours.length===before+1,learned:!!e&&/Mixing it/.test(e.learned),maths:!!b,mathsTimed};
    });
    check("Teach me time is logged to off-the-job hours automatically, by the minute",otj.logged&&otj.learned);
    check("Maths lessons are there but don't count towards off-the-job hours",otj.maths&&!otj.mathsTimed);

    // Maths and English lessons are always there from Evia; the profile switch saves straight away.
    const fsOn=await page.evaluate(async()=>{const w=ms=>new Promise(r=>setTimeout(r,ms));
      const p=JSON.parse(localStorage.getItem("evia7-profile")||"{}");p.englishEnabled=false;localStorage.setItem("evia7-profile",JSON.stringify(p));
      window.eviaOpenProfile();await w(300);const sw=document.getElementById("profile-english");sw.checked=true;sw.dispatchEvent(new Event("change",{bubbles:true}));
      document.getElementById("profile-close").click();await w(100);
      window.eviaTeach.open("english");await w(150);const ok=!!document.querySelector('[data-lesson="e2-read"]');document.querySelector(".tm-x").click();await w(250);
      return ok&&JSON.parse(localStorage.getItem("evia7-profile")).englishEnabled===true});
    check("English lessons open from Teach me, and the profile switch saves even when closed without saving",fsOn);

    // Teach me has every unit for every course, and maths and English by area.
    const allUnits=await page.evaluate(async()=>{const w=ms=>new Promise(r=>setTimeout(r,ms)),out={},was=course;
      for(const c of ["bricklayer","joiner","site","trowel3"]){course=c;window.eviaTeach.open("course");await w(80);out[c]=document.querySelectorAll(".tm-unit").length;document.querySelector(".tm-x").click();await w(220)}
      for(const f of ["maths","english"]){window.eviaTeach.open(f);await w(80);out[f]=document.querySelectorAll(".tm-node").length;document.querySelector(".tm-x").click();await w(220)}
      course=was;return out});
    check("Teach me covers every unit on every course, plus maths (13 areas) and English (17 areas)",allUnits.bricklayer===10&&allUnits.joiner===10&&allUnits.site===12&&allUnits.trowel3===12&&allUnits.maths===13&&allUnits.english===17);

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
