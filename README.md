# ProjectFlow — MERN Project Management Application

A full-stack project management application built with **MongoDB, Express, React and Node.js**. Users can create projects, manage tasks on a Kanban board, assign work to team members, comment on tasks and track progress through an analytics dashboard.

---

## Live Demo Credentials

| Role   | Email             | Password   |
|--------|-------------------|------------|
| Admin  | admin@demo.com    | demo1234   |
| Member | sara@demo.com     | demo1234   |
| Member | james@demo.com    | demo1234   |
| Member | emily@demo.com    | demo1234   |

---

## Features

- **JWT Authentication** — register, login, auto-logout on token expiry
- **Two Roles** — Admin (full access) and Member (project-scoped access)
- **Projects** — create, edit, view, archive/unarchive with soft delete
- **Kanban Board** — tasks organised in To Do / In Progress / Done columns
- **Task Management** — create, edit, delete, assign tasks with priorities (Low / Medium / High / Urgent)
- **Inline Editing** — update task status, priority, assignee and due date directly from the detail modal
- **Search & Filter** — full-text search + filter by status, priority and assignee
- **Comments** — threaded comments on tasks with edit and delete
- **Project Dashboard** — analytics charts for task breakdown by status, priority, top assignees and recent activity
- **Main Dashboard** — clickable stat cards showing aggregate stats across all active projects
- **Responsive UI** — works on desktop and mobile
- **31 Backend Tests** — covering auth, projects, tasks and comments

---

## Tech Stack

| Layer     | Technology |
|-----------|------------|
| Frontend  | React 18, Vite, React Router v6, Axios |
| Backend   | Node.js, Express.js |
| Database  | MongoDB, Mongoose |
| Auth      | JSON Web Tokens (JWT), bcryptjs |
| Validation| express-validator |
| Testing   | Jest, Supertest, mongodb-memory-server |

---

## Project Structure

```
├── client/                     # React frontend (Vite)
│   └── src/
│       ├── api/                # Axios API functions (auth, projects, tasks, comments)
│       ├── components/
│       │   ├── layout/         # Sidebar, AppLayout, ProtectedRoute
│       │   ├── projects/       # ProjectCard, ProjectForm
│       │   ├── tasks/          # TaskBoard, TaskCard, TaskDetail, TaskFilters, TaskForm
│       │   └── ui/             # Button, Input, Select, Modal, Badge, Avatar, Alert…
│       ├── context/            # AuthContext (JWT + user state)
│       ├── hooks/              # useAsync
│       ├── pages/              # LoginPage, RegisterPage, DashboardPage, ProjectsPage, ProjectDetailPage
│       └── utils/              # helpers (timeAgo, formatDate, PRIORITY_META, STATUS_META)
│
└── server/                     # Express API
    ├── scripts/
    │   └── seed.js             # Demo data seeder
    ├── src/
    │   ├── config/             # MongoDB connection
    │   ├── controllers/        # auth, user, project, task, comment
    │   ├── middleware/         # auth (JWT), validate (express-validator), error handler
    │   ├── models/             # User, Project, Task, Comment (Mongoose schemas)
    │   ├── routes/             # Express routers
    │   └── utils/              # jwt helpers, apiResponse
    └── tests/                  # Jest + Supertest test suites
```

---

## Getting Started

### Prerequisites

- Node.js 18+
- MongoDB running locally (`mongodb://localhost:27017`) or a MongoDB Atlas connection string

### 1. Clone the repository

```bash
git clone https://github.com/YOUR_USERNAME/projectflow.git
cd projectflow
```

### 2. Backend setup

```bash
cd server
npm install
cp .env.example .env
```

Edit `.env` and set your values:

```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/project-management
JWT_SECRET=your_super_secret_key_change_this
JWT_EXPIRES_IN=7d
NODE_ENV=development
```

Start the server:

```bash
npm run dev        # development (nodemon)
npm start          # production
```

### 3. Frontend setup

```bash
cd client
npm install
npm run dev        # Vite dev server at http://localhost:3000
```

The Vite dev server proxies all `/api/*` requests to `http://localhost:5000` — no CORS configuration needed during development.

### 4. Seed demo data

With the backend running:

```bash
cd server
node scripts/seed.js
```

This creates **4 users, 3 projects, 22 tasks and 12 comments** with realistic content. Use the credentials from the table at the top of this README to log in.

> **Note:** The seed script clears all existing data before seeding. Run it any time to reset to a clean demo state. After running, log out and back in to refresh your JWT token.

---

## Environment Variables

### Server (`server/.env`)

| Variable        | Description                          | Example                              |
|-----------------|--------------------------------------|--------------------------------------|
| `PORT`          | Port the API server listens on       | `5000`                               |
| `MONGO_URI`     | MongoDB connection string            | `mongodb://localhost:27017/project-management` |
| `JWT_SECRET`    | Secret key for signing JWTs          | `a_long_random_string`               |
| `JWT_EXPIRES_IN`| Token expiry duration                | `7d`                                 |
| `NODE_ENV`      | Environment (`development`/`production`) | `development`                    |

---

## API Reference

### Authentication
| Method | Endpoint             | Description              | Auth |
|--------|----------------------|--------------------------|------|
| POST   | `/api/auth/register` | Register new user        | ✗    |
| POST   | `/api/auth/login`    | Login, returns JWT       | ✗    |
| GET    | `/api/auth/me`       | Get current user         | ✓    |

### Projects
| Method | Endpoint                          | Description                  | Auth |
|--------|-----------------------------------|------------------------------|------|
| GET    | `/api/projects`                   | List projects (member-scoped)| ✓    |
| POST   | `/api/projects`                   | Create project               | ✓    |
| GET    | `/api/projects/:id`               | Get project by ID            | ✓    |
| PATCH  | `/api/projects/:id`               | Update project               | ✓    |
| PATCH  | `/api/projects/:id/archive`       | Toggle archive               | ✓    |
| GET    | `/api/projects/:id/dashboard`     | Project analytics            | ✓    |
| POST   | `/api/projects/:id/members`       | Add member                   | ✓    |
| DELETE | `/api/projects/:id/members/:uid`  | Remove member                | ✓    |

### Tasks
| Method | Endpoint        | Description                                        | Auth |
|--------|-----------------|----------------------------------------------------|------|
| GET    | `/api/tasks`    | List tasks — filters: `project`, `status`, `priority`, `assignee`, `search` | ✓ |
| POST   | `/api/tasks`    | Create task                                        | ✓    |
| GET    | `/api/tasks/:id`| Get task by ID                                     | ✓    |
| PATCH  | `/api/tasks/:id`| Update task                                        | ✓    |
| DELETE | `/api/tasks/:id`| Delete task                                        | ✓    |

### Comments
| Method | Endpoint            | Description              | Auth |
|--------|---------------------|--------------------------|------|
| GET    | `/api/comments`     | Get comments for a task  | ✓    |
| POST   | `/api/comments`     | Create comment           | ✓    |
| PATCH  | `/api/comments/:id` | Edit comment             | ✓    |
| DELETE | `/api/comments/:id` | Delete comment           | ✓    |

---

## Running Tests

```bash
cd server
npm test
```

**31 tests across 4 suites** — all using an in-memory MongoDB instance (no real database required):

```
PASS  tests/auth.test.js       — register, login, /me, token validation
PASS  tests/project.test.js    — CRUD, archive, member access control
PASS  tests/task.test.js       — CRUD, status/priority filters, pagination
PASS  tests/comment.test.js    — create, read, delete, authorization
```

---

## Architecture & Technical Decisions

### Authentication
JWT tokens are signed on login and stored in `localStorage`. An Axios request interceptor attaches the `Authorization: Bearer <token>` header to every API call. A response interceptor catches 401 errors and automatically redirects to the login page — clearing stale tokens without any manual intervention.

### Authorization
Two-level authorization:
1. **Route level** — `protect` middleware verifies the JWT and attaches `req.user`
2. **Resource level** — controllers check ownership or admin role before mutating data (e.g. only a project owner or admin can archive a project)

### Database Design
- `Project` stores an array of member `ObjectId` references. A Mongoose pre-save hook ensures the owner is always in the members array.
- `Task` has a compound index on `{ project, status }` for fast filtered queries, and a text index on `{ title, description }` for full-text search.
- `Comment` is a separate collection (not embedded in Task) to allow independent pagination and editing.

### Aggregation
The project dashboard uses a single `$group` + `$lookup` aggregation pipeline to compute task counts by status, by priority and top assignees in one database round-trip — avoiding N+1 query patterns.

### API Response Shape
All responses follow a consistent envelope:
```json
{ "success": true,  "data": { ... } }
{ "success": false, "message": "...", "errors": [...] }
```
A centralised error handler maps Mongoose errors (duplicate key, cast error, validation) to clean HTTP status codes.

### Frontend State
Authentication state lives in a React context (`AuthContext`) backed by `useReducer`. User and token are persisted to `localStorage` for page refresh survival. All API calls go through typed functions in `src/api/` — components never call Axios directly.
