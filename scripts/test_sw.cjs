const {test}=require('node:test');
const assert=require('node:assert/strict');
const vm=require('node:vm'),fs=require('node:fs');
function worker({offline=false,saved=null,status=200,quota=false}={}){
 const handlers={},deleted=[],stored=[];
 const context={URL,Response,fetch:async()=>{if(offline)throw Error('offline');return new Response('network',{status});},caches:{keys:async()=>['ai-for-life-v1','ai-for-life-v2','other-app'],delete:async key=>deleted.push(key),open:async()=>({match:async()=>saved,put:async(r,s)=>{if(quota)throw Error('quota');stored.push(s);}})},self:{location:{origin:'https://example.test'},clients:{claim:async()=>{}},skipWaiting:async()=>{},addEventListener:(name,handler)=>handlers[name]=handler}};
 vm.runInNewContext(fs.readFileSync(require('node:path').join(__dirname,'../sw.js'),'utf8'),context);
 return {deleted,stored,activate:()=>{let p;handlers.activate({waitUntil:v=>p=v});return p;},fetch:(pathname,mode='navigate')=>{let p;handlers.fetch({request:{url:'https://example.test'+pathname,method:'GET',mode,headers:new Headers()},respondWith:v=>p=v});return p;}};
}
test('uncached offline navigation and assets return real responses',async()=>{const w=worker({offline:true});assert.equal((await w.fetch('/missing')).status,503);assert.match(await (await w.fetch('/missing')).text(),/not saved offline/);assert.equal((await w.fetch('/missing.css','cors')).status,503)});
test('cached offline page is served',async()=>{const w=worker({offline:true,saved:new Response('saved')});assert.equal(await (await w.fetch('/')).text(),'saved')});
test('cache update only stores successful responses',async()=>{const good=worker();await good.fetch('/');assert.equal(good.stored.length,1);const bad=worker({status:404});assert.equal((await bad.fetch('/')).status,404);assert.equal(bad.stored.length,0);const full=worker({quota:true});assert.equal((await full.fetch('/')).status,200)});
test('activation removes only old caches owned by this site',async()=>{const w=worker();await w.activate();assert.deepEqual(w.deleted,['ai-for-life-v1'])});
test('live announcements and video bypass the cache',()=>{const w=worker();assert.equal(w.fetch('/meetings.json'),undefined);assert.equal(w.fetch('/header.mp4'),undefined)});
