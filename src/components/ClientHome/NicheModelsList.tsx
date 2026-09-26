import React, { useState, useEffect, useRef } from 'react';
import { NicheInfo, BioTemplate } from '../../types';
import { NicheIcon } from '../NicheIcon';
import { preparePreviewHtml } from '../../lib/bioPreview';
import { ArrowLeft, Eye, Edit3, Sparkles } from 'lucide-react';

interface NicheModelsListProps {
  niche: NicheInfo;
  templates: BioTemplate[];
  onBack: () => void;
  onPreview: (template: BioTemplate) => void;
  onCustomize: (template: BioTemplate) => void;
}

export const NicheModelsList: React.FC<NicheModelsListProps> = ({
  niche,
  templates,
  onBack,
  onPreview,
  onCustomize,
}) => {
  const publishedTemplates = templates.filter(
    (t) => t.nicheId === niche.id && t.status === 'published'
  );

  // Pagination state: load initial 8-12 models, then "CARREGAR MAIS"
  const [visibleLimit, setVisibleLimit] = useState(8);

  const displayedTemplates = publishedTemplates.slice(0, visibleLimit);
  const hasMore = publishedTemplates.length > visibleLimit;

  return (
    <div className="py-6 sm:py-10 max-w-6xl mx-auto px-4 space-y-8">
      {/* Niche Navigation Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#18221c]">
        <div className="flex items-center gap-4">
          <button
            onClick={onBack}
            className="p-2.5 rounded-xl bg-[#0B0F0D] hover:bg-[#111713] border border-[#18221c] text-[#87938B] hover:text-[#F5FFF8] transition cursor-pointer"
            title="Voltar aos Nichos"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-[#0B0F0D] border border-[#1e2a22] flex items-center justify-center p-2">
              <NicheIcon name={niche.iconName} size={36} />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-[#F5FFF8] tracking-tight">
                {niche.name}
              </h2>
              <p className="text-xs text-[#87938B]">{niche.description}</p>
            </div>
          </div>
        </div>

        <div className="text-xs font-mono text-[#36FF88] bg-[#111713] px-3 py-1.5 rounded-xl border border-[#1e2a22] self-start sm:self-auto">
          {publishedTemplates.length} {publishedTemplates.length === 1 ? 'modelo disponível' : 'modelos disponíveis'}
        </div>
      </div>

      {/* Models Grid */}
      {publishedTemplates.length === 0 ? (
        <div className="bg-[#0B0F0D] border border-[#18221c] rounded-2xl p-12 text-center text-[#87938B]">
          <p className="text-base text-[#F5FFF8] font-bold mb-1">
            Nenhum modelo publicado neste nicho no momento.
          </p>
          <p className="text-xs">
            Novos biosites são adicionados constantemente pelos administradores.
          </p>
          <button
            onClick={onBack}
            className="mt-6 px-4 py-2 bg-[#111713] hover:bg-[#18221c] border border-[#1e2a22] text-[#36FF88] text-xs font-bold rounded-xl transition cursor-pointer"
          >
            Explorar outros nichos
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {displayedTemplates.map((template, index) => (
            <LazyModelCard
              key={template.templateId}
              template={template}
              modelIndex={index + 1}
              onPreview={() => onPreview(template)}
              onCustomize={() => onCustomize(template)}
            />
          ))}
        </div>
      )}

      {/* Pagination "CARREGAR MAIS" */}
      {hasMore && (
        <div className="text-center pt-4">
          <button
            onClick={() => setVisibleLimit((prev) => prev + 6)}
            className="px-6 py-3 rounded-xl bg-[#111713] hover:bg-[#18221c] border border-[#1e2a22] hover:border-[#36FF88]/40 text-[#F5FFF8] text-xs font-bold transition cursor-pointer"
          >
            CARREGAR MAIS MODELOS
          </button>
        </div>
      )}
    </div>
  );
};

interface LazyModelCardProps {
  template: BioTemplate;
  modelIndex: number;
  onPreview: () => void;
  onCustomize: () => void;
}

/**
 * High-performance virtual preview card with IntersectionObserver:
 * Mounts the iframe preview only when near the viewport and safely unmounts when out of view,
 * keeping system memory light (approximately 4 to 6 active previews maximum).
 */
const LazyModelCard: React.FC<LazyModelCardProps> = ({
  template,
  modelIndex,
  onPreview,
  onCustomize,
}) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const el = cardRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          setIsVisible(entry.isIntersecting);
        });
      },
      {
        rootMargin: '200px 0px 200px 0px', // Pre-loads shortly before scrolling into view
        threshold: 0.05,
      }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={cardRef}
      className="bg-[#0B0F0D] border border-[#18221c] hover:border-[#36FF88]/50 rounded-2xl overflow-hidden flex flex-col transition-all duration-200 shadow-xl group hover:shadow-[0_10px_30px_rgba(0,0,0,0.8),0_0_25px_rgba(54,255,136,0.15)]"
    >
      {/* Real Preview Container (NO COVER URL - Real HTML Preview) */}
      <div className="relative h-72 bg-[#050706] border-b border-[#18221c] overflow-hidden flex items-center justify-center p-2">
        {isVisible ? (
          <div className="w-[200px] h-[360px] transform scale-[0.72] origin-top rounded-2xl overflow-hidden border border-[#1e2a22] shadow-2xl pointer-events-none transition-opacity duration-300">
            <iframe
              title={template.name}
              srcDoc={preparePreviewHtml(template.sourceHtml, false)}
              sandbox="allow-scripts"
              className="w-full h-full border-0 bg-transparent"
              loading="lazy"
            />
          </div>
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center text-[#505f56] gap-2">
            <div className="w-6 h-6 border-2 border-[#1e2a22] border-t-[#36FF88] rounded-full animate-spin"></div>
            <span className="text-[10px] font-mono">Renderizando preview real...</span>
          </div>
        )}

        {/* Model index badge */}
        <div className="absolute top-3 left-3">
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-[#070b09]/90 text-[#36FF88] border border-[#36FF88]/40 backdrop-blur-md">
            MODELO {String(modelIndex).padStart(2, '0')}
          </span>
        </div>
      </div>

      {/* Info & Actions */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          <h3 className="font-bold text-sm text-[#F5FFF8] line-clamp-1 group-hover:text-[#36FF88] transition">
            {template.name}
          </h3>
          <p className="text-[11px] text-[#87938B] mt-1 line-clamp-2">
            Design responsivo, botões para WhatsApp, links sociais e paleta customizável.
          </p>
        </div>

        {/* Action Buttons: VISUALIZAR & PERSONALIZAR */}
        <div className="pt-4 mt-3 border-t border-[#18221c] grid grid-cols-2 gap-2">
          <button
            onClick={onPreview}
            className="flex items-center justify-center gap-1.5 py-2.5 px-3 bg-[#111713] hover:bg-[#18221c] border border-[#1e2a22] text-[#87938B] hover:text-[#F5FFF8] text-xs font-semibold rounded-xl transition cursor-pointer"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>VISUALIZAR</span>
          </button>

          <button
            onClick={onCustomize}
            className="flex items-center justify-center gap-1.5 py-2.5 px-3 bg-[#36FF88] hover:bg-[#00E86B] text-[#050706] text-xs font-black rounded-xl shadow-[0_0_15px_rgba(54,255,136,0.25)] transition cursor-pointer"
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>PERSONALIZAR</span>
          </button>
        </div>
      </div>
    </div>
  );
};
