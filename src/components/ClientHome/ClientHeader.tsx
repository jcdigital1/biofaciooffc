import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { FolderKanban, ShieldCheck, LogOut, User } from 'lucide-react';

interface ClientHeaderProps {
  onOpenMyProjects: () => void;
  onSwitchToAdmin?: () => void;
  myProjectsCount?: number;
}

export const ClientHeader: React.FC<ClientHeaderProps> = ({
  onOpenMyProjects,
  onSwitchToAdmin,
  myProjectsCount = 0,
}) => {
  const { userProfile, signOut, isAdmin } = useAuth();

  return (
    <header className="border-b border-[#18221c] bg-[#070b09]/95 backdrop-blur-md sticky top-0 z-30">
      <div className="max-w-7xl mx-auto px-4 py-3.5 flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-[#0B0F0D] border border-[#36FF88]/40 shadow-[0_0_15px_rgba(54,255,136,0.25)]">
            <span className="font-extrabold text-sm text-[#36FF88]">BF</span>
          </div>
          <div>
            <span className="font-extrabold text-base tracking-tight text-[#F5FFF8]">BIO FÁCIL</span>
            <p className="text-[10px] text-[#87938B] hidden sm:block">
              Biosites de Alta Conversão
            </p>
          </div>
        </div>

        {/* Right actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          {isAdmin && onSwitchToAdmin && (
            <button
              onClick={onSwitchToAdmin}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#111713] hover:bg-[#18221c] border border-[#36FF88]/40 text-[#36FF88] text-xs font-bold transition cursor-pointer shadow-[0_0_15px_rgba(54,255,136,0.15)]"
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">PAINEL ADMIN</span>
            </button>
          )}

          <button
            onClick={onOpenMyProjects}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#111713] hover:bg-[#18221c] border border-[#1e2a22] text-[#F5FFF8] text-xs font-semibold transition cursor-pointer"
          >
            <FolderKanban className="w-3.5 h-3.5 text-[#36FF88]" />
            <span>Meus Projetos</span>
            {myProjectsCount > 0 && (
              <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-[#36FF88] text-[#050706]">
                {myProjectsCount}
              </span>
            )}
          </button>

          <div className="h-4 w-px bg-[#18221c] hidden sm:block"></div>

          <div className="flex items-center gap-2">
            <div className="hidden md:flex flex-col text-right">
              <span className="text-xs font-bold text-[#F5FFF8] truncate max-w-[140px]">
                {userProfile?.name || 'Usuário'}
              </span>
              <span className="text-[10px] text-[#87938B] font-mono truncate max-w-[140px]">
                {userProfile?.email}
              </span>
            </div>

            <button
              onClick={() => signOut()}
              className="p-2 rounded-xl bg-[#111713] hover:bg-red-950/30 border border-[#1e2a22] hover:border-red-500/40 text-[#87938B] hover:text-red-300 transition cursor-pointer"
              title="Sair da conta"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
