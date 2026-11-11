import type { ProductBrandingConfiguration, ProductFamily } from '../../types/workflow';
import { figmaAsset } from '../../data/products';
import styles from './ProductConfigurationCard.module.css';
import { BrandingToggle } from './BrandingToggle';
import { isProductConfigured } from '../../app/workflowValidation';

type Props = {
  product: ProductFamily;
  branding: ProductBrandingConfiguration;
  hasLogo: boolean;
  hasText: boolean;
  onBrandingChange: (key: 'logoEnabled' | 'textEnabled', value: boolean) => void;
};

const categoryName = { thermostats: 'Thermostat', wallplates: 'Wallplate', other: 'Other' } as const;

export function ProductConfigurationCard({ product, branding, hasLogo, hasText, onBrandingChange }: Props) {
  const logoOn = branding.logoEnabled && product.imprintCapabilities.supportsLogo && hasLogo;
  const textOn = branding.textEnabled && product.imprintCapabilities.supportsText && hasText;
  const configured = isProductConfigured(product, branding, hasLogo, hasText);
  const logoDisabled = !product.imprintCapabilities.supportsLogo || !hasLogo || (!product.imprintCapabilities.supportsSimultaneousImprint && textOn);
  const textDisabled = !product.imprintCapabilities.supportsText || !hasText || (!product.imprintCapabilities.supportsSimultaneousImprint && logoOn);

  return <article className={styles.card} data-testid={`configuration-card-${product.id}`} data-configured={configured}>
    <div className={styles.productHeader}>
      <img className={styles.thumbnail} src={figmaAsset(product.image)} alt="" />
      <div className={styles.identity}>
        <h2>{product.summaryName}</h2>
        <span>{categoryName[product.categoryId]}</span>
      </div>
      <img className={styles.statusIcon} src={figmaAsset(configured ? 'a077a.svg' : 'e60bc.svg')} alt={configured ? 'Configured' : 'Not configured'} />
    </div>
    <div className={styles.options} role="group" aria-label={`${product.name} imprint options`}>
      <BrandingToggle label="Logo" selected={logoOn} disabled={logoDisabled} onClick={() => onBrandingChange('logoEnabled', !branding.logoEnabled)} />
      <BrandingToggle label="Text" selected={textOn} disabled={textDisabled} onClick={() => onBrandingChange('textEnabled', !branding.textEnabled)} />
    </div>
  </article>;
}
