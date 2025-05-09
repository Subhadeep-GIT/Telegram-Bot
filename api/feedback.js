import { MongoClient } from 'mongodb';

const uri = 'mongodb+srv://subhadeep051:eOXPwlfv8cTy0L1B@telegramfeedbackcluster.xyz.mongodb.net/?retryWrites=true&w=majority&appName=TelegramFeedbackCluster';
const client = new MongoClient(uri);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).send('Method Not Allowed');
  }

  const { username, feedback } = req.body;

  if (!feedback || !username) {
    return res.status(400).json({ error: 'Missing username or feedback' });
  }

  const entry = {
    username,
    feedback,
    timestamp: new Date().toISOString(),
  };

  try {
    await client.connect();
    const db = client.db('telegram_feedback');
    const collection = db.collection('feedbacks');

    await collection.insertOne(entry);

    return res.status(200).json({ message: 'Feedback saved successfully' });
  } catch (error) {
    console.error('Failed to save feedback:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  } finally {
    await client.close();
  }
}