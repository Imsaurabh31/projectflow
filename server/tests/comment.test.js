const request = require('supertest');
const app = require('../src/index');
const { connect, closeDatabase, clearDatabase } = require('./setup');

beforeAll(async () => { await connect(); });
afterEach(async () => { await clearDatabase(); });
afterAll(async () => { await closeDatabase(); });

const registerUser = async (overrides = {}) => {
  const payload = {
    name: 'Commenter',
    email: 'comment@example.com',
    password: 'password123',
    ...overrides,
  };
  const res = await request(app).post('/api/auth/register').send(payload);
  return { token: res.body.data.token, user: res.body.data.user };
};

const setup = async () => {
  const { token, user } = await registerUser();
  const projRes = await request(app)
    .post('/api/projects')
    .set('Authorization', `Bearer ${token}`)
    .send({ name: 'Comment Project' });
  const project = projRes.body.data.project;

  const taskRes = await request(app)
    .post('/api/tasks')
    .set('Authorization', `Bearer ${token}`)
    .send({ title: 'Commented Task', project: project._id });
  const task = taskRes.body.data.task;

  return { token, user, project, task };
};

describe('POST /api/comments', () => {
  it('creates a comment on a task', async () => {
    const { token, task } = await setup();

    const res = await request(app)
      .post('/api/comments')
      .set('Authorization', `Bearer ${token}`)
      .send({ body: 'This looks good!', task: task._id });

    expect(res.status).toBe(201);
    expect(res.body.data.comment.body).toBe('This looks good!');
    expect(res.body.data.comment.author).toBeDefined();
  });

  it('returns 400 for empty body', async () => {
    const { token, task } = await setup();

    const res = await request(app)
      .post('/api/comments')
      .set('Authorization', `Bearer ${token}`)
      .send({ body: '', task: task._id });

    expect(res.status).toBe(400);
  });

  it('returns 403 for non-project-member', async () => {
    const { task } = await setup();
    const { token: outsiderToken } = await registerUser({
      email: 'outsider2@example.com',
      name: 'Outsider',
    });

    const res = await request(app)
      .post('/api/comments')
      .set('Authorization', `Bearer ${outsiderToken}`)
      .send({ body: 'Sneaky comment', task: task._id });

    expect(res.status).toBe(403);
  });
});

describe('GET /api/comments', () => {
  it('returns comments ordered by date', async () => {
    const { token, task } = await setup();

    await request(app)
      .post('/api/comments')
      .set('Authorization', `Bearer ${token}`)
      .send({ body: 'First comment', task: task._id });
    await request(app)
      .post('/api/comments')
      .set('Authorization', `Bearer ${token}`)
      .send({ body: 'Second comment', task: task._id });

    const res = await request(app)
      .get(`/api/comments?task=${task._id}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.data.comments.length).toBe(2);
    expect(res.body.data.comments[0].body).toBe('First comment');
  });
});

describe('DELETE /api/comments/:id', () => {
  it('allows author to delete own comment', async () => {
    const { token, task } = await setup();

    const createRes = await request(app)
      .post('/api/comments')
      .set('Authorization', `Bearer ${token}`)
      .send({ body: 'Delete me', task: task._id });

    const commentId = createRes.body.data.comment._id;

    const res = await request(app)
      .delete(`/api/comments/${commentId}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
  });

  it('returns 403 when non-author tries to delete', async () => {
    const { token: authorToken, task, project } = await setup();
    const { token: memberToken, user: memberUser } = await registerUser({
      email: 'member2@example.com',
      name: 'Member 2',
    });

    // Add member to project first
    await request(app)
      .post(`/api/projects/${project._id}/members`)
      .set('Authorization', `Bearer ${authorToken}`)
      .send({ userId: memberUser._id });

    const createRes = await request(app)
      .post('/api/comments')
      .set('Authorization', `Bearer ${authorToken}`)
      .send({ body: "Author's comment", task: task._id });

    const commentId = createRes.body.data.comment._id;

    const res = await request(app)
      .delete(`/api/comments/${commentId}`)
      .set('Authorization', `Bearer ${memberToken}`);

    expect(res.status).toBe(403);
  });
});
