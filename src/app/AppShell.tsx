import { useEffect, useRef, useState, type ReactNode } from 'react';
import { figmaAsset } from '../data/products';
import { WorkflowProgress } from '../components/WorkflowProgress';
import { NavigationDrawer } from './NavigationDrawer';
import { navigationItems, type AccountNavigationAction, type AccountPresentation, type PlaceholderNavigationAction } from './navigation';
import styles from './AppShell.module.css';
type Progress = 'select-products' | 'brand-review' | 'complete';
type Props = { children: ReactNode; showNotice: (title: string, body?: string) => void; progress?: Progress; progressValue?: number; accountPresentation?: AccountPresentation };
export function AppShell({ children, showNotice, progress, progressValue, accountPresentation = 'signed-out' }: Props) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const menuTriggerRef = useRef<HTMLButtonElement>(null);
  const desktopNavigationRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const desktop = window.matchMedia('(min-width: 1280px)');
    const closeOnDesktop = (event: MediaQueryListEvent) => { if (event.matches) setDrawerOpen(false); };
    desktop.addEventListener('change', closeOnDesktop);
    return () => desktop.removeEventListener('change', closeOnDesktop);
  }, []);

  const handleNavigationAction = (action: PlaceholderNavigationAction | AccountNavigationAction) => {
    if (action === 'order-history' || action === 'faq') {
      const item = navigationItems.find(candidate => candidate.id === action);
      if (item) showNotice(item.label, 'This section is outside the product-selection prototype.');
      return;
    }
    if (action === 'sign-in') showNotice('Sign In', 'Sign-in is not integrated in this prototype. No account session was created.');
    else showNotice('Logout', 'Sign-out is not integrated in this prototype. No account session was changed.');
  };

  return <div className={styles.shell}><a className={styles.skip} href="#main">Skip to main content</a><header className={styles.header} data-has-progress={!!progress}><div className={styles.nav} data-testid="app-navigation">
    <div className={styles.logo}><img src={figmaAsset('aa956.svg')} alt="Copeland" /></div>
    <strong className={styles.brandName}>Contractor Branding</strong>
    <nav ref={desktopNavigationRef} aria-label="Main navigation" className={styles.navLinks}>{navigationItems.map(item => item.kind === 'external'
      ? <a key={item.id} href={item.href} target={item.target} rel={item.rel} aria-label={item.label}>{item.label}</a>
      : <button key={item.id} type="button" onClick={() => handleNavigationAction(item.id)}>{item.label}</button>)}</nav>
    <button className={styles.account} aria-label="Account: JD" onClick={() => showNotice('Account', 'The JD account control is a prototype placeholder; authentication is not connected.') }><img src={figmaAsset('6ab39.svg')} alt="" /><span>JD</span></button>
    <button ref={menuTriggerRef} className={styles.menu} type="button" aria-label="Open menu" aria-expanded={drawerOpen} aria-controls="navigation-drawer" onClick={() => setDrawerOpen(true)}><span></span><span></span><span></span></button>
  </div>{progress && <div className={styles.progressRegion}><WorkflowProgress current={progress} progress={progressValue} /></div>}</header>
    <NavigationDrawer open={drawerOpen} accountPresentation={accountPresentation} triggerRef={menuTriggerRef} desktopNavigationRef={desktopNavigationRef} onOpenChange={setDrawerOpen} onAction={handleNavigationAction} />
    <div className={styles.content} data-has-progress={!!progress}>{children}</div></div>;
}
