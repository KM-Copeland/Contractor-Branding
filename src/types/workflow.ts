export type CategoryId = 'thermostats' | 'wallplates' | 'other';
export type ProductFamilyId = string;
export interface ProductCategory { id: CategoryId; label: string }
export interface ImprintCapabilities {
  supportsLogo: boolean;
  supportsText: boolean;
  supportsSimultaneousImprint: boolean;
}
export interface PreviewPlacement {
  left?: string; right?: string; top?: string; bottom?: string; width?: string;
  fontSize?: string; lineHeight?: string; textAlign?: 'left' | 'center' | 'right';
  whiteSpace?: 'normal' | 'nowrap'; mixBlendMode?: 'darken' | 'normal';
}
export interface ProductFamily {
  id: ProductFamilyId; categoryId: CategoryId; name: string; summaryName: string;
  image: string; figmaNode?: string; tallCard?: boolean; summaryImageSize?: 44 | 50; imprintCapabilities: ImprintCapabilities;
  logoPlacement?: PreviewPlacement; textPlacement?: PreviewPlacement;
}
export interface LogoAsset { id: string; filename: string; mimeType: string; sizeBytes: number; objectUrl: string }
export interface ImprintSettings { logo: LogoAsset | null; lines: [string, string]; boldLines: [boolean, boolean] }
export interface ProductBrandingConfiguration { logoEnabled: boolean; textEnabled: boolean }
export interface PreviewState { activeFamilyId: ProductFamilyId | null; expanded: boolean }
export interface WorkflowState {
  step: 'landing' | 'select-products' | 'selection-ready' | 'brand-review' | 'complete';
  selectedIds: ProductFamilyId[];
  imprint: ImprintSettings;
  branding: Record<ProductFamilyId, ProductBrandingConfiguration>;
  preview: PreviewState;
}
