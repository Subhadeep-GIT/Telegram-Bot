// utils/messageHandler.js

const bot = require('../config/botConfig');

function handleMessage(msg) {
  const chatId = msg.chat.id;
  const text = msg.text?.toLowerCase();

  if (!text) return;

  if (text === '/start') {
    bot.sendMessage(chatId, 'Hey! 👋 Welcome to Nikammas Bot. Type "hi" to begin!');
  } else if (text === 'hi' || text === 'hello') {
    bot.sendMessage(chatId, 'Hey there! 😊 What’s up?');
  } else {
    bot.sendMessage(chatId, `You said: ${msg.text}`);
  }
}

module.exports = handleMessage;