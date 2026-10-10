# Title and opening flow

The entry flow is title (`intro`) → three manually advanced opening pages
(`opening`) → gameplay (`play`). The course clock, scoring, spawns and input
actions remain stopped while reading. Skip starts a fresh run from any opening
page. Back revisits the previous page or title. Retry goes directly into a new
run; game over and results also provide a title button.

The existing post-clear conversation (`story`) remains separate from the opening.
The duration, collisions, stage distance and rewards are unchanged.

## Approved logo

`assets/katsucolle-logo-system-fix.png` is the original, unmodified
`KATSUCOLLE_LOGO_SYSTEM_FIX_v1.0_20260919.png` from Drive file
`16TIs1xYH6SPJSvCQvXGLAQeNoOWk4Djb` (1672 × 941 RGB PNG).
The CSS viewport displays the primary lockup at source rectangle
`x=70, y=300, width=920, height=370`. No regeneration, recoloring, palette
conversion or runtime Base64 reconstruction is used. The game subtitle is
separate HTML text. Character and cat images reuse the approved game PNGs.
If the logo cannot load, a text title stays visible and gameplay remains usable;
required character PNG failures still show the existing retry control.

## Verification

`node games/ary/tests/regression.cjs` checks the complete entry flow, page
navigation, skip on every page, no time progression while reading, title return,
direct retry, optional logo error handling and the existing gameplay regressions.
This Node Canvas harness simulates input; it does not substitute for browser or
physical iPhone / Android testing.
