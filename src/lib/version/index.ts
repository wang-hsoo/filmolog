export { default as AppUpdateChecker } from './AppUpdateChecker';
export { checkAppUpdate, getAppVersion, promptAppUpdate } from './checkAppUpdate';
export {
  FORCE_UPDATE_GAP,
  getVersionGap,
  parseVersion,
  versionToCode,
} from './compareVersions';
