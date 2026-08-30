#!/usr/bin/env node
// Vercel build script
// vite is in root node_modules (installed by Vercel's install step)
// We run vite build pointing at the client directory
const { execSync } = require('child_process');
const path = require('path');

const root = __dirname;
const clientDir = path.join(root, 'client');
const viteBin = path.join(root, 'node_modules', '.bin', 'vite');

console.log('→ Building client with vite...');
execSync(`"${viteBin}" build`, { cwd: clientDir, stdio: 'inherit' });

console.log('✅ Build complete');
