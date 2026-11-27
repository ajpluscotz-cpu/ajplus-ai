// AJPLUS AI — api/_lib/security.js
// Msaada wa usalama unaotumiwa na API zote (Vercel haiufanyi kuwa endpoint kwa sababu ya "_").
// © AJ PLUS COMPANY LIMITED | ajplusai.co.tz

const crypto = require('crypto');

const SUPABASE_URL = process.env.SUPABASE_URL;

// Mgeni wa demo: guest-<UUID ya kifaa>@ajplusai.co.tz — UUID ni ya nasibu, haikisiki.
const GUEST_EMAIL_RE = /^guest-[a-z0-9-]{8,64}@ajplusai\.co\.tz$/i;
// Mtumiaji wa WhatsApp: <namba>@whatsapp.ajplusai.co.tz — inakubalika tu kutoka kwa webhook yetu.
const WHATSAPP_EMAIL_RE = /^\d{9,15}@whatsapp\.ajplusai\.co\.tz$/;

const ALLOWED_PLANS = ['free', 'trial', 'msingi', 'kawaida', 'pro', 'biashara', 'business'];

function safeEqual(a, b) {
  const ba = Buffer.from(String(a || ''));
  const bb = Buffer.from(String(b || ''));
  if (ba.length === 0 || ba.length !== bb.length) return false;
  return crypto.timingSafeEqual(ba, bb);
}

function isAdmin(provided) {
  const secret = process.env.ADMIN_SECRET;
  if (!secret) return false; // fail closed: bila ADMIN_SECRET hakuna admin
  return safeEqual(provided, secret);
}

function escapeHtml(s) {
  return String(s == null ? '' : s)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

function isValidEmail(e) {
  return typeof e === 'string' && e.length <= 254 && /^[^\s@<>()]+@[^\s@<>()]+\.[^\s@<>()]+$/.test(e);
}

function bearerToken(req) {
  const h = req.headers.authorization || '';
  const m = h.match(/^Bearer\s+(.+)$/i);
  return m ? m[1].trim() : null;
}

// Thibitisha token ya Supabase Auth na urudishe email halisi ya mmiliki wake.
async function verifySupabaseToken(token) {
  const apikey = process.env.SUPABASE_ANON_KEY || process.env.SUPABASE_SERVICE_KEY;
  if (!token || !SUPABASE_URL || !apikey) return null;
  try {
    const r = await fetch(`${SUPABASE_URL}/auth/v1/user`, {
      headers: { apikey, Authorization: `Bearer ${token}` }
    });
    if (!r.ok) return null;
    const u = await r.json();
    return u && u.email ? { id: u.id, email: String(u.email).toLowerCase() } : null;
  } catch (e) {
    return null;
  }
}

// Tambua mtumiaji wa ombi hili. KAMWE usiamini "email" ya body peke yake kwa akaunti halisi.
// Inarudisha { email, kind } au { error, status }.
async function resolveIdentity(req, claimedEmail) {
  const token = bearerToken(req);
  if (token) {
    const user = await verifySupabaseToken(token);
    if (user) return { email: user.email, kind: 'user' };
    return { status: 401, error: 'Muda wa kuingia umeisha. Tafadhali ingia tena.', relogin: true };
  }
  const e = typeof claimedEmail === 'string' ? claimedEmail.toLowerCase().trim() : '';
  if (GUEST_EMAIL_RE.test(e)) return { email: e, kind: 'guest' };
  if (WHATSAPP_EMAIL_RE.test(e) && isAdmin(req.headers['x-internal-key'])) {
    return { email: e, kind: 'whatsapp' };
  }
  return { status: 401, error: 'Tafadhali ingia kwenye akaunti yako (au tumia Demo) ili kuendelea.', relogin: true };
}

module.exports = {
  ALLOWED_PLANS,
  safeEqual,
  isAdmin,
  escapeHtml,
  isValidEmail,
  bearerToken,
  verifySupabaseToken,
  resolveIdentity
};
