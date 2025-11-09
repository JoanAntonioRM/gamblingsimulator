/**
 * api.js - Frontend API Client with Password Reset
 */

const API = {
    // Update this to your backend URL
    BASE_URL: 'https://2fzd4f73n1.execute-api.us-east-2.amazonaws.com/api/health',
    
    getToken() {
        return localStorage.getItem('authToken');
    },
    
    saveToken(token) {
        localStorage.setItem('authToken', token);
    },
    
    clearToken() {
        localStorage.removeItem('authToken');
    },
    
    async request(endpoint, options = {}) {
        const token = this.getToken();
        const headers = {
            'Content-Type': 'application/json',
            ...options.headers
        };
        
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }
        
        try {
            const response = await fetch(`${this.BASE_URL}${endpoint}`, {
                ...options,
                headers
            });
            
            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.error || 'Request failed');
            }
            
            return data;
        } catch (error) {
            console.error('API Error:', error);
            throw error;
        }
    },
    
    // ========== AUTH ENDPOINTS ==========
    
    async register(username, password, email = null) {
        const data = await this.request('/auth/register', {
            method: 'POST',
            body: JSON.stringify({ username, password, email })
        });
        
        if (data.token) {
            this.saveToken(data.token);
        }
        
        return data;
    },
    
    async login(username, password) {
        const data = await this.request('/auth/login', {
            method: 'POST',
            body: JSON.stringify({ username, password })
        });
        
        if (data.token) {
            this.saveToken(data.token);
        }
        
        return data;
    },
    
    async forgotPassword(username) {
        return await this.request('/auth/forgot-password', {
            method: 'POST',
            body: JSON.stringify({ username })
        });
    },
    
    async resetPassword(resetToken, newPassword) {
        return await this.request('/auth/reset-password', {
            method: 'POST',
            body: JSON.stringify({ resetToken, newPassword })
        });
    },
    
    logout() {
        this.clearToken();
    },
    
    // ========== USER ENDPOINTS ==========
    
    async getProfile() {
        return await this.request('/user/profile');
    },
    
    async updateBalance(amount) {
        return await this.request('/user/balance', {
            method: 'POST',
            body: JSON.stringify({ amount })
        });
    },
    
    async addFunds(amount) {
        return await this.request('/user/add-funds', {
            method: 'POST',
            body: JSON.stringify({ amount })
        });
    },
    
    async updateXP(xpGained, shopPointsGained = 0) {
        return await this.request('/user/xp', {
            method: 'POST',
            body: JSON.stringify({ xpGained, shopPointsGained })
        });
    },
    
    async deleteAccount() {
        return await this.request('/user/account', {
            method: 'DELETE'
        });
    },
    
    // ========== GAME ENDPOINTS ==========
    
    async updateGameStats(game, won, betAmount, winAmount) {
        return await this.request('/game/stats', {
            method: 'POST',
            body: JSON.stringify({ game, won, betAmount, winAmount })
        });
    },
    
    async getLeaderboard(game) {
        return await this.request(`/leaderboard/${game}`);
    },
    
    // ========== HEALTH CHECK ==========
    
    async healthCheck() {
        try {
            const response = await fetch(`${this.BASE_URL}/health`);
            return response.ok;
        } catch {
            return false;
        }
    }
};

if (typeof module !== 'undefined' && module.exports) {
    module.exports = API;
}