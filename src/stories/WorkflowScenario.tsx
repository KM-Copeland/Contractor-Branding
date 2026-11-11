import { useEffect, useRef, useState, type ReactNode } from 'react';
import { WorkflowProvider, useWorkflow } from '../app/WorkflowContext';
import { products } from '../data/products';
import type { ProductFamilyId, WorkflowState } from '../types/workflow';

export const storyProducts = products;
export const storyProductIds = {
  single: ['sensi-smart'],
  mixed: ['sensi-smart', '80-series', 'wallplate-touch2-lite', 'sensi-module'],
  six: ['sensi-smart', '80-series', '70-series', 'wallplate-80-70-sensi', 'wallplate-touch2-lite', 'sensi-module'],
} satisfies Record<string, ProductFamilyId[]>;

export function emptyBranding(state: WorkflowState['branding'] = {}) {
  return Object.fromEntries(products.map(product => [product.id, state[product.id] ?? { logoEnabled: false, textEnabled: false }])) as WorkflowState['branding'];
}

/** Story-only setup through the same public workflow actions the app uses. */
export function WorkflowScenario({ children, productIds = storyProductIds.single, step = 'select-products', configured = false, activeProductId, imprintMode = 'text' }: {
  children: ReactNode;
  productIds?: ProductFamilyId[];
  step?: WorkflowState['step'];
  configured?: boolean;
  activeProductId?: ProductFamilyId;
  imprintMode?: 'none' | 'logo' | 'text' | 'both';
}) {
  return <WorkflowProvider><ScenarioInitializer productIds={productIds} step={step} configured={configured} activeProductId={activeProductId} imprintMode={imprintMode}>{children}</ScenarioInitializer></WorkflowProvider>;
}

function ScenarioInitializer({ children, productIds, step, configured, activeProductId, imprintMode }: {
  children: ReactNode;
  productIds: ProductFamilyId[];
  step: WorkflowState['step'];
  configured: boolean;
  activeProductId?: ProductFamilyId;
  imprintMode: 'none' | 'logo' | 'text' | 'both';
}) {
  const workflow = useWorkflow();
  const initialized = useRef(false);
  const [ready, setReady] = useState(false);
  const matchesScenario = productIds.every(id => workflow.state.selectedIds.includes(id)) && workflow.state.step === step && (!activeProductId || workflow.state.preview.activeFamilyId === activeProductId);

  useEffect(() => {
    if (matchesScenario) setReady(true);
  }, [matchesScenario]);

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;
    if (step === 'select-products') workflow.showProducts();
    productIds.forEach(id => workflow.toggleProduct(id));
    if (step === 'brand-review' || step === 'complete') {
      workflow.continueSelection();
      workflow.enterBranding();
      if (activeProductId) workflow.setActiveProduct(activeProductId);
      workflow.setLine(0, 'Northside Heating');
      workflow.setLine(1, 'Service you can trust');
      workflow.setLogo({ id: 'storybook-logo', filename: 'copeland-sample.svg', mimeType: 'image/svg+xml', sizeBytes: 2048, objectUrl: '/assets/figma/aa956.svg' });
      if ((configured || step === 'complete') && imprintMode !== 'none') {
        productIds.forEach(id => {
          const product = products.find(item => item.id === id);
          if (imprintMode === 'text' || imprintMode === 'both') {
            if (product?.imprintCapabilities.supportsText) workflow.setBranding(id, 'textEnabled', true);
          }
          if (imprintMode === 'logo' || imprintMode === 'both') {
            if (product?.imprintCapabilities.supportsLogo) workflow.setBranding(id, 'logoEnabled', true);
          }
        });
        if (step === 'complete') workflow.finish();
      }
    }
  }, [activeProductId, configured, imprintMode, productIds, step, workflow]);

  return ready ? <>{children}</> : <div role="status" aria-live="polite" style={{ padding: 24 }}>Preparing the workflow example…</div>;
}
