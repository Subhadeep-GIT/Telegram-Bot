const axios = require('axios');

const BOT_TOKEN = '8023194312:AAH8huNr43t5wjbBWhs-naxESH0hZTMDqUs';
const WEBHOOK_URL = 'https://telegram-bot-one-sooty.vercel.app/api/webhook';

axios.post(`https://api.telegram.org/bot${BOT_TOKEN}/setWebhook`, {
  url: WEBHOOK_URL,
})
  .then(response => {
    console.log('✅ Webhook set successfully:', response.data);
  })
  .catch(error => {
    console.error('❌ Error setting webhook:', error.response?.data || error.message);
  });