// AJPLUS AI — api/auth.js
// Supabase Auth — Usajili, Kuingia, Kubadilisha Nywila
// © AJ PLUS COMPANY LIMITED | ajplusai.co.tz

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;

// ─── SUPABASE AUTH HELPER ─────────────────────────────────
async function supabaseAuth(endpoint, body, token = null) {
    const url = `${SUPABASE_URL}/auth/v1/${endpoint}`;
    const headers = {
        "Content-Type": "application/json",
        "apikey": SUPABASE_ANON_KEY
    };
    if (token) headers["Authorization"] = `Bearer ${token}`;

    const res = await fetch(url, {
        method: "POST",
        headers,
        body: JSON.stringify(body)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error_description || data.msg || data.message || "Kosa la Supabase Auth");
    return data;
}

// ─── SUPABASE DB HELPER ───────────────────────────────────
async function dbQuery(table, method, data = null, filter = null) {
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
    } catch(e) {
        console.error("DB error:", e.message);
        return null;
    }
}

// ─── HANDLER ──────────────────────────────────────────────
module.exports = async function handler(req, res) {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
    if (req.method === "OPTIONS") return res.status(200).end();
    if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

    let body = req.body;
    if (typeof body === "string") { try { body = JSON.parse(body); } catch(e) { body = {}; } }
    if (!body) body = {};

    const { action } = body;

    try {
        // ── SIGNUP ──
        if (action === "signup") {
            const { name, email, password, role } = body;
            if (!name || !email || !password) return res.status(400).json({ error: "Jaza sehemu zote!" });
            if (password.length < 8) return res.status(400).json({ error: "Nywila iwe herufi 8 au zaidi!" });

            // Unda akaunti Supabase Auth
            const authData = await supabaseAuth("signup", {
                email,
                password,
                data: { name, role: role || "Nyingine" }
            });

            // Hifadhi kwenye users table
            await dbQuery("users", "POST", {
                email,
                name,
                plan: "free",
                questions_today: 0,
                last_question_date: new Date().toISOString().split("T")[0]
            });

            return res.status(200).json({
                success: true,
                message: "Akaunti imeundwa! Karibu AJPLUS AI 🇹🇿",
                user: { email, name },
                token: authData.access_token,
                refresh_token: authData.refresh_token
            });
        }

        // ── LOGIN ──
        if (action === "login") {
            const { email, password } = body;
            if (!email || !password) return res.status(400).json({ error: "Weka barua pepe na nywila!" });

            const authData = await supabaseAuth("token?grant_type=password", { email, password });

            // Pata taarifa za mtumiaji
            const users = await dbQuery("users", "GET", null, `email=eq.${encodeURIComponent(email)}`);
            const user = users?.[0] || {};

            return res.status(200).json({
                success: true,
                message: "Umeingia vizuri! Karibu " + (user.name || email.split("@")[0]),
                user: {
                    email,
                    name: user.name || authData.user?.user_metadata?.name || email.split("@")[0],
                    plan: user.plan || "free",
                    plan_expires_at: user.plan_expires_at || null,
                    questions_today: user.questions_today || 0
                },
                token: authData.access_token,
                refresh_token: authData.refresh_token
            });
        }

        // ── CHANGE PASSWORD ──
        if (action === "change_password") {
            const { token, new_password } = body;
            if (!token || !new_password) return res.status(400).json({ error: "Token na nywila mpya zinahitajika!" });
            if (new_password.length < 8) return res.status(400).json({ error: "Nywila iwe herufi 8 au zaidi!" });

            const url = `${SUPABASE_URL}/auth/v1/user`;
            const res2 = await fetch(url, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    "apikey": SUPABASE_ANON_KEY,
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({ password: new_password })
            });

            if (!res2.ok) {
                const err = await res2.json();
                throw new Error(err.message || "Imeshindwa kubadilisha nywila");
            }

            return res.status(200).json({ success: true, message: "Nywila imebadilishwa vizuri! ✅" });
        }

        // ── UPDATE PROFILE ──
        if (action === "update_profile") {
            const { token, email, name, phone } = body;
            if (!token || !email) return res.status(400).json({ error: "Token na email zinahitajika!" });

            await dbQuery("users", "PATCH", { name, phone }, `email=eq.${encodeURIComponent(email)}`);

            // Update Supabase auth metadata
            const url = `${SUPABASE_URL}/auth/v1/user`;
            await fetch(url, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    "apikey": SUPABASE_ANON_KEY,
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({ data: { name } })
            });

            return res.status(200).json({ success: true, message: "Taarifa zimesasishwa! ✅" });
        }

        // ── GET PROFILE ──
        if (action === "get_profile") {
            const { email } = body;
            if (!email) return res.status(400).json({ error: "Email inahitajika!" });

            const users = await dbQuery("users", "GET", null, `email=eq.${encodeURIComponent(email)}`);
            const user = users?.[0];
            if (!user) return res.status(404).json({ error: "Mtumiaji hapatikani!" });

            return res.status(200).json({
                success: true,
                user: {
                    email: user.email,
                    name: user.name,
                    phone: user.phone,
                    plan: user.plan || "free",
                    plan_expires_at: user.plan_expires_at,
                    questions_today: user.questions_today || 0,
                    created_at: user.created_at
                }
            });
        }

        // ── RESET PASSWORD REQUEST ──
        if (action === "reset_password") {
            const { email } = body;
            if (!email) return res.status(400).json({ error: "Weka barua pepe yako!" });

            await supabaseAuth("recover", { email });
            return res.status(200).json({
                success: true,
                message: "Barua pepe ya kubadilisha nywila imetumwa! Angalia inbox yako. 📧"
            });
        }

        // ── ADMIN CHANGE PASSWORD ──
        if (action === "admin_change_password") {
            const { admin_token, new_password } = body;
            const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "@Ajplusai2026";
            const expected = Buffer.from(ADMIN_PASSWORD).toString("base64");
            if (admin_token !== expected) return res.status(401).json({ error: "Hujaidhinishwa!" });
            if (!new_password || new_password.length < 8) return res.status(400).json({ error: "Nywila mpya iwe herufi 8+" });

            // Hifadhi nywila mpya kwenye env variable (kwa Vercel inahitaji API call)
            return res.status(200).json({
                success: true,
                message: "Nywila mpya: " + new_password + "\n\nTafadhali weka kwenye Vercel → ADMIN_PASSWORD",
                instruction: "Nenda Vercel → Settings → Environment Variables → ADMIN_PASSWORD → Update"
            });
        }

        return res.status(400).json({ error: "Action haijulikani!" });

    } catch(e) {
        console.error("Auth error:", e.message);
        return res.status(500).json({ error: e.message });
    }
};
