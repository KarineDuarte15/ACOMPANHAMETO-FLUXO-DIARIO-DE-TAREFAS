import React from 'react';
import { LayoutDashboard, Calendar, BarChart2, History, Settings, Volume2, VolumeX, Eye, HelpCircle } from 'lucide-react';

interface NavbarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  soundEnabled: boolean;
  toggleSound: () => void;
  isFocoActive: boolean;
  setIsFocoActive: (active: boolean) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  setCurrentTab,
  soundEnabled,
  toggleSound,
  isFocoActive,
  setIsFocoActive
}) => {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'agenda', label: 'Agenda do Dia', icon: Calendar },
    { id: 'produtividade', label: 'Produtividade', icon: BarChart2 },
    { id: 'historico', label: 'Histórico', icon: History },
    { id: 'configuracoes', label: 'Configurações', icon: Settings }
  ];

  return (
    <nav className="sticky top-0 z-40 bg-[#0339A6] text-white shadow-lg border-b border-[#022b80] px-4 md:px-8">
      <div className="max-w-7xl mx-auto flex items-center justify-between h-16">
        
        {/* Brand / Logo */}
        <div className="flex items-center gap-2">
          <div className="bg-[#F21D2F] text-white font-black text-xl px-3 py-1 rounded-lg tracking-wider font-sora shadow-md flex items-center gap-1.5">
            R<span className="text-xs font-semibold bg-[#0339A6] text-white px-1 py-0.5 rounded">INT</span>
          </div>
          <div className="hidden sm:block">
            <span className="font-sora font-extrabold text-sm tracking-tight block leading-none">Rotina Inteligente</span>
            <span className="text-[10px] text-blue-200 block mt-0.5">Copiloto de Produtividade · Karine</span>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="hidden lg:flex items-center gap-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setCurrentTab(item.id);
                  setIsFocoActive(false); // turn off focus mode when shifting tabs
                }}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold transition ${
                  isActive
                    ? 'bg-[#122A44] text-[#F2B705] shadow-inner border-b-2 border-[#F2B705]'
                    : 'text-blue-100 hover:bg-[#022b80] hover:text-white'
                }`}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </button>
            );
          })}
        </div>

        {/* Global Controls */}
        <div className="flex items-center gap-2">
          {/* Foco Mode Button */}
          <button
            onClick={() => setIsFocoActive(!isFocoActive)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition shadow ${
              isFocoActive
                ? 'bg-[#F21D2F] text-white animate-pulse'
                : 'bg-white/10 text-white hover:bg-white/20 border border-white/20'
            }`}
            title="Ativar Modo Foco (Tela simplificada sem distrações)"
          >
            <Eye className="h-3.5 w-3.5" />
            <span>{isFocoActive ? 'MODO FOCO ATIVO' : 'MODO FOCO'}</span>
          </button>

          {/* Sound Controls */}
          <button
            onClick={toggleSound}
            className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white transition border border-white/10"
            title={soundEnabled ? 'Notificações por som ativas' : 'Notificações por som desativadas'}
          >
            {soundEnabled ? <Volume2 className="h-4 w-4 text-[#F2B705]" /> : <VolumeX className="h-4 w-4 opacity-55" />}
          </button>
        </div>

      </div>

      {/* Mobile Navigation Bar */}
      <div className="lg:hidden flex justify-around border-t border-[#022b80] py-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.id && !isFocoActive;
          return (
            <button
              key={item.id}
              onClick={() => {
                setCurrentTab(item.id);
                setIsFocoActive(false);
              }}
              className={`flex flex-col items-center gap-0.5 py-1 px-3 rounded-md transition text-[10px] font-bold ${
                isActive ? 'text-[#F2B705]' : 'text-blue-200 hover:text-white'
              }`}
            >
              <Icon className="h-4 w-4" />
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
