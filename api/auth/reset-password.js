// api/auth/reset-password.js - Reset password with token
import bcrypt from 'bcryptjs';
import { query } from '../_database.js';
import { validatePassword, cors } from '../_utils.js';

export default async function handler(req, res) {
  cors(res);
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { resetToken, newPassword } = req.body;

    if (!resetToken || !validatePassword(newPassword)) {
      return res.status(400).json({ error: 'Invalid request' });
    }

    const result = await query(
      'SELECT id FROM users WHERE reset_token = $1 AND reset_token_expiry > $2',
      [resetToken, Date.now()]
    );

    if (result.rows.length === 0) {
      return res.status(400).json({ error: 'Invalid or expired reset token' });
    }

    const userId = result.rows[0].id;
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await query(
      'UPDATE users SET password = $1, reset_token = NULL, reset_token_expiry = NULL WHERE id = $2',
      [hashedPassword, userId]
    );

    return res.status(200).json({ success: true, message: 'Password reset successful' });
  } catch (error) {
    console.error('Reset password error:', error);
    return res.status(500).json({ error: 'Server error' });
  }
}