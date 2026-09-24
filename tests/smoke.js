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

    check("Home shows progress and quick actions",await page.$("#ui-home-progress")&&await page.$("#ui-practice"));
    for(const s of ["course","progress","portfolio","learning","home"]){await page.evaluate(s=>nav(s),s);await page.waitForTimeout(450)}
    await page.evaluate(()=>nav("progress"));await page.waitForTimeout(450);
    check("Progress shows the hero, KSB groups and stats cards",await page.$("#pg-hero")&&await page.$(".ui-groups")&&await page.$("#pg-activity")&&await page.$("#pg-awards"));
    await page.evaluate(()=>nav("portfolio"));await page.waitForTimeout(450);
    check("Portfolio shows the unit with evidence",await page.$("[data-unit-open]"));
    await page.evaluate(()=>{nav("course")});await page.waitForTimeout(450);await page.evaluate(()=>openUnit(3));await page.waitForTimeout(900);
    check("An evidence pack opens",await page.$("#write"));
    await page.fill("#write","i laid the morter on the dpc and checked it was plum");await page.click(".wc-btn");await page.click(".wc-all");
    check("Check my writing fixes spelling, capitals and punctuation",await page.inputValue("#write")==="I laid the mortar on the DPC and checked it was plumb.");

    await page.evaluate(()=>window.eviaOpenSendToPortfolio(data().u[2][0]));await page.waitForTimeout(3500);
    check("Send to e-portfolio shows a PDF preview, Save PDF and the zip",await page.evaluate(()=>!!document.getElementById("eport-preview")&&!!document.getElementById("eport-save")&&/1 photo, just in case/.test(document.getElementById("eport-zip").innerText)));

    await page.evaluate(()=>nav("home"));await page.waitForTimeout(450);
    await page.evaluate(()=>window.chat());
    await page.waitForFunction(()=>{const c=document.getElementById("chat");return c&&!c.querySelector(".evia-thinking")},null,{timeout:15000});
    check("Chat menu has My stats, Test me, Progress review and My targets",await page.evaluate(()=>{const t=[...document.querySelectorAll("#chat .chat-pill")].map(b=>b.innerText.trim());return ["My stats","Test me","Progress review","My targets"].every(x=>t.includes(x))}));
    await page.click('#chat .chat-pill >> text="My targets"');
    await page.waitForSelector("#chat .chat-targets .tg-row",{state:"visible",timeout:15000});
    check("My targets sets targets and shows them with progress",await page.evaluate(()=>window.eviaTargets.mine().length>=3&&document.querySelectorAll("#chat .chat-targets .pg-bar").length>=3));
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

    await page.evaluate(()=>window.eviaScenarios.openTopics());await page.waitForTimeout(300);
    await page.click('[data-topic="values"]');await page.waitForTimeout(300);await page.click('[data-opt="0"]');await page.waitForTimeout(200);
    check("A real-life scenario explains every choice",await page.evaluate(()=>document.querySelectorAll(".sc-why").length===3));
    await page.evaluate(()=>{document.getElementById("modal-root").innerHTML=""});

    await page.evaluate(()=>{document.body.classList.add("evia-onboarding");nav("progress")});await page.waitForTimeout(200);
    check("The first-run demo can point at K2 and S2 on Progress",await page.$('[data-ksb-code="K2"]')&&await page.$('[data-ksb-code="S2"]'));
    await page.evaluate(()=>{document.body.classList.remove("evia-onboarding");nav("home")});await page.waitForTimeout(450);

    await page.evaluate(()=>window.eviaStartReview());await page.waitForTimeout(400);
    for(let i=0;i<10;i++){const t=await page.evaluate(()=>document.getElementById("rv-next").textContent);await page.click("#rv-next");await page.waitForTimeout(200);if(t==="Save review")break}
    check("A full review clicks through and replaces the targets",await page.evaluate(()=>{const r=JSON.parse(localStorage.getItem("evia7-progress-reviews")||"[]").pop();return r&&r.format===2&&window.eviaTargets.mine().every(t=>t.reviewId===r.id)}));
    await page.evaluate(()=>window.eviaSetShape("gear"));
    check("Outline Evia shapes draw on the Evia button",await page.$("#evia-fab .evia-outline"));
    await page.evaluate(()=>window.eviaSetShape("circle"));

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
