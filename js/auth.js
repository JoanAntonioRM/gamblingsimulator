/**
 * auth.js - Authentication System
 * Handles user login, registration, and session management
 */

const Auth = {
    isRegisterMode: false,

    /**
     * Handle authentication (login or register)
     * @param {Function} onSuccess - Callback function on successful auth
     */
    handleAuth(onSuccess) {
        const username = document.getElementById('authUsername').value.trim();
        const password = document.getElementById('authPassword').value;
        const errorEl = document.getElementById('authError');

        // Clear previous errors
        errorEl.textContent = '';

        // Validation
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

        if (this.isRegisterMode) {
            this.register(username, password, errorEl, onSuccess);
        } else {
            this.login(username, password, errorEl, onSuccess);
        }
    },

    /**
     * Register new user
     */
    register(username, password, errorEl, onSuccess) {
        // Check if username already exists
        if (Storage.usernameExists(username)) {
            errorEl.textContent = 'Username already taken';
            return;
        }

        // Create new user
        const newUser = Storage.createUser(username, password);
        Storage.saveCurrentUser(newUser);

        // Clear form
        this.clearForm();

        // Call success callback
        if (onSuccess) onSuccess(newUser);
    },

    /**
     * Login existing user
     */
    login(username, password, errorEl, onSuccess) {
        // Check if user exists
        const user = Storage.getUser(username);
        if (!user) {
            errorEl.textContent = 'User not found';
            return;
        }

        // Check password
        if (user.password !== password) {
            errorEl.textContent = 'Incorrect password';
            return;
        }

        // Save as current user
        Storage.saveCurrentUser(user);

        // Clear form
        this.clearForm();

        // Call success callback
        if (onSuccess) onSuccess(user);
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
     * Clear authentication form
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
     * Validate username format
     * @param {string} username - Username to validate
     * @returns {Object} {valid: boolean, error: string}
     */
    validateUsername(username) {
        if (username.length < 3) {
            return { valid: false, error: 'Username must be at least 3 characters' };
        }
        if (username.length > 20) {
            return { valid: false, error: 'Username must be less than 20 characters' };
        }
        if (!/^[a-zA-Z0-9_]+$/.test(username)) {
            return { valid: false, error: 'Username can only contain letters, numbers, and underscores' };
        }
        return { valid: true, error: null };
    },

    /**
     * Validate password format
     * @param {string} password - Password to validate
     * @returns {Object} {valid: boolean, error: string}
     */
    validatePassword(password) {
        if (password.length < 6) {
            return { valid: false, error: 'Password must be at least 6 characters' };
        }
        if (password.length > 50) {
            return { valid: false, error: 'Password must be less than 50 characters' };
        }
        return { valid: true, error: null };
    }
};

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Auth;
}