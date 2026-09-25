/* Evia7 Teach me content kit. The lesson files (teach-*.js) use these helpers to add units to window.EVIA_TEACH,
   which teach.js reads. Write the correct answer first in Q(): options are shuffled when shown.
     L(title,text,pic)   a picture card that explains something
     Q(q,[right,...wrong],why)   pick the answer
     T(q,true|false,why) true or false
     M(q,[[a,b],...])    match the pairs
     O(q,[first,...last],why)   put in order
     lesson(id,title,blurb,steps)  ·  unit(name,skill,lessons)  (skill = the confidence-check area it informs) */
(function(){
  const T=window.EVIA_TEACH=window.EVIA_TEACH||{courses:{},fs:[]};
  Object.assign(T,{
    L:(title,text,pic)=>({t:"learn",title,text,pic}),
    Q:(q,opts,why)=>({t:"choice",q,opts,a:0,why,shuffle:true}),
    T:(q,a,why)=>({t:"tf",q,a,why}),
    M:(q,pairs,why)=>({t:"match",q,pairs,why}),
    O:(q,items,why)=>({t:"order",q,items,why}),
    lesson:(id,title,blurb,steps)=>({id,title,blurb,steps}),
    unit:(unit,skill,lessons,extra)=>Object.assign({unit,skill,lessons},extra||{}),
    add:(course,units)=>{T.courses[course]=(T.courses[course]||[]).concat(units)}
  });
})();
