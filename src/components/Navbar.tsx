import React from 'react';
import { LayoutDashboard, Calendar, BarChart2, History, Settings, Volume2, VolumeX, Eye, FolderTree, Coffee, Users, UserMinus } from 'lucide-react';

interface NavbarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  soundEnabled: boolean;
  toggleSound: () => void;
  isFocoActive: boolean;
  setIsFocoActive: (active: boolean) => void;
  activePause: string | null;
  setActivePause: (pause: string | null) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  setCurrentTab,
  soundEnabled,
  toggleSound,
  isFocoActive,
  setIsFocoActive,
  activePause,
  setActivePause
}) => {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'agenda', label: 'Agenda do Dia', icon: Calendar },
    { id: 'caminhos', label: 'Diretórios', icon: FolderTree },
    { id: 'produtividade', label: 'Produtividade', icon: BarChart2 },
    { id: 'historico', label: 'Histórico', icon: History },
    { id: 'configuracoes', label: 'Configurações', icon: Settings }
  ];

  return (
    <nav className="sticky top-0 z-40 bg-[#0339A6] text-white shadow-lg border-b border-[#022b80] px-4 md:px-8">
      <div className="max-w-7xl mx-auto flex items-center justify-between h-16">
        
        {/* Logo */}
        <div className="flex items-center gap-2">
          <div className="bg-[#F21D2F] text-white font-black text-xl px-3 py-1 rounded-lg tracking-wider font-sora shadow-md flex items-center gap-1.5">
            R<span className="text-xs font-semibold bg-[#0339A6] text-white px-1 py-0.5 rounded">INT</span>
          </div>
          <div className="hidden sm:block">
            <span className="font-sora font-extrabold text-sm tracking-tight block leading-none">Rotina Inteligente</span>
            <span className="text-[10px] text-blue-200 block mt-0.5">Copiloto de Produtividade</span>
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
                  setIsFocoActive(false);
                }}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-semibold transition ${
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

        {/* Global Controls & Pauses */}
        <div className="flex items-center gap-2">
          
          {/* Botões de Pausa */}
          <div className="flex bg-[#122A44] rounded-lg p-1 border border-blue-900/50 mr-2">
            <button
              onClick={() => setActivePause(activePause === 'Café/Banheiro' ? null : 'Café/Banheiro')}
              className={`p-1.5 rounded text-xs transition ${activePause === 'Café/Banheiro' ? 'bg-[#F2B705] text-gray-900' : 'text-white hover:bg-white/10'}`}
              title="Pausa curta (Café/Banheiro)"
            >
              <Coffee className="h-4 w-4" />
            </button>
            <button
              onClick={() => setActivePause(activePause === 'Reunião' ? null : 'Reunião')}
              className={`p-1.5 rounded text-xs transition ${activePause === 'Reunião' ? 'bg-[#F21D2F] text-white' : 'text-white hover:bg-white/10'}`}
              title="Em Reunião"
            >
              <Users className="h-4 w-4" />
            </button>
            <button
              onClick={() => setActivePause(activePause === 'Almoço' ? null : 'Almoço')}
              className={`p-1.5 rounded text-xs transition ${activePause === 'Almoço' ? 'bg-green-500 text-white' : 'text-white hover:bg-white/10'}`}
              title="Horário de Almoço"
            >
              <UserMinus className="h-4 w-4" />
            </button>
          </div>

          {/* Botão de Foco */}
          <button
            onClick={() => setIsFocoActive(!isFocoActive)}
            className={`hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition shadow ${
              isFocoActive
                ? 'bg-[#F21D2F] text-white animate-pulse'
                : 'bg-white/10 text-white hover:bg-white/20 border border-white/20'
            }`}
          >
            <Eye className="h-3.5 w-3.5" />
            <span>{isFocoActive ? 'MODO FOCO' : 'FOCO'}</span>
          </button>

          {/* Controle de Som */}
          <button
            onClick={toggleSound}
            className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white transition border border-white/10"
          >
            {soundEnabled ? <Volume2 className="h-4 w-4 text-[#F2B705]" /> : <VolumeX className="h-4 w-4 opacity-55" />}
          </button>
        </div>
      </div>
    </nav>
  );
};