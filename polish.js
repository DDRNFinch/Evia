/* Evia7 polish layer: keeps the existing course/KSB data and workflows intact. */
(function(){
  function fileToThumbnail(file){
    return new Promise(function(resolve,reject){
      var reader=new FileReader();
      reader.onload=function(){
        var img=new Image();
        img.onload=function(){
          var max=640, scale=Math.min(1,max/Math.max(img.naturalWidth,img.naturalHeight));
          var w=Math.max(1,Math.round(img.naturalWidth*scale));
          var h=Math.max(1,Math.round(img.naturalHeight*scale));
          var canvas=document.createElement("canvas");
          canvas.width=w; canvas.height=h;
          var ctx=canvas.getContext("2d",{alpha:false});
          ctx.drawImage(img,0,0,w,h);
          canvas.toBlob(function(blob){
            if(!blob){reject(new Error("Thumbnail creation failed"));return;}
            var r2=new FileReader();
            r2.onload=function(){resolve(r2.result)};
            r2.onerror=reject;
            r2.readAsDataURL(blob);
          },"image/jpeg",.72);
        };
        img.onerror=reject;
        img.src=reader.result;
      };
      reader.onerror=reject;
      reader.readAsDataURL(file);
    });
  }

  async function polishedSave(){
    var u=data().u[unit], w=$("#write").value.trim();
    if(!photos.length && !w){
      alert("Add at least one photo or some written evidence.");
      return;
    }
    var save=$("#save");
    if(save){save.disabled=true;save.textContent="Saving…";}
    try{
      /* Persist only the compressed thumbnail, never the original camera file. */
      var thumbnails=await Promise.all(photos.map(fileToThumbnail));
      evidence.push({id:Date.now(),c:course,u:u[0],d:new Date().toLocaleString("en-GB"),p:thumbnails,w:w,k:u[1].map(code)});
      persist();
      screen="portfolio";
      render();
    }catch(err){
      if(save){save.disabled=false;save.textContent="Save evidence";}
      alert("The photos could not be prepared. Please try again.");
    }
  }

  function polishedDraw(){
    var g=$("#photos");
    if(!g)return;
    g.innerHTML="";
    if(!photos.length){
      g.innerHTML='<div class="photo-empty">No photos added yet</div>';
      return;
    }
    var count=document.createElement("div");
    count.className="photo-count";
    count.textContent=photos.length+" photo"+(photos.length===1?"":"s")+" selected";
    g.appendChild(count);
    photos.forEach(function(f,i){
      var wrap=document.createElement("div");
      wrap.className="photo-item";
      var img=document.createElement("img");
      img.className="thumb";
      img.alt="Selected evidence photo "+(i+1);
      img.loading="lazy";
      img.src=URL.createObjectURL(f);
      var remove=document.createElement("button");
      remove.className="photo-remove";
      remove.type="button";
      remove.setAttribute("aria-label","Remove photo");
      remove.textContent="×";
      remove.onclick=function(){
        URL.revokeObjectURL(img.src);
        photos.splice(i,1);
        polishedDraw();
      };
      wrap.appendChild(img);
      wrap.appendChild(remove);
      g.appendChild(wrap);
    });
  }

  window.addEventListener("load",function(){
    /* Intercept the original Save button at capture phase so its old
       full-resolution persistence handler cannot run. */
    document.addEventListener("click",function(e){
      var target=e.target.closest && e.target.closest("#save");
      if(!target)return;
      e.preventDefault();
      e.stopImmediatePropagation();
      polishedSave();
    },true);

    window.draw=polishedDraw;

    var style=document.createElement("style");
    style.textContent=".photo-grid{position:relative}.photo-count{grid-column:1/-1;font-size:11px;color:#8d98a8;margin:0 1px 1px}.photo-item{position:relative;min-width:0}.photo-remove{position:absolute;right:5px;top:5px;width:24px;height:24px;border-radius:50%;background:rgba(16,24,40,.72);color:#fff;font-size:17px;line-height:20px;box-shadow:0 2px 6px rgba(0,0,0,.15)}.photo-empty{grid-column:1/-1;text-align:center;color:#a0aaba;font-size:12px;padding:8px}.primary:disabled{opacity:.55;cursor:wait}.profile-btn{font-size:0;position:relative}.profile-btn:before{content:'';position:absolute;left:14px;top:8px;width:10px;height:10px;border-radius:50%;background:#3f4654}.profile-btn:after{content:'';position:absolute;left:10px;top:20px;width:18px;height:11px;border-radius:12px 12px 8px 8px;background:#3f4654}";
    document.head.appendChild(style);
  });
})();