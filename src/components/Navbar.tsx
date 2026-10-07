import React, { useState } from 'react';
import { 
  LayoutDashboard, Calendar, BarChart3, FolderGit2, CalendarRange, 
  Settings, Volume2, VolumeX, Eye, ChevronLeft, ChevronRight, Menu, X, 
  ShieldAlert, Sliders, ToggleLeft, ToggleRight
} from 'lucide-react';
import { SystemConfig } from '../types';

interface NavbarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  soundEnabled: boolean;
  toggleSound: () => void;
  isFocoActive: boolean;
  setIsFocoActive: (active: boolean) => void;
  isReadOnly?: boolean;
  brand: SystemConfig['teamBrand'];
  role: 'ADMIN' | 'OPERACIONAL';
  onChangeRole: (newRole: 'ADMIN' | 'OPERACIONAL') => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  setCurrentTab,
  soundEnabled,
  toggleSound,
  isFocoActive,
  setIsFocoActive,
  isReadOnly = false,
  brand,
  role,
  onChangeRole
}) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  // Filtro de abas de acordo com o escopo Optimus BI
  const navItems = [
    { id: 'dashboard', label: 'Início', icon: LayoutDashboard },
    { id: 'agenda', label: 'Agenda do Dia', icon: Calendar },
    { id: 'bis', label: 'BIs', icon: BarChart3 },
    { id: 'directories', label: 'Diretórios', icon: FolderGit2 },
    { id: 'marcos', label: 'Marcos do Mês', icon: CalendarRange },
    ...(role === 'ADMIN' ? [{ id: 'admin', label: 'Administração', icon: Sliders }] : []),
    ...(!isReadOnly ? [{ id: 'config', label: 'Configurações', icon: Settings }] : [])
  ];

  const handleTabClick = (tabId: string) => {
    setCurrentTab(tabId);
    setIsFocoActive(false);
    setIsMobileOpen(false);
  };

  const primaryBg = brand?.primaryColor || '#0339A6';
  const secondaryColor = brand?.secondaryColor || '#F2B705';

  const renderLogo = (isCompact: boolean) => {
    const logoUrl = isCompact ? brand?.logoCompact || brand?.logo : brand?.logo;
    
    if (logoUrl) {
      return (
        <div className="flex items-center gap-2.5 select-none py-1 min-w-0">
          <img 
            src={logoUrl} 
            alt={brand?.name || "Optimus BI Logo"} 
            className={`${isCompact ? 'h-8 w-8 object-contain' : 'h-10 max-w-[120px] object-contain'} rounded animate-fade-in shrink-0`} 
          />
          {!isCompact && (
            <div className="flex flex-col min-w-0">
              <span className="text-white font-black text-sm font-sora leading-none truncate max-w-[120px]">{brand?.name || "OPTIMUS BI"}</span>
              <span className="text-blue-200 text-[9px] font-bold tracking-wide mt-1 leading-none truncate max-w-[120px]">{brand?.subtitle || "Rotina Inteligente"}</span>
            </div>
          )}
        </div>
      );
    }

    // Fallback textual elegante
    return (
      <div className="flex items-center gap-2.5 select-none py-1 min-w-0">
        <div 
          className="h-9 w-9 rounded-lg flex items-center justify-center font-black text-xs shadow-inner shrink-0"
          style={{ backgroundColor: secondaryColor, color: '#000000' }}
        >
          {brand?.name ? brand.name.substring(0, 2).toUpperCase() : "OP"}
        </div>
        {!isCompact && (
          <div className="flex flex-col min-w-0">
            <span className="text-white font-black text-xs font-sora leading-none tracking-tight truncate max-w-[120px]">
              {brand?.name || "OPTIMUS BI"}
            </span>
            <span className="text-blue-200 text-[8px] font-bold tracking-wide mt-1 leading-none truncate max-w-[120px]">
              {brand?.subtitle || "Rotina Inteligente"}
            </span>
          </div>
        )}
      </div>
    );
  };

  return (
    <>
      {/* Mobile Sticky Header */}
      <div 
        className="lg:hidden sticky top-0 z-40 text-white h-16 px-4 flex items-center justify-between shadow-md border-b"
        style={{ backgroundColor: primaryBg, borderColor: `${primaryBg}d0` }}
      >
        <div className="flex items-center gap-2">
          {renderLogo(false)}
        </div>
        <div className="flex items-center gap-2">
          {/* Sound Toggle */}
          <button
            onClick={toggleSound}
            className="p-1.5 rounded bg-white/10 text-white transition hover:bg-white/20"
            title={soundEnabled ? 'Silenciar' : 'Ativar som'}
          >
            {soundEnabled ? <Volume2 className="h-4 w-4" style={{ color: secondaryColor }} /> : <VolumeX className="h-4 w-4 opacity-50" />}
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
            className="absolute top-16 left-0 bottom-0 w-64 text-white shadow-xl flex flex-col justify-between py-4"
            style={{ backgroundColor: primaryBg }}
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
                        ? 'bg-[#122A44] text-white border-l-4' 
                        : 'text-blue-100 hover:bg-[#022b80]'
                    }`}
                    style={isActive ? { borderLeftColor: secondaryColor } : {}}
                  >
                    <Icon className="h-4 w-4 flex-shrink-0" />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Bottom buttons mobile */}
            <div className="px-4 border-t pt-4 flex flex-col gap-3" style={{ borderColor: `${primaryBg}d0` }}>
              {/* Role Toggle Switch */}
              <div className="flex flex-col gap-1 bg-black/20 p-2.5 rounded-lg">
                <span className="text-[9px] uppercase tracking-wider text-blue-200 font-bold block">Perfil Selecionado</span>
                <div className="flex items-center justify-between mt-1">
                  <span className="text-xs font-black">{role === 'ADMIN' ? 'Administrador ⚙️' : 'Karine 👩‍💻'}</span>
                  <button 
                    onClick={() => {
                      onChangeRole(role === 'ADMIN' ? 'OPERACIONAL' : 'ADMIN');
                      setIsMobileOpen(false);
                    }}
                    className="p-1 rounded bg-white/10 hover:bg-white/20 text-white"
                  >
                    Alternar
                  </button>
                </div>
              </div>

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
        className={`hidden lg:flex flex-col justify-between sticky top-0 h-screen text-white transition-all duration-300 shadow-xl border-r flex-shrink-0 z-40 ${
          isExpanded ? 'w-64' : 'w-20'
        }`}
        style={{ backgroundColor: primaryBg, borderColor: `${primaryBg}d0` }}
        id="sidebar-navigation"
      >
        <div className="flex flex-col">
          {/* Header & Toggle */}
          <div className="h-20 flex items-center justify-between px-4 border-b" style={{ borderColor: `${primaryBg}d0` }}>
            <div className="flex items-center min-w-0 flex-1 mr-1">
              {renderLogo(!isExpanded)}
            </div>
            
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-1.5 rounded-md hover:bg-white/10 text-blue-200 hover:text-white transition"
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
                  className={`flex items-center rounded-lg py-2.5 px-4 font-semibold text-sm transition-all duration-200 transform hover:scale-105 ${
                    isActive 
                      ? 'bg-[#122A44] text-white border-l-4 shadow-inner' 
                      : 'text-blue-100 hover:bg-white/10'
                  } ${isExpanded ? 'gap-4 w-full justify-start' : 'justify-center w-full'}`}
                  style={{ 
                    transformOrigin: 'left center',
                    borderLeftColor: isActive ? secondaryColor : undefined
                  }}
                >
                  <Icon className="h-5 w-5 flex-shrink-0" />
                  {isExpanded && <span className="truncate">{item.label}</span>}
                </button>
              );
            })}
          </div>
        </div>

        {/* Desktop Sidebar Footer */}
        <div className="p-3 border-t flex flex-col gap-2.5 bg-black/10" style={{ borderColor: `${primaryBg}d0` }}>
          {/* Role Switcher Widget (AUTHENTICATION REQUIRED IN PRODUCTION) */}
          <div className="flex flex-col gap-1.5 bg-black/20 p-2.5 rounded-lg border border-white/5">
            {isExpanded ? (
              <>
                <div className="flex items-center justify-between">
                  <span className="text-[8px] uppercase tracking-wider text-blue-200 font-extrabold">Modo Dev / Acesso</span>
                  <span className="text-[7px] text-red-300 font-bold leading-none bg-red-950/40 px-1 py-0.5 rounded border border-red-900/50">DEV</span>
                </div>
                <div className="flex items-center justify-between mt-1">
                  <span className="text-[11px] font-black tracking-tight leading-none">
                    {role === 'ADMIN' ? 'Gestão / Admin 🛡️' : 'Karine (Operador) 👩‍💻'}
                  </span>
                  <button
                    onClick={() => onChangeRole(role === 'ADMIN' ? 'OPERACIONAL' : 'ADMIN')}
                    className="text-[9px] font-bold px-2 py-1 rounded bg-white/15 hover:bg-white/25 border border-white/10 transition leading-none shrink-0"
                    title="Alternar Perfil Operacional x Administrador para testes rápidos"
                  >
                    Trocar
                  </button>
                </div>
              </>
            ) : (
              <button
                onClick={() => onChangeRole(role === 'ADMIN' ? 'OPERACIONAL' : 'ADMIN')}
                className="w-full flex justify-center text-white/70 hover:text-white"
                title={role === 'ADMIN' ? 'Trocar para Operador' : 'Trocar para Administrador'}
              >
                {role === 'ADMIN' ? <Sliders className="h-4 w-4" /> : <ToggleLeft className="h-4 w-4 text-green-300" />}
              </button>
            )}
          </div>

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
                Usuária: <strong className="text-white">{role === 'ADMIN' ? 'Gestor' : 'Karine'}</strong>
              </span>
            )}
            <button
              onClick={toggleSound}
              className="p-1.5 rounded-md bg-white/10 hover:bg-white/20 text-white transition border border-white/10"
              title={soundEnabled ? 'Silenciar chimes corporativos' : 'Habilitar alertas de áudio'}
            >
              {soundEnabled ? <Volume2 className="h-3.5 w-3.5" style={{ color: secondaryColor }} /> : <VolumeX className="h-3.5 w-3.5 opacity-50" />}
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};
