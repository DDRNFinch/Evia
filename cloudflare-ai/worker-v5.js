import epaWorker from './worker-v4.js';

const DEFAULT_EPA_MODEL='@cf/nvidia/nemotron-3-120b-a12b';
const DEFAULT_EPA_FALLBACK_MODEL='@cf/zai-org/glm-4.7-flash';
const DEFAULT_STRUCTURED_FALLBACK_MODEL='@cf/meta/llama-3.1-8b-instruct-fast';
const EPA_ENGINE_VERSION='native-json-fallback-v1';

function clean(value,max=4000){return String(value??'').replace(/\s+/g,' ').trim().slice(0,max)}
function jsonText(value){
  if(Array.isArray(value))value=value.map(part=>typeof part==='string'?part:(part?.text??part?.content??'')).join('');
  if(typeof value!=='string')return null;
  let text=value.trim();
  if(!text)return null;
  text=text.replace(/^```(?:json)?\s*/i,'').replace(/\s*```$/,'').trim();
  try{return JSON.parse(text)}catch{}
  const first=text.indexOf('{'),last=text.lastIndexOf('}');
  if(first>=0&&last>first){try{return JSON.parse(text.slice(first,last+1))}catch{}}
  return null;
}
function parseResult(result){
  const choices=result?.choices;
  const message=choices?.[0]?.message;
  const candidates=[
    result?.response,
    message?.content,
    choices?.[0]?.text,
    result?.output_text,
    result?.result?.response,
    result?.result?.choices?.[0]?.message?.content
  ];
  for(const candidate of candidates){
    if(candidate&&typeof candidate==='object'&&!Array.isArray(candidate))return candidate;
    const parsed=jsonText(candidate);if(parsed&&typeof parsed==='object')return parsed;
  }
  if(result&&typeof result==='object'&&!Array.isArray(result)){
    const likely=['question','questions','overall','strengths','summary'];
    if(likely.some(key=>Object.prototype.hasOwnProperty.call(result,key)))return result;
  }
  throw new Error('Workers AI returned an unsupported response.');
}
function schemaMatches(value,schema){
  if(!schema||typeof schema!=='object')return true;
  if(schema.enum&&!schema.enum.includes(value))return false;
  if(schema.type==='object'){
    if(!value||typeof value!=='object'||Array.isArray(value))return false;
    if(Array.isArray(schema.required)&&schema.required.some(key=>!Object.prototype.hasOwnProperty.call(value,key)))return false;
    for(const [key,child] of Object.entries(schema.properties||{}))if(Object.prototype.hasOwnProperty.call(value,key)&&!schemaMatches(value[key],child))return false;
    return true;
  }
  if(schema.type==='array'){
    if(!Array.isArray(value))return false;
    if(Number.isFinite(schema.minItems)&&value.length<schema.minItems)return false;
    if(Number.isFinite(schema.maxItems)&&value.length>schema.maxItems)return false;
    return !schema.items||value.every(item=>schemaMatches(item,schema.items));
  }
  if(schema.type==='string')return typeof value==='string';
  if(schema.type==='integer')return Number.isInteger(value)&&(!Number.isFinite(schema.minimum)||value>=schema.minimum)&&(!Number.isFinite(schema.maximum)||value<=schema.maximum);
  if(schema.type==='number')return typeof value==='number'&&Number.isFinite(value);
  if(schema.type==='boolean')return typeof value==='boolean';
  return true;
}
function nativeInput(input,schema){
  const next={...input};delete next.response_format;
  const contract=`Return one JSON object only, with no markdown or commentary. It must match this JSON Schema exactly: ${JSON.stringify(schema)}`;
  const messages=Array.isArray(input?.messages)?input.messages.map(message=>({...message})):[];
  const systemIndex=messages.findIndex(message=>message?.role==='system');
  if(systemIndex>=0)messages[systemIndex].content=`${messages[systemIndex].content||''}\n\n${contract}`;
  else messages.unshift({role:'system',content:contract});
  next.messages=messages;
  return next;
}
function structuredInput(input){
  return{
    messages:input?.messages,
    response_format:input?.response_format,
    max_tokens:input?.max_tokens||input?.max_completion_tokens||1200,
    temperature:input?.temperature
  };
}
function wrapAi(env){
  const real=env.AI;
  const primary=clean(env.EPA_MODEL||DEFAULT_EPA_MODEL,200)||DEFAULT_EPA_MODEL;
  const secondary=clean(env.EPA_FALLBACK_MODEL||DEFAULT_EPA_FALLBACK_MODEL,200)||DEFAULT_EPA_FALLBACK_MODEL;
  const structured=clean(env.EPA_STRUCTURED_FALLBACK_MODEL||DEFAULT_STRUCTURED_FALLBACK_MODEL,200)||DEFAULT_STRUCTURED_FALLBACK_MODEL;
  return{
    async run(model,input={}){
      if(model!==primary&&model!==secondary)return real.run(model,input);
      const schema=input?.response_format?.json_schema;
      if(!schema)return real.run(model,input);
      try{
        const result=await real.run(model,nativeInput(input,schema));
        const data=parseResult(result);
        if(!schemaMatches(data,schema))throw new Error('EPA AI returned JSON that did not match the required shape.');
        return{response:data};
      }catch(error){
        if(model!==secondary||structured===secondary)throw error;
        const result=await real.run(structured,structuredInput(input));
        const data=parseResult(result);
        if(!schemaMatches(data,schema))throw new Error('EPA structured fallback returned invalid JSON.');
        return{response:data};
      }
    }
  };
}
function wrappedEnv(env){const ai=wrapAi(env);return new Proxy(env,{get(target,prop){return prop==='AI'?ai:Reflect.get(target,prop)}})}

export default{
  async fetch(request,env,ctx){
    const response=await epaWorker.fetch(request,wrappedEnv(env),ctx);
    const url=new URL(request.url);
    if(request.method==='GET'&&url.pathname.endsWith('/health')&&response.ok){
      try{
        const body=await response.json();
        return new Response(JSON.stringify({...body,epaEngineVersion:EPA_ENGINE_VERSION,epaStructuredFallbackModel:clean(env.EPA_STRUCTURED_FALLBACK_MODEL||DEFAULT_STRUCTURED_FALLBACK_MODEL,200)}),{status:response.status,headers:response.headers});
      }catch{}
    }
    return response;
  }
};
