"scripts": {
  "start": "node index.js"
}

const express = require('express');
const app = express();

app.use(express.json());

const VERIFY_TOKEN = process.env.VERIFY_TOKEN || "afyaHub52815";

// ---------------------------------------------------------
// HATUA 1: Meta inathibitisha webhook yako (GET request)
// Inatumika kwa WhatsApp, Facebook Messenger, na Instagram
// ---------------------------------------------------------
app.get('/webhook', (req, res) => {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  if (mode === 'subscribe' && token === VERIFY_TOKEN) {
    console.log('✅ Webhook imethibitishwa na Meta');
    return res.status(200).send(challenge);
  }

  console.log('❌ Verification imeshindwa - token hailingani');
  return res.sendStatus(403);
});

// ---------------------------------------------------------
// HATUA 2: Kupokea ujumbe halisi kutoka kwa wateja (POST)
// ---------------------------------------------------------
app.post('/webhook', (req, res) => {
  const body = req.body;
  console.log('📩 Ujumbe mpya umepokelewa:');
  console.log(JSON.stringify(body, null, 2));

  // Mfano: kutambua ni WhatsApp au Messenger/Instagram
  if (body.object === 'whatsapp_business_account') {
    // Tafuta ujumbe wa WhatsApp hapa
    handleWhatsAppMessage(body);
  } else if (body.object === 'page' || body.object === 'instagram') {
    // Tafuta ujumbe wa Messenger/Instagram hapa
    handleMetaMessage(body);
  }

  // Meta inahitaji 200 OK haraka, vinginevyo itarudia kutuma
  res.sendStatus(200);
});

function handleWhatsAppMessage(body) {
  try {
    const entry = body.entry?.[0];
    const change = entry?.changes?.[0];
    const message = change?.value?.messages?.[0];
    if (message) {
      const from = message.from;
      const text = message.text?.body;
      console.log(`WhatsApp kutoka ${from}: ${text}`);
      // TODO: weka logic yako hapa (kuhifadhi DB, kujibu, n.k.)
    }
  } catch (err) {
    console.error('Hitilafu kuchakata WhatsApp message:', err);
  }
}

function handleMetaMessage(body) {
  try {
    const entry = body.entry?.[0];
    const messaging = entry?.messaging?.[0];
    if (messaging) {
      const senderId = messaging.sender?.id;
      const text = messaging.message?.text;
      console.log(`Messenger/Instagram kutoka ${senderId}: ${text}`);
      // TODO: weka logic yako hapa
    }
  } catch (err) {
    console.error('Hitilafu kuchakata Messenger/Instagram message:', err);
  }
}

// Health check - rahisi kuangalia kama server inafanya kazi
app.get('/', (req, res) => {
  res.send('Webhook server inafanya kazi ✅');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server inafanya kazi kwenye port ${PORT}`);
