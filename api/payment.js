// AJPLUS AI — api/payment.js
// Malipo + Notification + Supabase
// © AJ PLUS COMPANY LIMITED | ajplusai.co.tz
//
// USALAMA (Nov 2026):
//  - Kuthibitisha malipo (kupandisha mpango) sasa kunahitaji ADMIN_SECRET.
//    Kiungo cha kuthibitisha kinafungua fomu; admin anaweka ADMIN_SECRET kisha anabonyeza "Thibitisha".
//  - Email na mpango vinachukuliwa kutoka kwenye rekodi ya malipo kwenye database,
//    si kutoka kwenye URL (hivyo haviwezi kubadilishwa na mtu yeyote).
//  - Maandishi yote yanayoonyeshwa kwenye HTML yanasafishwa (escape) kuzuia XSS.

const { ALLOWED_PLANS, isAdmin, escapeHtml, isValidEmail } = require('./_lib/security');

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;

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
                "Prefer": (method === "POST" || method === "PATCH") ? "return=representation" : ""
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

// Hifadhi malipo
async function savePayment(data) {
    return await supabaseQuery("payments", "POST", data);
}

// Activate user plan
async function activateUser(email, phone, plan) {
    const expires = new Date();
    expires.setMonth(expires.getMonth() + 1);
    const enc = encodeURIComponent(email);

    // Angalia kama user yupo
    const users = await supabaseQuery("users", "GET", null, `email=eq.${enc}`);

    if (users && users.length > 0) {
        const patch = { plan, plan_expires_at: expires.toISOString() };
        if (phone) patch.phone = phone;
        await supabaseQuery("users", "PATCH", patch, `email=eq.${enc}`);
    } else {
        await supabaseQuery("users", "POST", {
            email,
            phone: phone || null,
            name: email.split('@')[0],
            plan,
            plan_expires_at: expires.toISOString(),
            questions_today: 0,
            last_question_date: new Date().toISOString().split('T')[0]
        });
    }
}

// id ya malipo: namba au UUID tu
function safeId(id) {
    const s = String(id || '').trim();
    return /^[0-9a-fA-F-]{1,40}$/.test(s) ? s : null;
}

async function getPayment(id) {
    const rows = await supabaseQuery("payments", "GET", null, `id=eq.${encodeURIComponent(id)}&select=*`);
    return rows && rows[0] ? rows[0] : null;
}

// Zuia kubahatisha ADMIN_SECRET (kwa kila instance ya seva)
const failMap = new Map();
function tooManyFails(ip) {
    const r = failMap.get(ip);
    return r && r.count >= 5 && Date.now() - r.start < 15 * 60 * 1000;
}
function recordFail(ip) {
    const now = Date.now();
    const r = failMap.get(ip);
    if (!r || now - r.start > 15 * 60 * 1000) failMap.set(ip, { count: 1, start: now });
    else r.count++;
}
function clientIp(req) {
    return (req.headers['x-forwarded-for'] || '').split(',')[0].trim() || req.socket?.remoteAddress || 'unknown';
}

function page(title, inner) {
    return `<!DOCTYPE html>
<html lang="sw">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="robots" content="noindex,nofollow">
<title>${escapeHtml(title)}</title>
<style>
body{font-family:'Segoe UI',sans-serif;background:#F7F5F0;display:flex;align-items:center;justify-content:center;min-height:100vh;margin:0;padding:16px;box-sizing:border-box}
.box{background:#fff;border-radius:20px;padding:32px;text-align:center;max-width:420px;width:100%;box-shadow:0 4px 20px rgba(0,0,0,.1)}
.icon{font-size:3.5rem;margin-bottom:12px}
h1{color:#C9A84C;font-size:1.4rem;margin:0 0 8px}
p{color:#666;font-size:.92rem;margin:0 0 16px}
table{width:100%;text-align:left;font-size:.9rem;margin:0 0 16px;border-collapse:collapse}
td{padding:6px 4px;border-bottom:1px solid #eee}
input{width:100%;padding:12px;border:1px solid #ddd;border-radius:10px;font-size:1rem;box-sizing:border-box;margin-bottom:12px}
button{background:#C9A84C;color:#fff;border:0;padding:12px 24px;border-radius:50px;font-weight:700;font-size:1rem;cursor:pointer;width:100%}
.badge{background:#C9A84C;color:#fff;padding:8px 20px;border-radius:50px;font-weight:700;font-size:.9rem;display:inline-block}
</style>
</head>
<body><div class="box">${inner}</div></body>
</html>`;
}

function sendHtml(res, status, html) {
    res.setHeader("Content-Type", "text/html; charset=utf-8");
    res.setHeader("X-Frame-Options", "DENY");
    res.setHeader("X-Content-Type-Options", "nosniff");
    res.setHeader("Referrer-Policy", "no-referrer");
    res.setHeader("Cache-Control", "no-store");
    return res.status(status).send(html);
}

function paymentTable(p) {
    return `<table>
<tr><td>Email</td><td><strong>${escapeHtml(p.user_email)}</strong></td></tr>
<tr><td>Simu</td><td>${escapeHtml(p.user_phone || '—')}</td></tr>
<tr><td>Mpango</td><td><strong>${escapeHtml(String(p.plan || '').toUpperCase())}</strong></td></tr>
<tr><td>Kiasi</td><td>TZS ${escapeHtml(Number(p.amount || 0).toLocaleString())}</td></tr>
<tr><td>Hali</td><td>${escapeHtml(p.status)}</td></tr>
</table>`;
}

// ─── HANDLER ──────────────────────────────────────────────
module.exports = async function handler(req, res) {
    res.setHeader("Access-Control-Allow-Origin", "https://ajplusai.co.tz");
    res.setHeader("Access-Control-Allow-Methods", "POST, GET, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");
    if (req.method === "OPTIONS") return res.status(200).end();

    let body = req.body;
    if (typeof body === "string") {
        try { body = JSON.parse(body); } catch (e) { body = {}; }
    }
    if (!body) body = {};

    // ── GET /api/payment?action=confirm&id=xxx ──
    // Inaonyesha fomu ya admin tu. HAIBADILISHI kitu chochote.
    if (req.method === "GET") {
        const { action } = req.query || {};
        const id = safeId((req.query || {}).id);
        if (action !== "confirm" || !id) {
            return res.status(400).json({ error: "Params zinahitajika: action=confirm, id" });
        }
        const p = await getPayment(id);
        if (!p) return sendHtml(res, 404, page("Haipatikani", `<div class="icon">❓</div><h1>Malipo hayapatikani</h1>`));

        if (p.status === "confirmed") {
            return sendHtml(res, 200, page("Tayari", `<div class="icon">✅</div><h1>Tayari yamethibitishwa</h1>${paymentTable(p)}`));
        }

        return sendHtml(res, 200, page("Thibitisha Malipo", `
<div class="icon">🔐</div>
<h1>Thibitisha Malipo</h1>
<p>Hakikisha umepokea pesa kwanza. Kisha weka ufunguo wa admin.</p>
${paymentTable(p)}
<form method="POST" action="/api/payment" autocomplete="off">
<input type="hidden" name="action" value="confirm">
<input type="hidden" name="id" value="${escapeHtml(id)}">
<input type="password" name="admin_key" placeholder="ADMIN_SECRET" required autocomplete="current-password">
<button type="submit">✅ Thibitisha na Fungua Mpango</button>
</form>`));
    }

    if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

    // ── POST action=confirm ── Admin anathibitisha (inahitaji ADMIN_SECRET)
    if (body.action === "confirm") {
        const ip = clientIp(req);
        if (tooManyFails(ip)) {
            return sendHtml(res, 429, page("Subiri", `<div class="icon">⏳</div><h1>Majaribio mengi mno</h1><p>Subiri dakika 15 kisha jaribu tena.</p>`));
        }
        if (!isAdmin(body.admin_key || req.headers['x-admin-secret'])) {
            recordFail(ip);
            console.warn("[security] payment confirm: ufunguo wa admin si sahihi", { ip });
            return sendHtml(res, 401, page("Hairuhusiwi", `<div class="icon">⛔</div><h1>Ufunguo si sahihi</h1><p>Rudi nyuma ujaribu tena.</p>`));
        }

        const id = safeId(body.id);
        const p = id ? await getPayment(id) : null;
        if (!p) return sendHtml(res, 404, page("Haipatikani", `<div class="icon">❓</div><h1>Malipo hayapatikani</h1>`));

        const plan = String(p.plan || "").toLowerCase();
        if (!ALLOWED_PLANS.includes(plan) || !isValidEmail(p.user_email)) {
            return sendHtml(res, 400, page("Kosa", `<div class="icon">⚠️</div><h1>Rekodi ya malipo si sahihi</h1>`));
        }
        if (p.status === "confirmed") {
            return sendHtml(res, 200, page("Tayari", `<div class="icon">✅</div><h1>Tayari yamethibitishwa</h1>${paymentTable(p)}`));
        }

        try {
            await supabaseQuery("payments", "PATCH", {
                status: "confirmed",
                confirmed_at: new Date().toISOString()
            }, `id=eq.${encodeURIComponent(id)}`);
            await activateUser(p.user_email, p.user_phone, plan);
            console.log("[audit] payment confirmed", { id, plan, ip });
        } catch (err) {
            console.error("Confirm error:", err && err.message);
            return sendHtml(res, 500, page("Kosa", `<div class="icon">⚠️</div><h1>Imeshindwa</h1><p>Jaribu tena.</p>`));
        }

        const waDigits = String(p.user_phone || "").replace(/\D/g, "").replace(/^0/, "255");
        const waLink = waDigits ? `<br><a href="https://wa.me/${escapeHtml(waDigits)}" style="display:inline-block;background:#25D366;color:#fff;padding:10px 24px;border-radius:50px;text-decoration:none;font-weight:700;margin-top:16px">💬 Mwambie Mteja WhatsApp</a>` : "";

        return sendHtml(res, 200, page("Malipo Yamethibitishwa", `
<div class="icon">✅</div>
<h1>Malipo Yamethibitishwa!</h1>
<p>Akaunti ya <strong>${escapeHtml(p.user_email)}</strong> imepandishwa hadi <strong>${escapeHtml(plan.toUpperCase())}</strong>.</p>
<div class="badge">🎉 ${escapeHtml(plan.toUpperCase())} — Imeactivate!</div>${waLink}`));
    }

    // ── POST /api/payment ── Mtu anatuma ombi la malipo
    try {
        const name  = typeof body.name  === "string" ? body.name.trim().slice(0, 80)  : "";
        const email = typeof body.email === "string" ? body.email.trim().toLowerCase().slice(0, 254) : "";
        const phone = typeof body.phone === "string" ? body.phone.replace(/[^\d+]/g, "").slice(0, 16) : "";
        const plan  = typeof body.plan  === "string" ? body.plan.trim().toLowerCase() : "";
        const payMethod = typeof body.method === "string" ? body.method.slice(0, 30) : "";

        if (!name || !email || !plan) {
            return res.status(400).json({ error: "Jina, email, na plan vinahitajika" });
        }
        if (!isValidEmail(email)) return res.status(400).json({ error: "Email si sahihi" });
        if (!ALLOWED_PLANS.includes(plan) || plan === "trial" || plan === "free") {
            return res.status(400).json({ error: "Mpango haujulikani" });
        }

        // Bei za mipango (kiasi kinachotumwa na mteja ni cha taarifa tu — admin huthibitisha risiti)
        const prices = { pro: 15000, business: 30000 };
        const clientAmount = Number(body.amount);
        const planAmount = prices[plan] || (Number.isFinite(clientAmount) && clientAmount > 0 && clientAmount <= 10000000 ? Math.round(clientAmount) : 15000);

        // Hifadhi ombi la malipo
        const payment = await savePayment({
            user_email: email,
            user_phone: phone || null,
            amount: planAmount,
            plan,
            status: "pending",
            payment_method: payMethod || "lipa_namba",
            transaction_id: null
        });

        const paymentId = payment?.[0]?.id || "unknown";

        // Kiungo cha kuthibitisha (kinahitaji ADMIN_SECRET kufanya kazi)
        const confirmUrl = `https://ajplusai.co.tz/api/payment?action=confirm&id=${encodeURIComponent(paymentId)}`;

        // WhatsApp message kwa admin (wewe)
        const adminMsg = `🔔 *AJPLUS AI — Malipo Mapya!*

👤 Jina: ${name}
📧 Email: ${email}
📱 Simu: ${phone || 'Haijatolewa'}
💰 Kiasi: TZS ${planAmount.toLocaleString()}
📦 Plan: ${plan.toUpperCase()}
💳 Njia: ${payMethod || 'Lipa Namba'}
🕐 Wakati: ${new Date().toLocaleString('sw-TZ')}

✅ *Thibitisha (baada ya kuona pesa):*
${confirmUrl}`;

        // WhatsApp link kwa admin
        const adminWhatsApp = `https://wa.me/255762307647?text=${encodeURIComponent(adminMsg)}`;

        // WhatsApp message kwa mteja
        const clientMsg = `Habari ${name}! 🇹🇿

Asante kwa kuchagua *AJPLUS AI ${plan.toUpperCase()}*!

Tumepokea ombi lako la malipo.

💳 *Lipa hapa:*
📱 Yas/Tigo: *0624-xxxxxx* au Lipa Namba *44934738*
📱 M-Pesa/Airtel: *44934738*
🏦 NMB: *23510095544*
Jina: *AJ PLUS COMPANY LIMITED*
Kiasi: *TZS ${planAmount.toLocaleString()}*

📸 Tuma risiti yako hapa baada ya kulipa.
⏱️ Utaactivatiwa ndani ya dakika 30!

— *AJPLUS AI Team* 🤖`;

        const clientWhatsApp = phone
            ? `https://wa.me/255${phone.replace(/^\+?255/, '').replace(/^0/, '')}?text=${encodeURIComponent(clientMsg)}`
            : null;

        return res.status(200).json({
            success: true,
            paymentId,
            message: "Ombi la malipo limepokewa!",
            adminWhatsApp,
            clientWhatsApp,
            instructions: {
                lipa_namba: "44934738",
                yas_tigo: "Tuma kwa Lipa Namba 44934738",
                mpesa: "Tuma kwa Lipa Namba 44934738",
                nmb: "23510095544 — AJ PLUS COMPANY LIMITED",
                amount: `TZS ${planAmount.toLocaleString()}`
            }
        });

    } catch (err) {
        console.error("Payment error:", err && err.message);
        return res.status(500).json({ error: "Kosa la seva. Tafadhali jaribu tena." });
    }
};
