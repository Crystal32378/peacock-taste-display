# Submission checklist

- [ ] Problem statement (Devpost text → Inspiration)
- [ ] Qloo workflow used and why (How we use Qloo)
- [ ] Redacted request-to-result explanation (README → How a request becomes a result)
- [ ] Demo video or screenshots, no credentials visible
- [ ] Setup steps (README → Run it)
- [ ] Known limitations (README)
- [ ] Responsible data handling (README → Data handling)
- [ ] Live site loads from a cold start
- [ ] No API key, token or Qloo response data in the repository (`git grep -i -E "x-api-key|DEBUG_TOKEN"` shows only code that reads them)
- [ ] DEBUG_TOKEN deleted in Render
- [ ] Final run of all ten characters on the live site
- [ ] Demo video: say how it was made. Suggested line for the Devpost video description: "The video replays the deployed front end with real responses captured from the live site." Do not call it a live screen recording unless it is one.
- [ ] Delete leftover capture files (JSON with Qloo responses) from the machine that made the video; they must not go into the repository.
- [ ] Final check of the video: no key, token, address-bar query string or settings page in any frame; captions match the narration.
