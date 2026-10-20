import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import app from '../src/app.js';

describe('Savings Goals & Contribution Suite', () => {
  let userToken;

  beforeEach(async () => {
    const res = await request(app).post('/api/v1/auth/register').send({
      name: 'Goal Getter',
      email: 'goals@test.com',
      password: 'Password123!',
    });
    userToken = res.body.token;
  });

  it('should create a savings goal with target date and amount', async () => {
    const res = await request(app)
      .post('/api/v1/goals')
      .set('Authorization', `Bearer ${userToken}`)
      .send({
        name: 'Emergency Fund',
        targetAmount: 50000,
        targetDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
        priority: 'high',
      });

    expect(res.status).toBe(201);
    expect(res.body.data.targetAmount).toBe(50000);
    expect(res.body.data.currentAmount).toBe(0);
    expect(res.body.data.status).toBe('in-progress');
  });

  it('should record contributions, update current amount atomically, and calculate progress', async () => {
    const goalRes = await request(app)
      .post('/api/v1/goals')
      .set('Authorization', `Bearer ${userToken}`)
      .send({
        name: 'New Laptop',
        targetAmount: 40000,
        targetDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
      });

    const goalId = goalRes.body.data._id;

    // Record first contribution
    const contrib1 = await request(app)
      .post(`/api/v1/goals/${goalId}/contributions`)
      .set('Authorization', `Bearer ${userToken}`)
      .send({
        type: 'contribution',
        amount: 20000,
        description: 'First paycheck allocation',
      });

    expect(contrib1.status).toBe(201);
    expect(contrib1.body.data.goal.currentAmount).toBe(20000);

    // Fetch goals and verify progress percentage
    const listRes = await request(app)
      .get('/api/v1/goals')
      .set('Authorization', `Bearer ${userToken}`);

    const goal = listRes.body.data.find((g) => g._id === goalId);
    expect(goal.progressPercentage).toBe(50);
    expect(goal.remainingAmount).toBe(20000);
  });

  it('should reject withdrawals that exceed current saved amount', async () => {
    const goalRes = await request(app)
      .post('/api/v1/goals')
      .set('Authorization', `Bearer ${userToken}`)
      .send({
        name: 'Travel Fund',
        targetAmount: 30000,
        targetDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      });

    const goalId = goalRes.body.data._id;

    // Attempt withdrawal with 0 balance
    const withdrawRes = await request(app)
      .post(`/api/v1/goals/${goalId}/contributions`)
      .set('Authorization', `Bearer ${userToken}`)
      .send({
        type: 'withdrawal',
        amount: 5000,
      });

    expect(withdrawRes.status).toBe(400);
    expect(withdrawRes.body.message).toMatch(/cannot withdraw/i);
  });
});
