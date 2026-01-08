// Firebase Initialization
// This module initializes Firebase and exports the app instance

import { firebaseConfig } from '../config/firebase.config.js';

// Access Firebase from window global (compat SDK loaded via script tags)
// Wait for Firebase to be available - the scripts should be loaded synchronously before this module
const getFirebase = () => {
    // Try window.firebase first (where compat SDK usually puts it)
    if (typeof window !== 'undefined' && window.firebase) {
        return window.firebase;
    }
    // Fallback: try global firebase (in case window is not available)
    if (typeof firebase !== 'undefined') {
        return firebase;
    }
    throw new Error('Firebase SDK not loaded. Make sure Firebase scripts are loaded before this module.');
};

// Ensure Firebase is loaded before initializing
let firebase;
try {
    firebase = getFirebase();
    console.log('Firebase SDK loaded successfully');
} catch (error) {
    console.error('Firebase initialization error:', error);
    console.error('Make sure Firebase SDK scripts are loaded in index.html before this module');
    throw error;
}

// Verify Firebase has required methods
if (!firebase.initializeApp || !firebase.auth || !firebase.firestore) {
    throw new Error('Firebase SDK is not fully loaded. Missing required methods.');
}

// Check if Firebase is already initialized
let app;
try {
    // Try to get existing app or initialize new one
    if (firebase.apps && firebase.apps.length > 0) {
        app = firebase.apps[0];
        console.log('Using existing Firebase app:', app.name);
    } else {
        app = firebase.initializeApp(firebaseConfig);
        console.log('Initialized new Firebase app:', app.name);
    }
} catch (error) {
    // If error is that app already exists, get the existing app
    if (error.code === 'app/duplicate-app' || error.code === 'app/default-already-exists') {
        app = firebase.apps ? firebase.apps[0] : firebase.app();
        console.log('App already exists, using existing app');
    } else {
        console.error('Error initializing Firebase:', error);
        throw error;
    }
}

// Initialize services
const auth = firebase.auth();
const db = firebase.firestore();

console.log('Firebase services initialized successfully');

// Enable persistence for offline support
db.enablePersistence()
    .then(() => {
        console.log('Firestore persistence enabled');
    })
    .catch((err) => {
        if (err.code === 'failed-precondition') {
            console.warn('Multiple tabs open, persistence can only be enabled in one tab at a time.');
        } else if (err.code === 'unimplemented') {
            console.warn('The current browser does not support persistence.');
        } else {
            console.warn('Could not enable persistence:', err);
        }
    });

// Export Firebase services and firebase object for use in other modules
export { app, auth, db, firebase };
