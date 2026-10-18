// Record the peacock's lines once, offline, with Google Cloud Text-to-Speech. Zero dependencies.
//   export GOOGLE_TTS_API_KEY=...          (Google Cloud console -> APIs & Services -> Credentials -> API key,
//                                           restricted to "Cloud Text-to-Speech API")
//   node scripts/make-voice.mjs --list     list the available voices for en-GB and cmn-TW (to audition/choose)
//   node scripts/make-voice.mjs            record English (default)   [--lang en,zh] [--force] [--dry]
// Optional: TTS_VOICE_EN=en-GB-Neural2-B  TTS_VOICE_ZH=cmn-TW-Wavenet-A   TTS_RATE=0.96
// Output: public/audio/<lang>/<id>.mp3 — commit them; the site switches to them automatically.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { enumerateLines } from './voice-lines.mjs';

const KEY = process.env.GOOGLE_TTS_API_KEY;
const args = process.argv.slice(2);
const flag = (n) => args.includes(n);
const li = args.findIndex((a) => a === '--lang' || a.startsWith('--lang='));
const langs = (li < 0 ? 'en' : args[li].includes('=') ? args[li].split('=')[1] : args[li + 1] || 'en').split(',');
const OUT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'public', 'audio');
const LANG_CODE = { en: 'en-GB', zh: 'cmn-TW' };
const BASE = 'https://texttospeech.googleapis.com/v1';

async function api(p, body) {
  const r = await fetch(`${BASE}${p}${p.includes('?') ? '&' : '?'}key=${KEY}`, body ? { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) } : undefined);
  if (!r.ok) throw new Error(`HTTP ${r.status}: ${(await r.text()).slice(0, 300)}`);
  return r.json();
}

async function pickVoice(lang) {
  const env = process.env[`TTS_VOICE_${lang.toUpperCase()}`];
  if (env) return env;
  const { voices = [] } = await api(`/voices?languageCode=${LANG_CODE[lang]}`);
  const names = voices.map((v) => v.name);
  const prefs = lang === 'en' ? ['en-GB-Neural2-B', 'en-GB-Studio-B', 'en-GB-Neural2-D', /Chirp3-HD/, /Neural2/, /Wavenet/] : ['cmn-TW-Wavenet-A', /Wavenet/, /Standard/];
  for (const p of prefs) { const hit = typeof p === 'string' ? names.find((n) => n === p) : names.find((n) => p.test(n)); if (hit) return hit; }
  if (!names.length) throw new Error(`No voices returned for ${LANG_CODE[lang]}`);
  return names[0];
}

async function main() {
  if (!KEY) { console.error('Set GOOGLE_TTS_API_KEY first (see the header of this file).'); process.exit(1); }
  if (flag('--list')) {
    for (const l of Object.values(LANG_CODE)) { const { voices = [] } = await api(`/voices?languageCode=${l}`); console.log(`\n${l}:\n  ` + voices.map((v) => `${v.name} (${v.ssmlGender})`).join('\n  ')); }
    return;
  }
  const lines = enumerateLines(langs);
  const voices = {}; for (const l of langs) voices[l] = await pickVoice(l);
  console.log(`Voices: ${JSON.stringify(voices)} · ${lines.length} lines${flag('--dry') ? ' (dry run)' : ''}`);
  let done = 0, skipped = 0;
  for (const { lang, id, text } of lines) {
    const file = path.join(OUT, lang, `${id}.mp3`);
    if (fs.existsSync(file) && !flag('--force')) { skipped++; continue; }
    if (flag('--dry')) { console.log(`${id}: ${text}`); continue; }
    const { audioContent } = await api('/text:synthesize', {
      input: { text }, voice: { languageCode: LANG_CODE[lang], name: voices[lang] },
      audioConfig: { audioEncoding: 'MP3', speakingRate: Number(process.env.TTS_RATE || 0.96), pitch: lang === 'en' ? -1.5 : 0 },
    });
    fs.mkdirSync(path.dirname(file), { recursive: true });
    fs.writeFileSync(file, Buffer.from(audioContent, 'base64'));
    done++; process.stdout.write(`\r${done} recorded, ${skipped} skipped`);
    await new Promise((r) => setTimeout(r, 120)); // be gentle with quota
  }
  console.log(`\nDone: ${done} recorded, ${skipped} already existed. Files are in public/audio/.`);
}
main().catch((e) => { console.error(String(e.message || e)); process.exit(1); });
