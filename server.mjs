// Taste Display (開屏) — web demo + MCP server (Streamable HTTP, spec 2025-11-25).
// Zero dependencies. `npm start` (PORT env, default 8080).
//   GET  /health        status + Qloo mode (live | fixture)
//   GET  /api/cast      the ten fictional adults (no comparison)
//   POST /api/display   { profileId, viewer?: { feathers } }  -> feather-by-feather result
//   POST /mcp           JSON-RPC tools: list_cast, open_display, bridge_feather
//   GET  /              the peacock page (public/)
// Everything is fictional and adult (18+). Nobody is contacted. No compatibility score exists.
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { cast, viewer as defaultViewer, FEATHER_ORDER, FEATHER_LABEL } from './data/cast.js';
import { createQloo } from './src/qloo.mjs';
import { compare, cleanFeathers } from './src/taste.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PUBLIC = path.join(__dirname, 'public');
const PORT = Number(process.env.PORT || 8080);
const SERVER = { name: 'taste-display', version: '0.1.0' };
const SPEC = '2025-11-25';
const qloo = createQloo();

// Small per-IP limiter so a public demo cannot burn the Qloo quota.
const hits = new Map();
function limited(ip, max = 40, windowMs = 60_000) {
  const now = Date.now();
  const arr = (hits.get(ip) || []).filter((t) => now - t < windowMs);
  arr.push(now);
  hits.set(ip, arr);
  return arr.length > max;
}

const publicCast = () => cast.map(({ id, name, age, city, cityEn, portrait, blurb, blurbEn, feathers }) => ({ id, name, age, city, cityEn, portrait, blurb, blurbEn, feathers: cleanFeathers(feathers) }));

async function display(args = {}) {
  const profile = cast.find((c) => c.id === args.profileId);
  if (!profile) return { error: `Unknown profileId "${args.profileId}". Try: ${cast.map((c) => c.id).join(', ')}.` };
  const viewer = args.viewer?.feathers ? { id: 'you', feathers: cleanFeathers(args.viewer.feathers) } : defaultViewer;
  const r = await compare(viewer, profile, qloo);
  return {
    ...r,
    note: 'No compatibility score exists. The peacock judges feather overlap, never the person. Fictional adults (18+); nobody is contacted.',
    labels: FEATHER_LABEL,
  };
}

const TOOLS = [
  {
    name: 'list_cast',
    description: 'The ten fictional adults the peacock can show you. Returns their feathers (taste in ten Qloo categories). Does not compare anything.',
    inputSchema: { type: 'object', properties: {} },
  },
  {
    name: 'open_display',
    description: 'Open the peacock tail for one profile. For each of ten feathers (film, series, artist, book, place, destination, podcast, game, brand, person) Qloo decides whether your taste and theirs meet: same, neighbor, or none. Verdict is swoon / shiver / flicker / fold — a count of resonant feathers that drives the animation, never a score. Optionally pass your own taste (max 3 items per category).',
    inputSchema: {
      type: 'object',
      properties: {
        profileId: { type: 'string', description: `One of: ${cast.map((c) => c.id).join(', ')}` },
        viewer: { type: 'object', description: 'Optional. { feathers: { artist: ["Brian Eno"], book: [...] } } using the ten feather keys.' },
      },
      required: ['profileId'],
    },
  },
  {
    name: 'bridge_feather',
    description: 'When a tail folds or only flickers, ask for the one cross-category door: a feather where Qloo thinks you might meet them anyway.',
    inputSchema: { type: 'object', properties: { profileId: { type: 'string' }, viewer: { type: 'object' } }, required: ['profileId'] },
  },
];

const ok = (data) => ({ content: [{ type: 'text', text: JSON.stringify(data, null, 2) }], structuredContent: data });
const bad = (msg) => ({ content: [{ type: 'text', text: msg }], isError: true });

async function callTool(name, args = {}) {
  if (name === 'list_cast') return ok({ cast: publicCast(), feathers: FEATHER_ORDER });
  if (name === 'open_display' || name === 'bridge_feather') {
    const r = await display(args);
    if (r.error) return bad(r.error);
    if (name === 'bridge_feather') {
      return ok(r.bridge
        ? { profileId: r.profileId, verdict: r.verdict, bridge: r.bridge, engine: r.engine }
        : { profileId: r.profileId, verdict: r.verdict, bridge: null, message: 'This tail already speaks to you, or no door was found.' });
    }
    return ok(r);
  }
  return bad(`Unknown tool "${name}".`);
}

const rpcError = (id, code, message) => ({ jsonrpc: '2.0', id: id ?? null, error: { code, message } });

async function handleRpc(msg, req) {
  const { id = null, method, params = {} } = msg || {};
  if (msg?.jsonrpc !== '2.0' || typeof method !== 'string') return rpcError(id, -32600, 'Invalid Request: expected JSON-RPC 2.0 with method.');
  switch (method) {
    case 'initialize':
      req._newSession = `sess-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
      return { jsonrpc: '2.0', id, result: {
        protocolVersion: SPEC, requestedVersion: params.protocolVersion || SPEC,
        capabilities: { tools: { listChanged: false } }, serverInfo: SERVER,
        instructions: 'A peacock that shows taste. Start with list_cast, then open_display for a profile. When a tail folds, bridge_feather. There is no compatibility score. Fictional adults only.',
      } };
    case 'notifications/initialized': return null;
    case 'tools/list': return { jsonrpc: '2.0', id, result: { tools: TOOLS } };
    case 'tools/call':
      if (!params.name) return rpcError(id, -32602, 'Missing tool name.');
      return { jsonrpc: '2.0', id, result: await callTool(params.name, params.arguments || {}) };
    case 'resources/list': return { jsonrpc: '2.0', id, result: { resources: [] } };
    case 'prompts/list': return { jsonrpc: '2.0', id, result: { prompts: [] } };
    case 'ping': return { jsonrpc: '2.0', id, result: {} };
    default: return rpcError(id, -32601, `Method not found: ${method}`);
  }
}

function sendJson(res, code, obj, extra = {}) {
  res.writeHead(code, { 'Content-Type': 'application/json; charset=utf-8', 'Access-Control-Allow-Origin': '*', ...extra });
  res.end(JSON.stringify(obj));
}

function readBody(req, limit = 64 * 1024) {
  return new Promise((resolve, reject) => {
    let raw = '';
    req.on('data', (c) => { raw += c; if (raw.length > limit) { reject(new Error('too large')); req.destroy(); } });
    req.on('end', () => resolve(raw));
    req.on('error', reject);
  });
}

const MIME = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css', '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.svg': 'image/svg+xml', '.webp': 'image/webp', '.json': 'application/json' };

export const server = http.createServer(async (req, res) => {
  try {
    const url = new URL(req.url || '/', `http://${req.headers.host || 'localhost'}`);
    const ip = req.headers['x-forwarded-for']?.split(',')[0].trim() || req.socket.remoteAddress || '?';
    if (req.method === 'OPTIONS') {
      res.writeHead(204, { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'GET,POST,DELETE,OPTIONS', 'Access-Control-Allow-Headers': 'Content-Type, Accept, Mcp-Session-Id', 'Access-Control-Expose-Headers': 'Mcp-Session-Id' });
      return res.end();
    }
    if (url.pathname === '/health' && req.method === 'GET')
      return sendJson(res, 200, { ok: true, ...SERVER, spec: SPEC, qloo: qloo.mode(), tools: TOOLS.map((t) => t.name) });
    if (url.pathname === '/api/cast' && req.method === 'GET') return sendJson(res, 200, { cast: publicCast(), feathers: FEATHER_ORDER, labels: FEATHER_LABEL, viewer: defaultViewer });
    if (url.pathname === '/api/display' && req.method === 'POST') {
      if (limited(ip)) return sendJson(res, 429, { error: 'The peacock needs a breath. Try again in a minute.' });
      let body;
      try { body = JSON.parse((await readBody(req)) || '{}'); } catch { return sendJson(res, 400, { error: 'Body must be JSON.' }); }
      const r = await display(body);
      return sendJson(res, r.error ? 404 : 200, r);
    }
    if (url.pathname === '/mcp') {
      if (req.method === 'GET') return sendJson(res, 405, { error: 'Use POST /mcp with JSON-RPC 2.0 (Streamable HTTP, spec 2025-11-25).' });
      if (req.method === 'DELETE') { res.writeHead(200, { 'Access-Control-Allow-Origin': '*' }); return res.end(); }
      if (req.method === 'POST') {
        if (limited(ip, 120)) return sendJson(res, 429, rpcError(null, -32000, 'Rate limited.'));
        let msg;
        try { msg = JSON.parse((await readBody(req)) || '{}'); } catch { return sendJson(res, 400, rpcError(null, -32700, 'Parse error: body must be JSON.')); }
        const out = Array.isArray(msg) ? (await Promise.all(msg.map((m) => handleRpc(m, req)))).filter(Boolean) : await handleRpc(msg, req);
        const extra = req._newSession ? { 'Mcp-Session-Id': req._newSession, 'Access-Control-Expose-Headers': 'Mcp-Session-Id' } : {};
        if (out === null) { res.writeHead(202, { 'Access-Control-Allow-Origin': '*', ...extra }); return res.end(); }
        return sendJson(res, 200, out, extra);
      }
    }
    if (req.method === 'GET') {
      const rel = url.pathname === '/' ? '/index.html' : decodeURIComponent(url.pathname);
      const fp = path.join(PUBLIC, path.normalize(rel));
      if (!fp.startsWith(PUBLIC + path.sep)) return sendJson(res, 403, { error: 'forbidden' });
      return fs.readFile(fp, (e, data) => {
        if (e) return sendJson(res, 404, { error: 'not found' });
        res.writeHead(200, { 'Content-Type': MIME[path.extname(fp).toLowerCase()] || 'application/octet-stream', 'Cache-Control': 'public, max-age=300' });
        res.end(data);
      });
    }
    return sendJson(res, 404, { error: 'not found' });
  } catch (err) {
    return sendJson(res, 500, { error: String(err?.message || err) });
  }
});

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  server.listen(PORT, () => console.log(`[taste-display] http://localhost:${PORT}  ·  MCP /mcp (spec ${SPEC})  ·  Qloo mode: ${qloo.mode()}`));
}
