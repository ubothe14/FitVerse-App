import { existsSync } from 'fs';
import { spawnSync } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';
import puppeteer from 'puppeteer';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const cacheDir = path.resolve(__dirname, '..', '.puppeteer-cache');
process.env.PUPPETEER_CACHE_DIR = cacheDir;

const hasBundledChrome = () => {
  try {
    return existsSync(puppeteer.executablePath());
  } catch {
    return false;
  }
};

if (hasBundledChrome()) {
  console.log('Puppeteer Chrome already installed.');
  process.exit(0);
}

console.log(`Installing Puppeteer Chrome into ${cacheDir}...`);
const result = spawnSync('npx', ['puppeteer', 'browsers', 'install', 'chrome'], {
  stdio: 'inherit',
  shell: true,
  env: { ...process.env, PUPPETEER_CACHE_DIR: cacheDir },
});

process.exit(result.status ?? 1);
