// Default export for Vercel's Serverless Function
export default async function handler(req, res) {
  // Only accept POST requests (Telegram sends updates via POST)
  if (req.method !== 'POST') {
    return res.status(405).send('Method Not Allowed');
  }

  // Extract the incoming message payload from the Telegram webhook
  const message = req.body.message;

  // Proceed only if message and message text exist
  if (message && message.text) {
    const chatId = message.chat.id; // Chat ID to reply to
    const text = message.text.toLowerCase(); // Convert input to lowercase for easier comparison

    // Try to use the user's first name, fall back to username, or use 'there'
    const name = message.from.first_name || message.from.username || 'there';

    // Convert current UTC time to IST (+5:30)
    const istTime = new Date(Date.now() + 5.5 * 60 * 60 * 1000);
    const hour = istTime.getHours(); // Get the hour in IST

    // Telegram API endpoint for sending messages
    const TELEGRAM_API = `https://api.telegram.org/bot${process.env.BOT_TOKEN}/sendMessage`;

    let reply = ''; // Variable to store the reply message

    // --- Greeting messages (Hi, Hello, Hey)
    if (text.includes('hi') || text.includes('hello') || text.includes('hey')) {
      let timeGreeting = '';

      // Determine the time-based greeting
      if (hour >= 5 && hour < 12) {
        timeGreeting = 'Good Morning';
      } else if (hour >= 12 && hour < 17) {
        timeGreeting = 'Good Afternoon';
      } else {
        timeGreeting = 'Good Evening'; // Even if it's late at night, avoid saying "Good Night" in response to "Hi"
      }

      // Build the response message
      reply = `${name}! Hiii 😊\n${timeGreeting}!`;
    }

    // --- Goodbye messages (Bye, Goodbye)
    else if (text.includes('bye') || text.includes('goodbye')) {
      if (hour >= 21 || hour < 5) {
        // Late night goodbye
        reply = `Bye dear ${name}! Sleep tight 😴🌙`;
      } else {
        // Regular daytime goodbye
        reply = `Bye ${name}! See you soon 👋`;
      }
    }

    // Ignore all other messages that don't match
    else {
      return res.status(200).send('Message ignored');
    }

    try {
      // Send the constructed reply to the user via Telegram API
      const response = await fetch(TELEGRAM_API, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: chatId,
          text: reply,
        }),
      });

      const data = await response.json();

      // Check if Telegram API returned an error
      if (!data.ok) {
        console.error('Error sending message:', data);
        return res.status(500).json({ error: 'Failed to send message' });
      }

      console.log('Message sent successfully:', data);
      res.status(200).send('ok');
    } catch (error) {
      // Handle network or API failure
      console.error('Error with Telegram API request:', error);
      res.status(500).json({ error: 'Error communicating with Telegram API' });
    }
  } else {
    // Gracefully handle non-text messages to prevent bot lockout
    return res.status(200).send('Non-text message ignored');
  }
}