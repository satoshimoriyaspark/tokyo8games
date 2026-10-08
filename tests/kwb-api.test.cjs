const {test, afterEach} = require('node:test');
const assert = require('node:assert/strict');
const handler = require('../api/kwb/scores.js');
const originalFetch = global.fetch;
afterEach(() => { global.fetch = originalFetch; });
function response() {
  return {headers: {}, code: 200, setHeader(k,v) {this.headers[k]=v;}, status(c) {this.code=c;return this;}, json(d) {this.data=d;return this;}};
}
test('ranking reads use the fixed data endpoint without forwarding cookies or redirects', async () => {
  let call;
  global.fetch = async (url, options) => {call={url,options};return new Response(JSON.stringify({top10: [{nickname:'テスト',score:10}]}),{headers:{'content-type':'application/json'}});};
  const res = response();
  await handler({method:'GET',headers:{host:'tokyo8games.com',cookie:'unrelated=secret'},url:'/api/kwb/scores?url=https://invalid.example'}, res);
  assert.equal(res.code,200);
  assert.equal(call.url,'https://kameari-wasshoi-battle2.vercel.app/api/scores');
  assert.equal(call.options.headers.cookie,undefined);
  assert.equal(call.options.redirect,'error');
  assert.equal(res.data.top10[0].score,10);
  assert.equal(res.headers['Cache-Control'],'private, no-store');
});
test('valid same-origin score preserves the response and forwards only score fields', async () => {
  let call;
  global.fetch = async (url,options) => {call=options;return new Response(JSON.stringify({id:'test',rank:1}),{status:201,headers:{'content-type':'application/json'}});};
  const res=response();
  await handler({method:'POST',headers:{host:'tokyo8games.com',origin:'https://tokyo8games.com','content-type':'application/json'},body:{nickname:'プレイヤー',team:'東',score:100,unrelated:'ignored'}},res);
  assert.equal(res.code,201);
  assert.deepEqual(JSON.parse(call.body),{nickname:'プレイヤー',team:'東',score:100});
  assert.equal(res.data.rank,1);
});
test('cross-origin writes and invalid scores never reach the data service', async () => {
  global.fetch=async()=>{throw Error('must not call upstream');};
  const headers={host:'tokyo8games.com',origin:'https://tokyo8games.com','content-type':'application/json'};
  for (const [overrides,expected] of [[{headers:{...headers,origin:'https://invalid.example'}},403],[{body:{team:'東',score:-1}},400],[{body:'{'},400],[{method:'DELETE'},405]]) {
    const res=response();
    await handler({method:'POST',headers,body:{team:'東',score:10},...overrides},res);
    assert.equal(res.code,expected);
  }
});
test('upstream failure returns a local JSON error without a Location header', async () => {
  global.fetch=async()=>new Response('<html>error</html>',{headers:{'content-type':'text/html'}});
  const res=response();
  await handler({method:'GET',headers:{host:'tokyo8games.com'}},res);
  assert.equal(res.code,503);
  assert.equal(res.headers.Location,undefined);
  assert.ok(res.data.error);
});
