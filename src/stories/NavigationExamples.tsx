import { useRef, useState } from 'react';
import { NoticeDialog } from '../components/Controls';
import { NavigationDrawer } from '../app/NavigationDrawer';
import type { AccountNavigationAction, AccountPresentation, PlaceholderNavigationAction } from '../app/navigation';

export function NavigationDrawerExample({ accountPresentation = 'signed-out', openInitially = false }: { accountPresentation?: AccountPresentation; openInitially?: boolean }) {
  const [open, setOpen] = useState(openInitially);
  const [notice, setNotice] = useState<{ title: string; body: string } | null>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const desktopNavigationRef = useRef<HTMLElement>(null);
  const showActionNotice = (action: PlaceholderNavigationAction | AccountNavigationAction) => {
    if (action === 'order-history' || action === 'faq') setNotice({ title: action === 'faq' ? 'FAQ' : 'Order History', body: 'This section is outside the product-selection prototype.' });
    else if (action === 'sign-in') setNotice({ title: 'Sign In', body: 'Sign-in is not integrated in this prototype. No account session was created.' });
    else setNotice({ title: 'Logout', body: 'Sign-out is not integrated in this prototype. No account session was changed.' });
  };

  return <div style={{ minHeight: '100vh', background: 'var(--color-page)', fontFamily: 'var(--font-family)' }}>
    <header style={{ display: 'flex', minHeight: 50, alignItems: 'center', justifyContent: 'space-between', padding: '0 20px', background: 'var(--color-surface-default)', borderBottom: '1px solid var(--color-border-subtle)' }}>
      <span>Contractor Branding navigation example</span>
      <button ref={triggerRef} type="button" aria-label="Open menu" aria-expanded={open} aria-controls="navigation-drawer" onClick={() => setOpen(true)}>Open menu</button>
      <nav ref={desktopNavigationRef} aria-label="Desktop navigation" style={{ position: 'absolute', width: 1, height: 1, overflow: 'hidden', clipPath: 'inset(50%)' }}><button type="button">Order History</button></nav>
    </header>
    <main id="main" style={{ padding: 24 }}><h1>Navigation drawer preview</h1><p>The application remains visible under the drawer backdrop.</p></main>
    <NavigationDrawer open={open} accountPresentation={accountPresentation} triggerRef={triggerRef} desktopNavigationRef={desktopNavigationRef} onOpenChange={setOpen} onAction={showActionNotice} />
    <NoticeDialog notice={notice} close={() => setNotice(null)} />
  </div>;
}
