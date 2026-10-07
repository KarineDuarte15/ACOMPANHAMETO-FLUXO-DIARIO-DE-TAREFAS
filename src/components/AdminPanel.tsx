import React, { useState, useMemo } from 'react';
import { 
  Activity, Execution, Directory, SystemConfig, PriorityConfig, LogConfig, 
  AppState, ExecutionStatus
} from '../types';
import { 
  Shield, Users, Plus, Edit, Trash2, Sliders, RefreshCw, Layers, Clock, 
  Folder, Heart, CheckCircle2, AlertTriangle, XCircle, Info, LayoutGrid, 
  FileText, Activity as ActivityIcon, Upload, ArrowRight, GitFork, 
  Eye, CornerDownRight, CheckSquare, Search, Play, FileCheck, Check, BarChart3
} from 'lucide-react';

interface AdminPanelProps {
  appState: AppState;
  setAppState: React.Dispatch<React.SetStateAction<AppState>>;
  onSaveConfig: (updatedState: AppState) => void;
}

type AdminSubTab = 
  | 'visao_geral' 
  | 'atividades' 
  | 'bis' 
  | 'horarios' 
  | 'dependencias' 
  | 'ciclos_marcos' 
  | 'diretorios' 
  | 'identidade_visual' 
  | 'monitoramento' 
  | 'logs';

export const AdminPanel: React.FC<AdminPanelProps> = ({
  appState,
  setAppState,
  onSaveConfig
}) => {
  const [activeSubTab, setActiveSubTab] = useState<AdminSubTab>('visao_geral');
  const [searchTerm, setSearchTerm] = useState('');
  
  // States for CRUD Forms
  const [selectedActivityId, setSelectedActivityId] = useState<string | null>(null);
  const [isActivityFormOpen, setIsActivityFormOpen] = useState(false);
  const [activityForm, setActivityForm] = useState<Partial<Activity>>({});

  // States for Directory CRUD
  const [selectedDirId, setSelectedDirId] = useState<string | null>(null);
  const [isDirFormOpen, setIsDirFormOpen] = useState(false);
  const [dirForm, setDirForm] = useState<Partial<Directory>>({});

  // Active inputs / local states for branding
  const [brandForm, setBrandForm] = useState(appState.systemConfig?.teamBrand || {
    name: "Optimus BI",
    subtitle: "Rotina Inteligente",
    primaryColor: "#0339A6",
    secondaryColor: "#F2B705",
    logo: "",
    logoCompact: ""
  });

  // Extract from state
  const activities = appState.activities || [];
  const executions = appState.executions || [];
  const directories = appState.directories || [];
  const systemConfig = appState.systemConfig || {
    teamBrand: { name: "Optimus BI", subtitle: "Rotina Inteligente", primaryColor: "#0339A6", secondaryColor: "#F2B705" },
    monitoring: { enabled: true, intervalMinutes: 30, mode: 'MOCK' as const },
    user: { name: "Karine", role: "OPERACIONAL" as const }
  };
  const priorities = appState.priorities || [];
  const logs = appState.logs || [];

  // ==========================================
  // CALCULOS E MÉTRICAS
  // ==========================================
  
  // Atividades estatísticas
  const totalActivities = activities.length;
  const activeActivities = activities.filter(a => a.ativo).length;
  const activeBIs = activities.filter(a => a.categoria === 'BI' && a.ativo).length;

  // Prioridades counts
  const countP0 = activities.filter(a => a.prioridade === 'P0' && a.ativo).length;
  const countP1 = activities.filter(a => a.prioridade === 'P1' && a.ativo).length;
  const countP2 = activities.filter(a => a.prioridade === 'P2' && a.ativo).length;
  const countP3 = activities.filter(a => a.prioridade === 'P3' && a.ativo).length;

  // Frequencias
  const countDiarias = activities.filter(a => a.frequencia === 'DIARIA' && a.ativo).length;
  const countSemanais = activities.filter(a => a.frequencia === 'SEMANAL' && a.ativo).length;
  const countQuinzenais = activities.filter(a => a.frequencia === 'QUINZENAL' && a.ativo).length;
  const countMensais = activities.filter(a => a.frequencia === 'MENSAL' && a.ativo).length;
  const countSobDemanda = activities.filter(a => a.frequencia === 'SOB_DEMANDA' && a.ativo).length;

  // Monitoramento logs status
  const logErrors = logs.filter(l => l.status === 'ERRO' && l.id !== 'log_Script_Tabela_Captados_Fora_Alerta').length;
  const unverifiedDirectories = directories.filter(d => !d.ativo).length;
  
  // Rotinas com Falha / Bloqueadas
  const failedExecutions = executions.filter(e => e.status === 'ATRASADO' || e.status === 'BLOQUEADO').length;
  const blockedExecutions = executions.filter(e => e.status === 'BLOQUEADO').length;

  // Saúde da Rotina Cálculo
  // Se houver algum processo P0 em falha crítica (nos logs ativos ou execuções de hoje): status = CRÍTICO
  // Se houver problemas em P2/P3: status = ATENÇÃO
  // Caso contrário: OK (96%)
  const isP0InFailure = useMemo(() => {
    // Check if any P0 execution for today is BLOQUEADO or ATRASADO
    const p0Executions = executions.filter(e => {
      const act = activities.find(a => a.id === e.activityId);
      return act?.prioridade === 'P0';
    });
    const hasP0ExecFailure = p0Executions.some(e => e.status === 'BLOQUEADO' || e.status === 'ATRASADO' || e.status === 'NAO_REALIZADO');

    // Check if any P0 log is in ERRO status (ignoring Captados_Fora_Alerta which is known exception)
    const p0Logs = logs.filter(l => {
      const act = activities.find(a => a.id === l.atividadeId);
      return act?.prioridade === 'P0';
    });
    const hasP0LogFailure = p0Logs.some(l => l.status === 'ERRO' && l.id !== 'log_Script_Tabela_Captados_Fora_Alerta');

    return hasP0ExecFailure || hasP0LogFailure;
  }, [executions, logs, activities]);

  const healthStatus = useMemo(() => {
    if (isP0InFailure) {
      return { status: 'CRITICO', label: 'SAÚDE CRÍTICA', color: 'bg-red-100 text-red-800 border-red-200', text: '1+ processos P0 críticos com falha.', pct: 35 };
    }
    
    // Check for P1/P2/P3 errors
    const hasOtherLogFailures = logs.some(l => l.status === 'ERRO');
    const hasOtherExecFailures = executions.some(e => e.status === 'ATRASADO' || e.status === 'BLOQUEADO');
    
    if (hasOtherLogFailures || hasOtherExecFailures) {
      return { status: 'ATENCAO', label: 'SAÚDE EM ATENÇÃO', color: 'bg-amber-100 text-amber-800 border-amber-200', text: 'Rotinas secundárias (P1/P2/P3) com problemas.', pct: 84 };
    }

    return { status: 'OK', label: 'SAÚDE EXCELENTE', color: 'bg-green-100 text-green-800 border-green-200', text: 'Todos os processos críticos estão normais.', pct: 98 };
  }, [isP0InFailure, executions, logs]);

  // ==========================================
  // HANDLERS CRUD DE ATIVIDADES
  // ==========================================
  const handleOpenActivityForm = (activity?: Activity) => {
    if (activity) {
      setActivityForm(activity);
      setSelectedActivityId(activity.id);
    } else {
      setActivityForm({
        id: `act_${Date.now()}`,
        nome: '',
        name: '',
        biRelacionado: '',
        categoria: 'BI',
        prioridade: 'P2',
        criticidade: 'ALTA',
        frequencia: 'DIARIA',
        horario: ['08:00'],
        diasSemana: ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta'],
        ativo: true,
        tipoExecucao: 'SEMIAUTOMATICA',
        dependencia: [],
        impacto: '',
        objetivo: '',
        instrucoes: [''],
        diretorios: [],
        scripts: [],
        contingencia: [],
        observacoes: [],
        regrasNegocio: [],
        condicaoSucesso: [],
        condicaoErro: [],
        visibilidade: 'AGENDA'
      });
      setSelectedActivityId(null);
    }
    setIsActivityFormOpen(true);
  };

  const handleSaveActivity = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activityForm.nome) {
      alert('Por favor, informe o nome da atividade.');
      return;
    }

    // Regra Obrigatória: MEDPREV deve continuar QUINZENAL
    if (activityForm.nome.toUpperCase().includes('MEDPREV') && activityForm.frequencia !== 'QUINZENAL') {
      alert('Regra Operacional: Atividades relacionadas ao MEDPREV devem obrigatoriamente estar vinculadas ao ciclo QUINZENAL.');
      return;
    }

    setAppState(prev => {
      const currentList = prev.activities || [];
      let updatedList = [];

      // Retrocompatibilidade
      const sanitized = {
        ...activityForm,
        name: activityForm.nome,
        category: activityForm.categoria,
        recurrence: activityForm.frequencia,
        schedule: activityForm.horario
      } as Activity;

      if (selectedActivityId) {
        // Edit existing
        updatedList = currentList.map(a => a.id === selectedActivityId ? sanitized : a);
      } else {
        // Add new
        updatedList = [...currentList, sanitized];
      }

      const newState = {
        ...prev,
        activities: updatedList
      };
      
      // Auto-save
      setTimeout(() => onSaveConfig(newState), 50);
      return newState;
    });

    setIsActivityFormOpen(false);
    setSelectedActivityId(null);
  };

  const handleDeleteActivity = (id: string) => {
    if (!window.confirm('Deseja realmente remover esta atividade da rotina? Isso removerá as configurações associadas.')) return;
    
    setAppState(prev => {
      const currentList = prev.activities || [];
      const updatedList = currentList.filter(a => a.id !== id);
      const newState = {
        ...prev,
        activities: updatedList
      };
      setTimeout(() => onSaveConfig(newState), 50);
      return newState;
    });
  };

  const handleDuplicateActivity = (activity: Activity) => {
    const duplicated: Activity = {
      ...activity,
      id: `${activity.id}_copy_${Date.now()}`,
      nome: `${activity.nome} (Cópia)`,
      name: `${activity.nome} (Cópia)`
    };

    setAppState(prev => {
      const currentList = prev.activities || [];
      const updatedList = [...currentList, duplicated];
      const newState = {
        ...prev,
        activities: updatedList
      };
      setTimeout(() => onSaveConfig(newState), 50);
      return newState;
    });
    alert('Atividade duplicada com sucesso!');
  };

  // ==========================================
  // HANDLERS CRUD DE DIRETÓRIOS
  // ==========================================
  const handleOpenDirForm = (dir?: Directory) => {
    if (dir) {
      setDirForm(dir);
      setSelectedDirId(dir.id);
    } else {
      setDirForm({
        id: `dir_${Date.now()}`,
        nome: '',
        caminho: '',
        atividadeId: activities[0]?.id || '',
        biRelacionado: activities[0]?.biRelacionado || '',
        prioridade: 'P2',
        tipo: 'BASE',
        uso: 'Auditoria de bases de dados',
        contingencia: false,
        ativo: true,
        observacao: ''
      });
      setSelectedDirId(null);
    }
    setIsDirFormOpen(true);
  };

  const handleSaveDir = (e: React.FormEvent) => {
    e.preventDefault();
    if (!dirForm.nome || !dirForm.caminho) {
      alert('Por favor, preencha o nome e o caminho do diretório.');
      return;
    }

    setAppState(prev => {
      const currentList = prev.directories || [];
      let updatedList = [];

      if (selectedDirId) {
        updatedList = currentList.map(d => d.id === selectedDirId ? (dirForm as Directory) : d);
      } else {
        updatedList = [...currentList, (dirForm as Directory)];
      }

      const newState = {
        ...prev,
        directories: updatedList
      };
      setTimeout(() => onSaveConfig(newState), 50);
      return newState;
    });

    setIsDirFormOpen(false);
    setSelectedDirId(null);
  };

  const handleDeleteDir = (id: string) => {
    if (!window.confirm('Deseja realmente remover este diretório do monitoramento?')) return;
    setAppState(prev => {
      const updatedList = (prev.directories || []).filter(d => d.id !== id);
      const newState = {
        ...prev,
        directories: updatedList
      };
      setTimeout(() => onSaveConfig(newState), 50);
      return newState;
    });
  };

  // ==========================================
  // HANDLERS IDENTIDADE VISUAL
  // ==========================================
  const handleSaveBrand = (e: React.FormEvent) => {
    e.preventDefault();
    setAppState(prev => {
      const updatedConfig = {
        ...prev.systemConfig,
        teamBrand: { ...brandForm }
      } as SystemConfig;

      const newState = {
        ...prev,
        systemConfig: updatedConfig
      };
      setTimeout(() => onSaveConfig(newState), 50);
      return newState;
    });
    alert('Identidade Visual do time atualizada com sucesso em toda a plataforma!');
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setBrandForm(prev => ({
          ...prev,
          logo: reader.result as string,
          logoCompact: reader.result as string
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveLogo = () => {
    setBrandForm(prev => ({
      ...prev,
      logo: '',
      logoCompact: ''
    }));
  };

  const handleRestoreDefaultColors = () => {
    setBrandForm(prev => ({
      ...prev,
      primaryColor: '#0339A6',
      secondaryColor: '#F2B705'
    }));
  };

  // ==========================================
  // HANDLERS PRIORIDADES
  // ==========================================
  const handleUpdatePriorityColor = (id: 'P0' | 'P1' | 'P2' | 'P3', color: string) => {
    setAppState(prev => {
      const updatedList = (prev.priorities || []).map(p => p.id === id ? { ...p, cor: color } : p);
      const newState = {
        ...prev,
        priorities: updatedList
      };
      setTimeout(() => onSaveConfig(newState), 50);
      return newState;
    });
  };

  // ==========================================
  // HANDLERS HORÁRIOS CRUD
  // ==========================================
  const handleAddHourToActivity = (activityId: string, newHour: string) => {
    if (!newHour || !/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(newHour)) {
      alert('Informe um horário válido (HH:MM).');
      return;
    }
    setAppState(prev => {
      const updatedList = (prev.activities || []).map(a => {
        if (a.id === activityId) {
          const hours = [...(a.horario || [])];
          if (!hours.includes(newHour)) {
            hours.push(newHour);
            hours.sort();
          }
          return { ...a, horario: hours, schedule: hours };
        }
        return a;
      });
      const newState = {
        ...prev,
        activities: updatedList
      };
      setTimeout(() => onSaveConfig(newState), 50);
      return newState;
    });
  };

  const handleRemoveHourFromActivity = (activityId: string, hourToRemove: string) => {
    setAppState(prev => {
      const updatedList = (prev.activities || []).map(a => {
        if (a.id === activityId) {
          const hours = (a.horario || []).filter(h => h !== hourToRemove);
          return { ...a, horario: hours, schedule: hours };
        }
        return a;
      });
      const newState = {
        ...prev,
        activities: updatedList
      };
      setTimeout(() => onSaveConfig(newState), 50);
      return newState;
    });
  };

  // ==========================================
  // HANDLERS CENTRAL DE MONITORAMENTO
  // ==========================================
  const handleTriggerManualScan = () => {
    alert('🔍 Iniciando varredura rápida de diretórios locais...\nConectando ao canal localhost...\nModo Demonstração ativo.');
    
    // Simulate updating log statuses randomly to prove real-time interactivity
    setAppState(prev => {
      const updatedLogs = (prev.logs || []).map(l => {
        if (l.id === 'log_Script_Tabela_Captados_Fora_Alerta') return l; // Always OK/Known exception
        
        // Randomly rotate other logs between OK (80%), ATENÇÃO (10%), ERRO (10%)
        const rand = Math.random();
        let status: 'OK' | 'ATENCAO' | 'ERRO' = 'OK';
        if (rand < 0.1) status = 'ERRO';
        else if (rand < 0.2) status = 'ATENCAO';
        
        return {
          ...l,
          status,
          ultimaVerificacao: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
        };
      });

      const newState = {
        ...prev,
        logs: updatedLogs
      };
      setTimeout(() => onSaveConfig(newState), 50);
      return newState;
    });
  };

  const handleChangeMonitoringMode = (mode: 'MOCK' | 'LOCAL_AGENT') => {
    setAppState(prev => {
      const updatedConfig = {
        ...prev.systemConfig,
        monitoring: {
          ...(prev.systemConfig?.monitoring || { enabled: true, intervalMinutes: 30 }),
          mode
        }
      } as SystemConfig;
      const newState = {
        ...prev,
        systemConfig: updatedConfig
      };
      setTimeout(() => onSaveConfig(newState), 50);
      return newState;
    });
  };

  // ==========================================
  // HANDLERS CONTINGÊNCIAS DE LOGS
  // ==========================================
  const handleExecuteContingency = (logId: string) => {
    const log = logs.find(l => l.id === logId);
    if (!log) return;
    
    alert(`⚡ EXECUTANDO RECUPERAÇÃO AUTOMÁTICA:\nAção disparada: "${log.acao.toUpperCase()}"\nAguardando conclusão de subprocesso...`);
    
    // Simulate correcting the log status back to OK!
    setAppState(prev => {
      const updatedLogs = (prev.logs || []).map(l => l.id === logId ? {
        ...l,
        status: 'OK' as const,
        ultimaAtualizacao: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
      } : l);
      
      const newState = {
        ...prev,
        logs: updatedLogs
      };
      setTimeout(() => onSaveConfig(newState), 50);
      return newState;
    });
    alert('✔️ Sucesso! Log restaurado para status verde OK.');
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6 animate-fade-in font-inter">
      
      {/* SIDEBAR SUB-MENU ADMINISTRATIVO */}
      <div className="w-full lg:w-64 bg-white rounded-xl shadow border border-gray-100 p-4 shrink-0 flex flex-col gap-1">
        <div className="px-3 py-3 border-b border-gray-100 mb-2">
          <div className="flex items-center gap-2 text-blue-900">
            <Shield className="h-5 w-5 text-[#0339A6]" />
            <h3 className="font-sora font-black text-sm uppercase tracking-wider">ADMINISTRAÇÃO</h3>
          </div>
          <span className="text-[10px] text-gray-400 block mt-1">Gestão Optimus BI · Rotina</span>
        </div>

        {[
          { id: 'visao_geral', label: 'Visão Geral', icon: LayoutGrid },
          { id: 'atividades', label: 'Atividades (CRUD)', icon: Sliders },
          { id: 'bis', label: 'Gestão de BIs', icon: BarChart3 },
          { id: 'horarios', label: 'Horários', icon: Clock },
          { id: 'dependencias', label: 'Dependências', icon: GitFork },
          { id: 'ciclos_marcos', label: 'Ciclos e Marcos', icon: Layers },
          { id: 'diretorios', label: 'Diretórios (CRUD)', icon: Folder },
          { id: 'identidade_visual', label: 'Identidade Visual', icon: Upload },
          { id: 'monitoramento', label: 'Monitoramento', icon: ActivityIcon },
          { id: 'logs', label: 'Logs do Monitor', icon: FileCheck }
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeSubTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => {
                setActiveSubTab(tab.id as AdminSubTab);
                setIsActivityFormOpen(false);
                setIsDirFormOpen(false);
              }}
              className={`flex items-center gap-3 w-full px-3.5 py-2.5 rounded-lg text-xs font-bold transition duration-150 ${
                isActive 
                  ? 'bg-blue-50 text-[#0339A6] border-l-4 border-[#0339A6]' 
                  : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              <Icon className="h-4 w-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* WORKSPACE AREA */}
      <div className="flex-1 bg-white rounded-xl shadow border border-gray-100 p-6 min-h-[600px]">
        
        {/* TAB: VISÃO GERAL (DASHBOARD ADMIN) */}
        {activeSubTab === 'visao_geral' && (
          <div className="space-y-6 animate-fade-in">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-gray-100">
              <div>
                <h2 className="font-sora font-black text-xl text-gray-900">Dashboard Administrativo</h2>
                <p className="text-xs text-gray-400 mt-1">Métricas operacionais agregadas, conformidade geral e auditoria de saúde da rotina.</p>
              </div>

              {/* Status de Saúde consolidado */}
              <div className={`px-4 py-3 rounded-xl border flex items-center gap-3 shrink-0 ${healthStatus.color}`}>
                {healthStatus.status === 'OK' ? <CheckCircle2 className="h-5 w-5" /> : 
                 healthStatus.status === 'ATENCAO' ? <AlertTriangle className="h-5 w-5" /> : <XCircle className="h-5 w-5" />}
                <div>
                  <span className="text-[9px] uppercase tracking-wider font-extrabold block">SAÚDE DA ROTINA</span>
                  <span className="text-xs font-black block mt-0.5">{healthStatus.label} · {healthStatus.pct}%</span>
                  <span className="text-[9px] block opacity-80">{healthStatus.text}</span>
                </div>
              </div>
            </div>

            {/* Grid de Principais Metricas */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                <span className="text-[10px] uppercase text-gray-400 font-extrabold block">Atividades</span>
                <span className="font-sora text-2xl font-black text-gray-800 block mt-1">{totalActivities}</span>
                <span className="text-[10px] text-gray-400 block mt-1">({activeActivities} ativas hoje)</span>
              </div>
              <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                <span className="text-[10px] uppercase text-gray-400 font-extrabold block">BIs Monitorados</span>
                <span className="font-sora text-2xl font-black text-[#0339A6] block mt-1">{activeBIs}</span>
                <span className="text-[10px] text-blue-500 block mt-1">Conectados à rotina</span>
              </div>
              <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                <span className="text-[10px] uppercase text-gray-400 font-extrabold block">Erros Críticos (Logs)</span>
                <span className="font-sora text-2xl font-black text-red-600 block mt-1">{logErrors}</span>
                <span className="text-[10px] text-red-500 block mt-1">Ações corretivas sugeridas</span>
              </div>
              <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                <span className="text-[10px] uppercase text-gray-400 font-extrabold block">Pastas Inativas</span>
                <span className="font-sora text-2xl font-black text-amber-600 block mt-1">{unverifiedDirectories}</span>
                <span className="text-[10px] text-amber-500 block mt-1">Directórios não monitorados</span>
              </div>
            </div>

            {/* Detalhes de Prioridades e Ciclos */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
              {/* Prioridades Card */}
              <div className="border border-gray-100 rounded-xl p-5 bg-white space-y-4">
                <h4 className="font-sora font-extrabold text-sm text-gray-800 border-b pb-2">Catálogo por Prioridade</h4>
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex items-center gap-2">
                    <span className="h-3.5 w-3.5 rounded-full bg-red-600 shrink-0" />
                    <span className="text-xs font-bold text-gray-700">P0 - Crítica: <b>{countP0}</b></span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="h-3.5 w-3.5 rounded-full bg-orange-500 shrink-0" />
                    <span className="text-xs font-bold text-gray-700">P1 - Alta: <b>{countP1}</b></span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="h-3.5 w-3.5 rounded-full bg-amber-500 shrink-0" />
                    <span className="text-xs font-bold text-gray-700">P2 - Média: <b>{countP2}</b></span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="h-3.5 w-3.5 rounded-full bg-blue-600 shrink-0" />
                    <span className="text-xs font-bold text-gray-700">P3 - Baixa/Base: <b>{countP3}</b></span>
                  </div>
                </div>
              </div>

              {/* Ciclos Card */}
              <div className="border border-gray-100 rounded-xl p-5 bg-white space-y-4">
                <h4 className="font-sora font-extrabold text-sm text-gray-800 border-b pb-2">Distribuição de Frequências</h4>
                <div className="grid grid-cols-3 gap-3">
                  <div className="text-center bg-gray-50 p-2 rounded-lg">
                    <span className="text-[9px] text-gray-400 font-bold block uppercase">Diárias</span>
                    <strong className="text-sm font-black text-gray-800 block mt-1">{countDiarias}</strong>
                  </div>
                  <div className="text-center bg-gray-50 p-2 rounded-lg">
                    <span className="text-[9px] text-gray-400 font-bold block uppercase">Semanais</span>
                    <strong className="text-sm font-black text-gray-800 block mt-1">{countSemanais}</strong>
                  </div>
                  <div className="text-center bg-gray-50 p-2 rounded-lg">
                    <span className="text-[9px] text-gray-400 font-bold block uppercase">Quinzenais</span>
                    <strong className="text-sm font-black text-[#1B5E20] block mt-1">{countQuinzenais}</strong>
                  </div>
                  <div className="text-center bg-gray-50 p-2 rounded-lg">
                    <span className="text-[9px] text-gray-400 font-bold block uppercase">Mensais</span>
                    <strong className="text-sm font-black text-gray-800 block mt-1">{countMensais}</strong>
                  </div>
                  <div className="text-center bg-gray-50 p-2 rounded-lg">
                    <span className="text-[9px] text-gray-400 font-bold block uppercase">Sob Demanda</span>
                    <strong className="text-sm font-black text-gray-800 block mt-1">{countSobDemanda}</strong>
                  </div>
                </div>
              </div>
            </div>

            {/* Informações sobre o Agente de Monitoramento */}
            <div className="bg-blue-50 border border-blue-100 rounded-xl p-5 flex items-start gap-4">
              <Info className="h-5 w-5 text-blue-500 mt-0.5 shrink-0" />
              <div className="text-xs text-blue-900 leading-relaxed">
                <strong className="block text-blue-950 font-bold text-sm mb-1">Mapeamento de Processos e Rastreabilidade</strong>
                Toda e qualquer alteração efetuada nos menus ao lado (como horários de agendamentos, prioridades, dependências ou diretórios) será salva na nuvem e propagada imediatamente para o cockpit operacional da usuária <b>Karine</b> de forma síncrona.
              </div>
            </div>
          </div>
        )}

        {/* TAB: ATIVIDADES CRUD */}
        {activeSubTab === 'atividades' && (
          <div className="space-y-6 animate-fade-in">
            {!isActivityFormOpen ? (
              <>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-100">
                  <div>
                    <h2 className="font-sora font-black text-xl text-gray-900">Configuração de Atividades da Rotina</h2>
                    <p className="text-xs text-gray-400 mt-1">Adicione, edite, duplique ou remova atividades operacionais que compõem a rotina diária.</p>
                  </div>
                  <button
                    onClick={() => handleOpenActivityForm()}
                    className="px-4 py-2 bg-[#0339A6] hover:bg-[#022b80] text-white text-xs font-bold rounded-lg shadow-sm flex items-center gap-1.5 self-start sm:self-auto transition"
                  >
                    <Plus className="h-4 w-4" /> Cadastrar Atividade
                  </button>
                </div>

                {/* Filtro de Busca */}
                <div className="relative">
                  <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Pesquisar atividade por nome ou BI relacionado..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full text-xs border border-gray-200 pl-10 pr-4 py-2.5 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>

                {/* Lista de Atividades */}
                <div className="border border-gray-100 rounded-xl overflow-hidden divide-y divide-gray-100">
                  {activities
                    .filter(a => a.nome.toLowerCase().includes(searchTerm.toLowerCase()) || a.biRelacionado.toLowerCase().includes(searchTerm.toLowerCase()))
                    .map(act => (
                      <div key={act.id} className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-gray-50/40 transition">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h4 className="font-sora font-bold text-sm text-gray-900">{act.nome}</h4>
                            <span className={`px-2 py-0.5 rounded text-[9px] font-black ${
                              act.prioridade === 'P0' ? 'bg-red-50 text-red-700 border border-red-100' :
                              act.prioridade === 'P1' ? 'bg-orange-50 text-orange-700 border border-orange-100' :
                              act.prioridade === 'P2' ? 'bg-amber-50 text-amber-700 border border-amber-100' :
                              'bg-blue-50 text-blue-700 border border-blue-100'
                            }`}>
                              {act.prioridade}
                            </span>
                            <span className="bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded text-[9px] font-bold border border-gray-200">
                              {act.frequencia}
                            </span>
                            {!act.ativo && (
                              <span className="bg-gray-100 text-gray-400 px-1.5 py-0.5 rounded text-[9px] font-bold uppercase">
                                Inativa
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-gray-500 line-clamp-1">{act.objetivo}</p>
                          <div className="text-[10px] text-gray-400">
                            BI: <b className="text-gray-600">{act.biRelacionado || 'Nenhum'}</b> · Horários: <b className="text-gray-600 font-mono">{(act.horario || []).join(', ')}</b>
                          </div>
                        </div>

                        <div className="flex items-center gap-2.5 self-end md:self-auto">
                          <button
                            onClick={() => handleDuplicateActivity(act)}
                            className="px-2.5 py-1.5 border border-gray-200 hover:bg-gray-50 text-gray-600 text-[10px] font-bold rounded"
                            title="Duplicar Atividade"
                          >
                            Duplicar
                          </button>
                          <button
                            onClick={() => handleOpenActivityForm(act)}
                            className="p-1.5 border border-gray-200 rounded hover:bg-gray-50 text-blue-600"
                            title="Editar Atividade"
                          >
                            <Edit className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteActivity(act.id)}
                            className="p-1.5 border border-gray-200 rounded hover:bg-red-50 text-red-600"
                            title="Remover Atividade"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                </div>
              </>
            ) : (
              /* FORMULÁRIO DE ATIVIDADE */
              <form onSubmit={handleSaveActivity} className="space-y-6 animate-fade-in">
                <div className="flex items-center justify-between pb-4 border-b border-gray-100">
                  <h3 className="font-sora font-extrabold text-base text-gray-800">
                    {selectedActivityId ? 'Editar Atividade da Rotina' : 'Cadastrar Nova Atividade'}
                  </h3>
                  <button
                    type="button"
                    onClick={() => setIsActivityFormOpen(false)}
                    className="p-1.5 rounded-full hover:bg-gray-100 text-gray-400"
                  >
                    Voltar
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Nome */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-gray-700">Nome da Atividade</label>
                    <input
                      type="text"
                      required
                      value={activityForm.nome || ''}
                      onChange={(e) => setActivityForm(prev => ({ ...prev, nome: e.target.value, name: e.target.value }))}
                      placeholder="Ex: T22APRR / Alerta de Vagas"
                      className="border border-gray-200 rounded-lg p-2 text-xs focus:ring-1 focus:ring-blue-500 focus:outline-none"
                    />
                  </div>

                  {/* BI Relacionado */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-gray-700">BI Relacionado (Opcional)</label>
                    <input
                      type="text"
                      value={activityForm.biRelacionado || ''}
                      onChange={(e) => setActivityForm(prev => ({ ...prev, biRelacionado: e.target.value }))}
                      placeholder="Ex: BI Alerta de Vagas V2"
                      className="border border-gray-200 rounded-lg p-2 text-xs focus:ring-1 focus:ring-blue-500 focus:outline-none"
                    />
                  </div>

                  {/* Categoria */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-gray-700">Categoria</label>
                    <select
                      value={activityForm.categoria || 'BI'}
                      onChange={(e) => setActivityForm(prev => ({ ...prev, categoria: e.target.value as any, category: e.target.value }))}
                      className="border border-gray-200 rounded-lg p-2 text-xs focus:ring-1 focus:ring-blue-500 focus:outline-none bg-white"
                    >
                      <option value="BI">Painel BI (Power BI Service)</option>
                      <option value="BASE">Geração/Presença de Base</option>
                      <option value="LOG">Auditoria de Logs</option>
                      <option value="SOB_DEMANDA">Rotina Sob Demanda</option>
                      <option value="OUTRA">Outra</option>
                    </select>
                  </div>

                  {/* Prioridade */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-gray-700">Prioridade</label>
                    <select
                      value={activityForm.prioridade || 'P2'}
                      onChange={(e) => setActivityForm(prev => ({ ...prev, prioridade: e.target.value as any, priority: e.target.value }))}
                      className="border border-gray-200 rounded-lg p-2 text-xs focus:ring-1 focus:ring-blue-500 focus:outline-none bg-white"
                    >
                      <option value="P0">P0 - Crítica (Garante alerta de saúde)</option>
                      <option value="P1">P1 - Alta</option>
                      <option value="P2">P2 - Média</option>
                      <option value="P3">P3 - Baixa / Base</option>
                    </select>
                  </div>

                  {/* Criticidade */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-gray-700">Criticidade Operacional</label>
                    <select
                      value={activityForm.criticidade || 'ALTA'}
                      onChange={(e) => setActivityForm(prev => ({ ...prev, criticidade: e.target.value as any }))}
                      className="border border-gray-200 rounded-lg p-2 text-xs focus:ring-1 focus:ring-blue-500 focus:outline-none bg-white"
                    >
                      <option value="CRITICA">CRÍTICA (Prejudica diretoria de imediato)</option>
                      <option value="ALTA">ALTA</option>
                      <option value="MEDIA">MÉDIA</option>
                      <option value="BAIXA">BAIXA</option>
                    </select>
                  </div>

                  {/* Frequência */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-gray-700">Ciclo / Frequência</label>
                    <select
                      value={activityForm.frequencia || 'DIARIA'}
                      onChange={(e) => setActivityForm(prev => ({ ...prev, frequencia: e.target.value as any, recurrence: e.target.value }))}
                      className="border border-gray-200 rounded-lg p-2 text-xs focus:ring-1 focus:ring-blue-500 focus:outline-none bg-white"
                    >
                      <option value="DIARIA">Diário (Dias úteis)</option>
                      <option value="SEMANAL">Semanal (Dias específicos)</option>
                      <option value="QUINZENAL">Quinzenal (Regras como 15 ou 30)</option>
                      <option value="MENSAL">Mensal (Disparado no dia 15)</option>
                      <option value="MARCO_MENSAL">Marcos (Vagas, Auditoria, Cancelamentos)</option>
                      <option value="SOB_DEMANDA">Sob Demanda</option>
                    </select>
                  </div>

                  {/* Tipo de Execucao */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-gray-700">Tipo de Execução</label>
                    <select
                      value={activityForm.tipoExecucao || 'SEMIAUTOMATICA'}
                      onChange={(e) => setActivityForm(prev => ({ ...prev, tipoExecucao: e.target.value as any }))}
                      className="border border-gray-200 rounded-lg p-2 text-xs focus:ring-1 focus:ring-blue-500 focus:outline-none bg-white"
                    >
                      <option value="AUTOMATICA">Totalmente Automática (Python / Servidor)</option>
                      <option value="SEMIAUTOMATICA">Semiautomática (Auditoria humana)</option>
                      <option value="MANUAL">100% Manual</option>
                      <option value="CONTINGENCIA">Disparado Apenas como Contingência</option>
                    </select>
                  </div>

                  {/* Ativo / Inativo */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-gray-700">Status Operacional</label>
                    <select
                      value={activityForm.ativo ? 'true' : 'false'}
                      onChange={(e) => setActivityForm(prev => ({ ...prev, ativo: e.target.value === 'true' }))}
                      className="border border-gray-200 rounded-lg p-2 text-xs focus:ring-1 focus:ring-blue-500 focus:outline-none bg-white"
                    >
                      <option value="true">ATIVADO (Aparece no cronograma de hoje)</option>
                      <option value="false">INATIVADO / ARQUIVADO (Oculto da agenda)</option>
                    </select>
                  </div>
                </div>

                {/* Textarea fields */}
                <div className="space-y-4 pt-2 border-t border-gray-100">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-gray-700">Objetivo Geral da Atividade</label>
                    <textarea
                      value={activityForm.objetivo || ''}
                      onChange={(e) => setActivityForm(prev => ({ ...prev, objetivo: e.target.value }))}
                      placeholder="Descreva resumidamente o impacto e por que realizamos este processo..."
                      rows={2}
                      className="border border-gray-200 rounded-lg p-2 text-xs focus:ring-1 focus:ring-blue-500 focus:outline-none"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-gray-700">Impacto Organizacional</label>
                    <textarea
                      value={activityForm.impacto || ''}
                      onChange={(e) => setActivityForm(prev => ({ ...prev, impacto: e.target.value }))}
                      placeholder="O que acontece se este processo falhar?"
                      rows={2}
                      className="border border-gray-200 rounded-lg p-2 text-xs focus:ring-1 focus:ring-blue-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                  <button
                    type="button"
                    onClick={() => setIsActivityFormOpen(false)}
                    className="px-4 py-2 border border-gray-200 text-gray-600 text-xs font-bold rounded-lg hover:bg-gray-50"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-[#0339A6] hover:bg-[#022b80] text-white text-xs font-bold rounded-lg shadow"
                  >
                    Salvar Atividade
                  </button>
                </div>
              </form>
            )}
          </div>
        )}

        {/* TAB: GESTÃO DE BIs */}
        {activeSubTab === 'bis' && (
          <div className="space-y-6 animate-fade-in">
            <div>
              <h2 className="font-sora font-black text-xl text-gray-900">Gestão de BIs Monitorados</h2>
              <p className="text-xs text-gray-400 mt-1">Conexão entre as rotinas operacionais, diretórios e a publicação final no Power BI Service.</p>
            </div>

            <div className="border border-gray-100 rounded-xl overflow-hidden">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100 text-gray-400 font-bold text-[10px] uppercase tracking-wider">
                    <th className="p-4">Nome do Painel BI</th>
                    <th className="p-4">Atividade Responsável</th>
                    <th className="p-4">Prioridade</th>
                    <th className="p-4">Arquivos de Carga</th>
                    <th className="p-4">Tipo Execução</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-xs text-gray-700">
                  {activities
                    .filter(a => a.categoria === 'BI')
                    .map(bi => (
                      <tr key={bi.id} className="hover:bg-gray-50/50 transition">
                        <td className="p-4 font-sora font-bold text-gray-900">{bi.biRelacionado || bi.nome}</td>
                        <td className="p-4">{bi.nome}</td>
                        <td className="p-4">
                          <span className={`px-2 py-0.5 rounded text-[9px] font-black ${
                            bi.prioridade === 'P0' ? 'bg-red-50 text-red-700 border border-red-100' :
                            bi.prioridade === 'P1' ? 'bg-orange-50 text-orange-700 border border-orange-100' :
                            'bg-blue-50 text-blue-700 border border-blue-100'
                          }`}>
                            {bi.prioridade}
                          </span>
                        </td>
                        <td className="p-4 font-mono text-[10px] text-gray-500">{(bi.arquivos || []).join(', ') || 'Nenhum arquivo listado'}</td>
                        <td className="p-4 font-semibold text-gray-600">{bi.tipoExecucao}</td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB: HORÁRIOS CRUD */}
        {activeSubTab === 'horarios' && (
          <div className="space-y-6 animate-fade-in">
            <div>
              <h2 className="font-sora font-black text-xl text-gray-900">Gestão de Horários e Cronogramas</h2>
              <p className="text-xs text-gray-400 mt-1">Configure as janelas e horários de agendamento que as tarefas operacionais disparam na Agenda.</p>
            </div>

            <div className="space-y-4">
              {activities
                .filter(a => a.ativo)
                .map(act => (
                  <div key={act.id} className="p-4 border border-gray-100 rounded-xl bg-gray-50/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <h4 className="font-sora font-bold text-sm text-gray-800">{act.nome}</h4>
                      <p className="text-xs text-gray-400">Ciclo: {act.frequencia}</p>
                      
                      {/* Lista de Horários Ativos */}
                      <div className="flex flex-wrap gap-2 pt-2">
                        {(act.horario || []).map(time => (
                          <span 
                            key={time} 
                            className="inline-flex items-center gap-1 bg-white border border-gray-200 rounded px-2.5 py-1 text-xs font-mono font-bold text-gray-700 shadow-sm"
                          >
                            <span>{time}</span>
                            <button
                              type="button"
                              onClick={() => handleRemoveHourFromActivity(act.id, time)}
                              className="text-red-500 hover:text-red-700 hover:bg-red-50 rounded ml-1 px-1 font-bold"
                              title="Remover horário"
                            >
                              ×
                            </button>
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Adicionar horário rápido */}
                    <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
                      <input
                        type="time"
                        id={`new-hour-${act.id}`}
                        defaultValue="08:00"
                        className="border border-gray-200 rounded p-1.5 text-xs bg-white focus:ring-1 focus:ring-blue-500 focus:outline-none"
                      />
                      <button
                        onClick={() => {
                          const val = (document.getElementById(`new-hour-${act.id}`) as HTMLInputElement)?.value;
                          handleAddHourToActivity(act.id, val);
                        }}
                        className="px-3 py-1.5 bg-[#0339A6] hover:bg-[#022b80] text-white text-[11px] font-bold rounded flex items-center gap-1 shadow-sm transition"
                      >
                        + Adicionar
                      </button>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* TAB: DEPENDENCIAS GRAPH */}
        {activeSubTab === 'dependencias' && (
          <div className="space-y-6 animate-fade-in">
            <div>
              <h2 className="font-sora font-black text-xl text-gray-900">Árvore de Dependências</h2>
              <p className="text-xs text-gray-400 mt-1">Varredura técnica de fluxos estruturados. O bloqueio automático se aplica se uma rotina precedente falhar.</p>
            </div>

            <div className="border border-gray-100 rounded-xl p-5 bg-gray-50/30 space-y-6">
              {activities
                .filter(a => a.ativo)
                .map(act => {
                  const hasDeps = act.dependencia && act.dependencia.length > 0;
                  return (
                    <div key={act.id} className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm space-y-3">
                      <div className="flex items-center gap-3">
                        <GitFork className="h-5 w-5 text-[#0339A6] transform rotate-180" />
                        <div>
                          <span className="text-[10px] font-black uppercase text-[#0339A6]">{act.categoria}</span>
                          <h4 className="font-sora font-extrabold text-sm text-gray-900 leading-tight">{act.nome}</h4>
                        </div>
                      </div>

                      {hasDeps ? (
                        <div className="pl-8 border-l-2 border-dashed border-gray-200 space-y-2">
                          <span className="text-[10px] text-gray-400 uppercase font-black tracking-wider block">Depende de:</span>
                          {act.dependencia.map((dep, idx) => (
                            <div key={idx} className="flex items-center gap-2 text-xs font-bold text-gray-700 bg-blue-50/50 rounded-lg p-2 border border-blue-100/50 max-w-md">
                              <CornerDownRight className="h-4 w-4 text-[#0339A6]" />
                              <span>{dep}</span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-xs text-gray-400 pl-8">Sem dependências ativas. Inicia de imediato no horário previsto.</p>
                      )}
                    </div>
                  );
                })}
            </div>
          </div>
        )}

        {/* TAB: CICLOS E MARCOS */}
        {activeSubTab === 'ciclos_marcos' && (
          <div className="space-y-6 animate-fade-in">
            <div>
              <h2 className="font-sora font-black text-xl text-gray-900">Gerenciamento de Ciclos e Marcos</h2>
              <p className="text-xs text-gray-400 mt-1">Configure cadências e vincule atividades operacionais a marcos regulatórios do mês.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-gray-50/50 p-5 rounded-xl border border-gray-100 space-y-4">
                <h4 className="font-sora font-extrabold text-sm text-gray-800 border-b pb-2">Ciclos Padronizados</h4>
                <div className="divide-y divide-gray-100">
                  <div className="py-2.5 flex justify-between text-xs font-semibold text-gray-700">
                    <span>DIÁRIA</span>
                    <span className="text-gray-400">({countDiarias} Atividades)</span>
                  </div>
                  <div className="py-2.5 flex justify-between text-xs font-semibold text-gray-700">
                    <span>SEMANAL</span>
                    <span className="text-gray-400">({countSemanais} Atividades)</span>
                  </div>
                  <div className="py-2.5 flex justify-between text-xs font-semibold text-gray-700">
                    <span>QUINZENAL</span>
                    <span className="text-[#1B5E20] font-black">({countQuinzenais} Atividades - MEDPREV Obrigatório)</span>
                  </div>
                  <div className="py-2.5 flex justify-between text-xs font-semibold text-gray-700">
                    <span>MENSAL</span>
                    <span className="text-gray-400">({countMensais} Atividades)</span>
                  </div>
                  <div className="py-2.5 flex justify-between text-xs font-semibold text-gray-700">
                    <span>SOB DEMANDA</span>
                    <span className="text-gray-400">({countSobDemanda} Atividades)</span>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50/50 p-5 rounded-xl border border-gray-100 space-y-4">
                <h4 className="font-sora font-extrabold text-sm text-gray-800 border-b pb-2">Marcos Contábeis do Mês</h4>
                <div className="space-y-3">
                  {[
                    '1º dia útil (Faturamento)',
                    '5º dia útil (Disparo TeleSaúde)',
                    '10º dia útil (Auditoria retroativa)',
                    '15º dia (Lista Mensal)',
                    'Último dia útil (Consolidação)',
                    'Último dia do mês (Fechamento total)'
                  ].map((marco, i) => (
                    <div key={i} className="bg-white border border-gray-100 p-2.5 rounded-lg text-xs font-bold text-gray-800 shadow-sm flex items-center gap-2">
                      <CheckSquare className="h-4 w-4 text-[#0339A6]" />
                      <span>{marco}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB: DIRETORIOS CRUD */}
        {activeSubTab === 'diretorios' && (
          <div className="space-y-6 animate-fade-in">
            {!isDirFormOpen ? (
              <>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-100">
                  <div>
                    <h2 className="font-sora font-black text-xl text-gray-900">Mapeamento de Diretórios Locais</h2>
                    <p className="text-xs text-gray-400 mt-1">Adicione ou corrija os caminhos de rede e pastas de rede do faturamento.</p>
                  </div>
                  <button
                    onClick={() => handleOpenDirForm()}
                    className="px-4 py-2 bg-[#0339A6] hover:bg-[#022b80] text-white text-xs font-bold rounded-lg shadow-sm flex items-center gap-1.5 self-start sm:self-auto transition"
                  >
                    <Plus className="h-4 w-4" /> Cadastrar Diretório
                  </button>
                </div>

                <div className="space-y-4">
                  {directories.map(dir => (
                    <div key={dir.id} className="p-4 border border-gray-100 rounded-xl hover:bg-gray-50/50 transition flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-sora font-bold text-sm text-gray-900">{dir.nome}</h4>
                          <span className="bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded text-[9px] font-bold border border-blue-100">
                            {dir.tipo}
                          </span>
                        </div>
                        <p className="text-xs text-gray-500 font-mono select-all bg-gray-50 border border-gray-200/50 p-1.5 rounded max-w-xl truncate">{dir.caminho}</p>
                        <span className="text-[10px] text-gray-400 block">Atividade Vinculada: <b>{dir.biRelacionado}</b></span>
                      </div>

                      <div className="flex items-center gap-2 shrink-0 self-end md:self-auto">
                        <button
                          onClick={() => handleOpenDirForm(dir)}
                          className="p-1.5 border border-gray-200 rounded hover:bg-gray-50 text-blue-600"
                          title="Editar"
                        >
                          <Edit className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteDir(dir.id)}
                          className="p-1.5 border border-gray-200 rounded hover:bg-red-50 text-red-600"
                          title="Remover"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              /* FORMULÁRIO DIRETORIO */
              <form onSubmit={handleSaveDir} className="space-y-6 animate-fade-in">
                <div className="flex items-center justify-between pb-4 border-b border-gray-100">
                  <h3 className="font-sora font-extrabold text-base text-gray-800">
                    {selectedDirId ? 'Editar Diretório' : 'Cadastrar Novo Diretório'}
                  </h3>
                  <button
                    type="button"
                    onClick={() => setIsDirFormOpen(false)}
                    className="p-1.5 rounded-full hover:bg-gray-100 text-gray-400"
                  >
                    Voltar
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Nome */}
                  <div className="flex flex-col gap-1.5 col-span-2">
                    <label className="text-xs font-bold text-gray-700">Nome Amigável da Pasta</label>
                    <input
                      type="text"
                      required
                      value={dirForm.nome || ''}
                      onChange={(e) => setDirForm(prev => ({ ...prev, nome: e.target.value }))}
                      placeholder="Ex: T22APRR - DIARIA"
                      className="border border-gray-200 rounded-lg p-2 text-xs focus:ring-1 focus:ring-blue-500 focus:outline-none"
                    />
                  </div>

                  {/* Caminho */}
                  <div className="flex flex-col gap-1.5 col-span-2">
                    <label className="text-xs font-bold text-gray-700">Caminho UNC / Pasta Local</label>
                    <input
                      type="text"
                      required
                      value={dirForm.caminho || ''}
                      onChange={(e) => setDirForm(prev => ({ ...prev, caminho: e.target.value }))}
                      placeholder="Ex: \\10.1.17.4\Usuarios\Credenciamento Medico\NUCLEO..."
                      className="border border-gray-200 rounded-lg p-2 text-xs font-mono focus:ring-1 focus:ring-blue-500 focus:outline-none"
                    />
                  </div>

                  {/* BI Relacionado */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-gray-700">Atividade Responsável</label>
                    <select
                      value={dirForm.atividadeId || ''}
                      onChange={(e) => {
                        const act = activities.find(a => a.id === e.target.value);
                        setDirForm(prev => ({ 
                          ...prev, 
                          atividadeId: e.target.value,
                          biRelacionado: act?.biRelacionado || 'Nenhum'
                        }));
                      }}
                      className="border border-gray-200 rounded-lg p-2 text-xs focus:ring-1 focus:ring-blue-500 focus:outline-none bg-white"
                    >
                      {activities.map(a => (
                        <option key={a.id} value={a.id}>{a.nome}</option>
                      ))}
                    </select>
                  </div>

                  {/* Tipo */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-gray-700">Tipo de Diretório</label>
                    <select
                      value={dirForm.tipo || 'BASE'}
                      onChange={(e) => setDirForm(prev => ({ ...prev, tipo: e.target.value }))}
                      className="border border-gray-200 rounded-lg p-2 text-xs focus:ring-1 focus:ring-blue-500 focus:outline-none bg-white"
                    >
                      <option value="BASE">Bases (Excel / CSV)</option>
                      <option value="SCRIPTS">Scripts / Robôs</option>
                      <option value="RELATORIO">Relatórios Executivos</option>
                      <option value="CONTINGENCIA">Backup / Contingência</option>
                    </select>
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                  <button
                    type="button"
                    onClick={() => setIsDirFormOpen(false)}
                    className="px-4 py-2 border border-gray-200 text-gray-600 text-xs font-bold rounded-lg hover:bg-gray-50"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-[#0339A6] hover:bg-[#022b80] text-white text-xs font-bold rounded-lg shadow"
                  >
                    Salvar Diretório
                  </button>
                </div>
              </form>
            )}
          </div>
        )}

        {/* TAB: IDENTIDADE VISUAL */}
        {activeSubTab === 'identidade_visual' && (
          <form onSubmit={handleSaveBrand} className="space-y-6 animate-fade-in">
            <div className="pb-4 border-b border-gray-100">
              <h2 className="font-sora font-black text-xl text-gray-900">Personalização de Identidade Visual</h2>
              <p className="text-xs text-gray-400 mt-1">Configure o logotipo, nome e cores corporativas do time. Substitui as logos estáticas da interface.</p>
            </div>

            {/* Live Interactive Preview */}
            <div className="border border-gray-100 rounded-xl p-5 bg-gray-50/50 flex flex-col sm:flex-row items-center gap-6">
              <div 
                className="w-full sm:w-64 h-36 rounded-xl shadow-md p-4 flex flex-col justify-between text-white transition-all duration-300"
                style={{ backgroundColor: brandForm.primaryColor }}
              >
                <div className="flex items-center gap-2">
                  {brandForm.logo ? (
                    <img src={brandForm.logo} alt="Preview Logo" className="h-8 max-w-[120px] object-contain rounded" />
                  ) : (
                    <div 
                      className="h-8 w-8 rounded flex items-center justify-center font-black text-xs shrink-0"
                      style={{ backgroundColor: brandForm.secondaryColor, color: '#000' }}
                    >
                      {brandForm.name ? brandForm.name.substring(0, 2).toUpperCase() : 'OP'}
                    </div>
                  )}
                  <div className="flex flex-col leading-none">
                    <span className="font-black text-xs font-sora leading-none">{brandForm.name}</span>
                    <span className="text-[8px] text-blue-200 mt-0.5 leading-none">{brandForm.subtitle}</span>
                  </div>
                </div>

                <div className="flex justify-between items-center mt-auto border-t border-white/10 pt-2 text-[8px] text-blue-200 font-medium">
                  <span>visualização prévia</span>
                  <span className="h-2.5 w-2.5 rounded-full animate-pulse" style={{ backgroundColor: brandForm.secondaryColor }} />
                </div>
              </div>

              <div className="space-y-1.5 flex-1 text-xs text-gray-500">
                <strong className="block text-gray-700 text-sm font-bold">Painel de Preview Ativo</strong>
                <p>O painel à esquerda demonstra instantaneamente o cabeçalho e a tonalidade primária que será renderizada na sidebar principal da plataforma assim que você salvar as configurações.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Nome do Time */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-gray-700">Nome Corporativo da Marca</label>
                <input
                  type="text"
                  required
                  value={brandForm.name}
                  onChange={(e) => setBrandForm(prev => ({ ...prev, name: e.target.value }))}
                  className="border border-gray-200 rounded-lg p-2 text-xs focus:ring-1 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              {/* Subtítulo */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-gray-700">Subtítulo do Cockpit</label>
                <input
                  type="text"
                  required
                  value={brandForm.subtitle}
                  onChange={(e) => setBrandForm(prev => ({ ...prev, subtitle: e.target.value }))}
                  className="border border-gray-200 rounded-lg p-2 text-xs focus:ring-1 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              {/* Cor Primaria */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-gray-700">Cor Primária (Hexadecimal)</label>
                <div className="flex gap-2">
                  <input
                    type="color"
                    value={brandForm.primaryColor}
                    onChange={(e) => setBrandForm(prev => ({ ...prev, primaryColor: e.target.value }))}
                    className="border border-gray-200 rounded h-9 w-12 cursor-pointer p-0.5 bg-white"
                  />
                  <input
                    type="text"
                    required
                    maxLength={7}
                    value={brandForm.primaryColor}
                    onChange={(e) => setBrandForm(prev => ({ ...prev, primaryColor: e.target.value }))}
                    className="border border-gray-200 rounded-lg p-2 text-xs flex-1 focus:ring-1 focus:ring-blue-500 focus:outline-none font-mono"
                  />
                </div>
              </div>

              {/* Cor Secundaria */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-gray-700">Cor de Destaque / Secundária (Hexadecimal)</label>
                <div className="flex gap-2">
                  <input
                    type="color"
                    value={brandForm.secondaryColor}
                    onChange={(e) => setBrandForm(prev => ({ ...prev, secondaryColor: e.target.value }))}
                    className="border border-gray-200 rounded h-9 w-12 cursor-pointer p-0.5 bg-white"
                  />
                  <input
                    type="text"
                    required
                    maxLength={7}
                    value={brandForm.secondaryColor}
                    onChange={(e) => setBrandForm(prev => ({ ...prev, secondaryColor: e.target.value }))}
                    className="border border-gray-200 rounded-lg p-2 text-xs flex-1 focus:ring-1 focus:ring-blue-500 focus:outline-none font-mono"
                  />
                </div>
              </div>

              {/* Upload de Logo */}
              <div className="flex flex-col gap-1.5 md:col-span-2">
                <label className="text-xs font-bold text-gray-700">Logotipo do Time (Carregar imagem)</label>
                <div className="flex items-center gap-4">
                  <label className="px-4 py-2 bg-gray-100 hover:bg-gray-200 border border-gray-200 text-gray-700 text-xs font-bold rounded-lg cursor-pointer transition flex items-center gap-1.5">
                    <Upload className="h-4 w-4" /> Escolher Logotipo
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleLogoUpload}
                      className="hidden"
                    />
                  </label>
                  {brandForm.logo && (
                    <button
                      type="button"
                      onClick={handleRemoveLogo}
                      className="px-4 py-2 border border-red-200 hover:bg-red-50 text-red-600 text-xs font-bold rounded-lg transition"
                    >
                      Remover Logo
                    </button>
                  )}
                </div>
              </div>
            </div>

            <div className="flex justify-between items-center pt-4 border-t border-gray-100 mt-6">
              <button
                type="button"
                onClick={handleRestoreDefaultColors}
                className="px-4 py-2 border border-gray-200 text-gray-500 text-xs font-bold rounded-lg hover:bg-gray-50 transition"
              >
                Restaurar Padrão
              </button>
              <button
                type="submit"
                className="px-6 py-2.5 bg-[#0339A6] hover:bg-[#022b80] text-white text-xs font-black rounded-lg shadow-md transition"
              >
                Salvar Alterações
              </button>
            </div>
          </form>
        )}

        {/* TAB: CENTRAL DE MONITORAMENTO */}
        {activeSubTab === 'monitoramento' && (
          <div className="space-y-6 animate-fade-in">
            <div className="pb-4 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="font-sora font-black text-xl text-gray-900">Central de Monitoramento</h2>
                <p className="text-xs text-gray-400 mt-1">Status e canal de integração síncrona com os diretórios de faturamento local.</p>
              </div>
              <button
                onClick={handleTriggerManualScan}
                className="px-4 py-2 bg-[#0339A6] hover:bg-[#022b80] text-white text-xs font-bold rounded-lg shadow flex items-center gap-1.5 transition self-start sm:self-auto"
              >
                <RefreshCw className="h-4 w-4" /> Executar Varredura Agora
              </button>
            </div>

            {/* Configurações do Agente */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-gray-50/50 p-4 rounded-xl border border-gray-100 flex flex-col justify-between">
                <div>
                  <span className="text-[10px] uppercase text-gray-400 font-extrabold block">Frequência da Varredura</span>
                  <strong className="text-lg font-black text-gray-800 block mt-1">A cada 30 minutos</strong>
                  <span className="text-[10px] text-gray-400 block mt-1">Enquanto cockpit estiver aberto</span>
                </div>
              </div>

              <div className="bg-gray-50/50 p-4 rounded-xl border border-gray-100 flex flex-col justify-between">
                <div>
                  <span className="text-[10px] uppercase text-gray-400 font-extrabold block">Status do Canal Síncrono</span>
                  {systemConfig.monitoring?.mode === 'LOCAL_AGENT' ? (
                    <div className="flex items-center gap-2 mt-1.5">
                      <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                      <strong className="text-sm font-black text-green-700">Agente Conectado</strong>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 mt-1.5">
                      <span className="h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
                      <strong className="text-sm font-black text-amber-700">Modo Demonstração</strong>
                    </div>
                  )}
                  <span className="text-[10px] text-gray-400 block mt-1">Integrador Windows Ativo</span>
                </div>
              </div>

              <div className="bg-gray-50/50 p-4 rounded-xl border border-gray-100 flex flex-col justify-between">
                <div>
                  <span className="text-[10px] uppercase text-gray-400 font-extrabold block">Configuração do Canal</span>
                  <div className="flex gap-2 mt-2">
                    <button
                      onClick={() => handleChangeMonitoringMode('MOCK')}
                      className={`px-2.5 py-1 text-[10px] font-bold rounded ${systemConfig.monitoring?.mode === 'MOCK' ? 'bg-[#0339A6] text-white' : 'bg-white border border-gray-200 text-gray-600'}`}
                    >
                      MOCK
                    </button>
                    <button
                      onClick={() => handleChangeMonitoringMode('LOCAL_AGENT')}
                      className={`px-2.5 py-1 text-[10px] font-bold rounded ${systemConfig.monitoring?.mode === 'LOCAL_AGENT' ? 'bg-[#0339A6] text-white' : 'bg-white border border-gray-200 text-gray-600'}`}
                    >
                      AGENTE AGENT
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Preparação de contrato do Agente Python / Node.js */}
            <div className="border border-gray-100 rounded-xl p-5 bg-white space-y-4">
              <h4 className="font-sora font-extrabold text-sm text-gray-800 border-b pb-2">Contrato Abstrato LocalMonitorService</h4>
              <p className="text-xs text-gray-500 leading-relaxed">
                Abaixo está a arquitetura abstrata configurada no frontend, pronta para conectar com um Agente Local que acessa as pastas de rede corporativas (via Node.js/Python local) e devolve a resposta estruturada ao cockpit.
              </p>
              
              <pre className="text-[10px] font-mono bg-gray-900 text-green-400 p-4 rounded-lg overflow-x-auto leading-relaxed border border-gray-950 shadow-inner">
{`interface DirectoryCheck {
  id: string;
  path: string;
  status: "OK" | "ATENCAO" | "ERRO" | "NAO_ENCONTRADO";
  exists: boolean;
  lastModified?: string;
  checkedAt: string;
  expectedFiles?: string[];
  missingFiles?: string[];
  message?: string;
}

// O Frontend consome os resultados desse contrato local sem burlar
// as barreiras de sandbox padrão do browser do Windows.`}
              </pre>
            </div>
          </div>
        )}

        {/* TAB: CENTRAL DE LOGS */}
        {activeSubTab === 'logs' && (
          <div className="space-y-6 animate-fade-in">
            <div className="pb-4 border-b border-gray-100">
              <h2 className="font-sora font-black text-xl text-gray-900">Logs do Monitor de Diretórios</h2>
              <p className="text-xs text-gray-400 mt-1">Correlação síncrona entre arquivos esperados, atividades, BIs e contingências associadas.</p>
            </div>

            {/* Tabela de Logs */}
            <div className="border border-gray-100 rounded-xl overflow-hidden">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100 text-gray-400 font-bold text-[10px] uppercase tracking-wider">
                    <th className="p-4">Status</th>
                    <th className="p-4">Processo / Arquivo</th>
                    <th className="p-4">BI Relacionado</th>
                    <th className="p-4">Última Checagem</th>
                    <th className="p-4">Ação de Contingência</th>
                    <th className="p-4 text-center">Auditoria</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-xs text-gray-700">
                  {logs.map(log => {
                    const isKnownException = log.tipoExcecao === 'EXCECAO_CONHECIDA';
                    return (
                      <tr key={log.id} className="hover:bg-gray-50/50 transition">
                        <td className="p-4 shrink-0">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black ${
                            log.status === 'OK' ? 'bg-green-50 text-green-700 border border-green-100' :
                            log.status === 'ATENCAO' ? 'bg-amber-50 text-amber-700 border border-amber-100 animate-pulse' :
                            'bg-red-50 text-red-700 border border-red-100 animate-pulse'
                          }`}>
                            <span className={`h-1.5 w-1.5 rounded-full ${log.status === 'OK' ? 'bg-green-500' : log.status === 'ATENCAO' ? 'bg-amber-500' : 'bg-red-500'}`} />
                            {log.status}
                          </span>
                        </td>
                        <td className="p-4 font-bold text-gray-900">
                          <div>
                            <span>{log.processo}</span>
                            {isKnownException && (
                              <span className="block text-[8px] text-blue-500 bg-blue-50 px-1 py-0.2 rounded mt-1 max-w-max uppercase font-bold border border-blue-100">
                                Exceção Conhecida (Ignora Falso Positivo)
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="p-4 text-gray-500">{log.bi}</td>
                        <td className="p-4 text-gray-400 font-mono text-[10px]">{log.ultimaVerificacao}</td>
                        <td className="p-4 text-gray-400 italic font-medium">{log.acao}</td>
                        <td className="p-4 text-center shrink-0">
                          {log.status === 'ERRO' ? (
                            <button
                              onClick={() => handleExecuteContingency(log.id)}
                              className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white text-[10px] font-bold rounded shadow-sm transition"
                            >
                              Contingência
                            </button>
                          ) : (
                            <span className="text-gray-300 text-[10px] font-bold">Auditoria OK</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
