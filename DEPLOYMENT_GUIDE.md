# 🚀 EASIEST DEPLOYMENT GUIDE - NotSteam

## 📋 What You'll Get:
- ✅ **Free hosting** for both frontend and backend
- ✅ **Real domain name** (like notsteam.vercel.app)
- ✅ **HTTPS/SSL** automatically enabled
- ✅ **Live website** accessible from anywhere

---

## 🎯 METHOD 1: Vercel + Render (RECOMMENDED - 100% FREE)

### **PART A: Deploy Backend (Django) to Render**

#### Step 1: Prepare Your Backend

1. **Create a `build.sh` file** in your `backend` folder:

```bash
#!/usr/bin/env bash
# exit on error
set -o errexit

pip install -r requirements.txt

python manage.py collectstatic --no-input
python manage.py migrate
```

2. **Update `settings.py`** - Add to ALLOWED_HOSTS:
```python
ALLOWED_HOSTS = ['*']  # For now, will update after deployment
```

3. **Push to GitHub**:
```bash
# In your project root
git init
git add .
git commit -m "Ready for deployment"
git remote add origin <your-github-repo-url>
git push -u origin main
```

#### Step 2: Deploy to Render

1. Go to https://render.com/
2. Sign up with GitHub
3. Click **"New +"** → **"Web Service"**
4. Connect your GitHub repository
5. Configure:
   - **Name**: `notsteam-backend`
   - **Root Directory**: `backend`
   - **Environment**: `Python 3`
   - **Build Command**: `./build.sh`
   - **Start Command**: `gunicorn backend.wsgi:application`
6. Add Environment Variables:
   - `PYTHON_VERSION`: `3.12.0`
   - `SECRET_KEY`: `your-secret-key-here`
   - `DEBUG`: `False`
   - `DATABASE_URL`: (Render will provide this)
7. Click **"Create Web Service"**

✅ Your backend will be live at: `https://notsteam-backend.onrender.com`

---

### **PART B: Deploy Frontend (React) to Vercel**

#### Step 1: Prepare Frontend

1. **Update API URL** in `frontend/src/App.jsx`:

```javascript
// Change this:
axios.defaults.baseURL = 'http://localhost:8000/api/';

// To this:
axios.defaults.baseURL = 'https://notsteam-backend.onrender.com/api/';
```

2. **Create `vercel.json`** in `frontend` folder:

```json
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

#### Step 2: Deploy to Vercel

1. Go to https://vercel.com/
2. Sign up with GitHub
3. Click **"New Project"**
4. Import your GitHub repository
5. Configure:
   - **Framework Preset**: `Vite`
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
6. Click **"Deploy"**

✅ Your frontend will be live at: `https://notsteam.vercel.app`

---

## 🎯 METHOD 2: PythonAnywhere + Vercel (ALTERNATIVE)

### **Deploy Backend to PythonAnywhere**

#### Step 1: Create Account
1. Go to https://www.pythonanywhere.com/
2. Sign up for **FREE Beginner account**

#### Step 2: Upload Code
1. Go to **"Files"** tab
2. Click **"Upload a file"**
3. Upload a zip of your `backend` folder

OR use Git in **Bash console**:
```bash
git clone https://github.com/yourusername/your-repo.git
```

#### Step 3: Install Dependencies
In **Bash console**:
```bash
cd backend
pip3 install --user -r requirements.txt
```

#### Step 4: Configure Web App
1. Go to **"Web"** tab
2. Click **"Add a new web app"**
3. Choose **"Manual configuration"**
4. Choose **"Python 3.10"**
5. Set paths:
   - **Source code**: `/home/yourusername/backend`
   - **Working directory**: `/home/yourusername/backend`
   - **WSGI file**: Edit and add:

```python
import sys
import os

path = '/home/yourusername/backend'
if path not in sys.path:
    sys.path.append(path)

os.environ['DJANGO_SETTINGS_MODULE'] = 'backend.settings'

from django.core.wsgi import get_wsgi_application
application = get_wsgi_application()
```

6. Click **"Reload"**

✅ Your backend will be at: `http://yourusername.pythonanywhere.com`

---

## 🎯 METHOD 3: All-in-One with Railway (EASIEST!)

### Deploy Both Frontend and Backend Together

1. Go to https://railway.app/
2. Sign up with GitHub
3. Click **"New Project"** → **"Deploy from GitHub repo"**
4. Select your repository
5. Railway will auto-detect Django and React
6. Click **"Deploy"**

✅ Done! Railway handles everything automatically!

---

## 📝 After Deployment Checklist

### 1. Update CORS Settings
In `backend/backend/settings.py`:

```python
CORS_ALLOWED_ORIGINS = [
    "https://notsteam.vercel.app",  # Your Vercel URL
]
```

### 2. Update Database
If using PostgreSQL on Render:
- Render provides a free PostgreSQL database
- Copy the `DATABASE_URL` from Render dashboard
- Add it to your environment variables

### 3. Collect Static Files
```bash
python manage.py collectstatic
```

### 4. Run Migrations
```bash
python manage.py migrate
```

### 5. Create Superuser
```bash
python manage.py createsuperuser
```

---

## 🌐 Update Your SEO URLs

After deployment, update these files with your real domain:

### 1. `frontend/index.html`
```html
<!-- Change all instances of -->
<meta property="og:url" content="https://notsteam.com/" />

<!-- To your real URL -->
<meta property="og:url" content="https://notsteam.vercel.app/" />
```

### 2. `frontend/public/sitemap.xml`
Run the sitemap generator with your real domain:
```bash
cd backend
python generate_sitemap.py
```

Then manually replace `https://notsteam.com` with your real domain.

### 3. `frontend/public/robots.txt`
```
Sitemap: https://notsteam.vercel.app/sitemap.xml
```

---

## 🎉 YOU'RE LIVE!

Your website is now accessible at:
- Frontend: `https://notsteam.vercel.app`
- Backend API: `https://notsteam-backend.onrender.com`

---

## 🐛 Common Issues & Fixes

### Issue: "Module not found"
**Fix**: Make sure `requirements.txt` is in the backend folder

### Issue: "CORS error"
**Fix**: Add your Vercel domain to `CORS_ALLOWED_ORIGINS` in settings.py

### Issue: "Static files not loading"
**Fix**: Run `python manage.py collectstatic`

### Issue: "Database errors"
**Fix**: Run `python manage.py migrate`

---

## 💰 Pricing

| Service | Free Tier | Limits |
|---------|-----------|--------|
| **Vercel** | ✅ FREE | Unlimited projects |
| **Render** | ✅ FREE | 750 hours/month |
| **Railway** | ✅ FREE | $5 credit/month |
| **PythonAnywhere** | ✅ FREE | 1 web app |

**Recommendation**: Use **Vercel + Render** for best performance and reliability.

---

## 📞 Need Help?

If you get stuck:
1. Check the deployment logs in your hosting dashboard
2. Make sure all environment variables are set
3. Verify your `requirements.txt` is correct
4. Check CORS settings

---

## 🎓 What You Just Learned

- ✅ How to deploy a Django backend
- ✅ How to deploy a React frontend
- ✅ How to connect frontend to backend
- ✅ How to use free hosting services
- ✅ How to enable HTTPS/SSL automatically

**Time to complete**: 30-45 minutes
**Difficulty**: Easy
**Cost**: $0 (100% FREE!)

---

**Next Step**: Follow the steps above for your preferred method!
