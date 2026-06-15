// AJPLUS AI — api/chat.js
// Claude (primary + smart web search) + Gemini (backup) + Supabase
// © AJ PLUS COMPANY LIMITED | ajplusai.co.tz

const SYSTEM_PROMPT = `Wewe ni AJPLUS AI — Akili Bandia ya kwanza ya Kitanzania.
Umeundwa na AJ PLUS COMPANY LIMITED.
Tovuti: ajplusai.co.tz | Simu: +255762307647 | info@ajplusai.co.tz

═══ UTAMBULISHO ═══
- Wewe ni AJPLUS AI — ukiulizwa "wewe ni nani?" jibu: "Mimi ni AJPLUS AI, mshauri wako wa Kitanzania! 🇹🇿"
- KAMWE usiseme wewe ni ChatGPT, Gemini, Claude, au Copilot

═══ JINSI YA KUJIBU — MUHIMU SANA ═══
Fuata muundo huu DAIMA:

1. JIBU MOJA KWA MOJA — mistari 2-4 tu, wazi na ya kueleweka
2. USHAURI — pointi 2-3 fupi tu (si orodha ndefu)
3. SWALI MOJA CHINI — uliza swali moja ili kuelewa zaidi

MFANO WA JIBU ZURI:
Mtumiaji: "Ndoa yangu ina matatizo"
Jibu: "Pole sana ndugu. Matatizo ya ndoa yanaweza kuwa mazito lakini yanaweza kutatuliwa.

• Zungumza na mwenzako kwa utulivu bila kelele
• Tafuta mshauri wa ndoa au kiongozi wa dini

Je, tatizo lako ni ugomvi wa mara kwa mara, fedha, au kitu kingine? 🤝"

KANUNI ZA MSINGI:
- JIBU FUPI — mistari 6-10 tu jumla, si zaidi
- Pointi 2-3 tu, si orodha ndefu ya mistari 10+
- Swali MOJA tu mwishoni — si maswali 3 au 4
- Zungumza kama rafiki wa karibu, si kama kitabu au daktari
- Tumia Kiswahili cha kawaida cha Tanzania
- Tumia mifano ya Tanzania (TZS, M-Pesa, BRELA, NMB, SGR)

USIFANYE:
- Usiandike orodha ndefu bila kuulizwa
- Usiandike maelezo ya kurasa nzima
- Usiulize maswali mengi mara moja
- Usijibu kwa Kiingereza isipokuwa mtumiaji ameandika Kiingereza

═══ DINI ═══
- Islam: jibu kwa heshima na usahihi — Zakat, Sala, Quran
- Ukristo: jibu kwa heshima na usahihi — Biblia, Kanisa, Sala

═══ SEKTA UNAZOJUA ═══
Biashara, CV, Kazi, Ndoa, Mahusiano, Dini, Kilimo, Afya, NHIF,
Sheria, Elimu, HESLB, Fedha, Benki, Mafundi, Habari, Ardhi,
Usafiri (SGR/DART), Madini, Burudani, Utalii, Teknolojia, Serikali

═══ EXPORT / DOWNLOAD ═══
- Ukiulizwa "download PDF" au "hifadhi" → mwambie abonyeze "⬇ Hifadhi" upande wa kulia`;

// ─── MANENO YA KUTAMBUA HABARI ZA LEO ────────────────────
const WEB_SEARCH_KEYWORDS = [
    'bei ya dola', 'exchange rate', 'dollar leo', 'usd leo', 'forex',
    'bei ya euro', 'bei ya pound', 'shilingi leo',
    'bei ya mahindi', 'bei ya kahawa', 'bei ya pamba', 'bei ya korosho',
    'bei ya mafuta', 'bei ya petroli', 'bei ya diesel', 'bei ya petrol',
    'bei ya mazao', 'soko la leo', 'bei leo',
    'habari za leo', 'habari za sasa', 'news leo', 'habari mpya',
    'habari tanzania', 'habari za tanzania', 'matukio ya leo',
    'matokeo ya', 'simba sc', 'yanga sc', 'timu ya taifa',
    'premier league', 'champions league', 'epl leo', 'mechi leo',
    'mechi ya leo', 'matokeo leo', 'ligi kuu',
    'hali ya hewa', 'mvua leo', 'weather', 'joto leo',
    'bei ya simu', 'bei ya gari', 'bei ya nyumba', 'bei ya ardhi',
    'sasa hivi', 'hivi karibuni', 'wiki hii', 'mwezi huu',
    'leo', 'jana', 'kesho', 'siku hizi'
];

function needsWebSearch(message) {
    const msg = message.toLowerCase();
    return WEB_SEARCH_KEYWORDS.some(keyword => msg.includes(keyword));
}

// ─── SUPABASE ─────────────────────────────────────────────
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
                "Content-Type": "application/json",
                "apikey": SUPABASE_SERVICE_KEY,
                "Authorization": `Bearer ${SUPABASE_SERVICE_KEY}`,
                "Prefer": method === "POST" ? "return=representation" : ""
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
        console.error("Supabase error:", e.message);
        return null;
    }
}

async function saveChat(userEmail, message, reply) {
    await supabaseQuery("chats", "POST", {
        user_email: userEmail || "anonymous",
        message,
        reply
    });
}

const PLAN_LIMITS = {
    free:     { daily: 10,  name: "Bure" },
    msingi:   { daily: 50,  name: "Msingi" },
    kawaida:  { daily: 150, name: "Kawaida" },
    pro:      { daily: null, name: "Pro" },
    biashara: { daily: null, name: "Biashara" }
};

async function checkLimit(email) {
    if (!email) return { allowed: true, plan: 'free' };
    try {
        const users = await supabaseQuery("users", "GET", null, `email=eq.${email}`);
        const user = users?.[0];
        if (!user) return { allowed: true, plan: 'free' };
        const plan = user.plan || 'free';
        const limits = PLAN_LIMITS[plan] || PLAN_LIMITS.free;
        if (!limits.daily) return { allowed: true, plan };
        const today = new Date().toISOString().split('T')[0];
        if (user.last_question_date !== today) {
            await supabaseQuery("users", "PATCH", {
                questions_today: 1,
                last_question_date: today
            }, `email=eq.${email}`);
            return { allowed: true, plan };
        }
        if (user.questions_today >= limits.daily) {
            return {
                allowed: false,
                plan,
                message: `Umefika kikomo cha maswali ${limits.daily} kwa leo! Panda mpango wako. Tembelea ajplusai.co.tz 🇹🇿`
            };
        }
        await supabaseQuery("users", "PATCH", {
            questions_today: (user.questions_today || 0) + 1,
            last_question_date: today
        }, `email=eq.${email}`);
        return { allowed: true, plan };
    } catch(e) {
        return { allowed: true, plan: 'free' };
    }
}

// ─── CLAUDE ───────────────────────────────────────────────
async function callClaude(message, apiKey, useWebSearch = false) {
    const body = {
        model: "claude-haiku-4-5",
        max_tokens: 500,
        system: SYSTEM_PROMPT,
        messages: [{ role: "user", content: message }]
    };
    if (useWebSearch) {
        body.tools = [{
            type: "web_search_20250305",
            name: "web_search",
            max_uses: 2
        }];
    }
    const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "x-api-key": apiKey,
            "anthropic-version": "2023-06-01"
        },
        body: JSON.stringify(body)
    });
    if (!response.ok) {
        const err = await response.json();
        throw new Error(err?.error?.message || "Claude API ilikataa");
    }
    const data = await response.json();
    let reply = "";
    if (data.content && Array.isArray(data.content)) {
        for (const block of data.content) {
            if (block.type === "text") reply += block.text;
        }
    }
    return reply || "Samahani, sijapata jibu. Tafadhali jaribu tena!";
}

// ─── GEMINI (BACKUP) ──────────────────────────────────────
async function callGemini(message, apiKey, useWebSearch = false) {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;
    const body = {
        systemInstruction: { parts: [{ text: SYSTEM_PROMPT }] },
        contents: [{ role: "user", parts: [{ text: message }] }],
        generationConfig: { temperature: 0.75, maxOutputTokens: 500 }
    };
    if (useWebSearch) body.tools = [{ googleSearch: {} }];
    const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
    });
    if (!response.ok) {
        const err = await response.json();
        throw new Error(err?.error?.message || "Gemini API ilikataa");
    }
    const data = await response.json();
    return data.candidates?.[0]?.content?.parts?.[0]?.text || "Samahani, sijapata jibu!";
}

// ─── DOMAIN LOCK ──────────────────────────────────────────
const ALLOWED_DOMAINS = [
    "ajplusai.co.tz",
    "www.ajplusai.co.tz",
    "localhost:3000",
    "localhost",
    "127.0.0.1"
];

function isAllowedDomain(req) {
    const origin = req.headers.origin || "";
    const referer = req.headers.referer || "";
    const host = req.headers.host || "";
    if (origin.includes("vercel.app") || referer.includes("vercel.app")) return true;
    if (host.includes("vercel.app")) return true;
    return ALLOWED_DOMAINS.some(d =>
        origin.includes(d) || referer.includes(d) || host.includes(d)
    );
}

// ─── HANDLER ──────────────────────────────────────────────
module.exports = async function handler(req, res) {
    if (!isAllowedDomain(req)) {
        return res.status(403).json({
            error: "Huduma hii inapatikana kwenye ajplusai.co.tz tu.",
            website: "https://ajplusai.co.tz"
        });
    }

    res.setHeader("Access-Control-Allow-Origin", "https://ajplusai.co.tz");
    res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");
    if (req.method === "OPTIONS") return res.status(200).end();
    if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

    try {
        let body = req.body;
        if (typeof body === "string") {
            try { body = JSON.parse(body); } catch(e) { body = {}; }
        }
        if (!body) body = {};

        const message = body.message;
        const userEmail = body.email || null;

        if (!message) return res.status(400).json({ error: "Swali linahitajika" });

        const limitCheck = await checkLimit(userEmail);
        if (!limitCheck.allowed) {
            return res.status(429).json({ error: limitCheck.message, upgrade: true });
        }

        const useWebSearch = needsWebSearch(message);
        const CLAUDE_KEY = process.env.ANTHROPIC_API_KEY;
        const GEMINI_KEY = process.env.GEMINI_API_KEY;

        let reply = null;
        let source = null;

        if (CLAUDE_KEY) {
            try {
                reply = await callClaude(message, CLAUDE_KEY, useWebSearch);
                source = useWebSearch ? "claude+web" : "claude";
            } catch (err) {
                console.warn("Claude imeshindwa:", err.message);
            }
        }

        if (!reply && GEMINI_KEY) {
            try {
                reply = await callGemini(message, GEMINI_KEY, useWebSearch);
                source = useWebSearch ? "gemini+web" : "gemini";
            } catch (err) {
                return res.status(500).json({ error: "Huduma haipo sasa hivi. Tafadhali jaribu tena." });
            }
        }

        if (!reply) {
            return res.status(500).json({ error: "Hakuna API Key — weka kwenye Vercel Settings" });
        }

        await saveChat(userEmail, message, reply);
        return res.status(200).json({ reply, source, plan: limitCheck.plan, webSearch: useWebSearch });

    } catch (err) {
        console.error("AJPLUS AI Error:", err);
        return res.status(500).json({ error: "Kosa la seva: " + err.message });
    }
};
