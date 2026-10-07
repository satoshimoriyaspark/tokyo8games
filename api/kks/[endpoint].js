// The playable app and every asset live in this repository. Only persistent
// ranking data uses the existing service so published records are retained.
const UPSTREAM = 'https://katsushika-karuta-practice.satoshimoriya.chatgpt.site';
const METHODS = {profile: ['GET', 'POST'], leaderboard: ['GET'], runs: ['POST'], finish: ['POST']};
const PLAYER = /(?:^|;\s*)karuta_player=([a-f0-9-]{36})(?:;|$)/;

module.exports = async function handler(req, res) {
  res.setHeader('Cache-Control', 'private, no-store');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  const url = new URL(req.url, 'https://tokyo8games.com');
  const endpoint = url.pathname.match(/^\/api\/kks\/([a-z]+)\/?$/)?.[1];
  if (!Object.hasOwn(METHODS, endpoint)) return res.status(404).json({error: 'Not found'});
  if (!METHODS[endpoint].includes(req.method)) {
    res.setHeader('Allow', METHODS[endpoint].join(', '));
    return res.status(405).json({error: 'Method not allowed'});
  }

  let body;
  if (req.method === 'POST') {
    // Check the browser's origin BEFORE issuing the server-to-server request.
    // Do not forward unrelated site cookies or accept an arbitrary upstream.
    const host = req.headers.host;
    const origin = req.headers.origin;
    if (req.headers['sec-fetch-site'] === 'cross-site' ||
        (origin && origin !== `https://${host}` && !(host?.startsWith('localhost:') && origin === `http://${host}`))) {
      return res.status(403).json({error: 'アクセス元を確認できませんでした。'});
    }
    if (!req.headers['content-type']?.includes('application/json')) {
      return res.status(415).json({error: 'JSON required'});
    }
    body = typeof req.body === 'string' ? req.body : JSON.stringify(req.body ?? null);
    if (Buffer.byteLength(body) > 24000) return res.status(413).json({error: 'Request too large'});
    try { JSON.parse(body); } catch { return res.status(400).json({error: 'Invalid JSON'}); }
  }

  const upstream = new URL(`/api/${endpoint}`, UPSTREAM);
  if (endpoint === 'leaderboard') {
    for (const key of ['count', 'speed']) {
      if (url.searchParams.has(key)) upstream.searchParams.set(key, url.searchParams.get(key));
    }
  }
  const headers = {accept: 'application/json'};
  const player = req.headers.cookie?.match(PLAYER)?.[1];
  if (player) headers.cookie = `karuta_player=${player}`;
  if (body !== undefined) headers['content-type'] = 'application/json';
  try {
    const response = await fetch(upstream, {
      method: req.method, headers, body, redirect: 'error',
      signal: AbortSignal.timeout(12000)
    });
    if (!response.headers.get('content-type')?.includes('application/json')) throw Error('Unexpected response');
    const data = await response.json();
    const newPlayer = response.headers.get('set-cookie')?.match(/^karuta_player=([a-f0-9-]{36})(?:;|$)/)?.[1];
    if (newPlayer) {
      res.setHeader('Set-Cookie', `karuta_player=${newPlayer}; Path=/api/kks; Secure; HttpOnly; SameSite=Lax; Max-Age=31536000`);
    }
    return res.status(response.status).json(data);
  } catch {
    return res.status(503).json({error: 'ランキングに接続できませんでした。時間をおいて再試行してください。'});
  }
};
