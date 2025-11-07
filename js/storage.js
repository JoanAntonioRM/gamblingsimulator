/**
 * storage.js - LocalStorage Management
 * Handles all data persistence for users and game stats
 * 
 * SECURITY NOTE: User data is stored in browser's localStorage.
 * For production, implement server-side storage with proper encryption.
 * As a developer, you can view user data in browser console: localStorage.getItem('casinoUsers')
 */

const Storage = {
    // Keys for localStorage
    KEYS: {
        USERS: 'casinoUsers',
        CURRENT_USER: 'currentUsername',
        GUEST_BALANCE: 'guestBalance'
    },

    /**
     * Load all users from localStorage
     * DEVELOPER ACCESS: Open browser console and run: JSON.parse(localStorage.getItem('casinoUsers'))
     * @returns {Object} Users object with username as key
     */
    loadUsers() {
        const stored = localStorage.getItem(this.KEYS.USERS);
        return stored ? JSON.parse(stored) : {};
    },

    /**
     * Save all users to localStorage
     * @param {Object} users - Users object to save
     */
    saveUsers(users) {
        localStorage.setItem(this.KEYS.USERS, JSON.stringify(users));
    },

    /**
     * Load current logged in user
     * @returns {Object|null} User object or null if not logged in
     */
    loadCurrentUser() {
        const username = localStorage.getItem(this.KEYS.CURRENT_USER);
        if (username) {
            const users = this.loadUsers();
            return users[username] || null;
        }
        return null;
    },

    /**
     * Save current user to localStorage
     * @param {Object} user - User object to save
     */
    saveCurrentUser(user) {
        if (user) {
            localStorage.setItem(this.KEYS.CURRENT_USER, user.username);
            const users = this.loadUsers();
            users[user.username] = user;
            this.saveUsers(users);
        }
    },

    /**
     * Remove current user (logout)
     */
    clearCurrentUser() {
        localStorage.removeItem(this.KEYS.CURRENT_USER);
    },

    /**
     * Delete user account completely
     * @param {string} username - Username to delete
     */
    deleteUser(username) {
        const users = this.loadUsers();
        delete users[username];
        this.saveUsers(users);
        
        // If deleted user is current user, clear session
        const currentUsername = localStorage.getItem(this.KEYS.CURRENT_USER);
        if (currentUsername === username) {
            this.clearCurrentUser();
        }
    },

    /**
     * Check if username exists
     * @param {string} username - Username to check
     * @returns {boolean} True if username exists
     */
    usernameExists(username) {
        const users = this.loadUsers();
        return username in users;
    },

    /**
     * Get user by username
     * @param {string} username - Username to retrieve
     * @returns {Object|null} User object or null
     */
    getUser(username) {
        const users = this.loadUsers();
        return users[username] || null;
    },

    /**
     * Create new user
     * @param {string} username - Username
     * @param {string} password - Password
     * @returns {Object} New user object
     */
    createUser(username, password) {
        return {
            username,
            password,
            balance: 10000,
            xp: 0,
            shopPoints: 0,
            totalBet: 0,
            totalWon: 0,
            totalLost: 0,
            games: {
                crash: { played: 0, won: 0, lost: 0 },
                dice: { played: 0, won: 0, lost: 0 },
                blackjack: { played: 0, won: 0, lost: 0 },
                plinko: { played: 0, won: 0, lost: 0 },
                mines: { played: 0, won: 0, lost: 0 }
            },
            createdAt: Date.now()
        };
    },

    /**
     * Guest user management - for non-logged in users
     */
    getGuestBalance() {
        const stored = localStorage.getItem(this.KEYS.GUEST_BALANCE);
        return stored ? parseFloat(stored) : 1000;
    },

    saveGuestBalance(balance) {
        localStorage.setItem(this.KEYS.GUEST_BALANCE, balance.toString());
    },

    clearGuestBalance() {
        localStorage.removeItem(this.KEYS.GUEST_BALANCE);
    },

    /**
     * Update user stats after a game
     * @param {Object} user - User object
     * @param {string} game - Game name (crash, dice, blackjack, plinko)
     * @param {boolean} won - Whether user won
     * @param {number} betAmount - Amount bet
     * @param {number} winAmount - Amount won (0 if lost)
     */
    updateGameStats(user, game, won, betAmount, winAmount) {
        user.games[game].played++;
        user.totalBet += betAmount;

        if (won) {
            user.games[game].won++;
            user.totalWon += winAmount;
        } else {
            user.games[game].lost++;
            user.totalLost += betAmount;
        }

        this.saveCurrentUser(user);
    },

    /**
     * Get all users sorted by game wins
     * @param {string} game - Game name
     * @param {number} limit - Number of users to return
     * @returns {Array} Array of {username, wins} objects
     */
    getLeaderboard(game, limit = 25) {
        const users = this.loadUsers();
        return Object.values(users)
            .map(u => ({
                username: u.username,
                wins: u.games[game].won
            }))
            .sort((a, b) => b.wins - a.wins)
            .slice(0, limit);
    },

    /**
     * DEVELOPER ONLY: Export all user data
     * Run in console: Storage.exportAllUsers()
     */
    exportAllUsers() {
        const users = this.loadUsers();
        console.log('=== ALL USERS DATABASE ===');
        console.table(Object.values(users).map(u => ({
            Username: u.username,
            Password: u.password,
            Balance: u.balance,
            XP: u.xp,
            'Shop Points': u.shopPoints,
            'Created': new Date(u.createdAt).toLocaleDateString()
        })));
        return users;
    }
};

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Storage;
}