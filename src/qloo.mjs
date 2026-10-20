// Qloo adapter. Two modes, and it always says which one answered:
//   live    -> QLOO_API_KEY is set; calls Qloo (header X-Api-Key).
//   fixture -> no key; answers from data/fixtures.js (offline demo / tests).
// If a live call fails, we fall back to the fixture AND mark the trace entry
// source:"fallback" with the error, so the UI never pretends a fixture was Qloo.
//
// NOTE for maintainers: the live request/response shapes below follow Qloo's
// public hackathon examples (GET /search, GET /v2/insights). Qloo's docs were
// not readable when this was written (URNs, base URL, header and GET style were later checked against the official hackathon developer guide, 2026-10-18); response parsing is still deliberately tolerant and
// `npm run qloo:smoke` prints the raw response to verify against reality.
import { fixtureResolve, fixtureRelated } from '../data/fixtures.js';

export const TYPES = ['movie', 'tv_show', 'artist', 'book', 'place', 'destination', 'podcast', 'video_game', 'brand', 'person'];

// Qloo entity URNs. Overridable (QLOO_URN_<TYPE>) in case the docs differ.
export const URN = {
  movie: 'urn:entity:movie',
  tv_show: 'urn:entity:tv_show',
  artist: 'urn:entity:artist',
  book: 'urn:entity:book',
  place: 'urn:entity:place',
  destination: 'urn:entity:destination',
  podcast: 'urn:entity:podcast',
  video_game: 'urn:entity:video_game',
  brand: 'urn:entity:brand',
  person: 'urn:entity:person',
};
const urn = (type) => process.env[`QLOO_URN_${type.toUpperCase()}`] || URN[type];

export const norm = (s) => String(s ?? '').toLowerCase().normalize('NFKD').replace(/[^\p{L}\p{N}]+/gu, '');

// Pull a list of entities out of whatever envelope Qloo returns.
export function extractEntities(json) {
  const r = json?.results;
  const arr = Array.isArray(r) ? r : Array.isArray(r?.entities) ? r.entities : Array.isArray(json?.entities) ? json.entities : [];
  return arr
    .map((e) => ({
      id: e.entity_id ?? e.id ?? null,
      name: e.name ?? e.title ?? null,
      affinity: typeof e.query?.affinity === 'number' ? e.query.affinity : typeof e.affinity === 'number' ? e.affinity : null,
    }))
    .filter((e) => e.name);
}

export function createQloo(opts = {}) {
  const apiKey = opts.apiKey ?? process.env.QLOO_API_KEY ?? '';
  const baseUrl = (opts.baseUrl ?? process.env.QLOO_BASE_URL ?? 'https://hackathon.api.qloo.com').replace(/\/$/, '');
  const fetchImpl = opts.fetchImpl ?? globalThis.fetch;
  const timeoutMs = opts.timeoutMs ?? 8000;
  const ttlMs = opts.ttlMs ?? 10 * 60 * 1000;
  const cache = new Map();

  const mode = () => (apiKey ? 'live' : 'fixture');

  async function liveGet(pathAndQuery) {
    const ctl = new AbortController();
    const timer = setTimeout(() => ctl.abort(), timeoutMs);
    try {
      const res = await fetchImpl(baseUrl + pathAndQuery, { headers: { 'X-Api-Key': apiKey, Accept: 'application/json' }, signal: ctl.signal });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.json();
    } finally {
      clearTimeout(timer);
    }
  }

  // Run `live()` (if keyed), else/after failure run `fx()`. Always returns {value, trace}.
  async function run(key, label, live, fx) {
    const hit = cache.get(key);
    if (hit && Date.now() - hit.t < ttlMs) return { value: hit.value, trace: { ...hit.trace, source: 'cache', ms: 0 } };
    const t0 = Date.now();
    let value, trace;
    if (mode() === 'live') {
      try {
        value = await live();
        trace = { call: label, source: 'live', ms: Date.now() - t0 };
      } catch (err) {
        value = fx();
        trace = { call: label, source: 'fallback', ms: Date.now() - t0, error: String(err?.message || err) };
      }
    } else {
      value = fx();
      trace = { call: label, source: 'fixture', ms: Date.now() - t0 };
    }
    if (trace.source !== 'fallback') cache.set(key, { t: Date.now(), value, trace });
    return { value, trace };
  }

  // name -> {id, name} | null
  async function resolve(type, name) {
    const q = `/search?query=${encodeURIComponent(name)}&types=${encodeURIComponent(urn(type))}&take=1`;
    return run(`r|${type}|${norm(name)}`, `GET ${q}`, async () => extractEntities(await liveGet(q))[0] ?? null, () => fixtureResolve(type, name));
  }

  // [entity ids] + type -> [{id,name,affinity}]
  // `names` are the human names behind the ids (used only by the fixture).
  async function related(type, ids, names, take = 20) {
    const q = `/v2/insights?filter.type=${encodeURIComponent(urn(type))}&signal.interests.entities=${encodeURIComponent(ids.join(','))}&take=${take}`;
    return run(`i|${type}|${ids.join(',')}`, `GET ${q}`, async () => extractEntities(await liveGet(q)), () => fixtureRelated(type, names));
  }

  // Diagnostic only (used by the token-gated /debug/qloo): raw status + trimmed body. Never includes the key.
  async function probe(pathAndQuery) {
    if (mode() !== 'live') return { status: 0, body: 'no key set' };
    const ctl = new AbortController();
    const timer = setTimeout(() => ctl.abort(), timeoutMs);
    try {
      const res = await fetchImpl(baseUrl + pathAndQuery, { headers: { 'X-Api-Key': apiKey, Accept: 'application/json' }, signal: ctl.signal });
      return { status: res.status, body: (await res.text()).slice(0, 2500) };
    } catch (err) {
      return { status: 0, body: String(err?.message || err) };
    } finally { clearTimeout(timer); }
  }

  return { mode, resolve, related, baseUrl, probe };
}
