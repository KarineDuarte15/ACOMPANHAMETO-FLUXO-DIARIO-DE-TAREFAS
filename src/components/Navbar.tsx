import React, { useState } from 'react';
import { 
  LayoutDashboard, Calendar, BarChart3, FolderGit2, CalendarRange, 
  RotateCw, History, FileText, Settings, Volume2, VolumeX, Eye, 
  ChevronLeft, ChevronRight, Menu, X, Sparkles
} from 'lucide-react';

interface NavbarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  soundEnabled: boolean;
  toggleSound: () => void;
  isFocoActive: boolean;
  setIsFocoActive: (active: boolean) => void;
  isReadOnly?: boolean;
}

// Logo Corporativa da Hapvida vetorizada de alta definição
const HapvidaLogo: React.FC<{ showText: boolean }> = ({ showText }) => {
  return (
    <div className="flex items-center gap-2 select-none">
      <svg viewBox="0 0 45 45" className="h-10 w-10 flex-shrink-0 animate-fade-in" style={{ transform: 'translateY(1px)' }}>
        <g transform="translate(22.5, 22.5) scale(0.72)">
          {/* Top Petal (Red) */}
          <path d="M0,0 C-6,-15 -6,-28 0,-28 C6,-28 6,-15 0,0 Z" fill="#F21D2F" />
          {/* Right-Up Petal (Orange) */}
          <path d="M0,0 C12,-11 22,-17 25,-11 C28,-5 18,1 0,0 Z" fill="#F25C05" />
          {/* Left-Up Petal (Orange) */}
          <path d="M0,0 C-12,-11 -22,-17 -25,-11 C-28,-5 -18,1 0,0 Z" fill="#F25C05" />
          {/* Right-Down Petal (Yellow-Orange) */}
          <path d="M0,0 C15,5 24,11 21,17 C18,23 9,17 0,0 Z" fill="#F2B705" />
          {/* Left-Down Petal (Yellow-Orange) */}
          <path d="M0,0 C-15,5 -24,11 -21,17 C-18,23 -9,17 0,0 Z" fill="#F2B705" />
          {/* Central circle */}
          <circle cx="0" cy="0" r="1.5" fill="#0339A6" />
        </g>
      </svg>
      {showText && (
        <span 
          className="text-white font-extrabold text-xl italic font-sora tracking-tight"
          style={{ letterSpacing: '-0.06em' }}
        >
          Hapvida
        </span>
      )}
    </div>
  );
};

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  setCurrentTab,
  soundEnabled,
  toggleSound,
  isFocoActive,
  setIsFocoActive,
  isReadOnly = false
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const navItems = [
    { id: 'dashboard', label: 'Início', icon: LayoutDashboard },
    { id: 'agenda', label: 'Agenda do Dia', icon: Calendar },
    { id: 'bis', label: 'BIs', icon: BarChart3 },
    { id: 'directories', label: 'Diretórios', icon: FolderGit2 },
    { id: 'marcos', label: 'Marcos do Mês', icon: CalendarRange },
    { id: 'ciclos', label: 'Ciclos', icon: RotateCw },
    { id: 'history', label: 'Histórico', icon: History },
    { id: 'reports', label: 'Relatórios', icon: FileText },
    ...(!isReadOnly ? [{ id: 'config', label: 'Configurações', icon: Settings }] : [])
  ];

  const handleTabClick = (tabId: string) => {
    setCurrentTab(tabId);
    setIsFocoActive(false);
    setIsMobileOpen(false);
  };

  return (
    <>
      {/* Mobile Sticky Header */}
      <div className="lg:hidden sticky top-0 z-40 bg-[#0339A6] text-white h-16 px-4 flex items-center justify-between shadow-md border-b border-[#022b80]">
        <div className="flex items-center gap-2">
          <HapvidaLogo showText={true} />
        </div>
        <div className="flex items-center gap-2">
          {/* Sound Toggle */}
          <button
            onClick={toggleSound}
            className="p-1.5 rounded bg-white/10 text-white transition hover:bg-white/20"
            title={soundEnabled ? 'Silenciar' : 'Ativar som'}
          >
            {soundEnabled ? <Volume2 className="h-4 w-4 text-[#F2B705]" /> : <VolumeX className="h-4 w-4 opacity-50" />}
          </button>
          {/* Menu Button */}
          <button
            onClick={() => setIsMobileOpen(!isMobileOpen)}
            className="p-1.5 rounded bg-white/10 text-white hover:bg-white/20 transition"
          >
            {isMobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Navigation */}
      {isMobileOpen && (
        <div className="lg:hidden fixed inset-0 z-30 bg-black/50 backdrop-blur-sm" onClick={() => setIsMobileOpen(false)}>
          <div 
            className="absolute top-16 left-0 bottom-0 w-64 bg-[#0339A6] text-white shadow-xl flex flex-col justify-between py-4"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex flex-col gap-1 px-2">
              {navItems.map(item => {
                const Icon = item.icon;
                const isActive = currentTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleTabClick(item.id)}
                    className={`flex items-center gap-3 w-full px-4 py-3 rounded-lg text-sm font-semibold transition duration-150 ${
                      isActive 
                        ? 'bg-[#122A44] text-[#F2B705] border-l-4 border-[#F2B705]' 
                        : 'text-blue-100 hover:bg-[#022b80] hover:text-[#F2B705] hover:scale-102'
                    }`}
                  >
                    <Icon className="h-4 w-4 flex-shrink-0" />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Bottom buttons mobile */}
            <div className="px-4 border-t border-[#022b80] pt-4 flex flex-col gap-2">
              <button
                onClick={() => {
                  setIsFocoActive(!isFocoActive);
                  setIsMobileOpen(false);
                }}
                className={`flex items-center justify-center gap-2 w-full py-2.5 rounded-lg text-xs font-bold transition ${
                  isFocoActive ? 'bg-[#F21D2F] text-white' : 'bg-white/10 text-white'
                }`}
              >
                <Eye className="h-4 w-4" />
                <span>{isFocoActive ? 'SAIR DO MODO FOCO' : 'MODO FOCO'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Desktop Sidebar Navigation */}
      <aside 
        className={`hidden lg:flex flex-col justify-between sticky top-0 h-screen bg-[#0339A6] text-white transition-all duration-300 shadow-xl border-r border-[#022b80] flex-shrink-0 z-40 ${
          isExpanded ? 'w-64' : 'w-20'
        }`}
        id="sidebar-navigation"
      >
        <div className="flex flex-col">
          {/* Header & Toggle */}
          <div className="h-16 flex items-center justify-between px-3 border-b border-[#022b80]">
            <div className="flex items-center overflow-hidden">
              <HapvidaLogo showText={isExpanded} />
            </div>
            
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-1.5 rounded-md hover:bg-[#022b80] text-blue-200 hover:text-white transition"
              title={isExpanded ? "Recolher menu" : "Expandir menu"}
            >
              {isExpanded ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
            </button>
          </div>

          {/* Nav Items */}
          <div className="flex flex-col gap-1 px-2.5 py-4">
            {navItems.map(item => {
              const Icon = item.icon;
              const isActive = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleTabClick(item.id)}
                  title={!isExpanded ? item.label : undefined}
                  className={`flex items-center rounded-lg py-3 px-4 font-semibold text-sm transition-all duration-200 transform hover:scale-105 hover:text-[#F2B705] ${
                    isActive 
                      ? 'bg-[#122A44] text-[#F2B705] border-l-4 border-[#F2B705] shadow-inner' 
                      : 'text-blue-100 hover:bg-[#022b80]'
                  } ${isExpanded ? 'gap-4 w-full justify-start' : 'justify-center w-full'}`}
                  style={{ transformOrigin: 'left center' }}
                >
                  <Icon className="h-5 w-5 flex-shrink-0" />
                  {isExpanded && <span className="truncate">{item.label}</span>}
                </button>
              );
            })}
          </div>
        </div>

        {/* Desktop Sidebar Footer */}
        <div className="p-3 border-t border-[#022b80] flex flex-col gap-2.5 bg-[#022b80]/30">
          {/* Foco mode trigger */}
          <button
            onClick={() => setIsFocoActive(!isFocoActive)}
            className={`flex items-center justify-center gap-2 w-full rounded-lg py-2.5 text-xs font-bold transition duration-200 ${
              isFocoActive 
                ? 'bg-[#F21D2F] text-white shadow-md animate-pulse' 
                : 'bg-white/10 text-white hover:bg-white/20 border border-white/20'
            }`}
            title="Ativar Modo Foco (Tela simplificada sem distrações)"
          >
            <Eye className="h-4 w-4 flex-shrink-0" />
            {isExpanded && <span>{isFocoActive ? 'MODO FOCO ATIVO' : 'MODO FOCO'}</span>}
          </button>

          {/* Sound & Status line */}
          <div className={`flex items-center justify-between ${isExpanded ? 'px-1' : 'justify-center'}`}>
            {isExpanded && (
              <span className="text-[10px] text-blue-200 font-medium">
                Operador: <strong className="text-white">Karine</strong>
              </span>
            )}
            <button
              onClick={toggleSound}
              className="p-1.5 rounded-md bg-white/10 hover:bg-white/20 text-white transition border border-white/10"
              title={soundEnabled ? 'Silenciar chimes corporativos' : 'Habilitar alertas de áudio'}
            >
              {soundEnabled ? <Volume2 className="h-3.5 w-3.5 text-[#F2B705]" /> : <VolumeX className="h-3.5 w-3.5 opacity-50" />}
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};
