import { figmaAsset } from '../../data/products';
import { supportsSimultaneousImprint } from '../../data/imprintCapabilities';
import type { ProductBrandingConfiguration, ProductFamily, WorkflowState } from '../../types/workflow';
import layoutStyles from './BrandReview.module.css';
import artworkStyles from './PreviewArtwork.module.css';
import styles from './ProductPreviewPanel.module.css';

const groups = [{ id: 'thermostats', label: 'Thermostats' }, { id: 'wallplates', label: 'Wallplates' }, { id: 'other', label: 'Other' }] as const;

type ProductPreviewPanelProps = {
  selected: ProductFamily[];
  active: ProductFamily;
  activeIndex: number;
  config: ProductBrandingConfiguration;
  hasLogo: boolean;
  hasText: boolean;
  imprint: WorkflowState['imprint'];
  previewExpanded: boolean;
  setActiveProduct: (id: string) => void;
  setBranding: (id: string, key: 'logoEnabled' | 'textEnabled', value: boolean) => void;
};

export function ProductPreviewPanel({ selected, active, activeIndex, config, hasLogo, hasText, imprint, previewExpanded, setActiveProduct, setBranding }: ProductPreviewPanelProps) {
  return <section className={layoutStyles.previewPanel} aria-labelledby="preview-heading" data-testid="live-preview-panel">
    <div className={layoutStyles.panelHeading}><h2 id="preview-heading">Live Preview</h2><div className={styles.carouselControls}><button aria-label="Previous product" disabled={activeIndex === 0} onClick={() => setActiveProduct(selected[Math.max(0, activeIndex - 1)].id)}>‹</button><span>{activeIndex + 1} of {selected.length}</span><button aria-label="Next product" disabled={activeIndex === selected.length - 1} onClick={() => setActiveProduct(selected[Math.min(selected.length - 1, activeIndex + 1)].id)}>›</button></div></div>
    <div className={styles.applyBar}><strong>Apply to this product</strong><span>Product-specific settings</span><Switch icon="00dcf.svg" label="logo" checked={config.logoEnabled} disabled={!active.imprintCapabilities.supportsLogo || !hasLogo || (!supportsSimultaneousImprint(active.imprintCapabilities) && hasText && config.textEnabled)} onChange={value => setBranding(active.id, 'logoEnabled', value)} /><Switch icon="c7f3a.svg" label="Text" checked={config.textEnabled} disabled={!active.imprintCapabilities.supportsText || !hasText || (!supportsSimultaneousImprint(active.imprintCapabilities) && hasLogo && config.logoEnabled)} onChange={value => setBranding(active.id, 'textEnabled', value)} /></div>
    <div className={styles.previewProduct}><strong>{active.name}</strong><span>{groups.find(group => group.id === active.categoryId)?.label}</span></div>
    <div className={`${styles.previewStage} ${previewExpanded ? styles.stageExpanded : ''}`} id="product-preview" data-testid="product-preview"><div className={styles.artboard} data-testid="preview-artboard">
      <img className={artworkStyles.productArt} src={figmaAsset(active.image)} alt={`${active.name} preview`} />
      {config.logoEnabled && active.imprintCapabilities.supportsLogo && imprint.logo?.objectUrl && <img data-testid="brand-logo-preview" className={artworkStyles.brandLogo} style={active.logoPlacement} src={imprint.logo.objectUrl} alt="" />}
      {config.textEnabled && active.imprintCapabilities.supportsText && <div data-testid="brand-text-preview" className={artworkStyles.brandText} style={active.textPlacement}>{imprint.lines.map((line, index) => line && <span key={index} style={{ fontWeight: imprint.boldLines[index] ? 700 : 400 }}>{line}</span>)}</div>}
    </div></div>
  </section>;
}

function Switch({ icon, label, checked, disabled, onChange }: { icon: string; label: string; checked: boolean; disabled: boolean; onChange: (value: boolean) => void }) {
  return <label className={`${styles.switchLabel} ${disabled ? styles.switchDisabled : ''}`}><span><img src={figmaAsset(icon)} alt="" />{label}</span><button type="button" role="switch" aria-label={`${label} imprint`} aria-checked={checked} disabled={disabled} onClick={() => onChange(!checked)} className={`${styles.switch} ${checked ? styles.switchOn : ''}`}><i /></button></label>;
}
