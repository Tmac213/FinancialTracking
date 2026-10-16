import fs from 'fs';
import path from 'path';

// Absolute path to the project's locales directory (lowercase)
const projectRoot = "c:/Users/ahmad/Downloads/Financial Tracking";
const localesDir = path.join(projectRoot, 'public', 'locales');
const enPath = path.join(localesDir, 'en.json');

if (!fs.existsSync(enPath)) {
  console.error('English locale file not found at', enPath);
  process.exit(1);
}

const enData = JSON.parse(fs.readFileSync(enPath, 'utf-8'));

fs.readdirSync(localesDir).forEach((file) => {
  if (!file.endsWith('.json') || file === 'en.json') return;
  const localePath = path.join(localesDir, file);
  let localeData = {};
  try {
    localeData = JSON.parse(fs.readFileSync(localePath, 'utf-8'));
  } catch (e) {
    console.warn(`Could not parse ${file}, initializing empty object.`);
  }
  let updated = false;
  for (const key of Object.keys(enData)) {
    if (!(key in localeData)) {
      localeData[key] = '';
      updated = true;
    }
  }
  if (updated) {
    fs.writeFileSync(localePath, JSON.stringify(localeData, null, 2) + '\n', 'utf-8');
    console.log(`Updated ${file} with missing keys.`);
  }
});

console.log('Locale synchronization complete.');

