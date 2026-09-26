import React, { useState, useMemo } from 'react';
import { OFFICIAL_NICHES } from '../../constants/niches';
import { parseBioSiteHtml } from '../../lib/htmlParser';
import { preparePreviewHtml } from '../../lib/bioPreview';
import { BioTemplate, EditorField, FieldType } from '../../types';
import { Sparkles, CheckCircle2, Eye, Sliders, Save, UploadCloud, AlertCircle, ArrowLeft, RefreshCw, Palette } from 'lucide-react';

interface AdminImportBioSiteProps {
  onSaveTemplate: (template: BioTemplate, publishDirectly: boolean) => Promise<void>;
  onCancel: () => void;
}

export const AdminImportBioSite: React.FC<AdminImportBioSiteProps> = ({
  onSaveTemplate,
  onCancel,
}) => {
  const [modelName, setModelName] = useState('');
  const [selectedNicheId, setSelectedNicheId] = useState(OFFICIAL_NICHES[0].id);
  const [htmlCode, setHtmlCode] = useState('');

  // Analysis result state
  const [analyzed, setAnalyzed] = useState(false);
  const [detectedFields, setDetectedFields] = useState<EditorField[]>([]);
  const [detectedColors, setDetectedColors] = useState<any[]>([]);
  const [cleanedSourceHtml, setCleanedSourceHtml] = useState('');
  const [extractedTheme, setExtractedTheme] = useState<any>(null);

  // Saving states
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const selectedNiche = OFFICIAL_NICHES.find((n) => n.id === selectedNicheId) || OFFICIAL_NICHES[0];

  const handleAnalyze = () => {
    setErrorMsg(null);
    setSaveSuccess(null);

    if (!modelName.trim()) {
      setErrorMsg('Informe o nome do modelo.');
      return;
    }
    if (!htmlCode.trim() || !htmlCode.includes('<')) {
      setErrorMsg('Cole um código HTML válido para o biosite.');
      return;
    }

    try {
      const result = parseBioSiteHtml(htmlCode);
      setDetectedFields(result.fields);
      setDetectedColors(result.colors);
      setCleanedSourceHtml(result.cleanedHtml);
      setExtractedTheme(result.theme);
      setAnalyzed(true);
    } catch (err: any) {
      setErrorMsg('Não foi possível analisar o código HTML: ' + (err?.message || 'Erro no documento'));
    }
  };

  const handleFieldToggle = (index: number) => {
    setDetectedFields((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], enabled: !copy[index].enabled };
      return copy;
    });
  };

  const handleFieldLabelChange = (index: number, newLabel: string) => {
    setDetectedFields((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], label: newLabel };
      return copy;
    });
  };

  const handleFieldTypeChange = (index: number, newType: FieldType) => {
    setDetectedFields((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], type: newType };
      return copy;
    });
  };

  const handleSave = async (publishDirectly: boolean) => {
    setSaving(true);
    setErrorMsg(null);
    setSaveSuccess(null);

    try {
      const uniqueSuffix = `${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
      const templateId = `tpl_${selectedNiche.id}_${uniqueSuffix}`;

      // Clean active fields to ensure no undefined properties for Firestore
      const activeFields = detectedFields
        .filter((f) => f.enabled !== false)
        .map((f) => ({
          key: f.key,
          label: f.label || f.key,
          type: f.type || 'text',
          defaultValue: f.defaultValue ?? '',
          currentValue: f.currentValue ?? '',
          selector: f.selector || '',
          attribute: f.attribute || '',
          cssVarName: f.cssVarName || '',
          enabled: true,
        }));

      const newTemplate: BioTemplate = {
        templateId,
        name: modelName.trim(),
        nicheId: selectedNiche.id,
        nicheName: selectedNiche.name,
        version: 1,
        status: publishDirectly ? 'published' : 'draft',
        sourceHtml: cleanedSourceHtml || htmlCode,
        editorSchema: {
          fields: activeFields,
          colors: detectedColors,
        },
        themeMetadata: extractedTheme || {},
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      // Await confirmation from Firestore before informing success!
      await onSaveTemplate(newTemplate, publishDirectly);

      setSaveSuccess(
        publishDirectly
          ? 'MODELO SALVO E PUBLICADO COM SUCESSO! O modelo já faz parte do catálogo global do Bio Fácil e está visível para todos os clientes.'
          : 'MODELO SALVO COMO RASCUNHO COM SUCESSO! Disponível na aba Modelos para revisão.'
      );
    } catch (err: any) {
      console.error('Erro ao salvar modelo:', err);
      setErrorMsg('Não foi possível salvar o modelo no Firestore: ' + (err?.message || 'Falha de gravação'));
    } finally {
      setSaving(false);
    }
  };

  // Preview HTML memo
  const previewHtml = useMemo(() => {
    if (!cleanedSourceHtml && !htmlCode) return '';
    return preparePreviewHtml(cleanedSourceHtml || htmlCode, false);
  }, [cleanedSourceHtml, htmlCode]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-[#F5FFF8]">Importar BioSite para o Catálogo Global</h2>
          <p className="text-xs text-[#87938B]">
            Cole o código HTML do biosite para análise semântica imediata e cadastro permanente no Firestore.
          </p>
        </div>

        {analyzed && !saveSuccess && (
          <button
            onClick={() => setAnalyzed(false)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#111713] hover:bg-[#18221c] border border-[#1e2a22] text-[#87938B] hover:text-[#F5FFF8] text-xs font-semibold rounded-xl transition cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Editar Código HTML</span>
          </button>
        )}
      </div>

      {errorMsg && (
        <div className="p-4 rounded-xl bg-red-950/40 border border-red-500/30 flex items-start gap-3 text-red-300 text-xs">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-400" />
          <span>{errorMsg}</span>
        </div>
      )}

      {saveSuccess && (
        <div className="bg-[#0B0F0D] border border-[#36FF88]/40 rounded-2xl p-6 sm:p-8 text-center space-y-4 shadow-2xl">
          <div className="w-16 h-16 mx-auto rounded-full bg-[#36FF88]/10 border border-[#36FF88]/30 flex items-center justify-center text-[#36FF88] shadow-[0_0_25px_rgba(54,255,136,0.3)]">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <h3 className="text-xl font-bold text-white tracking-tight">MODELO SALVO COM SUCESSO!</h3>
          <p className="text-xs text-[#87938B] max-w-lg mx-auto leading-relaxed">
            {saveSuccess}
          </p>
          <div className="pt-2 flex items-center justify-center gap-3">
            <button
              onClick={onCancel}
              className="px-5 py-2.5 bg-[#36FF88] hover:bg-[#00E86B] text-[#050706] font-extrabold text-xs rounded-xl shadow-[0_0_15px_rgba(54,255,136,0.3)] transition cursor-pointer"
            >
              VER MODELOS NO CATÁLOGO
            </button>
            <button
              onClick={() => {
                setModelName('');
                setHtmlCode('');
                setAnalyzed(false);
                setSaveSuccess(null);
              }}
              className="px-4 py-2.5 bg-[#111713] hover:bg-[#18221c] border border-[#1e2a22] text-[#87938B] hover:text-[#F5FFF8] text-xs font-semibold rounded-xl transition cursor-pointer"
            >
              Importar Outro Modelo
            </button>
          </div>
        </div>
      )}

      {!saveSuccess && !analyzed ? (
        /* STEP 1: FORM ONLY */
        <div className="bg-[#0B0F0D] border border-[#18221c] rounded-2xl p-6 sm:p-8 space-y-5 shadow-2xl">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#87938B] mb-2">
                Nome do Modelo
              </label>
              <input
                type="text"
                placeholder="Ex: Barber Club Gold 2026"
                value={modelName}
                onChange={(e) => setModelName(e.target.value)}
                className="w-full bg-[#111713] border border-[#1e2a22] focus:border-[#36FF88] rounded-xl px-4 py-3 text-sm text-[#F5FFF8] placeholder-[#505f56] outline-none transition"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#87938B] mb-2">
                Nicho Oficial
              </label>
              <select
                value={selectedNicheId}
                onChange={(e) => setSelectedNicheId(e.target.value)}
                className="w-full bg-[#111713] border border-[#1e2a22] focus:border-[#36FF88] rounded-xl px-4 py-3 text-sm text-[#F5FFF8] outline-none transition cursor-pointer"
              >
                {OFFICIAL_NICHES.map((niche) => (
                  <option key={niche.id} value={niche.id} className="bg-[#0B0F0D]">
                    {niche.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-[#87938B]">
                Colar Código HTML
              </label>
              <span className="text-[11px] text-[#505f56] font-mono">
                HTML + CSS Embutido
              </span>
            </div>
            <textarea
              rows={14}
              placeholder="Cole aqui o HTML completo do biosite (incluindo estilos <style> e tags semânticas)..."
              value={htmlCode}
              onChange={(e) => setHtmlCode(e.target.value)}
              className="w-full bg-[#050706] border border-[#1e2a22] focus:border-[#36FF88] rounded-xl p-4 font-mono text-xs text-[#a0b0a6] placeholder-[#38433d] outline-none transition resize-y leading-relaxed"
            />
          </div>

          <div className="pt-2 flex items-center justify-end gap-3">
            <button
              onClick={onCancel}
              className="px-5 py-3 rounded-xl bg-[#111713] hover:bg-[#18221c] text-[#87938B] hover:text-[#F5FFF8] text-xs font-semibold transition cursor-pointer"
            >
              Cancelar
            </button>

            <button
              onClick={handleAnalyze}
              className="flex items-center gap-2 px-6 py-3 bg-[#36FF88] hover:bg-[#00E86B] text-[#050706] font-extrabold text-sm rounded-xl shadow-[0_0_25px_rgba(54,255,136,0.3)] transition cursor-pointer"
            >
              <Sparkles className="w-4 h-4" />
              <span>ANALISAR BIOSITE</span>
            </button>
          </div>
        </div>
      ) : !saveSuccess && (
        /* STEP 2: SPLIT VIEW - PREVIEW REAL + CAMPOS DETECTADOS */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Detected Fields Config */}
          <div className="lg:col-span-7 space-y-4">
            <div className="bg-[#0B0F0D] border border-[#18221c] rounded-2xl p-5">
              <div className="flex items-center justify-between pb-3 border-b border-[#18221c]">
                <div>
                  <h3 className="font-bold text-sm text-[#F5FFF8] flex items-center gap-2">
                    <Sliders className="w-4 h-4 text-[#36FF88]" />
                    <span>Campos Detectados ({detectedFields.length})</span>
                  </h3>
                  <p className="text-[11px] text-[#87938B]">
                    Ative, renomeie ou ajuste os tipos de campos identificados no código.
                  </p>
                </div>

                {detectedColors.length > 0 && (
                  <div className="flex items-center gap-1.5 bg-[#111713] px-2.5 py-1 rounded-lg border border-[#1e2a22]">
                    <Palette className="w-3.5 h-3.5 text-[#36FF88]" />
                    <span className="text-[11px] font-mono text-[#87938B]">
                      {detectedColors.length} cores mapeadas
                    </span>
                  </div>
                )}
              </div>

              <div className="mt-4 max-h-[560px] overflow-y-auto space-y-3 pr-1">
                {detectedFields.map((field, idx) => (
                  <div
                    key={field.key}
                    className={`p-3.5 rounded-xl border transition ${
                      field.enabled !== false
                        ? 'bg-[#111713] border-[#1e2a22]'
                        : 'bg-[#080c0a] border-zinc-900 opacity-60'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-3 mb-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <input
                          type="checkbox"
                          checked={field.enabled !== false}
                          onChange={() => handleFieldToggle(idx)}
                          className="w-4 h-4 accent-[#36FF88] cursor-pointer"
                        />
                        <span className="font-mono text-xs font-bold text-[#36FF88] truncate">
                          {field.key}
                        </span>
                      </div>

                      <select
                        value={field.type}
                        onChange={(e) => handleFieldTypeChange(idx, e.target.value as FieldType)}
                        className="bg-[#070b09] border border-[#1e2a22] text-[#F5FFF8] text-xs rounded-lg px-2 py-1 outline-none cursor-pointer"
                      >
                        <option value="text">Texto Curto</option>
                        <option value="textarea">Texto Longo</option>
                        <option value="image">Imagem</option>
                        <option value="logo">Logotipo</option>
                        <option value="whatsapp">WhatsApp</option>
                        <option value="instagram">Instagram</option>
                        <option value="link">Link Genérico</option>
                        <option value="maps">Google Maps</option>
                        <option value="color">Cor</option>
                      </select>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
                      <div>
                        <span className="text-[10px] text-[#87938B] uppercase">Rótulo visível</span>
                        <input
                          type="text"
                          value={field.label}
                          onChange={(e) => handleFieldLabelChange(idx, e.target.value)}
                          className="w-full bg-[#070b09] border border-[#1e2a22] rounded-lg px-2.5 py-1 text-xs text-[#F5FFF8] outline-none"
                        />
                      </div>
                      <div>
                        <span className="text-[10px] text-[#87938B] uppercase">Valor identificado</span>
                        <div className="text-xs font-mono text-[#87938B] truncate bg-[#070b09] p-1 rounded border border-[#18221c]">
                          {String(field.defaultValue || '—')}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Action Buttons */}
              <div className="mt-5 pt-4 border-t border-[#18221c] flex flex-wrap items-center justify-end gap-3">
                <button
                  disabled={saving}
                  onClick={() => handleSave(false)}
                  className="flex items-center gap-1.5 px-4 py-2.5 bg-[#111713] hover:bg-[#18221c] border border-[#1e2a22] text-[#87938B] hover:text-[#F5FFF8] text-xs font-semibold rounded-xl transition cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  <span>Salvar como Rascunho</span>
                </button>

                <button
                  disabled={saving}
                  onClick={() => handleSave(true)}
                  className="flex items-center gap-1.5 px-5 py-2.5 bg-[#36FF88] hover:bg-[#00E86B] disabled:opacity-50 text-[#050706] font-bold text-xs rounded-xl shadow-[0_0_20px_rgba(54,255,136,0.3)] transition cursor-pointer"
                >
                  {saving ? (
                    <span className="flex items-center gap-1.5">
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>GRAVANDO NO FIREBASE...</span>
                    </span>
                  ) : (
                    <>
                      <UploadCloud className="w-4 h-4" />
                      <span>SALVAR & PUBLICAR NO CATÁLOGO</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Right Column: Real Preview */}
          <div className="lg:col-span-5 space-y-3">
            <div className="bg-[#0B0F0D] border border-[#18221c] rounded-2xl p-4 flex flex-col items-center">
              <div className="w-full flex items-center justify-between pb-3 mb-3 border-b border-[#18221c]">
                <div className="flex items-center gap-2">
                  <Eye className="w-4 h-4 text-[#36FF88]" />
                  <span className="font-bold text-xs text-[#F5FFF8]">Preview Real em Sandbox</span>
                </div>
                <span className="text-[10px] font-mono text-[#87938B]">Mobile 375px</span>
              </div>

              {/* Mobile Device Mockup Frame */}
              <div className="w-[340px] h-[580px] bg-[#050706] rounded-[36px] border-4 border-[#1e2a22] overflow-hidden shadow-2xl relative flex flex-col">
                <div className="w-28 h-4 bg-[#111713] mx-auto rounded-b-xl shrink-0 z-20"></div>

                <iframe
                  title="BioSite Real Preview"
                  srcDoc={previewHtml}
                  sandbox="allow-scripts"
                  className="w-full h-full border-0 bg-transparent flex-1"
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
