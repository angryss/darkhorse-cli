import { readFileSync } from 'node:fs';

export const CANONICAL_VEP_PACKAGE = '@angryss/vep' as const;

const EXACT_SEMVER = /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)$/;
const FLOATING_OR_NONREGISTRY = /^(?:latest|next|\*|[~^<>=]|v\d|file:|link:|workspace:|https?:|git(?:\+|:)|github:|\.\.?[\\/])|(?:^|\.)[xX*](?:\.|$)|\.tgz(?:$|[?#])/;

export type VepCompatibilityFailureCode =
  | 'MISSING_PACKAGE_IDENTITY'
  | 'WRONG_PACKAGE_IDENTITY'
  | 'MISSING_VEP_VERSION'
  | 'MALFORMED_VEP_VERSION'
  | 'NON_EXACT_VEP_VERSION'
  | 'MISSING_DARKHORSE_VERSION'
  | 'MALFORMED_DARKHORSE_VERSION'
  | 'UNSUPPORTED_DARKHORSE_VERSION'
  | 'UNSUPPORTED_VEP_VERSION'
  | 'COMPETING_VERSION_AUTHORITY'
  | 'MALFORMED_COMPATIBILITY_MANIFEST';

export interface VepCompatibilityInput {
  darkhorseVersion: unknown;
  packageName: unknown;
  versionSpec: unknown;
  competingVersionAuthorities?: readonly string[];
}

export interface SupportedVepCompatibility {
  supported: true;
  darkhorseVersion: string;
  packageName: typeof CANONICAL_VEP_PACKAGE;
  version: string;
  integrity: string;
  tarball: string;
}

export interface UnsupportedVepCompatibility {
  supported: false;
  code: VepCompatibilityFailureCode;
  message: string;
  recovery: string;
}

export type VepCompatibilityResult =
  | SupportedVepCompatibility
  | UnsupportedVepCompatibility;

interface CompatibilityManifest {
  schemaVersion: 1;
  darkhorse: {
    package: string;
    version: string;
  };
  vep: {
    package: typeof CANONICAL_VEP_PACKAGE;
    supported: Array<{
      version: string;
      integrity: string;
      tarball: string;
    }>;
  };
}

const fail = (
  code: VepCompatibilityFailureCode,
  message: string,
  recovery: string,
): UnsupportedVepCompatibility => ({
  supported: false,
  code,
  message,
  recovery,
});

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function parseManifest(value: unknown): CompatibilityManifest | UnsupportedVepCompatibility {
  if (!isRecord(value)
    || value.schemaVersion !== 1
    || !isRecord(value.darkhorse)
    || typeof value.darkhorse.package !== 'string'
    || typeof value.darkhorse.version !== 'string'
    || !EXACT_SEMVER.test(value.darkhorse.version)
    || !isRecord(value.vep)
    || value.vep.package !== CANONICAL_VEP_PACKAGE
    || !Array.isArray(value.vep.supported)
    || value.vep.supported.length === 0) {
    return fail(
      'MALFORMED_COMPATIBILITY_MANIFEST',
      'The packaged Darkhorse/VEP compatibility manifest is malformed or ambiguous.',
      'Reinstall this exact Darkhorse package version from its verified distribution.',
    );
  }

  const supported = value.vep.supported;
  const versions = new Set<string>();
  for (const entry of supported) {
    if (!isRecord(entry)
      || typeof entry.version !== 'string'
      || !EXACT_SEMVER.test(entry.version)
      || typeof entry.integrity !== 'string'
      || !entry.integrity.startsWith('sha512-')
      || typeof entry.tarball !== 'string'
      || !entry.tarball.startsWith('https://registry.npmjs.org/@angryss/vep/-/')
      || versions.has(entry.version)) {
      return fail(
        'MALFORMED_COMPATIBILITY_MANIFEST',
        'The packaged Darkhorse/VEP compatibility manifest contains an invalid or duplicate release.',
        'Reinstall this exact Darkhorse package version from its verified distribution.',
      );
    }
    versions.add(entry.version);
  }

  return value as unknown as CompatibilityManifest;
}

export function readVepCompatibilityManifest(): CompatibilityManifest | UnsupportedVepCompatibility {
  try {
    const raw = readFileSync(new URL('../../vep-compatibility.json', import.meta.url), 'utf8');
    return parseManifest(JSON.parse(raw) as unknown);
  } catch {
    return fail(
      'MALFORMED_COMPATIBILITY_MANIFEST',
      'The packaged Darkhorse/VEP compatibility manifest is missing or unreadable.',
      'Reinstall this exact Darkhorse package version from its verified distribution.',
    );
  }
}

export function evaluateVepCompatibility(input: VepCompatibilityInput): VepCompatibilityResult {
  const manifest = readVepCompatibilityManifest();
  if ('code' in manifest) return manifest;

  if (typeof input.packageName !== 'string' || input.packageName.length === 0) {
    return fail(
      'MISSING_PACKAGE_IDENTITY',
      'The project does not declare a VEP package identity.',
      'Declare devDependencies["@angryss/vep"] with one exact supported version in the project root package.json.',
    );
  }
  if (input.packageName !== CANONICAL_VEP_PACKAGE) {
    return fail(
      'WRONG_PACKAGE_IDENTITY',
      `Unsupported VEP package identity "${input.packageName}".`,
      'Use only devDependencies["@angryss/vep"] in the project root package.json.',
    );
  }
  if (typeof input.versionSpec !== 'string' || input.versionSpec.length === 0) {
    return fail(
      'MISSING_VEP_VERSION',
      'The project does not declare a VEP version.',
      'Set devDependencies["@angryss/vep"] to one exact supported version.',
    );
  }
  if (FLOATING_OR_NONREGISTRY.test(input.versionSpec)) {
    return fail(
      'NON_EXACT_VEP_VERSION',
      `VEP version "${input.versionSpec}" is floating or is not a public registry version.`,
      'Replace it with the exact public version "2.0.0".',
    );
  }
  if (!EXACT_SEMVER.test(input.versionSpec)) {
    return fail(
      'MALFORMED_VEP_VERSION',
      `VEP version "${input.versionSpec}" is not an exact semantic version.`,
      'Replace it with the exact public version "2.0.0".',
    );
  }
  if (typeof input.darkhorseVersion !== 'string' || input.darkhorseVersion.length === 0) {
    return fail(
      'MISSING_DARKHORSE_VERSION',
      'The Darkhorse version is missing.',
      'Reinstall this exact Darkhorse package version before resolving VEP compatibility.',
    );
  }
  if (!EXACT_SEMVER.test(input.darkhorseVersion)) {
    return fail(
      'MALFORMED_DARKHORSE_VERSION',
      `Darkhorse version "${input.darkhorseVersion}" is not an exact semantic version.`,
      'Use a released exact Darkhorse version covered by its compatibility manifest.',
    );
  }
  if (input.competingVersionAuthorities && input.competingVersionAuthorities.length > 0) {
    return fail(
      'COMPETING_VERSION_AUTHORITY',
      `Competing VEP version authority found at ${input.competingVersionAuthorities.join(', ')}.`,
      'Keep the sole VEP version selection in root devDependencies["@angryss/vep"] and remove every competing declaration.',
    );
  }
  if (input.darkhorseVersion !== manifest.darkhorse.version) {
    return fail(
      'UNSUPPORTED_DARKHORSE_VERSION',
      `Darkhorse version "${input.darkhorseVersion}" does not match this compatibility manifest.`,
      `Use Darkhorse "${manifest.darkhorse.version}" or install a Darkhorse release that explicitly supports the requested VEP version.`,
    );
  }

  const release = manifest.vep.supported.find((entry) => entry.version === input.versionSpec);
  if (!release) {
    return fail(
      'UNSUPPORTED_VEP_VERSION',
      `VEP version "${input.versionSpec}" is not supported by Darkhorse "${input.darkhorseVersion}".`,
      `Select one explicitly supported exact version: ${manifest.vep.supported.map((entry) => entry.version).join(', ')}.`,
    );
  }

  return {
    supported: true,
    darkhorseVersion: manifest.darkhorse.version,
    packageName: CANONICAL_VEP_PACKAGE,
    version: release.version,
    integrity: release.integrity,
    tarball: release.tarball,
  };
}
