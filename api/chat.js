// AJPLUS AI — api/chat.js
// Claude (primary) + Gemini (backup) + Supabase (database)
// © AJ PLUS COMPANY LIMITED | ajplusai.co.tz

const SYSTEM_PROMPT = `Wewe ni AJPLUS AI — Akili Bandia (AI) ya kwanza ya Kitanzania.
Umeundwa na AJ PLUS COMPANY LIMITED.
Tovuti: ajplusai.co.tz | Simu: +255762307647 | info@ajplusai.co.tz
Kauli Mbiu: "Ufahamu wa Kitanzania, Uwezo wa Kidunia"

UTAMBULISHO:
- Wewe ni AI — Akili Bandia iliyoundwa na AJ PLUS COMPANY LIMITED
- Ukiulizwa "wewe ni nani?" jibu: "Mimi ni AJPLUS AI, Akili Bandia ya kwanza ya Kitanzania!"
- KAMWE usiseme wewe ni binadamu, ChatGPT, Gemini, Claude, au Copilot

LUGHA YA BONGO:
- Zungumza kama kijana wa Dar es Salaam — urafiki, wazi, si rasmi sana
- Tumia: "bana", "sawa kabisa", "aise", "hii ndiyo deal", "usijali", "poa"
- Bei zote TZS

ELEWA SWALI VIZURI:
- "sababu za X" = toa MAELEZO — si wimbo wala shairi
- "niandikie nashida/shairi/barua" = ndipo uandike
- "mdomo umekauka" = "Kunywa maji bana!" — usizidishe
- Ukishindwa kuelewa = uliza: "Bana unataka nini haswa?"

DINI:
- Islam: Zakat, Sadaka, Sala, Swum, Hajj — jibu kwa heshima
- Ukristo: Kanisa, Sadaka, Biblia, Sala — jibu kwa heshima

SEKTA (Tanzania):
Biashara, Invoice, CV, Kazi, Ndoa, Mahusiano, Dini, Kilimo, Afya, NHIF,
Sheria, Elimu, HESLB, Fedha, Benki, Mafundi, Habari, Ardhi,
Usafiri, SGR, Madini, Burudani, Utalii, Teknolojia, Serikali

JINSI YA KUJIBU:
- Jibu kwa ufupi na wazi
- Tumia bullet points kwa orodha
- Tumia mifano ya Tanzania (TZS, BRELA, TRA, NMB, M-Pesa)
- Mwisho wa kila jibu — ongeza mstari mmoja wa kushukuru kama: "Asante bana! Niko hapa ukihitaji zaidi 💪"`;

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
        if (res.ok && method !== "DELETE") {
            const text = await res.text();
            return text ? JSON.parse(text) : null;
        }
        return null;
    } catch (e) {
        console.error("Supabase error:", e.message);
        return null;
    }
}

// Hifadhi mazungumzo
async function saveChat(userEmail, message, reply) {
    await supabaseQuery("chats", "POST", {
        user_email: userEmail || "anonymous",
        message,
        reply
    });
}

// Angalia mtumiaji
async function getUser(email) {
    if (!email) return null;
    const users = await supabaseQuery("users", "GET", null, `email=eq.${email}`);
    return users?.[0] || null;
}

// Unda/Update mtumiaji
async function upsertUser(email, name = null) {
    if (!email) return null;
    const existing = await getUser(email);
    if (existing) {
        // Update questions count
        const today = new Date().toISOString().split('T')[0];
        const count = existing.last_question_date === today ? (existing.questions_today + 1) : 1;
        await supabaseQuery("users", "PATCH", {
            questions_today: count,
            last_question_date: today
        }, `email=eq.${email}`);
        return { ...existing, questions_today: count };
    } else {
        const result = await supabaseQuery("users", "POST", {
            email,
            name: name || email.split('@')[0],
            plan: 'free',
            questions_today: 1,
            last_question_date: new Date().toISOString().split('T')[0]
        });
        return result?.[0] || null;
    }
}

// Angalia limit ya maswali
async function checkLimit(email) {
    if (!email) return { allowed: true, plan: 'free' };
    const user = await upsertUser(email);
    if (!user) return { allowed: true, plan: 'free' };
    if (user.plan === 'pro' || user.plan === 'business') {
        return { allowed: true, plan: user.plan };
    }
    // Free plan — maswali 20 kwa siku
    const today = new Date().toISOString().split('T')[0];
    if (user.last_question_date !== today) return { allowed: true, plan: 'free' };
    if (user.questions_today > 20) {
        return { allowed: false, plan: 'free', message: "Umefika kikomo cha maswali 20 kwa leo! Panda Pro kwa TZS 15,000/mwezi." };
    }
    return { allowed: true, plan: 'free' };
}

// ─── CLAUDE API ───────────────────────────────────────────
async function callClaude(message, apiKey) {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "x-api-key": apiKey,
            "anthropic-version": "2023-06-01"
        },
        body: JSON.stringify({
            model: "claude-haiku-4-5",
            max_tokens: 1500,
            system: SYSTEM_PROMPT,
            messages: [{ role: "user", content: message }]
        })
    });
    if (!response.ok) {
        const err = await response.json();
        throw new Error(err?.error?.message || "Claude API ilikataa");
    }
    const data = await response.json();
    return data.content?.[0]?.text || "Samahani, sijapata jibu.";
}

// ─── GEMINI API (BACKUP) ──────────────────────────────────
async function callGemini(message, apiKey) {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;
    const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            systemInstruction: { parts: [{ text: SYSTEM_PROMPT }] },
            contents: [{ role: "user", parts: [{ text: message }] }],
            generationConfig: { temperature: 0.75, maxOutputTokens: 1500 }
        })
    });
    if (!response.ok) {
        const err = await response.json();
        throw new Error(err?.error?.message || "Gemini API ilikataa");
    }
    const data = await response.json();
    return data.candidates?.[0]?.content?.parts?.[0]?.text || "Samahani, sijapata jibu.";
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
            return res.status(429).json({
                error: limitCheck.message,
                upgrade: true
            });
        }

        const CLAUDE_KEY = process.env.ANTHROPIC_API_KEY;
        const GEMINI_KEY = process.env.GEMINI_API_KEY;

        let reply = null;
        let source = null;

        // Jaribu Claude kwanza
        if (CLAUDE_KEY) {
            try {
                reply = await callClaude(message, CLAUDE_KEY);
                source = "claude";
            } catch (claudeErr) {
                console.warn("Claude imeshindwa:", claudeErr.message);
            }
        }

        // Backup: Gemini
        if (!reply && GEMINI_KEY) {
            try {
                reply = await callGemini(message, GEMINI_KEY);
                source = "gemini";
            } catch (geminiErr) {
                console.error("Gemini imeshindwa:", geminiErr.message);
                return res.status(500).json({ error: "AI zote zimeshindwa" });
            }
        }

        if (!reply) {
            return res.status(500).json({ error: "Hakuna API Key — weka kwenye Vercel Settings" });
        }

        // Hifadhi mazungumzo Supabase
        await saveChat(userEmail, message, reply);

        return res.status(200).json({ reply, source, plan: limitCheck.plan });

    } catch (err) {
        console.error("AJPLUS AI Error:", err);
        return res.status(500).json({ error: "Server error: " + err.message });
    }
};
