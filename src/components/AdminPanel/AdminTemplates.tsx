import React, { useState } from 'react';
import { BioTemplate } from '../../types';
import { OFFICIAL_NICHES, matchTemplateNiche, getNormalizedNicheName } from '../../constants/niches';
import { Search, Eye, CheckCircle2, FileEdit, Trash2, PlusCircle, Globe2, Archive } from 'lucide-react';
import { preparePreviewHtml } from '../../lib/bioPreview';

interface AdminTemplatesProps {
  templates: BioTemplate[];
  onToggleStatus: (templateId: string, currentStatus: string) => Promise<void>;
  onDeleteTemplate: (templateId: string) => Promise<void>;
  onNavigateImport: () => void;
  onPreviewTemplate: (template: BioTemplate) => void;
}

export const AdminTemplates: React.FC<AdminTemplatesProps> = ({
  templates,
  onToggleStatus,
  onDeleteTemplate,
  onNavigateImport,
  onPreviewTemplate,
}) => {
  const [selectedNiche, setSelectedNiche] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const filteredTemplates = templates.filter((tpl) => {
    if (selectedNiche !== 'all' && !matchTemplateNiche(tpl.nicheId, selectedNiche)) return false;
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      const matchName = tpl.name?.toLowerCase().includes(q);
      const matchNiche = tpl.nicheName?.toLowerCase().includes(q);
      return matchName || matchNiche;
    }
    return true;
  });

  const handleDelete = async (templateId: string) => {
    if (!window.confirm('Tem certeza que deseja remover este modelo do catálogo?')) return;
    setDeletingId(templateId);
    try {
      await onDeleteTemplate(templateId);
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top action bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-[#F5FFF8]">Catálogo de Modelos</h2>
          <p className="text-xs text-[#87938B]">
            Gerencie os biosites disponíveis para cada um dos 10 nichos oficiais.
          </p>
        </div>

        <button
          onClick={onNavigateImport}
          className="flex items-center gap-2 px-4 py-2.5 bg-[#36FF88] hover:bg-[#00E86B] text-[#050706] font-extrabold text-xs rounded-xl shadow-[0_0_20px_rgba(54,255,136,0.3)] transition cursor-pointer self-start sm:self-auto"
        >
          <PlusCircle className="w-4 h-4" />
          <span>IMPORTAR NOVO MODELO</span>
        </button>
      </div>

      {/* Filter and Search controls */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#87938B]" />
          <input
            type="text"
            placeholder="Buscar modelo por nome..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-[#0B0F0D] border border-[#18221c] focus:border-[#36FF88] rounded-xl pl-9 pr-3 py-2.5 text-xs text-[#F5FFF8] placeholder-[#505f56] outline-none transition"
          />
        </div>

        <select
          value={selectedNiche}
          onChange={(e) => setSelectedNiche(e.target.value)}
          className="bg-[#0B0F0D] border border-[#18221c] focus:border-[#36FF88] rounded-xl px-3 py-2.5 text-xs text-[#F5FFF8] outline-none transition cursor-pointer"
        >
          <option value="all">Todos os Nichos ({templates.length})</option>
          {OFFICIAL_NICHES.map((n) => {
            const count = templates.filter((t) => matchTemplateNiche(t.nicheId, n.id)).length;
            return (
              <option key={n.id} value={n.id}>
                {n.name} ({count})
              </option>
            );
          })}
        </select>
      </div>

      {/* Templates Grid */}
      {filteredTemplates.length === 0 ? (
        <div className="bg-[#0B0F0D] border border-[#18221c] rounded-2xl p-12 text-center text-[#87938B]">
          <p className="text-sm mb-4">Nenhum modelo encontrado nesta categoria.</p>
          <button
            onClick={onNavigateImport}
            className="inline-flex items-center gap-2 px-4 py-2 bg-[#111713] hover:bg-[#18221c] border border-[#1e2a22] text-[#36FF88] text-xs font-semibold rounded-xl transition cursor-pointer"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>Importar primeiro modelo</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredTemplates.map((template) => {
            const isPublished = template.status === 'published';
            return (
              <div
                key={template.templateId}
                className="bg-[#0B0F0D] border border-[#18221c] hover:border-[#36FF88]/40 rounded-2xl overflow-hidden flex flex-col shadow-xl transition duration-150"
              >
                {/* Real Preview in Card Header */}
                <div className="relative h-64 bg-[#050706] border-b border-[#18221c] overflow-hidden flex items-center justify-center p-2">
                  <div className="w-[200px] h-[360px] transform scale-[0.68] origin-top rounded-2xl overflow-hidden border border-[#1e2a22] shadow-2xl pointer-events-none">
                    <iframe
                      title={template.name}
                      srcDoc={preparePreviewHtml(template.sourceHtml, false)}
                      sandbox="allow-scripts"
                      className="w-full h-full border-0 bg-transparent"
                    />
                  </div>

                  {/* Badges on top */}
                  <div className="absolute top-3 left-3 flex items-center gap-1.5">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#070b09]/90 text-[#36FF88] border border-[#36FF88]/30 backdrop-blur-md">
                      {getNormalizedNicheName(template.nicheId, template.nicheName)}
                    </span>
                  </div>

                  <div className="absolute top-3 right-3">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase backdrop-blur-md border ${
                        isPublished
                          ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                          : 'bg-zinc-800/80 text-zinc-400 border-zinc-700'
                      }`}
                    >
                      {isPublished ? 'Publicado' : 'Rascunho'}
                    </span>
                  </div>
                </div>

                {/* Card Content */}
                <div className="p-4 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="font-bold text-sm text-[#F5FFF8] line-clamp-1">
                      {template.name}
                    </h3>
                    <p className="text-[11px] text-[#87938B] mt-1 font-mono">
                      {template.editorSchema?.fields?.length || 0} campos editáveis configurados
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="pt-4 mt-3 border-t border-[#18221c] flex items-center justify-between gap-2">
                    <button
                      onClick={() => onPreviewTemplate(template)}
                      className="flex items-center gap-1 px-3 py-1.5 bg-[#111713] hover:bg-[#18221c] border border-[#1e2a22] text-[#87938B] hover:text-[#F5FFF8] text-xs font-semibold rounded-lg transition cursor-pointer"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Visualizar</span>
                    </button>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => onToggleStatus(template.templateId, template.status)}
                        className={`flex items-center gap-1 px-2.5 py-1.5 text-xs font-bold rounded-lg border transition cursor-pointer ${
                          isPublished
                            ? 'bg-zinc-900 border-zinc-700 text-zinc-400 hover:text-white'
                            : 'bg-[#36FF88]/20 border-[#36FF88]/40 text-[#36FF88] hover:bg-[#36FF88]/30'
                        }`}
                        title={isPublished ? 'Despublicar modelo' : 'Publicar modelo'}
                      >
                        {isPublished ? <Archive className="w-3.5 h-3.5" /> : <Globe2 className="w-3.5 h-3.5" />}
                        <span>{isPublished ? 'Pausar' : 'Publicar'}</span>
                      </button>

                      <button
                        disabled={deletingId === template.templateId}
                        onClick={() => handleDelete(template.templateId)}
                        className="p-1.5 bg-[#111713] hover:bg-red-950/40 border border-[#1e2a22] hover:border-red-500/40 text-red-400 rounded-lg transition cursor-pointer"
                        title="Excluir modelo"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
