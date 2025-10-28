# ⚡ Quick Deployment Checklist

## Before You Start
- [ ] GitHub repository is up to date
- [ ] You have access to your email for account verifications

---

## 1️⃣ MongoDB Atlas (Database)
- [ ] Create account at mongodb.com/cloud/atlas
- [ ] Create free cluster (M0)
- [ ] Add database user with password
- [ ] Allow access from anywhere (0.0.0.0/0)
- [ ] Copy connection string
- [ ] Replace username, password, and add database name

**Connection String Format**:
```
mongodb+srv://USERNAME:PASSWORD@cluster0.xxxxx.mongodb.net/everpulse?retryWrites=true&w=majority
```

---

## 2️⃣ Render (Backend)
- [ ] Create account at render.com (use GitHub)
- [ ] New Web Service → Connect GitHub repo
- [ ] Configure:
  - Root Directory: `backend`
  - Build Command: `npm install`
  - Start Command: `npm start`
- [ ] Add Environment Variables:
  - `MONGO_URI` = (your MongoDB connection string)
  - `JWT_SECRET` = (random secure string)
  - `CLIENT_URL` = `http://localhost:5173` (temporary)
  - `NODE_ENV` = `production`
- [ ] Click "Create Web Service"
- [ ] Wait for deployment
- [ ] **SAVE YOUR BACKEND URL**: `https://______.onrender.com`

---

## 3️⃣ Update Frontend
- [ ] Create `client/.env` file:
  ```
  VITE_API_BASE_URL=https://YOUR-BACKEND-URL.onrender.com/api
  ```
- [ ] Commit and push:
  ```bash
  git add .
  git commit -m "Add production backend URL"
  git push
  ```

---

## 4️⃣ Netlify (Frontend)
- [ ] Create account at netlify.com (use GitHub)
- [ ] New site → Import from GitHub
- [ ] Configure:
  - Base directory: `client`
  - Build command: `npm run build`
  - Publish directory: `client/dist`
- [ ] Add environment variable:
  - `VITE_API_BASE_URL` = `https://YOUR-BACKEND-URL.onrender.com/api`
- [ ] Deploy site
- [ ] **SAVE YOUR FRONTEND URL**: `https://______.netlify.app`

---

## 5️⃣ Final Update
- [ ] Go back to Render
- [ ] Update `CLIENT_URL` environment variable to your Netlify URL
- [ ] Service will auto-redeploy

---

## ✅ Test Everything
- [ ] Visit frontend URL
- [ ] Create a test account
- [ ] Login works
- [ ] Dashboard loads
- [ ] Can book appointment
- [ ] Chat works

---

## 🔗 Your Live URLs
- **Frontend**: https://____________.netlify.app
- **Backend**: https://____________.onrender.com
- **Database**: MongoDB Atlas

---

## ⚠️ Important Notes
1. Free tier backend sleeps after 15 min inactivity (first load may be slow)
2. Keep your MongoDB password secure
3. Never commit `.env` files to GitHub
4. Both services auto-deploy when you push to GitHub

---

## 🆘 If Something Breaks
1. Check Render logs (Dashboard → Service → Logs)
2. Check Netlify deploy logs
3. Check browser console (F12)
4. Verify all environment variables are set correctly
