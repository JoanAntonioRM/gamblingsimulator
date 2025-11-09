// api/user/add-funds.js - Add funds to balance
import { query } from '../_database.js';
import { authenticateToken, cors } from '../_utils.js';

export default async function handler(req, res) {
  cors(res);
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const auth = authenticateToken(req);
  if (auth.error) return res.status(auth.status).json({ error: auth.error });

  try {
    const { amount } = req.body;

    if (typeof amount !== 'number' || amount <= 0) {
      return res.status(400).json({ error: 'Invalid amount' });
    }

    const result = await query(
      'UPDATE users SET balance = balance + $1 WHERE id = $2 RETURNING balance',
      [amount, auth.user.id]
    );

    return res.status(200).json({ success: true, balance: parseFloat(result.rows[0].balance) });
  } catch (error) {
    console.error('Add funds error:', error);
    return res.status(500).json({ error: 'Server error' });
  }
}