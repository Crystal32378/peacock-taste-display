// Offline stand-in for Qloo, used when QLOO_API_KEY is absent and in tests.
// It is NOT Qloo output. Every trace entry that uses it says source:"fixture".
import { norm } from '../src/qloo.mjs';

// Same-type taste neighbors (what Qloo would return for "people who like X also like ...").
const NEIGHBORS = {
  artist: { 'brian eno': ['Harold Budd', 'Ryuichi Sakamoto', 'Jon Hopkins', 'Aphex Twin', 'Hiroshi Yoshimura'] },
  tv_show: { fleabag: ['Catastrophe', 'Normal People', 'Insecure', 'Better Things'] },
  movie: { 'perfect days': ['Paris, Texas', 'Tampopo', 'Still Walking', 'Columbus'] },
  book: { 'ways of seeing': ['Letters to a Young Poet', 'The Art of Looking', 'On Photography'] },
  place: { 'blue bottle coffee': ['Fuglen', '% Arabica', 'Stumptown Coffee Roasters'] },
  destination: { kyoto: ['Naoshima', 'Kanazawa', 'Nara', 'Lisbon'] },
  podcast: { 'song exploder': ['Switched On Pop', 'Dissect', 'Broken Record'] },
  video_game: { hades: ['Hollow Knight', 'Celeste', 'Disco Elysium', 'Hades II'] },
  brand: { 'jil sander': ['Lemaire', 'The Row', 'Maison Margiela', 'COS'] },
  person: { 'hayao miyazaki': ['Isao Takahata', 'Makoto Shinkai'] },
};

// Cross-category picks: "given everything you like, which <type> might you love?"
const CROSS = {
  artist: ['Nils Frahm', 'Four Tet', 'Jon Hopkins'],
  place: ['Kinokuniya Bookstore', 'Fuglen', 'Blue Bottle Coffee'],
  destination: ['Iceland', 'Naoshima', 'Lisbon'],
  book: ['The Remains of the Day', 'Letters to a Young Poet'],
  movie: ['Columbus', 'Paris, Texas'],
  tv_show: ['Normal People', 'Catastrophe'],
  podcast: ['Switched On Pop', 'Dissect'],
  video_game: ['Celeste', 'Hollow Knight'],
  brand: ['Lemaire', 'COS'],
  person: ['Isao Takahata'],
};

const slug = (s) => norm(s);

// Keys above are written readably; index them lazily by the same normalisation used for lookups
// (lazy because qloo.mjs and this file import each other).
let indexed = null;
const neighbors = () => (indexed ??= Object.fromEntries(Object.entries(NEIGHBORS).map(([t, m]) =>
  [t, Object.fromEntries(Object.entries(m).map(([k, v]) => [norm(k), v]))])));

export function fixtureResolve(type, name) {
  return { id: `fx:${type}:${slug(name)}`, name };
}

export function fixtureRelated(type, names) {
  const seen = new Set();
  const out = [];
  const push = (n) => { const k = norm(n); if (!seen.has(k)) { seen.add(k); out.push(n); } };
  for (const n of names || []) for (const x of neighbors()[type]?.[norm(n)] || []) push(x);
  // Many signals across types => cross-category picks (the `names` there are mixed).
  const mixed = (names || []).length > 1;
  if (mixed || !(names || []).some((n) => neighbors()[type]?.[norm(n)])) for (const x of CROSS[type] || []) push(x);
  return out.map((name, i) => ({ id: `fx:${type}:${slug(name)}`, name, affinity: Math.round((0.93 - i * 0.04) * 100) / 100 }));
}
