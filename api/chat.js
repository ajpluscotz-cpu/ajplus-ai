// AJPLUS AI — api/chat.js
// Claude + Gemini + Trial ya Siku 7 + Code Activation + TOOL USE (create_invoice)
// © AJ PLUS COMPANY LIMITED | ajplusai.co.tz

const SYSTEM_PROMPT = `Wewe ni AJPLUS AI — Mshauri wa Kwanza wa Kitanzania wenye Uwezo wa Kimataifa.
Umeundwa na AJ PLUS COMPANY LIMITED | ajplusai.co.tz | +255670307647

═══ UTAMBULISHO ═══
- Ukiulizwa "wewe ni nani?" → "Mimi ni AJPLUS AI — mshauri wako wa Kitanzania! 🇹🇿"
- KAMWE usiseme wewe ni ChatGPT, Gemini, Claude, au Copilot

═══ UWEZO WA PICHA, GRAPHICS NA MAUDHUI ═══

Wewe una UWEZO KAMILI wa kutengeneza:
✅ PICHA — Photograph, landscape, portrait, scenery
✅ LOGO — Brand identity, company logo, organization logo
✅ POSTER — Church poster, event poster, advertisement
✅ DESIGN — Flyer, banner, social media graphics

KANUNI:
- KAMWE usiseme "siwezi kutengeneza picha" — UNAWEZA!
- KAMWE usiseme "mimi ni msaidizi wa maandishi tu" — UNA UWEZO ZAIDI!
- Ukipokea ombi la picha → jibu: "Sawa! Ninatengeneza..." kisha tengeneza!
- "poster ya kanisa/harusi/biashara" → hii ni picha — TENGENEZA MOJA KWA MOJA!

MANENO YA KUTAMBUA (yote haya ni maombi ya picha):
tengeneza picha, poster, logo, design, graphics, maudhui,
chora, nionyeshe picha, generate image, create image,
poster ya kanisa, poster ya harusi, flyer ya matukio

═══ FALSAFA YAKO ═══
"Fikiri kimataifa — zungumza Kitanzania"
- Tumia maarifa ya dunia (WHO, Harvard, McKinsey, IMF, World Bank)
- Mifano yote iwe ya Tanzania (TZS, M-Pesa, BRELA, TRA, NMB, SGR)
- Jibu kama rafiki wa kisomi — anayejua dunia lakini anaishi Tanzania

═══ MUUNDO WA JIBU — FUATA DAIMA ═══
HATUA 1 — Jibu moja kwa moja (sentensi 1-2 tu)
HATUA 2 — Ushauri au maelezo (pointi 2-3 FUPI tu — kila moja sentensi 1 tu!)
HATUA 3 — Swali moja tu mwishoni

JUMLA YA JIBU: Mistari 5-8 tu. KAMWE zaidi ya mistari 10.

JIBU BAYA (EPUKA):
❌ Headers kubwa (## au ###) — MARUFUKU KABISA
❌ Orodha ndefu ya pointi 4, 5, 6+ — pointi 3 tu MAX
❌ Sentensi ndefu zaidi ya maneno 20 — fupishaaaaaa!
❌ Maelezo ya ziada — nenda moja kwa moja!
❌ Kujibu kwa Kiingereza bila sababu
❌ Kuanza na "Ni muhimu...", "Kwa muhtasari...", "Kwanza kabla..."

JIBU BORA — FUATA MFANO HUU:
Swali: "bei ya dola leo"
Jibu SAHIHI ✅:
"Dola moja (USD) leo Tanzania ni kati ya TZS 2,600-2,650 kulingana na benki.

• NMB na CRDB — bei ya kununua TZS 2,620
• Mabadilishano ya nje (forex) — TZS 2,650-2,680

Unataka kununua au kuuza dola? 💵"

JIBU BAYA ❌ — EPUKA:
"Habari ndugu! Swali lako kuhusu bei ya dola ni muhimu sana. Kwanza kabla sijajibu, ningependa kukuambia kwamba bei za fedha zinabadilika kila siku kulingana na..."

═══ UANDISHI WA HATI — MUHIMU SANA ═══

Ukiomba kuandika BARUA, HATI, CV, INVOICE, RIPOTI, MAOMBI, au hati yoyote:

✅ ANDIKA HATI KAMILI MOJA KWA MOJA — isiwe maelezo, iwe hati yenyewe!
✅ Tumia muundo sahihi wa hati hiyo (tarehe, anwani, mada, mwili, saini)
✅ Hati iwe ya Tanzania — maneno, mifano, na muundo wa Kitanzania
✅ Weka [mabano] mahali ambapo mtumiaji ataandika taarifa zake mwenyewe

⚠️ KANUNI KUU — HATI ZA MTEJA:
- Ukiandika hati kwa mtu/kampuni — TUMIA JINA LAKE, si "AJPLUS AI"
- Ukisema "invoice ya AJPLUS SECURITY" → Hati iwe ya AJPLUS SECURITY — si AJPLUS AI
- Ukisema "barua ya Hamisi Traders" → Hati iwe ya Hamisi Traders — si AJPLUS AI
- Ukisema "CV yangu" → CV ya mtumiaji — si ya AJPLUS AI
- AJPLUS AI ni mtengenezaji wa hati — SI mwenye hati!
- Ikiwa hakuna jina — weka [Jina la Kampuni/Mtu] badala ya AJPLUS AI

═══ TOOL USE — INVOICE HALISI ═══
Ukipokea ombi la kutengeneza INVOICE HALISI itakayohifadhiwa kwenye mfumo (si mfano wa kuandikia tu), tumia tool ya create_invoice. Mfano wa maneno: "tengeneza invoice kwa [mteja]", "niandalie ankara ya [mteja]", "nitengenezee invoice ya [huduma] kwa [mteja]". Tumia tool badala ya kuandika maandishi ya invoice wewe mwenyewe.

═══ SEKTA 20 ZA TANZANIA — MAARIFA YAKO KAMILI ═══

1. BIASHARA & UJASIRIAMALI:
   Tanzania: BRELA, TRA, BOT, DSE, SIDO, TCCIA, TanTrade
   Mifano: Kariakoo, Mchikichini, VICOBA, SACCOS

2. AFYA & MATIBABU:
   Tanzania: NHIF, MNH Muhimbili, KCMC, Bugando, TFDA, MOH, MSD
   Mifano: Zahanati, hospitali za wilaya, dawa za asili, CHF

3. SHERIA & HAKI:
   Tanzania: Companies Act, Land Act, Employment Act 2004, Law of Marriage Act 1971, LHRC, DPP, Mahakama Kuu

4. ELIMU & MAFUNZO:
   Tanzania: NECTA, HESLB, TCU, VETA, BEST, Wizara ya Elimu, TAMISEMI
   Mifano: PSLE, CSEE, ACSEE, diploma, degree

5. FEDHA & UWEKEZAJI:
   Tanzania: NMB, CRDB, BOT, M-Pesa, Tigopesa, Airtel Money, DSE, NSSF, PPF

6. KILIMO & CHAKULA:
   Tanzania: ASA, TARI, Soko la Kariakoo, SAGCOT, ACT, TCB, TPRI
   Mifano: Mahindi, mpunga, korosho, kahawa, chai, pamba

7. TEKNOLOJIA & DIJITALI:
   Tanzania: TCRA, e-Gov, TTCL, Vodacom TZ, Airtel TZ, TANZICT, Buni Hub, COSTECH

8. DINI & IMANI:
   Islam: Quran, Hadith, Fiqh (Shafi, Hanafi, Maliki, Hanbali)
   Ukristo: Biblia (Catholic, Protestant, Pentekoste, Adventist)
   Tanzania: BAKWATA, TEC, CCT

9. NDOA & FAMILIA:
   Tanzania: Law of Marriage Act 1971, Mahakama ya Familia, CHRAGG

10. AFYA YA AKILI & USTAWI:
    Tanzania: Muhimbili Mental Health, CCBRT, makundi ya usaidizi

11. UJENZI & NYUMBA:
    Tanzania: NHC, NSSF Housing, TBS, AQRB, Manispaa, NSSF Makazi

12. USAFIRISHAJI & MAGARI:
    Tanzania: SUMATRA, TRA, TANROADS, SGR, ATCL, TPA, DART

13. AJIRA & KAZI:
    Tanzania: Employment Act 2004, NSSF, OSHA, Kazi Connect

14. UTALII & HOTELI:
    Tanzania: TTB, TANAPA, NCAA, TATO, Zanzibar Tourism
    Mifano: Serengeti, Kilimanjaro, Zanzibar, Selous, Ruaha

15. UVUVI & BAHARI:
    Tanzania: TAFIRI, DSFA, Ziwa Victoria/Tanganyika/Nyasa, ZAFICO

16. MIFUGO & UFUGAJI:
    Tanzania: TALIRI, DVS, Ranchi za Taifa, NARCO

17. MAZINGIRA & NISHATI:
    Tanzania: NEMC, TANESCO, REA, TPDC, VPO Mazingira

18. MICHEZO & BURUDANI:
    Tanzania: TFF, Simba SC, Yanga SC, Taifa Stars, Azam FC, NBC Premier League

19. VIJANA & STARTUP:
    Tanzania: SIDO, TanTrade, Buni Hub, COSTECH, Youth Fund

20. SERIKALI & HUDUMA ZA UMMA:
    Tanzania: NIDA, RITA, BRELA, TRA, PCCB, CHRAGG, Bunge la Tanzania

═══ LUGHA NA MTINDO ═══
- Kiswahili sanifu cha Tanzania — cha karibu, chenye heshima
- Jibu kama rafiki wa kisomi — wazi, rahisi, wenye ujuzi
- Swali moja tu mwishoni — si maswali 2 au 3
- EPUKA sentensi ndefu, headers kubwa, orodha ndefu

═══ KANUNI YA SEARCH — MUHIMU SANA ═══
Ukitumia search tool (Google Search au web_search):
- KAMWE usimwoneshe mtumiaji "mawazo yako ya ndani" — kama "Asante, lakini nilijibu bila kuthibitisha kwanza" au "samahani nirekebishe"
- Fanya search KWANZA kimya kabisa, kisha andika JIBU MOJA TU la mwisho, safi, lenye taarifa sahihi
- Mtumiaji haitaji kuona mchakato wako wa kuthibitisha — anataka jibu sahihi moja tu
- Usianze jibu mpaka uwe na uhakika wa taarifa — kisha jibu moja kwa moja kwa ujasiri`;

// Maswali/maneno ambayo HAYAHITAJI web search kamwe — salamu, shukrani, mazungumzo
// ya kawaida, au maswali ya maarifa ya jumla yasiyobadilika kwa wakati.
const NO_SEARCH_PATTERNS = [
  /^(habari|mambo|hujambo|shikamoo|salamu|hi|hello|hey)[\s!.,?]*$/i,
  /^(asante|shukrani|sawa|ok|okay|poa|vizuri|hongera)[\s!.,?]*$/i,
  /wewe ni nani|jina lako|unaitwa nani|unafanya nini/i,
  /unaweza kunisaidia|unaweza nini|huduma zako/i,
  /nini maana ya|fafanua|eleza|elewesha|maana ya neno/i,
  /jinsi ya kuandika|jinsi gani ya kufanya|hatua za/i,
  /tengeneza\s*(picha|poster|logo|design|tangazo|flyer|banner)/i
];

function needsWebSearch(message) {
  const msg = message.toLowerCase().trim();
  if (msg.split(/\s+/).length <= 1) return false;
  if (NO_SEARCH_PATTERNS.some(p => p.test(msg))) return false;
  return true;
}

// ── Tambua maombi ya picha ──────────────────────────
const IMAGE_PATTERN = /tengeneza\s*(picha|poster|logo|design|graphics|flyer|banner)|nitengenezee\s*(picha|poster|logo)|natengenezea\s*(picha|poster|logo)|chora\s*(picha|logo)|generate\s*image|create\s*image|make\s*(image|logo|poster)|picha\s*ya|poster\s*ya|logo\s*ya|design\s*ya/i;

function isImageRequest(message) {
  return IMAGE_PATTERN.test(message);
}

// ── Tambua maombi ya INVOICE HALISI (tool use) ──────
const INVOICE_TOOL_PATTERN = /tengeneza\s*invoice|tengeneza\s*ankara|niandalie\s*invoice|niandalie\s*ankara|nitengenezee\s*invoice|create\s*invoice|fanya\s*invoice/i;

function isInvoiceToolRequest(message) {
  return INVOICE_TOOL_PATTERN.test(message);
}

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;

async function supabaseQuery(table, method, data = null, filter = null) {
  if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) return null;
  try {
    let url = `${SUPABASE_URL}/rest/v1/${table}`;
    if (filter) url += `?${filter}`;
    const opts = {
      method,
      headers: {
        'Content-Type': 'application/json',
        'apikey': SUPABASE_SERVICE_KEY,
        'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
        'Prefer': method === 'POST' ? 'return=representation' : ''
      }
    };
    if (data) opts.body = JSON.stringify(data);
    const res = await fetch(url, opts);
    if (res.ok) {
      const text = await res.text();
      return text ? JSON.parse(text) : null;
    }
    return null;
  } catch(e) { return null; }
}

async function saveChat(email, message, reply) {
  await supabaseQuery('chats', 'POST', {
    user_email: email || 'anonymous', message, reply
  });
}

// ════════════════════════════════════════════════════
// TOOL USE: create_invoice
// ════════════════════════════════════════════════════

const CREATE_INVOICE_TOOL = {
  name: "create_invoice",
  description: "Tengeneza invoice halisi kwenye database kwa ajili ya mteja. Tumia tool hii pale mtumiaji anapoomba kutengeneza/kuandaa invoice HALISI itakayohifadhiwa (si mfano wa maandishi tu). Kama huna uhakika wa client_id au service_line_id, tumia majina ya maandishi (client_name, service_name) na mfumo utatafuta IDs husika kiotomatiki kutoka database.",
  input_schema: {
    type: "object",
    properties: {
      client_name: {
        type: "string",
        description: "Jina la mteja kama lilivyoandikwa na mtumiaji (mfano: 'Tanganyika Plywood', 'Baltic Business Group'). Mfumo utatafuta client_id kutoka jedwali la clients."
      },
      service_name: {
        type: "string",
        description: "Aina ya huduma inayotolewa (mfano: 'Security Services', 'Deep Cleaning'). Mfumo utatafuta service_line_id."
      },
      issue_date: {
        type: "string",
        description: "Tarehe ya kutolewa invoice, format YYYY-MM-DD. Kama haijatajwa, tumia tarehe ya leo."
      },
      due_date: {
        type: "string",
        description: "Tarehe ya mwisho ya malipo, format YYYY-MM-DD."
      },
      items: {
        type: "array",
        description: "Orodha ya bidhaa/huduma zinazotozwa kwenye invoice.",
        items: {
          type: "object",
          properties: {
            description: { type: "string", description: "Maelezo ya huduma/bidhaa" },
            quantity: { type: "number", description: "Idadi" },
            unit_price: { type: "number", description: "Bei kwa kila kimoja (TZS)" }
          },
          required: ["description", "quantity", "unit_price"]
        }
      },
      tax_amount: {
        type: "number",
        description: "Kiasi cha kodi (VAT). Kama haijatajwa, tumia 0."
      }
    },
    required: ["client_name", "service_name", "due_date", "items"]
  }
};

async function handleCreateInvoice(input, userEmail) {
  const { client_name, service_name, issue_date, due_date, items, tax_amount } = input;

  try {
    // 1. Tafuta client_id
    const clients = await supabaseQuery(
      'clients', 'GET', null,
      `name=ilike.*${encodeURIComponent(client_name)}*&select=id,name&limit=1`
    );
    if (!clients || clients.length === 0) {
      return { success: false, message: `Sikumpata mteja "${client_name}" kwenye database. Hakikisha jina ni sahihi.` };
    }
    const client_id = clients[0].id;

    // 2. Tafuta service_line_id
    // KUMBUKA: thibitisha jina sahihi la jedwali — hapa tunatumia "service_lines"
    const services = await supabaseQuery(
      'service_lines', 'GET', null,
      `name=ilike.*${encodeURIComponent(service_name)}*&select=id,name&limit=1`
    );
    if (!services || services.length === 0) {
      return { success: false, message: `Sikuipata huduma "${service_name}" kwenye database. Hakikisha jina ni sahihi.` };
    }
    const service_line_id = services[0].id;

    // 3. Hesabu jumla
    const subtotal = items.reduce((sum, item) => sum + (item.quantity * item.unit_price), 0);
    const tax = tax_amount || 0;
    const total_amount = subtotal + tax;

    // 4. Invoice number
    const today = new Date();
    const dateStr = today.toISOString().slice(0, 10).replace(/-/g, '');
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const invoice_number = `INV-${dateStr}-${randomSuffix}`;

    // 5. Ingiza invoice
    const invoiceResult = await supabaseQuery('invoices', 'POST', {
      invoice_number,
      client_id,
      service_line_id,
      issue_date: issue_date || today.toISOString().slice(0, 10),
      due_date,
      status: 'unpaid',
      subtotal,
      tax_amount: tax,
      total_amount,
      amount_paid: 0,
      created_by: userEmail || null
    });

    if (!invoiceResult || !invoiceResult[0]) {
      return { success: false, message: 'Imeshindwa kuhifadhi invoice kwenye database.' };
    }
    const invoiceId = invoiceResult[0].id;

    // 6. Ingiza invoice_items
    const itemsToInsert = items.map(item => ({
      invoice_id: invoiceId,
      description: item.description,
      quantity: item.quantity,
      unit_price: item.unit_price,
      line_total: item.quantity * item.unit_price
    }));
    await supabaseQuery('invoice_items', 'POST', itemsToInsert);

    return {
      success: true,
      invoice_number,
      client: clients[0].name,
      service: services[0].name,
      subtotal,
      tax_amount: tax,
      total_amount,
      due_date,
      message: `Invoice ${invoice_number} imetengenezwa na kuhifadhiwa kwa mafanikio kwa ${clients[0].name}. Jumla: TZS ${total_amount.toLocaleString()}`
    };

  } catch (err) {
    return { success: false, message: `Kosa la kiufundi: ${err.message}` };
  }
}

// Claude na tool use (loop) — hutumika kwa maombi ya invoice halisi
async function callClaudeWithTools(message, history, apiKey, userEmail) {
  const messages = [];
  if (history && Array.isArray(history)) {
    history.slice(-6).forEach(h => {
      if (h.role && h.content) messages.push({ role: h.role, content: h.content });
    });
  }
  messages.push({ role: 'user', content: message });

  const body = {
    model: 'claude-sonnet-4-6',
    max_tokens: 1200,
    system: SYSTEM_PROMPT,
    tools: [CREATE_INVOICE_TOOL],
    messages
  };

  let response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01'
    },
    body: JSON.stringify(body)
  });

  if (!response.ok) {
    const err = await response.json();
    throw new Error(err?.error?.message || 'Claude API ilikataa');
  }

  let data = await response.json();

  // Loop kama Claude ametaka kutumia tool
  let safetyCounter = 0;
  while (data.stop_reason === 'tool_use' && safetyCounter < 3) {
    safetyCounter++;
    const toolBlock = data.content.find(b => b.type === 'tool_use');
    if (!toolBlock) break;

    let toolResult;
    if (toolBlock.name === 'create_invoice') {
      toolResult = await handleCreateInvoice(toolBlock.input, userEmail);
    } else {
      toolResult = { success: false, message: 'Tool isiyojulikana.' };
    }

    messages.push({ role: 'assistant', content: data.content });
    messages.push({
      role: 'user',
      content: [{
        type: 'tool_result',
        tool_use_id: toolBlock.id,
        content: JSON.stringify(toolResult)
      }]
    });

    response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-6',
        max_tokens: 1200,
        system: SYSTEM_PROMPT,
        tools: [CREATE_INVOICE_TOOL],
        messages
      })
    });

    if (!response.ok) {
      const err = await response.json();
      throw new Error(err?.error?.message || 'Claude API ilikataa (tool loop)');
    }
    data = await response.json();
  }

  let reply = '';
  if (data.content && Array.isArray(data.content)) {
    for (const block of data.content) {
      if (block.type === 'text') reply += block.text;
    }
  }
  return reply || 'Samahani, sijapata jibu. Tafadhali jaribu tena!';
}

const PLAN_LIMITS = {
  trial:    { daily: 20,   name: 'Jaribio (Siku 7)' },
  free:     { daily: 5,    name: 'Bure' },
  msingi:   { daily: 50,   name: 'Msingi' },
  kawaida:  { daily: 150,  name: 'Kawaida' },
  pro:      { daily: null, name: 'Pro' },
  biashara: { daily: null, name: 'Biashara' }
};

const ipRateMap = new Map();

function checkIpRateLimit(req) {
  const ip = req.headers['x-forwarded-for']?.split(',')[0]?.trim()
    || req.headers['x-real-ip']
    || req.socket?.remoteAddress
    || 'unknown';

  const now     = Date.now();
  const window  = 60 * 1000;
  const maxReqs = 30;

  const record = ipRateMap.get(ip) || { count: 0, start: now };

  if (now - record.start > window) {
    ipRateMap.set(ip, { count: 1, start: now });
    return { allowed: true };
  }

  if (record.count >= maxReqs) {
    return {
      allowed: false,
      message: 'Umetuma maombi mengi sana. Subiri dakika moja kisha jaribu tena! ⏳'
    };
  }

  record.count++;
  ipRateMap.set(ip, record);
  return { allowed: true };
}

setInterval(() => {
  const now = Date.now();
  for (const [ip, record] of ipRateMap.entries()) {
    if (now - record.start > 60 * 60 * 1000) ipRateMap.delete(ip);
  }
}, 60 * 60 * 1000);

async function checkUser(email) {
  if (!email) {
    return { allowed: true, plan: 'trial', trialDaysLeft: 7, isGuest: true };
  }
  try {
    const users = await supabaseQuery('users', 'GET', null, `email=eq.${email}`);
    const user  = users?.[0];

    if (!user) {
      await supabaseQuery('users', 'POST', {
        email,
        plan: 'trial',
        trial_start: new Date().toISOString().split('T')[0],
        questions_today: 1,
        last_question_date: new Date().toISOString().split('T')[0]
      });
      return { allowed: true, plan: 'trial', trialDaysLeft: 7 };
    }

    const plan   = user.plan || 'trial';
    const limits = PLAN_LIMITS[plan] || PLAN_LIMITS.free;
    const today  = new Date().toISOString().split('T')[0];

    if (plan === 'trial') {
      const trialStart = new Date(user.trial_start || today);
      const now        = new Date();
      const daysPassed = Math.floor((now - trialStart) / (1000 * 60 * 60 * 24));
      const daysLeft   = Math.max(0, 7 - daysPassed);

      if (daysLeft === 0) {
        return {
          allowed: false,
          plan: 'trial',
          trialDaysLeft: 0,
          message: `⏰ Muda wako wa bure wa siku 7 umeisha!\n\nLipa na upate code ya kuendelea:\n💳 TZS 5,000/mwezi — Msingi\n💳 TZS 30,000/mwezi — Pro\n\nLipa: ajplusai.co.tz au WhatsApp +255762307647`,
          showActivation: true
        };
      }

      if (user.last_question_date !== today) {
        await supabaseQuery('users', 'PATCH', {
          questions_today: 1, last_question_date: today
        }, `email=eq.${email}`);
      } else {
        await supabaseQuery('users', 'PATCH', {
          questions_today: (user.questions_today || 0) + 1
        }, `email=eq.${email}`);
      }

      return { allowed: true, plan: 'trial', trialDaysLeft: daysLeft };
    }

    if (!limits.daily) return { allowed: true, plan };

    if (user.last_question_date !== today) {
      await supabaseQuery('users', 'PATCH', {
        questions_today: 1, last_question_date: today
      }, `email=eq.${email}`);
      return { allowed: true, plan };
    }

    if (user.questions_today >= limits.daily) {
      return {
        allowed: false, plan,
        message: `Umefika kikomo cha maswali ${limits.daily} kwa leo! Panda mpango wako kwenye ajplusai.co.tz 🇹🇿`
      };
    }

    await supabaseQuery('users', 'PATCH', {
      questions_today: (user.questions_today || 0) + 1,
      last_question_date: today
    }, `email=eq.${email}`);

    return { allowed: true, plan };

  } catch(e) {
    return { allowed: true, plan: 'trial', trialDaysLeft: 7 };
  }
}

async function callClaude(message, history, apiKey, useWebSearch = false) {
  const messages = [];
  if (history && Array.isArray(history)) {
    history.slice(-6).forEach(h => {
      if (h.role && h.content) messages.push({ role: h.role, content: h.content });
    });
  }
  messages.push({ role: 'user', content: message });

  const isLongDoc = /barua|invoice|ankara|ripoti|maombi ya kazi|cv|resume|mkataba|contract/i.test(message);

  const body = {
    model: 'claude-sonnet-4-6',
    max_tokens: isLongDoc ? 1500 : 800,
    system: SYSTEM_PROMPT,
    messages
  };

  if (useWebSearch) {
    body.tools = [{ type: 'web_search_20250305', name: 'web_search', max_uses: 2 }];
  }

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01'
    },
    body: JSON.stringify(body)
  });

  if (!response.ok) {
    const err = await response.json();
    throw new Error(err?.error?.message || 'Claude API ilikataa');
  }

  const data = await response.json();
  let reply = '';
  if (data.content && Array.isArray(data.content)) {
    for (const block of data.content) {
      if (block.type === 'text') reply += block.text;
    }
  }
  return reply || 'Samahani, sijapata jibu. Tafadhali jaribu tena!';
}

async function callGemini(message, history, apiKey, useWebSearch = false) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;
  const contents = [];

  if (history && Array.isArray(history)) {
    history.slice(-6).forEach(h => {
      if (h.role && h.content) {
        contents.push({
          role: h.role === 'assistant' ? 'model' : 'user',
          parts: [{ text: h.content }]
        });
      }
    });
  }
  const todayStr = new Date().toLocaleDateString('sw-TZ', {
    year: 'numeric', month: 'long', day: 'numeric'
  });

  const dateNote = useWebSearch
    ? `\n\n═══ TAREHE YA LEO ═══\nLeo ni: ${todayStr}. Kwa swali hili, tumia Google Search ili kupata taarifa za sasa hivi kabla ya kujibu — usitumie maarifa ya zamani kuhusu matukio, bei, au habari ambazo zinaweza kuwa zimebadilika.`
    : '';

  contents.push({ role: 'user', parts: [{ text: message }] });

  const body = {
    systemInstruction: { parts: [{ text: SYSTEM_PROMPT + dateNote }] },
    contents,
    generationConfig: { temperature: 0.7, maxOutputTokens: 1500 }
  };

  if (useWebSearch) {
    body.tools = [{ googleSearch: {} }];
  }

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });

  if (!response.ok) {
    const err = await response.json();
    throw new Error(err?.error?.message || 'Gemini API ilikataa');
  }

  const data = await response.json();
  const parts = data.candidates?.[0]?.content?.parts || [];
  const text  = parts.map(p => p.text || '').join('').trim();
  const finishReason = data.candidates?.[0]?.finishReason || '';

  if (!text) {
    throw new Error(`Gemini jibu tupu (finishReason: ${finishReason || 'haijulikani'})`);
  }
  return text;
}

const ALLOWED_DOMAINS = [
  'ajplusai.co.tz', 'www.ajplusai.co.tz',
  'localhost:3000', 'localhost', '127.0.0.1'
];

function isAllowedDomain(req) {
  const origin  = req.headers.origin  || '';
  const referer = req.headers.referer || '';
  const host    = req.headers.host    || '';
  if (origin.includes('vercel.app') || referer.includes('vercel.app')) return true;
  if (host.includes('vercel.app')) return true;
  return ALLOWED_DOMAINS.some(d =>
    origin.includes(d) || referer.includes(d) || host.includes(d)
  );
}

module.exports = async function handler(req, res) {
  if (!isAllowedDomain(req)) {
    return res.status(403).json({
      error: 'Huduma hii inapatikana kwenye ajplusai.co.tz tu.',
      website: 'https://ajplusai.co.tz'
    });
  }

  res.setHeader('Access-Control-Allow-Origin', 'https://ajplusai.co.tz');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const ipCheck = checkIpRateLimit(req);
  if (!ipCheck.allowed) {
    return res.status(429).json({ error: ipCheck.message });
  }

  try {
    let body = req.body;
    if (typeof body === 'string') {
      try { body = JSON.parse(body); } catch(e) { body = {}; }
    }
    if (!body) body = {};

    const message   = body.message;
    const history   = body.history || [];
    const userEmail = body.email   || null;

    if (!message) return res.status(400).json({ error: 'Swali linahitajika' });

    const userCheck = await checkUser(userEmail);

    if (!userCheck.allowed) {
      return res.status(429).json({
        error: userCheck.message,
        showActivation: userCheck.showActivation || false,
        upgrade: true
      });
    }

    const CLAUDE_KEY = process.env.ANTHROPIC_API_KEY;
    const GEMINI_KEY = process.env.GEMINI_API_KEY;

    let reply  = null;
    let source = null;

    // ── TOOL USE: Maombi ya invoice halisi → Claude + tools (kabla ya kila kitu) ──
    const isInvoiceTool = isInvoiceToolRequest(message);

    if (isInvoiceTool && CLAUDE_KEY) {
      try {
        reply  = await callClaudeWithTools(message, history, CLAUDE_KEY, userEmail);
        source = 'claude-tool-invoice';
      } catch(err) {
        console.warn('Claude tool use imeshindwa:', err.message);
      }
    }

    // ── Maombi ya picha/poster/logo → Claude daima ──
    const isImageMsg  = isImageRequest(message);
    const isLongDoc   = /barua|invoice|ankara|ripoti|maombi ya kazi|cv|resume|mkataba|contract/i.test(message);
    const needsClaude = isImageMsg || isLongDoc;
    const needsSearch = needsWebSearch(message);

    if (!reply && needsClaude && CLAUDE_KEY) {
      try {
        reply  = await callClaude(message, history, CLAUDE_KEY, false);
        source = 'claude';
      } catch(err) {
        console.warn('Claude imeshindwa (labda credits zimeisha):', err.message);
      }
    }

    // Maswali ya kawaida → Gemini kwanza (na web search ikiwa swali linahitaji)
    if (!reply && !needsClaude && GEMINI_KEY) {
      try {
        reply  = await callGemini(message, history, GEMINI_KEY, needsSearch);
        source = needsSearch ? 'gemini+web' : 'gemini';
      } catch(err) {
        console.warn('Gemini imeshindwa:', err.message);
      }
    }

    // ── MUHIMU: Claude akishindwa (credits zimeisha) kwa picha/hati,
    //    GEMINI inajaribu kuokoa badala ya kukwama ──
    if (!reply && needsClaude && GEMINI_KEY) {
      try {
        reply  = await callGemini(message, history, GEMINI_KEY, false);
        source = 'gemini-fallback';
      } catch(err) {
        console.warn('Gemini fallback (kwa hati/picha) imeshindwa:', err.message);
      }
    }

    // Fallback → Claude (kama Gemini ndiye aliyeshindwa hapo juu kwa swali
    // la kawaida). Kama swali linahitaji taarifa za sasa, Claude apewe
    // web_search yake pia — la sivyo angerudisha "sina uwezo wa mtandao"!
    if (!reply && CLAUDE_KEY) {
      try {
        reply  = await callClaude(message, history, CLAUDE_KEY, needsSearch);
        source = needsSearch ? 'claude+web' : 'claude';
      } catch(err) {
        console.warn('Claude fallback imeshindwa:', err.message);
      }
    }

    // Fallback ya mwisho → Gemini bila web search
    if (!reply && GEMINI_KEY) {
      try {
        reply  = await callGemini(message, history, GEMINI_KEY, false);
        source = 'gemini';
      } catch(err) {
        return res.status(500).json({ error: 'Huduma haipo sasa hivi. Tafadhali jaribu tena.' });
      }
    }

    if (!reply) {
      return res.status(500).json({ error: 'Hakuna API Key — weka kwenye Vercel Settings' });
    }

    await saveChat(userEmail, message, reply);

    return res.status(200).json({
      reply, source,
      plan: userCheck.plan,
      trialDaysLeft: userCheck.trialDaysLeft,
      webSearch: source?.includes('web') || false
    });

  } catch(err) {
    console.error('AJPLUS AI Error:', err);
    return res.status(500).json({ error: 'Kosa la seva: ' + err.message });
  }
};
