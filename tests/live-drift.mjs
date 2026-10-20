// Live verdict-drift check, run by hand against a deployed site: see README.md for the method.
// Stores ONLY coarse facts (verdict, fan verdicts, feather states, trace-source counts) in a
// LOCAL directory — never inside this repo. Affinity numbers and any Qloo payload stay out of
// version control by design (they are Qloo outputs, not our own data).
//
//   node tests/live-drift.mjs --site https://taste-display.onrender.com
//   node tests/live-drift.mjs --site ... --compare /path/to/previous/snapshot/dir
//
// Exit code 0 when no drift, 1 when drift (or mid-run if the site is down).
import { writeFileSync, mkdirSync, readFileSync, readdirSync } from 'node:fs';
import { resolve as pathResolve, dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const args = process.argv.slice(2);
const opt = (name, dflt = '') => { const i = args.indexOf(name); return i >= 0 ? args[i + 1] : dflt; };
const SITE = opt('--site', 'https://taste-display.onrender.com').replace(/\/$/, '');
const REPO_ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');

// Hard guard, per the repo rule: snapshots (they contain Qloo-derived affinity numbers) must not land in git.
let outDir = pathResolve(opt('--out', join('/tmp', 'live-snapshots')));
if (outDir.startsWith(pathResolve(REPO_ROOT))) {
  console.error('refusing to write inside the repo: Qloo-derived snapshots stay out of version control');
  process.exit(2);
}

const j = (p) => fetch(p, { headers: { Accept: 'application/json' } }).then((r) => r.json());
const castData = await j(`${SITE}/api/cast`);
const cast = Array.isArray(castData) ? castData : castData.cast ?? castData.profiles ?? [];
console.log(`# ${SITE} · ${cast.length} cast`);

const snap = {};
for (const p of cast) {
  const r = await fetch(`${SITE}/api/display`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ profileId: p.id }),
  });
  if (!r.ok) { console.error(`# ${p.id}: HTTP ${r.status}`); process.exit(1); }
  const d = await r.json();
  const sources = d.trace?.map((t) => t.source) ?? [];
  snap[p.id] = {
    verdict: d.verdict, mode: d.engine, fan: d.fan,
    states: Object.fromEntries((d.feathers ?? []).map((f) => [f.type, f.state])),
    trace: sources.sort().reduce((a, s) => (a[s] = (a[s] ?? 0) + 1, a), {}),
  };
  console.log(`${p.id.padEnd(8)} ${d.verdict}  run=${snap[p.id].mode}`);
}

mkdirSync(outDir, { recursive: true });
const stamp = new Date().toISOString().slice(0, 16).replace(/[:T]/g, '-');
const file = join(outDir, `drift-snap-${stamp}.json`);
writeFileSync(file, JSON.stringify(snap, null, 1) + '\n');
console.log(`# snapshot: ${file} (local only — do not commit)`);

const prevDir = opt('--compare');
if (!prevDir) process.exit(0);
const prevFiles = readdirSync(pathResolve(prevDir)).filter((f) => f.startsWith('drift-snap-')).sort();
const prev = JSON.parse(readFileSync(join(pathResolve(prevDir), prevFiles.at(-1)), 'utf8'));
let drift = 0;
for (const [id, now] of Object.entries(snap)) {
  const o = prev[id]; if (!o) { console.log(`new profile ${id}`); continue; }
  if (o.verdict !== now.verdict) { console.log(`drift ${id}: ${o.verdict} -> ${now.verdict}`); drift++; }
  if (JSON.stringify(o.states) !== JSON.stringify(now.states)) { console.log(`states drift ${id}`); drift++; }
  if (JSON.stringify(Object.fromEntries(Object.entries(o.trace ?? {}).sort())) !== JSON.stringify(now.trace)) {
    console.log(`trace-shape change ${id}: ${JSON.stringify(o.trace)} -> ${JSON.stringify(now.trace)}`);
  }
}
console.log(drift ? `# DRIFT ON ${drift} PROFILE(S)` : '# no verdict/states drift');
process.exit(drift ? 1 : 0);
