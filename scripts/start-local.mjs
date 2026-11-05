import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { spawn, spawnSync } from 'node:child_process';
import process from 'node:process';

// Local: 127.0.0.1:3000. Container/Render: HOST=0.0.0.0 and PORT from the platform.
const PORT = process.env.PORT || '3000';
const HOST = process.env.HOST || '127.0.0.1';

// Only these variables are passed to the app. Other platform variables are ignored.
const PASS_THROUGH_KEYS = [
  'ANTHROPIC_API_KEY',
  'OPENAI_API_KEY',
  'GOOGLE_GENERATIVE_AI_API_KEY',
  'GROQ_API_KEY',
  'OPEN_ROUTER_API_KEY',
  'DEEPSEEK_API_KEY',
  'MISTRAL_API_KEY',
  'OLLAMA_API_BASE_URL',
  'OPENAI_LIKE_API_BASE_URL',
  'OPENAI_LIKE_API_KEY',
  'VITE_LOG_LEVEL',
];

function readEnvFile(path) {
  if (!existsSync(path)) return {};
  const values = {};
  for (const rawLine of readFileSync(path, 'utf8').split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith('#')) continue;
    const splitAt = line.indexOf('=');
    if (splitAt < 1) continue;
    const key = line.slice(0, splitAt).trim();
    let value = line.slice(splitAt + 1).trim();
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    if (value !== '') values[key] = value;
  }
  return values;
}

// Values from .env.local first; platform environment variables (Render, Cloudflare) override them.
function collectDevVars() {
  const values = readEnvFile('.env.local');
  for (const key of PASS_THROUGH_KEYS) {
    if (process.env[key]) values[key] = process.env[key];
  }
  return values;
}

// Wrangler reads .dev.vars for local Pages bindings. A file avoids passing keys
// through the command line, which broke on Windows.
function writeDevVars(values) {
  const lines = Object.entries(values).map(([key, value]) => `${key}=${value}`);
  writeFileSync('.dev.vars', lines.join('\n') + '\n', 'utf8');
}

function run(command) {
  return spawnSync(command, { stdio: 'inherit', shell: true, env: process.env });
}

try {
  const [major, minor, patch] = process.versions.node.split('.').map(Number);
  if (major !== 20 || minor < 15 || (minor === 15 && patch < 1)) {
    console.error(`[Kodex.sbs] Node.js 20.15.1 or newer (Node 20 line) is required. Current: ${process.version}`);
    process.exit(1);
  }

  if (!existsSync('node_modules')) {
    console.error('[Kodex.sbs] Dependencies are missing. Run START-KODEX.bat or: corepack pnpm@9.4.0 install --frozen-lockfile');
    process.exit(1);
  }

  console.log('\n[Kodex.sbs] Building the application...\n');
  const build = run('corepack pnpm run build');
  if (build.status !== 0) {
    console.error('[Kodex.sbs] Build failed. Read the error above.');
    process.exit(build.status ?? 1);
  }
  if (!existsSync('build/client') || !existsSync('build/server')) {
    console.error('[Kodex.sbs] Build output is missing (build/client or build/server). Check the build log above.');
    process.exit(1);
  }

  writeDevVars(collectDevVars());

  console.log(`\n[Kodex.sbs] Starting server at http://${HOST}:${PORT}\n`);
  const server = spawn(
    `corepack pnpm exec wrangler pages dev ./build/client --ip ${HOST} --port ${PORT}`,
    { stdio: 'inherit', shell: true, env: process.env },
  );
  server.on('error', (error) => {
    console.error('[Kodex.sbs] Could not start Wrangler:', error.message);
    process.exit(1);
  });
  server.on('exit', (code, signal) => {
    if (signal) console.error(`[Kodex.sbs] Server stopped by signal ${signal}.`);
    process.exit(code ?? 0);
  });
} catch (error) {
  console.error('[Kodex.sbs] Startup failed:', error.message);
  process.exit(1);
}
