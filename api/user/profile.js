// api/user/profile.js - Get user profile with stats
import { query } from '../_database.js';
import { authenticateToken, cors } from '../_utils.js';

export default async function handler(req, res) {
  cors(res);
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const auth = authenticateToken(req);
  if (auth.error) {
    return res.status(auth.status).json({ error: auth.error });
  }

  try {
    const userResult = await query('SELECT * FROM users WHERE id = $1', [auth.user.id]);
    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const user = userResult.rows[0];

    // Get game stats
    const statsResult = await query('SELECT * FROM game_stats WHERE user_id = $1', [user.id]);
    
    const games = {};
    statsResult.rows.forEach(stat => {
      games[stat.game] = {
        played: stat.played,
        won: stat.won,
        lost: stat.lost
      };
    });

    // Calculate actual profit (winAmount - betAmount)
    const actualProfit = parseFloat(user.total_won) - parseFloat(user.total_bet);

    return res.status(200).json({
      id: user.id,
      username: user.username,
      balance: parseFloat(user.balance),
      xp: user.xp,
      shopPoints: user.shop_points,
      totalBet: parseFloat(user.total_bet),
      totalWon: parseFloat(user.total_won),
      totalLost: parseFloat(user.total_lost),
      actualProfit: actualProfit,
      games,
      createdAt: user.created_at
    });
  } catch (error) {
    console.error('Profile error:', error);
    return res.status(500).json({ error: 'Server error' });
  }
}