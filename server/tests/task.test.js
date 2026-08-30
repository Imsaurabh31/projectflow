const request = require('supertest');
const app = require('../src/index');
const { connect, closeDatabase, clearDatabase } = require('./setup');

beforeAll(async () => { await connect(); });
afterEach(async () => { await clearDatabase(); });
afterAll(async () => { await closeDatabase(); });

const registerUser = async (overrides = {}) => {
  const payload = {
    name: 'Task Tester',
    email: 'tasktest@example.com',
    password: 'password123',
    ...overrides,
  };
  const res = await request(app).post('/api/auth/register').send(payload);
  return { token: res.body.data.token, user: res.body.data.user };
};

const createProject = async (token, members = []) => {
  const res = await request(app)
    .post('/api/projects')
    .set('Authorization', `Bearer ${token}`)
    .send({ name: 'Task Project', members });
  return res.body.data.project;
};

describe('POST /api/tasks', () => {
  it('creates a task in a project', async () => {
    const { token } = await registerUser();
    const project = await createProject(token);

    const res = await request(app)
      .post('/api/tasks')
      .set('Authorization', `Bearer ${token}`)
      .send({ title: 'Fix bug', project: project._id, priority: 'high' });

    expect(res.status).toBe(201);
    expect(res.body.data.task.title).toBe('Fix bug');
    expect(res.body.data.task.status).toBe('todo');
    expect(res.body.data.task.priority).toBe('high');
  });

  it('returns 400 for missing title', async () => {
    const { token } = await registerUser();
    const project = await createProject(token);

    const res = await request(app)
      .post('/api/tasks')
      .set('Authorization', `Bearer ${token}`)
      .send({ project: project._id });

    expect(res.status).toBe(400);
  });

  it('returns 403 when non-member tries to create task', async () => {
    const { token: ownerToken } = await registerUser({ email: 'owner2@example.com' });
    const { token: outsiderToken } = await registerUser({
      email: 'outsider@example.com',
      name: 'Outsider',
    });
    const project = await createProject(ownerToken);

    const res = await request(app)
      .post('/api/tasks')
      .set('Authorization', `Bearer ${outsiderToken}`)
      .send({ title: 'Sneaky task', project: project._id });

    expect(res.status).toBe(403);
  });
});

describe('GET /api/tasks', () => {
  it('returns tasks for a project with pagination metadata', async () => {
    const { token } = await registerUser();
    const project = await createProject(token);

    await request(app)
      .post('/api/tasks')
      .set('Authorization', `Bearer ${token}`)
      .send({ title: 'Task 1', project: project._id });
    await request(app)
      .post('/api/tasks')
      .set('Authorization', `Bearer ${token}`)
      .send({ title: 'Task 2', project: project._id, status: 'in_progress' });

    const res = await request(app)
      .get(`/api/tasks?project=${project._id}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.data.tasks.length).toBe(2);
    expect(res.body.data.pagination.total).toBe(2);
  });

  it('filters tasks by status', async () => {
    const { token } = await registerUser();
    const project = await createProject(token);

    await request(app)
      .post('/api/tasks')
      .set('Authorization', `Bearer ${token}`)
      .send({ title: 'Todo task', project: project._id, status: 'todo' });
    await request(app)
      .post('/api/tasks')
      .set('Authorization', `Bearer ${token}`)
      .send({ title: 'Done task', project: project._id, status: 'done' });

    const res = await request(app)
      .get(`/api/tasks?project=${project._id}&status=done`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.data.tasks.length).toBe(1);
    expect(res.body.data.tasks[0].status).toBe('done');
  });
});

describe('PATCH /api/tasks/:id', () => {
  it('updates task status', async () => {
    const { token } = await registerUser();
    const project = await createProject(token);

    const createRes = await request(app)
      .post('/api/tasks')
      .set('Authorization', `Bearer ${token}`)
      .send({ title: 'Update me', project: project._id });

    const taskId = createRes.body.data.task._id;

    const res = await request(app)
      .patch(`/api/tasks/${taskId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ status: 'done' });

    expect(res.status).toBe(200);
    expect(res.body.data.task.status).toBe('done');
  });
});

describe('DELETE /api/tasks/:id', () => {
  it('allows task creator to delete', async () => {
    const { token } = await registerUser();
    const project = await createProject(token);

    const createRes = await request(app)
      .post('/api/tasks')
      .set('Authorization', `Bearer ${token}`)
      .send({ title: 'Delete me', project: project._id });

    const taskId = createRes.body.data.task._id;

    const res = await request(app)
      .delete(`/api/tasks/${taskId}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);

    const getRes = await request(app)
      .get(`/api/tasks/${taskId}`)
      .set('Authorization', `Bearer ${token}`);
    expect(getRes.status).toBe(404);
  });
});
