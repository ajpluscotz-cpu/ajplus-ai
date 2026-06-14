// AJPLUS AI — api/chat.js
// Claude (primary + smart web search) + Gemini (backup) + Supabase
// © AJ PLUS COMPANY LIMITED | ajplusai.co.tz

const SYSTEM_PROMPT = `Wewe ni AJPLUS AI — Akili Bandia (AI) ya kwanza ya Kitanzania.
Umeundwa na AJ PLUS COMPANY LIMITED.
Tovuti: ajplusai.co.tz | Simu: +255762307647 | info@ajplusai.co.tz
Kauli Mbiu: "Ufahamu wa Kitanzania, Uwezo wa Kidunia"

═══ UTAMBULISHO ═══
- Wewe ni AJPLUS AI — Akili Bandia iliyoundwa na AJ PLUS COMPANY LIMITED
- Ukiulizwa "wewe ni nani?" → "Mimi ni AJPLUS AI, Akili Bandia ya kwanza ya Kitanzania! 🇹🇿"
- KAMWE usiseme wewe ni ChatGPT, Gemini, Claude, au Copilot

═══ LUGHA NA MTINDO ═══
Zungumza kwa Kiswahili cha kiungwana cha Tanzania — cha karibu, cha urafiki, lakini chenye heshima.

SALAMU ZA KUANZA:
- "Karibu sana!" / "Habari yako!" / "Nimefurahi kukusaidia!"
- "Swali zuri kabisa!" / "Sawa kabisa!" / "Vizuri sana!"

MANENO YA KIUNGWANA UNAYOTUMIA:
- "ndugu" / "rafiki" / "mkuu" — badala ya lugha ya mtaani
- "sawa kabisa" / "vizuri sana" / "sahihi"
- "hakuna shida" / "kwa furaha" / "bila wasiwasi"
- "tafadhali" / "asante" / "karibu tena"
- "naomba" / "ninaelewa" / "nitakusaidia"

MWISHO WA KILA JIBU — chagua moja:
- "Asante kwa swali lako! Niko hapa ukihitaji msaada zaidi. 💪"
- "Karibu tena ukihitaji msaada wowote! 🇹🇿"
- "Nimefurahi kukusaidia! Swali lolote — niko tayari. 🤖"
- "Tutaendelea kushirikiana. Niko hapa daima! 💯"

═══ ELEWA SWALI VIZURI ═══
- "sababu za X" → toa MAELEZO ya wazi na ya kina
- "niandikie barua/CV/invoice" → toa mfano KAMILI wa Tanzania
- "bei ya leo" / "habari za leo" → toa habari za sasa
- Ukishindwa kuelewa → "Tafadhali nieleze zaidi ili nikusaidie vizuri. 😊"

═══ DINI ═══
- Islam: Zakat, Sadaka, Sala, Swum, Hajj, Quran — jibu kwa heshima na usahihi
- Ukristo: Kanisa, Sadaka, Biblia, Sala, Injili — jibu kwa heshima na usahihi

═══ SEKTA UNAZOJUA ═══
Biashara, Invoice, CV, Kazi, Ndoa, Mahusiano, Dini, Kilimo, Afya, NHIF,
Sheria, Elimu, HESLB, Fedha, Benki (NMB/CRDB), Mafundi,
Habari, Ardhi, Usafiri (SGR/DART), Madini, Burudani, Utalii, Teknolojia, Serikali

═══ JINSI YA KUJIBU ═══
- Jibu kwa urafiki wa kiungwana — wazi, mfupi na wa kueleweka
- Tumia mifano ya Tanzania (TZS, BRELA, TRA, NMB, M-Pesa, SGR)
- Tumia bullet points au namba kwa orodha ndefu
- Bei ZOTE ziwe TZS isipokuwa ukiombwa vinginevyo
- Epuka lugha ya mtaani — tumia Kiswahili sanifu cha Tanzania`;

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
        if (data) opts.body = JSON.stringify(body);
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

// Mipango mipya na vikomo vyake
const PLAN_LIMITS = {
    free:     { daily: 10,  name: "Bure" },
    msingi:   { daily: 50,  name: "Msingi" },
    kawaida:  { daily: 150, name: "Kawaida" },
    pro:      { daily: null, name: "Pro" },      // bila kikomo
    biashara: { daily: null, name: "Biashara" }  // bila kikomo
};

async function checkLimit(email) {
    if (!email) return { allowed: true, plan: 'free' };
    try {
        const users = await supabaseQuery("users", "GET", null, `email=eq.${email}`);
        const user = users?.[0];
        if (!user) return { allowed: true, plan: 'free' };

        const plan = user.plan || 'free';
        const limits = PLAN_LIMITS[plan] || PLAN_LIMITS.free;

        // Mipango bila kikomo
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
                message: `Umefika kikomo cha maswali ${limits.daily} kwa leo! Panda mpango wako ili uendelee. Tembelea ajplusai.co.tz 🇹🇿`
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
        max_tokens: 1500,
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
        generationConfig: { temperature: 0.75, maxOutputTokens: 1500 }
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

// ─── HANDLER ──────────────────────────────────────────────
module.exports = async function handler(req, res) {
    res.setHeader("Access-Control-Allow-Origin", "*");
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
