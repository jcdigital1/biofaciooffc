import React, { useState } from 'react';
import { UserProfile } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { ADMIN_EMAIL } from '../../lib/firebase';
import { Search, UserCheck, Ban, XCircle, ShieldCheck, Check, RotateCcw, Clock } from 'lucide-react';

interface AdminUsersProps {
  users: UserProfile[];
  onApproveUser: (uid: string) => Promise<void>;
  onRejectUser: (uid: string) => Promise<void>;
  onBlockUser: (uid: string) => Promise<void>;
  onUnblockUser: (uid: string) => Promise<void>;
}

export const AdminUsers: React.FC<AdminUsersProps> = ({
  users,
  onApproveUser,
  onRejectUser,
  onBlockUser,
  onUnblockUser,
}) => {
  const { currentUser } = useAuth();
  const [filter, setFilter] = useState<'pending' | 'approved' | 'blocked' | 'all'>('pending');
  const [searchTerm, setSearchTerm] = useState('');
  const [processingUid, setProcessingUid] = useState<string | null>(null);

  const pendingCount = users.filter((u) => u.status === 'pending').length;
  const approvedCount = users.filter((u) => u.status === 'approved').length;
  const blockedCount = users.filter((u) => u.status === 'blocked').length;

  const filteredUsers = users.filter((u) => {
    // Filter status
    if (filter === 'pending' && u.status !== 'pending') return false;
    if (filter === 'approved' && u.status !== 'approved') return false;
    if (filter === 'blocked' && u.status !== 'blocked') return false;

    // Search query
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      const matchName = u.name?.toLowerCase().includes(q);
      const matchEmail = u.email?.toLowerCase().includes(q);
      return matchName || matchEmail;
    }
    return true;
  });

  const handleAction = async (actionFn: (uid: string) => Promise<void>, uid: string) => {
    setProcessingUid(uid);
    try {
      await actionFn(uid);
    } finally {
      setProcessingUid(null);
    }
  };

  const getStatusBadge = (status: string, role: string) => {
    if (role === 'admin') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#36FF88]/15 text-[#36FF88] border border-[#36FF88]/40">
          <ShieldCheck className="w-3 h-3" />
          <span>ADMINISTRADOR</span>
        </span>
      );
    }
    switch (status) {
      case 'approved':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
            <UserCheck className="w-3 h-3" />
            <span>Aprovado</span>
          </span>
        );
      case 'pending':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500/15 text-amber-300 border border-amber-500/30 animate-pulse">
            <Clock className="w-3 h-3" />
            <span>Pendente</span>
          </span>
        );
      case 'blocked':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-500/10 text-red-400 border border-red-500/30">
            <Ban className="w-3 h-3" />
            <span>Bloqueado</span>
          </span>
        );
      case 'rejected':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-zinc-500/10 text-zinc-400 border border-zinc-500/30">
            <XCircle className="w-3 h-3" />
            <span>Recusado</span>
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-0.5 rounded-full text-xs bg-zinc-800 text-zinc-300">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Title & Filter Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-[#F5FFF8]">Gestão de Usuários</h2>
          <p className="text-xs text-[#87938B] mt-0.5">
            Sincronização em tempo real com a coleção <span className="font-mono text-[#36FF88]">users</span> do Firestore.
          </p>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#87938B]" />
          <input
            type="text"
            placeholder="Buscar por nome ou e-mail..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-[#0B0F0D] border border-[#18221c] focus:border-[#36FF88] rounded-xl pl-9 pr-3 py-2 text-xs text-[#F5FFF8] placeholder-[#505f56] outline-none transition"
          />
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-[#18221c] pb-3">
        <button
          onClick={() => setFilter('pending')}
          className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
            filter === 'pending'
              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
              : 'bg-[#0B0F0D] text-[#87938B] hover:text-[#F5FFF8] border border-[#18221c]'
          }`}
        >
          <span>Aguardando Aprovação</span>
          {pendingCount > 0 && (
            <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-amber-400 text-[#050706]">
              {pendingCount}
            </span>
          )}
        </button>

        <button
          onClick={() => setFilter('approved')}
          className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
            filter === 'approved'
              ? 'bg-[#36FF88]/20 text-[#36FF88] border border-[#36FF88]/40'
              : 'bg-[#0B0F0D] text-[#87938B] hover:text-[#F5FFF8] border border-[#18221c]'
          }`}
        >
          <span>Aprovados ({approvedCount})</span>
        </button>

        <button
          onClick={() => setFilter('blocked')}
          className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
            filter === 'blocked'
              ? 'bg-red-500/20 text-red-300 border border-red-500/40'
              : 'bg-[#0B0F0D] text-[#87938B] hover:text-[#F5FFF8] border border-[#18221c]'
          }`}
        >
          <span>Bloqueados ({blockedCount})</span>
        </button>

        <button
          onClick={() => setFilter('all')}
          className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
            filter === 'all'
              ? 'bg-[#18221c] text-[#F5FFF8] border border-[#36FF88]/30'
              : 'bg-[#0B0F0D] text-[#87938B] hover:text-[#F5FFF8] border border-[#18221c]'
          }`}
        >
          <span>Todos ({users.length})</span>
        </button>
      </div>

      {/* Users List Table */}
      <div className="bg-[#0B0F0D] border border-[#18221c] rounded-2xl overflow-hidden shadow-xl">
        {filteredUsers.length === 0 ? (
          <div className="p-12 text-center text-[#87938B]">
            <p className="text-sm">Nenhum usuário encontrado para esta seleção.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#070b09] text-[#87938B] uppercase tracking-wider text-[10px] border-b border-[#18221c]">
                <tr>
                  <th className="px-5 py-3.5 font-bold">Usuário</th>
                  <th className="px-4 py-3.5 font-bold">Status</th>
                  <th className="px-4 py-3.5 font-bold">Permissão</th>
                  <th className="px-5 py-3.5 font-bold text-right">Ações Administrativas</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#18221c]">
                {filteredUsers.map((user) => {
                  const isProcessing = processingUid === user.uid;
                  const isMaster = user.email?.toLowerCase().trim() === ADMIN_EMAIL.toLowerCase().trim();

                  return (
                    <tr key={user.uid} className="hover:bg-[#111713]/50 transition">
                      <td className="px-5 py-4">
                        <div className="font-bold text-[#F5FFF8] text-sm">{user.name || 'Sem nome'}</div>
                        <div className="font-mono text-[#87938B] text-[11px]">{user.email}</div>
                        <div className="font-mono text-[9px] text-[#505f56]">UID: {user.uid}</div>
                      </td>

                      <td className="px-4 py-4 whitespace-nowrap">
                        {getStatusBadge(user.status, user.role)}
                      </td>

                      <td className="px-4 py-4 uppercase font-mono text-[10px] text-[#87938B]">
                        {user.role}
                      </td>

                      <td className="px-5 py-4 text-right">
                        {isMaster ? (
                          <span className="text-[11px] font-mono text-[#36FF88] italic">
                            Conta Mestre Imutável
                          </span>
                        ) : (
                          <div className="inline-flex items-center gap-1.5 justify-end">
                            {user.status === 'pending' && (
                              <>
                                <button
                                  disabled={isProcessing}
                                  onClick={() => handleAction(onApproveUser, user.uid)}
                                  className="inline-flex items-center gap-1 px-3 py-1.5 bg-[#36FF88] hover:bg-[#00E86B] disabled:opacity-50 text-[#050706] font-bold text-xs rounded-lg transition cursor-pointer"
                                  title="Aprovar usuário"
                                >
                                  <Check className="w-3.5 h-3.5" />
                                  <span>APROVAR</span>
                                </button>

                                <button
                                  disabled={isProcessing}
                                  onClick={() => handleAction(onRejectUser, user.uid)}
                                  className="inline-flex items-center gap-1 px-3 py-1.5 bg-[#111713] hover:bg-zinc-800 border border-[#1e2a22] text-zinc-300 text-xs font-semibold rounded-lg transition cursor-pointer"
                                  title="Recusar usuário"
                                >
                                  <XCircle className="w-3.5 h-3.5 text-zinc-400" />
                                  <span>RECUSAR</span>
                                </button>
                              </>
                            )}

                            {user.status === 'approved' && (
                              <button
                                disabled={isProcessing}
                                onClick={() => handleAction(onBlockUser, user.uid)}
                                className="inline-flex items-center gap-1 px-3 py-1.5 bg-[#111713] hover:bg-red-950/40 border border-[#1e2a22] hover:border-red-500/40 text-red-400 text-xs font-semibold rounded-lg transition cursor-pointer"
                                title="Bloquear acesso"
                              >
                                <Ban className="w-3.5 h-3.5" />
                                <span>BLOQUEAR</span>
                              </button>
                            )}

                            {(user.status === 'blocked' || user.status === 'rejected') && (
                              <button
                                disabled={isProcessing}
                                onClick={() => handleAction(onUnblockUser, user.uid)}
                                className="inline-flex items-center gap-1 px-3 py-1.5 bg-[#111713] hover:bg-[#36FF88]/20 border border-[#1e2a22] hover:border-[#36FF88]/40 text-[#36FF88] text-xs font-bold rounded-lg transition cursor-pointer"
                                title="Liberar acesso"
                              >
                                <RotateCcw className="w-3.5 h-3.5" />
                                <span>REATIVAR / APROVAR</span>
                              </button>
                            )}
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
