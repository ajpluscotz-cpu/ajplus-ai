// AJPLUS AI — api/image.js (v2 — IMEBORESHWA)
// Stability AI — Kizazi cha Picha
// © AJ PLUS COMPANY LIMITED | ajplusai.co.tz

const SUPABASE_URL      = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;
const STABILITY_KEY     = process.env.STABILITY_API_KEY;

// ─── MIPANGO NA VIKOMO ────────────────────────────────────
const IMAGE_PLANS = {
    trial:    { images: 5,   designs: 2,   logos: 0  },
    free:     { images: 0,   designs: 0,   logos: 0  },
    msingi:   { images: 20,  designs: 10,  logos: 0  },
    kawaida:  { images: 50,  designs: 25,  logos: 2  },
    pro:      { images: 100, designs: 50,  logos: 5  },
    biashara: { images: 300, designs: 100, logos: 20 },
    reseller: { images: 300, designs: 100, logos: 20 }
};

const EXTRA_PRICES = { image: 500, design: 1000, logo: 2000 };

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

// ─── ANGALIA KIKOMO ───────────────────────────────────────
async function checkImageLimit(email, type = 'image') {

    // 🔒 FIX: Demo/Guest wanapata trial ndogo bila Supabase
    const DEMO_EMAILS = ['demo@ajplusai.co.tz', '', null, undefined];
    if (!email || DEMO_EMAILS.includes(email)) {
        return {
            allowed: true,
            plan: 'trial',
            used: 0,
            limit: 5,
            remaining: 5,
            isDemo: true
        };
    }

    try {
        const users = await supabaseQuery(
            "users", "GET", null,
            `email=eq.${encodeURIComponent(email)}`
        );
        const user = users?.[0];

        // 🔒 FIX: Kama mtumiaji hayupo Supabase — mpe trial
        if (!user) {
            console.log(`User not found in DB: ${email} — giving trial access`);
            return {
                allowed: true,
                plan: 'trial',
                used: 0,
                limit: 5,
                remaining: 5
            };
        }

        const plan   = user.plan || 'trial';
        const limits = IMAGE_PLANS[plan] || IMAGE_PLANS.trial;
        const typeKey = `${type}s`; // images, designs, logos

        // Angalia kama mpango unajumuisha aina hii
        if (!limits || limits[typeKey] === 0) {
            const nextPlan =
                plan === 'trial' || plan === 'free' ? 'Msingi (TZS 30,000/mwezi)' :
                plan === 'msingi'  ? 'Kawaida (TZS 60,000/mwezi)' :
                plan === 'kawaida' ? 'Pro (TZS 100,000/mwezi)'    :
                                     'Biashara (TZS 250,000/mwezi)';
            return {
                allowed: false,
                locked: true,
                message: `Mpango wako wa ${plan.toUpperCase()} haujumuishi huduma ya ${type === 'logo' ? 'logo' : type === 'design' ? 'design' : 'picha'}. Panda mpango wa ${nextPlan}!`
            };
        }

        // Angalia matumizi ya mwezi huu
        const thisMonth = new Date().toISOString().substring(0, 7);
        const usageKey  = `${type}_usage_${thisMonth}`;
        const currentUsage = user[usageKey] || 0;
        const limit = limits[typeKey];

        if (currentUsage >= limit) {
            return {
                allowed: false,
                locked: true,
                overLimit: true,
                used: currentUsage,
                limit,
                extraPrice: EXTRA_PRICES[type],
                message: `${type === 'image' ? 'Picha' : type === 'design' ? 'Design' : 'Logo'} zako za mwezi huu zimeisha! (${currentUsage}/${limit})\n\nLipa TZS ${EXTRA_PRICES[type].toLocaleString()} kwa ziada moja au panda mpango!`,
                whatsapp: `https://wa.me/255762307647?text=Nahitaji+${type}+za+ziada.+Email:+${encodeURIComponent(email)}`
            };
        }

        return {
            allowed: true,
            plan,
            used: currentUsage,
            limit,
            remaining: limit - currentUsage
        };

    } catch(e) {
        console.error("checkImageLimit error:", e.message);
        // 🔒 FIX: Kama kuna kosa la DB — ruhusu bila kuzuia
        return { allowed: true, plan: 'trial', used: 0, limit: 5, remaining: 5 };
    }
}

// Update matumizi baada ya kizazi
async function incrementImageUsage(email, type) {
    if (!email || email === 'demo@ajplusai.co.tz') return;
    try {
        const thisMonth = new Date().toISOString().substring(0, 7);
        const usageKey  = `${type}_usage_${thisMonth}`;
        const users = await supabaseQuery(
            "users", "GET", null,
            `email=eq.${encodeURIComponent(email)}`
        );
        const user = users?.[0];
        if (!user) return;
        const current = user[usageKey] || 0;
        await supabaseQuery("users", "PATCH",
            { [usageKey]: current + 1 },
            `email=eq.${encodeURIComponent(email)}`
        );
    } catch(e) {
        console.error("incrementImageUsage error:", e.message);
    }
}

// ─── STABILITY AI ─────────────────────────────────────────
async function generateImage(prompt, type = 'image') {

    // 🔒 Safisha prompt
    const safePrompt = prompt
        .replace(/[<>]/g, '')
        .substring(0, 500)
        .trim();

    let enhancedPrompt = safePrompt;
    let negativePrompt = "blurry, low quality, distorted, ugly, bad anatomy, watermark, text errors";

    if (type === 'logo') {
        enhancedPrompt = `professional logo design, ${safePrompt}, clean, minimal, vector style, white background, high quality branding, Tanzania Africa`;
        negativePrompt += ", photorealistic, complex background, noise";
    } else if (type === 'design') {
        enhancedPrompt = `professional poster design, ${safePrompt}, modern layout, vibrant colors, high resolution, Tanzania Africa style`;
        negativePrompt += ", amateur, clipart";
    } else {
        enhancedPrompt = `${safePrompt}, high quality, professional photography, sharp, detailed, Tanzania Africa`;
    }

    const form = new FormData();
    form.append("prompt", enhancedPrompt);
    form.append("negative_prompt", negativePrompt);
    form.append("model", "sd3-medium");
    form.append("output_format", "jpeg");
    form.append("aspect_ratio",
        type === 'logo'   ? "1:1"  :
        type === 'design' ? "9:16" : "16:9"
    );

    const response = await fetch(
        "https://api.stability.ai/v2beta/stable-image/generate/sd3",
        {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${STABILITY_KEY}`,
                "Accept": "application/json"
            },
            body: form
        }
    );

    if (!response.ok) {
        const errText = await response.text();
        let errMsg = "Stability AI ilikataa";
        try {
            const errJson = JSON.parse(errText);
            errMsg = errJson?.message || errJson?.errors?.[0] || errMsg;
        } catch(_) {}
        console.error("Stability AI error:", response.status, errMsg);
        throw new Error(`Stability AI (${response.status}): ${errMsg}`);
    }

    const data = await response.json();
    if (!data.image) throw new Error("Picha haikupatikana kwenye jibu");

    return `data:image/jpeg;base64,${data.image}`;
}

// ─── HANDLER ──────────────────────────────────────────────
module.exports = async function handler(req, res) {
    // CORS
    res.setHeader("Access-Control-Allow-Origin", "https://ajplusai.co.tz");
    res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");
    if (req.method === "OPTIONS") return res.status(200).end();
    if (req.method !== "POST")   return res.status(405).json({ error: "Method not allowed" });

    try {
        let body = req.body;
        if (typeof body === "string") {
            try { body = JSON.parse(body); } catch(e) { body = {}; }
        }
        if (!body || typeof body !== 'object') body = {};

        const { prompt, type, email } = body;

        // 🔒 Thibitisha maingizo
        const safeType  = ['image','design','logo'].includes(type) ? type : 'image';
        const safeEmail = typeof email === 'string' ? email.toLowerCase().trim().substring(0, 254) : '';
        const safePrompt = typeof prompt === 'string' ? prompt.substring(0, 500).trim() : '';

        if (!safePrompt) {
            return res.status(400).json({
                error: "Maelezo ya picha yanahitajika — niambie unataka picha ya nini!"
            });
        }
        if (!STABILITY_KEY) {
            return res.status(500).json({
                error: "STABILITY_API_KEY haipo kwenye Vercel Environment Variables"
            });
        }

        // Angalia kikomo
        const limitCheck = await checkImageLimit(safeEmail, safeType);

        if (!limitCheck.allowed) {
            return res.status(429).json({
                error: limitCheck.message,
                locked:     limitCheck.locked     || false,
                overLimit:  limitCheck.overLimit  || false,
                used:       limitCheck.used,
                limit:      limitCheck.limit,
                extraPrice: limitCheck.extraPrice,
                whatsapp:   limitCheck.whatsapp,
                upgrade:    true
            });
        }

        // Tengeneza picha
        console.log(`Generating ${safeType} for ${safeEmail || 'guest'}: ${safePrompt.substring(0, 50)}...`);
        const imageBase64 = await generateImage(safePrompt, safeType);

        // Update matumizi
        if (safeEmail) await incrementImageUsage(safeEmail, safeType);

        const remaining = Math.max(0, (limitCheck.remaining || 1) - 1);

        return res.status(200).json({
            success:   true,
            image:     imageBase64,
            type:      safeType,
            plan:      limitCheck.plan,
            used:      (limitCheck.used || 0) + 1,
            limit:     limitCheck.limit,
            remaining,
            message:   `Picha imekamilika! Umebakiwa na ${remaining} kati ya ${limitCheck.limit} za mwezi huu.`
        });

    } catch (err) {
        console.error("Image generation error:", err.message);
        return res.status(500).json({
            error: "Kosa katika kizazi cha picha: " + err.message
        });
    }
};
