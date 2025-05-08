export default async function handler(req, res) {
    if (req.method !== 'POST') {
      return res.status(405).send('Method Not Allowed');
    }
  
    const message = req.body.message;
  
    if (message && message.text) {
      const chatId = message.chat.id;
      const text = message.text;
  
      const reply = `You said: "${text}"`;
  
      const TELEGRAM_API = `https://api.telegram.org/bot${process.env.BOT_TOKEN}/sendMessage`;
  
      await fetch(TELEGRAM_API, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: chatId,
          text: reply,
        }),
      });
    }
  
    res.status(200).send('ok');
  }