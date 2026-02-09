import fs from 'node:fs';

try {
  fs.copyFileSync('src/i18n/locales/en.json', 'src/i18n/en.json');
  fs.copyFileSync('src/i18n/locales/bs.json', 'src/i18n/bs.json');
  console.log('i18n synced');
} catch (e) {
  console.error(e);
  process.exit(1);
}
