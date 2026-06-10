import { existsSync } from 'fs';
import os from 'os';
import path from 'path';
import puppeteer from 'puppeteer';

const SYSTEM_CHROME_PATHS: Record<string, string[]> = {
  win32: [
    'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
    path.join(os.homedir(), 'AppData', 'Local', 'Google', 'Chrome', 'Application', 'chrome.exe'),
  ],
  darwin: ['/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'],
  linux: [
    '/usr/bin/google-chrome',
    '/usr/bin/google-chrome-stable',
    '/usr/bin/chromium',
    '/usr/bin/chromium-browser',
  ],
};

const isExistingFile = (filePath: string): boolean => {
  try {
    return existsSync(filePath);
  } catch {
    return false;
  }
};

const getBundledChromePath = (): string | null => {
  try {
    const bundledPath = puppeteer.executablePath();
    return isExistingFile(bundledPath) ? bundledPath : null;
  } catch {
    return null;
  }
};

const getSystemChromePath = (): string | null => {
  const candidates = SYSTEM_CHROME_PATHS[process.platform] ?? [];
  return candidates.find(isExistingFile) ?? null;
};

export const resolveChromeExecutable = (): string | null => {
  const configured = process.env.PUPPETEER_EXECUTABLE_PATH?.trim();
  if (configured && isExistingFile(configured)) {
    return configured;
  }

  return getBundledChromePath() ?? getSystemChromePath();
};

export const getChromeInstallHint = (): string =>
  'Install Chrome for Puppeteer with: npm run puppeteer:install (in backend/) ' +
  'or set PUPPETEER_EXECUTABLE_PATH to your local Chrome install.';
