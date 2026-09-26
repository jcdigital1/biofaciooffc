import React, { useState } from 'react';
import { BioProject, BioTemplate } from '../../types';
import { generateExportHtml } from '../../lib/bioPreview';
import { X, Edit, Copy, Trash2, Download, FolderKanban, Check, Sparkles } from 'lucide-react';

interface MyProjectsModalProps {
  isOpen: boolean;
  onClose: () => void;
  projects: BioProject[];
  templates: BioTemplate[];
  onContinueEditing: (project: BioProject) => void;
  onDuplicateProject: (project: BioProject) => Promise<void>;
  onDeleteProject: (projectId: string) => Promise<void>;
}

export const MyProjectsModal: React.FC<MyProjectsModalProps> = ({
  isOpen,
  onClose,
  projects,
  templates,
  onContinueEditing,
  onDuplicateProject,
  onDeleteProject,
}) => {
  const [downloadSuccessModal, setDownloadSuccessModal] = useState<string | null>(null);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleDownload = (project: BioProject) => {
    // Find base template sourceHtml
    const tpl = templates.find((t) => t.templateId === project.templateId);
    const source = tpl?.sourceHtml || '<html><body>Bio Fácil</body></html>';

    const standaloneHtml = generateExportHtml(source, project.values || {}, project.theme || {});

    // Create standalone blob and trigger download
    const blob = new Blob([standaloneHtml], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${project.name.toLowerCase().replace(/[^a-z0-9]/g, '-') || 'meu-biosite'}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    setDownloadSuccessModal(project.name);
  };

  const handleDuplicate = async (project: BioProject) => {
    setActionLoadingId(project.id);
    try {
      await onDuplicateProject(project);
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleDelete = async (projectId: string) => {
    if (!window.confirm('Tem certeza que deseja excluir este projeto?')) return;
    setActionLoadingId(projectId);
    try {
      await onDeleteProject(projectId);
    } finally {
      setActionLoadingId(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#050706]/85 backdrop-blur-md p-4">
      <div className="w-full max-w-2xl bg-[#0B0F0D] border border-[#18221c] rounded-2xl overflow-hidden shadow-2xl flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="p-5 border-b border-[#18221c] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#36FF88]/10 border border-[#36FF88]/30 flex items-center justify-center text-[#36FF88]">
              <FolderKanban className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-[#F5FFF8]">Meus Biosites Salvos</h2>
              <p className="text-xs text-[#87938B]">
                Sincronizados em tempo real na nuvem Firestore da sua conta.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-[#111713] hover:bg-[#18221c] text-[#87938B] hover:text-[#F5FFF8] transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content list */}
        <div className="p-5 overflow-y-auto space-y-3 flex-1">
          {projects.length === 0 ? (
            <div className="py-12 text-center text-[#87938B]">
              <p className="text-sm">Você ainda não possui projetos salvos.</p>
              <p className="text-xs mt-1">Escolha um modelo nos nichos e clique em Personalizar!</p>
            </div>
          ) : (
            projects.map((project) => (
              <div
                key={project.id}
                className="bg-[#111713] border border-[#1e2a22] hover:border-[#36FF88]/40 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition"
              >
                <div>
                  <h3 className="font-bold text-sm text-[#F5FFF8]">{project.name}</h3>
                  <div className="flex items-center gap-2 mt-1 text-[11px] text-[#87938B] font-mono">
                    <span className="text-[#36FF88]">{project.templateName}</span>
                    <span>•</span>
                    <span>{project.updatedAt ? new Date(project.updatedAt).toLocaleDateString('pt-BR') : 'Hoje'}</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 self-end sm:self-auto">
                  <button
                    onClick={() => {
                      onContinueEditing(project);
                      onClose();
                    }}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-[#36FF88] hover:bg-[#00E86B] text-[#050706] text-xs font-bold rounded-lg transition cursor-pointer shadow-[0_0_12px_rgba(54,255,136,0.25)]"
                    title="Continuar editando"
                  >
                    <Edit className="w-3.5 h-3.5" />
                    <span>EDITAR</span>
                  </button>

                  <button
                    onClick={() => handleDownload(project)}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-[#0B0F0D] hover:bg-[#18221c] border border-[#1e2a22] text-[#F5FFF8] text-xs font-semibold rounded-lg transition cursor-pointer"
                    title="Baixar biosite estático"
                  >
                    <Download className="w-3.5 h-3.5 text-[#36FF88]" />
                    <span>BAIXAR</span>
                  </button>

                  <button
                    disabled={actionLoadingId === project.id}
                    onClick={() => handleDuplicate(project)}
                    className="p-2 bg-[#0B0F0D] hover:bg-[#18221c] border border-[#1e2a22] text-[#87938B] hover:text-[#F5FFF8] rounded-lg transition cursor-pointer"
                    title="Duplicar projeto"
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </button>

                  <button
                    disabled={actionLoadingId === project.id}
                    onClick={() => handleDelete(project.id)}
                    className="p-2 bg-[#0B0F0D] hover:bg-red-950/40 border border-[#1e2a22] hover:border-red-500/40 text-red-400 rounded-lg transition cursor-pointer"
                    title="Excluir projeto"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Success Modal when downloaded */}
      {downloadSuccessModal && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="max-w-md w-full bg-[#0B0F0D] border border-[#36FF88]/40 rounded-2xl p-6 text-center shadow-2xl">
            <div className="w-14 h-14 mx-auto rounded-full bg-[#36FF88]/10 border border-[#36FF88]/30 flex items-center justify-center text-[#36FF88] mb-4">
              <Check className="w-7 h-7" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">SEU BIOSITE ESTÁ PRONTO ✓</h3>
            <p className="text-xs text-[#87938B] leading-relaxed mb-6">
              O arquivo HTML do biosite <strong className="text-white">"{downloadSuccessModal}"</strong> foi baixado com sucesso. Ele é 100% estático, leve e independente, pronto para publicar em qualquer hospedagem!
            </p>
            <button
              onClick={() => setDownloadSuccessModal(null)}
              className="w-full py-2.5 bg-[#36FF88] hover:bg-[#00E86B] text-[#050706] font-bold text-xs rounded-xl transition cursor-pointer"
            >
              FECHAR
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
