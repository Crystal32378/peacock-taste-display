import test from 'node:test';
import assert from 'node:assert/strict';
import { server } from '../server.mjs';

let base;
test.before(async () => { await new Promise((r) => server.listen(0, r)); base = `http://localhost:${server.address().port}`; });
test.after(() => server.close());
const rpc = (method, params) => fetch(base + '/mcp', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ jsonrpc: '2.0', id: 1, method, params }) }).then((r) => r.json());

test('health reports fixture mode without a key', async () => {
  const h = await fetch(base + '/health').then((r) => r.json());
  assert.equal(h.ok, true);
  assert.equal(h.qloo, 'fixture');
});

test('POST /api/display returns a verdict and never a score', async () => {
  const r = await fetch(base + '/api/display', { method: 'POST', body: JSON.stringify({ profileId: 'lin' }) }).then((x) => x.json());
  assert.equal(r.verdict, 'swoon');
  assert.ok(!/score|compatib/i.test(JSON.stringify({ ...r, note: undefined })));
});

test('unknown profile -> 404 with help', async () => {
  const res = await fetch(base + '/api/display', { method: 'POST', body: JSON.stringify({ profileId: 'nobody' }) });
  assert.equal(res.status, 404);
});

test('MCP: tools/list and open_display', async () => {
  const l = await rpc('tools/list');
  assert.deepEqual(l.result.tools.map((t) => t.name), ['list_cast', 'open_display', 'bridge_feather']);
  const c = await rpc('tools/call', { name: 'open_display', arguments: { profileId: 'theo' } });
  assert.equal(c.result.structuredContent.verdict, 'fold');
  const b = await rpc('tools/call', { name: 'bridge_feather', arguments: { profileId: 'theo' } });
  assert.equal(b.result.structuredContent.bridge.item, 'Kinokuniya Bookstore');
});

test('static path traversal is refused', async () => {
  const res = await fetch(base + '/..%2Fpackage.json');
  assert.notEqual(res.status, 200);
});
