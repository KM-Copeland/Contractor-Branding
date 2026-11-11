import { useEffect, useRef, type ButtonHTMLAttributes, type ReactNode } from 'react';
import { figmaAsset } from '../data/products';
import styles from './Controls.module.css';
export function Button({ children, className = '', ...props }: ButtonHTMLAttributes<HTMLButtonElement>) {
  return <button type="button" className={styles.button + ' ' + className} {...props}>{children}</button>;
}
export function BackButton({ label, onClick }: { label: string; onClick: () => void }) {
  return <button type="button" className={styles.backButton} aria-label={label} onClick={onClick}><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M19 12H5m7 7-7-7 7-7" /></svg></button>;
}
export function FilterPill({ active, children, onClick }: { active: boolean; children: ReactNode; onClick: () => void }) {
  return <button type="button" className={styles.pill} aria-pressed={active} onClick={onClick}>{children}</button>;
}
export function SearchInput({ value, onChange, className = '' }: { value: string; onChange: (value: string) => void; className?: string }) {
  return <label className={`${styles.search} ${className}`}><span className="sr-only">Search product families</span><img src={figmaAsset('d0d14.svg')} alt="" /><input type="search" value={value} onChange={event => onChange(event.target.value)} placeholder="Search product families" /></label>;
}
export function Panel({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <div className={styles.panel + ' ' + className}>{children}</div>;
}
export function NoticeDialog({ notice, close }: { notice: { title: string; body: string } | null; close: () => void }) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => { if (notice && !ref.current?.open) ref.current?.showModal(); if (!notice && ref.current?.open) ref.current.close(); }, [notice]);
  return <dialog ref={ref} className={styles.dialog} aria-labelledby="notice-title" onClose={close} onCancel={close}>
    <h2 id="notice-title">{notice?.title}</h2><p>{notice?.body}</p><Button onClick={close}>Close</Button>
  </dialog>;
}
