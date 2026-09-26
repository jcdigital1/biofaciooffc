import React from 'react';
import { BioProject } from '../../types';
import { FolderKanban, Eye, Calendar, User, ExternalLink } from 'lucide-react';

interface AdminProjectsProps {
  projects: BioProject[];
  onPreviewProject?: (project: BioProject) => void;
}

export const AdminProjects: React.FC<AdminProjectsProps> = ({ projects }) => {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-[#F5FFF8]">Projetos dos Usuários</h2>
        <p className="text-xs text-[#87938B]">
          Biosites personalizados salvos no Firestore pelos usuários cadastrados.
        </p>
      </div>

      {projects.length === 0 ? (
        <div className="bg-[#0B0F0D] border border-[#18221c] rounded-2xl p-12 text-center text-[#87938B]">
          <FolderKanban className="w-10 h-10 mx-auto text-[#505f56] mb-3" />
          <p className="text-sm">Nenhum projeto foi criado pelos usuários ainda.</p>
        </div>
      ) : (
        <div className="bg-[#0B0F0D] border border-[#18221c] rounded-2xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#070b09] text-[#87938B] uppercase tracking-wider text-[10px] border-b border-[#18221c]">
                <tr>
                  <th className="px-5 py-3.5 font-bold">Projeto</th>
                  <th className="px-4 py-3.5 font-bold">Modelo Base</th>
                  <th className="px-4 py-3.5 font-bold">Proprietário (UID)</th>
                  <th className="px-4 py-3.5 font-bold">Data de Criação</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#18221c]">
                {projects.map((proj) => (
                  <tr key={proj.id} className="hover:bg-[#111713]/50 transition">
                    <td className="px-5 py-4">
                      <div className="font-bold text-[#F5FFF8] text-sm">{proj.name}</div>
                      <div className="font-mono text-[#505f56] text-[10px]">ID: {proj.id}</div>
                    </td>
                    <td className="px-4 py-4">
                      <span className="font-semibold text-[#36FF88]">{proj.templateName}</span>
                    </td>
                    <td className="px-4 py-4 font-mono text-[11px] text-[#87938B]">
                      {proj.ownerUid}
                    </td>
                    <td className="px-4 py-4 font-mono text-[11px] text-[#87938B]">
                      {proj.createdAt ? new Date(proj.createdAt).toLocaleDateString('pt-BR') : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
