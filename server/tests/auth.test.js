import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '../src/app.js';
import User from '../src/models/User.js';

describe('Authentication & Authorization Suite', () => {
  const testUser = {
    name: 'Test Young Professional',
    email: 'professional@test.com',
    password: 'Password123!',
    confirmPassword: 'Password123!',
    phone: '+91 9998887776',
  };

  it('POST /api/v1/auth/register should successfully register a new user with role="user"', async () => {
    const res = await request(app)
      .post('/api/v1/auth/register')
      .send(testUser);

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.token).toBeDefined();
    expect(res.body.user.email).toBe(testUser.email.toLowerCase());
    expect(res.body.user.role).toBe('user');
    expect(res.body.user.password).toBeUndefined(); // Password hash not exposed
  });

  it('POST /api/v1/auth/register should prevent public assignment of role="admin"', async () => {
    const maliciousPayload = {
      name: 'Hacker Attempt',
      email: 'hacker@test.com',
      password: 'Password123!',
      role: 'admin', // Malicious attempt to elevate role
    };

    const res = await request(app)
      .post('/api/v1/auth/register')
      .send(maliciousPayload);

    expect(res.status).toBe(201);
    expect(res.body.user.role).toBe('user'); // Must remain 'user'
  });

  it('POST /api/v1/auth/register should reject duplicate email registrations', async () => {
    await request(app).post('/api/v1/auth/register').send(testUser);

    const duplicateRes = await request(app)
      .post('/api/v1/auth/register')
      .send(testUser);

    expect(duplicateRes.status).toBe(400);
    expect(duplicateRes.body.success).toBe(false);
    expect(duplicateRes.body.message).toMatch(/already exists/i);
  });

  it('POST /api/v1/auth/login should authenticate valid credentials and reject invalid ones', async () => {
    await request(app).post('/api/v1/auth/register').send(testUser);

    // Valid login
    const validRes = await request(app).post('/api/v1/auth/login').send({
      email: testUser.email,
      password: testUser.password,
    });
    expect(validRes.status).toBe(200);
    expect(validRes.body.token).toBeDefined();

    // Invalid password
    const invalidRes = await request(app).post('/api/v1/auth/login').send({
      email: testUser.email,
      password: 'WrongPassword123!',
    });
    expect(invalidRes.status).toBe(401);
    expect(invalidRes.body.success).toBe(false);
  });

  it('GET /api/v1/auth/me should enforce authentication', async () => {
    // Unauthenticated request
    const unauthRes = await request(app).get('/api/v1/auth/me');
    expect(unauthRes.status).toBe(401);

    // Authenticated request
    const regRes = await request(app).post('/api/v1/auth/register').send(testUser);
    const authRes = await request(app)
      .get('/api/v1/auth/me')
      .set('Authorization', `Bearer ${regRes.body.token}`);

    expect(authRes.status).toBe(200);
    expect(authRes.body.user.email).toBe(testUser.email.toLowerCase());
    expect(authRes.body.profile).toBeDefined();
  });
});
