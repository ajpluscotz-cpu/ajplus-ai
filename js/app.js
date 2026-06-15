/* ═══════════════════════════════════════════════════
   AJPLUS AI — app.js (v2)
   Inafanya kazi na index.html kamili
═══════════════════════════════════════════════════ */

/* ── SCREEN NAVIGATION ─────────────────────────── */
function goTo(page) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  const screen = document.getElementById('screen-' + page);
  if (screen) screen.classList.add('active');

  // Navbar: guest vs user
  const isAuth = localStorage.getItem('ajplus-user');
  document.getElementById('nav-guest').style.display = isAuth ? 'none'  : 'flex';
  document.getElementById('nav-user').style.display  = isAuth ? 'flex'  : 'none';

  // WA float
  updateWaFloat();
  window.scrollTo(0, 0);
}

function updateWaFloat() {
  const waf = document.getElementById('wa-float');
  if (!waf) return;
  const isDash = document.getElementById('screen-dashboard')?.classList.contains('active');
  const isAuth = document.getElementById('screen-auth')?.classList.contains('active');
  waf.style.display = (isDash || isAuth) ? 'none' : 'flex';
}

/* ── SIDEBAR (mobile) ──────────────────────────── */
function toggleSidebar() {
  document.getElementById('sidebar')?.classList.toggle('open');
}

/* ── AUTH TABS ─────────────────────────────────── */
function switchAuthTab(tab) {
  document.querySelectorAll('.atab').forEach(t => t.classList.remove('active'));
  document.querySelectorAll('.aform').forEach(f => f.classList.remove('active'));
  document.getElementById('tab-' + tab)?.classList.add('active');
  document.getElementById('form-' + tab)?.classList.add('active');
}

/* ── LOGIN ─────────────────────────────────────── */
function doLogin() {
  const email = document.getElementById('l-email')?.value.trim();
  const pass  = document.getElementById('l-pass')?.value;
  if (!email || !pass) { showToast('⚠️ Weka barua pepe na nywila', 'warning'); return; }

  // Hifadhi session
  localStorage.setItem('ajplus-user',  JSON.stringify({ email, name: email.split('@')[0] }));
  localStorage.setItem('ajplus-email', email);

  showToast('✅ Umeingia!', 'success');
  goTo('dashboard');
  showDash('chat');
  setTimeout(initChat, 200);
}

/* ── SIGNUP ────────────────────────────────────── */
function doSignup() {
  const name  = document.getElementById('s-name')?.value.trim();
  const email = document.getElementById('s-email')?.value.trim();
  const pass  = document.getElementById('s-pass')?.value;
  const role  = document.getElementById('s-role')?.value;

  if (!name || !email || !pass) { showToast('⚠️ Jaza sehemu zote', 'warning'); return; }
  if (pass.length < 8)          { showToast('⚠️ Nywila iwe na harf 8+', 'warning'); return; }

  localStorage.setItem('ajplus-user',  JSON.stringify({ name, email, role }));
  localStorage.setItem('ajplus-email', email);

  showToast('🎉 Akaunti imeundwa!', 'success');
  goTo('dashboard');
  showDash('chat');
  setTimeout(initChat, 200);
}

/* ── DEMO ──────────────────────────────────────── */
function doDemo() {
  localStorage.setItem('ajplus-user',  JSON.stringify({ name: 'Mgeni', email: 'demo@ajplusai.co.tz' }));
  localStorage.setItem('ajplus-email', 'demo@ajplusai.co.tz');
  goTo('dashboard');
  showDash('chat');
  setTimeout(initChat, 200);
}

/* ── LOGOUT ────────────────────────────────────── */
function doLogout() {
  localStorage.removeItem('ajplus-user');
  localStorage.removeItem('ajplus-email');
  goTo('landing');
}

/* ── DASHBOARD PAGES ───────────────────────────── */
function showDash(page) {
  document.querySelectorAll('.dash-page').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.sitem').forEach(s => s.classList.remove('act'));

  const dp = document.getElementById('dp-' + page);
  const si = document.getElementById('si-' + page);
  if (dp) dp.classList.add('active');
  if (si) si.classList.add('act');

  // Funga sidebar mobile
  document.getElementById('sidebar')?.classList.remove('open');
}

/* ── MODALS ────────────────────────────────────── */
function showModal(id) {
  const m = document.getElementById(id);
  if (m) m.classList.add('open');
}

function closeModal(id) {
  const m = document.getElementById(id);
  if (m) m.classList.remove('open');
}

// Funga modal ukibonyeza nje
document.addEventListener('click', e => {
  if (e.target.classList.contains('mo')) {
    e.target.classList.remove('open');
  }
});

/* ── TOAST ─────────────────────────────────────── */
function showToast(msg, type = '') {
  const t = document.getElementById('toast');
  if (!t) return;
  t.textContent  = msg;
  t.className    = 'toast' + (type ? ' ' + type : '');
  t.classList.add('show');
  clearTimeout(t._timer);
  t._timer = setTimeout(() => t.classList.remove('show'), 3200);
}

/* ══════════════════════════════════════════════════
   CHAT
══════════════════════════════════════════════════ */
const LOGS_KEY = 'ajplus_chat_logs';
let chatHistory = [];
let chatLoading = false;

function initChat() {
  const msgs = document.getElementById('chat-msgs');
  if (!msgs || msgs.children.length > 0) return;
  appendMsg('ai', 'Habari! 👋 Mimi ni **AJPLUS AI** — mshauri wako wa Kitanzania.\n\nNaweza kukusaidia na biashara, sheria, afya, elimu, dini na sekta nyingi zaidi. Unahitaji nini leo?');
}

async function sendMessage() {
  if (chatLoading) return;

  const input = document.getElementById('chat-input');
  const msg   = input?.value.trim();
  if (!msg) return;

  input.value = '';
  autoGrow(input);
  chatLoading = true;

  appendMsg('user', msg);
  chatHistory.push({ role: 'user', content: msg });

  const typing = showTyping();

  try {
    const res  = await fetch('/api/chat', {
      method  : 'POST',
      headers : { 'Content-Type': 'application/json' },
      body    : JSON.stringify({ message: msg, history: chatHistory }),
    });

    const data = await res.json();
    typing.remove();

    if (!res.ok || data.error) throw new Error(data.error || 'Hitilafu ya seva');

    const reply = data.reply || data.content || '';
    appendMsg('ai', reply);
    chatHistory.push({ role: 'assistant', content: reply });
    saveLog(msg, 'ok');

  } catch (err) {
    typing.remove();
    appendMsg('ai', '⚠️ Samahani, kuna hitilafu: ' + err.message);
    saveLog(msg, 'error');
  } finally {
    chatLoading = false;
  }
}

function appendMsg(role, text) {
  const msgs = document.getElementById('chat-msgs');
  if (!msgs) return;

  const wrap   = document.createElement('div');
  wrap.className = 'msg ' + role;

  // Avatar
  const av = document.createElement('div');
  av.className = 'msg-av';
  if (role === 'ai') {
    av.innerHTML = '<img src="assets/logo.jpeg" alt="AI" style="width:100%;height:100%;object-fit:cover;border-radius:50%">';
  } else {
    av.style.cssText = 'background:var(--gold);display:flex;align-items:center;justify-content:center;color:#fff;font-size:.7rem;font-weight:600;border-radius:50%';
    av.textContent = 'W';
  }

  const bub = document.createElement('div');
  bub.className = 'msg-bub';
  bub.innerHTML  = formatText(text);

  wrap.appendChild(av);
  wrap.appendChild(bub);
  msgs.appendChild(wrap);
  msgs.scrollTop = msgs.scrollHeight;
}

function showTyping() {
  const msgs = document.getElementById('chat-msgs');
  const wrap = document.createElement('div');
  wrap.className = 'msg ai';
  wrap.innerHTML = `
    <div class="msg-av"><img src="assets/logo.jpeg" style="width:100%;height:100%;object-fit:cover;border-radius:50%"></div>
    <div class="msg-bub" style="display:flex;gap:4px;align-items:center;padding:10px 14px">
      <span style="width:6px;height:6px;border-radius:50%;background:var(--muted);animation:pulse 1s ease-in-out infinite"></span>
      <span style="width:6px;height:6px;border-radius:50%;background:var(--muted);animation:pulse 1s ease-in-out infinite .2s"></span>
      <span style="width:6px;height:6px;border-radius:50%;background:var(--muted);animation:pulse 1s ease-in-out infinite .4s"></span>
    </div>`;
  msgs?.appendChild(wrap);
  msgs.scrollTop = msgs.scrollHeight;
  return wrap;
}

function formatText(text) {
  return text
    .replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')
    .replace(/\*\*(.*?)\*\*/g,'<strong>$1</strong>')
    .replace(/\*(.*?)\*/g,'<em>$1</em>')
    .replace(/`(.*?)`/g,'<code>$1</code>')
    .replace(/\n/g,'<br>');
}

function handleKey(e) {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    sendMessage();
  }
}

function autoGrow(el) {
  el.style.height = 'auto';
  el.style.height = Math.min(el.scrollHeight, 88) + 'px';
}

function clearChat() {
  const msgs = document.getElementById('chat-msgs');
  if (msgs) msgs.innerHTML = '';
  chatHistory = [];
  appendMsg('ai', 'Mazungumzo yamefutwa. Naweza kukusaidia nini? 😊');
}

/* ── LOG ────────────────────────────────────────── */
function saveLog(message, status) {
  try {
    const logs = JSON.parse(localStorage.getItem(LOGS_KEY) || '[]');
    logs.push({ message, status, time: new Date().toISOString() });
    if (logs.length > 500) logs.splice(0, logs.length - 500);
    localStorage.setItem(LOGS_KEY, JSON.stringify(logs));
  } catch(_) {}
}

/* ── EXPORT ─────────────────────────────────────── */
function getLastReply() {
  const msgs = document.querySelectorAll('.msg.ai .msg-bub');
  if (!msgs.length) return '';
  return msgs[msgs.length - 1].innerText || '';
}

function exportPDF() {
  const title   = document.getElementById('doc-title')?.value || 'AJPLUS AI';
  const content = getLastReply();
  if (!content) { showToast('Hakuna jibu la kuexport', 'warning'); return; }

  try {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    doc.setFontSize(14);
    doc.text(title, 14, 18);
    doc.setFontSize(10);
    const lines = doc.splitTextToSize(content, 180);
    doc.text(lines, 14, 30);
    doc.save(title + '.pdf');
    showToast('✅ PDF imehifadhiwa!', 'success');
  } catch(e) {
    showToast('❌ PDF ilikataa. Jaribu TXT', 'error');
  }
}

function exportWord() {
  const title   = document.getElementById('doc-title')?.value || 'AJPLUS AI';
  const content = getLastReply();
  if (!content) { showToast('Hakuna jibu la kuexport', 'warning'); return; }

  const html = `<html><head><meta charset="UTF-8"><title>${title}</title></head><body><h1>${title}</h1><p>${content.replace(/\n/g,'</p><p>')}</p></body></html>`;
  const blob = new Blob([html], { type: 'application/msword' });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href     = url;
  a.download = title + '.doc';
  a.click();
  URL.revokeObjectURL(url);
  showToast('✅ Word imehifadhiwa!', 'success');
}

function exportTXT() {
  const title   = document.getElementById('doc-title')?.value || 'AJPLUS AI';
  const content = getLastReply();
  if (!content) { showToast('Hakuna jibu la kuexport', 'warning'); return; }

  const blob = new Blob([title + '\n\n' + content], { type: 'text/plain' });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href     = url;
  a.download = title + '.txt';
  a.click();
  URL.revokeObjectURL(url);
  showToast('✅ TXT imehifadhiwa!', 'success');
}

function copyLastReply() {
  const content = getLastReply();
  if (!content) { showToast('Hakuna jibu la kunakili', 'warning'); return; }
  navigator.clipboard.writeText(content).then(() => showToast('✅ Imenakiliwa!', 'success'));
}

function shareWhatsApp() {
  const content = getLastReply();
  if (!content) { showToast('Hakuna jibu la kushiriki', 'warning'); return; }
  const msg = encodeURIComponent('*AJPLUS AI — Jibu*\n\n' + content.slice(0, 500));
  window.open('https://wa.me/?text=' + msg, '_blank');
}

/* ── REVEAL ANIMATION ───────────────────────────── */
const revealObserver = new IntersectionObserver(entries => {
  entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('in'); });
}, { threshold: 0.1 });

document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

/* ── INIT ───────────────────────────────────────── */
window.addEventListener('DOMContentLoaded', () => {
  // Angalia kama mtumiaji ameingia
  const user = localStorage.getItem('ajplus-user');
  if (user) {
    document.getElementById('nav-guest').style.display = 'none';
    document.getElementById('nav-user').style.display  = 'flex';
  }

  // Ikiwa tayari imeingia na URL ni /dashboard
  if (window.location.hash === '#dashboard' && user) {
    goTo('dashboard');
    showDash('chat');
    setTimeout(initChat, 200);
  }

  updateWaFloat();
});
