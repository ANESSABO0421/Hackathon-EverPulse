# 🚀 Full-Stack Deployment Guide

## Overview
This guide will help you deploy your healthcare application with:
- **Database**: MongoDB Atlas (Free)
- **Backend**: Render (Free)
- **Frontend**: Netlify (Free)

---

## 📦 Part 1: MongoDB Atlas Setup (5 minutes)

### 1. Create MongoDB Atlas Account
1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas/register)
2. Sign up for a free account
3. Create a new project (e.g., "EverPulse")

### 2. Create a Cluster
1. Click "Build a Database"
2. Choose **FREE** tier (M0 Sandbox)
3. Select a cloud provider and region (choose closest to you)
4. Click "Create Cluster"

### 3. Configure Database Access
1. Go to **Database Access** (left sidebar)
2. Click "Add New Database User"
3. Choose **Password** authentication
4. Username: `everpulse-admin` (or your choice)
5. **IMPORTANT**: Save the password securely!
6. Set privileges to "Read and write to any database"
7. Click "Add User"

### 4. Configure Network Access
1. Go to **Network Access** (left sidebar)
2. Click "Add IP Address"
3. Click "Allow Access from Anywhere" (0.0.0.0/0)
   - This is safe for development; for production, you can restrict later
4. Click "Confirm"

### 5. Get Connection String
1. Go to **Database** → Click "Connect" on your cluster
2. Choose "Connect your application"
3. Driver: **Node.js**, Version: **5.5 or later**
4. Copy the connection string (looks like):
   ```
   mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```
5. **Replace** `<username>` with your database username
6. **Replace** `<password>` with your database password
7. **Add** database name before the `?`: `/everpulse?retryWrites=true&w=majority`

**Final format**:
```
mongodb+srv://everpulse-admin:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/everpulse?retryWrites=true&w=majority
```

---

## 🖥️ Part 2: Deploy Backend to Render (10 minutes)

### 1. Create Render Account
1. Go to [Render](https://render.com)
2. Sign up using your **GitHub account** (easiest option)
3. Authorize Render to access your repositories

### 2. Create New Web Service
1. Click "New +" → "Web Service"
2. Connect your GitHub repository: `ANESSABO0421/Hackathon-EverPulse`
3. Click "Connect"

### 3. Configure Web Service
Fill in the following settings:

- **Name**: `everpulse-backend` (or your choice)
- **Region**: Choose closest to you
- **Branch**: `main`
- **Root Directory**: `backend`
- **Runtime**: `Node`
- **Build Command**: `npm install`
- **Start Command**: `npm start`
- **Instance Type**: **Free**

### 4. Add Environment Variables
Click "Advanced" → "Add Environment Variable"

Add these variables:

| Key | Value |
|-----|-------|
| `MONGO_URI` | Your MongoDB connection string from Part 1 |
| `JWT_SECRET` | Generate a random string (e.g., use [this generator](https://randomkeygen.com/)) |
| `CLIENT_URL` | `http://localhost:5173` (we'll update this later) |
| `NODE_ENV` | `production` |

### 5. Deploy
1. Click "Create Web Service"
2. Wait for deployment (5-10 minutes)
3. Once deployed, you'll see a URL like: `https://everpulse-backend.onrender.com`
4. **SAVE THIS URL** - you'll need it for the frontend!

### 6. Test Backend
1. Visit your backend URL in browser
2. You should see: "🚀 API is running successfully!"
3. Test an endpoint: `https://your-backend-url.onrender.com/api/doctors`

---

## 🌐 Part 3: Deploy Frontend to Netlify (5 minutes)

### 1. Update Frontend API URL
Before deploying, update the frontend to use your Render backend URL:

1. Open `client/.env` (create if doesn't exist)
2. Add:
   ```
   VITE_API_BASE_URL=https://your-backend-url.onrender.com/api
   ```
3. Replace `your-backend-url` with your actual Render URL

### 2. Commit Changes
```bash
git add .
git commit -m "Add production backend URL"
git push
```

### 3. Deploy to Netlify
1. Go to [Netlify](https://www.netlify.com)
2. Sign up using your **GitHub account**
3. Click "Add new site" → "Import an existing project"
4. Choose "Deploy with GitHub"
5. Select repository: `ANESSABO0421/Hackathon-EverPulse`
6. Configure build settings:
   - **Base directory**: `client`
   - **Build command**: `npm run build`
   - **Publish directory**: `client/dist`
7. Click "Add environment variables":
   - Key: `VITE_API_BASE_URL`
   - Value: `https://your-backend-url.onrender.com/api`
8. Click "Deploy site"

### 4. Get Frontend URL
1. After deployment, you'll get a URL like: `https://random-name-123.netlify.app`
2. You can customize this in Site settings → Domain management

---

## 🔄 Part 4: Update Backend with Frontend URL

### 1. Update Render Environment Variables
1. Go to your Render dashboard
2. Select your backend service
3. Go to "Environment"
4. Update `CLIENT_URL` to your Netlify URL (e.g., `https://your-app.netlify.app`)
5. Click "Save Changes"
6. Service will automatically redeploy

---

## ✅ Part 5: Verification

### Test Your Deployed Application

1. **Visit your frontend**: `https://your-app.netlify.app`
2. **Test signup/login**: Create a new patient account
3. **Test features**: 
   - Book an appointment
   - View dashboard
   - Test chat functionality

### Common Issues

**Backend not responding?**
- Check Render logs: Dashboard → Your Service → Logs
- Verify MongoDB connection string is correct
- Ensure all environment variables are set

**Frontend can't connect to backend?**
- Check browser console for CORS errors
- Verify `VITE_API_BASE_URL` is correct in Netlify
- Ensure `CLIENT_URL` is set correctly in Render

**Database connection failed?**
- Verify MongoDB Atlas IP whitelist includes 0.0.0.0/0
- Check username/password in connection string
- Ensure database user has proper permissions

---

## 🎉 You're Done!

Your application is now live:
- **Frontend**: https://your-app.netlify.app
- **Backend**: https://your-backend.onrender.com
- **Database**: MongoDB Atlas

### Important Notes

1. **Free Tier Limitations**:
   - Render free tier spins down after 15 minutes of inactivity
   - First request after inactivity may take 30-60 seconds
   - MongoDB Atlas free tier: 512MB storage

2. **Future Updates**:
   - Push to GitHub `main` branch
   - Netlify auto-deploys frontend
   - Render auto-deploys backend

3. **Custom Domain** (Optional):
   - You can add a custom domain in Netlify settings
   - Update `CLIENT_URL` in Render after adding domain

---

## 📞 Need Help?

Check the logs:
- **Render**: Dashboard → Service → Logs
- **Netlify**: Site → Deploys → Deploy log
- **MongoDB**: Atlas → Clusters → Metrics

Good luck! 🚀
