# 開屏 Taste Display

![Taste Display: a peacock with opinions](docs/devpost-cover-peacock.png)

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
| live, one call failed | Qloo rejected or timed out on a call | that call is left empty and marked `error` with Qloo's reply; demo data is never mixed into live results |

The Qloo call trace is shown in the page (「Qloo 呼叫紀錄」), so a judge can see exactly which calls were real.

```bash
QLOO_API_KEY=... npm run qloo:smoke   # prints raw Qloo responses to verify the response shape
```

## Sound (optional, off by default)

The 「Sound」 toggle adds synthesised effects (feather rustle, a gold chime, a kiss "pop" in Lover mode — no audio files, no copyright) and lets the peacock speak its lines.

- English lines are pre-recorded (`public/audio/en/`, British male voice) with [Kokoro](https://github.com/thewh1teagle/kokoro-onnx), an open-source text-to-speech model that runs locally. No key and no network call is needed to record them.
- A second recording in a British female voice is kept in `public/audio/en-f/` (not wired into the page yet).
- Chinese lines use the browser's own zh-TW voice.

```bash
pip install kokoro-onnx soundfile     # plus ffmpeg; model files: see scripts/make-voice-kokoro.py
node -e "import('./scripts/voice-lines.mjs').then(m=>console.log(JSON.stringify(m.enumerateLines(['en']))))" > /tmp/lines.json
KOKORO_DIR=/path/to/models python3 scripts/make-voice-kokoro.py /tmp/lines.json
# female voice:  KOKORO_VOICE=bf_emma KOKORO_OUT=en-f KOKORO_SPEED_SCALE=0.93 ...
```

An older Google Cloud TTS script (`npm run voice`) is still in `scripts/`; it is not what the shipped recordings were made with.

## API

- `GET /health` — status and Qloo mode
- `GET /api/cast` — the ten fictional adults
- `POST /api/display` `{ "profileId": "mira", "viewer": { "feathers": { "artist": ["Brian Eno"] } } }`
- `POST /mcp` — MCP (Streamable HTTP, spec 2025-11-25): `list_cast`, `open_display`, `bridge_feather`

Limits: at most 3 items per category, 60 characters each; per-IP rate limit; 6-hour private server-side response cache.

## How a request becomes a result (keys redacted)

For one character, the page shows the exact calls under **Under the hood**. A typical pair looks like this:

```
GET https://hackathon.api.qloo.com/search?query=Brian%20Eno&types=urn:entity:artist&take=1
    X-Api-Key: <redacted, set only as a server environment variable>
    -> matched: Brian Eno

GET https://hackathon.api.qloo.com/v2/insights?filter.type=urn:entity:artist
        &signal.interests.entities=<entity id from the search above>&take=40
    -> N results; top three printed with Qloo's affinity number
```

The page labels every call `live` (asked Qloo just now), `cache` (asked earlier), `skip` (Qloo cannot use that item as a taste signal) or `error` (Qloo refused). In live mode a failed call is left empty and marked; it is never filled with demo data.

## Data handling

- The Qloo key lives only in the server environment. It is never sent to the browser, never logged, and not in this repo.
- The app does not write anything to disk. Typed items are sent to Qloo and kept in memory (inside the cache key) for six hours, then dropped.
- Please enter works, artists, places and brands only. No names of real people you know, and no personal data.
- Qloo response data is not stored in this repository; the tests use hand-written fixtures.
- The ten characters are fictional adults. Nobody is contacted, profiled, or scored.

## Known limitations

- The visitor is a fixed demo taste; you can type up to three items per category, but there is no account or saved profile.
- Qloo cannot use every entity as a taste signal (some places and well-known people return a 400); those are shown as `skip`, and a character with many of them has fewer `neighbor` matches.
- `neighbor` matching reads the first 40 insight results; a connection further down the list is missed.
- The hackathon API accepts the games type only as `urn:entity:videogame`, which differs from the docs. The adapter handles it.
- The English voice is recorded; Chinese uses the browser voice and sounds like a browser voice.
- Two items repeat across characters (Blue Bottle Coffee, Eslite Bookstore). Several items are chosen for the cast's coherence, not looked up per person.
- The cast is ten fictional people. It shows the idea; it does not prove that taste overlap predicts friendship.
- The free Render plan sleeps when idle, so the first load can take up to a minute.
- Checked in a desktop browser and a 390 px window; not yet on a range of real phones. Screen-reader announcements may repeat a caption.
- Verdicts depend on live Qloo data and can change as that data changes.

## Deploy

`render.yaml` is a Render Blueprint. Set `QLOO_API_KEY` in the dashboard (it is not in the repo).

## What changed after Sept 30

This project grew out of an earlier voice-first music-matching MCP experiment. The code here was written new for this hackathon: a new concept (feathers, no score), a new Qloo adapter and compare engine, a new cast, and a new front end. See git history.

## Credits

Concept and direction: Crystal Chang. Code: Claude. Copy and test reviews from three other AI assistants working under Crystal's direction (one GLM-based, one OpenAI-powered, one more); their suggestion sheets and tests are in `docs/` and `tests/`. Illustrations: generated with GPT image tools; all characters are fictional. License: MIT.
