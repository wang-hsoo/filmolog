/** semver 코드 차이 ≥ 이 값이면 강제 업데이트 (예: 1.0.0 → 1.0.2) */
export const FORCE_UPDATE_GAP = 2;

export function parseVersion(version: string): [number, number, number] {
  const cleaned = version.trim().replace(/^v/i, '');
  const parts = cleaned.split('.').map(part => {
    const n = Number.parseInt(part, 10);
    return Number.isFinite(n) ? n : 0;
  });

  return [parts[0] ?? 0, parts[1] ?? 0, parts[2] ?? 0];
}

export function versionToCode(version: string): number {
  const [major, minor, patch] = parseVersion(version);
  return major * 10000 + minor * 100 + patch;
}

/** latest - current. 양수면 스토어가 더 최신 */
export function getVersionGap(current: string, latest: string): number {
  return versionToCode(latest) - versionToCode(current);
}
