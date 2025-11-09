// api/leaderboard/[game].js - Get game leaderboard
import { query } from '../_database.js';
import { cors } from '../_utils.js';

export default async function handler(req, res) {
  cors(res);
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { game } = req.query;
    const validGames = ['crash', 'dice', 'blackjack', 'plinko', 'mines', 'cases'];
    
    if (!validGames.includes(game)) {
      return res.status(400).json({ error: 'Invalid game' });
    }

    const result = await query(
      `SELECT u.username, g.won 
       FROM game_stats g 
       JOIN users u ON g.user_id = u.id 
       WHERE g.game = $1 
       ORDER BY g.won DESC 
       LIMIT 25`,
      [game]
    );

    return res.status(200).json(result.rows);
  } catch (error) {
    console.error('Leaderboard error:', error);
    return res.status(500).json({ error: 'Server error' });
  }
}