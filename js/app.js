/**
 * app.js - Main Application Logic
 * Handles page navigation, UI updates, and coordination
 */

// Global state
let currentUser = null;
let guestBalance = 1000;
let currentPage = 'main';

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    initializeApp();
});

/**
 * Initialize the application
 */
function initializeApp() {
    currentUser = Storage.loadCurrentUser();
    if (!currentUser) {
        guestBalance = Storage.getGuestBalance();
    }
    initializeTheme();
    updateHeaderUI();
    navigateTo('main');
}

/**
 * Toggle side menu open/closed
 */
function toggleMenu() {
    const menu = document.getElementById('sideMenu');
    const overlay = document.getElementById('menuOverlay');
    const hamburger = document.getElementById('hamburgerBtn');
    const content = document.querySelector('.main-content');
    
    menu.classList.toggle('open');
    overlay.classList.toggle('active');
    hamburger.classList.toggle('active');
    content.classList.toggle('menu-open');
}

/**
 * Navigate to a specific page
 * @param {string} page - Page name to navigate to
 */
async function navigateTo(page) {
    currentPage = page;
    const content = document.getElementById('mainContent');
    
    // Load page content
    switch(page) {
        case 'main':
            loadMainPage(content);
            break;
        case 'login':
            loadLoginPage(content);
            break;
        case 'user':
            if (!currentUser) {
                navigateTo('login');
                return;
            }
            loadUserPage(content);
            break;
        case 'leaderboard':
            loadLeaderboardPage(content);
            break;
        case 'shop':
            loadShopPage(content);
            break;
        case 'crash':
        case 'dice':
        case 'blackjack':
        case 'plinko':
        case 'mines':
            await loadGamePage(content, page);
            break;
        default:
            loadMainPage(content);
    }
    
    // Scroll to top
    window.scrollTo(0, 0);
}

/**
 * Load main page content
 */
function loadMainPage(content) {
    if (currentUser) {
        content.innerHTML = `
            <div class="level-section">
                ${Ranking.getRankHTML(currentUser)}
            </div>
            <div class="games-grid">
                <div class="game-card" onclick="navigateTo('crash')">
                    <div class="game-icon">🚀</div>
                    <div class="game-title">Crash</div>
                </div>
                <div class="game-card" onclick="navigateTo('dice')">
                    <div class="game-icon">🎲</div>
                    <div class="game-title">Dice</div>
                </div>
                <div class="game-card" onclick="navigateTo('blackjack')">
                    <div class="game-icon">🃏</div>
                    <div class="game-title">Blackjack</div>
                </div>
                <div class="game-card" onclick="navigateTo('plinko')">
                    <div class="game-icon">🎯</div>
                    <div class="game-title">Plinko</div>
                </div>
                <div class="game-card" onclick="navigateTo('mines')">
                    <div class="game-icon">💎</div>
                    <div class="game-title">Mines</div>
                </div>
            </div>
        `;
    } else {
        content.innerHTML = `
            <div class="level-section">
                <div style="font-size: 60px; margin-bottom: 20px;">👤</div>
                <div style="font-size: 24px; color: var(--text-primary); margin-bottom: 10px;">Welcome to Casino Simulator!</div>
                <div style="font-size: 16px; color: var(--text-secondary); margin-bottom: 20px;">
                    You're playing as a guest with $${guestBalance.toFixed(2)}<br>
                    <span style="font-size: 14px;">Create an account to save your progress and unlock features!</span>
                </div>
                <button class="btn-primary" style="max-width: 300px; margin: 0 auto;" onclick="navigateTo('login')">
                    Create Account / Login
                </button>
            </div>
            <div class="games-grid">
                <div class="game-card" onclick="navigateTo('crash')">
                    <div class="game-icon">🚀</div>
                    <div class="game-title">Crash</div>
                </div>
                <div class="game-card" onclick="navigateTo('dice')">
                    <div class="game-icon">🎲</div>
                    <div class="game-title">Dice</div>
                </div>
                <div class="game-card" onclick="navigateTo('blackjack')">
                    <div class="game-icon">🃏</div>
                    <div class="game-title">Blackjack</div>
                </div>
                <div class="game-card" onclick="navigateTo('plinko')">
                    <div class="game-icon">🎯</div>
                    <div class="game-title">Plinko</div>
                </div>
            </div>
        `;
    }
}

/**
 * Load login/register page
 */
function loadLoginPage(content) {
    content.innerHTML = `
        <div class="login-section">
            <h2 id="authTitle">Login</h2>
            <div class="input-group">
                <label>Username</label>
                <input type="text" id="authUsername" placeholder="Enter username">
            </div>
            <div class="input-group">
                <label>Password</label>
                <input type="password" id="authPassword" placeholder="Enter password">
            </div>
            <div class="error-message" id="authError"></div>
            <button class="btn-primary" onclick="handleAuth()">Continue</button>
            <div class="switch-mode">
                <span id="switchText">Don't have an account? </span>
                <a onclick="Auth.toggleMode()">Register</a>
            </div>
        </div>
    `;
}

/**
 * Load user profile page
 */
function loadUserPage(content) {
    if (!currentUser) return;
    
    const profit = currentUser.totalWon - currentUser.totalLost;
    
    content.innerHTML = `
        <button class="back-btn" onclick="navigateTo('main')">← Back</button>
        <div class="level-section">
            ${Ranking.getUserRankHTML(currentUser)}
        </div>
        <div class="stats-grid">
            <div class="stat-card">
                <div class="stat-value">$${currentUser.totalBet.toFixed(0)}</div>
                <div class="stat-label">Total Bet</div>
            </div>
            <div class="stat-card">
                <div class="stat-value" style="color: ${profit >= 0 ? '#22c55e' : '#ef4444'}">
                    $${Math.abs(profit).toFixed(0)}
                </div>
                <div class="stat-label">${profit >= 0 ? 'Profit' : 'Loss'}</div>
            </div>
            <div class="stat-card">
                <div class="stat-value">${currentUser.games.crash.played}</div>
                <div class="stat-label">🚀 Crash Games</div>
                <div style="font-size: 12px; margin-top: 5px; color: var(--text-secondary);">
                    W: ${currentUser.games.crash.won} / L: ${currentUser.games.crash.lost}
                </div>
            </div>
            <div class="stat-card">
                <div class="stat-value">${currentUser.games.dice.played}</div>
                <div class="stat-label">🎲 Dice Games</div>
                <div style="font-size: 12px; margin-top: 5px; color: var(--text-secondary);">
                    W: ${currentUser.games.dice.won} / L: ${currentUser.games.dice.lost}
                </div>
            </div>
            <div class="stat-card">
                <div class="stat-value">${currentUser.games.blackjack.played}</div>
                <div class="stat-label">🃏 Blackjack Games</div>
                <div style="font-size: 12px; margin-top: 5px; color: var(--text-secondary);">
                    W: ${currentUser.games.blackjack.won} / L: ${currentUser.games.blackjack.lost}
                </div>
            </div>
            <div class="stat-card">
                <div class="stat-value">${currentUser.games.plinko.played}</div>
                <div class="stat-label">🎯 Plinko Games</div>
                <div style="font-size: 12px; margin-top: 5px; color: var(--text-secondary);">
                    W: ${currentUser.games.plinko.won} / L: ${currentUser.games.plinko.lost}
                </div>
            </div>
            <div class="stat-card">
                <div class="stat-value">${currentUser.games.mines.played}</div>
                <div class="stat-label">💎 Mines Games</div>
                <div style="font-size: 12px; margin-top: 5px; color: var(--text-secondary);">
                    W: ${currentUser.games.mines.won} / L: ${currentUser.games.mines.lost}
                </div>
            </div>
        </div>
        <div style="margin-top: 40px; text-align: center;">
            <button class="delete-account-btn" onclick="confirmDeleteAccount()">
                Delete Account
            </button>
        </div>
    `;
}

/**
 * Load shop page
 */
function loadShopPage(content) {
    if (currentUser) {
        content.innerHTML = `
            <button class="back-btn" onclick="navigateTo('main')">← Back</button>
            <div class="game-container">
                <h1>🛒 Shop Points Store</h1>
                <div style="text-align: center; margin: 40px 0;">
                    <div style="font-size: 48px; color: #667eea; font-weight: bold; margin-bottom: 20px;">
                        ${currentUser.shopPoints} Points
                    </div>
                    <p style="font-size: 18px; color: var(--text-secondary); margin-bottom: 20px;">
                        The shop is coming soon!
                    </p>
                    <p style="font-size: 16px; color: var(--text-tertiary);">
                        Keep playing and winning games to earn more shop points.<br>
                        Soon you'll be able to customize your profile with unique items!
                    </p>
                    <div style="margin-top: 40px; padding: 30px; background: var(--border-color); border-radius: 15px; display: inline-block;">
                        <p style="font-size: 14px; color: var(--text-secondary); margin-bottom: 10px;">💡 <strong>How to earn points:</strong></p>
                        <ul style="list-style: none; text-align: left; color: var(--text-secondary);">
                            <li>✓ Win games to earn XP</li>
                            <li>✓ Rank up to earn bonus shop points</li>
                            <li>✓ Higher ranks = more shop points per level</li>
                        </ul>
                    </div>
                </div>
            </div>
        `;
    } else {
        content.innerHTML = `
            <button class="back-btn" onclick="navigateTo('main')">← Back</button>
            <div class="game-container">
                <h1>🛒 Shop Points Store</h1>
                <div style="text-align: center; margin: 40px 0;">
                    <div style="font-size: 60px; margin-bottom: 20px;">🔒</div>
                    <p style="font-size: 18px; color: var(--text-secondary); margin-bottom: 20px;">
                        The shop is coming soon!
                    </p>
                    <p style="font-size: 16px; color: var(--text-tertiary); margin-bottom: 30px;">
                        Create an account to start earning shop points and unlock exclusive profile customizations!
                    </p>
                    <button class="btn-primary" style="max-width: 300px; margin: 0 auto;" onclick="navigateTo('login')">
                        Create Account / Login
                    </button>
                </div>
            </div>
        `;
    }
}

/**
 * Load leaderboard page
 */
function loadLeaderboardPage(content) {
    const games = ['crash', 'dice', 'blackjack', 'plinko', 'mines'];
    const icons = { crash: '🚀', dice: '🎲', blackjack: '🃏', plinko: '🎯', mines: '💎' };
    
    content.innerHTML = `
        <button class="back-btn" onclick="navigateTo('main')">← Back</button>
        <div class="leaderboard-container">
            <div class="game-tabs" id="leaderboardTabs"></div>
            <div id="leaderboardContent"></div>
        </div>
    `;
    
    // Generate tabs
    const tabsHTML = games.map(game => `
        <div class="game-tab ${game === 'crash' ? 'active' : ''}" onclick="Leaderboard.showGame('${game}')">
            ${icons[game]} ${game.charAt(0).toUpperCase() + game.slice(1)}
        </div>
    `).join('');
    
    document.getElementById('leaderboardTabs').innerHTML = tabsHTML;
    Leaderboard.showGame('crash');
}

/**
 * Load game page
 */
async function loadGamePage(content, game) {
    content.innerHTML = `<button class="back-btn" onclick="navigateTo('main')">← Back to Games</button>`;
    
    try {
        const response = await fetch(`games/${game}.html`);
        const html = await response.text();
        
        const gameContainer = document.createElement('div');
        gameContainer.innerHTML = html;
        content.appendChild(gameContainer);
        
        // Execute game scripts
        const scripts = gameContainer.querySelectorAll('script');
        scripts.forEach(script => {
            const newScript = document.createElement('script');
            newScript.textContent = script.textContent;
            document.body.appendChild(newScript);
        });
    } catch (error) {
        content.innerHTML += `
            <div class="game-container">
                <h1>Loading...</h1>
                <div style="text-align: center; color: var(--text-secondary); margin: 40px 0;">
                    <p>Game is loading...</p>
                    <p style="margin-top: 20px; font-size: 14px;">Make sure the games folder exists with ${game}.html</p>
                </div>
            </div>
        `;
    }
}

/**
 * Update header UI
 */
function updateHeaderUI() {
    if (currentUser) {
        document.getElementById('headerUsername').textContent = currentUser.username;
        document.getElementById('headerBalance').textContent = 
            `$${currentUser.balance.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`;
        document.getElementById('logoutBtn').classList.remove('hidden');
    } else {
        document.getElementById('headerUsername').textContent = 'Guest';
        document.getElementById('headerBalance').textContent = 
            `$${guestBalance.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`;
        document.getElementById('logoutBtn').classList.add('hidden');
    }
}

/**
 * Handle user icon click
 */
function handleUserClick() {
    if (currentUser) {
        navigateTo('user');
    } else {
        navigateTo('login');
    }
}

/**
 * Handle balance click - show add funds modal
 */
function handleBalanceClick() {
    if (!currentUser) {
        showGuestLimitModal();
    } else {
        showAddFundsModal();
    }
}

/**
 * Show guest limit modal
 */
function showGuestLimitModal() {
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.style.display = 'block';
    modal.innerHTML = `
        <div class="modal-content">
            <h2>🔒 Guest Account Limit</h2>
            <p style="color: var(--text-secondary); margin: 20px 0;">
                As a guest, you have a limited balance of $1,000.<br><br>
                Create an account to get $10,000 starting balance and unlock:
            </p>
            <ul style="list-style: none; color: var(--text-secondary); line-height: 2;">
                <li>✓ Unlimited funds</li>
                <li>✓ Save your progress</li>
                <li>✓ Earn XP and rank up</li>
                <li>✓ Appear on leaderboards</li>
                <li>✓ Earn shop points</li>
            </ul>
            <div class="modal-buttons">
                <button class="modal-btn modal-btn-confirm" onclick="this.closest('.modal').remove(); navigateTo('login');">Create Account</button>
                <button class="modal-btn modal-btn-cancel" onclick="this.closest('.modal').remove();">Continue as Guest</button>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
}

/**
 * Show add funds modal
 */
function showAddFundsModal() {
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.style.display = 'block';
    modal.innerHTML = `
        <div class="modal-content">
            <h2>Add Funds</h2>
            <div class="credit-card">
                <div class="card-chip"></div>
                <div class="card-number">•••• •••• •••• 4242</div>
                <div class="card-info">
                    <div class="card-holder">
                        <div style="font-size: 10px; opacity: 0.8;">CARD HOLDER</div>
                        <div>${currentUser.username}</div>
                    </div>
                    <div class="card-expiry">
                        <div style="font-size: 10px; opacity: 0.8;">EXPIRES</div>
                        <div>12/25</div>
                    </div>
                </div>
            </div>
            <div class="input-group">
                <label>Amount to Add</label>
                <input type="number" id="addFundsAmount" placeholder="Enter amount" min="1" step="100" style="text-align: center; font-size: 20px;">
            </div>
            <div class="modal-buttons">
                <button class="modal-btn modal-btn-confirm" onclick="processAddFunds()">Confirm Payment</button>
                <button class="modal-btn modal-btn-cancel" onclick="this.closest('.modal').remove();">Cancel</button>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
}

/**
 * Process add funds
 */
function processAddFunds() {
    const amount = parseFloat(document.getElementById('addFundsAmount').value);
    if (isNaN(amount) || amount <= 0) {
        alert('Please enter a valid amount');
        return;
    }

    // Remove current modal
    document.querySelector('.modal').remove();

    // Show Apple Pay style success modal
    const successModal = document.createElement('div');
    successModal.className = 'modal';
    successModal.style.display = 'block';
    successModal.innerHTML = `
        <div class="modal-content success-modal">
            <div class="success-icon">✓</div>
            <h2>Payment Successful!</h2>
            <div class="modal-amount">$${amount.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}</div>
            <p>has been added to your account</p>
        </div>
    `;
    document.body.appendChild(successModal);

    // Add funds to user
    currentUser.balance += amount;
    Storage.saveCurrentUser(currentUser);
    updateHeaderUI();

    // Auto close after 2 seconds
    setTimeout(() => {
        successModal.remove();
    }, 2000);
}

/**
 * Confirm delete account
 */
function confirmDeleteAccount() {
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.style.display = 'block';
    modal.innerHTML = `
        <div class="modal-content" style="border: 3px solid #ef4444;">
            <h2 style="color: #ef4444;">⚠️ Delete Account</h2>
            <p style="color: var(--text-secondary); margin: 20px 0; line-height: 1.6;">
                Are you sure you want to delete your account?<br><br>
                <strong>This action cannot be undone!</strong><br><br>
                You will lose:
            </p>
            <ul style="list-style: none; color: #ef4444; line-height: 2; font-weight: bold;">
                <li>• All your progress and stats</li>
                <li>• Your rank and XP (${currentUser.xp} XP)</li>
                <li>• Your shop points (${currentUser.shopPoints} points)</li>
                <li>• Your balance ($${currentUser.balance.toFixed(2)})</li>
                <li>• Your leaderboard position</li>
                <li>• Any future profile customizations</li>
            </ul>
            <div class="modal-buttons" style="margin-top: 30px;">
                <button class="modal-btn" style="background: #ef4444; color: white;" onclick="deleteAccount()">Yes, Delete My Account</button>
                <button class="modal-btn modal-btn-confirm" onclick="this.closest('.modal').remove();">Cancel</button>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
}

/**
 * Delete account
 */
function deleteAccount() {
    const username = currentUser.username;
    Storage.deleteUser(username);
    currentUser = null;
    guestBalance = 1000;
    Storage.saveGuestBalance(guestBalance);
    
    document.querySelector('.modal').remove();
    
    // Show confirmation
    const confirmModal = document.createElement('div');
    confirmModal.className = 'modal';
    confirmModal.style.display = 'block';
    confirmModal.innerHTML = `
        <div class="modal-content">
            <h2>Account Deleted</h2>
            <p style="color: var(--text-secondary); margin: 20px 0;">
                Your account has been successfully deleted.<br>
                All your data has been removed from our system.
            </p>
            <button class="btn-primary" onclick="this.closest('.modal').remove(); navigateTo('main');">Continue</button>
        </div>
    `;
    document.body.appendChild(confirmModal);
    
    updateHeaderUI();
}

/**
 * Handle user logout
 */
function logout() {
    currentUser = null;
    Storage.clearCurrentUser();
    guestBalance = 1000;
    Storage.saveGuestBalance(guestBalance);
    updateHeaderUI();
    navigateTo('main');
}

/**
 * Handle authentication (login/register)
 */
function handleAuth() {
    Auth.handleAuth((user) => {
        currentUser = user;
        Storage.clearGuestBalance(); // Clear guest progress
        updateHeaderUI();
        navigateTo('main');
    });
}

/**
 * Update balance (for games to call)
 * @param {number} amount - Amount to add/subtract (negative to subtract)
 */
function updateBalance(amount) {
    if (currentUser) {
        currentUser.balance += amount;
        if (currentUser.balance < 0) currentUser.balance = 0;
        Storage.saveCurrentUser(currentUser);
    } else {
        guestBalance += amount;
        if (guestBalance < 0) guestBalance = 0;
        Storage.saveGuestBalance(guestBalance);
    }
    updateHeaderUI();
}

/**
 * Get current balance
 * @returns {number} Current balance
 */
function getCurrentBalance() {
    return currentUser ? currentUser.balance : guestBalance;
}

/**
 * Update game stats (for games to call)
 */
function updateGameStats(game, won, betAmount, winAmount) {
    if (!currentUser) return;

    Storage.updateGameStats(currentUser, game, won, betAmount, winAmount);

    if (won) {
        const xpResult = Ranking.awardXP(currentUser, betAmount, winAmount);
        
        if (xpResult.rankedUp) {
            showRankUpNotification(xpResult.newRank);
        }
    }

    updateHeaderUI();
}

/**
 * Show rank up notification
 */
function showRankUpNotification(newRank) {
    alert(`🎉 Rank Up! You are now ${newRank.name} ${newRank.emoji}!\nYou earned ${newRank.shopPoints} shop points!`);
}

/**
 * Leaderboard helper object
 */
const Leaderboard = {
    currentGame: 'crash',
    
    showGame(game) {
        this.currentGame = game;
        
        // Update active tab
        document.querySelectorAll('.game-tab').forEach(tab => {
            tab.classList.remove('active');
        });
        event.target.classList.add('active');
        
        // Load leaderboard
        const leaderboard = Storage.getLeaderboard(game, 25);
        const icons = { crash: '🚀', dice: '🎲', blackjack: '🃏', plinko: '🎯' };
        
        let html = `<h2>${icons[game]} ${game.charAt(0).toUpperCase() + game.slice(1)} Leaderboard</h2>`;
        
        if (leaderboard.length === 0) {
            html += '<div style="text-align: center; color: var(--text-secondary); padding: 40px;">No games played yet</div>';
        } else {
            leaderboard.forEach((user, index) => {
                const isCurrentUser = currentUser && user.username === currentUser.username;
                html += `
                    <div class="leaderboard-item ${isCurrentUser ? 'highlight' : ''}">
                        <div class="leaderboard-rank">#${index + 1}</div>
                        <div class="leaderboard-user">${user.username}</div>
                        <div class="leaderboard-wins">${user.wins} wins</div>
                    </div>
                `;
            });
        }
        
        document.getElementById('leaderboardContent').innerHTML = html;
    }
};

/**
 * Theme Management
 */
function initializeTheme() {
    const savedTheme = localStorage.getItem('casinoTheme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
    updateThemeUI(savedTheme);
}

function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('casinoTheme', newTheme);
    updateThemeUI(newTheme);
}

function updateThemeUI(theme) {
    const themeIcon = document.getElementById('themeIcon');
    const themeText = document.getElementById('themeText');
    
    if (theme === 'dark') {
        themeIcon.textContent = '☀️';
        themeText.textContent = 'Light Mode';
    } else {
        themeIcon.textContent = '🌙';
        themeText.textContent = 'Dark Mode';
    }
}