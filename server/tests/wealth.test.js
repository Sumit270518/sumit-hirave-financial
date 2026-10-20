import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import app from '../src/app.js';

describe('Wealth Growth Tracker & Net Worth Suite', () => {
  let userToken;

  beforeEach(async () => {
    const res = await request(app).post('/api/v1/auth/register').send({
      name: 'Wealth Builder',
      email: 'wealth@test.com',
      password: 'Password123!',
    });
    userToken = res.body.token;
  });

  it('should accurately calculate net worth as total assets minus total liabilities', async () => {
    // 1. Add Cash Asset ₹10,000
    await request(app)
      .post('/api/v1/wealth/assets')
      .set('Authorization', `Bearer ${userToken}`)
      .send({
        name: 'Bank Savings Account',
        category: 'Bank Savings',
        currentValue: 50000,
      });

    // 2. Add Investment Asset ₹75,000
    await request(app)
      .post('/api/v1/wealth/assets')
      .set('Authorization', `Bearer ${userToken}`)
      .send({
        name: 'Index Fund Investment',
        category: 'Investments',
        currentValue: 75000,
      });

    // 3. Add Credit Card Liability ₹15,000
    await request(app)
      .post('/api/v1/wealth/liabilities')
      .set('Authorization', `Bearer ${userToken}`)
      .send({
        name: 'Credit Card Bill',
        category: 'Credit Card Balance',
        outstandingAmount: 15000,
      });

    // 4. Fetch Wealth Summary
    const summaryRes = await request(app)
      .get('/api/v1/wealth/summary')
      .set('Authorization', `Bearer ${userToken}`);

    expect(summaryRes.status).toBe(200);
    const { totalAssets, totalLiabilities, netWorth } = summaryRes.body.data;

    // Assets: 50000 + 75000 = 125000
    expect(totalAssets).toBe(125000);
    // Liabilities: 15000
    expect(totalLiabilities).toBe(15000);
    // Net worth = 125000 - 15000 = 110000
    expect(netWorth).toBe(110000);
  });

  it('should preserve dated net worth snapshots for historical comparison', async () => {
    // Add asset to trigger snapshot creation
    await request(app)
      .post('/api/v1/wealth/assets')
      .set('Authorization', `Bearer ${userToken}`)
      .send({
        name: 'Mutual Fund SIP',
        category: 'Investments',
        currentValue: 30000,
      });

    const historyRes = await request(app)
      .get('/api/v1/wealth/history')
      .set('Authorization', `Bearer ${userToken}`);

    expect(historyRes.status).toBe(200);
    expect(Array.isArray(historyRes.body.data)).toBe(true);
    expect(historyRes.body.data.length).toBeGreaterThanOrEqual(1);
    expect(historyRes.body.data[0].netWorth).toBe(30000);
  });
});
