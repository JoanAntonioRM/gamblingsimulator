// api/auth/forgot-password.js - Request password reset
import crypto from 'crypto';
import { query } from '../_database.js';
import { validateUsername, cors } from '../_utils.js';

export default async function handler(req, res) {
  cors(res);
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { username } = req.body;

    if (!validateUsername(username)) {
      return res.status(400).json({ error: 'Invalid username' });
    }

    const result = await query('SELECT id, email FROM users WHERE username = $1', [username]);
    if (result.rows.length === 0) {
      return res.status(400).json({ error: 'User not found' });
    }

    const user = result.rows[0];
    if (!user.email) {
      return res.status(400).json({ error: 'No email associated with this account' });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExpiry = Date.now() + 3600000; // 1 hour

    await query(
      'UPDATE users SET reset_token = $1, reset_token_expiry = $2 WHERE id = $3',
      [resetToken, resetTokenExpiry, user.id]
    );

    // In production, send this via email
    // For now, return it in response (ONLY FOR DEVELOPMENT)
    return res.status(200).json({
      success: true,
      message: 'Password reset token generated',
      resetToken // REMOVE THIS IN PRODUCTION
    });
  } catch (error) {
    console.error('Forgot password error:', error);
    return res.status(500).json({ error: 'Server error' });
  }
}