import { useEffect, useState } from 'react';
import styles from './WorkflowProgress.module.css';
export function WorkflowProgress({ current = 'select-products', progress }: { current?: 'select-products' | 'brand-review' | 'complete'; progress?: number }) {
  const [ready, setReady] = useState(false);
  const [responsive, setResponsive] = useState(() => window.matchMedia('(max-width: 1279px)').matches);
  useEffect(() => {
    setReady(true);
    const query = window.matchMedia('(max-width: 1279px)');
    const update = () => setResponsive(query.matches);
    update();
    query.addEventListener('change', update);
    return () => query.removeEventListener('change', update);
  }, []);
  const stageProgress = current === 'complete' ? 100 : responsive
    ? current === 'select-products' ? 33.333 : 35
    : current === 'select-products' ? 32 : 58;
  return <div className={styles.progress} data-current={current} data-ready={ready} role="progressbar" aria-label="Setup progress" aria-valuemin={0} aria-valuemax={100} aria-valuenow={progress ?? stageProgress}>
    <span className={styles.fill} style={progress === undefined ? undefined : { width: `${progress}%` }} />
  </div>;
}
