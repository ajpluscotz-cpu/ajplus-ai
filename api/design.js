// AJPLUS AI — api/design.js
// AJPLUS Design Studio: Logo, Poster, Business Card, Banner, Flyer
// Mfumo mmoja wa SVG kwa graphics zote — maandishi sahihi 100%,
// HAITUMII AI ya picha ya nje, hivyo haiwezi "kushindwa" kwa mteja anayelipa.
// © AJ PLUS COMPANY LIMITED | ajplusai.co.tz

const ANTHROPIC_KEY = process.env.ANTHROPIC_API_KEY;

// ════════════════════════════════════════════════════════════
// SEHEMU A: VITU VINAVYOSHIRIKIWA (Themes, Icons, Helpers)
// ════════════════════════════════════════════════════════════

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

function svgToBase64(svg) {
  const encoded = Buffer.from(svg, 'utf8').toString('base64');
  return `data:image/svg+xml;base64,${encoded}`;
}

// ─── Icons za SVG path (sio emoji — hazivurugiki kamwe) ──────
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
    case 'shield':
      return `<path d="M${cx} ${cy - 22 * s} L${cx + 18 * s} ${cy - 14 * s} L${cx + 18 * s} ${cy + 4 * s} C${cx + 18 * s} ${cy + 18 * s}, ${cx + 8 * s} ${cy + 24 * s}, ${cx} ${cy + 26 * s} C${cx - 8 * s} ${cy + 24 * s}, ${cx - 18 * s} ${cy + 18 * s}, ${cx - 18 * s} ${cy + 4 * s} L${cx - 18 * s} ${cy - 14 * s} Z" fill="none" stroke="${color}" stroke-width="${2.5 * s}"/>`;
    case 'leaf':
      return `<path d="M${cx} ${cy - 22 * s} C${cx + 20 * s} ${cy - 18 * s}, ${cx + 22 * s} ${cy + 2 * s}, ${cx} ${cy + 22 * s} C${cx - 22 * s} ${cy + 2 * s}, ${cx - 20 * s} ${cy - 18 * s}, ${cx} ${cy - 22 * s} Z" fill="${color}"/>
              <line x1="${cx}" y1="${cy - 18 * s}" x2="${cx}" y2="${cy + 18 * s}" stroke="${color === '#ffffff' ? '#00000033' : '#ffffff55'}" stroke-width="${1.5 * s}"/>`;
    case 'spark':
      return `<path d="M${cx} ${cy - 24 * s} L${cx + 6 * s} ${cy - 6 * s} L${cx + 24 * s} ${cy} L${cx + 6 * s} ${cy + 6 * s} L${cx} ${cy + 24 * s} L${cx - 6 * s} ${cy + 6 * s} L${cx - 24 * s} ${cy} L${cx - 6 * s} ${cy - 6 * s} Z" fill="${color}"/>`;
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

// ─── Mapambo ya nyuma (background patterns) — kwa Poster/Flyer/Banner ──
function renderPattern(pattern, theme, W, H) {
  let s = `<g opacity="0.10">`;
  switch (pattern) {
    case 'star':
      [[90,130,16],[600,110,12],[70,860,14],[610,840,10],[340,60,18]].forEach(([x,y,r]) => {
        if (x < W && y < H) s += starPath(x, y, r, r * 0.45, 5, theme.accent);
      });
      break;
    case 'flower':
      [[100,150],[580,180],[90,840],[600,820]].forEach(([x,y]) => {
        if (x > W || y > H) return;
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
        if (x > W || y > H) return;
        s += `<rect x="${x-4}" y="${y-26}" width="8" height="52" fill="${theme.accent}"/>
              <rect x="${x-20}" y="${y-8}" width="40" height="8" fill="${theme.accent}"/>`;
      });
      break;
    case 'grid':
      for (let x = 40; x < W; x += 80) s += `<line x1="${x}" y1="0" x2="${x}" y2="${H}" stroke="${theme.accent}" stroke-width="0.5"/>`;
      for (let y = 40; y < H; y += 80) s += `<line x1="0" y1="${y}" x2="${W}" y2="${y}" stroke="${theme.accent}" stroke-width="0.5"/>`;
      break;
    case 'geo':
      [[80,120,40],[600,150,55],[70,850,45],[610,820,35],[340,50,30]].forEach(([x,y,r]) => {
        if (x > W + r || y > H + r) return;
        s += `<circle cx="${x}" cy="${y}" r="${r}" fill="none" stroke="${theme.accent}" stroke-width="1"/>`;
      });
      break;
    case 'confetti':
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
    case 'flag':
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

// ════════════════════════════════════════════════════════════
// SEHEMU B: LOGO GENERATOR
// ════════════════════════════════════════════════════════════
// Logo ni tofauti kabisa na poster: haina orodha ya maelezo, haina
// tarehe/mahali — ni ALAMA tu (icon + jina la kampuni + neno la pili
// la hiari). Lengo ni unyenyekevu (simplicity), sio "kujaza nafasi".

const LOGO_LAYOUTS = ['emblem', 'wordmark', 'badge'];

function generateLogoSVG(data) {
  const theme = THEMES[data.theme] || THEMES.default;
  const W = 600, H = 600;
  const name = String(data.name || 'AJ PLUS').toUpperCase();
  const tagline = data.tagline || '';
  const layout = LOGO_LAYOUTS.includes(data.layout) ? data.layout : 'emblem';
  const icon = data.icon && data.icon !== 'auto' ? data.icon : theme.icon;

  let svg = `<svg width="100%" viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg" role="img">`;
  svg += `<title>Logo ya ${escXML(name)}</title>`;
  svg += `<rect width="${W}" height="${H}" fill="none"/>`; // transparent canvas — logo inaweza kuwekwa juu ya background yoyote

  if (layout === 'emblem') {
    // Ikoni ndani ya mduara, jina chini ya mduara — muundo wa kawaida wa logo
    const cy = 220;
    svg += `<circle cx="${W/2}" cy="${cy}" r="120" fill="none" stroke="${theme.accent}" stroke-width="4"/>`;
    svg += `<circle cx="${W/2}" cy="${cy}" r="104" fill="${theme.accent}" opacity="0.08"/>`;
    svg += renderIcon(icon, W/2, cy, theme.accent, 2.6);

    const nameLines = wrapText(name, 16);
    let ny = 410;
    for (const line of nameLines) {
      svg += `<text x="${W/2}" y="${ny}" text-anchor="middle" font-family="Georgia,serif" font-size="40" font-weight="bold" fill="${theme.accent}" letter-spacing="2">${escXML(line)}</text>`;
      ny += 48;
    }
    if (tagline) {
      svg += `<rect x="${W/2 - 140}" y="${ny - 6}" width="280" height="1.5" fill="${theme.accent}" opacity="0.5"/>`;
      svg += `<text x="${W/2}" y="${ny + 28}" text-anchor="middle" font-family="Georgia,serif" font-size="16" fill="${theme.sub}" letter-spacing="3">${escXML(tagline.toUpperCase())}</text>`;
    }

  } else if (layout === 'wordmark') {
    // Jina kubwa katikati, ikoni ndogo juu — wordmark style (kama Coca-Cola)
    svg += renderIcon(icon, W/2, 240, theme.accent, 1.8);
    const nameLines = wrapText(name, 12);
    let ny = 340;
    for (const line of nameLines) {
      svg += `<text x="${W/2}" y="${ny}" text-anchor="middle" font-family="Georgia,serif" font-size="52" font-weight="bold" fill="${theme.text === '#ffffff' ? theme.accent : theme.text}" letter-spacing="1">${escXML(line)}</text>`;
      ny += 58;
    }
    if (tagline) {
      svg += `<rect x="${W/2 - 110}" y="${ny - 18}" width="220" height="1.5" fill="${theme.accent}" opacity="0.5"/>`;
      svg += `<text x="${W/2}" y="${ny + 14}" text-anchor="middle" font-family="Georgia,serif" font-size="17" fill="${theme.sub}" letter-spacing="2">${escXML(tagline.toUpperCase())}</text>`;
    }

  } else if (layout === 'badge') {
    // Muundo wa "badge" / sili — duara mbili na maandishi yamezunguka — rasmi zaidi
    const cy = H/2;
    svg += `<circle cx="${W/2}" cy="${cy}" r="180" fill="${theme.bg}" stroke="${theme.accent}" stroke-width="6"/>`;
    svg += `<circle cx="${W/2}" cy="${cy}" r="158" fill="none" stroke="${theme.accent}" stroke-width="1.5" opacity="0.6"/>`;
    svg += renderIcon(icon, W/2, cy - 30, theme.accent, 2.2);
    const nameLines = wrapText(name, 14);
    let ny = cy + 60;
    for (const line of nameLines) {
      svg += `<text x="${W/2}" y="${ny}" text-anchor="middle" font-family="Georgia,serif" font-size="26" font-weight="bold" fill="${theme.text}" letter-spacing="1.5">${escXML(line)}</text>`;
      ny += 30;
    }
    if (tagline) {
      svg += `<text x="${W/2}" y="${ny + 8}" text-anchor="middle" font-family="Georgia,serif" font-size="13" fill="${theme.sub}" letter-spacing="2">${escXML(tagline.toUpperCase())}</text>`;
    }
  }

  svg += `</svg>`;
  return svg;
}

function svgWrapped(content, W, H) {
  return `<svg width="100%" viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg" role="img">${content}</svg>`;
}

// ════════════════════════════════════════════════════════════
// SEHEMU C: TUMIA CLAUDE KUCHAMBUA OMBI (kwa kila aina)
// ════════════════════════════════════════════════════════════

async function callClaudeJSON(instructionPrompt) {
  if (!ANTHROPIC_KEY) return null;
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
        messages: [{ role: 'user', content: instructionPrompt }]
      })
    });
    if (!res.ok) return null;
    const data = await res.json();
    const text = data.content?.[0]?.text || '{}';
    const clean = text.replace(/```json|```/g, '').trim();
    return JSON.parse(clean);
  } catch (e) {
    return null;
  }
}

async function parseLogoPrompt(prompt) {
  const fallback = () => ({
    name: 'AJ PLUS',
    tagline: '',
    theme: detectTheme(prompt),
    layout: 'emblem',
    icon: 'auto'
  });

  const result = await callClaudeJSON(`Chunguza ombi hili la LOGO na rudisha JSON tu (bila maelezo, bila markdown):

Ombi: "${prompt}"

Rudisha JSON:
{
  "name": "jina la kampuni/biashara (maneno 1-3 tu, kama halijatajwa weka 'AJ PLUS')",
  "tagline": "neno/kauli mbiu fupi ya hiari (maneno 1-4, tupu kama halijatajwa)",
  "theme": "baba|mama|kanisa|harusi|biashara|dini|elimu|afya|matukio|uhuru|default",
  "layout": "emblem|wordmark|badge",
  "icon": "star|heart|cross|rings|bolt|book|shield|leaf|spark|auto"
}`);

  if (!result) return fallback();
  if (!THEMES[result.theme]) result.theme = detectTheme(prompt);
  if (!LOGO_LAYOUTS.includes(result.layout)) result.layout = 'emblem';
  return result;
}

// ════════════════════════════════════════════════════════════
// SEHEMU C2: BUSINESS CARD GENERATOR
// ════════════════════════════════════════════════════════════
// Kadi ya biashara: 1050x600 (uwiano wa kadi halisi 3.5x2 inch). Muundo:
// jina la mtu + cheo upande mmoja, mawasiliano upande mwingine, jina la
// kampuni + icon kama brand mark. Lazima iwe rahisi kusoma ukiwa mdogo.

const CARD_LAYOUTS = ['split', 'centered', 'sidebar'];

function generateCardSVG(data) {
  const theme = THEMES[data.theme] || THEMES.default;
  const W = 1050, H = 600;
  const company     = String(data.company || 'AJ PLUS COMPANY LIMITED').toUpperCase();
  const personName  = data.personName || '';
  const role        = data.role || '';
  const phone       = data.phone || '';
  const email       = data.email || '';
  const address     = data.address || '';
  const website     = data.website || 'ajplusai.co.tz';
  const icon        = data.icon && data.icon !== 'auto' ? data.icon : theme.icon;
  const layout      = CARD_LAYOUTS.includes(data.layout) ? data.layout : 'sidebar';

  let svg = `<svg width="100%" viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg" role="img">`;
  svg += `<title>Kadi ya biashara ya ${escXML(company)}</title>`;

  if (layout === 'sidebar') {
    const sidebarW = 360;
    svg += `<rect width="${W}" height="${H}" fill="${theme.bg}"/>`;
    svg += `<rect width="${sidebarW}" height="${H}" fill="${theme.bg2}"/>`;
    svg += `<rect x="${sidebarW - 4}" y="0" width="4" height="${H}" fill="${theme.accent}"/>`;

    svg += `<circle cx="${sidebarW/2}" cy="190" r="58" fill="${theme.accent}" opacity="0.12"/>`;
    svg += `<circle cx="${sidebarW/2}" cy="190" r="58" fill="none" stroke="${theme.accent}" stroke-width="2"/>`;
    svg += renderIcon(icon, sidebarW/2, 190, theme.accent, 1.7);

    const compLines = wrapText(company, 16);
    let cy2 = 290;
    for (const line of compLines) {
      svg += `<text x="${sidebarW/2}" y="${cy2}" text-anchor="middle" font-family="Georgia,serif" font-size="20" font-weight="bold" fill="${theme.text}" letter-spacing="0.5">${escXML(line)}</text>`;
      cy2 += 26;
    }
    svg += `<text x="${sidebarW/2}" y="${H - 36}" text-anchor="middle" font-family="Georgia,serif" font-size="13" fill="${theme.accent}" letter-spacing="1">${escXML(website)}</text>`;

    const rx = sidebarW + 60;
    const contactRows = [phone, email, address].filter(Boolean);
    // Hesabu urefu halisi wa maudhui (jina + cheo + mstari + mawasiliano)
    // ili tuweze kuyaweka katikati ya wima badala ya kuanzia juu daima.
    let contentH = 0;
    if (personName) contentH += 36;
    if (role) contentH += 30;
    contentH += 12; // mstari mfupi wa kugawanya
    contentH += contactRows.length * 36;

    let ry = Math.max(140, (H - contentH) / 2);
    if (personName) {
      svg += `<text x="${rx}" y="${ry}" font-family="Georgia,serif" font-size="34" font-weight="bold" fill="${theme.text}">${escXML(personName)}</text>`;
      ry += 36;
    }
    if (role) {
      svg += `<text x="${rx}" y="${ry}" font-family="Georgia,serif" font-size="17" fill="${theme.accent}" letter-spacing="1">${escXML(role.toUpperCase())}</text>`;
      ry += 30;
    }
    svg += `<rect x="${rx}" y="${ry}" width="180" height="2" fill="${theme.accent}" opacity="0.5"/>`;
    ry += 50;

    for (const row of contactRows) {
      svg += `<circle cx="${rx + 6}" cy="${ry - 5}" r="3.5" fill="${theme.accent}"/>`;
      svg += `<text x="${rx + 22}" y="${ry}" font-family="Georgia,serif" font-size="17" fill="${theme.sub}">${escXML(row)}</text>`;
      ry += 36;
    }

  } else if (layout === 'split') {
    svg += `<rect width="${W}" height="${H}" fill="${theme.bg}"/>`;
    svg += `<rect y="0" width="${W}" height="${H * 0.42}" fill="${theme.bg2}"/>`;
    svg += `<rect y="${H * 0.42 - 3}" width="${W}" height="3" fill="${theme.accent}"/>`;

    svg += renderIcon(icon, 110, H * 0.21, theme.accent, 1.4);
    const compLines = wrapText(company, 24);
    let cy2 = H * 0.16;
    for (const line of compLines) {
      svg += `<text x="170" y="${cy2}" font-family="Georgia,serif" font-size="24" font-weight="bold" fill="${theme.text}">${escXML(line)}</text>`;
      cy2 += 28;
    }

    const contactRows2 = [phone, email, address].filter(Boolean);
    let contentH2 = 0;
    if (personName) contentH2 += 34;
    if (role) contentH2 += 38;
    contentH2 += contactRows2.length * 30;

    const bottomZoneTop = H * 0.42 + 3;
    const bottomZoneH = H - bottomZoneTop - 50; // ondoa nafasi ya website footer
    let ry = bottomZoneTop + Math.max(40, (bottomZoneH - contentH2) / 2);

    if (personName) {
      svg += `<text x="60" y="${ry}" font-family="Georgia,serif" font-size="30" font-weight="bold" fill="${theme.text}">${escXML(personName)}</text>`;
      ry += 34;
    }
    if (role) {
      svg += `<text x="60" y="${ry}" font-family="Georgia,serif" font-size="16" fill="${theme.accent}" letter-spacing="1">${escXML(role.toUpperCase())}</text>`;
      ry += 38;
    }
    for (const row of contactRows2) {
      svg += `<text x="60" y="${ry}" font-family="Georgia,serif" font-size="16" fill="${theme.sub}">${escXML(row)}</text>`;
      ry += 30;
    }
    svg += `<text x="${W - 60}" y="${H - 36}" text-anchor="end" font-family="Georgia,serif" font-size="14" fill="${theme.accent}">${escXML(website)}</text>`;

  } else {
    svg += `<rect width="${W}" height="${H}" fill="${theme.bg}"/>`;
    svg += `<rect x="0" y="0" width="${W}" height="6" fill="${theme.accent}"/>`;
    svg += `<rect x="0" y="${H-6}" width="${W}" height="6" fill="${theme.accent}"/>`;

    const contactRows3 = [phone, email, address].filter(Boolean);
    // Hesabu urefu kamili wa kizuizi (icon + jina + cheo + mstari + mawasiliano)
    // ili kiweze kuwekwa katikati ya kadi badala ya kushikamana juu.
    let blockH = 80; // icon
    if (personName) blockH += 34;
    if (role) blockH += 30;
    blockH += 36; // mstari mfupi + nafasi
    blockH += contactRows3.length * 28;

    const topY = Math.max(70, (H - blockH) / 2);
    svg += renderIcon(icon, W/2, topY + 30, theme.accent, 1.6);
    let cy2 = topY + 100;
    if (personName) {
      svg += `<text x="${W/2}" y="${cy2}" text-anchor="middle" font-family="Georgia,serif" font-size="32" font-weight="bold" fill="${theme.text}">${escXML(personName)}</text>`;
      cy2 += 34;
    }
    if (role) {
      svg += `<text x="${W/2}" y="${cy2}" text-anchor="middle" font-family="Georgia,serif" font-size="16" fill="${theme.accent}" letter-spacing="1">${escXML(role.toUpperCase())}</text>`;
      cy2 += 30;
    }
    svg += `<rect x="${W/2 - 100}" y="${cy2}" width="200" height="1.5" fill="${theme.accent}" opacity="0.5"/>`;
    cy2 += 36;
    for (const row of contactRows3) {
      svg += `<text x="${W/2}" y="${cy2}" text-anchor="middle" font-family="Georgia,serif" font-size="16" fill="${theme.sub}">${escXML(row)}</text>`;
      cy2 += 28;
    }
    svg += `<text x="${W/2}" y="${H - 30}" text-anchor="middle" font-family="Georgia,serif" font-size="13" fill="${theme.accent}" letter-spacing="1">${escXML(company)} &#183; ${escXML(website)}</text>`;
  }

  svg += `</svg>`;
  return svg;
}

async function parseCardPrompt(prompt) {
  const fallback = () => ({
    company: 'AJ PLUS COMPANY LIMITED', personName: '', role: '',
    phone: '', email: '', address: '', website: 'ajplusai.co.tz',
    theme: detectTheme(prompt), layout: 'sidebar', icon: 'auto'
  });

  const result = await callClaudeJSON(`Chunguza ombi hili la KADI YA BIASHARA (business card) na rudisha JSON tu (bila maelezo, bila markdown):

Ombi: "${prompt}"

Rudisha JSON:
{
  "company": "jina la kampuni (kama halijatajwa weka 'AJ PLUS COMPANY LIMITED')",
  "personName": "jina la mtu (tupu kama halijatajwa)",
  "role": "cheo/nafasi ya kazi (tupu kama halijatajwa)",
  "phone": "namba ya simu (tupu kama haijatajwa)",
  "email": "barua pepe (tupu kama haijatajwa)",
  "address": "anuani/mahali (tupu kama hakijatajwa)",
  "website": "tovuti (default 'ajplusai.co.tz' kama haijatajwa)",
  "theme": "baba|mama|kanisa|harusi|biashara|dini|elimu|afya|matukio|uhuru|default",
  "layout": "sidebar|split|centered",
  "icon": "star|heart|cross|rings|bolt|book|shield|leaf|spark|auto"
}`);

  if (!result) return fallback();
  if (!THEMES[result.theme]) result.theme = detectTheme(prompt);
  if (!CARD_LAYOUTS.includes(result.layout)) result.layout = 'sidebar';
  return result;
}

// ════════════════════════════════════════════════════════════
// SEHEMU C3: BANNER GENERATOR (Facebook/Instagram Cover Photo)
// ════════════════════════════════════════════════════════════
// Banner: 1200x630 (kiwango cha Facebook cover/link-preview, kinafaa
// pia Instagram/Twitter). Lengo ni brand kuonekana wazi kwa mtazamo wa
// haraka — maandishi makubwa, machache, hakuna msongamano wa taarifa.

const BANNER_LAYOUTS = ['center', 'left', 'split'];

function generateBannerSVG(data) {
  const theme = THEMES[data.theme] || THEMES.default;
  const W = 1200, H = 630;
  const title    = String(data.title || 'AJ PLUS COMPANY LIMITED').toUpperCase();
  const subtitle = data.subtitle || '';
  const cta      = data.cta || ''; // wito wa kuchukua hatua, mfano "Piga Simu Leo"
  const icon     = data.icon && data.icon !== 'auto' ? data.icon : theme.icon;
  const layout   = BANNER_LAYOUTS.includes(data.layout) ? data.layout : 'center';

  let svg = `<svg width="100%" viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg" role="img">`;
  svg += `<title>Banner ya ${escXML(title)}</title>`;

  svg += `<defs>
    <linearGradient id="bnGrad" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="${theme.bg}"/>
      <stop offset="100%" stop-color="${theme.bg2}"/>
    </linearGradient>
  </defs>`;
  svg += `<rect width="${W}" height="${H}" fill="url(#bnGrad)"/>`;
  svg += renderPattern(theme.pattern, theme, W, H);

  // Mistari ya brand juu na chini
  svg += `<rect x="0" y="0" width="${W}" height="6" fill="${theme.accent}"/>`;
  svg += `<rect x="0" y="${H-6}" width="${W}" height="6" fill="${theme.accent}"/>`;

  // Eneo la maandishi ni finyu zaidi kwenye 'left' na 'split' (icon
  // inashika nusu ya kushoto), hivyo herufi-kwa-mstari lazima iwe ndogo
  // zaidi kuliko 'center' — vinginevyo jina refu litakatika nje ya banner.
  const titleMaxChars = layout === 'center' ? 24 : 17;
  const titleLines = wrapText(title, titleMaxChars);
  const titleSize  = titleLines.length > 1 ? (layout === 'center' ? 42 : 38) : (layout === 'center' ? 56 : 48);
  const titleStep  = titleLines.length > 1 ? (layout === 'center' ? 52 : 46) : 0;

  if (layout === 'left') {
    // Icon upande wa kushoto, maandishi upande wa kulia — kwa banner
    // zinazohitaji "kona" tupu (mfano kwa kuongeza picha ya mtu baadaye)
    svg += `<circle cx="180" cy="${H/2}" r="90" fill="${theme.accent}" opacity="0.12"/>`;
    svg += `<circle cx="180" cy="${H/2}" r="90" fill="none" stroke="${theme.accent}" stroke-width="2"/>`;
    svg += renderIcon(icon, 180, H/2, theme.accent, 2.2);

    let ty = H/2 - (titleLines.length - 1) * titleStep / 2 - (subtitle ? 14 : 0);
    for (const line of titleLines) {
      svg += `<text x="340" y="${ty}" font-family="Georgia,serif" font-size="${titleSize}" font-weight="bold" fill="${theme.text}" letter-spacing="1">${escXML(line)}</text>`;
      ty += titleStep || 60;
    }
    if (subtitle) {
      ty += 14;
      const subLines = wrapText(subtitle, 38);
      for (const sl of subLines) {
        svg += `<text x="340" y="${ty}" font-family="Georgia,serif" font-size="22" fill="${theme.accent2}" font-style="italic">${escXML(sl)}</text>`;
        ty += 28;
      }
      ty -= 28;
    }
    if (cta) {
      const ctaY = ty + 56;
      const ctaW = cta.length * 13 + 70;
      svg += `<rect x="340" y="${ctaY}" width="${ctaW}" height="48" rx="24" fill="${theme.accent}"/>`;
      svg += `<text x="${340 + ctaW/2}" y="${ctaY + 31}" text-anchor="middle" font-family="Georgia,serif" font-size="18" font-weight="bold" fill="${theme.bg}">${escXML(cta)}</text>`;
    }

  } else if (layout === 'split') {
    // Nusu rangi imara, nusu gradient — mwonekano wa kisasa zaidi wa kibiashara
    svg += `<rect x="0" y="0" width="${W * 0.38}" height="${H}" fill="${theme.accent}" opacity="0.9"/>`;
    svg += `<circle cx="${W * 0.19}" cy="${H/2}" r="70" fill="${theme.bg}" opacity="0.18"/>`;
    svg += renderIcon(icon, W * 0.19, H/2, theme.bg, 2.4);

    let ty = H/2 - (titleLines.length - 1) * (titleStep || 60) / 2 - (subtitle ? 14 : 0);
    for (const line of titleLines) {
      svg += `<text x="${W * 0.38 + 70}" y="${ty}" font-family="Georgia,serif" font-size="${titleSize}" font-weight="bold" fill="${theme.text}" letter-spacing="1">${escXML(line)}</text>`;
      ty += titleStep || 60;
    }
    if (subtitle) {
      ty += 14;
      const subLines = wrapText(subtitle, 30);
      for (const sl of subLines) {
        svg += `<text x="${W * 0.38 + 70}" y="${ty}" font-family="Georgia,serif" font-size="22" fill="${theme.accent2}" font-style="italic">${escXML(sl)}</text>`;
        ty += 28;
      }
      ty -= 28;
    }
    if (cta) {
      const ctaY = ty + 56;
      const ctaX = W * 0.38 + 70;
      const ctaW = cta.length * 13 + 70;
      svg += `<rect x="${ctaX}" y="${ctaY}" width="${ctaW}" height="48" rx="24" fill="${theme.accent}"/>`;
      svg += `<text x="${ctaX + ctaW/2}" y="${ctaY + 31}" text-anchor="middle" font-family="Georgia,serif" font-size="18" font-weight="bold" fill="${theme.bg}">${escXML(cta)}</text>`;
    }

  } else {
    // center — kila kitu katikati, muundo salama na rahisi zaidi (default)
    svg += `<circle cx="${W/2}" cy="${H/2 - 130}" r="56" fill="${theme.accent}" opacity="0.14"/>`;
    svg += `<circle cx="${W/2}" cy="${H/2 - 130}" r="56" fill="none" stroke="${theme.accent}" stroke-width="2"/>`;
    svg += renderIcon(icon, W/2, H/2 - 130, theme.accent, 1.6);

    let ty = H/2 - 20;
    for (const line of titleLines) {
      svg += `<text x="${W/2}" y="${ty}" text-anchor="middle" font-family="Georgia,serif" font-size="${titleSize}" font-weight="bold" fill="${theme.text}" letter-spacing="1">${escXML(line)}</text>`;
      ty += titleStep || 60;
    }
    if (subtitle) {
      ty += 18;
      svg += `<text x="${W/2}" y="${ty}" text-anchor="middle" font-family="Georgia,serif" font-size="22" fill="${theme.accent2}" font-style="italic">${escXML(subtitle)}</text>`;
    }
    if (cta) {
      const ctaY = ty + 40;
      const ctaW = cta.length * 13 + 70;
      svg += `<rect x="${W/2 - ctaW/2}" y="${ctaY}" width="${ctaW}" height="48" rx="24" fill="${theme.accent}"/>`;
      svg += `<text x="${W/2}" y="${ctaY + 31}" text-anchor="middle" font-family="Georgia,serif" font-size="18" font-weight="bold" fill="${theme.bg}">${escXML(cta)}</text>`;
    }
  }

  svg += `<text x="${W - 30}" y="${H - 22}" text-anchor="end" font-family="Georgia,serif" font-size="14" fill="${theme.sub}" opacity="0.8">ajplusai.co.tz</text>`;

  svg += `</svg>`;
  return svg;
}

async function parseBannerPrompt(prompt) {
  const fallback = () => ({
    title: 'AJ PLUS COMPANY LIMITED', subtitle: '', cta: '',
    theme: detectTheme(prompt), layout: 'center', icon: 'auto'
  });

  const result = await callClaudeJSON(`Chunguza ombi hili la BANNER (cover photo ya Facebook/Instagram) na rudisha JSON tu (bila maelezo, bila markdown):

Ombi: "${prompt}"

Rudisha JSON:
{
  "title": "jina la kampuni/kichwa kikuu (maneno 1-6, kifupi na wazi)",
  "subtitle": "kauli mbiu/maelezo mafupi (maneno 3-10, tupu kama halijatajwa)",
  "cta": "wito wa hatua kifupi kama 'Piga Simu Leo' au 'Tembelea Sasa' (tupu kama hakijatajwa)",
  "theme": "baba|mama|kanisa|harusi|biashara|dini|elimu|afya|matukio|uhuru|default",
  "layout": "center|left|split",
  "icon": "star|heart|cross|rings|bolt|book|shield|leaf|spark|auto"
}`);

  if (!result) return fallback();
  if (!THEMES[result.theme]) result.theme = detectTheme(prompt);
  if (!BANNER_LAYOUTS.includes(result.layout)) result.layout = 'center';
  return result;
}

// ════════════════════════════════════════════════════════════
// SEHEMU C4: FLYER / BANGO LA BEI GENERATOR
// ════════════════════════════════════════════════════════════
// Flyer: 680x960 (sawa na poster) lakini muundo wake ni tofauti kabisa —
// badala ya ujumbe wa hisia, hii ni ORODHA ya bidhaa/huduma na bei zake,
// yenye usomaji rahisi (jina la bidhaa kushoto, bei kulia, mstari wa
// nukta katikati kuunganisha — kama menyu ya mkahawa).

function generateFlyerSVG(data) {
  const theme = THEMES[data.theme] || THEMES.default;
  const W = 680, H = 960;
  const title    = String(data.title || 'BEI ZETU').toUpperCase();
  const subtitle = data.subtitle || '';
  const items    = (data.items || []).slice(0, 10); // [{name, price}]
  const discount = data.discount || ''; // mfano "PUNGUZO 20%"
  const contact  = data.contact || '';
  const validity = data.validity || ''; // mfano "Ofa inahalisi hadi 30 Juni"
  const icon     = data.icon && data.icon !== 'auto' ? data.icon : theme.icon;

  let svg = `<svg width="100%" viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg" role="img">`;
  svg += `<title>Bango la bei la ${escXML(title)}</title>`;

  svg += `<defs>
    <linearGradient id="flGrad" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="${theme.bg}"/>
      <stop offset="55%" stop-color="${theme.bg2}"/>
      <stop offset="100%" stop-color="${theme.bg}"/>
    </linearGradient>
  </defs>`;
  svg += `<rect width="${W}" height="${H}" fill="url(#flGrad)"/>`;
  svg += renderPattern(theme.pattern, theme, W, H);

  svg += `<rect x="0" y="0" width="${W}" height="8" fill="${theme.accent}"/>`;
  svg += `<rect x="0" y="8" width="${W}" height="3" fill="${theme.accent2}" opacity="0.6"/>`;

  // ── Kichwa + icon ──
  let y = 90;
  svg += `<circle cx="${W/2}" cy="${y}" r="44" fill="${theme.accent}" opacity="0.15"/>`;
  svg += `<circle cx="${W/2}" cy="${y}" r="36" fill="${theme.bg}" stroke="${theme.accent}" stroke-width="2"/>`;
  svg += renderIcon(icon, W/2, y, theme.accent, 1.1);

  y = 175;
  const titleLines = wrapText(title, 22);
  for (const line of titleLines) {
    svg += `<text x="${W/2}" y="${y}" text-anchor="middle" font-family="Georgia,serif" font-size="36" font-weight="bold" fill="${theme.text}" letter-spacing="1">${escXML(line)}</text>`;
    y += 42;
  }
  if (subtitle) {
    y += 8;
    svg += `<text x="${W/2}" y="${y}" text-anchor="middle" font-family="Georgia,serif" font-size="17" fill="${theme.accent2}" font-style="italic">${escXML(subtitle)}</text>`;
    y += 20;
  }

  // ── Badge ya punguzo (discount) — kama ipo, inaonekana wazi ──
  if (discount) {
    y += 16;
    const dW = discount.length * 11 + 80;
    svg += `<rect x="${W/2 - dW/2}" y="${y}" width="${dW}" height="42" rx="21" fill="${theme.accent}"/>`;
    svg += `<text x="${W/2}" y="${y + 28}" text-anchor="middle" font-family="Georgia,serif" font-size="19" font-weight="bold" fill="${theme.bg}" letter-spacing="0.5">${escXML(discount.toUpperCase())}</text>`;
    y += 60;
  }

  y += 16;
  svg += `<rect x="80" y="${y}" width="${W - 160}" height="2" fill="${theme.accent}" opacity="0.5"/>`;
  y += 40;

  // ── Orodha ya bidhaa/huduma na bei (menu-style dotted leader) ──
  const rowH = 50;
  const boxTop = y - 14;
  const boxH = items.length * rowH + 20;
  svg += `<rect x="50" y="${boxTop}" width="${W - 100}" height="${boxH}" rx="10" fill="${theme.accent}" opacity="0.06"/>`;
  svg += `<rect x="50" y="${boxTop}" width="${W - 100}" height="${boxH}" rx="10" fill="none" stroke="${theme.accent}" stroke-width="1" opacity="0.4"/>`;

  for (const item of items) {
    const name  = String(item.name || '').trim();
    const price = String(item.price || '').trim();
    if (!name) continue;

    svg += `<text x="80" y="${y}" font-family="Georgia,serif" font-size="17" fill="${theme.text}">${escXML(name)}</text>`;

    // Mstari wa nukta kuunganisha jina na bei (menu-style)
    const nameW  = name.length * 9.5;
    const priceW = price.length * 11;
    const dotsStart = 80 + nameW + 10;
    const dotsEnd   = W - 80 - priceW - 10;
    if (dotsEnd > dotsStart) {
      svg += `<line x1="${dotsStart}" y1="${y - 5}" x2="${dotsEnd}" y2="${y - 5}" stroke="${theme.sub}" stroke-width="1" stroke-dasharray="2,4" opacity="0.5"/>`;
    }

    svg += `<text x="${W - 80}" y="${y}" text-anchor="end" font-family="Georgia,serif" font-size="18" font-weight="bold" fill="${theme.accent}">${escXML(price)}</text>`;
    y += rowH;
  }

  y = boxTop + boxH + 36;

  // ── Tarehe ya uhalali wa ofa (validity) ──
  if (validity) {
    svg += `<text x="${W/2}" y="${y}" text-anchor="middle" font-family="Georgia,serif" font-size="14" fill="${theme.sub}" opacity="0.9" font-style="italic">${escXML(validity)}</text>`;
    y += 30;
  }

  // ── Jaza nafasi kama maudhui ni machache ──
  const FOOTER_ZONE_TOP = H - 90;
  if (y < FOOTER_ZONE_TOP - 70) {
    const decorCY = (y + FOOTER_ZONE_TOP) / 2 + 6;
    svg += `<circle cx="${W/2}" cy="${decorCY}" r="44" fill="${theme.accent}" opacity="0.07"/>`;
    svg += `<circle cx="${W/2}" cy="${decorCY}" r="44" fill="none" stroke="${theme.accent}" stroke-width="1" opacity="0.35"/>`;
    svg += renderIcon(icon, W/2, decorCY, theme.accent, 1.1);
  }

  // ── Mawasiliano ──
  if (contact) {
    svg += `<rect x="100" y="${FOOTER_ZONE_TOP - 36}" width="${W - 200}" height="1" fill="${theme.accent}" opacity="0.4"/>`;
    svg += `<text x="${W/2}" y="${FOOTER_ZONE_TOP - 10}" text-anchor="middle" font-family="Georgia,serif" font-size="16" font-weight="bold" fill="${theme.accent}">${escXML(contact)}</text>`;
  }

  // ── Brand strip ya chini ──
  svg += `<rect x="0" y="${H - 50}" width="${W}" height="3" fill="${theme.accent2}" opacity="0.6"/>`;
  svg += `<rect x="0" y="${H - 8}" width="${W}" height="8" fill="${theme.accent}"/>`;
  svg += `<text x="${W/2}" y="${H - 22}" text-anchor="middle" font-family="Georgia,serif" font-size="13" font-weight="bold" fill="${theme.accent2}" letter-spacing="0.5">AJ PLUS COMPANY LIMITED</text>`;
  svg += `<text x="${W/2}" y="${H - 36}" text-anchor="middle" font-family="Georgia,serif" font-size="11" fill="${theme.sub}" opacity="0.8">ajplusai.co.tz</text>`;

  svg += `</svg>`;
  return svg;
}

async function parseFlyerPrompt(prompt) {
  const fallback = () => ({
    title: 'BEI ZETU', subtitle: '', items: [], discount: '',
    contact: '', validity: '', theme: detectTheme(prompt), icon: 'auto'
  });

  const result = await callClaudeJSON(`Chunguza ombi hili la BANGO LA BEI/FLYER na rudisha JSON tu (bila maelezo, bila markdown):

Ombi: "${prompt}"

Rudisha JSON:
{
  "title": "kichwa cha bango (maneno 1-5, mfano 'BEI ZA HUDUMA ZETU')",
  "subtitle": "maelezo mafupi ya hiari (tupu kama halijatajwa)",
  "items": [{"name": "jina la bidhaa/huduma", "price": "bei, mfano 'TZS 20,000'"}],
  "discount": "punguzo la hiari, mfano 'PUNGUZO 20%' (tupu kama hakijatajwa)",
  "contact": "namba ya simu/email ya hiari (tupu kama haijatajwa)",
  "validity": "tarehe ya uhalali wa ofa, ya hiari (tupu kama haijatajwa)",
  "theme": "baba|mama|kanisa|harusi|biashara|dini|elimu|afya|matukio|uhuru|default",
  "icon": "star|heart|cross|rings|bolt|book|shield|leaf|spark|auto"
}

MUHIMU: chambua KILA bidhaa/huduma na bei iliyotajwa kwenye ombi uweke kwenye "items" array — usikose hata moja.`);

  if (!result) return fallback();
  if (!THEMES[result.theme]) result.theme = detectTheme(prompt);
  if (!Array.isArray(result.items)) result.items = [];
  return result;
}

// ════════════════════════════════════════════════════════════
// SEHEMU C5: POSTER GENERATOR (ujumbe wa hisia — Siku ya Baba,
// Mama, Harusi, Kanisa, n.k.) — imehamishwa kutoka poster.js
// ════════════════════════════════════════════════════════════

function generatePosterSVG(data) {
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
  svg += renderPattern(theme.pattern, theme, W, H);

  svg += `<rect x="0" y="0" width="${W}" height="8" fill="${theme.accent}"/>`;
  svg += `<rect x="0" y="8" width="${W}" height="3" fill="${theme.accent2}" opacity="0.6"/>`;

  y = 95;
  svg += `<circle cx="${W/2}" cy="${y}" r="50" fill="${theme.accent}" opacity="0.15"/>`;
  svg += `<circle cx="${W/2}" cy="${y}" r="40" fill="${theme.bg}" stroke="${theme.accent}" stroke-width="2" opacity="0.95"/>`;
  svg += renderIcon(theme.icon, W/2, y, theme.accent, 1);

  y = 200;
  const titleSize = titleLines.length > 2 ? 32 : 42;
  const titleStep = titleLines.length > 2 ? 42 : 54;
  for (const line of titleLines) {
    svg += `<text x="${W/2}" y="${y}" text-anchor="middle" font-family="Georgia,serif" font-size="${titleSize}" font-weight="bold" fill="${theme.text}" letter-spacing="1">${escXML(line)}</text>`;
    y += titleStep;
  }

  y += 14;
  svg += `<rect x="100" y="${y}" width="${W - 200}" height="3" fill="url(#goldLine)"/>`;
  y += 18;
  svg += `<rect x="${W/2 - 6}" y="${y - 21}" width="12" height="12" fill="${theme.accent}" transform="rotate(45 ${W/2} ${y - 15})"/>`;
  y += 26;

  if (subLines.length > 0) {
    for (const line of subLines) {
      svg += `<text x="${W/2}" y="${y}" text-anchor="middle" font-family="Georgia,serif" font-style="italic" font-size="19" fill="${theme.accent2}">${escXML(line)}</text>`;
      y += 27;
    }
    y += 14;
  }

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

  if (date) {
    const dateW = Math.max(180, date.length * 9 + 60);
    svg += `<rect x="${W/2 - dateW/2}" y="${y}" width="${dateW}" height="38" rx="19" fill="${theme.accent}" opacity="0.9"/>`;
    svg += `<text x="${W/2}" y="${y + 25}" text-anchor="middle" font-family="Georgia,serif" font-size="15" font-weight="bold" fill="${theme.bg}">${escXML(date)}</text>`;
    y += 58;
  }

  if (location) {
    svg += `<text x="${W/2}" y="${y}" text-anchor="middle" font-family="Georgia,serif" font-size="14" fill="${theme.sub}" opacity="0.95">${escXML(location)}</text>`;
    y += 30;
  }

  y += 8;
  svg += `<rect x="100" y="${y}" width="${W - 200}" height="1" fill="${theme.accent}" opacity="0.4"/>`;
  y += 26;

  if (contact) {
    svg += `<text x="${W/2}" y="${y}" text-anchor="middle" font-family="Georgia,serif" font-size="15.5" font-weight="bold" fill="${theme.accent}">${escXML(contact)}</text>`;
    y += 30;
  }

  if (footer) {
    const footerLines = wrapText(footer, 52);
    for (const line of footerLines) {
      svg += `<text x="${W/2}" y="${y}" text-anchor="middle" font-family="Georgia,serif" font-size="13" fill="${theme.sub}" opacity="0.85" font-style="italic">&#8220;${escXML(line)}&#8221;</text>`;
      y += 22;
    }
  }

  const FOOTER_ZONE_TOP = H - 90;
  if (y < FOOTER_ZONE_TOP - 80) {
    const decorCY = (y + FOOTER_ZONE_TOP) / 2 + 10;
    svg += `<circle cx="${W/2}" cy="${decorCY}" r="50" fill="${theme.accent}" opacity="0.07"/>`;
    svg += `<circle cx="${W/2}" cy="${decorCY}" r="50" fill="none" stroke="${theme.accent}" stroke-width="1" opacity="0.35"/>`;
    svg += renderIcon(theme.icon, W/2, decorCY, theme.accent, 1.3);
  }

  svg += `<rect x="0" y="${H - 50}" width="${W}" height="3" fill="${theme.accent2}" opacity="0.6"/>`;
  svg += `<rect x="0" y="${H - 8}" width="${W}" height="8" fill="${theme.accent}"/>`;
  svg += `<text x="${W/2}" y="${H - 22}" text-anchor="middle" font-family="Georgia,serif" font-size="13" font-weight="bold" fill="${theme.accent2}" letter-spacing="0.5">AJ PLUS COMPANY LIMITED</text>`;
  svg += `<text x="${W/2}" y="${H - 36}" text-anchor="middle" font-family="Georgia,serif" font-size="11" fill="${theme.sub}" opacity="0.8">ajplusai.co.tz</text>`;

  svg += `</svg>`;
  return svg;
}

async function parsePosterPrompt(prompt) {
  const fallback = () => ({
    title: prompt.replace(/tengeneza\s*(poster|tangazo|picha)?\s*(ya)?/gi, '').trim().substring(0, 50) || 'Karibu',
    subtitle: '', body: [], footer: '', contact: '', location: '', date: '',
    theme: detectTheme(prompt)
  });

  const result = await callClaudeJSON(`Chunguza ombi hili la poster na rudisha JSON tu (bila maelezo yoyote, bila markdown):

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
}`);

  if (!result) return fallback();
  if (!THEMES[result.theme]) result.theme = detectTheme(prompt);
  return result;
}

// ════════════════════════════════════════════════════════════
// SEHEMU D: HANDLER KUU
// ════════════════════════════════════════════════════════════

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

    const { prompt, type } = body;
    if (!prompt) {
      return res.status(400).json({ error: 'Maelezo yanahitajika!' });
    }

    const safePrompt   = String(prompt).substring(0, 500).trim();
    const designType   = (type || 'poster').toLowerCase();

    if (designType === 'logo') {
      const data = await parseLogoPrompt(safePrompt);
      const svg  = generateLogoSVG(data);
      return res.status(200).json({
        success: true,
        image:   svgToBase64(svg),
        type:    'logo',
        name:    data.name,
        theme:   data.theme,
        layout:  data.layout,
        message: 'Logo limekamilika! Sahihi 100%, tayari kutumika.'
      });
    }

    if (designType === 'card' || designType === 'business_card') {
      const data = await parseCardPrompt(safePrompt);
      const svg  = generateCardSVG(data);
      return res.status(200).json({
        success: true,
        image:   svgToBase64(svg),
        type:    'card',
        company: data.company,
        theme:   data.theme,
        layout:  data.layout,
        message: 'Kadi ya biashara imekamilika! Sahihi 100%, tayari kuprint.'
      });
    }

    if (designType === 'banner') {
      const data = await parseBannerPrompt(safePrompt);
      const svg  = generateBannerSVG(data);
      return res.status(200).json({
        success: true,
        image:   svgToBase64(svg),
        type:    'banner',
        title:   data.title,
        theme:   data.theme,
        layout:  data.layout,
        message: 'Banner imekamilika! Sahihi 100%, tayari kuposti.'
      });
    }

    if (designType === 'flyer') {
      const data = await parseFlyerPrompt(safePrompt);
      const svg  = generateFlyerSVG(data);
      return res.status(200).json({
        success: true,
        image:   svgToBase64(svg),
        type:    'flyer',
        title:   data.title,
        theme:   data.theme,
        itemCount: data.items.length,
        message: 'Bango la bei limekamilika! Sahihi 100%, tayari kuposti.'
      });
    }

    if (designType === 'poster') {
      const data = await parsePosterPrompt(safePrompt);
      const svg  = generatePosterSVG(data);
      return res.status(200).json({
        success: true,
        image:   svgToBase64(svg),
        type:    'poster',
        source:  'svg',
        title:   data.title,
        theme:   data.theme,
        message: 'Poster imekamilika! Maandishi yako sahihi 100%, tayari kuposti!'
      });
    }

    return res.status(400).json({ error: `Aina ya design '${designType}' haijatengenezwa bado. Inayopo: logo, card, banner, flyer, poster` });

  } catch (err) {
    console.error('Design error:', err.message);
    return res.status(500).json({ error: 'Kosa: ' + err.message });
  }
};

// Export helpers kwa ajili ya majaribio ya ndani (testing)
module.exports._internal = {
  THEMES, detectTheme, wrapText, escXML, svgToBase64,
  renderIcon, starPath, renderPattern, generateLogoSVG, generateCardSVG, generateBannerSVG, generateFlyerSVG, generatePosterSVG, svgWrapped
};
