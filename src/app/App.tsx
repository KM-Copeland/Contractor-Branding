import { useEffect, useRef, useState } from 'react';
import { AppShell } from './AppShell';
import { hasValidImprint, WorkflowProvider, useWorkflow } from './WorkflowContext';
import { StepOneScreen } from '../features/selection/StepOneScreen';
import { CompletionScreen } from '../features/selection/CompletionScreen';
import { BrandReview } from '../features/branding/BrandReview';
import { LandingScreen } from '../features/landing/LandingScreen';
import { NoticeDialog } from '../components/Controls';

function Workflow() {
  const { state, enterBranding, backToProducts, showLanding, showProducts, finish } = useWorkflow();
  const [notice, setNotice] = useState<{ title: string; body: string } | null>(null);
  const [responsiveProgress, setResponsiveProgress] = useState<number | undefined>();
  const previousStep = useRef(state.step);
  const initialRouteSync = useRef(true);
  const skipInitialRouteFocus = useRef(false);
  useEffect(() => {
    const synchronizeRoute = () => {
      const firstSync = initialRouteSync.current;
      initialRouteSync.current = false;
      if (firstSync && window.location.hash && window.location.hash !== '#home') skipInitialRouteFocus.current = true;
      if (!window.location.hash || window.location.hash === '#home') {
        showLanding();
      } else if (window.location.hash === '#select-products') {
        showProducts();
      } else if ((window.location.hash === '#selection-ready' || window.location.hash === '#brand-review') && state.selectedIds.length > 0) {
        enterBranding();
      } else if (window.location.hash === '#complete' && hasValidImprint(state)) {
        finish();
      } else if (window.location.hash === '#complete' && state.selectedIds.length > 0) {
        enterBranding();
        window.history.replaceState(null, '', '#brand-review');
      } else {
        backToProducts();
        if (window.location.hash === '#selection-ready' || window.location.hash === '#brand-review' || window.location.hash === '#complete') window.history.replaceState(null, '', '#select-products');
      }
    };
    synchronizeRoute();
    window.addEventListener('hashchange', synchronizeRoute);
    return () => window.removeEventListener('hashchange', synchronizeRoute);
  }, [state.selectedIds.length, state.imprint, state.branding, enterBranding, backToProducts, showLanding, showProducts, finish]);
  useEffect(() => {
    if (previousStep.current === state.step) return;
    previousStep.current = state.step;
    if (skipInitialRouteFocus.current) {
      skipInitialRouteFocus.current = false;
      return;
    }
    document.querySelector<HTMLElement>('[data-active-screen="true"] h1')?.focus({ preventScroll: true });
    window.scrollTo(0, 0);
  }, [state.step]);
  const forward = () => {
    if (!state.selectedIds.length) return;
    if (window.location.hash !== '#select-products') window.history.replaceState(null, '', '#select-products');
    window.location.hash = 'brand-review';
  };
  const selecting = state.step === 'select-products';
  const landing = state.step === 'landing';
  const reviewing = state.step === 'brand-review';
  const finishing = state.step === 'complete';
  const progress = selecting ? 'select-products' : (reviewing || state.step === 'selection-ready') ? 'brand-review' : finishing ? 'complete' : undefined;
  return <><AppShell progress={progress} progressValue={responsiveProgress} showNotice={title => setNotice({ title, body: 'This section is outside the product-selection prototype.' })}>
    {landing && <div data-active-screen="true"><LandingScreen onStart={() => { window.location.hash = 'select-products'; }} /></div>}
    {/* Keep the selection view mounted so its query/category survive navigation. */}
    <div hidden={!selecting} data-active-screen={selecting}><StepOneScreen continueSelection={forward} backToLanding={() => { window.location.hash = 'home'; }} active={selecting} /></div>
    {reviewing && <div data-active-screen="true"><BrandReview back={() => { window.location.hash = 'select-products'; }} complete={() => { window.location.hash = 'complete'; }} onResponsiveProgress={setResponsiveProgress} /></div>}
    {finishing && <div data-active-screen="true"><CompletionScreen back={() => { window.location.hash = '#select-products'; }} /></div>}
  </AppShell><NoticeDialog notice={notice} close={() => setNotice(null)} /></>;
}
export function App() { return <WorkflowProvider><Workflow /></WorkflowProvider>; }
