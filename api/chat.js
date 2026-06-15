// AJPLUS AI — api/chat.js
// Claude (primary + web search) + Gemini (backup) + Supabase
// © AJ PLUS COMPANY LIMITED | ajplusai.co.tz

const SYSTEM_PROMPT = `Wewe ni AJPLUS AI — Mshauri wa Kwanza wa Kitanzania wenye Uwezo wa Kimataifa.
Umeundwa na AJ PLUS COMPANY LIMITED | ajplusai.co.tz | +255762307647

═══ UTAMBULISHO ═══
- Ukiulizwa "wewe ni nani?" → "Mimi ni AJPLUS AI — mshauri wako wa Kitanzania! 🇹🇿"
- KAMWE usiseme wewe ni ChatGPT, Gemini, Claude, au Copilot

═══ FALSAFA YAKO ═══
"Fikiri kimataifa — zungumza Kitanzania"
- Tumia maarifa ya dunia (WHO, Harvard, McKinsey, IMF, World Bank)
- Mifano yote iwe ya Tanzania (TZS, M-Pesa, BRELA, TRA, NMB, SGR)
- Jibu kama rafiki wa kisomi — anayejua dunia lakini anaishi Tanzania

═══ MUUNDO WA JIBU — FUATA DAIMA ═══

HATUA 1 — Jibu moja kwa moja (sentensi 1-2 tu)
HATUA 2 — Ushauri au maelezo (pointi 2-3 FUPI tu, kila moja sentensi 1)
HATUA 3 — Swali moja tu mwishoni

JUMLA YA JIBU: Mistari 6-9 tu. KAMWE zaidi ya mistari 12.

MFANO WA JIBU BORA:
Swali: "Nataka kujenga nyumba lakini sina pesa nyingi"
Jibu SAHIHI:
"Pole ndugu, lakini nyumba inawezekana hata na pesa kidogo — watu wengi wamefanya hivyo Tanzania.

• Anza na msingi tu — jenga kidogo kidogo, si yote mara moja
• NSSF na benki kama NMB/CRDB wana mikopo ya nyumba — riba ya chini
• Fanya mchoro wa bei kwanza — mjenzi wa kawaida Dar anatoza TZS 80,000-150,000/m²

Una ardhi tayari au unatafuta ardhi kwanza? 🏠"

JIBU BAYA (EPUKA):
❌ Headers kubwa (## au ###) — MARUFUKU KABISA
❌ Orodha ya 1. 2. 3. 4. 5. — tumia • badala yake, pointi 3 tu max
❌ Mistari mingi ya maelezo — usiandike zaidi ya sentensi 1 kwa kila pointi
❌ Maneno ya ziada: "Ni muhimu kuelewa kwamba..." "Kwa muhtasari..."
❌ Kujibu kwa Kiingereza bila sababu

═══ MAARIFA YAKO YA KIMATAIFA ═══

BIASHARA: Harvard Business, McKinsey → BRELA, TRA, BOT, DSE Tanzania
AFYA: WHO, CDC, Oxford → NHIF, MNH, KCMC, Bugando Tanzania  
SHERIA: UN, African Charter → Companies Act, Land Act, Employment Act TZ
ELIMU: Finland, Singapore → NECTA, HESLB, TCU, VETA Tanzania
FEDHA: IMF, World Bank → NMB, CRDB, BOT, M-Pesa, DSE Tanzania
KILIMO: FAO, IFAD → ASA, TOSCI, Kariakoo, mazao ya TZ
TEKNOLOJIA: AI, blockchain, cloud → TCRA, e-Gov, startups za TZ
DINI: Quran+Hadith (Islam) | Biblia (Ukristo) — jibu kwa heshima na usahihi
NDOA: John Gottman Research → Marriage Act 1971 Tanzania, mila za makabila
AFYA YA AKILI: WHO Mental Health, CBT → mazingira ya Tanzania

═══ LUGHA ═══
- Kiswahili sanifu cha Tanzania — cha karibu na chenye heshima
- "ndugu" / "rafiki" / "mkuu" — maneno ya urafiki
- Swali moja tu mwishoni — si maswali 2 au 3`;

// ─── WEB SEARCH KEYWORDS ──────────────────────────────
const WEB_SEARCH_KEYWORDS = [
  'bei ya dola','exchange rate','dollar leo','usd leo','forex',
  'bei ya euro','bei ya pound','shilingi leo',
  'bei ya mahindi','bei ya kahawa','bei ya pamba','bei ya korosho',
  'bei ya mafuta','bei ya petroli','bei ya diesel',
  'bei ya mazao','soko la leo','bei leo',
  'habari za leo','habari za sasa','news leo','habari mpya',
  'habari tanzania','matukio ya leo',
  'matokeo ya','simba sc','yanga sc','timu ya taifa',
  'premier league','champions league','mechi leo','matokeo leo',
  'hali ya hewa','mvua leo','weather','joto leo',
  'bei ya simu','bei ya gari','bei ya nyumba',
  'sasa hivi','wiki hii','mwezi huu'
];

function needsWebSearch(message) {
  const msg = message.toLowerCase();
  return WEB_SEARCH_KEYWORDS.some(k => msg.includes(k));
}

// ─── SUPABASE ─────────────────────────────────────────
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
  } catch (e) {
    console.error('Supabase error:', e.message);
    return null;
  }
}

async function saveChat(userEmail, message, reply) {
  await supabaseQuery('chats', 'POST', {
    user_email: userEmail || 'anonymous',
    message, reply
  });
}

// ─── PLAN LIMITS ──────────────────────────────────────
const PLAN_LIMITS = {
  free:     { daily: 10,   name: 'Bure' },
  msingi:   { daily: 50,   name: 'Msingi' },
  kawaida:  { daily: 150,  name: 'Kawaida' },
  pro:      { daily: null, name: 'Pro' },
  biashara: { daily: null, name: 'Biashara' }
};

async function checkLimit(email) {
  if (!email) return { allowed: true, plan: 'free' };
  try {
    const users = await supabaseQuery('users', 'GET', null, `email=eq.${email}`);
    const user = users?.[0];
    if (!user) return { allowed: true, plan: 'free' };
    const plan = user.plan || 'free';
    const limits = PLAN_LIMITS[plan] || PLAN_LIMITS.free;
    if (!limits.daily) return { allowed: true, plan };
    const today = new Date().toISOString().split('T')[0];
    if (user.last_question_date !== today) {
      await supabaseQuery('users', 'PATCH', {
        questions_today: 1, last_question_date: today
      }, `email=eq.${email}`);
      return { allowed: true, plan };
    }
    if (user.questions_today >= limits.daily) {
      return {
        allowed: false, plan,
        message: `Umefika kikomo cha maswali ${limits.daily} kwa leo! Panda mpango wako kwenye ajplusai.co.tz 🇹🇿`
      };
    }
    await supabaseQuery('users', 'PATCH', {
      questions_today: (user.questions_today || 0) + 1,
      last_question_date: today
    }, `email=eq.${email}`);
    return { allowed: true, plan };
  } catch(e) {
    return { allowed: true, plan: 'free' };
  }
}

// ─── CLAUDE ───────────────────────────────────────────
async function callClaude(message, history, apiKey, useWebSearch = false) {
  const messages = [];
  if (history && Array.isArray(history)) {
    history.slice(-6).forEach(h => {
      if (h.role && h.content) {
        messages.push({ role: h.role, content: h.content });
      }
    });
  }
  messages.push({ role: 'user', content: message });

  const body = {
    model: 'claude-haiku-4-5',
    max_tokens: 500,
    system: SYSTEM_PROMPT,
    messages
  };

  if (useWebSearch) {
    body.tools = [{ type: 'web_search_20250305', name: 'web_search', max_uses: 2 }];
  }

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01'
    },
    body: JSON.stringify(body)
  });

  if (!response.ok) {
    const err = await response.json();
    throw new Error(err?.error?.message || 'Claude API ilikataa');
  }

  const data = await response.json();
  let reply = '';
  if (data.content && Array.isArray(data.content)) {
    for (const block of data.content) {
      if (block.type === 'text') reply += block.text;
    }
  }
  return reply || 'Samahani, sijapata jibu. Tafadhali jaribu tena!';
}

// ─── GEMINI (BACKUP) ──────────────────────────────────
async function callGemini(message, history, apiKey, useWebSearch = false) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;
  const contents = [];

  if (history && Array.isArray(history)) {
    history.slice(-6).forEach(h => {
      if (h.role && h.content) {
        contents.push({
          role: h.role === 'assistant' ? 'model' : 'user',
          parts: [{ text: h.content }]
        });
      }
    });
  }
  contents.push({ role: 'user', parts: [{ text: message }] });

  const body = {
    systemInstruction: { parts: [{ text: SYSTEM_PROMPT }] },
    contents,
    generationConfig: { temperature: 0.7, maxOutputTokens: 500 }
  };

  if (useWebSearch) body.tools = [{ googleSearch: {} }];

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });

  if (!response.ok) {
    const err = await response.json();
    throw new Error(err?.error?.message || 'Gemini API ilikataa');
  }

  const data = await response.json();
  return data.candidates?.[0]?.content?.parts?.[0]?.text || 'Samahani, sijapata jibu!';
}

// ─── DOMAIN LOCK ──────────────────────────────────────
const ALLOWED_DOMAINS = [
  'ajplusai.co.tz', 'www.ajplusai.co.tz',
  'localhost:3000', 'localhost', '127.0.0.1'
];

function isAllowedDomain(req) {
  const origin  = req.headers.origin  || '';
  const referer = req.headers.referer || '';
  const host    = req.headers.host    || '';
  if (origin.includes('vercel.app') || referer.includes('vercel.app')) return true;
  if (host.includes('vercel.app')) return true;
  return ALLOWED_DOMAINS.some(d =>
    origin.includes(d) || referer.includes(d) || host.includes(d)
  );
}

// ─── HANDLER ──────────────────────────────────────────
module.exports = async function handler(req, res) {
  if (!isAllowedDomain(req)) {
    return res.status(403).json({
      error: 'Huduma hii inapatikana kwenye ajplusai.co.tz tu.',
      website: 'https://ajplusai.co.tz'
    });
  }

  res.setHeader('Access-Control-Allow-Origin', 'https://ajplusai.co.tz');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    let body = req.body;
    if (typeof body === 'string') {
      try { body = JSON.parse(body); } catch(e) { body = {}; }
    }
    if (!body) body = {};

    const message   = body.message;
    const history   = body.history || [];
    const userEmail = body.email   || null;

    if (!message) return res.status(400).json({ error: 'Swali linahitajika' });

    const limitCheck = await checkLimit(userEmail);
    if (!limitCheck.allowed) {
      return res.status(429).json({ error: limitCheck.message, upgrade: true });
    }

    const useWebSearch = needsWebSearch(message);
    const CLAUDE_KEY   = process.env.ANTHROPIC_API_KEY;
    const GEMINI_KEY   = process.env.GEMINI_API_KEY;

    let reply  = null;
    let source = null;

    if (CLAUDE_KEY) {
      try {
        reply  = await callClaude(message, history, CLAUDE_KEY, useWebSearch);
        source = useWebSearch ? 'claude+web' : 'claude';
      } catch (err) {
        console.warn('Claude imeshindwa:', err.message);
      }
    }

    if (!reply && GEMINI_KEY) {
      try {
        reply  = await callGemini(message, history, GEMINI_KEY, useWebSearch);
        source = useWebSearch ? 'gemini+web' : 'gemini';
      } catch (err) {
        return res.status(500).json({ error: 'Huduma haipo sasa hivi. Tafadhali jaribu tena.' });
      }
    }

    if (!reply) {
      return res.status(500).json({ error: 'Hakuna API Key — weka kwenye Vercel Settings' });
    }

    await saveChat(userEmail, message, reply);
    return res.status(200).json({
      reply, source,
      plan: limitCheck.plan,
      webSearch: useWebSearch
    });

  } catch (err) {
    console.error('AJPLUS AI Error:', err);
    return res.status(500).json({ error: 'Kosa la seva: ' + err.message });
  }
};
