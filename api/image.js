// AJPLUS AI — api/image.js
// Stability AI — Kizazi cha Picha
// © AJ PLUS COMPANY LIMITED | ajplusai.co.tz

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;
const STABILITY_KEY = process.env.STABILITY_API_KEY;

// ─── MIPANGO NA VIKOMO ────────────────────────────────────
const IMAGE_PLANS = {
    free:      { images: 0,   designs: 0,   logos: 0 },
    msingi:    { images: 0,   designs: 0,   logos: 0 },
    kawaida:   { images: 10,  designs: 5,   logos: 0 },
    pro:       { images: 50,  designs: 20,  logos: 5 },
    biashara:  { images: 50,  designs: 20,  logos: 5 },
    reseller:  { images: 50,  designs: 20,  logos: 5 }
};

// Bei ya ziada (TZS) — reseller anatozwa
const EXTRA_PRICES = {
    image:  500,   // TZS 500 kwa picha moja ya ziada
    design: 1000,  // TZS 1,000 kwa design moja ya ziada
    logo:   2000   // TZS 2,000 kwa logo moja ya ziada
};

// ─── SUPABASE ─────────────────────────────────────────────
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

// Angalia matumizi ya picha za mtumiaji
async function checkImageLimit(email, type = 'image') {
    if (!email) return { allowed: false, message: "Tafadhali ingia kwanza!" };

    try {
        const users = await supabaseQuery("users", "GET", null, `email=eq.${encodeURIComponent(email)}`);
        const user = users?.[0];
        if (!user) return { allowed: false, message: "Akaunti haipatikani!" };

        const plan = user.plan || 'free';
        const limits = IMAGE_PLANS[plan];

        if (!limits || limits[`${type}s`] === 0) {
            return {
                allowed: false,
                locked: true,
                message: `Mpango wako wa ${plan.toUpperCase()} haujumuishi huduma ya ${type === 'image' ? 'picha' : type === 'design' ? 'design' : 'logo'}. Panda mpango wako! 🔒`
            };
        }

        // Angalia matumizi ya mwezi huu
        const thisMonth = new Date().toISOString().substring(0, 7); // "2025-01"
        const usageKey = `${type}_usage_${thisMonth}`;
        const currentUsage = user[usageKey] || 0;
        const limit = limits[`${type}s`];

        if (currentUsage >= limit) {
            // Imefika kikomo — funga na toa ujumbe
            const extraPrice = EXTRA_PRICES[type];
            return {
                allowed: false,
                locked: true,
                overLimit: true,
                used: currentUsage,
                limit: limit,
                extraPrice: extraPrice,
                message: `🔒 ${type === 'image' ? 'Picha' : type === 'design' ? 'Design' : 'Logo'} zako za mwezi huu zimeisha! (${currentUsage}/${limit})\n\nLipa TZS ${extraPrice.toLocaleString()} kwa ${type} moja ya ziada, au panda mpango wako.`,
                whatsapp: `https://wa.me/255762307647?text=Habari!+Ninahitaji+${type}+za+ziada.+Email:+${encodeURIComponent(email)}`
            };
        }

        return {
            allowed: true,
            plan,
            used: currentUsage,
            limit: limit,
            remaining: limit - currentUsage
        };

    } catch(e) {
        console.error("checkImageLimit error:", e.message);
        return { allowed: true, plan: 'free' };
    }
}

// Update matumizi baada ya kizazi
async function incrementImageUsage(email, type) {
    try {
        const thisMonth = new Date().toISOString().substring(0, 7);
        const usageKey = `${type}_usage_${thisMonth}`;

        const users = await supabaseQuery("users", "GET", null, `email=eq.${encodeURIComponent(email)}`);
        const user = users?.[0];
        if (!user) return;

        const current = user[usageKey] || 0;
        await supabaseQuery("users", "PATCH", {
            [usageKey]: current + 1
        }, `email=eq.${encodeURIComponent(email)}`);
    } catch(e) {
        console.error("incrementImageUsage error:", e.message);
    }
}

// ─── STABILITY AI — Kizazi cha Picha ─────────────────────
async function generateImage(prompt, type = 'image') {

    // Boresha prompt kulingana na aina
    let enhancedPrompt = prompt;
    let negativePrompt = "blurry, low quality, distorted, ugly, bad anatomy, watermark, text errors";

    if (type === 'logo') {
        enhancedPrompt = `professional logo design, ${prompt}, clean, minimal, vector style, white background, high quality branding`;
        negativePrompt += ", photorealistic, complex background, noise";
    } else if (type === 'design') {
        enhancedPrompt = `professional poster design, ${prompt}, modern layout, vibrant colors, high resolution, Tanzania style`;
        negativePrompt += ", amateur, clipart";
    } else {
        enhancedPrompt = `${prompt}, high quality, professional photography, sharp, detailed`;
    }

    // Stability AI — SD3 Medium (nafuu na nzuri)
    const response = await fetch("https://api.stability.ai/v2beta/stable-image/generate/sd3", {
        method: "POST",
        headers: {
            "Authorization": `Bearer ${STABILITY_KEY}`,
            "Accept": "application/json"
        },
        body: (() => {
            const form = new FormData();
            form.append("prompt", enhancedPrompt);
            form.append("negative_prompt", negativePrompt);
            form.append("model", "sd3-medium");
            form.append("output_format", "jpeg");
            form.append("aspect_ratio", type === 'logo' ? "1:1" : type === 'design' ? "9:16" : "16:9");
            return form;
        })()
    });

    if (!response.ok) {
        const err = await response.json();
        throw new Error(err?.message || err?.errors?.[0] || "Stability AI ilikataa");
    }

    const data = await response.json();
    if (!data.image) throw new Error("Picha haikupatikana");

    return `data:image/jpeg;base64,${data.image}`;
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

        const { prompt, type = 'image', email } = body;

        if (!prompt) return res.status(400).json({ error: "Maelezo ya picha yanahitajika" });
        if (!STABILITY_KEY) return res.status(500).json({ error: "STABILITY_API_KEY haipo kwenye Vercel Settings" });

        // Angalia kikomo
        const limitCheck = await checkImageLimit(email, type);

        if (!limitCheck.allowed) {
            return res.status(429).json({
                error: limitCheck.message,
                locked: limitCheck.locked || false,
                overLimit: limitCheck.overLimit || false,
                used: limitCheck.used,
                limit: limitCheck.limit,
                extraPrice: limitCheck.extraPrice,
                whatsapp: limitCheck.whatsapp,
                upgrade: true
            });
        }

        // Tengeneza picha
        const imageBase64 = await generateImage(prompt, type);

        // Update matumizi
        if (email) await incrementImageUsage(email, type);

        return res.status(200).json({
            success: true,
            image: imageBase64,
            type,
            plan: limitCheck.plan,
            used: (limitCheck.used || 0) + 1,
            limit: limitCheck.limit,
            remaining: (limitCheck.remaining || 1) - 1
        });

    } catch (err) {
        console.error("Image generation error:", err.message);
        return res.status(500).json({ error: "Kosa katika kizazi cha picha: " + err.message });
    }
};
