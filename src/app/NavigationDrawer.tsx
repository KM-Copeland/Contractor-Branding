import { useEffect, useRef, type RefObject } from 'react';
import { navigationItems, type AccountNavigationAction, type AccountPresentation, type PlaceholderNavigationAction } from './navigation';
import styles from './NavigationDrawer.module.css';

type Props = {
  open: boolean;
  accountPresentation: AccountPresentation;
  triggerRef: RefObject<HTMLButtonElement | null>;
  desktopNavigationRef: RefObject<HTMLElement | null>;
  onOpenChange: (open: boolean) => void;
  onAction: (action: PlaceholderNavigationAction | AccountNavigationAction) => void;
};

export function NavigationDrawer({ open, accountPresentation, triggerRef, desktopNavigationRef, onOpenChange, onAction }: Props) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const pendingAction = useRef<PlaceholderNavigationAction | AccountNavigationAction | null>(null);
  const accountAction: AccountNavigationAction = accountPresentation === 'signed-in' ? 'logout' : 'sign-in';
  const accountLabel = accountPresentation === 'signed-in' ? 'Logout' : 'Sign In';

  useEffect(() => {
    if (!open) return;
    const html = document.documentElement;
    const body = document.body;
    const oldHtmlOverflow = html.style.overflow;
    const oldBodyOverflow = body.style.overflow;
    const scrollX = window.scrollX;
    const scrollY = window.scrollY;
    html.style.overflow = 'hidden';
    body.style.overflow = 'hidden';
    return () => {
      html.style.overflow = oldHtmlOverflow;
      body.style.overflow = oldBodyOverflow;
      window.scrollTo(scrollX, scrollY);
    };
  }, [open]);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (open && dialog && !dialog.open) {
      dialog.showModal();
      closeRef.current?.focus({ preventScroll: true });
    } else if (!open && dialog?.open) {
      dialog.close();
    }
  }, [open]);

  const restoreFocus = () => {
    const trigger = triggerRef.current;
    if (trigger && getComputedStyle(trigger).display !== 'none') {
      trigger.focus({ preventScroll: true });
      return;
    }
    desktopNavigationRef.current?.querySelector<HTMLElement>('button, a')?.focus({ preventScroll: true });
  };

  const handleClose = () => {
    onOpenChange(false);
    restoreFocus();
    const action = pendingAction.current;
    pendingAction.current = null;
    if (action) onAction(action);
  };

  const closeForAction = (action: PlaceholderNavigationAction | AccountNavigationAction) => {
    pendingAction.current = action;
    if (dialogRef.current?.open) dialogRef.current.close();
    else {
      pendingAction.current = null;
      onOpenChange(false);
      onAction(action);
    }
  };

  return <dialog
    ref={dialogRef}
    id="navigation-drawer"
    className={styles.drawer}
    aria-labelledby="navigation-drawer-title"
    data-testid="navigation-drawer"
    onClose={handleClose}
    onClick={event => { if (event.target === event.currentTarget) dialogRef.current?.close(); }}
  >
    <div className={styles.header}>
      <h2 id="navigation-drawer-title">Menu</h2>
      <button ref={closeRef} type="button" className={styles.close} aria-label="Close menu" onClick={() => dialogRef.current?.close()}>
        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m6 6 12 12M18 6 6 18" /></svg>
      </button>
    </div>
    <nav className={styles.navigation} aria-label="Responsive navigation">
      {navigationItems.map(item => <div className={styles.navigationRow} key={item.id}>
        {item.kind === 'external'
          ? <a href={item.href} target={item.target} rel={item.rel} aria-label={item.label} onClick={() => dialogRef.current?.close()}>{item.label}<span aria-hidden="true" className={styles.externalIcon}>↗</span></a>
          : <button type="button" onClick={() => closeForAction(item.id)}>{item.label}</button>}
      </div>)}
    </nav>
    <div className={styles.accountSection}>
      <span className={styles.accountHeading}>Account</span>
      <button type="button" className={styles.accountAction} onClick={() => closeForAction(accountAction)}>{accountLabel}</button>
    </div>
  </dialog>;
}
