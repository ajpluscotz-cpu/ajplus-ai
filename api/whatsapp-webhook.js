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

const CHAT_API_URL = 'https://ajplusai.co.tz/api/chat';
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

  const incomingMessage = (req.body.Body || '').trim();
  const fromRaw = req.body.From || '';

  console.log(`WhatsApp kutoka ${fromRaw}: "${incomingMessage}"`);

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
          'Origin': 'https://ajplusai.co.tz'
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
