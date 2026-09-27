#!/usr/bin/env node
/* tools/ownerrez-check.mjs · confirm an OwnerRez Personal Access Token works,
   without the token ever leaving this machine or entering git.

   1. Robyn creates the token in OwnerRez:
      Settings > Advanced Tools > Developer/API Settings (starts with pt_,
      shown once).
   2. Put two lines in .env.local in this folder (gitignored, never deployed):
        OWNERREZ_EMAIL=the-ownerrez-login@example.com
        OWNERREZ_TOKEN=pt_...
   3. node tools/ownerrez-check.mjs

   Read-only: it lists the properties the token can see. Nothing is written.
   The token opens the whole OwnerRez account; treat it like a password.   */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const env = { ...process.env };
const envFile = path.join(ROOT, '.env.local');
if (fs.existsSync(envFile)) {
  for (const line of fs.readFileSync(envFile, 'utf8').split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Z_]+)\s*=\s*(.*?)\s*$/);
    if (m) env[m[1]] = m[2].replace(/^["']|["']$/g, '');
  }
}
const email = env.OWNERREZ_EMAIL, token = env.OWNERREZ_TOKEN;
if (!email || !token) {
  console.error('Add OWNERREZ_EMAIL and OWNERREZ_TOKEN to .env.local first (see the top of this file).');
  process.exit(2);
}
if (!token.startsWith('pt_')) console.warn('warn: OwnerRez personal access tokens start with pt_');

const res = await fetch('https://api.ownerrez.com/v2/properties', {
  headers: {
    Authorization: 'Basic ' + Buffer.from(`${email}:${token}`).toString('base64'),
    Accept: 'application/json',
    'User-Agent': 'EZHD wilderness-escape token check',
  },
});
if (!res.ok) {
  console.error(`OwnerRez answered ${res.status} ${res.statusText}. Check the email (the OwnerRez login) and the token.`);
  process.exit(1);
}
const data = await res.json();
const items = Array.isArray(data) ? data : (data.items || []);
console.log(`Token works. OwnerRez returned ${items.length} propert${items.length === 1 ? 'y' : 'ies'}:`);
for (const p of items) console.log(`  ${p.id}  ${p.name || p.internal_name || ''}`);
