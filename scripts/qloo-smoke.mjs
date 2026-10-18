// Run once when you have a key:  QLOO_API_KEY=... npm run qloo:smoke
// Prints the RAW Qloo responses so we can confirm the response shape. Never prints the key.
const key = process.env.QLOO_API_KEY;
const base = (process.env.QLOO_BASE_URL || 'https://hackathon.api.qloo.com').replace(/\/$/, '');
if (!key) { console.error('Set QLOO_API_KEY first.'); process.exit(1); }

async function get(p) {
  const r = await fetch(base + p, { headers: { 'X-Api-Key': key, Accept: 'application/json' } });
  const text = await r.text();
  console.log(`\n=== GET ${p}\nHTTP ${r.status}\n${text.slice(0, 1800)}${text.length > 1800 ? '\n…(truncated)' : ''}`);
  try { return JSON.parse(text); } catch { return null; }
}

const search = await get('/search?query=' + encodeURIComponent('Brian Eno') + '&types=' + encodeURIComponent('urn:entity:artist') + '&take=1');
const id = search?.results?.[0]?.entity_id || search?.results?.[0]?.id || search?.results?.entities?.[0]?.entity_id;
if (id) await get('/v2/insights?filter.type=' + encodeURIComponent('urn:entity:artist') + '&signal.interests.entities=' + encodeURIComponent(id) + '&take=5');
else console.log('\nNo entity id found in the search response — send this output back so the parser can be adjusted.');
await get('/search?query=' + encodeURIComponent('Hades') + '&types=' + encodeURIComponent('urn:entity:videogame') + '&take=1');
