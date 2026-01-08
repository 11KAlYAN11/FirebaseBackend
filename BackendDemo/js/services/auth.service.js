// Authentication Service
// Handles all Firebase Authentication operations

import { auth, db } from '../utils/firebase.init.js';
import { UserService } from './user.service.js';

export const AuthService = {
    /**
     * Sign up with email and password
     */
    async signUpWithEmail(email, password, displayName) {
        try {
            // Create user account
            const userCredential = await auth.createUserWithEmailAndPassword(email, password);
            const user = userCredential.user;

            // Update profile with display name
            await user.updateProfile({
                displayName: displayName
            });

            // Create user document in Firestore
            await UserService.createUser({
                uid: user.uid,
                name: displayName,
                email: user.email,
                photoURL: user.photoURL || '',
                provider: 'email'
            });

            return user;
        } catch (error) {
            throw this.handleAuthError(error);
        }
    },

    /**
     * Sign in with email and password
     */
    async signInWithEmail(email, password) {
        try {
            const userCredential = await auth.signInWithEmailAndPassword(email, password);
            return userCredential.user;
        } catch (error) {
            throw this.handleAuthError(error);
        }
    },

    /**
     * Sign in with Google
     */
    async signInWithGoogle() {
        try {
            const provider = new firebase.auth.GoogleAuthProvider();
            provider.addScope('profile');
            provider.addScope('email');

            const userCredential = await auth.signInWithPopup(provider);
            const user = userCredential.user;

            // Check if user document exists, create if not
            const userExists = await UserService.userExists(user.uid);
            if (!userExists) {
                await UserService.createUser({
                    uid: user.uid,
                    name: user.displayName,
                    email: user.email,
                    photoURL: user.photoURL || '',
                    provider: 'google'
                });
            }

            return user;
        } catch (error) {
            throw this.handleAuthError(error);
        }
    },

    /**
     * Sign in with GitHub
     */
    async signInWithGitHub() {
        try {
            const provider = new firebase.auth.GithubAuthProvider();
            provider.addScope('user:email');

            const userCredential = await auth.signInWithPopup(provider);
            const user = userCredential.user;

            // Check if user document exists, create if not
            const userExists = await UserService.userExists(user.uid);
            if (!userExists) {
                await UserService.createUser({
                    uid: user.uid,
                    name: user.displayName || user.email.split('@')[0],
                    email: user.email,
                    photoURL: user.photoURL || '',
                    provider: 'github'
                });
            }

            return user;
        } catch (error) {
            throw this.handleAuthError(error);
        }
    },

    /**
     * Sign out
     */
    async signOut() {
        try {
            await auth.signOut();
        } catch (error) {
            throw this.handleAuthError(error);
        }
    },

    /**
     * Get current user
     */
    getCurrentUser() {
        return auth.currentUser;
    },

    /**
     * Check if user is authenticated
     */
    isAuthenticated() {
        return auth.currentUser !== null;
    },

    /**
     * Listen to auth state changes
     */
    onAuthStateChanged(callback) {
        return auth.onAuthStateChanged(callback);
    },

    /**
     * Send password reset email
     */
    async sendPasswordResetEmail(email) {
        try {
            await auth.sendPasswordResetEmail(email);
        } catch (error) {
            throw this.handleAuthError(error);
        }
    },

    /**
     * Update user profile
     */
    async updateProfile(displayName, photoURL) {
        try {
            const user = auth.currentUser;
            if (!user) throw new Error('No user logged in');

            await user.updateProfile({
                displayName: displayName,
                photoURL: photoURL
            });

            // Update Firestore user document
            await UserService.updateUser(user.uid, {
                name: displayName,
                photoURL: photoURL
            });

            return user;
        } catch (error) {
            throw this.handleAuthError(error);
        }
    },

    /**
     * Update email
     */
    async updateEmail(newEmail) {
        try {
            const user = auth.currentUser;
            if (!user) throw new Error('No user logged in');

            await user.updateEmail(newEmail);

            // Update Firestore user document
            await UserService.updateUser(user.uid, {
                email: newEmail
            });

            return user;
        } catch (error) {
            throw this.handleAuthError(error);
        }
    },

    /**
     * Update password
     */
    async updatePassword(newPassword) {
        try {
            const user = auth.currentUser;
            if (!user) throw new Error('No user logged in');

            await user.updatePassword(newPassword);
            return user;
        } catch (error) {
            throw this.handleAuthError(error);
        }
    },

    /**
     * Re-authenticate user (required for sensitive operations)
     */
    async reauthenticate(password) {
        try {
            const user = auth.currentUser;
            if (!user) throw new Error('No user logged in');

            const credential = firebase.auth.EmailAuthProvider.credential(
                user.email,
                password
            );

            await user.reauthenticateWithCredential(credential);
            return user;
        } catch (error) {
            throw this.handleAuthError(error);
        }
    },

    /**
     * Delete user account
     */
    async deleteAccount() {
        try {
            const user = auth.currentUser;
            if (!user) throw new Error('No user logged in');

            // Delete user document from Firestore
            await UserService.deleteUser(user.uid);

            // Delete all user's todos
            // This should be handled by Cloud Functions in production
            // For MVP, we'll leave it to manual cleanup or add here if needed

            // Delete auth account
            await user.delete();
        } catch (error) {
            throw this.handleAuthError(error);
        }
    },

    /**
     * Handle authentication errors
     */
    handleAuthError(error) {
        const errorMessages = {
            'auth/email-already-in-use': 'This email is already registered',
            'auth/invalid-email': 'Invalid email address',
            'auth/operation-not-allowed': 'Operation not allowed',
            'auth/weak-password': 'Password is too weak (minimum 6 characters)',
            'auth/user-disabled': 'This account has been disabled',
            'auth/user-not-found': 'No account found with this email',
            'auth/wrong-password': 'Incorrect password',
            'auth/too-many-requests': 'Too many failed attempts. Please try again later',
            'auth/network-request-failed': 'Network error. Please check your connection',
            'auth/popup-closed-by-user': 'Sign-in popup was closed',
            'auth/cancelled-popup-request': 'Only one popup request is allowed at a time',
            'auth/popup-blocked': 'Sign-in popup was blocked by the browser',
            'auth/account-exists-with-different-credential': 'An account already exists with the same email but different sign-in credentials',
            'auth/requires-recent-login': 'This operation requires recent authentication. Please log in again'
        };

        const message = errorMessages[error.code] || error.message || 'An error occurred during authentication';

        return new Error(message);
    }
};
