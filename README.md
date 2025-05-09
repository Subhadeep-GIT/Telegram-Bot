# ☀️ Telegram Good Morning Bot with Vercel Cron

A lightweight Telegram bot built with Node.js that replies to greetings and sends an automated "Good Morning" message every day at 7:30 AM IST using Vercel Cron Jobs.

---

## 🚀 Features

- Responds to basic greetings like "Hi", "Hello", "Bye"
- Uses a custom nickname mapping system
- Broadcasts a "Good Morning" message every day at 7:30 AM IST
- Fully serverless and deployed on Vercel
- Uses Telegram's HTTP API for messaging
- Secure cron job execution via `CRON_SECRET`

---

## 📂 Project Structure
/api
├── telegram.js        # Telegram webhook handler
└── broadcast.js       # Cron-triggered Good Morning broadcast
vercel.json              # Vercel configuration file with cron job
.env                     # Environment variables (BOT_TOKEN, CRON_SECRET)

---

## 🛠️ Setup Instructions

### 1. Clone the repository
```bash
git clone https://github.com/your-username/telegram-morning-bot.git
cd telegram-morning-bot

2. Install dependencies
npm install

3. Add your .env file
BOT_TOKEN=your_telegram_bot_token
CRON_SECRET=your_custom_cron_secret


4. Update userList in api/broadcast.js

Replace with actual Telegram chat_ids:
const userList = [
  123456789, // Your chat_id
  987654321  // Friend's chat_id
];
You can retrieve these by calling:
https://api.telegram.org/bot<YOUR_BOT_TOKEN>/getUpdates
After sending a message to your bot.


🕒 Schedule Cron Job on Vercel

1. Enable Cron Jobs in Vercel
	•	Go to your project’s Settings → Cron Jobs
	•	Make sure it’s enabled

2. Add the schedule in vercel.json
{
  "crons": [
    {
      "path": "/api/broadcast",
      "schedule": "30 2 * * *"
    }
  ]
}
30 2 * * * = 7:30 AM IST (Vercel uses UTC)


3. Secure your cron with CRON_SECRET

Your broadcast.js handler should verify:
const secret = req.headers.authorization?.split('Bearer ')[1];
if (secret !== process.env.CRON_SECRET) {
  return res.status(401).send('Unauthorized');
}

📦 Deploy to Vercel: 
vercel login
vercel link
vercel deploy --prod



📬 Custom Nickname Logic

Inside api/telegram.js, update the userNicknames object:
const userNicknames = {
  'Subhadeep': 'Nikamma'
};

📄 License

MIT
Copyright (c) 2025 Subhadeep Ghosh;
Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell


💬 Feedback

Feel free to open an issue or contact the maintainer @Subhadeep051@icloud.com