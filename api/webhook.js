export default async function handler(req, res) {
    if (req.method !== 'POST') {
      return res.status(405).send('Method Not Allowed');
    }
  
    // Extract the message object from the request body
    const message = req.body.message;
  
    if (message && message.text) {
      const chatId = message.chat.id;
      const text = message.text;
  
      // Prepare the reply message
      const reply = `You said: "${text}"`;
  
      const TELEGRAM_API = `https://api.telegram.org/bot${process.env.BOT_TOKEN}/sendMessage`;
  
      try {
        const response = await fetch(TELEGRAM_API, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chat_id: chatId,
            text: reply,
          }),
        });
  
        // Check if the Telegram API request was successful
        const data = await response.json();
        if (!data.ok) {
          console.error('Error sending message:', data);
          return res.status(500).json({ error: 'Failed to send message' });
        }
  
        console.log('Message sent successfully:', data);
        res.status(200).send('ok');
      } catch (error) {
        console.error('Error with Telegram API request:', error);
        res.status(500).json({ error: 'Error communicating with Telegram API' });
      }
    } else {
      // In case the message doesn't have the text property
      res.status(400).json({ error: 'Invalid message format' });
    }
  }