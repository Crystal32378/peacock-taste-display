// Character & tone guards (兔兔).
// Scope: the ten fictional characters and the peacock's lines — not the Qloo plumbing.
// Rules: no Qloo response data, no API keys, no network. Fixture mode only.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { COPY, lineId } from '../public/i18n.js';
import { cast, viewer, FEATHER_ORDER, FEATHER_LABEL } from '../data/cast.js';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(here, '..');
const MODES = ['friend', 'lover'];
const KEYS = ['swoon', 'shiver', 'flicker', 'fold', 'yawn', 'eyeroll', 'startle'];

// public/app.js decides which feather a "your {cat} list" line may tease. Read it here so the
// test fails if that set and this file ever drift apart.
const appSrc = fs.readFileSync(path.join(root, 'public/app.js'), 'utf8');
const lightMatch = appSrc.match(/const LIGHT = new Set\(\[([^\]]*)\]\)/);
const LIGHT = lightMatch
  ? lightMatch[1].split(',').map((s) => s.trim().replace(/^'|'$/g, '')).filter(Boolean)
  : [];

const allLines = (lang) => MODES.flatMap((mode) =>
  KEYS.flatMap((k) => COPY[lang][mode][k].map(([h, b], i) => ({ mode, key: k, i, head: h, body: b }))));

// ---------------------------------------------------------------- characters

test('every character fills all ten feathers, one item each', () => {
  for (const c of cast) {
    assert.deepEqual(
      FEATHER_ORDER.filter((t) => !(c.feathers[t] || []).length),
      [],
      `${c.id} has an empty feather`
    );
    const total = FEATHER_ORDER.reduce((n, t) => n + c.feathers[t].length, 0);
    assert.equal(total, 10, `${c.id} should have exactly ten items`);
    assert.deepEqual(
      Object.keys(c.feathers).filter((t) => !FEATHER_ORDER.includes(t)),
      [],
      `${c.id} has a feather that is not a Qloo entity type`
    );
  }
});

test('every character has a name, a blurb and a tag in both languages', () => {
  for (const c of cast) {
    for (const f of ['blurb', 'blurbEn', 'tag', 'tagEn', 'taste', 'tasteEn']) {
      assert.ok(c[f] && String(c[f]).trim().length, `${c.id} is missing ${f}`);
    }
    assert.ok(c.tag.length <= 8, `${c.id}'s tag is too long for a label: ${c.tag}`);
  }
});

test('no character lists the same item under two different feathers', () => {
  for (const c of cast) {
    const byItem = {};
    for (const t of FEATHER_ORDER) for (const x of c.feathers[t]) (byItem[x] ??= []).push(t);
    for (const [item, types] of Object.entries(byItem)) {
      assert.equal(types.length, 1, `${c.id} lists "${item}" under ${types.join(' and ')}`);
    }
  }
});

test('the walk order is the one we agreed on', () => {
  assert.deepEqual(cast.map((c) => c.id), [
    'mira', 'dax', 'theo', 'kai', 'lin', 'ren', 'suyin', 'oliver', 'jun', 'bei',
  ]);
});

// ---------------------------------------------------------------- copy: English and Chinese stay one peacock

test('every line pool has the same number of English and Chinese lines', () => {
  for (const mode of MODES) for (const key of KEYS) {
    assert.equal(
      COPY.zh[mode][key].length,
      COPY.en[mode][key].length,
      `${mode}.${key}: en and zh pools have drifted apart`
    );
  }
});

test('the Chinese headline is the English headline, line for line', () => {
  // public/i18n.js copies en[i][0] onto zh[i][0] at load time; if a pool is reordered the two
  // languages must still be talking about the same beat.
  for (const mode of MODES) for (const key of KEYS) {
    COPY.zh[mode][key].forEach((line, i) => {
      const en = COPY.en[mode][key][i];
      assert.ok(en, `${mode}.${key}[${i}] has no English counterpart`);
      assert.equal(line[0], en[0], `${mode}.${key}[${i}]: the headline drifted between languages`);
    });
  }
});

test('no pool contains the same sentence twice', () => {
  for (const lang of ['en', 'zh']) for (const mode of MODES) for (const key of KEYS) {
    const bodies = COPY[lang][mode][key].map(([, b]) => b);
    assert.equal(new Set(bodies).size, bodies.length, `${lang}.${mode}.${key} repeats a line`);
  }
});

// ---------------------------------------------------------------- copy: the peacock never claims what the screen does not show

test('no line claims that every feather moved', () => {
  // The strongest character in the cast lights five or six of ten. "Every feather" was true for
  // nobody; it was a line that only the animation could contradict.
  for (const l of allLines('en')) {
    assert.ok(!/every feather|all ten|all of the ten/i.test(l.body), `${l.key}: "${l.body}"`);
  }
});

test('"nothing moved" belongs to the pools that only fire on a fold, "several feathers" to the swoon pools', () => {
  // fold, yawn and eyeroll are the three pools that only ever reach the screen when no feather met.
  // startle is the opposite: it only fires the moment something did.
  const NOTHING_MOVED = new Set(['fold', 'yawn', 'eyeroll']);
  for (const l of allLines('en')) {
    if (/not a single feather moved|nothing moved/i.test(l.body)) {
      assert.ok(NOTHING_MOVED.has(l.key), `"${l.body}" is in the ${l.key} pool`);
    }
    if (/several feathers at once/i.test(l.body)) {
      assert.equal(l.key, 'swoon', `"${l.body}" is in the ${l.key} pool`);
    }
  }
});

test('a pool never describes a state its own verdict cannot produce', () => {
  for (const l of allLines('en')) {
    if (l.key === 'fold') {
      assert.ok(!/a little movement|a feather or two|barely a rustle/i.test(l.body),
        `fold pool says "${l.body}"`);
    }
    if (l.key === 'flicker') {
      assert.ok(!/not a single feather moved|nothing moved/i.test(l.body),
        `flicker pool says "${l.body}"`);
    }
  }
});

test('the peacock never offers a score', () => {
  for (const lang of ['en', 'zh']) for (const l of allLines(lang)) {
    assert.ok(!/score|percent|compatib|match ?rate/i.test(`${l.head} ${l.body}`),
      `${lang} ${l.key}: "${l.body}"`);
  }
});

test('the {cat} tease never names a book, an artist, a person or a game', () => {
  assert.ok(LIGHT.length, 'could not read the LIGHT set out of public/app.js');
  for (const t of ['artist', 'book', 'person', 'video_game']) {
    assert.ok(!LIGHT.includes(t), `LIGHT still includes ${t}`);
  }
  for (const mode of MODES) for (const key of KEYS) {
    for (const [h, b] of COPY.en[mode][key]) {
      if (!h.includes('{cat}') && !b.includes('{cat}')) continue;
      assert.equal(key, 'fold', '{cat} should only be teased in the fold pools');
    }
  }
});

// ---------------------------------------------------------------- voice: every line the peacock can say has a recording

test('every spoken English line has a recording, so the voice never falls back to the OS', () => {
  const missing = [];
  let checked = 0;
  for (const mode of MODES) for (const key of KEYS) {
    COPY.en[mode][key].forEach(([h, b], i) => {
      const hasCat = h.includes('{cat}') || b.includes('{cat}');
      const ids = hasCat ? LIGHT.map((t) => lineId('en', mode, key, i, t)) : [lineId('en', mode, key, i, '')];
      for (const id of ids) {
        checked++;
        if (!fs.existsSync(path.join(root, 'public/audio/en', `${id}.mp3`))) missing.push(id);
      }
    });
  }
  assert.ok(fs.existsSync(path.join(root, 'public/audio/en/en.bridge.head.mp3')), 'the door has no voice');
  assert.deepEqual(missing, [], `${missing.length} of ${checked} lines have no recording`);
});

// ---------------------------------------------------------------- labels

test('every feather type has a label in both languages', () => {
  for (const t of FEATHER_ORDER) {
    assert.ok(FEATHER_LABEL[t]?.en, `${t} has no English label`);
    assert.ok(FEATHER_LABEL[t]?.zh, `${t} has no Chinese label`);
  }
});

test('the visitor and every character use the same ten categories', () => {
  assert.deepEqual(Object.keys(viewer.feathers).sort(), [...FEATHER_ORDER].sort());
  for (const c of cast) assert.deepEqual(Object.keys(c.feathers).sort(), [...FEATHER_ORDER].sort());
});
