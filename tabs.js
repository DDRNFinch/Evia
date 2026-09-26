/* Evia7 tabs beside Evia: Teach me (the course, maths and English lessons, and the mini games) and Rewards (rewards.js). */
(function(){
  const esc=s=>String(s==null?"":s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
  const scr=()=>document.getElementById("screen");
  const courseName=()=>{try{return data().name}catch(_){return ""}};
  const head=title=>'<header class="ui-page-head"><h1>'+esc(title)+'</h1><span>'+esc(courseName())+'</span></header>';
  const ICON={
    course:'<svg viewBox="0 0 24 24"><rect x="3" y="14" width="8" height="5" rx="1"/><rect x="13" y="14" width="8" height="5" rx="1"/><rect x="8" y="8" width="8" height="5" rx="1"/><path d="M3 21h18"/></svg>',
    maths:'<svg viewBox="0 0 24 24"><rect x="4" y="3" width="16" height="18" rx="3"/><path d="M8 7.5h8M8.5 12h1M12 12h1M15 12h1M8.5 16h1M12 16h1M15 16h1"/></svg>',
    english:'<svg viewBox="0 0 24 24"><path d="M4 20l5.5-15h1L16 20M6.2 14.5h7.6"/><path d="M17 12.5c1-1 3.5-1 3.5 1.2V20M20.5 16.2c-2.7-.4-4 .5-4 1.9 0 1 .8 1.9 2 1.9 1.3 0 2-1 2-1"/></svg>'
  };
  /* Lessons done out of the total for a list of units, from the Teach me store. */
  function count(us){
    let L={};try{L=((JSON.parse(localStorage.getItem("evia7-teach")||"{}")||{})[course]||{}).lessons||{}}catch(_){}
    const ls=[].concat(...us.map(u=>u.lessons));return {done:ls.filter(l=>L[l.id]&&L[l.id].done).length,total:ls.length};
  }
  function teachPage(){
    const T=window.eviaTeach,E=window.EVIA_TEACH||{fs:[]};
    const trade=(T&&T.COURSES&&T.COURSES[course])||[],fs=f=>(E.fs||[]).filter(u=>u.fs===f);
    const card=(id,title,c)=>'<button type="button" class="tt-card" data-go="'+id+'"><span class="tt-ic" aria-hidden="true">'+ICON[id]+'</span><span class="tt-copy"><strong>'+esc(title)+'</strong><small>'+c.done+' of '+c.total+' lessons</small>'+
      '<i class="tt-bar"><i style="width:'+(c.total?Math.round(c.done/c.total*100):0)+'%"></i></i></span><span class="tt-chev" aria-hidden="true">›</span></button>';
    scr().innerHTML=head("Teach me")+'<div class="tt-list">'+card("course",courseName()||"Your course",count(trade))+card("maths","Maths",count(fs("maths")))+card("english","English",count(fs("english")))+'</div>'+games();
    scr().querySelectorAll("[data-go]").forEach(b=>b.onclick=()=>{if(T)T.open(b.dataset.go)});
    scr().querySelectorAll("[data-game]").forEach(b=>b.onclick=()=>{const R=window.eviaRewards,id=b.dataset.game;
      if(R&&R.owns(id))window.eviaGames.open(b.dataset.key);else if(R)R.openItem(id)});
  }
  /* Mini games: unlocked in Rewards, played here. */
  const LOCK='<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="5" y="10.5" width="14" height="10" rx="2.5"/><path d="M8 10.5V8a4 4 0 0 1 8 0v2.5"/></svg>';
  function games(){
    const G=window.eviaGames,R=window.eviaRewards;if(!G||!R)return "";
    const PRICE={common:30,rare:80,epic:180},room=R.gameRoom(),earned=R.GAME_DAILY-room;
    return '<section class="tt-games"><div class="tt-games-head"><h2>Mini games</h2><span>'+(room?earned+" of "+R.GAME_DAILY+" game coins today":"Today’s game coins collected")+'</span></div><div class="tt-list">'+
      G.GAMES.map(g=>{const own=R.owns(g.id);
        return '<button type="button" class="tt-card tt-game'+(own?"":" locked")+'" data-game="'+g.id+'" data-key="'+g.key+'"><span class="tt-ic" aria-hidden="true">'+G.iconFor(g.key)+'</span><span class="tt-copy"><strong>'+esc(g.label)+'</strong><small>'+esc(own?g.about:"Unlock it in Rewards")+'</small></span>'+
          (own?'<span class="tt-play">Play</span>':'<span class="tt-lock">'+LOCK+(PRICE[g.rarity]?'<b>'+PRICE[g.rarity]+'</b>':"")+'</span>')+'</button>'}).join("")+'</div></section>';
  }
  function rewardsPage(){if(window.eviaRewards)window.eviaRewards.page();else scr().innerHTML=head("Rewards")}

  const prev=window.render;
  window.render=function(){
    if(window.eviaRewards&&window.eviaRewards.later)window.eviaRewards.later();
    if(screen!=="teach"&&screen!=="rewards")return prev();
    const pb=document.getElementById("profile-btn");if(pb)pb.style.display="flex";
    document.querySelectorAll("[data-nav]").forEach(b=>b.classList.toggle("active",b.dataset.nav===screen));
    const s=scr();if(s)s.classList.add("ui-top");
    const t=document.getElementById("page-title");if(t)t.textContent=screen==="teach"?"Teach me":"Rewards";
    if(screen==="teach")teachPage();else rewardsPage();
  };
})();
