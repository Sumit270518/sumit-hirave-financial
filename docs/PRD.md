# Product Requirements Document (PRD)

## 1. Title & Executive Summary
- **Product Name:** Financial Habit Builder & Wealth Growth Tracker
- **Target Audience:** College students, interns, and young professionals (ages 18–32).
- **Core Value Proposition:** Most young individuals struggle with personal finance not because of a lack of mathematical knowledge, but due to inconsistent daily habits and a disconnect between micro-spending and long-term net worth. FinHabit bridges this gap by linking daily habit completion streaks directly with wealth accumulation trajectories, emergency buffer goals, and asset allocation milestones.

---

## 2. Problem Statement
1. **Spreadsheet Fatigue:** Spreadsheets lack automated streak mechanisms, reminders, and validation, causing young earners to abandon tracking within two weeks.
2. **Double-Counting Distortions:** Standard expense trackers count savings transfers (e.g. transfers into mutual funds or fixed deposits) as consumption spending, artificially depressing reported savings rates and misleading users.
3. **Absence of Historical Valuation:** Many apps calculate net worth by retroactively applying today's asset values to past dates or simply summing all historic savings, creating inaccurate historical graphs.
4. **Intrusive Account Syncing:** Bank synchronization often breaks, raises security concerns, and promotes passive observation rather than active, mindful spending discipline.

---

## 3. Objectives & KPIs
| Objective | Measurable KPI |
| :--- | :--- |
| **Habit Consistency** | Over 70% 7-day habit streak retention among active users. |
| **Savings Acceleration** | Measured increase in monthly savings rate (Savings = Income - Consumption Expenses). |
| **Debt Paydown Clarity** | 100% accurate net worth tracking (Net Worth = Assets - Liabilities) through dated snapshots. |
| **Data Integrity** | Zero double-counting of internal transfers and zero cross-user record leaks. |

---

## 4. User Personas
### Persona 1: Priya Sharma (College Student / Intern)
- **Age:** 20
- **Income:** Monthly stipend of ₹15,000 + freelance side gigs.
- **Goals:** Build a ₹20,000 emergency fund, stop overspending on weekend food deliveries, and establish a habit of logging UPI micro-expenses daily.
- **Pain Points:** Loses track of small ₹50–₹200 transactions; finds traditional banking apps confusing.

### Persona 2: Alex Rivera (Junior Software Engineer)
- **Age:** 24
- **Income:** Monthly salary of ₹65,000.
- **Goals:** Pay down ₹80,000 student loan, save for a new workstation, and build a ₹300,000 net worth through index mutual funds.
- **Pain Points:** Wants clear separation between money spent on consumption (rent, food, shopping) vs. money transferred to investments.

---

## 5. Scope & Functional Requirements

### 5.1 Authentication & Profile Management
- Secure email & password registration with minimum 6 characters and password matching.
- Role-based authorization (`user` vs `admin`).
- Protection against self-assignment of administrative roles during registration.
- Profile customization: Preferred currency (INR ₹, USD $, EUR €, GBP £), monthly budget thresholds, notification preferences, and password modification.

### 5.2 Transaction Management
- Categorized income and expense records.
- Strict 2-decimal precision to avoid floating-point drift.
- **Internal Transfer Segregation:** Distinct handling for transfers into savings/investments to avoid double-counting.
- Full filtering by date range, category, and text search.
- One-click CSV export of user-owned records.

### 5.3 Financial Habit Tracker
- Cadences supported: Daily, Weekly, Monthly.
- Atomic completion records with unique compound index `{ habit: 1, periodKey: 1 }` preventing duplicate completions.
- Streak algorithm: Real-time calculation of current streak and all-time longest streak.
- Quick completion undo capability.
- Detailed historical log viewer.

### 5.4 Savings Goals
- Target amount, current balance, and target date.
- Contribution & withdrawal logs creating an immutable audit trail.
- Guard against invalid withdrawals exceeding the current saved balance.
- Automatic milestone detection (auto-switches status to `completed` upon reaching 100%).

### 5.5 Wealth Growth Tracker
- Asset categories: Cash, Bank Savings, Fixed Deposits, Investments, Retirement Savings, Property, Gold, Other.
- Liability categories: Personal Loans, Credit Card Debt, Education Loans, Vehicle Loans, Mortgages, Other.
- Net Worth formula: $\text{Net Worth} = \sum \text{Assets} - \sum \text{Liabilities}$.
- Dated valuation snapshots (`NetWorthSnapshot`) preserved per month.

### 5.6 Admin Panel & Moderation
- Aggregated platform KPIs (Total Users, Active/Suspended, Financial Records, Tickets).
- User directory with search and instant account suspend/reactivate toggles.
- Feedback & Complaints ticketing system: Public user resolution notes separated from confidential internal developer notes.
- Security audit log capturing privileged administrative actions.

---

## 6. Non-Functional Requirements
- **Security:** Password hashing using bcrypt (salt rounds = 10), JWT tokens with expiry, HTTP Helmet headers, rate limiting on sensitive routes, and object-level ownership checks on all endpoints.
- **Performance:** Sub-100ms API response times for dashboard aggregation queries.
- **Reliability:** Self-contained in-memory MongoDB fallback for frictionless local evaluation when external databases are unavailable.
- **Usability:** Responsive, accessible UI built with Tailwind CSS, clean typography, intuitive modals, and helpful empty states.

---

## 7. Assumptions & Constraints
- Phase 1 relies on user-entered transaction and asset values; automated live banking open-banking APIs are deferred to Phase 2.
- Currency conversions do not execute real-time Forex trades; amounts are stored and displayed in the user's preferred denomination.
- Free-tier hosting environments (e.g. Render free tier) may experience initial spin-up latency on cold requests.
