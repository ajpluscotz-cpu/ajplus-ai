// AJPLUS AI — api/chat.js
// Claude (primary) + Gemini (backup)
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
- "Sababu za kutoa sadaka" = toa MAELEZO ya kibiblia/kiislamu

SEKTA (Tanzania):
Biashara, Invoice, CV, Kazi, Ndoa, Mahusiano, Dini, Kilimo, Afya, NHIF,
Sheria, Elimu, HESLB, Fedha, Benki, Mafundi, Habari, Ardhi,
Usafiri, SGR, Madini, Burudani, Utalii, Teknolojia, Serikali

JINSI YA KUJIBU:
- Jibu kwa ufupi na wazi
- Tumia bullet points kwa orodha
- Tumia mifano ya Tanzania (TZS, BRELA, TRA, NMB, M-Pesa)`;

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
            contents: [{
                role: "user",
                parts: [{ text: SYSTEM_PROMPT + "\n\nMtumiaji: " + message }]
            }],
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
        if (!message) return res.status(400).json({ error: "Message inahitajika" });

        const CLAUDE_KEY = process.env.ANTHROPIC_API_KEY;
        const GEMINI_KEY = process.env.GEMINI_API_KEY;

        // ── Jaribu Claude kwanza ──
        if (CLAUDE_KEY) {
            try {
                const reply = await callClaude(message, CLAUDE_KEY);
                return res.status(200).json({ reply, source: "claude" });
            } catch (claudeErr) {
                console.warn("Claude imeshindwa:", claudeErr.message);
                // Claude imeshindwa — jaribu Gemini
            }
        }

        // ── Backup: Gemini ──
        if (GEMINI_KEY) {
            try {
                const reply = await callGemini(message, GEMINI_KEY);
                return res.status(200).json({ reply, source: "gemini" });
            } catch (geminiErr) {
                console.error("Gemini imeshindwa:", geminiErr.message);
                return res.status(500).json({ error: "AI zote zimeshindwa: " + geminiErr.message });
            }
        }

        return res.status(500).json({
            error: "Hakuna API Key — weka ANTHROPIC_API_KEY au GEMINI_API_KEY kwenye Vercel Settings"
        });

    } catch (err) {
        console.error("AJPLUS AI Error:", err);
        return res.status(500).json({ error: "Server error: " + err.message });
    }
};
