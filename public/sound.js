// Sound: tiny synthesised effects (no files, no copyright) + the peacock's voice.
// Voice = recorded mp3 if present (see scripts/make-voice.mjs), otherwise the browser's own voice (en-GB / zh-TW).
// Off by default; the toggle click is the user gesture browsers require.
let ctx = null, on = false, audio = null, voiceDir = 'en';
const ac = () => (ctx ??= new (window.AudioContext || window.webkitAudioContext)());

export const isOn = () => on;
export const isHer = () => voiceDir === 'en-f';
export function setHer(v) { voiceDir = v ? 'en-f' : 'en'; stopVoice(); }
export function setOn(v) { on = v; if (v) { try { ac().resume(); } catch {} } else stopVoice(); }

function env(g, t, a, peak, d) { g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(peak, t + a); g.gain.exponentialRampToValueAtTime(0.0001, t + d); }

export function rustle() { // feathers opening: filtered noise with flutter
  if (!on) return; try {
    const c = ac(), t = c.currentTime, len = 1.3;
    const buf = c.createBuffer(1, c.sampleRate * len, c.sampleRate), d = buf.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1) * (0.55 + 0.45 * Math.sin(i / c.sampleRate * 38));
    const src = c.createBufferSource(); src.buffer = buf;
    const f = c.createBiquadFilter(); f.type = 'bandpass'; f.Q.value = 0.9; f.frequency.setValueAtTime(2500, t); f.frequency.exponentialRampToValueAtTime(7200, t + len);
    const g = c.createGain(); env(g, t, 0.18, 0.22, len);
    src.connect(f).connect(g).connect(c.destination); src.start(t);
  } catch {}
}
export function pop() { // the kiss stamp
  if (!on) return; try {
    const c = ac(), t = c.currentTime, o = c.createOscillator(), g = c.createGain();
    o.type = 'sine'; o.frequency.setValueAtTime(720, t); o.frequency.exponentialRampToValueAtTime(130, t + 0.11);
    env(g, t, 0.006, 0.35, 0.14); o.connect(g).connect(c.destination); o.start(t); o.stop(t + 0.2);
  } catch {}
}
export function chime() { // gold sparkle
  if (!on) return; try {
    const c = ac(), t = c.currentTime;
    [[1318.5, 0], [1760, 0.09], [2093, 0.18]].forEach(([hz, dt]) => {
      const o = c.createOscillator(), g = c.createGain(); o.type = 'sine'; o.frequency.value = hz;
      env(g, t + dt, 0.01, 0.09, 0.7); o.connect(g).connect(c.destination); o.start(t + dt); o.stop(t + dt + 0.8);
    });
  } catch {}
}

// A line is "in flight" from say() until it ends, errors, or is stopped. whenDone() lets the caller wait for it.
let fin = null, speakT = 0, curU = null;
function settle() { const f = fin; fin = null; if (f) f(); }

export function stopVoice() {
  clearTimeout(speakT);
  try { if (audio) { audio.pause(); audio = null; } } catch {}
  try { window.speechSynthesis?.cancel(); } catch {}
  settle();
}

// resolves when the current line has finished (or after maxMs); immediately if nothing is playing
export function whenDone(maxMs = 4000) {
  return new Promise((res) => {
    if (!fin) return res();
    const prev = fin; fin = () => { prev(); res(); };
    setTimeout(res, maxMs);
  });
}

function browserVoice(text, lang) {
  const ss = window.speechSynthesis; if (!ss) return settle();
  const u = new SpeechSynthesisUtterance(text); curU = u; // keep a reference: Chrome can garbage-collect a playing utterance
  const want = lang === 'zh' ? 'zh-TW' : 'en-GB';
  u.lang = want; u.rate = lang === 'zh' ? 1 : 0.94; u.pitch = lang === 'zh' ? 1 : 0.85;
  const v = ss.getVoices().find((x) => x.lang === want) || ss.getVoices().find((x) => x.lang.startsWith(want.slice(0, 2)));
  if (v) u.voice = v;
  u.onend = u.onerror = () => { if (curU === u) settle(); };
  // Chrome swallows a speak() issued in the same tick as cancel(); give it a beat
  clearTimeout(speakT); speakT = setTimeout(() => ss.speak(u), 80);
}

// id: stable line id; text: what to say if no recording exists.
// Only English has recordings (the British voice); the 中 side uses the browser's own voice without a pointless 404.
export function say(lang, id, text, delay = 0) {
  if (!on) return; stopVoice();
  fin = () => {}; // "in flight" starts now, even if the voice itself starts after `delay`
  const go = () => {
    if (window.__NOAUDIO || lang !== 'en') return browserVoice(text, lang);
    const a = new Audio(`audio/${lang === 'en' ? voiceDir : lang}/${id}.mp3`); audio = a;
    a.onended = () => { if (audio === a) { audio = null; settle(); } };
    a.onerror = () => { if (audio === a) { audio = null; browserVoice(text, lang); } };
    a.play().catch(() => { if (audio === a) { audio = null; browserVoice(text, lang); } });
  };
  if (delay) speakT = setTimeout(go, delay); else go();
}
