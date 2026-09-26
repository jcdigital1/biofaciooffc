import React, { useState, useMemo } from 'react';
import { OFFICIAL_NICHES } from '../../constants/niches';
import { parseBioSiteHtml } from '../../lib/htmlParser';
import { preparePreviewHtml } from '../../lib/bioPreview';
import { BioTemplate, EditorField, FieldType } from '../../types';
import { Sparkles, CheckCircle, Eye, Sliders, Save, UploadCloud, AlertCircle, ArrowLeft, RefreshCw } from 'lucide-react';

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
  const [cleanedSourceHtml, setCleanedSourceHtml] = useState('');
  const [extractedTheme, setExtractedTheme] = useState<any>(null);
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const selectedNiche = OFFICIAL_NICHES.find((n) => n.id === selectedNicheId) || OFFICIAL_NICHES[0];

  const handleAnalyze = () => {
    setErrorMsg(null);
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

    try {
      const templateId = `tpl-${selectedNicheId}-${Date.now()}`;
      const activeFields = detectedFields.filter((f) => f.enabled !== false);

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
        },
        themeMetadata: extractedTheme,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      await onSaveTemplate(newTemplate, publishDirectly);
    } catch (err: any) {
      setErrorMsg('Erro ao salvar modelo: ' + (err?.message || 'Falha no Firestore'));
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
          <h2 className="text-xl font-bold text-[#F5FFF8]">Importar BioSite</h2>
          <p className="text-xs text-[#87938B]">
            Cole o código HTML do biosite para análise semântica imediata e cadastro de campos dinâmicos.
          </p>
        </div>

        {analyzed && (
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

      {!analyzed ? (
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
      ) : (
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
                        <option value="color">Cor (CSS Var)</option>
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
                      <span>SALVANDO...</span>
                    </span>
                  ) : (
                    <>
                      <UploadCloud className="w-4 h-4" />
                      <span>SALVAR & PUBLICAR MODELO</span>
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
                {/* Notch */}
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
