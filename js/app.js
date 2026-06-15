/* ═══════════════════════════════════════════════════
   AJPLUS AI — app.js
   Faili kuu la frontend (js/app.js)
═══════════════════════════════════════════════════ */

const API_URL   = '/api/chat';
const LOGS_KEY  = 'ajplus_chat_logs';

// ── DOM refs ──────────────────────────────────────
const chatBox   = document.getElementById('chat-box');
const userInput = document.getElementById('user-input');
const sendBtn   = document.getElementById('send-btn');

// ── Hali ya mazungumzo ────────────────────────────
let conversationHistory = [];
let isLoading           = false;

// ── Tuma ujumbe ───────────────────────────────────
async function sendMessage () {
  if (isLoading) return;

  const message = userInput.value.trim();
  if (!message) return;

  userInput.value = '';
  isLoading       = true;
  sendBtn.disabled = true;

  appendMessage('user', message);
  conversationHistory.push({ role: 'user', content: message });

  const typingEl = showTyping();

  try {
    const res = await fetch(API_URL, {
      method  : 'POST',
      headers : { 'Content-Type': 'application/json' },
      body    : JSON.stringify({ message, history: conversationHistory }),
    });

    const data = await res.json();

    typingEl.remove();

    if (!res.ok || data.error) throw new Error(data.error || 'Hitilafu ya seva');

    const reply = data.reply || data.content || '';
    appendMessage('assistant', reply);
    conversationHistory.push({ role: 'assistant', content: reply });

    saveLog(message, 'ok');

  } catch (err) {
    typingEl.remove();
    appendMessage('assistant', `⚠️ Samahani, kuna hitilafu: ${err.message}`);
    saveLog(message, 'error');
  } finally {
    isLoading        = false;
    sendBtn.disabled = false;
    userInput.focus();
  }
}

// ── Onyesha ujumbe kwenye screen ──────────────────
function appendMessage (role, text) {
  const wrap = document.createElement('div');
  wrap.className = `message ${role}`;

  const bubble = document.createElement('div');
  bubble.className = 'bubble';
  bubble.innerHTML = formatText(text);

  wrap.appendChild(bubble);
  chatBox.appendChild(wrap);
  chatBox.scrollTop = chatBox.scrollHeight;
}

// ── Typing indicator ──────────────────────────────
function showTyping () {
  const wrap = document.createElement('div');
  wrap.className = 'message assistant typing-wrap';
  wrap.innerHTML = `<div class="bubble typing">
    <span></span><span></span><span></span>
  </div>`;
  chatBox.appendChild(wrap);
  chatBox.scrollTop = chatBox.scrollHeight;
  return wrap;
}

// ── Format maandishi (markdown kidogo) ────────────
function formatText (text) {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g,     '<em>$1</em>')
    .replace(/`(.*?)`/g,       '<code>$1</code>')
    .replace(/\n/g,            '<br>');
}

// ── Hifadhi log kwenye localStorage ──────────────
function saveLog (message, status) {
  try {
    const logs = JSON.parse(localStorage.getItem(LOGS_KEY) || '[]');
    logs.push({ message, status, time: new Date().toISOString() });
    // Hifadhi logs 500 za mwisho tu
    if (logs.length > 500) logs.splice(0, logs.length - 500);
    localStorage.setItem(LOGS_KEY, JSON.stringify(logs));
  } catch (_) {}
}

// ── Futa mazungumzo ───────────────────────────────
function clearChat () {
  chatBox.innerHTML         = '';
  conversationHistory       = [];
  appendMessage('assistant', 'Habari! Mimi ni AJPLUS AI. Naweza kukusaidia nini leo? 🤖');
}

// ── Event listeners ───────────────────────────────
sendBtn.addEventListener('click', sendMessage);

userInput.addEventListener('keydown', e => {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    sendMessage();
  }
});

// ── Salamu ya kwanza ──────────────────────────────
window.addEventListener('DOMContentLoaded', () => {
  appendMessage('assistant', 'Habari! Mimi ni AJPLUS AI. Naweza kukusaidia nini leo? 🤖');
  userInput.focus();
});
