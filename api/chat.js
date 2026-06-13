// ═══════════════════════════════════════════════════════════
// AJPLUS AI — api/chat.js (Vercel Serverless Function)
// API key iko salama hapa — haionekani kwa mtu yeyote
// © AJ PLUS COMPANY LIMITED | ajplusai.co.tz
// ═══════════════════════════════════════════════════════════

const SYSTEM_PROMPT = `
Wewe ni AJPLUS AI — mshauri wa kwanza wa Kitanzania.
Umeundwa na AJ PLUS COMPANY LIMITED.
Tovuti: ajplusai.co.tz | Simu: +255762307647 | info@ajplusai.co.tz
Kauli Mbiu: "Ufahamu wa Kitanzania, Uwezo wa Kidunia"

MUHIMU — UTAMBULISHO WAKO:
- Wewe ni AJPLUS AI — si ChatGPT, si Gemini, si Claude, si Copilot
- Ukiulizwa "wewe ni nani?" jibu: "Mimi ni AJPLUS AI!"

LUGHA — JIBU KWA LUGHA YA MTUMIAJI.

SEKTA (Tanzania): Biashara, Invoice, CV, Kazi, Ndoa, Mahusiano,
Dini (Islam & Ukristo), Kilimo, Mifugo, Afya, NHIF, Sheria, Haki,
Elimu, HESLB, Fedha, Benki, Mafundi, Habari, Ardhi, Usafiri, SGR,
Madini, Gesi, Burudani, Utalii, Teknolojia, TCRA, Biashara ya Nje,
Serikali, Stadi za Maisha.

JINSI YA KUJIBU:
- Jibu kwa urafiki kama rafiki wa karibu
- Tumia mifano ya Tanzania (TZS, BRELA, TRA, NMB, M-Pesa)
- Jibu kwa ufupi na wazi
`;

module.exports = async function handler(req, res) {
    // CORS headers
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");

    if (req.method === "OPTIONS") return res.status(200).end();
    if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

    try {
        const { message } = req.body;
        if (!message) return res.status(400).json({ error: "Message inahitajika" });

        // API key inatoka Vercel Environment Variable — SALAMA!
        const API_KEY = process.env.GEMINI_API_KEY;
        if (!API_KEY) {
            return res.status(500).json({
                error: "GEMINI_API_KEY haipo. Weka kwenye Vercel → Settings → Environment Variables"
            });
        }

        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${API_KEY}`;

        const response = await fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                contents: [{
                    role: "user",
                    parts: [{ text: SYSTEM_PROMPT + "\n\nMtumiaji: " + message }]
                }],
                generationConfig: {
                    temperature: 0.75,
                    maxOutputTokens: 1500
                }
            })
        });

        if (!response.ok) {
            const errData = await response.json();
            return res.status(response.status).json({
                error: errData?.error?.message || "Gemini API ilikataa ombi"
            });
        }

        const data = await response.json();
        const reply = data.candidates?.[0]?.content?.parts?.[0]?.text || "Samahani, sijapata jibu.";

        return res.status(200).json({ reply });

    } catch (err) {
        console.error("AJPLUS AI Error:", err);
        return res.status(500).json({ error: "Server error: " + err.message });
    }
};
