// AJPLUS AI — api/poster.js (v2 — SVG + Nano Banana Background)
// Maandishi Sahihi Daima (SVG) + Background ya Kisanaa (Nano Banana)
// © AJ PLUS COMPANY LIMITED | ajplusai.co.tz

const ANTHROPIC_KEY = process.env.ANTHROPIC_API_KEY;
const GEMINI_KEY     = process.env.GEMINI_API_KEY;

// ─── Rangi za Theme (Fallback ikiwa Nano Banana ishindwe) ──
const THEMES = {
  kanisa:   { bg: '#0d1a3a', accent: '#C9A84C', accent2: '#ffffff', text: '#ffffff', sub: '#e0d5b5', icon: '✝' },
  harusi:   { bg: '#1a0a2e', accent: '#E8B84B', accent2: '#ff9ecd', text: '#ffffff', sub: '#f5e6ff', icon: '💍' },
  biashara: { bg: '#0a1628', accent: '#1EB53A', accent2: '#C9A84C', text: '#ffffff', sub: '#d0f0d8', icon: '🚀' },
  default:  { bg: '#0a0f2e', accent: '#C9A84C', accent2: '#1EB53A', text: '#ffffff', sub: '#e0d5b5', icon: '🇹🇿' },
  dini:     { bg: '#0d1a0d', accent: '#1EB53A', accent2: '#C9A84C', text: '#ffffff', sub: '#d0f0d8', icon: '🕌' },
  elimu:    { bg: '#0a1a2e', accent: '#4a9eff', accent2: '#C9A84C', text: '#ffffff', sub: '#d0e8ff', icon: '📚' },
  afya:     { bg: '#0a2e1a', accent: '#1EB53A', accent2: '#ffffff', text: '#ffffff', sub: '#d0f0d8', icon: '🏥' },
  matukio:  { bg: '#2e0a1a', accent: '#ff6b9d', accent2: '#C9A84C', text: '#ffffff', sub: '#ffe0ec', icon: '🎉' },
};

// Maelezo ya background ya kisanaa kwa kila theme — bila maandishi yoyote!
const BG_PROMPTS = {
  kanisa:   'soft blurred church interior background, warm golden light streaming through stained glass windows, bokeh, no text, no people in focus, elegant and peaceful, dark vignette edges for text overlay',
  harusi:   'soft blurred wedding background, elegant flowers, fairy lights bokeh, romantic pink and gold tones, no text, no people in focus, dark vignette edges for text overlay',
  biashara: 'soft blurred modern office or city skyline background, professional blue and green tones, bokeh lights, no text, no people in focus, dark vignette edges for text overlay',
  dini:     'soft blurred mosque interior or geometric Islamic pattern background, warm green and gold tones, no text, no people in focus, dark vignette edges for text overlay',
  elimu:    'soft blurred classroom or books background, blue and gold tones, bokeh, no text, no people in focus, dark vignette edges for text overlay',
  afya:     'soft blurred medical or wellness background, calming green tones, bokeh, no text, no people in focus, dark vignette edges for text overlay',
  matukio:  'soft blurred celebration background, colorful confetti and lights bokeh, festive pink and gold tones, no text, no people in focus, dark vignette edges for text overlay',
  default:  'soft blurred Tanzania-inspired abstract background, gold and green tones, bokeh lights, no text, dark vignette edges for text overlay',
};

function detectTheme(text) {
  const t = text.toLowerCase();
  if (/kanisa|ibada|kristo|yesu|injili|sala|worship|church/.test(t)) return 'kanisa';
  if (/harusi|ndoa|arusi|wedding|pendo|love/.test(t))               return 'harusi';
  if (/biashara|kampuni|duka|company|business|tangazo la/.test(t))  return 'biashara';
  if (/msikiti|dini|swala|ramadhan|eid|allah|mosque/.test(t))       return 'dini';
  if (/shule|elimu|chuo|masomo|school|education/.test(t))           return 'elimu';
  if (/hospitali|afya|daktari|health|hospital/.test(t))             return 'afya';
  if (/sherehe|matukio|karamu|party|event|sikukuu/.test(t))         return 'matukio';
  return 'default';
}

// ─── Gawanya maandishi kwenye mistari ────────────
function wrapText(text, maxChars) {
  const words = text.split(' ');
  const lines = [];
  let current = '';
  for (const word of words) {
    if ((current + ' ' + word).trim().length <= maxChars) {
      current = (current + ' ' + word).trim();
    } else {
      if (current) lines.push(current);
      current = word;
    }
  }
  if (current) lines.push(current);
  return lines;
}

// ─── NANO BANANA — Tengeneza Background ya Kisanaa ──
async function generateBackground(theme) {
  if (!GEMINI_KEY) return null;

  const bgPrompt = BG_PROMPTS[theme] || BG_PROMPTS.default;
  const fullPrompt = `A vertical poster background image, 680x960 aspect ratio: ${bgPrompt}. Absolutely no text, no letters, no words anywhere in the image. Abstract, artistic, professional quality, suitable as a background behind text overlay.`;

  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-image:generateContent?key=${GEMINI_KEY}`;
    const body = {
      contents: [{ parts: [{ text: fullPrompt }] }],
      generationConfig: { responseModalities: ['IMAGE'] }
    };

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });

    if (!response.ok) {
      console.warn('Nano Banana background ilikataa:', response.status);
      return null;
    }

    const data    = await response.json();
    const parts   = data?.candidates?.[0]?.content?.parts || [];
    const imgPart = parts.find(p => p.inlineData || p.inline_data);
    const inline  = imgPart?.inlineData || imgPart?.inline_data;

    if (!inline?.data) return null;

    const mime = inline.mimeType || inline.mime_type || 'image/png';
    return `data:${mime};base64,${inline.data}`;

  } catch(e) {
    console.warn('Background generation error:', e.message);
    return null;
  }
}

// ─── Tengeneza SVG ya Poster (na background ya picha au rangi) ──
function generateSVG(data, bgImageBase64) {
  const theme = THEMES[data.theme] || THEMES.default;
  const W = 680, H = 960;

  const titleLines  = wrapText(data.title.toUpperCase(), 22);
  const subLines    = wrapText(data.subtitle || '', 40);
  const bodyLines   = (data.body || []).slice(0, 5);
  const footer      = data.footer || '';
  const contact     = data.contact || '';
  const location    = data.location || '';
  const date        = data.date || '';

  let y = 0;
  let svg = `<svg width="100%" viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg">`;

  // ── Background: PICHA (Nano Banana) au RANGI (fallback) ──
  if (bgImageBase64) {
    svg += `<defs>
      <clipPath id="bgclip"><rect width="${W}" height="${H}"/></clipPath>
      <linearGradient id="darken" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="${theme.bg}" stop-opacity="0.55"/>
        <stop offset="100%" stop-color="${theme.bg}" stop-opacity="0.75"/>
      </linearGradient>
    </defs>`;
    svg += `<image href="${bgImageBase64}" x="0" y="0" width="${W}" height="${H}" preserveAspectRatio="xMidYMid slice" clip-path="url(#bgclip)"/>`;
    svg += `<rect width="${W}" height="${H}" fill="url(#darken)"/>`; // dark overlay for text legibility
  } else {
    svg += `<rect width="${W}" height="${H}" fill="${theme.bg}"/>`;
  }

  // Mistari ya mapambo juu
  svg += `<rect x="0" y="0" width="${W}" height="6" fill="${theme.accent}"/>`;
  svg += `<rect x="0" y="6" width="${W}" height="3" fill="${theme.accent2}" opacity="0.5"/>`;

  // Mduara wa icon juu katikati
  y = 80;
  svg += `<circle cx="${W/2}" cy="${y}" r="44" fill="${theme.accent}" opacity="0.2"/>`;
  svg += `<circle cx="${W/2}" cy="${y}" r="34" fill="${theme.bg}" opacity="0.85"/>`;
  svg += `<text x="${W/2}" y="${y + 10}" text-anchor="middle" font-size="28" font-family="serif">${theme.icon}</text>`;

  // Kichwa (title)
  y = 170;
  for (const line of titleLines) {
    svg += `<text x="${W/2}" y="${y}" text-anchor="middle" font-family="Georgia,serif" font-size="${titleLines.length > 2 ? 34 : 40}" font-weight="bold" fill="${theme.text}" style="paint-order:stroke;stroke:#000;stroke-opacity:0.25;stroke-width:1px">${escXML(line)}</text>`;
    y += titleLines.length > 2 ? 44 : 52;
  }

  // Mstari wa dhahabu
  y += 10;
  svg += `<rect x="80" y="${y}" width="${W - 160}" height="2" fill="${theme.accent}" opacity="0.8"/>`;
  y += 20;

  // Maneno ya kuelezea (subtitle)
  if (subLines.length > 0) {
    for (const line of subLines) {
      svg += `<text x="${W/2}" y="${y}" text-anchor="middle" font-family="Georgia,serif" font-size="18" fill="${theme.accent}">${escXML(line)}</text>`;
      y += 26;
    }
    y += 10;
  }

  // Sanduku la maudhui
  if (bodyLines.length > 0) {
    const boxH = bodyLines.length * 36 + 30;
    svg += `<rect x="60" y="${y}" width="${W - 120}" height="${boxH}" rx="8" fill="${theme.bg}" opacity="${bgImageBase64 ? 0.45 : 0.08}"/>`;
    svg += `<rect x="60" y="${y}" width="${W - 120}" height="${boxH}" rx="8" fill="none" stroke="${theme.accent}" stroke-width="1" opacity="0.4"/>`;
    y += 30;
    for (const line of bodyLines) {
      svg += `<text x="100" y="${y}" font-family="Georgia,serif" font-size="15" fill="${theme.sub}">&#10003; ${escXML(line)}</text>`;
      y += 32;
    }
    y += 20;
  }

  // Tarehe
  if (date) {
    svg += `<rect x="200" y="${y}" width="${W - 400}" height="36" rx="6" fill="${theme.bg}" opacity="${bgImageBase64 ? 0.5 : 0.15}"/>`;
    svg += `<text x="${W/2}" y="${y + 23}" text-anchor="middle" font-family="Georgia,serif" font-size="15" fill="${theme.accent}">${escXML(date)}</text>`;
    y += 56;
  }

  // Mahali
  if (location) {
    svg += `<text x="${W/2}" y="${y}" text-anchor="middle" font-family="Georgia,serif" font-size="14" fill="${theme.sub}" opacity="0.9">📍 ${escXML(location)}</text>`;
    y += 30;
  }

  // Mstari wa chini
  y += 10;
  svg += `<rect x="80" y="${y}" width="${W - 160}" height="1" fill="${theme.accent}" opacity="0.5"/>`;
  y += 24;

  // Mawasiliano
  if (contact) {
    svg += `<text x="${W/2}" y="${y}" text-anchor="middle" font-family="Georgia,serif" font-size="15" fill="${theme.accent}">💬 ${escXML(contact)}</text>`;
    y += 30;
  }

  // Footer
  if (footer) {
    const footerLines = wrapText(footer, 55);
    for (const line of footerLines) {
      svg += `<text x="${W/2}" y="${y}" text-anchor="middle" font-family="Georgia,serif" font-size="13" fill="${theme.sub}" opacity="0.8" font-style="italic">"${escXML(line)}"</text>`;
      y += 22;
    }
  }

  // Mstari wa chini kabisa
  svg += `<rect x="0" y="${H - 44}" width="${W}" height="2" fill="${theme.accent2}" opacity="0.5"/>`;
  svg += `<rect x="0" y="${H - 6}" width="${W}" height="6" fill="${theme.accent}"/>`;
  svg += `<text x="${W/2}" y="${H - 18}" text-anchor="middle" font-family="Georgia,serif" font-size="12" fill="${theme.accent}" opacity="0.8">ajplusai.co.tz | AJ PLUS COMPANY LIMITED 🇹🇿</text>`;

  svg += `</svg>`;
  return svg;
}

function escXML(str) {
  return String(str || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// ─── Tumia Claude kuchambua maombi ────────────────
async function parsePromptWithClaude(prompt) {
  if (!ANTHROPIC_KEY) {
    return {
      title: prompt.replace(/tengeneza\s*(poster|tangazo|picha)?\s*(ya)?/gi, '').trim().substring(0, 50),
      subtitle: '', body: [], footer: '', contact: '', location: '', date: '',
      theme: detectTheme(prompt)
    };
  }

  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': ANTHROPIC_KEY,
      'anthropic-version': '2023-06-01'
    },
    body: JSON.stringify({
      model: 'claude-haiku-4-5',
      max_tokens: 400,
      messages: [{
        role: 'user',
        content: `Chunguza ombi hili la poster na rudisha JSON tu (bila maelezo yoyote):

Ombi: "${prompt}"

Rudisha JSON hii (fields zote ni za Kiswahili):
{
  "title": "kichwa kikubwa cha poster (maneno 1-5 tu)",
  "subtitle": "maelezo mafupi (maneno 5-10)",
  "body": ["nukta 1", "nukta 2", "nukta 3"],
  "footer": "neno la Biblia/msemo mzuri (kama ipo)",
  "contact": "namba ya simu au email (kama ipo)",
  "location": "mahali (kama pametajwa)",
  "date": "tarehe au wakati (kama imetajwa)",
  "theme": "kanisa|harusi|biashara|dini|elimu|afya|matukio|default"
}`
      }]
    })
  });

  if (!res.ok) throw new Error('Claude haiku ilikataa');

  const data = await res.json();
  const text = data.content?.[0]?.text || '{}';

  try {
    const clean = text.replace(/```json|```/g, '').trim();
    return JSON.parse(clean);
  } catch(e) {
    return {
      title: prompt.substring(0, 40), subtitle: 'Karibu!', body: [],
      footer: '', contact: '', location: '', date: '',
      theme: detectTheme(prompt)
    };
  }
}

function svgToBase64(svg) {
  const encoded = Buffer.from(svg, 'utf8').toString('base64');
  return `data:image/svg+xml;base64,${encoded}`;
}

// ─── HANDLER ──────────────────────────────────────
module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', 'https://ajplusai.co.tz');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST')   return res.status(405).json({ error: 'Method not allowed' });

  try {
    let body = req.body;
    if (typeof body === 'string') {
      try { body = JSON.parse(body); } catch(e) { body = {}; }
    }
    if (!body) body = {};

    const { prompt } = body;

    if (!prompt) {
      return res.status(400).json({ error: 'Maelezo ya poster yanahitajika!' });
    }

    const safePrompt = String(prompt).substring(0, 500).trim();

    // 1) Chunguza ombi kwa Claude → pata title, subtitle, theme, n.k.
    const data = await parsePromptWithClaude(safePrompt);

    // 2) Tengeneza background ya kisanaa kwa Nano Banana (kama GEMINI_KEY ipo)
    //    Ikiwa Nano Banana ishindwe, generateSVG() itatumia rangi ya theme
    //    badala yake (fallback salama, poster bado linakamilika).
    const bgImage = await generateBackground(data.theme);

    // 3) Tengeneza SVG — maandishi sahihi 100% juu ya background
    const svg     = generateSVG(data, bgImage);
    const base64  = svgToBase64(svg);

    return res.status(200).json({
      success: true,
      image:   base64,
      type:    'poster',
      source:  bgImage ? 'svg+nanobanana' : 'svg-only',
      title:   data.title,
      theme:   data.theme,
      message: bgImage
        ? 'Poster imekamilika! Background ya kisanaa + maandishi sahihi 100%!'
        : 'Poster imekamilika! Maandishi yako yako sahihi 100%!'
    });

  } catch(err) {
    console.error('Poster error:', err.message);
    return res.status(500).json({ error: 'Kosa: ' + err.message });
  }
};
