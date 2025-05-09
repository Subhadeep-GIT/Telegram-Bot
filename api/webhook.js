// Mapping of Telegram usernames to custom nicknames
const userNicknames = {
  'niikamma': 'Ghosh Babu',  // Example: Add more mappings as needed
  // You can add more user mappings here like:
  // 'username': 'nickname'
};

// Utility function to get user's preferred nickname based on username
function getNickname(user) {
  const username = user?.username;  // Get the username from the user object
  // If the username exists in the dictionary, return the mapped nickname
  // If not, fall back to using the user's first name or 'there'
  return userNicknames[username] || user?.first_name || 'there';
}

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

  // Proceed only if message and message text exist
  if (message && message.text) {
    const chatId = message.chat.id;  // Extract chat ID to reply to the user
    const text = message.text.toLowerCase();  // Convert text to lowercase for easier matching
    const name = getNickname(message.from);  // Get the preferred nickname or fallback name

    // Convert current UTC time to IST (+5:30)
    const istTime = new Date(Date.now() + 5.5 * 60 * 60 * 1000);
    const hour = istTime.getHours();  // Get the current hour in IST

    let reply = '';

    // --- Greeting messages (Hi, Hello, Hey)
    if (text.includes('hi') || text.includes('hello') || text.includes('hey')) {
      let timeGreeting = '';

      // Determine the time-based greeting
      if (hour >= 5 && hour < 12) {
        timeGreeting = 'Good Morning';
      } else if (hour >= 12 && hour < 17) {
        timeGreeting = 'Good Afternoon';
      } else {
        timeGreeting = 'Good Evening';
      }

      // Build the response message with the user's nickname and time greeting
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
    // Ignore all other messages
    else {
      return res.status(200).send('Message ignored');
    }

    try {
      // Send the constructed reply to the user via Telegram API
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
    const name = getNickname(message?.from || {});  // Get the user's nickname or fallback name
    const fallbackReply = `${name}, I can only read *text messages* for now 😊`;

    if (chatId) {
      try {
        // Send fallback message for non-text messages
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