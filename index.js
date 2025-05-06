// index.js
const TelegramBot = require('node-telegram-bot-api');
const { token } = require('./config/botConfig');
const handleMessage = require('./utils/messageHandler');

const bot = new TelegramBot(token, { polling: true });

console.log('🤖 Bot is running...');

bot.on('message', (msg) => {
  handleMessage(msg, bot);
});