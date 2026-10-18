// Builds the peacock fan as SVG: ten main feathers (one per Qloo entity type) over a back layer of 25 plumes.
// Deterministic (seeded) so the bird looks the same on every visit.
export const OX = 720, OY = 880;
const f = (x) => x.toFixed(1);
function rng(seed) { let s = seed >>> 0; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }

function barbs(rnd, L, Wmax, nlow, nhigh) {
  const ts = [];
  for (let i = 0; i < nlow; i++) ts.push(0.03 + (0.6 - 0.03) * i / (nlow - 1));
  for (let i = 1; i < nhigh; i++) ts.push(0.6 + (0.995 - 0.6) * i / (nhigh - 1));
  let main = '', gold = '';
  for (const t of ts) {
    const y = -t * L;
    const wisp = t < 0.6 ? 20 * (t / 0.6) ** 1.6 : 0;
    const oval = t >= 0.6 ? Wmax * Math.sqrt(Math.max(0, 1 - ((t - 0.8) / 0.2) ** 2)) : 0;
    const hw = Math.max(wisp, oval);
    for (const s of [-1, 1]) {
      const h = hw * (0.9 + rnd() * 0.18);
      if (h < 2) continue;
      const d = `M0 ${f(y)}Q${f(s * h * 0.45)} ${f(y - h * 0.04)} ${f(s * h)} ${f(y - h * 0.55 - 4)}`;
      if (rnd() < 0.13) gold += d; else main += d;
    }
  }
  return { main, gold };
}

function eye(cy, k, halo) {
  let g = '';
  if (halo) g += `<ellipse class="halo" cx="0" cy="${f(cy)}" rx="${f(48 * k)}" ry="${f(62 * k)}" fill="#35C6B0" filter="url(#blur)"/>`;
  g += `<ellipse cx="0" cy="${f(cy)}" rx="${f(30 * k)}" ry="${f(40 * k)}" fill="url(#eBronze)" stroke="#E8CD8A" stroke-opacity="0.8" stroke-width="0.8"/>`;
  g += `<ellipse cx="0" cy="${f(cy)}" rx="${f(24 * k)}" ry="${f(33 * k)}" fill="url(#eGreen)"/>`;
  g += `<ellipse cx="0" cy="${f(cy + k)}" rx="${f(18 * k)}" ry="${f(26 * k)}" fill="url(#eBlue)"/>`;
  g += `<ellipse cx="0" cy="${f(cy + 2 * k)}" rx="${f(12 * k)}" ry="${f(17 * k)}" fill="url(#eTeal)"/>`;
  g += `<path d="M0 ${f(cy + 14 * k)}C${f(-9 * k)} ${f(cy + 6 * k)} ${f(-8 * k)} ${f(cy - 8 * k)} 0 ${f(cy - 6 * k)}C${f(8 * k)} ${f(cy - 8 * k)} ${f(9 * k)} ${f(cy + 6 * k)} 0 ${f(cy + 14 * k)}Z" fill="#0A0E2C"/>`;
  g += `<ellipse cx="${f(-2.2 * k)}" cy="${f(cy - 3 * k)}" rx="${f(2 * k)}" ry="${f(3.6 * k)}" fill="#fff" opacity="0.38"/>`;
  return g;
}

// feathers: [{type, en, zh}] in display order (left to right)
export function buildFan(feathers, headSrcs) {
  const rnd = rng(11);
  let parts = '';
  for (let i = 0; i < 25; i++) {
    const a = -88 + i * (176 / 24), L = 430 + rnd() * 70;
    const { main } = barbs(rnd, L, 40, 26, 46);
    const d = 0.12 + Math.abs(a) / 88 * 0.35;
    parts += `<g class="f b" style="--a:${f(a)};--d:${f(d)}s;--dc:${f(Math.max(0, 0.35 - d))}s"><g opacity="0.36"><path d="M0 0L0 ${f(-L)}" stroke="#8a8f4b" stroke-width="0.8" fill="none"/><path d="${main}" stroke="url(#bg)" stroke-width="0.6" fill="none"/>${eye(-0.8 * L, 0.55, false)}</g></g>`;
  }
  const L = 545, n = feathers.length;
  let labels = '';
  feathers.forEach((ft, i) => {
    const a = -74 + i * (148 / (n - 1));
    const { main, gold } = barbs(rnd, L, 52, 34, 100);
    const d = Math.abs(i - (n - 1) / 2) * 0.07;
    parts += `<g class="f m" data-type="${ft.type}" style="--a:${f(a)};--d:${f(d)}s;--dc:${f(Math.max(0, 0.4 - d))}s;--amp:${f(1.6 + rnd() * 1.2)};--sd:-${f(rnd() * 0.12)}s"><g><path d="M0 0L0 ${f(-L)}" stroke="#B9A56A" stroke-width="1.1" fill="none"/><path d="${main}" stroke="url(#bg)" stroke-width="0.75" fill="none" opacity="0.9"/><path d="${gold}" stroke="#E2C783" stroke-width="0.7" fill="none" opacity="0.7"/>${eye(-0.8 * L, 1, true)}</g></g>`;
    const r = L + 40, ar = a * Math.PI / 180, x = OX + r * Math.sin(ar), y = OY - r * Math.cos(ar);
    labels += `<g class="lab" data-type="${ft.type}"><text class="en" x="${f(x)}" y="${f(y)}" text-anchor="middle">${ft.en}</text><text class="zh" x="${f(x)}" y="${f(y + 19)}" text-anchor="middle">${ft.zh}</text><text class="nm" x="${f(x)}" y="${f(y + 44)}" text-anchor="middle"></text></g>`;
  });
  const W = 360, hx = OX - 0.551 * W, hy = OY + 40 - W;
  const heads = Object.entries(headSrcs).map(([k, src]) => `<image class="head-img" data-mood="${k}" href="${src}" x="${f(hx)}" y="${f(hy)}" width="${W}" height="${W}"/>`).join('');
  return `<svg id="svg" role="img" aria-label="孔雀開屏：十根羽毛各代表一種品味類別，與對方重疊的羽毛會抖動" viewBox="100 200 1240 730" preserveAspectRatio="xMidYMid meet">
<defs>
<linearGradient id="bg" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="0" y2="-560"><stop offset="0" stop-color="#8A8F4B"/><stop offset="0.3" stop-color="#6E9A52"/><stop offset="0.55" stop-color="#1F8F70"/><stop offset="0.8" stop-color="#1A7C8C"/><stop offset="1" stop-color="#B58B3C"/></linearGradient>
<radialGradient id="eBronze" cx="0.4" cy="0.35" r="0.8"><stop offset="0" stop-color="#F0D794"/><stop offset="0.6" stop-color="#B98A3A"/><stop offset="1" stop-color="#6E4D1C"/></radialGradient>
<radialGradient id="eGreen" cx="0.4" cy="0.35" r="0.8"><stop offset="0" stop-color="#4FD0A0"/><stop offset="0.6" stop-color="#16876C"/><stop offset="1" stop-color="#0A4B45"/></radialGradient>
<radialGradient id="eBlue" cx="0.4" cy="0.35" r="0.8"><stop offset="0" stop-color="#4C86E6"/><stop offset="0.55" stop-color="#1B49A8"/><stop offset="1" stop-color="#0E2468"/></radialGradient>
<radialGradient id="eTeal" cx="0.4" cy="0.35" r="0.8"><stop offset="0" stop-color="#6FE3D6"/><stop offset="0.6" stop-color="#1B9AA6"/><stop offset="1" stop-color="#16508F"/></radialGradient>
<radialGradient id="glow" cx="${OX}" cy="${OY}" r="660" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#1B5A4A" stop-opacity="0.6"/><stop offset="1" stop-color="#0C1512" stop-opacity="0"/></radialGradient>
<filter id="blur" x="-60%" y="-60%" width="220%" height="220%"><feGaussianBlur stdDeviation="14"/></filter>
</defs>
<rect x="-300" y="-300" width="2040" height="1700" fill="url(#glow)"/>
<g fill="none" stroke="#C9A66B" stroke-opacity="0.16" stroke-width="0.8"><path d="M${OX - 300} ${OY}A300 300 0 0 1 ${OX + 300} ${OY}"/><path d="M${OX - 660} ${OY}A660 660 0 0 1 ${OX + 660} ${OY}"/></g>
<g id="fan" class="fan" transform="translate(${OX} ${OY})">${parts}</g>
<g id="head">${heads}</g>
<g id="labs">${labels}</g>
</svg>`;
}
