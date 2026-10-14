# 亀有の名所紹介・取材アルバム

Scope: `games/ary/`, development branch `feature/ary-sprite-qc`. Stage 01 only.

## Flow

- Title → opening → play → goal animation → results → landmark introduction.
- Introduction after a clear: back to results, replay directly, or title.
- Title → album → unlocked introduction → album / title.
- No next-stage button while the next course is unimplemented.
- Reading screens stop game time; keyboard navigation and page scrolling remain available. Escape goes back.
- Required gameplay PNG failure does not block viewing an already unlocked album.
- Introduction image failure shows a retry control; navigation and text remain usable.

## Data and preservation

`places.js` contains the researched catalog, record adapter, and DOM presentation.
Only one destination is listed. To add a future playable stage, add its researched entry with a distinct stage ID and existing stage storage key, plus sources and a local licensed image.

The existing `localStorage` key `ary-stage-kameari-v1` is retained: `{cleared:true,best:number}`. Old clear records unlock the introduction on load. Unknown fields survive writes, and best scores do not decrease. No separate album-save key or rewards are created. Only the game's existing once-per-clear award path writes a record; album reads and navigation never award points or write storage.

Malformed records are treated as locked without overwriting them merely on read. Storage failures retain the new unlock in memory and show a warning. They cannot guarantee persistence after reload. A storage event refreshes records changed by another tab.

Browser storage is per **origin** (scheme + hostname + port) and browser profile. A different immutable Vercel Preview hostname has separate records. Reuse the branch Preview hostname to retain future development saves there. Existing records on a different Preview URL or production origin are not copied across origins. No cross-device sync is introduced.

Character, cat and logo assets, direct PNG loading, 6-frame running, jumping/double-jumping/sliding, scoring, items, five-heart maximum, duration and route remain unchanged.

## Verification

Run `node games/ary/tests/regression.cjs` with `@napi-rs/canvas` available. The harness decodes real gameplay PNGs, renders 10,800 frames, tests existing inputs/collisions/items/score and new record/navigation cases. Its DOM and storage are simulations, not physical device tests.

`tests/album-browser.html` is an explicitly labelled development fixture. It fetches the actual entrypoint into a same-origin test iframe and substitutes test-only memory storage before
loading any game scripts. Same-origin asset requests retain Preview authentication. Visible controls select fresh/legacy records, reload that memory snapshot, move to the goal boundary, and resize the iframe to PC or phone dimensions. It never reads or modifies normal game saves. Normal `index.html` does not load its test adapter. A test-only jump to the goal verifies the finish/result/introduction UI without claiming a full real-time run.

Reference image provenance and official factual sources: `assets/landmarks/SOURCES.md`.
