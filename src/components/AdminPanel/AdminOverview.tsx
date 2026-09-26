import React from 'react';
import { UserProfile, BioTemplate } from '../../types';
import { Users, UserCheck, Clock, Ban, FileCode, CheckCircle, ArrowRight, ShieldCheck, PlusCircle } from 'lucide-react';
import { AdminTab } from './AdminHeader';

interface AdminOverviewProps {
  users: UserProfile[];
  templates: BioTemplate[];
  onNavigateTab: (tab: AdminTab) => void;
  onApproveUser: (uid: string) => Promise<void>;
  onRejectUser: (uid: string) => Promise<void>;
}

export const AdminOverview: React.FC<AdminOverviewProps> = ({
  users,
  templates,
  onNavigateTab,
  onApproveUser,
  onRejectUser,
}) => {
  const totalUsers = users.length;
  const pendingUsers = users.filter((u) => u.status === 'pending');
  const approvedUsers = users.filter((u) => u.status === 'approved');
  const blockedUsers = users.filter((u) => u.status === 'blocked');
  const totalTemplates = templates.length;
  const publishedTemplates = templates.filter((t) => t.status === 'published');

  const statCards = [
    {
      title: 'Usuários Cadastrados',
      value: totalUsers,
      icon: <Users className="w-5 h-5 text-blue-400" />,
      sub: 'Total no banco Firestore',
      onClick: () => onNavigateTab('users'),
    },
    {
      title: 'Aguardando Aprovação',
      value: pendingUsers.length,
      icon: <Clock className="w-5 h-5 text-amber-400" />,
      sub: pendingUsers.length > 0 ? 'Requer atenção imediata' : 'Nenhum pendente',
      highlight: pendingUsers.length > 0,
      onClick: () => onNavigateTab('users'),
    },
    {
      title: 'Usuários Aprovados',
      value: approvedUsers.length,
      icon: <UserCheck className="w-5 h-5 text-[#36FF88]" />,
      sub: 'Com acesso liberado',
      onClick: () => onNavigateTab('users'),
    },
    {
      title: 'Usuários Bloqueados',
      value: blockedUsers.length,
      icon: <Ban className="w-5 h-5 text-red-400" />,
      sub: 'Acesso suspenso',
      onClick: () => onNavigateTab('users'),
    },
    {
      title: 'Catálogo de Modelos',
      value: totalTemplates,
      icon: <FileCode className="w-5 h-5 text-purple-400" />,
      sub: 'Modelos criados',
      onClick: () => onNavigateTab('templates'),
    },
    {
      title: 'Modelos Publicados',
      value: publishedTemplates.length,
      icon: <CheckCircle className="w-5 h-5 text-[#00E86B]" />,
      sub: 'Visíveis para os clientes',
      onClick: () => onNavigateTab('templates'),
    },
  ];

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="bg-[#0B0F0D] border border-[#18221c] rounded-2xl p-6 sm:p-8 relative overflow-hidden">
        <div className="absolute right-0 top-0 w-80 h-80 bg-[#36FF88]/5 rounded-full blur-3xl pointer-events-none"></div>

        <div className="max-w-2xl relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#111713] border border-[#36FF88]/30 text-[#36FF88] text-xs font-semibold mb-3">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>PAINEL DE CONTROLE ADMINISTRATIVO</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#F5FFF8] tracking-tight">
            Central de Operações Bio Fácil
          </h2>
          <p className="text-sm text-[#87938B] mt-2 leading-relaxed">
            Gerencie aprovações de contas em tempo real, publique novos modelos biosite via HTML com análise automática e monitore o crescimento da sua plataforma.
          </p>

          <div className="flex flex-wrap gap-3 mt-6">
            <button
              onClick={() => onNavigateTab('import')}
              className="flex items-center gap-2 px-4 py-2.5 bg-[#36FF88] hover:bg-[#00E86B] text-[#050706] font-bold text-xs rounded-xl shadow-[0_0_20px_rgba(54,255,136,0.3)] transition cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" />
              <span>IMPORTAR NOVO MODELO</span>
            </button>
            <button
              onClick={() => onNavigateTab('users')}
              className="flex items-center gap-2 px-4 py-2.5 bg-[#111713] hover:bg-[#18221c] border border-[#1e2a22] text-[#F5FFF8] font-semibold text-xs rounded-xl transition cursor-pointer"
            >
              <Users className="w-4 h-4 text-[#87938B]" />
              <span>GERENCIAR USUÁRIOS</span>
            </button>
          </div>
        </div>
      </div>

      {/* Real-time Metric Cards */}
      <div>
        <h3 className="text-xs font-bold uppercase tracking-wider text-[#87938B] mb-4">
          Métricas em Tempo Real (Cloud Firestore)
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {statCards.map((card, idx) => (
            <div
              key={idx}
              onClick={card.onClick}
              className={`bg-[#0B0F0D] border rounded-2xl p-4 transition-all duration-150 cursor-pointer hover:-translate-y-0.5 ${
                card.highlight
                  ? 'border-amber-500/40 bg-amber-950/10 shadow-[0_0_20px_rgba(245,158,11,0.15)]'
                  : 'border-[#18221c] hover:border-[#36FF88]/40'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-semibold text-[#87938B] leading-tight">
                  {card.title}
                </span>
                <div className="p-1.5 rounded-lg bg-[#111713] border border-[#1e2a22]">
                  {card.icon}
                </div>
              </div>
              <div className="text-2xl font-extrabold text-[#F5FFF8] tracking-tight mb-1">
                {card.value}
              </div>
              <div className="text-[10px] text-[#87938B] truncate">{card.sub}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Pending Approvals Alert Section */}
      {pendingUsers.length > 0 && (
        <div className="bg-[#0B0F0D] border border-amber-500/30 rounded-2xl p-6 shadow-[0_0_30px_rgba(245,158,11,0.1)]">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-ping"></span>
              <h3 className="text-base font-bold text-white">
                Cadastros Aguardando Aprovação ({pendingUsers.length})
              </h3>
            </div>
            <button
              onClick={() => onNavigateTab('users')}
              className="text-xs text-[#36FF88] hover:underline flex items-center gap-1 font-semibold"
            >
              <span>Ver todos os usuários</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="divide-y divide-[#18221c]">
            {pendingUsers.slice(0, 5).map((user) => (
              <div key={user.uid} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <div className="font-semibold text-sm text-[#F5FFF8]">{user.name}</div>
                  <div className="text-xs text-[#87938B] font-mono">{user.email}</div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onApproveUser(user.uid)}
                    className="px-3.5 py-1.5 bg-[#36FF88] hover:bg-[#00E86B] text-[#050706] font-bold text-xs rounded-lg transition cursor-pointer"
                  >
                    Aprovar Acesso
                  </button>
                  <button
                    onClick={() => onRejectUser(user.uid)}
                    className="px-3.5 py-1.5 bg-[#111713] hover:bg-red-950/40 border border-[#1e2a22] hover:border-red-500/40 text-[#87938B] hover:text-red-300 text-xs font-semibold rounded-lg transition cursor-pointer"
                  >
                    Recusar
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
