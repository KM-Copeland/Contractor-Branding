import { figmaAsset, products } from '../../data/products';
import { useWorkflow } from '../../app/WorkflowContext';
import { BackButton, Button } from '../../components/Controls';
import { ResponsiveActionFooter } from '../../components/ResponsiveActionFooter';
import { SelectedProductsSidebar } from './SelectedProductsSidebar';
import styles from './Selection.module.css';

export function SelectionPanel({ continueSelection, backToLanding }: { continueSelection: () => void; backToLanding: () => void }) {
  const { state, removeProduct } = useWorkflow();
  const selected = products.filter(product => state.selectedIds.includes(product.id));
  const footer = <div className={styles.continue} data-has-selection={selected.length > 0}>
    <div data-sidebar-action-row><BackButton label="Back to home" onClick={backToLanding} /><Button disabled={!selected.length} onClick={continueSelection}>Continue<img src={figmaAsset(selected.length ? '05a4b.svg' : '376bb.svg')} alt="" /></Button></div>
  </div>;

  return <>
    <SelectedProductsSidebar
      mode="selection"
      products={selected}
      branding={state.branding}
      onRemoveProduct={removeProduct}
      emptyState={<div className={styles.emptyState}>
        <svg className={styles.emptyIcon} viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="m12 2 9 5-9 5-9-5 9-5Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/><path d="m3 12 9 5 9-5M3 17l9 5 9-5" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/></svg>
        <div className={styles.emptyCopy}><strong>No products selected</strong><span>Choose a product family to begin.</span></div>
      </div>}
      footer={footer}
      testId="selected-products-rail"
    />
    <ResponsiveActionFooter backLabel="Back to home" onBack={backToLanding} onContinue={continueSelection} continueDisabled={!selected.length} testId="step1-action-footer" />
  </>;
}
