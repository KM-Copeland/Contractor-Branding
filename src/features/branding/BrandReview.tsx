import { useEffect, useMemo, useRef, useState } from 'react';
import { products } from '../../data/products';
import { hasValidImprint, useWorkflow } from '../../app/WorkflowContext';
import { validateLogoFile, type LogoValidationResult } from './logoValidation';
import { DesktopStep2 } from './DesktopStep2';
import { defaultBrandingConfiguration, type Step2PresentationProps } from './step2Presentation';
import { ResponsiveStep2 } from './ResponsiveStep2';

type InternalView = 'imprint' | 'configure';
type ConfigureMode = 'list' | 'preview';

export function BrandReview({ back, complete, onResponsiveProgress }: { back: () => void; complete: () => void; onResponsiveProgress?: (progress?: number) => void }) {
  const workflow = useWorkflow();
  const { state } = workflow;
  const selected = useMemo(() => products.filter(product => state.selectedIds.includes(product.id)), [state.selectedIds]);
  const active = selected.find(product => product.id === state.preview.activeFamilyId) || selected[0];
  const activeIndex = Math.max(0, selected.findIndex(product => product.id === active?.id));
  const config = active ? { ...defaultBrandingConfiguration, ...state.branding[active.id] } : defaultBrandingConfiguration;
  const [view, setView] = useState<InternalView>('imprint');
  const [configureMode, setConfigureMode] = useState<ConfigureMode>('list');
  const [compact, setCompact] = useState(() => window.matchMedia('(max-width: 1279px)').matches);
  const fileInput = useRef<HTMLInputElement>(null);
  const [logoValidation, setLogoValidation] = useState<LogoValidationResult | null>(null);
  const [validatingLogo, setValidatingLogo] = useState(false);
  const validationRequest = useRef(0);
  const hasLogo = !!state.imprint.logo;
  const hasText = state.imprint.lines.some(line => line.trim());
  const hasDetails = hasLogo || hasText;
  const isValid = hasValidImprint(state);

  useEffect(() => {
    const query = window.matchMedia('(max-width: 1279px)');
    const update = () => setCompact(query.matches);
    update();
    query.addEventListener('change', update);
    return () => query.removeEventListener('change', update);
  }, []);

  const addFile = async (file?: File) => {
    if (!file) return;
    const request = ++validationRequest.current;
    if (state.imprint.logo?.objectUrl) URL.revokeObjectURL(state.imprint.logo.objectUrl);
    workflow.setLogo(null);
    setLogoValidation(null);
    setValidatingLogo(true);
    const result = await validateLogoFile(file).catch((): LogoValidationResult => ({ status: 'error', format: '', dimensions: null, dpi: null, effectiveDpi: null, failures: ['The file could not be read safely. Choose another file and try again.'], warnings: [], unverified: [], summary: 'Logo does not meet upload requirements' }));
    if (request !== validationRequest.current) return;
    setValidatingLogo(false);
    setLogoValidation(result);
    if (result.status === 'error') return;
    const previewable = ['jpeg', 'png', 'svg'].includes(result.format);
    const mimeType = file.type || ({ jpeg: 'image/jpeg', png: 'image/png', svg: 'image/svg+xml' }[result.format] ?? 'application/octet-stream');
    workflow.setLogo({ id: `${file.name}-${file.lastModified}-${request}`, filename: file.name, mimeType, sizeBytes: file.size, objectUrl: previewable ? URL.createObjectURL(file) : '' });
  };

  const removeLogo = () => {
    validationRequest.current++;
    setValidatingLogo(false);
    setLogoValidation(null);
    if (state.imprint.logo?.objectUrl) URL.revokeObjectURL(state.imprint.logo.objectUrl);
    workflow.setLogo(null);
    if (fileInput.current) fileInput.current.value = '';
  };

  if (!active) return null;
  const sharedProps: Step2PresentationProps = {
    state,
    selected,
    active,
    config,
    hasLogo,
    hasText,
    hasDetails,
    isValid,
    logoValidation,
    validatingLogo,
    fileInput,
    addFile,
    removeLogo,
    setLine: workflow.setLine,
    toggleBold: workflow.toggleBold,
    setBranding: workflow.setBranding,
    setActiveProduct: workflow.setActiveProduct,
    back,
    complete,
  };
  return compact
    ? <ResponsiveStep2 {...sharedProps} view={view} setView={setView} configureMode={configureMode} setConfigureMode={setConfigureMode} onResponsiveProgress={onResponsiveProgress} />
    : <DesktopStep2 {...sharedProps} activeIndex={activeIndex} removeProduct={workflow.removeProduct} />;
}
