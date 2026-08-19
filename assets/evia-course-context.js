(()=>{
"use strict";
const TIMELINE_KEY="evia-course-timeline";
const proto=Storage.prototype;
const original={getItem:proto.getItem,setItem:proto.setItem,removeItem:proto.removeItem};
const brickCodes=[...Array.from({length:31},(_,i)=>`K${i+1}`),...Array.from({length:22},(_,i)=>`S${i+1}`),...Array.from({length:6},(_,i)=>`B${i+1}`)];
const siteCodes=[...Array.from({length:29},(_,i)=>`K${i+1}`),"K40",...Array.from({length:22},(_,i)=>`S${i+1}`),...Array.from({length:5},(_,i)=>`B${i+1}`)];
const joinerCodes=[...Array.from({length:20},(_,i)=>`K${i+1}`),...Array.from({length:11},(_,i)=>`K${i+30}`),...Array.from({length:13},(_,i)=>`S${i+1}`),...Array.from({length:8},(_,i)=>`S${i+23}`),...Array.from({length:5},(_,i)=>`B${i+1}`)];
function timeline(){try{const x=JSON.parse(original.getItem.call(localStorage,TIMELINE_KEY)||"null");return x&&typeof x==="object"?x:{}}catch{return{}}}
function current(){
  const t=timeline();
  if(t.courseId==="st0264-v1-4"){
    if(t.pathway==="architectural-joiner")return{
      courseId:"st0264-v1-4",courseTitle:"Carpentry & Joinery — ST0264 v1.4",pathway:"architectural-joiner",pathwayTitle:"Architectural Joiner",
      storageSuffix:"st0264-aj",dataPrefix:"evia-carpentry-joiner-data",codes:joinerCodes,totalKsb:joinerCodes.length,otjMinimumHours:557,epaConfigured:false
    };
    return{
      courseId:"st0264-v1-4",courseTitle:"Carpentry & Joinery — ST0264 v1.4",pathway:"site-carpenter",pathwayTitle:"Site Carpenter",
      storageSuffix:"st0264-site",dataPrefix:"evia-carpentry-site-data",codes:siteCodes,totalKsb:siteCodes.length,otjMinimumHours:557,epaConfigured:false
    };
  }
  return{
    courseId:"st0095-v1-2",courseTitle:"Bricklayer — ST0095 v1.2",pathway:null,pathwayTitle:"",
    storageSuffix:"",dataPrefix:"evia-site-data",codes:brickCodes,totalKsb:brickCodes.length,otjMinimumHours:578,epaConfigured:true
  };
}
const redirected=new Set([
  "evia-selfobs-live-v3","evia-selfobs-day-v3","evia-selfobs-recap-v3",
  "evia-rpl-ksbs-v1","evia-epa-practice-v1","evia-epa-checks",
  "evia-otj-entries","evia-otj-college-v1"
]);
function physical(key){
  const text=String(key),c=current();
  return c.storageSuffix&&redirected.has(text)?`${text}::${c.storageSuffix}`:text;
}
proto.getItem=function(key){return original.getItem.call(this,physical(key))};
proto.setItem=function(key,value){return original.setItem.call(this,physical(key),value)};
proto.removeItem=function(key){return original.removeItem.call(this,physical(key))};
window.EviaCourseContext={current,physicalKey:physical,originalStorage:original};
})();