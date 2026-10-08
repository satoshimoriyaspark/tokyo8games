// Game HTML, scripts and media are hosted locally under games/kwb/.
// Keep existing ranking records in the original data service during migration.
const SCORES_URL = 'https://kameari-wasshoi-battle2.vercel.app/api/scores';

module.exports = async function handler(req, res) {
  res.setHeader('Cache-Control', 'private, no-store');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  if (!['GET', 'POST'].includes(req.method)) {
    res.setHeader('Allow', 'GET, POST');
    return res.status(405).json({error: 'Method not allowed'});
  }
  let body;
  if (req.method === 'POST') {
    const host = req.headers.host;
    const origin = req.headers.origin;
    const local = host?.startsWith('localhost:') || host?.startsWith('127.0.0.1:');
    if (req.headers['sec-fetch-site'] === 'cross-site' ||
        (origin && origin !== `https://${host}` && !(local && origin === `http://${host}`))) {
      return res.status(403).json({error: 'アクセス元を確認できませんでした。'});
    }
    if (!req.headers['content-type']?.includes('application/json')) {
      return res.status(415).json({error: 'JSON required'});
    }
    const raw = typeof req.body === 'string' ? req.body : JSON.stringify(req.body ?? null);
    if (Buffer.byteLength(raw) > 4096) return res.status(413).json({error: 'Request too large'});
    let input;
    try { input = JSON.parse(raw); } catch { return res.status(400).json({error: 'Invalid JSON'}); }
    if (!input || !['東', '西', '南', '北'].includes(input.team) ||
        !Number.isInteger(input.score) || input.score < 0 || input.score > 9999) {
      return res.status(400).json({error: 'Invalid score'});
    }
    body = JSON.stringify({
      nickname: String(input.nickname || 'ゲスト').trim().slice(0, 24) || 'ゲスト',
      team: input.team,
      score: input.score
    });
  }
  const headers = {accept: 'application/json'};
  if (body !== undefined) headers['content-type'] = 'application/json';
  try {
    // Fixed destination; never forward unrelated portal cookies or credentials.
    const response = await fetch(SCORES_URL, {
      method: req.method, headers, body, redirect: 'error',
      signal: AbortSignal.timeout(12000)
    });
    if (!response.headers.get('content-type')?.includes('application/json')) throw Error('Unexpected response');
    return res.status(response.status).json(await response.json());
  } catch {
    return res.status(503).json({error: 'ランキングに接続できませんでした。時間をおいて再試行してください。'});
  }
};
