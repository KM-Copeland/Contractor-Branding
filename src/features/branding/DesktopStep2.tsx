import { BackButton, Button } from '../../components/Controls';
import { figmaAsset } from '../../data/products';
import { ProductPreviewPanel } from './ProductPreviewPanel';
import { SelectedProductsSidebar } from '../selection/SelectedProductsSidebar';
import { ImprintForm } from './ImprintForm';
import styles from './BrandReview.module.css';
import type { DesktopStep2Props } from './step2Presentation';

export function DesktopStep2(props: DesktopStep2Props) {
  const actionFooter = <div className={styles.actions}><div className={styles.actionRow} data-sidebar-action-row><BackButton label="Back to products" onClick={props.back} /><Button onClick={props.complete} disabled={!props.isValid}>Continue <img src={figmaAsset(props.isValid ? '05a4b.svg' : '376bb.svg')} alt="" /></Button></div></div>;

  return <main id="main" className={styles.main}>
    <div className={styles.pageGrid}>
      <div className={styles.primaryColumn}>
        <header className={styles.intro}><h1 tabIndex={-1}>Create your imprint</h1><p>Upload your logo and add text once, then choose what each product displays.</p></header>
        <section className={`${styles.layout} ${props.state.preview.expanded ? styles.expanded : ''}`}>
          <div className={styles.workspace}>
            <ImprintForm imprint={props.state.imprint} logoValidation={props.logoValidation} validatingLogo={props.validatingLogo} fileInput={props.fileInput} addFile={props.addFile} removeLogo={props.removeLogo} setLine={props.setLine} toggleBold={props.toggleBold} />
            <ProductPreviewPanel
              selected={props.selected}
              active={props.active}
              activeIndex={props.activeIndex}
              config={props.config}
              hasLogo={props.hasLogo}
              hasText={props.hasText}
              imprint={props.state.imprint}
              previewExpanded={props.state.preview.expanded}
              setActiveProduct={props.setActiveProduct}
              setBranding={props.setBranding}
            />
          </div>
        </section>
      </div>
      <SelectedProductsSidebar mode="branding" products={props.selected} branding={props.state.branding} activeProductId={props.active.id} onSelectProduct={props.setActiveProduct} onRemoveProduct={props.removeProduct} testId="selected-products-rail" footer={actionFooter} />
    </div>
  </main>;
}
