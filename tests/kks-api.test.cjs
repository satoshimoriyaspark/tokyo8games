const {test} = require('node:test');
const assert = require('node:assert/strict');
const handler = require('../api/kks/[endpoint].js');
const player = '11111111-1111-4111-8111-111111111111';
function invoke(overrides = {}) {
  const req = {url:'/api/kks/profile', method:'GET', headers:{host:'tokyo8games.com'}, ...overrides};
  const res = {headers:{}, statusCode:200, setHeader(k,v){this.headers[k]=v;}, status(n){this.statusCode=n;return this;}, json(data){this.data=data;return this;}};
  return handler(req,res).then(()=>res);
}
test('ranking gateway preserves identity, isolates cookies, and validates mutations', async t => {
  const originalFetch = global.fetch;
  t.after(()=>{global.fetch=originalFetch;});
  const calls=[];
  global.fetch=async(url,options)=>{
    calls.push({url:new URL(url),options});
    return Response.json({name:'ゲスト'}, {headers:{'set-cookie':`karuta_player=${player}; Path=/; Secure; HttpOnly; SameSite=Lax`}});
  };
  const profile=await invoke({headers:{host:'tokyo8games.com',cookie:`unrelated=private; karuta_player=${player}`}});
  assert.equal(profile.statusCode,200);
  assert.equal(profile.headers['Cache-Control'],'private, no-store');
  assert.equal(calls[0].options.headers.cookie,`karuta_player=${player}`);
  assert.match(profile.headers['Set-Cookie'],/Path=\/api\/kks; Secure; HttpOnly; SameSite=Lax/);
  assert.equal(calls[0].options.redirect,'error');
  const postHeaders={host:'tokyo8games.com',origin:'https://tokyo8games.com','content-type':'application/json','sec-fetch-site':'same-origin'};
  const run=await invoke({url:'/api/kks/runs',method:'POST',headers:postHeaders,body:{count:12,speed:'1'}});
  assert.equal(run.statusCode,200);
  assert.equal(calls.at(-1).url.pathname,'/api/runs');
  assert.deepEqual(JSON.parse(calls.at(-1).options.body),{count:12,speed:'1'});
  await invoke({url:'/api/kks/leaderboard?count=44&speed=1.15&target=https://example.org'});
  assert.equal(calls.at(-1).url.search,'?count=44&speed=1.15');
  const prior=calls.length;
  assert.equal((await invoke({url:'/api/kks/runs',method:'POST',headers:{...postHeaders,origin:'https://other.example'},body:{}})).statusCode,403);
  assert.equal((await invoke({url:'/api/kks/runs',method:'POST',headers:{...postHeaders,'sec-fetch-site':'cross-site'},body:{}})).statusCode,403);
  assert.equal((await invoke({url:'/api/kks/unknown'})).statusCode,404);
  assert.equal((await invoke({url:'/api/kks/runs',method:'DELETE'})).statusCode,405);
  assert.equal((await invoke({url:'/api/kks/runs',method:'POST',headers:postHeaders,body:'{'})).statusCode,400);
  assert.equal((await invoke({url:'/api/kks/runs',method:'POST',headers:postHeaders,body:{x:'x'.repeat(24001)}})).statusCode,413);
  assert.equal(calls.length,prior);
  global.fetch=async()=>new Response('<html>Login</html>',{headers:{'content-type':'text/html'}});
  const unavailable=await invoke();
  assert.equal(unavailable.statusCode,503);
  assert.ok(!JSON.stringify(unavailable.data).includes('chatgpt.site'));
  assert.ok(!unavailable.headers.Location);
});
