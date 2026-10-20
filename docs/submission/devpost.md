# Devpost text — 開屏 Taste Display (draft)

**Tagline:** Taste is not a score. It is a display.

## Inspiration
Compatibility apps boil two people down to a number. Taste doesn't work that way. You can share one film, one record and one coffee shop with a stranger and never agree on anything else. We wanted an interface that shows *where* two tastes meet, and does nothing more.

So we gave the job to a peacock with opinions.

## What it does
Qloo's ten entity types are the ten feathers of the tail: film, series, artist, book, place, destination, podcast, game, brand, person. You are a visitor with a demo taste. Pick one of ten fictional adults, and the peacock compares your ten feathers with theirs.

- Where your tastes meet, feathers shiver and the names turn gold.
- If nothing meets, the tail folds. The peacock gives you a dry look and moves on.
- When a tail folds or only flickers, the peacock may whisper a **door**: a Qloo recommendation to explore, with its basis shown.
- There is **no compatibility score**. The peacock judges feathers, never the person. Qloo's affinity number appears only on a single recommended item.

The peacock has a Friend mode (teases) and a Lover mode (blushes), English and Traditional Chinese, and optional voice.

## How we use Qloo
Qloo is the part that makes the display more than string matching.

1. **Search** (`/search`) resolves each item to a Qloo entity of the right type.
2. **Insights** (`/v2/insights`), seeded with your items of one type, returns what sits in the same taste neighbourhood. If the character's item appears there, that feather is a `neighbor` match ("≈"). Identical items are `same` ("=").
3. **Doors**: when a tail folds, we ask Qloo what you might love in a category where the *other* person has taste. If the same item is also recommended from the character's own items, the door says so (shared). Otherwise it is a recommendation from your taste alone, and the page says that too.

Without Qloo the app could only match exact names. With it, Brian Eno and Aphex Twin can make a feather shiver, and two people in different genres can still be handed a door.

The page shows every call under **Under the hood**, labelled `live`, `cache`, `skip` or `error`, with a short summary of what Qloo sent back. A failed live call is left empty and marked; it is never filled with demo data.

## How we built it
A zero-dependency Node server (MCP over Streamable HTTP plus a small JSON API), a vanilla JavaScript front end, and a Qloo adapter with a request queue, retry with back-off on rate limits, and a six-hour private cache. English lines are pre-recorded with Kokoro, an open-source local text-to-speech model. Three other AI assistants reviewed the copy, the code paths and the mobile layout, and contributed tests.

## Responsible data
- The ten characters are fictional adults. Nobody is contacted, profiled or scored.
- The Qloo key stays on the server. The app writes nothing to disk, and Qloo responses are not stored in the repository.
- The public demo uses a preset taste profile and fictional adult characters; visitors do not need to enter personal information.
- The peacock says what a verdict is based on and what it is not.

## Challenges
The live API is stricter than its documentation: games must be sent as `urn:entity:videogame`; some places and people cannot be used as a taste signal; rate limits arrive in bursts. We handled each openly (queue, retry, a visible `skip` state) rather than hiding it.

## What we learned
Showing less is more convincing. Listing the ten things a folded tail *did* see, and printing what Qloo sent back, made the app more honest and more fun than any score would have.

## What's next
Let a visitor bring their own taste; let two real people compare with consent; more languages and voices.

## Built with
Node.js, Qloo Taste AI API, MCP (Streamable HTTP), vanilla JavaScript, Kokoro TTS, Render.

## Links
- Live: https://taste-display.onrender.com
- Code: https://github.com/Crystal32378/peacock-taste-display
