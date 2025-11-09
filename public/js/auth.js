/**
 * auth.js - Updated Authentication System with Password Reset
 */

const Auth = {
    isRegisterMode: false,

    async handleAuth(onSuccess) {
        const username = document.getElementById('authUsername').value.trim();
        const password = document.getElementById('authPassword').value;
        const email = this.isRegisterMode ? document.getElementById('authEmail').value.trim() : null;
        const errorEl = document.getElementById('authError');

        errorEl.textContent = '';

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
                result = await API.register(username, password, email);
            } else {
                result = await API.login(username, password);
            }

            if (result.success) {
                const userProfile = await API.getProfile();
                this.clearForm();
                if (onSuccess) onSuccess(userProfile);
            }
        } catch (error) {
            errorEl.textContent = error.message || 'Authentication failed';
        }
    },

    toggleMode() {
        this.isRegisterMode = !this.isRegisterMode;
        
        const titleEl = document.getElementById('authTitle');
        const switchTextEl = document.getElementById('switchText');
        const switchLinkEl = document.querySelector('.switch-mode a');
        const errorEl = document.getElementById('authError');
        const emailGroup = document.getElementById('emailGroup');
        const forgotPasswordLink = document.getElementById('forgotPasswordLink');

        if (this.isRegisterMode) {
            titleEl.textContent = 'Register';
            switchTextEl.textContent = 'Already have an account? ';
            switchLinkEl.textContent = 'Login';
            emailGroup.classList.remove('hidden');
            forgotPasswordLink.classList.add('hidden');
        } else {
            titleEl.textContent = 'Login';
            switchTextEl.textContent = "Don't have an account? ";
            switchLinkEl.textContent = 'Register';
            emailGroup.classList.add('hidden');
            forgotPasswordLink.classList.remove('hidden');
        }

        errorEl.textContent = '';
        this.clearForm();
    },

    clearForm() {
        const usernameEl = document.getElementById('authUsername');
        const passwordEl = document.getElementById('authPassword');
        const emailEl = document.getElementById('authEmail');
        const errorEl = document.getElementById('authError');

        if (usernameEl) usernameEl.value = '';
        if (passwordEl) passwordEl.value = '';
        if (emailEl) emailEl.value = '';
        if (errorEl) errorEl.textContent = '';
    },

    logout() {
        API.logout();
    }
};

if (typeof module !== 'undefined' && module.exports) {
    module.exports = Auth;
}