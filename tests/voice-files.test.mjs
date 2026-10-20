// Audit of the voice recordings, wholly offline (repo files + public/i18n.js, no Qloo anywhere).
// Catches the whole class of "same take shipped under two different lines" bugs the
// reviewing who round-tripped the live site kept flagging.
import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readdirSync, readFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { COPY, lineId } from '../public/i18n.js';
import { TYPES } from '../src/qloo.mjs';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const AUDIO = join(ROOT, 'public', 'audio', 'en');

// id -> text (with the {cat} gap unexpanded), for every line the app can speak.
function enumerateLines() {
  const out = new Map();
  for (const mode of ['friend', 'lover']) {
    for (const [tone, lines] of Object.entries(COPY.en[mode] ?? {})) {
      lines.forEach((pair, i) => {
        const text = pair.join(' ');
        if (text.includes('{cat}')) {
          for (const cat of TYPES) out.set(lineId('en', mode, tone, i, cat), text);
        } else {
          out.set(lineId('en', mode, tone, i, ''), text);
        }
      });
    }
  }
  out.set('en.bridge.head', COPY.en.bridgeHead ?? '');
  return out;
}

const md5 = (p) => createHash('md5').update(readFileSync(p)).digest('hex');

test('every spoken line has its recording, and every recording belongs to a line', () => {
  const expected = enumerateLines();
  assert.ok(expected.size > 0, 'the line table should not come back empty');
  for (const id of expected.keys()) {
    if (id === 'en.bridge.head') continue; // scalar head line
    assert.ok(existsSync(join(AUDIO, id + '.mp3')), `missing recording: public/audio/en/${id}.mp3`);
  }
  const have = new Set(readdirSync(AUDIO).filter((f) => f.endsWith('.mp3')).map((f) => f.replace(/\.mp3$/, '')));
  for (const file of have) {
    assert.ok(expected.has(file) || file === 'en.bridge.head', `orphan recording (no copy line): ${file}.mp3`);
  }
});

test('recordings live under public/audio/en and en-f only (Chinese uses the browser voice)', () => {
  const audio = readdirSync(join(ROOT, 'public', 'audio'));
  assert.deepEqual(audio.sort(), ['en', 'en-f'], `unexpected audio subfolders: ${audio.join(', ')}`);
});

test('two different lines never ship the same bytes (same take re-sent under another caption)', () => {
  const expected = enumerateLines();
  const byHash = new Map();
  for (const f of readdirSync(AUDIO)) {
    byHash.set(md5(join(AUDIO, f)), f.replace(/\.mp3$/, ''));
  }
  const groups = new Map();
  for (const [hash, id] of byHash) groups.set(hash, [...(groups.get(hash) ?? []), id]);
  for (const [hash, ids] of groups) {
    if (ids.length < 2) continue;
    const texts = ids.map((id) => {
      const t = expected.get(id);
      assert.ok(t != null, `duplicate-content recording has no copy line: ${id}`);
      return t.trim();
    });
    assert.ok(texts.every((t) => t === texts[0]), `same take reused with different copy: ${ids.join(' + ')}`);
  }
});

test('the female recording set covers exactly the same lines as the male set', () => {
  const a = readdirSync(AUDIO).sort(), b = readdirSync(join(ROOT, 'public', 'audio', 'en-f')).sort();
  assert.deepEqual(b, a);
});
