/**
 * games.js - Game Implementations
 * This file will contain the logic for all casino games
 */

const Games = {
    /**
     * Crash Game
     */
    Crash: {
        currentBet: 0,
        multiplier: 1.00,
        crashPoint: 0,
        isRunning: false,
        hasCashedOut: false,
        animationInterval: null,

        init() {
            // Initialize crash game
            console.log('Crash game initialized');
        },

        placeBet(amount) {
            // Place bet logic
            console.log('Bet placed:', amount);
        },

        start() {
            // Start game logic
            console.log('Game started');
        },

        cashOut() {
            // Cash out logic
            console.log('Cashed out');
        }
    },

    /**
     * Dice Game
     */
    Dice: {
        currentBet: 0,
        targetNumber: 50,
        rollOver: true,

        init() {
            console.log('Dice game initialized');
        },

        placeBet(amount) {
            console.log('Dice bet placed:', amount);
        },

        roll() {
            console.log('Rolling dice');
        }
    },

    /**
     * Blackjack Game
     */
    Blackjack: {
        currentBet: 0,
        playerHand: [],
        dealerHand: [],
        deck: [],

        init() {
            console.log('Blackjack game initialized');
        },

        placeBet(amount) {
            console.log('Blackjack bet placed:', amount);
        },

        deal() {
            console.log('Dealing cards');
        },

        hit() {
            console.log('Player hits');
        },

        stand() {
            console.log('Player stands');
        }
    },

    /**
     * Poker Game
     */
    Poker: {
        currentBet: 0,
        playerHand: [],
        communityCards: [],
        deck: [],

        init() {
            console.log('Poker game initialized');
        },

        placeBet(amount) {
            console.log('Poker bet placed:', amount);
        },

        deal() {
            console.log('Dealing poker cards');
        },

        fold() {
            console.log('Player folds');
        },

        call() {
            console.log('Player calls');
        },

        raise(amount) {
            console.log('Player raises:', amount);
        }
    }
};

/**
 * Helper function to update game stats after game ends
 * @param {string} game - Game name (crash, dice, blackjack, poker)
 * @param {boolean} won - Whether player won
 * @param {number} betAmount - Amount bet
 * @param {number} winAmount - Amount won (0 if lost)
 */
function updateGameStats(game, won, betAmount, winAmount) {
    if (!currentUser) return;

    // Update storage
    Storage.updateGameStats(currentUser, game, won, betAmount, winAmount);

    // Award XP if won
    if (won) {
        const xpResult = Ranking.awardXP(currentUser, betAmount, winAmount);
        
        // Show rank up notification if applicable
        if (xpResult.rankedUp) {
            showRankUpNotification(xpResult.newRank);
        }
    }

    // Update UI
    updateHeaderUI();
}

/**
 * Show rank up notification
 * @param {Object} newRank - New rank object
 */
function showRankUpNotification(newRank) {
    // Simple alert for now - can be enhanced with a modal
    alert(`🎉 Rank Up! You are now ${newRank.name} ${newRank.emoji}!\nYou earned ${newRank.shopPoints} shop points!`);
}

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Games;
}