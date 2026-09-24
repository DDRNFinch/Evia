/* Quick check (no browser needed): every script parses, and every file the app loads or caches offline exists.
   Run: node tests/check-files.js */
const fs=require("fs"),path=require("path"),{execFileSync}=require("child_process");
const root=path.join(__dirname,"..");
const problems=[];
const read=f=>fs.readFileSync(path.join(root,f),"utf8");
const exists=f=>fs.existsSync(path.join(root,f.replace(/^\.\//,"").replace(/[?#].*$/,"")));

for(const f of fs.readdirSync(root).filter(f=>f.endsWith(".js"))){
  try{execFileSync(process.execPath,["--check",path.join(root,f)],{stdio:"pipe"})}
  catch(e){problems.push(f+" does not parse: "+String(e.stderr).split("\n").find(l=>/Error/.test(l)))}
}
const html=read("index.html");
const loader=(html.match(/data-app-scripts="([^"]*)"/)||[])[1]||"";
const pageFiles=[...loader.split(/\s+/).filter(Boolean),...[...html.matchAll(/(?:src|href)="([^"#:]+)"/g)].map(m=>m[1])];
pageFiles.forEach(f=>{if(!exists(f))problems.push("index.html loads a missing file: "+f)});
const sw=read("sw-v16.js");
const shell=[...sw.matchAll(/"(\.\/[^"]*)"/g)].map(m=>m[1]).filter(f=>f!=="./");
shell.forEach(f=>{if(!exists(f))problems.push("Offline list (sw-v16.js) has a missing file: "+f)});
loader.split(/\s+/).filter(Boolean).map(f=>"./"+f.replace(/^\.\//,"").replace(/\?.*$/,"")).forEach(f=>{if(!shell.includes(f))problems.push("Loaded but not saved for offline use: "+f)});
const swVersion=(sw.match(/VERSION = "([^"]+)"/)||[])[1],regVersion=(html.match(/sw-v16\.js\?v=([^"]+)"/)||[])[1];
if(!swVersion||!regVersion||!swVersion.endsWith(regVersion))problems.push("Service worker version ("+swVersion+") and the one index.html registers ("+regVersion+") don't match");

if(problems.length){console.error("✗ "+problems.length+" problem(s):\n  "+problems.join("\n  "));process.exit(1)}
console.log("✓ All scripts parse and every loaded/offline file exists.");
