// webhook.js
import mysql from 'mysql2/promise';
const fs = require('fs');

const dbConfig = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: parseInt(process.env.DB_PORT, 10),
};

// Nickname mappings
const userNicknames = {
  'niikamma': 'Developer',
  'shilpi_here': 'Cheduu ❤️',
  'smrity_suhani': 'Simroti',
  'akanksha21': 'Sonal JIJI',
  '+917079279772': 'Billi Mossy🐱',
  '+919693627390': 'CA ST 🧑‍💼💼',
  '+918141829858': 'Chokhli 🧑‍💼💼',
};

// Get nickname
function getNickname(user) {
  const username = user?.username;
  return userNicknames[username] || user?.first_name || 'there';
}

// Get MySQL connection
async function getConnection() {
  try {
    return await mysql.createConnection(dbConfig);
  } catch (err) {
    console.error('Database connection failed:', err);
    throw new Error('Database connection error');
  }
}

// Save to feedback.json (optional backup)
function saveFeedback(username, feedback) {
  const path = './feedback.json';
  const feedbackData = {
    username,
    feedback,
    timestamp: new Date().toISOString(),
  };

  fs.readFile(path, 'utf8', (err, data) => {
    if (err) {
      console.error('Error reading feedback file:', err);
      return;
    }
    const feedbacks = data ? JSON.parse(data) : [];
    feedbacks.push(feedbackData);
    fs.writeFile(path, JSON.stringify(feedbacks, null, 2), (err) => {
      if (err) console.error('Error saving feedback:', err);
    });
  });
}

// API route handler
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
    const istTime = new Date(Date.now() + 5.5 * 60 * 60 * 1000);
    const hour = istTime.getHours();
    let reply = '';

    if (text.includes('hi') || text.includes('hello') || text.includes('hey')) {
      let timeGreeting = hour >= 5 && hour < 12 ? 'Good Morning' : hour < 17 ? 'Good Afternoon' : 'Good Evening';
      reply = `${name}! Hiii 😊\n${timeGreeting}!`;

      setTimeout(async () => {
        const feedbackMessage = 'Please help me grow by providing your valuable feedback! Your feedback means a lot to me!';
        await fetch(TELEGRAM_API, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ chat_id: chatId, text: feedbackMessage }),
        });
      }, 2000);
    } else if (text.includes('bye') || text.includes('goodbye')) {
      reply = hour >= 21 || hour < 5
        ? `Bye dear ${name}! Sleep tight 😴🌙`
        : `Bye ${name}! See you soon 👋`;
    } else if (text.includes('feedback')) {
      const prompt = 'Please share your valuable feedback in one line:';
      await fetch(TELEGRAM_API, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chat_id: chatId, text: prompt }),
      });
      return res.status(200).send('Feedback prompt sent');
    } else {
      // Only save if user explicitly uses the word "feedback"
      if (text.includes('feedback')) {
        try {
          const connection = await getConnection();
          await connection.execute(
            'INSERT INTO feedback (username, feedback, timestamp) VALUES (?, ?, NOW())',
            [name, text]
          );
          connection.end();
          saveFeedback(name, text); // Optional backup
    
          await fetch(TELEGRAM_API, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ chat_id: chatId, text: `Thanks ${name}! Feedback saved 😊` }),
          });
          return res.status(200).send('Feedback saved');
        } catch (err) {
          console.error('Error saving feedback:', err);
          return res.status(500).send('Failed to save feedback');
        }
      } else {
        // Ignore casual messages
        return res.status(200).send('No feedback to save');
      }
    }

    try {
      const response = await fetch(TELEGRAM_API, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chat_id: chatId, text: reply }),
      });
      const data = await response.json();

      if (!data.ok) {
        console.error('Telegram send error:', data);
        return res.status(500).send('Telegram API error');
      }

      return res.status(200).send('ok');
    } catch (err) {
      console.error('Error sending Telegram reply:', err);
      return res.status(500).send('Telegram send failure');
    }
  } else {
    const chatId = message?.chat?.id;
    const name = getNickname(message?.from || {});
    const fallbackReply = `${name}, I can only read *text messages* for now 😊`;

    if (chatId) {
      try {
        await fetch(TELEGRAM_API, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ chat_id: chatId, text: fallbackReply, parse_mode: 'Markdown' }),
        });
      } catch (err) {
        console.error('Fallback send error:', err);
      }
    }
    return res.status(200).send('Non-text message handled');
  }
}