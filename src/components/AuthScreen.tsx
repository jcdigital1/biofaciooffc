import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { ADMIN_EMAIL } from '../lib/firebase';
import { Lock, Mail, User, Shield, AlertCircle, ArrowRight, CheckCircle2 } from 'lucide-react';

export const AuthScreen: React.FC = () => {
  const { signIn, signUp, error, clearError } = useAuth();
  const [tab, setTab] = useState<'login' | 'register'>('login');

  // Form states
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  const handleTabChange = (newTab: 'login' | 'register') => {
    setTab(newTab);
    setLocalError(null);
    clearError();
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);

    if (!email.trim() || !password) {
      setLocalError('Preencha seu e-mail e sua senha.');
      return;
    }

    setSubmitting(true);
    try {
      await signIn(email, password);
    } catch (err: any) {
      // Handled in AuthContext
    } finally {
      setSubmitting(false);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);

    const cleanEmail = email.trim().toLowerCase();

    // Protection rule for Admin email
    if (cleanEmail === ADMIN_EMAIL.toLowerCase().trim()) {
      setLocalError('Esta conta possui acesso administrativo. Utilize Fazer Login.');
      return;
    }

    if (!name.trim()) {
      setLocalError('Informe seu nome completo.');
      return;
    }

    if (!email.trim()) {
      setLocalError('Informe seu e-mail.');
      return;
    }

    if (password.length < 6) {
      setLocalError('A senha deve ter no mínimo 6 caracteres.');
      return;
    }

    if (password !== confirmPassword) {
      setLocalError('As senhas não coincidem.');
      return;
    }

    setSubmitting(true);
    try {
      await signUp(name, email, password);
    } catch (err: any) {
      // Handled in AuthContext
    } finally {
      setSubmitting(false);
    }
  };

  const displayedError = localError || error;

  return (
    <div className="min-h-screen bg-[#050706] flex flex-col justify-center items-center px-4 py-12 relative overflow-hidden">
      {/* Background neon ambient glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-[#36FF88]/5 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute -bottom-20 right-1/4 w-[350px] h-[350px] bg-[#00E86B]/5 rounded-full blur-3xl pointer-events-none"></div>

      <div className="w-full max-w-md relative z-10">
        {/* Brand Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-[#0B0F0D] border border-[#36FF88]/30 shadow-[0_0_30px_rgba(54,255,136,0.25)] mb-4">
            <span className="font-extrabold text-2xl tracking-tighter text-[#36FF88]">BF</span>
          </div>
          <h1 className="text-3xl font-extrabold text-[#F5FFF8] tracking-tight">BIO FÁCIL</h1>
          <p className="text-xs uppercase tracking-widest text-[#87938B] mt-1 font-mono">
            Plataforma de Criação & Gestão de Biosites
          </p>
        </div>

        {/* Card Container */}
        <div className="bg-[#0B0F0D] border border-[#18221c] rounded-2xl shadow-2xl overflow-hidden backdrop-blur-sm">
          {/* Tabs */}
          <div className="grid grid-cols-2 border-b border-[#18221c]">
            <button
              type="button"
              onClick={() => handleTabChange('login')}
              className={`py-4 text-xs font-bold tracking-wider uppercase transition-all duration-150 ${
                tab === 'login'
                  ? 'text-[#36FF88] border-b-2 border-[#36FF88] bg-[#111713]/60'
                  : 'text-[#87938B] hover:text-[#F5FFF8]'
              }`}
            >
              Fazer Login
            </button>
            <button
              type="button"
              onClick={() => handleTabChange('register')}
              className={`py-4 text-xs font-bold tracking-wider uppercase transition-all duration-150 ${
                tab === 'register'
                  ? 'text-[#36FF88] border-b-2 border-[#36FF88] bg-[#111713]/60'
                  : 'text-[#87938B] hover:text-[#F5FFF8]'
              }`}
            >
              Criar Conta
            </button>
          </div>

          <div className="p-6 sm:p-8">
            {displayedError && (
              <div className="mb-5 p-3.5 rounded-xl bg-red-950/40 border border-red-500/30 flex items-start gap-3 text-red-300 text-xs">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-400" />
                <span className="leading-relaxed">{displayedError}</span>
              </div>
            )}

            {tab === 'login' ? (
              <form onSubmit={handleLoginSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-[#87938B] mb-1.5 uppercase tracking-wider">
                    E-mail
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#87938B]" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="seu.email@exemplo.com"
                      className="w-full bg-[#111713] border border-[#1e2a22] focus:border-[#36FF88] focus:ring-1 focus:ring-[#36FF88] rounded-xl pl-10 pr-4 py-3 text-sm text-[#F5FFF8] placeholder-[#505f56] outline-none transition"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#87938B] mb-1.5 uppercase tracking-wider">
                    Senha
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#87938B]" />
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full bg-[#111713] border border-[#1e2a22] focus:border-[#36FF88] focus:ring-1 focus:ring-[#36FF88] rounded-xl pl-10 pr-4 py-3 text-sm text-[#F5FFF8] placeholder-[#505f56] outline-none transition"
                    />
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full flex items-center justify-center gap-2 py-3.5 px-4 bg-[#36FF88] hover:bg-[#00E86B] disabled:opacity-50 text-[#050706] font-extrabold text-sm rounded-xl shadow-[0_0_20px_rgba(54,255,136,0.3)] transition duration-200 cursor-pointer"
                  >
                    {submitting ? (
                      <span className="inline-flex items-center gap-2">
                        <span className="w-4 h-4 border-2 border-[#050706] border-t-transparent rounded-full animate-spin"></span>
                        AUTENTICANDO...
                      </span>
                    ) : (
                      <>
                        <span>ACESSAR PLATAFORMA</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </div>
              </form>
            ) : (
              <form onSubmit={handleRegisterSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-[#87938B] mb-1.5 uppercase tracking-wider">
                    Nome Completo
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#87938B]" />
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Seu nome ou marca"
                      className="w-full bg-[#111713] border border-[#1e2a22] focus:border-[#36FF88] focus:ring-1 focus:ring-[#36FF88] rounded-xl pl-10 pr-4 py-3 text-sm text-[#F5FFF8] placeholder-[#505f56] outline-none transition"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#87938B] mb-1.5 uppercase tracking-wider">
                    E-mail
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#87938B]" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="seu.email@exemplo.com"
                      className="w-full bg-[#111713] border border-[#1e2a22] focus:border-[#36FF88] focus:ring-1 focus:ring-[#36FF88] rounded-xl pl-10 pr-4 py-3 text-sm text-[#F5FFF8] placeholder-[#505f56] outline-none transition"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#87938B] mb-1.5 uppercase tracking-wider">
                    Senha
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#87938B]" />
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Mínimo 6 caracteres"
                      className="w-full bg-[#111713] border border-[#1e2a22] focus:border-[#36FF88] focus:ring-1 focus:ring-[#36FF88] rounded-xl pl-10 pr-4 py-3 text-sm text-[#F5FFF8] placeholder-[#505f56] outline-none transition"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#87938B] mb-1.5 uppercase tracking-wider">
                    Confirmar Senha
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#87938B]" />
                    <input
                      type="password"
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Repita a senha"
                      className="w-full bg-[#111713] border border-[#1e2a22] focus:border-[#36FF88] focus:ring-1 focus:ring-[#36FF88] rounded-xl pl-10 pr-4 py-3 text-sm text-[#F5FFF8] placeholder-[#505f56] outline-none transition"
                    />
                  </div>
                </div>

                <div className="p-3 bg-[#111713] border border-[#1e2a22] rounded-xl text-[11px] text-[#87938B] leading-relaxed">
                  ⚠️ Novos cadastros ficam com status <span className="text-[#36FF88] font-bold">pendente</span> e são liberados após aprovação do administrador.
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full flex items-center justify-center gap-2 py-3.5 px-4 bg-[#36FF88] hover:bg-[#00E86B] disabled:opacity-50 text-[#050706] font-extrabold text-sm rounded-xl shadow-[0_0_20px_rgba(54,255,136,0.3)] transition duration-200 cursor-pointer"
                  >
                    {submitting ? (
                      <span className="inline-flex items-center gap-2">
                        <span className="w-4 h-4 border-2 border-[#050706] border-t-transparent rounded-full animate-spin"></span>
                        CRIANDO CONTA...
                      </span>
                    ) : (
                      <>
                        <span>CRIAR CONTA</span>
                        <CheckCircle2 className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
