import React, { useState, useEffect, useRef, useMemo } from 'react';
import { BioTemplate, BioProject, EditorField } from '../../types';
import { preparePreviewHtml } from '../../lib/bioPreview';
import { exportBioSiteZip, triggerZipDownload, ZipExportProgress } from '../../lib/zipExporter';
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
  RefreshCw,
  FolderCheck,
  Bot,
  Plus,
  Trash2,
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
  const [projectId] = useState<string>(existingProject?.id || `proj_${Date.now()}`);
  const [projectName, setProjectName] = useState(
    existingProject?.name || `${template.name} - Meu BioSite`
  );
  const [isNameModalOpen, setIsNameModalOpen] = useState(false);
  const [tempProjectName, setTempProjectName] = useState(projectName);

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
  const isChatbotModel = useMemo(() => {
    return (
      template.nicheId === 'modelos-chatbot' ||
      template.nicheName?.toLowerCase().includes('chatbot') ||
      template.templateId?.toLowerCase().includes('chatbot')
    );
  }, [template]);

  const [activeTab, setActiveTab] = useState<'preview' | 'chatbot' | 'colors' | 'allFields'>('preview');
  const [previewInteractionMode, setPreviewInteractionMode] = useState<'edit' | 'test'>('edit');
  const [selectedFieldKey, setSelectedFieldKey] = useState<string | null>(null);
  const [selectedFieldData, setSelectedFieldData] = useState<{
    key: string;
    label: string;
    type: string;
    currentValue: any;
    defaultValue?: any;
  } | null>(null);

  const [deviceView, setDeviceView] = useState<'mobile' | 'desktop'>('mobile');

  // Preview interaction mode handler (Modo Editar vs Modo Testar)
  const handleSetPreviewInteractionMode = (mode: 'edit' | 'test') => {
    setPreviewInteractionMode(mode);
    if (iframeRef.current?.contentWindow) {
      iframeRef.current.contentWindow.postMessage(
        {
          type: 'BIO_SET_PREVIEW_MODE',
          mode,
        },
        '*'
      );
    }
  };

  // Add a new dynamic chatbot message bubble
  const handleAddChatbotMessage = () => {
    const nextMsgIndex = Object.keys(fieldValues).filter((k) => k.startsWith('bot_msg_')).length + 2;
    const newKey = `bot_msg_${nextMsgIndex}`;
    const defaultText = `Mensagem ${nextMsgIndex}: Como mais posso te ajudar?`;

    setFieldValues((prev) => ({ ...prev, [newKey]: defaultText }));
    setSaveStatus('unsaved');

    if (iframeRef.current?.contentWindow) {
      iframeRef.current.contentWindow.postMessage(
        {
          type: 'BIO_CHAT_ADD_MESSAGE',
          key: newKey,
          text: defaultText,
        },
        '*'
      );
    }
  };

  // Remove dynamic chatbot message bubble
  const handleRemoveChatbotMessage = (key: string) => {
    setFieldValues((prev) => {
      const copy = { ...prev };
      delete copy[key];
      return copy;
    });
    setSaveStatus('unsaved');

    if (iframeRef.current?.contentWindow) {
      iframeRef.current.contentWindow.postMessage(
        {
          type: 'BIO_CHAT_REMOVE_ELEMENT',
          key,
        },
        '*'
      );
    }
  };

  // Add a new dynamic chatbot action button / option
  const handleAddChatbotOption = () => {
    const nextOptIndex = Object.keys(fieldValues).filter((k) => k.startsWith('bot_opt_') && k.endsWith('_label')).length + 4;
    const labelKey = `bot_opt_${nextOptIndex}_label`;
    const urlKey = `bot_opt_${nextOptIndex}_url`;
    const defaultLabel = `💬 ${nextOptIndex}. Nova Opção de Atendimento`;
    const defaultUrl = fieldValues['whatsapp'] || 'https://wa.me/';

    setFieldValues((prev) => ({
      ...prev,
      [labelKey]: defaultLabel,
      [urlKey]: defaultUrl,
    }));
    setSaveStatus('unsaved');

    if (iframeRef.current?.contentWindow) {
      iframeRef.current.contentWindow.postMessage(
        {
          type: 'BIO_CHAT_ADD_OPTION',
          labelKey,
          linkKey: urlKey,
          label: defaultLabel,
          url: defaultUrl,
        },
        '*'
      );
    }
  };

  // Remove dynamic chatbot action button / option
  const handleRemoveChatbotOption = (labelKey: string, urlKey?: string) => {
    setFieldValues((prev) => {
      const copy = { ...prev };
      delete copy[labelKey];
      if (urlKey) delete copy[urlKey];
      return copy;
    });
    setSaveStatus('unsaved');

    if (iframeRef.current?.contentWindow) {
      iframeRef.current.contentWindow.postMessage(
        {
          type: 'BIO_CHAT_REMOVE_ELEMENT',
          key: labelKey,
        },
        '*'
      );
    }
  };

  // Save states: 'idle' | 'unsaved' | 'saving' | 'saved' | 'error'
  const [saveStatus, setSaveStatus] = useState<'idle' | 'unsaved' | 'saving' | 'saved' | 'error'>(
    existingProject ? 'saved' : 'idle'
  );
  const [savedProject, setSavedProject] = useState<BioProject | null>(existingProject || null);
  const [saveErrorMessage, setSaveErrorMessage] = useState<string | null>(null);

  // ZIP download states
  const [isDownloadingZip, setIsDownloadingZip] = useState(false);
  const [zipProgress, setZipProgress] = useState<ZipExportProgress | null>(null);
  const [zipSuccessModal, setZipSuccessModal] = useState(false);
  const [zipErrorMessage, setZipErrorMessage] = useState<string | null>(null);

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

        const effectiveValue =
          fieldValues[key] !== undefined
            ? fieldValues[key]
            : currentValue || existingField?.defaultValue || '';

        setSelectedFieldKey(key);
        setSelectedFieldData({
          key,
          label: finalLabel,
          type: existingField?.type || fieldType || 'text',
          currentValue: effectiveValue,
          defaultValue: existingField?.defaultValue || currentValue,
        });

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

    Object.keys(newTheme).forEach((vName) => {
      const lower = vName.toLowerCase();
      if (lower.includes('primary')) newTheme[vName] = palette.colors.primary;
      else if (lower.includes('secondary')) newTheme[vName] = palette.colors.secondary;
      else if (lower.includes('background') || lower === '--bg' || lower.includes('bg-'))
        newTheme[vName] = palette.colors.background;
      else if (lower.includes('surface') || lower.includes('card'))
        newTheme[vName] = palette.colors.surface;
      else if (lower.includes('text') || lower.includes('foreground'))
        newTheme[vName] = palette.colors.text;
      else if (lower.includes('muted')) newTheme[vName] = palette.colors.muted;
    });

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

  // SAVE PROJECT HANDLER (Always saves the exact current state in Firestore)
  const executeSaveProject = async (targetName?: string): Promise<BioProject> => {
    setSaveStatus('saving');
    setSaveErrorMessage(null);

    const finalName = (targetName || projectName).trim() || 'Meu BioSite';

    try {
      // Extract links & assets from fieldValues for full Firestore document fidelity
      const linksMap: Record<string, string> = {};
      const assetsMap: Record<string, string> = {};

      Object.entries(fieldValues).forEach(([k, v]) => {
        if (typeof v === 'string') {
          if (v.startsWith('data:image/') || v.startsWith('http://') || v.startsWith('https://')) {
            if (
              k.includes('logo') ||
              k.includes('image') ||
              k.includes('banner') ||
              k.includes('photo') ||
              k.includes('avatar')
            ) {
              assetsMap[k] = v;
            }
          }
          if (
            k.includes('whatsapp') ||
            k.includes('instagram') ||
            k.includes('maps') ||
            k.includes('link') ||
            k.includes('url')
          ) {
            linksMap[k] = v;
          }
        }
      });

      const projectPayload: Partial<BioProject> = {
        id: savedProject?.id || projectId,
        projectId: savedProject?.id || projectId,
        name: finalName,
        projectName: finalName,
        templateId: template.templateId,
        templateVersion: template.version,
        templateName: template.name,
        nicheId: template.nicheId,
        values: fieldValues,
        theme: themeValues,
        assets: assetsMap,
        links: linksMap,
        updatedAt: new Date().toISOString(),
      };

      const result = await onSaveProject(projectPayload);
      setSavedProject(result);
      setProjectName(finalName);
      setSaveStatus('saved');
      return result;
    } catch (err: any) {
      console.error('Erro ao salvar projeto:', err);
      setSaveStatus('error');
      setSaveErrorMessage(err?.message || 'Falha ao persistir projeto no Firestore');
      throw err;
    }
  };

  const handleSaveButtonClick = () => {
    // If project is brand new and has default placeholder name, offer name dialog
    if (!savedProject && projectName.includes('Meu BioSite')) {
      setTempProjectName(projectName);
      setIsNameModalOpen(true);
      return;
    }
    executeSaveProject();
  };

  const handleConfirmNameAndSave = async () => {
    setIsNameModalOpen(false);
    await executeSaveProject(tempProjectName);
  };

  // BAIXAR ZIP (Vercel Ready)
  const handleDownloadZipClick = async () => {
    setIsDownloadingZip(true);
    setZipErrorMessage(null);

    try {
      // If there are unsaved changes or project has not been saved yet, save automatically first!
      if (saveStatus !== 'saved') {
        await executeSaveProject();
      }

      const blob = await exportBioSiteZip(
        template.sourceHtml,
        fieldValues,
        themeValues,
        projectName,
        (progress) => setZipProgress(progress)
      );

      triggerZipDownload(blob, projectName);
      setZipSuccessModal(true);
    } catch (err: any) {
      console.error('Erro ao gerar ZIP:', err);
      setZipErrorMessage('NÃO FOI POSSÍVEL GERAR O ZIP. TENTE NOVAMENTE.');
    } finally {
      setIsDownloadingZip(false);
      setZipProgress(null);
    }
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
      <header className="h-14 border-b border-[#18221c] bg-[#070b09] px-3 sm:px-4 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-[#111713] hover:bg-[#18221c] text-[#87938B] hover:text-[#F5FFF8] transition cursor-pointer"
            title="Voltar aos modelos"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>

          <div>
            <div className="flex items-center gap-1.5">
              <input
                type="text"
                value={projectName}
                onChange={(e) => {
                  setProjectName(e.target.value);
                  setSaveStatus('unsaved');
                }}
                className="bg-transparent font-bold text-xs sm:text-sm text-[#F5FFF8] border-b border-transparent hover:border-[#18221c] focus:border-[#36FF88] outline-none px-1 py-0.5 max-w-[150px] sm:max-w-[240px]"
              />
            </div>
            <div className="text-[10px] text-[#87938B] font-mono px-1 flex items-center gap-1.5">
              <span>Modelo: <span className="text-[#36FF88]">{template.name}</span></span>
              {isChatbotModel && (
                <span className="px-1.5 py-0.5 rounded-md bg-[#36FF88]/10 text-[#36FF88] font-bold text-[9px] border border-[#36FF88]/30">
                  💬 Chatbot
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Center Mode Tabs */}
        <div className="flex items-center gap-1 bg-[#111713] p-1 rounded-xl border border-[#1e2a22]">
          <button
            onClick={() => setActiveTab('preview')}
            className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
              activeTab === 'preview'
                ? 'bg-[#36FF88] text-[#050706] shadow-[0_0_15px_rgba(54,255,136,0.3)]'
                : 'text-[#87938B] hover:text-[#F5FFF8]'
            }`}
          >
            <MousePointerClick className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Editar pelo Preview</span>
            <span className="sm:hidden">Preview</span>
          </button>

          {isChatbotModel && (
            <button
              onClick={() => setActiveTab('chatbot')}
              className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                activeTab === 'chatbot'
                  ? 'bg-[#36FF88] text-[#050706] shadow-[0_0_15px_rgba(54,255,136,0.3)]'
                  : 'text-[#87938B] hover:text-[#F5FFF8]'
              }`}
            >
              <MessageCircle className="w-3.5 h-3.5" />
              <span>Conversa</span>
            </button>
          )}

          <button
            onClick={() => setActiveTab('colors')}
            className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
              activeTab === 'colors'
                ? 'bg-[#36FF88] text-[#050706] shadow-[0_0_15px_rgba(54,255,136,0.3)]'
                : 'text-[#87938B] hover:text-[#F5FFF8]'
            }`}
          >
            <Palette className="w-3.5 h-3.5" />
            <span>Cores</span>
          </button>

          <button
            onClick={() => setActiveTab('allFields')}
            className={`hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
              activeTab === 'allFields'
                ? 'bg-[#36FF88] text-[#050706]'
                : 'text-[#87938B] hover:text-[#F5FFF8]'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Campos</span>
          </button>
        </div>

        {/* Chatbot Mode Switcher: Editar vs Testar */}
        {isChatbotModel && (
          <div className="flex items-center gap-1 bg-[#111713] p-1 rounded-xl border border-[#1e2a22]">
            <button
              onClick={() => handleSetPreviewInteractionMode('edit')}
              className={`flex items-center gap-1.5 px-2.5 py-1 text-xs font-bold rounded-lg transition cursor-pointer ${
                previewInteractionMode === 'edit'
                  ? 'bg-[#1e2a22] text-[#36FF88] border border-[#36FF88]/30 shadow-sm'
                  : 'text-[#87938B] hover:text-[#F5FFF8]'
              }`}
              title="Clique nos balões ou botões para editar"
            >
              <MousePointerClick className="w-3 h-3" />
              <span className="hidden md:inline">Editar</span>
            </button>
            <button
              onClick={() => handleSetPreviewInteractionMode('test')}
              className={`flex items-center gap-1.5 px-2.5 py-1 text-xs font-bold rounded-lg transition cursor-pointer ${
                previewInteractionMode === 'test'
                  ? 'bg-[#36FF88] text-[#050706] shadow-[0_0_12px_rgba(54,255,136,0.35)]'
                  : 'text-[#87938B] hover:text-[#F5FFF8]'
              }`}
              title="Interaja e teste a navegação do chatbot"
            >
              <Sparkles className="w-3 h-3" />
              <span>Testar</span>
            </button>
          </div>
        )}

        {/* Device Switcher (Desktop Preview Frame) */}
        <div className="hidden lg:flex items-center gap-1 bg-[#111713] p-1 rounded-xl border border-[#1e2a22]">
          <button
            onClick={() => setDeviceView('mobile')}
            className={`p-1.5 rounded-lg transition cursor-pointer ${
              deviceView === 'mobile'
                ? 'bg-[#1e2a22] text-[#36FF88]'
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
                ? 'bg-[#1e2a22] text-[#36FF88]'
                : 'text-[#87938B] hover:text-[#F5FFF8]'
            }`}
            title="Visualização Desktop"
          >
            <Monitor className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Desktop Save & Download Actions in Top Bar */}
        <div className="hidden sm:flex items-center gap-2.5">
          {saveStatus === 'unsaved' && (
            <span className="hidden xl:inline-flex items-center gap-1.5 text-[11px] font-mono text-amber-400 font-bold">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping"></span>
              <span>● ALTERAÇÕES NÃO SALVAS</span>
            </span>
          )}

          {saveStatus === 'saved' && (
            <span className="hidden xl:inline-flex items-center gap-1 text-[11px] font-mono text-[#36FF88] font-bold">
              <Check className="w-3.5 h-3.5" />
              <span>✓ SALVO</span>
            </span>
          )}

          {saveStatus === 'error' && (
            <span className="hidden xl:inline-flex items-center gap-1 text-[11px] font-mono text-red-400">
              <AlertCircle className="w-3.5 h-3.5" />
              <span>Erro ao salvar</span>
            </span>
          )}

          {/* Primary Action Button */}
          {saveStatus === 'saved' ? (
            <button
              onClick={handleSaveButtonClick}
              className="flex items-center gap-1.5 px-3.5 py-1.5 bg-[#111713] hover:bg-[#18221c] border border-[#36FF88]/40 hover:border-[#36FF88] text-[#36FF88] text-xs font-bold rounded-xl transition cursor-pointer"
            >
              <Check className="w-3.5 h-3.5" />
              <span>✓ SALVO</span>
            </button>
          ) : (
            <button
              onClick={handleSaveButtonClick}
              disabled={saveStatus === 'saving'}
              className="flex items-center gap-1.5 px-4 py-1.5 bg-[#36FF88] hover:bg-[#00E86B] disabled:opacity-50 text-[#050706] text-xs font-black rounded-xl shadow-[0_0_15px_rgba(54,255,136,0.25)] transition cursor-pointer"
            >
              {saveStatus === 'saving' ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>SALVANDO...</span>
                </>
              ) : (
                <>
                  <Save className="w-3.5 h-3.5" />
                  <span>SALVAR PROJETO</span>
                </>
              )}
            </button>
          )}

          {/* Highlighted BAIXAR ZIP Button */}
          <button
            onClick={handleDownloadZipClick}
            disabled={isDownloadingZip}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-black rounded-xl transition cursor-pointer ${
              saveStatus === 'saved'
                ? 'bg-[#36FF88] hover:bg-[#00E86B] text-[#050706] shadow-[0_0_15px_rgba(54,255,136,0.3)]'
                : 'bg-[#111713] hover:bg-[#18221c] border border-[#1e2a22] text-[#87938B] hover:text-[#F5FFF8]'
            }`}
            title={saveStatus === 'saved' ? 'Baixar ZIP pronto para Vercel' : 'Salva o projeto e baixa o ZIP'}
          >
            {isDownloadingZip ? (
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Download className="w-3.5 h-3.5" />
            )}
            <span>BAIXAR ZIP</span>
          </button>
        </div>
      </header>

      {/* Main Workspace */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* IFRAME PREVIEW (CENTER / MAIN CANVAS) */}
        {/* Added pb-24 on mobile to prevent the fixed bottom bar from covering content */}
        <div className="flex-1 bg-[#030504] overflow-auto flex items-center justify-center p-3 sm:p-6 pb-24 sm:pb-6 relative">
          <div
            className={`w-full ${
              deviceView === 'mobile' ? 'max-w-[420px]' : 'max-w-[880px]'
            } h-[82vh] bg-[#070b09] rounded-2xl border-4 border-[#18221c] overflow-hidden shadow-2xl relative transition-all duration-200`}
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
        {/* Chatbot Dedicated Flow Panel */}
        {activeTab === 'chatbot' && (
          <div className="w-full sm:w-[420px] bg-[#0B0F0D] border-l border-[#18221c] flex flex-col shrink-0 shadow-2xl z-20 overflow-hidden pb-20 sm:pb-0">
            <div className="p-4 border-b border-[#18221c] flex items-center justify-between bg-[#070b09]">
              <div className="flex items-center gap-2">
                <MessageCircle className="w-4 h-4 text-[#36FF88]" />
                <div>
                  <h3 className="font-extrabold text-xs uppercase tracking-wider text-[#F5FFF8]">
                    Fluxo do Chatbot
                  </h3>
                  <p className="text-[10px] text-[#87938B]">
                    Assistente, mensagens e botões interativos
                  </p>
                </div>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-6">
              {/* 1. Atendente & Perfil */}
              <div className="bg-[#111713] border border-[#1e2a22] rounded-xl p-4 space-y-3.5">
                <div className="flex items-center gap-2 border-b border-[#18221c] pb-2">
                  <Bot className="w-4 h-4 text-[#36FF88]" />
                  <span className="text-xs font-bold text-[#F5FFF8]">Atendente Virtual</span>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-14 h-14 rounded-xl bg-[#070b09] border border-[#1e2a22] overflow-hidden flex items-center justify-center shrink-0 shadow-inner">
                    <img
                      src={fieldValues['logo'] || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=200'}
                      alt="Avatar"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1 space-y-1">
                    <label className="text-[10px] font-bold text-[#87938B] uppercase block">
                      Avatar do Assistente
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedFieldKey('logo');
                        setSelectedFieldData({
                          key: 'logo',
                          label: 'Foto / Avatar do Assistente',
                          type: 'logo',
                          currentValue: fieldValues['logo'] || '',
                        });
                        fileInputRef.current?.click();
                      }}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-[#18221c] hover:bg-[#233328] border border-[#1e2a22] text-[#36FF88] text-xs font-semibold rounded-lg transition cursor-pointer"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      <span>Trocar Foto</span>
                    </button>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-[#87938B] uppercase block">
                    Nome do Assistente / Canal
                  </label>
                  <input
                    type="text"
                    value={fieldValues['title_main'] ?? ''}
                    onChange={(e) => handleFieldValueChange('title_main', e.target.value)}
                    placeholder="Ex: Atendimento Express 24h"
                    className="w-full bg-[#0B0F0D] border border-[#1e2a22] focus:border-[#36FF88] rounded-lg px-3 py-2 text-xs text-[#F5FFF8] outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-[#87938B] uppercase block">
                    Status em Tempo Real
                  </label>
                  <input
                    type="text"
                    value={fieldValues['bot_status'] ?? 'Online agora para te ajudar'}
                    onChange={(e) => handleFieldValueChange('bot_status', e.target.value)}
                    placeholder="Ex: Online agora para te ajudar"
                    className="w-full bg-[#0B0F0D] border border-[#1e2a22] focus:border-[#36FF88] rounded-lg px-3 py-2 text-xs text-[#F5FFF8] outline-none"
                  />
                </div>
              </div>

              {/* 2. Mensagens do Chat */}
              <div className="bg-[#111713] border border-[#1e2a22] rounded-xl p-4 space-y-3.5">
                <div className="flex items-center justify-between border-b border-[#18221c] pb-2">
                  <div className="flex items-center gap-2">
                    <MessageCircle className="w-4 h-4 text-[#36FF88]" />
                    <span className="text-xs font-bold text-[#F5FFF8]">Mensagens do Assistente</span>
                  </div>
                  <button
                    type="button"
                    onClick={handleAddChatbotMessage}
                    className="flex items-center gap-1 text-[11px] font-bold text-[#36FF88] hover:text-[#00E86B] cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Adicionar Mensagem</span>
                  </button>
                </div>

                {/* Opening message */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-[#87938B] uppercase block">
                    Mensagem de Abertura (Boas-vindas)
                  </label>
                  <textarea
                    rows={3}
                    value={fieldValues['subtitle'] ?? ''}
                    onChange={(e) => handleFieldValueChange('subtitle', e.target.value)}
                    placeholder="Olá! Como posso te ajudar hoje?..."
                    className="w-full bg-[#0B0F0D] border border-[#1e2a22] focus:border-[#36FF88] rounded-lg p-2.5 text-xs text-[#F5FFF8] outline-none leading-relaxed"
                  />
                </div>

                {/* Additional messages */}
                {Object.keys(fieldValues)
                  .filter((k) => k.startsWith('bot_msg_'))
                  .sort()
                  .map((msgKey, idx) => (
                    <div key={msgKey} className="space-y-1 pt-2 border-t border-[#18221c]">
                      <div className="flex items-center justify-between">
                        <label className="text-[10px] font-bold text-[#87938B] uppercase">
                          Mensagem {idx + 2}
                        </label>
                        <button
                          type="button"
                          onClick={() => handleRemoveChatbotMessage(msgKey)}
                          className="text-[10px] text-red-400 hover:text-red-300 flex items-center gap-1 cursor-pointer"
                        >
                          <Trash2 className="w-3 h-3" />
                          <span>Remover</span>
                        </button>
                      </div>
                      <textarea
                        rows={2}
                        value={fieldValues[msgKey] ?? ''}
                        onChange={(e) => handleFieldValueChange(msgKey, e.target.value)}
                        className="w-full bg-[#0B0F0D] border border-[#1e2a22] focus:border-[#36FF88] rounded-lg p-2.5 text-xs text-[#F5FFF8] outline-none"
                      />
                    </div>
                  ))}
              </div>

              {/* 3. Opções de Resposta & Funil */}
              <div className="bg-[#111713] border border-[#1e2a22] rounded-xl p-4 space-y-3.5">
                <div className="flex items-center justify-between border-b border-[#18221c] pb-2">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-[#36FF88]" />
                    <span className="text-xs font-bold text-[#F5FFF8]">Botões de Ação do Funil</span>
                  </div>
                  <button
                    type="button"
                    onClick={handleAddChatbotOption}
                    className="flex items-center gap-1 text-[11px] font-bold text-[#36FF88] hover:text-[#00E86B] cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Adicionar Opção</span>
                  </button>
                </div>

                {/* Option 1 */}
                <div className="space-y-2 bg-[#0B0F0D] p-3 rounded-lg border border-[#1e2a22]">
                  <label className="text-[10px] font-bold text-[#36FF88] uppercase block">
                    Opção 1 (WhatsApp / Principal)
                  </label>
                  <input
                    type="text"
                    value={fieldValues['opt_1_label'] ?? '💰 1. Quero saber valores e planos'}
                    onChange={(e) => handleFieldValueChange('opt_1_label', e.target.value)}
                    placeholder="Texto do Botão 1"
                    className="w-full bg-[#111713] border border-[#1e2a22] focus:border-[#36FF88] rounded-lg px-2.5 py-1.5 text-xs text-[#F5FFF8] outline-none"
                  />
                  <div className="space-y-1">
                    <span className="text-[9px] font-mono text-[#87938B]">Link ou WhatsApp:</span>
                    <input
                      type="text"
                      value={fieldValues['whatsapp'] ?? ''}
                      onChange={(e) => handleFieldValueChange('whatsapp', e.target.value)}
                      placeholder="https://wa.me/55..."
                      className="w-full bg-[#111713] border border-[#1e2a22] focus:border-[#36FF88] rounded-lg px-2.5 py-1.5 text-xs text-[#F5FFF8] font-mono outline-none"
                    />
                  </div>
                </div>

                {/* Option 2 */}
                <div className="space-y-2 bg-[#0B0F0D] p-3 rounded-lg border border-[#1e2a22]">
                  <label className="text-[10px] font-bold text-[#36FF88] uppercase block">
                    Opção 2 (Atendente Humano / Canal)
                  </label>
                  <input
                    type="text"
                    value={fieldValues['opt_2_label'] ?? '👨‍💻 2. Falar com atendente humano'}
                    onChange={(e) => handleFieldValueChange('opt_2_label', e.target.value)}
                    placeholder="Texto do Botão 2"
                    className="w-full bg-[#111713] border border-[#1e2a22] focus:border-[#36FF88] rounded-lg px-2.5 py-1.5 text-xs text-[#F5FFF8] outline-none"
                  />
                  <div className="space-y-1">
                    <span className="text-[9px] font-mono text-[#87938B]">Link de Destino:</span>
                    <input
                      type="text"
                      value={fieldValues['instagram'] ?? ''}
                      onChange={(e) => handleFieldValueChange('instagram', e.target.value)}
                      placeholder="https://wa.me/... ou Instagram"
                      className="w-full bg-[#111713] border border-[#1e2a22] focus:border-[#36FF88] rounded-lg px-2.5 py-1.5 text-xs text-[#F5FFF8] font-mono outline-none"
                    />
                  </div>
                </div>

                {/* Option 3 */}
                <div className="space-y-2 bg-[#0B0F0D] p-3 rounded-lg border border-[#1e2a22]">
                  <label className="text-[10px] font-bold text-[#36FF88] uppercase block">
                    Opção 3 (Endereço / Localização / Link)
                  </label>
                  <input
                    type="text"
                    value={fieldValues['opt_3_label'] ?? '📍 3. Endereço e rotas de acesso'}
                    onChange={(e) => handleFieldValueChange('opt_3_label', e.target.value)}
                    placeholder="Texto do Botão 3"
                    className="w-full bg-[#111713] border border-[#1e2a22] focus:border-[#36FF88] rounded-lg px-2.5 py-1.5 text-xs text-[#F5FFF8] outline-none"
                  />
                  <div className="space-y-1">
                    <span className="text-[9px] font-mono text-[#87938B]">Link do Maps ou Site:</span>
                    <input
                      type="text"
                      value={fieldValues['maps_link'] ?? ''}
                      onChange={(e) => handleFieldValueChange('maps_link', e.target.value)}
                      placeholder="https://maps.google.com"
                      className="w-full bg-[#111713] border border-[#1e2a22] focus:border-[#36FF88] rounded-lg px-2.5 py-1.5 text-xs text-[#F5FFF8] font-mono outline-none"
                    />
                  </div>
                </div>

                {/* Additional dynamic options */}
                {Object.keys(fieldValues)
                  .filter((k) => k.startsWith('bot_opt_') && k.endsWith('_label'))
                  .sort()
                  .map((labelKey) => {
                    const optIndex = labelKey.replace('bot_opt_', '').replace('_label', '');
                    const urlKey = `bot_opt_${optIndex}_url`;
                    return (
                      <div key={labelKey} className="space-y-2 bg-[#0B0F0D] p-3 rounded-lg border border-[#1e2a22]">
                        <div className="flex items-center justify-between">
                          <label className="text-[10px] font-bold text-[#36FF88] uppercase">
                            Opção Adicional ({optIndex})
                          </label>
                          <button
                            type="button"
                            onClick={() => handleRemoveChatbotOption(labelKey, urlKey)}
                            className="text-[10px] text-red-400 hover:text-red-300 flex items-center gap-1 cursor-pointer"
                          >
                            <Trash2 className="w-3 h-3" />
                            <span>Remover</span>
                          </button>
                        </div>
                        <input
                          type="text"
                          value={fieldValues[labelKey] ?? ''}
                          onChange={(e) => handleFieldValueChange(labelKey, e.target.value)}
                          placeholder="Texto da Opção"
                          className="w-full bg-[#111713] border border-[#1e2a22] focus:border-[#36FF88] rounded-lg px-2.5 py-1.5 text-xs text-[#F5FFF8] outline-none"
                        />
                        <div className="space-y-1">
                          <span className="text-[9px] font-mono text-[#87938B]">Link de Destino:</span>
                          <input
                            type="text"
                            value={fieldValues[urlKey] ?? ''}
                            onChange={(e) => handleFieldValueChange(urlKey, e.target.value)}
                            placeholder="https://..."
                            className="w-full bg-[#111713] border border-[#1e2a22] focus:border-[#36FF88] rounded-lg px-2.5 py-1.5 text-xs text-[#F5FFF8] font-mono outline-none"
                          />
                        </div>
                      </div>
                    );
                  })}
              </div>

              {/* 4. Rodapé Informativo */}
              <div className="bg-[#111713] border border-[#1e2a22] rounded-xl p-4 space-y-2">
                <label className="text-[10px] font-bold text-[#87938B] uppercase block">
                  Rodapé do Chatbot
                </label>
                <input
                  type="text"
                  value={fieldValues['address_text'] ?? 'Atendimento automatizado com resposta em menos de 1 minuto'}
                  onChange={(e) => handleFieldValueChange('address_text', e.target.value)}
                  placeholder="Ex: Atendimento automatizado com resposta em menos de 1 minuto"
                  className="w-full bg-[#0B0F0D] border border-[#1e2a22] focus:border-[#36FF88] rounded-lg px-3 py-2 text-xs text-[#F5FFF8] outline-none"
                />
              </div>
            </div>
          </div>
        )}

        {/* Colors & Palettes Panel */}
        {activeTab === 'colors' && (
          <div className="w-full sm:w-[380px] bg-[#0B0F0D] border-l border-[#18221c] flex flex-col shrink-0 shadow-2xl z-20 overflow-hidden pb-20 sm:pb-0">
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
                        <div className="text-[10px] text-[#87938B]">Harmonia balanceada</div>
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

        {/* Direct-Clicked Element Contextual Editor */}
        {activeTab === 'preview' && selectedFieldData && (
          <div className="absolute sm:relative bottom-16 sm:bottom-auto right-0 w-full sm:w-[380px] bg-[#0B0F0D] border-t sm:border-t-0 sm:border-l border-[#18221c] flex flex-col shrink-0 shadow-2xl z-30 max-h-[70vh] sm:max-h-none overflow-hidden pb-16 sm:pb-0">
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
                  PRONTO
                </button>
              </div>
            </div>
          </div>
        )}

        {/* All Fields List View */}
        {activeTab === 'allFields' && (
          <div className="w-full sm:w-[380px] bg-[#0B0F0D] border-l border-[#18221c] flex flex-col shrink-0 shadow-2xl z-20 overflow-hidden pb-20 sm:pb-0">
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
                    <div className="text-xs font-bold text-[#F5FFF8] truncate">{field.label}</div>
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

      {/* MOBILE ELEGANT FIXED BOTTOM ACTION BAR */}
      <div className="sm:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#070b09]/95 backdrop-blur-md border-t border-[#18221c] px-4 py-2.5 flex items-center justify-between gap-2 shadow-[0_-10px_25px_rgba(0,0,0,0.8)]">
        {saveStatus === 'saved' ? (
          <>
            <button
              onClick={handleSaveButtonClick}
              className="flex-1 flex items-center justify-center gap-1.5 py-2.5 px-3 bg-[#111713] border border-[#36FF88]/40 text-[#36FF88] font-bold text-xs rounded-xl transition cursor-pointer"
            >
              <Check className="w-4 h-4 text-[#36FF88]" />
              <span>✓ SALVO</span>
            </button>

            <button
              onClick={handleDownloadZipClick}
              disabled={isDownloadingZip}
              className="flex-1 flex items-center justify-center gap-1.5 py-2.5 px-3 bg-[#36FF88] hover:bg-[#00E86B] text-[#050706] font-black text-xs rounded-xl shadow-[0_0_15px_rgba(54,255,136,0.3)] transition cursor-pointer"
            >
              {isDownloadingZip ? (
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Download className="w-3.5 h-3.5" />
              )}
              <span>BAIXAR ZIP</span>
            </button>
          </>
        ) : (
          <>
            <div className="flex items-center gap-1.5 text-[11px] font-mono text-amber-400 font-bold shrink-0">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping"></span>
              <span>● ALTERAÇÕES NÃO SALVAS</span>
            </div>

            <button
              onClick={handleSaveButtonClick}
              disabled={saveStatus === 'saving'}
              className="flex-1 max-w-[180px] flex items-center justify-center gap-1.5 py-2.5 px-3 bg-[#36FF88] hover:bg-[#00E86B] text-[#050706] font-black text-xs rounded-xl shadow-[0_0_15px_rgba(54,255,136,0.3)] transition cursor-pointer"
            >
              {saveStatus === 'saving' ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>SALVANDO...</span>
                </>
              ) : (
                <>
                  <Save className="w-3.5 h-3.5" />
                  <span>SALVAR PROJETO</span>
                </>
              )}
            </button>
          </>
        )}
      </div>

      {/* MODAL 1: FIRST SAVE PROJECT NAME */}
      {isNameModalOpen && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="max-w-md w-full bg-[#0B0F0D] border border-[#18221c] rounded-2xl p-6 shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-[#F5FFF8]">Nome do Seu Projeto</h3>
            <p className="text-xs text-[#87938B]">
              Dê um nome para identificar este biosite na sua conta.
            </p>

            <input
              type="text"
              value={tempProjectName}
              onChange={(e) => setTempProjectName(e.target.value)}
              placeholder="Ex: Minha Barbearia VIP"
              className="w-full bg-[#111713] border border-[#1e2a22] focus:border-[#36FF88] rounded-xl px-4 py-3 text-sm text-[#F5FFF8] outline-none"
              autoFocus
            />

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsNameModalOpen(false)}
                className="px-4 py-2 text-xs font-semibold text-[#87938B] hover:text-[#F5FFF8]"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleConfirmNameAndSave}
                className="px-5 py-2.5 bg-[#36FF88] hover:bg-[#00E86B] text-[#050706] font-bold text-xs rounded-xl shadow-[0_0_15px_rgba(54,255,136,0.25)] transition cursor-pointer"
              >
                SALVAR PROJETO
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: ZIP GENERATION PROGRESS */}
      {zipProgress && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="max-w-sm w-full bg-[#0B0F0D] border border-[#36FF88]/40 rounded-2xl p-6 text-center shadow-2xl space-y-4">
            <div className="w-12 h-12 mx-auto rounded-full bg-[#36FF88]/10 border border-[#36FF88]/30 flex items-center justify-center text-[#36FF88]">
              <RefreshCw className="w-6 h-6 animate-spin" />
            </div>
            <h4 className="text-sm font-bold text-white tracking-wider font-mono">
              {zipProgress.message}
            </h4>
            <p className="text-[11px] text-[#87938B]">
              Organizando index.html na raiz e empacotando para deploy imediato...
            </p>
          </div>
        </div>
      )}

      {/* MODAL 3: ZIP DOWNLOAD SUCCESS & VERCEL READY CELEBRATION */}
      {zipSuccessModal && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/85 backdrop-blur-sm p-4">
          <div className="max-w-md w-full bg-[#0B0F0D] border border-[#36FF88]/40 rounded-2xl p-6 sm:p-8 text-center shadow-2xl space-y-4">
            <div className="w-16 h-16 mx-auto rounded-full bg-[#36FF88]/10 border border-[#36FF88]/30 flex items-center justify-center text-[#36FF88] shadow-[0_0_25px_rgba(54,255,136,0.3)]">
              <Check className="w-8 h-8" />
            </div>

            <h3 className="text-xl font-bold text-white mb-1">ZIP PRONTO PARA PUBLICAR NA VERCEL!</h3>

            <p className="text-xs text-[#87938B] leading-relaxed">
              O arquivo <strong className="text-white">"{projectName}.zip"</strong> foi gerado e baixado com todas as suas personalizações.
            </p>

            <div className="bg-[#111713] border border-[#1e2a22] rounded-xl p-4 text-left space-y-2 text-xs">
              <div className="font-bold text-[#36FF88] flex items-center gap-1.5">
                <span>🚀 Estrutura de Hospedagem:</span>
              </div>
              <ul className="text-[11px] text-[#87938B] space-y-1 list-disc list-inside">
                <li><strong className="text-white">index.html</strong> está posicionado na raiz do arquivo ZIP.</li>
                <li>Imagens e estilos estão integrados e independentes.</li>
                <li>Basta arrastar para a <strong className="text-white">Vercel</strong> ou qualquer hospedagem estática!</li>
              </ul>
            </div>

            <button
              onClick={() => setZipSuccessModal(false)}
              className="w-full py-3 bg-[#36FF88] hover:bg-[#00E86B] text-[#050706] font-extrabold text-xs rounded-xl shadow-[0_0_15px_rgba(54,255,136,0.25)] transition cursor-pointer"
            >
              FECHAR E CONTINUAR
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
