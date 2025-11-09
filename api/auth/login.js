// api/auth/login.js - User login endpoint
import bcrypt from 'bcryptjs';
import { query } from '../_database.js';
import { validateUsername, validatePassword, generateToken, cors } from '../_utils.js';

export default async function handler(req, res) {
  cors(res);
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { username, password } = req.body;

    if (!validateUsername(username) || !validatePassword(password)) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    const result = await query('SELECT * FROM users WHERE username = $1', [username]);
    if (result.rows.length === 0) {
      return res.status(400).json({ error: 'User not found' });
    }

    const user = result.rows[0];

    // Verify password
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(400).json({ error: 'Incorrect password' });
    }

    // Generate token
    const token = generateToken({ id: user.id, username: user.username });

    return res.status(200).json({
      success: true,
      token,
      user: {
        id: user.id,
        username: user.username,
        balance: parseFloat(user.balance),
        xp: user.xp,
        shopPoints: user.shop_points
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ error: 'Server error' });
  }
}