import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import app from '../src/app.js';

describe('Financial Habit Tracker Suite', () => {
  let userToken;

  beforeEach(async () => {
    const res = await request(app).post('/api/v1/auth/register').send({
      name: 'Habit Tester',
      email: 'habits@test.com',
      password: 'Password123!',
    });
    userToken = res.body.token;
  });

  it('should create a new financial habit', async () => {
    const res = await request(app)
      .post('/api/v1/habits')
      .set('Authorization', `Bearer ${userToken}`)
      .send({
        name: 'Record daily expenses before 10 PM',
        frequency: 'daily',
        reminderTime: '22:00',
      });

    expect(res.status).toBe(201);
    expect(res.body.data.name).toBe('Record daily expenses before 10 PM');
    expect(res.body.data.frequency).toBe('daily');
    expect(res.body.data.currentStreak).toBe(0);
  });

  it('should mark a habit completed and prevent duplicate completions for same period', async () => {
    const habitRes = await request(app)
      .post('/api/v1/habits')
      .set('Authorization', `Bearer ${userToken}`)
      .send({
        name: 'Weekly zero-spending day',
        frequency: 'daily',
      });

    const habitId = habitRes.body.data._id;

    // First completion
    const comp1 = await request(app)
      .post(`/api/v1/habits/${habitId}/completions`)
      .set('Authorization', `Bearer ${userToken}`)
      .send({ notes: 'First completion note' });

    expect(comp1.status).toBe(201);
    expect(comp1.body.data.currentStreak).toBe(1);

    // Duplicate completion in same period should be rejected
    const compDuplicate = await request(app)
      .post(`/api/v1/habits/${habitId}/completions`)
      .set('Authorization', `Bearer ${userToken}`)
      .send();

    expect(compDuplicate.status).toBe(400);
    expect(compDuplicate.body.message).toMatch(/already marked as completed/i);
  });

  it('should allow undoing habit completion and safely decrement streak', async () => {
    const habitRes = await request(app)
      .post('/api/v1/habits')
      .set('Authorization', `Bearer ${userToken}`)
      .send({ name: 'Daily Budget Check', frequency: 'daily' });

    const habitId = habitRes.body.data._id;

    await request(app)
      .post(`/api/v1/habits/${habitId}/completions`)
      .set('Authorization', `Bearer ${userToken}`)
      .send();

    const undoRes = await request(app)
      .delete(`/api/v1/habits/${habitId}/completions`)
      .set('Authorization', `Bearer ${userToken}`)
      .send();

    expect(undoRes.status).toBe(200);
    expect(undoRes.body.data.currentStreak).toBe(0);
  });
});
