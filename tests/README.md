# Review test suite — Niu Niu (牛牛)

Helper tests and live audit helpers written during the three review rounds of the live
site (2026-10-20). The browser checks run the deployed site exactly like a phone:
**inside a 390x844 iframe hosted by a 512x900 headless page** — a bare `--window-size=390`
headless window is unreliable (fonts/UA differ) and lies about breakpoints.

## What is in here

| file | kind | what it does |
| --- | --- | --- |
| `voice-files.test.mjs` | offline test | every spoken line in `public/i18n.js` has its mp3, every mp3 belongs to a line, and the same take is never reused under two different captions (legal only when the copy is identical, e.g. friend/lover eyeroll). |
| `qloo-cache.test.mjs` | offline test (fetch stubbed) | the trace-classification contract the live review caught: an HTTP 400 on `signal.interests.entities` is a **skip**, is cached **as skip**, and stays skip for the whole TTL — not "cache". Hard errors are shown as error and never cached. Live summaries are id-free (`matched: <name>`). |
| `live-drift.mjs` | live helper (run by hand) | snapshots verdict / fan verdicts / feather states / trace-source counts for the whole cast and diffs them against the previous snapshot; exit code 1 on drift. |
| `live-mobile.mjs` | live helper (run by hand, needs playwright installed locally) | 390px audit: fixed bottom bar pinned to the window, three 44px buttons in one row, no horizontal overflow, and the door button under the caption + clear of the bar, with the zh door utterance recorded via a speechSynthesis stub. |

The offline tests join the normal run:

```bash
npm test        # node --test tests/*.test.mjs
```

## Rules for the live helpers (they never run in CI)

1. **No Qloo data in git.** `live-drift.mjs` refuses to write inside the repo (exit 2) and
   defaults to `/tmp/live-snapshots/`. Snapshots past rounds live on the reviewer's machine
   only; do not open a PR with one attached.
2. **No tokens.** Neither helper needs a key: the site does the talking, helpers listen.
3. Helpers are read-only against the site: language buttons, cast buttons, the sound toggle,
   the door button — and a speechSynthesis stub that records utterance text (not audio).

## Method notes from the first three live rounds (things that bite)

- The body text of a caption lives in `#capZh`, the (language-styled) head in `#capEn`.
  Assert English copy against `#capZh` or you will only ever see the short head.
- Sound is off by default: click `#snd` before expecting recordings or utterances.
- The door (`#bridge`) stays hidden until the profile's fetches settle — it appears seconds
  late on fold profiles. When scripting, wait for `!#bridge.hidden` before measuring it;
  when a user reports "the peacock whispered without a button", this is why.
- mp3s return 404 on HEAD but 200 on GET; duration checks load the file with
  `new Audio(...)` + `preload=metadata` (see `src/` sound contracts for the caps).

— written by Niu Niu (牛牛), the taste-review subagent; reviewed via Crystal, merged by Claude on her word.
