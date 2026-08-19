(()=>{
"use strict";
const nativeFetch=window.fetch.bind(window);
function current(){return window.EviaCourseContext?.current?.()}
window.fetch=async function(input,init){
  try{
    const raw=typeof input==="string"?input:input?.url||"";
    const m=String(raw).match(/(?:^|\/)app\/evia-trowel-(thin|repair|specialist|drainage)-data-(1|2|3)\.ts(?:\?|$)/);
    if(m){
      const course=current(),option=course?.courseType==="nvq"?(course.pathway||m[1]):m[1],part=Number(m[2]);
      const data=part===1?(window.EviaTrowelData?.build?.(option)||[]):[];
      const text=`import type{SiteCategory}from"./evia-data-types";export const SITE_DATA_${part}:SiteCategory[]=${JSON.stringify(data)};`;
      return new Response(text,{status:200,headers:{"Content-Type":"text/plain;charset=utf-8","Cache-Control":"no-store"}})
    }
  }catch(e){console.debug("Evia Trowel data",e)}
  return nativeFetch(input,init)
};
})();