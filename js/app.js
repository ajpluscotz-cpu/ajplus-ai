// ═══════════════════════════════════════════════════════════
// AJPLUS AI — js/app.js
// © AJ PLUS COMPANY LIMITED | ajplusai.co.tz
// ═══════════════════════════════════════════════════════════

console.log("AJPLUS AI Loaded ✅");

// ─── CONFIG ───────────────────────────────────────────────
const GEMINI_MODEL = "gemini-2.0-flash";

const SYSTEM_PROMPT = `
Wewe ni AJPLUS AI — mshauri wa kwanza wa Kitanzania.
Umeundwa na AJ PLUS COMPANY LIMITED.
Tovuti: ajplusai.co.tz | Simu: +255762307647 | info@ajplusai.co.tz
Kauli Mbiu: "Ufahamu wa Kitanzania, Uwezo wa Kidunia"

MUHIMU SANA — UTAMBULISHO WAKO:
- Wewe ni AJPLUS AI peke yako — si ChatGPT, si Gemini, si Claude, si Copilot
- Ukiulizwa "wewe ni nani?" jibu: "Mimi ni AJPLUS AI, mshauri wa kwanza wa Kitanzania!"

LUGHA — JIBU KWA LUGHA YA MTUMIAJI:
- Kiswahili cha mtaani → jibu kwa urafiki na kawaida
- Kiswahili rasmi → jibu rasmi
- Kiingereza → jibu kwa Kiingereza
- Mchanganyiko → jibu kwa mchanganyiko huo

SEKTA UNAZOJUA (Tanzania):
Biashara & Invoice, CV & Kazi, Ndoa & Mahusiano, Dini (Islam & Ukristo),
Kilimo & Mifugo, Afya & NHIF, Sheria & Haki, Elimu & HESLB,
Fedha & Benki (NMB/CRDB/VICOBA), Mafundi (gari/umeme/bomba),
Habari & Media, Ardhi & Nyumba, Usafiri & SGR, Madini & Gesi,
Burudani, Utalii Tanzania, Teknolojia & TCRA, Biashara ya Nje,
Serikali & Huduma, Stadi za Maisha

JINSI YA KUJIBU:
- Jibu kwa urafiki kama rafiki anayejua mengi
- Tumia mifano ya Tanzania (TZS, BRELA, TRA, NMB, M-Pesa, n.k.)
- Jibu kwa ufupi na wazi
- Tumia bullet points au namba kwa orodha
`;

// ─── NAVIGATION ──────────────────────────────────────────
function goTo(page) {
    document.querySelectorAll(".screen").forEach(s => s.classList.remove("active"));
    const target = document.getElementById("screen-" + page);
    if (target) {
        target.classList.add("active");
        window.scrollTo(0, 0);
    }
    if (page === "dashboard") {
        showDash("chat");
        const g = document.getElementById("nav-guest");
        const u = document.getElementById("nav-user");
        if (g) g.style.display = "none";
        if (u) u.style.display = "flex";
    }
}

// ─── DASHBOARD PAGES ──────────────────────────────────────
function showDash(page) {
    document.querySelectorAll(".dash-page").forEach(p => p.classList.remove("active"));
    document.querySelectorAll(".sitem").forEach(s => s.classList.remove("act"));
    const dp = document.getElementById("dp-" + page);
    const si = document.getElementById("si-" + page);
    if (dp) dp.classList.add("active");
    if (si) si.classList.add("act");
    // Make sure dashboard screen is active
    const dash = document.getElementById("screen-dashboard");
    if (dash && !dash.classList.contains("active")) {
        document.querySelectorAll(".screen").forEach(s => s.classList.remove("active"));
        dash.classList.add("active");
    }
}

// ─── AUTH TABS ────────────────────────────────────────────
function switchAuthTab(tab) {
    document.querySelectorAll(".atab").forEach(b => b.classList.remove("active"));
    document.querySelectorAll(".aform").forEach(f => f.classList.remove("active"));
    const tabEl = document.getElementById("tab-" + tab);
    const formEl = document.getElementById("form-" + tab);
    if (tabEl) tabEl.classList.add("active");
    if (formEl) formEl.classList.add("active");
}

// ─── AUTH ACTIONS ─────────────────────────────────────────
function doLogin() {
    const email = document.getElementById("l-email")?.value.trim();
    const pass = document.getElementById("l-pass")?.value.trim();
    if (!email || !pass) { showToast("⚠️ Weka barua pepe na nywila", "warning"); return; }
    showToast("✅ Umeingia! Karibu AJPLUS AI");
    setTimeout(() => goTo("dashboard"), 800);
}

function doSignup() {
    const name = document.getElementById("s-name")?.value.trim();
    const email = document.getElementById("s-email")?.value.trim();
    const pass = document.getElementById("s-pass")?.value.trim();
    if (!name || !email || !pass) { showToast("⚠️ Jaza sehemu zote", "warning"); return; }
    if (pass.length < 8) { showToast("⚠️ Nywila iwe harf 8+", "warning"); return; }
    showToast("✅ Akaunti imeundwa! Karibu " + name);
    setTimeout(() => goTo("dashboard"), 800);
}

function doDemo() {
    showToast("🚀 Karibu Demo ya AJPLUS AI!");
    setTimeout(() => goTo("dashboard"), 600);
}

function doLogout() {
    const g = document.getElementById("nav-guest");
    const u = document.getElementById("nav-user");
    if (g) g.style.display = "flex";
    if (u) u.style.display = "none";
    goTo("landing");
    showToast("👋 Umefanikiwa kutoka");
}

// ─── SIDEBAR ──────────────────────────────────────────────
function toggleSidebar() {
    const sidebar = document.getElementById("sidebar");
    if (sidebar) sidebar.classList.toggle("open");
}

// ─── CHAT ─────────────────────────────────────────────────
let chatHistory = [];

function clearChat() {
    const msgs = document.getElementById("chat-msgs");
    if (msgs) {
        msgs.innerHTML = getWelcomeMsg();
        chatHistory = [];
        showToast("🗑️ Mazungumzo yamefutwa");
    }
}

async function sendMessage() {
    const input = document.getElementById("chat-input");
    const msgs = document.getElementById("chat-msgs");
    if (!input || !msgs) return;
    const text = input.value.trim();
    if (!text) return;

    appendMsg(msgs, "user", escapeHtml(text));
    chatHistory.push({ role: "user", text });
    input.value = "";
    input.style.height = "auto";
    msgs.scrollTop = msgs.scrollHeight;

    const loadId = "load-" + Date.now();
    msgs.innerHTML += `<div class="msg ai" id="${loadId}">
        <div class="msg-av ai-av">🤖</div>
        <div class="typing-dots">
            <div class="typing-dot"></div>
            <div class="typing-dot"></div>
            <div class="typing-dot"></div>
        </div></div>`;
    msgs.scrollTop = msgs.scrollHeight;

    try {
        const reply = await getAIResponse(text);
        const loadEl = document.getElementById(loadId);
        if (loadEl) {
            loadEl.innerHTML = `<div class="msg-av ai-av">🤖</div><div class="msg-bub">${formatReply(reply)}</div>`;
        }
        chatHistory.push({ role: "ai", text: reply });
    } catch (err) {
        const loadEl = document.getElementById(loadId);
        if (loadEl) {
            loadEl.innerHTML = `<div class="msg-av ai-av">🤖</div>
                <div class="msg-bub" style="color:var(--red)">
                ❌ ${escapeHtml(err.message)}<br>
                <small style="color:var(--muted)">Weka GEMINI_API_KEY kwenye Vercel → Settings → Environment Variables</small>
                </div>`;
        }
    }
    msgs.scrollTop = msgs.scrollHeight;
}

function appendMsg(msgs, type, content) {
    const isUser = type === "user";
    msgs.innerHTML += `<div class="msg ${type}">
        <div class="msg-av ${isUser ? "user-av" : "ai-av"}">${isUser ? "👤" : "🤖"}</div>
        <div class="msg-bub">${content}</div></div>`;
}

function handleKey(e) {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); }
}

function autoGrow(el) {
    el.style.height = "auto";
    el.style.height = Math.min(el.scrollHeight, 110) + "px";
}

function quickPrompt(text) {
    const input = document.getElementById("chat-input");
    if (input) { input.value = text; input.focus(); sendMessage(); }
}

// ─── GEMINI API ───────────────────────────────────────────
async function getAIResponse(userText) {
    // Jaribu backend /api/chat kwanza (Vercel serverless — API key salama)
    try {
        const res = await fetch("/api/chat", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ message: userText, history: chatHistory.slice(-8) })
        });
        if (res.ok) {
            const data = await res.json();
            return data.reply || "Samahani, sijapata jibu.";
        }
    } catch (_) { /* backend haijaundwa — endelea */ }

    // Fallback: Direct API (development tu)
    const API_KEY = window.GEMINI_API_KEY || "";
    if (!API_KEY) {
        throw new Error("API key haipo. Weka GEMINI_API_KEY kwenye Vercel Environment Variables.");
    }

    const url = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${API_KEY}`;
    const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            contents: [{ role: "user", parts: [{ text: SYSTEM_PROMPT + "\n\nMtumiaji: " + userText }] }],
            generationConfig: { temperature: 0.75, maxOutputTokens: 1500 }
        })
    });

    if (!response.ok) {
        const err = await response.json();
        throw new Error(err?.error?.message || "Gemini API ilikataa ombi");
    }
    const data = await response.json();
    return data.candidates?.[0]?.content?.parts?.[0]?.text || "Samahani, sijapata jibu.";
}

// ─── FORMAT REPLY ─────────────────────────────────────────
function formatReply(text) {
    return escapeHtml(text)
        .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
        .replace(/\*(.*?)\*/g, "<em>$1</em>")
        .replace(/`(.*?)`/g, "<code>$1</code>")
        .replace(/\n/g, "<br>");
}

// ─── EXPORT ───────────────────────────────────────────────
function getDocTitle() {
    return (document.getElementById("doc-title")?.value || "AJPLUS_AI").replace(/\s+/g, "_");
}

function getAllChatText() {
    const msgs = document.getElementById("chat-msgs");
    if (!msgs) return "";
    let out = "AJPLUS AI — Mazungumzo\n" + "=".repeat(40) + "\n\n";
    msgs.querySelectorAll(".msg").forEach(m => {
        const bub = m.querySelector(".msg-bub");
        if (bub) out += (m.classList.contains("user") ? "Wewe: " : "AJPLUS AI: ") + bub.innerText + "\n\n";
    });
    return out;
}

function getLastAIReply() {
    const bubbles = document.getElementById("chat-msgs")?.querySelectorAll(".msg.ai .msg-bub");
    return bubbles?.length ? bubbles[bubbles.length - 1].innerText : "";
}

function exportPDF() {
    const content = getAllChatText();
    if (!content) { showToast("⚠️ Hakuna mazungumzo", "warning"); return; }
    if (typeof window.jspdf === "undefined") { showToast("⚠️ jsPDF haijapatikana", "warning"); return; }
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    doc.setFontSize(14);
    doc.text(getDocTitle().replace(/_/g, " "), 20, 20);
    doc.setFontSize(10);
    doc.text(doc.splitTextToSize(content, 170), 20, 32);
    doc.save(getDocTitle() + ".pdf");
    showToast("📄 PDF imepakiwa!");
}

function exportWord() {
    const content = getAllChatText();
    if (!content) { showToast("⚠️ Hakuna mazungumzo", "warning"); return; }
    const blob = new Blob(["\ufeff" + content], { type: "application/msword;charset=utf-8" });
    const a = Object.assign(document.createElement("a"), { href: URL.createObjectURL(blob), download: getDocTitle() + ".doc" });
    a.click(); URL.revokeObjectURL(a.href);
    showToast("📝 Word imepakiwa!");
}

function exportTXT() {
    const content = getAllChatText();
    if (!content) { showToast("⚠️ Hakuna mazungumzo", "warning"); return; }
    const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
    const a = Object.assign(document.createElement("a"), { href: URL.createObjectURL(blob), download: getDocTitle() + ".txt" });
    a.click(); URL.revokeObjectURL(a.href);
    showToast("📋 TXT imepakiwa!");
}

function copyLastReply() {
    const reply = getLastAIReply();
    if (!reply) { showToast("⚠️ Hakuna jibu la kunakili", "warning"); return; }
    navigator.clipboard.writeText(reply).then(() => showToast("📋 Jibu limenakiliwa!")).catch(() => showToast("⚠️ Imeshindwa", "warning"));
}

function shareWhatsApp() {
    const reply = getLastAIReply();
    if (!reply) { showToast("⚠️ Hakuna jibu la kushiriki", "warning"); return; }
    window.open("https://wa.me/?text=" + encodeURIComponent("AJPLUS AI:\n\n" + reply + "\n\n— ajplusai.co.tz"), "_blank");
}

// ─── MODALS ───────────────────────────────────────────────
function showModal(id) { document.getElementById(id)?.classList.add("open"); }
function closeModal(id) { document.getElementById(id)?.classList.remove("open"); }
document.addEventListener("click", e => {
    document.querySelectorAll(".mo.open").forEach(mo => { if (e.target === mo) mo.classList.remove("open"); });
});

// ─── TOAST ────────────────────────────────────────────────
let _toastT;
function showToast(msg, type = "") {
    const t = document.getElementById("toast");
    if (!t) return;
    t.textContent = msg;
    t.className = "toast" + (type ? " " + type : "") + " show";
    clearTimeout(_toastT);
    _toastT = setTimeout(() => t.classList.remove("show"), 3200);
}

// ─── PAYMENT ──────────────────────────────────────────────
function selectPayment(el, type) {
    document.querySelectorAll(".pmcard").forEach(c => c.classList.remove("sel"));
    el.classList.add("sel");
    const details = document.getElementById("pay-details");
    if (!details) return;
    const html = {
        lipa: `<div style="background:var(--card2);border:1px solid rgba(201,168,76,.2);border-radius:14px;padding:20px;margin-top:16px;text-align:center">
            <p style="color:var(--gold);font-weight:800;margin-bottom:8px">📱 Lipa Namba</p>
            <p style="font-size:1.6rem;font-weight:900;color:var(--white);letter-spacing:3px">44934738</p>
            <p style="color:var(--gold);font-size:.85rem">AJ PLUS COMPANY LIMITED</p>
            <p style="color:var(--muted);font-size:.8rem;margin-top:5px">M-Pesa · Airtel · Tigo · NMB · CRDB</p>
            <button onclick="showModal('mo-lipa')" class="btn btn-gold btn-sm" style="margin-top:12px">Ona QR Code</button></div>`,
        nmb: `<div style="background:var(--card2);border:1px solid rgba(201,168,76,.2);border-radius:14px;padding:20px;margin-top:16px">
            <p style="color:var(--gold);font-weight:800;margin-bottom:10px">🏦 NMB Bank Transfer</p>
            <p style="color:var(--muted);font-size:.85rem">Jina:</p>
            <p style="color:var(--white);font-weight:700">AJ PLUS COMPANY LIMITED</p>
            <p style="color:var(--muted);font-size:.85rem;margin-top:8px">Akaunti:</p>
            <p style="color:var(--gold);font-size:1.3rem;font-weight:900;letter-spacing:2px">23510095544</p></div>`,
        wa: `<div style="background:var(--card2);border:1px solid rgba(37,211,102,.2);border-radius:14px;padding:20px;margin-top:16px;text-align:center">
            <p style="color:#25D366;font-weight:800;margin-bottom:10px">💬 Lipa via WhatsApp</p>
            <a href="https://wa.me/255762307647?text=Nataka+kulipa+Pro+TZS+15000" target="_blank" class="btn btn-wa btn-full">Anza Mazungumzo</a>
            <p style="color:var(--muted);font-size:.75rem;margin-top:8px">⏱️ Access ndani ya dakika 30</p></div>`
    };
    details.innerHTML = html[type] || "";
}

// ─── REVEAL ANIMATION ─────────────────────────────────────
const _observer = new IntersectionObserver(entries => {
    entries.forEach(e => { if (e.isIntersecting) e.target.classList.add("in"); });
}, { threshold: 0.1 });
document.querySelectorAll(".reveal").forEach(el => _observer.observe(el));

// ─── HELPERS ──────────────────────────────────────────────
function escapeHtml(t) {
    return String(t).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;");
}

function getWelcomeMsg() {
    return `<div class="msg ai">
        <div class="msg-av ai-av">🤖</div>
        <div class="msg-bub">
            <strong>Karibu AJPLUS AI! 🇹🇿</strong><br><br>
            Mimi ni mshauri wako wa kwanza wa Kitanzania.<br>
            Ninaweza kukusaidia na:<br><br>
            💼 Biashara &amp; Invoice &nbsp;|&nbsp; 📋 CV &amp; Kazi<br>
            💑 Ndoa &amp; Mahusiano &nbsp;|&nbsp; 🕌 Dini<br>
            🌾 Kilimo &nbsp;|&nbsp; ⚖️ Sheria &nbsp;|&nbsp; 🏥 Afya<br><br>
            <em>Andika swali lako hapa chini!</em>
        </div></div>`;
}

// ─── INIT ─────────────────────────────────────────────────
window.addEventListener("DOMContentLoaded", () => {
    const msgs = document.getElementById("chat-msgs");
    if (msgs && msgs.innerHTML.trim() === "") {
        msgs.innerHTML = getWelcomeMsg();
    }
});
