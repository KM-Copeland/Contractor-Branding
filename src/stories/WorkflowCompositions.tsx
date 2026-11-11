import { useEffect, useRef, useState } from 'react';
import { App } from '../app/App';
import { AppShell } from '../app/AppShell';
import { hasValidImprint, useWorkflow, WorkflowProvider } from '../app/WorkflowContext';
import { ResponsiveActionFooter } from '../components/ResponsiveActionFooter';
import { products } from '../data/products';
import type { ProductFamilyId } from '../types/workflow';
import { CompletionScreen } from '../features/selection/CompletionScreen';
import { SelectionPanel } from '../features/selection/SelectionPanel';
import { StepOneScreen } from '../features/selection/StepOneScreen';
import { BrandReview } from '../features/branding/BrandReview';
import { DesktopStep2 } from '../features/branding/DesktopStep2';
import { ImprintForm } from '../features/branding/ImprintForm';
import { ProductPreviewPanel } from '../features/branding/ProductPreviewPanel';
import { ProductPreviewCarousel } from '../features/branding/ProductPreviewCarousel';
import { ResponsiveStep2 } from '../features/branding/ResponsiveStep2';
import { validateLogoFile, type LogoValidationResult } from '../features/branding/logoValidation';
import { defaultBrandingConfiguration } from '../features/branding/step2Presentation';
import { figmaAsset } from '../data/products';
import { WorkflowScenario, storyProductIds } from './WorkflowScenario';
import styles from '../features/branding/BrandReview.module.css';

export function SelectionScreenExample({ productIds = storyProductIds.single }: { productIds?: ProductFamilyId[] }) {
  const { enterBranding, showLanding } = useWorkflow();
  return <StepOneScreen active continueSelection={enterBranding} backToLanding={showLanding} />;
}
export function StepOneWorkflowExample({ productIds = storyProductIds.single }: { productIds?: ProductFamilyId[] }) {
  return <WorkflowScenario productIds={productIds} step="select-products"><SelectionScreenExample productIds={productIds} /></WorkflowScenario>;
}
export function SelectionPanelExample({ productIds = storyProductIds.single }: { productIds?: ProductFamilyId[] }) {
  return <WorkflowScenario productIds={productIds} step="select-products"><SelectionPanelContent /></WorkflowScenario>;
}
function SelectionPanelContent() {
  const { enterBranding, showLanding } = useWorkflow();
  return <SelectionPanel continueSelection={enterBranding} backToLanding={showLanding} />;
}
export function BrandReviewExample({ productIds = storyProductIds.single, configured = false }: { productIds?: ProductFamilyId[]; configured?: boolean }) {
  return <WorkflowScenario productIds={productIds} step="brand-review" configured={configured}><BrandReviewContent /></WorkflowScenario>;
}
function BrandReviewContent() { const { backToProducts } = useWorkflow(); return <AppShell progress="brand-review" showNotice={() => {}}><BrandReview back={backToProducts} complete={() => {}} /></AppShell>; }
export function CompletionExample({ productIds = storyProductIds.single }: { productIds?: ProductFamilyId[] }) {
  return <WorkflowScenario productIds={productIds} step="complete" configured><CompletionContent /></WorkflowScenario>;
}
function CompletionContent() { const { showProducts } = useWorkflow(); return <CompletionScreen back={showProducts} />; }

function useStep2Props() {
  const workflow = useWorkflow();
  const { state } = workflow;
  const selected = products.filter(product => state.selectedIds.includes(product.id));
  const active = selected.find(product => product.id === state.preview.activeFamilyId) ?? selected[0];
  const activeIndex = Math.max(0, selected.findIndex(product => product.id === active?.id));
  const config = active ? { ...defaultBrandingConfiguration, ...state.branding[active.id] } : defaultBrandingConfiguration;
  return { workflow, state, selected, active, activeIndex, config, hasLogo: !!state.imprint.logo, hasText: state.imprint.lines.some(line => line.trim()) };
}

export function DesktopStep2Example() {
  return <WorkflowScenario productIds={storyProductIds.mixed} step="brand-review" configured><DesktopStep2Content /></WorkflowScenario>;
}
function DesktopStep2Content() {
  const value = useStep2Props();
  const fileInput = useRef<HTMLInputElement>(null);
  const objectUrl = useRef<string | null>(null);
  const [logoValidation, setLogoValidation] = useState<LogoValidationResult | null>(null);
  useEffect(() => () => { if (objectUrl.current) URL.revokeObjectURL(objectUrl.current); }, []);
  const addFile = async (file?: File) => {
    if (!file) return;
    const result = await validateLogoFile(file);
    setLogoValidation(result);
    if (result.status === 'error') return;
    if (objectUrl.current) URL.revokeObjectURL(objectUrl.current);
    objectUrl.current = URL.createObjectURL(file);
    value.workflow.setLogo({ id: `${file.name}-${file.lastModified}`, filename: file.name, mimeType: file.type, sizeBytes: file.size, objectUrl: objectUrl.current });
  };
  if (!value.active) return null;
  return <DesktopStep2 state={value.state} selected={value.selected} active={value.active} activeIndex={value.activeIndex} config={value.config} hasLogo={value.hasLogo} hasText={value.hasText} hasDetails={value.hasLogo || value.hasText} isValid={hasValidImprint(value.state)} logoValidation={logoValidation} validatingLogo={false} fileInput={fileInput} addFile={addFile} removeLogo={() => { if (objectUrl.current) URL.revokeObjectURL(objectUrl.current); objectUrl.current = null; value.workflow.setLogo(null); }} setLine={value.workflow.setLine} toggleBold={value.workflow.toggleBold} setBranding={value.workflow.setBranding} setActiveProduct={value.workflow.setActiveProduct} back={value.workflow.backToProducts} complete={value.workflow.finish} removeProduct={value.workflow.removeProduct} />;
}

export function ResponsiveStep2Example({ initialView = 'imprint', initialMode = 'list' }: { initialView?: 'imprint' | 'configure'; initialMode?: 'list' | 'preview' }) {
  return <WorkflowScenario productIds={storyProductIds.mixed} step="brand-review" configured><ResponsiveStep2Content initialView={initialView} initialMode={initialMode} /></WorkflowScenario>;
}
function ResponsiveStep2Content({ initialView, initialMode }: { initialView: 'imprint' | 'configure'; initialMode: 'list' | 'preview' }) {
  const value = useStep2Props();
  const fileInput = useRef<HTMLInputElement>(null);
  const [view, setView] = useState<'imprint' | 'configure'>(initialView);
  const [configureMode, setConfigureMode] = useState<'list' | 'preview'>(initialMode);
  if (!value.active) return null;
  return <ResponsiveStep2 state={value.state} selected={value.selected} active={value.active} config={value.config} hasLogo={value.hasLogo} hasText={value.hasText} hasDetails={value.hasLogo || value.hasText} isValid={hasValidImprint(value.state)} logoValidation={null} validatingLogo={false} fileInput={fileInput} addFile={async () => {}} removeLogo={() => value.workflow.setLogo(null)} setLine={value.workflow.setLine} toggleBold={value.workflow.toggleBold} setBranding={value.workflow.setBranding} setActiveProduct={value.workflow.setActiveProduct} back={value.workflow.backToProducts} complete={value.workflow.finish} view={view} setView={setView} configureMode={configureMode} setConfigureMode={setConfigureMode} />;
}

export function ImprintFormExample() {
  return <WorkflowScenario productIds={storyProductIds.single} step="brand-review"><ImprintFormContent /></WorkflowScenario>;
}
function ImprintFormContent() {
  const workflow = useWorkflow();
  const fileInput = useRef<HTMLInputElement>(null);
  const objectUrl = useRef<string | null>(null);
  const [logoValidation, setLogoValidation] = useState<LogoValidationResult | null>(null);
  useEffect(() => () => { if (objectUrl.current) URL.revokeObjectURL(objectUrl.current); }, []);
  return <div style={{ maxWidth: 650 }}><ImprintForm imprint={workflow.state.imprint} logoValidation={logoValidation} validatingLogo={false} fileInput={fileInput} addFile={async file => {
    if (!file) return;
    const result = await validateLogoFile(file); setLogoValidation(result);
    if (result.status !== 'error') { if (objectUrl.current) URL.revokeObjectURL(objectUrl.current); objectUrl.current = URL.createObjectURL(file); workflow.setLogo({ id: file.name, filename: file.name, mimeType: file.type, sizeBytes: file.size, objectUrl: objectUrl.current }); }
  }} removeLogo={() => { if (objectUrl.current) URL.revokeObjectURL(objectUrl.current); objectUrl.current = null; workflow.setLogo(null); }} setLine={workflow.setLine} toggleBold={workflow.toggleBold} /></div>;
}
export function EmptyImprintFormExample() { return <WorkflowProvider><ImprintFormContent /></WorkflowProvider>; }

export function PreviewPanelExample({ productIds = storyProductIds.mixed, configured = true, activeProductId, imprintMode = 'text' }: { productIds?: ProductFamilyId[]; configured?: boolean; activeProductId?: ProductFamilyId; imprintMode?: 'none' | 'logo' | 'text' | 'both' }) {
  return <WorkflowScenario productIds={productIds} step="brand-review" configured={configured} activeProductId={activeProductId} imprintMode={imprintMode}><PreviewPanelContent /></WorkflowScenario>;
}
function PreviewPanelContent() {
  const { workflow, state, selected, active, activeIndex, config, hasLogo, hasText } = useStep2Props();
  if (!active) return null;
  return <div className={styles.workspace}><ProductPreviewPanel selected={selected} active={active} activeIndex={activeIndex} config={config} hasLogo={hasLogo} hasText={hasText} imprint={state.imprint} previewExpanded={state.preview.expanded} setActiveProduct={workflow.setActiveProduct} setBranding={workflow.setBranding} /></div>;
}

export function CarouselExample({ productIds = storyProductIds.mixed, configured = true, activeProductId, imprintMode = 'text' }: { productIds?: ProductFamilyId[]; configured?: boolean; activeProductId?: ProductFamilyId; imprintMode?: 'none' | 'logo' | 'text' | 'both' }) {
  return <WorkflowScenario productIds={productIds} step="brand-review" configured={configured} activeProductId={activeProductId} imprintMode={imprintMode}><CarouselContent /></WorkflowScenario>;
}
function CarouselContent() {
  const { workflow, state, selected, active, config, hasLogo, hasText } = useStep2Props();
  if (!active) return null;
  return <main className={styles.responsiveMain + ' ' + styles.previewMode} data-step2-view="configure" data-configure-mode="preview"><div className={styles.responsiveContent}><header className={styles.responsiveIntro}><h1>Configure products</h1><p>Swipe or select a product to inspect its imprint.</p></header><div className={styles.configureTabs} role="tablist" aria-label="Configure products display"><button role="tab" aria-selected="false">List</button><button role="tab" aria-selected="true">Preview</button></div><section className={styles.configurePanel}><ProductPreviewCarousel selected={selected} active={active} config={config} branding={state.branding} imprint={state.imprint} hasLogo={hasLogo} hasText={hasText} setActiveProduct={workflow.setActiveProduct} setBranding={workflow.setBranding} /></section></div><ResponsiveActionFooter backLabel="Back to products" onBack={workflow.backToProducts} onContinue={workflow.finish} continueDisabled={!hasValidImprint(state)} testId="storybook-footer" /></main>;
}

export function AppShellExample({ progress = 'brand-review' }: { progress?: 'select-products' | 'brand-review' | 'complete' | null }) {
  const [notice, setNotice] = useState('');
  return <AppShell progress={progress ?? undefined} showNotice={setNotice}><main id="main" style={{ minHeight: '70vh', padding: 32 }}><h1>{progress ? 'Workflow screen' : 'Landing screen'}</h1><p>{progress ? 'Representative content inside the shared navigation and progress shell.' : 'The landing view uses the shared navigation without a workflow progress track.'}</p><p aria-live="polite">{notice && `${notice} notice selected`}</p></main></AppShell>;
}

export function FullWorkflowExample() { return <App />; }

export function FixtureLogoUrl() { return figmaAsset('aa956.svg'); }
