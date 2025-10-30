# 🚀 DEPLOY YOUR WEBSITE IN 10 MINUTES

## EASIEST METHOD: Vercel + Render

### ⏱️ Total Time: 10-15 minutes
### 💰 Cost: $0 (FREE)

---

## STEP 1: Deploy Backend (5 minutes)

### Option A: Using Render (Recommended)

1. **Go to https://render.com/**
2. **Sign up** with GitHub
3. **Click "New +"** → **"Web Service"**
4. **Connect your GitHub repo** (push your code to GitHub first)
5. **Fill in**:
   - Name: `notsteam-backend`
   - Root Directory: `backend`
   - Build Command: `pip install -r requirements.txt && python manage.py migrate`
   - Start Command: `gunicorn backend.wsgi:application`
6. **Click "Create Web Service"**

✅ **Done!** Your backend is now at: `https://notsteam-backend.onrender.com`

---

## STEP 2: Update Frontend to Use Deployed Backend (2 minutes)

Open `frontend/src/App.jsx` and change line 19:

```javascript
// FROM:
axios.defaults.baseURL = 'http://localhost:8000/api/';

// TO (use your Render URL):
axios.defaults.baseURL = 'https://notsteam-backend.onrender.com/api/';
```

**Save the file!**

---

## STEP 3: Deploy Frontend (3 minutes)

1. **Go to https://vercel.com/**
2. **Sign up** with GitHub
3. **Click "New Project"**
4. **Import your GitHub repo**
5. **Configure**:
   - Framework Preset: **Vite**
   - Root Directory: `frontend`
   - Build Command: `npm run build`
   - Output Directory: `dist`
6. **Click "Deploy"**

✅ **Done!** Your website is live at: `https://notsteam.vercel.app`

---

## STEP 4: Fix CORS (1 minute)

Update `backend/backend/settings.py`:

```python
# Find CORS_ALLOWED_ORIGINS and change it to:
CORS_ALLOWED_ORIGINS = [
    "https://notsteam.vercel.app",  # Your Vercel URL
    "http://localhost:5173",
]
```

**Commit and push** to GitHub - Render will auto-redeploy!

---

## 🎉 YOU'RE LIVE!

Visit: `https://notsteam.vercel.app`

---

## 🐛 If Something Breaks:

### Backend not working?
- Check Render logs: Dashboard → Logs
- Make sure all packages installed
- Run migrations: `python manage.py migrate`

### Frontend can't connect to backend?
- Check if backend URL is correct in `App.jsx`
- Check CORS settings in Django `settings.py`
- Make sure backend is running on Render

### Static files not loading?
```bash
python manage.py collectstatic --no-input
```

---

## 📋 Quick Checklist:

- [ ] Code is on GitHub
- [ ] Backend deployed to Render
- [ ] Frontend updated with backend URL
- [ ] Frontend deployed to Vercel
- [ ] CORS settings updated
- [ ] Website loads successfully

---

## 🎯 What You Get:

✅ Live website accessible from anywhere
✅ Free HTTPS/SSL certificate
✅ Real domain name (notsteam.vercel.app)
✅ Automatic deployments on every push
✅ 99.9% uptime

---

**Need detailed instructions?** Check [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md)

---

## 💡 PRO TIP:

Both Vercel and Render support **automatic deployments**. Every time you push code to GitHub, they'll automatically redeploy! 🔄
