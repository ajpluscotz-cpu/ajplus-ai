// AJPLUS AI — api/admin.js
// Admin Dashboard API
// © AJ PLUS COMPANY LIMITED | ajplusai.co.tz

module.exports = async function handler(req, res) {
  // ── CORS ──────────────────────────────────────────
  res.setHeader('Access-Control-Allow-Origin', 'https://ajplusai.co.tz');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, x-admin-secret');
  if (req.method === 'OPTIONS') return res.status(200).end();

  // ── AUTH ──────────────────────────────────────────
  const ADMIN_SECRET = process.env.ADMIN_SECRET || 'ajplus-secret-2024';
  const token = (req.headers['x-admin-secret'] || '').trim();
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
      logs: logs.slice(-100).reverse(),
    });
  }

  // ── POST /api/admin — futa logs ──────────────────
  if (req.method === 'POST') {
    let body = req.body;
    if (typeof body === 'string') {
      try { body = JSON.parse(body); } catch(e) { body = {}; }
    }
    const { action } = body || {};
    if (action === 'clear_logs') {
      global._ajplusLogs = [];
      return res.status(200).json({ success: true, message: 'Logs zimefutwa.' });
    }
    return res.status(400).json({ error: 'Action haijulikani.' });
  }

  return res.status(405).json({ error: 'Method haikubaliki.' });
};
