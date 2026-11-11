import { useLayoutEffect, useRef } from 'react';
import { useWorkflow } from '../../app/WorkflowContext';
import { products } from '../../data/products';
import { Button, Panel } from '../../components/Controls';
import styles from './Selection.module.css';

export function CompletionScreen({ back }: { back: () => void }) {
  const { state, removeProduct, clearProducts } = useWorkflow();
  const selected = products.filter(product => state.selectedIds.includes(product.id));
  const selectionHeadingRef = useRef<HTMLHeadingElement>(null);
  const selectionListRef = useRef<HTMLUListElement>(null);
  const pendingRemoveFocus = useRef<number | null>(null);
  useLayoutEffect(() => {
    if (pendingRemoveFocus.current === null) return;
    const buttons = selectionListRef.current?.querySelectorAll<HTMLButtonElement>('button[aria-label^="Remove "]');
    if (buttons?.length) buttons[Math.min(pendingRemoveFocus.current, buttons.length - 1)].focus();
    else selectionHeadingRef.current?.focus();
    pendingRemoveFocus.current = null;
  }, [state.selectedIds]);
  return <main id="main" className={styles.main}><Panel className={styles.ready}>
    <h1 tabIndex={-1}>Your imprint is ready for review</h1>
    <p>{selected.length} product {selected.length === 1 ? 'family' : 'families'} configured.</p>
    <section className={styles.readySelection} aria-label="Selection">
      <div className={styles.readySelectionHeading}><h2 ref={selectionHeadingRef} tabIndex={-1}>Selection</h2>{selected.length > 0 && <button className={styles.textAction} onClick={clearProducts}>Clear All</button>}</div>
      <ul ref={selectionListRef}>{selected.map((product, index) => <li key={product.id}><span>{product.name}</span><button className={styles.textAction} aria-label={'Remove ' + product.name} onClick={() => { pendingRemoveFocus.current = index; removeProduct(product.id); }}>Remove</button></li>)}</ul>
    </section>
    <p>This prototype keeps your choices on this page only. No order or production data has been submitted.</p>
    <Button onClick={back}>Edit products</Button>
  </Panel></main>;
}
