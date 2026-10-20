// Regression tests for the Qloo adapter's trace classification (src/qloo.mjs), wholly offline.
// History, from the live-site review: cached calls whose first live attempt was an HTTP 400
// used to be counted as "cache"; they are "skip" (Qloo cannot use that item as a taste signal)
// and must stay "skip" for the whole TTL, so the tally on screen matches the rows. One of each
// is pinned here with a stubbed fetch — no network, no key, no Qloo data, just the contract.
import test from 'node:test';
import assert from 'node:assert/strict';
import { createQloo } from '../src/qloo.mjs';

const ENT = JSON.stringify({ results: [{ entity_id: 'e-pacino', name: 'Al Pacino' }] });
const SOFT_400 = JSON.stringify({ errors: [{ message: 'All of the provided signal.interests.entities values are invalid.' }] });
const HARD_400 = JSON.stringify({ errors: [{ message: 'Server exploded badly.' }] });

function stub() {
  const calls = [];
  const fetchImpl = async (url) => {
    calls.push(String(url));
    if (url.includes('/search')) {
      const nobody = url.includes('Nobody');
      const body = nobody ? JSON.stringify({ results: [] }) : ENT;
      return { ok: true, status: 200, text: async () => body, json: async () => JSON.parse(body), headers: { get: () => null } };
    }
    return { ok: false, status: 400, text: async () => SOFT_400, json: async () => JSON.parse(SOFT_400), headers: { get: () => null } };
  };
  return { calls, fetchImpl };
}

test('a soft skip (signal.interests.entities 400) is labelled skip, cached as skip, and stays skip on later hits', async () => {
  const { fetchImpl } = stub();
  const q = createQloo({ apiKey: 'stub-key', fetchImpl, ttlMs: 3_600_000, gapMs: 0 });
  await q.resolve('person', 'Al Pacino');
  const i1 = await q.related('person', ['e-pacino'], ['Al Pacino']);
  assert.equal(i1.trace.source, 'skip');
  assert.match(i1.trace.error, /signal\.interests\.entities/);
  const i2 = await q.related('person', ['e-pacino'], ['Al Pacino']);
  assert.equal(i2.trace.source, 'skip');
  assert.equal(i2.trace.ms, 0);
  assert.equal(i2.value, i1.value); // cached value, same shape
});

test('a hard 400 is labelled error, never cached — the retry re-asks live', async () => {
  let soft = false;
  const insightCalls = [];
  const fetchImpl = async (url) => {
    if (String(url).includes('/search')) {
      return { ok: true, status: 200, text: async () => ENT, json: async () => JSON.parse(ENT), headers: { get: () => null } };
    }
    insightCalls.push(String(url));
    const body = soft ? SOFT_400 : HARD_400;
    return { ok: false, status: 400, text: async () => body, json: async () => JSON.parse(body), headers: { get: () => null } };
  };
  const q = createQloo({ apiKey: 'stub-key', fetchImpl, ttlMs: 3_600_000, gapMs: 0 });
  await q.resolve('person', 'Al Pacino');
  const e1 = await q.related('person', ['e-pacino'], ['Al Pacino']);
  assert.equal(e1.trace.source, 'error');
  soft = true; // a later attempt succeeding proves the error was not cached
  const e2 = await q.related('person', ['e-pacino'], ['Al Pacino']);
  assert.equal(e2.trace.source, 'skip');
  assert.equal(insightCalls.length, 2);
});

test('live trace summaries name what came back (id-free), so a row can be tied to its result', async () => {
  const { fetchImpl } = stub();
  const q = createQloo({ apiKey: 'stub-key', fetchImpl, ttlMs: 3_600_000, gapMs: 0 });
  const r = await q.resolve('person', 'Al Pacino');
  assert.equal(r.trace.result, 'matched: Al Pacino');
  const r2 = await q.resolve('person', 'Nobody At All');
  assert.ok(r2.trace.result === 'no match' || r2.trace.result === 'no results', r2.trace.result);
});

test('fixture mode is only reachable without a key — a stubbed live mode never answers from fixtures', async () => {
  const { fetchImpl } = stub();
  const q = createQloo({ apiKey: 'stub-key', fetchImpl, ttlMs: 3_600_000, gapMs: 0 });
  const r = await q.resolve('movie', 'Perfect Days');
  assert.notEqual(r.trace.source, 'fixture');
  assert.equal(r.trace.source, 'live');
});
