import React from 'react';
import { OFFICIAL_NICHES, matchTemplateNiche } from '../../constants/niches';
import { BioTemplate } from '../../types';
import { NicheIcon } from '../NicheIcon';
import { Layers, ArrowRight } from 'lucide-react';

interface AdminNichesProps {
  templates: BioTemplate[];
  onSelectNiche: (nicheId: string) => void;
}

export const AdminNiches: React.FC<AdminNichesProps> = ({ templates, onSelectNiche }) => {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-[#F5FFF8]">Nichos Oficiais da Plataforma</h2>
        <p className="text-xs text-[#87938B]">
          Os 10 nichos estruturados para catalogação e distribuição dos biosites.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {OFFICIAL_NICHES.map((niche, index) => {
          const nicheTemplates = templates.filter((t) => matchTemplateNiche(t.nicheId, niche.id));
          const publishedCount = nicheTemplates.filter((t) => t.status === 'published').length;

          return (
            <div
              key={niche.id}
              className="bg-[#0B0F0D] border border-[#18221c] hover:border-[#36FF88]/40 rounded-2xl p-5 flex flex-col justify-between transition-all duration-150 group shadow-lg"
            >
              <div>
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center justify-center">
                    <NicheIcon name={niche.iconName} size={34} />
                  </div>
                  <span className="font-mono text-xs text-[#505f56] font-bold">
                    #{String(index + 1).padStart(2, '0')}
                  </span>
                </div>

                <h3 className="font-bold text-base text-[#F5FFF8] group-hover:text-[#36FF88] transition">
                  {niche.name}
                </h3>
                <p className="text-xs text-[#87938B] mt-1.5 leading-relaxed">
                  {niche.description}
                </p>
              </div>

              <div className="mt-5 pt-3 border-t border-[#18221c] flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-mono">
                  <span className="text-[#36FF88] font-bold">{publishedCount} publicados</span>
                  <span className="text-[#505f56]">•</span>
                  <span className="text-[#87938B]">{nicheTemplates.length} total</span>
                </div>

                <button
                  onClick={() => onSelectNiche(niche.id)}
                  className="flex items-center gap-1 text-xs text-[#87938B] group-hover:text-[#36FF88] font-semibold transition cursor-pointer"
                >
                  <span>Modelos</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
