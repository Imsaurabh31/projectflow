const request = require('supertest');
const app = require('../src/index');
const { connect, closeDatabase, clearDatabase } = require('./setup');

beforeAll(async () => { await connect(); });
afterEach(async () => { await clearDatabase(); });
afterAll(async () => { await closeDatabase(); });

/** Helper: register a user and return token + user */
const registerUser = async (overrides = {}) => {
  const payload = {
    name: 'Test User',
    email: 'test@example.com',
    password: 'password123',
    ...overrides,
  };
  const res = await request(app).post('/api/auth/register').send(payload);
  return { token: res.body.data.token, user: res.body.data.user };
};

describe('POST /api/projects', () => {
  it('creates a project for authenticated user', async () => {
    const { token } = await registerUser();
    const res = await request(app)
      .post('/api/projects')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'My Project', description: 'A test project' });

    expect(res.status).toBe(201);
    expect(res.body.data.project.name).toBe('My Project');
    expect(res.body.data.project.status).toBe('active');
  });

  it('returns 401 without auth', async () => {
    const res = await request(app)
      .post('/api/projects')
      .send({ name: 'My Project' });
    expect(res.status).toBe(401);
  });

  it('returns 400 for missing name', async () => {
    const { token } = await registerUser();
    const res = await request(app)
      .post('/api/projects')
      .set('Authorization', `Bearer ${token}`)
      .send({ description: 'No name' });
    expect(res.status).toBe(400);
  });
});

describe('GET /api/projects', () => {
  it('returns projects for logged-in user', async () => {
    const { token } = await registerUser();
    await request(app)
      .post('/api/projects')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Project Alpha' });

    const res = await request(app)
      .get('/api/projects')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.data.projects.length).toBe(1);
    expect(res.body.data.projects[0].taskStats).toBeDefined();
  });

  it('does not expose other users projects to a member', async () => {
    const { token: tokenA } = await registerUser({ email: 'a@example.com' });
    const { token: tokenB } = await registerUser({ email: 'b@example.com', name: 'User B' });

    await request(app)
      .post('/api/projects')
      .set('Authorization', `Bearer ${tokenA}`)
      .send({ name: 'Private Project' });

    const res = await request(app)
      .get('/api/projects')
      .set('Authorization', `Bearer ${tokenB}`);

    expect(res.status).toBe(200);
    expect(res.body.data.projects.length).toBe(0);
  });
});

describe('PATCH /api/projects/:id/archive', () => {
  it('toggles project archive status', async () => {
    const { token } = await registerUser();
    const createRes = await request(app)
      .post('/api/projects')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Archivable' });
    const projectId = createRes.body.data.project._id;

    const archiveRes = await request(app)
      .patch(`/api/projects/${projectId}/archive`)
      .set('Authorization', `Bearer ${token}`);

    expect(archiveRes.status).toBe(200);
    expect(archiveRes.body.data.project.status).toBe('archived');

    // Toggle back
    const unarchiveRes = await request(app)
      .patch(`/api/projects/${projectId}/archive`)
      .set('Authorization', `Bearer ${token}`);
    expect(unarchiveRes.body.data.project.status).toBe('active');
  });

  it('returns 403 for non-owner', async () => {
    const { token: tokenA } = await registerUser({ email: 'owner@example.com' });
    const { token: tokenB, user: userB } = await registerUser({
      email: 'member@example.com',
      name: 'Member',
    });

    const createRes = await request(app)
      .post('/api/projects')
      .set('Authorization', `Bearer ${tokenA}`)
      .send({ name: 'Owner Project', members: [userB._id] });

    const projectId = createRes.body.data.project._id;

    const res = await request(app)
      .patch(`/api/projects/${projectId}/archive`)
      .set('Authorization', `Bearer ${tokenB}`);

    expect(res.status).toBe(403);
  });
});
