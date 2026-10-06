// src/components/Navbar.tsx
import React, { useState } from 'react';
import { 
  LayoutDashboard, Calendar, BarChart3, FolderGit2, CalendarRange, 
  Settings, Volume2, VolumeX, Eye, ShieldAlert,
  ChevronLeft, ChevronRight, Menu, X, Sparkles, UserCheck
} from 'lucide-react';
import { User, TeamSettings } from '../types';

interface NavbarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  soundEnabled: boolean;
  toggleSound: () => void;
  isFocoActive: boolean;
  setIsFocoActive: (active: boolean) => void;
  isReadOnly?: boolean;
  currentUser: User;
  setCurrentUser: (user: User) => void;
  users: User[];
  teamSettings: TeamSettings;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  setCurrentTab,
  soundEnabled,
  toggleSound,
  isFocoActive,
  setIsFocoActive,
  isReadOnly = false,
  currentUser,
  setCurrentUser,
  users,
  teamSettings
}) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  // Mapeamento dos itens de navegação estrutural redefinidos
  const navItems = [
    { id: 'dashboard', label: 'Início', icon: LayoutDashboard },
    { id: 'agenda', label: 'Agenda do Dia', icon: Calendar },
    { id: 'bis', label: 'BIs', icon: BarChart3 },
    { id: 'directories', label: 'Diretórios', icon: FolderGit2 },
    { id: 'marcos', label: 'Marcos do Mês', icon: CalendarRange },
    ...(currentUser.role === 'ADMIN' ? [{ id: 'admin', label: 'Administração', icon: ShieldAlert }] : []),
    ...(!isReadOnly ? [{ id: 'config', label: 'Configurações', icon: Settings }] : [])
  ];

  const handleTabClick = (tabId: string) => {
    setCurrentTab(tabId);
    setIsFocoActive(false);
    setIsMobileOpen(false);
  };

  const handleUserChange = (userId: string) => {
    const selected = users.find(u => u.id === userId);
    if (selected) {
      setCurrentUser(selected);
      // Ao trocar de usuário operacional, reseta para aba Início por segurança
      setCurrentTab('dashboard');
    }
  };

  // Renderizador do Logotipo customizado ou do placeholder elegante Optimus BI
  const TeamLogoRenderer: React.FC<{ showText: boolean }> = ({ showText }) => {
    return (
      <div className="flex items-center gap-2 select-none">
        {teamSettings.logoUrl ? (
          <img 
            src={teamSettings.logoUrl} 
            alt={teamSettings.logoAlt} 
            className="h-10 w-10 object-contain rounded-lg border border-white/20 bg-white/10" 
          />
        ) : (
          <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-[#F21D2F] to-[#0339A6] flex items-center justify-center text-white font-black text-sm font-sora shadow-md">
            RI
          </div>
        )}
        {showText && (
          <div className="flex flex-col leading-none">
            <span 
              className="text-white font-extrabold text-sm font-sora tracking-tight uppercase"
              style={{ letterSpacing: '-0.02em' }}
            >
              Optimus BI
            </span>
            <span className="text-[9px] text-[#F2B705] font-black uppercase tracking-widest mt-0.5">Rotina Inteligente</span>
          </div>
        )}
      </div>
    );
  };

  return (
    <>
      {/* Mobile Sticky Header */}
      <div className="lg:hidden sticky top-0 z-40 bg-[#0339A6] text-white h-16 px-4 flex items-center justify-between shadow-md border-b border-[#022b80]">
        <div className="flex items-center gap-2">
          <TeamLogoRenderer showText={true} />
        </div>
        <div className="flex items-center gap-3">
          {/* Mobile Profile Switcher */}
          <select
            value={currentUser.id}
            onChange={(e) => handleUserChange(e.target.value)}
            className="bg-white/10 text-white text-[11px] font-bold border border-white/20 rounded px-2 py-1 max-w-[80px] focus:outline-none"
          >
            {users.map(u => (
              <option key={u.id} value={u.id} className="text-gray-900 font-bold">{u.nome}</option>
            ))}
          </select>

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
                        : 'text-blue-100 hover:bg-[#022b80] hover:text-[#F2B705]'
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
        <div className="flex flex-col animate-fade-in">
          {/* Header & Toggle */}
          <div className="h-16 flex items-center justify-between px-3 border-b border-[#022b80]">
            <div className="flex items-center overflow-hidden">
              <TeamLogoRenderer showText={isExpanded} />
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
        <div className="p-3 border-t border-[#022b80] flex flex-col gap-2.5 bg-[#022b80]/30 animate-fade-in">
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

          {/* Sound, Status line & Profile switcher */}
          <div className={`flex flex-col gap-2 ${isExpanded ? 'px-1' : 'items-center'}`}>
            {isExpanded ? (
              <div className="space-y-1">
                <span className="text-[10px] text-blue-200 font-bold uppercase tracking-wider block">👤 Selecionar Usuário</span>
                <select
                  value={currentUser.id}
                  onChange={(e) => handleUserChange(e.target.value)}
                  className="w-full bg-[#122A44] text-white text-xs font-extrabold border border-white/10 rounded px-2.5 py-1.5 focus:outline-none"
                >
                  {users.map(u => (
                    <option key={u.id} value={u.id} className="text-gray-900 font-bold">
                      {u.nome} ({u.role})
                    </option>
                  ))}
                </select>
              </div>
            ) : (
              <div className="relative group">
                <div className="h-8 w-8 rounded-full bg-[#122A44] border border-white/20 flex items-center justify-center font-bold text-xs cursor-pointer text-[#F2B705]">
                  {currentUser.nome.substring(0, 2).toUpperCase()}
                </div>
              </div>
            )}

            <div className="flex items-center justify-between w-full mt-1">
              {isExpanded && (
                <span className="text-[9px] text-[#F2B705] font-black tracking-widest uppercase">Optimus BI</span>
              )}
              <button
                onClick={toggleSound}
                className="p-1.5 rounded-md bg-white/10 hover:bg-white/20 text-white transition border border-white/10"
                title={soundEnabled ? 'Silenciar alertas' : 'Habilitar som'}
              >
                {soundEnabled ? <Volume2 className="h-3.5 w-3.5 text-[#F2B705]" /> : <VolumeX className="h-3.5 w-3.5 opacity-50" />}
              </button>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};
