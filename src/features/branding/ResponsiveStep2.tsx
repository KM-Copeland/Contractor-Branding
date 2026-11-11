import { useEffect, useRef, type CSSProperties } from 'react';
import { ResponsiveActionFooter } from '../../components/ResponsiveActionFooter';
import { figmaAsset } from '../../data/products';
import { ProductConfigurationCard } from './ProductConfigurationCard';
import { ImprintTextFields } from './ImprintTextFields';
import { LogoValidationMessage } from './LogoValidationMessage';
import { ProductPreviewCarousel } from './ProductPreviewCarousel';
import styles from './BrandReview.module.css';
import { defaultBrandingConfiguration, type ResponsiveStep2Props } from './step2Presentation';

export function ResponsiveStep2(props: ResponsiveStep2Props) {
  const { state, selected, hasLogo, hasText, hasDetails, isValid, setView, view, configureMode, setConfigureMode } = props;
  const backLabel = view === 'imprint' ? 'Back to products' : 'Back to imprint details';
  const backAction = view === 'imprint' ? props.back : () => setView('imprint');
  const disabled = view === 'imprint' ? !hasDetails || props.validatingLogo : !isValid;
  const continueAction = view === 'imprint' ? () => setView('configure') : props.complete;
  const responsiveMainRef = useRef<HTMLElement>(null);
  const listScrollPosition = useRef(0);
  const changeConfigureMode = (next: ResponsiveStep2Props['configureMode']) => {
    if (configureMode === 'list' && next === 'preview') listScrollPosition.current = window.scrollY;
    setConfigureMode(next);
  };
  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      if (responsiveMainRef.current) responsiveMainRef.current.scrollTop = 0;
      const restoreListPosition = view === 'configure' && configureMode === 'list' && listScrollPosition.current > 0;
      window.scrollTo(0, restoreListPosition ? listScrollPosition.current : 0);
    });
    return () => window.cancelAnimationFrame(frame);
  }, [view, configureMode]);

  useEffect(() => {
    props.onResponsiveProgress?.(view === 'imprint' ? 35 : 60);
    return () => props.onResponsiveProgress?.(undefined);
  }, [view, props.onResponsiveProgress]);

  return <main ref={responsiveMainRef} id="main" className={`${styles.responsiveMain} ${view === 'configure' && configureMode === 'preview' ? styles.previewMode : ''}`} data-step2-view={view} data-configure-mode={view === 'configure' ? configureMode : undefined}>
    <div className={styles.responsiveContent}>
      {view === 'imprint' && <>
        <header className={styles.responsiveIntro}><h1>Create your imprint</h1><p>Upload your logo and add text. You’ll choose what each product displays next.</p></header>
        <section className={styles.mobileForm} aria-label="Imprint details" data-testid="imprint-details-panel">
          <div className={styles.mobileFieldGroup}>
            <h2>Logo (optional)</h2>
            {state.imprint.logo ? <div className={styles.mobileFileCard}>
              {state.imprint.logo.objectUrl && <img className={styles.mobileLogoThumb} src={state.imprint.logo.objectUrl} alt="Uploaded logo preview" />}
              {!state.imprint.logo.objectUrl && <span className={styles.mobileLogoThumb}>{state.imprint.logo.filename.split('.').pop()?.toUpperCase()}</span>}
              <span className={styles.mobileFileTitle}>Upload complete</span>
              <span className={styles.mobileFileName}>{state.imprint.logo.filename}</span>
              <button type="button" className={styles.mobileRemoveFile} aria-label="Remove logo" onClick={props.removeLogo}><img src={figmaAsset('step2-remove-image.svg')} alt="" /></button>
            </div> : <button type="button" className={styles.mobileDropzone} aria-describedby="mobile-logo-guidance" disabled={props.validatingLogo} onClick={() => props.fileInput.current?.click()} onDragOver={event => event.preventDefault()} onDrop={event => { event.preventDefault(); void props.addFile(event.dataTransfer.files[0]); }}>
              <img className={styles.mobileUploadIcon} src={figmaAsset('step2-upload-graphic.svg')} alt="" />
              <span>{props.validatingLogo ? 'Checking logo file…' : 'Tap to upload'}</span>
              <small>File supported: PNG, JPG or SVG. Max 10MB.</small>
            </button>}
            <input ref={props.fileInput} className={styles.hiddenInput} type="file" accept=".jpg,.jpeg,.png,.svg,image/jpeg,image/png,image/svg+xml" aria-label="Upload logo" onChange={event => { void props.addFile(event.currentTarget.files?.[0]); event.currentTarget.value = ''; }} />
            {(!state.imprint.logo || props.logoValidation?.status === 'error') && <p id="mobile-logo-guidance" className={styles.mobileQuality}>Use a high-quality logo for the best printed result.</p>}
            {props.validatingLogo && <p className={styles.validationProgress} role="status">Checking file type, readability, dimensions, and print metadata…</p>}
            {props.logoValidation && props.logoValidation.status !== 'success' && <LogoValidationMessage result={props.logoValidation} />}
          </div>
          <ImprintTextFields imprint={state.imprint} setLine={props.setLine} toggleBold={props.toggleBold} className={styles.textGroup} />
          <p className={styles.mobileSharedNote}><img src={figmaAsset('step2-info.svg')} alt="" />Your imprint details are saved for all selected products.</p>
        </section>
      </>}

      {view === 'configure' && <>
        <header className={styles.responsiveIntro}><h1>Configure products</h1><p>Choose the imprint for each product. Preview any result before continuing.</p></header>
        <div className={styles.configureTabs} role="tablist" aria-label="Configure products display">
          {(['list', 'preview'] as const).map(mode => <button
            key={mode}
            id={`configure-${mode}-tab`}
            type="button"
            role="tab"
            aria-selected={configureMode === mode}
            aria-controls="configure-products-panel"
            tabIndex={configureMode === mode ? 0 : -1}
            className={`${styles.configureTab} ${configureMode === mode ? styles.configureTabSelected : ''}`}
            onClick={() => changeConfigureMode(mode)}
            onKeyDown={event => {
              if (event.key === 'ArrowLeft' || event.key === 'ArrowRight' || event.key === 'Home' || event.key === 'End') {
                event.preventDefault();
                const next = event.key === 'Home' || event.key === 'ArrowLeft' ? 'list' : 'preview';
                changeConfigureMode(next);
                document.getElementById(`configure-${next}-tab`)?.focus();
              }
            }}
          ><span
            className={styles.configureTabIcon}
            style={{ '--icon-mask': `url("${figmaAsset(mode === 'list' ? 'f09f1.svg' : '18a3f.svg')}")` } as CSSProperties}
            data-testid="configure-tab-icon"
            aria-hidden="true"
          />{mode === 'list' ? 'List' : 'Preview'}</button>)}
        </div>
        <section id="configure-products-panel" role="tabpanel" aria-labelledby={`configure-${configureMode}-tab`} className={styles.configurePanel} data-testid="configure-products-panel">
          {configureMode === 'list' ? <div className={styles.configurationList} aria-label="Configure selected products" data-testid="product-configuration-list">
            {selected.map(product => <ProductConfigurationCard
              key={product.id}
              product={product}
              branding={{ ...defaultBrandingConfiguration, ...state.branding[product.id] }}
              hasLogo={hasLogo}
              hasText={hasText}
              onBrandingChange={(key, value) => props.setBranding(product.id, key, value)}
            />)}
          </div> : <ProductPreviewCarousel
            selected={selected}
            active={props.active}
            config={props.config}
            branding={state.branding}
            imprint={state.imprint}
            hasLogo={hasLogo}
            hasText={hasText}
            setActiveProduct={props.setActiveProduct}
            setBranding={props.setBranding}
          />}
        </section>
      </>}
    </div>
    <ResponsiveActionFooter backLabel={backLabel} onBack={backAction} onContinue={continueAction} continueDisabled={disabled} testId="step2-action-footer" />
  </main>;
}
