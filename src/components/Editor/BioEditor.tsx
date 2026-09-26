import React, { useState, useEffect, useRef, useMemo } from 'react';
import { BioTemplate, BioProject, EditorField } from '../../types';
import { preparePreviewHtml, generateExportHtml } from '../../lib/bioPreview';
import {
  ArrowLeft,
  Save,
  Download,
  Smartphone,
  Tablet,
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
  HelpCircle,
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

  // Project state
  const [projectName, setProjectName] = useState(
    existingProject?.name || `${template.name} - Meu BioSite`
  );
  const [fieldValues, setFieldValues] = useState<Record<string, any>>(() => {
    const initial: Record<string, any> = {};
    // Extract default values from template schema
    template.editorSchema?.fields?.forEach((f) => {
      initial[f.key] = f.defaultValue || '';
    });
    // Merge existing project values if editing
    if (existingProject?.values) {
      Object.assign(initial, existingProject.values);
    }
    return initial;
  });

  const [themeValues, setThemeValues] = useState<Record<string, string>>(() => {
    const initialTheme: Record<string, string> = {
      ...(template.themeMetadata?.cssVariables || {}),
    };
    if (existingProject?.theme) {
      Object.assign(initialTheme, existingProject.theme);
    }
    return initialTheme;
  });

  // Editor mode & navigation
  const [activeTab, setActiveTab] = useState<'content' | 'social' | 'style'>('content');
  const [clickToEditEnabled, setClickToEditEnabled] = useState(true);
  const [selectedFieldKey, setSelectedFieldKey] = useState<string | null>(null);
  const [deviceView, setDeviceView] = useState<'mobile' | 'desktop'>('mobile');

  // Save states: 'idle' | 'unsaved' | 'saving' | 'saved' | 'error'
  const [saveStatus, setSaveStatus] = useState<'idle' | 'unsaved' | 'saving' | 'saved' | 'error'>('idle');
  const [savedProject, setSavedProject] = useState<BioProject | null>(existingProject || null);
  const [showDownloadModal, setShowDownloadModal] = useState(false);
  const [saveErrorMessage, setSaveErrorMessage] = useState<string | null>(null);

  // Build the initial HTML with bridge script once
  const initialIframeHtml = useMemo(() => {
    return preparePreviewHtml(
      template.sourceHtml,
      true, // isEditor = true
      fieldValues,
      themeValues
    );
  }, [template.sourceHtml]);

  // Listen for click events from inside the iframe for "✦ EDITAR PELO PREVIEW"
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (!event.data || typeof event.data !== 'object') return;

      if (event.data.type === 'BIO_FIELD_SELECTED') {
        const clickedKey = event.data.key;
        if (clickedKey) {
          setSelectedFieldKey(clickedKey);

          // Auto-switch to corresponding tab
          const field = template.editorSchema?.fields?.find((f) => f.key === clickedKey);
          if (field) {
            if (field.type === 'whatsapp' || field.type === 'instagram' || field.type === 'maps') {
              setActiveTab('social');
            } else if (field.type === 'color') {
              setActiveTab('style');
            } else {
              setActiveTab('content');
            }
          }
        }
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [template]);

  // Push DOM updates directly without reloading the iframe!
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

  const updateThemeInIframe = (cssVarName: string, value: string) => {
    if (iframeRef.current?.contentWindow) {
      iframeRef.current.contentWindow.postMessage(
        {
          type: 'BIO_UPDATE_THEME',
          cssVarName,
          value,
        },
        '*'
      );
    }
  };

  const highlightFieldInIframe = (key: string) => {
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

  const handleFieldValueChange = (key: string, value: any) => {
    setFieldValues((prev) => ({ ...prev, [key]: value }));
    setSaveStatus('unsaved');
    updateFieldInIframe(key, value);
  };

  const handleColorChange = (key: string, cssVarName: string, value: string) => {
    setFieldValues((prev) => ({ ...prev, [key]: value }));
    setThemeValues((prev) => ({ ...prev, [cssVarName]: value }));
    setSaveStatus('unsaved');
    updateThemeInIframe(cssVarName, value);
  };

  const handleRestoreOriginal = (field: EditorField) => {
    const orig = field.defaultValue || '';
    handleFieldValueChange(field.key, orig);
    if (field.cssVarName) {
      handleColorChange(field.key, field.cssVarName, orig);
    }
  };

  // Image / Logo file upload handler (converts to persistent Base64 Data URL)
  const handleImageFileUpload = (key: string, file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const base64Url = e.target?.result as string;
      if (base64Url) {
        handleFieldValueChange(key, base64Url);
      }
    };
    reader.readAsDataURL(file);
  };

  // Save handler
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
      setSaveErrorMessage(err?.message || 'Erro ao persistir no Firestore');
    }
  };

  // Standalone Download handler
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

  // Separate fields by category for intuitive navigation
  const fields = template.editorSchema?.fields || [];
  const contentFields = fields.filter(
    (f) =>
      f.type !== 'whatsapp' &&
      f.type !== 'instagram' &&
      f.type !== 'maps' &&
      f.type !== 'color'
  );
  const socialFields = fields.filter(
    (f) =>
      f.type === 'whatsapp' ||
      f.type === 'instagram' ||
      f.type === 'maps' ||
      f.type === 'link'
  );
  const styleFields = fields.filter((f) => f.type === 'color');

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-[#050706] text-[#F5FFF8] overflow-hidden select-none">
      {/* Top Navbar */}
      <header className="h-14 border-b border-[#18221c] bg-[#070b09] px-4 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-[#111713] hover:bg-[#18221c] text-[#87938B] hover:text-[#F5FFF8] transition cursor-pointer"
            title="Voltar"
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

        {/* Device Switcher (Desktop Preview view) */}
        <div className="hidden md:flex items-center gap-1 bg-[#111713] p-1 rounded-xl border border-[#1e2a22]">
          <button
            onClick={() => setDeviceView('mobile')}
            className={`p-1.5 rounded-lg transition cursor-pointer ${
              deviceView === 'mobile'
                ? 'bg-[#36FF88] text-[#050706]'
                : 'text-[#87938B] hover:text-[#F5FFF8]'
            }`}
            title="Visualização Celular"
          >
            <Smartphone className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setDeviceView('desktop')}
            className={`p-1.5 rounded-lg transition cursor-pointer ${
              deviceView === 'desktop'
                ? 'bg-[#36FF88] text-[#050706]'
                : 'text-[#87938B] hover:text-[#F5FFF8]'
            }`}
            title="Visualização Completa"
          >
            <Monitor className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Save & Download Actions */}
        <div className="flex items-center gap-2">
          {/* Status badge */}
          <div className="hidden sm:block text-xs font-mono">
            {saveStatus === 'unsaved' && (
              <span className="text-amber-400 flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping"></span>
                <span>Alterações não salvas</span>
              </span>
            )}
            {saveStatus === 'saved' && (
              <span className="text-[#36FF88] flex items-center gap-1 font-bold">
                <Check className="w-3.5 h-3.5" />
                <span>✓ Alterações salvas</span>
              </span>
            )}
            {saveStatus === 'saving' && (
              <span className="text-[#87938B] flex items-center gap-1">
                <span className="w-3 h-3 border-2 border-[#36FF88] border-t-transparent rounded-full animate-spin"></span>
                <span>Salvando...</span>
              </span>
            )}
            {saveStatus === 'error' && (
              <span className="text-red-400 flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" />
                <span>Erro ao salvar</span>
              </span>
            )}
          </div>

          <button
            onClick={handleSave}
            disabled={saveStatus === 'saving'}
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-[#111713] hover:bg-[#18221c] border border-[#36FF88]/40 hover:border-[#36FF88] text-[#36FF88] text-xs font-bold rounded-xl transition cursor-pointer shadow-[0_0_12px_rgba(54,255,136,0.15)]"
          >
            <Save className="w-3.5 h-3.5" />
            <span>SALVAR</span>
          </button>

          <button
            onClick={handleDownload}
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-[#36FF88] hover:bg-[#00E86B] text-[#050706] text-xs font-black rounded-xl shadow-[0_0_15px_rgba(54,255,136,0.25)] transition cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>BAIXAR BIOSITE</span>
          </button>
        </div>
      </header>

      {/* Main Workspace (Desktop: Left Editor / Right Preview) */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
        {/* LEFT PANEL: DYNAMIC CONTROLS */}
        <div className="w-full md:w-[420px] lg:w-[460px] border-r border-[#18221c] bg-[#0B0F0D] flex flex-col shrink-0 overflow-hidden">
          {/* Feature Badge: EDITAR PELO PREVIEW */}
          <div className="p-3 bg-[#070b09] border-b border-[#18221c] flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <MousePointerClick className="w-4 h-4 text-[#36FF88]" />
              <span className="text-xs font-bold text-[#F5FFF8]">✦ EDITAR PELO PREVIEW</span>
            </div>
            <span className="text-[10px] text-[#87938B] font-mono">
              Clique no elemento à direita
            </span>
          </div>

          {/* Section Navigation Tabs */}
          <div className="grid grid-cols-3 border-b border-[#18221c] bg-[#070b09]/50">
            <button
              onClick={() => setActiveTab('content')}
              className={`py-2.5 text-xs font-bold transition flex items-center justify-center gap-1.5 border-b-2 cursor-pointer ${
                activeTab === 'content'
                  ? 'border-[#36FF88] text-[#36FF88] bg-[#111713]'
                  : 'border-transparent text-[#87938B] hover:text-[#F5FFF8]'
              }`}
            >
              <Type className="w-3.5 h-3.5" />
              <span>Conteúdo</span>
            </button>

            <button
              onClick={() => setActiveTab('social')}
              className={`py-2.5 text-xs font-bold transition flex items-center justify-center gap-1.5 border-b-2 cursor-pointer ${
                activeTab === 'social'
                  ? 'border-[#36FF88] text-[#36FF88] bg-[#111713]'
                  : 'border-transparent text-[#87938B] hover:text-[#F5FFF8]'
              }`}
            >
              <MessageCircle className="w-3.5 h-3.5" />
              <span>Contatos</span>
            </button>

            <button
              onClick={() => setActiveTab('style')}
              className={`py-2.5 text-xs font-bold transition flex items-center justify-center gap-1.5 border-b-2 cursor-pointer ${
                activeTab === 'style'
                  ? 'border-[#36FF88] text-[#36FF88] bg-[#111713]'
                  : 'border-transparent text-[#87938B] hover:text-[#F5FFF8]'
              }`}
            >
              <Palette className="w-3.5 h-3.5" />
              <span>Cores</span>
            </button>
          </div>

          {/* Form Scroll Area */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
            {activeTab === 'content' && (
              <div className="space-y-4">
                {contentFields.map((field) => (
                  <FieldControlCard
                    key={field.key}
                    field={field}
                    value={fieldValues[field.key]}
                    isSelected={selectedFieldKey === field.key}
                    onChange={(val) => handleFieldValueChange(field.key, val)}
                    onFileUpload={(f) => handleImageFileUpload(field.key, f)}
                    onRestore={() => handleRestoreOriginal(field)}
                    onFocus={() => {
                      setSelectedFieldKey(field.key);
                      highlightFieldInIframe(field.key);
                    }}
                  />
                ))}
              </div>
            )}

            {activeTab === 'social' && (
              <div className="space-y-4">
                {socialFields.map((field) => (
                  <FieldControlCard
                    key={field.key}
                    field={field}
                    value={fieldValues[field.key]}
                    isSelected={selectedFieldKey === field.key}
                    onChange={(val) => handleFieldValueChange(field.key, val)}
                    onFileUpload={(f) => handleImageFileUpload(field.key, f)}
                    onRestore={() => handleRestoreOriginal(field)}
                    onFocus={() => {
                      setSelectedFieldKey(field.key);
                      highlightFieldInIframe(field.key);
                    }}
                  />
                ))}
              </div>
            )}

            {activeTab === 'style' && (
              <div className="space-y-4">
                <div className="p-3 bg-[#111713] rounded-xl border border-[#1e2a22] text-xs text-[#87938B] leading-relaxed">
                  🎨 As cores são sincronizadas diretamente com as variáveis CSS (<span className="font-mono text-[#36FF88]">--primary</span>, <span className="font-mono text-[#36FF88]">--secondary</span>, etc.) sem alterar o código estrutural.
                </div>

                {styleFields.map((field) => (
                  <div
                    key={field.key}
                    className="p-3.5 rounded-xl bg-[#111713] border border-[#1e2a22] space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-[#F5FFF8]">{field.label}</span>
                      <button
                        onClick={() => handleRestoreOriginal(field)}
                        className="text-[10px] text-[#87938B] hover:text-[#36FF88] flex items-center gap-1 cursor-pointer"
                        title="Restaurar cor original"
                      >
                        <RotateCcw className="w-3 h-3" />
                        <span>Restaurar</span>
                      </button>
                    </div>

                    <div className="flex items-center gap-3">
                      <input
                        type="color"
                        value={fieldValues[field.key] || field.defaultValue || '#36FF88'}
                        onChange={(e) =>
                          handleColorChange(field.key, field.cssVarName || '--primary', e.target.value)
                        }
                        className="w-10 h-10 rounded-lg border border-[#1e2a22] bg-transparent cursor-pointer p-0.5"
                      />
                      <input
                        type="text"
                        value={fieldValues[field.key] || field.defaultValue || ''}
                        onChange={(e) =>
                          handleColorChange(field.key, field.cssVarName || '--primary', e.target.value)
                        }
                        className="flex-1 bg-[#070b09] border border-[#1e2a22] rounded-lg px-3 py-2 text-xs font-mono text-[#F5FFF8] outline-none"
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* RIGHT PANEL: LIVE PREVIEW IN SANDBOX */}
        <div className="flex-1 bg-[#030504] overflow-auto flex items-center justify-center p-4 sm:p-6 relative">
          <div
            className={`w-full ${
              deviceView === 'mobile' ? 'max-w-[420px]' : 'max-w-[850px]'
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
              O arquivo HTML independente foi gerado e baixado. Ele não depende de nenhum servidor ou banco de dados externo para funcionar.
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

interface FieldControlCardProps {
  field: EditorField;
  value: any;
  isSelected?: boolean;
  onChange: (val: any) => void;
  onFileUpload: (file: File) => void;
  onRestore: () => void;
  onFocus: () => void;
}

const FieldControlCard: React.FC<FieldControlCardProps> = ({
  field,
  value,
  isSelected,
  onChange,
  onFileUpload,
  onRestore,
  onFocus,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  return (
    <div
      onFocus={onFocus}
      className={`p-3.5 rounded-xl border transition duration-150 ${
        isSelected
          ? 'bg-[#141b16] border-[#36FF88] shadow-[0_0_15px_rgba(54,255,136,0.2)]'
          : 'bg-[#111713] border-[#1e2a22] hover:border-[#36FF88]/30'
      }`}
    >
      <div className="flex items-center justify-between mb-2">
        <label className="text-xs font-bold text-[#F5FFF8] truncate max-w-[240px]">
          {field.label}
        </label>
        <button
          type="button"
          onClick={onRestore}
          className="text-[10px] text-[#87938B] hover:text-[#36FF88] flex items-center gap-1 cursor-pointer transition"
          title="Restaurar valor original"
        >
          <RotateCcw className="w-3 h-3" />
          <span>Original</span>
        </button>
      </div>

      {/* Field Input Variant */}
      {field.type === 'logo' || field.type === 'image' ? (
        <div className="space-y-2">
          {value && (
            <div className="w-16 h-16 rounded-xl bg-[#070b09] border border-[#1e2a22] overflow-hidden p-1 flex items-center justify-center">
              <img src={value} alt="Preview" className="w-full h-full object-contain" />
            </div>
          )}

          <div className="flex gap-2">
            <input
              type="text"
              value={value || ''}
              onChange={(e) => onChange(e.target.value)}
              placeholder="https://exemplo.com/imagem.png"
              className="flex-1 bg-[#070b09] border border-[#1e2a22] rounded-lg px-2.5 py-1.5 text-xs text-[#F5FFF8] outline-none"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="p-2 bg-[#070b09] hover:bg-[#18221c] border border-[#1e2a22] text-[#36FF88] rounded-lg cursor-pointer"
              title="Upload de foto"
            >
              <Upload className="w-3.5 h-3.5" />
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) onFileUpload(file);
              }}
            />
          </div>
        </div>
      ) : field.type === 'textarea' ? (
        <textarea
          rows={3}
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          className="w-full bg-[#070b09] border border-[#1e2a22] rounded-lg p-2.5 text-xs text-[#F5FFF8] outline-none resize-y leading-relaxed"
        />
      ) : field.type === 'whatsapp' ? (
        <div className="space-y-1.5">
          <div className="relative">
            <MessageCircle className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-[#36FF88]" />
            <input
              type="text"
              value={value || ''}
              onChange={(e) => onChange(e.target.value)}
              placeholder="Ex: 5511999999999 ou link completo"
              className="w-full bg-[#070b09] border border-[#1e2a22] rounded-lg pl-8 pr-2.5 py-1.5 text-xs text-[#F5FFF8] outline-none font-mono"
            />
          </div>
          <span className="text-[10px] text-[#87938B]">
            Formato: DDI + DDD + Número. Todos os botões WhatsApp atualizam juntos.
          </span>
        </div>
      ) : field.type === 'instagram' ? (
        <div className="relative">
          <Instagram className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-pink-400" />
          <input
            type="text"
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            placeholder="@usuario ou link do perfil"
            className="w-full bg-[#070b09] border border-[#1e2a22] rounded-lg pl-8 pr-2.5 py-1.5 text-xs text-[#F5FFF8] outline-none font-mono"
          />
        </div>
      ) : field.type === 'maps' ? (
        <div className="relative">
          <MapPin className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-red-400" />
          <input
            type="text"
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            placeholder="Link compartilhado do Google Maps"
            className="w-full bg-[#070b09] border border-[#1e2a22] rounded-lg pl-8 pr-2.5 py-1.5 text-xs text-[#F5FFF8] outline-none"
          />
        </div>
      ) : (
        <input
          type="text"
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          className="w-full bg-[#070b09] border border-[#1e2a22] rounded-lg px-2.5 py-1.5 text-xs text-[#F5FFF8] outline-none"
        />
      )}
    </div>
  );
};
