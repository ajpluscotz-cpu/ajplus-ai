// AJPLUS AI — api/image.js (v3 — Stability AI + Pollinations AI Backup)
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

// ─── TAFSIRI KISWAHILI → KIINGEREZA ──────────────────────
function translatePrompt(prompt) {
    let p = prompt
        .replace(/rafiki/gi, '')
        .replace(/naomba/gi, '')
        .replace(/tafadhali/gi, '')
        .replace(/nitengenezee\s*(picha|poster|logo|design)?/gi, '')
        .replace(/tengeneza\s*(picha|poster|logo|design)?/gi, '')
        .replace(/natengenezea\s*(picha|poster|logo|design)?/gi, '')
        .replace(/generate\s*image/gi, '')
        .replace(/create\s*image/gi, '')
        .trim();

    const translations = [
        [/kanisa/gi,           'church'],
        [/msikiti/gi,          'mosque'],
        [/harusi/gi,           'wedding'],
        [/sherehe/gi,          'celebration'],
        [/ibada/gi,            'worship service'],
        [/maombi/gi,           'prayers'],
        [/uponyaji/gi,         'healing'],
        [/faraja/gi,           'comfort'],
        [/nguvu/gi,            'strength'],
        [/amani/gi,            'peace'],
        [/dar es salaam/gi,    'Dar es Salaam Tanzania'],
        [/zanzibar/gi,         'Zanzibar Tanzania'],
        [/serengeti/gi,        'Serengeti Tanzania'],
        [/kilimanjaro/gi,      'Mount Kilimanjaro Tanzania'],
        [/tanzania/gi,         'Tanzania East Africa'],
        [/afrika/gi,           'Africa'],
        [/mtanzania/gi,        'Tanzanian person'],
        [/mwanamke/gi,         'African woman'],
        [/mwanaume/gi,         'African man'],
        [/mtoto/gi,            'African child'],
        [/familia/gi,          'African family'],
        [/biashara/gi,         'business'],
        [/duka/gi,             'shop store'],
        [/chakula/gi,          'food'],
        [/mazingira/gi,        'landscape scenery'],
        [/wanyama/gi,          'wildlife animals'],
        [/msalaba/gi,          'cross Christian'],
        [/sala/gi,             'prayer'],
        [/injili/gi,           'gospel'],
        [/salasala/gi,         'Salasala Tanzania'],
        [/skansa/gi,           'Skansa Dar es Salaam'],
        [/jerusalem/gi,        'Jerusalem'],
        [/logo/gi,             'logo design'],
        [/poster/gi,           'poster design'],
        [/picha/gi,            'photo image'],
    ];

    translations.forEach(([sw, en]) => {
        p = p.replace(sw, en);
    });

    return p.trim() || prompt.trim();
}

// ─── SUPABASE ─────────────────────────────────────────────
async function supabaseQuery(table, method, data = null, filter = null) {
    if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) return null;
    try {
        let url = `${SUPABASE_URL}/rest/v1/${table}`;
        if (filter) url += `?${filter}`;
        const opts = {
            method,
            headers: {
                'Content-Type': 'application/json',
                'apikey': SUPABASE_SERVICE_KEY,
                'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
                'Prefer': method === 'POST' ? 'return=representation' : ''
            }
        };
        if (data) opts.body = JSON.stringify(data);
        const res = await fetch(url, opts);
        if (res.ok) {
            const text = await res.text();
            return text ? JSON.parse(text) : null;
        }
        return null;
    } catch(e) {
        console.error('Supabase error:', e.message);
        return null;
    }
}

// ─── ANGALIA KIKOMO ───────────────────────────────────────
async function checkImageLimit(email, type = 'image') {
    if (!email || email === 'demo@ajplusai.co.tz') {
        return { allowed: true, plan: 'trial', used: 0, limit: 5, remaining: 5, isDemo: true };
    }

    try {
        const users = await supabaseQuery('users', 'GET', null, `email=eq.${encodeURIComponent(email)}`);
        const user  = users?.[0];

        if (!user) {
            return { allowed: true, plan: 'trial', used: 0, limit: 5, remaining: 5 };
        }

        const plan    = user.plan || 'trial';
        const limits  = IMAGE_PLANS[plan] || IMAGE_PLANS.trial;
        const typeKey = `${type}s`;

        if (!limits || limits[typeKey] === 0) {
            const nextPlan =
                plan === 'trial' || plan === 'free' ? 'Msingi (TZS 30,000/mwezi)' :
                plan === 'msingi'  ? 'Kawaida (TZS 60,000/mwezi)'  :
                plan === 'kawaida' ? 'Pro (TZS 100,000/mwezi)'      :
                                     'Biashara (TZS 250,000/mwezi)';
            return {
                allowed: false, locked: true,
                message: `Mpango wako wa ${plan.toUpperCase()} haujumuishi huduma ya ${type === 'logo' ? 'logo' : type === 'design' ? 'design' : 'picha'}. Panda mpango wa ${nextPlan}!`
            };
        }

        const thisMonth  = new Date().toISOString().substring(0, 7);
        const usageKey   = `${type}_usage_${thisMonth}`;
        const currentUsage = user[usageKey] || 0;
        const limit      = limits[typeKey];

        if (currentUsage >= limit) {
            return {
                allowed: false, locked: true, overLimit: true,
                used: currentUsage, limit,
                extraPrice: EXTRA_PRICES[type],
                message: `${type === 'image' ? 'Picha' : type === 'design' ? 'Design' : 'Logo'} zako za mwezi huu zimeisha! (${currentUsage}/${limit})\n\nLipa TZS ${EXTRA_PRICES[type].toLocaleString()} kwa ziada moja au panda mpango!`,
                whatsapp: `https://wa.me/255762307647?text=Nahitaji+${type}+za+ziada.+Email:+${encodeURIComponent(email)}`
            };
        }

        return { allowed: true, plan, used: currentUsage, limit, remaining: limit - currentUsage };

    } catch(e) {
        console.error('checkImageLimit error:', e.message);
        return { allowed: true, plan: 'trial', used: 0, limit: 5, remaining: 5 };
    }
}

async function incrementImageUsage(email, type) {
    if (!email || email === 'demo@ajplusai.co.tz') return;
    try {
        const thisMonth = new Date().toISOString().substring(0, 7);
        const usageKey  = `${type}_usage_${thisMonth}`;
        const users = await supabaseQuery('users', 'GET', null, `email=eq.${encodeURIComponent(email)}`);
        const user  = users?.[0];
        if (!user) return;
        const current = user[usageKey] || 0;
        await supabaseQuery('users', 'PATCH', { [usageKey]: current + 1 }, `email=eq.${encodeURIComponent(email)}`);
    } catch(e) {
        console.error('incrementImageUsage error:', e.message);
    }
}

// ─── STABILITY AI ─────────────────────────────────────────
async function generateWithStability(prompt, type) {
    if (!STABILITY_KEY) throw new Error('STABILITY_API_KEY haipo');

    const translated = translatePrompt(prompt);
    let enhancedPrompt, negativePrompt;

    negativePrompt = 'blurry, low quality, distorted, ugly, bad anatomy, watermark, text errors, nsfw';

    if (type === 'logo') {
        enhancedPrompt = `professional logo design, ${translated}, vector style, clean minimal branding, white background, high quality corporate identity, Tanzania Africa`;
        negativePrompt += ', photorealistic, complex background, noise, photo';
    } else if (type === 'design') {
        enhancedPrompt = `professional poster design, ${translated}, modern layout, vibrant colors, high resolution, African style, advertising design, Tanzania`;
        negativePrompt += ', amateur, clipart, low resolution';
    } else {
        enhancedPrompt = `${translated}, high quality photography, sharp detailed, natural lighting, professional camera, 8k quality, Tanzania Africa`;
    }

    const form = new FormData();
    form.append('prompt', enhancedPrompt);
    form.append('negative_prompt', negativePrompt);
    form.append('model', 'sd3-medium');
    form.append('output_format', 'jpeg');
    form.append('aspect_ratio', type === 'logo' ? '1:1' : type === 'design' ? '9:16' : '16:9');

    const response = await fetch('https://api.stability.ai/v2beta/stable-image/generate/sd3', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${STABILITY_KEY}`,
            'Accept': 'application/json'
        },
        body: form
    });

    if (!response.ok) {
        const errText = await response.text();
        let errMsg = 'Stability AI ilikataa';
        try { errMsg = JSON.parse(errText)?.message || errMsg; } catch(_) {}
        throw new Error(`Stability (${response.status}): ${errMsg}`);
    }

    const data = await response.json();
    if (!data.image) throw new Error('Picha haikupatikana kutoka Stability AI');

    return { image: `data:image/jpeg;base64,${data.image}`, source: 'stability' };
}

// ─── POLLINATIONS AI (BACKUP — BURE) ─────────────────────
async function generateWithPollinations(prompt, type) {
    const translated = translatePrompt(prompt);

    let enhancedPrompt;
    if (type === 'logo') {
        enhancedPrompt = `professional logo design, ${translated}, vector style, clean minimal, white background, Tanzania Africa, high quality branding`;
    } else if (type === 'design') {
        enhancedPrompt = `professional poster design, ${translated}, modern layout, vibrant colors, Tanzania Africa, high resolution advertising`;
    } else {
        enhancedPrompt = `${translated}, high quality photography, sharp detailed, Tanzania Africa, professional camera, cinematic lighting`;
    }

    const width  = type === 'logo' ? 512  : type === 'design' ? 576  : 1024;
    const height = type === 'logo' ? 512  : type === 'design' ? 1024 : 576;
    const seed   = Math.floor(Math.random() * 999999);

    const url = `https://image.pollinations.ai/prompt/${encodeURIComponent(enhancedPrompt)}?width=${width}&height=${height}&nologo=true&seed=${seed}&enhance=true`;

    // Pollinations inarudisha picha moja kwa moja — fetch na ubadilishe kuwa base64
    const response = await fetch(url);

    if (!response.ok) {
        throw new Error(`Pollinations AI ilikataa (${response.status})`);
    }

    const buffer     = await response.arrayBuffer();
    const base64     = Buffer.from(buffer).toString('base64');
    const contentType = response.headers.get('content-type') || 'image/jpeg';

    return { image: `data:${contentType};base64,${base64}`, source: 'pollinations' };
}

// ─── TENGENEZA PICHA — STABILITY KWANZA, POLLINATIONS BACKUP ──
async function generateImage(prompt, type = 'image') {
    const safePrompt = prompt.replace(/[<>]/g, '').substring(0, 500).trim();

    // Jaribu Stability AI kwanza
    if (STABILITY_KEY) {
        try {
            console.log('Trying Stability AI...');
            const result = await generateWithStability(safePrompt, type);
            console.log('Stability AI: SUCCESS');
            return result;
        } catch(err) {
            console.warn('Stability AI imeshindwa:', err.message, '— Trying Pollinations...');
        }
    }

    // Backup: Pollinations AI (bure)
    try {
        console.log('Trying Pollinations AI...');
        const result = await generateWithPollinations(safePrompt, type);
        console.log('Pollinations AI: SUCCESS');
        return result;
    } catch(err) {
        throw new Error('Huduma zote za picha zimeshindwa: ' + err.message);
    }
}

// ─── HANDLER ──────────────────────────────────────────────
module.exports = async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', 'https://ajplusai.co.tz');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    if (req.method === 'OPTIONS') return res.status(200).end();
    if (req.method !== 'POST')   return res.status(405).json({ error: 'Method not allowed' });

    try {
        let body = req.body;
        if (typeof body === 'string') {
            try { body = JSON.parse(body); } catch(e) { body = {}; }
        }
        if (!body || typeof body !== 'object') body = {};

        const { prompt, type, email } = body;

        const safeType   = ['image','design','logo'].includes(type) ? type : 'image';
        const safeEmail  = typeof email === 'string' ? email.toLowerCase().trim().substring(0, 254) : '';
        const safePrompt = typeof prompt === 'string' ? prompt.substring(0, 500).trim() : '';

        if (!safePrompt) {
            return res.status(400).json({ error: 'Maelezo ya picha yanahitajika — niambie unataka picha ya nini!' });
        }

        // Angalia kikomo
        const limitCheck = await checkImageLimit(safeEmail, safeType);

        if (!limitCheck.allowed) {
            return res.status(429).json({
                error:      limitCheck.message,
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
        console.log(`Generating ${safeType} for ${safeEmail || 'guest'}: "${safePrompt.substring(0, 60)}..."`);
        const result = await generateImage(safePrompt, safeType);

        // Update matumizi
        if (safeEmail) await incrementImageUsage(safeEmail, safeType);

        const remaining = Math.max(0, (limitCheck.remaining || 1) - 1);

        return res.status(200).json({
            success:   true,
            image:     result.image,
            source:    result.source,
            type:      safeType,
            plan:      limitCheck.plan,
            used:      (limitCheck.used || 0) + 1,
            limit:     limitCheck.limit,
            remaining,
            message:   `Picha imekamilika! Umebakiwa na ${remaining} kati ya ${limitCheck.limit} za mwezi huu.`
        });

    } catch(err) {
        console.error('Image generation error:', err.message);
        return res.status(500).json({ error: 'Kosa katika kizazi cha picha: ' + err.message });
    }
};
