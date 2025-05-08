export default async function handler(req, res) {
    if (req.method !== 'POST') {
      return res.status(405).send('Method Not Allowed');
    }
  
    const message = req.body.message;
  
    if (message && message.text) {
      const chatId = message.chat.id;
      const text = message.text.toLowerCase();
  
      // Only trigger response if message is "hi"
      if (text === 'hi') {
        // Get user's name
        const name = message.from.first_name || message.from.username || 'there';
  
        // Get time-based greeting
        const hour = new Date().getHours();
        let timeGreeting = '';
  
        if (hour >= 5 && hour < 12) {
          timeGreeting = 'Good Morning';
        } else if (hour >= 12 && hour < 17) {
          timeGreeting = 'Good Afternoon';
        } else if (hour >= 17 && hour < 21) {
          timeGreeting = 'Good Evening';
        } else {
          timeGreeting = 'Good Night';
        }
  
        const reply = `${name}! Hiii 😊\n${timeGreeting}!`;
  
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
        // Optional: handle other messages or ignore
        res.status(200).send('Message ignored');
      }
    } else {
      res.status(400).json({ error: 'Invalid message format' });
    }
  }