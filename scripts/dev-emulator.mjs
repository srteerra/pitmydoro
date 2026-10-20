import { spawn } from 'node:child_process';
import { existsSync, readFileSync, writeFileSync } from 'node:fs';

const PROJECT_ID = 'demo-pitmydoro';
const EMULATED_SERVICES = 'firestore,auth,storage';
const HOST = '127.0.0.1';
const DATA_DIR = '.emulator-data';
const BASE_CONFIG = 'firebase.json';
const FALLBACK_CONFIG = '.firebase.emulators.json';
const READY_SIGNAL = 'All emulators ready';
const SKIP_SEED = process.argv.includes('--skip-seed');

const baseConfig = JSON.parse(readFileSync(BASE_CONFIG, 'utf8'));
const ports = baseConfig.emulators;
const children = new Set();

const resolveConfigFile = () => {
  const storageRules = baseConfig.storage?.rules;
  if (!storageRules || existsSync(storageRules)) return BASE_CONFIG;

  const { storage: _storage, ...config } = baseConfig;
  writeFileSync(FALLBACK_CONFIG, JSON.stringify(config, null, 2));
  console.log(`"${storageRules}" not found: Storage emulator will use open rules.`);
  return FALLBACK_CONFIG;
};

const run = (command, args, options = {}) => {
  const child = spawn(command, args, { stdio: 'inherit', ...options });
  children.add(child);
  child.on('exit', () => children.delete(child));
  return child;
};

const waitForExit = (child) =>
  new Promise((resolve) => child.on('exit', (code) => resolve(code ?? 1)));

const startEmulators = () =>
  new Promise((resolve, reject) => {
    const emulator = run(
      'firebase',
      [
        'emulators:start',
        '--config',
        resolveConfigFile(),
        '--only',
        EMULATED_SERVICES,
        '--project',
        PROJECT_ID,
        `--import=${DATA_DIR}`,
        `--export-on-exit=${DATA_DIR}`,
      ],
      { stdio: ['ignore', 'pipe', 'inherit'] }
    );

    emulator.stdout.on('data', (chunk) => {
      process.stdout.write(chunk);
      if (chunk.toString().includes(READY_SIGNAL)) resolve(emulator);
    });
    emulator.on('exit', (code) => reject(new Error(`Firebase emulators exited (code ${code})`)));
  });

const seed = async () => {
  if (SKIP_SEED) return;

  const env = {
    ...process.env,
    GCLOUD_PROJECT: PROJECT_ID,
    FIRESTORE_EMULATOR_HOST: `${HOST}:${ports.firestore.port}`,
    FIREBASE_AUTH_EMULATOR_HOST: `${HOST}:${ports.auth.port}`,
  };
  const code = await waitForExit(
    run('npm', ['--prefix', 'functions', 'run', 'seed:emulator'], { env })
  );
  if (code !== 0) throw new Error(`Seed failed (code ${code})`);
};

const startApp = () =>
  run('npm', ['run', 'dev'], { env: { ...process.env, NEXT_PUBLIC_FIREBASE_EMULATORS: 'true' } });

const stopAll = () => children.forEach((child) => child.kill('SIGINT'));

process.on('SIGINT', () =>
  console.log('\nStopping… the emulators are saving their data, please wait.')
);

const main = async () => {
  const emulator = await startEmulators();
  await seed();
  startApp();

  const code = await waitForExit(emulator);
  stopAll();
  process.exit(code);
};

main().catch((error) => {
  console.error(`\n${error.message}`);
  stopAll();
  process.exit(1);
});
