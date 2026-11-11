import { createContext, useCallback, useContext, useReducer, type ReactNode } from 'react';
import type { LogoAsset, ProductFamilyId, WorkflowState } from '../types/workflow';
import { initialWorkflowState, workflowReducer } from '../domain/workflow/workflowReducer';
export { areAllSelectedProductsConfigured as hasValidImprint } from '../domain/workflow/workflowValidation';
interface WorkflowContextValue {
  state: WorkflowState; toggleProduct: (id: ProductFamilyId) => void; removeProduct: (id: ProductFamilyId) => void; clearProducts: () => void;
  continueSelection: () => void; enterBranding: () => void; backToProducts: () => void; showLanding: () => void; showProducts: () => void; finish: () => void;
  setLogo: (logo: LogoAsset | null) => void; setLine: (index: 0 | 1, value: string) => void;
  toggleBold: (index: 0 | 1) => void;
  setBranding: (id: ProductFamilyId, key: 'logoEnabled' | 'textEnabled', value: boolean) => void;
  setActiveProduct: (id: ProductFamilyId) => void; setPreviewExpanded: (value: boolean) => void;
}
const WorkflowContext = createContext<WorkflowContextValue | null>(null);
export function WorkflowProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(workflowReducer, initialWorkflowState);
  const toggleProduct = useCallback((id: ProductFamilyId) => dispatch({ type: 'toggle-product', id }), []);
  const removeProduct = useCallback((id: ProductFamilyId) => dispatch({ type: 'remove-product', id }), []);
  const clearProducts = useCallback(() => dispatch({ type: 'clear-products' }), []);
  const continueSelection = useCallback(() => dispatch({ type: 'continue' }), []);
  const enterBranding = useCallback(() => dispatch({ type: 'enter-branding' }), []);
  const backToProducts = useCallback(() => dispatch({ type: 'back' }), []);
  const showLanding = useCallback(() => dispatch({ type: 'home' }), []);
  const showProducts = useCallback(() => dispatch({ type: 'products' }), []);
  const finish = useCallback(() => dispatch({ type: 'finish' }), []);
  const setLogo = useCallback((logo: LogoAsset | null) => dispatch({ type: 'set-logo', logo }), []);
  const setLine = useCallback((index: 0 | 1, value: string) => dispatch({ type: 'set-line', index, value }), []);
  const toggleBold = useCallback((index: 0 | 1) => dispatch({ type: 'toggle-bold', index }), []);
  const setBranding = useCallback((id: ProductFamilyId, key: 'logoEnabled' | 'textEnabled', value: boolean) => dispatch({ type: 'set-branding', id, key, value }), []);
  const setActiveProduct = useCallback((id: ProductFamilyId) => dispatch({ type: 'set-active', id }), []);
  const setPreviewExpanded = useCallback((value: boolean) => dispatch({ type: 'set-expanded', value }), []);
  return <WorkflowContext.Provider value={{ state, toggleProduct, removeProduct, clearProducts, continueSelection, enterBranding, backToProducts, showLanding, showProducts, finish, setLogo, setLine, toggleBold, setBranding, setActiveProduct, setPreviewExpanded }}>{children}</WorkflowContext.Provider>;
}
export function useWorkflow() { const value = useContext(WorkflowContext); if (!value) throw new Error('useWorkflow requires WorkflowProvider'); return value; }
