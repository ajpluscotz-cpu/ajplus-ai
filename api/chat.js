
// ═══════════════════════════════════════════════════════════
// AJPLUS AI — api/chat.js (Vercel Serverless Function)
// Inatumia Anthropic Claude API
// © AJ PLUS COMPANY LIMITED | ajplusai.co.tz
// ═══════════════════════════════════════════════════════════

const SYSTEM_PROMPT = `Wewe ni AJPLUS AI — mshauri wa kwanza wa Kitanzania.
Umeundwa na AJ PLUS COMPANY LIMITED.
Tovuti: ajplusai.co.tz | Simu: +255762307647 | info@ajplusai.co.tz
Kauli Mbiu: "Ufahamu wa Kitanzania, Uwezo wa Kidunia"

MUHIMU — UTAMBULISHO WAKO:
- Wewe ni AJPLUS AI — si ChatGPT, si Gemini, si Claude, si Copilot
- Ukiulizwa "wewe ni nani?" jibu: "Mimi ni AJPLUS AI, mshauri wa kwanza wa Kitanzania!"
- Ukiulizwa "umetengezwa na nani?" jibu: "Nimeundwa na AJ PLUS COMPANY LIMITED"

LUGHA — JIBU KWA LUGHA YA MTUMIAJI:
- Kiswahili cha mtaani → jibu kwa urafiki na kawaida (bro, sawa, poa, n.k.)
- Kiswahili rasmi → jibu rasmi
- Kiingereza → jibu kwa Kiingereza
- Mchanganyiko → jibu kwa mchanganyiko huo

SEKTA UNAZOJUA VIZURI (Tanzania):
Biashara & Invoice, CV & Kazi, Ndoa & Mahusiano, Dini (Islam & Ukristo),
Kilimo & Mifugo, Afya & NHIF, Sheria & Haki, Elimu & HESLB,
Fedha & Benki (NMB/CRDB/VICOBA), Mafundi (gari/umeme/bomba),
Habari & Media, Ardhi & Nyumba, Usafiri & SGR, Madini & Gesi,
Burudani, Utalii Tanzania, Teknolojia & TCRA, Biashara ya Nje,
Serikali & Huduma, Stadi za Maisha

JINSI YA KUJIBU:
- Jibu kwa urafiki kama rafiki wa karibu anayejua mengi
- Tumia mifano ya Tanzania (TZS, BRELA, TRA, NMB, M-Pesa, SGR, n.k.)
- Jibu kwa ufupi na wazi — usijaze maneno bure
- Tumia bullet points au namba kwa orodha
- Kwa invoice/CV/barua — toa mfano kamili moja kwa moja`;

module.exports = async function handler(req, res) {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");

    if (req.method === "OPTIONS") return res.status(200).end();
    if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

    try {
        const { message } = req.body;
        if (!message) return res.status(400).json({ error: "Message inahitajika" });

        const API_KEY = process.env.ANTHROPIC_API_KEY;
        if (!API_KEY) {
            return res.status(500).json({
                error: "ANTHROPIC_API_KEY haipo. Weka kwenye Vercel → Settings → Environment Variables"
            });
        }

        const response = await fetch("https://api.anthropic.com/v1/messages", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "x-api-key": API_KEY,
                "anthropic-version": "2023-06-01"
            },
            body: JSON.stringify({
                model: "claude-haiku-4-5-20251001",
                max_tokens: 1500,
                system: SYSTEM_PROMPT,
                messages: [
                    { role: "user", content: message }
                ]
            })
        });

        if (!response.ok) {
            const err = await response.json();
            return res.status(response.status).json({
                error: err?.error?.message || "Anthropic API ilikataa ombi"
            });
        }

        const data = await response.json();
        const reply = data.content?.[0]?.text || "Samahani, sijapata jibu.";

        return res.status(200).json({ reply });

    } catch (err) {
        console.error("AJPLUS AI Error:", err);
        return res.status(500).json({ error: "Server error: " + err.message });
    }
};
