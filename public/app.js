import { buildFan } from './fan.js';
import { COPY, UI, UI_SOUND, UI_VOX, lineId, lineText } from './i18n.js';
import * as snd from './sound.js';

const $ = (id) => document.getElementById(id);
const MOODS = ['eager', 'stifled', 'unimpressed', 'ecstatic', 'sideeye', 'flustered', 'yawning', 'startled'];
const heads = Object.fromEntries(MOODS.map((m) => [m, `assets/peacock-${m}.webp`]));

let lastQuip = '';
function quip(mode, key, gapType) {
  const pool = COPY[st.lang][mode][key];
  let i = 0;
  for (let n = 0; n < 4; n++) { i = Math.floor(Math.random() * pool.length); if (pool[i][1] !== lastQuip) break; }
  const [head, body] = pool[i]; lastQuip = body;
  const needsCat = body.includes('{cat}') || head.includes('{cat}');
  const type = needsCat ? (gapType || 'movie') : '';
  const cat = catName(type || 'movie'); // same word the recording uses, so text and voice always agree
  return [head.replace('{cat}', cat), body.replace('{cat}', cat), lineId(st.lang, mode, key, i, type), st.lang === 'zh' ? body.replace('{cat}', cat) : lineText(head, body, cat)]; // zh voice reads the Chinese body only; the English headline stays on screen
}
// show the caption and (if sound is on) let the peacock say it
function speakCap(q, delay = 0) { cap(q[0], q[1]); snd.say(st.lang, q[2], q[3], delay); }
const LIGHT = new Set(['movie', 'tv_show', 'place', 'destination', 'brand', 'podcast']);
const HEAD_FOR = { swoon: 'ecstatic', shiver: 'stifled', flicker: 'sideeye', fold: 'unimpressed' };

const T = () => UI[st.lang];
const catName = (type) => (st.lang === 'en' ? label(type).en.toLowerCase() : label(type).zh);
let initialLang = 'en';
try { const q = new URLSearchParams(location.search).get('lang'); const saved = localStorage.getItem('td-lang'); initialLang = q === 'zh' || q === 'en' ? q : saved === 'zh' || saved === 'en' ? saved : 'en'; } catch {}
const st = { lang: initialLang, cast: [], labels: {}, viewer: null, idx: 0, rid: 0, auto: false, mode: 'friend', timer: null, cache: new Map(), streak: 0, current: null };
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const label = (t) => st.labels[t] || { en: t, zh: t };
let fan, feathers, labs, headEls;

async function display(id) {
  const key = id + '|' + st.mode;
  if (!st.cache.has(key)) {
    const r = await fetch('/api/display', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ profileId: id }) });
    st.cache.set(key, await r.json());
  }
  return st.cache.get(key);
}

const HEART = 'M0 4C-8-2-9-9-4-10C-1.5-10.5 0-8.5 0-7C0-8.5 1.5-10.5 4-10C9-9 8-2 0 4Z';
const SPARK = 'M0-10C1 -3 3 -1 10 0C3 1 1 3 0 10C-1 3 -3 1 -10 0C-3 -1 -1 -3 0 -10Z';
const KISS_TOP = 'M-22 0C-15-10-6-13 0-6C6-13 15-10 22 0C13 4-13 4-22 0Z';
const KISS_BOT = 'M-22 0C-13 4 13 4 22 0C15 14 6 17 0 17C-6 17-15 14-22 0Z';
function stopGold() { const g = $('gold'); if (g) g.innerHTML = ''; fan.classList.remove('hasfav'); $('capFav').textContent = ''; }
function startGold(r) {
  stopGold();
  const fav = r.favorite; if (!fav) return;
  const el = feathers.find((e) => e.dataset.type === fav.type); if (!el) return;
  const a = parseFloat(el.style.getPropertyValue('--a')) * Math.PI / 180, d = 0.8 * 545;
  const x = 720 + d * Math.sin(a), y = 880 - d * Math.cos(a);
  const shape = st.mode === 'lover' ? HEART : SPARK;
  let out = '';
  for (let i = 0; i < 14; i++) {
    const dx = (Math.random() - 0.5) * 170, dl = (i * 0.22).toFixed(2), base = 2.2 + Math.random() * 1.4;
    const lip = st.mode === 'lover' && i % 3 === 1; // every third flyer is a golden kiss
    const sc = (lip ? base * 0.55 : base).toFixed(2);
    out += `<g transform="translate(${(x + (Math.random() - 0.5) * 60).toFixed(1)} ${y.toFixed(1)})"><path class="gp" d="${lip ? KISS_TOP + KISS_BOT : shape}" style="--dx:${dx.toFixed(0)}px;--dl:${dl}s;--sc:${sc}"/></g>`;
  }
  if (st.mode === 'lover') {
    // the peacock stamps a kiss on its favourite feather
    out += `<g transform="translate(${(x + 6).toFixed(1)} ${(y + 4).toFixed(1)}) rotate(-16) scale(1.9)"><g class="kiss"><path d="${KISS_TOP}" fill="#F2D58A"/><path d="${KISS_BOT}" fill="#D9B35E"/><path d="M-9 -4C-4 -7 4 -7 9 -4" stroke="#FFF6D6" stroke-width="1.6" fill="none" stroke-linecap="round" opacity=".8"/></g></g>`;
  }
  $('gold').innerHTML = out;
  snd.chime(); if (st.mode === 'lover') { clearTimeout(st.popT); st.popT = setTimeout(snd.pop, 800); }
  el.classList.add('fav'); fan.classList.add('hasfav');
  $('capFav').textContent = T().fav(st.mode === 'lover', catName(fav.type), fav.item);
}
function setHead(mood) {
  $('head').setAttribute('class', mood ? 'mood-' + mood : ''); headEls.forEach((el) => el.classList.toggle('on', el.dataset.mood === mood)); }
function cap(en, zh) { $('capEn').textContent = en; $('capZh').textContent = zh; }

function showProfile(p) {
  $('name').textContent = p.name;
  $('meta').textContent = `${p.age} · ${st.lang === 'en' ? p.cityEn : p.city}`;
  $('blurb').textContent = st.lang === 'en' ? p.blurbEn : p.blurb;
  $('tasteLine').textContent = (st.lang === 'en' ? p.tagEn : p.tag) ? `${st.lang === 'en' ? p.tagEn : p.tag} · ${st.lang === 'en' ? p.tasteEn : p.taste}` : '';
  const img = $('portrait');
  img.src = `assets/${p.portrait}`; img.alt = T().alt(p.name);
  document.querySelectorAll('#castRow button').forEach((b) => b.setAttribute('aria-current', b.dataset.id === p.id));
}

function describe(f) {
  return f.state === 'same' ? f.item : f.state === 'neighbor' ? `≈ ${f.item}` : '';
}

function applyResult(r) {
  const res = new Map(r.feathers.filter((f) => f.state !== 'none').map((f) => [f.type, f]));
  feathers.forEach((el) => { el.classList.toggle('res', res.has(el.dataset.type)); el.classList.remove('bridge'); });
  labs.forEach((el) => {
    const f = res.get(el.dataset.type);
    el.classList.toggle('res', !!f); el.classList.remove('bridge');
    el.querySelector('.nm').textContent = f ? describe(f) : '';
  });
  fan.classList.toggle('swoon', r.verdict === 'swoon');
  // the same matches as plain readable text: on a phone the names on the feathers are tiny
  const hits = r.feathers.filter((f) => f.state !== 'none').map((f) => `${catName(f.type)} ${f.state === 'neighbor' ? '≈ ' : ''}${f.item}`);
  // one meeting only: the peacock's own favourite line already says it, so the list stays quiet
  $('hits').textContent = hits.length && !(hits.length === 1 && r.favorite) ? T().hits + hits.join(' · ') : '';
  // their whole tail, always: a folded tail still has ten feathers, and you should see what is on them
  const who = st.cast.find((c) => c.id === r.profileId);
  $('theirs').textContent = who ? T().theirs(who.name) + r.feathers.filter((f) => f.theirs.length).map((f) => `${catName(f.type)} ${f.theirs.join('/')}`).join(' · ') : '';
  feathers.forEach((el) => el.classList.remove('fav'));
  labs.forEach((el) => el.classList.toggle('fav', !!r.favorite && el.dataset.type === r.favorite.type));
  renderTrace(r);
}

function renderTrace(r) {
  const E = T().engine;
  $('engine').innerHTML = r.engine === 'live' ? E.live
    : r.engine === 'fixture' ? E.fixture + (r.mode === 'fixture' ? E.fixtureNote : '')
    : r.engine === 'fallback' ? E.fallback : E.mixed;
  if (r.errors) $('engine').innerHTML += ' ' + E.errors(r.errors);
  const tally = { live: 0, cache: 0, skip: 0, error: 0 }; r.trace.forEach((t) => { if (t.source in tally) tally[t.source]++; });
  $('engine').innerHTML += `<br>${E.tally(tally)}<span class="legend">${E.legend}</span>`;
  $('trace').textContent = r.trace.map((t) => `[${t.source}${t.ms != null ? ' ' + t.ms + 'ms' : ''}] ${decodeURIComponent(t.call)}${t.result ? '\n    → ' + t.result : ''}${t.error ? '  !! ' + t.error : ''}`).join('\n') || T().noCalls;
}

function renderYou() {
  const v = st.viewer?.feathers || {};
  $('you').textContent = T().you + Object.entries(v).map(([t, a]) => `${st.lang === 'en' ? label(t).en.toLowerCase() : label(t).zh} ${a.join(T().sep)}`).join(' · ');
}

async function play() {
  const id = ++st.rid, p = st.cast[st.idx];
  clearTimeout(st.timer); clearTimeout(st.popT);
  snd.stopVoice(); // the previous character's line must not talk over this one
  fan.classList.remove('match', 'verdict', 'swoon'); $('bridge').hidden = true; stopGold();
  // wipe the previous verdict at once, so a new face never wears the last one's caption or gold names
  cap('', ''); $('hits').textContent = ''; $('theirs').textContent = '';
  feathers.forEach((el) => el.classList.remove('res', 'bridge', 'fav'));
  labs.forEach((el) => { el.classList.remove('res', 'bridge', 'fav'); el.querySelector('.nm').textContent = ''; });
  setHead('eager');
  showProfile(p);
  const pending = display(p.id);
  await sleep(60); fan.classList.remove('open'); setHead(null);
  await sleep(900); if (id !== st.rid) return;
  cap(...T().opening(p.name));
  let waiting = true;
  setTimeout(() => { if (waiting && id === st.rid) cap(...T().preen); }, 1500); // a slow answer (cold start, live Qloo calls): say why
  const r = await pending; waiting = false; if (id !== st.rid) return;
  st.current = r; applyResult(r);
  await sleep(350); if (id !== st.rid) return;
  fan.classList.add('open'); setHead('eager'); snd.rustle();
  await sleep(1900); if (id !== st.rid) return;
  const match = r.verdict === 'swoon' || r.verdict === 'shiver';
  const lover = st.mode === 'lover';
  // only a true fold closes the tail. A flicker means something did meet, so the lit feather stays lit.
  const folded = r.verdict === 'fold';
  // losing streak = consecutive folds. A flicker is neutral (something did meet); a match resets it.
  // Replaying the same character is not a new loss, and the streak is reset when mode or language changes.
  if (st.lastId === p.id) st.streak = st.streakBefore;
  st.lastId = p.id; st.streakBefore = st.streak;
  const prev = st.streak;
  st.streak = match ? 0 : r.verdict === 'flicker' ? st.streak : st.streak + 1;
  // a category where YOU have taste and they have none: fodder for the peacock's attitude.
  // Only light-hearted categories are teased ("your podcast list"), never someone's books or games.
  const gap = r.feathers.find((f) => LIGHT.has(f.type) && f.state === 'none' && f.yours.length && !f.theirs.length) || r.feathers.find((f) => LIGHT.has(f.type) && f.state === 'none' && f.yours.length);
  const gapType = gap ? gap.type : null;
  fan.classList.add('verdict');
  if (match && prev >= 2) {
    // after a losing streak the peacock does a double take before reacting; wait for the line to finish
    setHead('startled'); speakCap(quip(st.mode, 'startle', gapType));
    await Promise.all([sleep(1700), snd.whenDone(6500)]); if (id !== st.rid) return;
  }
  if (match && !reduce) fan.classList.add('match');
  startGold(r);
  // second fold in a row yawns, third rolls its eyes; later folds go back to the ordinary pool (no lock-in)
  const key = r.verdict === 'fold' && st.streak === 3 ? 'eyeroll' : r.verdict === 'fold' && st.streak === 2 ? 'yawn' : r.verdict;
  setHead(key === 'eyeroll' ? 'sideeye' : key === 'yawn' ? 'yawning' : lover && r.verdict === 'swoon' ? 'flustered' : HEAD_FOR[r.verdict]);
  speakCap(quip(st.mode, key, gapType), 650); // let the gold chime land first so it does not bury the voice
  $('bridge').hidden = !(r.bridge && (r.verdict === 'fold' || r.verdict === 'flicker'));
  if (folded) {
    // no overlap worth a shiver: the peacock folds its tail, head stays, dry look
    await Promise.all([sleep(2200), snd.whenDone(9500)]); if (id !== st.rid) return; // the tail closes when the line ends, not before
    fan.classList.remove('open', 'match'); stopGold();
  }
  if (!st.auto) return;
  await Promise.all([sleep(match ? 4800 : 1800), snd.whenDone(9000)]); if (id !== st.rid) return;
  next();
}

function showBridge() {
  const r = st.current; if (!r?.bridge) return;
  const b = r.bridge, cn = catName(b.type);
  feathers.forEach((el) => el.classList.toggle('bridge', el.dataset.type === b.type));
  labs.forEach((el) => {
    const on = el.dataset.type === b.type; el.classList.toggle('bridge', on);
    if (on) el.querySelector('.nm').textContent = `→ ${b.item}`;
  });
  const p = st.cast[st.idx];
  stopGold();
  fan.classList.add('open'); // the door needs the tail open again
  setHead(st.mode === 'lover' ? 'flustered' : 'startled');
  $('bridge').hidden = true;
  snd.chime(); snd.say(st.lang, st.lang === 'en' ? 'en.bridge.head' : 'zh.bridge.head', T().bridgeHead); // the one recorded line of the door (English only); the rest is templated text
  const af = typeof b.affinity === 'number' ? (st.lang === 'en' ? ` (affinity ${b.affinity.toFixed(2)})` : `（affinity ${b.affinity.toFixed(2)}）`) : '';
  cap(T().bridgeHead, b.kind === 'theirs' ? T().bridgeTheirs(cn, b.item, p.name, af) : b.kind === 'shared' ? T().bridgeShared(cn, b.item, p.name, af) : (r.engine === 'live' ? T().bridgeQloo(cn, b.item, p.name, af) : T().bridgeDemo(cn, b.item)));
}

function next() { st.idx = (st.idx + 1) % st.cast.length; play(); }

async function init() {
  const data = await fetch('/api/cast').then((r) => r.json());
  st.cast = data.cast; st.labels = data.labels; st.viewer = data.viewer;
  const order = data.feathers.map((t) => ({ type: t, en: label(t).en, zh: label(t).zh }));
  $('stageSvg').innerHTML = buildFan(order, heads);
  $('svg').insertAdjacentHTML('beforeend', '<g id="gold"></g>');
  fan = $('fan'); feathers = [...fan.querySelectorAll('.f.m')]; labs = [...document.querySelectorAll('.lab')]; headEls = [...document.querySelectorAll('.head-img')];
  $('castRow').innerHTML = st.cast.map((p) => `<button type="button" data-id="${p.id}" aria-label="${p.name}"><img src="assets/${p.portrait}" alt="" loading="lazy"></button>`).join('');
  $('castRow').addEventListener('click', (e) => { const b = e.target.closest('button'); if (!b) return; st.idx = st.cast.findIndex((p) => p.id === b.dataset.id); play(); });
  renderYou();

  $('next').onclick = next;
  $('replay').onclick = () => play();
  $('bridge').onclick = showBridge;
  const setAuto = () => { $('auto').textContent = T().auto(st.auto); $('auto').setAttribute('aria-pressed', st.auto); };
  $('auto').onclick = () => { st.auto = !st.auto; setAuto(); if (st.auto && fan.classList.contains('verdict')) { const id = st.rid; st.timer = setTimeout(() => id === st.rid && next(), 1500); } };
  for (const m of ['friend', 'lover']) $(m === 'friend' ? 'mFriend' : 'mLover').onclick = () => {
    st.mode = m; st.streak = 0; st.lastId = null; $('mFriend').setAttribute('aria-pressed', m === 'friend'); $('mLover').setAttribute('aria-pressed', m === 'lover'); play();
  };
  const applyStatic = () => {
    document.documentElement.lang = st.lang === 'en' ? 'en' : 'zh-Hant';
    document.documentElement.dataset.lang = st.lang;
    document.title = T().title;
    $('replay').textContent = T().replay; $('next').textContent = T().next; $('bridge').textContent = T().bridge;
    $('sumText').textContent = T().summary; $('setup').textContent = T().setup; $('howSum').textContent = T().howSum; $('howBody').textContent = T().howBody; $('castHint').textContent = T().pick; $('fict').textContent = T().fict; $('note').textContent = T().note; $('foot').textContent = T().foot;
    $('lEn').setAttribute('aria-pressed', st.lang === 'en'); $('lZh').setAttribute('aria-pressed', st.lang === 'zh');
    setAuto(); $('snd').textContent = UI_SOUND[st.lang](snd.isOn()); $('snd').setAttribute('aria-pressed', snd.isOn()); $('vox').textContent = UI_VOX[st.lang](snd.isHer()); $('vox').setAttribute('aria-pressed', snd.isHer());
  };
  try { snd.setHer(localStorage.getItem('td-voice') === 'her'); } catch {}
  $('vox').onclick = () => { snd.setHer(!snd.isHer()); try { localStorage.setItem('td-voice', snd.isHer() ? 'her' : 'him'); } catch {} applyStatic(); };
  $('snd').onclick = () => { snd.setOn(!snd.isOn()); applyStatic(); if (snd.isOn()) snd.rustle(); };
  for (const [id, l] of [['lEn', 'en'], ['lZh', 'zh']]) $(id).onclick = () => {
    if (st.lang === l) return; st.lang = l; st.streak = 0; st.lastId = null; try { localStorage.setItem('td-lang', l); } catch {}
    applyStatic(); renderYou(); st.cache.clear(); play();
  };
  applyStatic();

  // first frame: Mira already open and shivering (no waiting)
  const p = st.cast[0]; showProfile(p);
  const r = await display(p.id); st.current = r; applyResult(r);
  fan.classList.add('open', 'verdict'); if (r.verdict !== 'fold' && !reduce) fan.classList.add('match');
  setHead(HEAD_FOR[r.verdict]); cap(...quip('friend', r.verdict, null)); startGold(r);
}
init().catch((e) => { document.body.insertAdjacentHTML('beforeend', `<p style="padding:24px;color:#E2C783">${(UI[initialLang] || UI.en).err}${String(e.message || e)}</p>`); });
