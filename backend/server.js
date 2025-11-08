/**
 * Casino Simulator Backend Server - PostgreSQL Version
 * Production-ready for Railway/Render deployment
 */

const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { Pool } = require('pg');
const crypto = require('crypto');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || crypto.randomBytes(64).toString('hex');

// Middleware
app.use(cors({
    origin: process.env.FRONTEND_URL || '*',
    credentials: true
}));
app.use(express.json());

// PostgreSQL Database setup
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

// Initialize database tables
async function initializeDatabase() {
    try {
        await pool.query(`
            CREATE TABLE IF NOT EXISTS users (
                id SERIAL PRIMARY KEY,
                username VARCHAR(50) UNIQUE NOT NULL,
                password TEXT NOT NULL,
                balance DECIMAL(15,2) DEFAULT 10000,
                xp INTEGER DEFAULT 0,
                shop_points INTEGER DEFAULT 0,
                total_bet DECIMAL(15,2) DEFAULT 0,
                total_won DECIMAL(15,2) DEFAULT 0,
                total_lost DECIMAL(15,2) DEFAULT 0,
                created_at BIGINT DEFAULT EXTRACT(EPOCH FROM NOW())
            )
        `);

        await pool.query(`
            CREATE TABLE IF NOT EXISTS game_stats (
                id SERIAL PRIMARY KEY,
                user_id INTEGER NOT NULL,
                game VARCHAR(20) NOT NULL,
                played INTEGER DEFAULT 0,
                won INTEGER DEFAULT 0,
                lost INTEGER DEFAULT 0,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
                UNIQUE(user_id, game)
            )
        `);

        console.log('✅ Database tables created/verified');
    } catch (error) {
        console.error('❌ Database initialization error:', error);
    }
}

initializeDatabase();

// Encryption helpers
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY ? Buffer.from(process.env.ENCRYPTION_KEY, 'hex') : crypto.randomBytes(32);
const IV_LENGTH = 16;

function encrypt(text) {
    const iv = crypto.randomBytes(IV_LENGTH);
    const cipher = crypto.createCipheriv('aes-256-cbc', ENCRYPTION_KEY, iv);
    let encrypted = cipher.update(text);
    encrypted = Buffer.concat([encrypted, cipher.final()]);
    return iv.toString('hex') + ':' + encrypted.toString('hex');
}

function decrypt(text) {
    const parts = text.split(':');
    const iv = Buffer.from(parts.shift(), 'hex');
    const encryptedText = Buffer.from(parts.join(':'), 'hex');
    const decipher = crypto.createDecipheriv('aes-256-cbc', ENCRYPTION_KEY, iv);
    let decrypted = decipher.update(encryptedText);
    decrypted = Buffer.concat([decrypted, decipher.final()]);
    return decrypted.toString();
}

// Authentication middleware
function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) return res.status(401).json({ error: 'Access denied' });

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) return res.status(403).json({ error: 'Invalid token' });
        req.user = user;
        next();
    });
}

// Validation helpers
function validateUsername(username) {
    if (!username || typeof username !== 'string') return false;
    if (username.length < 3 || username.length > 20) return false;
    if (!/^[a-zA-Z0-9_]+$/.test(username)) return false;
    return true;
}

function validatePassword(password) {
    if (!password || typeof password !== 'string') return false;
    if (password.length < 6 || password.length > 50) return false;
    return true;
}

// ============ API ROUTES ============

// Health check
app.get('/api/health', async (req, res) => {
    try {
        await pool.query('SELECT 1');
        res.json({ status: 'OK', timestamp: Date.now(), database: 'connected' });
    } catch (error) {
        res.status(500).json({ status: 'ERROR', database: 'disconnected' });
    }
});

// Register new user
app.post('/api/auth/register', async (req, res) => {
    try {
        const { username, password } = req.body;

        if (!validateUsername(username)) {
            return res.status(400).json({ error: 'Invalid username format' });
        }
        if (!validatePassword(password)) {
            return res.status(400).json({ error: 'Password must be 6-50 characters' });
        }

        // Check if user exists
        const existingUser = await pool.query('SELECT id FROM users WHERE username = $1', [username]);
        if (existingUser.rows.length > 0) {
            return res.status(400).json({ error: 'Username already taken' });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create user
        const result = await pool.query(
            'INSERT INTO users (username, password) VALUES ($1, $2) RETURNING id, username, balance, xp, shop_points',
            [username, hashedPassword]
        );

        const userId = result.rows[0].id;

        // Initialize game stats
        const games = ['crash', 'dice', 'blackjack', 'plinko', 'mines'];
        for (const game of games) {
            await pool.query('INSERT INTO game_stats (user_id, game) VALUES ($1, $2)', [userId, game]);
        }

        // Generate token
        const token = jwt.sign({ id: userId, username }, JWT_SECRET, { expiresIn: '7d' });

        res.json({
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
        res.status(500).json({ error: 'Server error' });
    }
});

// Login user
app.post('/api/auth/login', async (req, res) => {
    try {
        const { username, password } = req.body;

        if (!validateUsername(username) || !validatePassword(password)) {
            return res.status(400).json({ error: 'Invalid credentials' });
        }

        const result = await pool.query('SELECT * FROM users WHERE username = $1', [username]);
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
        const token = jwt.sign({ id: user.id, username: user.username }, JWT_SECRET, { expiresIn: '7d' });

        res.json({
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
        res.status(500).json({ error: 'Server error' });
    }
});

// Get user profile
app.get('/api/user/profile', authenticateToken, async (req, res) => {
    try {
        const userResult = await pool.query('SELECT * FROM users WHERE id = $1', [req.user.id]);
        if (userResult.rows.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }

        const user = userResult.rows[0];

        // Get game stats
        const statsResult = await pool.query('SELECT * FROM game_stats WHERE user_id = $1', [user.id]);
        
        const games = {};
        statsResult.rows.forEach(stat => {
            games[stat.game] = {
                played: stat.played,
                won: stat.won,
                lost: stat.lost
            };
        });

        res.json({
            id: user.id,
            username: user.username,
            balance: parseFloat(user.balance),
            xp: user.xp,
            shopPoints: user.shop_points,
            totalBet: parseFloat(user.total_bet),
            totalWon: parseFloat(user.total_won),
            totalLost: parseFloat(user.total_lost),
            games,
            createdAt: user.created_at
        });
    } catch (error) {
        console.error('Profile error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Update balance
app.post('/api/user/balance', authenticateToken, async (req, res) => {
    try {
        const { amount } = req.body;

        if (typeof amount !== 'number') {
            return res.status(400).json({ error: 'Invalid amount' });
        }

        const result = await pool.query(
            'UPDATE users SET balance = balance + $1 WHERE id = $2 RETURNING balance',
            [amount, req.user.id]
        );

        res.json({ success: true, balance: parseFloat(result.rows[0].balance) });
    } catch (error) {
        console.error('Balance update error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Update game stats
app.post('/api/game/stats', authenticateToken, async (req, res) => {
    try {
        const { game, won, betAmount, winAmount } = req.body;

        const validGames = ['crash', 'dice', 'blackjack', 'plinko', 'mines'];
        if (!validGames.includes(game)) {
            return res.status(400).json({ error: 'Invalid game' });
        }

        const wonValue = won ? 1 : 0;
        const lostValue = won ? 0 : 1;

        // Update game stats
        await pool.query(
            `UPDATE game_stats SET 
                played = played + 1,
                won = won + $1,
                lost = lost + $2
             WHERE user_id = $3 AND game = $4`,
            [wonValue, lostValue, req.user.id, game]
        );

        // Update user totals
        const wonAmount = won ? winAmount : 0;
        const lostAmount = won ? 0 : betAmount;

        await pool.query(
            `UPDATE users SET 
                total_bet = total_bet + $1,
                total_won = total_won + $2,
                total_lost = total_lost + $3
             WHERE id = $4`,
            [betAmount, wonAmount, lostAmount, req.user.id]
        );

        res.json({ success: true });
    } catch (error) {
        console.error('Game stats error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Update XP
app.post('/api/user/xp', authenticateToken, async (req, res) => {
    try {
        const { xpGained, shopPointsGained } = req.body;

        const result = await pool.query(
            'UPDATE users SET xp = xp + $1, shop_points = shop_points + $2 WHERE id = $3 RETURNING xp, shop_points',
            [xpGained, shopPointsGained || 0, req.user.id]
        );

        res.json({ 
            success: true, 
            xp: result.rows[0].xp, 
            shopPoints: result.rows[0].shop_points 
        });
    } catch (error) {
        console.error('XP update error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Get leaderboard
app.get('/api/leaderboard/:game', async (req, res) => {
    try {
        const { game } = req.params;
        const validGames = ['crash', 'dice', 'blackjack', 'plinko', 'mines'];
        
        if (!validGames.includes(game)) {
            return res.status(400).json({ error: 'Invalid game' });
        }

        const result = await pool.query(
            `SELECT u.username, g.won 
             FROM game_stats g 
             JOIN users u ON g.user_id = u.id 
             WHERE g.game = $1 
             ORDER BY g.won DESC 
             LIMIT 25`,
            [game]
        );

        res.json(result.rows);
    } catch (error) {
        console.error('Leaderboard error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Add funds
app.post('/api/user/add-funds', authenticateToken, async (req, res) => {
    try {
        const { amount } = req.body;

        if (typeof amount !== 'number' || amount <= 0) {
            return res.status(400).json({ error: 'Invalid amount' });
        }

        const result = await pool.query(
            'UPDATE users SET balance = balance + $1 WHERE id = $2 RETURNING balance',
            [amount, req.user.id]
        );

        res.json({ success: true, balance: parseFloat(result.rows[0].balance) });
    } catch (error) {
        console.error('Add funds error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Delete account
app.delete('/api/user/account', authenticateToken, async (req, res) => {
    try {
        await pool.query('DELETE FROM game_stats WHERE user_id = $1', [req.user.id]);
        await pool.query('DELETE FROM users WHERE id = $1', [req.user.id]);
        res.json({ success: true });
    } catch (error) {
        console.error('Delete account error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Start server
app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📊 Database: PostgreSQL`);
    console.log(`🔐 JWT authentication enabled`);
    console.log(`🌍 CORS enabled for: ${process.env.FRONTEND_URL || 'all origins'}`);
});