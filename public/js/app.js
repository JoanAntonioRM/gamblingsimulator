let currentUser = null;
let guestBalance = 1000;
let currentPage = 'main';

document.addEventListener('DOMContentLoaded', () => {
    const favicon = document.createElement('link');
    favicon.rel = 'icon';
    favicon.type = 'image/svg+xml';
    favicon.href = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><text y=".9em" font-size="90">🎰</text></svg>';
    document.head.appendChild(favicon);
    
    initializeApp();
    showLoadingWarning(); // NEW: Show loading warning
});

// NEW: Show loading warning message
function showLoadingWarning() {
    const message = document.createElement('div');
    message.style.cssText = `
        position: fixed;
        top: 70px;
        left: 50%;
        transform: translateX(-50%);
        background: #f59e0b;
        color: white;
        padding: 15px 30px;
        border-radius: 8px;
        z-index: 1000;
        box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        max-width: 90%;
        text-align: center;
    `;
    message.innerHTML = '⚠️ If things don\'t load properly, please refresh the page';
    document.body.appendChild(message);
    
    setTimeout(() => message.remove(), 5000);
}

async function initializeApp() {
    const isBackendUp = await API.healthCheck();
    
    if (!isBackendUp) {
        console.warn('Backend server not available. Using guest mode only.');
        showBackendOfflineMessage();
    }
    
    if (API.getToken()) {
        try {
            currentUser = await API.getProfile();
        } catch (error) {
            console.error('Failed to load user:', error);
            API.clearToken();
            currentUser = null;
        }
    }
    
    if (!currentUser) {
        guestBalance = parseFloat(localStorage.getItem('guestBalance')) || 1000;
    }
    
    initializeTheme();
    updateHeaderUI();
    navigateTo('main');
}

function showBackendOfflineMessage() {
    const message = document.createElement('div');
    message.style.cssText = `
        position: fixed;
        top: 70px;
        left: 50%;
        transform: translateX(-50%);
        background: #ef4444;
        color: white;
        padding: 15px 30px;
        border-radius: 8px;
        z-index: 1000;
        box-shadow: 0 4px 12px rgba(0,0,0,0.3);
    `;
    message.textContent = '⚠️ Backend server offline. Running in guest mode only.';
    document.body.appendChild(message);
    
    setTimeout(() => message.remove(), 5000);
}

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

async function navigateTo(page) {
    currentPage = page;
    const content = document.getElementById('mainContent');
    
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
            await loadUserPage(content);
            break;
        case 'ranks':
            await loadRanksPage(content);
            break;
        case 'settings':
            if (!currentUser) {
                navigateTo('login');
                return;
            }
            await loadSettingsPage(content);
            break;
        case 'leaderboard':
            await loadLeaderboardPage(content);
            break;
        case 'shop':
            loadShopPage(content);
            break;
        case 'cases':
            await loadCasesPage(content);
            break;
        case 'roulette':
            await loadRoulettePage(content);
            break;
        case 'cardpacks':
            await loadCardPacksPage(content);
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
    
    window.scrollTo(0, 0);
}

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
                <div class="game-card" onclick="navigateTo('cases')">
                    <div class="game-icon">📦</div>
                    <div class="game-title">Cases</div>
                </div>
                <div class="game-card" onclick="navigateTo('roulette')">
                    <div class="game-icon">🛞</div>
                    <div class="game-title">Roulette</div>
                </div>
                <div class="game-card" onclick="navigateTo('cardpacks')">
                    <div class="game-icon">🎴</div>
                    <div class="game-title">Card Packs</div>
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
                <div class="game-card" onclick="navigateTo('mines')">
                    <div class="game-icon">💎</div>
                    <div class="game-title">Mines</div>
                </div>
                <div class="game-card" onclick="navigateTo('cases')">
                    <div class="game-icon">📦</div>
                    <div class="game-title">Cases</div>
                </div>
                <div class="game-card" onclick="navigateTo('roulette')">
                    <div class="game-icon">🛞</div>
                    <div class="game-title">Roulette</div>
                </div>
                <div class="game-card" onclick="navigateTo('cardpacks')">
                    <div class="game-icon">🎴</div>
                    <div class="game-title">Card Packs</div>
                </div>
            </div>
        `;
    }
}

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
            <div class="input-group hidden" id="emailGroup">
                <label>Email (Optional - for password recovery)</label>
                <input type="email" id="authEmail" placeholder="Enter email (optional)">
            </div>
            <div class="error-message" id="authError"></div>
            <button class="btn-primary" onclick="handleAuth()">Continue</button>
            <div class="switch-mode">
                <span id="switchText">Don't have an account? </span>
                <a onclick="Auth.toggleMode()">Register</a>
            </div>
            <div class="switch-mode" id="forgotPasswordLink">
                <a onclick="showForgotPassword()">Forgot Password?</a>
            </div>
        </div>
    `;
}

async function loadUserPage(content) {
    if (!currentUser) return;
    
    try {
        currentUser = await API.getProfile();
    } catch (error) {
        console.error('Failed to refresh user data:', error);
    }
    
    // FIXED: Calculate actual profit and loss correctly
    const actualProfit = currentUser.totalWon - currentUser.totalBet;
    const actualLoss = currentUser.totalBet - currentUser.totalWon;
    const totalGamesPlayed = Object.values(currentUser.games).reduce((sum, game) => sum + game.played, 0);
    const totalWins = Object.values(currentUser.games).reduce((sum, game) => sum + game.won, 0);
    const totalLosses = Object.values(currentUser.games).reduce((sum, game) => sum + game.lost, 0);
    
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
                <div class="stat-value" style="color: ${actualProfit >= 0 ? '#22c55e' : '#ef4444'}">
                    ${actualProfit >= 0 ? '+' : ''}$${actualProfit.toFixed(0)}
                </div>
                <div class="stat-label">Net Profit</div>
                <div class="stat-details">
                    <div class="stat-detail-item">
                        <div class="stat-detail-label">Won</div>
                        <div class="stat-detail-value positive">+$${currentUser.totalWon.toFixed(0)}</div>
                    </div>
                    <div class="stat-detail-item">
                        <div class="stat-detail-label">Lost</div>
                        <div class="stat-detail-value negative">-$${actualLoss > 0 ? actualLoss.toFixed(0) : '0'}</div>
                    </div>
                </div>
            </div>
            <div class="stat-card">
                <div class="stat-value">${totalGamesPlayed}</div>
                <div class="stat-label">Games Played</div>
                <div class="stat-details">
                    <div class="stat-detail-item">
                        <div class="stat-detail-label">Won</div>
                        <div class="stat-detail-value positive">${totalWins}</div>
                    </div>
                    <div class="stat-detail-item">
                        <div class="stat-detail-label">Lost</div>
                        <div class="stat-detail-value negative">${totalLosses}</div>
                    </div>
                </div>
            </div>
            ${Object.entries(currentUser.games).map(([game, stats]) => {
                const icons = { 
                    crash: '🚀', 
                    dice: '🎲', 
                    blackjack: '🃏', 
                    plinko: '🎯', 
                    mines: '💎', 
                    cases: '📦', 
                    roulette: '🛞', 
                    cardpacks: '🎴' 
                };
                return `
                    <div class="stat-card">
                        <div class="stat-value">${stats.played}</div>
                        <div class="stat-label">${icons[game]} ${game.charAt(0).toUpperCase() + game.slice(1)} Games</div>
                        <div class="stat-details">
                            <div class="stat-detail-item">
                                <div class="stat-detail-label">W</div>
                                <div class="stat-detail-value positive">${stats.won}</div>
                            </div>
                            <div class="stat-detail-item">
                                <div class="stat-detail-label">L</div>
                                <div class="stat-detail-value negative">${stats.lost}</div>
                            </div>
                        </div>
                    </div>
                `;
            }).join('')}
        </div>
        <div style="margin-top: 40px; text-align: center;">
            <button class="delete-account-btn" onclick="confirmDeleteAccount()">
                Delete Account
            </button>
        </div>
    `;
}

Ranking.getUserRankHTML = function(user) {
    const rank = this.getRank(user.xp);
    const progress = this.getXPProgress(user.xp, rank.index);

    return `
        <div class="rank-badge">${rank.emoji}</div>
        <div class="rank-name">${user.username}</div>
        <div style="color: #666; margin-bottom: 10px;">${rank.name} - Level ${rank.index}</div>
        <div class="xp-bar-container">
            <div class="xp-bar" style="width: ${progress.percentage}%"></div>
            <div class="xp-bar-text">
                ${progress.current} / ${progress.isMaxRank ? 'MAX' : progress.max} XP
            </div>
        </div>
        <div style="color: #667eea; font-weight: bold; margin-top: 10px;">
            Shop Points: ${user.shopPoints}
        </div>
    `;
};

async function loadRanksPage(content) {
    content.innerHTML = `<button class="back-btn" onclick="navigateTo('main')">← Back</button>`;
    
    try {
        const response = await fetch('ranks.html');
        const html = await response.text();
        
        const ranksContainer = document.createElement('div');
        ranksContainer.innerHTML = html;
        content.appendChild(ranksContainer);
        
        const scripts = ranksContainer.querySelectorAll('script');
        scripts.forEach(script => {
            const newScript = document.createElement('script');
            newScript.textContent = script.textContent;
            document.body.appendChild(newScript);
        });
    } catch (error) {
        content.innerHTML += `
            <div class="game-container">
                <h1>Ranks & XP System</h1>
                <div style="text-align: center; color: var(--text-secondary); margin: 40px 0;">
                    <p>Loading ranks information...</p>
                </div>
            </div>
        `;
    }
}

async function loadSettingsPage(content) {
    content.innerHTML = `<button class="back-btn" onclick="navigateTo('main')">← Back</button>`;
    
    try {
        const response = await fetch('settings.html');
        const html = await response.text();
        
        const settingsContainer = document.createElement('div');
        settingsContainer.innerHTML = html;
        content.appendChild(settingsContainer);
        
        const scripts = settingsContainer.querySelectorAll('script');
        scripts.forEach(script => {
            const newScript = document.createElement('script');
            newScript.textContent = script.textContent;
            document.body.appendChild(newScript);
        });
    } catch (error) {
        content.innerHTML += `
            <div class="game-container">
                <h1>Settings</h1>
                <div style="text-align: center; color: var(--text-secondary); margin: 40px 0;">
                    <p>Loading settings...</p>
                </div>
            </div>
        `;
    }
}

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
                        You can use shop points to redeem exclusive profile customization items.
                    </p>
                    <p style="font-size: 16px; color: var(--text-tertiary);">
                        Keep playing and winning games to earn more shop points.
                    </p>
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
                    <p style="font-size: 18px; color: var(--text-secondary);">
                        Create an account to start earning shop points!
                    </p>
                    <button class="btn-primary" style="max-width: 300px; margin: 20px auto;" onclick="navigateTo('login')">
                        Create Account / Login
                    </button>
                </div>
            </div>
        `;
    }
}

async function loadLeaderboardPage(content) {
    const games = ['xp', 'crash', 'dice', 'blackjack', 'plinko', 'mines', 'cases', 'roulette', 'cardpacks'];
    const icons = { 
        xp: '🏆',
        crash: '🚀', 
        dice: '🎲', 
        blackjack: '🃏', 
        plinko: '🎯', 
        mines: '💎',
        cases: '📦',
        roulette: '🛞',
        cardpacks: '🎴'
    };
    const names = {
        xp: 'XP Rankings',
        crash: 'Crash',
        dice: 'Dice',
        blackjack: 'Blackjack',
        plinko: 'Plinko',
        mines: 'Mines',
        cases: 'Cases',
        roulette: 'Roulette',
        cardpacks: 'Card Packs'
    };
    
    content.innerHTML = `
        <button class="back-btn" onclick="navigateTo('main')">← Back</button>
        <div class="leaderboard-container">
            <div class="game-tabs" id="leaderboardTabs"></div>
            <div id="leaderboardContent"></div>
        </div>
    `;
    
    const tabsHTML = games.map(game => `
        <div class="game-tab ${game === 'xp' ? 'active' : ''}" onclick="Leaderboard.showGame('${game}')">
            ${icons[game]} ${names[game]}
        </div>
    `).join('');
    
    document.getElementById('leaderboardTabs').innerHTML = tabsHTML;
    await Leaderboard.showGame('xp');
}

async function loadGamePage(content, game) {
    content.innerHTML = `<button class="back-btn" onclick="navigateTo('main')">← Back to Games</button>`;
    
    try {
        const response = await fetch(`games/${game}.html`);
        const html = await response.text();
        
        const gameContainer = document.createElement('div');
        gameContainer.innerHTML = html;
        content.appendChild(gameContainer);
        
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
                </div>
            </div>
        `;
    }
}

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

function handleUserClick() {
    if (currentUser) {
        navigateTo('user');
    } else {
        navigateTo('login');
    }
}

function handleBalanceClick() {
    if (!currentUser) {
        showGuestLimitModal();
    } else {
        showAddFundsModal();
    }
}

function showGuestLimitModal() {
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.style.display = 'block';
    modal.innerHTML = `
        <div class="modal-content">
            <h2>🔒 Guest Account Limit</h2>
            <p style="color: var(--text-secondary); margin: 20px 0;">
                As a guest, you have a limited balance of $1,000.<br><br>
                Create an account to unlock unlimited features!
            </p>
            <div class="modal-buttons">
                <button class="modal-btn modal-btn-confirm" onclick="this.closest('.modal').remove(); navigateTo('login');">Create Account</button>
                <button class="modal-btn modal-btn-cancel" onclick="this.closest('.modal').remove();">Continue as Guest</button>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
}

let lastDepositTime = 0;
let depositTotal = 0;
const DEPOSIT_RESET_TIME = 3 * 60 * 1000; // 3 minutes
const DEPOSIT_LIMIT_THRESHOLD = 50000;

function showAddFundsModal() {
    if (!currentUser) {
        showGuestLimitModal();
        return;
    }

    const rank = Ranking.getRank(currentUser.xp);
    const maxDeposit = rank.maxDeposit;

    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.style.display = 'block';
    modal.innerHTML = `
        <div class="modal-content">
            <h2>💳 Add Funds</h2>
            
            <div style="background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);; color: white; padding: 15px; border-radius: 10px; margin-bottom: 20px;">
                <div style="font-size: 14px; opacity: 0.9; margin-bottom: 5px;">Your Rank: ${rank.emoji} ${rank.name}</div>
                <div style="font-size: 18px; font-weight: bold;">
                    Max Deposit: ${maxDeposit === Infinity ? 'Unlimited' : '$' + maxDeposit.toLocaleString()}
                </div>
            </div>

            <div class="credit-card">
                <div class="card-chip"></div>
                <div class="card-number">•••• •••• •••• 0247</div>
                <div class="card-info">
                    <div class="card-holder">
                        <div style="font-size: 10px; opacity: 0.8;">CARD HOLDER</div>
                        <div>${currentUser.username}</div>
                    </div>
                    <div class="card-expiry">
                        <div style="font-size: 10px; opacity: 0.8;">EXPIRES</div>
                        <div>12/26</div>
                    </div>
                </div>
            </div>

            <div class="input-group">
                <label>Amount to Add</label>
                <input type="number" id="addFundsAmount" placeholder="Enter amount" min="1" max="${maxDeposit}" step="100" style="text-align: center; font-size: 20px;">
                <small style="color: var(--text-tertiary);">Maximum: $${maxDeposit === Infinity ? '∞' : maxDeposit.toLocaleString()}</small>
            </div>

            <div id="cooldownWarning" style="display: none; background: #fef3c7; color: #92400e; padding: 12px; border-radius: 8px; margin-bottom: 15px; font-size: 14px;">
                ⏳ Cooldown active. Wait <span id="cooldownTimer"></span> before next deposit.
            </div>

            <div class="modal-buttons">
                <button class="modal-btn modal-btn-confirm" onclick="processAddFunds()">Confirm Payment</button>
                <button class="modal-btn modal-btn-cancel" onclick="this.closest('.modal').remove();">Cancel</button>
            </div>

            <div style="margin-top: 15px; text-align: center; font-size: 13px; color: var(--text-tertiary);">
                💡 Rank up to increase your deposit limit!
            </div>
        </div>
    `;
    document.body.appendChild(modal);

    // Check cooldown
    checkDepositCooldown();
}

function checkDepositCooldown() {
    const now = Date.now();
    const timeSinceLastDeposit = now - lastDepositTime;

    if (timeSinceLastDeposit > DEPOSIT_RESET_TIME) {
        depositTotal = 0;
    }

    if (depositTotal >= DEPOSIT_LIMIT_THRESHOLD && timeSinceLastDeposit < DEPOSIT_RESET_TIME) {
        const cooldownWarning = document.getElementById('cooldownWarning');
        const cooldownTimer = document.getElementById('cooldownTimer');
        const confirmBtn = document.querySelector('.modal-btn-confirm');

        cooldownWarning.style.display = 'block';
        confirmBtn.disabled = true;
        confirmBtn.style.opacity = '0.5';

        const timeRemaining = DEPOSIT_RESET_TIME - timeSinceLastDeposit;
        updateCooldownTimer(timeRemaining);
    }
}

function updateCooldownTimer(timeRemaining) {
    const cooldownTimer = document.getElementById('cooldownTimer');
    const minutes = Math.floor(timeRemaining / 60000);
    const seconds = Math.floor((timeRemaining % 60000) / 1000);
    cooldownTimer.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;

    if (timeRemaining > 0) {
        setTimeout(() => updateCooldownTimer(timeRemaining - 1000), 1000);
    } else {
        document.getElementById('cooldownWarning').style.display = 'none';
        document.querySelector('.modal-btn-confirm').disabled = false;
        document.querySelector('.modal-btn-confirm').style.opacity = '1';
        depositTotal = 0;
    }
}

async function processAddFunds() {
    const amount = parseFloat(document.getElementById('addFundsAmount').value);
    const rank = Ranking.getRank(currentUser.xp);
    const maxDeposit = rank.maxDeposit;

    if (isNaN(amount) || amount <= 0) {
        alert('Please enter a valid amount');
        return;
    }

    if (amount > maxDeposit) {
        alert(`Your rank (${rank.name}) allows a maximum deposit of $${maxDeposit.toLocaleString()}. Rank up to increase your limit!`);
        return;
    }

    const now = Date.now();
    const timeSinceLastDeposit = now - lastDepositTime;

    if (timeSinceLastDeposit > DEPOSIT_RESET_TIME) {
        depositTotal = 0;
    }

    if (depositTotal + amount > DEPOSIT_LIMIT_THRESHOLD && timeSinceLastDeposit < DEPOSIT_RESET_TIME) {
        alert('You have reached the deposit limit. Please wait for the cooldown to end.');
        return;
    }

    document.querySelector('.modal').remove();

    try {
        const result = await API.addFunds(amount);
        currentUser.balance = result.balance;
        updateHeaderUI();

        lastDepositTime = now;
        depositTotal += amount;

        const successModal = document.createElement('div');
        successModal.className = 'modal';
        successModal.style.display = 'block';
        successModal.innerHTML = `
            <div class="modal-content success-modal">
                <div class="success-icon">✓</div>
                <h2>Payment Successful!</h2>
                <div class="modal-amount">$${amount.toFixed(2)}</div>
                <p>has been added to your account</p>
            </div>
        `;
        document.body.appendChild(successModal);

        setTimeout(() => successModal.remove(), 2000);
    } catch (error) {
        alert('Failed to add funds: ' + error.message);
    }
}

function showForgotPassword() {
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.style.display = 'block';
    modal.innerHTML = `
        <div class="modal-content">
            <h2>🔐 Reset Password</h2>
            <p style="color: var(--text-secondary); margin: 20px 0;">
                Enter your username. We'll send a 6-digit code to your registered email.
            </p>
            <div class="input-group">
                <label>Username</label>
                <input type="text" id="resetUsername" placeholder="Enter your username">
            </div>
            <div class="error-message" id="resetError"></div>
            <div class="modal-buttons">
                <button class="modal-btn modal-btn-confirm" onclick="requestPasswordReset()">Send Reset Code</button>
                <button class="modal-btn modal-btn-cancel" onclick="this.closest('.modal').remove();">Cancel</button>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
}

async function requestPasswordReset() {
    const username = document.getElementById('resetUsername').value.trim();
    const errorEl = document.getElementById('resetError');

    if (!username) {
        errorEl.textContent = 'Please enter your username';
        return;
    }

    try {
        const result = await API.forgotPassword(username);
        document.querySelector('.modal').remove();
        
        // Show code input modal
        showResetCodeModal(result.message);
    } catch (error) {
        errorEl.textContent = error.message;
    }
}

function showResetCodeModal(message) {
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.style.display = 'block';
    modal.innerHTML = `
        <div class="modal-content">
            <h2>📧 Enter Reset Code</h2>
            <p style="color: var(--text-secondary); margin: 20px 0; font-size: 14px;">
                ${message}
            </p>
            <div class="input-group">
                <label>6-Digit Reset Code</label>
                <input type="text" id="resetToken" placeholder="000000" maxlength="6" 
                       style="font-size: 24px; text-align: center; letter-spacing: 5px;">
            </div>
            <div class="input-group">
                <label>New Password</label>
                <input type="password" id="newPassword" placeholder="Enter new password">
            </div>
            <div class="input-group">
                <label>Confirm New Password</label>
                <input type="password" id="confirmPassword" placeholder="Confirm new password">
            </div>
            <div class="error-message" id="resetPassError"></div>
            <div class="modal-buttons">
                <button class="modal-btn modal-btn-confirm" onclick="confirmPasswordReset()">Reset Password</button>
                <button class="modal-btn modal-btn-cancel" onclick="this.closest('.modal').remove();">Cancel</button>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
}

async function confirmPasswordReset() {
    const token = document.getElementById('resetToken').value.trim();
    const newPassword = document.getElementById('newPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    const errorEl = document.getElementById('resetPassError');

    if (!token || token.length !== 6) {
        errorEl.textContent = 'Please enter the 6-digit code';
        return;
    }

    if (!newPassword || newPassword.length < 6) {
        errorEl.textContent = 'Password must be at least 6 characters';
        return;
    }

    if (newPassword !== confirmPassword) {
        errorEl.textContent = 'Passwords do not match';
        return;
    }

    try {
        await API.resetPassword(token, newPassword);
        document.querySelector('.modal').remove();
        
        const successModal = document.createElement('div');
        successModal.className = 'modal';
        successModal.style.display = 'block';
        successModal.innerHTML = `
            <div class="modal-content success-modal">
                <div class="success-icon">✓</div>
                <h2>Password Reset Successful!</h2>
                <p>You can now login with your new password</p>
                <button class="modal-btn modal-btn-confirm" onclick="this.closest('.modal').remove(); navigateTo('login');">
                    Go to Login
                </button>
            </div>
        `;
        document.body.appendChild(successModal);
    } catch (error) {
        errorEl.textContent = error.message;
    }
}

function confirmDeleteAccount() {
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.style.display = 'block';
    modal.innerHTML = `
        <div class="modal-content" style="border: 3px solid #ef4444;">
            <h2 style="color: #ef4444;">⚠️ Delete Account</h2>
            <p style="color: var(--text-secondary); margin: 20px 0;">
                Are you sure? All your data will be permanently deleted.
            </p>
            <div class="modal-buttons">
                <button class="modal-btn" style="background: #ef4444; color: white;" onclick="deleteAccount()">Yes, Delete</button>
                <button class="modal-btn modal-btn-confirm" onclick="this.closest('.modal').remove();">Cancel</button>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
}

async function deleteAccount() {
    try {
        await API.deleteAccount();
        document.querySelector('.modal').remove();
        
        currentUser = null;
        updateHeaderUI();
        navigateTo('main');
        
        alert('Account deleted successfully');
    } catch (error) {
        alert('Failed to delete account: ' + error.message);
    }
}

async function logout() {
    Auth.logout();
    currentUser = null;
    guestBalance = 1000;
    localStorage.setItem('guestBalance', guestBalance);
    updateHeaderUI();
    navigateTo('main');
}

async function handleAuth() {
    await Auth.handleAuth(async (user) => {
        currentUser = user;
        localStorage.removeItem('guestBalance');
        updateHeaderUI();
        navigateTo('main');
    });
}

async function updateBalance(amount) {
    if (currentUser) {
        try {
            const result = await API.updateBalance(amount);
            currentUser.balance = result.balance;
            updateHeaderUI();
        } catch (error) {
            console.error('Failed to update balance:', error);
        }
    } else {
        guestBalance += amount;
        if (guestBalance < 0) guestBalance = 0;
        localStorage.setItem('guestBalance', guestBalance);
        updateHeaderUI();
    }
}

function getCurrentBalance() {
    return currentUser ? currentUser.balance : guestBalance;
}

async function updateGameStats(game, won, betAmount, winAmount) {
    if (!currentUser) return;

    try {
        await API.updateGameStats(game, won, betAmount, winAmount);

        if (won) {
            const oldRank = Ranking.getRank(currentUser.xp);
            const winMultiplier = winAmount / betAmount;
            
            // Award XP based on win
            let totalXP = 10; // Base XP
            if (winMultiplier > 10) totalXP += 10;
            else if (winMultiplier > 3) totalXP += 5;

            currentUser.xp += totalXP;
            const newRank = Ranking.getRank(currentUser.xp);

            if (newRank.index > oldRank.index) {
                await API.updateXP(totalXP, newRank.shopPoints);
                currentUser.shopPoints += newRank.shopPoints;
                showRankUpNotification(newRank);
            } else {
                await API.updateXP(totalXP, 0);
            }
        }

        currentUser = await API.getProfile();
        updateHeaderUI();
    } catch (error) {
        console.error('Failed to update game stats:', error);
    }
}

function showRankUpNotification(newRank) {
    alert(`🎉 Rank Up! You are now ${newRank.name} ${newRank.emoji}!\nYou earned ${newRank.shopPoints} shop points!`);
}

const Leaderboard = {
    currentGame: 'xp',
    
    async showGame(game) {
        this.currentGame = game;
        
        document.querySelectorAll('.game-tab').forEach(tab => {
            tab.classList.remove('active');
        });
        event.target.classList.add('active');
        
        try {
            let leaderboard;
            if (game === 'xp') {
                leaderboard = await API.getXPLeaderboard();
            } else {
                leaderboard = await API.getLeaderboard(game);
            }
            
            const icons = { 
                xp: '🏆',
                crash: '🚀', 
                dice: '🎲', 
                blackjack: '🃏', 
                plinko: '🎯', 
                mines: '💎',
                cases: '📦',
                roulette: '🛞',
                cardpacks: '🎴'
            };
            
            const names = {
                xp: 'XP Rankings',
                crash: 'Crash',
                dice: 'Dice',
                blackjack: 'Blackjack',
                plinko: 'Plinko',
                mines: 'Mines',
                cases: 'Cases',
                roulette: 'Roulette',
                cardpacks: 'Card Packs'
            };
            
            let html = `<h2>${icons[game]} ${names[game]} Leaderboard</h2>`;
            
            if (leaderboard.length === 0) {
                html += '<div style="text-align: center; color: var(--text-secondary); padding: 40px;">No data yet</div>';
            } else {
                if (game === 'xp') {
                    leaderboard.forEach((user, index) => {
                        const isCurrentUser = currentUser && user.username === currentUser.username;
                        html += `
                            <div class="leaderboard-item ${isCurrentUser ? 'highlight' : ''}">
                                <div class="leaderboard-rank">#${index + 1}</div>
                                <div class="leaderboard-user">
                                    ${user.rankEmoji} ${user.username}
                                    <small style="color: var(--text-tertiary); margin-left: 8px;">${user.rank}</small>
                                </div>
                                <div class="leaderboard-wins" style="color: #667eea;">${user.xp} XP</div>
                            </div>
                        `;
                    });
                } else {
                    const isProfitBased = game === 'cases' || game === 'cardpacks';
                    leaderboard.forEach((user, index) => {
                        const isCurrentUser = currentUser && user.username === currentUser.username;
                        const displayValue = isProfitBased 
                            ? `$${parseFloat(user.total_profit).toFixed(0)} ${parseFloat(user.total_profit) >= 0 ? 'profit' : 'loss'}`
                            : `${user.won} wins`;
                        
                        const valueColor = isProfitBased 
                            ? (parseFloat(user.total_profit) >= 0 ? '#22c55e' : '#ef4444')
                            : '#22c55e';
                        
                        html += `
                            <div class="leaderboard-item ${isCurrentUser ? 'highlight' : ''}">
                                <div class="leaderboard-rank">#${index + 1}</div>
                                <div class="leaderboard-user">${user.username}</div>
                                <div class="leaderboard-wins" style="color: ${valueColor};">${displayValue}</div>
                            </div>
                        `;
                    });
                }
            }
            
            document.getElementById('leaderboardContent').innerHTML = html;
        } catch (error) {
            document.getElementById('leaderboardContent').innerHTML = 
                '<div style="text-align: center; color: #ef4444; padding: 40px;">Failed to load leaderboard</div>';
        }
    }
};

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

async function loadCasesPage(content) {
    content.innerHTML = `<button class="back-btn" onclick="navigateTo('main')">← Back to Games</button>`;
    
    try {
        const response = await fetch('games/cases.html');
        const html = await response.text();
        
        const gameContainer = document.createElement('div');
        gameContainer.innerHTML = html;
        content.appendChild(gameContainer);
        
        const scripts = gameContainer.querySelectorAll('script');
        scripts.forEach(script => {
            const newScript = document.createElement('script');
            newScript.textContent = script.textContent;
            document.body.appendChild(newScript);
        });
    } catch (error) {
        content.innerHTML += `<div class="game-container"><h1>Cases game coming soon!</h1></div>`;
    }
}

async function loadRoulettePage(content) {
    content.innerHTML = `<button class="back-btn" onclick="navigateTo('main')">← Back to Games</button>`;
    
    try {
        const response = await fetch('games/roulette.html');
        const html = await response.text();
        
        const gameContainer = document.createElement('div');
        gameContainer.innerHTML = html;
        content.appendChild(gameContainer);
        
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
                </div>
            </div>
        `;
    }
}

async function loadCardPacksPage(content) {
    content.innerHTML = `<button class="back-btn" onclick="navigateTo('main')">← Back to Games</button>`;
    
    try {
        const response = await fetch('games/cardpacks.html');
        const html = await response.text();
        
        const gameContainer = document.createElement('div');
        gameContainer.innerHTML = html;
        content.appendChild(gameContainer);
        
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
                </div>
            </div>
        `;
    }
}