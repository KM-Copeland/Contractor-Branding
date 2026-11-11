import { useLayoutEffect, useRef, type ReactNode } from 'react';
import type { ProductBrandingConfiguration, ProductFamily, ProductFamilyId } from '../../types/workflow';
import { SelectedProductsList } from './SelectedProductsList';
import styles from './SelectedProductsSidebar.module.css';

export function SelectedProductsSidebar({
  mode,
  products,
  branding,
  activeProductId,
  onSelectProduct,
  onRemoveProduct,
  emptyState,
  footer,
  testId,
}: {
  mode: 'selection' | 'branding';
  products: ProductFamily[];
  branding: Record<ProductFamilyId, ProductBrandingConfiguration>;
  activeProductId?: ProductFamilyId | null;
  onSelectProduct?: (id: ProductFamilyId) => void;
  onRemoveProduct: (id: ProductFamilyId) => void;
  emptyState?: ReactNode;
  footer?: ReactNode;
  testId?: string;
}) {
  const sidebarRef = useRef<HTMLElement>(null);
  const pendingRemoveFocus = useRef<number | null>(null);
  const selectedKey = products.map(product => product.id).join('|');

  useLayoutEffect(() => {
    if (pendingRemoveFocus.current === null) return;
    const removeButtons = sidebarRef.current?.querySelectorAll<HTMLButtonElement>('[data-product-remove]');
    if (removeButtons?.length) removeButtons[Math.min(pendingRemoveFocus.current, removeButtons.length - 1)].focus();
    else sidebarRef.current?.querySelector<HTMLButtonElement>('[data-sidebar-action-row] button:first-child')?.focus();
    pendingRemoveFocus.current = null;
  }, [selectedKey]);

  const headingId = mode === 'selection' ? 'selection-heading' : 'selected-products-heading';
  return <aside ref={sidebarRef} className={`${styles.sidebar} ${styles[mode]}`} aria-labelledby={headingId} aria-label={mode === 'branding' ? 'Selected products' : undefined} data-testid={testId} data-mode={mode} data-empty={products.length === 0}>
    <div className={styles.panel}>
      <header className={styles.header}>
        <h2 id={headingId}>Selected products</h2>
        <p role="status">{products.length} selected</p>
      </header>
      {products.length ? <SelectedProductsList
        products={products}
        mode={mode}
        branding={branding}
        activeProductId={activeProductId}
        onSelectProduct={onSelectProduct}
        onRemoveProduct={(id, event) => {
          // Pointer removal should not send touch users to a non-interactive
          // heading. Preserve the next-row focus only for keyboard activation.
          if (event.detail === 0) pendingRemoveFocus.current = products.findIndex(product => product.id === id);
          onRemoveProduct(id);
        }}
      /> : emptyState && <div data-selection-empty-state>{emptyState}</div>}
      {footer && <div className={styles.footer}>{footer}</div>}
    </div>
  </aside>;
}
