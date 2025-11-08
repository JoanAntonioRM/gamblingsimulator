/**
 * ranking.js - XP and Ranking System
 * Manages user levels, XP, and shop points
 */

const Ranking = {
    // Rank definitions
    RANKS: [
        { name: 'No Rank', emoji: '⚪', minXP: 0, shopPoints: 0 },
        { name: 'Bronze', emoji: '🥉', minXP: 100, shopPoints: 50 },
        { name: 'Silver', emoji: '🥈', minXP: 300, shopPoints: 100 },
        { name: 'Gold', emoji: '🥇', minXP: 600, shopPoints: 200 },
        { name: 'Platinum', emoji: '💎', minXP: 1000, shopPoints: 350 },
        { name: 'Diamond', emoji: '💠', minXP: 1500, shopPoints: 500 },
        { name: 'Ruby', emoji: '💜', minXP: 2500, shopPoints: 1000 }
    ],

    /**
     * Get rank information for a given XP amount
     * @param {number} xp - Current XP
     * @returns {Object} Rank object with index
     */
    getRank(xp) {
        for (let i = this.RANKS.length - 1; i >= 0; i--) {
            if (xp >= this.RANKS[i].minXP) {
                return { ...this.RANKS[i], index: i };
            }
        }
        return { ...this.RANKS[0], index: 0 };
    },

    /**
     * Get next rank information
     * @param {number} currentRankIndex - Current rank index
     * @returns {Object|null} Next rank object or null if max rank
     */
    getNextRank(currentRankIndex) {
        if (currentRankIndex < this.RANKS.length - 1) {
            return this.RANKS[currentRankIndex + 1];
        }
        return null;
    },

    /**
     * Calculate XP progress to next rank
     * @param {number} xp - Current XP
     * @param {number} rankIndex - Current rank index
     * @returns {Object} Progress information
     */
    getXPProgress(xp, rankIndex) {
        const currentRank = this.RANKS[rankIndex];
        const nextRank = this.getNextRank(rankIndex);

        if (!nextRank) {
            return {
                current: xp,
                max: xp,
                percentage: 100,
                isMaxRank: true
            };
        }

        const xpInCurrentRank = xp - currentRank.minXP;
        const xpNeededForNextRank = nextRank.minXP - currentRank.minXP;
        const percentage = (xpInCurrentRank / xpNeededForNextRank) * 100;

        return {
            current: xp,
            max: nextRank.minXP,
            percentage: Math.min(percentage, 100),
            xpInCurrentRank,
            xpNeededForNextRank,
            isMaxRank: false
        };
    },

    /**
     * Award XP for winning a game
     * @param {Object} user - User object
     * @param {number} betAmount - Amount that was bet
     * @param {number} winAmount - Amount won
     * @returns {Object} XP gained and rank up info
     */
    awardXP(user, betAmount, winAmount) {
        const oldRank = this.getRank(user.xp);
        
        // Calculate XP based on bet amount (1 XP per $10 bet)
        // Bonus XP for big wins
        const baseXP = Math.floor(betAmount / 10);
        const winMultiplier = winAmount / betAmount;
        const bonusXP = winMultiplier > 2 ? Math.floor(baseXP * 0.5) : 0;
        const totalXP = baseXP + bonusXP;

        user.xp += totalXP;

        const newRank = this.getRank(user.xp);
        const rankedUp = newRank.index > oldRank.index;

        // Award shop points for ranking up
        if (rankedUp) {
            user.shopPoints += newRank.shopPoints;
        }

        return {
            xpGained: totalXP,
            rankedUp,
            oldRank,
            newRank
        };
    },

    /**
     * Generate rank display HTML
     * @param {Object} user - User object
     * @returns {string} HTML string for rank display
     */
    getRankHTML(user) {
        const rank = this.getRank(user.xp);
        const progress = this.getXPProgress(user.xp, rank.index);

        return `
            <div class="rank-badge">${rank.emoji}</div>
            <div class="rank-name">${rank.name}</div>
            <div style="color: #666; margin-bottom: 10px;">Level ${rank.index}</div>
            <div class="xp-bar-container">
                <div class="xp-bar" style="width: ${progress.percentage}%">
                    ${progress.current} / ${progress.isMaxRank ? 'MAX' : progress.max} XP
                </div>
            </div>
            <div style="color: #667eea; font-weight: bold; margin-top: 10px;">
                Shop Points: ${user.shopPoints}
            </div>
        `;
    },

    /**
     * Get rank display with username
     * @param {Object} user - User object
     * @returns {string} HTML string for user rank display
     */
    getUserRankHTML(user) {
        const rank = this.getRank(user.xp);
        const progress = this.getXPProgress(user.xp, rank.index);

        return `
            <div class="rank-badge">${rank.emoji}</div>
            <div class="rank-name">${user.username}</div>
            <div style="color: #666; margin-bottom: 10px;">${rank.name} - Level ${rank.index}</div>
            <div class="xp-bar-container">
                <div class="xp-bar" style="width: ${progress.percentage}%">
                    ${progress.current} / ${progress.isMaxRank ? 'MAX' : progress.max} XP
                </div>
            </div>
            <div style="color: #667eea; font-weight: bold; margin-top: 10px;">
                Shop Points: ${user.shopPoints}
            </div>
        `;
    }
};

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Ranking;
}