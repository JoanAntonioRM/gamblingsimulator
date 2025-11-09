// api/auth/register.js - User registration endpoint
import bcrypt from 'bcryptjs';
import { query } from '../_database.js';
import { validateUsername, validatePassword, validateEmail, generateToken, cors } from '../_utils.js';

export default async function handler(req, res) {
  cors(res);
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { username, password, email } = req.body;

    // Validate input
    if (!validateUsername(username)) {
      return res.status(400).json({ error: 'Invalid username format' });
    }
    if (!validatePassword(password)) {
      return res.status(400).json({ error: 'Password must be 6-50 characters' });
    }
    if (email && !validateEmail(email)) {
      return res.status(400).json({ error: 'Invalid email format' });
    }

    // Check if user exists
    const existingUser = await query('SELECT id FROM users WHERE username = $1', [username]);
    if (existingUser.rows.length > 0) {
      return res.status(400).json({ error: 'Username already taken' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const result = await query(
      'INSERT INTO users (username, password, email) VALUES ($1, $2, $3) RETURNING id, username, balance, xp, shop_points',
      [username, hashedPassword, email || null]
    );

    const userId = result.rows[0].id;

    // Initialize game stats
    const games = ['crash', 'dice', 'blackjack', 'plinko', 'mines', 'cases'];
    for (const game of games) {
      await query('INSERT INTO game_stats (user_id, game) VALUES ($1, $2)', [userId, game]);
    }

    // Generate token
    const token = generateToken({ id: userId, username });

    return res.status(200).json({
      success: true,
      token,
      user: {
        id: userId,
        username: result.rows[0].username,
        balance: parseFloat(result.rows[0].balance),
        xp: result.rows[0].xp,
        shopPoints: result.rows[0].shop_points
      }
    });
  } catch (error) {
    console.error('Register error:', error);
    return res.status(500).json({ error: 'Server error' });
  }
}