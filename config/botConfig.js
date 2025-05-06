// config/botConfig.js

const TelegramBot = require('node-telegram-bot-api');

// Use your actual bot token
const token = '8061126158:AAEcRcV38G-EmBrJzMJnkFNRsOrIvohBHQQ';

// Create bot instance
const bot = new TelegramBot(token);

module.exports = bot;