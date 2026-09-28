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
    await page.evaluate(()=>{localStorage.clear();sessionStorage.setItem("evia7-install-later","1");["evia7-theme-picked","evia7-shape-picked"].forEach(k=>localStorage.setItem(k,"1"));
      localStorage.setItem("evia7-onboarding",'{"stage":"done"}');localStorage.setItem("evia7-tips-seen",'["*"]');localStorage.setItem("evia7-home-tip",JSON.stringify({day:new Date().toDateString(),id:"x"}));
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
    check("Tapping a card opens its deep dive with a how-to note",await page.evaluate(()=>/Learning hours/.test(document.getElementById("pv-sheet-title").textContent)&&!!document.querySelector(".pv-sheet .pv-note")&&!!document.querySelector(".pv-sheet .pv-cols")));
    await page.evaluate(()=>{document.getElementById("modal-root").innerHTML="";window.chat({quiet:true})});await page.waitForTimeout(300);
    await page.evaluate(()=>{window.eviaChatKit.userSays("Log my hours");window.eviaCoachFlows.hours()});
    await page.waitForSelector('#chat .chat-pill:has-text("Toolbox talk")',{timeout:8000});await page.click('#chat .chat-pill:has-text("Toolbox talk")');
    await page.waitForSelector('#chat .chat-pill:has-text("Another day")',{timeout:8000});await page.click('#chat .chat-pill:has-text("Another day")');
    await page.waitForSelector("#chat .hw-when .dw-field",{timeout:8000});
    const threeAgo=await page.evaluate(()=>{const d=new Date(Date.now()-3*864e5);return d.getFullYear()+"-"+String(d.getMonth()+1).padStart(2,"0")+"-"+String(d.getDate()).padStart(2,"0")});
    await page.evaluate(()=>{document.querySelector("#chat .hw-when input").value="2999-01-01"});await page.click("#chat .hw-when .hw-when-ok");
    check("Hours can't be logged for a day that hasn't happened yet",/and today/.test(await page.textContent("#chat .hw-when-err")));
    await page.evaluate(v=>{document.querySelector("#chat .hw-when input").value=v},threeAgo);await page.click("#chat .hw-when .hw-when-ok");
    await page.waitForSelector("#chat .hw-ok",{timeout:8000});await page.click('#chat [data-preset="1"]');await page.waitForTimeout(500);await page.click("#chat .hw-ok");
    await page.waitForSelector("#chat .hw-note textarea",{timeout:8000});await page.fill("#chat .hw-note textarea","manual handling");await page.click("#chat .hw-save");
    await page.waitForSelector("#chat .ui-widget:last-child .hw-note textarea:not([disabled])",{timeout:8000});await page.fill("#chat .ui-widget:last-child .hw-note textarea","lift with your legs, not your back");await page.click("#chat .ui-widget:last-child .hw-save");await page.waitForTimeout(300);
    check("Evia logs hours from a chat: what it was, when (backdated here), an hours-and-minutes wheel, what you did and what you learned",await page.evaluate(d=>hours.some(h=>h.n===1&&h.description==="Toolbox talk: manual handling. What I learned: lift with your legs, not your back"&&h.learned&&new Date(h.on).toDateString()===new Date(d+"T12:00:00").toDateString()&&h.createdAt>Date.now()-120000),threeAgo));
    await page.evaluate(()=>{document.getElementById("modal-root").innerHTML=""});
    const rvBefore=await page.evaluate(()=>window.eviaGetReviews().length);
    await page.evaluate(()=>{document.getElementById("modal-root").innerHTML="";window.chat({quiet:true});setTimeout(()=>window.eviaChatReview(),50)});
    const reviewDone=await page.evaluate(async()=>{
      const wait=ms=>new Promise(r=>setTimeout(r,ms));
      for(let n=0;n<40;n++){
        await wait(700);
        window.__rvSecond=(window.__rvSecond||[]).concat([...document.querySelectorAll("#chat .ui-replies .chat-pill")].map(x=>x.textContent.trim()).filter(t=>/Improve this|Finish later|Stop for now/.test(t)));
        const b=[...document.querySelectorAll("#chat .ui-replies .chat-pill")].find(x=>/Let’s go|^Next$|Save my review/.test(x.textContent.trim()));
        if(!b)continue;
        const save=/Save my review/.test(b.textContent);
        const ta=document.querySelector("#chat .rvc textarea[data-reflect='learnerFeedback']:not([disabled])");if(ta)ta.value="All good thanks";
        b.click();if(save)return true;
      }
      return false;
    });
    await page.waitForTimeout(400);
    {const sec=await page.evaluate(()=>[...new Set(window.__rvSecond||[])]);check("In the review chat, each section offers Improve this (or Finish later), not Stop for now",sec.includes("Improve this")&&!sec.includes("Stop for now"),JSON.stringify(sec))}
    check("The progress review happens in Evia's chat, section by section, and saves with comments",reviewDone&&await page.evaluate(b=>{const r=window.eviaGetReviews();return r.length===b+1&&r[0].reflection.learnerFeedback==="All good thanks"&&!("wellbeing" in r[0].reflection)&&!document.querySelector("#chat [data-reflect='wellbeing']")&&!document.querySelector(".rv-sheet")},rvBefore));
    await page.evaluate(()=>{document.getElementById("modal-root").innerHTML=""});
    await page.evaluate(()=>nav("learning"));await page.waitForTimeout(450);
    await page.evaluate(()=>nav("portfolio"));await page.waitForTimeout(450);
    await page.evaluate(()=>openUnit(data().u.findIndex(u=>evidence.some(e=>e.c===course&&e.u===u[0]))));await page.waitForTimeout(1200);
    check("A unit shows its saved evidence as tiles under the capture page, with a share icon",await page.evaluate(()=>document.querySelectorAll(".ev-saved .ev-tile").length>=1&&!!document.querySelector(".ev-tile-share")&&!!document.querySelector(".ev-saved-line")));
    await page.click(".ev-tile-main");await page.waitForTimeout(400);
    check("Tapping a saved tile shows that pack",await page.evaluate(()=>!!document.getElementById("ev-view-photos")));
    await page.evaluate(()=>{document.getElementById("modal-root").innerHTML="";nav("course")});await page.waitForTimeout(400);
    // Free range: the unit offers Evia's guide or free range; free range is all the photos, then the write-up.
    await page.evaluate(()=>openUnit(data().u.findIndex(u=>u[0]==="Mixing mortar")));await page.waitForTimeout(900);
    const fr={choice:await page.evaluate(()=>!!document.getElementById("eg-start")&&!!document.getElementById("fr-start")&&!document.getElementById("write")&&!document.getElementById("evidence-camera"))};
    const egBtn=async re=>{await page.evaluate(src=>{const b=[...document.querySelectorAll(".eg-sheet button")].find(b=>new RegExp(src).test(b.textContent.trim()));if(b)b.click()},re);await page.waitForTimeout(350)};
    await page.click("#fr-start");await page.waitForTimeout(400);
    fr.intro=await page.evaluate(()=>{const sh=document.querySelector(".eg-sheet");return !!sh&&/^FREE RANGE$/.test(sh.querySelector(".chat-kicker").textContent)&&!!sh.querySelector(".fr-no .fr-strike")&&/Photos/.test(sh.textContent)});
    fr.oneButton=await page.evaluate(()=>[...document.querySelectorAll(".eg-sheet .eg-actions button")].map(b=>b.textContent.trim()).join()==="Get started");
    await page.evaluate(()=>document.getElementById("eg-close").click());await page.waitForTimeout(500);
    await page.evaluate(()=>openUnit(data().u.findIndex(u=>u[0]==="Mixing mortar"),"write"));await page.waitForTimeout(900);
    fr.write=await page.evaluate(()=>{const sh=document.querySelector(".eg-sheet");return !!sh&&!!sh.querySelector("#write")&&/THINGS TO MENTION/.test(sh.querySelector(".fr-mention").textContent)&&!sh.querySelector(".eg-pill")&&sh.querySelector(".eg-actions .primary").disabled});
    await page.fill("#write","Mixed a batch of mortar at 1 to 5.");await page.waitForTimeout(300);
    await page.click("#eg-close");await page.waitForTimeout(700);
    fr.progress=await page.evaluate(()=>/IN PROGRESS/.test(document.getElementById("screen").textContent)&&/Mixed a batch/.test(document.querySelector(".fr-progress-text").textContent)&&document.getElementById("submit-evidence").disabled);
    await page.evaluate(()=>openUnit(data().u.findIndex(u=>u[0]==="Mixing mortar"),"write"));await page.waitForTimeout(900);
    fr.openAt=await page.evaluate(()=>document.getElementById("write").value==="Mixed a batch of mortar at 1 to 5.");
    await page.evaluate(()=>{const w=document.getElementById("write");w.value="";w.dispatchEvent(new Event("input"));document.getElementById("eg-close").click()});await page.waitForTimeout(600);
    fr.cleared=await page.evaluate(()=>!document.querySelector(".fr-progress"));
    check("Free range mode: in Evia's sheets like the guide, with every prompt listed at once; work in progress shows on the unit page",Object.values(fr).every(Boolean),JSON.stringify(fr));
    await page.evaluate(()=>openUnit(data().u.findIndex(u=>u[0]==="Mixing mortar"),"write"));await page.waitForTimeout(900);
    check("The evidence pack has no Continue later button and a check-my-writing icon in the text box",await page.evaluate(()=>!document.getElementById("continue-later")&&!!document.querySelector(".wc-field #write + .wc-btn")));
    await page.evaluate(()=>{nav("course")});await page.waitForTimeout(450);await page.evaluate(()=>openUnit(3,"write"));await page.waitForTimeout(900);
    check("An evidence pack opens",await page.$("#write"));
    await page.fill("#write","i laid the morter on the dpc and checked it was plum");await page.click(".wc-btn");await page.click(".wc-all");
    check("Check my writing fixes spelling, capitals and punctuation",await page.inputValue("#write")==="I laid the mortar on the DPC and checked it was plumb.");

    await page.evaluate(()=>window.eviaOpenSendToPortfolio(data().u[2][0]));await page.waitForTimeout(3500);
    check("Send to e-portfolio shows a PDF preview, Save PDF and the zip",await page.evaluate(()=>!!document.getElementById("eport-preview")&&!!document.getElementById("eport-save")&&/1 photo, just in case/.test(document.getElementById("eport-zip").innerText)));

    await page.evaluate(()=>nav("home"));await page.waitForTimeout(450);
    await page.evaluate(()=>window.chat());
    await page.waitForFunction(()=>{const c=document.getElementById("chat");return c&&!c.querySelector(".evia-thinking")},null,{timeout:15000});
    await page.waitForSelector("#chat .ui-action",{timeout:15000});
    check("Evia opens with a catch-up and her four actions",await page.evaluate(()=>{const t=[...document.querySelectorAll("#chat .ui-action")].map(b=>b.innerText.trim());return t.join().replace(/\d+$/,"").replace(/review\d+,/,"review,")==="Evidence check,Get ready for review,Show targets,EPA mocks"&&/learning hours|of learning/i.test(document.getElementById("chat").innerText)&&!document.querySelector(".chat-sheet .ui-ask")}));
    await page.click('#chat .ui-action[data-action="evidence"]');
    await page.waitForFunction(()=>[...document.querySelectorAll("#chat .ui-replies button")].length>=2,null,{timeout:15000});
    await page.evaluate(()=>document.querySelector("#chat .ui-replies button").click());
    await page.waitForFunction(()=>!!document.querySelector("#chat .ev-check")&&[...document.querySelectorAll("#chat .ui-replies button")].some(b=>/Add photos/.test(b.textContent)),null,{timeout:15000});
    check("Evidence check rates a piece of evidence, lists what's still to mention and offers ways to fix it",await page.evaluate(()=>{const t=[...document.querySelectorAll("#chat .ui-replies button")].map(b=>b.textContent);return /Weak|Good|Strong/.test(document.querySelector("#chat .ev-check").textContent)&&["Add photos","Improve my write-up","Let Evia guide me","Check another"].every(x=>t.includes(x))}));
    await page.evaluate(()=>[...document.querySelectorAll("#chat .ui-replies button")].find(b=>b.textContent==="Something else").click());
    await page.waitForSelector('#chat .ui-actions .ui-action[data-action="prep"]',{timeout:15000});await page.click('#chat .ui-actions .ui-action[data-action="prep"]');
    await page.waitForSelector("#chat .qr.prep",{timeout:15000});await page.waitForFunction(()=>[...document.querySelectorAll("#chat .ui-replies button")].some(b=>b.textContent==="Skip for now"),null,{timeout:15000});
    const prep1=await page.evaluate(()=>({rows:document.querySelectorAll("#chat .qr.prep .qr-row").length,btns:[...document.querySelectorAll("#chat .ui-replies button")].map(b=>b.textContent),text:document.getElementById("chat").innerText}));
    check("Get ready for my review lists every area and their comments, then offers one thing at a time",prep1.rows>=7&&prep1.btns.includes("Skip for now")&&/One at a time/.test(prep1.text),JSON.stringify(prep1.btns));
    for(let i=0;i<8;i++){const b=await page.evaluate(()=>[...document.querySelectorAll("#chat .ui-replies button")].map(x=>x.textContent));if(!b.includes("Skip for now"))break;const n0=await page.evaluate(()=>document.querySelectorAll("#chat .ui-replies").length);await page.evaluate(()=>[...document.querySelectorAll("#chat .ui-replies button")].find(x=>x.textContent==="Skip for now").click());await page.waitForFunction(n=>document.querySelectorAll("#chat .ui-replies button").length&&[...document.querySelectorAll("#chat .ui-replies button")].every(b=>!b.disabled)&&document.querySelectorAll("#chat .ui-replies").length>=1,n0,{timeout:15000});await page.waitForTimeout(1500)}
    const endBtns=await page.evaluate(()=>[...document.querySelectorAll("#chat .ui-replies button")].map(b=>b.textContent));
    await page.waitForTimeout(2500);const endTxt=await page.evaluate(()=>document.getElementById("chat").innerText);
    check("…skipping moves on to the end: their comments for the assessor, or ready if they're in",(await page.evaluate(()=>[...document.querySelectorAll("#chat .ui-replies button")].some(b=>b.textContent==="Add my comments")))||/You’re ready for your review/.test(endTxt),JSON.stringify(endBtns)+" "+(await page.evaluate(()=>document.getElementById("chat").innerText.slice(-400))));
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
    await page.evaluate(()=>window.eviaTeach.open("edi"));await page.waitForTimeout(400);
    check("A safeguarding lead saved in Profile shows on the Who to talk to card, under the EDI and safeguarding lessons",await page.evaluate(()=>/Jo Smith/.test(document.querySelector(".tm .sc-contacts").innerText)&&!!document.querySelector('.tm .sc-contacts a[href="tel:01234567890"]')));
    await page.evaluate(()=>{const x=document.querySelector(".tm .tm-x");if(x)x.click()});await page.waitForTimeout(300);
    // My progress: the Teach me tile (average score, areas completed, medals) and its deep dive; no real-life scenarios.
    await page.evaluate(()=>nav("learning"));await page.waitForTimeout(700);
    const tt=await page.evaluate(()=>{const c=document.getElementById("pv-teach");return {tile:!!c&&c.querySelectorAll(".pv-medal").length===3&&/areas completed|Finish a lesson/.test(c.textContent),noScenarios:!document.getElementById("pv-scen")&&!window.eviaScenarios}});
    await page.evaluate(()=>document.getElementById("pv-teach").click());await page.waitForTimeout(700);
    tt.deep=await page.evaluate(()=>{const t=document.querySelector(".pv-sheet");return !!t&&/medal/.test(t.textContent)&&/EDI and safeguarding/.test(t.textContent)&&document.querySelectorAll(".pv-sheet .pv-teach-h").length>=2});
    await page.evaluate(()=>{document.getElementById("modal-root").innerHTML=""});
    check("My progress: Teach me tile with average score, areas and medals, a deep dive by subject, and no old scenarios",Object.values(tt).every(Boolean),JSON.stringify(tt));
    await page.evaluate(()=>{document.getElementById("modal-root").innerHTML=""});

    await page.evaluate(()=>{document.body.classList.add("evia-onboarding");nav("progress")});await page.waitForTimeout(200);
    check("The first-run demo can point at the KSB card on My progress",!!await page.$("#pv-ksb"));
    await page.evaluate(()=>nav("course"));await page.waitForTimeout(200);
    check("My course has Learning logs under the units, for the demo to point at (reviews moved to My progress)",await page.evaluate(()=>{const g=document.getElementById("ui-logs-grid");return !!g&&g.querySelectorAll(".ui-log-tile").length===1&&!document.getElementById("ui-open-reviews")&&!!g.previousElementSibling}));
    await page.evaluate(()=>{document.body.classList.remove("evia-onboarding");nav("home")});await page.waitForTimeout(450);

    await page.evaluate(()=>window.eviaStartReview());await page.waitForTimeout(400);
    /* An hours target counts hours logged from the day it was set, including ones logged earlier that day. */
    const tgt=await page.evaluate(()=>{const T=window.eviaTargets,t={id:"tx",kind:"otj",target:10,baseline:999,createdAt:Date.now(),title:"Log 10 learning hours"};
      window.eviaData.put("hours",{minutes:120,description:"Earlier today",createdAt:Date.now()-60000});const p=T.progress(t,T.stats());return {pct:Math.round(p.pct*100),text:p.text}});
    check("An hours target counts hours logged from the day it was set",tgt.pct>=20&&/logged since/.test(tgt.text),JSON.stringify(tgt));
    let checkIn=false,improve=false,signPads=-1;
    for(let i=0;i<12;i++){const t=await page.evaluate(()=>document.getElementById("rv-next").textContent);
      if(await page.evaluate(()=>document.getElementById("rv-title").textContent==="Sign off"))signPads=await page.$$eval("#rv-body [data-sign]",x=>x.length);
      if(await page.evaluate(()=>document.getElementById("rv-title").textContent==="How things are")){checkIn=(await page.$$("#rv-body select[data-reflect]")).length===5;await page.selectOption('select[data-reflect="feelsSafe"]',"Yes");await page.selectOption('select[data-reflect="hsIncident"]',"No")}
      await page.click("#rv-next");await page.waitForTimeout(200);if(t==="Save review")break}
    check("Evia's review sign-off has no employer or assessor signatures (they sign in Milos)",signPads<=0,String(signPads));
    check("Evia's review asks the check-in the assessor's review uses (safe, who to tell, changes, health and safety, training time)",checkIn&&await page.evaluate(()=>{const r=window.eviaData.list("reviews").map(x=>x.detail).pop();return r&&r.reflection&&r.reflection.feelsSafe==="Yes"&&r.reflection.hsIncident==="No"}));
    check("The review ends with a sign-off step for employer and tutor",await page.evaluate(()=>true)&&!!(await page.evaluate(()=>{const r=JSON.parse(localStorage.getItem("evia7-progress-reviews")||"[]").pop();return r&&r.format===2})));
    await page.waitForSelector("#rvp-save",{timeout:20000}).catch(()=>{});
    check("Saving a review offers the two-page review PDF to share and sign",await page.evaluate(()=>!!document.getElementById("rvp-save")&&/2 pages/.test(document.querySelector(".eport-status").textContent)));
    await page.evaluate(()=>{document.getElementById("modal-root").innerHTML=""});
    check("A full review clicks through and replaces the targets",await page.evaluate(()=>{const r=JSON.parse(localStorage.getItem("evia7-progress-reviews")||"[]").pop();return r&&r.format===2&&window.eviaTargets.mine().every(t=>t.reviewId===r.id)}));
    await page.evaluate(()=>window.eviaSetShape("gear"));
    check("Outline Evia shapes draw on the Evia button",await page.$("#evia-fab .evia-outline"));
    await page.evaluate(()=>window.eviaSetShape("circle"));

    // Trowel Occupations L3 (NVQ): packs and questions by unit, shared answers, witness testimony.
    // Per-trade packs: a bricklayer's phone has only the bricklaying test bank and no NVQ; picking the NVQ downloads it.
    const own=await page.evaluate(()=>({nvqOff:!window.EVIA_NVQ&&!C.trowel3&&!window.eviaNvq,banks:Object.keys(EPA_QUESTIONS).join()+"/"+Object.keys(EPA_DISCUSSIONS).join(),
      listed:window.eviaPacks.catalogue().map(c=>c.id).join()}));
    await page.evaluate(async()=>{window.eviaData.put("learner",{course:"trowel3"});for(let i=0;i<50&&course!=="trowel3";i++)await new Promise(r=>setTimeout(r,100));nav("course")});await page.waitForTimeout(450);
    const nvqIn=await page.evaluate(()=>course==="trowel3"&&!!C.trowel3&&!!window.eviaNvq&&(window.eviaLearnerPrompts.trowel3||{}).Arches!=null);
    check("Per-trade packs: no NVQ or other trades' test banks on a bricklayer's phone, every course still listed, and switching to the NVQ downloads it",
      own.nvqOff&&own.banks==="bricklaying/bricklaying"&&own.listed==="bricklayer,site,joiner,trowel3"&&nvqIn,JSON.stringify(own)+" nvqIn="+nvqIn);
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
    check("The OTJ log downloads as a PDF with a preview",await page.evaluate(()=>!!document.getElementById("eport-preview")&&/Learning hours PDF/.test(document.querySelector(".eport-status").textContent)));
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
    const stHow=await page.evaluate(()=>!document.getElementById("st-meter")&&!!document.getElementById("st-how"));
    await page.evaluate(()=>openUnit(0,"write"));await page.waitForTimeout(700);
    check("The evidence pack shows no score, just a link to how to build a strong portfolio",stHow&&await page.evaluate(()=>!document.getElementById("st-meter")&&document.querySelectorAll(".eg-sheet .fr-mention .compact-prompts").length===1));
    await page.evaluate(()=>{const w=document.getElementById("write");w.value="";w.dispatchEvent(new Event("input"));nav("learning")});await page.waitForTimeout(600);
    await page.evaluate(()=>{window._camSupported=window.eviaCamera.supported;window.eviaCamera.supported=()=>false;document.getElementById("pv-guide").click()});await page.waitForTimeout(400);
    check("My progress explains how to build a strong portfolio",await page.evaluate(()=>/strong portfolio/.test(document.getElementById("st-title").textContent)&&document.querySelectorAll(".st-tip").length===8));
    await page.evaluate(()=>{document.getElementById("modal-root").innerHTML=""});

    // Guided evidence: Evia asks a question for each thing to mention and puts the answers together as the statement.
    await page.evaluate(()=>{course="bricklayer";persist();openUnit(data().u.findIndex(u=>u[0]==="Cavity opening"))});await page.waitForTimeout(700);
    await page.evaluate(()=>document.getElementById("eg-start").click());await page.waitForTimeout(300);
    // The first sheet has one full-width Get started; with no camera it goes straight to the questions.
    const oneStart=await page.evaluate(()=>{const b=[...document.querySelectorAll(".eg-sheet .eg-actions button")];return b.length===1&&b[0].textContent.trim()==="Get started"&&!!b[0].closest(".eg-wide")});
    await page.evaluate(()=>document.querySelector(".eg-sheet .eg-actions button").click());await page.waitForTimeout(300);
    const q1=await page.evaluate(()=>document.querySelector(".eg-q").textContent+" "+[...document.querySelectorAll(".eg-pill")].map(b=>b.textContent).join(" · "));
    const pick=async(k,text)=>{await page.evaluate(k=>document.querySelectorAll(".eg-pill")[k].click(),k);await page.waitForTimeout(250);
      await page.evaluate(t=>{document.getElementById("eg-text").value=t;[...document.querySelectorAll(".eg-sheet button")].find(b=>/^Done$/.test(b.textContent)).click()},text);await page.waitForTimeout(250)};
    const btn=async re=>{await page.evaluate(src=>{const re=new RegExp(src);const b=[...document.querySelectorAll(".eg-sheet button")].find(b=>re.test(b.textContent.trim()));if(b)b.click()},re);await page.waitForTimeout(250)};
    await pick(0,"I fitted the cavity closer at the reveal.");
    const ticked=await page.evaluate(()=>document.querySelectorAll(".eg-pill")[0].classList.contains("done"));
    await btn("^(Next|Finish)$");
    await pick(0,"The ties go in at 450 centres.");
    // Stop half-way, come back: Evia picks up at the same question.
    await page.evaluate(()=>document.getElementById("eg-close").click());await page.waitForTimeout(400);
    await page.evaluate(()=>document.getElementById("eg-start").click());await page.waitForTimeout(300);
    const back=await page.evaluate(()=>/Welcome back/.test(document.querySelector(".eg-say").textContent));
    await btn("Carry on from there");
    const at2=await page.evaluate(()=>/QUESTION 2 OF/.test(document.querySelector(".eg-sheet .chat-kicker").textContent)&&document.querySelectorAll(".eg-pill.done").length===1);
    for(let i=0;i<12;i++){const more=await page.evaluate(()=>{const b=[...document.querySelectorAll(".eg-sheet button")].find(b=>/^(Next|Finish)$/.test(b.textContent.trim()));if(b){b.click();return true}return false});if(!more)break;await page.waitForTimeout(200)}
    await btn("Use this statement");await page.evaluate(()=>{window.eviaCamera.supported=window._camSupported});await page.waitForTimeout(500);
    check("Evia guides a pack through the stages of the job with topic pills, then the answers become the statement",/step by step/i.test(q1)&&/cavity closure/i.test(q1)&&ticked&&await page.evaluate(()=>document.getElementById("write").value==="I fitted the cavity closer at the reveal.\n\nThe ties go in at 450 centres."));
    check("Guided evidence carries on where the learner left off, and starts with one Get started button",back&&at2&&oneStart);
    await page.evaluate(()=>{const w=document.getElementById("write");w.value="";w.dispatchEvent(new Event("input"))});

    // Teach me: the tile, a lesson played through, and Evia's view in the confidence check.
    await page.evaluate(()=>{course="bricklayer";persist();document.getElementById("modal-root").innerHTML="";nav("course")});await page.waitForTimeout(500);
    await page.evaluate(()=>{window.chat({quiet:true});setTimeout(()=>window.eviaCoachFlows.upskill(),200)});await page.waitForTimeout(2500);
    const upskillHasTeach=await page.evaluate(()=>[...document.querySelectorAll(".ui-replies button")].some(b=>/Teach me/.test(b.textContent)));
    await page.evaluate(()=>{document.getElementById("modal-root").innerHTML="";nav("teach")});await page.waitForTimeout(600);
    check("Teach me is a tab with the course, maths, English and EDI, and it's no longer in Upskill me",!upskillHasTeach&&await page.evaluate(()=>{const t=[...document.querySelectorAll("[data-go] strong")].map(b=>b.textContent);return t.join()==="Bricklayer,Maths,English,EDI and safeguarding"&&!document.querySelector(".tm-tile")}));
    check("EDI opens from Teach me with its lessons, and Up next goes straight into a lesson",await page.evaluate(async()=>{const w=t=>new Promise(r=>setTimeout(r,t));
      document.querySelector('[data-go="edi"]').click();await w(400);const edi=!!document.querySelector('[data-lesson="edi-what"]')&&/EDI/.test(document.querySelector(".tm-bar").textContent);
      document.querySelector(".tm-x").click();await w(400);nav("teach");await w(300);document.querySelector("[data-play]").click();await w(500);
      const inLesson=!!document.querySelector(".tm")&&!document.querySelector(".tm-path");document.querySelector(".tm-x").click();await w(300);const x=document.querySelector(".tm-x");if(x)x.click();await w(300);nav("teach");await w(300);return edi&&inLesson}));
    await page.evaluate(()=>document.querySelector('[data-go="course"]').click());await page.waitForTimeout(600);
    // Rewards: free starters, locked items, and buying everything directly (no loot boxes).
    await page.evaluate(()=>{const x=document.querySelector(".tm-x");if(x)x.click()});await page.waitForTimeout(300);
    const rw=await page.evaluate(async()=>{
      const w=ms=>new Promise(r=>setTimeout(r,ms)),R=window.eviaRewards,out={};
      const keep=localStorage.getItem("evia7-rewards"),rnd=Math.random;
      localStorage.setItem("evia7-rewards",JSON.stringify({bank:1000,spent:0,owned:[],hat:"",pity:0,seenAch:[],lastXp:0,day:""}));
      out.free=!R.locked("shape","cloud")&&!R.locked("colour","green")&&R.locked("shape","gear")==="epic"&&R.locked("colour","orange")==="common";
      nav("rewards");await w(500);
      out.page=!!document.getElementById("rw-page")&&document.querySelectorAll(".rw-item").length===16&&!document.getElementById("rw-open")&&/400/.test(document.querySelector('#rw-hat-glow [data-buy]').textContent);
      document.querySelector('[data-buy="hat-blue"]').click();await w(300);
      out.bought=JSON.parse(localStorage.getItem("evia7-rewards")).owned.includes("hat-blue")&&!!document.querySelector("#evia-fab .evia-kit");
      document.querySelectorAll(".rw-over").forEach(o=>o.remove());
      /* A legendary is bought like anything else, and free boxes saved from before are paid out as coins. */
      document.querySelector('[data-buy="hat-glow"]').click();await w(300);document.querySelectorAll(".rw-over").forEach(o=>o.remove());
      const s1=JSON.parse(localStorage.getItem("evia7-rewards"));out.legendary=s1.owned.includes("hat-glow")&&s1.spent===430;
      s1.freeBox=2;localStorage.setItem("evia7-rewards",JSON.stringify(s1));const b0=s1.bank;R.sync();
      const s2=JSON.parse(localStorage.getItem("evia7-rewards"));out.freeBoxPaid=!s2.freeBox&&s2.bank>=b0+120;
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
      out.faces=document.querySelectorAll(".rw-item").length===12&&!!document.querySelector('#rw-expr-hearts [data-buy]');
      document.querySelector('[data-use="expr-wink"]').click();await w(200);
      out.expr=document.documentElement.getAttribute("data-evia-expr")==="wink";
      document.querySelector('[data-use="expr-wink"]').click();await w(200);
      out.exprOff=!document.documentElement.hasAttribute("data-evia-expr");
      Math.random=rnd;if(keep)localStorage.setItem("evia7-rewards",keep);else localStorage.removeItem("evia7-rewards");R.wearOn();
      return out;
    });
    check("Rewards: three shapes and colours are free, others are locked by rarity, and there are no loot boxes (legendaries cost 400)",rw.free&&rw.page,JSON.stringify(rw));
    check("Buying a hard hat puts it on Evia",rw.bought);
    check("PPE: specs, ear defenders and hi-vis can be worn together on Evia, with a hard hat",rw.ppe,JSON.stringify(rw));
    check("A legendary can be bought directly, and free boxes saved from before are paid out as coins",rw.legendary&&rw.freeBoxPaid,JSON.stringify(rw));
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
    // Learner data (data.js): today's storage read in the new shape; hours written through it; sync sees changes.
    const dm=await page.evaluate(()=>{
      const D=window.eviaData,out={};
      const snap=D.snapshot();
      out.collections=D.COLLECTIONS.every(c=>Array.isArray(snap[c]));
      out.ids=!!snap.learnerId&&snap.evidence.length>0&&snap.evidence.every(e=>e.id&&e.learnerId===snap.learnerId&&e.v===1);
      out.evidence=snap.evidence.every(e=>/^\d{4}-\d\d-\d\dT/.test(e.createdAt||"")&&e.unitId&&e.unitId.startsWith(e.course+"/")&&Array.isArray(e.ksbs));
      out.ukDate=D.iso("05/03/2026, 14:30:00").startsWith("2026-03-05")&&D.iso(Date.UTC(2026,0,2))==="2026-01-02T00:00:00.000Z";
      const before=hours.length,id=D.put("hours",{minutes:95,description:"Data test: toolbox talk",source:"manual"});
      const got=D.get("hours",id),raw=hours.find(x=>x.id===id);
      out.hoursPut=hours.length===before+1&&got&&got.minutes===95&&got.source==="manual"&&raw.n===1.58&&raw.mins===95&&window.eviaHM(raw.n)==="1h:35m";
      D.put("hours",Object.assign({},got,{minutes:100}));out.hoursUpdate=hours.length===before+1&&D.get("hours",id).minutes===100;
      const ch=D.changesSince();out.syncAll=ch.some(c=>c.collection==="hours"&&c.record.id===id);
      D.markSynced(ch);out.syncQuiet=D.changesSince().length===0;
      D.remove("hours",id);const gone=D.changesSince();
      out.syncDelete=hours.length===before&&gone.length===1&&gone[0].record.id===id&&!!gone[0].record.deletedAt;
      D.markSynced(gone);localStorage.removeItem("evia7-data-synced");
      /* Every other write: new evidence (signature and name copied in), an edit, supporting details, an NVQ answer,
         a test with its questions, a lesson result, a confidence check and a scenario. Put back afterwards. */
      const keys=["evia7-supporting-evidence","evia7-nvq-answers","evia7-test-results","evia7-teach","evia7-confidence","evia7-scenarios"],kept={};keys.forEach(k=>kept[k]=localStorage.getItem(k));
      const p=JSON.parse(localStorage.getItem("evia7-profile")||"{}");
      const eid=D.put("evidence",{course,unit:data().u[0][0],text:"  Data test write-up  ",ksbs:["S1"],photoIds:["photo-x"]});
      const e=evidence.find(x=>x.id===eid);out.evNew=!!e&&e.w==="Data test write-up"&&e.u===data().u[0][0]&&e.photoCount===1&&e.signature===(p.signature||"")&&e.learnerProfile.name===(p.name||"");
      D.put("evidence",{id:eid,text:"Edited",ksbs:["S1","K2"]});const g=D.get("evidence",eid);out.evEdit=g.text==="Edited"&&g.ksbs.length===2&&g.updatedAt>=g.createdAt;
      D.remove("evidence",eid);out.evGone=!evidence.some(x=>x.id===eid);
      const sid=D.put("supporting",{title:"Witness statement",type:"document",mime:"application/pdf",filename:"w.pdf",size:10});
      D.put("supporting",{id:sid,witness:{name:"Sam Hill",role:"Supervisor"},nvqUnit:"641",criteria:["641.1.1"]});
      const sp=D.get("supporting",sid);out.supporting=sp.type==="witness"&&sp.witness.name==="Sam Hill"&&sp.nvqUnit==="641"&&sp.criteria[0]==="641.1.1";
      D.put("nvqAnswers",{questionId:"q-test",text:"Because the mortar needs time to cure"});out.nvq=D.get("nvqAnswers","q-test").text.startsWith("Because");
      D.put("nvqAnswers",{questionId:"q-test",text:""});out.nvqGone=!D.get("nvqAnswers","q-test");
      const tid=D.put("tests",{type:"discussion",score:2,total:3,pct:67,questions:[{prompt:"Why?"}]});const t=D.get("tests",tid);out.tests=t.pct===67&&t.questions.length===1&&!!t.takenAt;
      D.put("lessonResults",{course,lessonId:"zz-data",last:.6});D.put("lessonResults",{course,lessonId:"zz-data",last:.9});D.put("lessonResults",{course,lessonId:"zz-data",last:.5});
      const lr=D.get("lessonResults",course+":zz-data");out.lessons=lr.best===.9&&lr.last===.5&&lr.attempts===3;
      const cid=D.put("confidence",{course,scores:[{area:"Mixing",score:3}]});out.confidence=D.get("confidence",cid).scores[0].score===3;
      D.put("scenarios",{scenarioId:"sc-data",best:true});out.scenarios=D.get("scenarios","sc-data").best===true;
      /* Reviews and targets: one store for targets, replaced after a review; a sign-off added to a saved review. */
      ["evia7-progress-reviews","evia7-review-targets"].forEach(k=>{keys.push(k);kept[k]=localStorage.getItem(k)});
      D.replace("targets",{course},[{id:"t-a",kind:"otj",title:"Log 6 hours",why:"x",target:6,due:"2030-01-01",createdAt:Date.now(),done:false},{id:"t-b",kind:"units",title:"Two units",why:"y",target:2,due:"2030-01-01",createdAt:Date.now(),done:false}]);
      out.targets=D.list("targets",{course,store:"review-targets"}).length===2&&window.eviaTargets.mine().length===2;
      D.put("targets",{id:"t-a",done:true,doneAt:Date.now()});out.targetDone=D.get("targets","t-a").metAt!==null&&window.eviaTargets.mine().find(t=>t.id==="t-a").done===true;
      const rid=D.put("reviews",{id:"review-data",course,date:new Date().toISOString(),format:2,snapshot:{},targets:[{id:"t-a"}],reflection:{good:"Laying to the line"}});
      D.put("reviews",{id:rid,signoff:{tutor:{name:"Jo Tutor",sig:"data:x",date:new Date().toISOString()}}});
      const rv=D.get("reviews",rid);out.reviews=rv.targetIds[0]==="t-a"&&rv.signedBy.tutor.name==="Jo Tutor"&&rv.signedBy.tutor.signed===true&&rv.reflection.good==="Laying to the line";
      out.oldReviewGone=typeof window.eviaProgressReview==="undefined"&&typeof window.eviaGetTargets==="undefined";
      /* Course packs: stable unit ids, the pack format, and evidence keeping its unit id. */
      const pk=window.eviaPacks.pack(course);
      out.pack=!!pk&&pk.units.length===data().u.length&&pk.units.every(u=>u.id&&u.id.startsWith(course+"/")&&u.ksbs.every(k=>k.code))&&pk.lessons.length>0;
      out.unitIds=window.eviaPacks.unitId("bricklayer","Set out Cavity Walling")==="bricklayer/set-out-cavity-walling"&&window.eviaPacks.unitId("bricklayer","A brand new unit")==="bricklayer/a-brand-new-unit";
      const eid2=D.put("evidence",{course,unit:data().u[1][0],text:"x",ksbs:[]});out.evUnitId=evidence.find(x=>x.id===eid2).uid===window.eviaPacks.unitId(course,data().u[1][0]);D.remove("evidence",eid2);
      /* The learner's details and course, and rewards (coins and items, XP and the streak). */
      ["evia7-profile","evia7-rewards","evia7-teach"].forEach(k=>{keys.push(k);kept[k]=localStorage.getItem(k)});
      const was=course,other=Object.keys(C).find(k=>k!==was);
      D.put("learner",{name:"Data Test",mathsEnabled:true,nvqOptional:["641"]});
      const L1=D.get("learner","learner");out.learner=L1.name==="Data Test"&&L1.mathsEnabled===true&&L1.nvqOptional[0]==="641"&&!!L1.updatedAt;
      D.put("learner",{course:other});out.courseSwitch=course===other&&localStorage.getItem("evia7-course")===other&&D.get("learner","learner").course===other;
      D.put("learner",{course:was});out.courseBack=course===was;
      const st=JSON.parse(localStorage.getItem("evia7-rewards")||"{}");D.put("rewards",{state:Object.assign({},st,{bank:(st.bank||0)+5})});
      D.put("rewards",{me:{xp:123,days:{},streak:4,last:"2026-01-01"}});
      const rw=D.get("rewards","rewards");out.rewards=rw.earned===(st.bank||0)+5&&rw.xp===123&&rw.streak===4&&!!rw.updatedAt;
      keys.forEach(k=>{if(kept[k]==null)localStorage.removeItem(k);else localStorage.setItem(k,kept[k])});
      return out;
    });
    check("Learner data: every record in the new shape (ids, learner id, ISO dates, unit ids), hours, evidence, supporting evidence, NVQ answers, tests, lessons, confidence, scenarios, reviews, targets, the learner and rewards written through eviaData, and sync sees changes and deletions",Object.values(dm).every(Boolean),JSON.stringify(dm));
    // Course packs: only the learner's own trade's lessons load; switching course fetches the new pack.
    const pk=await page.evaluate(async()=>{
      const w=ms=>new Promise(r=>setTimeout(r,ms)),P=window.eviaPacks,was=course,out={};
      const onPage=c=>P.files(c).every(f=>[...document.scripts].some(s=>s.src&&s.src.includes(f.split("?")[0])));
      out.ownLoaded=onPage(was)&&P.loaded(was);
      const other=P.COURSES.find(c=>c!==was&&!P.loaded(c));out.otherNotLoaded=!!other&&!(window.EVIA_TEACH.courses[other]||[]).length;
      window.eviaData.put("learner",{course:other});
      for(let i=0;i<40&&!P.loaded(other);i++)await w(100);await w(200);
      out.switched=P.loaded(other)&&(window.EVIA_TEACH.courses[other]||[]).length>0&&window.eviaTeach.COURSES[other].length>0;
      window.eviaData.put("learner",{course:was});await w(200);
      return out;
    });
    check("Course packs: only the learner's own trade loads, and switching course fetches the new one",Object.values(pk).every(Boolean),JSON.stringify(pk));
    // Problem log: script errors are kept on the phone, counted once each, shown in Profile and synced.
    const pl=await page.evaluate(async()=>{
      const w=ms=>new Promise(r=>setTimeout(r,ms)),E=window.eviaErrors,out={};
      const hidden=E.list().filter(x=>x.kind!=="reported");out.noneSoFar=!hidden.length;out.hidden=hidden.map(x=>x.message).join(" | ");if(!hidden.length)delete out.hidden;
      const fire=()=>window.dispatchEvent(new ErrorEvent("error",{message:"Smoke test problem",filename:"https://x/app.js?v=1",lineno:12,colno:3,error:new Error("Smoke test problem")}));
      fire();fire();
      const mine=E.list().find(x=>x.message==="Smoke test problem");
      out.logged=!!mine&&mine.count===2&&mine.where==="app.js:12:3"&&/^evia7-v\d+$/.test(mine.version);
      out.synced=window.eviaData.changesSince().some(c=>c.collection==="errors"&&c.record.message==="Smoke test problem");
      document.getElementById("profile-btn").click();await w(150);
      const row=document.getElementById("open-problems");out.row=!!row&&/recorded/.test(row.textContent);
      row.click();await w(150);
      out.sheet=/Smoke test problem/.test(document.querySelector(".pf-problems").textContent)&&!!document.getElementById("pl-send");
      document.getElementById("pl-clear").click();await w(100);
      out.cleared=!E.list().length&&/Nothing has gone wrong/.test(document.querySelector(".pf-problems").textContent);
      document.getElementById("pl-close").click();await w(600);
      const pc=document.getElementById("profile-close");out.back=!!pc||document.getElementById("modal-root").innerHTML.slice(0,300);if(pc)pc.click();await w(100);
      return out;
    });
    check("Problem log: no hidden script problems, errors are counted once each, shown in Profile to send to a tutor, and synced",Object.values(pl).every(v=>v===true),JSON.stringify(pl));
    // Mini games: locked until unlocked in Rewards, played from Teach me, small coins with a daily cap.
    const gm=await page.evaluate(async()=>{
      const w=ms=>new Promise(r=>setTimeout(r,ms)),R=window.eviaRewards,G=window.eviaGames,out={},keep=localStorage.getItem("evia7-rewards");
      localStorage.setItem("evia7-rewards",JSON.stringify({bank:500,spent:0,owned:[],hat:"",pity:0,seenAch:[],lastXp:1e9,day:"",workV:1,paid:{}}));
      nav("teach");await w(500);
      out.locked=document.querySelectorAll(".tt-game.locked").length===3;
      /* The Teach me card shows medals, the streak and coins: no XP or levels. */
      out.medals=!!document.querySelector(".tg-player .tg-medals")&&!/\bXP\b|Level \d/.test(document.querySelector(".tg-player").textContent);
      /* The camera always carries the photo-consent line (opened without a real camera, then closed). */
      if(window.eviaCamera&&window.eviaCamera.open){window.eviaCamera.open({title:"Test",prompts:[],onDone(){}});await w(300);out.consent=/not people/.test((document.querySelector(".cam-consent")||{}).textContent||"");const cx=document.querySelector("[data-cam-close]");if(cx)cx.click();await w(300);document.querySelectorAll(".cam").forEach(c=>c.remove());document.body.classList.remove("cam-open")}
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
    check("Teach me card shows medals (no XP or levels); the camera reminds learners not to photograph people. Mini games: locked until bought in Rewards, then Brickle, the crossword and Flappy Evia play from Teach me (Site Run and Site Quest are parked) and pay capped coins",Object.values(gm).every(Boolean),JSON.stringify(gm));
    check("Expressions: twelve faces, all bought directly; using one shows it on Evia, and tapping again goes back to classic",rw.faces&&rw.expr&&rw.exprOff,JSON.stringify(rw));
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

    // Teach me has every unit for every course (each course pack loaded first), and maths and English by area.
    const allUnits=await page.evaluate(async()=>{const w=ms=>new Promise(r=>setTimeout(r,ms)),out={},was=course;
      for(const c of ["bricklayer","joiner","site","trowel3"]){await window.eviaPacks.ensure(c);course=c;window.eviaTeach.open("course");await w(80);out[c]=document.querySelectorAll(".tm-unit").length;document.querySelector(".tm-x").click();await w(220)}
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

    // A Trowel L3 learner opening Evia: the NVQ loads before the first screen, with no problems logged.
    await page.evaluate(async()=>{window.eviaData.put("learner",{course:"trowel3"});for(let i=0;i<50&&course!=="trowel3";i++)await new Promise(r=>setTimeout(r,100));
      window.eviaErrors.clear();if(window.eviaStorage.flush)await window.eviaStorage.flush()});
    await page.reload();await page.waitForTimeout(2500);
    const tb=await page.evaluate(()=>({course,nvq:!!window.eviaNvq,groups:document.querySelectorAll(".nvq-group").length,problems:window.eviaErrors.list().filter(x=>x.kind!=="reported").map(x=>x.message)}));
    check("A Trowel L3 learner opens straight onto the NVQ course, with nothing going wrong",tb.course==="trowel3"&&tb.nvq&&tb.groups>=4&&!tb.problems.length,JSON.stringify(tb));

    // First run: join the college with the tutor's code (and agree what's shared), a Teach me style welcome with a
    // quick question, the PPE induction on a real evidence page with the real guided mode (saved to Supporting evidence,
    // linked to its KSBs), then a short tap-through tour ending in the profile.
    {
      const c2=await browser.newContext({...devices["Pixel 7"],serviceWorkers:"block"}),p2=await c2.newPage(),e2=[];p2.on("pageerror",e=>e2.push(e.message));
      await p2.goto(url+"manifest.json");
      await p2.evaluate(()=>{localStorage.clear();sessionStorage.setItem("evia7-install-later","1");["evia7-theme-picked","evia7-shape-picked"].forEach(k=>localStorage.setItem(k,"1"))});
      await p2.goto(url+"?demo");await p2.waitForTimeout(2500);
      const ob={},go=async(n,wait)=>{await p2.click('#ob-lesson [data-ob="'+(n||0)+'"]');await p2.waitForTimeout(wait||600)};
      ob.join=await p2.evaluate(()=>/Connect to your college/.test((document.getElementById("ob-lesson")||{}).textContent||"")&&document.querySelector('#ob-lesson [data-ob="0"]').disabled&&!document.getElementById("ob-name"));
      await p2.fill("#ob-code","abc1234");await go();
      ob.badCode=await p2.evaluate(()=>/didn’t work|couldn’t reach/.test(document.getElementById("ob-err").textContent));
      await p2.fill("#ob-code","brk 7q4m");ob.formatted=await p2.inputValue("#ob-code")==="BRK-7Q4M";await go(0,800);
      ob.isThisYou=await p2.evaluate(()=>{const t=document.getElementById("ob-lesson").textContent;return /Is this you/.test(t)&&/Callum Hughes/.test(t)&&/Hughes & Sons Builders/.test(t)&&/Mark Ellis/.test(t)&&/Everything you add to Evia goes to Brookfield College/.test(t)&&!/won’t see/.test(t)});
      await go(1,1800);
      ob.joined=await p2.evaluate(()=>{const e=window.eviaData.enrolment(),L=window.eviaData.learner();return e.course==="bricklayer"&&e.college==="Brookfield College"&&course==="bricklayer"&&L.name==="Callum Hughes"&&L.start==="2025-09-01"&&L.safeguarding.name==="Sarah Mitchell"&&window.eviaData.learnerId()==="nisia-demo-callum"&&/Hi Callum/.test(document.getElementById("ob-lesson").textContent)});
      await go();await go();
      await p2.click('.tm-opt[data-k="0"]');await go(0,400);
      ob.quiz=await p2.evaluate(()=>/Spot on/.test(document.querySelector("#ob-lesson .tm-fb").textContent));
      await go();
      // The camera, standing in: one photo for each thing Evia asks for.
      await p2.evaluate(()=>{const c=document.createElement("canvas");c.width=60;c.height=80;const x=c.getContext("2d");x.fillStyle="#c77";x.fillRect(0,0,60,80);
        window.eviaCamera.supported=()=>true;window.eviaCamera.open=o=>{c.toBlob(bl=>{const f=new File([bl],"p.jpg",{type:"image/jpeg"});(o.guide||[]).forEach(()=>o.onShot&&o.onShot(f));o.onDone([],{finished:true})},"image/jpeg")}});
      await go(0,900);
      ob.realPage=await p2.evaluate(()=>!!document.querySelector("#screen .evidence-pack-page .ev-modes #eg-start")&&document.querySelector(".evia-guide-target").id==="eg-start"&&!!document.querySelector(".ob-card"));
      const eg=async(sel,wait)=>{await p2.click("#modal-root "+sel);await p2.waitForTimeout(wait||600)};
      await p2.click("#eg-start");await p2.waitForTimeout(700);
      ob.realGuide=await p2.evaluate(()=>/GUIDED EVIDENCE/.test(document.querySelector("#modal-root .eg-sheet").textContent)&&!document.body.classList.contains("ob-lock"));
      await eg('[data-eg="0"]',1000);await eg('[data-eg="0"]');
      await eg('[data-topic="0"]');await p2.fill("#eg-text","My hard hat protects my head from falling objects.");await eg('[data-eg="0"]');await eg('[data-eg="0"]');
      await eg('[data-topic="1"]');await p2.fill("#eg-text","I check it for cracks every morning.");await eg('[data-eg="0"]');await eg('[data-eg="0"]');
      await eg('[data-eg="0"]',1200);
      ob.inProgress=await p2.evaluate(()=>document.querySelectorAll("#evidence-photos img").length===3&&document.querySelector(".evia-guide-target").id==="ob-ppe-save");
      await p2.click("#ob-ppe-save");await p2.waitForTimeout(3000);
      Object.assign(ob,await p2.evaluate(()=>{const s=window.eviaData.list("supporting");return {
        supporting:s.length===1&&s[0].title==="PPE induction"&&s[0].mime==="application/pdf"&&s[0].induction&&s[0].criteria.join()==="K2,S2",notUnitEvidence:!evidence.length,
        shownWhere:!!document.querySelector("[data-supporting-evidence].evia-guide-target")}}));
      let steps=0;
      for(let i=0;i<16;i++){
        const st=await p2.evaluate(()=>{const c=document.querySelector(".ob-card");if(document.querySelector(".profile-sheet.ob-profile"))return "profile";if(!c)return "none";const n=c.querySelector(".ob-next");if(n){n.click();return "next"}const t=document.querySelector(".evia-guide-target");if(t){t.click();return "tap"}return "stuck"});
        if(st==="profile"||st==="none"||st==="stuck")break;steps++;await p2.waitForTimeout(1200);
      }
      ob.tour=steps>=11&&await p2.evaluate(()=>!!document.querySelector(".profile-sheet.ob-profile"));
      // The profile a part at a time, with nothing else usable (the close button can't be tapped). The name came from joining.
      ob.locked=await p2.evaluate(()=>{const el=document.getElementById("profile-close"),r=el.getBoundingClientRect(),hit=document.elementFromPoint(r.x+r.width/2,r.y+r.height/2);return !(hit&&(hit===el||el.contains(hit)))});
      let parts=0;for(let k=0;k<5;k++){const more=await p2.evaluate(()=>{const n=document.querySelector(".ob-card.ob-over .ob-next");if(n){n.click();return true}return false});if(!more)break;parts++;await p2.waitForTimeout(500)}
      ob.profileSteps=parts===1&&await p2.evaluate(()=>document.querySelector(".evia-guide-target").id==="save-profile");
      await p2.evaluate(()=>document.querySelector(".evia-guide-target").click());await p2.waitForTimeout(1200);
      ob.done=await p2.evaluate(()=>/"done"/.test(localStorage.getItem("evia7-onboarding"))&&!localStorage.getItem("evia7-induction"));
      ob.ticked=await p2.evaluate(()=>{try{return window.eviaStats.compute().a.met>=2}catch(_){return false}});
      // Nisia gets everything: after a sync nothing is left waiting, the PPE PDF included.
      ob.synced=await p2.evaluate(async()=>{await window.eviaNisia.sync();const s=window.eviaNisia.status();return s.joined&&!s.changes&&!s.media&&!!s.lastSync});
      await p2.waitForTimeout(800);
      ob.tourCountsAsSeen=await p2.evaluate(()=>{const s=JSON.parse(localStorage.getItem("evia7-tips-seen")||"[]");return ["course","supporting","unit","learning","teach","rewards","evia","profile"].every(k=>s.includes(k))&&!document.querySelector(".ev-tip")});
      ob.noErrors=!e2.length&&await p2.evaluate(()=>!window.eviaErrors.list().filter(x=>x.kind!=="reported").length);
      check("First run: connect to the college with the assessor's code, confirm the details Nisia sends, a Teach me style welcome, the PPE induction in the real guided mode saved to Supporting evidence (ticking K2 and S2), then a short tap-through tour",Object.values(ob).every(Boolean),JSON.stringify(ob)+" "+e2.join(" | "));
      await c2.close();
    }

    // No code yet: pick the course, and join the college later from the profile.
    {
      const c5=await browser.newContext({...devices["Pixel 7"],serviceWorkers:"block"}),p5=await c5.newPage(),e5=[];p5.on("pageerror",e=>e5.push(e.message));
      await p5.goto(url+"manifest.json");
      await p5.evaluate(()=>{localStorage.clear();sessionStorage.setItem("evia7-install-later","1");["evia7-theme-picked","evia7-shape-picked"].forEach(k=>localStorage.setItem(k,"1"))});
      await p5.goto(url+"?demo");await p5.waitForTimeout(2500);
      const jl={};
      await p5.click("#ob-nocode");await p5.waitForTimeout(600);
      await p5.click('[data-onboard-course="site"]');await p5.waitForTimeout(1500);
      jl.picked=await p5.evaluate(()=>course==="site"&&!window.eviaNisia.joined()&&!!document.getElementById("ob-lesson"));
      await p5.evaluate(()=>{document.querySelector("#ob-skip").click()});await p5.waitForTimeout(800);
      await p5.evaluate(()=>window.eviaOpenProfile());await p5.waitForTimeout(600);
      jl.canEditBefore=await p5.evaluate(()=>!document.getElementById("profile-name").readOnly&&!!document.querySelector(".pf-change"));
      await p5.click("#join-college");await p5.waitForTimeout(600);
      jl.noSkipBack=await p5.evaluate(()=>!document.getElementById("ob-nocode"));
      await p5.fill("#ob-code","CJ4H8KP");await p5.click('#ob-lesson [data-ob="1"]');await p5.waitForTimeout(700);
      await p5.click('#ob-lesson [data-ob="1"]');await p5.waitForTimeout(1800);
      jl.joined=await p5.evaluate(()=>{const e=window.eviaNisia.joined();return !!e&&e.name==="Amira Khan"&&window.eviaData.learner().name==="Amira Khan"&&!document.getElementById("ob-lesson")&&/"done"/.test(localStorage.getItem("evia7-onboarding"))});
      await p5.evaluate(()=>window.eviaOpenProfile());await p5.waitForTimeout(600);
      jl.lockedAfter=await p5.evaluate(()=>document.getElementById("profile-name").readOnly&&!document.querySelector(".pf-change")&&/Kestrel Homes/.test(document.querySelector(".pf-college").textContent)&&!!document.getElementById("pf-sync").textContent);
      // No signal: work waits on the phone, and a dot on the profile button says so until it's sent.
      await p5.evaluate(()=>{document.getElementById("modal-root").innerHTML=""});await c5.setOffline(true);
      await p5.evaluate(()=>{window.eviaData.put("hours",{minutes:30,description:"Toolbox talk"});dispatchEvent(new Event("offline"))});await p5.waitForTimeout(300);
      jl.waitingDot=await p5.evaluate(()=>document.getElementById("profile-btn").classList.contains("nisia-waiting"));
      await c5.setOffline(false);await p5.evaluate(async()=>{dispatchEvent(new Event("online"));await window.eviaNisia.sync()});await p5.waitForTimeout(300);
      jl.sentWhenBack=await p5.evaluate(()=>!document.getElementById("profile-btn").classList.contains("nisia-waiting")&&!window.eviaNisia.status().changes);
      jl.noErrors=!e5.length;
      check("No code yet: pick the course, then connect to the college later from the profile, which then shows the college's details",Object.values(jl).every(Boolean),JSON.stringify(jl)+" "+e5.join(" | "));
      await c5.close();
    }

    // Live Nisia (with a stand-in Supabase): the assessor's code signs Evia in, then every record goes to Nisia,
    // with learning hours and evidence also in their own tables, and photos uploaded to the evidence store.
    {
      const c6=await browser.newContext({...devices["Pixel 7"],serviceWorkers:"block"}),p6=await c6.newPage(),e6=[];p6.on("pageerror",e=>e6.push(e.message));
      const calls=[],b64=o=>Buffer.from(JSON.stringify(o)).toString("base64url");
      const tok=b64({alg:"HS256"})+"."+b64({sub:"u-learner",role:"authenticated",aal:"aal1",exp:Math.floor(Date.now()/1000)+3600})+".s";
      await p6.route(/supabase\.co/,async r=>{
        const q=r.request(),u=new URL(q.url()),body=q.postData()||"";calls.push({m:q.method(),p:u.pathname,body:/storage/.test(u.pathname)?"<file>":body});
        const json=(d,st)=>r.fulfill({status:st||200,contentType:"application/json",headers:{"access-control-allow-origin":"*"},body:JSON.stringify(d)});
        if(q.method()==="OPTIONS")return r.fulfill({status:200,headers:{"access-control-allow-origin":"*","access-control-allow-headers":"*","access-control-allow-methods":"*"}});
        if(u.pathname==="/functions/v1/nisia-setup")return JSON.parse(body).code==="LIVE234"?json({email:"x@learners.nisia.invalid",token_hash:"th",learnerId:"L1",organisationId:"O1",enrolmentId:"E1",courseId:"C1",memberId:"M1",name:"Jo Bloggs",college:"Walsall College",course:"bricklayer",start:"2026-09-01",end:"2028-08-31",employer:"Bloggs Build",assessor:"Mark Ellis",tutor:"Priya Shah",plannedOtjHours:400,nvqOptional:[]}):json({error:"That code didn’t work."},400);
        if(u.pathname==="/auth/v1/verify")return json({access_token:tok,token_type:"bearer",expires_in:3600,expires_at:Math.floor(Date.now()/1000)+3600,refresh_token:"r",user:{id:"u-learner",aud:"authenticated",role:"authenticated",email:"x@learners.nisia.invalid"}});
        if(u.pathname==="/auth/v1/user")return json({id:"u-learner",aud:"authenticated",role:"authenticated"});
        if(u.pathname.startsWith("/storage/v1/object/"))return json({Key:"k"});
        if(u.pathname==="/rest/v1/evidence"&&q.method()==="GET"&&/source_metadata-%3E%3Ecollection|source_metadata->>collection/.test(u.search))return json([{id:"OBS1",title:"Mixing mortar",created_at:"2026-09-20T10:00:00Z",source_metadata:{collection:"observation",unit:"Mixing mortar",observedBy:"Mark Ellis",observedOn:"2026-09-20",ksbs:["S14","K20"]}}]);
        if(u.pathname==="/rest/v1/evidence_files"&&q.method()==="GET"&&/OBS1/.test(u.search))return json([{storage_path:"O1/OBS1/observation.pdf",size_bytes:20}]);
        if(q.method()==="GET"&&/\/storage\/v1\/object\/.*observation\.pdf$/.test(u.pathname))return r.fulfill({status:200,contentType:"application/pdf",headers:{"access-control-allow-origin":"*"},body:"%PDF-1.4 observation"});
        if(u.pathname==="/rest/v1/targets"&&q.method()==="GET")return json([{id:"T1",review_id:"RV1",title:"Log 36 learning hours",description:"Log at least 36 hours in the next 6 weeks in Evia.",due_date:"2026-11-10",measure:{kind:"otj",target:36,baseline:0},created_at:"2026-09-28T10:00:00Z"}]);
        if(u.pathname==="/rest/v1/rpc/nisia_my_details")return json({name:"Joanne Bloggs",college:"Walsall College",start:"2026-09-01",end:"2028-08-31",assessor:"Mark Ellis",reviewDue:"2026-11-24",lastReview:null,safeguarding:{name:"Sam Lead",phone:"01922 000000",email:""}});
        if(u.pathname.startsWith("/rest/v1/"))return r.fulfill({status:201,headers:{"access-control-allow-origin":"*"},body:""});
        return json({},404);
      });
      await p6.goto(url+"manifest.json");
      await p6.evaluate(()=>{localStorage.clear();sessionStorage.setItem("evia7-install-later","1");["evia7-theme-picked","evia7-shape-picked"].forEach(k=>localStorage.setItem(k,"1"))});
      await p6.goto(url+"?demo");await p6.waitForTimeout(2500);
      const lv={};
      await p6.fill("#ob-code","LIV-E234");await p6.click('#ob-lesson [data-ob="0"]');await p6.waitForTimeout(1200);
      lv.isThisYou=await p6.evaluate(()=>/Jo Bloggs/.test(document.getElementById("ob-lesson").textContent)&&/Walsall College/.test(document.getElementById("ob-lesson").textContent));
      await p6.click('#ob-lesson [data-ob="1"]');await p6.waitForTimeout(2500);
      lv.signedIn=calls.some(x=>x.p==="/auth/v1/verify")&&await p6.evaluate(()=>{const e=window.eviaData.enrolment();return e.live&&e.enrolmentId==="E1"&&!e.token_hash&&window.eviaData.learnerId()==="L1"&&course==="bricklayer"});
      await p6.evaluate(()=>document.querySelector("#ob-skip")&&document.querySelector("#ob-skip").click());await p6.waitForTimeout(600);
      await p6.evaluate(async()=>{
        const c=document.createElement("canvas");c.width=40;c.height=40;const b=await new Promise(r=>c.toBlob(r,"image/jpeg"));
        const pid=await window.eviaStoreEvidencePhoto(b);
        window.eviaData.put("evidence",{course,unit:data().u[0][0],text:"I built a corner to gauge.",ksbs:data().u[0][1].map(code),photoIds:[pid]});
        window.eviaData.put("hours",{minutes:90,description:"College day"});
        await window.eviaNisia.sync();
      });
      await p6.waitForTimeout(500);
      const recs=calls.filter(x=>x.p==="/rest/v1/evia_records"&&x.m==="POST").flatMap(x=>JSON.parse(x.body));
      lv.allRecords=["learner","evidence","hours"].every(col=>recs.some(r=>r.collection===col&&r.enrolment_id==="E1"&&r.learner_member_id==="M1"));
      const snapRow=calls.filter(x=>x.p==="/rest/v1/evia_records"&&x.m==="POST").map(x=>JSON.parse(x.body)).flat().filter(r=>r.collection==="snapshot").pop();
      lv.snapshot=!!snapRow&&snapRow.data.ksb.total>0&&snapRow.data.ksb.met>=1&&Array.isArray(snapRow.data.units)&&snapRow.data.otj.total>=1.5&&!!snapRow.data.teach;
      lv.reviewTargets=await p6.evaluate(()=>{const t=window.eviaTargets.mine();return t.length===1&&t[0].id==="nt-T1"&&t[0].kind==="otj"&&t[0].reviewDate==="2026-09-28"});
      lv.targetsReported=!!snapRow&&Array.isArray(snapRow.data.targets)&&snapRow.data.targets.some(t=>t.title==="Log 36 learning hours"&&t.reviewId==="RV1"&&t.pct>0);
      lv.unitStrength=!!snapRow&&snapRow.data.units.some(u=>u.strength);
      lv.detailsFromCollege=await p6.evaluate(()=>{const L=window.eviaData.learner(),e=window.eviaData.enrolment();return L.name==="Joanne Bloggs"&&L.safeguarding&&L.safeguarding.name==="Sam Lead"&&e.reviewDue==="2026-11-24"&&e.assessor==="Mark Ellis"});
      lv.observationArrived=await p6.evaluate(async()=>{const x=window.eviaData.list("supporting").find(r=>r.id==="obs-OBS1");const b=x&&await window.eviaData.files.get(x.id,"supporting");return !!x&&x.title==="Observation: Mixing mortar"&&x.observation.by==="Mark Ellis"&&x.criteria.join()==="S14,K20"&&!!b&&b.size>0});
      lv.observationNotSentBack=!calls.some(x=>x.p==="/rest/v1/evidence"&&x.m==="POST"&&/obs-OBS1|Observation: Mixing/.test(x.body));
      lv.hoursTable=calls.some(x=>x.p==="/rest/v1/otj_entries"&&/"hours":1.5/.test(x.body));
      lv.evidenceTable=calls.some(x=>x.p==="/rest/v1/evidence"&&/"course_id":"C1"/.test(x.body)&&/"evidence_type":"photo"/.test(x.body));
      lv.photoUploaded=calls.some(x=>x.p.startsWith("/storage/v1/object/evidence/O1/"))&&calls.some(x=>x.p==="/rest/v1/evidence_files");
      lv.upToDate=await p6.evaluate(()=>{const s=window.eviaNisia.status();return !s.changes&&!s.media&&!!s.lastSync});
      lv.noErrors=!e6.length;
      check("Live Nisia: the assessor's code signs Evia in, every record, learning hours, evidence and photos go to the college, and name, safeguarding lead and review date come back",Object.values(lv).every(Boolean),JSON.stringify(lv)+" "+e6.join(" | "));

      // A second device (a computer) connects to the same learner: their saved work comes back, then the photos on WiFi.
      const store={};calls.filter(x=>x.p==="/rest/v1/evia_records"&&x.m==="POST").flatMap(x=>JSON.parse(x.body)).filter(r=>r.collection==="store").forEach(r=>{store[r.record_id]=r});
      const evRow=calls.filter(x=>x.p==="/rest/v1/evidence"&&x.m==="POST").map(x=>JSON.parse(x.body)).pop(),fileRow=calls.filter(x=>x.p==="/rest/v1/evidence_files"&&x.m==="POST").map(x=>JSON.parse(x.body)).pop();
      const photoPath=fileRow&&fileRow.storage_path,photoId=photoPath&&photoPath.split("/").pop().replace(/\.[^.]*$/,"");
      const c7=await browser.newContext({viewport:{width:1280,height:800},serviceWorkers:"block"}),p7=await c7.newPage(),e7=[],calls7=[];p7.on("pageerror",e=>e7.push(e.message));
      await p7.route(/supabase\.co/,async r=>{
        const q=r.request(),u=new URL(q.url()),body=q.postData()||"";calls7.push({m:q.method(),p:u.pathname,s:u.search,body:/storage/.test(u.pathname)?"<file>":body});
        const json=(d,st)=>r.fulfill({status:st||200,contentType:"application/json",headers:{"access-control-allow-origin":"*"},body:JSON.stringify(d)});
        if(q.method()==="OPTIONS")return r.fulfill({status:200,headers:{"access-control-allow-origin":"*","access-control-allow-headers":"*","access-control-allow-methods":"*"}});
        if(u.pathname==="/functions/v1/nisia-setup")return json({email:"x@learners.nisia.invalid",token_hash:"th2",learnerId:"L1",organisationId:"O1",enrolmentId:"E1",courseId:"C1",memberId:"M1",name:"Jo Bloggs",college:"Walsall College",course:"bricklayer",start:"2026-09-01",end:"2028-08-31",employer:"Bloggs Build",assessor:"Mark Ellis",tutor:"Priya Shah",plannedOtjHours:400,nvqOptional:[]});
        if(u.pathname==="/auth/v1/verify")return json({access_token:tok,token_type:"bearer",expires_in:3600,expires_at:Math.floor(Date.now()/1000)+3600,refresh_token:"r",user:{id:"u-learner",aud:"authenticated",role:"authenticated",email:"x@learners.nisia.invalid"}});
        if(u.pathname==="/auth/v1/user")return json({id:"u-learner",aud:"authenticated",role:"authenticated"});
        if(u.pathname==="/rest/v1/evia_records"&&q.method()==="GET")return json(/collection=eq\.store/.test(u.search)?Object.values(store).map(r=>({record_id:r.record_id,data:r.data})):[]);
        if(u.pathname==="/rest/v1/evidence"&&q.method()==="GET")return json(evRow?[{id:evRow.id,client_reference:evRow.client_reference}]:[]);
        if(u.pathname==="/rest/v1/evidence_files"&&q.method()==="GET")return json(fileRow?[{evidence_id:fileRow.evidence_id,storage_path:fileRow.storage_path}]:[]);
        if(q.method()==="GET"&&/^\/storage\/v1\/object\/(authenticated\/)?evidence\//.test(u.pathname))return r.fulfill({status:200,contentType:"image/jpeg",headers:{"access-control-allow-origin":"*"},body:Buffer.from("/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAgGBgcGBQgHBwcJCQgKDBQNDAsLDBkSEw8UHRofHh0aHBwgJC4nICIsIxwcKDcpLDAxNDQ0Hyc5PTgyPC4zNDL/wAALCAABAAEBAREA/8QAFAABAAAAAAAAAAAAAAAAAAAACf/EABQQAQAAAAAAAAAAAAAAAAAAAAD/2gAIAQEAAD8AKp//2Q==","base64")});
        if(u.pathname.startsWith("/rest/v1/"))return r.fulfill({status:201,headers:{"access-control-allow-origin":"*"},body:""});
        return json({},404);
      });
      await p7.goto(url+"manifest.json");
      await p7.evaluate(()=>{localStorage.clear()});
      await p7.goto(url+"?pair=LIV-E234");await p7.waitForSelector('#ob-lesson [data-ob="1"]',{timeout:20000}).catch(()=>{});
      const rs={};
      rs.isThisYou=await p7.evaluate(()=>/Jo Bloggs/.test((document.getElementById("ob-lesson")||{}).textContent||""));
      await p7.click('#ob-lesson [data-ob="1"]');await p7.waitForTimeout(4000);
      rs.sentBackup=Object.keys(store).includes("evia7-evidence")&&Object.keys(store).includes("evia7-hours")&&!Object.keys(store).some(k=>/nisia-auth|data-synced|enrolment/.test(k));
      rs.workBack=await p7.evaluate(()=>{const ev=window.eviaData.list("evidence"),h=window.eviaData.list("hours");return ev.length===1&&/corner to gauge/.test(ev[0].text)&&h.some(x=>x.minutes===90)&&!document.getElementById("ob-lesson")&&window.eviaData.enrolment().enrolmentId==="E1"});
      await p7.evaluate(async()=>{await window.eviaNisia.sync()});await p7.waitForTimeout(500);
      rs.photoDown=!!photoId&&await p7.evaluate(async id=>{const b=await window.eviaGetEvidencePhoto(id);return !!b&&b.size>0},photoId);
      rs.notSentAgain=!calls7.some(x=>x.m==="POST"&&(x.p==="/rest/v1/evidence"||x.p==="/rest/v1/otj_entries"||x.p.startsWith("/storage/v1/object/evidence/")))&&await p7.evaluate(()=>{const s=window.eviaNisia.status();return !s.changes&&!s.media});
      rs.noErrors=!e7.length;
      check("A second device: connecting Evia on a computer brings the learner's work back from Nisia, photos included, without sending it all again",Object.values(rs).every(Boolean),JSON.stringify(rs)+" "+e7.join(" | "));
      await c7.close();
      await c6.close();
    }

    // Deleting and backdating: saved evidence (with its photos) and any learning log entry can be deleted, and hours can be
    // logged for an earlier day, which counts on that day but still goes in the next learning hours PDF.
    {
      const c8=await browser.newContext({...devices["Pixel 7"],serviceWorkers:"block"}),p8=await c8.newPage(),e8=[];p8.on("pageerror",e=>e8.push(e.message));
      p8.on("dialog",d=>d.accept());
      await p8.goto(url+"manifest.json");
      await p8.evaluate(()=>{localStorage.clear();sessionStorage.setItem("evia7-install-later","1");["evia7-theme-picked","evia7-shape-picked"].forEach(k=>localStorage.setItem(k,"1"));localStorage.setItem("evia7-onboarding",'{"stage":"done"}');localStorage.setItem("evia7-home-tip",JSON.stringify({day:new Date().toDateString(),id:"x"}));localStorage.setItem("evia7-profile",JSON.stringify({name:"Jo",start:"2025-01-01",end:"2027-12-01"}))});
      await p8.goto(url);await p8.waitForTimeout(2500);
      await p8.evaluate(()=>{document.getElementById("app").classList.remove("welcome-app-hidden");const w=document.getElementById("welcome-screen");if(w)w.remove()});
      const dl={};
      dl.backdated=await p8.evaluate(()=>{const ten=Date.now()-10*864e5,id=window.eviaData.put("hours",{minutes:120,description:"College day",source:"evia",createdAt:Date.now(),occurredAt:ten});
        const r=window.eviaData.get("hours",id);return Math.abs(Date.parse(r.occurredAt)-ten)<1000&&Date.parse(r.createdAt)>Date.now()-60000});
      dl.countsOnTheDay=await p8.evaluate(()=>{const S=window.eviaStats.compute();return S.otjWeek===0&&S.otjTotal>=2});
      await p8.evaluate(()=>{window.eviaData.put("hours",{minutes:30,description:"Toolbox talk",source:"manual"});window.eviaOpenLearningLogs()});await p8.waitForTimeout(600);
      dl.everyEntryDeletable=await p8.evaluate(()=>document.querySelectorAll("[data-rm-log]").length===2);
      await p8.evaluate(()=>document.querySelector("[data-rm-log]").click());await p8.waitForTimeout(600);
      dl.logDeleted=await p8.evaluate(()=>window.eviaData.list("hours").length===1&&document.querySelectorAll("[data-rm-log]").length===1);
      dl.evidenceDeleted=await p8.evaluate(async()=>{
        const c=document.createElement("canvas");c.width=20;c.height=20;const b=await new Promise(r=>c.toBlob(r,"image/jpeg"));const pid=await window.eviaStoreEvidencePhoto(b);
        const id=window.eviaData.put("evidence",{course,unit:data().u[0][0],text:"A corner to gauge.",ksbs:[],photoIds:[pid]});
        const before=window.eviaData.list("evidence").length,ok=window.eviaData.remove("evidence",id);await new Promise(r=>setTimeout(r,300));
        return ok&&window.eviaData.list("evidence").length===before-1&&!(await window.eviaGetEvidencePhoto(pid));
      });
      dl.noErrors=!e8.length;
      check("Deleting and backdating: evidence and its photos, and any learning log entry, can be deleted; hours can be logged for an earlier day",Object.values(dl).every(Boolean),JSON.stringify(dl)+" "+e8.join(" | "));
      await c8.close();
    }

    // First-visit notes: once the tour is done, the first time a page or section opens Evia says what it's for; never again.
    {
      const c3=await browser.newContext({...devices["Pixel 7"],serviceWorkers:"block"}),p3=await c3.newPage(),e3=[];p3.on("pageerror",e=>e3.push(e.message));
      await p3.goto(url+"manifest.json");
      await p3.evaluate(()=>{localStorage.clear();sessionStorage.setItem("evia7-install-later","1");["evia7-theme-picked","evia7-shape-picked"].forEach(k=>localStorage.setItem(k,"1"));localStorage.setItem("evia7-onboarding",'{"stage":"done"}');localStorage.setItem("evia7-home-tip",JSON.stringify({day:new Date().toDateString(),id:"x"}));localStorage.setItem("evia7-profile",JSON.stringify({name:"Jo",start:"2025-01-01",end:"2026-12-01"}))});
      await p3.goto(url);await p3.waitForTimeout(2500);
      await p3.evaluate(()=>{document.getElementById("app").classList.remove("welcome-app-hidden");const w=document.getElementById("welcome-screen");if(w)w.remove()});
      const tipText=()=>p3.evaluate(()=>{const t=document.querySelector(".ev-tip");return t?t.querySelector("strong").textContent:""});
      const gotIt=()=>p3.evaluate(()=>{const b=document.querySelector(".ev-tip button");if(b)b.click()});
      const tp={};
      await p3.evaluate(()=>nav("teach"));await p3.waitForTimeout(900);tp.first=await tipText()==="Teach me";
      await gotIt();await p3.waitForTimeout(400);
      await p3.evaluate(()=>nav("course"));await p3.waitForTimeout(900);tp.course=await tipText()==="My course";await gotIt();await p3.waitForTimeout(400);
      await p3.evaluate(()=>nav("teach"));await p3.waitForTimeout(900);tp.onlyOnce=await tipText()==="";
      await p3.evaluate(()=>window.chat());await p3.waitForTimeout(1200);tp.section=await tipText()==="That’s me";
      await p3.evaluate(()=>{document.getElementById("modal-root").innerHTML=""});await p3.waitForTimeout(500);tp.closesWithSection=await tipText()==="";
      await p3.evaluate(()=>window.chat());await p3.waitForTimeout(1200);tp.sectionOnce=await tipText()==="";
      tp.noErrors=!e3.length;
      check("First-visit notes: Evia explains each page and section the first time it opens, and never again",Object.values(tp).every(Boolean),JSON.stringify(tp)+" "+e3.join(" | "));
      await c3.close();
    }

    // Get the app first: in a phone's browser Evia asks for the app before anything else, with one button.
    {
      const c4=await browser.newContext({...devices["iPhone 13"],serviceWorkers:"block"}),p4=await c4.newPage();
      await p4.goto(url);await p4.waitForTimeout(2000);
      const gi={shown:await p4.evaluate(()=>{const g=document.getElementById("get-app");return !!g&&/Get the Evia app/.test(g.textContent)&&g.querySelectorAll(".gi-go").length===1})};
      await p4.click("#gi-go");await p4.waitForTimeout(300);gi.iphoneSteps=await p4.evaluate(()=>/Add to Home Screen/.test(document.getElementById("get-app").textContent));
      gi.noBrowserWayOut=await p4.evaluate(()=>!document.getElementById("gi-later")&&![...document.querySelectorAll("#get-app button")].some(b=>/browser/i.test(b.textContent)));
      await p4.reload();await p4.waitForTimeout(1500);gi.stillAsks=await p4.evaluate(()=>!!document.getElementById("get-app"));
      await p4.goto(url+"?browser");await p4.waitForTimeout(1500);gi.testSwitch=await p4.evaluate(()=>!document.getElementById("get-app"));
      check("Get the app first: one button in a phone's browser (the Home Screen steps on iPhone), no carrying on in the browser, and not inside the app",Object.values(gi).every(Boolean),JSON.stringify(gi));
      await c4.close();
    }

    const rc=await page.evaluate(()=>{
      const iso=d=>{const x=new Date(Date.now()+d*864e5);return x.getFullYear()+"-"+String(x.getMonth()+1).padStart(2,"0")+"-"+String(x.getDate()).padStart(2,"0")};
      const had=localStorage.getItem("evia7-enrolment");
      const e=Object.assign({},JSON.parse(had||"{}"),{course:course,college:"Test College",reviewDue:iso(3),lastReview:null});localStorage.setItem("evia7-enrolment",JSON.stringify(e));
      const first=()=>{const n=window.eviaStats.nudges(window.eviaStats.compute());return n.find(x=>x.id==="review-comments")?n[0].id==="review-comments"||n[0].celebrate:false};
      const pulse=()=>{window.eviaDrawFabBadge();return !!document.querySelector("#evia-fab .fab-pulse")};
      const p5=pulse();
      localStorage.setItem("evia7-enrolment",JSON.stringify(Object.assign({},e,{reviewDue:iso(10)})));const p10=pulse();
      localStorage.setItem("evia7-enrolment",JSON.stringify(e));const real=window.eviaReviewPrepCount;window.eviaReviewPrepCount=()=>0;const pNone=pulse();window.eviaReviewPrepCount=real;pulse();
      window.__pulse={p5,p10,pNone};
      const before=first();
      window.eviaData.put("reviews",{date:new Date().toISOString(),course,reflection:{learnerFeedback:"Going well"}});
      const a2=window.eviaStats.nudges(window.eviaStats.compute()).find(x=>x.id==="review-comments"),after=!!a2&&/comments/.test(a2.text);
      if(had)localStorage.setItem("evia7-enrolment",had);else localStorage.removeItem("evia7-enrolment");
      return {before,after,pulse:window.__pulse};
    }).catch(e=>({err:e.message}));
    check("Evia pulses from 7 days before the review while there's something to get ready, and not otherwise",rc.pulse&&rc.pulse.p5&&!rc.pulse.p10&&!rc.pulse.pNone,JSON.stringify(rc.pulse));
    check("Connected to a college, Evia's first message each day before the review is getting ready, and stops asking for comments once they're in",rc.before===true&&rc.after===false,JSON.stringify(rc));
    check("No script errors",!errors.length,errors.join(" | "));
  }catch(e){check("Test run finished",false,e.message)}
  await browser.close();server.close();
  const failed=results.filter(r=>!r.ok).length;
  console.log(failed?"\n"+failed+" check(s) failed.":"\nAll "+results.length+" checks passed.");
  process.exit(failed?1:0);
})();
