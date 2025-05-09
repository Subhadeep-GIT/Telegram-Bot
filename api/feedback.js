import mysql from 'mysql2/promise';

const dbConfig = {
  host: 'muyr7.h.filess.io',
  user: 'nikamma_hanglabor',
  password: 'e473e344949c4ffa44aba9228e7353aba4d22870',
  database: 'nikamma_hanglabor',
  port: 61002
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).send('Method Not Allowed');
  }

  const { username, feedback } = req.body;

  if (!username || !feedback) {
    return res.status(400).json({ error: 'Missing username or feedback' });
  }

  try {
    const connection = await mysql.createConnection(dbConfig);

    const [result] = await connection.execute(
      'INSERT INTO feedback (username, feedback, timestamp) VALUES (?, ?, NOW())',
      [username, feedback]
    );

    await connection.end();

    return res.status(200).json({ message: 'Feedback saved successfully', result });
  } catch (error) {
    console.error('Failed to save feedback:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}