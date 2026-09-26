#!/usr/bin/env node
/* tools/pdf.mjs · render the guest pamphlet to a print-ready PDF.
   Needs the dev server running (node server.js) and the lab's
   playwright-core (system Chrome, headless), same as the audit.
     node tools/pdf.mjs [--url http://localhost:4214] [--out <file.pdf>]   */
import { createRequire } from 'node:module';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const require = createRequire('/Users/dylanevans/Projects/EZHD/ezhd-lab/package.json');
const { chromium } = require('playwright-core');

const arg = (k, d) => { const i = process.argv.indexOf('--' + k); return i > -1 ? process.argv[i + 1] : d; };
const base = arg('url', 'http://localhost:4214');
const out = arg('out', path.join(ROOT, '..', 'Docs', 'Wilderness-Escape-Pamphlet-DRAFT.pdf'));

const browser = await chromium.launch({ channel: 'chrome', headless: true });
const page = await browser.newPage();
await page.goto(`${base}/print/pamphlet/`, { waitUntil: 'networkidle' });
await page.evaluate(() => document.fonts.ready);
await page.pdf({ path: out, width: '11in', height: '8.5in', printBackground: true, preferCSSPageSize: true });
await browser.close();
console.log('wrote', out);
