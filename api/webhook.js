// Utility function to get user's preferred name or fallback
function getNickname(user) {
  return user.first_name || user.username || 'there';
}

// Default export for Vercel's Serverless Function
export default async function handler(req, res) {
  // Accept only POST requests
  if (req.method !== 'POST') {
    return res.status(405).send('Method Not Allowed');
  }

  const message = req.body.message;

  // Ensure valid message input
  if (!message || !message.text) {
    return res.status(400).json({ error: 'Invalid message format' });
  }

  const chatId = message.chat.id;
  const text = message.text.toLowerCase();
  const name = getNickname(message.from);

  // Convert current UTC time to IST (+5:30)
  const istTime = new Date(Date.now() + 5.5 * 60 * 60 * 1000);
  const hour = istTime.getHours();

  const TELEGRAM_API = `https://api.telegram.org/bot${process.env.BOT_TOKEN}/sendMessage`;

  let reply = '';

  // Greeting messages
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

  // Goodbye messages
  else if (text.includes('bye') || text.includes('goodbye')) {
    reply =
      hour >= 21 || hour < 5
        ? `Bye dear ${name}! Sleep tight 😴🌙`
        : `Bye ${name}! See you soon 👋`;
  }

  // Ignore unmatched messages
  else {
    return res.status(200).send('Message ignored');
  }

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
}