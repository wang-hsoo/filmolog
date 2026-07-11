/**
 * package.json version → Android / iOS 네이티브 버전 동기화
 *
 * Usage:
 *   pnpm run version:sync           # package.json 기준 sync, versionCode +1
 *   pnpm run version:sync -- 1.0.1  # package.json도 올리고 sync, versionCode +1
 *
 * - versionName / MARKETING_VERSION = package.json version
 * - versionCode / CURRENT_PROJECT_VERSION = 기존 값 + 1
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');

const packageJsonPath = join(root, 'package.json');
const androidGradlePath = join(root, 'android', 'app', 'build.gradle');
const iosPbxprojPath = join(
  root,
  'ios',
  'filmolog.xcodeproj',
  'project.pbxproj',
);

function parseVersion(version) {
  const cleaned = String(version).trim().replace(/^v/i, '');
  const match = cleaned.match(/^(\d+)\.(\d+)\.(\d+)/);

  if (!match) {
    throw new Error(
      `Invalid semver "${version}". Use major.minor.patch (e.g. 1.0.1)`,
    );
  }

  return `${match[1]}.${match[2]}.${match[3]}`;
}

function readPackageVersion() {
  const pkg = JSON.parse(readFileSync(packageJsonPath, 'utf8'));
  return parseVersion(pkg.version);
}

function writePackageVersion(version) {
  const pkg = JSON.parse(readFileSync(packageJsonPath, 'utf8'));
  pkg.version = version;
  writeFileSync(packageJsonPath, `${JSON.stringify(pkg, null, 2)}\n`, 'utf8');
}

function syncAndroid(version) {
  const gradle = readFileSync(androidGradlePath, 'utf8');

  const currentCodeMatch = gradle.match(/versionCode\s+(\d+)/);
  if (!currentCodeMatch) {
    throw new Error('android/app/build.gradle: versionCode not found');
  }

  if (!/versionName\s+"[^"]+"/.test(gradle)) {
    throw new Error('android/app/build.gradle: versionName not found');
  }

  const nextCode = Number(currentCodeMatch[1]) + 1;

  const next = gradle
    .replace(/versionCode\s+\d+/, `versionCode ${nextCode}`)
    .replace(/versionName\s+"[^"]+"/, `versionName "${version}"`);

  writeFileSync(androidGradlePath, next, 'utf8');
  return nextCode;
}

function syncIos(version, buildNumber) {
  let pbx = readFileSync(iosPbxprojPath, 'utf8');

  if (!/MARKETING_VERSION = [^;]+;/.test(pbx)) {
    throw new Error('ios project.pbxproj: MARKETING_VERSION not found');
  }

  if (!/CURRENT_PROJECT_VERSION = [^;]+;/.test(pbx)) {
    throw new Error('ios project.pbxproj: CURRENT_PROJECT_VERSION not found');
  }

  pbx = pbx
    .replace(/MARKETING_VERSION = [^;]+;/g, `MARKETING_VERSION = ${version};`)
    .replace(
      /CURRENT_PROJECT_VERSION = [^;]+;/g,
      `CURRENT_PROJECT_VERSION = ${buildNumber};`,
    );

  writeFileSync(iosPbxprojPath, pbx, 'utf8');
}

function main() {
  const arg = process.argv.slice(2).find(a => !a.startsWith('-'));

  let version;
  if (arg) {
    version = parseVersion(arg);
    writePackageVersion(version);
    console.log(`[version] package.json → ${version}`);
  } else {
    version = readPackageVersion();
  }

  const androidCode = syncAndroid(version);
  syncIos(version, androidCode);

  console.log(
    `[version] Android versionName=${version} versionCode=${androidCode}`,
  );
  console.log(
    `[version] iOS MARKETING_VERSION=${version} CURRENT_PROJECT_VERSION=${androidCode}`,
  );
  console.log('[version] done');
}

main();
