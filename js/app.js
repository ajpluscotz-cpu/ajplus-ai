/* ═══════════════════════════════════════════════════
   AJPLUS AI — app.js (v5)
   js/app.js
═══════════════════════════════════════════════════ */

/* ── SCREEN NAVIGATION ─────────────────────────── */
function goTo(page) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  const screen = document.getElementById('screen-' + page);
  if (screen) screen.classList.add('active');
  const isLoggedIn = localStorage.getItem('ajplus-user');
  document.getElementById('nav-guest').style.display = isLoggedIn ? 'none' : 'flex';
  document.getElementById('nav-user').style.display  = isLoggedIn ? 'flex'  : 'none';
  window.scrollTo(0, 0);
}

function toggleSidebar() {
  document.getElementById('sidebar')?.classList.toggle('open');
}

function switchAuthTab(tab) {
  document.querySelectorAll('.atab').forEach(t => t.classList.remove('active'));
  document.querySelectorAll('.aform').forEach(f => f.classList.remove('active'));
  document.getElementById('tab-' + tab)?.classList.add('active');
  document.getElementById('form-' + tab)?.classList.add('active');
}

function doLogin() {
  const email = document.getElementById('l-email')?.value.trim();
  const pass  = document.getElementById('l-pass')?.value;
  if (!email || !pass) { showToast('⚠️ Weka barua pepe na nywila', 'warning'); return; }
  const name = email.split('@')[0];
  localStorage.setItem('ajplus-user',  JSON.stringify({ email, name }));
  localStorage.setItem('ajplus-email', email);
  updateNavUser(name);
  showToast('✅ Umeingia!', 'success');
  goTo('dashboard');
  showDash('chat');
  setTimeout(initChat, 300);
}

function doSignup() {
  const name  = document.getElementById('s-name')?.value.trim();
  const email = document.getElementById('s-email')?.value.trim();
  const pass  = document.getElementById('s-pass')?.value;
  if (!name || !email || !pass) { showToast('⚠️ Jaza sehemu zote', 'warning'); return; }
  if (pass.length < 8) { showToast('⚠️ Nywila iwe na herufi 8+', 'warning'); return; }
  localStorage.setItem('ajplus-user',  JSON.stringify({ name, email }));
  localStorage.setItem('ajplus-email', email);
  updateNavUser(name);
  showToast('🎉 Akaunti imeundwa!', 'success');
  goTo('dashboard');
  showDash('chat');
  setTimeout(initChat, 300);
}

function doDemo() {
  localStorage.setItem('ajplus-user',  JSON.stringify({ name: 'Mgeni', email: 'demo@ajplusai.co.tz' }));
  localStorage.setItem('ajplus-email', 'demo@ajplusai.co.tz');
  updateNavUser('Mgeni');
  goTo('dashboard');
  showDash('chat');
  setTimeout(initChat, 300);
}

function doLogout() {
  localStorage.removeItem('ajplus-user');
  localStorage.removeItem('ajplus-email');
  goTo('landing');
}

function updateNavUser(name) {
  const el = document.getElementById('nav-user-name');
  const av = document.getElementById('nav-av-letter');
  if (el) el.textContent = name || 'Mtumiaji';
  if (av) av.textContent = (name || 'M')[0].toUpperCase();
}

function showDash(page) {
  document.querySelectorAll('.dash-page').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.sitem').forEach(s => s.classList.remove('act'));
  document.getElementById('dp-' + page)?.classList.add('active');
  document.getElementById('si-' + page)?.classList.add('act');
  document.getElementById('sidebar')?.classList.remove('open');
}

function showModal(id) { document.getElementById(id)?.classList.add('open'); }
function closeModal(id) { document.getElementById(id)?.classList.remove('open'); }

document.addEventListener('click', e => {
  if (e.target.classList.contains('mo')) e.target.classList.remove('open');
});

function showToast(msg, type = '') {
  const t = document.getElementById('toast');
  if (!t) return;
  t.textContent = msg;
  t.className   = 'toast' + (type ? ' ' + type : '');
  t.classList.add('show');
  clearTimeout(t._t);
  t._t = setTimeout(() => t.classList.remove('show'), 3200);
}

/* ══════════════════════════════════════════════════
   FORMAT TEXT — Markdown nzuri
══════════════════════════════════════════════════ */
function formatText(text) {
  let t = text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

  // Headers → bold kubwa
  t = t.replace(/^#{1,3}\s+(.+)$/gm,
    '<strong style="font-size:.88rem;display:block;margin:8px 0 3px;color:var(--text)">$1</strong>');

  // Bold
  t = t.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
  t = t.replace(/__(.+?)__/g, '<strong>$1</strong>');

  // Italic
  t = t.replace(/\*([^*\n]+)\*/g, '<em>$1</em>');
  t = t.replace(/_([^_\n]+)_/g, '<em>$1</em>');

  // Code
  t = t.replace(/`([^`]+)`/g,
    '<code style="background:rgba(0,0,0,.07);padding:1px 5px;border-radius:4px;font-size:.8em;font-family:monospace">$1</code>');

  // Bullet points — • - *
  t = t.replace(/^[•\-\*]\s+(.+)$/gm,
    '<div style="display:flex;gap:7px;margin:4px 0;line-height:1.5">' +
    '<span style="color:var(--gold);flex-shrink:0;font-weight:700;margin-top:1px">•</span>' +
    '<span>$1</span></div>');

  // Namba orodha
  t = t.replace(/^\d+\.\s+(.+)$/gm,
    '<div style="display:flex;gap:7px;margin:4px 0;line-height:1.5">' +
    '<span style="color:var(--green);flex-shrink:0;font-weight:700;min-width:16px;margin-top:1px">›</span>' +
    '<span>$1</span></div>');

  // Paragraphs
  t = t.replace(/\n{2,}/g, '</p><p style="margin-top:8px">');
  t = t.replace(/\n/g, '<br>');

  return '<p style="margin:0">' + t + '</p>';
}

/* ══════════════════════════════════════════════════
   CHAT
══════════════════════════════════════════════════ */
const LOGS_KEY  = 'ajplus_chat_logs';
let chatHistory = [];
let chatLoading = false;

function initChat() {
  const msgs = document.getElementById('chat-msgs');
  if (!msgs || msgs.children.length > 0) return;
  const user = JSON.parse(localStorage.getItem('ajplus-user') || '{}');
  const name = user.name || 'rafiki';
  appendMsg('ai', `Habari ${name}! 👋 Mimi ni **AJPLUS AI** — mshauri wako wa Kitanzania.\n\nNaweza kukusaidia na biashara, sheria, afya, elimu, dini na sekta nyingi zaidi — kwa maarifa ya kimataifa na mifano ya Tanzania. Unahitaji nini leo? 🇹🇿`);
}

async function sendMessage() {
  if (chatLoading) return;
  const input = document.getElementById('chat-input');
  const msg   = input?.value.trim();
  if (!msg) return;

  input.value = '';
  autoGrow(input);
  chatLoading = true;

  const sendBtn = document.getElementById('send-btn');
  if (sendBtn) sendBtn.disabled = true;

  appendMsg('user', msg);
  chatHistory.push({ role: 'user', content: msg });

  // ── LOGO INAYOZUNGUKA ──
  const typing = showTypingLogo();

  try {
    const email = localStorage.getItem('ajplus-email') || '';
    const res   = await fetch('/api/chat', {
      method : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body   : JSON.stringify({
        message: msg,
        history: chatHistory.slice(-10),
        email
      }),
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
    if (sendBtn) sendBtn.disabled = false;
    input?.focus();
  }
}

function appendMsg(role, text) {
  const msgs = document.getElementById('chat-msgs');
  if (!msgs) return;

  const wrap = document.createElement('div');
  wrap.className = 'msg ' + role;

  const av = document.createElement('div');
  av.className = 'msg-av';
  if (role === 'ai') {
    av.innerHTML = '<img src="assets/logo.jpeg" style="width:100%;height:100%;object-fit:cover;border-radius:50%">';
  } else {
    const user = JSON.parse(localStorage.getItem('ajplus-user') || '{}');
    av.style.cssText = 'background:linear-gradient(135deg,var(--gold),var(--green));display:flex;align-items:center;justify-content:center;color:#fff;font-size:.7rem;font-weight:700;border-radius:50%;width:28px;height:28px;flex-shrink:0';
    av.textContent = (user.name || 'W')[0].toUpperCase();
  }

  const bub = document.createElement('div');
  bub.className = 'msg-bub';
  bub.innerHTML  = formatText(text);

  wrap.appendChild(av);
  wrap.appendChild(bub);
  msgs.appendChild(wrap);
  msgs.scrollTop = msgs.scrollHeight;
}

/* ── LOGO INAYOZUNGUKA — Typing Animation ── */
function showTypingLogo() {
  const msgs = document.getElementById('chat-msgs');
  const wrap = document.createElement('div');
  wrap.className = 'msg ai';
  wrap.innerHTML = `
    <div class="msg-av" style="overflow:visible">
      <img src="assets/logo.jpeg"
        style="width:28px;height:28px;object-fit:cover;border-radius:50%;
               border:2px solid var(--gold);
               animation:spin 1.2s linear infinite;
               box-shadow:0 0 8px rgba(201,168,76,.4)">
    </div>
    <div class="msg-bub" style="padding:10px 14px;display:flex;align-items:center;gap:6px;color:var(--muted);font-size:.78rem;font-style:italic">
      <span>AJPLUS AI inafikiria</span>
      <span style="display:flex;gap:3px;align-items:center">
        <span style="width:4px;height:4px;border-radius:50%;background:var(--gold);animation:pulse 1s ease-in-out infinite"></span>
        <span style="width:4px;height:4px;border-radius:50%;background:var(--gold);animation:pulse 1s ease-in-out infinite .2s"></span>
        <span style="width:4px;height:4px;border-radius:50%;background:var(--gold);animation:pulse 1s ease-in-out infinite .4s"></span>
      </span>
    </div>`;
  msgs?.appendChild(wrap);
  msgs.scrollTop = msgs.scrollHeight;
  return wrap;
}

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

function clearChat() {
  const msgs = document.getElementById('chat-msgs');
  if (msgs) msgs.innerHTML = '';
  chatHistory = [];
  appendMsg('ai', 'Mazungumzo yamefutwa. Naweza kukusaidia nini? 😊');
}

/* ── LOG ── */
function saveLog(message, status) {
  try {
    const logs = JSON.parse(localStorage.getItem(LOGS_KEY) || '[]');
    logs.push({ message, status, time: new Date().toISOString() });
    if (logs.length > 500) logs.splice(0, logs.length - 500);
    localStorage.setItem(LOGS_KEY, JSON.stringify(logs));
  } catch(_) {}
}

/* ── EXPORT ── */
function getLastReply() {
  const msgs = document.querySelectorAll('.msg.ai .msg-bub');
  return msgs.length ? (msgs[msgs.length - 1].innerText || '') : '';
}

function exportPDF() {
  const title   = document.getElementById('doc-title')?.value || 'AJPLUS AI';
  const content = getLastReply();
  if (!content) { showToast('Hakuna jibu la kuexport', 'warning'); return; }
  try {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    doc.setFontSize(14); doc.text(title, 14, 18);
    doc.setFontSize(10);
    doc.text(doc.splitTextToSize(content, 180), 14, 30);
    doc.save(title + '.pdf');
    showToast('✅ PDF imehifadhiwa!', 'success');
  } catch(e) { showToast('❌ Jaribu TXT badala yake', 'error'); }
}

function exportWord() {
  const title   = document.getElementById('doc-title')?.value || 'AJPLUS AI';
  const content = getLastReply();
  if (!content) { showToast('Hakuna jibu la kuexport', 'warning'); return; }
  const html = `<html><head><meta charset="UTF-8"><title>${title}</title></head><body><h1>${title}</h1><p>${content.replace(/\n/g,'</p><p>')}</p></body></html>`;
  const a = Object.assign(document.createElement('a'), {
    href: URL.createObjectURL(new Blob([html], { type: 'application/msword' })),
    download: title + '.doc'
  });
  a.click(); URL.revokeObjectURL(a.href);
  showToast('✅ Word imehifadhiwa!', 'success');
}

function exportTXT() {
  const title   = document.getElementById('doc-title')?.value || 'AJPLUS AI';
  const content = getLastReply();
  if (!content) { showToast('Hakuna jibu la kuexport', 'warning'); return; }
  const a = Object.assign(document.createElement('a'), {
    href: URL.createObjectURL(new Blob([title + '\n\n' + content], { type: 'text/plain' })),
    download: title + '.txt'
  });
  a.click(); URL.revokeObjectURL(a.href);
  showToast('✅ TXT imehifadhiwa!', 'success');
}

function copyLastReply() {
  const content = getLastReply();
  if (!content) { showToast('Hakuna jibu la kunakili', 'warning'); return; }
  navigator.clipboard.writeText(content)
    .then(() => showToast('✅ Imenakiliwa!', 'success'))
    .catch(() => showToast('❌ Imeshindwa kunakili', 'error'));
}

function shareWhatsApp() {
  const content = getLastReply();
  if (!content) { showToast('Hakuna jibu la kushiriki', 'warning'); return; }
  window.open('https://wa.me/?text=' + encodeURIComponent('*AJPLUS AI* 🇹🇿\n\n' + content.slice(0, 500)), '_blank');
}

/* ── REVEAL ANIMATION ── */
const _ro = new IntersectionObserver(entries =>
  entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('in'); }),
  { threshold: 0.08 }
);
document.querySelectorAll('.reveal').forEach(el => _ro.observe(el));

/* ── INIT ── */
window.addEventListener('DOMContentLoaded', () => {
  const user = JSON.parse(localStorage.getItem('ajplus-user') || 'null');
  if (user) {
    document.getElementById('nav-guest').style.display = 'none';
    document.getElementById('nav-user').style.display  = 'flex';
    updateNavUser(user.name);
  }
  if (localStorage.getItem('ajplus-dark') === 'true') {
    document.body.classList.add('dark');
  }
});
