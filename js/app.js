console.log("AJPLUS AI Loaded");

// ─── CONFIG ───────────────────────────────────────────────
const GEMINI_API_KEY = "WEKA_API_KEY_YAKO_HAPA"; // ← Weka API key yako hapa
const GEMINI_MODEL   = "gemini-2.0-flash";

const SYSTEM_PROMPT = `
Wewe ni AJPLUS AI — mshauri wa kwanza wa Kitanzania.
Umeundwa na AJ PLUS COMPANY LIMITED | ajplusai.co.tz
Kauli Mbiu: "Ufahamu wa Kitanzania, Uwezo wa Kidunia"

MUHIMU:
- Wewe si ChatGPT wala Gemini — wewe ni AJPLUS AI tu
- Jibu kwa Kiswahili isipokuwa mtumiaji aandike Kiingereza
- Jibu kwa urafiki, kama rafiki anayejua mengi
- Ukiulizwa "wewe ni nani?" jibu: "Mimi ni AJPLUS AI!"
`;

// ─── NAVIGATION ──────────────────────────────────────────
function goTo(page) {
    document.querySelectorAll(".screen").forEach(screen => {
        screen.classList.remove("active");
    });
    const target = document.getElementById("screen-" + page);
    if (target) {
        target.classList.add("active");
    } else {
        console.warn("Screen haipo:", page);
    }
}

function showDash(page) {
    goTo("dashboard");
}

// ─── AUTH TABS ────────────────────────────────────────────
function switchAuthTab(tab) {
    document.querySelectorAll(".atab").forEach(btn => btn.classList.remove("active"));
    document.querySelectorAll(".aform").forEach(form => form.classList.remove("active"));

    if (tab === "login") {
        document.getElementById("tab-login")?.classList.add("active");
        document.getElementById("form-login")?.classList.add("active");
    }
    if (tab === "signup") {
        document.getElementById("tab-signup")?.classList.add("active");
        document.getElementById("form-signup")?.classList.add("active");
    }
}

// ─── AUTH ACTIONS ─────────────────────────────────────────
function doLogin() {
    goTo("dashboard");
}

function doSignup() {
    goTo("dashboard");
}

function doDemo() {
    goTo("dashboard");
}

// ─── SIDEBAR ──────────────────────────────────────────────
function toggleSidebar() {
    const sidebar = document.getElementById("sidebar");
    if (sidebar) sidebar.classList.toggle("open");
}

// ─── CHAT ─────────────────────────────────────────────────
async function sendMessage() {
    const input = document.getElementById("chat-input");
    const msgs  = document.getElementById("chat-msgs");
    if (!input || !msgs) return;

    const text = input.value.trim();
    if (text === "") return;

    // Onyesha ujumbe wa mtumiaji
    msgs.innerHTML += `<div class="msg user">${escapeHtml(text)}</div>`;
    input.value = "";
    input.style.height = "auto";
    msgs.scrollTop = msgs.scrollHeight;

    // Onyesha loading
    const loadingId = "loading-" + Date.now();
    msgs.innerHTML += `<div class="msg ai" id="${loadingId}">⏳ Ninafikiri...</div>`;
    msgs.scrollTop = msgs.scrollHeight;

    try {
        const reply = await getAIResponse(text);
        const loadingEl = document.getElementById(loadingId);
        if (loadingEl) loadingEl.innerHTML = reply;
    } catch (err) {
        const loadingEl = document.getElementById(loadingId);
        if (loadingEl) loadingEl.innerHTML = "❌ Kuna tatizo: " + err.message;
        console.error("AI Error:", err);
    }

    msgs.scrollTop = msgs.scrollHeight;
}

function handleKey(event) {
    if (event.key === "Enter" && !event.shiftKey) {
        event.preventDefault();
        sendMessage();
    }
}

function autoGrow(el) {
    el.style.height = "auto";
    el.style.height = el.scrollHeight + "px";
}

function quickPrompt(text) {
    const input = document.getElementById("chat-input");
    if (input) {
        input.value = text;
        input.focus();
        sendMessage();
    }
}

// ─── GEMINI API ───────────────────────────────────────────
async function getAIResponse(userText) {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`;

    const body = {
        contents: [
            {
                role: "user",
                parts: [{ text: SYSTEM_PROMPT + "\n\nMtumiaji: " + userText }]
            }
        ],
        generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 1024
        }
    };

    const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
    });

    if (!response.ok) {
        const err = await response.json();
        throw new Error(err?.error?.message || "API ilikataa ombi");
    }

    const data = await response.json();
    return data.candidates?.[0]?.content?.parts?.[0]?.text || "Samahani, sijapata jibu.";
}

// ─── HELPER ───────────────────────────────────────────────
function escapeHtml(text) {
    return text
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;");
}
