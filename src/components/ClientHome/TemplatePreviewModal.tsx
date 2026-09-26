import React, { useState } from 'react';
import { BioTemplate } from '../../types';
import { preparePreviewHtml } from '../../lib/bioPreview';
import { getNormalizedNicheName } from '../../constants/niches';
import { X, Smartphone, Tablet, Monitor, Edit3 } from 'lucide-react';

interface TemplatePreviewModalProps {
  template: BioTemplate | null;
  onClose: () => void;
  onCustomize: (template: BioTemplate) => void;
}

export const TemplatePreviewModal: React.FC<TemplatePreviewModalProps> = ({
  template,
  onClose,
  onCustomize,
}) => {
  const [device, setDevice] = useState<'mobile' | 'tablet' | 'desktop'>('mobile');

  if (!template) return null;

  const previewHtml = preparePreviewHtml(template.sourceHtml, false);

  const getContainerWidth = () => {
    switch (device) {
      case 'mobile':
        return 'max-w-[420px]';
      case 'tablet':
        return 'max-w-[680px]';
      case 'desktop':
      default:
        return 'max-w-[980px]';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-[#050706]/90 backdrop-blur-md overflow-hidden">
      {/* Top Bar */}
      <div className="border-b border-[#18221c] bg-[#070b09] px-4 py-3 flex items-center justify-between shrink-0">
        <div>
          <h3 className="font-extrabold text-sm text-[#F5FFF8]">{template.name}</h3>
          <span className="text-[11px] font-mono text-[#36FF88]">
            {getNormalizedNicheName(template.nicheId, template.nicheName)}
          </span>
        </div>

        {/* Device Switcher */}
        <div className="flex items-center gap-1 bg-[#111713] p-1 rounded-xl border border-[#1e2a22]">
          <button
            onClick={() => setDevice('mobile')}
            className={`p-1.5 rounded-lg transition cursor-pointer ${
              device === 'mobile' ? 'bg-[#36FF88] text-[#050706]' : 'text-[#87938B] hover:text-[#F5FFF8]'
            }`}
            title="Mobile (390px)"
          >
            <Smartphone className="w-4 h-4" />
          </button>
          <button
            onClick={() => setDevice('tablet')}
            className={`p-1.5 rounded-lg transition cursor-pointer ${
              device === 'tablet' ? 'bg-[#36FF88] text-[#050706]' : 'text-[#87938B] hover:text-[#F5FFF8]'
            }`}
            title="Tablet (680px)"
          >
            <Tablet className="w-4 h-4" />
          </button>
          <button
            onClick={() => setDevice('desktop')}
            className={`p-1.5 rounded-lg transition cursor-pointer ${
              device === 'desktop' ? 'bg-[#36FF88] text-[#050706]' : 'text-[#87938B] hover:text-[#F5FFF8]'
            }`}
            title="Desktop (980px)"
          >
            <Monitor className="w-4 h-4" />
          </button>
        </div>

        {/* Right actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => onCustomize(template)}
            className="flex items-center gap-1.5 px-4 py-2 bg-[#36FF88] hover:bg-[#00E86B] text-[#050706] text-xs font-black rounded-xl shadow-[0_0_20px_rgba(54,255,136,0.3)] transition cursor-pointer"
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>PERSONALIZAR</span>
          </button>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-[#111713] hover:bg-[#18221c] border border-[#1e2a22] text-[#87938B] hover:text-[#F5FFF8] transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Frame Preview Area */}
      <div className="flex-1 overflow-auto p-4 sm:p-8 flex items-center justify-center bg-[#030504]">
        <div
          className={`w-full ${getContainerWidth()} h-[85vh] bg-[#070b09] rounded-2xl border-2 border-[#1e2a22] overflow-hidden shadow-2xl transition-all duration-200`}
        >
          <iframe
            title="Full Preview"
            srcDoc={previewHtml}
            sandbox="allow-scripts"
            className="w-full h-full border-0 bg-transparent"
          />
        </div>
      </div>
    </div>
  );
};
