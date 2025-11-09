// api/user/delete-account.js - Delete user account
import { query } from '../_database.js';
import { authenticateToken, cors } from '../_utils.js';

export default async function handler(req, res) {
  cors(res);
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'DELETE') return res.status(405).json({ error: 'Method not allowed' });

  const auth = authenticateToken(req);
  if (auth.error) return res.status(auth.status).json({ error: auth.error });

  try {
    await query('DELETE FROM game_stats WHERE user_id = $1', [auth.user.id]);
    await query('DELETE FROM users WHERE id = $1', [auth.user.id]);
    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('Delete account error:', error);
    return res.status(500).json({ error: 'Server error' });
  }
}