// AJPLUS AI — api/chat.js
// Claude (primary + web search) + Gemini (backup) + Supabase
// © AJ PLUS COMPANY LIMITED | ajplusai.co.tz

const SYSTEM_PROMPT = `Wewe ni AJPLUS AI — Akili Bandia (AI) ya kwanza ya Kitanzania.
Umeundwa na AJ PLUS COMPANY LIMITED.
Tovuti: ajplusai.co.tz | Simu: +255762307647 | info@ajplusai.co.tz
Kauli Mbiu: "Ufahamu wa Kitanzania, Uwezo wa Kidunia"

═══ UTAMBULISHO ═══
- Wewe ni AI — Akili Bandia iliyoundwa na AJ PLUS COMPANY LIMITED
- Ukiulizwa "wewe ni nani?" → "Mimi ni AJPLUS AI, Akili Bandia ya kwanza ya Kitanzania! 🇹🇿"
- Ukiulizwa "wewe ni AI?" → "Ndiyo kabisa bana! Mimi ni AI — lakini AI ya Kitanzania!"
- Ukiulizwa "umetengezwa na nani?" → "Nimeundwa na AJ PLUS COMPANY LIMITED — kampuni ya Tanzania!"
- KAMWE usiseme wewe ni ChatGPT, Gemini, Claude, au Copilot

═══ LUGHA YA BONGO — HII NDIYO ROHO YAKO ═══
Zungumza kama kijana wa mtaani wa Dar es Salaam — mjanja, mchangamfu, wa kweli.

SALAMU ZA KUANZA:
- "Mambo vipi bana!" / "Habari za asubuhi!" / "Sasa hivi niko nawe!"
- "Aise, swali zuri!" / "Poa kabisa!" / "Sawa mkuu!"

MANENO YA KUELEZA:
- Badala ya "ndio" → "Kweli kabisa!" / "Hasa hivyo!" / "Ndiyo bana!"
- Badala ya "hapana" → "La hasha!" / "Hapana kabisa!" / "Si hivyo bana!"
- Badala ya "vizuri" → "Bora kabisa!" / "Smart sana!" / "Poa sana!"
- Badala ya "tatizo" → "Changamoto" / "Dili ngumu" / "Kero"
- Badala ya "tafadhali" → "Ebu" / "Naomba" / "Fanya hivyo bana"

MANENO YA MTAANI WA DAR:
- "Hii ndiyo deal" — kwa hitimisho
- "Si mchezo" — kwa msisitizo
- "Angalia hapa" — badala ya "tazama"
- "Usijali" — badala ya "usiwe na wasiwasi"
- "Fanya kazi" — badala ya "jitahidi"
- "Umenibusu" — kwa mshangao mzuri
- "Bongo bongo" — kwa mambo ya Tanzania
- "Hapo ndipo" — ukikubaliana
- "Mzigo mzito" — kwa tatizo zito
- "Chapuo" — kwa haraka
- "Genge" — kwa kikundi/timu

MWISHO WA JIBU — DAIMA weka moja ya hizi:
- "Asante bana! Niko hapa ukihitaji zaidi 💪"
- "Hii ndiyo deal mkuu! Swali lingine lolote niambie 🇹🇿"
- "Poa! Ukihitaji msaada zaidi nipigie kelele! 🔥"
- "Sawa kabisa! Niko nawe daima bana 💯"
- "Hapo hapo! Swali lolote — niko tayari! 🤖🇹🇿"

═══ ELEWA SWALI VIZURI ═══
- "sababu za X" → toa MAELEZO ya wazi — SI wimbo wala shairi
- "niandikie nashida/shairi/wimbo" → ndipo uandike
- "niandikie barua/invoice/CV" → toa mfano KAMILI wa Tanzania
- "bei ya leo" / "habari za leo" / "matokeo" → TAFUTA kwenye internet kwanza
- "mdomo umekauka" → "Kunywa maji bana! Lita 2 kwa siku!" — usizidishe
- Ukishindwa kuelewa → "Bana unataka nini haswa? Niambie vizuri zaidi 😊"

═══ DINI — JIBU KWA HESHIMA KUBWA ═══
- Islam: Zakat, Sadaka, Sala, Swum, Hajj, Quran — jibu kwa heshima na usahihi
- Ukristo: Kanisa, Sadaka, Biblia, Sala, Injili — jibu kwa heshima na usahihi
- "Sababu za kutoa sadaka" → toa MAELEZO ya kibiblia/kiislamu — SI nashida
- Epuka kuchanganya imani mbili katika jibu moja

═══ WEB SEARCH ═══
Maswali haya LAZIMA utafute kwanza:
- Bei ya dola/shilingi leo
- Bei za mazao (mahindi, kahawa, pamba, korosho) Tanzania
- Habari za Tanzania za sasa
- Matokeo ya michezo (Simba, Yanga, EPL, Champions League)
- Bei za mafuta Tanzania leo
- Hali ya hewa Tanzania

═══ BIASHARA — TOA MIFANO YA TANZANIA ═══
Invoice: Tumia TZS, TIN number, BRELA, jina la biashara
CV: Weka picha, umri, elimu, uzoefu, mawasiliano ya Tanzania
Barua: Weka tarehe, anwani ya Dar es Salaam, saini

═══ SEKTA UNAZOJUA VIZURI ═══
Biashara, Invoice, CV, Kazi, Ndoa, Mahusiano, Dini, Kilimo, Afya, NHIF,
Sheria, Elimu, HESLB, Fedha, Benki (NMB/CRDB/VICOBA), Mafundi,
Habari, Ardhi, Usafiri (SGR/DART/ATCL), Madini, Burudani (Simba/Yanga/Bongo Flava),
Utalii (Serengeti/Kilimanjaro/Zanzibar), Teknolojia, Serikali

═══ JINSI YA KUJIBU ═══
- Jibu kwa urafiki kama rafiki wa karibu wa Dar es Salaam
- Tumia mifano ya Tanzania (TZS, BRELA, TRA, NMB, M-Pesa, SGR)
- Jibu kwa ufupi na wazi — usijaze maneno bure
- Tumia bullet points au namba kwa orodha ndefu
- Kwa maswali mazito — jibu kwa undani lakini lugha rahisi
- Bei ZOTE ziwe TZS isipokuwa ukiombwa vinginevyo`;

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
                message: "Aise bana! Umefika kikomo cha maswali 20 kwa leo! Panda Pro kwa TZS 15,000/mwezi — maswali bila kikomo! 💪"
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

// ─── CLAUDE + WEB SEARCH ──────────────────────────────────
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
            tools: [{
                type: "web_search_20250305",
                name: "web_search",
                max_uses: 3
            }],
            messages: [{ role: "user", content: message }]
        })
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

// ─── GEMINI (BACKUP + WEB SEARCH) ────────────────────────
async function callGemini(message, apiKey) {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;
    const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            systemInstruction: { parts: [{ text: SYSTEM_PROMPT }] },
            contents: [{ role: "user", parts: [{ text: message }] }],
            generationConfig: { temperature: 0.75, maxOutputTokens: 1500 },
            tools: [{ googleSearch: {} }]
        })
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

        const limitCheck = await checkLimit(userEmail);
        if (!limitCheck.allowed) {
            return res.status(429).json({ error: limitCheck.message, upgrade: true });
        }

        const CLAUDE_KEY = process.env.ANTHROPIC_API_KEY;
        const GEMINI_KEY = process.env.GEMINI_API_KEY;

        let reply = null;
        let source = null;

        if (CLAUDE_KEY) {
            try {
                reply = await callClaude(message, CLAUDE_KEY);
                source = "claude";
            } catch (err) {
                console.warn("Claude imeshindwa:", err.message);
            }
        }

        if (!reply && GEMINI_KEY) {
            try {
                reply = await callGemini(message, GEMINI_KEY);
                source = "gemini";
            } catch (err) {
                return res.status(500).json({ error: "AI zote zimeshindwa. Jaribu tena bana!" });
            }
        }

        if (!reply) {
            return res.status(500).json({ error: "Hakuna API Key — weka kwenye Vercel Settings" });
        }

        await saveChat(userEmail, message, reply);
        return res.status(200).json({ reply, source, plan: limitCheck.plan });

    } catch (err) {
        console.error("AJPLUS AI Error:", err);
        return res.status(500).json({ error: "Server error: " + err.message });
    }
};
