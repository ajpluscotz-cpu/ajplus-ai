// AJPLUS AI — api/chat.js
// Claude (primary + smart web search) + Gemini (backup) + Supabase
// © AJ PLUS COMPANY LIMITED | ajplusai.co.tz

const SYSTEM_PROMPT = `Wewe ni AJPLUS AI — Akili Bandia (AI) ya kwanza ya Kitanzania.
Umeundwa na AJ PLUS COMPANY LIMITED.
Tovuti: ajplusai.co.tz | Simu: +255762307647 | info@ajplusai.co.tz
Kauli Mbiu: "Ufahamu wa Kitanzania, Uwezo wa Kidunia"

═══ UTAMBULISHO ═══
- Wewe ni AI — Akili Bandia iliyoundwa na AJ PLUS COMPANY LIMITED
- Ukiulizwa "wewe ni nani?" → "Mimi ni AJPLUS AI, Akili Bandia ya kwanza ya Kitanzania! 🇹🇿"
- KAMWE usiseme wewe ni ChatGPT, Gemini, Claude, au Copilot

═══ LUGHA YA BONGO ═══
Zungumza kama kijana wa mtaani wa Dar es Salaam.
- Salamu: "Mambo vipi bana!" / "Aise!" / "Poa kabisa!"
- Kukubaliana: "Kweli kabisa!" / "Hasa hivyo!" / "Hapo ndipo!"
- Maneno: "Hii ndiyo deal" / "Si mchezo" / "Usijali" / "Chapuo"
- Mwisho wa jibu: "Asante bana! Niko hapa ukihitaji zaidi 💪" au sawa na hiyo

═══ ELEWA SWALI ═══
- "sababu za X" → toa MAELEZO ya wazi
- "niandikie barua/CV/invoice" → toa mfano KAMILI wa Tanzania
- Ukishindwa kuelewa → "Bana unataka nini haswa? 😊"

═══ DINI ═══
- Islam na Ukristo — jibu kwa heshima kubwa na usahihi

═══ SEKTA ═══
Biashara, CV, Kazi, Ndoa, Dini, Kilimo, Afya, NHIF, Sheria, Elimu,
HESLB, Fedha, Benki, Mafundi, Habari, Ardhi, SGR, Madini, Burudani, Utalii, Serikali

═══ JINSI YA KUJIBU ═══
- Jibu kwa urafiki, ufupi na wazi
- Tumia mifano ya Tanzania (TZS, BRELA, TRA, NMB, M-Pesa)
- Tumia bullet points kwa orodha ndefu
- Bei ZOTE ziwe TZS`;

// ─── MANENO YA KUTAMBUA HABARI ZA LEO ────────────────────
const WEB_SEARCH_KEYWORDS = [
    // Bei za fedha
    'bei ya dola', 'exchange rate', 'dollar leo', 'usd leo', 'forex',
    'bei ya euro', 'bei ya pound', 'shilingi leo',
    // Bei za mazao
    'bei ya mahindi', 'bei ya kahawa', 'bei ya pamba', 'bei ya korosho',
    'bei ya mafuta', 'bei ya petroli', 'bei ya diesel', 'bei ya petrol',
    'bei ya mazao', 'soko la leo', 'bei leo',
    // Habari
    'habari za leo', 'habari za sasa', 'news leo', 'habari mpya',
    'habari tanzania', 'habari za tanzania', 'matukio ya leo',
    // Michezo
    'matokeo ya', 'simba sc', 'yanga sc', 'timu ya taifa',
    'premier league', 'champions league', 'epl leo', 'mechi leo',
    'mechi ya leo', 'matokeo leo', 'ligi kuu',
    // Hali ya hewa
    'hali ya hewa', 'mvua leo', 'weather', 'joto leo',
    // Teknolojia/Bei za bidhaa
    'bei ya simu', 'bei ya gari', 'bei ya nyumba', 'bei ya ardhi',
    // Maneno ya leo/sasa
    'sasa hivi', 'hivi karibuni', 'wiki hii', 'mwezi huu', 'mwaka huu',
    'leo', 'jana', 'kesho', 'siku hizi', 'wakati huu'
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

async function checkLimit(email) {
    if (!email) return { allowed: true, plan: 'free' };
    try {
        const users = await supabaseQuery("users", "GET", null, `email=eq.${email}`);
        const user = users?.[0];
        if (!user) return { allowed: true, plan: 'free' };
        if (user.plan === 'pro' || user.plan === 'business') {
            return { allowed: true, plan: user.plan };
        }
        const today = new Date().toISOString().split('T')[0];
        if (user.last_question_date !== today) return { allowed: true, plan: 'free' };
        if (user.questions_today >= 20) {
            return {
                allowed: false,
                plan: 'free',
                message: "Aise bana! Umefika kikomo cha maswali 20 kwa leo! Panda Pro kwa TZS 15,000/mwezi 💪"
            };
        }
        await supabaseQuery("users", "PATCH", {
            questions_today: (user.questions_today || 0) + 1,
            last_question_date: today
        }, `email=eq.${email}`);
        return { allowed: true, plan: 'free' };
    } catch(e) {
        return { allowed: true, plan: 'free' };
    }
}

// ─── CLAUDE — na au bila web search ──────────────────────
async function callClaude(message, apiKey, useWebSearch = false) {
    const body = {
        model: "claude-haiku-4-5",
        max_tokens: 1500,
        system: SYSTEM_PROMPT,
        messages: [{ role: "user", content: message }]
    };

    // Ongeza web search ONLY kama inahitajika
    if (useWebSearch) {
        body.tools = [{
            type: "web_search_20250305",
            name: "web_search",
            max_uses: 2  // punguza kutoka 3 hadi 2 — save credits
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
    return reply || "Samahani bana, sijapata jibu. Jaribu tena!";
}

// ─── GEMINI (BACKUP) ──────────────────────────────────────
async function callGemini(message, apiKey, useWebSearch = false) {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

    const body = {
        systemInstruction: { parts: [{ text: SYSTEM_PROMPT }] },
        contents: [{ role: "user", parts: [{ text: message }] }],
        generationConfig: { temperature: 0.75, maxOutputTokens: 1500 }
    };

    // Ongeza Google Search ONLY kama inahitajika
    if (useWebSearch) {
        body.tools = [{ googleSearch: {} }];
    }

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
    return data.candidates?.[0]?.content?.parts?.[0]?.text || "Samahani bana, sijapata jibu!";
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

        if (!message) return res.status(400).json({ error: "Message inahitajika" });

        // Angalia limit
        const limitCheck = await checkLimit(userEmail);
        if (!limitCheck.allowed) {
            return res.status(429).json({ error: limitCheck.message, upgrade: true });
        }

        // Angalia kama swali linahitaji web search
        const useWebSearch = needsWebSearch(message);
        console.log(`Web search: ${useWebSearch ? 'YES' : 'NO'} — "${message.substring(0, 50)}"`);

        const CLAUDE_KEY = process.env.ANTHROPIC_API_KEY;
        const GEMINI_KEY = process.env.GEMINI_API_KEY;

        let reply = null;
        let source = null;

        // Claude kwanza
        if (CLAUDE_KEY) {
            try {
                reply = await callClaude(message, CLAUDE_KEY, useWebSearch);
                source = useWebSearch ? "claude+web" : "claude";
            } catch (err) {
                console.warn("Claude imeshindwa:", err.message);
            }
        }

        // Gemini backup
        if (!reply && GEMINI_KEY) {
            try {
                reply = await callGemini(message, GEMINI_KEY, useWebSearch);
                source = useWebSearch ? "gemini+web" : "gemini";
            } catch (err) {
                return res.status(500).json({ error: "AI zote zimeshindwa bana! Jaribu tena." });
            }
        }

        if (!reply) {
            return res.status(500).json({ error: "Hakuna API Key — weka kwenye Vercel Settings" });
        }

        // Hifadhi
        await saveChat(userEmail, message, reply);

        return res.status(200).json({
            reply,
            source,
            plan: limitCheck.plan,
            webSearch: useWebSearch
        });

    } catch (err) {
        console.error("AJPLUS AI Error:", err);
        return res.status(500).json({ error: "Server error: " + err.message });
    }
};
