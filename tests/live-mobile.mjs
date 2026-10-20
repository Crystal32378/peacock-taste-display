// Live mobile (390px) layout audit for the deployed site, run by hand: see tests/README.md.
// A desktop headless Chrome window cannot be trusted at 390px; the site is checked inside a
// 390x844 iframe hosted by a 512x900 page (the trick the live reviews have used every round).
//
//   npm i -D playwright && npx playwright install chromium   # once, locally
//   node tests/live-mobile.mjs --site https://taste-display.onrender.com
//
// Read-only: clicks the sound/language/cast/door buttons, stubs speechSynthesis to record
// utterances. Prints one JSON summary; never writes files. No Qloo data anywhere.
import { createRequire } from 'node:module';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const args = process.argv.slice(2);
const opt = (name, dflt = '') => { const i = args.indexOf(name); return i >= 0 ? args[i + 1] : dflt; };
const SITE = opt('--site', 'https://taste-display.onrender.com').replace(/\/$/, '');
const PROFILE = opt('--profile', 'theo');
const LANG = opt('--lang', 'zh');

let chromium = null;
for (const from of [dirname(fileURLToPath(import.meta.url)), process.cwd()]) {
  try { ({ chromium } = createRequire(join(from, '.pw.js'))('playwright')); break; } catch {}
}
if (!chromium) {
  console.error('playwright not installed locally: npm i -D playwright && npx playwright install chromium');
  process.exit(2);
}

const browser = await chromium.launch({ headless: true });
const ctx = await browser.newContext({ viewport: { width: 512, height: 900 }, deviceScaleFactor: 2 });
await ctx.addInitScript(() => {
  window.__speak = [];
  const sp = window.speechSynthesis;
  if (sp && sp.speak) { const o = sp.speak.bind(sp); sp.speak = (u) => { try { window.__speak.push({ lang: u.lang, text: u.text }); } catch {} return o(u); }; }
});
const host = await ctx.newPage();
await host.setContent(`<body style="margin:0"><iframe width=390 height=844 style="border:0;display:block" src="${SITE}/"></iframe></body>`);
const fr = host.frames().find((f) => { try { return f !== host.mainFrame(); } catch { return false; } });
await fr.waitForFunction(() => document.querySelectorAll('#castRow button').length >= 10, null, { timeout: 30000 });
const click = (sel) => fr.evaluate((s) => { const el = document.querySelector(s); return !!el && (el.click(), true); }, sel);
const waitShown = (fn, ms) => fr.waitForFunction(fn, null, { timeout: ms }).catch(() => null);
const rect = (sel) => fr.evaluate((s) => { const r = document.querySelector(s)?.getBoundingClientRect(); return r ? { top: r.top, bottom: r.bottom, h: r.height } : null; }, sel);
const settle = (ms = 2000) => host.waitForTimeout(ms);

const out = { site: SITE, profile: PROFILE, lang: LANG, checks: {} };
await click(LANG === 'zh' ? '#lZh' : '#lEn');
await click(`#castRow button[data-id="${PROFILE}"]`);
await waitShown(() => { const t = document.querySelector('#theirs'); return t && t.textContent.trim().length > 8; }, 25000);

out.checks.bar = await fr.evaluate(() => {
  const c = document.querySelector('.ctl'); if (!c) return null;
  const cs = getComputedStyle(c); const r = c.getBoundingClientRect();
  const btns = [...c.querySelectorAll('button')].filter((b) => !b.hidden).map((b) => Math.round(b.getBoundingClientRect().height));
  return {
    position: cs.position,
    pinnedToBottom: Math.round(r.bottom) === Math.round(window.innerHeight),
    height: Math.round(r.height),
    buttonHeights: btns,
    singleRow: btns.length === 3 && btns.every((h) => h === 44),
    horizontalOverflow: document.documentElement.scrollWidth > window.innerWidth,
  };
});

// what sits behind the fixed bar at first paint: the caption, the ten-feather line, the door
const clippable = await fr.evaluate(() => {
  const r = (s) => { const el = document.querySelector(s); if (!el || el.hidden) return null; const b = el.getBoundingClientRect(); return { top: b.top, bottom: b.bottom, height: b.height }; };
  return { capZh: r('#capZh'), theirs: r('#theirs'), bridge: r('#bridge'), bar: r('.ctl') };
});
const ov = (a, b) => (!a || !b) ? 0 : Math.max(0, Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top));
out.checks.clippedByBar = {
  capZh: Math.round(ov(clippable.capZh, clippable.bar) * 10) / 10,
  theirs: Math.round(ov(clippable.theirs, clippable.bar) * 10) / 10,
  bridge: clippable.bridge ? Math.round(ov(clippable.bridge, clippable.bar) * 10) / 10 : null,
  barTop: clippable.bar ? Math.round(clippable.bar.top) : null,
};

const bridgeShown = await waitShown(() => { const b = document.querySelector('#bridge'); return b && !b.hidden; }, 25000);
if (!bridgeShown) {
  out.checks.bridge = { neverShownWithin25s: true, hint: 'the door button stays hidden while the profile is still being served/fetching' };
} else {
  await settle();              // captions settle past "Opening…"
  await click('#snd');         // audible mode so the door utterance can be recorded
  const b = await rect('#bridge'), cap = await rect('#capZh'), bar = await rect('.ctl');
  out.checks.bridge = {
    buttonTop: b.top, buttonBottom: b.bottom, buttonHeight: b.h,
    capZhBottom: cap.bottom, barTop: bar.top,
    underCaption: b.top > cap.bottom,   // sits below the caption block
    clearOfBar: b.bottom <= bar.top,    // not clipped by the fixed bar
  };
  await click('#bridge');
  await waitShown(() => window.__speak.length > 0, 8000);
  out.checks.bridge.speak = await fr.evaluate(() => (window.__speak ?? []).map((u) => u.text));
}
console.log(JSON.stringify(out, null, 1));
await browser.close();
