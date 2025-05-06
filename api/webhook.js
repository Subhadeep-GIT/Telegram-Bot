// api/webhook.js

const bot = require('../config/botConfig');
const handleMessage = require('../utils/messageHandler');

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const body = req.body;
    if (body.message) {
      handleMessage(body.message);
    }
    return res.status(200).send('OK');
  }

  return res.status(405).send('Method Not Allowed');
}