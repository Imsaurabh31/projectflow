/**
 * Demo seed script
 * Run: node scripts/seed.js
 * Clears existing data and populates realistic demo content.
 */

require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt   = require('bcryptjs');

const User    = require('../src/models/User');
const Project = require('../src/models/Project');
const Task    = require('../src/models/Task');
const Comment = require('../src/models/Comment');

// ── Colour helpers for console output ────────────────────────
const c = {
  green:  (s) => `\x1b[32m${s}\x1b[0m`,
  cyan:   (s) => `\x1b[36m${s}\x1b[0m`,
  yellow: (s) => `\x1b[33m${s}\x1b[0m`,
  bold:   (s) => `\x1b[1m${s}\x1b[0m`,
  dim:    (s) => `\x1b[2m${s}\x1b[0m`,
};

const log = {
  section: (t) => console.log(`\n${c.bold(c.cyan('━'.repeat(50)))}\n  ${c.bold(t)}\n${c.bold(c.cyan('━'.repeat(50)))}`),
  ok:      (t) => console.log(`  ${c.green('✔')}  ${t}`),
  info:    (t) => console.log(`  ${c.dim('·')}  ${c.dim(t)}`),
};

// ── Seed data ─────────────────────────────────────────────────

const USERS = [
  { name: 'Alex Morgan',   email: 'admin@demo.com',  password: 'demo1234', role: 'admin'  },
  { name: 'Sara Lee',      email: 'sara@demo.com',   password: 'demo1234', role: 'member' },
  { name: 'James Patel',   email: 'james@demo.com',  password: 'demo1234', role: 'member' },
  { name: 'Emily Chen',    email: 'emily@demo.com',  password: 'demo1234', role: 'member' },
];

const PROJECTS = [
  {
    name: 'E-Commerce Platform Redesign',
    description: 'Full redesign of the storefront — new checkout flow, mobile-first UI and performance improvements targeting sub-2s load times.',
  },
  {
    name: 'Mobile App — iOS & Android',
    description: 'React Native app for our core product. Covers authentication, push notifications and offline sync.',
  },
  {
    name: 'Internal Admin Dashboard',
    description: 'Operations team tool for managing users, orders, analytics and content moderation.',
  },
];

// Tasks per project: [title, description, status, priority, assigneeIndex (into project members)]
const TASKS_PER_PROJECT = [
  // Project 0 — E-Commerce
  [
    ['Redesign product listing page',    'Update grid layout, add filter sidebar, lazy-load images', 'done',        'high',   1],
    ['Implement new checkout flow',       '3-step checkout: cart → shipping → payment. Integrate Stripe.', 'in_progress', 'urgent', 2],
    ['Optimise image delivery via CDN',   'Move all product images to CloudFront, add WebP support', 'in_progress', 'high',   1],
    ['Write Cypress E2E tests for cart',  'Cover add, remove, quantity update, coupon apply flows', 'todo',        'medium', 3],
    ['SEO meta tags & Open Graph',        'Add dynamic meta per product page for social sharing',   'todo',        'medium', null],
    ['Fix mobile nav z-index issue',      'Dropdown overlaps sticky header on iOS Safari',           'done',        'low',    2],
    ['Add wishlist feature',              'Users can save products; persisted to account',           'todo',        'medium', 3],
    ['Performance audit — Lighthouse',    'Target 90+ on all Lighthouse scores',                    'in_progress', 'high',   null],
  ],
  // Project 1 — Mobile App
  [
    ['Set up React Native project',       'Expo managed workflow, ESLint, Prettier, Husky hooks',   'done',        'high',   1],
    ['Implement biometric auth',          'FaceID / TouchID login using expo-local-authentication', 'done',        'urgent', 2],
    ['Build home feed screen',            'Infinite scroll, pull-to-refresh, skeleton loaders',     'in_progress', 'high',   1],
    ['Push notification service',         'Firebase Cloud Messaging integration for iOS & Android', 'in_progress', 'high',   3],
    ['Offline sync with SQLite',          'Cache API responses, queue mutations for reconnect',     'todo',        'urgent', 2],
    ['App store screenshots & metadata',  'Create 6.5" and 5.5" screenshots for both stores',      'todo',        'low',    null],
    ['Deep linking setup',                'Universal links on iOS, App Links on Android',           'todo',        'medium', 3],
  ],
  // Project 2 — Admin Dashboard
  [
    ['User management table',            'Paginated list, search, role change, suspend/activate',   'done',        'high',   2],
    ['Order analytics charts',           'Revenue by day/week/month using Recharts',                'done',        'medium', 1],
    ['Content moderation queue',         'Review flagged posts, approve/reject with one click',     'in_progress', 'urgent', 3],
    ['Export data to CSV',               'Allow export of users, orders, products tables',          'in_progress', 'medium', 2],
    ['Role-based menu visibility',       'Hide sections admins are not authorised to see',          'done',        'low',    1],
    ['Audit log viewer',                 'Show last 500 admin actions with timestamp and actor',    'todo',        'high',   null],
    ['Dark mode support',                'Respect prefers-color-scheme, toggle in settings',        'todo',        'low',    3],
  ],
];

const COMMENTS = [
  // [taskTitleSubstring, authorIndex (into project members), body]
  ['checkout flow',    0, 'Stripe webhook handling is done ✅. Moving on to the confirmation email.'],
  ['checkout flow',    1, 'Should we add Apple Pay here too? Saw it on the roadmap.'],
  ['checkout flow',    0, 'Good call — added it to the next sprint. Let\'s ship the basic flow first.'],
  ['image delivery',   2, 'CloudFront distribution is provisioned. Will push the migration script tomorrow.'],
  ['biometric auth',   0, 'Tested on iPhone 14 and Pixel 7 — both working perfectly! 🎉'],
  ['biometric auth',   1, 'Great work. Can you add a fallback PIN entry for devices without biometrics?'],
  ['home feed',        2, 'Skeleton loaders look really polished. Nice touch with the shimmer animation.'],
  ['push notification',1, 'iOS requires the push entitlement in the provisioning profile — I\'ll sort that.'],
  ['moderation queue', 0, 'The bulk-approve button is a massive time saver. Ops team loves it.'],
  ['moderation queue', 2, 'Keyboard shortcut (A = approve, R = reject) would make it even faster.'],
  ['Order analytics',  1, 'Revenue numbers match the Stripe dashboard exactly. Ship it.'],
  ['user management',  0, 'Added CSV export directly from this table as a bonus — check PR #42.'],
];

// ── Main ──────────────────────────────────────────────────────

async function seed() {
  log.section('Connecting to MongoDB');
  await mongoose.connect(process.env.MONGO_URI);
  log.ok(`Connected to ${mongoose.connection.host}`);

  log.section('Clearing existing data');
  await Promise.all([
    User.deleteMany({}),
    Project.deleteMany({}),
    Task.deleteMany({}),
    Comment.deleteMany({}),
  ]);
  log.ok('All collections cleared');

  // ── Users — upsert so IDs stay stable across reseeds ──
  log.section('Creating users');
  const createdUsers = [];
  for (const u of USERS) {
    // Delete and recreate to ensure password is freshly hashed
    await User.deleteOne({ email: u.email });
    const user = await User.create(u);
    createdUsers.push(user);
    log.ok(`${u.role === 'admin' ? '👑' : '👤'}  ${u.name}  ${c.dim('<' + u.email + '>')}`);
  }
  const [admin, sara, james, emily] = createdUsers;
  const memberPool = [sara, james, emily];

  // ── Projects ──
  log.section('Creating projects');
  const createdProjects = [];
  for (let i = 0; i < PROJECTS.length; i++) {
    const p = PROJECTS[i];
    // Each project: admin owns it, add 2-3 members
    const members = [sara, james, emily].slice(0, i + 2).map((u) => u._id);
    const project = await Project.create({
      name: p.name,
      description: p.description,
      owner: admin._id,
      members,
    });
    createdProjects.push(project);
    log.ok(`📁  ${p.name}`);
    log.info(`${members.length + 1} members`);
  }

  // ── Tasks ──
  log.section('Creating tasks');
  const createdTasks = [];
  for (let pi = 0; pi < createdProjects.length; pi++) {
    const project = createdProjects[pi];
    const projectMembers = [admin, ...memberPool].slice(0, pi + 3);
    const taskDefs = TASKS_PER_PROJECT[pi];

    for (const [title, description, status, priority, assigneeIdx] of taskDefs) {
      const assignee = assigneeIdx !== null ? (projectMembers[assigneeIdx] || null) : null;
      const task = await Task.create({
        title, description, status, priority,
        project: project._id,
        assignee: assignee?._id || null,
        createdBy: admin._id,
        dueDate: randomFutureDate(),
      });
      createdTasks.push({ task, projectIdx: pi, projectMembers });
      log.ok(`  [${padStatus(status)}]  ${title.slice(0, 50)}`);
    }
  }

  // ── Comments ──
  log.section('Adding comments');
  let commentCount = 0;
  for (const [titleHint, authorIdx, body] of COMMENTS) {
    const match = createdTasks.find(({ task }) =>
      task.title.toLowerCase().includes(titleHint.toLowerCase())
    );
    if (!match) continue;
    const { task, projectIdx, projectMembers } = match;
    const author = projectMembers[authorIdx % projectMembers.length];
    await Comment.create({ body, task: task._id, author: author._id });
    commentCount++;
    log.ok(`💬  "${body.slice(0, 55)}…"`);
  }

  // ── Summary ──
  log.section('Seed complete 🎉');
  console.log();
  console.log(c.bold('  Demo credentials'));
  console.log('  ' + '─'.repeat(44));
  console.log(`  ${c.yellow('Role')}       ${c.yellow('Email')}                 ${c.yellow('Password')}`);
  console.log('  ' + '─'.repeat(44));
  for (const u of USERS) {
    const role = u.role.padEnd(10);
    const email = u.email.padEnd(22);
    console.log(`  ${role} ${email} ${c.green(u.password)}`);
  }
  console.log();
  console.log(c.bold('  What was created'));
  console.log('  ' + '─'.repeat(44));
  console.log(`  👤  ${createdUsers.length} users`);
  console.log(`  📁  ${createdProjects.length} projects`);
  console.log(`  ✅  ${createdTasks.length} tasks`);
  console.log(`  💬  ${commentCount} comments`);
  console.log();
  console.log(c.green(c.bold('  Open http://localhost:3000 and sign in!')));
  console.log();

  await mongoose.disconnect();
  process.exit(0);
}

// ── Helpers ───────────────────────────────────────────────────

function randomFutureDate() {
  const d = new Date();
  d.setDate(d.getDate() + Math.floor(Math.random() * 30) + 3);
  return d;
}

function padStatus(s) {
  const labels = { todo: 'TO DO      ', in_progress: 'IN PROGRESS', done: 'DONE       ' };
  return labels[s] || s;
}

seed().catch((err) => {
  console.error('\n❌  Seed failed:', err.message);
  process.exit(1);
});
