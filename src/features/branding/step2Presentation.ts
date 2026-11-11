import type { RefObject } from 'react';
import type { ProductBrandingConfiguration, ProductFamily, WorkflowState } from '../../types/workflow';
import type { LogoValidationResult } from './logoValidation';

export const defaultBrandingConfiguration: ProductBrandingConfiguration = { logoEnabled: false, textEnabled: false };

export type Step2PresentationProps = {
  state: WorkflowState;
  selected: ProductFamily[];
  active: ProductFamily;
  config: ProductBrandingConfiguration;
  hasLogo: boolean;
  hasText: boolean;
  hasDetails: boolean;
  isValid: boolean;
  logoValidation: LogoValidationResult | null;
  validatingLogo: boolean;
  fileInput: RefObject<HTMLInputElement | null>;
  addFile: (file?: File) => Promise<void>;
  removeLogo: () => void;
  setLine: (index: 0 | 1, value: string) => void;
  toggleBold: (index: 0 | 1) => void;
  setBranding: (id: string, key: 'logoEnabled' | 'textEnabled', value: boolean) => void;
  setActiveProduct: (id: string) => void;
  back: () => void;
  complete: () => void;
};

export type DesktopStep2Props = Step2PresentationProps & {
  activeIndex: number;
  removeProduct: (id: string) => void;
};

export type ResponsiveStep2Props = Step2PresentationProps & {
  view: 'imprint' | 'configure';
  setView: (view: 'imprint' | 'configure') => void;
  configureMode: 'list' | 'preview';
  setConfigureMode: (mode: 'list' | 'preview') => void;
  onResponsiveProgress?: (progress?: number) => void;
};
