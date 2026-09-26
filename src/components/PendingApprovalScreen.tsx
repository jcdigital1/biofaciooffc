import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Clock, RefreshCw, LogOut, ShieldAlert, Ban } from 'lucide-react';

export const PendingApprovalScreen: React.FC = () => {
  const { userProfile, refreshProfile, signOut } = useAuth();
  const [checking, setChecking] = useState(false);

  const handleCheckAgain = async () => {
    setChecking(true);
    try {
      await refreshProfile();
    } finally {
      setTimeout(() => setChecking(false), 600);
    }
  };

  const isRejected = userProfile?.status === 'rejected';
  const isBlocked = userProfile?.status === 'blocked';

  return (
    <div className="min-h-screen bg-[#050706] flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-[#36FF88]/5 rounded-full blur-3xl pointer-events-none"></div>

      <div className="w-full max-w-md bg-[#0B0F0D] border border-[#18221c] rounded-2xl p-8 text-center shadow-2xl relative z-10">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-[#0B0F0D] border border-[#36FF88]/30 shadow-[0_0_25px_rgba(54,255,136,0.2)] mb-6">
          <span className="font-extrabold text-xl tracking-tighter text-[#36FF88]">BF</span>
        </div>

        {isBlocked ? (
          <>
            <div className="w-16 h-16 mx-auto rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-400 mb-5">
              <Ban className="w-8 h-8" />
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">CONTA BLOQUEADA</h1>
            <p className="text-[#87938B] text-sm leading-relaxed mb-6">
              O acesso desta conta foi suspenso temporariamente pela administração da plataforma.
            </p>
          </>
        ) : isRejected ? (
          <>
            <div className="w-16 h-16 mx-auto rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 mb-5">
              <ShieldAlert className="w-8 h-8" />
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">CADASTRO NÃO APROVADO</h1>
            <p className="text-[#87938B] text-sm leading-relaxed mb-6">
              Sua solicitação de acesso não foi aprovada pelo administrador no momento.
            </p>
          </>
        ) : (
          <>
            <div className="w-16 h-16 mx-auto rounded-full bg-[#36FF88]/10 border border-[#36FF88]/30 flex items-center justify-center text-[#36FF88] mb-5 shadow-[0_0_20px_rgba(54,255,136,0.2)]">
              <Clock className="w-8 h-8 animate-pulse" />
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">CONTA EM ANÁLISE</h1>
            <p className="text-[#87938B] text-sm leading-relaxed mb-6">
              Seu cadastro foi realizado com sucesso. Aguarde a aprovação do administrador para acessar o BIO FÁCIL.
            </p>
          </>
        )}

        <div className="bg-[#111713] border border-[#1e2a22] rounded-xl p-3 mb-6 text-left text-xs font-mono">
          <div className="text-[#87938B] text-[10px] uppercase">E-mail Cadastrado</div>
          <div className="text-[#F5FFF8] truncate">{userProfile?.email}</div>
          <div className="mt-2 text-[#87938B] text-[10px] uppercase">Status Atual</div>
          <div className="text-[#36FF88] uppercase font-bold tracking-wider">{userProfile?.status}</div>
        </div>

        <div className="space-y-3">
          {!isBlocked && !isRejected && (
            <button
              onClick={handleCheckAgain}
              disabled={checking}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-[#36FF88] hover:bg-[#00E86B] text-[#050706] font-bold text-sm rounded-xl transition duration-150 cursor-pointer shadow-[0_0_20px_rgba(54,255,136,0.2)]"
            >
              <RefreshCw className={`w-4 h-4 ${checking ? 'animate-spin' : ''}`} />
              <span>VERIFICAR NOVAMENTE</span>
            </button>
          )}

          <button
            onClick={() => signOut()}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-[#111713] hover:bg-[#18221c] border border-[#1e2a22] text-[#87938B] hover:text-[#F5FFF8] font-semibold text-sm rounded-xl transition duration-150 cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>SAIR</span>
          </button>
        </div>
      </div>
    </div>
  );
};
