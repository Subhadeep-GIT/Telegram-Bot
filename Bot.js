const TelegramBot = require('node-telegram-bot-api');
const express = require('express');
const bodyParser = require('body-parser');

// Replace with your bot's token
const token = '8061126158:AAEcRcV38G-EmBrJzMJnkFNRsOrIvohBHQQ';

// Create an express app
const app = express();

// Set up the bot
const bot = new TelegramBot(token);
const webhookUrl = 'https://telegram-bot-lilac-two.vercel.app/api/webhook';

// Telegram sets the webhook
bot.setWebHook(webhookUrl);

// Webhook handler
app.use(bodyParser.json());

app.post('/api/webhook', (req, res) => {
  bot.processUpdate(req.body);
  res.send('OK');
});

app.listen(process.env.PORT || 3000, () => {
  console.log('Server running...');
});