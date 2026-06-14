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
        <div class="msg-av"><img src="assets/logo.jpeg" alt="AJPLUS AI" style="width:28px;height:28px;border-radius:50%;object-fit:cover;border:1.5px solid #C9A84C"></div>
        <div class="msg-bub">
            <strong>Karibu AJPLUS AI 🇹🇿</strong><br><br>
            Nimefurahi kukusaidia! Andika swali lako hapa chini — nitakujibu kwa Kiswahili. 💪
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
    // Update WA float
    setTimeout(updateWaFloat, 50);
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
async function doLogin() {
    const email = document.getElementById("l-email")?.value.trim();
    const pass = document.getElementById("l-pass")?.value.trim();
    if (!email || !pass) { showToast("⚠️ Weka barua pepe na nywila", "warning"); return; }

    const btn = document.querySelector("#form-login .btn-dark");
    if (btn) { btn.textContent = "Inaingiza..."; btn.disabled = true; }

    try {
        const res = await fetch("/api/auth", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ action: "login", email, password: pass })
        });
        const data = await res.json();

        if (data.success) {
            // Hifadhi session
            localStorage.setItem("ajplus-email", data.user.email);
            localStorage.setItem("ajplus-name", data.user.name);
            localStorage.setItem("ajplus-plan", data.user.plan);
            localStorage.setItem("ajplus-token", data.token);

            // Update nav
            updateNavUser(data.user.name);
            showToast("✅ " + data.message);
            setTimeout(() => goTo("dashboard"), 700);
        } else {
            showToast("❌ " + (data.error || "Nywila au barua pepe si sahihi!"), "error");
        }
    } catch(e) {
        showToast("❌ Tatizo la mtandao. Jaribu tena!", "error");
    } finally {
        if (btn) { btn.textContent = "Ingia →"; btn.disabled = false; }
    }
}

async function doSignup() {
    const name = document.getElementById("s-name")?.value.trim();
    const email = document.getElementById("s-email")?.value.trim();
    const pass = document.getElementById("s-pass")?.value.trim();
    const role = document.getElementById("s-role")?.value;
    if (!name || !email || !pass) { showToast("⚠️ Jaza sehemu zote", "warning"); return; }
    if (pass.length < 8) { showToast("⚠️ Nywila iwe herufi 8+", "warning"); return; }

    const btn = document.querySelector("#form-signup .btn-dark");
    if (btn) { btn.textContent = "Inaunda..."; btn.disabled = true; }

    try {
        const res = await fetch("/api/auth", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ action: "signup", name, email, password: pass, role })
        });
        const data = await res.json();

        if (data.success) {
            localStorage.setItem("ajplus-email", email);
            localStorage.setItem("ajplus-name", name);
            localStorage.setItem("ajplus-plan", "free");
            if (data.token) localStorage.setItem("ajplus-token", data.token);

            updateNavUser(name);
            showToast("✅ " + data.message);
            setTimeout(() => goTo("dashboard"), 700);
        } else {
            showToast("❌ " + (data.error || "Imeshindwa. Jaribu tena!"), "error");
        }
    } catch(e) {
        showToast("❌ Tatizo la mtandao. Jaribu tena!", "error");
    } finally {
        if (btn) { btn.textContent = "Unda Akaunti →"; btn.disabled = false; }
    }
}

function doDemo() {
    localStorage.setItem("ajplus-email", "demo@ajplusai.co.tz");
    localStorage.setItem("ajplus-name", "Mgeni");
    localStorage.setItem("ajplus-plan", "free");
    updateNavUser("Mgeni");
    showToast("🚀 Karibu Demo ya AJPLUS AI!");
    setTimeout(() => goTo("dashboard"), 600);
}

function doLogout() {
    localStorage.removeItem("ajplus-email");
    localStorage.removeItem("ajplus-name");
    localStorage.removeItem("ajplus-plan");
    localStorage.removeItem("ajplus-token");
    const g = document.getElementById("nav-guest");
    const u = document.getElementById("nav-user");
    if (g) g.style.display = "flex";
    if (u) u.style.display = "none";
    goTo("landing");
    showToast("👋 Umefanikiwa kutoka");
}

function updateNavUser(name) {
    const g = document.getElementById("nav-guest");
    const u = document.getElementById("nav-user");
    const av = document.querySelector(".nav-av");
    if (g) g.style.display = "none";
    if (u) u.style.display = "flex";
    if (av) av.textContent = (name || "U")[0].toUpperCase();
}

// Badilisha Nywila
async function changePassword() {
    const oldPass = document.getElementById("cp-old")?.value.trim();
    const newPass = document.getElementById("cp-new")?.value.trim();
    const confirmPass = document.getElementById("cp-confirm")?.value.trim();

    if (!oldPass || !newPass || !confirmPass) { showToast("⚠️ Jaza sehemu zote", "warning"); return; }
    if (newPass !== confirmPass) { showToast("⚠️ Nywila mpya hazilingani!", "warning"); return; }
    if (newPass.length < 8) { showToast("⚠️ Nywila iwe herufi 8+", "warning"); return; }

    const token = localStorage.getItem("ajplus-token");
    if (!token) { showToast("⚠️ Tafadhali ingia tena", "warning"); return; }

    const btn = document.getElementById("cp-btn");
    if (btn) { btn.textContent = "Inabadilisha..."; btn.disabled = true; }

    try {
        const res = await fetch("/api/auth", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ action: "change_password", token, new_password: newPass })
        });
        const data = await res.json();
        if (data.success) {
            showToast("✅ " + data.message, "success");
            document.getElementById("cp-old").value = "";
            document.getElementById("cp-new").value = "";
            document.getElementById("cp-confirm").value = "";
        } else {
            showToast("❌ " + data.error, "error");
        }
    } catch(e) {
        showToast("❌ Tatizo la mtandao!", "error");
    } finally {
        if (btn) { btn.textContent = "Badilisha Nywila"; btn.disabled = false; }
    }
}

// Update Profile
async function updateProfile() {
    const name = document.getElementById("prof-name")?.value.trim();
    const phone = document.getElementById("prof-phone")?.value.trim();
    const email = localStorage.getItem("ajplus-email");
    const token = localStorage.getItem("ajplus-token");

    if (!name) { showToast("⚠️ Weka jina lako", "warning"); return; }

    const btn = document.getElementById("prof-btn");
    if (btn) { btn.textContent = "Inasasisha..."; btn.disabled = true; }

    try {
        const res = await fetch("/api/auth", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ action: "update_profile", token, email, name, phone })
        });
        const data = await res.json();
        if (data.success) {
            localStorage.setItem("ajplus-name", name);
            updateNavUser(name);
            showToast("✅ " + data.message, "success");
        } else {
            showToast("❌ " + data.error, "error");
        }
    } catch(e) {
        showToast("❌ Tatizo la mtandao!", "error");
    } finally {
        if (btn) { btn.textContent = "Hifadhi Mabadiliko"; btn.disabled = false; }
    }
}

// Load profile data
async function loadProfile() {
    const email = localStorage.getItem("ajplus-email");
    if (!email) return;

    const nameEl = document.getElementById("prof-name");
    const emailEl = document.getElementById("prof-email");
    const planEl = document.getElementById("prof-plan");
    const phoneEl = document.getElementById("prof-phone");

    if (emailEl) emailEl.value = email;
    if (nameEl) nameEl.value = localStorage.getItem("ajplus-name") || "";

    try {
        const res = await fetch("/api/auth", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ action: "get_profile", email })
        });
        const data = await res.json();
        if (data.success && data.user) {
            if (nameEl) nameEl.value = data.user.name || "";
            if (phoneEl) phoneEl.value = data.user.phone || "";
            if (planEl) {
                const plan = data.user.plan || "free";
                const planNames = { free:"Bure", msingi:"Msingi", kawaida:"Kawaida", pro:"Pro ⭐", biashara:"Biashara", reseller:"Reseller" };
                planEl.textContent = planNames[plan] || plan.toUpperCase();
                planEl.className = "tag plan-" + plan;
            }
        }
    } catch(e) {}
}

function toggleSidebar() {
    const sidebar = document.getElementById("sidebar");
    if (sidebar) sidebar.classList.toggle("open");
}

function updateWaFloat() {
    const waf = document.getElementById("wa-float");
    if (!waf) return;
    const isDash = document.getElementById("screen-dashboard")?.classList.contains("active");
    const isAuth = document.getElementById("screen-auth")?.classList.contains("active");
    waf.style.display = (isDash || isAuth) ? "none" : "flex";
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
        <div class="msg-av"><img src="assets/logo.jpeg" alt="AI" style="width:28px;height:28px;border-radius:50%;object-fit:cover;border:1.5px solid #C9A84C;animation:spin 1.2s linear infinite"></div>
        <div class="msg-bub" style="color:#999;font-size:.8rem;padding:8px 12px">AJPLUS AI inafikiri...</div>
    </div>`;
    msgs.scrollTop = msgs.scrollHeight;

    try {
        const email = localStorage.getItem("ajplus-email") || "";
        const reply = await getAIResponse(text, email);
        const loadEl = document.getElementById(loadId);
        if (loadEl) {
            loadEl.innerHTML = `
                <div class="msg-av"><img src="assets/logo.jpeg" alt="AI" style="width:28px;height:28px;border-radius:50%;object-fit:cover;border:1.5px solid #C9A84C"></div>
                <div style="max-width:85%">
                    <div class="msg-bub">${formatReply(reply)}</div>
                    <button onclick="copyMsg(this)" data-text="${escapeHtml(reply)}" style="
                        margin-top:4px;background:rgba(201,168,76,.07);border:1px solid rgba(201,168,76,.18);
                        color:#999;font-size:.7rem;padding:3px 9px;border-radius:6px;cursor:pointer;
                        display:flex;align-items:center;gap:4px;font-family:inherit;transition:all .2s"
                    onmouseover="this.style.color='#C9A84C'"
                    onmouseout="this.style.color='#999'">
                        📋 Nakili jibu
                    </button>
                </div>`;
        }
        chatHistory.push({ role: "ai", text: reply });
    } catch (err) {
        const loadEl = document.getElementById(loadId);
        if (loadEl) {
            loadEl.innerHTML = `
                <div class="msg-av"><img src="assets/logo.jpeg" alt="AI" style="width:28px;height:28px;border-radius:50%;object-fit:cover;border:1.5px solid #C9A84C"></div>
                <div class="msg-bub" style="color:#DC2626">❌ ${escapeHtml(err.message)}</div>`;
        }
    }
    msgs.scrollTop = msgs.scrollHeight;
}

function copyMsg(btn) {
    const text = btn.getAttribute("data-text");
    navigator.clipboard.writeText(text).then(() => {
        btn.textContent = "✅ Imenakiliwa!";
        btn.style.color = "#16A34A";
        setTimeout(() => { btn.innerHTML = "📋 Nakili jibu"; btn.style.color = "#999"; }, 2000);
    }).catch(() => showToast("⚠️ Imeshindwa kunakili", "warning"));
}

function appendMsg(msgs, type, content) {
    const isUser = type === "user";
    msgs.innerHTML += `<div class="msg ${type}">
        ${isUser
            ? `<div class="msg-av" style="background:linear-gradient(135deg,#C9A84C,#A8832C);color:#fff;display:flex;align-items:center;justify-content:center;font-size:.8rem;width:28px;height:28px;border-radius:50%;flex-shrink:0">👤</div>`
            : `<div class="msg-av"><img src="assets/logo.jpeg" alt="AI" style="width:28px;height:28px;border-radius:50%;object-fit:cover;border:1.5px solid #C9A84C"></div>`
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

// ─── API ──────────────────────────────────────────────────
async function getAIResponse(userText, email = "") {
    const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            message: userText,
            email: email,
            history: chatHistory.slice(-8)
        })
    });

    const data = await res.json();

    if (!res.ok) {
        if (data.upgrade) {
            showModal("mo-lipa");
            throw new Error(data.error || "Kikomo kimefikiwa!");
        }
        throw new Error(data.error || "Tatizo la seva. Jaribu tena!");
    }

    return data.reply || "Samahani, sijapata jibu. Tafadhali jaribu tena!";
}

// ─── FORMAT ───────────────────────────────────────────────
function formatReply(text) {
    return escapeHtml(text)
        .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
        .replace(/\*(.*?)\*/g, "<em>$1</em>")
        .replace(/`(.*?)`/g, "<code>$1</code>")
        .replace(/## (.*?)(<br>|$)/g, "<strong style='color:#C9A84C;font-size:.96rem;display:block;margin-top:6px'>$1</strong>")
        .replace(/# (.*?)(<br>|$)/g, "<strong style='color:#C9A84C;font-size:1.05rem;display:block;margin-top:8px'>$1</strong>")
        .replace(/^- (.*)/gm, "• $1")
        .replace(/\n/g, "<br>");
}

// ─── EXPORT / DOWNLOAD ────────────────────────────────────
function getDocTitle() {
    return (document.getElementById("doc-title")?.value || "AJPLUS_AI").replace(/\s+/g, "_");
}

function getAllChatText() {
    const msgs = document.getElementById("chat-msgs");
    if (!msgs) return "";
    let out = "AJPLUS AI — Mazungumzo\n";
    out += "ajplusai.co.tz\n";
    out += "=".repeat(40) + "\n\n";
    msgs.querySelectorAll(".msg").forEach(m => {
        const bub = m.querySelector(".msg-bub");
        if (!bub) return;
        const role = m.classList.contains("user") ? "Wewe" : "AJPLUS AI";
        out += role + ":\n" + bub.innerText.replace("📋 Nakili jibu", "").trim() + "\n\n";
    });
    out += "\n— Imetolewa na AJPLUS AI | ajplusai.co.tz";
    return out;
}

function getLastAIReply() {
    const bubbles = document.getElementById("chat-msgs")?.querySelectorAll(".msg.ai .msg-bub");
    if (!bubbles?.length) return "";
    const lastBub = bubbles[bubbles.length - 1];
    return lastBub ? lastBub.innerText.replace("📋 Nakili jibu", "").trim() : "";
}

// PDF Download — njia mpya inayofanya kazi vizuri
function exportPDF() {
    const content = getAllChatText();
    if (!content || content.trim() === "") {
        showToast("⚠️ Hakuna mazungumzo ya kupakua", "warning");
        return;
    }

    try {
        // Jaribu jsPDF kwanza
        let jsPDFClass = null;
        if (window.jspdf?.jsPDF) {
            jsPDFClass = window.jspdf.jsPDF;
        } else if (window.jsPDF) {
            jsPDFClass = window.jsPDF;
        }

        if (jsPDFClass) {
            const doc = new jsPDFClass({ orientation: "portrait", unit: "mm", format: "a4" });

            // Header
            doc.setFillColor(201, 168, 76);
            doc.rect(0, 0, 210, 18, "F");
            doc.setTextColor(255, 255, 255);
            doc.setFontSize(13);
            doc.setFont("helvetica", "bold");
            doc.text("AJPLUS AI — ajplusai.co.tz", 14, 12);

            // Title
            doc.setTextColor(50, 50, 50);
            doc.setFontSize(11);
            doc.setFont("helvetica", "bold");
            doc.text(getDocTitle().replace(/_/g, " "), 14, 28);

            // Content
            doc.setFontSize(9);
            doc.setFont("helvetica", "normal");
            doc.setTextColor(80, 80, 80);
            const lines = doc.splitTextToSize(content, 182);
            let y = 36;
            lines.forEach(line => {
                if (y > 280) { doc.addPage(); y = 14; }
                doc.text(line, 14, y);
                y += 5;
            });

            doc.save(getDocTitle() + ".pdf");
            showToast("📄 PDF imepakiwa vizuri!");
            return;
        }
    } catch(e) {
        console.warn("jsPDF imeshindwa:", e.message);
    }

    // Njia mbadala — HTML to PDF kupitia browser print
    try {
        const printWin = window.open("", "_blank", "width=800,height=600");
        printWin.document.write(`
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <title>${getDocTitle()}</title>
                <style>
                    body{font-family:Arial,sans-serif;font-size:11pt;color:#333;margin:20mm}
                    h1{color:#C9A84C;font-size:14pt;border-bottom:2px solid #C9A84C;padding-bottom:6px}
                    .msg{margin-bottom:12px;padding:8px;border-radius:6px}
                    .user{background:#f0f0f0}
                    .ai{background:#fff9ee;border-left:3px solid #C9A84C;padding-left:10px}
                    .role{font-weight:bold;color:#C9A84C;font-size:10pt;margin-bottom:3px}
                    .footer{margin-top:20px;font-size:9pt;color:#999;border-top:1px solid #eee;padding-top:8px}
                </style>
            </head>
            <body>
                <h1>AJPLUS AI — ${getDocTitle().replace(/_/g, " ")}</h1>
                <p style="color:#999;font-size:9pt">ajplusai.co.tz | ${new Date().toLocaleDateString("sw-TZ")}</p>
        `);

        const msgs = document.getElementById("chat-msgs");
        msgs?.querySelectorAll(".msg").forEach(m => {
            const bub = m.querySelector(".msg-bub");
            if (!bub) return;
            const isUser = m.classList.contains("user");
            const role = isUser ? "Wewe" : "AJPLUS AI";
            const cls = isUser ? "user" : "ai";
            const txt = bub.innerText.replace("📋 Nakili jibu", "").trim();
            printWin.document.write(`<div class="msg ${cls}"><div class="role">${role}:</div>${txt.replace(/\n/g, "<br>")}</div>`);
        });

        printWin.document.write(`
                <div class="footer">Imetolewa na AJPLUS AI — ajplusai.co.tz</div>
            </body></html>
        `);
        printWin.document.close();
        setTimeout(() => { printWin.print(); }, 500);
        showToast("📄 Chagua 'Save as PDF' kwenye print dialog!");
    } catch(e) {
        showToast("⚠️ Imeshindwa. Tumia kitufe cha Nakili!", "warning");
    }
}

// Word Download
function exportWord() {
    const content = getAllChatText();
    if (!content) { showToast("⚠️ Hakuna mazungumzo ya kupakua", "warning"); return; }

    // HTML yenye formatting nzuri kwa Word
    let wordHtml = `
        <html xmlns:o='urn:schemas-microsoft-com:office:office'
              xmlns:w='urn:schemas-microsoft-com:office:word'
              xmlns='http://www.w3.org/TR/REC-html40'>
        <head><meta charset='utf-8'>
        <style>
            body{font-family:Calibri,Arial;font-size:11pt;color:#333}
            h1{color:#C9A84C;font-size:14pt}
            .user{background:#f5f5f5;padding:8px;margin:6px 0;border-radius:4px}
            .ai{border-left:3px solid #C9A84C;padding:8px 8px 8px 12px;margin:6px 0;background:#fffdf5}
            .role{font-weight:bold;color:#C9A84C;font-size:10pt}
        </style></head><body>
        <h1>AJPLUS AI — ${getDocTitle().replace(/_/g, " ")}</h1>
        <p style="color:#999;font-size:9pt">ajplusai.co.tz</p><hr>
    `;

    const msgs = document.getElementById("chat-msgs");
    msgs?.querySelectorAll(".msg").forEach(m => {
        const bub = m.querySelector(".msg-bub");
        if (!bub) return;
        const isUser = m.classList.contains("user");
        const role = isUser ? "Wewe" : "AJPLUS AI";
        const cls = isUser ? "user" : "ai";
        const txt = bub.innerText.replace("📋 Nakili jibu", "").trim();
        wordHtml += `<div class="${cls}"><div class="role">${role}:</div><p>${txt.replace(/\n/g, "<br>")}</p></div>`;
    });

    wordHtml += `<hr><p style="color:#999;font-size:9pt">Imetolewa na AJPLUS AI — ajplusai.co.tz</p></body></html>`;

    const blob = new Blob(["\ufeff" + wordHtml], { type: "application/msword;charset=utf-8" });
    const a = Object.assign(document.createElement("a"), {
        href: URL.createObjectURL(blob),
        download: getDocTitle() + ".doc"
    });
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(a.href);
    showToast("📝 Word imepakiwa vizuri!");
}

// TXT Download
function exportTXT() {
    const content = getAllChatText();
    if (!content) { showToast("⚠️ Hakuna mazungumzo ya kupakua", "warning"); return; }
    const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
    const a = Object.assign(document.createElement("a"), {
        href: URL.createObjectURL(blob),
        download: getDocTitle() + ".txt"
    });
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(a.href);
    showToast("📋 TXT imepakiwa vizuri!");
}

function copyLastReply() {
    const reply = getLastAIReply();
    if (!reply) { showToast("⚠️ Hakuna jibu la kunakili", "warning"); return; }
    navigator.clipboard.writeText(reply)
        .then(() => showToast("📋 Jibu limenakiliwa!"))
        .catch(() => showToast("⚠️ Imeshindwa kunakili", "warning"));
}

function shareWhatsApp() {
    const reply = getLastAIReply();
    if (!reply) { showToast("⚠️ Hakuna jibu la kushiriki", "warning"); return; }
    window.open("https://wa.me/?text=" + encodeURIComponent("AJPLUS AI 🇹🇿\n\n" + reply + "\n\n— ajplusai.co.tz"), "_blank");
}

// ─── MODALS ───────────────────────────────────────────────
function showModal(id) { document.getElementById(id)?.classList.add("open"); }
function closeModal(id) { document.getElementById(id)?.classList.remove("open"); }
document.addEventListener("click", e => {
    document.querySelectorAll(".mo.open").forEach(mo => {
        if (e.target === mo) mo.classList.remove("open");
    });
});

// ─── PAYMENT ──────────────────────────────────────────────
function selectPayment(el, type) {
    document.querySelectorAll(".pmcard").forEach(c => c.classList.remove("sel"));
    el.classList.add("sel");
}

// ─── REVEAL on scroll ─────────────────────────────────────
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
    updateWaFloat();

    // Dark mode
    if (localStorage.getItem("ajplus-dark") === "true") {
        document.body.classList.add("dark");
        document.querySelectorAll(".dm-toggle").forEach(b => b.innerHTML = "☀️ Mwanga");
    }
});
