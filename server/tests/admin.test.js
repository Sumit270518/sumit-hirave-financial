import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import app from '../src/app.js';
import User from '../src/models/User.js';

describe('Admin Panel & Operational Control Suite', () => {
  let standardUserToken;
  let adminToken;
  let targetUserId;

  beforeEach(async () => {
    // 1. Create normal user
    const userRes = await request(app).post('/api/v1/auth/register').send({
      name: 'Normal User',
      email: 'normal@test.com',
      password: 'Password123!',
    });
    standardUserToken = userRes.body.token;
    targetUserId = userRes.body.user._id;

    // 2. Create administrator directly in DB (preventing public creation)
    const adminUser = await User.create({
      name: 'Root Administrator',
      email: 'admin@system.local',
      password: 'AdminPassword123!',
      role: 'admin',
      status: 'active',
    });

    const adminLogin = await request(app).post('/api/v1/auth/login').send({
      email: 'admin@system.local',
      password: 'AdminPassword123!',
    });
    adminToken = adminLogin.body.token;
  });

  it('should reject non-admin access to administrative endpoints with 403 Forbidden', async () => {
    const res = await request(app)
      .get('/api/v1/admin/stats')
      .set('Authorization', `Bearer ${standardUserToken}`);

    expect(res.status).toBe(403);
    expect(res.body.message).toMatch(/Forbidden/i);
  });

  it('should permit administrators to fetch system statistics and manage accounts', async () => {
    const statsRes = await request(app)
      .get('/api/v1/admin/stats')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(statsRes.status).toBe(200);
    expect(statsRes.body.data.users.total).toBeGreaterThanOrEqual(1);

    // Suspend standard user
    const suspendRes = await request(app)
      .patch(`/api/v1/admin/users/${targetUserId}/status`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ status: 'suspended', reason: 'Testing suspension mechanism' });

    expect(suspendRes.status).toBe(200);
    expect(suspendRes.body.data.status).toBe('suspended');

    // Suspended user should now be blocked from logging in
    const blockedLogin = await request(app).post('/api/v1/auth/login').send({
      email: 'normal@test.com',
      password: 'Password123!',
    });
    expect(blockedLogin.status).toBe(403);
    expect(blockedLogin.body.message).toMatch(/suspended/i);
  });
});
