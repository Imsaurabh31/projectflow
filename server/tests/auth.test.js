const request = require('supertest');
const app = require('../src/index');
const { connect, closeDatabase, clearDatabase } = require('./setup');

beforeAll(async () => { await connect(); });
afterEach(async () => { await clearDatabase(); });
afterAll(async () => { await closeDatabase(); });

const registerPayload = {
  name: 'Alice',
  email: 'alice@example.com',
  password: 'password123',
};

describe('POST /api/auth/register', () => {
  it('registers a new user and returns a token', async () => {
    const res = await request(app).post('/api/auth/register').send(registerPayload);
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.token).toBeDefined();
    expect(res.body.data.user.email).toBe(registerPayload.email);
    expect(res.body.data.user.password).toBeUndefined();
  });

  it('returns 400 for missing name', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ email: 'x@x.com', password: 'pass123' });
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it('returns 400 for invalid email', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ name: 'Bob', email: 'not-an-email', password: 'pass123' });
    expect(res.status).toBe(400);
  });

  it('returns 400 for short password', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ name: 'Bob', email: 'bob@example.com', password: '12' });
    expect(res.status).toBe(400);
  });

  it('returns 409 for duplicate email', async () => {
    await request(app).post('/api/auth/register').send(registerPayload);
    const res = await request(app).post('/api/auth/register').send(registerPayload);
    expect(res.status).toBe(409);
  });
});

describe('POST /api/auth/login', () => {
  beforeEach(async () => {
    await request(app).post('/api/auth/register').send(registerPayload);
  });

  it('logs in with correct credentials', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: registerPayload.email, password: registerPayload.password });
    expect(res.status).toBe(200);
    expect(res.body.data.token).toBeDefined();
  });

  it('returns 401 for wrong password', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: registerPayload.email, password: 'wrongpass' });
    expect(res.status).toBe(401);
  });

  it('returns 401 for non-existent email', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'nobody@example.com', password: 'password123' });
    expect(res.status).toBe(401);
  });
});

describe('GET /api/auth/me', () => {
  let token;

  beforeEach(async () => {
    const res = await request(app).post('/api/auth/register').send(registerPayload);
    token = res.body.data.token;
  });

  it('returns current user for valid token', async () => {
    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.data.user.email).toBe(registerPayload.email);
  });

  it('returns 401 without token', async () => {
    const res = await request(app).get('/api/auth/me');
    expect(res.status).toBe(401);
  });

  it('returns 401 with malformed token', async () => {
    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', 'Bearer badtoken');
    expect(res.status).toBe(401);
  });
});
