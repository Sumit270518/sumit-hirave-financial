# REST API Documentation (Version 1.0)

All endpoints are versioned under `/api/v1`. Protected endpoints require an `Authorization: Bearer <jwt_token>` header.

---

## 1. System Health
### `GET /api/v1/health`
- **Access:** Public
- **Description:** Verifies application uptime and MongoDB connection state without exposing credentials.
- **Response (200 OK):**
```json
{
  "status": "healthy",
  "timestamp": "2026-10-21T03:30:00.000Z",
  "uptimeSeconds": 3600,
  "environment": "production",
  "database": {
    "status": "connected",
    "name": "financial_tracker"
  },
  "version": "1.0.0"
}
```

---

## 2. Authentication (`/api/v1/auth`)

### `POST /api/v1/auth/register`
- **Access:** Public (Rate-limited)
- **Body:**
```json
{
  "name": "Rahul Verma",
  "email": "rahul@example.com",
  "password": "Password123!",
  "confirmPassword": "Password123!",
  "phone": "+91 9876543210"
}
```
- **Response (201 Created):**
```json
{
  "success": true,
  "message": "Registration successful! Welcome aboard.",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6...",
  "user": { "_id": "...", "name": "Rahul Verma", "email": "rahul@example.com", "role": "user" },
  "profile": { "preferredCurrency": "INR", "monthlyBudget": 25000 }
}
```

### `POST /api/v1/auth/login`
- **Access:** Public (Rate-limited)
- **Body:**
```json
{
  "email": "rahul@example.com",
  "password": "Password123!"
}
```
- **Response (200 OK):** Returns JWT token, user object, and financial profile.

### `POST /api/v1/auth/logout`
- **Access:** Public
- **Response (200 OK):** Clears authentication session cookies.

### `GET /api/v1/auth/me`
- **Access:** Protected (User/Admin)
- **Response (200 OK):** Returns authenticated user profile and settings.

---

## 3. Financial Profile (`/api/v1/profile`)

### `GET /api/v1/profile`
- **Access:** Protected
- **Response (200 OK):** User preferences and notification settings.

### `PATCH /api/v1/profile`
- **Access:** Protected
- **Body:**
```json
{
  "name": "Rahul V.",
  "phone": "+91 9988776655",
  "preferredCurrency": "INR",
  "monthlyBudget": 35000,
  "savingsTargetMonthly": 12000,
  "timezone": "Asia/Kolkata",
  "notificationPreferences": {
    "habitReminders": true,
    "budgetAlerts": true
  }
}
```

### `PATCH /api/v1/profile/password`
- **Access:** Protected
- **Body:** `{ "currentPassword": "...", "newPassword": "...", "confirmPassword": "..." }`

---

## 4. Transactions (`/api/v1/transactions`)

### `GET /api/v1/transactions`
- **Access:** Protected
- **Query Params:** `type` (income|expense), `category`, `startDate`, `endDate`, `search`, `page`, `limit`, `sortBy`, `order`.
- **Response (200 OK):** Paginated array of transactions matching criteria.

### `POST /api/v1/transactions`
- **Access:** Protected
- **Body:**
```json
{
  "type": "expense",
  "amount": 4500,
  "category": "Food",
  "description": "Weekly grocery shopping",
  "date": "2026-10-21",
  "paymentMethod": "upi",
  "isInternalTransfer": false,
  "notes": "Purchased organic supplies"
}
```

### `GET /api/v1/transactions/:id`
- **Access:** Protected (Ownership enforced)

### `PATCH /api/v1/transactions/:id`
- **Access:** Protected (Ownership enforced)

### `DELETE /api/v1/transactions/:id`
- **Access:** Protected (Ownership enforced)

### `GET /api/v1/transactions/monthly-report`
- **Access:** Protected
- **Query Params:** `year`, `month`
- **Response (200 OK):**
```json
{
  "success": true,
  "summary": {
    "totalIncome": 65000,
    "totalExpense": 28000,
    "totalTransfers": 10000,
    "savings": 37000,
    "savingsRate": 56.9,
    "transactionCount": 18
  },
  "expenseCategories": [
    { "category": "Rent", "amount": 18000, "percentage": 64.3 },
    { "category": "Food", "amount": 6000, "percentage": 21.4 }
  ]
}
```

### `GET /api/v1/transactions/export/csv`
- **Access:** Protected
- **Response (200 OK):** Returns RFC-4180 compliant CSV stream of user records.

---

## 5. Financial Habits (`/api/v1/habits`)

### `GET /api/v1/habits`
- **Access:** Protected
- **Response (200 OK):** Array of user habits with `isCompleted` status for current cycle, `currentStreak`, and `longestStreak`.

### `POST /api/v1/habits`
- **Access:** Protected
- **Body:**
```json
{
  "name": "Record expenses daily",
  "description": "Log all cash and UPI expenses before sleep",
  "frequency": "daily",
  "reminderTime": "20:00"
}
```

### `POST /api/v1/habits/:id/completions`
- **Access:** Protected
- **Description:** Marks habit completed for current period. Rejects duplicate submissions for the same period.

### `DELETE /api/v1/habits/:id/completions`
- **Access:** Protected
- **Description:** Undoes completion for current period and decrements streak.

### `GET /api/v1/habits/:id/history`
- **Access:** Protected
- **Response (200 OK):** Past 60 completion records with timestamps.

---

## 6. Savings Goals (`/api/v1/goals`)

### `GET /api/v1/goals`
- **Access:** Protected
- **Response (200 OK):** Goals with `progressPercentage`, `remainingAmount`, and `daysRemaining`.

### `POST /api/v1/goals`
- **Access:** Protected
- **Body:** `{ "name": "Emergency Fund", "targetAmount": 100000, "targetDate": "2027-04-01", "priority": "high", "category": "Emergency Fund" }`

### `POST /api/v1/goals/:id/contributions`
- **Access:** Protected
- **Body:** `{ "type": "contribution", "amount": 5000, "description": "Salary savings transfer" }`
- **Description:** Atomically modifies goal balance and inserts `GoalTransaction` audit record. Prevents withdrawals exceeding balance.

---

## 7. Wealth & Net Worth (`/api/v1/wealth`)

### `GET /api/v1/wealth/summary`
- **Access:** Protected
- **Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "totalAssets": 392500,
    "totalLiabilities": 82200,
    "netWorth": 310300,
    "monthlyNetWorthChange": 11300,
    "assetAllocation": [
      { "category": "Investments", "amount": 145000, "percentage": 36.9 },
      { "category": "Fixed Deposits", "amount": 100000, "percentage": 25.5 }
    ]
  }
}
```

### `GET /api/v1/wealth/history`
- **Access:** Protected
- **Response (200 OK):** Historical dated net worth snapshots for charts.

### `POST /api/v1/wealth/snapshot`
- **Access:** Protected
- **Description:** Captures or refreshes current month's net worth snapshot.

---

## 8. Dashboard Analytics (`/api/v1/dashboard`)

### `GET /api/v1/dashboard/stats`
- **Access:** Protected
- **Query Params:** `range` (`this-month` | `last-month` | `last-3-months` | `this-year`), `startDate`, `endDate`
- **Response (200 OK):** Aggregates KPIs, 6-month cashflow comparison, category distribution, recent transactions, and habits needing attention.

---

## 9. Notifications & Feedback

- `GET /api/v1/notifications` — Lists in-app alerts.
- `PATCH /api/v1/notifications/:id/read` — Toggles notification read state.
- `PATCH /api/v1/notifications/mark-all-read` — Marks all read.
- `POST /api/v1/feedback` — Submits ticket/complaint.
- `GET /api/v1/feedback/my` — Lists user's submitted tickets with admin resolution notes.

---

## 10. Admin Endpoints (`/api/v1/admin`)
*Strictly restricted to users with `role === 'admin'`*

- `GET /api/v1/admin/stats` — Platform KPI aggregates and registration trends.
- `GET /api/v1/admin/users` — User directory with search and pagination.
- `PATCH /api/v1/admin/users/:id/status` — Suspend or reactivate user accounts.
- `GET /api/v1/admin/feedback` — View all support tickets.
- `PATCH /api/v1/admin/feedback/:id` — Update ticket status, provide public resolution notes, and private internal notes.
- `GET /api/v1/admin/audit-logs` — Query administrative audit logs.
