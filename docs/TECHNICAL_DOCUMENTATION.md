# Technical Architecture & Engineering Documentation

## 1. System Architecture Overview
The **Financial Habit Builder & Wealth Growth Tracker** is engineered as a decoupled, multi-tier modern full-stack application following MVC and RESTful design patterns.

```
+-------------------------------------------------------------+
|                      React 18 Client                        |
|   (Vite, Tailwind CSS, React Router v6, Recharts, Axios)    |
+------------------------------+------------------------------+
                               | HTTPS / JSON (REST API)
                               v
+-------------------------------------------------------------+
|                      Express.js Server                      |
| (Helmet, CORS, Rate Limiters, JWT Auth, Centralized Errors) |
+------------------------------+------------------------------+
                               | Mongoose ODM
                               v
+-------------------------------------------------------------+
|                      MongoDB Database                       |
|   (Mongoose Schemas, Unique Compound Indexes, Snapshots)    |
+-------------------------------------------------------------+
```

---

## 2. Authentication & Authorization Architecture

### 2.1 Token Strategy
- **Mechanism:** Stateless JSON Web Tokens (JWT) signed with HMAC SHA-256 (`HS256`).
- **Secret Key:** `process.env.JWT_SECRET` (fallback for dev provided).
- **Expiration:** Default `7d` via `process.env.JWT_EXPIRES_IN`.
- **Transmission:** Clients transmit the token via standard `Authorization: Bearer <token>` HTTP header, with fallback support for HTTP-only cookies.

### 2.2 Role-Based Access Control (RBAC)
- Supported Roles: `user` and `admin`.
- **Protection Middleware:**
  - `protect`: Verifies token signature, extracts user ID, queries database, verifies account is not `suspended`, and attaches `req.user`.
  - `authorize('admin')`: Restricts administrative routes strictly to users with `role === 'admin'`.
- **Privilege Escalation Prevention:** The registration endpoint explicitly overrides any client-supplied `role` field to force `role = 'user'`.

### 2.3 Object-Level Authorization (IDOR Prevention)
Every endpoint that modifies or deletes user resources (e.g. `PATCH /api/v1/transactions/:id`, `DELETE /api/v1/goals/:id`, `GET /api/v1/wealth/assets/:id`) verifies that:
```javascript
if (resource.user.toString() !== req.user._id.toString()) {
  return res.status(403).json({ success: false, message: 'Not authorized.' });
}
```

---

## 3. Financial Integrity & Calculation Rules

### 3.1 Currency & Precision Handling
All monetary fields (`amount`, `currentValue`, `outstandingAmount`, `targetAmount`) are normalized using standard two-decimal precision setters:
$$\text{amount} = \frac{\text{round}(\text{val} \times 100)}{100}$$
This prevents IEEE-754 floating point arithmetic anomalies (e.g., $0.1 + 0.2 = 0.30000000000000004$) from skewing database totals.

### 3.2 Savings & Savings Rate Formula
- **Period Income:** Total of all verified `type === 'income'` transactions within the start and end dates.
- **Consumption Expenses:** Total of all `type === 'expense'` transactions where `isInternalTransfer === false`.
- **Internal Transfers:** Logged as `type === 'expense'` with `isInternalTransfer === true`. They represent movements into savings/investments and are strictly excluded from consumption totals.
- **Formulas:**
  $$\text{Net Savings} = \text{Period Income} - \text{Consumption Expenses}$$
  $$\text{Savings Rate} (\%) = \begin{cases} \left( \frac{\text{Net Savings}}{\text{Period Income}} \right) \times 100, & \text{if Period Income} > 0 \\ 0, & \text{otherwise} \end{cases}$$

### 3.3 Net Worth & Dated Valuation Snapshots
- **Current Net Worth:**
  $$\text{Net Worth} = \sum \text{Asset Current Values} - \sum \text{Liability Outstanding Amounts}$$
- **Snapshot Integrity:** Net worth trajectory is not derived by retroactively summing historic transactions. Instead, dated monthly snapshots (`NetWorthSnapshot`) are recorded with a unique `{ user: 1, dateKey: 1 }` index whenever asset or debt values are modified.

### 3.4 Habit Streak Calculation
- Period keys are generated according to habit frequency:
  - Daily: `YYYY-MM-DD`
  - Weekly: `YYYY-Www`
  - Monthly: `YYYY-MM`
- A unique compound index on `HabitCompletion` (`{ habit: 1, periodKey: 1 }`) physically prevents duplicate completions for the same period.
- Streaks increment monotonically on verified completions and safely decrement on undos.

---

## 4. Security & Hardening Implementation
1. **Helmet:** Injects security headers (`X-Content-Type-Options`, `X-Frame-Options`, `Strict-Transport-Security`, `X-XSS-Protection`).
2. **CORS:** Configured with an explicit whitelist of origins (`CLIENT_URL`, `http://localhost:5173`) and `credentials: true`.
3. **Rate Limiting:**
   - General API limiter: 300 requests per 15 minutes.
   - Authentication limiter: 30 attempts per 15 minutes (mitigates brute-force credential stuffing).
4. **Password Storage:** Salted and hashed using `bcryptjs` with cost factor 10. Password hashes are excluded from query results by default (`select: false`).
5. **Sanitization & Centralized Error Handling:** All errors pass through `errorHandler` middleware. Stack traces are suppressed in production.

---

## 5. Embedded In-Memory MongoDB Fallback
To ensure that evaluators or developers can test the application locally without requiring a pre-installed `mongod` service, `server/src/config/db.js` includes an intelligent fallback:
If `process.env.MONGODB_URI` points to localhost and no daemon is running, it automatically boots an isolated embedded instance via `mongodb-memory-server`.
