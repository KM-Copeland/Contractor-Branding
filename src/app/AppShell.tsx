import type { ReactNode } from 'react';
import { figmaAsset } from '../data/products';
import { WorkflowProgress } from '../components/WorkflowProgress';
import styles from './AppShell.module.css';
type Progress = 'select-products' | 'brand-review' | 'complete';
type Props = { children: ReactNode; showNotice: (title: string) => void; progress?: Progress; progressValue?: number };
export function AppShell({ children, showNotice, progress, progressValue }: Props) {
  return <div className={styles.shell}><a className={styles.skip} href="#main">Skip to main content</a><header className={styles.header} data-has-progress={!!progress}><div className={styles.nav} data-testid="app-navigation">
    <div className={styles.logo}><img src={figmaAsset('aa956.svg')} alt="Copeland" /></div>
    <strong className={styles.brandName}>Contractor Branding</strong>
    <nav aria-label="Main navigation" className={styles.navLinks}><button onClick={() => showNotice('Order History')}>Order History</button><button onClick={() => showNotice('FAQ')}>FAQ</button></nav>
    <button className={styles.account} aria-label="Account: JD" onClick={() => showNotice('Account')}><img src={figmaAsset('6ab39.svg')} alt="" /><span>JD</span></button>
    <button className={styles.menu} aria-label="Open menu" onClick={() => showNotice('Menu')}><span></span><span></span><span></span></button>
  </div>{progress && <div className={styles.progressRegion}><WorkflowProgress current={progress} progress={progressValue} /></div>}</header><div className={styles.content} data-has-progress={!!progress}>{children}</div></div>;
}
