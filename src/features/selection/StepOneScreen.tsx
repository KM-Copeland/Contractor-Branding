import { useState } from 'react';
import { categories, products } from '../../data/products';
import type { CategoryId } from '../../types/workflow';
import { useWorkflow } from '../../app/WorkflowContext';
import { FilterPill, SearchInput } from '../../components/Controls';
import { ProductCard } from './ProductCard';
import { SelectionPanel } from './SelectionPanel';
import styles from './Selection.module.css';
export function StepOneScreen({ continueSelection, backToLanding, active }: { continueSelection: () => void; backToLanding: () => void; active: boolean }) {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState<CategoryId | 'all'>('all');
  const { state, toggleProduct } = useWorkflow();
  const visible = products.filter(product => (category === 'all' || product.categoryId === category) && product.name.toLowerCase().includes(query.trim().toLowerCase()));
  return <main id={active ? 'main' : undefined} aria-hidden={!active} inert={!active} className={`${styles.main} ${!active ? styles.inactive : ''}`}><div className={styles.columns}><div className={styles.catalogColumn}><div className={styles.intro}><h1 tabIndex={-1}>Choose products</h1><p>Select one or more compatible product families.</p></div>
    <section className={styles.filters} aria-label="Find product families"><div className={styles.filterRow}><SearchInput className={styles.searchField} value={query} onChange={setQuery} /><div className={styles.pills} role="group" aria-label="Product category"><FilterPill active={category === 'all'} onClick={() => setCategory('all')}>All</FilterPill>{categories.map(item => <FilterPill key={item.id} active={category === item.id} onClick={() => setCategory(item.id)}>{item.label}</FilterPill>)}</div></div></section>
    <div className={styles.catalog} aria-label="Product catalog">
      <span className="sr-only" role="status">{visible.length} products shown</span>
      {categories.map(group => {
        const groupProducts = visible.filter(product => product.categoryId === group.id);
        return groupProducts.length ? <section key={group.id} aria-labelledby={'category-' + group.id}><h3 id={'category-' + group.id}>{group.label}</h3><div className={styles.grid}>{groupProducts.map(product => <ProductCard key={product.id} product={product} checked={state.selectedIds.includes(product.id)} toggle={() => toggleProduct(product.id)} />)}</div></section> : null;
      })}
      {!visible.length && <div className={styles.empty}><p>No products match your search. Try another name or category.</p><button className={styles.textAction} onClick={() => { setQuery(''); setCategory('all'); }}>Reset search and filters</button></div>}
    </div></div><SelectionPanel continueSelection={continueSelection} backToLanding={backToLanding} /></div>
  </main>;
}
