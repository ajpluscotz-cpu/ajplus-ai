export default function handler(req, res) {
  // ── CORS ──────────────────────────────────────────
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') return res.status(200).end();

  // ── AUTH ──────────────────────────────────────────
  const ADMIN_SECRET = process.env.ADMIN_SECRET || 'ajplus-secret-2024';

  const authHeader = req.headers['authorization'] || '';
  const token      = authHeader.replace('Bearer ', '').trim();

  if (token !== ADMIN_SECRET) {
    return res.status(401).json({ error: 'Hauruhusiwi. Token si sahihi.' });
  }

  // ── GET /api/admin — rudisha takwimu ─────────────
  if (req.method === 'GET') {
    const logs = global._ajplusLogs || [];

    const today      = new Date().toDateString();
    const todayLogs  = logs.filter(l => new Date(l.time).toDateString() === today);
    const errorLogs  = logs.filter(l => l.status === 'error');

    return res.status(200).json({
      success : true,
      stats   : {
        total  : logs.length,
        today  : todayLogs.length,
        errors : errorLogs.length,
        last   : logs.length ? logs[logs.length - 1].time : null,
      },
      logs: logs.slice(-100).reverse(), // Logs 100 za mwisho
    });
  }

  // ── POST /api/admin — futa logs ──────────────────
  if (req.method === 'POST') {
    const { action } = req.body || {};

    if (action === 'clear_logs') {
      global._ajplusLogs = [];
      return res.status(200).json({ success: true, message: 'Logs zimefutwa.' });
    }

    return res.status(400).json({ error: 'Action haijulikani.' });
  }

  return res.status(405).json({ error: 'Method haikubaliki.' });
}
