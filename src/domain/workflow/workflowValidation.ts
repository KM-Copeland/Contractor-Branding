import { products } from '../../data/products';
import type { ProductBrandingConfiguration, ProductFamily, WorkflowState } from '../../types/workflow';

const defaultBranding: ProductBrandingConfiguration = { logoEnabled: false, textEnabled: false };

/** The single per-product readiness rule used by status indicators and workflow gating. */
export function isProductConfigured(
  product: ProductFamily,
  branding: ProductBrandingConfiguration | undefined,
  hasLogo: boolean,
  hasText: boolean,
) {
  const config = branding ?? defaultBranding;
  return (config.logoEnabled && hasLogo && product.imprintCapabilities.supportsLogo)
    || (config.textEnabled && hasText && product.imprintCapabilities.supportsText);
}

/** Every selected product must have at least one available, supported imprint method enabled. */
export function areAllSelectedProductsConfigured(state: WorkflowState) {
  if (state.selectedIds.length === 0) return false;

  const hasLogo = !!state.imprint.logo;
  const hasText = state.imprint.lines.some(line => line.trim().length > 0);

  return state.selectedIds.every(id => {
    const product = products.find(item => item.id === id);
    return !!product && isProductConfigured(product, state.branding[id], hasLogo, hasText);
  });
}
