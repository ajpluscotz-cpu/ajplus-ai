// AJPLUS AI — api/activate.js
// Thibitisha code na fungua akaunti
// © AJ PLUS COMPANY LIMITED | ajplusai.co.tz

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;

async function supabaseQuery(table, method, data = null, filter = null) {
  if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) return null;
  try {
    let url = `${SUPABASE_URL}/rest/v1/${table}`;
    if (filter) url += `?${filter}`;
    const opts = {
      method,
      headers: {
        'Content-Type': 'application/json',
        'apikey': SUPABASE_SERVICE_KEY,
        'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
        'Prefer': method === 'POST' ? 'return=representation' : ''
      }
    };
    if (data) opts.body = JSON.stringify(data);
    const res = await fetch(url, opts);
    if (res.ok) {
      const text = await res.text();
      return text ? JSON.parse(text) : null;
    }
    return null;
  } catch(e) {
    console.error('Supabase error:', e.message);
    return null;
  }
}

// Tengeneza code ya kipekee
function generateCode(plan) {
  const prefix = { msingi: 'MSN', kawaida: 'KWD', pro: 'PRO', biashara: 'BIZ' };
  const p = prefix[plan] || 'AJP';
  const rand = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `${p}-${rand}-TZ`;
}

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  let body = req.body;
  if (typeof body === 'string') {
    try { body = JSON.parse(body); } catch(e) { body = {}; }
  }

  const { action, code, email, plan } = body || {};

  // ── GENERATE CODE (wewe unaitumia) ────────────────
  if (action === 'generate') {
    const secret = req.headers['x-admin-secret'];
    if (secret !== process.env.ADMIN_SECRET) {
      return res.status(401).json({ error: 'Hauruhusiwi' });
    }

    const newCode = generateCode(plan || 'msingi');
    const result = await supabaseQuery('activation_codes', 'POST', {
      code: newCode,
      plan: plan || 'msingi',
      email: email || null
    });

    if (!result) {
      return res.status(500).json({ error: 'Imeshindwa kutengeneza code' });
    }

    return res.status(200).json({
      success: true,
      code: newCode,
      plan: plan || 'msingi',
      message: `Code imetengenezwa: ${newCode}`
    });
  }

  // ── ACTIVATE (mtumiaji anaiweka) ──────────────────
  if (action === 'activate') {
    if (!code || !email) {
      return res.status(400).json({ error: 'Weka code na barua pepe' });
    }

    // Angalia code
    const codes = await supabaseQuery(
      'activation_codes', 'GET', null,
      `code=eq.${code.toUpperCase().trim()}&used=eq.false`
    );

    if (!codes || codes.length === 0) {
      return res.status(404).json({
        error: 'Code si sahihi au imetumika tayari. Wasiliana nasi WhatsApp: +255670307647'
      });
    }

    const codeData = codes[0];

    // Angalia email inaendana (kama code iliandaliwa kwa email fulani)
    if (codeData.email && codeData.email !== email) {
      return res.status(403).json({
        error: 'Code hii si yako. Angalia code uliyopewa.'
      });
    }

    // Weka au sasisha user
    const users = await supabaseQuery('users', 'GET', null, `email=eq.${email}`);

    if (users && users.length > 0) {
      // Sasisha plan ya mtumiaji
      await supabaseQuery('users', 'PATCH', {
        plan: codeData.plan,
        questions_today: 0,
        activated_at: new Date().toISOString()
      }, `email=eq.${email}`);
    } else {
      // Unda mtumiaji mpya
      await supabaseQuery('users', 'POST', {
        email,
        plan: codeData.plan,
        trial_start: new Date().toISOString().split('T')[0],
        activated_at: new Date().toISOString()
      });
    }

    // Weka code kama imetumika
    await supabaseQuery('activation_codes', 'PATCH', {
      used: true,
      used_at: new Date().toISOString(),
      email
    }, `code=eq.${code.toUpperCase().trim()}`);

    const planNames = {
      msingi: 'Msingi (Maswali 50/siku)',
      kawaida: 'Kawaida (Maswali 150/siku)',
      pro: 'Pro (Bila kikomo)',
      biashara: 'Biashara (API + Team)'
    };

    return res.status(200).json({
      success: true,
      plan: codeData.plan,
      planName: planNames[codeData.plan] || codeData.plan,
      message: `🎉 Akaunti yako imefunguliwa! Mpango: ${planNames[codeData.plan]}`
    });
  }

  return res.status(400).json({ error: 'Action haijulikani' });
};
