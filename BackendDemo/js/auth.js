// Authentication Page Controller
// Handles sign in, sign up, and social authentication

import { AuthService } from './services/auth.service.js';
import { UIUtils } from './utils/ui.utils.js';
import { Validators } from './utils/validators.js';

class AuthController {
    constructor() {
        this.init();
    }

    init() {
        // Check if user is already logged in
        AuthService.onAuthStateChanged((user) => {
            if (user) {
                // Redirect to dashboard
                window.location.href = 'dashboard.html';
            }
        });

        this.setupEventListeners();
    }

    setupEventListeners() {
        // Tab switching
        document.querySelectorAll('.auth-tab').forEach(tab => {
            tab.addEventListener('click', (e) => this.switchTab(e.target.dataset.tab));
        });

        // Password toggle
        document.querySelectorAll('.password-toggle-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.togglePassword(e.target));
        });

        // Sign in form
        const signinForm = document.getElementById('signin-form');
        signinForm.addEventListener('submit', (e) => this.handleSignIn(e));

        // Sign up form
        const signupForm = document.getElementById('signup-form');
        signupForm.addEventListener('submit', (e) => this.handleSignUp(e));

        // Social sign in buttons
        document.getElementById('google-signin').addEventListener('click', () => this.handleGoogleSignIn());
        document.getElementById('google-signup').addEventListener('click', () => this.handleGoogleSignIn());
        document.getElementById('github-signin').addEventListener('click', () => this.handleGitHubSignIn());
        document.getElementById('github-signup').addEventListener('click', () => this.handleGitHubSignIn());

        // Forgot password
        document.getElementById('forgot-password-link').addEventListener('click', () => this.handleForgotPassword());
    }

    switchTab(tab) {
        // Update tab buttons
        document.querySelectorAll('.auth-tab').forEach(t => t.classList.remove('active'));
        document.querySelector(`[data-tab="${tab}"]`).classList.add('active');

        // Update forms
        document.querySelectorAll('.auth-form').forEach(f => f.classList.remove('active'));
        document.getElementById(`${tab}-form`).classList.add('active');

        // Clear errors
        this.clearErrors();
    }

    togglePassword(button) {
        const targetId = button.dataset.target;
        const input = document.getElementById(targetId);

        if (input.type === 'password') {
            input.type = 'text';
            button.textContent = '🙈';
        } else {
            input.type = 'password';
            button.textContent = '👁️';
        }
    }

    async handleSignIn(e) {
        e.preventDefault();

        const form = e.target;
        const email = form.email.value.trim();
        const password = form.password.value;

        // Validate
        if (!Validators.isValidEmail(email)) {
            this.showError('signin', 'Please enter a valid email address');
            return;
        }

        if (!Validators.isValidPassword(password)) {
            this.showError('signin', 'Password must be at least 6 characters');
            return;
        }

        // Clear errors
        this.clearErrors();

        // Show loading
        const submitBtn = form.querySelector('button[type="submit"]');
        UIUtils.setButtonLoading(submitBtn, true, 'Signing in...');

        try {
            await AuthService.signInWithEmail(email, password);
            UIUtils.showSuccess('Signed in successfully!');
            // Redirect handled by auth state listener
        } catch (error) {
            this.showError('signin', error.message);
            UIUtils.setButtonLoading(submitBtn, false);
        }
    }

    async handleSignUp(e) {
        e.preventDefault();

        const form = e.target;
        const name = form.name.value.trim();
        const email = form.email.value.trim();
        const password = form.password.value;
        const confirmPassword = form.confirmPassword.value;

        // Validate
        if (!Validators.isRequired(name) || !Validators.isValidLength(name, 2, 50)) {
            this.showError('signup', 'Name must be 2-50 characters');
            return;
        }

        if (!Validators.isValidEmail(email)) {
            this.showError('signup', 'Please enter a valid email address');
            return;
        }

        if (!Validators.isValidPassword(password)) {
            this.showError('signup', 'Password must be at least 6 characters');
            return;
        }

        if (password !== confirmPassword) {
            this.showError('signup', 'Passwords do not match');
            return;
        }

        // Clear errors
        this.clearErrors();

        // Show loading
        const submitBtn = form.querySelector('button[type="submit"]');
        UIUtils.setButtonLoading(submitBtn, true, 'Creating account...');

        try {
            await AuthService.signUpWithEmail(email, password, name);
            UIUtils.showSuccess('Account created successfully!');
            // Redirect handled by auth state listener
        } catch (error) {
            this.showError('signup', error.message);
            UIUtils.setButtonLoading(submitBtn, false);
        }
    }

    async handleGoogleSignIn() {
        UIUtils.showLoading();

        try {
            await AuthService.signInWithGoogle();
            UIUtils.showSuccess('Signed in with Google successfully!');
            // Redirect handled by auth state listener
        } catch (error) {
            UIUtils.hideLoading();
            UIUtils.showError(error.message);
        }
    }

    async handleGitHubSignIn() {
        UIUtils.showLoading();

        try {
            await AuthService.signInWithGitHub();
            UIUtils.showSuccess('Signed in with GitHub successfully!');
            // Redirect handled by auth state listener
        } catch (error) {
            UIUtils.hideLoading();
            UIUtils.showError(error.message);
        }
    }

    async handleForgotPassword() {
        const email = prompt('Enter your email address:');

        if (!email) return;

        if (!Validators.isValidEmail(email)) {
            UIUtils.showError('Please enter a valid email address');
            return;
        }

        UIUtils.showLoading();

        try {
            await AuthService.sendPasswordResetEmail(email);
            UIUtils.hideLoading();
            UIUtils.showSuccess('Password reset email sent! Check your inbox.');
        } catch (error) {
            UIUtils.hideLoading();
            UIUtils.showError(error.message);
        }
    }

    showError(formType, message) {
        const errorDiv = document.getElementById(`${formType}-error`);
        errorDiv.textContent = message;
        errorDiv.classList.add('show');
    }

    clearErrors() {
        document.querySelectorAll('.auth-error').forEach(error => {
            error.textContent = '';
            error.classList.remove('show');
        });
    }
}

// Initialize controller when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    new AuthController();
});
