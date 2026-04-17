# 🚀 Deployment Guide - AI Kisan Salahkar

## Architecture

```
Frontend (Vercel) ↔ Backend API (Your Choice) ↔ MongoDB Atlas
```

---

## 📦 Frontend Deployment (Vercel)

**Status**: Configured ✅

1. Go to https://vercel.com
2. Import your GitHub repository
3. Vercel Environment Variables:
   - `VITE_API_URL=https://your-backend-url.com/api`
   - `VITE_GOOGLE_GEMINI_API_KEY=your_key`
   - `VITE_SUPABASE_URL=your_supabase_url`
   - `VITE_SUPABASE_PUBLISHABLE_KEY=your_key`

---

## 🖥️ Backend Deployment Options

**Your backend needs:**
- Node.js 18+
- MongoDB connection string
- Environment variables from `.env`

### **Option A: Render.com (Recommended - Free tier)**

1. Sign up at https://render.com
2. Create new Web Service
3. Connect GitHub repository, point to `/server` directory
4. Build command: `npm install`
5. Start command: `npm run start`
6. Add environment variables from `.env.example`
7. Set MongoDB connection string

### **Option B: Railway.app**

1. Sign up at https://railway.app
2. Create new project from GitHub
3. Link `/server` folder
4. Add MongoDB plugin
5. Set environment variables

### **Option C: AWS, Google Cloud, Azure**

Use their App Engine / Container services

---

## 🗄️ Database Setup

1. Create MongoDB Atlas cluster: https://www.mongodb.com/cloud/atlas
2. Get connection string: `mongodb+srv://user:pass@cluster.mongodb.net/db`
3. Add to backend `.env` as `MONGODB_URI`

---

## 🔗 Environment Variables Needed

### **Frontend (.env)**
```
VITE_API_URL=https://your-backend.com/api
VITE_GOOGLE_GEMINI_API_KEY=your_gemini_key
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_PUBLISHABLE_KEY=your_key
```

### **Backend (.env)**
```
MONGODB_URI=mongodb+srv://user:pass@cluster.net/db
JWT_SECRET=your_secret_key
PORT=5000
CORS_ORIGIN=https://your-vercel-url.vercel.app
NODE_ENV=production
GOOGLE_GEMINI_API_KEY=your_gemini_key
```

---

## 🧪 Testing After Deployment

1. Frontend: `https://your-app.vercel.app`
2. Try login
3. Check console for API errors
4. Verify backend connectivity

---

## 🐛 Troubleshooting

**Issue**: CORS errors
- **Solution**: Update `CORS_ORIGIN` in backend `.env`

**Issue**: 404 on routes
- **Solution**: Vercel config automatically handles SPA routing

**Issue**: API not connecting
- **Solution**: Check `VITE_API_URL` environment variable

---

## 📝 Quick Deploy Script

```bash
# Frontend: Already configured in Vercel

# Backend: Deploy to Render
cd server
# Configure on Render dashboard with credentials above
```

