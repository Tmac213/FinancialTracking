// fill_missing_locales.ts
// This script ensures every locale JSON under public/locales contains all keys from en.json.
// Missing keys are added with placeholder values.

import * as fs from 'fs';
import * as path from 'path';

const localesDir = path.resolve(process.cwd(), 'public', 'locales');
const enPath = path.join(localesDir, 'en.json');
if (!fs.existsSync(enPath)) {
  console.error('en.json not found');
  process.exit(1);
}
const enData = JSON.parse(fs.readFileSync(enPath, 'utf8')) as Record<string, string>;
const allKeys = Object.keys(enData);

// Helper to generate placeholder based on locale code
function placeholder(locale: string, key: string, value: string): string {
  if (locale === 'ar') return 'TODO: ترجمة';
  if (locale === 'ur') return 'TODO: ترجمہ';
  return `TODO: ${value}`; // keep English value as hint
}

fs.readdirSync(localesDir).forEach(file => {
  if (!file.endsWith('.json')) return;
  const locale = path.basename(file, '.json');
  const localePath = path.join(localesDir, file);
  const raw = fs.readFileSync(localePath, 'utf8');
  let data: Record<string, string>;
  try {
    data = JSON.parse(raw);
  } catch (e) {
    console.warn(`Failed to parse ${file}, skipping`);
    return;
  }
  // Remove duplicate keys that may exist (JSON.parse keeps last occurrence)
  // We'll just ensure we have a clean object.

  const missing = allKeys.filter(k => !(k in data));
  if (missing.length === 0) return;
  missing.forEach(k => {
    data[k] = placeholder(locale, k, enData[k]);
  });
  // Write back with pretty formatting
  fs.writeFileSync(localePath, JSON.stringify(data, null, 2) + '\n', 'utf8');
  console.log(`Updated ${file}: added ${missing.length} keys`);
});
