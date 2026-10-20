// Taste Display engine.
// For each of the ten feathers (Qloo entity types) it asks one question:
// "does this person's taste in this category meet yours?"
//   same     - the very same thing
//   neighbor - different things, but Qloo says one is a taste neighbor of the other
//   none     - no meeting point
// There is deliberately NO total score between two people. Affinity numbers, when
// present, belong to a single item ("Hades -> Celeste"), never to a person.
import { FEATHER_ORDER } from '../data/cast.js';
import { norm } from './qloo.mjs';

const MAX_PER_TYPE = 3;
const MAX_SIGNALS = 5;

export function cleanFeathers(input) {
  const out = {};
  for (const t of FEATHER_ORDER) {
    const raw = input?.[t];
    if (!Array.isArray(raw)) continue;
    const items = raw.map((s) => String(s ?? '').trim().slice(0, 60)).filter(Boolean).slice(0, MAX_PER_TYPE);
    if (items.length) out[t] = items;
  }
  return out;
}

async function resolveAll(qloo, type, names, trace) {
  const rs = await Promise.all(names.map((n) => qloo.resolve(type, n)));
  rs.forEach((r) => trace.push(r.trace));
  return rs.map((r, i) => ({ name: names[i], entity: r.value }));
}

function findMatch(results, theirResolved) {
  const byId = new Map(results.filter((r) => r.id).map((r) => [r.id, r]));
  const byName = new Map(results.map((r) => [norm(r.name), r]));
  for (const t of theirResolved) {
    const hit = (t.entity?.id && byId.get(t.entity.id)) || byName.get(norm(t.name));
    if (hit) return { item: t.name, affinity: hit.affinity ?? null, from: hit.name };
  }
  return null;
}

export async function compare(viewer, profile, qloo) {
  const trace = [];
  const yoursAll = cleanFeathers(viewer.feathers);
  const theirsAll = cleanFeathers(profile.feathers);

  const feathers = await Promise.all(FEATHER_ORDER.map(async (type) => {
    const yours = yoursAll[type] || [];
    const theirs = theirsAll[type] || [];
    const f = { type, yours, theirs, state: 'none' };
    if (!yours.length || !theirs.length) return f;

    const sameItem = theirs.find((t) => yours.some((y) => norm(y) === norm(t)));
    if (sameItem) return { ...f, state: 'same', item: sameItem };

    const y = (await resolveAll(qloo, type, yours, trace)).filter((r) => r.entity);
    if (!y.length) return f;
    const rel = await qloo.related(type, y.map((r) => r.entity.id), y.map((r) => r.name));
    trace.push(rel.trace);
    const th = await resolveAll(qloo, type, theirs, trace);
    const m = findMatch(rel.value, th);
    return m ? { ...f, state: 'neighbor', item: m.item, via: m.from, affinity: m.affinity } : f;
  }));

  const resonant = feathers.filter((f) => f.state !== 'none').map((f) => f.type);
  const verdict = resonant.length >= 5 ? 'swoon' : resonant.length >= 3 ? 'shiver' : resonant.length >= 1 ? 'flicker' : 'fold';

  let bridge = null;
  if (verdict === 'flicker' || verdict === 'fold') bridge = await findBridge(yoursAll, theirsAll, feathers, qloo, trace);

  // The peacock's favourite: the single strongest link. An identical item beats any neighbour;
  // among neighbours, the one with the highest per-item affinity. Never summed, never shown as a number.
  const strength = (f) => (f.state === 'same' ? 2 : (f.affinity ?? 0.5));
  const lit = feathers.filter((f) => f.state !== 'none').sort((a, b) => strength(b) - strength(a));
  const favorite = lit.length ? { type: lit[0].type, item: lit[0].item, kind: lit[0].state } : null;

  const sources = new Set(trace.map((t) => (t.source === 'cache' || t.source === 'error') ? null : t.source).filter(Boolean));
  const engine = sources.size === 0 ? (qloo.mode()) : sources.size === 1 ? [...sources][0] : 'mixed';
  return { profileId: profile.id, viewerId: viewer.id || 'you', engine, mode: qloo.mode(), feathers, resonant, verdict, favorite, bridge, errors: trace.filter((t) => t.source === 'error').length, trace };
}

// "You and they don't meet on this feather — but here is a door."
// Ask Qloo what you might love in a category where THEY have taste; if one of
// their items shows up, that is the bridge feather.
async function findBridge(yoursAll, theirsAll, feathers, qloo, trace) {
  const candidates = FEATHER_ORDER.filter((t) => (theirsAll[t] || []).length && feathers.find((f) => f.type === t)?.state === 'none');
  if (!candidates.length) return null;

  const signalTypes = FEATHER_ORDER.filter((t) => (yoursAll[t] || []).length).slice(0, MAX_SIGNALS);
  const signals = [];
  for (const t of signalTypes) {
    const r = await qloo.resolve(t, yoursAll[t][0]);
    trace.push(r.trace);
    if (r.value) signals.push({ type: t, name: yoursAll[t][0], id: r.value.id });
  }
  if (!signals.length) return null;

  const tried = await Promise.all(candidates.map(async (type) => {
    // Qloo rejects place/destination signals when asking for people, so leave those out there.
    const sig = type === 'person' ? signals.filter((s) => s.type !== 'place' && s.type !== 'destination') : signals;
    if (!sig.length) return { type, results: [], match: null, shared: null };
    const rel = await qloo.related(type, sig.map((s) => s.id), sig.map((s) => s.name));
    trace.push(rel.trace);
    const th = await resolveAll(qloo, type, theirsAll[type], trace);
    // A door both of you can walk through: recommended from YOUR taste and also from THEIRS in this category.
    let shared = null;
    const theirIds = th.filter((x) => x.entity?.id).map((x) => x.entity.id);
    if (theirIds.length && !findMatch(rel.value, th)) {
      const relT = await qloo.related(type, theirIds, th.map((x) => x.name));
      trace.push(relT.trace);
      const mine = new Set([...Object.values(yoursAll).flat(), ...th.map((x) => x.name)].map(norm));
      const tMap = new Map([...relT.value.filter((e) => e.id).map((e) => [e.id, e]), ...relT.value.map((e) => [norm(e.name), e])]);
      shared = rel.value
        .map((e) => ({ e, t: tMap.get(e.id) ?? tMap.get(norm(e.name)) }))
        .filter((x) => x.t && !mine.has(norm(x.e.name)))
        .sort((a, b) => Math.min(b.e.affinity ?? 0, b.t.affinity ?? 0) - Math.min(a.e.affinity ?? 0, a.t.affinity ?? 0))[0] ?? null;
    }
    return { type, results: rel.value, match: findMatch(rel.value, th), shared };
  }));

  const hits = tried.filter((x) => x.match).sort((a, b) => (b.match.affinity ?? 0) - (a.match.affinity ?? 0));
  if (hits.length) return { type: hits[0].type, item: hits[0].match.item, affinity: hits[0].match.affinity, kind: 'theirs' };
  const sh = tried.filter((x) => x.shared).sort((a, b) => (b.shared.e.affinity ?? 0) - (a.shared.e.affinity ?? 0))[0];
  if (sh) return { type: sh.type, item: sh.shared.e.name, affinity: sh.shared.e.affinity ?? null, kind: 'shared' };
  const first = tried.find((x) => x.results.length);
  return first ? { type: first.type, item: first.results[0].name, affinity: first.results[0].affinity ?? null, kind: 'qloo' } : null;
}
