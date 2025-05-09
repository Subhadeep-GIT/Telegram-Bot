import mysql from 'mysql2/promise';

const dbConfig = {
  host: 'muyr7.h.filess.io',
  user: 'nikamma_hanglabor',
  password: 'e473e344949c4ffa44aba9228e7353aba4d22870',
  database: 'nikamma_hanglabor',
  port: 61002,
};

// Utility: Get MySQL connection
async function getConnection() {
  try {
    return await mysql.createConnection(dbConfig);
  } catch (err) {
    console.error('Database connection failed:', err);
    throw new Error('Database connection error');
  }
}

// API Route Handler
export default async function handler(req, res) {
  // Only allow POST method
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { username, feedback } = req.body;

  // Input validation
  if (!username || !feedback) {
    return res.status(400).json({ error: 'Missing username or feedback' });
  }

  let connection;
  try {
    connection = await getConnection();

    const [result] = await connection.execute(
      'INSERT INTO feedback (username, feedback, timestamp) VALUES (?, ?, NOW())',
      [username, feedback]
    );

    return res.status(200).json({ message: 'Feedback saved successfully', result });

  } catch (error) {
    console.error('Failed to save feedback:', error.message);
    return res.status(500).json({ error: 'Internal Server Error' });

  } finally {
    if (connection) {
      await connection.end();
    }
  }
}