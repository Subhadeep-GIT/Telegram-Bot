// Default export for Vercel's Serverless Function
export default async function handler(req, res) {
  // Only accept POST requests (Telegram sends updates via POST)
  if (req.method !== 'POST') {
    return res.status(405).send('Method Not Allowed');
  }

  // Telegram API endpoint for sending messages (now globally defined)
  const TELEGRAM_API = `https://api.telegram.org/bot${process.env.BOT_TOKEN}/sendMessage`;

  // Extract the incoming message payload from the Telegram webhook
  const message = req.body.message;

  // Utility to get a fallback name
  function getNickname(user) {
    return user?.first_name || user?.username || 'there';
  }

  // Proceed only if message and message text exist
  if (message && message.text) {
    const chatId = message.chat.id;
    const text = message.text.toLowerCase();
    const name = getNickname(message.from);

    // Convert current UTC time to IST (+5:30)
    const istTime = new Date(Date.now() + 5.5 * 60 * 60 * 1000);
    const hour = istTime.getHours();

    let reply = '';

    // --- Greeting messages (Hi, Hello, Hey)
    if (text.includes('hi') || text.includes('hello') || text.includes('hey')) {
      let timeGreeting = '';
      if (hour >= 5 && hour < 12) {
        timeGreeting = 'Good Morning';
      } else if (hour >= 12 && hour < 17) {
        timeGreeting = 'Good Afternoon';
      } else {
        timeGreeting = 'Good Evening';
      }
      reply = `${name}! Hiii 😊\n${timeGreeting}!`;
    }
    // --- Goodbye messages (Bye, Goodbye)
    else if (text.includes('bye') || text.includes('goodbye')) {
      if (hour >= 21 || hour < 5) {
        reply = `Bye dear ${name}! Sleep tight 😴🌙`;
      } else {
        reply = `Bye ${name}! See you soon 👋`;
      }
    }
    // Ignore all other messages
    else {
      return res.status(200).send('Message ignored');
    }

    try {
      const response = await fetch(TELEGRAM_API, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chat_id: chatId, text: reply })
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
    // Gracefully handle non-text messages with a fallback reply
    const chatId = message?.chat?.id;
    const name = getNickname(message?.from || {});
    const fallbackReply = `${name}, I can only read *text messages* for now 😊`;

    if (chatId) {
      try {
        const response = await fetch(TELEGRAM_API, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chat_id: chatId,
            text: fallbackReply,
            parse_mode: 'Markdown',
          }),
        });

        const data = await response.json();

        if (!data.ok) {
          console.error('Error sending fallback message:', data);
          return res.status(500).json({ error: 'Failed to send fallback message' });
        }

        console.log('Fallback message sent successfully:', data);
      } catch (error) {
        console.error('Error with Telegram API for fallback:', error);
      }
    }

    return res.status(200).send('Non-text message handled gracefully');
  }
}
