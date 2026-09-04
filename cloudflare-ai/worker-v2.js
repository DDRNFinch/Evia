const DEFAULT_MODEL='@cf/meta/llama-3.1-8b-instruct-fast';
const SUBJECTS=new Set(['trade','maths','english','edi','epa','ask']);
const MODES=new Set(['teach','test']);

function clean(value,max=4000){return String(value??'').replace(/\s+/g,' ').trim().slice(0,max)}
function json(body,status=200,headers={}){
  return new Response(JSON.stringify(body),{status,headers:{'content-type':'application/json; charset=utf-8','cache-control':'no-store',...headers}})
}
function corsHeaders(request,env){
  const origin=request.headers.get('origin')||'';
  const allowed=clean(env.ALLOWED_ORIGIN||'https://ddrnfinch.github.io',300);
  if(!origin)return {'access-control-allow-origin':allowed,'vary':'origin'};
  if(origin===allowed||origin==='http://localhost:8787'||origin==='http://127.0.0.1:8787')return {'access-control-allow-origin':origin,'vary':'origin'};
  return {'access-control-allow-origin':allowed,'vary':'origin'}
}
function sanitizeCriteria(items){
  if(!Array.isArray(items))return[];
  return items.slice(0,90).map(item=>({
    code:clean(item?.code,40),
    label:clean(item?.label,700),
    path:clean(item?.path,700),
    requirement:clean(item?.requirement,1200)
  })).filter(item=>item.code||item.label||item.requirement)
}
function sanitizeCourse(course={}){
  return{
    courseId:clean(course?.courseId,80),
    courseTitle:clean(course?.courseTitle,240),
    courseType:clean(course?.courseType,80),
    level:clean(course?.level,40),
    criteria:sanitizeCriteria(course?.criteria)
  }
}
function schemaFor(mode){
  if(mode==='teach')return{
    type:'object',
    properties:{
      title:{type:'string'},
      focus:{type:'string'},
      mappedTo:{type:'array',items:{type:'string'},maxItems:4},
      teaching:{type:'array',items:{type:'string'},minItems:3,maxItems:4}
    },
    required:['title','focus','mappedTo','teaching']
  };
  return{
    type:'object',
    properties:{
      title:{type:'string'},
      questions:{type:'array',minItems:5,maxItems:5,items:{
        type:'object',
        properties:{
          question:{type:'string'},
          answers:{type:'array',items:{type:'string'},minItems:4,maxItems:4},
          correct:{type:'integer',minimum:0,maximum:3},
          explanation:{type:'string'},
          mappedTo:{type:'array',items:{type:'string'},maxItems:4},
          difficulty:{type:'string',enum:['developing','competent','stretch']}
        },
        required:['question','answers','correct','explanation','mappedTo','difficulty']
      }}
    },
    required:['title','questions']
  }
}
function subjectGuidance(subject){
  if(subject==='trade')return 'Use the supplied course criteria as the source of truth. Test or teach authentic occupational knowledge, skills and judgement relevant to those criteria.';
  if(subject==='epa')return 'Use the supplied apprenticeship criteria as the source of truth. Focus on applying and explaining those criteria in realistic end-point-assessment style scenarios. Do not invent assessment methods that were not supplied.';
  if(subject==='maths')return 'Use practical UK apprenticeship maths: measurement, area, volume, ratio, percentages, estimation, scale, tolerances and calculations appropriate to the supplied course context. Keep arithmetic correct.';
  if(subject==='english')return 'Use practical UK apprenticeship English: reading instructions, extracting meaning, vocabulary, spelling, grammar, concise workplace writing and communication in the supplied course context.';
  if(subject==='edi')return 'Teach or test workplace equality, diversity and inclusion using respectful, practical UK workplace scenarios. Focus on fair treatment, inclusive behaviour, challenging assumptions and appropriate workplace action.';
  return 'The learner has typed what they want to learn or be tested on. Infer whether their request is Trade, Maths, English, EDI or EPA and stay strictly within apprenticeship learning. For course-specific Trade or EPA requests, use the supplied course criteria as the source of truth. For Maths, English or EDI requests, keep examples practical and relevant to apprenticeship work. Follow the learner request closely and do not drift to an unrelated topic.'
}
function systemPrompt(mode,subject){
  const common=`You are the tightly-scoped Teach/Test engine for Evia, a UK apprenticeship learning app. Your ONLY role is educational teaching and testing. You cannot control the app, alter progress, evidence, attendance, portfolios, settings, QR data or learner records. Never ask for or infer a learner name, employer, contact details or other identifying information. ${subjectGuidance(subject)} Use British English. Keep content concise, accurate and natural. Do not merely rewrite the official criterion as a sentence. Do not use repetitive stock answers. Wrong answers must be plausible but clearly less correct. Do not invent KSB/AC codes. When mappings are supplied, mappedTo values must come from those supplied codes where possible.`;
  if(mode==='teach')return `${common} Produce one short teaching sequence. Choose one useful focus. Give 3 or 4 short teaching messages that explain the idea, show how it applies and highlight a common mistake or check. Do not turn it into a lecture.`;
  return `${common} Produce exactly 5 multiple-choice questions. Each question must have exactly 4 answer options and exactly one best answer. Vary the correct answer position. Across the 5 questions, vary the scenario and concept. Do not repeat the same correct-answer wording. Explanations should briefly say why the selected answer is strongest.`
}
function buildUserPrompt(mode,subject,course,focus){
  const criteria=course.criteria.map(item=>({code:item.code,label:item.label,path:item.path,requirement:item.requirement}));
  const payload={mode,subject,course:{courseId:course.courseId,courseTitle:course.courseTitle,courseType:course.courseType,level:course.level},criteria};
  if(focus&&typeof focus==='object')payload.focus={title:clean(focus.title,240),focus:clean(focus.focus,400),mappedTo:Array.isArray(focus.mappedTo)?focus.mappedTo.map(v=>clean(v,40)).filter(Boolean).slice(0,4):[]};
  return `Create the requested Evia content from this approved context only:\n${JSON.stringify(payload)}`
}
function parseAiResponse(result){
  const value=result&&Object.prototype.hasOwnProperty.call(result,'response')?result.response:result;
  if(value&&typeof value==='object')return value;
  if(typeof value==='string')return JSON.parse(value);
  throw new Error('Workers AI returned an unsupported response.')
}
function filterMappings(values,course,subject){
  const list=Array.isArray(values)?values.map(v=>clean(v,40)).filter(Boolean):[];
  if(subject!=='trade'&&subject!=='epa'&&subject!=='ask')return[];
  const allowed=new Set(course.criteria.map(item=>clean(item.code,40)).filter(Boolean).map(v=>v.toLowerCase()));
  if(!allowed.size)return[];
  return list.filter(value=>allowed.has(value.toLowerCase())).slice(0,4)
}
function validateTeach(data,course,subject){
  const teaching=Array.isArray(data?.teaching)?data.teaching.map(v=>clean(v,800)).filter(Boolean).slice(0,4):[];
  if(teaching.length<3)throw new Error('Teach response did not contain enough teaching points.');
  return{title:clean(data?.title,240),focus:clean(data?.focus,500),mappedTo:filterMappings(data?.mappedTo,course,subject),teaching}
}
function validateTest(data,course,subject){
  if(!Array.isArray(data?.questions)||data.questions.length<5)throw new Error('Test response did not contain five questions.');
  const questions=data.questions.slice(0,5).map((q,index)=>{
    const answers=Array.isArray(q?.answers)?q.answers.map(v=>clean(v,700)):[];
    const correct=Number(q?.correct);
    if(!clean(q?.question,1000)||answers.length!==4||!Number.isInteger(correct)||correct<0||correct>3)throw new Error(`Invalid question ${index+1}.`);
    return{question:clean(q.question,1000),answers,correct,explanation:clean(q?.explanation,700),mappedTo:filterMappings(q?.mappedTo,course,subject),difficulty:['developing','competent','stretch'].includes(clean(q?.difficulty).toLowerCase())?clean(q.difficulty).toLowerCase():'competent'}
  });
  const correctTexts=questions.map(q=>q.answers[q.correct].toLowerCase());
  if(new Set(correctTexts).size!==questions.length)throw new Error('Workers AI repeated a correct answer.');
  return{title:clean(data?.title,240),questions}
}

export default{
  async fetch(request,env){
    const cors=corsHeaders(request,env);
    if(request.method==='OPTIONS')return new Response(null,{status:204,headers:{...cors,'access-control-allow-methods':'POST, OPTIONS','access-control-allow-headers':'content-type','access-control-max-age':'86400'}});
    const url=new URL(request.url);
    if(request.method==='GET'&&url.pathname.endsWith('/health'))return json({ok:true,service:'evia-teach-test',scope:'teach-test-only',model:clean(env.MODEL||DEFAULT_MODEL,200)},200,cors);
    if(request.method!=='POST'||!url.pathname.endsWith('/v1/teach-test'))return json({ok:false,error:'Not found.'},404,cors);
    const origin=request.headers.get('origin')||'';
    const allowed=clean(env.ALLOWED_ORIGIN||'https://ddrnfinch.github.io',300);
    if(origin&&origin!==allowed&&origin!=='http://localhost:8787'&&origin!=='http://127.0.0.1:8787')return json({ok:false,error:'Origin not allowed.'},403,cors);
    const length=Number(request.headers.get('content-length')||0);if(length>100000)return json({ok:false,error:'Request too large.'},413,cors);
    let body;try{body=await request.json()}catch{return json({ok:false,error:'Invalid JSON.'},400,cors)}
    const mode=clean(body?.mode).toLowerCase(),subject=clean(body?.subject).toLowerCase();
    if(!MODES.has(mode)||!SUBJECTS.has(subject))return json({ok:false,error:'Unsupported Teach/Test request.'},400,cors);
    const course=sanitizeCourse(body?.course||{}),focus=body?.focus&&typeof body.focus==='object'?body.focus:null;
    if((subject==='trade'||subject==='epa')&&!course.criteria.length)return json({ok:false,error:'This course does not contain enough mapped criteria for AI Teach/Test yet.'},400,cors);
    const schema=schemaFor(mode),model=clean(env.MODEL||DEFAULT_MODEL,200)||DEFAULT_MODEL;
    try{
      const result=await env.AI.run(model,{
        messages:[{role:'system',content:systemPrompt(mode,subject)},{role:'user',content:buildUserPrompt(mode,subject,course,focus)}],
        response_format:{type:'json_schema',json_schema:schema},
        max_tokens:mode==='test'?1500:850,
        temperature:0.45,
        repetition_penalty:1.08
      });
      const parsed=parseAiResponse(result),validated=mode==='test'?validateTest(parsed,course,subject):validateTeach(parsed,course,subject);
      return json({ok:true,mode,subject,...validated},200,cors)
    }catch(error){
      return json({ok:false,error:'Teach/Test AI could not create valid content. Please try again.'},502,cors)
    }
  }
};
