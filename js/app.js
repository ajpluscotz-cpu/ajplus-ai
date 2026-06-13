// ═══════════════════════════════════════════════════════════
// AJPLUS AI — js/app.js
// © AJ PLUS COMPANY LIMITED | ajplusai.co.tz
// ═══════════════════════════════════════════════════════════

console.log("AJPLUS AI Loaded ✅");

// ─── HELPERS ──────────────────────────────────────────────
function escapeHtml(text) {
    if (!text) return "";
    return String(text)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;");
}

function getWelcomeMsg() {
    return `<div class="msg ai">
        <div class="msg-av"><img src="assets/logo.jpeg" alt="AJPLUS AI" style="width:30px;height:30px;border-radius:50%;object-fit:cover;border:1.5px solid #C9A84C"></div>
        <div class="msg-bub">
            <strong>Mambo bana! Mimi ni AJPLUS AI 🇹🇿</strong><br><br>
            Andika swali lako hapa chini — nitakujibu! 💪
        </div>
    </div>`;
}

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

// ─── NAVIGATION ───────────────────────────────────────────
function goTo(page) {
    document.querySelectorAll(".screen").forEach(s => s.classList.remove("active"));
    const target = document.getElementById("screen-" + page);
    if (target) { target.classList.add("active"); window.scrollTo(0, 0); }
    if (page === "dashboard") {
        showDash("chat");
        const g = document.getElementById("nav-guest");
        const u = document.getElementById("nav-user");
        if (g) g.style.display = "none";
        if (u) u.style.display = "flex";
    }
}

function showDash(page) {
    document.querySelectorAll(".dash-page").forEach(p => p.classList.remove("active"));
    document.querySelectorAll(".sitem").forEach(s => s.classList.remove("act"));
    const dp = document.getElementById("dp-" + page);
    const si = document.getElementById("si-" + page);
    if (dp) dp.classList.add("active");
    if (si) si.classList.add("act");
    const dash = document.getElementById("screen-dashboard");
    if (dash && !dash.classList.contains("active")) {
        document.querySelectorAll(".screen").forEach(s => s.classList.remove("active"));
        dash.classList.add("active");
    }
}

function switchAuthTab(tab) {
    document.querySelectorAll(".atab").forEach(b => b.classList.remove("active"));
    document.querySelectorAll(".aform").forEach(f => f.classList.remove("active"));
    const tabEl = document.getElementById("tab-" + tab);
    const formEl = document.getElementById("form-" + tab);
    if (tabEl) tabEl.classList.add("active");
    if (formEl) formEl.classList.add("active");
}

// ─── AUTH ─────────────────────────────────────────────────
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
        <div class="msg-av"><img src="assets/logo.jpeg" alt="AI" style="width:30px;height:30px;border-radius:50%;object-fit:cover;border:1.5px solid #C9A84C;animation:spin 1.2s linear infinite"></div>
        <div class="msg-bub" style="color:#888;font-size:.84rem;padding:8px 12px">AJPLUS AI inafikiri...</div>
    </div>`;
    msgs.scrollTop = msgs.scrollHeight;

    try {
        const reply = await getAIResponse(text);
        const loadEl = document.getElementById(loadId);
        if (loadEl) {
            loadEl.innerHTML = `
                <div class="msg-av"><img src="assets/logo.jpeg" alt="AI" style="width:30px;height:30px;border-radius:50%;object-fit:cover;border:1.5px solid #C9A84C"></div>
                <div style="max-width:85%">
                    <div class="msg-bub">${formatReply(reply)}</div>
                    <button onclick="copyMsg(this)" data-text="${escapeHtml(reply)}" style="
                        margin-top:5px;background:rgba(201,168,76,.08);border:1.5px solid rgba(201,168,76,.2);
                        color:#888;font-size:.72rem;padding:4px 10px;border-radius:6px;cursor:pointer;
                        display:flex;align-items:center;gap:5px;font-family:inherit;transition:all .2s"
                    onmouseover="this.style.color='#C9A84C'"
                    onmouseout="this.style.color='#888'">
                        📋 Nakili jibu
                    </button>
                </div>`;
        }
        chatHistory.push({ role: "ai", text: reply });
    } catch (err) {
        const loadEl = document.getElementById(loadId);
        if (loadEl) {
            loadEl.innerHTML = `
                <div class="msg-av"><img src="assets/logo.jpeg" alt="AI" style="width:30px;height:30px;border-radius:50%;object-fit:cover;border:1.5px solid #C9A84C"></div>
                <div class="msg-bub" style="color:#EF4444">❌ ${escapeHtml(err.message)}</div>`;
        }
    }
    msgs.scrollTop = msgs.scrollHeight;
}

function copyMsg(btn) {
    const text = btn.getAttribute("data-text");
    navigator.clipboard.writeText(text).then(() => {
        btn.textContent = "✅ Imenakiliwa!";
        btn.style.color = "#22C55E";
        setTimeout(() => { btn.innerHTML = "📋 Nakili jibu"; btn.style.color = "#888"; }, 2000);
    }).catch(() => showToast("⚠️ Imeshindwa kunakili", "warning"));
}

function appendMsg(msgs, type, content) {
    const isUser = type === "user";
    msgs.innerHTML += `<div class="msg ${type}">
        ${isUser
            ? `<div class="msg-av" style="background:linear-gradient(135deg,#C9A84C,#A8832C);color:#fff;display:flex;align-items:center;justify-content:center;font-size:.82rem;width:30px;height:30px;border-radius:50%;flex-shrink:0">👤</div>`
            : `<div class="msg-av"><img src="assets/logo.jpeg" alt="AI" style="width:30px;height:30px;border-radius:50%;object-fit:cover;border:1.5px solid #C9A84C"></div>`
        }
        <div class="msg-bub">${content}</div>
    </div>`;
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

// ─── API ──────────────────────────────────────────────────
async function getAIResponse(userText) {
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
    } catch (_) {}
    throw new Error("Samahani, kuna tatizo la mtandao. Jaribu tena!");
}

// ─── FORMAT ───────────────────────────────────────────────
function formatReply(text) {
    return escapeHtml(text)
        .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
        .replace(/\*(.*?)\*/g, "<em>$1</em>")
        .replace(/`(.*?)`/g, "<code>$1</code>")
        .replace(/## (.*?)(<br>|$)/g, "<strong style='color:#C9A84C;font-size:1rem'>$1</strong><br>")
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

// ─── PAYMENT ──────────────────────────────────────────────
function selectPayment(el, type) {
    document.querySelectorAll(".pmcard").forEach(c => c.classList.remove("sel"));
    el.classList.add("sel");
    const details = document.getElementById("pay-details");
    if (!details) return;
    const html = {
        lipa: `<div style="background:#F7F5F0;border:1.5px solid rgba(201,168,76,.3);border-radius:14px;padding:18px;margin-top:14px;text-align:center">
            <p style="color:#C9A84C;font-weight:800;margin-bottom:7px">📱 Lipa Namba</p>
            <p style="font-size:1.5rem;font-weight:900;letter-spacing:3px">44934738</p>
            <p style="color:#C9A84C;font-size:.83rem">AJ PLUS COMPANY LIMITED</p>
            <p style="color:#888;font-size:.78rem;margin-top:4px">M-Pesa · Airtel · Tigo · NMB · CRDB</p>
            <button onclick="showModal('mo-lipa')" class="btn btn-gold btn-sm" style="margin-top:10px">Ona QR Code</button></div>`,
        nmb: `<div style="background:#F7F5F0;border:1.5px solid rgba(201,168,76,.3);border-radius:14px;padding:18px;margin-top:14px">
            <p style="color:#C9A84C;font-weight:800;margin-bottom:8px">🏦 NMB Bank Transfer</p>
            <p style="color:#888;font-size:.83rem">Jina:</p>
            <p style="font-weight:700">AJ PLUS COMPANY LIMITED</p>
            <p style="color:#888;font-size:.83rem;margin-top:6px">Akaunti:</p>
            <p style="color:#C9A84C;font-size:1.2rem;font-weight:900;letter-spacing:2px">23510095544</p></div>`,
        wa: `<div style="background:#F7F5F0;border:1.5px solid rgba(37,211,102,.2);border-radius:14px;padding:18px;margin-top:14px;text-align:center">
            <p style="color:#25D366;font-weight:800;margin-bottom:8px">💬 Lipa via WhatsApp</p>
            <a href="https://wa.me/255762307647?text=Nataka+kulipa+Pro+TZS+15000" target="_blank" class="btn btn-wa btn-full">Anza Mazungumzo</a>
            <p style="color:#888;font-size:.73rem;margin-top:6px">⏱️ Access ndani ya dakika 30</p></div>`
    };
    details.innerHTML = html[type] || "";
}

// ─── REVEAL ───────────────────────────────────────────────
const _observer = new IntersectionObserver(entries => {
    entries.forEach(e => { if (e.isIntersecting) e.target.classList.add("in"); });
}, { threshold: 0.1 });
document.querySelectorAll(".reveal").forEach(el => _observer.observe(el));

// ─── INIT ─────────────────────────────────────────────────
window.addEventListener("DOMContentLoaded", () => {
    const msgs = document.getElementById("chat-msgs");
    if (msgs && msgs.innerHTML.trim() === "") {
        msgs.innerHTML = getWelcomeMsg();
    }
});
