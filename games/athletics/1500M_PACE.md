# 1500m pace and B spurt — 2026-10-15

Only games/athletics on feature/8bit-athletics-web-beta. No production change.

A accelerates and consumes stamina. Normal maximum world speed is 11.5 × 0.45; this replaces the former ×1.85. Rhythmic A (2 taps/second in the deterministic test) finishes in 35.18 seconds. Recovery is 7/second below speed 7, otherwise 2.8/second; each A costs 1.8.

At 1200m, B can activate one spurt if stamina is at least 8. It requires one press, not holding. Movement is multiplied by 1.35 while active; stamina drains at 10/second plus A cost. A remains necessary. Depletion ends the boost; it cannot be reactivated until retry. The same input test with B finishes in 33.63 seconds. Tutorial, B label and race HUD explain availability and status.

CPU types use one shared distance-based pace function for both visible movement and final records: early leader (33.01 seconds), steady runner (33.94), late challenger (34.75). They do not rubber-band to the player. Final display conversion remains 390 + 4 × simulation seconds (e.g. 35.18 seconds → 8:50.72).

Legacy records are retained in the original localStorage namespace. The new 1500m best is separate because prior ~9-second races are not comparable; other event bests carry over. Score formula and other events are unchanged.

Verification: Node + native Canvas: 328 clock/spurt assertions, including eligibility, depletion, one-use/reset, race duration and faster spurt finish; 206 rule checks with intentional 1500m duration exclusion; 30 long jump, 28 javeball, 38 running/start checks. Browser verification to be reported separately. No physical device or device emulation/audio checks.
