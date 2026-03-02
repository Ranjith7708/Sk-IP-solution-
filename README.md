# SK IP Solution — LIC Agent Management Portal

Full-stack web application for LIC agents with real-time database persistence.

**Stack:** Node.js · Express · SQLite (better-sqlite3) · Vanilla JS/HTML/CSS

---

## 🚀 LOCAL SETUP (Run on your computer)

### Step 1 — Install Node.js
Download from https://nodejs.org (choose LTS version 18+)
Verify: `node -v` and `npm -v`

### Step 2 — Install dependencies
```bash
cd sk-ip-solution
npm install
```

### Step 3 — Run the app
```bash
npm start
```

Open your browser: **http://localhost:3000**

That's it! Data is saved in `db/skipsolution.db` permanently.

---

## ☁️ FREE DEPLOYMENT ON RAILWAY (Live on the Internet)

Railway gives you **free hosting** with a real public URL.

### Step 1 — Create GitHub repository
1. Go to https://github.com and sign up (free)
2. Click **"New repository"** → Name it `sk-ip-solution` → Click **Create**
3. On your computer, open terminal in the project folder:
```bash
git init
git add .
git commit -m "Initial commit - SK IP Solution"
git remote add origin https://github.com/YOUR_USERNAME/sk-ip-solution.git
git push -u origin main
```

### Step 2 — Deploy on Railway
1. Go to https://railway.app and sign up with your GitHub account (free)
2. Click **"New Project"** → **"Deploy from GitHub repo"**
3. Select your `sk-ip-solution` repository
4. Railway auto-detects Node.js and deploys automatically ✅
5. Click **"Generate Domain"** → You get a free URL like:
   `https://sk-ip-solution-production.up.railway.app`

### Step 3 — Set environment variables (optional)
In Railway dashboard → Your project → Variables:
```
NODE_ENV=production
PORT=3000
```

### Step 4 — Share your URL
Send the Railway URL to anyone — they can access your app from any device!

---

## 🔄 UPDATING THE APP

Whenever you make changes:
```bash
git add .
git commit -m "Update: describe your change"
git push
```
Railway auto-deploys within 1-2 minutes! ⚡

---

## 📂 PROJECT STRUCTURE

```
sk-ip-solution/
├── server.js          ← Backend (Node.js + Express + SQLite)
├── package.json       ← Dependencies
├── railway.toml       ← Railway deployment config
├── .gitignore
├── db/
│   └── skipsolution.db  ← SQLite database (auto-created)
└── public/
    └── index.html     ← Full frontend app
```

---

## 🛠️ API ENDPOINTS

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/clients | Get all clients |
| POST | /api/clients | Add new client |
| PUT | /api/clients/:id | Update client |
| DELETE | /api/clients/:id | Delete client |
| GET | /api/leads | Get all leads |
| POST | /api/leads | Add new lead |
| PUT | /api/leads/:id | Update lead stage |
| DELETE | /api/leads/:id | Delete lead |
| GET | /api/calls | Get call logs |
| POST | /api/calls | Log a call |
| DELETE | /api/calls/:id | Delete call log |
| GET | /api/appointments | Get appointments |
| POST | /api/appointments | Add appointment |
| GET | /api/stats | Dashboard statistics |

---

## 🆓 FREE TIER LIMITS (Railway)

- **500 hours/month** compute (enough for ~16hrs/day)
- **1GB RAM**, **1GB disk**
- **SQLite database** included (no extra cost)
- Custom domain support
- Upgrade to paid plan (~$5/mo) for 24/7 uptime

---

## 💡 TIPS

- **Backup your database:** Download `db/skipsolution.db` regularly
- **Custom domain:** In Railway → Settings → Domains → Add your domain
- **Always-on:** Upgrade to Railway Hobby plan ($5/mo) for 24/7 availability
- **More storage:** SQLite handles up to 100,000+ clients easily

---

Built with ❤️ for SK IP Solution — LIC Agent Management
