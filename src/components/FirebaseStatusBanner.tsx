import React, { useState } from 'react';
import { firebaseDetails } from '../lib/firebase';
import { Database, ShieldCheck, AlertTriangle, ChevronDown, ChevronUp } from 'lucide-react';

export const FirebaseStatusBanner: React.FC = () => {
  const [expanded, setExpanded] = useState(false);

  if (!firebaseDetails.isConnected) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#050706] p-6 text-center">
        <div className="max-w-md w-full bg-[#0B0F0D] border border-red-500/40 rounded-2xl p-8 shadow-2xl">
          <div className="w-16 h-16 mx-auto rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-400 mb-6">
            <AlertTriangle className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-bold text-white tracking-wide mb-3">FIREBASE NÃO CONECTADO</h1>
          <p className="text-[#87938B] text-sm mb-6 leading-relaxed">
            A aplicação exige conexão ativa com o Firebase como única fonte de verdade.
            Por favor, execute a autorização do Firebase neste ambiente para continuar.
          </p>
          {firebaseDetails.error && (
            <div className="bg-[#111713] p-3 rounded-lg text-xs font-mono text-red-400/90 text-left mb-6 border border-red-500/20 break-words">
              {firebaseDetails.error}
            </div>
          )}
          <button
            onClick={() => window.location.reload()}
            className="w-full py-3 px-4 bg-[#36FF88] hover:bg-[#00E86B] text-[#050706] font-bold rounded-xl transition duration-200"
          >
            TENTAR NOVAMENTE
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="border-t border-[#18221c] bg-[#070b09] text-[11px] text-[#87938B]">
      <div className="max-w-7xl mx-auto px-4 py-2 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#36FF88] animate-pulse"></span>
          <span className="font-semibold text-[#F5FFF8]">Firebase Ativo:</span>
          <span className="font-mono text-[#36FF88]">{firebaseDetails.projectId}</span>
        </div>

        <button
          onClick={() => setExpanded(!expanded)}
          className="flex items-center gap-1 text-[#87938B] hover:text-[#F5FFF8] transition"
        >
          <span>Detalhes da Conexão</span>
          {expanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </button>
      </div>

      {expanded && (
        <div className="border-t border-[#111713] bg-[#0B0F0D] py-3 px-4">
          <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 font-mono text-[11px]">
            <div className="bg-[#111713] p-2.5 rounded-lg border border-[#18221c]">
              <div className="text-[#87938B] text-[10px] mb-1">PROJECT ID</div>
              <div className="text-[#F5FFF8] truncate">{firebaseDetails.projectId}</div>
            </div>
            <div className="bg-[#111713] p-2.5 rounded-lg border border-[#18221c]">
              <div className="text-[#87938B] text-[10px] mb-1">AUTH DOMAIN</div>
              <div className="text-[#F5FFF8] truncate">{firebaseDetails.authDomain}</div>
            </div>
            <div className="bg-[#111713] p-2.5 rounded-lg border border-[#18221c]">
              <div className="text-[#87938B] text-[10px] mb-1">STORAGE BUCKET</div>
              <div className="text-[#F5FFF8] truncate">{firebaseDetails.storageBucket}</div>
            </div>
            <div className="bg-[#111713] p-2.5 rounded-lg border border-[#18221c]">
              <div className="text-[#87938B] text-[10px] mb-1">FIRESTORE DB</div>
              <div className="text-[#36FF88] truncate">{firebaseDetails.firestoreDatabaseId}</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
