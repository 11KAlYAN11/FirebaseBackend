# 🚀 Firebase To-Do List - Complete Setup Guide

## 📋 Table of Contents
1. [Prerequisites](#prerequisites)
2. [Firebase Project Setup](#firebase-project-setup)
3. [Local Project Setup](#local-project-setup)
4. [Running the Application](#running-the-application)
5. [Troubleshooting](#troubleshooting)

---

## Prerequisites

Before you begin, ensure you have:
- ✅ A Google account (for Firebase)
- ✅ Node.js installed (v14 or higher) - [Download](https://nodejs.org/)
- ✅ A code editor (VS Code recommended)
- ✅ Basic knowledge of JavaScript
- ✅ A GitHub account (for GitHub authentication)

---

## Firebase Project Setup

### Step 1: Create Firebase Project

1. **Go to Firebase Console**
   - Visit: https://console.firebase.google.com/
   - Click **"Add project"** or **"Create a project"**

2. **Configure Project**
   - **Project name**: `todo-list-mvp` (or your preferred name)
   - **Google Analytics**: Disable (optional for MVP)
   - Click **"Create project"**
   - Wait for project creation (takes ~30 seconds)

### Step 2: Register Web App

1. **Add Web App**
   - In your Firebase project dashboard
   - Click the **web icon** `</>` (Add app)
   - **App nickname**: `todo-web-app`
   - ✅ Check **"Also set up Firebase Hosting"** (optional)
   - Click **"Register app"**

2. **Copy Firebase Configuration**
   - You'll see a configuration object like this:
   ```javascript
   const firebaseConfig = {
     apiKey: "AIzaSy...",
     authDomain: "your-project.firebaseapp.com",
     projectId: "your-project-id",
     storageBucket: "your-project.appspot.com",
     messagingSenderId: "123456789",
     appId: "1:123456789:web:abc123"
   };
   ```
   - **IMPORTANT**: Keep this safe! You'll need it soon.

### Step 3: Enable Authentication

1. **Navigate to Authentication**
   - In Firebase Console sidebar: **Build** → **Authentication**
   - Click **"Get started"**

2. **Enable Email/Password**
   - Click **"Sign-in method"** tab
   - Click **"Email/Password"**
   - Toggle **"Enable"** to ON
   - Click **"Save"**

3. **Enable Google Sign-In**
   - Click **"Google"** in the sign-in providers list
   - Toggle **"Enable"** to ON
   - **Project support email**: Select your email
   - Click **"Save"**

4. **Enable GitHub Sign-In**
   
   **First, create GitHub OAuth App:**
   - Go to: https://github.com/settings/developers
   - Click **"OAuth Apps"** → **"New OAuth App"**
   - Fill in:
     - **Application name**: `TaskFlow Todo App`
     - **Homepage URL**: `https://your-project.firebaseapp.com`
     - **Authorization callback URL**: `https://your-project.firebaseapp.com/__/auth/handler`
       (Replace `your-project` with your actual Firebase project ID)
   - Click **"Register application"**
   - Copy **Client ID** and **Client Secret**

   **Then, configure in Firebase:**
   - Back in Firebase Console, click **"GitHub"**
   - Toggle **"Enable"** to ON
   - Paste **Client ID** and **Client Secret**
   - Copy the **Authorization callback URL** (if different from above)
   - Click **"Save"**

### Step 4: Create Firestore Database

1. **Navigate to Firestore**
   - In Firebase Console sidebar: **Build** → **Firestore Database**
   - Click **"Create database"**

2. **Configure Database**
   - **Secure rules**: Select **"Start in test mode"**
     (We'll deploy proper rules later)
   - Click **"Next"**

3. **Choose Location**
   - Select a location close to your users (e.g., `us-central1`)
   - Click **"Enable"**
   - Wait for database creation (~1 minute)

### Step 5: Deploy Security Rules

**IMPORTANT**: The test mode rules expire after 30 days. Deploy production rules immediately.

1. **Install Firebase CLI** (if not already installed)
   ```bash
   npm install -g firebase-tools
   ```

2. **Login to Firebase**
   ```bash
   firebase login
   ```
   - This opens a browser window
   - Sign in with your Google account
   - Grant permissions

3. **Navigate to Project Directory**
   ```bash
   cd /home/pavan/javaPS/BackendDemo
   ```

4. **Initialize Firebase**
   ```bash
   firebase init firestore
   ```
   - **Select project**: Choose your Firebase project
   - **Firestore rules file**: Press Enter (use `firestore.rules`)
   - **Firestore indexes file**: Press Enter (use `firestore.indexes.json`)

5. **Deploy Rules**
   ```bash
   firebase deploy --only firestore:rules
   ```
   - You should see: ✅ Deploy complete!

---

## Local Project Setup

### Step 1: Configure Firebase in Your App

1. **Navigate to the config directory**
   ```bash
   cd /home/pavan/javaPS/BackendDemo
   ```

2. **Open the Firebase config file**
   ```bash
   nano js/config/firebase.config.example.js
   ```
   Or use your preferred editor

3. **Copy the example to create your config**
   ```bash
   cp js/config/firebase.config.example.js js/config/firebase.config.js
   ```

4. **Edit `js/config/firebase.config.js`**
   - Replace the placeholder values with your actual Firebase config
   - The file should look like:
   ```javascript
   export const firebaseConfig = {
     apiKey: "YOUR_ACTUAL_API_KEY",
     authDomain: "your-project.firebaseapp.com",
     projectId: "your-project-id",
     storageBucket: "your-project.appspot.com",
     messagingSenderId: "YOUR_SENDER_ID",
     appId: "YOUR_APP_ID"
   };
   ```

5. **Save the file**

### Step 2: Install Dependencies

```bash
npm install
```

This installs the development server (`http-server`).

---

## Running the Application

### Option 1: Using npm (Recommended)

```bash
npm run dev
```

- This starts a local server on `http://localhost:8080`
- Your default browser should open automatically
- If not, manually navigate to: http://localhost:8080

### Option 2: Using Python

```bash
python3 -m http.server 8080
```

Then open: http://localhost:8080

### Option 3: Using Node.js http-server

```bash
npx http-server -p 8080 -o
```

### Option 4: Using VS Code Live Server

1. Install "Live Server" extension in VS Code
2. Right-click on `index.html`
3. Select "Open with Live Server"

---

## Testing the Application

### 1. Test Email/Password Authentication

1. Open the app in your browser
2. Click **"Sign Up"** tab
3. Fill in:
   - **Name**: Your Name
   - **Email**: test@example.com
   - **Password**: test123456
   - **Confirm Password**: test123456
4. Click **"Create Account"**
5. You should be redirected to the dashboard

### 2. Test Google Sign-In

1. On the login page, click **"Sign in with Google"**
2. Select your Google account
3. Grant permissions
4. You should be redirected to the dashboard

### 3. Test GitHub Sign-In

1. On the login page, click **"Sign in with GitHub"**
2. Authorize the application
3. You should be redirected to the dashboard

### 4. Test To-Do Operations

1. **Create a task**:
   - Click **"Add Task"** button
   - Enter title: "My First Task"
   - Set priority: High
   - Click **"Save Task"**

2. **Mark as complete**:
   - Click the checkbox next to the task

3. **Edit a task**:
   - Click on the task or the edit icon
   - Modify the title or description
   - Click **"Save Task"**

4. **Delete a task**:
   - Click the delete icon (🗑️)
   - Confirm deletion

5. **Test real-time sync**:
   - Open the app in two browser tabs
   - Create/edit/delete a task in one tab
   - Watch it update instantly in the other tab!

### 5. Test Search and Filters

1. Create multiple tasks with different statuses
2. Use the search box to find tasks
3. Click filter buttons (All/Pending/Completed)

---

## Troubleshooting

### Issue: "Firebase is not defined"

**Solution**: Make sure you're running the app through a web server (not opening `index.html` directly)

```bash
npm run dev
```

### Issue: "Missing or insufficient permissions"

**Solution**: Deploy Firestore security rules

```bash
firebase deploy --only firestore:rules
```

### Issue: GitHub Sign-In not working

**Solution**: 
1. Verify GitHub OAuth App callback URL matches Firebase
2. Check Client ID and Secret in Firebase Console
3. Ensure you've enabled GitHub provider in Firebase Auth

### Issue: "Module not found" errors

**Solution**: 
1. Ensure you're using a web server (modules don't work with `file://`)
2. Check that all file paths are correct
3. Verify Firebase config file exists: `js/config/firebase.config.js`

### Issue: Real-time updates not working

**Solution**:
1. Check browser console for errors
2. Verify Firestore rules are deployed
3. Ensure you're authenticated
4. Check network tab for WebSocket connections

### Issue: CORS errors

**Solution**: Use a proper development server, not `file://` protocol

### Issue: "Auth domain is not configured"

**Solution**: 
1. Go to Firebase Console → Authentication → Settings
2. Add your domain to authorized domains
3. For local development, `localhost` should already be there

---

## Next Steps

### Deploy to Production

1. **Build for production** (optional optimization)
   ```bash
   # Minify CSS/JS if needed
   ```

2. **Deploy to Firebase Hosting**
   ```bash
   firebase init hosting
   # Select your project
   # Public directory: . (current directory)
   # Single-page app: No
   # Set up automatic builds: No
   
   firebase deploy --only hosting
   ```

3. **Access your live app**
   - URL: `https://your-project.firebaseapp.com`

### Add More Features

- [ ] Email verification
- [ ] Password strength indicator
- [ ] Task categories/tags
- [ ] Due date notifications
- [ ] Collaborative tasks
- [ ] File attachments
- [ ] Export to PDF/CSV

---

## 📚 Additional Resources

- [Firebase Documentation](https://firebase.google.com/docs)
- [Firestore Security Rules](https://firebase.google.com/docs/firestore/security/get-started)
- [Firebase Authentication](https://firebase.google.com/docs/auth)

---

## 🎉 Congratulations!

You've successfully set up and deployed a production-ready Firebase To-Do List application!

**Need help?** Check the troubleshooting section or review the Firebase documentation.

---

**Happy Coding! 🚀**
