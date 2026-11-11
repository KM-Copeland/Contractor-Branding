import type { ProductFamily, ProductBrandingConfiguration } from '../../types/workflow';
import type { MouseEvent as ReactMouseEvent } from 'react';
import { figmaAsset } from '../../data/products';
import styles from './SelectedProductsList.module.css';

const defaultBranding: ProductBrandingConfiguration = { logoEnabled: false, textEnabled: false };

export function ImprintStatusIndicators({ branding, muted = false }: { branding?: ProductBrandingConfiguration; muted?: boolean }) {
  const value = branding ?? defaultBranding;
  return <span className={styles.statusGroup} data-testid="imprint-status-indicators" data-muted={muted || undefined} aria-label={`Logo ${value.logoEnabled ? 'On' : 'Off'}, text ${value.textEnabled ? 'On' : 'Off'}`}>
    <span className={styles.statusItem}><span className={styles.statusIcon}><img src={figmaAsset('00dcf.svg')} alt="" /></span><span>{value.logoEnabled ? 'On' : 'Off'}</span></span>
    <span className={styles.statusItem}><span className={styles.statusIcon}><img src={figmaAsset('c7f3a.svg')} alt="" /></span><span>{value.textEnabled ? 'On' : 'Off'}</span></span>
  </span>;
}

export function SelectedProductRow({
  product,
  mode,
  branding,
  active = false,
  onSelect,
  onRemove,
  removeStyle = 'icon',
  showStatus = true,
}: {
  product: ProductFamily;
  mode: 'selection' | 'branding';
  branding?: ProductBrandingConfiguration;
  active?: boolean;
  onSelect?: () => void;
  onRemove: (event: ReactMouseEvent<HTMLButtonElement>) => void;
  removeStyle?: 'icon' | 'text';
  showStatus?: boolean;
}) {
  const identityContent = <>
    <span className={styles.productImage}><img src={figmaAsset(product.image)} alt="" /></span>
    <span className={styles.productDetails}>
      <span className={styles.productName}>{product.summaryName}</span>
      {showStatus && <ImprintStatusIndicators branding={branding} muted={mode === 'selection'} />}
    </span>
  </>;
  const rowClasses = [styles.productRow, active && mode === 'branding' ? styles.activeRow : ''].filter(Boolean).join(' ');

  return <li className={rowClasses} data-product-id={product.id} data-mode={mode}>
    {onSelect ? <button type="button" data-selection-product-pick className={styles.productIdentity} aria-label={product.summaryName} aria-current={active ? 'true' : undefined} onClick={onSelect}>{identityContent}</button> : <div className={styles.productIdentity}>{identityContent}</div>}
    {active && mode === 'branding' && <span className={styles.activeVisibility} aria-label="Shown in preview"><img src={figmaAsset('93573.svg')} alt="" /></span>}
    <button type="button" data-product-remove className={`${styles.removeButton} ${removeStyle === 'text' ? styles.removeText : ''}`} aria-label={`Remove ${product.name}`} onClick={onRemove}>
      {removeStyle === 'icon' ? <img src={figmaAsset('2548b.svg')} alt="" /> : 'Remove'}
    </button>
  </li>;
}
