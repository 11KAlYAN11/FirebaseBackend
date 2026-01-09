# 🔑 How to Set Your GitHub Token

You have two options to set your GitHub token:

## ✅ Option 1: Environment Variable (Recommended - Secure)

### For Linux/Mac/WSL:

```bash
# Set the token (temporary - only for current terminal session)
export GITHUB_TOKEN=your_token_here

# Verify it's set
echo $GITHUB_TOKEN

# Now run the script
node update-repo-metadata.js
```

### To make it permanent (add to ~/.bashrc or ~/.zshrc):

```bash
# Add this line to your ~/.bashrc file
echo 'export GITHUB_TOKEN=your_token_here' >> ~/.bashrc

# Reload your shell
source ~/.bashrc
```

### For Windows (PowerShell):

```powershell
# Set environment variable
$env:GITHUB_TOKEN="your_token_here"

# Run the script
node update-repo-metadata.js
```

### For Windows (Command Prompt):

```cmd
set GITHUB_TOKEN=your_token_here
node update-repo-metadata.js
```

---

## ⚠️ Option 2: Direct in Script (Quick but Less Secure)

**Only use this for testing! Don't commit this to git!**

Edit `update-repo-metadata.js` line 21:

```javascript
const CONFIG = {
    owner: process.env.GITHUB_OWNER || '11KAlYAN11',
    repo: process.env.GITHUB_REPO || 'FirebaseBackend',
    token: process.env.GITHUB_TOKEN || 'paste_your_token_here',  // ← Add your token here
    // ...
};
```

**⚠️ Remember to remove the token before committing to git!**

---

## 🚀 Quick Start (Recommended Method)

1. **Open terminal in the BackendDemo folder:**
   ```bash
   cd /home/pavan/javaPS/FirebaseBackend/BackendDemo
   ```

2. **Set your token:**
   ```bash
   export GITHUB_TOKEN=your_actual_token_here
   ```

3. **Run the script:**
   ```bash
   node update-repo-metadata.js
   ```

That's it! Your repository metadata will be updated.

---

## ✅ Verify Your Setup

Your script is already configured with:
- ✅ Owner: `11KAlYAN11`
- ✅ Repo: `FirebaseBackend`
- ⏳ Token: Need to set (use export command above)

---

## 🔒 Security Note

- **Never commit your token to git!**
- The `.gitignore` file already excludes `.env` files
- Use environment variables for production
- If you accidentally commit a token, revoke it immediately and generate a new one

