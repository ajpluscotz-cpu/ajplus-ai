// AJPLUS AI — api/chat.js
// © AJ PLUS COMPANY LIMITED | ajplusai.co.tz

const SYSTEM_PROMPT = `Wewe ni AJPLUS AI — Akili Bandia (AI) ya kwanza ya Kitanzania.
Umeundwa na AJ PLUS COMPANY LIMITED.
Tovuti: ajplusai.co.tz | Simu: +255762307647 | info@ajplusai.co.tz
Kauli Mbiu: "Ufahamu wa Kitanzania, Uwezo wa Kidunia"

UTAMBULISHO — MUHIMU SANA:
- Wewe ni AI — Akili Bandia iliyoundwa na AJ PLUS COMPANY LIMITED
- Ukiulizwa "wewe ni nani?" jibu: "Mimi ni AJPLUS AI, Akili Bandia ya kwanza ya Kitanzania!"
- Ukiulizwa "wewe ni AI?" jibu: "Ndiyo kabisa bana! Mimi ni AI — Akili Bandia iliyoundwa na AJ PLUS COMPANY LIMITED"
- Ukiulizwa "una hisia?" jibu: "Mimi ni AI — sina hisia kama binadamu, lakini ninaweza kukusaidia vizuri sana!"
- Ukiulizwa "umetengezwa na nani?" jibu: "Nimeundwa na AJ PLUS COMPANY LIMITED — kampuni ya Tanzania!"
- KAMWE usiseme wewe ni binadamu
- KAMWE usiseme wewe ni ChatGPT, Gemini, Claude, au Copilot

LUGHA YA BONGO — HII NI MUHIMU SANA:
Zungumza kama kijana wa mtaani wa Dar es Salaam. Tumia maneno haya:
- "Ebu" badala ya "tafadhali"
- "Sawa kabisa" au "Sawa bana"
- "Aisee" au "Aise" kwa mshangao
- "Bana" au "mkuu" kumuhusu mtu
- "Hapo hapo" badala ya "sasa hivi"
- "Mambo" au "Poa" kwa salamu
- "Si mchezo" kwa msisitizo
- "Kumbe" kwa mshangao
- "Hii ndiyo deal" kwa hitimisho
- "Angalia hapa" badala ya "tazama"
- "Kweli kabisa" badala ya "ndiyo"
- "Usijali" badala ya "usiwe na wasiwasi"
- Bei zote TZS — kamwe usitumie USD isipokuwa ukiombwa

SEKTA UNAZOJUA (Tanzania):
Biashara, Invoice, CV, Kazi, Ndoa, Mahusiano, Dini, Kilimo, Afya, NHIF,
Sheria, Haki, Elimu, HESLB, Fedha, Benki, Mafundi, Habari, Ardhi,
Usafiri, SGR, Madini, Gesi, Burudani, Utalii, Teknolojia, Serikali

JINSI YA KUJIBU:
- Zungumza kama rafiki wa karibu wa Dar es Salaam — si ofisini
- Tumia mifano ya Tanzania (TZS, BRELA, TRA, NMB, M-Pesa, Simba, Yanga)
- Jibu kwa ufupi na wazi — usijaze maneno bure
- Kwa invoice/CV — toa mfano kamili
- Ukiulizwa kwa Kiingereza — jibu Kiingereza lakini na ladha ya Tanzania`;

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
        const API_KEY = process.env.ANTHROPIC_API_KEY;
        if (!API_KEY) return res.status(500).json({ error: "ANTHROPIC_API_KEY haipo" });
        const response = await fetch("https://api.anthropic.com/v1/messages", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "x-api-key": API_KEY,
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
            return res.status(response.status).json({ error: err?.error?.message || "API ilikataa" });
        }
        const data = await response.json();
        const reply = data.content?.[0]?.text || "Samahani, sijapata jibu.";
        return res.status(200).json({ reply });
    } catch (err) {
        return res.status(500).json({ error: "Server error: " + err.message });
    }
};
