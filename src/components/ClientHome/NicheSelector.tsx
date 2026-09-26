import React from 'react';
import { OFFICIAL_NICHES } from '../../constants/niches';
import { NicheIcon } from '../NicheIcon';
import { NicheInfo, BioTemplate } from '../../types';
import { ArrowRight, Sparkles } from 'lucide-react';

interface NicheSelectorProps {
  onSelectNiche: (niche: NicheInfo) => void;
  templates: BioTemplate[];
}

export const NicheSelector: React.FC<NicheSelectorProps> = ({ onSelectNiche, templates }) => {
  return (
    <div className="py-8 sm:py-12 space-y-10">
      {/* Hero Section */}
      <div className="text-center max-w-2xl mx-auto px-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#111713] border border-[#36FF88]/30 text-[#36FF88] text-xs font-semibold mb-4 shadow-[0_0_20px_rgba(54,255,136,0.15)]">
          <Sparkles className="w-3.5 h-3.5" />
          <span>MODELOS PROFISSIONAIS DE ALTA CONVERSÃO</span>
        </div>

        <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-[#F5FFF8] tracking-tight">
          ESCOLHA SEU NICHO
        </h1>

        <p className="mt-3 text-sm sm:text-base text-[#87938B] max-w-lg mx-auto leading-relaxed">
          Encontre um modelo e personalize do seu jeito.
        </p>
      </div>

      {/* Niches Grid: 2 per row on Mobile, 3 or 4 on Desktop */}
      <div className="max-w-6xl mx-auto px-4">
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3.5 sm:gap-5">
          {OFFICIAL_NICHES.map((niche) => {
            const count = templates.filter(
              (t) => t.nicheId === niche.id && t.status === 'published'
            ).length;

            return (
              <div
                key={niche.id}
                onClick={() => onSelectNiche(niche)}
                className="group relative bg-[#0B0F0D] hover:bg-[#111713] border border-[#18221c] hover:border-[#36FF88]/50 rounded-2xl p-4 sm:p-5 flex flex-col justify-between transition-all duration-200 cursor-pointer hover:-translate-y-1 hover:shadow-[0_10px_30px_rgba(0,0,0,0.8),0_0_25px_rgba(54,255,136,0.15)]"
              >
                <div>
                  {/* 3D Icon container */}
                  <div className="w-14 h-14 sm:w-16 sm:h-16 mx-auto mb-3.5 rounded-2xl bg-[#070b09] border border-[#1e2a22] flex items-center justify-center p-2.5 group-hover:scale-105 group-hover:border-[#36FF88]/40 transition duration-200 shadow-inner">
                    <NicheIcon name={niche.iconName} size={46} />
                  </div>

                  <h3 className="font-extrabold text-sm sm:text-base text-[#F5FFF8] text-center group-hover:text-[#36FF88] transition duration-150">
                    {niche.name}
                  </h3>

                  <p className="hidden sm:block text-[11px] text-[#87938B] text-center mt-1.5 leading-snug line-clamp-2">
                    {niche.description}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-[#18221c] flex items-center justify-between text-xs">
                  <span className="font-mono text-[11px] text-[#87938B] group-hover:text-[#36FF88] transition">
                    {count} {count === 1 ? 'modelo' : 'modelos'}
                  </span>

                  <span className="w-6 h-6 rounded-lg bg-[#111713] group-hover:bg-[#36FF88] text-[#87938B] group-hover:text-[#050706] flex items-center justify-center transition">
                    <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
