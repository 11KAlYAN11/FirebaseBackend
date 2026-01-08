// User Service
// Handles user data operations in Firestore

import { db } from '../utils/firebase.init.js';

export const UserService = {
    /**
     * Create a new user document
     */
    async createUser(userData) {
        try {
            const userRef = db.collection('users').doc(userData.uid);

            const user = {
                uid: userData.uid,
                name: userData.name,
                email: userData.email,
                photoURL: userData.photoURL || '',
                provider: userData.provider,
                createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                updatedAt: firebase.firestore.FieldValue.serverTimestamp()
            };

            await userRef.set(user);
            return user;
        } catch (error) {
            console.error('Error creating user:', error);
            throw new Error('Failed to create user profile');
        }
    },

    /**
     * Get user by UID
     */
    async getUser(uid) {
        try {
            const userDoc = await db.collection('users').doc(uid).get();

            if (!userDoc.exists) {
                return null;
            }

            return {
                id: userDoc.id,
                ...userDoc.data()
            };
        } catch (error) {
            console.error('Error getting user:', error);
            throw new Error('Failed to get user profile');
        }
    },

    /**
     * Check if user exists
     */
    async userExists(uid) {
        try {
            const userDoc = await db.collection('users').doc(uid).get();
            return userDoc.exists;
        } catch (error) {
            console.error('Error checking user existence:', error);
            return false;
        }
    },

    /**
     * Update user data
     */
    async updateUser(uid, updates) {
        try {
            const userRef = db.collection('users').doc(uid);

            await userRef.update({
                ...updates,
                updatedAt: firebase.firestore.FieldValue.serverTimestamp()
            });

            return await this.getUser(uid);
        } catch (error) {
            console.error('Error updating user:', error);
            throw new Error('Failed to update user profile');
        }
    },

    /**
     * Delete user document
     */
    async deleteUser(uid) {
        try {
            await db.collection('users').doc(uid).delete();
        } catch (error) {
            console.error('Error deleting user:', error);
            throw new Error('Failed to delete user profile');
        }
    },

    /**
     * Get user's statistics
     */
    async getUserStats(uid) {
        try {
            const todosSnapshot = await db.collection('todos')
                .where('ownerUID', '==', uid)
                .get();

            const todos = todosSnapshot.docs.map(doc => doc.data());

            return {
                totalTodos: todos.length,
                completedTodos: todos.filter(t => t.status === 'completed').length,
                pendingTodos: todos.filter(t => t.status === 'pending').length,
                highPriorityTodos: todos.filter(t => t.priority === 'high').length
            };
        } catch (error) {
            console.error('Error getting user stats:', error);
            return {
                totalTodos: 0,
                completedTodos: 0,
                pendingTodos: 0,
                highPriorityTodos: 0
            };
        }
    },

    /**
     * Listen to user changes
     */
    onUserChanged(uid, callback) {
        return db.collection('users').doc(uid).onSnapshot(
            (doc) => {
                if (doc.exists) {
                    callback({
                        id: doc.id,
                        ...doc.data()
                    });
                } else {
                    callback(null);
                }
            },
            (error) => {
                console.error('Error listening to user changes:', error);
                callback(null);
            }
        );
    }
};
