#!/usr/bin/env node
// Vercel build script — runs from repo root
const { execSync } = require('child_process');
const path = require('path');

const clientDir = path.join(__dirname, 'client');

console.log('→ Installing client dependencies...');
execSync('npm install', { cwd: clientDir, stdio: 'inherit' });

console.log('→ Building client with npx vite...');
// Use npx so it finds vite from client/node_modules without PATH issues
execSync('npx vite build', { cwd: clientDir, stdio: 'inherit' });

console.log('✅ Build complete');
