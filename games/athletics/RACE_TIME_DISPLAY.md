# Race display calibration — 2026-10-14

Runtime commit: b1f77e548af70052d31c5d346923a04015ac43f6
Preview: https://tokyo8games-9y1b2udz4-tokyo8games.vercel.app/games/athletics/index.html
Scope: feature/8bit-athletics-web-beta, games/athletics only. No production changes.

The user requested elementary-school-like displayed records, especially 100m around 15–17 seconds, while retaining short play sessions. These are game tuning targets, not population averages.

Simulation seconds, controls, distances, chest crossing, run-through, CPU movement, rankings, score allocation, tournament totals and existing v1 saved bests remain unchanged. All record labels (player, CPUs, bests, results) now use the same strictly increasing conversion. Stored records remain raw simulation seconds, so existing bests automatically display in the new units without destructive migration or double conversion.

| Event | Displayed seconds at finish | Example |
|---|---|---|
| 100m | 12 + 0.2 × simulation seconds | 20 → 16.00秒 |
| 1500m | 390 + 4 × simulation seconds | 20 → 7:50.00 |
| Hurdles | 20 + 0.5 × simulation seconds | 16 → 28.00秒 |

During the race the fixed course component is multiplied by completed distance / goal. The virtual clock starts at zero, advances monotonically and reaches the same record as the finish/result panel. It is intentionally not a wall clock. Slower attempts are not capped at the target range. A tutorial note identifies the time as a converted game record. Field event distances are unchanged.

Verification:
- Node + native Canvas: time conversion 320 checks; long jump 30; javeball 28; existing rule regression 206; running/start 38. Regression deliberately excludes changed display strings while preserving raw times, points and tournament totals.
- Deterministic gameplay records: 100m 15.91秒, 1500m 7:06.20, hurdles 24.29秒.
- Cloud Chrome at tests/time.html: 320 checks passed; fixed-condition actual game rendering/result panels checked for all three races. 100m YOU 16.00, CPUs 16.22 / 16.48 / 16.73; 1500m YOU 7:50.00; hurdles YOU 28.00.
- Screenshot: tests/evidence/time-100m-browser.jpg (fixed-condition result, not a manually played race).
- Game entrypoint opens with approved logo.
- No physical-device or mobile device-emulation checks; no speaker/audio checks.

Changed runtime: index.html. Validation: tests/time-probe.js, tests/time.html, tests/node-checks.cjs, tests/evidence/jave-checks.json.
