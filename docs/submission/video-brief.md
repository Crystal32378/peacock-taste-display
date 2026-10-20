# Video brief for Opus — 開屏 Taste Display demo (about 90 seconds)

Goal: a hackathon demo video that makes a judge understand the idea in the first 10 seconds, then see Qloo doing real work.

## Ground rules
- Live site: https://taste-display.onrender.com (free host: open it once beforehand so it is awake).
- Never show an API key, token, address bar with a query string, or any settings page. Do not open `/debug/*`.
- Characters are fictional adults. Do not describe anyone as a real person.
- Do not say "both of you will love it". The door is "a Qloo recommendation to explore, with its basis shown".
- Do not say the trace is "live" unless the line on screen says `live`. Today most lines say `cache`; that is true and fine to show.
- Resolution 1280×720, Sound ON, Voice = her (the female voice button in the header).

## Narration
Eight clips in `docs/submission/narration/n01.mp3 … n08.mp3` (British female, Kokoro bf_emma, speed 0.82, about 42 seconds in total). English captions on screen for every line. The peacock's own lines (from the site) play in between; do not talk over them.

| Clip | Text |
|---|---|
| n01 | Taste is not a score. It is a display. |
| n02 | Ten Qloo entity types, ten feathers. Where your taste meets theirs, the feathers shiver. |
| n03 | Brian Eno, Ways of Seeing, Blue Bottle. Same things, and a few that only Qloo says are neighbours. |
| n04 | When nothing meets, the tail folds. It is about feathers, not about you. |
| n05 | Then a door: a Qloo recommendation to explore, with its basis shown. The number belongs to one item, never to two people. |
| n06 | Every call is on show: live, cached, skipped. Each trace shows its status and a short result summary. |
| n07 | English and Chinese. Fictional adults only. No score. |
| n08 | Taste is not a score. It is a display. |

## Shot list (tested order; do not shuffle)
1. 0:00 Page loaded, tail open. n01.
2. Mira is the first character: five names turn gold. n02, then n03 while zooming on the gold names. Let her caption finish.
3. Next → Dax (a small movement).
4. Next → Theo: the tail folds and his ten feathers are listed. n04. Click the door button; hold on the caption with the affinity number. n05.
5. Next → Kai (second fold in a row; the peacock yawns).
6. Next → Lin: after two folds a match makes the peacock do a double take. Let the whole line play (about 5 seconds).
7. Scroll to Under the hood, open it, scroll the trace slowly. n06.
8. Switch to 中文 for 3–5 seconds, then back to English. n07.
9. Title card with the URL. n08.

The order above is checked: Mira swoon, Dax flicker, Theo fold, Kai fold, Lin swoon with the double take. Do not switch language between Kai and Lin (it resets the streak).

## What the video must not claim
- No "compatibility score", no percentage, no "match".
- No claim that every line was heard by a human reviewer; no mention of other AI reviewers unless the credits slide is wanted.
- Do not call the Chinese voice good; it is the browser's voice. Keep Chinese on screen briefly.

## Deliverable
`taste-display-demo.mp4`, under 100 MB, with burned-in English captions and a separate `.srt`. Send it back to Crystal; do not upload it anywhere public.
