// api/whatsapp-webhook.js
// HATUA YA 2: Inaunganisha WhatsApp (Twilio) na akili ya AJPLUS AI.
// Badala ya kuandika upya logic ya Claude/Gemini, webhook hii inatumia
// api/chat.js uliyo nayo tayari - hivyo trial/mipango/malipo yanabaki sawa
// kwa wateja wa Web na WhatsApp, bila kuvuruga chat.js/auth.js iliyopo.
//
// Kila namba ya WhatsApp inapewa "synthetic email" ili iingie kwenye
// users table kama mtumiaji mpya (trial siku 7), sawa na mtumiaji wa tovuti.
//
// © AJ PLUS COMPANY LIMITED | ajplusai.co.tz

import crypto from 'crypto';

const CHAT_API_URL = 'https://ajplusai.co.tz/api/chat';

// Thibitisha kuwa ombi limetoka Twilio kweli (X-Twilio-Signature).
// Inafanya kazi pale TWILIO_AUTH_TOKEN imewekwa kwenye Vercel.
function isValidTwilioRequest(req) {
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  if (!authToken) return null; // haijasetiwa — angalia onyo kwenye logs
  const signature = req.headers['x-twilio-signature'] || '';
  const url = process.env.TWILIO_WEBHOOK_URL || `https://${req.headers.host}${req.url}`;
  const params = req.body && typeof req.body === 'object' ? req.body : {};
  const data = Object.keys(params).sort().reduce((acc, k) => acc + k + params[k], url);
  const expected = crypto.createHmac('sha1', authToken).update(Buffer.from(data, 'utf-8')).digest('base64');
  const a = Buffer.from(String(signature));
  const b = Buffer.from(expected);
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

const MAX_WHATSAPP_LENGTH = 1500; // WhatsApp ina kikomo cha ~1600 herufi

// Twilio inahitaji XML safi - epuka kuvunja muundo wa TwiML
function escapeXml(text) {
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

// "whatsapp:+255670307647" -> "255670307647@whatsapp.ajplusai.co.tz"
function phoneToSyntheticEmail(whatsappFrom) {
  const digitsOnly = whatsappFrom.replace('whatsapp:', '').replace(/\D/g, '');
  return `${digitsOnly}@whatsapp.ajplusai.co.tz`;
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).send('Method Not Allowed');
  }

  const twilioCheck = isValidTwilioRequest(req);
  if (twilioCheck === false) {
    console.warn('[security] WhatsApp webhook: saini ya Twilio si sahihi — ombi limekataliwa');
    return res.status(403).send('Forbidden');
  }
  if (twilioCheck === null) {
    console.warn('[security] TWILIO_AUTH_TOKEN haijawekwa — webhook haithibitishi saini za Twilio');
  }

  const incomingMessage = String((req.body && req.body.Body) || '').trim().slice(0, 4000);
  const fromRaw = String((req.body && req.body.From) || '');

  // Usiandike ujumbe wa mteja kwenye logs; onyesha tarakimu 3 za mwisho za namba tu
  console.log(`WhatsApp kutoka ***${fromRaw.replace(/\D/g, '').slice(-3)} (herufi ${incomingMessage.length})`);

  let replyText;

  if (!incomingMessage) {
    replyText = 'Samahani, sikupokea ujumbe wowote. Tafadhali tuma swali lako.';
  } else {
    const syntheticEmail = phoneToSyntheticEmail(fromRaw);

    try {
      const chatRes = await fetch(CHAT_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // Origin hii inahitajika ili chat.js ikubali ombi hili (isAllowedDomain check)
          'Origin': 'https://ajplusai.co.tz',
          // Inaruhusu chat.js kukubali email ya WhatsApp (seva-kwa-seva tu)
          'x-internal-key': process.env.ADMIN_SECRET || ''
        },
        body: JSON.stringify({
          message: incomingMessage,
          email: syntheticEmail,
          history: []
        })
      });

      const chatData = await chatRes.json();

      if (chatRes.ok && chatData.reply) {
        replyText = chatData.reply;
      } else if (chatData.error) {
        // Mfano: trial imeisha, kikomo cha maswali, n.k - chat.js tayari
        // inarudisha ujumbe mzuri wa Kiswahili kwa hali hizi
        replyText = chatData.error;
      } else {
        replyText = 'Samahani, kuna tatizo la mfumo kwa sasa. Tafadhali jaribu tena baadaye.';
      }
    } catch (error) {
      console.error('Hitilafu kuunganisha na /api/chat:', error);
      replyText = 'Samahani, sikuweza kuwasiliana na AJPLUS AI sasa hivi. Tafadhali jaribu tena baada ya muda mfupi.';
    }
  }

  if (replyText.length > MAX_WHATSAPP_LENGTH) {
    replyText = replyText.slice(0, MAX_WHATSAPP_LENGTH) + '...';
  }

  const twimlResponse = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Message>${escapeXml(replyText)}</Message>
</Response>`;

  res.setHeader('Content-Type', 'text/xml');
  return res.status(200).send(twimlResponse);
}
