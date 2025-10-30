# 🚀 How to Push Your Code to GitHub

## Step-by-Step Guide (5 minutes)

---

## STEP 1: Create a GitHub Account (if you don't have one)

1. Go to https://github.com/
2. Click **"Sign up"**
3. Enter email, password, username
4. Verify your email

---

## STEP 2: Create a New Repository

1. Click the **"+"** icon (top right) → **"New repository"**
2. Fill in:
   - **Repository name**: `notsteam-game-store` (or whatever you want)
   - **Description**: "Game store built with Django and React"
   - **Privacy**: Choose **Public** or **Private**
   - **DO NOT** check "Initialize with README"
3. Click **"Create repository"**

✅ You'll see a page with instructions - keep it open!

---

## STEP 3: Configure Git (First Time Only)

Open your terminal/command prompt and run:

```bash
git config --global user.name "Your Name"
git config --global user.email "your.email@example.com"
```

Replace with your actual name and email!

---

## STEP 4: Initialize Git in Your Project

In your project root folder (`GameProject`):

```bash
cd "C:\Users\sabo-pc\Desktop\advanced web\GameProject"
git init
```

---

## STEP 5: Create .gitignore File

Before pushing, we need to tell Git what NOT to upload:

Create a file called `.gitignore` in your project root with this content:

```
# Python
*.pyc
*.pyo
__pycache__/
*.so
*.egg
*.egg-info/
dist/
build/
venv/
env/
.env

# Django
db.sqlite3
*.log
media/
staticfiles/

# Node
node_modules/
npm-debug.log
.env.local
.env.development.local
.env.test.local
.env.production.local

# IDE
.vscode/
.idea/
*.swp
*.swo

# OS
.DS_Store
Thumbs.db
```

---

## STEP 6: Add All Files to Git

```bash
git add .
```

This stages all your files for commit.

---

## STEP 7: Commit Your Code

```bash
git commit -m "Initial commit - NotSteam game store"
```

---

## STEP 8: Connect to GitHub

Copy the commands from your GitHub repository page. It should look like:

```bash
git remote add origin https://github.com/YOUR-USERNAME/notsteam-game-store.git
git branch -M main
git push -u origin main
```

Replace `YOUR-USERNAME` with your actual GitHub username!

---

## STEP 9: Push to GitHub

```bash
git push -u origin main
```

If prompted, enter your GitHub username and password.

**NOTE**: GitHub now requires a **Personal Access Token** instead of password!

### How to Get Personal Access Token:

1. Go to GitHub → Click your profile picture → **Settings**
2. Scroll down → Click **"Developer settings"**
3. Click **"Personal access tokens"** → **"Tokens (classic)"**
4. Click **"Generate new token"** → **"Generate new token (classic)"**
5. Give it a name: "NotSteam Deployment"
6. Check: **repo** (all sub-items)
7. Click **"Generate token"**
8. **COPY THE TOKEN** (you won't see it again!)
9. Use this token as your password when pushing

---

## ✅ SUCCESS!

Your code is now on GitHub! Go to your repository URL to see it:
```
https://github.com/YOUR-USERNAME/notsteam-game-store
```

---

## 🔄 Future Updates (After First Push)

When you make changes and want to push again:

```bash
git add .
git commit -m "Description of what you changed"
git push
```

That's it!

---

## 🐛 Common Errors & Fixes

### Error: "git is not recognized"
**Fix**: Install Git from https://git-scm.com/download/win

### Error: "Permission denied"
**Fix**: Use Personal Access Token as password (see above)

### Error: "fatal: not a git repository"
**Fix**: Make sure you ran `git init` in the correct folder

### Error: "nothing to commit"
**Fix**: Make sure you ran `git add .` before commit

---

## 📋 Quick Command Summary

```bash
# One-time setup
git config --global user.name "Your Name"
git config --global user.email "your@email.com"

# Initialize project
cd "path/to/your/project"
git init

# First commit
git add .
git commit -m "Initial commit"

# Connect to GitHub
git remote add origin https://github.com/YOUR-USERNAME/REPO-NAME.git
git branch -M main
git push -u origin main

# Future updates
git add .
git commit -m "Your message"
git push
```

---

## ✅ You're Ready!

Now you can go back to [DEPLOY_NOW.md](DEPLOY_NOW.md) and deploy to Render!
