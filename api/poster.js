// AJPLUS AI — api/poster.js (v3 — SVG Kitaalamu, Inayoaminika 100%)
// Maandishi Sahihi Daima + Muundo wa Kisanaa wa SVG (HAITUMII AI ya picha)
// Sababu: AI za picha (Nano Banana, Stability, n.k.) hazina uwezo wa kuandika
// maneno mengi kwa usahihi kwenye picha — hii ni udhaifu wa teknolojia nzima
// duniani, sio kasoro ya mfumo wetu. SVG inahakikisha maandishi ni sahihi 100%
// na haiwezi "kushindwa" kama API ya nje — muhimu kwa wateja wanaolipa.
// © AJ PLUS COMPANY LIMITED | ajplusai.co.tz

const ANTHROPIC_KEY = process.env.ANTHROPIC_API_KEY;

// ─── Rangi na Mapambo ya Theme ───────────────────────────────
// Kila theme ina: bg (rangi ya msingi), bg2 (rangi ya pili ya gradient),
// accent (rangi kuu ya mapambo/dhahabu), accent2 (rangi ya pili),
// text (rangi ya maandishi makuu), sub (rangi ya maelezo), pattern (aina ya mapambo)
const THEMES = {
  baba: {
    bg: '#0b1f3a', bg2: '#13294b', accent: '#d4af37', accent2: '#f6e27a',
    text: '#ffffff', sub: '#cfe0f5', pattern: 'star', icon: 'star'
  },
  mama: {
    bg: '#3a0b1f', bg2: '#4b1329', accent: '#e8b84b', accent2: '#ff9ecd',
    text: '#ffffff', sub: '#f5d5e6', pattern: 'flower', icon: 'heart'
  },
  kanisa: {
    bg: '#0d1a3a', bg2: '#16234d', accent: '#C9A84C', accent2: '#ffffff',
    text: '#ffffff', sub: '#e0d5b5', pattern: 'cross', icon: 'cross'
  },
  harusi: {
    bg: '#2a0a3a', bg2: '#3a1050', accent: '#E8B84B', accent2: '#ff9ecd',
    text: '#ffffff', sub: '#f5e6ff', pattern: 'flower', icon: 'rings'
  },
  biashara: {
    bg: '#0a1628', bg2: '#0f2238', accent: '#1EB53A', accent2: '#C9A84C',
    text: '#ffffff', sub: '#d0f0d8', pattern: 'grid', icon: 'bolt'
  },
  dini: {
    bg: '#0d1a0d', bg2: '#13260f', accent: '#1EB53A', accent2: '#C9A84C',
    text: '#ffffff', sub: '#d0f0d8', pattern: 'geo', icon: 'star8'
  },
  elimu: {
    bg: '#0a1a2e', bg2: '#0f2640', accent: '#4a9eff', accent2: '#C9A84C',
    text: '#ffffff', sub: '#d0e8ff', pattern: 'grid', icon: 'book'
  },
  afya: {
    bg: '#0a2e1a', bg2: '#0f3a24', accent: '#1EB53A', accent2: '#ffffff',
    text: '#ffffff', sub: '#d0f0d8', pattern: 'cross', icon: 'cross'
  },
  matukio: {
    bg: '#2e0a1a', bg2: '#3a1024', accent: '#ff6b9d', accent2: '#C9A84C',
    text: '#ffffff', sub: '#ffe0ec', pattern: 'confetti', icon: 'star'
  },
  uhuru: {
    bg: '#0a1f0f', bg2: '#0f2a14', accent: '#1EB53A', accent2: '#0033A0',
    text: '#ffffff', sub: '#d0f0d8', pattern: 'flag', icon: 'star'
  },
  default: {
    bg: '#0a0f2e', bg2: '#101840', accent: '#C9A84C', accent2: '#1EB53A',
    text: '#ffffff', sub: '#e0d5b5', pattern: 'geo', icon: 'star'
  },
};

function detectTheme(text) {
  const t = text.toLowerCase();
  if (/\bbaba\b|father|wababa/.test(t) && !/mama/.test(t))           return 'baba';
  if (/\bmama\b|mother|akina mama/.test(t))                          return 'mama';
  if (/kanisa|ibada|kristo|yesu|injili|sala|worship|church/.test(t)) return 'kanisa';
  if (/harusi|ndoa|arusi|wedding|pendo wa ndoa/.test(t))             return 'harusi';
  if (/biashara|kampuni|duka|company|business|tangazo la/.test(t))  return 'biashara';
  if (/msikiti|dini|swala|ramadhan|eid|allah|mosque/.test(t))       return 'dini';
  if (/shule|elimu|chuo|masomo|school|education/.test(t))           return 'elimu';
  if (/hospitali|afya|daktari|health|hospital/.test(t))             return 'afya';
  if (/uhuru|taifa|nchi|jamhuri|independence/.test(t))              return 'uhuru';
  if (/sherehe|matukio|karamu|party|event|sikukuu/.test(t))         return 'matukio';
  return 'default';
}

// ─── Gawanya maandishi kwenye mistari ────────────────────────
function wrapText(text, maxChars) {
  const words = String(text || '').split(' ').filter(Boolean);
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

function escXML(str) {
  return String(str || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// ─── Alama za Icon (njia ya SVG path, sio emoji — hazivurugiki) ──
function renderIcon(type, cx, cy, color, size) {
  const s = size || 1;
  switch (type) {
    case 'star':
      return starPath(cx, cy, 22 * s, 10 * s, 5, color);
    case 'star8':
      return starPath(cx, cy, 22 * s, 13 * s, 8, color);
    case 'heart':
      return `<path d="M${cx} ${cy + 14 * s} C${cx - 26 * s} ${cy - 8 * s}, ${cx - 14 * s} ${cy - 26 * s}, ${cx} ${cy - 10 * s} C${cx + 14 * s} ${cy - 26 * s}, ${cx + 26 * s} ${cy - 8 * s}, ${cx} ${cy + 14 * s} Z" fill="${color}"/>`;
    case 'cross':
      return `<rect x="${cx - 4 * s}" y="${cy - 20 * s}" width="${8 * s}" height="${40 * s}" rx="2" fill="${color}"/>
              <rect x="${cx - 16 * s}" y="${cy - 6 * s}" width="${32 * s}" height="${8 * s}" rx="2" fill="${color}"/>`;
    case 'rings':
      return `<circle cx="${cx - 11 * s}" cy="${cy}" r="${13 * s}" fill="none" stroke="${color}" stroke-width="${3 * s}"/>
              <circle cx="${cx + 11 * s}" cy="${cy}" r="${13 * s}" fill="none" stroke="${color}" stroke-width="${3 * s}"/>`;
    case 'bolt':
      return `<path d="M${cx + 6 * s} ${cy - 22 * s} L${cx - 14 * s} ${cy + 4 * s} L${cx - 2 * s} ${cy + 4 * s} L${cx - 6 * s} ${cy + 22 * s} L${cx + 14 * s} ${cy - 6 * s} L${cx + 2 * s} ${cy - 6 * s} Z" fill="${color}"/>`;
    case 'book':
      return `<path d="M${cx - 20 * s} ${cy - 14 * s} L${cx} ${cy - 18 * s} L${cx + 20 * s} ${cy - 14 * s} L${cx + 20 * s} ${cy + 16 * s} L${cx} ${cy + 12 * s} L${cx - 20 * s} ${cy + 16 * s} Z" fill="none" stroke="${color}" stroke-width="${2.5 * s}"/>
              <line x1="${cx}" y1="${cy - 18 * s}" x2="${cx}" y2="${cy + 12 * s}" stroke="${color}" stroke-width="${2.5 * s}"/>`;
    default:
      return starPath(cx, cy, 22 * s, 10 * s, 5, color);
  }
}

function starPath(cx, cy, outerR, innerR, points, color) {
  let path = '';
  const step = Math.PI / points;
  for (let i = 0; i < points * 2; i++) {
    const r = i % 2 === 0 ? outerR : innerR;
    const angle = i * step - Math.PI / 2;
    const x = cx + r * Math.cos(angle);
    const y = cy + r * Math.sin(angle);
    path += (i === 0 ? `M${x.toFixed(1)} ${y.toFixed(1)}` : ` L${x.toFixed(1)} ${y.toFixed(1)}`);
  }
  path += ' Z';
  return `<path d="${path}" fill="${color}"/>`;
}

// ─── Mapambo ya nyuma kulingana na "pattern" ya theme ────────
// Hii ndiyo inayofanya poster ionekane ya kitaalamu na "kushiba" badala
// ya kuwa tupu — bila kutegemea AI ya picha ya nje.
function renderPattern(pattern, theme, W, H) {
  let s = `<g opacity="0.10">`;
  switch (pattern) {
    case 'star': // nyota tawanyika
      [[90,130,16],[600,110,12],[70,860,14],[610,840,10],[340,60,18]].forEach(([x,y,r]) => {
        s += starPath(x, y, r, r * 0.45, 5, theme.accent);
      });
      break;
    case 'flower': // maua laini
      [[100,150],[580,180],[90,840],[600,820]].forEach(([x,y]) => {
        for (let i = 0; i < 6; i++) {
          const ang = (i / 6) * Math.PI * 2;
          const px = x + Math.cos(ang) * 26;
          const py = y + Math.sin(ang) * 26;
          s += `<circle cx="${px.toFixed(1)}" cy="${py.toFixed(1)}" r="16" fill="${theme.accent2}"/>`;
        }
        s += `<circle cx="${x}" cy="${y}" r="14" fill="${theme.accent}"/>`;
      });
      break;
    case 'cross':
      [[100,140],[590,160],[80,850],[610,830]].forEach(([x,y]) => {
        s += `<rect x="${x-4}" y="${y-26}" width="8" height="52" fill="${theme.accent}"/>
              <rect x="${x-20}" y="${y-8}" width="40" height="8" fill="${theme.accent}"/>`;
      });
      break;
    case 'grid': // mistari ya kisasa / kibiashara
      for (let x = 40; x < W; x += 80) s += `<line x1="${x}" y1="0" x2="${x}" y2="${H}" stroke="${theme.accent}" stroke-width="0.5"/>`;
      for (let y = 40; y < H; y += 80) s += `<line x1="0" y1="${y}" x2="${W}" y2="${y}" stroke="${theme.accent}" stroke-width="0.5"/>`;
      break;
    case 'geo': // maumbo ya kijiometri (Kiislamu/jumla)
      [[80,120,40],[600,150,55],[70,850,45],[610,820,35],[340,50,30]].forEach(([x,y,r]) => {
        s += `<circle cx="${x}" cy="${y}" r="${r}" fill="none" stroke="${theme.accent}" stroke-width="1"/>`;
      });
      break;
    case 'confetti': // sherehe
      const colors = [theme.accent, theme.accent2, '#ffffff'];
      for (let i = 0; i < 30; i++) {
        const x = (i * 53) % W;
        const y = (i * 97) % H;
        const c = colors[i % colors.length];
        if (i % 3 === 0) s += `<circle cx="${x}" cy="${y}" r="4" fill="${c}"/>`;
        else if (i % 3 === 1) s += `<rect x="${x}" y="${y}" width="8" height="8" fill="${c}" transform="rotate(${(i*12)%360} ${x} ${y})"/>`;
        else s += starPath(x, y, 7, 3, 5, c);
      }
      break;
    case 'flag': // kupigwa kwa mistari kama bendera
      for (let y = 0; y < H; y += 140) {
        s += `<rect x="0" y="${y}" width="${W}" height="6" fill="${theme.accent}"/>`;
      }
      break;
    default:
      break;
  }
  s += `</g>`;
  return s;
}

// ─── Tengeneza SVG ya Poster — Kitaalamu na Mapambo Mengi ────
function generateSVG(data) {
  const theme = THEMES[data.theme] || THEMES.default;
  const W = 680, H = 960;

  const titleLines = wrapText(String(data.title || '').toUpperCase(), 20);
  const subLines    = wrapText(data.subtitle || '', 38);
  const bodyLines   = (data.body || []).slice(0, 5);
  const footer      = data.footer || '';
  const contact     = data.contact || '';
  const location    = data.location || '';
  const date        = data.date || '';

  let y = 0;
  let svg = `<svg width="100%" viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg" role="img">`;
  svg += `<title>${escXML(data.title || 'Poster')}</title>`;

  // ── Background gradient (rangi mbili za theme, sio rangi tupu) ──
  svg += `<defs>
    <linearGradient id="bgGrad" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="${theme.bg}"/>
      <stop offset="55%" stop-color="${theme.bg2}"/>
      <stop offset="100%" stop-color="${theme.bg}"/>
    </linearGradient>
    <linearGradient id="goldLine" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="${theme.accent}" stop-opacity="0.3"/>
      <stop offset="50%" stop-color="${theme.accent}" stop-opacity="1"/>
      <stop offset="100%" stop-color="${theme.accent}" stop-opacity="0.3"/>
    </linearGradient>
  </defs>`;
  svg += `<rect width="${W}" height="${H}" fill="url(#bgGrad)"/>`;

  // ── Mapambo ya nyuma (pattern ya theme) ──
  svg += renderPattern(theme.pattern, theme, W, H);

  // ── Fremu ya juu na chini (mistari mizito ya brand) ──
  svg += `<rect x="0" y="0" width="${W}" height="8" fill="${theme.accent}"/>`;
  svg += `<rect x="0" y="8" width="${W}" height="3" fill="${theme.accent2}" opacity="0.6"/>`;

  // ── Icon kwenye mduara, juu katikati ──
  y = 95;
  svg += `<circle cx="${W/2}" cy="${y}" r="50" fill="${theme.accent}" opacity="0.15"/>`;
  svg += `<circle cx="${W/2}" cy="${y}" r="40" fill="${theme.bg}" stroke="${theme.accent}" stroke-width="2" opacity="0.95"/>`;
  svg += renderIcon(theme.icon, W/2, y, theme.accent, 1);

  // ── Kichwa kikubwa (title) ──
  y = 200;
  const titleSize = titleLines.length > 2 ? 32 : 42;
  const titleStep = titleLines.length > 2 ? 42 : 54;
  for (const line of titleLines) {
    svg += `<text x="${W/2}" y="${y}" text-anchor="middle" font-family="Georgia,serif" font-size="${titleSize}" font-weight="bold" fill="${theme.text}" letter-spacing="1">${escXML(line)}</text>`;
    y += titleStep;
  }

  // ── Mstari wa dhahabu wenye gradient (badala ya mstari tupu) ──
  y += 14;
  svg += `<rect x="100" y="${y}" width="${W - 200}" height="3" fill="url(#goldLine)"/>`;
  y += 18;
  // Almasi ndogo katikati ya mstari — undani wa kisanaa
  svg += `<rect x="${W/2 - 6}" y="${y - 21}" width="12" height="12" fill="${theme.accent}" transform="rotate(45 ${W/2} ${y - 15})"/>`;
  y += 26;

  // ── Maelezo (subtitle) — yenye mghuso wa "quote" ──
  if (subLines.length > 0) {
    for (const line of subLines) {
      svg += `<text x="${W/2}" y="${y}" text-anchor="middle" font-family="Georgia,serif" font-style="italic" font-size="19" fill="${theme.accent2}">${escXML(line)}</text>`;
      y += 27;
    }
    y += 14;
  }

  // ── Sanduku la maudhui (orodha ya nukta) ──
  if (bodyLines.length > 0) {
    const boxH = bodyLines.length * 36 + 36;
    svg += `<rect x="55" y="${y}" width="${W - 110}" height="${boxH}" rx="10" fill="${theme.accent}" opacity="0.08"/>`;
    svg += `<rect x="55" y="${y}" width="${W - 110}" height="${boxH}" rx="10" fill="none" stroke="${theme.accent}" stroke-width="1" opacity="0.5"/>`;
    y += 34;
    for (const line of bodyLines) {
      svg += `<circle cx="92" cy="${y - 5}" r="4" fill="${theme.accent}"/>`;
      svg += `<text x="108" y="${y}" font-family="Georgia,serif" font-size="15.5" fill="${theme.sub}">${escXML(line)}</text>`;
      y += 34;
    }
    y += 22;
  }

  // ── Tarehe (kwenye pill/badge) ──
  if (date) {
    const dateW = Math.max(180, date.length * 9 + 60);
    svg += `<rect x="${W/2 - dateW/2}" y="${y}" width="${dateW}" height="38" rx="19" fill="${theme.accent}" opacity="0.9"/>`;
    svg += `<text x="${W/2}" y="${y + 25}" text-anchor="middle" font-family="Georgia,serif" font-size="15" font-weight="bold" fill="${theme.bg}">${escXML(date)}</text>`;
    y += 58;
  }

  // ── Mahali ──
  if (location) {
    svg += `<text x="${W/2}" y="${y}" text-anchor="middle" font-family="Georgia,serif" font-size="14" fill="${theme.sub}" opacity="0.95">${escXML(location)}</text>`;
    y += 30;
  }

  // ── Mstari mwepesi wa kugawanya ──
  y += 8;
  svg += `<rect x="100" y="${y}" width="${W - 200}" height="1" fill="${theme.accent}" opacity="0.4"/>`;
  y += 26;

  // ── Mawasiliano ──
  if (contact) {
    svg += `<text x="${W/2}" y="${y}" text-anchor="middle" font-family="Georgia,serif" font-size="15.5" font-weight="bold" fill="${theme.accent}">${escXML(contact)}</text>`;
    y += 30;
  }

  // ── Footer / msemo wa kuhitimisha ──
  if (footer) {
    const footerLines = wrapText(footer, 52);
    for (const line of footerLines) {
      svg += `<text x="${W/2}" y="${y}" text-anchor="middle" font-family="Georgia,serif" font-size="13" fill="${theme.sub}" opacity="0.85" font-style="italic">&#8220;${escXML(line)}&#8221;</text>`;
      y += 22;
    }
  }

  // ── Sehemu ya chini: kama maudhui ni machache, jaza nafasi kwa
  //    pambo kubwa la icon badala ya kuacha utupu — poster isionekane "tupu" ──
  const FOOTER_ZONE_TOP = H - 90;
  if (y < FOOTER_ZONE_TOP - 80) {
    const decorCY = (y + FOOTER_ZONE_TOP) / 2 + 10;
    svg += `<circle cx="${W/2}" cy="${decorCY}" r="50" fill="${theme.accent}" opacity="0.07"/>`;
    svg += `<circle cx="${W/2}" cy="${decorCY}" r="50" fill="none" stroke="${theme.accent}" stroke-width="1" opacity="0.35"/>`;
    svg += renderIcon(theme.icon, W/2, decorCY, theme.accent, 1.3);
  }

  // ── Mfumo wa chini (brand strip) — daima sehemu ya mwisho ──
  svg += `<rect x="0" y="${H - 50}" width="${W}" height="3" fill="${theme.accent2}" opacity="0.6"/>`;
  svg += `<rect x="0" y="${H - 8}" width="${W}" height="8" fill="${theme.accent}"/>`;
  svg += `<text x="${W/2}" y="${H - 22}" text-anchor="middle" font-family="Georgia,serif" font-size="13" font-weight="bold" fill="${theme.accent2}" letter-spacing="0.5">AJ PLUS COMPANY LIMITED</text>`;
  svg += `<text x="${W/2}" y="${H - 36}" text-anchor="middle" font-family="Georgia,serif" font-size="11" fill="${theme.sub}" opacity="0.8">ajplusai.co.tz</text>`;

  svg += `</svg>`;
  return svg;
}

function svgToBase64(svg) {
  const encoded = Buffer.from(svg, 'utf8').toString('base64');
  return `data:image/svg+xml;base64,${encoded}`;
}

// ─── Tumia Claude kuchambua maombi ya mteja ──────────────────
async function parsePromptWithClaude(prompt) {
  const fallback = () => ({
    title: prompt.replace(/tengeneza\s*(poster|tangazo|picha)?\s*(ya)?/gi, '').trim().substring(0, 50) || 'Karibu',
    subtitle: '', body: [], footer: '', contact: '', location: '', date: '',
    theme: detectTheme(prompt)
  });

  if (!ANTHROPIC_KEY) return fallback();

  try {
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
          content: `Chunguza ombi hili la poster na rudisha JSON tu (bila maelezo yoyote, bila markdown):

Ombi: "${prompt}"

Rudisha JSON hii (fields zote ni za Kiswahili, ondoa field kama haitumiki badala ya kuijaza placeholder):
{
  "title": "kichwa kikubwa cha poster (maneno 1-6 tu, KAMWE usitumie maneno ya ziada)",
  "subtitle": "ujumbe mkuu/maelezo mafupi (maneno 5-12)",
  "body": ["nukta 1", "nukta 2", "nukta 3"],
  "footer": "neno la hekima/msemo (kama linafaa, vinginevyo tupu)",
  "contact": "namba ya simu/email (kama imetajwa, vinginevyo tupu)",
  "location": "mahali (kama pametajwa, vinginevyo tupu)",
  "date": "tarehe/wakati (kama imetajwa, vinginevyo tupu)",
  "theme": "baba|mama|kanisa|harusi|biashara|dini|elimu|afya|matukio|uhuru|default"
}`
        }]
      })
    });

    if (!res.ok) return fallback();

    const data = await res.json();
    const text = data.content?.[0]?.text || '{}';
    const clean = text.replace(/```json|```/g, '').trim();
    const parsed = JSON.parse(clean);

    // Hakikisha theme iliyorudishwa ipo kwenye THEMES, vinginevyo gundua wenyewe
    if (!THEMES[parsed.theme]) parsed.theme = detectTheme(prompt);

    return parsed;
  } catch (e) {
    return fallback();
  }
}

// ─── HANDLER ──────────────────────────────────────────────────
module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', 'https://ajplusai.co.tz');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST')   return res.status(405).json({ error: 'Method not allowed' });

  try {
    let body = req.body;
    if (typeof body === 'string') {
      try { body = JSON.parse(body); } catch (e) { body = {}; }
    }
    if (!body) body = {};

    const { prompt } = body;
    if (!prompt) {
      return res.status(400).json({ error: 'Maelezo ya poster yanahitajika!' });
    }

    const safePrompt = String(prompt).substring(0, 500).trim();

    // 1) Chunguza ombi kwa Claude → pata title, subtitle, theme, n.k.
    const data = await parsePromptWithClaude(safePrompt);

    // 2) Tengeneza SVG moja kwa moja — maandishi sahihi 100%, daima inafanya kazi
    //    (HAITUMII AI ya picha ya nje — hivyo haiwezi "kushindwa" kwenye mteja anayelipa)
    const svg    = generateSVG(data);
    const base64 = svgToBase64(svg);

    return res.status(200).json({
      success: true,
      image:   base64,
      type:    'poster',
      source:  'svg',
      title:   data.title,
      theme:   data.theme,
      message: 'Poster imekamilika! Maandishi yako sahihi 100%, tayari kuposti!'
    });

  } catch (err) {
    console.error('Poster error:', err.message);
    return res.status(500).json({ error: 'Kosa: ' + err.message });
  }
};
