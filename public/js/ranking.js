/**
 * ranking.js - XP and Ranking System
 * XP is now awarded based on WINS, not bet amounts
 */

const Ranking = {
    RANKS: [
        { name: 'No Rank', emoji: '⚪', minXP: 0, shopPoints: 0, maxDeposit: 10000 },
        { name: 'Bronze', emoji: '🥉', minXP: 50, shopPoints: 50, maxDeposit: 15000 },
        { name: 'Silver', emoji: '🥈', minXP: 100, shopPoints: 100, maxDeposit: 20000 },
        { name: 'Gold', emoji: '🥇', minXP: 200, shopPoints: 200, maxDeposit: 30000 },
        { name: 'Platinum', emoji: '💎', minXP: 350, shopPoints: 350, maxDeposit: 50000 },
        { name: 'Diamond', emoji: '💠', minXP: 600, shopPoints: 500, maxDeposit: 75000 },
        { name: 'Ruby', emoji: '💜', minXP: 1000, shopPoints: 1000, maxDeposit: 100000 },
        { name: 'Master', emoji: '🎖️', minXP: 1500, shopPoints: 1750, maxDeposit: 150000 },
        { name: 'Grandmaster', emoji: '👑', minXP: 2500, shopPoints: 3000, maxDeposit: 250000 },
        { name: 'Legend', emoji: '🌟', minXP: 4000, shopPoints: 5000, maxDeposit: 500000 },
        { name: 'Mythic', emoji: '🦄', minXP: 6000, shopPoints: 7500, maxDeposit: 1000000 },
        { name: 'Immortal', emoji: '🔱', minXP: 9000, shopPoints: 10000, maxDeposit: 2500000 },
        { name: 'Eternal', emoji: '🛡️', minXP: 15000, shopPoints: 20000, maxDeposit: Infinity }
    ],

    /**
     * Get rank information for a given XP amount
     */
    getRank(xp) {
        for (let i = this.RANKS.length - 1; i >= 0; i--) {
            if (xp >= this.RANKS[i].minXP) {
                return { ...this.RANKS[i], index: i };
            }
        }
        return { ...this.RANKS[0], index: 0 };
    },

    getMaxDeposit(xp) {
        const rank = this.getRank(xp);
        return rank.maxDeposit;
    },

    /**
     * Get next rank information
     */
    getNextRank(currentRankIndex) {
        if (currentRankIndex < this.RANKS.length - 1) {
            return this.RANKS[currentRankIndex + 1];
        }
        return null;
    },

    /**
     * Calculate XP progress to next rank
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
     * NEW: XP is based on wins, not money
     * Base XP: 10 XP per win
     * Bonus XP: +5 XP if multiplier > 3x (big win)
     * Bonus XP: +10 XP if multiplier > 10x (huge win)
     */
    awardXP(user, betAmount, winAmount) {
        const oldRank = this.getRank(user.xp);
        
        // Calculate XP based on wins
        let totalXP = 10; // Base XP for winning
        
        // Bonus XP for big wins
        const winMultiplier = winAmount / betAmount;
        if (winMultiplier > 10) {
            totalXP += 10; // Huge win bonus
        } else if (winMultiplier > 3) {
            totalXP += 5; // Big win bonus
        }

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
     */
    getRankHTML(user) {
        const rank = this.getRank(user.xp);
        const progress = this.getXPProgress(user.xp, rank.index);

        return `
            <div class="rank-badge">${rank.emoji}</div>
            <div class="rank-name">${rank.name}</div>
            <div style="color: #666; margin-bottom: 10px;">Level ${rank.index}</div>
            <div class="xp-bar-container">
                <div class="xp-bar" style="width: ${progress.percentage}%"></div>
                <div class ="xp-bar-text">
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

if (typeof module !== 'undefined' && module.exports) {
    module.exports = Ranking;
}