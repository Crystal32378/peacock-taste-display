// Every line the peacock can say, with the stable file id the site will look for.
import { COPY, lineId, lineText } from '../public/i18n.js';
import { FEATHER_ORDER, FEATHER_LABEL } from '../data/cast.js';

const catName = (lang, type) => (lang === 'en' ? FEATHER_LABEL[type].en.toLowerCase() : FEATHER_LABEL[type].zh);

export function enumerateLines(langs = ['en', 'zh']) {
  const out = [];
  for (const lang of langs) for (const [mode, keys] of Object.entries(COPY[lang])) for (const [key, pool] of Object.entries(keys)) {
    pool.forEach(([head, body], i) => {
      if (head.includes('{cat}') || body.includes('{cat}')) {
        for (const type of FEATHER_ORDER) out.push({ lang, id: lineId(lang, mode, key, i, type), text: lineText(head, body, catName(lang, type)) });
      } else out.push({ lang, id: lineId(lang, mode, key, i, ''), text: lineText(head, body, '') });
    });
  }
  // the one recorded line of "the door" (the rest of the bridge sentence is templated with item names)
  if (langs.includes('en')) out.push({ lang: 'en', id: 'en.bridge.head', text: 'But here is a door.' });
  return out;
}
