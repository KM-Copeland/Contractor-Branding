import { figmaAsset } from '../../data/products';
import styles from './BrandingToggle.module.css';

type Props = {
  label: 'Logo' | 'Text';
  selected: boolean;
  disabled: boolean;
  onClick: () => void;
};

const iconByLabel = { Logo: 'ed647.svg', Text: 'f37c9.svg' } as const;

export function BrandingToggle({ label, selected, disabled, onClick }: Props) {
  const icon = selected ? 'a3157.svg' : disabled && label === 'Logo' ? 'dd384.svg' : iconByLabel[label];
  return <button
    type="button"
    className={`${styles.toggle} ${selected ? styles.selected : ''}`}
    aria-pressed={selected}
    disabled={disabled}
    onClick={onClick}
  >
    <img className={disabled && !selected && label === 'Text' ? styles.disabledIcon : undefined} src={figmaAsset(icon)} alt="" aria-hidden="true" />
    {label}
  </button>;
}
