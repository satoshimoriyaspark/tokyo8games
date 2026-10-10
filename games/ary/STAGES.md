# Stage clear development

Planned campaign: 15 stages. This preview implements stage 01 Kameari only.

Route: shopping street → shopping mall surroundings → Koma-game goal.
Scenery is stylized code-native pixel artwork, not a geographic route or exact architectural reproduction. Koma-game reference: https://kameari-katori.or.jp/ and https://katsushika-kanko.jp/kame-ao/003katori.html

Stage length is 15,525 game units (115 seconds at base speed); boosts shorten travel time. No new objects spawn in the last 6% of the route. Existing objects retain their normal collision rules until the finish. On arrival, objects clear, powers expire, and the ride animation slows over 60 ticks, then shows completion at 90 ticks. The finish sequence supports pause and background suspension. Clear awards are issued once.

Starts/retries use five hearts. A heart restores one, capped at five. Recovery does not erase damage history for the no-hit bonus.

Local completion and best score are stored in `ary-stage-kameari-v1`; storage failure does not block play. No cross-device sync.

Next planned routes, not playable yet:
- Kanamachi: shopping street → tower apartments → Earth Kiln
- Shibamata: approach street → riverside → water intake tower

Stage selection, later-stage unlock navigation, and the remaining 12 routes are pending. Never link a preparation-only stage as playable.
