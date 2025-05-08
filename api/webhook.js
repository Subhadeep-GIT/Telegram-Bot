import getNickname from '../../lib/nicknames.js';

// Vercel-compatible default export for Telegram webhook
export default async function handler(req, res) {
  // Allow only POST requests (Telegram uses POST for webhooks)
  if (req.method !== 'POST') {
    return res.status(405).send('Method Not Allowed');
  }

  const message = req.body.message;

  // Validate presence of message and text
  if (!message || !message.text) {
    return res.status(400).json({ error: 'Invalid message format' });
  }

  const chatId = message.chat.id;               // Target chat ID
  const text = message.text.toLowerCase();      // Standardize text for parsing

  // Resolve sender's identity and nickname (customizable via helper)
  const rawUsername = message.from.username || message.from.first_name || 'there';
  const name = getNickname(rawUsername);        // Uses nickname map if available

  // Convert current UTC time to IST (+5:30)
  const istTime = new Date(Date.now() + 5.5 * 60 * 60 * 1000);
  const hour = istTime.getHours();              // Hour in IST used for greeting logic

  const TELEGRAM_API = `https://api.telegram.org/bot${process.env.BOT_TOKEN}/sendMessage`;

  let reply = ''; // Initialize reply message

  // --- Handle greeting: hi, hello, hey
  if (text.includes('hi') || text.includes('hello') || text.includes('hey')) {
    let timeGreeting = '';

    if (hour >= 5 && hour < 12) {
      timeGreeting = 'Good Morning';
    } else if (hour >= 12 && hour < 17) {
      timeGreeting = 'Good Afternoon';
    } else {
      timeGreeting = 'Good Evening'; // Avoid saying "Good Night" on greeting
    }

    reply = `${name}! Hiii 😊\n${timeGreeting}!`;
  }

  // --- Handle goodbye: bye, goodbye
  else if (text.includes('bye') || text.includes('goodbye')) {
    if (hour >= 21 || hour < 5) {
      reply = `Bye dear ${name}! Sleep tight 😴🌙`;
    } else {
      reply = `Bye ${name}! See you soon 👋`;
    }
  }

  // --- Ignore unhandled messages
  else {
    return res.status(200).send('Message ignored');
  }

  // Send reply via Telegram API
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
    return res.status(200).send('ok');
  } catch (error) {
    console.error('Error with Telegram API request:', error);
    return res.status(500).json({ error: 'Error communicating with Telegram API' });
  }
}