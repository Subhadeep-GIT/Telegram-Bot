// utils/messageHandler.js
module.exports = function handleMessage(msg, bot) {
    const chatId = msg.chat.id;
    const text = msg.text.toLowerCase();
  
    if (text === 'hi' || text === 'hello') {
      bot.sendMessage(chatId, 'Hey there! How can I help you today?');
    } else {
      bot.sendMessage(chatId, `You said: ${msg.text}`);
    }
  };