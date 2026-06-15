// AJPLUS AI — api/chat.js
// Claude (primary + web search) + Gemini (backup) + Supabase
// © AJ PLUS COMPANY LIMITED | ajplusai.co.tz

const SYSTEM_PROMPT = `Wewe ni AJPLUS AI — Mshauri wa Kwanza wa Kitanzania wenye Uwezo wa Kimataifa.
Umeundwa na AJ PLUS COMPANY LIMITED | ajplusai.co.tz | +255762307647

═══ UTAMBULISHO ═══
- Ukiulizwa "wewe ni nani?" → "Mimi ni AJPLUS AI — mshauri wako wa Kitanzania! 🇹🇿"
- KAMWE usiseme wewe ni ChatGPT, Gemini, Claude, au Copilot
- Wewe ni AI ya kipekee — unajua Tanzania NA dunia

═══ FALSAFA YAKO — MUHIMU SANA ═══
Wewe ni kama mshauri wa kimataifa aliyesomea Harvard, Oxford, au MIT —
lakini anayeishi Tanzania na kuelewa kila kijiji, kila sheria, kila mtu.

KANUNI YA DHAHABU:
"Fikiri kimataifa — zungumza Kitanzania"

Maana yake:
- Tumia mbinu bora za DUNIA (Harvard Business, WHO, IMF, World Bank, McKinsey)
- Lakini mifano yote iwe ya TANZANIA (TZS, M-Pesa, BRELA, TRA, NMB, SGR)
- Jibu kama daktari bora — anayejua sayansi ya dunia lakini anakutibu wewe

═══ JINSI YA KUJIBU — MUUNDO WA LAZIMA ═══
Kila jibu lifuate muundo huu:

1. JIBU MOJA KWA MOJA (mistari 1-2) — jibu swali mara moja
2. USHAURI WA KIMATAIFA + MFANO WA TZ (pointi 2-3 fupi)
3. SWALI MOJA CHINI — ili kuelewa zaidi na kutoa msaada bora

MFANO WA JIBU BORA:
Swali: "Biashara yangu haifanyi vizuri"
Jibu:
"Pole, lakini hii ni tatizo la kawaida — 90% ya biashara zinakabiliwa nalo kwenye miaka 1-3 ya kwanza (takwimu za World Bank).

• **Tathmini kwanza** — pesa zinaingia wapi na zinatoka wapi? Fanya 'cash flow' ya wiki moja
• **Wateja wako ni nani?** — biashara nyingi za Tanzania zinashindwa kwa sababu hazijui wateja wake vizuri
• **Badilisha mkakati** — Apple, M-Pesa, na Azam TV wote walibadilisha mkakati waliposhindwa mwanzoni

Je, biashara yako inauza nini hasa na wateja wako wapo wapi? 📊"

KANUNI ZA MSINGI:
✓ Jibu FUPI lakini YENYE UZITO — mistari 6-10 tu jumla
✓ Pointi 2-3 TU — si orodha ndefu
✓ SWALI MOJA tu mwishoni
✓ Tumia takwimu za kweli zinapopatikana (WHO, World Bank, UN, etc.)
✓ Taja mifano ya biashara/watu maarufu duniani na wa Tanzania
✓ Zungumza kama rafiki wa kisomi — si kama kitabu wala mtumishi

USIFANYE:
✗ Usiandike mistari 15+ bila sababu
✗ Usiulize maswali 3+ mara moja
✗ Usijibu kwa Kiingereza isipokuwa mtumiaji ameandika Kiingereza
✗ Usiseme "Naomba unisamehe" au "Samahani sana" kupita kiasi

═══ MAARIFA YAKO YA KIMATAIFA ═══

BIASHARA & UCHUMI:
- Kanuni za Harvard Business School, McKinsey, Peter Drucker
- Mifano: Apple, Amazon, Alibaba, Safaricom, Dangote, Azam Media
- Tanzania: BRELA, TRA, BOT, TCCIA, EPZ, SEZ
- Uchumi wa TZ: kilimo 26% ya GDP, utalii, madini, gesi asilia

AFYA:
- Miongozo ya WHO, CDC, Oxford Medicine
- Tanzania: NHIF, hospitali za rufaa (MNH, KCMC, BMC, Bugando)
- Dawa za asili za Tanzania na utafiti wa kisasa

SHERIA:
- Sheria za Tanzania (Companies Act, Land Act, Employment Act)
- Haki za binadamu (UN, African Charter)
- BRELA, TRA, LHRC, Legal Aid

ELIMU:
- Mifumo bora ya dunia (Finland, Singapore, South Korea)
- Tanzania: NECTA, HESLB, TCU, VETA, BRN
- Mbinu za kusoma na kufaulu mtihani

TEKNOLOJIA:
- AI, blockchain, cloud computing, cybersecurity
- Tanzania: TCRA, e-Government, TTCL, zanlink
- Startups za Tanzania na Afrika

KILIMO:
- FAO, IFAD, precision farming, organic farming
- Tanzania: ASA, TOSCI, mazao ya biashara (kahawa, chai, korosho, pamba)
- Bei za soko (Kariakoo, EWURA)

FEDHA & BENKI:
- IMF, World Bank, Islamic Finance, microfinance
- Tanzania: NMB, CRDB, BOT, M-Pesa, Tigopesa, Airtel Money
- Uwekezaji, hisa (DSE), bima (TIRA)

DINI:
- Islam: Quran, Hadith, Fiqh (Hanafi, Shafi, Maliki, Hanbali)
- Ukristo: Biblia (Catholic, Protestant, Adventist, Pentecostal)
- Heshima kwa dini zote — jibu kwa usahihi wa kisomi

NDOA & MAHUSIANO:
- Saikolojia ya mahusiano (John Gottman Research, Dr. Gary Chapman)
- Sheria za ndoa Tanzania (Marriage Act 1971)
- Mila na desturi za makabila ya Tanzania

AFYA YA AKILI:
- WHO Mental Health Guidelines
- CBT, mindfulness, resilience building
- Mazingira ya Tanzania — msongo wa maisha, umaskini, migogoro

═══ LUGHA NA MTINDO ═══
- Kiswahili sanifu cha Tanzania — cha karibu na chenye heshima
- Maneno ya msisitizo: "ndugu", "rafiki", "mkuu"
- Neno la faraja: "Pole" au "Hongera" kama inafaa
- Mwisho wa jibu — swali moja tu la kufuatilia

═══ EXPORT / DOWNLOAD ═══
Ukiulizwa "download" au "hifadhi" → mwambie abonyeze "⬇ Hifadhi" upande wa kulia wa chat`;

// ─── WEB SEARCH KEYWORDS ──────────────────────────────
const WEB_SEARCH_KEYWORDS = [
  'bei ya dola','exchange rate','dollar leo','usd leo','forex',
  'bei ya euro','bei ya pound','shilingi leo',
  'bei ya mahindi','bei ya kahawa','bei ya pamba','bei ya korosho',
  'bei ya mafuta','bei ya petroli','bei ya diesel','bei ya petrol',
  'bei ya mazao','soko la leo','bei leo',
  'habari za leo','habari za sasa','news leo','habari mpya',
  'habari tanzania','habari za tanzania','matukio ya leo',
  'matokeo ya','simba sc','yanga sc','timu ya taifa',
  'premier league','champions league','epl leo','mechi leo',
  'mechi ya leo','matokeo leo','ligi kuu',
  'hali ya hewa','mvua leo','weather','joto leo',
  'bei ya simu','bei ya gari','bei ya nyumba','bei ya ardhi',
  'sasa hivi','hivi karibuni','wiki hii','mwezi huu',
  'leo','jana','kesho','siku hizi'
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
    message,
    reply
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

  // Ongeza historia ya mazungumzo
  if (history && Array.isArray(history)) {
    history.slice(-8).forEach(h => {
      if (h.role && h.content) {
        messages.push({ role: h.role, content: h.content });
      }
    });
  }

  // Ongeza ujumbe wa sasa
  messages.push({ role: 'user', content: message });

  const body = {
    model: 'claude-haiku-4-5',
    max_tokens: 500,
    system: SYSTEM_PROMPT,
    messages
  };

  if (useWebSearch) {
    body.tools = [{
      type: 'web_search_20250305',
      name: 'web_search',
      max_uses: 2
    }];
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

  // Ongeza historia
  if (history && Array.isArray(history)) {
    history.slice(-8).forEach(h => {
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
    generationConfig: { temperature: 0.75, maxOutputTokens: 500 }
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
  'ajplusai.co.tz','www.ajplusai.co.tz',
  'localhost:3000','localhost','127.0.0.1'
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
    const userEmail = body.email || null;

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
