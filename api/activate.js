// AJPLUS AI — api/activate.js
// Thibitisha code na fungua akaunti
// © AJ PLUS COMPANY LIMITED | ajplusai.co.tz

const crypto = require('crypto');
const { ALLOWED_PLANS, isAdmin, isValidEmail } = require('./_lib/security');

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
  // Herufi 8 za nasibu salama (crypto), bila herufi zinazochanganya (0/O, 1/I)
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  const bytes = crypto.randomBytes(8);
  let rand = '';
  for (let i = 0; i < 8; i++) rand += alphabet[bytes[i] % alphabet.length];
  return `${p}-${rand}-TZ`;
}

// Zuia kubahatisha codes (kwa kila instance ya seva)
const attemptMap = new Map();
function tooManyAttempts(ip) {
  const r = attemptMap.get(ip);
  return r && r.count >= 10 && Date.now() - r.start < 15 * 60 * 1000;
}
function recordAttempt(ip) {
  const now = Date.now();
  const r = attemptMap.get(ip);
  if (!r || now - r.start > 15 * 60 * 1000) attemptMap.set(ip, { count: 1, start: now });
  else r.count++;
}

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', 'https://ajplusai.co.tz');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  let body = req.body;
  if (typeof body === 'string') {
    try { body = JSON.parse(body); } catch(e) { body = {}; }
  }

  const { action } = body || {};
  const code  = typeof (body || {}).code  === 'string' ? body.code.toUpperCase().trim().slice(0, 40) : '';
  const email = typeof (body || {}).email === 'string' ? body.email.toLowerCase().trim().slice(0, 254) : '';
  const plan  = typeof (body || {}).plan  === 'string' && ALLOWED_PLANS.includes(body.plan) ? body.plan : 'msingi';

  // ── GENERATE CODE (wewe unaitumia) ────────────────
  if (action === 'generate') {
    if (!isAdmin(req.headers['x-admin-secret'])) {
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
    if (!isValidEmail(email) || !/^[A-Z0-9-]{4,40}$/.test(code)) {
      return res.status(400).json({ error: 'Code au barua pepe si sahihi' });
    }
    const ip = (req.headers['x-forwarded-for'] || '').split(',')[0].trim() || 'unknown';
    if (tooManyAttempts(ip)) {
      return res.status(429).json({ error: 'Majaribio mengi mno. Subiri dakika 15 kisha jaribu tena.' });
    }

    // Angalia code
    const codes = await supabaseQuery(
      'activation_codes', 'GET', null,
      `code=eq.${encodeURIComponent(code)}&used=eq.false`
    );

    if (!codes || codes.length === 0) {
      recordAttempt(ip);
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
    const users = await supabaseQuery('users', 'GET', null, `email=eq.${encodeURIComponent(email)}`);

    if (users && users.length > 0) {
      // Sasisha plan ya mtumiaji
      await supabaseQuery('users', 'PATCH', {
        plan: codeData.plan,
        questions_today: 0,
        activated_at: new Date().toISOString()
      }, `email=eq.${encodeURIComponent(email)}`);
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
    }, `code=eq.${encodeURIComponent(code)}`);

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
