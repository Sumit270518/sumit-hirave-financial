# Live Production Deployment Guide

This guide provides reproducible, step-by-step instructions for deploying the **Financial Habit Builder & Wealth Growth Tracker** to GitHub, MongoDB Atlas, Render, and Vercel.

---

## 1. Overview of Deployment Architecture
- **Source Control:** GitHub
- **Persistent Cloud Database:** MongoDB Atlas (M0 Free Tier)
- **Backend REST API:** Render (Web Service Free Tier)
- **Frontend SPA:** Vercel (Hobby Free Tier)

---

## 2. Step 1: GitHub Repository Setup

1. Initialize git and commit all source code in the root directory:
```bash
git init
git add .
git commit -m "feat: complete Financial Habit Builder & Wealth Growth Tracker full-stack application"
```

2. Create a new repository on your GitHub account (e.g., `financial-habit-builder`).
3. Link and push the repository:
```bash
git remote add origin https://github.com/<YOUR_GITHUB_USERNAME>/financial-habit-builder.git
git branch -M main
git push -u origin main
```
> **Security Audit:** Verify that `.gitignore` prevents `.env` files from being committed. Only `.env.example` should be on GitHub.

---

## 3. Step 2: MongoDB Atlas Cloud Database Setup

1. Sign in to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas).
2. Create a free shared cluster:
   - Select **M0 (Shared)** free tier.
   - Choose a nearby region (e.g., AWS Mumbai / ap-south-1).
   - Cluster Name: `FinHabitCluster`.
3. Create a Database User:
   - Navigate to **Security** -> **Database Access**.
   - Click **Add New Database User**.
   - Authentication Method: **Password**.
   - Username: `finhabit_admin`.
   - Set a strong password (save this securely).
   - Database User Privileges: `Read and write to any database`.
4. Configure Network Access:
   - Navigate to **Security** -> **Network Access**.
   - Click **Add IP Address**.
   - Choose **Allow Access from Anywhere** (`0.0.0.0/0`) so Render instances can connect.
5. Obtain the Connection String:
   - Click **Database** -> **Connect** -> **Drivers (Node.js)**.
   - Copy the URI, which looks like:
     ```
     mongodb+srv://finhabit_admin:<PASSWORD>@finhabitcluster.xxxx.mongodb.net/financial_tracker?retryWrites=true&w=majority
     ```
   - Replace `<PASSWORD>` with your user password.

---

## 4. Step 3: Backend Deployment on Render

1. Sign in to [Render](https://dashboard.render.com/).
2. Click **New +** -> **Web Service**.
3. Connect your GitHub repository (`financial-habit-builder`).
4. Configure service settings:
   - **Name:** `finhabit-backend`
   - **Region:** Any free region (e.g., Oregon or Frankfurt)
   - **Root Directory:** `server`
   - **Environment:** `Node`
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
   - **Plan:** `Free`
5. Configure Environment Variables in the Render dashboard:
   | Key | Value |
   | :--- | :--- |
   | `NODE_ENV` | `production` |
   | `PORT` | `10000` |
   | `MONGODB_URI` | `mongodb+srv://finhabit_admin:<PASSWORD>@.../financial_tracker?retryWrites=true&w=majority` |
   | `JWT_SECRET` | *(Generate a 32+ character random string)* |
   | `JWT_EXPIRES_IN` | `7d` |
   | `CLIENT_URL` | `https://<YOUR-VERCEL-FRONTEND-URL>.vercel.app` *(update after Step 4)* |
6. Click **Create Web Service**.
7. Once deployed, note down your backend URL:
   `https://finhabit-backend.onrender.com`
8. Verify health check by visiting:
   `https://finhabit-backend.onrender.com/api/v1/health`
   *(Should return `"status": "healthy"` and `"database": { "status": "connected" }`)*

---

## 5. Step 4: Frontend Deployment on Vercel

1. Sign in to [Vercel](https://vercel.com/).
2. Click **Add New...** -> **Project**.
3. Import your GitHub repository (`financial-habit-builder`).
4. Configure project settings:
   - **Framework Preset:** `Vite`
   - **Root Directory:** Edit and select `client`
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
5. Add Environment Variable:
   | Key | Value |
   | :--- | :--- |
   | `VITE_API_URL` | `https://finhabit-backend.onrender.com/api/v1` *(Your Render backend URL)* |
6. Click **Deploy**.
7. Vercel will build the frontend and provide your production URL:
   `https://finhabit-client.vercel.app`

---

## 6. Step 5: Final CORS Handshake & Verification

1. Go back to Render -> **finhabit-backend** -> **Environment**.
2. Update `CLIENT_URL` to your exact Vercel frontend URL:
   `https://finhabit-client.vercel.app`
3. Save changes (Render will automatically redeploy with the updated CORS rule).

---

## 7. Post-Deployment Verification Checklist

Verify the following 10 checkpoints on the live URL:
1. **Health Check:** `https://your-backend.onrender.com/api/v1/health` returns `healthy`.
2. **Landing Page:** Public home page loads cleanly on Vercel with compound wealth simulator working.
3. **Registration:** Create a new test user account; verification that it enters the database.
4. **Authentication:** Login and logout operate smoothly with JWT tokens.
5. **Transactions:** Create an income and expense record; verify that totals persist on page reload.
6. **Internal Transfers:** Log an internal savings transfer; verify that consumption expense does not increase.
7. **Habits:** Mark a habit completed; verify streak increments and cannot be duplicated.
8. **Savings Goals:** Contribute to a savings goal; verify atomic balance update and audit entry.
9. **Wealth Analytics:** Add an asset and liability; check net worth calculation and dated snapshot chart.
10. **Admin Panel:** Log in with admin credentials; verify platform KPIs and user management table.
