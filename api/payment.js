// AJPLUS AI — api/payment.js
// Malipo + Notification + Supabase
// © AJ PLUS COMPANY LIMITED | ajplusai.co.tz

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

// Hifadhi malipo
async function savePayment(data) {
    return await supabaseQuery("payments", "POST", data);
}

// Activate user plan
async function activateUser(email, phone, plan) {
    const expires = new Date();
    expires.setMonth(expires.getMonth() + 1);

    // Angalia kama user yupo
    const users = await supabaseQuery("users", "GET", null, `email=eq.${email}`);

    if (users && users.length > 0) {
        await supabaseQuery("users", "PATCH", {
            plan,
            plan_expires_at: expires.toISOString(),
            phone
        }, `email=eq.${email}`);
    } else {
        await supabaseQuery("users", "POST", {
            email,
            phone,
            name: email.split('@')[0],
            plan,
            plan_expires_at: expires.toISOString(),
            questions_today: 0,
            last_question_date: new Date().toISOString().split('T')[0]
        });
    }
}

// ─── HANDLER ──────────────────────────────────────────────
module.exports = async function handler(req, res) {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "POST, GET, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");
    if (req.method === "OPTIONS") return res.status(200).end();

    // ── GET /api/payment?action=confirm&id=xxx ──
    // Admin anapoconfirm malipo
    if (req.method === "GET") {
        const { action, id, email, plan } = req.query || {};

        if (action === "confirm" && id && email && plan) {
            try {
                // Update payment status
                await supabaseQuery("payments", "PATCH", {
                    status: "confirmed",
                    confirmed_at: new Date().toISOString()
                }, `id=eq.${id}`);

                // Activate user
                await activateUser(email, null, plan);

                // Jibu la HTML — mzuri kuona browser
                return res.status(200).send(`
                    <!DOCTYPE html>
                    <html>
                    <head>
                        <meta charset="UTF-8">
                        <title>AJPLUS AI — Malipo Yamethibitishwa</title>
                        <style>
                            body{font-family:'Segoe UI',sans-serif;background:#F7F5F0;display:flex;align-items:center;justify-content:center;min-height:100vh;margin:0}
                            .box{background:#fff;border-radius:20px;padding:40px;text-align:center;max-width:400px;box-shadow:0 4px 20px rgba(0,0,0,.1)}
                            .icon{font-size:4rem;margin-bottom:16px}
                            h1{color:#C9A84C;font-size:1.5rem;margin-bottom:8px}
                            p{color:#888;font-size:.9rem;margin-bottom:20px}
                            .badge{background:#C9A84C;color:#fff;padding:8px 20px;border-radius:50px;font-weight:700;font-size:.9rem}
                            .wa{display:inline-block;background:#25D366;color:#fff;padding:10px 24px;border-radius:50px;text-decoration:none;font-weight:700;margin-top:16px}
                        </style>
                    </head>
                    <body>
                        <div class="box">
                            <div class="icon">✅</div>
                            <h1>Malipo Yamethibitishwa!</h1>
                            <p>Akaunti ya <strong>${email}</strong> imepandishwa hadi <strong>${plan.toUpperCase()}</strong>!</p>
                            <div class="badge">🎉 ${plan.toUpperCase()} — Imeactivate!</div>
                            <br>
                            <a href="https://wa.me/${(email||'').replace('@','').replace('.','')}" class="wa">💬 Mwambie Mteja WhatsApp</a>
                        </div>
                    </body>
                    </html>
                `);
            } catch (err) {
                return res.status(500).send("Kosa: " + err.message);
            }
        }

        return res.status(400).json({ error: "Params zinahitajika: action, id, email, plan" });
    }

    // ── POST /api/payment ── Mtu anatuma ombi la malipo
    if (req.method === "POST") {
        try {
            let body = req.body;
            if (typeof body === "string") {
                try { body = JSON.parse(body); } catch(e) { body = {}; }
            }
            if (!body) body = {};

            const { name, email, phone, plan, amount, method: payMethod } = body;

            if (!name || !email || !plan) {
                return res.status(400).json({ error: "Jina, email, na plan vinahitajika" });
            }

            // Bei za mipango
            const prices = { pro: 15000, business: 30000 };
            const planAmount = amount || prices[plan] || 15000;

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

            // Tengeneza link ya kuthibitisha (admin inatumia)
            const confirmUrl = `https://ajplusai.co.tz/api/payment?action=confirm&id=${paymentId}&email=${encodeURIComponent(email)}&plan=${plan}`;

            // WhatsApp message kwa admin (wewe)
            const adminMsg = `🔔 *AJPLUS AI — Malipo Mapya!*

👤 Jina: ${name}
📧 Email: ${email}
📱 Simu: ${phone || 'Haijatolewa'}
💰 Kiasi: TZS ${planAmount.toLocaleString()}
📦 Plan: ${plan.toUpperCase()}
💳 Njia: ${payMethod || 'Lipa Namba'}
🕐 Wakati: ${new Date().toLocaleString('sw-TZ')}

✅ *Bonyeza hapa kuthibitisha:*
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
                ? `https://wa.me/255${phone.replace(/^0/, '')}?text=${encodeURIComponent(clientMsg)}`
                : null;

            return res.status(200).json({
                success: true,
                paymentId,
                message: "Ombi la malipo limepokewa!",
                adminWhatsApp,
                clientWhatsApp,
                confirmUrl,
                instructions: {
                    lipa_namba: "44934738",
                    yas_tigo: "Tuma kwa Lipa Namba 44934738",
                    mpesa: "Tuma kwa Lipa Namba 44934738",
                    nmb: "23510095544 — AJ PLUS COMPANY LIMITED",
                    amount: `TZS ${planAmount.toLocaleString()}`
                }
            });

        } catch (err) {
            console.error("Payment error:", err);
            return res.status(500).json({ error: "Server error: " + err.message });
        }
    }

    return res.status(405).json({ error: "Method not allowed" });
};
