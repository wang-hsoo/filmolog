import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const outlinePath = join(__dirname, 'i18n-outline.json');

function extractLocale(obj, locale) {
  if (obj && typeof obj === 'object' && 'ko' in obj && 'en' in obj) {
    return obj[locale];
  }

  const result = {};
  for (const [key, value] of Object.entries(obj)) {
    result[key] = extractLocale(value, locale);
  }
  return result;
}

function serialize(obj, indent = 0) {
  const pad = '  '.repeat(indent);
  const padInner = '  '.repeat(indent + 1);

  if (typeof obj === 'string') {
    return JSON.stringify(obj);
  }

  const entries = Object.entries(obj);
  if (entries.length === 0) {
    return '{}';
  }

  const lines = entries.map(
    ([key, value]) => `${padInner}${key}: ${serialize(value, indent + 1)},`,
  );

  return `{\n${lines.join('\n')}\n${pad}}`;
}

const outlineData = JSON.parse(readFileSync(outlinePath, 'utf8'));

for (const locale of ['ko', 'en']) {
  const translation = extractLocale(outlineData, locale);
  translation.settings.language = {
    label: locale === 'ko' ? '언어' : 'Language',
    subtitle:
      locale === 'ko' ? '앱 표시 언어' : 'App display language',
    ko: locale === 'ko' ? '한국어' : 'Korean',
    en: 'English',
  };

  const content = `const translation = ${serialize(translation)};

export default translation;
`;

  writeFileSync(
    join(__dirname, '..', 'src', 'i18n', 'locales', `${locale}.ts`),
    content,
    'utf8',
  );
}

console.log('Generated ko.ts and en.ts');
