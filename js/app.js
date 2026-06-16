/* ═══════════════════════════════════════════════════
   AJPLUS AI — app.js (v7 — USALAMA IMEBORESHWA)
   js/app.js
═══════════════════════════════════════════════════ */

/* ══════════════════════════════════════════════════
   🔒 USALAMA — Security Utilities
══════════════════════════════════════════════════ */

// ── 1. RATE LIMITER — Zuia maombi mengi ──
const RateLimiter = {
  requests: {},
  // Maombi 20 kwa dakika 1 kwa kila aina
  limits: {
    chat:     { max: 20, window: 60000 },
    image:    { max: 5,  window: 60000 },
    login:    { max: 5,  window: 300000 }, // 5 kwa dakika 5
    activate: { max: 3,  window: 300000 }
  },
  check(type) {
    const now    = Date.now();
    const config = this.limits[type] || { max: 10, window: 60000 };
    if (!this.requests[type]) this.requests[type] = [];
    // Futa maombi ya zamani
    this.requests[type] = this.requests[type].filter(t => now - t < config.window);
    if (this.requests[type].length >= config.max) {
      const wait = Math.ceil((config.window - (now - this.requests[type][0])) / 1000);
      throw new Error(`⏳ Subiri sekunde ${wait} kabla ya kujaribu tena`);
    }
    this.requests[type].push(now);
    return true;
  }
};

// ── 2. INPUT SANITIZER — Safisha maingizo ──
const Sanitizer = {
  // Safisha maandishi — zuia XSS
  text(str, maxLen = 2000) {
    if (typeof str !== 'string') return '';
    return str
      .slice(0, maxLen)
      .replace(/[<>]/g, c => c === '<' ? '&lt;' : '&gt;')
      .trim();
  },
  // Thibitisha barua pepe
  email(email) {
    if (typeof email !== 'string') return false;
    const re = /^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$/;
    return re.test(email.trim()) && email.length <= 254;
  },
  // Thibitisha nywila
  password(pass) {
    if (typeof pass !== 'string') return false;
    return pass.length >= 8 && pass.length <= 128;
  },
  // Safisha jina
  name(str) {
    if (typeof str !== 'string') return '';
    return str.replace(/[^a-zA-Z0-9\s\u0080-\uFFFF\-']/g, '').slice(0, 60).trim();
  }
};

// ── 3. SESSION MANAGER — Hifadhi data salama ──
const Session = {
  // Badala ya localStorage moja kwa moja
  set(key, value) {
    try {
      // Encode data kwa base64 — si encryption kamili lakini bora kuliko wazi
      const encoded = btoa(unescape(encodeURIComponent(JSON.stringify(value))));
      sessionStorage.setItem('ajp_' + key, encoded);
      // localStorage kwa persistence — data isiyo nyeti tu
      if (key === 'theme') localStorage.setItem('ajp_' + key, encoded);
    } catch(e) {}
  },
  get(key) {
    try {
      const raw = sessionStorage.getItem('ajp_' + key)
                || localStorage.getItem('ajp_' + key);
      if (!raw) return null;
      return JSON.parse(decodeURIComponent(escape(atob(raw))));
    } catch(e) { return null; }
  },
  remove(key) {
    sessionStorage.removeItem('ajp_' + key);
    localStorage.removeItem('ajp_' + key);
  },
  clear() {
    // Futa data za session tu — si theme
    const theme = this.get('theme');
    sessionStorage.clear();
    if (theme) this.set('theme', theme);
  }
};

/* ══════════════════════════════════════════════════
   SCREEN NAVIGATION
══════════════════════════════════════════════════ */
function goTo(page) {
  // Thibitisha page ni sahihi
  const allowed = ['landing', 'auth', 'dashboard'];
  if (!allowed.includes(page)) return;

  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  const screen = document.getElementById('screen-' + page);
  if (screen) screen.classList.add('active');

  const isLoggedIn = Session.get('user');
  document.getElementById('nav-guest').style.display = isLoggedIn ? 'none' : 'flex';
  document.getElementById('nav-user').style.display  = isLoggedIn ? 'flex'  : 'none';
  window.scrollTo(0, 0);
}

function toggleSidebar() {
  document.getElementById('sidebar')?.classList.toggle('open');
}

function switchAuthTab(tab) {
  const allowed = ['login', 'signup'];
  if (!allowed.includes(tab)) return;
  document.querySelectorAll('.atab').forEach(t => t.classList.remove('active'));
  document.querySelectorAll('.aform').forEach(f => f.classList.remove('active'));
  document.getElementById('tab-' + tab)?.classList.add('active');
  document.getElementById('form-' + tab)?.classList.add('active');
}

/* ══════════════════════════════════════════════════
   🔒 AUTH — Imeboreshwa kwa Usalama
══════════════════════════════════════════════════ */
function doLogin() {
  try {
    // Rate limit — zuia login nyingi
    RateLimiter.check('login');
  } catch(e) {
    showToast(e.message, 'warning');
    return;
  }

  const emailRaw = document.getElementById('l-email')?.value.trim();
  const passRaw  = document.getElementById('l-pass')?.value;

  // Thibitisha maingizo
  if (!emailRaw || !passRaw) {
    showToast('⚠️ Weka barua pepe na nywila', 'warning');
    return;
  }
  if (!Sanitizer.email(emailRaw)) {
    showToast('⚠️ Barua pepe si sahihi', 'warning');
    return;
  }
  if (!Sanitizer.password(passRaw)) {
    showToast('⚠️ Nywila iwe na herufi 8 hadi 128', 'warning');
    return;
  }

  const email = emailRaw.toLowerCase().trim();
  const name  = Sanitizer.name(email.split('@')[0]);

  // Hifadhi kwa Session (salama)
  Session.set('user',  { email, name });
  Session.set('email', email);

  updateNavUser(name);
  showToast('✅ Umeingia!', 'success');
  goTo('dashboard');
  showDash('chat');
  setTimeout(initChat, 300);
}

function doSignup() {
  try {
    RateLimiter.check('login');
  } catch(e) {
    showToast(e.message, 'warning');
    return;
  }

  const nameRaw  = document.getElementById('s-name')?.value.trim();
  const emailRaw = document.getElementById('s-email')?.value.trim();
  const passRaw  = document.getElementById('s-pass')?.value;

  // Thibitisha kila kitu
  if (!nameRaw || !emailRaw || !passRaw) {
    showToast('⚠️ Jaza sehemu zote', 'warning');
    return;
  }

  const name = Sanitizer.name(nameRaw);
  if (!name || name.length < 2) {
    showToast('⚠️ Weka jina halisi (herufi 2+)', 'warning');
    return;
  }
  if (!Sanitizer.email(emailRaw)) {
    showToast('⚠️ Barua pepe si sahihi', 'warning');
    return;
  }
  if (!Sanitizer.password(passRaw)) {
    showToast('⚠️ Nywila iwe na herufi 8 hadi 128', 'warning');
    return;
  }

  const email = emailRaw.toLowerCase().trim();

  Session.set('user',  { name, email });
  Session.set('email', email);

  updateNavUser(name);
  showToast('🎉 Akaunti imeundwa!', 'success');
  goTo('dashboard');
  showDash('chat');
  setTimeout(initChat, 300);
}

function doDemo() {
  Session.set('user',  { name: 'Mgeni', email: 'demo@ajplusai.co.tz' });
  Session.set('email', 'demo@ajplusai.co.tz');
  updateNavUser('Mgeni');
  goTo('dashboard');
  showDash('chat');
  setTimeout(initChat, 300);
}

function doLogout() {
  Session.clear();
  chatHistory = [];
  const msgs = document.getElementById('chat-msgs');
  if (msgs) msgs.innerHTML = '';
  goTo('landing');
}

function updateNavUser(name) {
  const safeName = Sanitizer.name(name || 'Mtumiaji');
  const el = document.getElementById('nav-user-name');
  const av = document.getElementById('nav-av-letter');
  if (el) el.textContent = safeName;
  if (av) av.textContent = safeName[0].toUpperCase();
}

function showDash(page) {
  const allowed = ['chat', 'home', 'image', 'pay'];
  if (!allowed.includes(page)) return;
  document.querySelectorAll('.dash-page').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.sitem').forEach(s => s.classList.remove('act'));
  document.getElementById('dp-' + page)?.classList.add('active');
  document.getElementById('si-' + page)?.classList.add('act');
  document.getElementById('sidebar')?.classList.remove('open');
}

function showModal(id) {
  const allowed = ['mo-lipa', 'mo-enterprise'];
  if (!allowed.includes(id)) return;
  document.getElementById(id)?.classList.add('open');
}
function closeModal(id) {
  document.getElementById(id)?.classList.remove('open');
}

document.addEventListener('click', e => {
  if (e.target.classList.contains('mo')) e.target.classList.remove('open');
});

function showToast(msg, type = '') {
  const t = document.getElementById('toast');
  if (!t) return;
  // Sanitize toast message
  t.textContent = typeof msg === 'string' ? msg.slice(0, 200) : 'Kosa limetokea';
  t.className   = 'toast' + (type ? ' ' + type : '');
  t.classList.add('show');
  clearTimeout(t._t);
  t._t = setTimeout(() => t.classList.remove('show'), 3200);
}

/* ══════════════════════════════════════════════════
   🔒 FORMAT TEXT — XSS-safe Markdown
══════════════════════════════════════════════════ */
function formatText(text) {
  if (typeof text !== 'string') return '';

  // Safisha kwanza — zuia XSS KABLA ya markdown
  let t = text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;');

  // Sasa markdown (salama kwa sababu HTML tayari imesafishwa)
  t = t.replace(/^#{1,3}\s+(.+)$/gm,
    '<strong style="font-size:.88rem;display:block;margin:8px 0 3px;color:var(--text)">$1</strong>');
  t = t.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
  t = t.replace(/__(.+?)__/g, '<strong>$1</strong>');
  t = t.replace(/\*([^*\n]+)\*/g, '<em>$1</em>');
  t = t.replace(/_([^_\n]+)_/g, '<em>$1</em>');
  t = t.replace(/`([^`]+)`/g,
    '<code style="background:rgba(0,0,0,.07);padding:1px 5px;border-radius:4px;font-size:.8em;font-family:monospace">$1</code>');
  t = t.replace(/^[•\-\*]\s+(.+)$/gm,
    '<div style="display:flex;gap:7px;margin:4px 0;line-height:1.5">' +
    '<span style="color:var(--gold);flex-shrink:0;font-weight:700;margin-top:1px">•</span>' +
    '<span>$1</span></div>');
  t = t.replace(/^\d+\.\s+(.+)$/gm,
    '<div style="display:flex;gap:7px;margin:4px 0;line-height:1.5">' +
    '<span style="color:var(--green);flex-shrink:0;font-weight:700;min-width:16px;margin-top:1px">›</span>' +
    '<span>$1</span></div>');
  t = t.replace(/\n{2,}/g, '</p><p style="margin-top:8px">');
  t = t.replace(/\n/g, '<br>');

  return '<p style="margin:0">' + t + '</p>';
}

/* ══════════════════════════════════════════════════
   IMAGE GENERATION
══════════════════════════════════════════════════ */
const IMAGE_KEYWORDS = [
  'tengeneza picha', 'natengenezea picha', 'nitengenezee picha',
  'tengeneza logo', 'natengenezea logo', 'nitengenezee logo',
  'tengeneza design', 'natengenezea design', 'nitengenezee design',
  'tengeneza poster', 'natengenezea poster', 'nitengenezee poster',
  'generate image', 'create image', 'make image',
  'generate logo', 'create logo', 'make logo',
  'picha ya', 'logo ya', 'poster ya', 'design ya',
  'chora picha', 'chora logo', 'nionyeshe picha'
];

function detectImageType(msg) {
  const m = msg.toLowerCase();
  if (m.includes('logo'))                      return 'logo';
  if (m.includes('design') || m.includes('poster')) return 'design';
  return 'image';
}

function isImageRequest(msg) {
  const m = msg.toLowerCase();
  return IMAGE_KEYWORDS.some(k => m.includes(k));
}

async function generateImage(prompt, type = 'image') {
  // Rate limit picha
  RateLimiter.check('image');

  const email = Session.get('email') || '';
  // Safisha prompt
  const safePrompt = Sanitizer.text(prompt, 500);

  const res = await fetch('/api/image', {
    method : 'POST',
    headers: { 'Content-Type': 'application/json' },
    body   : JSON.stringify({ prompt: safePrompt, type, email })
  });

  const data = await res.json();
  if (!res.ok || data.error) {
    throw new Error(data.error || 'Imeshindwa kutengeneza picha');
  }
  return data;
}

function appendImageMsg(imageBase64, prompt, type, info) {
  const msgs = document.getElementById('chat-msgs');
  if (!msgs) return;

  // Thibitisha imageBase64 ni data URL halisi
  if (!imageBase64 || !imageBase64.startsWith('data:image/')) {
    showToast('❌ Picha si sahihi', 'error');
    return;
  }

  const safePrompt = Sanitizer.text(prompt, 200);
  const safeType   = ['image','logo','design'].includes(type) ? type : 'image';
  const remaining  = parseInt(info.remaining) || 0;
  const limit      = parseInt(info.limit)     || 0;

  const wrap = document.createElement('div');
  wrap.className = 'msg ai';

  const av = document.createElement('div');
  av.className = 'msg-av';
  av.innerHTML = '<img src="assets/logo.jpeg" style="width:100%;height:100%;object-fit:cover;border-radius:50%">';

  const bubWrap = document.createElement('div');
  bubWrap.style.cssText = 'display:flex;flex-direction:column;gap:8px;min-width:0;flex:1';

  const textBub = document.createElement('div');
  textBub.className = 'msg-bub';
  textBub.innerHTML = formatText(
    `Picha yako iko hapa! 🎨\n\n• Aina: ${safeType === 'logo' ? 'Logo' : safeType === 'design' ? 'Design/Poster' : 'Picha'}\n• Zimebaki: ${remaining} kati ya ${limit} za mwezi huu`
  );

  const imgContainer = document.createElement('div');
  imgContainer.style.cssText = 'border-radius:12px;overflow:hidden;border:2px solid var(--gold);max-width:400px;box-shadow:0 4px 16px rgba(0,0,0,.15)';

  const img = document.createElement('img');
  img.src   = imageBase64;
  img.style.cssText = 'width:100%;display:block';
  img.alt   = safePrompt; // Safe — textContent not innerHTML

  imgContainer.appendChild(img);

  const dlBtn = document.createElement('button');
  dlBtn.style.cssText = 'margin-top:6px;background:linear-gradient(135deg,var(--gold),var(--green));color:#fff;border:none;border-radius:8px;padding:8px 16px;font-size:.8rem;cursor:pointer;font-family:var(--font);font-weight:600;display:flex;align-items:center;gap:6px;max-width:400px';
  dlBtn.textContent = '⬇️ Download Picha'; // textContent — salama
  dlBtn.onclick = () => {
    const a = document.createElement('a');
    a.href     = imageBase64;
    a.download = `AJPLUS-AI-${safeType}-${Date.now()}.jpg`;
    a.click();
    showToast('✅ Picha imehifadhiwa!', 'success');
  };

  bubWrap.appendChild(textBub);
  bubWrap.appendChild(imgContainer);
  bubWrap.appendChild(dlBtn);
  wrap.appendChild(av);
  wrap.appendChild(bubWrap);
  msgs.appendChild(wrap);
  msgs.scrollTop = msgs.scrollHeight;
}

/* ══════════════════════════════════════════════════
   🔒 CHAT — Imeboreshwa kwa Usalama + Rate Limiting
══════════════════════════════════════════════════ */
const LOGS_KEY  = 'ajplus_chat_logs';
let chatHistory = [];
let chatLoading = false;

function initChat() {
  const msgs = document.getElementById('chat-msgs');
  if (!msgs || msgs.children.length > 0) return;
  const user = Session.get('user') || {};
  const name = Sanitizer.name(user.name || 'rafiki');
  appendMsg('ai',
    `Habari ${name}! 👋 Mimi ni **AJPLUS AI** — mshauri wako wa Kitanzania.\n\nNaweza kukusaidia na:\n• Biashara, sheria, afya, elimu, dini na sekta 20 za Tanzania\n• Kuandika barua, CV, invoice na hati za biashara\n• **Kutengeneza picha, logo na design** 🎨\n\nUnahitaji nini leo? 🇹🇿`
  );
}

async function sendMessage() {
  if (chatLoading) return;
  const input = document.getElementById('chat-input');
  const msgRaw = input?.value.trim();
  if (!msgRaw) return;

  // 🔒 Rate limit
  try {
    RateLimiter.check('chat');
  } catch(e) {
    showToast(e.message, 'warning');
    return;
  }

  // 🔒 Safisha ujumbe
  const msg = Sanitizer.text(msgRaw, 2000);
  if (!msg) return;

  input.value = '';
  autoGrow(input);
  chatLoading = true;

  const sendBtn = document.getElementById('send-btn');
  if (sendBtn) sendBtn.disabled = true;

  appendMsg('user', msg);

  // ── PICHA ──
  if (isImageRequest(msg)) {
    const typing = showTypingLogo();
    try {
      const type = detectImageType(msg);
      const data = await generateImage(msg, type);

      // 🔒 Thibitisha data.image ipo na ni salama
      if (!data.image || typeof data.image !== 'string') {
        throw new Error('Jibu si sahihi kutoka seva');
      }

      typing.remove();
      appendImageMsg(data.image, msg, type, data);
      showToast('🎨 Picha imekamilika!', 'success');
    } catch(err) {
      typing.remove();
      const safeErr = Sanitizer.text(err.message, 200);
      if (safeErr.includes('Mpango') || safeErr.includes('zimeisha')) {
        appendMsg('ai', `🔒 ${safeErr}\n\nLipa kwenye ajplusai.co.tz`);
      } else {
        appendMsg('ai', `⚠️ Samahani, imeshindwa kutengeneza picha.\n\nJaribu tena au eleza zaidi unachotaka!`);
      }
    } finally {
      chatLoading = false;
      if (sendBtn) sendBtn.disabled = false;
      input?.focus();
    }
    return;
  }

  // ── CHAT YA KAWAIDA ──
  chatHistory.push({ role: 'user', content: msg });
  const typing = showTypingLogo();

  try {
    const email = Session.get('email') || '';

    const res = await fetch('/api/chat', {
      method : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body   : JSON.stringify({
        message: msg,
        history: chatHistory.slice(-10).map(h => ({
          role   : h.role === 'user' ? 'user' : 'assistant',
          content: Sanitizer.text(h.content, 1000)
        })),
        email
      }),
    });

    const data = await res.json();
    typing.remove();

    if (!res.ok || data.error) {
      if (data.showActivation) {
        if (typeof checkTrialStatus === 'function') checkTrialStatus(0, 'trial');
        return;
      }
      throw new Error(data.error || 'Hitilafu ya seva');
    }

    // 🔒 Thibitisha reply ipo
    const reply = typeof data.reply === 'string' ? data.reply :
                  typeof data.content === 'string' ? data.content : '';
    if (!reply) throw new Error('Jibu tupu kutoka seva');

    appendMsg('ai', reply);
    chatHistory.push({ role: 'assistant', content: reply });
    saveLog(msg, 'ok');

    if (typeof checkTrialStatus === 'function') {
      checkTrialStatus(data.trialDaysLeft, data.plan);
    }

  } catch(err) {
    typing.remove();
    const safeErr = Sanitizer.text(err.message, 200);
    appendMsg('ai', '⚠️ Samahani, kuna hitilafu. Jaribu tena.');
    saveLog(msg, 'error');
    console.error('Chat error:', safeErr); // Dev logging tu
  } finally {
    chatLoading = false;
    if (sendBtn) sendBtn.disabled = false;
    input?.focus();
  }
}

function appendMsg(role, text) {
  const msgs = document.getElementById('chat-msgs');
  if (!msgs) return;

  const safeRole = role === 'ai' ? 'ai' : 'user';
  const wrap = document.createElement('div');
  wrap.className = 'msg ' + safeRole;

  const av = document.createElement('div');
  av.className = 'msg-av';

  if (safeRole === 'ai') {
    const img = document.createElement('img');
    img.src   = 'assets/logo.jpeg';
    img.style.cssText = 'width:100%;height:100%;object-fit:cover;border-radius:50%';
    img.alt   = 'AJPLUS AI';
    av.appendChild(img);
  } else {
    const user = Session.get('user') || {};
    av.style.cssText = 'background:linear-gradient(135deg,var(--gold),var(--green));display:flex;align-items:center;justify-content:center;color:#fff;font-size:.7rem;font-weight:700;border-radius:50%;width:28px;height:28px;flex-shrink:0';
    // 🔒 textContent badala ya innerHTML
    av.textContent = Sanitizer.name(user.name || 'W')[0].toUpperCase();
  }

  const bub = document.createElement('div');
  bub.className = 'msg-bub';
  bub.innerHTML = formatText(typeof text === 'string' ? text : '');

  const bubWrap = document.createElement('div');
  bubWrap.style.cssText = 'display:flex;flex-direction:column;gap:4px;min-width:0;flex:1';
  bubWrap.appendChild(bub);

  if (safeRole === 'ai') {
    const actions = document.createElement('div');
    actions.style.cssText = 'display:flex;gap:5px;padding:2px 0 0 2px;opacity:0;transition:opacity .2s';

    const btns = [
      { fn: 'copyText',  icon: '📋', label: 'Nakili'    },
      { fn: 'savePDF',   icon: '📄', label: 'PDF'       },
      { fn: 'saveWord',  icon: '📝', label: 'Word'      },
      { fn: 'shareWA',   icon: '💬', label: 'WhatsApp'  }
    ];

    btns.forEach(({ fn, icon, label }) => {
      const btn = document.createElement('button');
      btn.style.cssText = 'background:none;border:1px solid var(--border);border-radius:6px;padding:3px 8px;font-size:.65rem;color:var(--muted);cursor:pointer;font-family:var(--font);transition:all .15s;display:flex;align-items:center;gap:3px';
      const iconSpan  = document.createElement('span');
      const labelSpan = document.createElement('span');
      iconSpan.textContent  = icon;
      labelSpan.textContent = label;
      btn.appendChild(iconSpan);
      btn.appendChild(labelSpan);
      // 🔒 Tumia function reference — si innerHTML onclick
      btn.addEventListener('click', () => window[fn]?.(btn));
      actions.appendChild(btn);
    });

    wrap.addEventListener('mouseenter', () => actions.style.opacity = '1');
    wrap.addEventListener('mouseleave', () => actions.style.opacity = '0');
    bubWrap.appendChild(actions);
  }

  wrap.appendChild(av);
  wrap.appendChild(bubWrap);
  msgs.appendChild(wrap);
  msgs.scrollTop = msgs.scrollHeight;
}

function getMsgText(btn) {
  return btn.closest('.msg')?.querySelector('.msg-bub')?.innerText || '';
}

function copyText(btn) {
  const text = getMsgText(btn);
  if (!text) return;
  navigator.clipboard.writeText(text).then(() => {
    const span = btn.querySelector('span:last-child');
    if (span) {
      span.textContent = 'Imenakiliwa!';
      setTimeout(() => { span.textContent = 'Nakili'; }, 2000);
    }
  }).catch(() => showToast('❌ Imeshindwa kunakili', 'error'));
}

function savePDF(btn) {
  const text = getMsgText(btn);
  if (!text) return;
  try {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF({ unit: 'mm', format: 'a4' });
    const W = doc.internal.pageSize.getWidth();
    const H = doc.internal.pageSize.getHeight();
    const margin   = 18;
    const contentW = W - margin * 2;

    const GOLD   = [201, 168, 76];
    const GREEN  = [30,  181, 58];
    const DARK   = [26,  26,  26];
    const WHITE  = [255, 255, 255];
    const MUTED  = [136, 136, 136];
    const BGPAGE = [250, 249, 246];

    doc.setFillColor(...BGPAGE); doc.rect(0, 0, W, H, 'F');
    doc.setFillColor(...GOLD);   doc.rect(0, 0, W, 22, 'F');
    doc.setFillColor(...GREEN);  doc.rect(0, 22, W, 1.5, 'F');
    doc.setFillColor(...DARK);   doc.circle(margin + 6, 11, 6, 'F');
    doc.setTextColor(...WHITE);
    doc.setFontSize(7); doc.setFont('helvetica', 'bold');
    doc.text('AJ', margin + 6, 13, { align: 'center' });
    doc.setFontSize(14); doc.text('AJPLUS AI', margin + 15, 10);
    doc.setFontSize(7.5); doc.setFont('helvetica', 'normal');
    doc.text('Mshauri wa Kwanza wa Kitanzania', margin + 15, 16);
    doc.text('ajplusai.co.tz', W - margin, 10, { align: 'right' });
    doc.text('+255 670 307 647', W - margin, 16, { align: 'right' });

    let y = 34;
    doc.setFillColor(...GOLD);
    doc.roundedRect(margin, y, contentW, 10, 2, 2, 'F');
    doc.setTextColor(...WHITE); doc.setFontSize(11); doc.setFont('helvetica', 'bold');
    doc.text('JIBU LA AJPLUS AI', W / 2, y + 7, { align: 'center' });

    y += 14;
    const now    = new Date();
    const dateStr = now.toLocaleDateString('sw-TZ', {
      day: '2-digit', month: 'long', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
    doc.setFontSize(8); doc.setFont('helvetica', 'normal');
    doc.setTextColor(...MUTED); doc.text(`Tarehe: ${dateStr}`, margin, y);
    y += 4;
    doc.setDrawColor(...GOLD); doc.setLineWidth(0.5);
    doc.line(margin, y, W - margin, y);
    y += 8;
    doc.setTextColor(...DARK); doc.setFontSize(10.5); doc.setFont('helvetica', 'normal');

    const lines     = doc.splitTextToSize(text, contentW);
    const lineH     = 6;
    const pageBottom = H - 22;

    for (let i = 0; i < lines.length; i++) {
      if (y + lineH > pageBottom) {
        doc.addPage();
        doc.setFillColor(...BGPAGE); doc.rect(0, 0, W, H, 'F');
        doc.setFillColor(...GOLD);   doc.rect(0, 0, W, 12, 'F');
        doc.setFillColor(...GREEN);  doc.rect(0, 12, W, 0.8, 'F');
        doc.setTextColor(...WHITE);  doc.setFontSize(8); doc.setFont('helvetica', 'bold');
        doc.text('AJPLUS AI', margin, 8);
        doc.setFont('helvetica', 'normal'); doc.setFontSize(7);
        doc.text('ajplusai.co.tz', W - margin, 8, { align: 'right' });
        y = 20; doc.setTextColor(...DARK); doc.setFontSize(10.5); doc.setFont('helvetica', 'normal');
      }
      doc.text(lines[i], margin, y); y += lineH;
    }

    const pageCount = doc.internal.getNumberOfPages();
    for (let p = 1; p <= pageCount; p++) {
      doc.setPage(p);
      doc.setFillColor(...GOLD); doc.rect(0, H - 14, W, 14, 'F');
      doc.setTextColor(...WHITE); doc.setFontSize(7.5); doc.setFont('helvetica', 'normal');
      doc.text(`Ukurasa ${p} / ${pageCount}`, margin, H - 5);
      doc.text('© 2025 AJ PLUS COMPANY LIMITED — ajplusai.co.tz', W / 2, H - 5, { align: 'center' });
      doc.text(dateStr, W - margin, H - 5, { align: 'right' });
    }
    doc.save(`AJPLUS-AI-${now.getTime()}.pdf`);
    showToast('✅ PDF nzuri imehifadhiwa!', 'success');
  } catch(e) {
    showToast('❌ Tatizo: ' + Sanitizer.text(e.message, 100), 'error');
  }
}

function saveWord(btn) {
  const text = getMsgText(btn);
  if (!text) return;
  const now  = new Date().toLocaleDateString('sw-TZ');
  // Safisha text kabla ya HTML
  const safeText = text
    .replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')
    .replace(/\n/g,'<br>');
  const html = `<html xmlns:o='urn:schemas-microsoft-com:office:office'
    xmlns:w='urn:schemas-microsoft-com:office:word'
    xmlns='http://www.w3.org/TR/REC-html40'>
<head><meta charset="UTF-8">
<style>body{font-family:Calibri,Arial,sans-serif;font-size:11pt;color:#1A1A1A;margin:2cm}
.h{background:#C9A84C;color:white;padding:12px 16px}.gb{background:#1EB53A;height:4px;margin-bottom:20px}
.t{background:#C9A84C;color:white;padding:7px 14px;font-weight:bold;margin-bottom:14px}
.m{color:#888;font-size:9pt;margin-bottom:10px;border-bottom:1px solid #C9A84C;padding-bottom:8px}
.c{line-height:1.7}.f{margin-top:30px;border-top:2px solid #C9A84C;padding-top:8px;color:#888;font-size:8pt}</style>
</head><body>
<div class="h"><h1 style="margin:0;font-size:16pt">AJPLUS AI</h1>
<p style="margin:3px 0 0;font-size:9pt;opacity:.85">Mshauri wa Kwanza wa Kitanzania | ajplusai.co.tz</p></div>
<div class="gb"></div>
<div class="t">JIBU LA AJPLUS AI</div>
<div class="m">Tarehe: ${now}</div>
<div class="c">${safeText}</div>
<div class="f">© 2025 AJ PLUS COMPANY LIMITED — ajplusai.co.tz</div>
</body></html>`;

  const a = Object.assign(document.createElement('a'), {
    href    : URL.createObjectURL(new Blob(['\ufeff' + html], { type: 'application/msword' })),
    download: `AJPLUS-AI-${Date.now()}.doc`
  });
  a.click();
  showToast('✅ Word imehifadhiwa!', 'success');
}

function shareWA(btn) {
  const text = getMsgText(btn);
  if (!text) return;
  const safeText = text.slice(0, 500);
  window.open(
    'https://wa.me/?text=' + encodeURIComponent('*AJPLUS AI* 🇹🇿\n\n' + safeText),
    '_blank', 'noopener,noreferrer'
  );
}

/* ── TYPING ANIMATION ── */
function showTypingLogo() {
  const msgs = document.getElementById('chat-msgs');
  const wrap = document.createElement('div');
  wrap.className = 'msg ai';

  const av = document.createElement('div');
  av.className = 'msg-av';
  av.style.cssText = 'overflow:visible';
  const img = document.createElement('img');
  img.src   = 'assets/logo.jpeg';
  img.style.cssText = 'width:28px;height:28px;object-fit:cover;border-radius:50%;border:2px solid var(--gold);animation:spin 1.2s linear infinite;box-shadow:0 0 8px rgba(201,168,76,.4)';
  img.alt = 'AJPLUS AI';
  av.appendChild(img);

  const bub = document.createElement('div');
  bub.className = 'msg-bub';
  bub.style.cssText = 'padding:10px 14px;display:flex;align-items:center;gap:6px;color:var(--muted);font-size:.78rem;font-style:italic';

  const label = document.createElement('span');
  label.textContent = 'AJPLUS AI inafikiria';
  const dots = document.createElement('span');
  dots.style.cssText = 'display:flex;gap:3px;align-items:center';
  [0, .2, .4].forEach(delay => {
    const d = document.createElement('span');
    d.style.cssText = `width:4px;height:4px;border-radius:50%;background:var(--gold);animation:pulse 1s ease-in-out infinite ${delay}s`;
    dots.appendChild(d);
  });
  bub.appendChild(label);
  bub.appendChild(dots);

  wrap.appendChild(av);
  wrap.appendChild(bub);
  msgs?.appendChild(wrap);
  if (msgs) msgs.scrollTop = msgs.scrollHeight;
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
    logs.push({
      message: Sanitizer.text(message, 200),
      status,
      time: new Date().toISOString()
    });
    if (logs.length > 200) logs.splice(0, logs.length - 200); // Punguza kutoka 500
    localStorage.setItem(LOGS_KEY, JSON.stringify(logs));
  } catch(_) {}
}

/* ── EXPORT ── */
function getLastReply() {
  const msgs = document.querySelectorAll('.msg.ai .msg-bub');
  return msgs.length ? (msgs[msgs.length - 1].innerText || '') : '';
}

function exportPDF() {
  const title   = Sanitizer.text(document.getElementById('doc-title')?.value || 'AJPLUS AI', 100);
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
  const title   = Sanitizer.text(document.getElementById('doc-title')?.value || 'AJPLUS AI', 100);
  const content = getLastReply();
  if (!content) { showToast('Hakuna jibu la kuexport', 'warning'); return; }
  const safeContent = content
    .replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')
    .replace(/\n/g,'</p><p>');
  const html = `<html><head><meta charset="UTF-8"><title>${title}</title></head><body><h1>${title}</h1><p>${safeContent}</p></body></html>`;
  const a = Object.assign(document.createElement('a'), {
    href    : URL.createObjectURL(new Blob([html], { type: 'application/msword' })),
    download: title + '.doc'
  });
  a.click();
  URL.revokeObjectURL(a.href);
  showToast('✅ Word imehifadhiwa!', 'success');
}

function exportTXT() {
  const title   = Sanitizer.text(document.getElementById('doc-title')?.value || 'AJPLUS AI', 100);
  const content = getLastReply();
  if (!content) { showToast('Hakuna jibu la kuexport', 'warning'); return; }
  const a = Object.assign(document.createElement('a'), {
    href    : URL.createObjectURL(new Blob([title + '\n\n' + content], { type: 'text/plain' })),
    download: title + '.txt'
  });
  a.click();
  URL.revokeObjectURL(a.href);
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
  window.open(
    'https://wa.me/?text=' + encodeURIComponent('*AJPLUS AI* 🇹🇿\n\n' + content.slice(0, 500)),
    '_blank', 'noopener,noreferrer'
  );
}

/* ── REVEAL ANIMATION ── */
const _ro = new IntersectionObserver(
  entries => entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('in'); }),
  { threshold: 0.08 }
);
document.querySelectorAll('.reveal').forEach(el => _ro.observe(el));

/* ── INIT ── */
window.addEventListener('DOMContentLoaded', () => {
  const user = Session.get('user');
  if (user) {
    document.getElementById('nav-guest').style.display = 'none';
    document.getElementById('nav-user').style.display  = 'flex';
    updateNavUser(user.name);
  }
  // Theme
  if (Session.get('theme') === 'dark' || localStorage.getItem('ajplus-dark') === 'true') {
    document.body.classList.add('dark');
    Session.set('theme', 'dark');
  }
});
