// api/health.js - Health check endpoint
import { query } from './_database.js';
import { cors } from './_utils.js';

export default async function handler(req, res) {
  cors(res);
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    await query('SELECT 1');
    return res.status(200).json({
      status: 'OK',
      timestamp: Date.now(),
      database: 'connected'
    });
  } catch (error) {
    return res.status(500).json({
      status: 'ERROR',
      database: 'disconnected'
    });
  }
}