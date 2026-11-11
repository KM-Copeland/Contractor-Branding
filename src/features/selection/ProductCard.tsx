import type { ProductFamily } from '../../types/workflow';
import { figmaAsset } from '../../data/products';
import { describeImprintCapabilities } from '../../data/imprintCapabilities';
import { ProductImprintCapabilities } from './ProductImprintCapabilities';
import styles from './Selection.module.css';
export function ProductCard({ product, checked, toggle }: { product: ProductFamily; checked: boolean; toggle: () => void }) {
  return <label className={styles.card + (product.tallCard ? ' ' + styles.tallCard : '')} data-selected={checked} data-node-id={product.figmaNode}>
    <input type="checkbox" checked={checked} onChange={toggle} aria-label={product.name} aria-describedby={`imprint-capabilities-${product.id}`} />
    <span className={styles.imageSlot}><img src={figmaAsset(product.image)} alt="" width="125" height="81" /></span>
    <span className={styles.cardFooter} data-testid="product-card-footer"><span className={styles.productName} data-testid="product-name">{product.name}</span></span>
    <span className="sr-only" id={`imprint-capabilities-${product.id}`}>{describeImprintCapabilities(product.imprintCapabilities)}</span>
    <img className={styles.check} data-testid="product-selection-checkmark" src={figmaAsset(checked ? 'bfc34.svg' : 'ff4e5.svg')} alt="" />
    <ProductImprintCapabilities capabilities={product.imprintCapabilities} />
  </label>;
}
