import { categories } from '../../data/products';
import type { MouseEvent as ReactMouseEvent } from 'react';
import type { ProductBrandingConfiguration, ProductFamily, ProductFamilyId } from '../../types/workflow';
import { SelectedProductRow } from './SelectedProductRow';
import styles from './SelectedProductsList.module.css';

export function SelectedProductsList({
  products,
  mode,
  branding,
  activeProductId,
  onSelectProduct,
  onRemoveProduct,
}: {
  products: ProductFamily[];
  mode: 'selection' | 'branding';
  branding: Record<ProductFamilyId, ProductBrandingConfiguration>;
  activeProductId?: ProductFamilyId | null;
  onSelectProduct?: (id: ProductFamilyId) => void;
  onRemoveProduct: (id: ProductFamilyId, event: ReactMouseEvent<HTMLButtonElement>) => void;
}) {
  const renderRow = (product: ProductFamily) => <SelectedProductRow
    key={product.id}
    product={product}
    mode={mode}
    branding={branding[product.id]}
    active={activeProductId === product.id}
    onSelect={onSelectProduct ? () => onSelectProduct(product.id) : undefined}
    onRemove={event => onRemoveProduct(product.id, event)}
    removeStyle="icon"
  />;

  return <div className={`${styles.productGroups} ${styles.sidebarGroups}`} data-selected-product-groups="true">
    {categories.map(category => {
      const groupProducts = products.filter(product => product.categoryId === category.id);
      if (!groupProducts.length) return null;
      return <section className={styles.productGroup} key={category.id} aria-label={category.label}>
        <h3 className={styles.groupHeading}>{category.label}</h3>
        <ul className={styles.productList}>{groupProducts.map(renderRow)}</ul>
      </section>;
    })}
  </div>;
}
