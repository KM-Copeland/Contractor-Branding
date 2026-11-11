import type { ImprintCapabilities } from '../types/workflow';

export function supportsSimultaneousImprint(capabilities: ImprintCapabilities) {
  return capabilities.supportsLogo && capabilities.supportsText && capabilities.supportsSimultaneousImprint;
}

export function describeImprintCapabilities(capabilities: ImprintCapabilities) {
  if (supportsSimultaneousImprint(capabilities)) return 'Supports logo and text together.';
  if (capabilities.supportsLogo && capabilities.supportsText) return 'Supports logo or text, one at a time.';
  if (capabilities.supportsLogo) return 'Supports logo only.';
  if (capabilities.supportsText) return 'Supports text only.';
  return 'No imprint capabilities available.';
}
