import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { Shield, Eye, LogOut, LayoutGrid, Users, FileCode, PlusCircle, Layers, FolderKanban, Settings } from 'lucide-react';

export type AdminTab = 'overview' | 'users' | 'templates' | 'import' | 'niches' | 'projects' | 'settings';

interface AdminHeaderProps {
  currentTab: AdminTab;
  onTabChange: (tab: AdminTab) => void;
  pendingCount?: number;
  onSwitchToClientView: () => void;
}

export const AdminHeader: React.FC<AdminHeaderProps> = ({
  currentTab,
  onTabChange,
  pendingCount = 0,
  onSwitchToClientView,
}) => {
  const { signOut, currentUser } = useAuth();

  const navItems: { id: AdminTab; label: string; icon: React.ReactNode; badge?: number }[] = [
    { id: 'overview', label: 'Visão Geral', icon: <LayoutGrid className="w-4 h-4" /> },
    { id: 'users', label: 'Usuários', icon: <Users className="w-4 h-4" />, badge: pendingCount },
    { id: 'templates', label: 'Modelos', icon: <FileCode className="w-4 h-4" /> },
    { id: 'import', label: 'Importar BioSite', icon: <PlusCircle className="w-4 h-4 text-[#36FF88]" /> },
    { id: 'niches', label: 'Nichos', icon: <Layers className="w-4 h-4" /> },
    { id: 'projects', label: 'Projetos', icon: <FolderKanban className="w-4 h-4" /> },
    { id: 'settings', label: 'Configurações', icon: <Settings className="w-4 h-4" /> },
  ];

  return (
    <header className="border-b border-[#18221c] bg-[#070b09] sticky top-0 z-30">
      {/* Top Bar */}
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-[#0B0F0D] border border-[#36FF88]/40 shadow-[0_0_15px_rgba(54,255,136,0.25)]">
            <span className="font-extrabold text-sm text-[#36FF88]">BF</span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-sm tracking-tight text-[#F5FFF8]">BIO FÁCIL</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#36FF88]/10 text-[#36FF88] border border-[#36FF88]/30">
                ADMIN
              </span>
            </div>
            <p className="text-[10px] text-[#87938B] font-mono truncate max-w-[200px] sm:max-w-none">
              {currentUser?.email}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <button
            onClick={onSwitchToClientView}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#111713] hover:bg-[#18221c] border border-[#1e2a22] text-[#36FF88] hover:text-[#00E86B] text-xs font-semibold transition cursor-pointer"
          >
            <Eye className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Ver como Cliente</span>
          </button>

          <button
            onClick={() => signOut()}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#111713] hover:bg-red-950/30 border border-[#1e2a22] hover:border-red-500/40 text-[#87938B] hover:text-red-300 text-xs transition cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Sair</span>
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="max-w-7xl mx-auto px-4 overflow-x-auto scrollbar-none">
        <nav className="flex items-center gap-1 border-t border-[#111713]/80 pt-1">
          {navItems.map((item) => {
            const active = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                className={`flex items-center gap-2 px-3.5 py-2.5 text-xs font-semibold whitespace-nowrap border-b-2 transition duration-150 cursor-pointer ${
                  active
                    ? 'border-[#36FF88] text-[#36FF88] bg-[#111713]/50'
                    : 'border-transparent text-[#87938B] hover:text-[#F5FFF8] hover:bg-[#111713]/20'
                }`}
              >
                {item.icon}
                <span>{item.label}</span>
                {Boolean(item.badge && item.badge > 0) && (
                  <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-[#36FF88] text-[#050706] animate-pulse">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
};
