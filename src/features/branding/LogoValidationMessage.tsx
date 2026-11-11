import type { LogoValidationResult } from './logoValidation';
import styles from './LogoValidationMessage.module.css';

export function LogoValidationMessage({ result }: { result: LogoValidationResult }) {
  const status = result.status;
  return <div className={`${styles.validation} ${styles[`validation${status[0].toUpperCase()}${status.slice(1)}`]}`} role={status === 'error' ? 'alert' : 'status'} aria-live={status === 'error' ? 'assertive' : 'polite'} aria-atomic="true">
    <span className={styles.validationIcon} aria-hidden="true">{status === 'success' ? '✓' : status === 'warning' ? '!' : '×'}</span>
    <div className={styles.validationContent}><p className={styles.validationTitle}>{result.summary}</p>{result.status === 'error' && result.failures[0] && <p>{result.failures[0]}</p>}
      <details className={styles.validationDetails}><summary>View file checks</summary>{result.format && <p>{result.format.toUpperCase()}{result.dimensions && ` • ${result.dimensions.width} × ${result.dimensions.height} px`}{result.dpi && ` • source ${Math.round(result.dpi.x)} × ${Math.round(result.dpi.y)} DPI`}</p>}{result.warnings.map(warning => <p key={warning}>{warning}</p>)}{result.unverified.map(note => <p key={note}>{note}</p>)}{result.status !== 'error' && <p>Automated checks do not confirm sharpness, color accuracy, or final production approval.</p>}</details>
    </div>
  </div>;
}
