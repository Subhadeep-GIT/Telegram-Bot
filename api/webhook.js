const fs = require('fs');
const fetch = require('node-fetch');

// Mapping of Telegram usernames to custom nicknames
const userNicknames = {
  'niikamma': 'Developer',
  'shilpi_here': 'Cheduu ❤️',
  'smrity_suhani': 'Simroti',
  'akanksha21': 'Sonal JIJI',
  '+917079279772': 'Billi Mossy🐱',
  '+919693627390': 'CA ST 🧑‍💼💼',
  '+918141829858': 'Chokhli 🧑‍💼💼',
  // Add more mappings if needed
};

// Utility function to get user's preferred nickname based on username
function getNickname(user) {
  const username = user?.username;
  return userNicknames[username] || user?.first_name || 'there';
}

// Utility function to save feedback to feedback.json
const path = './feedback.json';
function saveFeedback(username, feedback) {
  const feedbackData = {
    username,
    feedback,
    timestamp: new Date().toISOString()
  };

  fs.readFile(path, 'utf8', (err, data) => {
    if (err) {
      console.error('Error reading feedback file:', err);
      return;
    }

    const feedbacks = data ? JSON.parse(data) : [];
    feedbacks.push(feedbackData);

    fs.writeFile(path, JSON.stringify(feedbacks, null, 2), (err) => {
      if (err) {
        console.error('Error saving feedback:', err);
      }
    });
  });
}

// Default export for Vercel's Serverless Function
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).send('Method Not Allowed');
  }

  const TELEGRAM_API = `https://api.telegram.org/bot${process.env.BOT_TOKEN}/sendMessage`;
  const message = req.body.message;

  if (message && message.text) {
    const chatId = message.chat.id;
    const text = message.text.toLowerCase();
    const name = getNickname(message.from);

    // Convert UTC time to IST (+5:30)
    const istTime = new Date(Date.now() + 5.5 * 60 * 60 * 1000);
    const hour = istTime.getHours();

    let reply = '';

    // Greeting Messages (Hi, Hello, Hey)
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

      setTimeout(async () => {
        const feedbackMessage = 'Please help me grow by providing your valuable feedback! Your feedback means a lot to me!';
        await fetch(TELEGRAM_API, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ chat_id: chatId, text: feedbackMessage })
        });
      }, 2000);  // Wait 2 seconds before asking for feedback
    }
    // Goodbye Messages (Bye, Goodbye)
    else if (text.includes('bye') || text.includes('goodbye')) {
      reply = (hour >= 21 || hour < 5) ? `Bye dear ${name}! Sleep tight 😴🌙` : `Bye ${name}! See you soon 👋`;
    }
    // Feedback Submission Request
    else if (text.includes('feedback')) {
      const feedbackPrompt = 'Please share your valuable feedback in one line:';
      await fetch(TELEGRAM_API, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chat_id: chatId, text: feedbackPrompt })
      });
      return res.status(200).send('Feedback prompt sent');
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
    // Handling non-text messages
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