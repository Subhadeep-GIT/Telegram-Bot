import fs from 'fs';
import path from 'path';

const feedbackPath = path.resolve('./feedback.json');

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
    const existingData = fs.existsSync(feedbackPath)
      ? JSON.parse(fs.readFileSync(feedbackPath, 'utf8'))
      : [];

    existingData.push(entry);

    fs.writeFileSync(feedbackPath, JSON.stringify(existingData, null, 2), 'utf8');

    return res.status(200).json({ message: 'Feedback saved successfully' });
  } catch (error) {
    console.error('Failed to save feedback:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}