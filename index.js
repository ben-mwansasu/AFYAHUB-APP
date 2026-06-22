const express = require('express');
const app = express();

app.use(express.json());

const VERIFY_TOKEN = process.env.VERIFY_TOKEN || "afyaHub52815";

// ===============================
// WEBHOOK VERIFY (GET)
// ===============================
app.get('/webhook', (req, res) => {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  if (mode === 'subscribe' && token === VERIFY_TOKEN) {
    console.log('✅ Webhook verified successfully');
    return res.status(200).send(challenge);
  }

  console.log('❌ Webhook verification failed');
  return res.sendStatus(403);
});

// ===============================
// RECEIVE MESSAGES (POST)
// ===============================
app.post('/webhook', (req, res) => {
  const body = req.body;

  console.log('📩 New message received:');
  console.log(JSON.stringify(body, null, 2));

  if (body.object === 'whatsapp_business_account') {
    handleWhatsAppMessage(body);
  } else if (body.object === 'page' || body.object === 'instagram') {
    handleMetaMessage(body);
  }

  res.sendStatus(200);
});

// ===============================
// WHATSAPP HANDLER
// ===============================
function handleWhatsAppMessage(body) {
  try {
    const entry = body.entry?.[0];
    const change = entry?.changes?.[0];
    const message = change?.value?.messages?.[0];

    if (message) {
      const from = message.from;
      const text = message.text?.body;

      console.log(`WhatsApp from ${from}: ${text}`);
    }
  } catch (err) {
    console.error('Error handling WhatsApp message:', err);
  }
}

// ===============================
// MESSENGER / INSTAGRAM
// ===============================
function handleMetaMessage(body) {
  try {
    const entry = body.entry?.[0];
    const messaging = entry?.messaging?.[0];

    if (messaging) {
      const senderId = messaging.sender?.id;
      const text = messaging.message?.text;

      console.log(`Meta message from ${senderId}: ${text}`);
    }
  } catch (err) {
    console.error('Error handling Meta message:', err);
  }
}

// ===============================
// HEALTH CHECK
// ===============================
app.get('/', (req, res) => {
  res.send('Webhook server inafanya kazi ✅');
});

// ===============================
// START SERVER (FIXED)
// ===============================
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server inafanya kazi kwenye port ${PORT}`);
});
