# 開屏 Taste Display

> Taste is not a score. It is a display.

A peacock that shows taste. Each of Qloo's ten entity types is one feather — **film, series, artist, book, place, destination, podcast, game, brand, person**. Open a profile and the tail opens. Feathers where your taste meets theirs shiver. If nothing meets, the peacock folds its tail, gives you a dry look, and moves on.

There is **no compatibility score** between two people. The peacock judges feather overlap, never the person. Affinity numbers only ever appear on a single item.

Built for the Qloo Agentic Hackathon. Everyone in the demo is a **fictional adult (18+)**; nobody is contacted.

## Where Qloo is essential

For each feather, the engine asks Qloo one question: *do these two people's tastes meet in this category?*

| State | Meaning | How it is decided |
|---|---|---|
| `same` | the very same thing | direct match, no call needed |
| `neighbor` | different things, same taste neighborhood | the other person's item appears in Qloo **insights** seeded with your item(s) of that type |
| `none` | no meeting point | — |

Then the **bridge feather**: when a tail folds or only flickers, Qloo is asked, from everything you like, what you might love in a category where *they* have taste. If one of their items comes back, that is the door.

Without Qloo this app could only do exact matching. With it, "Brian Eno" and "Aphex Twin" can make a feather shiver, and a stranger in a different genre can still hand you a door.

The verdict is only the **count** of resonant feathers (≥5 swoon · ≥3 shiver · 1–2 flicker · 0 fold) and it drives the animation. It is never displayed as a number.

## Run it

```bash
npm test          # node >= 22, zero dependencies
npm start         # http://localhost:8080
```

| Mode | When | What the UI says |
|---|---|---|
| `live` | `QLOO_API_KEY` is set | "Qloo 即時 API" |
| `fixture` | no key | "離線示範資料 (fixture)" — hand-written neighbors, **not Qloo output** |
| `fallback` | live call failed | per-call trace marks `fallback` with the error |

The Qloo call trace is shown in the page (「Qloo 呼叫紀錄」), so a judge can see exactly which calls were real.

```bash
QLOO_API_KEY=... npm run qloo:smoke   # prints raw Qloo responses to verify the response shape
```

## API

- `GET /health` — status and Qloo mode
- `GET /api/cast` — the ten fictional adults
- `POST /api/display` `{ "profileId": "mira", "viewer": { "feathers": { "artist": ["Brian Eno"] } } }`
- `POST /mcp` — MCP (Streamable HTTP, spec 2025-11-25): `list_cast`, `open_display`, `bridge_feather`

Limits: at most 3 items per category, 60 characters each; per-IP rate limit; 10-minute response cache.

## Deploy

`render.yaml` is a Render Blueprint. Set `QLOO_API_KEY` in the dashboard (it is not in the repo).

## What changed after Sept 30

This project grew out of an earlier voice-first music-matching MCP experiment. The code here was written new for this hackathon: a new concept (feathers, no score), a new Qloo adapter and compare engine, a new cast, and a new front end. See git history.

## Credits

Concept and direction: Crystal Chang. Code: Claude. Illustrations: generated with GPT image tools; all characters are fictional. License: MIT.
