// ═══════════════════════════════════════════════════════════
// AJPLUS AI — js/app.js
// © AJ PLUS COMPANY LIMITED | ajplusai.co.tz
// ═══════════════════════════════════════════════════════════

console.log("AJPLUS AI Loaded ✅");

// Kumbuka: SYSTEM_PROMPT kuu inasimamiwa na api/chat.js (Backend) kwa usalama zaidi.

// ─── UTILITY FUNCTIONS ─────────────────────────────────────
function escapeHtml(text) {
    if (!text) return "";
    return text
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

function getWelcomeMsg() {
    return `<div class="msg ai">
        <div class="msg-av ai-av">🤖</div>
        <div class="msg-bub">Mambo vipi bana! Mimi ni AJPLUS AI, Akili Bandia yako ya kwanza ya Kitanzania. Nipo hapa kukusaidia mambo kibao. Nieleze nini dili kwa sasa? 🇹🇿</div>
    </div>`;
}

// ─── NAVIGATION ──────────────────────────────────────────
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

function showToast(msg, type = "success") {
    // Hakikisha una mfumo wa toast au utumie alert ya kawaida kama haupo
    console.log(`[Toast - ${type}]: ${msg}`);
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
            loadEl.innerHTML = `
                <div class="msg-av ai-av">🤖</div>
                <div style="max-width:85%">
                    <div class="msg-bub">${formatReply(reply)}</div>
                    <button onclick="copyMsg(this)" data-text="${escapeHtml(reply)}" style="
                        margin-top:5px;background:rgba(255,255,255,.07);border:1px solid rgba(255,255,255,.15);
                        color:#aaa;font-size:.72rem;padding:4px 10px;border-radius:6px;cursor:pointer;
                        display:flex;align-items:center;gap:5px;font-family:inherit;transition:all .2s
                    " onmouseover="this.style.background='rgba(201,168,76,.15)';this.style.color='#C9A84C'"
                       onmouseout="this.style.background='rgba(255,255,255,.07)';this.style.color='#aaa'">
                        📋 Nakili jibu
                    </button>
                </div>`;
        }
        chatHistory.push({ role: "ai", text: reply });
    } catch (err) {
        const loadEl = document.getElementById(loadId);
        if (loadEl) {
            loadEl.innerHTML = `<div class="msg-av ai-av">🤖</div>
                <div class="msg-bub" style="color:var(--red)">❌ ${escapeHtml(err.message)}</div>`;
        }
    }
    msgs.scrollTop = msgs.scrollHeight;
}

function copyMsg(btn) {
    const text = btn.getAttribute("data-text");
    navigator.clipboard.writeText(text).then(() => {
        btn.textContent = "✅ Imenakiliwa!";
        btn.style.color = "#22C55E";
        setTimeout(() => {
            btn.innerHTML = "📋 Nakili jibu";
            btn.style.color = "#aaa";
        }, 2000);
    }).catch(() => showToast("⚠️ Imeshindwa kunakili", "warning"));
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
        .replace(/## (.*?)(<br>|$)/g, "<strong style='color:var(--gold);font-size:1rem'>$1</strong><br>")
        .replace(/\n/g, "<br>");
}
