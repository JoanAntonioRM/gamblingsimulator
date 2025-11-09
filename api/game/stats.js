// api/game/stats.js - Update game statistics
import { query } from '../_database.js';
import { authenticateToken, cors } from '../_utils.js';

export default async function handler(req, res) {
  cors(res);
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const auth = authenticateToken(req);
  if (auth.error) return res.status(auth.status).json({ error: auth.error });

  try {
    const { game, won, betAmount, winAmount } = req.body;

    const validGames = ['crash', 'dice', 'blackjack', 'plinko', 'mines', 'cases'];
    if (!validGames.includes(game)) {
      return res.status(400).json({ error: 'Invalid game' });
    }

    const wonValue = won ? 1 : 0;
    const lostValue = won ? 0 : 1;

    await query(
      `UPDATE game_stats SET 
        played = played + 1,
        won = won + $1,
        lost = lost + $2
       WHERE user_id = $3 AND game = $4`,
      [wonValue, lostValue, auth.user.id, game]
    );

    const wonAmount = won ? winAmount : 0;
    const lostAmount = won ? 0 : betAmount;

    await query(
      `UPDATE users SET 
        total_bet = total_bet + $1,
        total_won = total_won + $2,
        total_lost = total_lost + $3
       WHERE id = $4`,
      [betAmount, wonAmount, lostAmount, auth.user.id]
    );

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('Game stats error:', error);
    return res.status(500).json({ error: 'Server error' });
  }
}