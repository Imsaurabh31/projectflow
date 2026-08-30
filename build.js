#!/usr/bin/env node
// Vercel build script — runs from repo root
// Installs client deps and runs vite build inside client/
const { execSync } = require('child_process');
const path = require('path');

const clientDir = path.join(__dirname, 'client');

console.log('→ Installing client dependencies...');
execSync('npm install', { cwd: clientDir, stdio: 'inherit' });

console.log('→ Building client...');
execSync('npm run build', { cwd: clientDir, stdio: 'inherit' });

console.log('✅ Build complete');
