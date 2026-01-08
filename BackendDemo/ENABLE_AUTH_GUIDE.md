# 🔐 Quick Guide: Enable Firebase Authentication

## Error: `auth/configuration-not-found`

This error means **Email/Password authentication is not enabled** in your Firebase Console.

## ✅ Step-by-Step Fix

### 1. Go to Firebase Console
- Visit: https://console.firebase.google.com/
- Sign in with your Google account

### 2. Select Your Project
- Project: **kalyanbackenddemo**
- Project ID: `kalyanbackenddemo`

### 3. Navigate to Authentication
1. In the left sidebar, click **"Authentication"**
2. If you see "Get started", click it (first time setup)
3. Click on the **"Sign-in method"** tab at the top

### 4. Enable Email/Password
1. Find **"Email/Password"** in the list of providers
2. Click on **"Email/Password"**
3. **Toggle ON** the "Enable" switch
4. **Optionally** enable "Email link (passwordless sign-in)" if you want
5. Click **"Save"**

### 5. Optional: Enable Social Providers
If you want to use Google or GitHub sign-in:

#### Google Sign-In:
1. Find **"Google"** in the Sign-in method list
2. Click on it
3. Toggle **Enable**
4. Add your support email
5. Click **Save**

#### GitHub Sign-In:
1. Find **"GitHub"** in the Sign-in method list
2. Click on it
3. Toggle **Enable**
4. Add your GitHub OAuth App credentials (Client ID and Client Secret)
   - Create OAuth app at: https://github.com/settings/developers
5. Add authorized redirect URI: `https://kalyanbackenddemo.firebaseapp.com/__/auth/handler`
6. Click **Save**

## ✅ Verify It's Working

After enabling Email/Password:
1. Refresh your app: http://localhost:8080
2. Try to sign up again
3. The error should be gone!

## 🔍 Common Issues

### Still seeing the error?
- **Wait 1-2 minutes**: Firebase configuration updates can take a moment to propagate
- **Clear browser cache**: Hard refresh (Ctrl+Shift+R or Cmd+Shift+R)
- **Check browser console**: Look for any other errors

### Error: "Project not found"
- Make sure you're logged into the correct Google account
- Verify the project ID matches: `kalyanbackenddemo`
- Check `firebase.config.js` has the correct `projectId`

### Error: "Permission denied"
- Make sure your Google account has access to the Firebase project
- Check if you're a project member with Editor or Owner role

## 📝 Your Firebase Config

Your current Firebase project:
- **Project ID**: `kalyanbackenddemo`
- **Auth Domain**: `kalyanbackenddemo.firebaseapp.com`
- **API Key**: Already configured in `js/config/firebase.config.js`

## ✅ Checklist

- [ ] Opened Firebase Console
- [ ] Selected project: kalyanbackenddemo
- [ ] Went to Authentication → Sign-in method
- [ ] Enabled Email/Password
- [ ] Saved changes
- [ ] Refreshed the app
- [ ] Tried signing up again

---

**Need help?** Check the browser console for detailed error messages!

