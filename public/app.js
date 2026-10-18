import { buildFan } from './fan.js';

const $ = (id) => document.getElementById(id);
const MOODS = ['eager', 'stifled', 'unimpressed', 'ecstatic', 'sideeye', 'flustered', 'yawning', 'startled'];
const heads = Object.fromEntries(MOODS.map((m) => [m, `assets/peacock-${m}.webp`]));

const COPY = {
  friend: {
    swoon: ['The whole tail is humming.', '好幾根羽毛一起動了。孔雀自己都有點不好意思。'],
    shiver: ['Something is stirring.', '有羽毛對上了，尾巴自己抖了起來，孔雀努力裝沒事。'],
    flicker: ['Only a flicker.', '只有一根輕輕動了一下，不夠抖。孔雀禮貌地收屏，下一位。'],
    fold: ['Not tonight.', '一根都沒動。孔雀收屏。不是你不好，是尾巴今天沒心情。'],
    yawn: ['…again?', '又一根都沒動。孔雀打了個哈欠。'],
  },
  lover: {
    swoon: ['Oh. The peacock is blushing.', '羽毛一起動了，孔雀把頭別開，假裝在看別的地方。'],
    shiver: ['Careful. It is trying not to look.', '藏不住的那種抖。孔雀假裝在整理羽毛。'],
    flicker: ['A flicker, and a sideways look.', '只有一根動了。孔雀瞄了你一眼，沒說話。'],
    fold: ['Not tonight.', '一根都沒動。孔雀收屏。尾巴的事，跟你這個人沒關係。'],
    yawn: ['…again?', '又一根都沒動。孔雀打了個哈欠。'],
  },
};
const HEAD_FOR = { swoon: 'ecstatic', shiver: 'stifled', flicker: 'sideeye', fold: 'unimpressed' };

const st = { cast: [], labels: {}, viewer: null, idx: 0, rid: 0, auto: false, mode: 'friend', timer: null, cache: new Map(), lastFold: false, current: null };
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

function setHead(mood) { headEls.forEach((el) => el.classList.toggle('on', el.dataset.mood === mood)); }
function cap(en, zh) { $('capEn').textContent = en; $('capZh').textContent = zh; }

function showProfile(p) {
  $('name').textContent = p.name;
  $('meta').textContent = `${p.age} · ${p.city}`;
  $('blurb').textContent = p.blurb;
  const img = $('portrait');
  img.src = `assets/${p.portrait}`; img.alt = `${p.name}（虛構角色）`;
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
  renderTrace(r);
}

function renderTrace(r) {
  const src = { fixture: '離線示範資料（fixture）', live: 'Qloo 即時 API', fallback: '備援（Qloo 呼叫失敗，改用示範資料）', mixed: '混合（部分 Qloo 即時，部分備援）' };
  $('engine').innerHTML = r.engine === 'live'
    ? `資料來源：<b>${src.live}</b>。羽毛配對來自 Qloo 的 insights 結果。`
    : `資料來源：<b>${src[r.engine] || r.engine}</b>。${r.mode === 'fixture' ? '這個部署還沒有設定 Qloo API key，所以下面的「相近」是我們手寫的示範資料，不是 Qloo 的輸出。' : ''}`;
  $('trace').textContent = r.trace.map((t) => `[${t.source}${t.ms != null ? ' ' + t.ms + 'ms' : ''}] ${decodeURIComponent(t.call)}${t.error ? '  !! ' + t.error : ''}`).join('\n') || '（沒有呼叫：整張尾巴都是完全相同的項目，或沒有可比的類別）';
}

function renderYou() {
  const v = st.viewer?.feathers || {};
  $('you').textContent = '你的羽毛（示範用）：' + Object.entries(v).map(([t, a]) => `${label(t).zh} ${a.join('、')}`).join(' · ');
}

async function play() {
  const id = ++st.rid, p = st.cast[st.idx];
  clearTimeout(st.timer);
  fan.classList.remove('match', 'verdict', 'swoon'); $('bridge').hidden = true;
  setHead('eager');
  showProfile(p);
  const pending = display(p.id);
  await sleep(60); fan.classList.remove('open'); setHead(null);
  await sleep(900); if (id !== st.rid) return;
  cap('Opening…', '孔雀正在整理羽毛。');
  const r = await pending; if (id !== st.rid) return;
  st.current = r; applyResult(r);
  await sleep(350); if (id !== st.rid) return;
  fan.classList.add('open'); setHead('eager');
  await sleep(1900); if (id !== st.rid) return;
  const match = r.verdict === 'swoon' || r.verdict === 'shiver';
  const yawn = r.verdict === 'fold' && st.lastFold;
  st.lastFold = r.verdict === 'fold';
  fan.classList.add('verdict');
  if (match && !reduce) fan.classList.add('match');
  const lover = st.mode === 'lover';
  setHead(yawn ? 'yawning' : lover && r.verdict === 'swoon' ? 'flustered' : HEAD_FOR[r.verdict]);
  const [en, zh] = COPY[st.mode][yawn ? 'yawn' : r.verdict];
  cap(en, zh);
  $('bridge').hidden = !(r.bridge && (r.verdict === 'fold' || r.verdict === 'flicker'));
  if (!match) {
    // no overlap worth a shiver: the peacock folds its tail, head stays, dry look
    await sleep(r.verdict === 'flicker' ? 2600 : 2200); if (id !== st.rid) return;
    fan.classList.remove('open', 'match');
  }
  if (!st.auto) return;
  await sleep(match ? 4800 : 1800); if (id !== st.rid) return;
  next();
}

function showBridge() {
  const r = st.current; if (!r?.bridge) return;
  const b = r.bridge, t = label(b.type);
  feathers.forEach((el) => el.classList.toggle('bridge', el.dataset.type === b.type));
  labs.forEach((el) => {
    const on = el.dataset.type === b.type; el.classList.toggle('bridge', on);
    if (on) el.querySelector('.nm').textContent = `→ ${b.item}`;
  });
  const p = st.cast[st.idx];
  fan.classList.add('open'); // the door needs the tail open again
  setHead(st.mode === 'lover' ? 'flustered' : 'startled');
  $('bridge').hidden = true;
  cap('But here is a door.', b.kind === 'theirs'
    ? `「${t.zh}」這根沒對上，不過 Qloo 認為你可能會喜歡 ${b.item}，那剛好是 ${p.name} 的${t.zh}。`
    : `「${t.zh}」這根沒對上。Qloo 倒是推薦你可以試試 ${b.item}。`);
}

function next() { st.idx = (st.idx + 1) % st.cast.length; play(); }

async function init() {
  const data = await fetch('/api/cast').then((r) => r.json());
  st.cast = data.cast; st.labels = data.labels; st.viewer = data.viewer;
  const order = data.feathers.map((t) => ({ type: t, en: label(t).en, zh: label(t).zh }));
  $('stageSvg').innerHTML = buildFan(order, heads);
  fan = $('fan'); feathers = [...fan.querySelectorAll('.f.m')]; labs = [...document.querySelectorAll('.lab')]; headEls = [...document.querySelectorAll('.head-img')];
  $('castRow').innerHTML = st.cast.map((p) => `<button type="button" data-id="${p.id}" aria-label="${p.name}"><img src="assets/${p.portrait}" alt="" loading="lazy"></button>`).join('');
  $('castRow').addEventListener('click', (e) => { const b = e.target.closest('button'); if (!b) return; st.idx = st.cast.findIndex((p) => p.id === b.dataset.id); play(); });
  renderYou();

  $('next').onclick = next;
  $('replay').onclick = () => play();
  $('bridge').onclick = showBridge;
  const setAuto = () => { $('auto').textContent = '自動播放：' + (st.auto ? '開' : '關'); $('auto').setAttribute('aria-pressed', st.auto); };
  $('auto').onclick = () => { st.auto = !st.auto; setAuto(); if (st.auto && fan.classList.contains('verdict')) { const id = st.rid; st.timer = setTimeout(() => id === st.rid && next(), 1500); } };
  for (const m of ['friend', 'lover']) $(m === 'friend' ? 'mFriend' : 'mLover').onclick = () => {
    st.mode = m; $('mFriend').setAttribute('aria-pressed', m === 'friend'); $('mLover').setAttribute('aria-pressed', m === 'lover'); play();
  };
  setAuto();

  // first frame: Mira already open and shivering (no waiting)
  const p = st.cast[0]; showProfile(p);
  const r = await display(p.id); st.current = r; applyResult(r);
  fan.classList.add('open', 'verdict'); if (r.verdict !== 'fold' && !reduce) fan.classList.add('match');
  setHead(HEAD_FOR[r.verdict]); cap(...COPY.friend[r.verdict]);
}
init().catch((e) => { document.body.insertAdjacentHTML('beforeend', `<p style="padding:24px;color:#E2C783">孔雀暫時出不來：${String(e.message || e)}</p>`); });
