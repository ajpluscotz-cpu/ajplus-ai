// api/whatsapp-webhook.js
// HATUA YA 1: Webhook rahisi ya kupokea ujumbe wa WhatsApp kupitia Twilio na kuurudisha (echo).
// Lengo: kuthibitisha Twilio <-> Vercel inaongea vizuri kabla ya kuongeza AI/Supabase.

export default async function handler(req, res) {
  // Twilio inatuma POST request kila wakati mtu anatuma ujumbe
  if (req.method !== 'POST') {
    return res.status(405).send('Method Not Allowed');
  }

  try {
    // Twilio inatuma data hizi kiotomatiki kwenye kila ujumbe
    const incomingMessage = req.body.Body || '';
    const fromNumber = req.body.From || '';
    const toNumber = req.body.To || '';

    console.log(`Ujumbe mpya kutoka ${fromNumber} kwenda ${toNumber}: "${incomingMessage}"`);

    // Twilio inahitaji jibu la XML (TwiML) ili kutuma jibu moja kwa moja
    const twimlResponse = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Message>AJPLUS AI imepokea ujumbe wako: "${incomingMessage}"</Message>
</Response>`;

    res.setHeader('Content-Type', 'text/xml');
    return res.status(200).send(twimlResponse);

  } catch (error) {
    console.error('Hitilafu kwenye webhook:', error);
    return res.status(500).send('Server Error');
  }
}
