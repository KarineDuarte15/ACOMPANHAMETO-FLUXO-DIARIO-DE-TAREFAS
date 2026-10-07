// src/components/LoginScreen.tsx
import React, { useState } from 'react';
import { authService } from '../services/authService';
import { Mail, Lock, ShieldAlert, Sparkles, AlertCircle, Info, RefreshCw, UserCheck } from 'lucide-react';
import { TeamSettings } from '../types';

interface LoginScreenProps {
  onLoginSuccess: (userId: string) => void;
  teamSettings: TeamSettings;
}

export function LoginScreen({ onLoginSuccess, teamSettings }: LoginScreenProps) {
  const [isRegistering, setIsRegistering] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [nome, setNome] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [infoMsg, setInfoMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password || (isRegistering && !nome)) {
      setErrorMsg("Por favor, preencha todos os campos.");
      return;
    }

    setIsLoading(true);
    setErrorMsg(null);
    setInfoMsg(null);

    try {
      if (isRegistering) {
        // Fluxo de Cadastro Seguro
        const emailLower = email.trim().toLowerCase();
        const isKarine = emailLower.includes('karine');
        const isAgenor = emailLower.includes('agenor');
        const role = (isKarine || isAgenor) ? 'ADMIN' : 'USER';

        const userProfile = await authService.register(emailLower, password, nome.trim(), role);
        onLoginSuccess(userProfile.id);
      } else {
        // Fluxo de Login Seguro
        const authUser = await authService.login(email.trim(), password);
        
        // Busca o perfil no firestore para verificar se está ativo
        const profile = await authService.getProfile(authUser.uid);
        if (profile && !profile.ativo) {
          setErrorMsg("Seu acesso foi desativado. Entre em contato com um administrador.");
          await authService.logout();
          setIsLoading(false);
          return;
        }

        onLoginSuccess(authUser.uid);
      }
    } catch (e: any) {
      console.error(e);
      let friendlyError = "Erro na autenticação. Verifique os dados.";
      if (e.code === 'auth/user-not-found' || e.code === 'auth/wrong-password' || e.code === 'auth/invalid-credential') {
        friendlyError = "E-mail ou senha incorretos. Caso ainda não tenha cadastro, clique em 'Criar uma conta' abaixo.";
      } else if (e.code === 'auth/email-already-in-use') {
        friendlyError = "Este e-mail já está cadastrado. Tente entrar ou use 'Esqueci minha senha'.";
      } else if (e.code === 'auth/weak-password') {
        friendlyError = "A senha deve conter no mínimo 6 caracteres.";
      } else if (e.code === 'auth/invalid-email') {
        friendlyError = "Formato de e-mail inválido.";
      } else if (e.code === 'auth/operation-not-allowed') {
        friendlyError = "Por favor, habilite o método 'E-mail/Senha' no painel Sign-in do console do seu Firebase.";
      }
      setErrorMsg(friendlyError);
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!email) {
      setErrorMsg("Digite seu e-mail no campo acima antes de clicar em recuperar.");
      return;
    }

    setIsLoading(true);
    setErrorMsg(null);
    setInfoMsg(null);

    try {
      await authService.resetPassword(email.trim());
      setInfoMsg("Link de redefinição enviado! Verifique sua caixa de entrada.");
    } catch (e: any) {
      setErrorMsg("Erro ao solicitar redefinição: " + e.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Método de desenvolvimento para auto-provisionamento dos perfis de testes com um clique
  const handleAutoProvision = async (name: string, role: 'ADMIN' | 'USER') => {
    setIsLoading(true);
    setErrorMsg(null);
    setInfoMsg(null);

    const suffix = name.toLowerCase();
    const demoEmail = `${suffix}@optimusbi.com`;
    const demoPassword = `membro${suffix}123`;

    try {
      // Tenta fazer login primeiro
      try {
        const authUser = await authService.login(demoEmail, demoPassword);
        onLoginSuccess(authUser.uid);
        return;
      } catch (loginErr: any) {
        // Se falhar o login, registra a conta se for por usuário não encontrado ou credencial inválida
        const userProfile = await authService.register(demoEmail, demoPassword, name, role);
        onLoginSuccess(userProfile.id);
      }
    } catch (e: any) {
      // Caso já exista com outra senha, avisa o usuário de forma amigável
      if (e.code === 'auth/email-already-in-use') {
        setErrorMsg(`A conta de teste para ${name} já existe no Firebase com outra senha. Use o login manual com ${demoEmail}.`);
      } else {
        setErrorMsg(`Erro no auto-provisionamento: ${e.message}`);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 transition-colors duration-300" style={{ backgroundColor: teamSettings.backgroundColor }}>
      
      {/* CARD DE LOGIN/CADASTRO */}
      <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8 w-full max-w-md space-y-6 animate-fade-in relative overflow-hidden">
        
        {/* Banner com cores da Optimus BI */}
        <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r" style={{ backgroundImage: `linear-gradient(to right, ${teamSettings.primaryColor}, ${teamSettings.secondaryColor})` }} />

        {/* LOGO & BRANDING */}
        <div className="text-center space-y-2">
          {teamSettings.logoUrl ? (
            <img 
              src={teamSettings.logoUrl} 
              alt={teamSettings.logoAlt} 
              className="h-16 mx-auto object-contain rounded-xl shadow-sm bg-gray-50 p-2" 
            />
          ) : (
            <div className="h-16 w-16 mx-auto rounded-2xl bg-gradient-to-br flex items-center justify-center text-white text-2xl font-black font-sora shadow-lg" style={{ backgroundImage: `linear-gradient(to bottom right, ${teamSettings.secondaryColor}, ${teamSettings.primaryColor})` }}>
              RI
            </div>
          )}
          
          <h1 className="text-xl font-black font-sora text-gray-900 tracking-tight mt-3">
            {teamSettings.teamName}
          </h1>
          <p className="text-xs text-gray-400 font-semibold uppercase tracking-widest">
            {isRegistering ? 'Criar Nova Conta Corporativa' : 'Painel Operacional Protegido'}
          </p>
        </div>

        {/* ALERTAS */}
        {errorMsg && (
          <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-lg flex gap-2.5 text-xs">
            <AlertCircle className="h-4.5 w-4.5 text-red-600 shrink-0" />
            <span className="font-semibold leading-relaxed">{errorMsg}</span>
          </div>
        )}

        {infoMsg && (
          <div className="bg-green-50 border border-green-200 text-green-700 p-3 rounded-lg flex gap-2.5 text-xs">
            <Info className="h-4.5 w-4.5 text-green-600 shrink-0" />
            <span className="font-semibold leading-relaxed">{infoMsg}</span>
          </div>
        )}

        {/* FORMULÁRIO */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {isRegistering && (
            <div className="space-y-1">
              <label className="block text-[10px] text-gray-400 uppercase font-black tracking-wider">Nome Completo</label>
              <div className="relative">
                <UserCheck className="absolute left-3 top-3.5 h-4 w-4 text-gray-300" />
                <input
                  type="text"
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  className="w-full border border-gray-200 rounded-lg pl-9 pr-4 py-3 text-xs focus:outline-none focus:ring-2"
                  style={{ '--tw-ring-color': teamSettings.primaryColor } as React.CSSProperties}
                  placeholder="Seu nome"
                  required
                  disabled={isLoading}
                />
              </div>
            </div>
          )}

          <div className="space-y-1">
            <label className="block text-[10px] text-gray-400 uppercase font-black tracking-wider">E-mail Corporativo</label>
            <div className="relative">
              <Mail className="absolute left-3 top-3.5 h-4 w-4 text-gray-300" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full border border-gray-200 rounded-lg pl-9 pr-4 py-3 text-xs focus:outline-none focus:ring-2"
                style={{ '--tw-ring-color': teamSettings.primaryColor } as React.CSSProperties}
                placeholder="nome@optimusbi.com"
                required
                disabled={isLoading}
              />
            </div>
          </div>

          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <label className="block text-[10px] text-gray-400 uppercase font-black tracking-wider">Senha</label>
              {!isRegistering && (
                <button
                  type="button"
                  onClick={handleForgotPassword}
                  className="text-[10px] font-black text-gray-400 hover:text-gray-600 uppercase"
                  disabled={isLoading}
                >
                  Esqueci minha senha
                </button>
              )}
            </div>
            <div className="relative">
              <Lock className="absolute left-3 top-3.5 h-4 w-4 text-gray-300" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full border border-gray-200 rounded-lg pl-9 pr-4 py-3 text-xs focus:outline-none focus:ring-2"
                style={{ '--tw-ring-color': teamSettings.primaryColor } as React.CSSProperties}
                placeholder="••••••••"
                required
                disabled={isLoading}
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full text-white font-black text-xs py-3.5 rounded-lg transition duration-200 shadow-md flex items-center justify-center gap-2"
            style={{ backgroundColor: teamSettings.primaryColor }}
            disabled={isLoading}
          >
            {isLoading ? (
              <RefreshCw className="h-4 w-4 animate-spin" />
            ) : (
              <span>{isRegistering ? 'Cadastrar e Entrar' : 'Entrar no Cockpit'}</span>
            )}
          </button>
        </form>

        {/* ALTERNADOR DE MODOS */}
        <div className="text-center">
          <button
            type="button"
            onClick={() => {
              setIsRegistering(!isRegistering);
              setErrorMsg(null);
              setInfoMsg(null);
            }}
            className="text-xs font-bold text-gray-500 hover:underline"
            style={{ color: teamSettings.primaryColor }}
            disabled={isLoading}
          >
            {isRegistering ? 'Já possui conta? Faça login' : 'Não possui conta? Crie uma aqui'}
          </button>
        </div>

        {/* PROVISIONAMENTO DE CONTAS DE DEMONSTRAÇÃO */}
        {!isRegistering && (
          <div className="border-t border-gray-100 pt-4 space-y-3">
            <span className="block text-[9px] text-gray-400 font-black uppercase text-center tracking-wider">
              Membros Oficiais — Entrar de Forma Segura
            </span>
            
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => handleAutoProvision('Karine', 'ADMIN')}
                className="text-left bg-gray-50 border border-gray-200 hover:border-blue-200 p-2 rounded-lg flex items-center gap-2 group transition text-xs"
                disabled={isLoading}
              >
                <div className="h-7 w-7 rounded bg-red-50 text-red-600 font-bold text-xs flex items-center justify-center shrink-0">
                  KA
                </div>
                <div>
                  <span className="block font-bold text-gray-800 leading-none group-hover:text-blue-900">Karine</span>
                  <span className="text-[9px] text-red-600 font-black uppercase leading-none block mt-1">Admin</span>
                </div>
              </button>

              <button
                onClick={() => handleAutoProvision('Agenor', 'ADMIN')}
                className="text-left bg-gray-50 border border-gray-200 hover:border-blue-200 p-2 rounded-lg flex items-center gap-2 group transition text-xs"
                disabled={isLoading}
              >
                <div className="h-7 w-7 rounded bg-red-50 text-red-600 font-bold text-xs flex items-center justify-center shrink-0">
                  AG
                </div>
                <div>
                  <span className="block font-bold text-gray-800 leading-none group-hover:text-blue-900">Agenor</span>
                  <span className="text-[9px] text-red-600 font-black uppercase leading-none block mt-1">Admin</span>
                </div>
              </button>

              <button
                onClick={() => handleAutoProvision('Miller', 'USER')}
                className="text-left bg-gray-50 border border-gray-200 hover:border-blue-200 p-2 rounded-lg flex items-center gap-2 group transition text-xs"
                disabled={isLoading}
              >
                <div className="h-7 w-7 rounded bg-blue-50 text-blue-600 font-bold text-xs flex items-center justify-center shrink-0">
                  MI
                </div>
                <div>
                  <span className="block font-bold text-gray-800 leading-none group-hover:text-blue-900">Miller</span>
                  <span className="text-[9px] text-blue-600 font-black uppercase leading-none block mt-1">Operador</span>
                </div>
              </button>

              <button
                onClick={() => handleAutoProvision('Daniel', 'USER')}
                className="text-left bg-gray-50 border border-gray-200 hover:border-blue-200 p-2 rounded-lg flex items-center gap-2 group transition text-xs"
                disabled={isLoading}
              >
                <div className="h-7 w-7 rounded bg-blue-50 text-blue-600 font-bold text-xs flex items-center justify-center shrink-0">
                  DA
                </div>
                <div>
                  <span className="block font-bold text-gray-800 leading-none group-hover:text-blue-900">Daniel</span>
                  <span className="text-[9px] text-blue-600 font-black uppercase leading-none block mt-1">Operador</span>
                </div>
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
