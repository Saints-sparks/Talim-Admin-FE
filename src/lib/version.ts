import packageJson from '../../package.json';

/**
 * This portal's version, read from `package.json` at build time so the
 * footer and the package can never disagree (v1.5 §3: "Version 1.5.0
 * everywhere"). Only `version` is read; webpack drops the rest of the file
 * from the bundle.
 */
export const APP_VERSION: string = packageJson.version;

/**
 * The footer's wording for a version.
 *
 * @param version - A semver string.
 * @returns e.g. "Version 1.5.0".
 */
export function versionLabel(version: string = APP_VERSION): string {
  return `Version ${version}`;
}
