// ═══════════════════════════════════════════════════════════
// AJPLUS AI — js/app.js
// Frontend: Firebase Auth + Chat + Tools + PDF + Word
// © AJ PLUS COMPANY LIMITED | ajplusai.co.tz
// ═══════════════════════════════════════════════════════════

// ── FIREBASE CONFIG — BADILISHA NA YAKO ─────────────────────
// Nenda: console.firebase.google.com → Project Settings → Web App
const firebaseConfig = {
  apiKey: "WEKA-YAKO-HAPA",
  authDomain: "ajplus-ai.firebaseapp.com",
  projectId: "ajplus-ai",
  storageBucket: "ajplus-ai.appspot.com",
  messagingSenderId: "WEKA-YAKO",
  appId: "WEKA-YAKO"
};

// ── INITIALIZE FIREBASE ──────────────────────────────────────
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAuth, signInAnonymously, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { getFirestore, collection, addDoc, getDocs, query, orderBy, limit, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// ── STATE ─────────────────────────────────────────────────────
let currentUser = null;
let chatHistory = [];
let isTyping = false;

// ── AUTH — Anonymous Login ────────────────────────────────────
onAuthStateChanged(auth, async (user) => {
  if (user) {
    currentUser = user;
    await loadChatHistory();
    showWelcomeMessage();
  } else {
    try {
      await signInAnonymously(auth);
    } catch (err) {
      console.error('Auth error:', err);
      showWelcomeMessage(); // Still work without auth
    }
  }
});

// ── LOAD CHAT HISTORY ─────────────────────────────────────────
async function loadChatHistory() {
  if (!currentUser || !db) return;
  try {
    const q = query(
      collection(db, 'chats', currentUser.uid, 'messages'),
      orderBy('timestamp', 'desc'),
      limit(20)
    );
    const snapshot = await getDocs(q);
    const messages = [];
    snapshot.forEach(doc => messages.unshift(doc.data()));

    chatHistory = messages.map(m => ({
      role: m.role,
      content: m.content
    }));

    // Display last 10 messages
    const display = messages.slice(-10);
    display.forEach(m => {
      if (m.role !== 'system') renderMessage(m.role === 'user' ? 'user' : 'ai', m.content);
    });
  } catch (err) {
    // Silently fail — work without history
  }
}

// ── SAVE MESSAGE TO FIREBASE ──────────────────────────────────
async function saveMessage(role, content) {
  if (!currentUser || !db) return;
  try {
    await addDoc(collection(db, 'chats', currentUser.uid, 'messages'), {
      role,
      content,
      timestamp: serverTimestamp()
    });
  } catch (err) {
    // Silently fail
  }
}

// ── WELCOME MESSAGE ───────────────────────────────────────────
function showWelcomeMessage() {
  const msgs = document.getElementById('chat-msgs');
  if (!msgs || msgs.children.length > 0) return;

  const welcome = `**Habari! Mimi ni AJPLUS AI 🇹🇿**

Mshauri wa kwanza wa Kitanzania — ninakusaidia na:

💑 **Ndoa & Mahusiano** — ushauri wa moyoni
🕌 **Dini** — Islam, Ukristo kwa heshima
🚀 **Biashara** — invoice, mpango, faida
📋 **CV & Kazi** — niambie hadithi yako
🔧 **Ufundi** — diagnosis ya tatizo lolote
📰 **Habari** — headlines za moto
🌾 **Kilimo** — bei za mazao, ushauri
⚖️ **Sheria** — haki zako Tanzania

*Zungumza kwa Kiswahili cha kawaida, mtaani, kanisani au msikitini — ninakuelewa!*

**Niulize chochote — AJPLUS AI ipo 24/7!** 💪`;

  renderMessage('ai', welcome);
}

// ── SEND MESSAGE ──────────────────────────────────────────────
async function sendMessage() {
  const input = document.getElementById('chat-input');
  if (!input) return;
  const message = input.value.trim();
  if (!message || isTyping) return;

  input.value = '';
  input.style.height = 'auto';
  isTyping = true;

  // Show user message
  renderMessage('user', message);

  // Save to Firebase
  saveMessage('user', message);

  // Show typing indicator
  const typingId = showTyping();

  try {
    // Call backend
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message,
        history: chatHistory.slice(-10),
        sector: detectSector(message)
      })
    });

    const data = await response.json();
    removeTyping(typingId);

    if (data.reply) {
      renderMessage('ai', data.reply);
      saveMessage('assistant', data.reply);

      // Update history
      chatHistory.push({ role: 'user', content: message });
      chatHistory.push({ role: 'assistant', content: data.reply });

      // Store last reply for export
      window.lastAIReply = data.reply;
    } else {
      throw new Error(data.error || 'Hakuna jibu');
    }
  } catch (err) {
    removeTyping(typingId);
    renderMessage('ai', `Samahani, kuna tatizo la muunganiko. 😔\n\nJaribu tena au angalia muunganiko wako wa intaneti.\n\nKama tatizo linaendelea, wasiliana: WhatsApp +255762307647`);
  }

  isTyping = false;
}

// ── DETECT SECTOR ─────────────────────────────────────────────
function detectSector(msg) {
  const m = msg.toLowerCase();
  if (/ndoa|mke|mume|uchumba|mahusiano|familia/.test(m)) return 'mahusiano';
  if (/dini|sala|dua|mungu|allah|biblia|quran|kanisa|msikiti/.test(m)) return 'dini';
  if (/biashara|invoice|faida|mtaji|mpango|duka/.test(m)) return 'biashara';
  if (/cv|resume|kazi|ajira|nafasi|interview/.test(m)) return 'elimu';
  if (/gari|injini|umeme|bomba|fundi|diagnosis/.test(m)) return 'ufundi';
  if (/habari|headline|article|gazeti|news/.test(m)) return 'habari';
  if (/kilimo|mazao|mbolea|shamba|uvuvi/.test(m)) return 'kilimo';
  if (/sheria|haki|mahakama|polisi|mkataba/.test(m)) return 'sheria';
  if (/hospitali|dawa|ugonjwa|NHIF|afya/.test(m)) return 'afya';
  return 'general';
}

// ── RENDER MESSAGE ────────────────────────────────────────────
function renderMessage(type, text) {
  const msgs = document.getElementById('chat-msgs');
  if (!msgs) return;

  const div = document.createElement('div');
  div.className = `msg ${type}`;
  div.innerHTML = `
    <div class="msg-av ${type === 'ai' ? 'ai-av' : 'user-av'}">${type === 'ai' ? '🤖' : '👤'}</div>
    <div class="msg-bub">${formatMessage(text)}</div>
  `;
  msgs.appendChild(div);
  msgs.scrollTop = msgs.scrollHeight;
}

// ── FORMAT MESSAGE ────────────────────────────────────────────
function formatMessage(text) {
  return text
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/`(.*?)`/g, '<code>$1</code>')
    .replace(/\n/g, '<br>')
    .replace(/•/g, '•');
}

// ── TYPING INDICATOR ──────────────────────────────────────────
function showTyping() {
  const msgs = document.getElementById('chat-msgs');
  const id = 'typing-' + Date.now();
  const div = document.createElement('div');
  div.className = 'msg ai';
  div.id = id;
  div.innerHTML = `
    <div class="msg-av ai-av">🤖</div>
    <div class="typing-dots">
      <div class="typing-dot"></div>
      <div class="typing-dot"></div>
      <div class="typing-dot"></div>
    </div>
  `;
  msgs.appendChild(div);
  msgs.scrollTop = msgs.scrollHeight;
  return id;
}

function removeTyping(id) {
  const el = document.getElementById(id);
  if (el) el.remove();
}

// ── KEYBOARD HANDLER ──────────────────────────────────────────
function handleKey(e) {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    sendMessage();
  }
}

function autoGrow(el) {
  el.style.height = 'auto';
  el.style.height = Math.min(el.scrollHeight, 120) + 'px';
}

// ── CLEAR CHAT ────────────────────────────────────────────────
function clearChat() {
  const msgs = document.getElementById('chat-msgs');
  if (msgs) msgs.innerHTML = '';
  chatHistory = [];
  window.lastAIReply = null;
  showWelcomeMessage();
}

// ── QUICK PROMPTS ─────────────────────────────────────────────
function quickPrompt(text) {
  const input = document.getElementById('chat-input');
  if (input) {
    input.value = text;
    sendMessage();
  }
}

// ── EXPORT PDF ────────────────────────────────────────────────
function exportPDF() {
  const title = document.getElementById('doc-title')?.value || 'AJPLUS AI';
  const msgs = document.querySelectorAll('#chat-msgs .msg.ai .msg-bub');
  let content = '';
  msgs.forEach(m => { content += m.innerText + '\n\n'; });

  if (!content.trim()) {
    showToast('⚠️ Hakuna maudhui ya kusave!', 'orange');
    return;
  }

  const win = window.open('', '_blank');
  win.document.write(`<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<title>${escHtml(title)}</title>
<style>
  body { font-family: Arial, sans-serif; padding: 40px; max-width: 750px; margin: 0 auto; font-size: 13px; line-height: 1.8; color: #1a1a2e; }
  h1 { color: #C9A84C; font-size: 22px; border-bottom: 2px solid #C9A84C; padding-bottom: 10px; }
  .meta { color: #888; font-size: 11px; margin-bottom: 20px; }
  .content { white-space: pre-wrap; }
  .footer { margin-top: 40px; padding-top: 12px; border-top: 1px solid #ddd; font-size: 10px; color: #999; text-align: center; }
  @media print { body { padding: 20px; } }
</style>
</head>
<body>
<h1>🇹🇿 ${escHtml(title)}</h1>
<div class="meta">
  Tarehe: ${new Date().toLocaleDateString('sw-TZ', {weekday:'long',year:'numeric',month:'long',day:'numeric'})}<br>
  Imetolewa na: AJPLUS AI — ajplusai.co.tz
</div>
<div class="content">${escHtml(content)}</div>
<div class="footer">
  🌍 AJPLUS AI — "Ufahamu wa Kitanzania, Uwezo wa Kidunia"<br>
  ajplusai.co.tz | info@ajplusai.co.tz | +255 762 307 647<br>
  © AJ PLUS COMPANY LIMITED | Tanzania
</div>
</body>
</html>`);
  win.document.close();
  setTimeout(() => win.print(), 500);
  showToast('📄 Chagua "Save as PDF" kwenye dialog!');
}

// ── EXPORT WORD ───────────────────────────────────────────────
function exportWord() {
  const title = document.getElementById('doc-title')?.value || 'AJPLUS AI';
  const msgs = document.querySelectorAll('#chat-msgs .msg.ai .msg-bub');
  let content = '';
  msgs.forEach(m => { content += m.innerText + '\n\n'; });

  if (!content.trim()) {
    showToast('⚠️ Hakuna maudhui ya kusave!', 'orange');
    return;
  }

  const html = `<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word">
<head><meta charset="UTF-8">
<style>
  body { font-family: Calibri; font-size: 12pt; margin: 2.5cm; }
  h1 { color: #C9A84C; font-size: 18pt; border-bottom: 1pt solid #C9A84C; }
  .meta { color: #888; font-size: 9pt; margin-bottom: 18pt; }
  .footer { margin-top: 30pt; padding-top: 8pt; border-top: 1pt solid #ddd; font-size: 9pt; color: #999; }
</style>
</head>
<body>
<h1>🇹🇿 ${escHtml(title)}</h1>
<div class="meta">Tarehe: ${new Date().toLocaleDateString('sw-TZ')} | AJPLUS AI — ajplusai.co.tz</div>
<pre style="white-space:pre-wrap;font-family:Calibri;font-size:12pt">${escHtml(content)}</pre>
<div class="footer">🌍 AJPLUS AI | ajplusai.co.tz | +255762307647 | © AJ PLUS COMPANY LIMITED</div>
</body></html>`;

  const blob = new Blob(['\ufeff' + html], { type: 'application/msword' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = title.replace(/[^a-zA-Z0-9\s]/g, '').replace(/\s+/g, '_') + '.doc';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
  showToast('📝 Word imesavwa!');
}

// ── EXPORT TXT ────────────────────────────────────────────────
function exportTXT() {
  const title = document.getElementById('doc-title')?.value || 'AJPLUS AI';
  const msgs = document.querySelectorAll('#chat-msgs .msg.ai .msg-bub');
  let content = '';
  msgs.forEach(m => { content += m.innerText + '\n\n'; });

  if (!content.trim()) {
    showToast('⚠️ Hakuna maudhui ya kusave!', 'orange');
    return;
  }

  const text = `${title}\n${'─'.repeat(50)}\nTarehe: ${new Date().toLocaleDateString('sw-TZ')}\nAJPLUS AI — ajplusai.co.tz\n\n${content}\n\n🌍 AJ PLUS COMPANY LIMITED | +255762307647`;
  const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = title.replace(/\s+/g, '_') + '.txt';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
  showToast('✅ TXT imesavwa!');
}

// ── COPY TO CLIPBOARD ─────────────────────────────────────────
function copyLastReply() {
  const msgs = document.querySelectorAll('#chat-msgs .msg.ai .msg-bub');
  if (!msgs.length) { showToast('⚠️ Hakuna maudhui!', 'orange'); return; }
  const last = msgs[msgs.length - 1].innerText;
  navigator.clipboard.writeText(last)
    .then(() => showToast('📋 Imenakiliiwa!'))
    .catch(() => showToast('⚠️ Imeshindwa kunakili', 'orange'));
}

// ── SHARE VIA WHATSAPP ────────────────────────────────────────
function shareWhatsApp() {
  const msgs = document.querySelectorAll('#chat-msgs .msg.ai .msg-bub');
  if (!msgs.length) { showToast('⚠️ Hakuna maudhui!', 'orange'); return; }
  const last = msgs[msgs.length - 1].innerText.substring(0, 500);
  const text = encodeURIComponent(`${last}\n\n— AJPLUS AI | ajplusai.co.tz`);
  window.open(`https://wa.me/?text=${text}`, '_blank');
}

// ── TOAST NOTIFICATION ────────────────────────────────────────
function showToast(msg, type = 'success') {
  const toast = document.getElementById('toast');
  if (!toast) return;
  toast.textContent = msg;
  toast.className = 'toast show ' + type;
  setTimeout(() => toast.classList.remove('show'), 3000);
}

// ── HELPER ───────────────────────────────────────────────────
function escHtml(t) {
  return String(t)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// ── SCREEN NAVIGATION ─────────────────────────────────────────
function goTo(screen) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  const el = document.getElementById('screen-' + screen);
  if (el) { el.classList.add('active'); window.scrollTo(0, 0); }

  // Update nav
  const guest = document.getElementById('nav-guest');
  const user = document.getElementById('nav-user');
  if (screen === 'dashboard') {
    if (guest) guest.style.display = 'none';
    if (user) user.style.display = 'flex';
    showDash('chat'); // Default to chat
  } else {
    if (guest) guest.style.display = 'flex';
    if (user) user.style.display = 'none';
  }

  // Reveal animations
  setTimeout(() => {
    el && el.querySelectorAll('.reveal').forEach((e, i) => {
      setTimeout(() => e.classList.add('in'), i * 60);
    });
  }, 80);
}

function requireAuth(page) {
  goTo('auth');
}

// ── DASHBOARD ─────────────────────────────────────────────────
function showDash(page) {
  document.querySelectorAll('.dash-page').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.sitem').forEach(s => s.classList.remove('act'));
  const dp = document.getElementById('dp-' + page);
  const si = document.getElementById('si-' + page);
  if (dp) dp.classList.add('active');
  if (si) si.classList.add('act');
}

function toggleSidebar() {
  const sb = document.getElementById('sidebar');
  if (sb) sb.classList.toggle('open');
}

// ── AUTH ──────────────────────────────────────────────────────
function doDemo() {
  showToast('🚀 Karibu AJPLUS AI!');
  goTo('dashboard');
}

function switchAuthTab(tab) {
  document.querySelectorAll('.atab').forEach(t => t.classList.remove('active'));
  document.querySelectorAll('.aform').forEach(f => f.classList.remove('active'));
  const t = document.getElementById('tab-' + tab);
  const f = document.getElementById('form-' + tab);
  if (t) t.classList.add('active');
  if (f) f.classList.add('active');
}

function doLogin() {
  const email = document.getElementById('l-email')?.value?.trim();
  const pass = document.getElementById('l-pass')?.value;
  if (!email || !pass) { showToast('⚠️ Jaza sehemu zote!', 'warning'); return; }
  showToast('✅ Karibu!');
  goTo('dashboard');
}

function doSignup() {
  const name = document.getElementById('s-name')?.value?.trim();
  const email = document.getElementById('s-email')?.value?.trim();
  const pass = document.getElementById('s-pass')?.value;
  if (!name || !email || !pass) { showToast('⚠️ Jaza sehemu zote!', 'warning'); return; }
  if (pass.length < 8) { showToast('⚠️ Nywila lazima iwe harf 8+!', 'warning'); return; }
  showToast('🎉 Karibu ' + name + '!');
  goTo('dashboard');
}

function doLogout() {
  goTo('landing');
  showToast('👋 Umetoka. Karibu tena!');
}

// ── MODALS ────────────────────────────────────────────────────
function showModal(id) {
  const el = document.getElementById(id);
  if (el) el.classList.add('open');
}

function closeModal(id) {
  const el = document.getElementById(id);
  if (el) el.classList.remove('open');
}

// ── PAYMENTS ─────────────────────────────────────────────────
function selectPayment(el, method) {
  document.querySelectorAll('.pmcard').forEach(c => c.classList.remove('sel'));
  el.classList.add('sel');
  const pd = document.getElementById('pay-details');
  if (!pd) return;
  pd.style.display = 'block';

  const isMobile = ['mpesa', 'airtel', 'mixx'].includes(method);
  const isBank = ['nmb', 'crdb'].includes(method);

  if (isMobile || isBank) {
    pd.innerHTML = `
      <div style="background:rgba(201,168,76,.08);border:1px solid rgba(201,168,76,.2);border-radius:12px;padding:18px;margin-top:16px;text-align:center">
        <p style="font-size:.85rem;font-weight:700;color:var(--gold);margin-bottom:12px">
          ${isMobile ? '📱 Lipa kwa Lipa Namba / QR Code' : '🏦 NMB Bank Transfer'}
        </p>
        ${isMobile ? `
        <p style="font-size:1.6rem;font-weight:900;color:var(--white);letter-spacing:3px">44934738</p>
        <p style="font-size:.82rem;color:var(--gold);font-weight:700;margin:6px 0">AJ PLUS COMPANY LIMITED</p>
        <p style="font-size:.76rem;color:var(--muted)">M-Pesa · Airtel · Tigo · NMB · CRDB · Benki Zote</p>
        ` : `
        <p style="font-size:.85rem;color:var(--text)">Jina: <strong>AJ PLUS COMPANY LIMITED</strong></p>
        <p style="font-size:1.2rem;font-weight:900;color:var(--white);letter-spacing:2px;margin:6px 0">23510095544</p>
        <p style="font-size:.78rem;color:var(--muted)">NMB Tanzania</p>
        `}
        <a href="https://wa.me/255762307647?text=Nimetuma%20malipo.%20Risiti%20yangu%20hapa." 
           target="_blank" 
           style="display:block;margin-top:14px;padding:11px;background:#25D366;color:#fff;border-radius:50px;font-weight:700;font-size:.88rem;text-decoration:none">
          💬 Tuma Risiti WhatsApp
        </a>
        <p style="font-size:.74rem;color:var(--muted);margin-top:8px">⏱️ Access ndani ya dakika 30</p>
      </div>`;
  }
}

// ── INIT ─────────────────────────────────────────────────────
window.addEventListener('load', () => {
  // Reveal animations
  const obs = new IntersectionObserver(entries => {
    entries.forEach((e, i) => {
      if (e.isIntersecting) {
        setTimeout(() => e.target.classList.add('in'), i * 60);
        obs.unobserve(e.target);
      }
    });
  }, { threshold: 0.08 });
  document.querySelectorAll('.reveal').forEach(el => obs.observe(el));

  // Modal close on backdrop click
  document.querySelectorAll('.mo').forEach(m => {
    m.addEventListener('click', e => {
      if (e.target === m) m.classList.remove('open');
    });
  });

  // Close on overlay click
  document.querySelectorAll('.tool-modal-overlay').forEach(m => {
    m.addEventListener('click', e => {
      if (e.target === m) m.classList.remove('open');
    });
  });
});

// ── EXPOSE TO GLOBAL ──────────────────────────────────────────
window.sendMessage = sendMessage;
window.handleKey = handleKey;
window.autoGrow = autoGrow;
window.clearChat = clearChat;
window.quickPrompt = quickPrompt;
window.exportPDF = exportPDF;
window.exportWord = exportWord;
window.exportTXT = exportTXT;
window.copyLastReply = copyLastReply;
window.shareWhatsApp = shareWhatsApp;
window.goTo = goTo;
window.requireAuth = requireAuth;
window.showDash = showDash;
window.toggleSidebar = toggleSidebar;
window.doDemo = doDemo;
window.doLogin = doLogin;
window.doSignup = doSignup;
window.doLogout = doLogout;
window.switchAuthTab = switchAuthTab;
window.showModal = showModal;
window.closeModal = closeModal;
window.selectPayment = selectPayment;
window.showToast = showToast;
