// AJPLUS AI — api/image.js (v5 — Nano Banana / Gemini 2.5 Flash Image + Pollinations Backup)
// © AJ PLUS COMPANY LIMITED | ajplusai.co.tz

const SUPABASE_URL         = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;
const GEMINI_KEY           = process.env.GEMINI_API_KEY;

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
        .replace(/nitengenezee\s*(picha|poster|logo|design|tangazo|flyer|banner)?/gi, '')
        .replace(/tengeneza\s*(picha|poster|logo|design|tangazo|flyer|banner)?/gi, '')
        .replace(/natengenezea\s*(picha|poster|logo|design|tangazo|flyer|banner)?/gi, '')
        .replace(/generate\s*image/gi, '')
        .replace(/create\s*image/gi, '')
        .trim();

    const translations = [
        // Matukio
        [/tangazo\s*la\s*harusi/gi,    'elegant wedding announcement poster'],
        [/poster\s*ya\s*harusi/gi,     'beautiful wedding celebration poster'],
        [/tangazo\s*la\s*kanisa/gi,    'church event announcement poster'],
        [/tangazo\s*la\s*biashara/gi,  'professional business advertisement'],
        [/tangazo\s*la\s*sherehe/gi,   'celebration event poster'],
        [/tangazo/gi,                   'announcement poster'],
        [/flyer\s*ya/gi,               'promotional flyer for'],
        [/banner\s*ya/gi,              'banner for'],

        // Dini
        [/kanisa/gi,           'church'],
        [/msikiti/gi,          'mosque'],
        [/ibada/gi,            'worship service'],
        [/maombi\s*na\s*maombezi/gi, 'prayer and intercession event'],
        [/maombi/gi,           'prayer'],
        [/uponyaji/gi,         'healing'],
        [/faraja/gi,           'comfort and peace'],
        [/injili/gi,           'gospel'],
        [/msalaba/gi,          'christian cross'],
        [/sala/gi,             'prayer'],

        // Matukio ya harusi
        [/harusi/gi,           'wedding ceremony'],
        [/arusi/gi,            'wedding'],
        [/sherehe/gi,          'celebration event'],

        // Mazingira ya Tanzania
        [/dar es salaam/gi,    'Dar es Salaam Tanzania'],
        [/salasala/gi,         'Salasala Dar es Salaam'],
        [/skansa/gi,           'Skansa Dar es Salaam'],
        [/tegeta/gi,           'Tegeta Dar es Salaam'],
        [/zanzibar/gi,         'Zanzibar Tanzania'],
        [/serengeti/gi,        'Serengeti Tanzania'],
        [/kilimanjaro/gi,      'Mount Kilimanjaro Tanzania'],
        [/jerusalem/gi,        'Jerusalem'],
        [/tanzania/gi,         'Tanzania East Africa'],
        [/afrika/gi,           'Africa'],

        // Watu
        [/mtanzania/gi,        'Tanzanian person'],
        [/mwanamke/gi,         'African woman'],
        [/mwanaume/gi,         'African man'],
        [/mtoto/gi,            'African child'],
        [/familia/gi,          'African family'],

        // Biashara
        [/biashara/gi,         'business'],
        [/duka/gi,             'shop store'],
        [/kampuni/gi,          'company'],
        [/chakula/gi,          'food'],

        // Asili
        [/mazingira/gi,        'landscape scenery'],
        [/wanyama/gi,          'wildlife animals'],
        [/nguvu/gi,            'strength power'],
        [/amani/gi,            'peace serenity'],

        // Siku
        [/siku\s*ya\s*pili/gi, 'Sunday'],
        [/jumamosi/gi,         'Saturday'],
        [/jumapili/gi,         'Sunday'],

        // Picha/Design
        [/logo/gi,             'professional logo'],
        [/poster/gi,           'poster design'],
        [/picha/gi,            'photo image'],
        [/kisasa/gi,           'modern elegant'],
        [/ya\s*kisasa/gi,      'modern stylish'],
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
                plan === 'trial' || plan === 'free' ? 'Msingi (TZS 5,000/mwezi)' :
                plan === 'msingi'  ? 'Kawaida (TZS 15,000/mwezi)'  :
                plan === 'kawaida' ? 'Pro (TZS 30,000/mwezi)'      :
                                     'Biashara (TZS 75,000/mwezi)';
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

// ─── NANO BANANA (Gemini 2.5 Flash Image) — PRIMARY (BURE) ──
async function generateWithNanoBanana(prompt, type) {
    if (!GEMINI_KEY) throw new Error('GEMINI_API_KEY haipo');

    const translated = translatePrompt(prompt);

    let enhancedPrompt;
    if (type === 'logo') {
        enhancedPrompt = `A clean, modern, minimalist logo design: ${translated}. Bold simple vector style, white background, professional corporate branding feel, Tanzania Africa context. No people, only the logo symbol and clean readable text. Square image.`;
    } else if (type === 'design') {
        enhancedPrompt = `A professional poster/flyer design: ${translated}. Modern vibrant layout with clear, legible, well-spaced text areas, high resolution advertising design, African Tanzanian visual style, decorative borders. Portrait orientation.`;
    } else {
        enhancedPrompt = `A photo: ${translated}. High quality photography, sharp detail, natural lighting, professional camera, realistic, Tanzania Africa context.`;
    }

    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-image:generateContent?key=${GEMINI_KEY}`;

    const body = {
        contents: [{ parts: [{ text: enhancedPrompt }] }],
        generationConfig: { responseModalities: ['IMAGE'] }
    };

    const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
    });

    if (!response.ok) {
        const errText = await response.text();
        let errMsg = 'Nano Banana ilikataa';
        try { errMsg = JSON.parse(errText)?.error?.message || errMsg; } catch(_) {}
        throw new Error(`Nano Banana (${response.status}): ${errMsg}`);
    }

    const data  = await response.json();
    const parts = data?.candidates?.[0]?.content?.parts || [];
    const imgPart = parts.find(p => p.inlineData || p.inline_data);
    const inline  = imgPart?.inlineData || imgPart?.inline_data;

    if (!inline?.data) throw new Error('Picha haikupatikana kutoka Nano Banana');

    const mime = inline.mimeType || inline.mime_type || 'image/png';
    return { image: `data:${mime};base64,${inline.data}`, source: 'nano-banana' };
}

// ─── POLLINATIONS AI (BACKUP — BURE) ─────────────────────
async function generateWithPollinations(prompt, type) {
    const translated = translatePrompt(prompt);

    let enhancedPrompt;
    if (type === 'logo') {
        enhancedPrompt = `professional logo design, ${translated}, vector style, clean minimal, white background, Tanzania Africa, high quality branding, no text errors`;
    } else if (type === 'design') {
        enhancedPrompt = `professional poster design, ${translated}, modern layout, vibrant colors, Tanzania Africa, high resolution, clean typography, no text errors`;
    } else {
        enhancedPrompt = `${translated}, high quality photography, sharp detailed, Tanzania Africa, professional camera, cinematic lighting, 8k`;
    }

    const width  = type === 'logo' ? 512  : type === 'design' ? 576  : 1024;
    const height = type === 'logo' ? 512  : type === 'design' ? 1024 : 576;
    const seed   = Math.floor(Math.random() * 999999);

    const url = `https://image.pollinations.ai/prompt/${encodeURIComponent(enhancedPrompt)}?width=${width}&height=${height}&nologo=true&seed=${seed}&enhance=true&model=flux`;

    const response = await fetch(url);

    if (!response.ok) {
        throw new Error(`Pollinations AI ilikataa (${response.status})`);
    }

    const buffer      = await response.arrayBuffer();
    const base64      = Buffer.from(buffer).toString('base64');
    const contentType = response.headers.get('content-type') || 'image/jpeg';

    return { image: `data:${contentType};base64,${base64}`, source: 'pollinations' };
}

// ─── TENGENEZA PICHA — NANO BANANA KWANZA, POLLINATIONS BACKUP ──
async function generateImage(prompt, type = 'image') {
    const safePrompt = prompt.replace(/[<>]/g, '').substring(0, 500).trim();

    // Jaribu Nano Banana kwanza (bure + ubora mzuri + maandishi bora)
    if (GEMINI_KEY) {
        try {
            console.log('Trying Nano Banana (Gemini 2.5 Flash Image)...');
            const result = await generateWithNanoBanana(safePrompt, type);
            console.log('Nano Banana: SUCCESS');
            return result;
        } catch(err) {
            console.warn('Nano Banana imeshindwa:', err.message, '— Trying Pollinations...');
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
            return res.status(400).json({ error: 'Maelezo ya picha yanahitajika!' });
        }

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

        console.log(`Generating ${safeType} for ${safeEmail || 'guest'}: "${safePrompt.substring(0, 60)}..."`);
        const result = await generateImage(safePrompt, safeType);

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
