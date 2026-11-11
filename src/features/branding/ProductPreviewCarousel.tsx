import { useEffect, useRef, useState, type PointerEvent } from 'react';
import { figmaAsset } from '../../data/products';
import { supportsSimultaneousImprint } from '../../data/imprintCapabilities';
import { isProductConfigured } from '../../app/workflowValidation';
import type { ProductBrandingConfiguration, ProductFamily, WorkflowState } from '../../types/workflow';
import { BrandingToggle } from './BrandingToggle';
import artworkStyles from './PreviewArtwork.module.css';
import layoutStyles from './BrandReview.module.css';
import styles from './ProductPreviewCarousel.module.css';

const groups = [{ id: 'thermostats', label: 'Thermostats' }, { id: 'wallplates', label: 'Wallplates' }, { id: 'other', label: 'Other' }] as const;
const defaultConfig = { logoEnabled: false, textEnabled: false };

export type ProductPreviewCarouselProps = {
  selected: ProductFamily[];
  active: ProductFamily;
  config: ProductBrandingConfiguration;
  branding: WorkflowState['branding'];
  imprint: WorkflowState['imprint'];
  hasLogo: boolean;
  hasText: boolean;
  setActiveProduct: (id: string) => void;
  setBranding: (id: string, key: 'logoEnabled' | 'textEnabled', value: boolean) => void;
};

type CarouselGesture = { id: number; startX: number; startY: number; lastX: number; startedAt: number; horizontal: boolean; vertical: boolean };

export function ProductPreviewCarousel(props: ProductPreviewCarouselProps) {
  const { branding, imprint, selected } = props;
  const activeIndex = Math.max(0, selected.findIndex(product => product.id === props.active.id));
  const [dragX, setDragX] = useState(0);
  const [dragging, setDragging] = useState(false);
  const gesture = useRef<CarouselGesture | null>(null);
  const previousActiveId = useRef(props.active.id);
  const [displayedProductId, setDisplayedProductId] = useState(props.active.id);
  const [summaryFade, setSummaryFade] = useState<'visible' | 'out' | 'in'>('visible');
  useEffect(() => {
    if (previousActiveId.current === props.active.id) return;
    previousActiveId.current = props.active.id;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setDisplayedProductId(props.active.id);
      setSummaryFade('visible');
      return;
    }
    setSummaryFade('out');
    let firstFrame = 0;
    let secondFrame = 0;
    const timeout = window.setTimeout(() => {
      setDisplayedProductId(props.active.id);
      setSummaryFade('in');
      firstFrame = window.requestAnimationFrame(() => {
        secondFrame = window.requestAnimationFrame(() => setSummaryFade('visible'));
      });
    }, 110);
    return () => {
      window.clearTimeout(timeout);
      if (firstFrame) window.cancelAnimationFrame(firstFrame);
      if (secondFrame) window.cancelAnimationFrame(secondFrame);
    };
  }, [props.active.id]);
  const handlePointerDown = (event: PointerEvent<HTMLDivElement>) => {
    if (!event.isPrimary || event.button !== 0) return;
    gesture.current = { id: event.pointerId, startX: event.clientX, startY: event.clientY, lastX: event.clientX, startedAt: performance.now(), horizontal: false, vertical: false };
  };
  const handlePointerMove = (event: PointerEvent<HTMLDivElement>) => {
    const current = gesture.current;
    if (!current || current.id !== event.pointerId || current.vertical) return;
    const dx = event.clientX - current.startX;
    const dy = event.clientY - current.startY;
    if (!current.horizontal && Math.max(Math.abs(dx), Math.abs(dy)) > 8) {
      if (Math.abs(dy) > Math.abs(dx) * 1.15) current.vertical = true;
      else if (Math.abs(dx) > Math.abs(dy) * 1.15) {
        current.horizontal = true;
        setDragging(true);
        // Touch pointers already receive implicit capture from the browser.
        // Re-capturing one after it moves can release that implicit capture on
        // mobile, which the lost-capture handler interprets as cancellation.
        if (event.pointerType !== 'touch') event.currentTarget.setPointerCapture(event.pointerId);
      }
    }
    if (current.horizontal) {
      current.lastX = event.clientX;
      setDragX(dx);
    }
  };
  const finishGesture = (event: PointerEvent<HTMLDivElement>, cancelled = false) => {
    const current = gesture.current;
    if (!current || current.id !== event.pointerId) return;
    const dx = event.clientX - current.startX;
    const duration = Math.max(1, performance.now() - current.startedAt);
    const velocity = Math.abs(dx) / duration;
    const shouldNavigate = !cancelled && current.horizontal && (Math.abs(dx) >= 42 || (Math.abs(dx) >= 18 && velocity >= 0.45));
    if (shouldNavigate) {
      const nextIndex = Math.max(0, Math.min(selected.length - 1, activeIndex + (dx < 0 ? 1 : -1)));
      if (nextIndex !== activeIndex) props.setActiveProduct(selected[nextIndex].id);
    }
    gesture.current = null;
    setDragging(false);
    setDragX(0);
  };
  const categoryFor = (product: ProductFamily) => groups.find(group => group.id === product.categoryId)?.label.replace(/s$/, '') ?? '';
  const displayedProduct = selected.find(product => product.id === displayedProductId) ?? props.active;
  const displayedConfig = { ...defaultConfig, ...branding[displayedProduct.id] };
  const displayedConfigured = isProductConfigured(displayedProduct, displayedConfig, props.hasLogo, props.hasText);
  const logoDisabled = !props.active.imprintCapabilities.supportsLogo || !props.hasLogo || (!supportsSimultaneousImprint(props.active.imprintCapabilities) && props.config.textEnabled);
  const textDisabled = !props.active.imprintCapabilities.supportsText || !props.hasText || (!supportsSimultaneousImprint(props.active.imprintCapabilities) && props.config.logoEnabled);

  return <div className={`${styles.previewCarousel} ${layoutStyles.previewCarousel}`}>
    <div
      className={`${styles.carouselViewport} ${layoutStyles.carouselViewport}`}
      data-testid="product-preview-carousel"
      role="group"
      aria-label="Selected product artwork. Use the left and right arrow keys to change products."
      aria-roledescription="carousel"
      tabIndex={0}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={event => finishGesture(event)}
      onPointerCancel={event => finishGesture(event, true)}
      onLostPointerCapture={event => { if (gesture.current?.id === event.pointerId) finishGesture(event, true); }}
      onKeyDown={event => {
        const next = event.key === 'ArrowRight' ? activeIndex + 1 : event.key === 'ArrowLeft' ? activeIndex - 1 : event.key === 'Home' ? 0 : event.key === 'End' ? selected.length - 1 : activeIndex;
        if (next !== activeIndex) {
          event.preventDefault();
          props.setActiveProduct(selected[Math.max(0, Math.min(selected.length - 1, next))].id);
        }
      }}
    >
      <div data-testid="product-image-track" className={`${styles.carouselTrack} ${layoutStyles.carouselTrack} ${dragging ? styles.carouselDragging : ''}`} style={{ transform: `translate3d(calc(${-activeIndex * 100}% + ${dragX}px), 0, 0)` }}>
        {selected.map((product, index) => {
          const config = { ...defaultConfig, ...branding[product.id] };
          return <article key={product.id} className={`${styles.carouselSlide} ${layoutStyles.carouselSlide}`} aria-roledescription="slide" aria-label={`${index + 1} of ${selected.length}: ${product.summaryName}`} aria-hidden={product.id !== props.active.id} inert={product.id !== props.active.id}>
            <div className={`${styles.mobilePreviewStage} ${layoutStyles.mobilePreviewStage}`} data-testid={product.id === props.active.id ? 'product-preview' : undefined}>
              <div className={`${styles.mobileArtboard} ${layoutStyles.mobileArtboard}`} data-testid={product.id === props.active.id ? 'preview-artboard' : undefined}>
                <img className={artworkStyles.productArt} src={figmaAsset(product.image)} alt={`${product.name} preview`} draggable={false} />
                {config.logoEnabled && product.imprintCapabilities.supportsLogo && imprint.logo?.objectUrl && <img data-testid="brand-logo-preview" className={artworkStyles.brandLogo} style={product.logoPlacement} src={imprint.logo.objectUrl} alt="" />}
                {config.textEnabled && product.imprintCapabilities.supportsText && <div data-testid="brand-text-preview" className={artworkStyles.brandText} style={product.textPlacement}>{imprint.lines.map((line, lineIndex) => line && <span key={lineIndex} style={{ fontWeight: imprint.boldLines[lineIndex] ? 700 : 400 }}>{line}</span>)}</div>}
              </div>
            </div>
          </article>;
        })}
      </div>
    </div>
    <div className={`${styles.pagination} ${layoutStyles.pagination}`} role="group" aria-label="Preview product position">
      {selected.map((product, index) => <button key={product.id} type="button" aria-label={`Show ${product.summaryName}`} aria-current={index === activeIndex ? 'true' : undefined} className={index === activeIndex ? styles.paginationActive : ''} onClick={() => props.setActiveProduct(product.id)}><span /></button>)}
    </div>
    <div className={`${styles.previewStationary} ${layoutStyles.previewStationary}`}>
      <div className={`${styles.mobileProductSummary} ${layoutStyles.mobileProductSummary} ${summaryFade === 'out' ? styles.summaryFadingOut : summaryFade === 'in' ? styles.summaryFadingIn : ''}`} aria-live="polite" data-testid="preview-product-summary" data-transition-state={summaryFade}>
        <div className={styles.mobileProductIdentity}><h2><span data-testid="preview-product-name">{displayedProduct.summaryName}</span><img className={styles.previewStatus} src={figmaAsset(displayedConfigured ? 'a077a.svg' : 'e60bc.svg')} alt={displayedConfigured ? 'Configured' : 'Not configured'} data-testid="product-configuration-status" /></h2><span className={styles.mobileProductType} data-testid="preview-product-type">{categoryFor(displayedProduct)}</span></div>
      </div>
      <section className={styles.mobilePreviewActions} aria-label={`${props.active.name} imprint selections`} data-testid="preview-option-controls">
        <div className={styles.previewOptions}>
          <BrandingToggle label="Logo" selected={props.config.logoEnabled} disabled={logoDisabled} onClick={() => props.setBranding(props.active.id, 'logoEnabled', !props.config.logoEnabled)} />
          <BrandingToggle label="Text" selected={props.config.textEnabled} disabled={textDisabled} onClick={() => props.setBranding(props.active.id, 'textEnabled', !props.config.textEnabled)} />
        </div>
      </section>
    </div>
    <span className="sr-only" aria-live="polite" aria-atomic="true">Preview {activeIndex + 1} of {selected.length}: {props.active.summaryName}</span>
  </div>;
}
