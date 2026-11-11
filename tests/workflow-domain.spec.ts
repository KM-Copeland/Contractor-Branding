import { expect, test } from '@playwright/test';
import { products } from '../src/data/products';
import type { ProductFamilyId, WorkflowState } from '../src/types/workflow';
import { initialWorkflowState, workflowReducer } from '../src/domain/workflow/workflowReducer';
import { areAllSelectedProductsConfigured, isProductConfigured } from '../src/domain/workflow/workflowValidation';

const logo = { id: 'logo-1', filename: 'mark.png', mimeType: 'image/png', sizeBytes: 128, objectUrl: 'blob:mark' };
const cloneInitial = (): WorkflowState => structuredClone(initialWorkflowState);
const toggle = (state: WorkflowState, id: ProductFamilyId) => workflowReducer(state, { type: 'toggle-product', id });
const select = (...ids: ProductFamilyId[]) => ids.reduce(toggle, cloneInitial());

test('domain initial state preserves the complete workflow contract', () => {
  expect(initialWorkflowState).toEqual({
    step: 'landing', selectedIds: [],
    imprint: { logo: null, lines: ['', ''], boldLines: [false, false] },
    branding: {}, preview: { activeFamilyId: null, expanded: false },
  });
});

test('selection rejects unknown ids and preserves ordering and active-product fallback', () => {
  const empty = cloneInitial();
  expect(workflowReducer(empty, { type: 'toggle-product', id: 'not-a-product' })).toBe(empty);
  const selected = select('80-series', 'sensi-smart', 'blue-12');
  expect(selected.selectedIds).toEqual(['80-series', 'sensi-smart', 'blue-12']);
  expect(selected.preview.activeFamilyId).toBe('80-series');
  const active = workflowReducer(selected, { type: 'set-active', id: 'sensi-smart' });
  expect(active.preview.activeFamilyId).toBe('sensi-smart');
  expect(workflowReducer(active, { type: 'set-active', id: 'classic-80' })).toBe(active);
  const removedActive = workflowReducer(active, { type: 'remove-product', id: 'sensi-smart' });
  expect(removedActive.selectedIds).toEqual(['80-series', 'blue-12']);
  expect(removedActive.preview.activeFamilyId).toBe('80-series');
  expect(workflowReducer(removedActive, { type: 'remove-product', id: 'not-a-product' })).toEqual(removedActive);
  const toggledOff = workflowReducer(removedActive, { type: 'toggle-product', id: '80-series' });
  expect(toggledOff.selectedIds).toEqual(['blue-12']);
  expect(toggledOff.preview.activeFamilyId).toBe('blue-12');
});

test('clear selection clears only selection navigation and active preview state', () => {
  const state = select('sensi-smart', '80-series');
  const withDetails = workflowReducer(
    workflowReducer(
      workflowReducer(
        workflowReducer(state, { type: 'set-logo', logo }),
        { type: 'set-line', index: 0, value: 'Shared mark' },
      ),
      { type: 'set-branding', id: 'sensi-smart', key: 'logoEnabled', value: true },
    ),
    { type: 'set-expanded', value: true },
  );
  const cleared = workflowReducer(withDetails, { type: 'clear-products' });
  expect(cleared).toEqual({ ...withDetails, selectedIds: [], step: 'select-products', preview: { ...withDetails.preview, activeFamilyId: null } });
});

test('imprint updates truncate at 30 characters, toggle bold independently, and assign/remove logo', () => {
  const original = cloneInitial();
  const line1 = workflowReducer(original, { type: 'set-line', index: 0, value: '123456789012345678901234567890-extra' });
  expect(line1.imprint.lines).toEqual(['123456789012345678901234567890', '']);
  const line2 = workflowReducer(line1, { type: 'set-line', index: 1, value: 'Shared across products' });
  const bold1 = workflowReducer(line2, { type: 'toggle-bold', index: 0 });
  const bold2 = workflowReducer(bold1, { type: 'toggle-bold', index: 1 });
  expect(bold2.imprint.boldLines).toEqual([true, true]);
  expect(workflowReducer(bold2, { type: 'toggle-bold', index: 0 }).imprint.boldLines).toEqual([false, true]);
  const withLogo = workflowReducer(bold2, { type: 'set-logo', logo });
  expect(workflowReducer(withLogo, { type: 'set-logo', logo: null }).imprint.logo).toBeNull();
  expect(withLogo.imprint.lines).toEqual(line2.imprint.lines);
});

test('branding enforces actual catalog capabilities and mutual exclusion', () => {
  const state = select('sensi-smart', 'classic-80', 'blue-12');
  const both = workflowReducer(workflowReducer(state, { type: 'set-branding', id: 'sensi-smart', key: 'logoEnabled', value: true }), { type: 'set-branding', id: 'sensi-smart', key: 'textEnabled', value: true });
  expect(both.branding['sensi-smart']).toEqual({ logoEnabled: true, textEnabled: true });

  const exclusiveLogo = workflowReducer(both, { type: 'set-branding', id: 'classic-80', key: 'logoEnabled', value: true });
  const exclusiveText = workflowReducer(exclusiveLogo, { type: 'set-branding', id: 'classic-80', key: 'textEnabled', value: true });
  expect(exclusiveText.branding['classic-80']).toEqual({ logoEnabled: false, textEnabled: true });
  expect(exclusiveText.branding['sensi-smart']).toEqual({ logoEnabled: true, textEnabled: true });

  const unsupported = workflowReducer(exclusiveText, { type: 'set-branding', id: 'blue-12', key: 'logoEnabled', value: true });
  expect(unsupported).toBe(exclusiveText);
  const supportedText = workflowReducer(unsupported, { type: 'set-branding', id: 'blue-12', key: 'textEnabled', value: true });
  expect(supportedText.branding['blue-12']).toEqual({ logoEnabled: false, textEnabled: true });
});

test('individual readiness uses only enabled, present, supported imprint content', () => {
  const sensi = products.find(product => product.id === 'sensi-smart')!;
  const blue = products.find(product => product.id === 'blue-12')!;
  expect(isProductConfigured(sensi, undefined, false, false)).toBe(false);
  expect(isProductConfigured(sensi, { logoEnabled: true, textEnabled: false }, true, false)).toBe(true);
  expect(isProductConfigured(sensi, { logoEnabled: true, textEnabled: false }, false, false)).toBe(false);
  expect(isProductConfigured(blue, { logoEnabled: true, textEnabled: false }, true, false)).toBe(false);
  expect(isProductConfigured(blue, { logoEnabled: false, textEnabled: true }, false, true)).toBe(true);
});

test('aggregate readiness and finish guard share the exact configuration rule', () => {
  const selected = select('sensi-smart', 'blue-12');
  const withText = workflowReducer(selected, { type: 'set-line', index: 0, value: 'Ready' });
  expect(areAllSelectedProductsConfigured(withText)).toBe(false);
  expect(workflowReducer(withText, { type: 'finish' })).toBe(withText);

  const sensiReady = workflowReducer(withText, { type: 'set-branding', id: 'sensi-smart', key: 'textEnabled', value: true });
  expect(areAllSelectedProductsConfigured(sensiReady)).toBe(false);
  const allReady = workflowReducer(sensiReady, { type: 'set-branding', id: 'blue-12', key: 'textEnabled', value: true });
  expect(areAllSelectedProductsConfigured(allReady)).toBe(true);
  expect(workflowReducer(allReady, { type: 'finish' })).toEqual({ ...allReady, step: 'complete' });
  expect(areAllSelectedProductsConfigured(cloneInitial())).toBe(false);
});

test('legacy navigation and expanded preview transitions remain available', () => {
  const empty = cloneInitial();
  expect(workflowReducer(empty, { type: 'continue' })).toBe(empty);
  expect(workflowReducer(empty, { type: 'enter-branding' })).toBe(empty);
  const selected = select('sensi-smart');
  const ready = workflowReducer(selected, { type: 'continue' });
  expect(ready.step).toBe('selection-ready');
  const brandReview = workflowReducer(ready, { type: 'enter-branding' });
  expect(brandReview.step).toBe('brand-review');
  expect(brandReview.preview.activeFamilyId).toBe('sensi-smart');
  expect(workflowReducer(brandReview, { type: 'set-expanded', value: true }).preview.expanded).toBe(true);
  expect(workflowReducer(brandReview, { type: 'back' }).step).toBe('select-products');
  expect(workflowReducer(brandReview, { type: 'home' }).step).toBe('landing');
  expect(workflowReducer(brandReview, { type: 'products' }).step).toBe('select-products');
});
