# TOKYO 8 GAMES publication rules

- User-facing game URLs belong to `https://tokyo8games.com` with a stable, normally three-letter lowercase path. Keep existing path assignments when implementations change.
- Host each game's HTML, CSS, JavaScript, images and other runtime assets in this project. Use an internal rewrite to the local entrypoint; never use an external redirect, external page proxy, or iframe as the official game release.
- Keep the canonical `https://tokyo8games.com/xxx` URL in the address bar throughout play. Use the canonical URL in portal links, QR codes, flyers and social posts, including beta releases.
- Preserve game behavior, artwork, responsive layout and controls unless a change is requested. Report unavailable assets; never replace them with substitutes without permission.
- Isolate each game under `games/<code>/` and its APIs under `api/<code>/`. Limit routing rules to that game. Preserve the portal, contact API and other game routes.
- A persistent data service may remain separate behind a same-origin server API. Document that dependency, preserve records and cookie security, and do not expose a development game URL in frontend links or requests.
- Before production, check direct canonical access with no external navigation, PC/iPhone/iPad layouts and input, assets, speech/audio, title return, portal navigation and unaffected existing routes. Distinguish browser emulation from real-device testing.
- Report changed files, commit, production URL, verification evidence and any remaining limitations. Never claim unperformed device or audio checks.

Current scope: `/kks` and `/kwb` use local hosting. Legacy `/w` redirects only to the canonical same-origin `/kwb`. KWB is a solo beta; keep its existing ranking data service running until that data dependency is migrated.
