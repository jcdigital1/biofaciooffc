import React from 'react';
import { firebaseDetails } from '../lib/firebase';
import { AlertTriangle } from 'lucide-react';

export const FirebaseStatusBanner: React.FC = () => {

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

  // When Firebase is connected, do not render any bottom banner
  return null;
};
