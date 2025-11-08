/**
 * auth.js - Updated Authentication System
 * Now connects to backend API for secure authentication
 */

const Auth = {
    isRegisterMode: false,

    /**
     * Handle authentication (login or register)
     */
    async handleAuth(onSuccess) {
        const username = document.getElementById('authUsername').value.trim();
        const password = document.getElementById('authPassword').value;
        const errorEl = document.getElementById('authError');

        errorEl.textContent = '';

        // Client-side validation
        if (!username || !password) {
            errorEl.textContent = 'Please fill in all fields';
            return;
        }

        if (username.length < 3) {
            errorEl.textContent = 'Username must be at least 3 characters';
            return;
        }

        if (password.length < 6) {
            errorEl.textContent = 'Password must be at least 6 characters';
            return;
        }

        try {
            let result;
            
            if (this.isRegisterMode) {
                result = await API.register(username, password);
            } else {
                result = await API.login(username, password);
            }

            if (result.success) {
                // Get full user profile
                const userProfile = await API.getProfile();
                
                this.clearForm();
                
                if (onSuccess) onSuccess(userProfile);
            }
        } catch (error) {
            errorEl.textContent = error.message || 'Authentication failed';
        }
    },

    /**
     * Toggle between login and register mode
     */
    toggleMode() {
        this.isRegisterMode = !this.isRegisterMode;
        
        const titleEl = document.getElementById('authTitle');
        const switchTextEl = document.getElementById('switchText');
        const switchLinkEl = document.querySelector('.switch-mode a');
        const errorEl = document.getElementById('authError');

        if (this.isRegisterMode) {
            titleEl.textContent = 'Register';
            switchTextEl.textContent = 'Already have an account? ';
            switchLinkEl.textContent = 'Login';
        } else {
            titleEl.textContent = 'Login';
            switchTextEl.textContent = "Don't have an account? ";
            switchLinkEl.textContent = 'Register';
        }

        errorEl.textContent = '';
        this.clearForm();
    },

    /**
     * Clear form
     */
    clearForm() {
        const usernameEl = document.getElementById('authUsername');
        const passwordEl = document.getElementById('authPassword');
        const errorEl = document.getElementById('authError');

        if (usernameEl) usernameEl.value = '';
        if (passwordEl) passwordEl.value = '';
        if (errorEl) errorEl.textContent = '';
    },

    /**
     * Logout user
     */
    logout() {
        API.logout();
    }
};

if (typeof module !== 'undefined' && module.exports) {
    module.exports = Auth;
}