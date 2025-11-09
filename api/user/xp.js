// api/user/xp.js - Update user XP
import { query } from '../_database.js';
import { authenticateToken, cors } from '../_utils.js';

export default async function handler(req, res) {
  cors(res);
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const auth = authenticateToken(req);
  if (auth.error) return res.status(auth.status).json({ error: auth.error });

  try {
    const { xpGained, shopPointsGained } = req.body;

    const result = await query(
      'UPDATE users SET xp = xp + $1, shop_points = shop_points + $2 WHERE id = $3 RETURNING xp, shop_points',
      [xpGained, shopPointsGained || 0, auth.user.id]
    );

    return res.status(200).json({ 
      success: true, 
      xp: result.rows[0].xp, 
      shopPoints: result.rows[0].shop_points 
    });
  } catch (error) {
    console.error('XP update error:', error);
    return res.status(500).json({ error: 'Server error' });
  }
}