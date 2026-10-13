# Crowd reactions

Both recordings are CC0 1.0: https://creativecommons.org/publicdomain/zero/1.0/
Retrieved 2026-10-12. Hosted locally; no runtime third-party requests.

- `cheer.mp3`: Cheers by Nocturnal_Vanguard / AuraVoice.
  Source: https://opengameart.org/content/cheers-0
  Original: https://opengameart.org/sites/default/files/cheers_1.ogg
  First 1.7 seconds; mono 44.1 kHz MP3 96 kbps; loudness normalization and fades.
- `boo.mp3`: Booing Crowd by NeoSpica.
  Source: https://freesound.org/people/NeoSpica/sounds/504621/
  Public audio preview: https://cdn.freesound.org/previews/504/504621_7704891-hq.mp3
  Excerpt 2.0–3.5 seconds; mono 44.1 kHz MP3 96 kbps; normalization and fades; volume rebalanced on 2026-10-13 (see below).

The source pages identify these as cheers and audience booing. Device listening checks remain necessary; automated tests cover mapping, mute, and cancellation, not subjective sound quality.

## Goal crowd mix (2026-10-12)

`goal-crowd.mp3` replaces `cheer.mp3` at runtime. 2.8 seconds, stereo MP3 128 kbps.
- Football-crowd-GOAL.wav by paulw2k, CC BY 4.0.
  https://freesound.org/people/paulw2k/sounds/196461/
  https://creativecommons.org/licenses/by/4.0/
  Public preview: https://cdn.freesound.org/previews/196/196461_755728-hq.mp3
  Excerpt starts 4.35s; gain-adjusted and faded.
- Whistles by dklon, CC BY 3.0.
  https://opengameart.org/content/whistles
  https://creativecommons.org/licenses/by/3.0/
  Original: https://opengameart.org/sites/default/files/whistles.zip
  whistle_1.wav and whistle_3.wav overlaid at 0.35s and 1.15s, mixed at lower gain.

Sources mixed, gain-adjusted, limited and faded. Source licenses apply to their respective material. In-game title links to credits.html. The old CC0 cheer is kept only as an archived source, not played.

2026-10-12 repair: regenerated the mix using gain filters after short whistle clips produced an empty result during loudness normalization. ffprobe confirms 2.847s / 46,019 bytes; full ffmpeg decode succeeds.

## Boo volume balance (2026-10-13)

The existing boo was about 10 dB below the goal crowd in average sample level.
Re-encoded only `boo.mp3` from its existing local asset with a +7.5 dB gain
filter, mono 44.1 kHz MP3 96 kbps. The decoded result improves by about 7 dB
after MP3 encoding: mean -14.4 dBFS, integrated -14.18 LUFS, true peak -2.16
dBTP (previously mean -21.4 dBFS / true peak -9.38 dBTP). The 1.5-second
excerpt, source, fades and license are unchanged.

The shared runtime gain remains 0.65, so the corrected boo retains about
5.9 dB peak headroom during game playback. The goal crowd file and playback
level are unchanged. Only the boo preload/runtime cache key changes to
`20261013-boo-1`; goal crowd retains `20261012-2`.

Validation: full FFmpeg decode, measured loudness/true peak, and Node tests
for correct/incorrect audio mapping, unchanged gain, cache-key consistency,
mute, cancellation, impact timing and iOS unlock ordering. These checks do
not establish audible playback on an actual iPhone or subjective sound quality.
