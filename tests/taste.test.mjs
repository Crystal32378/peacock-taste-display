import test from 'node:test';
import assert from 'node:assert/strict';
import { createQloo, extractEntities } from '../src/qloo.mjs';
import { compare, cleanFeathers } from '../src/taste.mjs';
import { cast, viewer } from '../data/cast.js';

const qloo = createQloo({ apiKey: '' });
const byId = (id) => cast.find((c) => c.id === id);
const run = (id) => compare(viewer, byId(id), qloo);

test('fixture mode is labelled as fixture, never as live', async () => {
  const r = await run('mira');
  assert.equal(r.mode, 'fixture');
  assert.ok(r.trace.every((t) => ['fixture', 'cache'].includes(t.source)));
});

test('Mira: four feathers meet, tail shivers, no score field anywhere', async () => {
  const r = await run('mira');
  assert.deepEqual(r.resonant.sort(), ['artist', 'book', 'brand', 'place']);
  assert.equal(r.verdict, 'shiver');
  assert.ok(!JSON.stringify(r).match(/score|compatib|percent|match_?rate/i));
});

test('Lin: five feathers meet (one via Qloo neighbor) => swoon', async () => {
  const r = await run('lin');
  assert.equal(r.verdict, 'swoon');
  assert.equal(r.feathers.find((f) => f.type === 'destination').state, 'neighbor');
});

test('Ren: only taste neighbors, still shivers (the Qloo-essential case)', async () => {
  const r = await run('ren');
  assert.equal(r.verdict, 'shiver');
  assert.ok(r.feathers.filter((f) => f.state === 'same').length === 0);
  assert.ok(r.feathers.filter((f) => f.state === 'neighbor').length >= 3);
});

test('Dax: a flicker on one feather, then a bridge', async () => {
  const r = await run('dax');
  assert.equal(r.verdict, 'flicker');
  assert.deepEqual(r.resonant, ['video_game']);
  assert.ok(r.bridge);
});

test('Theo: nothing meets, peacock folds, but offers a bridge feather', async () => {
  const r = await run('theo');
  assert.equal(r.verdict, 'fold');
  assert.deepEqual(r.resonant, []);
  assert.equal(r.bridge.type, 'place');
  assert.equal(r.bridge.item, 'Kinokuniya Bookstore');
  assert.equal(r.bridge.kind, 'theirs');
});

test('cleanFeathers trims, caps and drops unknown types', () => {
  const c = cleanFeathers({ artist: ['  A ', '', 'B', 'C', 'D'], nonsense: ['x'], book: 'nope' });
  assert.deepEqual(c, { artist: ['A', 'B', 'C'] });
});

test('live mode: sends X-Api-Key, parses results, labels source live', async () => {
  const seen = [];
  const fetchImpl = async (url, init) => {
    seen.push({ url, key: init.headers['X-Api-Key'] });
    if (url.includes('/search')) return { ok: true, json: async () => ({ results: [{ entity_id: 'E1', name: 'Brian Eno' }] }) };
    return { ok: true, json: async () => ({ results: { entities: [{ entity_id: 'E2', name: 'Harold Budd', query: { affinity: 0.81 } }] } }) };
  };
  const q = createQloo({ apiKey: 'k_test', fetchImpl });
  const a = await q.resolve('artist', 'Brian Eno');
  const b = await q.related('artist', [a.value.id], ['Brian Eno']);
  assert.equal(seen[0].key, 'k_test');
  assert.equal(a.trace.source, 'live');
  assert.deepEqual(b.value, [{ id: 'E2', name: 'Harold Budd', affinity: 0.81 }]);
  assert.match(seen[1].url, /filter\.type=urn%3Aentity%3Aartist/);
});

test('live failure falls back to fixture and says so', async () => {
  const q = createQloo({ apiKey: 'k_test', fetchImpl: async () => ({ ok: false, status: 500 }) });
  const r = await q.resolve('artist', 'Brian Eno');
  assert.equal(r.trace.source, 'fallback');
  assert.match(r.trace.error, /500/);
});

test('429 is retried then succeeds; 400 carries the reply text from Qloo', async () => {
  let n = 0;
  const q = createQloo({ apiKey: 'k_test', gapMs: 0, fetchImpl: async () => (++n < 3
    ? { ok: false, status: 429, headers: { get: () => '0.01' }, text: async () => 'slow down' }
    : { ok: true, status: 200, json: async () => ({ results: [{ entity_id: 'E1', name: 'Brian Eno' }] }) }) });
  const r = await q.resolve('artist', 'Brian Eno');
  assert.equal(r.trace.source, 'live'); assert.equal(r.value.id, 'E1'); assert.equal(n, 3);
  const q2 = createQloo({ apiKey: 'k_test', gapMs: 0, fetchImpl: async () => ({ ok: false, status: 400, text: async () => 'bad type urn:x' }) });
  const r2 = await q2.resolve('video_game', 'Hades');
  assert.equal(r2.trace.source, 'fallback'); assert.match(r2.trace.error, /400: bad type/);
});

test('games: /search uses videogame, /v2/insights uses video_game', async () => {
  const seen = [];
  const q = createQloo({ apiKey: 'k_test', gapMs: 0, fetchImpl: async (u) => { seen.push(u); return { ok: true, status: 200, json: async () => ({ results: [{ entity_id: 'G1', name: 'Hades' }] }) }; } });
  await q.resolve('video_game', 'Hades'); await q.related('video_game', ['G1'], ['Hades']);
  assert.match(seen[0], /\/search.*types=urn%3Aentity%3Avideogame(&|$)/);
  assert.match(seen[1], /filter\.type=urn%3Aentity%3Avideo_game(&|$)/);
});

test('extractEntities tolerates both envelope shapes', () => {
  assert.equal(extractEntities({ results: [{ id: 'a', name: 'A' }] })[0].id, 'a');
  assert.equal(extractEntities({ results: { entities: [{ entity_id: 'b', name: 'B' }] } })[0].id, 'b');
  assert.deepEqual(extractEntities({}), []);
});

test('favorite: an identical item beats a neighbour; folded tails have none', async () => {
  const mira = await run('mira');
  assert.equal(mira.favorite.kind, 'same');
  const ren = await run('ren');
  assert.equal(ren.favorite.kind, 'neighbor');
  assert.ok(!('affinity' in ren.favorite));
  const theo = await run('theo');
  assert.ok(theo.favorite === null || theo.favorite.kind === 'neighbor');
});

import { enumerateLines } from '../scripts/voice-lines.mjs';
test('voice lines: unique ids, no leftover placeholders, both languages covered', () => {
  const all = enumerateLines();
  assert.equal(new Set(all.map((l) => l.id)).size, all.length);
  assert.ok(all.every((l) => l.text.length > 8 && !l.text.includes('{cat}')));
  assert.ok(all.some((l) => l.id === 'en.friend.fold.1.podcast' && /your podcast list/.test(l.text)));
  assert.ok(enumerateLines(['zh']).every((l) => l.lang === 'zh'));
});
