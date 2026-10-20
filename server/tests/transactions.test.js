import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import app from '../src/app.js';

describe('Transaction Management & Financial Integrity Suite', () => {
  let user1Token;
  let user2Token;

  beforeEach(async () => {
    const u1 = await request(app).post('/api/v1/auth/register').send({
      name: 'User One',
      email: 'user1@test.com',
      password: 'Password123!',
    });
    user1Token = u1.body.token;

    const u2 = await request(app).post('/api/v1/auth/register').send({
      name: 'User Two',
      email: 'user2@test.com',
      password: 'Password123!',
    });
    user2Token = u2.body.token;
  });

  it('should create valid income and expense transactions', async () => {
    const incomeRes = await request(app)
      .post('/api/v1/transactions')
      .set('Authorization', `Bearer ${user1Token}`)
      .send({
        type: 'income',
        amount: 50000,
        category: 'Salary',
        description: 'Monthly tech salary',
      });

    expect(incomeRes.status).toBe(201);
    expect(incomeRes.body.data.amount).toBe(50000);
    expect(incomeRes.body.data.type).toBe('income');

    const expenseRes = await request(app)
      .post('/api/v1/transactions')
      .set('Authorization', `Bearer ${user1Token}`)
      .send({
        type: 'expense',
        amount: 15000,
        category: 'Rent',
        description: 'Monthly apartment rent',
      });

    expect(expenseRes.status).toBe(201);
    expect(expenseRes.body.data.amount).toBe(15000);
  });

  it('should reject invalid amounts (negative, zero, non-numeric)', async () => {
    const invalidRes1 = await request(app)
      .post('/api/v1/transactions')
      .set('Authorization', `Bearer ${user1Token}`)
      .send({
        type: 'expense',
        amount: -500,
        category: 'Food',
      });
    expect(invalidRes1.status).toBe(400);

    const invalidRes2 = await request(app)
      .post('/api/v1/transactions')
      .set('Authorization', `Bearer ${user1Token}`)
      .send({
        type: 'expense',
        amount: 0,
        category: 'Food',
      });
    expect(invalidRes2.status).toBe(400);
  });

  it('should prevent cross-user transaction access or deletion', async () => {
    const tx = await request(app)
      .post('/api/v1/transactions')
      .set('Authorization', `Bearer ${user1Token}`)
      .send({
        type: 'expense',
        amount: 2000,
        category: 'Utilities',
      });

    const txId = tx.body.data._id;

    // User 2 attempts to fetch User 1's transaction
    const getRes = await request(app)
      .get(`/api/v1/transactions/${txId}`)
      .set('Authorization', `Bearer ${user2Token}`);
    expect(getRes.status).toBe(403);

    // User 2 attempts to delete User 1's transaction
    const delRes = await request(app)
      .delete(`/api/v1/transactions/${txId}`)
      .set('Authorization', `Bearer ${user2Token}`);
    expect(delRes.status).toBe(403);
  });

  it('should exclude internal transfers from consumption expenses in monthly report', async () => {
    const now = new Date();
    // 1. Regular Income
    await request(app)
      .post('/api/v1/transactions')
      .set('Authorization', `Bearer ${user1Token}`)
      .send({
        type: 'income',
        amount: 60000,
        category: 'Salary',
        date: now,
      });

    // 2. Regular Consumption Expense
    await request(app)
      .post('/api/v1/transactions')
      .set('Authorization', `Bearer ${user1Token}`)
      .send({
        type: 'expense',
        amount: 20000,
        category: 'Food',
        date: now,
      });

    // 3. Internal Savings Transfer (marked isInternalTransfer: true)
    await request(app)
      .post('/api/v1/transactions')
      .set('Authorization', `Bearer ${user1Token}`)
      .send({
        type: 'expense',
        amount: 15000,
        category: 'Savings transfers',
        isInternalTransfer: true,
        date: now,
      });

    const reportRes = await request(app)
      .get(`/api/v1/transactions/monthly-report?year=${now.getFullYear()}&month=${now.getMonth() + 1}`)
      .set('Authorization', `Bearer ${user1Token}`);

    expect(reportRes.status).toBe(200);
    const { summary } = reportRes.body;
    expect(summary.totalIncome).toBe(60000);
    // Consumption expense should ONLY be 20000 (not 35000!)
    expect(summary.totalExpense).toBe(20000);
    expect(summary.totalTransfers).toBe(15000);
    // Savings = 60000 - 20000 = 40000
    expect(summary.savings).toBe(40000);
    // Savings rate = (40000 / 60000) * 100 = 66.7%
    expect(summary.savingsRate).toBe(66.7);
  });
});
