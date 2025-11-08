/**
 * api.js - Frontend API Client
 * Handles all communication with the backend server
 */

const API = {
    // IMPORTANT: Change this to your Railway backend URL after deployment
    BASE_URL: 'https://gamblingsimulator-production.up.railway.app/api',
    
    // Get auth token from localStorage
    getToken() {
        return localStorage.getItem('authToken');
    },
    
    // Save auth token
    saveToken(token) {
        localStorage.setItem('authToken', token);
    },
    
    // Clear auth token
    clearToken() {
        localStorage.removeItem('authToken');
    },
    
    // Make authenticated request
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
    
    async register(username, password) {
        const data = await this.request('/auth/register', {
            method: 'POST',
            body: JSON.stringify({ username, password })
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

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = API;
}