import { products } from '../../data/products';
import { supportsSimultaneousImprint } from '../../data/imprintCapabilities';
import type { LogoAsset, ProductFamilyId, WorkflowState } from '../../types/workflow';
import { areAllSelectedProductsConfigured } from './workflowValidation';

export const initialWorkflowState: WorkflowState = {
  step: 'landing',
  selectedIds: [],
  imprint: { logo: null, lines: ['', ''], boldLines: [false, false] },
  branding: {},
  preview: { activeFamilyId: null, expanded: false },
};

export type WorkflowAction =
  | { type: 'toggle-product' | 'remove-product'; id: ProductFamilyId }
  | { type: 'clear-products' | 'continue' | 'back' | 'finish' | 'home' | 'products' }
  | { type: 'enter-branding' }
  | { type: 'set-logo'; logo: LogoAsset | null }
  | { type: 'set-line'; index: 0 | 1; value: string }
  | { type: 'toggle-bold'; index: 0 | 1 }
  | { type: 'set-branding'; id: ProductFamilyId; key: 'logoEnabled' | 'textEnabled'; value: boolean }
  | { type: 'set-active'; id: ProductFamilyId }
  | { type: 'set-expanded'; value: boolean };

/** Pure state transitions for the Contractor Branding workflow. */
export function workflowReducer(state: WorkflowState, action: WorkflowAction): WorkflowState {
  switch (action.type) {
    case 'home': return { ...state, step: 'landing' };
    case 'products': return { ...state, step: 'select-products' };
    case 'continue': return state.selectedIds.some(id => products.some(product => product.id === id)) ? { ...state, step: 'selection-ready' } : state;
    case 'enter-branding': return state.selectedIds.length ? { ...state, step: 'brand-review', preview: { ...state.preview, activeFamilyId: state.selectedIds.includes(state.preview.activeFamilyId || '') ? state.preview.activeFamilyId : state.selectedIds[0] } } : state;
    case 'back': return state.step === 'select-products' ? state : { ...state, step: 'select-products' };
    case 'finish': return areAllSelectedProductsConfigured(state) ? { ...state, step: 'complete' } : state;
    case 'clear-products': return { ...state, selectedIds: [], step: 'select-products', preview: { ...state.preview, activeFamilyId: null } };
    case 'remove-product': {
      const selectedIds = state.selectedIds.filter(id => id !== action.id);
      const activeFamilyId = state.preview.activeFamilyId === action.id ? selectedIds[0] || null : state.preview.activeFamilyId;
      return { ...state, selectedIds, preview: { ...state.preview, activeFamilyId } };
    }
    case 'toggle-product': {
      if (!products.some(product => product.id === action.id)) return state;
      const selectedIds = state.selectedIds.includes(action.id) ? state.selectedIds.filter(id => id !== action.id) : [...state.selectedIds, action.id];
      return { ...state, selectedIds, preview: { ...state.preview, activeFamilyId: selectedIds.includes(state.preview.activeFamilyId || '') ? state.preview.activeFamilyId : selectedIds[0] || null } };
    }
    case 'set-logo': return { ...state, imprint: { ...state.imprint, logo: action.logo } };
    case 'set-line': {
      const lines = [...state.imprint.lines] as [string, string]; lines[action.index] = action.value.slice(0, 30);
      return { ...state, imprint: { ...state.imprint, lines } };
    }
    case 'toggle-bold': {
      const boldLines = [...state.imprint.boldLines] as [boolean, boolean];
      boldLines[action.index] = !boldLines[action.index];
      return { ...state, imprint: { ...state.imprint, boldLines } };
    }
    case 'set-branding': {
      const current = state.branding[action.id] || { logoEnabled: false, textEnabled: false };
      const product = products.find(item => item.id === action.id);
      const capabilities = product?.imprintCapabilities;
      if (action.key === 'logoEnabled' && action.value && !capabilities?.supportsLogo) return state;
      if (action.key === 'textEnabled' && action.value && !capabilities?.supportsText) return state;
      const next = { ...current, [action.key]: action.value };
      if (action.value && capabilities && !supportsSimultaneousImprint(capabilities)) {
        if (action.key === 'logoEnabled') next.textEnabled = false;
        else next.logoEnabled = false;
      }
      return { ...state, branding: { ...state.branding, [action.id]: next } };
    }
    case 'set-active': return state.selectedIds.includes(action.id) ? { ...state, preview: { ...state.preview, activeFamilyId: action.id } } : state;
    case 'set-expanded': return { ...state, preview: { ...state.preview, expanded: action.value } };
  }
}
