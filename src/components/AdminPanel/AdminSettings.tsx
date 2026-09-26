import React from 'react';
import { firebaseDetails, ADMIN_EMAIL } from '../../lib/firebase';
import { ShieldCheck, Database, Server, Key, Lock, CheckCircle2 } from 'lucide-react';

export const AdminSettings: React.FC = () => {
  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h2 className="text-xl font-bold text-[#F5FFF8]">Configurações & Conexão Firebase</h2>
        <p className="text-xs text-[#87938B]">
          Auditoria de integridade dos serviços conectados e parâmetros de segurança da plataforma.
        </p>
      </div>

      <div className="bg-[#0B0F0D] border border-[#18221c] rounded-2xl p-6 sm:p-8 space-y-6 shadow-xl">
        <div className="flex items-center gap-3 pb-4 border-b border-[#18221c]">
          <div className="w-10 h-10 rounded-xl bg-[#36FF88]/10 border border-[#36FF88]/30 flex items-center justify-center text-[#36FF88]">
            <Database className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-sm text-[#F5FFF8]">Fonte de Verdade: Firebase Ativo</h3>
            <p className="text-xs text-[#36FF88] font-mono">Conectado e Operacional</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 font-mono text-xs">
          <div className="bg-[#111713] p-4 rounded-xl border border-[#1e2a22]">
            <div className="text-[10px] text-[#87938B] uppercase tracking-wider mb-1 flex items-center justify-between">
              <span>PROJECT ID</span>
              <CheckCircle2 className="w-3.5 h-3.5 text-[#36FF88]" />
            </div>
            <div className="text-sm font-bold text-[#F5FFF8]">{firebaseDetails.projectId}</div>
          </div>

          <div className="bg-[#111713] p-4 rounded-xl border border-[#1e2a22]">
            <div className="text-[10px] text-[#87938B] uppercase tracking-wider mb-1 flex items-center justify-between">
              <span>AUTH DOMAIN</span>
              <CheckCircle2 className="w-3.5 h-3.5 text-[#36FF88]" />
            </div>
            <div className="text-sm font-bold text-[#F5FFF8]">{firebaseDetails.authDomain}</div>
          </div>

          <div className="bg-[#111713] p-4 rounded-xl border border-[#1e2a22]">
            <div className="text-[10px] text-[#87938B] uppercase tracking-wider mb-1 flex items-center justify-between">
              <span>STORAGE BUCKET</span>
              <CheckCircle2 className="w-3.5 h-3.5 text-[#36FF88]" />
            </div>
            <div className="text-sm font-bold text-[#F5FFF8]">{firebaseDetails.storageBucket}</div>
          </div>

          <div className="bg-[#111713] p-4 rounded-xl border border-[#1e2a22]">
            <div className="text-[10px] text-[#87938B] uppercase tracking-wider mb-1 flex items-center justify-between">
              <span>FIRESTORE DATABASE ID</span>
              <CheckCircle2 className="w-3.5 h-3.5 text-[#36FF88]" />
            </div>
            <div className="text-sm font-bold text-[#36FF88]">{firebaseDetails.firestoreDatabaseId}</div>
          </div>
        </div>

        <div className="bg-[#111713] border border-[#1e2a22] rounded-xl p-5 space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold text-[#F5FFF8]">
            <Lock className="w-4 h-4 text-[#36FF88]" />
            <span>Administrador Único Registrado</span>
          </div>
          <div className="flex items-center justify-between bg-[#0B0F0D] p-3 rounded-lg border border-[#18221c] font-mono text-xs">
            <span className="text-[#36FF88] font-bold">{ADMIN_EMAIL}</span>
            <span className="px-2 py-0.5 rounded text-[10px] bg-[#36FF88]/20 text-[#36FF88] border border-[#36FF88]/30">
              AUTORIZADO
            </span>
          </div>
          <p className="text-[11px] text-[#87938B] leading-relaxed">
            Esta é a única conta com bypass automático de aprovação. Todas as demais contas registradas iniciam obrigatoriamente com status <span className="text-amber-400 font-bold">pending</span> e dependem da sua aprovação manual no menu Usuários.
          </p>
        </div>

        <div className="bg-[#111713] border border-[#1e2a22] rounded-xl p-5 space-y-2 text-xs text-[#87938B]">
          <div className="font-bold text-[#F5FFF8] flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-[#36FF88]" />
            <span>Segurança e Regras de Acesso</span>
          </div>
          <ul className="list-disc list-inside space-y-1 text-[11px] leading-relaxed">
            <li>Autenticação restrita a e-mail e senha (sem Google Sign-In externo).</li>
            <li>Regras Firestore Security Rules ativas impedindo autoaprovação de usuários normais.</li>
            <li>Nenhum seed destrutivo: catálogo de modelos incrementa cumulativamente.</li>
          </ul>
        </div>
      </div>
    </div>
  );
};
