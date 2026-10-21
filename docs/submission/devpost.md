# Devpost text — 開屏 Taste Display (draft, structured around the four judging criteria)

**Tagline:** Taste is not a score. It is a display.

**Try it:** https://taste-display.onrender.com (free host: the first load can take up to a minute)
**Code (MIT):** https://github.com/Crystal32378/peacock-taste-display

## Try it in 60 seconds
1. Open the link and wait for the peacock (a free host may need up to a minute to wake).
2. Pick a character. Watch which feathers go gold, and read what the peacock says about them.
3. Scroll to the bottom and open **Under the hood** to see the real Qloo calls behind that verdict.

## What it is
A peacock that shows taste. Qloo's ten entity types are the ten feathers of its tail: film, series, artist, book, place, destination, podcast, game, brand, person. You are a visitor with a demo taste. Pick one of ten fictional adults and the peacock compares your ten feathers with theirs.

- Where your tastes meet, feathers shiver and the names turn gold.
- If nothing meets, the tail folds, with a dry look.
- When a tail folds or only flickers, the peacock may whisper a **door**: a Qloo recommendation to explore, with its basis shown.
- There is **no compatibility score**. The peacock judges feathers, never the person. Qloo's affinity number appears only on a single recommended item.

It has a Friend mode (teases) and a Lover mode (blushes), English and Traditional Chinese, and an optional voice (British, male or female).

## Technological implementation (how we use Qloo)
Qloo does the part exact matching cannot.

1. **Search** (`/search`) resolves items to Qloo entities of the right type. Items that are exactly the same on both sides match directly and need no call.
2. **Insights** (`/v2/insights`), seeded with your items of one type, returns what lives in the same taste neighbourhood. If the character's item is in that list, the feather is a **neighbour** match (≈). Identical items are a **same** match (=).
3. **Doors:** when a tail folds, we ask Qloo what you might love in a category where the other person has taste. A door comes from one of three sources, and the page says which: an item the other person already has that Qloo recommends from your taste; an item Qloo recommends from both your items and theirs (shared); or, failing both, a recommendation from your taste alone.

Engineering that matters in practice:
- A request queue with retry and back-off for Qloo's rate limits, and a six-hour private cache.
- The hackathon API is stricter than its docs (games must be sent as `urn:entity:videogame`; some places and people cannot be used as a taste signal). Those cases are handled and shown as `skip`, not hidden.
- In live mode a failed call is left empty and labelled `error`. Demo data is never mixed into live results.
- Every call is visible under **Under the hood**, labelled `live`, `cache`, `skip` or `error`, with a short summary of what Qloo returned.
- The same engine is exposed as MCP tools (`list_cast`, `open_display`, `bridge_feather`) over Streamable HTTP.
- 44 automated tests in the repository; copy, audio and mobile layout were reviewed by three other AI assistants, who contributed tests.

## Design
A fully playable demo, not a sketch: ten characters with full ten-feather taste profiles, a peacock whose reaction (swoon, shiver, flicker, fold, yawn, eye-roll, double take) is chosen from what actually matched, bilingual captions, recorded British voices, a mobile layout with a fixed control bar, and an honest "how it works" panel. Everything the peacock says is checked against what is on screen: it never claims a feather moved that did not.

## Potential impact
We do not claim to solve a large problem. We make a narrower, credible point: many recommendation and matching products compress taste into one number, and a number invites ranking people. Picture two people at a community event: instead of "you are a 78% match", they see that their *books* and *places* meet, and that is what they start talking about. A display of *which things meet* is a gentler and more useful starting point for conversation, for friends, communities, dating-adjacent products, and teams who want to find common ground. The peacock also shows its working, which makes Qloo's output understandable to people who are not technical. We have not tested it with real users yet; that is the first thing we would do next.

## Quality of the idea
The creative move is to treat Qloo's ten entity types as ten feathers: a single, legible shape that shows breadth of taste and lets "no overlap" be a graceful outcome, not a failure. The door turns a miss into a Qloo recommendation to explore, with its basis shown.

## Responsible data
- The ten characters are fictional adults. Nobody is contacted, profiled or scored.
- The Qloo key stays on the server. The app writes nothing to disk, and Qloo responses are not stored in the repository.
- The public demo uses a preset taste profile and fictional adult characters; visitors do not need to enter personal information.

## Known limitations
See the README. In short: a fixed demo visitor; some entities cannot be used as signals; the cast is ten fictional people and does not prove that taste overlap predicts friendship; verdicts follow live Qloo data.

## What's next
Let a visitor bring their own taste; let two real people compare with consent; more languages and voices; user research.

## Built with
Node.js, Qloo Taste AI API, MCP (Streamable HTTP), vanilla JavaScript, Kokoro TTS, Render.

## Video (optional)
The video replays the deployed front end with real responses captured from the live site.
