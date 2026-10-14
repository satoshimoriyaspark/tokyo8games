# Athletics UI polish — 2026-10-15

Runtime commit: 2a51acafcc9a2ba9e28195f20b480217c282dbc5
Preview: https://tokyo8games-7kk8hhqnp-tokyo8games.vercel.app/games/athletics/index.html
Scope: feature/8bit-athletics-web-beta, games/athletics only; production unchanged.

Changes:
- Removed development/version strings, redundant title descriptions, repeated control/footer text and duplicate result messages from the visible game UI.
- Separate event picker, short tutorial, race and results. Event cards open the tutorial directly; tournament remains available.
- Race shows the canvas and A/B controls; menus and results are hidden. Sound stays available in the compact header.
- Results show record, rank, scores and retry/next-event actions without the race canvas above them. Retry starts directly; subsequent tournament events retain their own brief guide.
- Ceremony can be skipped with “結果を見る”; normal automatic progression remains.
- Story displays full text immediately. Screen changes reset scroll and move keyboard focus to the relevant heading/canvas.
- Responsive canvas and controls; 1500m HUD feedback is a single non-overlapping line.
- Approved PNG artwork, scoring, record storage and 1500m pace/spurt behavior remain as implemented previously.

Verification:
- Node + native Canvas: 335 time/spurt/UI-transition checks; 206 game-rule checks, 38 running/start, 30 long jump, 28 javeball passed.
- Cloud Chrome: 335 browser assertions passed. Actual game title → story → skip → event picker → 1500m tutorial → start checked. Fixture result → retry checked by clicking the actual retry button; no tutorial appears.
- Responsive iframe viewports (CSS sizing, NOT device emulation): 390×844 and 820×1180. No horizontal overflow. At 390px race controls end at y468, result actions at y602; at 820px result actions end at y634. Race HUD screenshot inspected after overlap correction.
- Vercel preview build READY. Normal Vercel/Google sign-in used; no protection changes.
- No physical iPhone/iPad/Android checks, no device emulation and no speaker/audio listening checks.

Files: index.html, ui.css; QA updates in tests/node-checks.cjs, tests/time-probe.js, tests/time.html. Evidence: tests/evidence/ui-menu-browser.jpg and ui-race-390-browser.jpg.
