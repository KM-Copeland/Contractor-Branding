import type { ImprintCapabilities } from '../../types/workflow';
import { supportsSimultaneousImprint } from '../../data/imprintCapabilities';
import { figmaAsset } from '../../data/products';
import styles from './ProductImprintCapabilities.module.css';

export function ProductImprintCapabilities({ capabilities }: { capabilities: ImprintCapabilities }) {
  const showCombined = supportsSimultaneousImprint(capabilities);

  if (showCombined) {
    return <span className={`${styles.indicators} ${styles.combined}`} data-testid="imprint-capability-indicator" data-layout="combined" aria-hidden="true">
      <PictureIcon />
      <TextIcon />
    </span>;
  }

  if (!capabilities.supportsLogo && !capabilities.supportsText) {
    return null;
  }

  const layout = capabilities.supportsLogo && capabilities.supportsText ? 'separate' : capabilities.supportsLogo ? 'logo-only' : 'text-only';
  return <span className={styles.indicators} data-testid="imprint-capability-indicator" data-layout={layout} aria-hidden="true">
    {capabilities.supportsLogo && <span className={styles.circle} data-capability="logo"><PictureIcon /></span>}
    {capabilities.supportsText && <span className={styles.circle} data-capability="text"><TextIcon /></span>}
  </span>;
}

function PictureIcon() {
  return <img className={styles.pictureIcon} data-imprint-icon src={figmaAsset('d644e.svg')} alt="" />;
}

function TextIcon() {
  return <img className={styles.textIcon} data-imprint-icon src={figmaAsset('31876.svg')} alt="" />;
}
