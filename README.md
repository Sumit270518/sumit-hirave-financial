# Financial Habit Builder & Wealth Growth Tracker

[![Full-Stack MERN](https://img.shields.io/badge/Stack-MERN-10b981.svg)](https://github.com)
[![Testing](https://img.shields.io/badge/Vitest-19%2F19%20Passing-success.svg)](https://vitest.dev)
[![Production Ready](https://img.shields.io/badge/Deployment-Render%20%2B%20Vercel-blue.svg)](https://vercel.com)
[![License](https://img.shields.io/badge/License-MIT-purple.svg)](LICENSE)

> A full-stack financial wellness platform architected for students, interns, and young professionals to master budgeting, build persistent daily financial habits, track assets and liabilities, and visualize long-term net worth compounding.

---

## 🌟 Key Features

- **Personalized Financial Dashboard:** Aggregated period income, consumption expenses, net savings, savings rate %, current assets, liabilities, and net worth calculated in real time from persistent database records.
- **Strict Financial Accounting & Segregation:** Internal savings transfers (e.g., transfers to mutual funds or fixed deposits) are segregated from consumption expenses to prevent double-counting.
- **Financial Habit Tracker:** Daily, weekly, and monthly habit cadences with monotonic streak calculations, duplicate prevention (`{ habit: 1, periodKey: 1 }`), and complete audit history.
- **Atomic Savings Goals:** Target amounts, target dates, and verified contribution/withdrawal transactions with overdraw protection.
- **Wealth Growth & Net Worth Tracker:** Full asset and debt portfolio tracking with dated valuation snapshots (`NetWorthSnapshot`) to chart genuine historical growth.
- **Administrative Control Panel:** System-wide metrics, user account moderation (suspension/reactivation with audit trails), and ticketing resolver with separated public and private notes.
- **Privacy-First Design:** Individual user transactions and sensitive balances are strictly shielded from administrative consoles.
- **1-Click Evaluation Login:** Pre-configured demo accounts for instant evaluation by professors and reviewers.

---

## 🛠️ Technology Stack

### Frontend
- **Framework:** React 18 with Vite
- **Routing:** React Router DOM v6 (Guarded Public, Protected User, and Admin Routes)
- **Styling:** Tailwind CSS with custom emerald and charcoal palette
- **Data Visualizations:** Recharts (Cashflow bar charts, asset allocation donuts, net worth progression lines)
- **Icons:** Lucide React
- **HTTP Client:** Axios with JWT request interceptors
- **Notifications:** React Hot Toast

### Backend
- **Runtime:** Node.js & Express.js (REST API v1)
- **Database:** MongoDB with Mongoose ODM (Atlas & Local support + Embedded Memory Fallback)
- **Authentication:** JWT (HMAC SHA-256) with bcrypt password hashing
- **Security:** Helmet HTTP headers, CORS whitelisting, Express Rate Limiting
- **Error Handling:** Centralized operational error middleware and standard error formatting

### Testing & QA
- **Unit & Integration:** Vitest, Supertest, and `mongodb-memory-server` (19 automated tests passing 100%)

---

## 📁 Project Structure

```
financial-habit-builder/
├── client/                      # React + Vite Frontend
│   ├── public/                  # Static assets & favicon
│   ├── src/
│   │   ├── api/                 # Axios configuration
│   │   ├── components/          # Reusable UI widgets, cards, modals, layout
│   │   ├── context/             # AuthContext session provider
│   │   ├── layouts/             # AppLayout & AdminLayout wrappers
│   │   ├── pages/               # Public, Auth, User, and Admin views
│   │   ├── routes/              # Protected & Admin route guards
│   │   ├── utils/               # Currency (INR) & date formatters
│   │   ├── App.jsx              # App root component
│   │   └── main.jsx             # React DOM entry
│   ├── .env.example
│   ├── package.json
│   ├── vercel.json              # Vercel SPA rewrite rules
│   └── vite.config.js
├── server/                      # Express.js REST API
│   ├── src/
│   │   ├── config/              # MongoDB connection & memory fallback
│   │   ├── controllers/         # MVC domain controllers
│   │   ├── middleware/          # Auth, RBAC, error, and rate limiter middleware
│   │   ├── models/              # 13 Mongoose schemas & indexes
│   │   ├── routes/              # Versioned API routes (/api/v1)
│   │   ├── scripts/             # Database seed script
│   │   ├── utils/               # JWT token utilities
│   │   ├── app.js               # Express application configuration
│   │   └── server.js            # Server entry (0.0.0.0 binding)
│   ├── tests/                   # 6 Vitest test suites (19 tests)
│   ├── .env.example
│   ├── package.json
│   ├── render.yaml              # Render Cloud Blueprint specification
│   └── vitest.config.js
├── scripts/
│   └── seed.js                  # Root seed runner wrapper
├── docs/                        # Comprehensive Architecture & Project Documentation
│   ├── PRD.md                   # Product Requirements Document
│   ├── TECHNICAL_DOCUMENTATION.md # Architecture, Calculations & Security
│   ├── DATABASE_SCHEMA.md       # Entity relationships & 13 Mongoose schemas
│   ├── API_DOCUMENTATION.md     # Complete REST endpoint specifications
│   ├── TESTING.md               # Test coverage & verification results
│   └── DEPLOYMENT.md            # Live deployment guide for Atlas, Render, Vercel
├── .gitignore
├── package.json                 # Root script orchestration
└── README.md
```

---

## 🚀 Quick Start (Local Development)

### 1. Prerequisites
- Node.js (v18.0.0 or higher)
- npm (v9.0.0 or higher)
- Git

### 2. Clone Repository & Install Dependencies
```bash
# Clone the repository
git clone https://github.com/<YOUR_USERNAME>/financial-habit-builder.git
cd financial-habit-builder

# Install all dependencies across root, client, and server
npm run install:all
```

### 3. Environment Configuration
The project comes pre-configured with dev defaults. You can copy the example `.env` files:
```bash
# Server configuration
cp server/.env.example server/.env

# Client configuration
cp client/.env.example client/.env
```

### 4. Seed Development Database
Populate realistic demo records including demo users, habits, streaks, transactions, goals, assets, and net worth snapshots:
```bash
npm run seed
```
> **Note:** If local MongoDB is not running on port 27017, the application automatically initializes an embedded in-memory MongoDB instance for seamless local testing.

### 5. Start the Application
Run both frontend and backend concurrently with one command:
```bash
npm run dev
```
- **Frontend:** [http://localhost:5173](http://localhost:5173)
- **Backend API:** [http://localhost:5000](http://localhost:5000)
- **API Health Check:** [http://localhost:5000/api/v1/health](http://localhost:5000/api/v1/health)

---

## 🔑 Demo Accounts for Evaluation

On the Login page, click any of the **Quick 1-Click Evaluation Fill** buttons to test the platform immediately:

| Persona | Email | Password | Role / Access |
| :--- | :--- | :--- | :--- |
| **Alex Rivera** *(Young Professional)* | `alex@example.com` | `Password123!` | Standard User (Active habits, salary, goals, assets) |
| **Priya Sharma** *(Student / Intern)* | `priya@example.com` | `Password123!` | Standard User (Stipend, budget check, college goals) |
| **System Administrator** | `admin@wealthtracker.local` | `AdminSecurePass123!` | Administrator (Full access to `/admin` panel) |

---

## 🧪 Automated Testing

Execute the automated test suite covering authentication, authorization, financial integrity, habit streaks, savings goals, wealth calculations, and admin controls:
```bash
npm test
```
**Test Results:**
- 6 test files passed
- 19 individual test cases passed (100% pass rate)

---

## 🌐 Production Deployment

The platform is designed for zero-cost deployment on free-tier compatible services:
- **Database:** MongoDB Atlas M0 Free Cluster (`MONGODB_URI`)
- **Backend:** Render Web Service (`https://your-backend.onrender.com`)
- **Frontend:** Vercel Static Deployment (`https://your-frontend.vercel.app`)

For detailed step-by-step instructions, see [docs/DEPLOYMENT.md](file:///c:/Users/HP/OneDrive/Desktop/financial/docs/DEPLOYMENT.md).

---

## 📄 Documentation Index
- [Product Requirements Document (PRD.md)](file:///c:/Users/HP/OneDrive/Desktop/financial/docs/PRD.md)
- [Technical Architecture & Calculations (TECHNICAL_DOCUMENTATION.md)](file:///c:/Users/HP/OneDrive/Desktop/financial/docs/TECHNICAL_DOCUMENTATION.md)
- [Database Entity Schema (DATABASE_SCHEMA.md)](file:///c:/Users/HP/OneDrive/Desktop/financial/docs/DATABASE_SCHEMA.md)
- [API Documentation (API_DOCUMENTATION.md)](file:///c:/Users/HP/OneDrive/Desktop/financial/docs/API_DOCUMENTATION.md)
- [Testing & QA Report (TESTING.md)](file:///c:/Users/HP/OneDrive/Desktop/financial/docs/TESTING.md)
- [Deployment Guide (DEPLOYMENT.md)](file:///c:/Users/HP/OneDrive/Desktop/financial/docs/DEPLOYMENT.md)

---

## 🎓 Capstone Project Declaration
This project is submitted in fulfillment of academic evaluation requirements for full-stack software engineering. All core algorithms, schemas, tests, and user interfaces are original implementations with zero placeholder code.
