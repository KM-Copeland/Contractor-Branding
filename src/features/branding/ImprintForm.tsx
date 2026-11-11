import type { RefObject } from 'react';
import type { WorkflowState } from '../../types/workflow';
import type { LogoValidationResult } from './logoValidation';
import { figmaAsset } from '../../data/products';
import { ImprintTextFields } from './ImprintTextFields';
import { LogoValidationMessage } from './LogoValidationMessage';
import layoutStyles from './BrandReview.module.css';
import styles from './ImprintForm.module.css';

type ImprintFormProps = {
  imprint: WorkflowState['imprint'];
  logoValidation: LogoValidationResult | null;
  validatingLogo: boolean;
  fileInput: RefObject<HTMLInputElement | null>;
  addFile: (file?: File) => Promise<void>;
  removeLogo: () => void;
  setLine: (index: 0 | 1, value: string) => void;
  toggleBold: (index: 0 | 1) => void;
};

export function ImprintForm({ imprint, logoValidation, validatingLogo, fileInput, addFile, removeLogo, setLine, toggleBold }: ImprintFormProps) {
  return <section className={layoutStyles.formPanel} aria-labelledby="imprint-heading" data-testid="imprint-details-panel">
    <div className={styles.formHeading}><h2 id="imprint-heading">Imprint details</h2><p className={styles.hint}>Shared across your selected products.</p></div>
    <div className={layoutStyles.fieldGroup}><h3><span>Logo</span> <small>(optional)</small></h3>
      {imprint.logo ? <div className={styles.fileCard}><div className={styles.logoThumb}>{imprint.logo.objectUrl ? <img src={imprint.logo.objectUrl} alt="Selected logo" /> : <span>{imprint.logo.filename.split('.').pop()?.toUpperCase()}</span>}<span className="sr-only" data-testid="logo-file-name">{imprint.logo.filename}</span></div><button className={styles.removeFile} aria-label="Remove logo" onClick={removeLogo}><img src={figmaAsset('da637.svg')} alt="" /></button></div> : <button className={styles.dropzone} aria-describedby={logoValidation ? (logoValidation.status === 'error' ? 'logo-guidance logo-validation' : 'logo-validation') : 'logo-guidance'} disabled={validatingLogo} onClick={() => fileInput.current?.click()} onDragOver={event => event.preventDefault()} onDrop={event => { event.preventDefault(); void addFile(event.dataTransfer.files[0]); }}><svg className={styles.uploadIcon} viewBox="0 0 46 46" aria-hidden="true"><path d="M23 5v25m-10-10 10 10 10-10M8 29v9h30v-9" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg><span>{validatingLogo ? 'Checking logo file…' : 'Drop logo here or click to upload'}<small>PNG, JPG, or SVG. Max 10MB.</small></span></button>}
      <input ref={fileInput} className={layoutStyles.hiddenInput} type="file" accept=".jpg,.jpeg,.png,.svg,image/jpeg,image/png,image/svg+xml" aria-label="Upload logo" onChange={event => { void addFile(event.target.files?.[0]); event.currentTarget.value = ''; }} />
      {(!logoValidation || logoValidation.status === 'error') && <p id="logo-guidance" className={styles.uploadGuidance}>Use a high-quality logo for the best printed result.</p>}
      {validatingLogo && <p className={layoutStyles.validationProgress} role="status">Checking file type, readability, dimensions, and print metadata…</p>}
      {logoValidation && <LogoValidationMessage result={logoValidation} />}
    </div>
    <ImprintTextFields imprint={imprint} setLine={setLine} toggleBold={toggleBold} className={`${layoutStyles.fieldGroup} ${layoutStyles.textGroup}`} />
    <p className={styles.sharedNote}>These details are shared. Turn logo or text on or off for each product in the preview.</p>
  </section>;
}
