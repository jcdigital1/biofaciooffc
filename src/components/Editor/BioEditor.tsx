import React, { useState, useEffect, useRef, useMemo } from 'react';
import { BioTemplate, BioProject, EditorField, ColorItem } from '../../types';
import { preparePreviewHtml, generateExportHtml } from '../../lib/bioPreview';
import { PRESET_PALETTES, ColorPalettePreset } from '../../constants/palettes';
import {
  ArrowLeft,
  Save,
  Download,
  Smartphone,
  Monitor,
  Check,
  Upload,
  RotateCcw,
  Sparkles,
  Link,
  MessageCircle,
  Instagram,
  MapPin,
  Palette,
  Image,
  Type,
  MousePointerClick,
  AlertCircle,
  ExternalLink,
  X,
  Layers,
  ChevronRight,
} from 'lucide-react';

interface BioEditorProps {
  template: BioTemplate;
  existingProject?: BioProject | null;
  onSaveProject: (projectData: Partial<BioProject>) => Promise<BioProject>;
  onClose: () => void;
}

export const BioEditor: React.FC<BioEditorProps> = ({
  template,
  existingProject,
  onSaveProject,
  onClose,
}) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Project state
  const [projectName, setProjectName] = useState(
    existingProject?.name || `${template.name} - Meu BioSite`
  );

  // Field values state
  const [fieldValues, setFieldValues] = useState<Record<string, any>>(() => {
    const initial: Record<string, any> = {};
    template.editorSchema?.fields?.forEach((f) => {
      initial[f.key] = f.defaultValue ?? '';
    });
    if (existingProject?.values) {
      Object.assign(initial, existingProject.values);
    }
    return initial;
  });

  // Theme values state (CSS variables)
  const initialOriginalTheme = useMemo(() => {
    const orig: Record<string, string> = {
      ...(template.themeMetadata?.cssVariables || {}),
    };
    // Include colors mapped from schema
    template.editorSchema?.colors?.forEach((c) => {
      if (c.cssVarName) {
        orig[c.cssVarName] = c.defaultValue;
      }
    });
    return orig;
  }, [template]);

  const [themeValues, setThemeValues] = useState<Record<string, string>>(() => {
    const current: Record<string, string> = { ...initialOriginalTheme };
    if (existingProject?.theme) {
      Object.assign(current, existingProject.theme);
    }
    return current;
  });

  // Active view & Contextual editing
  const [activeTab, setActiveTab] = useState<'preview' | 'colors' | 'allFields'>('preview');
  const [selectedFieldKey, setSelectedFieldKey] = useState<string | null>(null);
  const [selectedFieldData, setSelectedFieldData] = useState<{
    key: string;
    label: string;
    type: string;
    currentValue: any;
    defaultValue?: any;
  } | null>(null);

  const [deviceView, setDeviceView] = useState<'mobile' | 'desktop'>('mobile');

  // Save states
  const [saveStatus, setSaveStatus] = useState<'idle' | 'unsaved' | 'saving' | 'saved' | 'error'>('idle');
  const [savedProject, setSavedProject] = useState<BioProject | null>(existingProject || null);
  const [showDownloadModal, setShowDownloadModal] = useState(false);
  const [saveErrorMessage, setSaveErrorMessage] = useState<string | null>(null);

  // Prepare iframe HTML once
  const initialIframeHtml = useMemo(() => {
    return preparePreviewHtml(
      template.sourceHtml,
      true, // isEditor = true
      fieldValues,
      themeValues
    );
  }, [template.sourceHtml]);

  // Push DOM field updates directly to iframe without reload
  const updateFieldInIframe = (key: string, value: any) => {
    if (iframeRef.current?.contentWindow) {
      iframeRef.current.contentWindow.postMessage(
        {
          type: 'BIO_UPDATE_FIELD',
          key,
          value,
        },
        '*'
      );
    }
  };

  // Push theme updates directly to iframe without reload
  const updateThemeInIframe = (themeObj: Record<string, string>) => {
    if (iframeRef.current?.contentWindow) {
      iframeRef.current.contentWindow.postMessage(
        {
          type: 'BIO_UPDATE_THEME',
          theme: themeObj,
        },
        '*'
      );
    }
  };

  // Highlight element in iframe
  const highlightElementInIframe = (key: string) => {
    if (iframeRef.current?.contentWindow) {
      iframeRef.current.contentWindow.postMessage(
        {
          type: 'BIO_HIGHLIGHT_FIELD',
          key,
        },
        '*'
      );
    }
  };

  // Listen for direct clicks inside iframe (✦ EDITAR PELO PREVIEW)
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (!event.data || typeof event.data !== 'object') return;

      if (event.data.type === 'BIO_ELEMENT_CLICKED') {
        const { key, fieldType, currentValue } = event.data;
        if (!key) return;

        // Find existing field in schema if available
        const existingField = template.editorSchema?.fields?.find((f) => f.key === key);

        let finalLabel = existingField?.label || key.replace(/^bf_/, '').replace(/_/g, ' ');
        if (key === 'logo') finalLabel = 'Logotipo / Foto de Perfil';
        else if (key === 'whatsapp') finalLabel = 'WhatsApp';
        else if (key === 'instagram') finalLabel = 'Instagram';
        else if (key === 'maps_link' || key === 'address_text') finalLabel = 'Localização & Contato';

        const effectiveValue = fieldValues[key] !== undefined ? fieldValues[key] : (currentValue || existingField?.defaultValue || '');

        setSelectedFieldKey(key);
        setSelectedFieldData({
          key,
          label: finalLabel,
          type: existingField?.type || fieldType || 'text',
          currentValue: effectiveValue,
          defaultValue: existingField?.defaultValue || currentValue,
        });

        // Switch to preview view if on colors tab
        if (activeTab === 'colors') {
          setActiveTab('preview');
        }
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [template, fieldValues, activeTab]);

  // Handle single field change
  const handleFieldValueChange = (key: string, val: any) => {
    setFieldValues((prev) => ({ ...prev, [key]: val }));
    setSaveStatus('unsaved');
    if (selectedFieldData && selectedFieldData.key === key) {
      setSelectedFieldData((prev) => (prev ? { ...prev, currentValue: val } : null));
    }
    updateFieldInIframe(key, val);
  };

  // Handle color change (individual)
  const handleColorChange = (cssVarName: string, colorHex: string) => {
    const newTheme = { ...themeValues, [cssVarName]: colorHex };
    setThemeValues(newTheme);
    setSaveStatus('unsaved');
    updateThemeInIframe(newTheme);
  };

  // Apply a preset palette
  const handleApplyPalette = (palette: ColorPalettePreset) => {
    const newTheme: Record<string, string> = { ...themeValues };

    // Map semantic roles to active CSS variables
    Object.keys(newTheme).forEach((vName) => {
      const lower = vName.toLowerCase();
      if (lower.includes('primary')) newTheme[vName] = palette.colors.primary;
      else if (lower.includes('secondary')) newTheme[vName] = palette.colors.secondary;
      else if (lower.includes('background') || lower === '--bg' || lower.includes('bg-')) newTheme[vName] = palette.colors.background;
      else if (lower.includes('surface') || lower.includes('card')) newTheme[vName] = palette.colors.surface;
      else if (lower.includes('text') || lower.includes('foreground')) newTheme[vName] = palette.colors.text;
      else if (lower.includes('muted')) newTheme[vName] = palette.colors.muted;
    });

    // Also support fallback --bio-* variables
    newTheme['--bio-primary'] = palette.colors.primary;
    newTheme['--bio-secondary'] = palette.colors.secondary;
    newTheme['--bio-background'] = palette.colors.background;
    newTheme['--bio-surface'] = palette.colors.surface;
    newTheme['--bio-text'] = palette.colors.text;
    newTheme['--bio-muted'] = palette.colors.muted;

    setThemeValues(newTheme);
    setSaveStatus('unsaved');
    updateThemeInIframe(newTheme);
  };

  // Restore original theme colors
  const handleRestoreOriginalColors = () => {
    setThemeValues({ ...initialOriginalTheme });
    setSaveStatus('unsaved');
    updateThemeInIframe(initialOriginalTheme);
  };

  // Image Upload handler (Base64 Data URI)
  const handleImageUpload = (key: string, file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUri = e.target?.result as string;
      if (dataUri) {
        handleFieldValueChange(key, dataUri);
      }
    };
    reader.readAsDataURL(file);
  };

  // Save Project Handler
  const handleSave = async () => {
    setSaveStatus('saving');
    setSaveErrorMessage(null);

    try {
      const projectPayload: Partial<BioProject> = {
        id: savedProject?.id || `proj-${Date.now()}`,
        name: projectName.trim(),
        templateId: template.templateId,
        templateVersion: template.version,
        templateName: template.name,
        nicheId: template.nicheId,
        values: fieldValues,
        theme: themeValues,
        updatedAt: new Date().toISOString(),
      };

      const result = await onSaveProject(projectPayload);
      setSavedProject(result);
      setSaveStatus('saved');
    } catch (err: any) {
      setSaveStatus('error');
      setSaveErrorMessage(err?.message || 'Falha ao salvar no Firestore');
    }
  };

  // Standalone Download Handler
  const handleDownload = () => {
    const cleanHtml = generateExportHtml(
      template.sourceHtml,
      fieldValues,
      themeValues
    );

    const blob = new Blob([cleanHtml], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${projectName.toLowerCase().replace(/[^a-z0-9]/g, '-') || 'biosite'}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    setShowDownloadModal(true);
  };

  // Colors list from theme
  const detectedThemeColors = useMemo(() => {
    const items: { label: string; varName: string; value: string }[] = [];
    Object.entries(themeValues).forEach(([vName, val]) => {
      let label = vName.replace(/^--bio-/, '').replace(/^--/, '');
      if (vName.includes('primary')) label = 'Cor Principal';
      else if (vName.includes('secondary')) label = 'Cor Secundária';
      else if (vName.includes('background') || vName.includes('bg')) label = 'Fundo da Página';
      else if (vName.includes('surface') || vName.includes('card')) label = 'Superfície / Cards';
      else if (vName.includes('text')) label = 'Texto Principal';
      else if (vName.includes('muted')) label = 'Texto Muted / Suave';
      else if (vName.includes('accent')) label = 'Destaque';

      items.push({ label, varName: vName, value: val });
    });
    return items;
  }, [themeValues]);

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-[#050706] text-[#F5FFF8] overflow-hidden select-none">
      {/* Top Navbar */}
      <header className="h-14 border-b border-[#18221c] bg-[#070b09] px-4 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-[#111713] hover:bg-[#18221c] text-[#87938B] hover:text-[#F5FFF8] transition cursor-pointer"
            title="Voltar aos modelos"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>

          <div>
            <input
              type="text"
              value={projectName}
              onChange={(e) => {
                setProjectName(e.target.value);
                setSaveStatus('unsaved');
              }}
              className="bg-transparent font-bold text-sm text-[#F5FFF8] border-b border-transparent hover:border-[#18221c] focus:border-[#36FF88] outline-none px-1 py-0.5"
            />
            <div className="text-[10px] text-[#87938B] font-mono px-1">
              Modelo: <span className="text-[#36FF88]">{template.name}</span>
            </div>
          </div>
        </div>

        {/* Center Mode Tabs */}
        <div className="flex items-center gap-1 bg-[#111713] p-1 rounded-xl border border-[#1e2a22]">
          <button
            onClick={() => setActiveTab('preview')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
              activeTab === 'preview'
                ? 'bg-[#36FF88] text-[#050706] shadow-[0_0_15px_rgba(54,255,136,0.3)]'
                : 'text-[#87938B] hover:text-[#F5FFF8]'
            }`}
          >
            <MousePointerClick className="w-3.5 h-3.5" />
            <span>Editar pelo Preview</span>
          </button>

          <button
            onClick={() => setActiveTab('colors')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
              activeTab === 'colors'
                ? 'bg-[#36FF88] text-[#050706] shadow-[0_0_15px_rgba(54,255,136,0.3)]'
                : 'text-[#87938B] hover:text-[#F5FFF8]'
            }`}
          >
            <Palette className="w-3.5 h-3.5" />
            <span>Cores & Paletas</span>
          </button>

          <button
            onClick={() => setActiveTab('allFields')}
            className={`hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
              activeTab === 'allFields'
                ? 'bg-[#36FF88] text-[#050706]'
                : 'text-[#87938B] hover:text-[#F5FFF8]'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Todos os Campos</span>
          </button>
        </div>

        {/* Device Switcher (Desktop vs Mobile Preview frame) */}
        <div className="hidden lg:flex items-center gap-1 bg-[#111713] p-1 rounded-xl border border-[#1e2a22]">
          <button
            onClick={() => setDeviceView('mobile')}
            className={`p-1.5 rounded-lg transition cursor-pointer ${
              deviceView === 'mobile' ? 'bg-[#1e2a22] text-[#36FF88]' : 'text-[#87938B] hover:text-[#F5FFF8]'
            }`}
            title="Visualização Celular"
          >
            <Smartphone className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setDeviceView('desktop')}
            className={`p-1.5 rounded-lg transition cursor-pointer ${
              deviceView === 'desktop' ? 'bg-[#1e2a22] text-[#36FF88]' : 'text-[#87938B] hover:text-[#F5FFF8]'
            }`}
            title="Visualização Desktop"
          >
            <Monitor className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Save & Download Actions */}
        <div className="flex items-center gap-2">
          {saveStatus === 'unsaved' && (
            <span className="hidden xl:inline-flex items-center gap-1 text-[11px] font-mono text-amber-400">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping"></span>
              <span>Alterações não salvas</span>
            </span>
          )}

          {saveStatus === 'saved' && (
            <span className="hidden xl:inline-flex items-center gap-1 text-[11px] font-mono text-[#36FF88] font-bold">
              <Check className="w-3.5 h-3.5" />
              <span>✓ Salvo</span>
            </span>
          )}

          <button
            onClick={handleSave}
            disabled={saveStatus === 'saving'}
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-[#111713] hover:bg-[#18221c] border border-[#36FF88]/40 hover:border-[#36FF88] text-[#36FF88] text-xs font-bold rounded-xl transition cursor-pointer shadow-[0_0_12px_rgba(54,255,136,0.15)]"
          >
            <Save className="w-3.5 h-3.5" />
            <span>{saveStatus === 'saving' ? 'SALVANDO...' : 'SALVAR'}</span>
          </button>

          <button
            onClick={handleDownload}
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-[#36FF88] hover:bg-[#00E86B] text-[#050706] text-xs font-black rounded-xl shadow-[0_0_15px_rgba(54,255,136,0.25)] transition cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">BAIXAR BIOSITE</span>
          </button>
        </div>
      </header>

      {/* Main Workspace */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* IFRAME PREVIEW (CENTER / MAIN CANVAS) */}
        <div className="flex-1 bg-[#030504] overflow-auto flex items-center justify-center p-3 sm:p-6 relative">
          <div
            className={`w-full ${
              deviceView === 'mobile' ? 'max-w-[420px]' : 'max-w-[880px]'
            } h-[85vh] bg-[#070b09] rounded-2xl border-4 border-[#18221c] overflow-hidden shadow-2xl relative transition-all duration-200`}
          >
            <iframe
              ref={iframeRef}
              title="Bio Fácil Live Editor"
              srcDoc={initialIframeHtml}
              sandbox="allow-scripts allow-same-origin"
              className="w-full h-full border-0 bg-transparent"
            />
          </div>
        </div>

        {/* CONTEXTUAL SIDEBAR / DRAWER */}
        {/* Case 1: Colors & Palettes Panel */}
        {activeTab === 'colors' && (
          <div className="w-full sm:w-[380px] bg-[#0B0F0D] border-l border-[#18221c] flex flex-col shrink-0 shadow-2xl z-20 overflow-hidden">
            <div className="p-4 border-b border-[#18221c] flex items-center justify-between bg-[#070b09]">
              <div className="flex items-center gap-2">
                <Palette className="w-4 h-4 text-[#36FF88]" />
                <h3 className="font-extrabold text-xs uppercase tracking-wider text-[#F5FFF8]">
                  Cores do Site
                </h3>
              </div>
              <button
                onClick={handleRestoreOriginalColors}
                className="text-[11px] text-[#87938B] hover:text-[#36FF88] flex items-center gap-1 font-semibold cursor-pointer"
                title="Restaurar paleta original"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Restaurar Original</span>
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-6">
              {/* Circles Color Picker Section */}
              <div>
                <h4 className="text-xs font-bold text-[#87938B] uppercase tracking-wider mb-3">
                  Bolinhas de Cores Reais
                </h4>
                <div className="grid grid-cols-2 gap-3">
                  {detectedThemeColors.map((colorItem) => (
                    <div
                      key={colorItem.varName}
                      className="bg-[#111713] border border-[#1e2a22] hover:border-[#36FF88]/40 rounded-xl p-3 flex items-center gap-3 transition"
                    >
                      <div className="relative">
                        <input
                          type="color"
                          value={colorItem.value.startsWith('#') ? colorItem.value : '#36FF88'}
                          onChange={(e) => handleColorChange(colorItem.varName, e.target.value)}
                          className="w-10 h-10 rounded-full border-2 border-white/20 cursor-pointer shadow-md p-0 overflow-hidden bg-transparent"
                        />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="text-xs font-bold text-[#F5FFF8] truncate">
                          {colorItem.label}
                        </div>
                        <div className="text-[10px] font-mono text-[#87938B] truncate">
                          {colorItem.value}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Preset Palettes Section */}
              <div className="pt-4 border-t border-[#18221c]">
                <h4 className="text-xs font-bold text-[#87938B] uppercase tracking-wider mb-3">
                  Paletas Prontas (1-Clique)
                </h4>
                <div className="space-y-2.5">
                  {PRESET_PALETTES.map((pal) => (
                    <button
                      key={pal.id}
                      onClick={() => handleApplyPalette(pal)}
                      className="w-full bg-[#111713] hover:bg-[#18221c] border border-[#1e2a22] hover:border-[#36FF88]/50 rounded-xl p-3 flex items-center justify-between transition cursor-pointer text-left group"
                    >
                      <div>
                        <div className="text-xs font-bold text-[#F5FFF8] group-hover:text-[#36FF88] transition">
                          {pal.name}
                        </div>
                        <div className="text-[10px] text-[#87938B]">
                          Harmonia balanceada
                        </div>
                      </div>

                      {/* Grouped Bubbles */}
                      <div className="flex items-center -space-x-1.5">
                        <span
                          className="w-5 h-5 rounded-full border border-black shadow"
                          style={{ backgroundColor: pal.colors.primary }}
                        />
                        <span
                          className="w-5 h-5 rounded-full border border-black shadow"
                          style={{ backgroundColor: pal.colors.secondary }}
                        />
                        <span
                          className="w-5 h-5 rounded-full border border-black shadow"
                          style={{ backgroundColor: pal.colors.surface }}
                        />
                        <span
                          className="w-5 h-5 rounded-full border border-black shadow"
                          style={{ backgroundColor: pal.colors.text }}
                        />
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Case 2: Direct-Clicked Element Contextual Editor */}
        {activeTab === 'preview' && selectedFieldData && (
          <div className="absolute sm:relative bottom-0 sm:bottom-auto right-0 w-full sm:w-[380px] bg-[#0B0F0D] border-t sm:border-t-0 sm:border-l border-[#18221c] flex flex-col shrink-0 shadow-2xl z-30 max-h-[75vh] sm:max-h-none overflow-hidden">
            {/* Header */}
            <div className="p-4 border-b border-[#18221c] flex items-center justify-between bg-[#070b09]">
              <div>
                <span className="text-[10px] uppercase font-mono text-[#36FF88] font-bold">
                  {selectedFieldData.type}
                </span>
                <h3 className="font-extrabold text-sm text-[#F5FFF8] truncate max-w-[240px]">
                  {selectedFieldData.label}
                </h3>
              </div>

              <button
                onClick={() => setSelectedFieldData(null)}
                className="p-1.5 rounded-lg bg-[#111713] text-[#87938B] hover:text-[#F5FFF8] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Contextual Form Body */}
            <div className="p-4 sm:p-5 overflow-y-auto space-y-4 flex-1">
              {/* LOGO & IMAGES */}
              {(selectedFieldData.type === 'logo' || selectedFieldData.type === 'image') && (
                <div className="space-y-4">
                  {selectedFieldData.currentValue && (
                    <div className="w-28 h-28 mx-auto rounded-2xl bg-[#070b09] border border-[#1e2a22] p-2 flex items-center justify-center overflow-hidden shadow-inner">
                      <img
                        src={selectedFieldData.currentValue}
                        alt="Preview"
                        className="w-full h-full object-contain"
                      />
                    </div>
                  )}

                  <div className="space-y-2">
                    <label className="text-[11px] font-bold text-[#87938B] uppercase">
                      URL da Imagem
                    </label>
                    <input
                      type="text"
                      value={selectedFieldData.currentValue || ''}
                      onChange={(e) => handleFieldValueChange(selectedFieldData.key, e.target.value)}
                      placeholder="https://exemplo.com/imagem.png"
                      className="w-full bg-[#111713] border border-[#1e2a22] focus:border-[#36FF88] rounded-xl px-3 py-2.5 text-xs text-[#F5FFF8] outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="flex items-center justify-center gap-1.5 py-2.5 px-3 bg-[#111713] hover:bg-[#18221c] border border-[#1e2a22] text-[#36FF88] text-xs font-bold rounded-xl transition cursor-pointer"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      <span>Upload Foto</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        const orig = selectedFieldData.defaultValue || '';
                        handleFieldValueChange(selectedFieldData.key, orig);
                      }}
                      className="flex items-center justify-center gap-1.5 py-2.5 px-3 bg-[#111713] hover:bg-[#18221c] border border-[#1e2a22] text-[#87938B] hover:text-[#F5FFF8] text-xs font-semibold rounded-xl transition cursor-pointer"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Restaurar</span>
                    </button>

                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleImageUpload(selectedFieldData.key, file);
                      }}
                    />
                  </div>
                </div>
              )}

              {/* WHATSAPP */}
              {selectedFieldData.type === 'whatsapp' && (
                <div className="space-y-4">
                  <div>
                    <label className="text-[11px] font-bold text-[#87938B] uppercase block mb-1.5">
                      Número do WhatsApp com DDD
                    </label>
                    <div className="relative">
                      <MessageCircle className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#36FF88]" />
                      <input
                        type="text"
                        value={selectedFieldData.currentValue || ''}
                        onChange={(e) => handleFieldValueChange(selectedFieldData.key, e.target.value)}
                        placeholder="Ex: 5511999999999"
                        className="w-full bg-[#111713] border border-[#1e2a22] focus:border-[#36FF88] rounded-xl pl-9 pr-3 py-2.5 text-xs text-[#F5FFF8] font-mono outline-none"
                      />
                    </div>
                    <p className="text-[10px] text-[#87938B] mt-1.5">
                      Todos os botões de agendamento e pedido do site vinculados atualizam juntos!
                    </p>
                  </div>

                  {selectedFieldData.currentValue && (
                    <a
                      href={
                        selectedFieldData.currentValue.startsWith('http')
                          ? selectedFieldData.currentValue
                          : `https://wa.me/${String(selectedFieldData.currentValue).replace(/\D/g, '')}`
                      }
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-1.5 py-2 px-3 bg-[#111713] hover:bg-[#18221c] border border-[#1e2a22] text-[#36FF88] text-xs font-semibold rounded-xl transition"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>Testar Link do WhatsApp</span>
                    </a>
                  )}
                </div>
              )}

              {/* INSTAGRAM */}
              {selectedFieldData.type === 'instagram' && (
                <div className="space-y-3">
                  <label className="text-[11px] font-bold text-[#87938B] uppercase block">
                    Usuário ou Link do Instagram
                  </label>
                  <div className="relative">
                    <Instagram className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-pink-400" />
                    <input
                      type="text"
                      value={selectedFieldData.currentValue || ''}
                      onChange={(e) => handleFieldValueChange(selectedFieldData.key, e.target.value)}
                      placeholder="@seu.perfil ou link completo"
                      className="w-full bg-[#111713] border border-[#1e2a22] focus:border-[#36FF88] rounded-xl pl-9 pr-3 py-2.5 text-xs text-[#F5FFF8] font-mono outline-none"
                    />
                  </div>
                </div>
              )}

              {/* TEXTOS / HEADLINES / BIO */}
              {(selectedFieldData.type === 'text' || selectedFieldData.type === 'textarea') && (
                <div className="space-y-3">
                  <label className="text-[11px] font-bold text-[#87938B] uppercase block">
                    Texto do Elemento
                  </label>
                  {selectedFieldData.type === 'textarea' ? (
                    <textarea
                      rows={5}
                      value={selectedFieldData.currentValue || ''}
                      onChange={(e) => handleFieldValueChange(selectedFieldData.key, e.target.value)}
                      className="w-full bg-[#111713] border border-[#1e2a22] focus:border-[#36FF88] rounded-xl p-3 text-xs text-[#F5FFF8] outline-none leading-relaxed"
                    />
                  ) : (
                    <input
                      type="text"
                      value={selectedFieldData.currentValue || ''}
                      onChange={(e) => handleFieldValueChange(selectedFieldData.key, e.target.value)}
                      className="w-full bg-[#111713] border border-[#1e2a22] focus:border-[#36FF88] rounded-xl px-3 py-2.5 text-xs text-[#F5FFF8] outline-none"
                    />
                  )}

                  <button
                    type="button"
                    onClick={() => {
                      const orig = selectedFieldData.defaultValue || '';
                      handleFieldValueChange(selectedFieldData.key, orig);
                    }}
                    className="text-[11px] text-[#87938B] hover:text-[#36FF88] flex items-center gap-1 font-semibold cursor-pointer"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>Restaurar texto original</span>
                  </button>
                </div>
              )}

              {/* MAPS / LOCATION */}
              {selectedFieldData.type === 'maps' && (
                <div className="space-y-3">
                  <label className="text-[11px] font-bold text-[#87938B] uppercase block">
                    Link do Google Maps
                  </label>
                  <div className="relative">
                    <MapPin className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-red-400" />
                    <input
                      type="text"
                      value={selectedFieldData.currentValue || ''}
                      onChange={(e) => handleFieldValueChange(selectedFieldData.key, e.target.value)}
                      placeholder="https://maps.google.com/?q=..."
                      className="w-full bg-[#111713] border border-[#1e2a22] focus:border-[#36FF88] rounded-xl pl-9 pr-3 py-2.5 text-xs text-[#F5FFF8] outline-none font-mono"
                    />
                  </div>
                </div>
              )}

              {/* GENERAL LINKS / BUTTONS */}
              {selectedFieldData.type === 'link' && (
                <div className="space-y-3">
                  <label className="text-[11px] font-bold text-[#87938B] uppercase block">
                    Link de Destino
                  </label>
                  <div className="relative">
                    <Link className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#36FF88]" />
                    <input
                      type="text"
                      value={selectedFieldData.currentValue || ''}
                      onChange={(e) => handleFieldValueChange(selectedFieldData.key, e.target.value)}
                      placeholder="https://..."
                      className="w-full bg-[#111713] border border-[#1e2a22] focus:border-[#36FF88] rounded-xl pl-9 pr-3 py-2.5 text-xs text-[#F5FFF8] outline-none font-mono"
                    />
                  </div>
                </div>
              )}

              {/* Button Pronto / Done */}
              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedFieldData(null)}
                  className="w-full py-2.5 bg-[#36FF88] hover:bg-[#00E86B] text-[#050706] font-bold text-xs rounded-xl shadow-[0_0_15px_rgba(54,255,136,0.25)] transition cursor-pointer"
                >
                  CONCLUÍDO
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Case 3: All Fields List View */}
        {activeTab === 'allFields' && (
          <div className="w-full sm:w-[380px] bg-[#0B0F0D] border-l border-[#18221c] flex flex-col shrink-0 shadow-2xl z-20 overflow-hidden">
            <div className="p-4 border-b border-[#18221c] flex items-center justify-between bg-[#070b09]">
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-[#36FF88]" />
                <h3 className="font-extrabold text-xs uppercase tracking-wider text-[#F5FFF8]">
                  Índice de Elementos
                </h3>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-2">
              {template.editorSchema?.fields?.map((field) => (
                <div
                  key={field.key}
                  onClick={() => {
                    setSelectedFieldKey(field.key);
                    setSelectedFieldData({
                      key: field.key,
                      label: field.label,
                      type: field.type,
                      currentValue: fieldValues[field.key] ?? field.defaultValue ?? '',
                      defaultValue: field.defaultValue,
                    });
                    setActiveTab('preview');
                    highlightElementInIframe(field.key);
                  }}
                  className="p-3 rounded-xl bg-[#111713] hover:bg-[#18221c] border border-[#1e2a22] hover:border-[#36FF88]/40 flex items-center justify-between transition cursor-pointer"
                >
                  <div className="min-w-0 pr-2">
                    <div className="text-xs font-bold text-[#F5FFF8] truncate">
                      {field.label}
                    </div>
                    <div className="text-[10px] font-mono text-[#87938B] truncate">
                      {String(fieldValues[field.key] ?? field.defaultValue ?? '—')}
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-[#87938B] shrink-0" />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* DOWNLOAD SUCCESS MODAL */}
      {showDownloadModal && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/85 backdrop-blur-sm p-4">
          <div className="max-w-md w-full bg-[#0B0F0D] border border-[#36FF88]/40 rounded-2xl p-6 sm:p-8 text-center shadow-2xl">
            <div className="w-16 h-16 mx-auto rounded-full bg-[#36FF88]/10 border border-[#36FF88]/30 flex items-center justify-center text-[#36FF88] mb-5 shadow-[0_0_25px_rgba(54,255,136,0.3)]">
              <Check className="w-8 h-8" />
            </div>

            <h3 className="text-xl font-bold text-white mb-2">SEU BIOSITE ESTÁ PRONTO ✓</h3>

            <p className="text-xs text-[#87938B] leading-relaxed mb-6">
              O arquivo HTML do biosite <strong className="text-white">"{projectName}"</strong> foi gerado e baixado.
              Ele é 100% estático e independente, com todos os seus textos, links, imagens e cores salvas.
            </p>

            <button
              onClick={() => setShowDownloadModal(false)}
              className="w-full py-3 bg-[#36FF88] hover:bg-[#00E86B] text-[#050706] font-extrabold text-xs rounded-xl transition cursor-pointer"
            >
              FECHAR E CONTINUAR
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
