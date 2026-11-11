import type { WorkflowState } from '../../types/workflow';
import styles from './ImprintTextFields.module.css';

type ImprintTextFieldsProps = {
  imprint: WorkflowState['imprint'];
  setLine: (index: 0 | 1, value: string) => void;
  toggleBold: (index: 0 | 1) => void;
  className: string;
};

export function ImprintTextFields({ imprint, setLine, toggleBold, className }: ImprintTextFieldsProps) {
  return <div className={className}>
    <h3>Text <small>(optional)</small></h3>
    {imprint.lines.map((line, index) => <div className={styles.lineField} key={index}>
      <label htmlFor={`imprint-line-${index + 1}`}><span>LINE {index + 1}</span><span>{line.length} / 30</span></label>
      <div className={styles.lineControls}>
        <span className={styles.inputWrap}><input id={`imprint-line-${index + 1}`} aria-label={`Line ${index + 1}`} maxLength={30} value={line} onChange={event => setLine(index as 0 | 1, event.target.value)} /></span>
        <button type="button" className={`${styles.boldButton} ${imprint.boldLines[index] ? styles.boldButtonActive : ''}`} aria-label={`Bold line ${index + 1}`} aria-pressed={imprint.boldLines[index]} title="Bold" onClick={() => toggleBold(index as 0 | 1)}>B</button>
      </div>
    </div>)}
  </div>;
}
