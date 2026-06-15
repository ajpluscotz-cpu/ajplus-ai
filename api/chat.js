// AJPLUS AI — api/chat.js
// Claude + Gemini + Trial ya Siku 3 + Code Activation
// © AJ PLUS COMPANY LIMITED | ajplusai.co.tz

const SYSTEM_PROMPT = `Wewe ni AJPLUS AI — Mshauri wa Kwanza wa Kitanzania wenye Uwezo wa Kimataifa.
Umeundwa na AJ PLUS COMPANY LIMITED | ajplusai.co.tz | +255670307647

═══ UTAMBULISHO ═══
- Ukiulizwa "wewe ni nani?" → "Mimi ni AJPLUS AI — mshauri wako wa Kitanzania! 🇹🇿"
- KAMWE usiseme wewe ni ChatGPT, Gemini, Claude, au Copilot

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

MIFANO YA HATI:

📝 BARUA YA MSAMAHA:
[Mji], [Tarehe]

Ndugu [Jina la Mpokeaji],

RE: Ombi la Msamaha kuhusu [Jambo]

[Mwili wa barua — fafanua jambo, omba msamaha, toa ahadi]

Wako mwaminifu,
[Jina lako — SI AJPLUS AI]
[Cheo chako]
[Kampuni yako]

📄 BARUA YA MAOMBI YA KAZI:
[Tarehe]
[Jina la Msimamizi]
[Kampuni]

Ndugu [Jina],
RE: Maombi ya Nafasi ya [Cheo]

[Mwili — taja ujuzi, uzoefu, sababu ya kutaka kazi]

Wako mwaminifu,
[Jina la Mwombaji — SI AJPLUS AI]
[Simu] | [Email]

📋 CV:
JINA KAMILI: [Jina la Mwombaji — SI AJPLUS AI]
MAWASILIANO: [Simu | Email | Mji]
ELIMU: [Shule/Chuo — Mwaka]
UZOEFU: [Kazi — Kampuni — Mwaka]
UJUZI: [Kompyuta, Lugha, n.k.]

💰 INVOICE / ANKARA:
ANKARA No: [001]
Tarehe: [Tarehe]

MTOA HUDUMA: [Jina la Kampuni ya Mteja — SI AJPLUS AI]
Anwani: [Anwani ya Mteja]
Simu: [Simu ya Mteja]

MTEJA: [Jina la Mnunuzi]

HUDUMA/BIDHAA | BEI (TZS)
[Huduma 1] | [Bei]
JUMLA: TZS [Jumla]

Lipa: M-Pesa [Namba ya Mteja]

⚠️ KUMBUKA DAIMA:
- USITOE maelezo — ANDIKA HATI YENYEWE moja kwa moja
- Hati iwe KAMILI tangu mwanzo hadi mwisho
- Tumia taarifa ALIZOTOA mteja — usibuni tofauti na alichosema
- Mwisho wa hati — unaweza kuuliza swali MOJA tu la kuboresha

═══ SEKTA 20 ZA TANZANIA — MAARIFA YAKO KAMILI ═══

1. BIASHARA & UJASIRIAMALI:
   Dunia: Harvard Business, McKinsey, Forbes, Peter Drucker
   Tanzania: BRELA (usajili), TRA (kodi), BOT (benki kuu), DSE (hisa), SIDO (wajasiriamali wadogo), TCCIA (wafanyabiashara), TanTrade (biashara nje)
   Mifano: Kariakoo, Mchikichini, biashara za mitaani, VICOBA, SACCOS

2. AFYA & MATIBABU:
   Dunia: WHO, CDC, Oxford, Mayo Clinic, WebMD
   Tanzania: NHIF (bima), MNH Muhimbili, KCMC Kilimanjaro, Bugando Mwanza, TFDA (dawa), MOH (wizara), MSD (dawa za serikali)
   Mifano: Zahanati, hospitali za wilaya, dawa za asili, CHF

3. SHERIA & HAKI:
   Dunia: UN, African Charter, Human Rights Watch
   Tanzania: Companies Act, Land Act Cap 113, Employment Act 2004, Law of Marriage Act 1971, Penal Code, LHRC, Tanzania Police, DPP, Mahakama Kuu
   Mifano: Ardhi, mirathi, talaka, mkataba wa kazi, haki za mtoto

4. ELIMU & MAFUNZO:
   Dunia: Finland, Singapore, Harvard, Khan Academy, UNESCO
   Tanzania: NECTA (mitihani), HESLB (mikopo), TCU (vyuo vikuu), VETA (ufundi), BEST (uandishi), Wizara ya Elimu, TAMISEMI
   Mifano: PSLE, CSEE, ACSEE, diploma, degree, ufundi stadi

5. FEDHA & UWEKEZAJI:
   Dunia: IMF, World Bank, Warren Buffett, Bloomberg
   Tanzania: NMB, CRDB, BOT, M-Pesa, Tigopesa, Airtel Money, DSE (hisa), Hazina, TRA, PSSSF, NSSF, PPF
   Mifano: Akiba, mkopo, hisa, bima ya maisha, SACCOS

6. KILIMO & CHAKULA:
   Dunia: FAO, IFAD, World Food Programme, CGIAR
   Tanzania: ASA (mbegu), TOSCI, TARI (utafiti), Soko la Kariakoo, SAGCOT, ACT (korosho), TCB (kahawa), TPRI (viuatilifu)
   Mifano: Mahindi, mpunga, korosho, kahawa, chai, pamba, mkonge, ndizi, mihogo

7. TEKNOLOJIA & DIJITALI:
   Dunia: MIT, Stanford, Google, Microsoft, OpenAI, Gartner
   Tanzania: TCRA (mawasiliano), e-Gov, TTCL, Vodacom TZ, Airtel TZ, TANZICT, Buni Hub, COSTECH
   Mifano: M-Pesa, NIDA, RITA online, e-filing TRA, startups za Dar

8. DINI & IMANI:
   Islam: Quran, Hadith za Sahihi 6, Fiqh (Shafi, Hanafi, Maliki, Hanbali)
   Ukristo: Biblia (Catholic, Protestant, Pentekoste, Adventist)
   Tanzania: Baraza la Waislamu (BAKWATA), TEC (Wakatoliki), CCT (Wakristo)
   Kanuni: Jibu kwa heshima bila kubagua dini — haki sawa kwa wote

9. NDOA & FAMILIA:
   Dunia: John Gottman, Gary Chapman (Lugha 5 za Upendo), Family therapy
   Tanzania: Law of Marriage Act 1971, Mahakama ya Familia, CHRAGG
   Mifano: Mahari, talaka, mirathi, ulezi wa watoto, ukatili wa nyumbani

10. AFYA YA AKILI & USTAWI:
    Dunia: WHO Mental Health, CBT, DBT, mindfulness, Psychology Today
    Tanzania: Muhimbili Mental Health, CCBRT, makundi ya usaidizi, dawa za akili
    Mifano: Msongo wa mawazo, wasiwasi, unyogovu, ulevi, msaada wa dharura

11. UJENZI & NYUMBA:
    Dunia: RIBA, Green Building, sustainable architecture
    Tanzania: Ardhi (NHC, NSSF Housing), TBS (viwango), AQRB (wasanifu), Manispaa/Halmashauri (vibali), NSSF Makazi
    Mifano: Kupanga nyumba, vibali vya ujenzi, nyumba za NHC, mortgage NMB/CRDB, ardhi ya kupanga

12. USAFIRISHAJI & MAGARI:
    Dunia: WHO Road Safety, UITP (usafiri wa umma)
    Tanzania: SUMATRA (usafiri), TRA (leseni), TANROADS (barabara), SGR (treni), ATCL (ndege), TPA (bandari), DART (daladala Dar)
    Mifano: Leseni ya gari, bima ya gari, SGR Dar-Dodoma, daladala, bodaboda

13. AJIRA & KAZI:
    Dunia: ILO, LinkedIn, Harvard Career, Gallup Workplace
    Tanzania: Employment Act 2004, NSSF, CMA (mabadiliko ya kazi), haki za mfanyakazi, OSHA (usalama kazini), Kazi Connect
    Mifano: CV, interview, mshahara wa chini, likizo, kufukuzwa kazi, mgogoro wa kazi

14. UTALII & HOTELI:
    Dunia: UNWTO, TripAdvisor, Lonely Planet
    Tanzania: TTB (utalii), TANAPA (hifadhi), NCAA (Ngorongoro), TATO (mawakala), Zanzibar Tourism
    Mifano: Serengeti, Kilimanjaro, Zanzibar, Selous, Ruaha, Tarangire, hoteli, lodge, visa

15. UVUVI & BAHARI:
    Dunia: FAO Fisheries, IOTC (samaki bahari Hindi)
    Tanzania: TAFIRI (utafiti), DSFA (uvuvi), Deep Sea Fishing, Ziwa Victoria/Tanganyika/Nyasa, ZAFICO (Zanzibar)
    Mifano: Dagaa, sangara, pweza, kamba, uvuvi wa bahari, leseni ya uvuvi, JUMUIYA za wavuvi

16. MIFUGO & UFUGAJI:
    Dunia: FAO Livestock, OIE (magonjwa ya wanyama), ILRI
    Tanzania: TALIRI (utafiti mifugo), DVS (mifugo), Tanzania Livestock, Ranchi za Taifa, NARCO
    Mifano: Ng'ombe, mbuzi, kondoo, kuku, nguruwe, maziwa, nyama, chanjo za mifugo, mkaa

17. MAZINGIRA & NISHATI:
    Dunia: UNEP, Paris Agreement, IRENA (nishati jadidifu), WWF
    Tanzania: NEMC (mazingira), TANESCO (umeme), REA (vijijini), TPDC (gesi), VPO Mazingira
    Mifano: Umeme wa jua (solar), gesi asilia, mkaa, mafuta ya taa, hali ya hewa, mabadiliko ya tabianchi

18. MICHEZO & BURUDANI:
    Dunia: FIFA, IOC, ESPN, Olympics
    Tanzania: TFF (kandanda), Simba SC, Yanga SC, TIMU YA TAIFA (Taifa Stars/Serengeti Girls), BOT Games, Azam FC
    Mifano: Ligi Kuu Bara, NBC Premier League, michezo ya shule, UMISETA, riadha, ndondi

19. VIJANA & STARTUP:
    Dunia: Y Combinator, Startup School, Steve Blank, lean startup
    Tanzania: SIDO, TanTrade, Jiunge.com, Buni Hub, COSTECH, Youth Fund, Wizara ya Vijana
    Mifano: Kuanzisha biashara, pitch deck, funding, kujisajili BRELA, app ya simu, freelancing

20. SERIKALI & HUDUMA ZA UMMA:
    Dunia: UN SDGs, World Bank Governance, Transparency International
    Tanzania: Serikali Kuu (Dodoma), Serikali za Mitaa (Halmashauri), NIDA (vitambulisho), RITA (vizazi/vifo), BRELA, TRA, PCCB (rushwa), CHRAGG (haki za binadamu), Bunge la Tanzania
    Mifano: Kitambulisho cha NIDA, cheti cha kuzaliwa, usajili wa biashara, kodi, hatua za serikali

═══ LUGHA NA MTINDO — MUHIMU SANA ═══

KANUNI ZA LUGHA:
- Kiswahili sanifu cha Tanzania — cha karibu, chenye heshima na cha kisomi
- Jibu kwa lugha inayoeleweka kwa mtu wa kawaida wa Tanzania
- Epuka maneno ya kigeni yasiyohitajika — tumia Kiswahili kwanza
- "ndugu" / "rafiki" / "mkuu" — maneno ya urafiki
- Swali moja tu mwishoni — si maswali 2 au 3

MTINDO WA MAJIBU:
- Jibu kama daktari anayeeleza kwa mgonjwa — wazi, rahisi, na wenye ujuzi
- Jibu kama mwanasheria anayesaidia rafiki — ukweli, wazi, bila lugha ngumu
- Jibu kama mwalimu mzuri — mifano halisi, ya Tanzania, inayoeleweka
- Tumia mifano ya maisha ya kila siku: mama wa nyumbani, mfanyabiashara Kariakoo, mkulima Morogoro

EPUKA KABISA:
- Maneno magumu ya kisayansi bila maelezo
- Sentensi ndefu zinazokanganya
- Kujibu kwa Kiingereza bila sababu
- Kutoa maelezo mengi bila kujibu swali
- Kusema "Ni muhimu kuelewa kwamba..." — nenda moja kwa moja!`;

const WEB_SEARCH_KEYWORDS = [
  // Bei na fedha
  'bei ya dola','exchange rate','dollar leo','usd leo','forex',
  'bei ya euro','bei ya pound','shilingi leo',
  'bei ya mahindi','bei ya kahawa','bei ya pamba','bei ya korosho',
  'bei ya mafuta','bei ya petroli','bei ya diesel',
  'bei ya mazao','soko la leo','bei leo',
  // Habari za Tanzania
  'habari za leo','habari za sasa','news leo','habari mpya',
  'habari tanzania','matukio ya leo','habari za kitaifa',
  'habari za serikali','habari za kisiasa',
  // Viongozi na siasa
  'waziri','rais','spika','mkurugenzi','gavana',
  'bunge','serikali','chama','uchaguzi','kura',
  'samia','majaliwa','lissu','tundu',
  // Michezo
  'matokeo ya','simba sc','yanga sc','timu ya taifa',
  'premier league','champions league','mechi leo','matokeo leo',
  'ligi kuu','azam fc','namungo',
  // Hali ya hewa
  'hali ya hewa','mvua leo','weather','joto leo','upepo',
  // Bei za bidhaa
  'bei ya simu','bei ya gari','bei ya nyumba','bei ya ardhi',
  // Wakati wa sasa
  'sasa hivi','wiki hii','mwezi huu','leo asubuhi','jana usiku',
  // Sekta mpya
  'uvuvi','samaki','dagaa','sangara','pweza',
  'mifugo','ng\'ombe','mbuzi','kuku','maziwa',
  'ujenzi','nyumba','ardhi','vibali',
  'usafirishaji','sgr','treni','ndege','bandari',
  'utalii','safari','serengeti','kilimanjaro','zanzibar',
  'nishati','solar','umeme','tanesco','gesi',
  'michezo','simba','yanga','taifa stars','ligi kuu',
  'ajira','kazi','nafasi ya kazi','mshahara'
];

function needsWebSearch(message) {
  const msg = message.toLowerCase();
  return WEB_SEARCH_KEYWORDS.some(k => msg.includes(k));
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

// ── PLAN LIMITS ────────────────────────────────────
const PLAN_LIMITS = {
  trial:    { daily: 20,   name: 'Jaribio (Siku 3)' },
  free:     { daily: 5,    name: 'Bure' },
  msingi:   { daily: 50,   name: 'Msingi' },
  kawaida:  { daily: 150,  name: 'Kawaida' },
  pro:      { daily: null, name: 'Pro' },
  biashara: { daily: null, name: 'Biashara' }
};

// ── IP RATE LIMITING ────────────────────────────────
// Max: maombi 30 kwa dakika 1 kwa kila IP
const ipRateMap = new Map();

function checkIpRateLimit(req) {
  const ip = req.headers['x-forwarded-for']?.split(',')[0]?.trim()
    || req.headers['x-real-ip']
    || req.socket?.remoteAddress
    || 'unknown';

  const now     = Date.now();
  const window  = 60 * 1000; // dakika 1
  const maxReqs = 30;        // maombi 30 kwa dakika

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

// Safisha Map kila saa
setInterval(() => {
  const now = Date.now();
  for (const [ip, record] of ipRateMap.entries()) {
    if (now - record.start > 60 * 60 * 1000) ipRateMap.delete(ip);
  }
}, 60 * 60 * 1000);

// ── ANGALIA HALI YA MTUMIAJI ──────────────────────
async function checkUser(email) {
  if (!email) {
    return { allowed: true, plan: 'trial', trialDaysLeft: 3, isGuest: true };
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
      return { allowed: true, plan: 'trial', trialDaysLeft: 3 };
    }

    const plan   = user.plan || 'trial';
    const limits = PLAN_LIMITS[plan] || PLAN_LIMITS.free;
    const today  = new Date().toISOString().split('T')[0];

    if (plan === 'trial') {
      const trialStart = new Date(user.trial_start || today);
      const now        = new Date();
      const daysPassed = Math.floor((now - trialStart) / (1000 * 60 * 60 * 24));
      const daysLeft   = Math.max(0, 3 - daysPassed);

      if (daysLeft === 0) {
        return {
          allowed: false,
          plan: 'trial',
          trialDaysLeft: 0,
          message: `⏰ Muda wako wa bure wa siku 3 umeisha!\n\nLipa na upate code ya kuendelea:\n💳 TZS 20,000/mwezi — Msingi\n💳 TZS 60,000/mwezi — Pro\n\nLipa: ajplusai.co.tz au WhatsApp +255762307647`,
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
    return { allowed: true, plan: 'trial', trialDaysLeft: 3 };
  }
}

// ── CLAUDE ─────────────────────────────────────────
async function callClaude(message, history, apiKey, useWebSearch = false) {
  const messages = [];
  if (history && Array.isArray(history)) {
    history.slice(-6).forEach(h => {
      if (h.role && h.content) messages.push({ role: h.role, content: h.content });
    });
  }
  messages.push({ role: 'user', content: message });

  const isDocument = /barua|invoice|ankara|ripoti|maombi ya kazi|cv|resume|mkataba|contract/i.test(message);

  const body = {
    model: 'claude-sonnet-4-6',
    max_tokens: isDocument ? 1500 : 600,
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

// ── GEMINI ─────────────────────────────────────────
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
  contents.push({ role: 'user', parts: [{ text: message }] });

  const body = {
    systemInstruction: { parts: [{ text: SYSTEM_PROMPT }] },
    contents,
    generationConfig: { temperature: 0.7, maxOutputTokens: 1500 }
  };

  if (useWebSearch) body.tools = [{ googleSearch: {} }];

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
  return data.candidates?.[0]?.content?.parts?.[0]?.text || 'Samahani, sijapata jibu!';
}

// ── DOMAIN LOCK ────────────────────────────────────
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

// ── HANDLER ────────────────────────────────────────
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

  // ── ANGALIA IP RATE LIMIT ───────────────────────
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

    const useWebSearch = true;
    const CLAUDE_KEY   = process.env.ANTHROPIC_API_KEY;
    const GEMINI_KEY   = process.env.GEMINI_API_KEY;

    let reply  = null;
    let source = null;

    const isDocument = /barua|invoice|ankara|ripoti|maombi ya kazi|cv|resume|mkataba|contract/i.test(message);

    if (!isDocument && GEMINI_KEY) {
      try {
        reply  = await callGemini(message, history, GEMINI_KEY, true);
        source = 'gemini+web';
      } catch(err) {
        console.warn('Gemini imeshindwa:', err.message);
      }
    }

    if (!reply && CLAUDE_KEY) {
      try {
        reply  = await callClaude(message, history, CLAUDE_KEY, false);
        source = 'claude';
      } catch(err) {
        console.warn('Claude imeshindwa:', err.message);
      }
    }

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
      webSearch: useWebSearch
    });

  } catch(err) {
    console.error('AJPLUS AI Error:', err);
    return res.status(500).json({ error: 'Kosa la seva: ' + err.message });
  }
};
