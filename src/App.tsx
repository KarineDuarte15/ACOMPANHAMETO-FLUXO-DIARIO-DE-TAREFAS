import React, { useState, useEffect, useMemo, useRef } from 'react';
import { storageService } from './services/storageService';
import { sheetsService } from './services/sheetsService';
import { syncService } from './services/syncService';
import { routineActivities } from './data/activities';
import { Execution, Activity, UserConfig, AppState, ExecutionStatus } from './types';
import { 
  googleSheetsService, 
  initGoogleAuth, 
  googleSignIn, 
  googleSignOut 
} from './services/googleSheetsService';

// Component Imports
import { Navbar } from './components/Navbar';
import { Indicators } from './components/Indicators';
import { Timeline } from './components/Timeline';
import { ActivityDetail } from './components/ActivityDetail';
import { FlippedFocuser } from './components/FlippedFocuser';
import { ActiveModal } from './components/ActiveModal';
import { HistoryView } from './components/HistoryView';
import { ConfigPanel } from './components/ConfigPanel';
import { SchedulerAlerts } from './components/SchedulerAlerts';

// Novas Abas Modulares
import { BisTable } from './components/BisTable';
import { DirectoriesPanel } from './components/DirectoriesPanel';
import { MonthlyMilestones } from './components/MonthlyMilestones';
import { BiSummary } from './components/BiSummary';
import { AdminPanel } from './components/AdminPanel';
import { MonitoringPanel } from './components/MonitoringPanel';

// Icon imports
import { 
  Sparkles, Clock, ArrowRight, AlertCircle, RefreshCw, CheckCircle2, 
  Eye, FileText, LayoutGrid, Calendar, HelpCircle, MessageSquare, Mail 
} from 'lucide-react';

export default function App() {
  // Main state loaded from storageService
  const [appState, setAppState] = useState<AppState>(() => storageService.loadState());
  const [currentTime, setCurrentTime] = useState(new Date());

  const dynamicActivities = appState.activities || routineActivities;
  const dynamicDirectories = appState.directories || [];
  const systemConfig = appState.systemConfig || {
    teamBrand: {
      name: "Optimus BI",
      subtitle: "Rotina Inteligente",
      primaryColor: "#0339A6",
      secondaryColor: "#F2B705",
      logo: "",
      logoCompact: ""
    },
    monitoring: {
      enabled: true,
      intervalMinutes: 30,
      mode: 'MOCK'
    },
    user: {
      name: "Karine",
      role: "OPERACIONAL"
    }
  };

  const handleRoleChange = (newRole: 'ADMIN' | 'OPERACIONAL') => {
    setAppState(prev => ({
      ...prev,
      systemConfig: {
        ...(prev.systemConfig || systemConfig),
        user: {
          ...(prev.systemConfig?.user || systemConfig.user),
          role: newRole
        }
      }
    }));
  };
  
  // Navigation
  const [currentTab, setCurrentTab] = useState('dashboard');
  const [isFocoActive, setIsFocoActive] = useState(false);
  const [selectedExecutionId, setSelectedExecutionId] = useState<string | null>(null);

  // Modal / Dialogue States
  const [modalType, setModalType] = useState<'alert' | 'delay_prompt' | 'congratulations' | null>(null);
  const [modalActivity, setModalActivity] = useState<Activity | null>(null);
  const [modalExecution, setModalExecution] = useState<Execution | null>(null);
  const [tempCompletedExecId, setTempCompletedExecId] = useState<string | null>(null);
  const [tempElapsed, setTempElapsed] = useState<number>(0);

  // Read-only / Viewer mode for managers
  const [isReadOnly, setIsReadOnly] = useState<boolean>(() => {
    const params = new URLSearchParams(window.location.search);
    const view = params.get('view') || params.get('mode');
    return view === 'gestor' || view === 'viewer' || view === 'readonly';
  });
  const [copiedLink, setCopiedLink] = useState(false);

  const handleCopyGestorLink = () => {
    const gestorUrl = `${window.location.origin}${window.location.pathname}?view=gestor`;
    navigator.clipboard.writeText(gestorUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 3000);
    alert("Link de visualização para Gestores copiado! Envie este link para que eles acompanhem seu progresso em tempo real sem poder modificar nada nas suas rotinas.");
  };

  // Google Sheets Integration States
  const [googleUser, setGoogleUser] = useState<any>(null);
  const [googleToken, setGoogleToken] = useState<string | null>(null);
  const [isConnectingSheets, setIsConnectingSheets] = useState(false);

  useEffect(() => {
    const unsubscribe = initGoogleAuth(
      (user, token) => {
        setGoogleUser(user);
        setGoogleToken(token);
      },
      () => {
        setGoogleUser(null);
        setGoogleToken(null);
      }
    );
    return () => unsubscribe();
  }, []);

  const handleGoogleLogin = async () => {
    setIsConnectingSheets(true);
    try {
      const result = await googleSignIn();
      if (result) {
        setGoogleUser(result.user);
        setGoogleToken(result.token);
        
        // Se já tiver uma planilha salva, verifica a validade
        if (config.googleSheetsSpreadsheetId) {
          const isValid = await googleSheetsService.verifySpreadsheet(config.googleSheetsSpreadsheetId, result.token);
          if (!isValid) {
            alert("A planilha Google configurada anteriormente não foi encontrada ou está inacessível. Criaremos uma nova ou você poderá vincular outra.");
            handleSaveConfig({ 
              ...config, 
              googleSheetsSpreadsheetId: '', 
              googleSheetsEnabled: false 
            });
          } else {
            handleSaveConfig({ 
              ...config, 
              googleSheetsEnabled: true 
            });
          }
        } else {
          handleSaveConfig({ 
            ...config, 
            googleSheetsEnabled: true 
          });
        }
      }
    } catch (e: any) {
      alert("Erro ao conectar com Google Sheets: " + e.message);
    } finally {
      setIsConnectingSheets(false);
    }
  };

  const handleGoogleLogout = async () => {
    await googleSignOut();
    setGoogleUser(null);
    setGoogleToken(null);
    handleSaveConfig({ 
      ...config, 
      googleSheetsEnabled: false 
    });
  };

  const handleCreateNewSheet = async () => {
    if (!googleToken) {
      alert("Por favor, conecte sua conta Google primeiro.");
      return;
    }
    setIsConnectingSheets(true);
    try {
      const sheetId = await googleSheetsService.createRoutineSpreadsheet(googleToken);
      if (sheetId) {
        handleSaveConfig({
          ...config,
          googleSheetsSpreadsheetId: sheetId,
          googleSheetsEnabled: true
        });
        alert(`Planilha criada com sucesso no Google Drive!\n\nID da Planilha: ${sheetId}\n\nAgora todas as suas atividades de faturamento concluídas serão registradas automaticamente nela em tempo real.`);
      }
    } catch (e: any) {
      alert("Erro ao criar planilha: " + e.message);
    } finally {
      setIsConnectingSheets(false);
    }
  };

  const syncExecutionToSheets = async (exec: Execution, act: Activity) => {
    if (!config.googleSheetsEnabled || !config.googleSheetsSpreadsheetId || !googleToken) {
      console.log('Sincronização com Google Sheets ignorada (desconectada ou não configurada).');
      return;
    }

    const elapsedSeconds = exec.durationSeconds || 0;
    const formattedDuration = `${Math.floor(elapsedSeconds / 60)}m ${elapsedSeconds % 60}s`;

    // Dados para popular as colunas definidas no cabeçalho
    const rowValues = [
      exec.date,                                     // Data
      exec.scheduledTime,                            // Horário Agendado
      exec.startedAt ? new Date(exec.startedAt).toLocaleTimeString('pt-BR') : '', // Iniciado Em
      exec.completedAt ? new Date(exec.completedAt).toLocaleTimeString('pt-BR') : '', // Concluído Em
      act.name,                                      // Atividade
      act.biRelacionado || 'Nenhum',                 // BI Relacionado
      act.prioridade || 'P2',                        // Prioridade
      formattedDuration,                             // Duração
      exec.delaySeconds || 0,                        // Atraso (Segundos)
      exec.delayReason || '',                        // Motivo do Atraso
      exec.status,                                   // Status
      exec.informedPerson || '',                     // Quem foi Informado
      exec.helperPerson || '',                       // Quem Ajudou
      exec.notes || ''                               // Notas / Evidências
    ];

    try {
      const ok = await googleSheetsService.appendRow(config.googleSheetsSpreadsheetId, rowValues, googleToken);
      if (ok) {
        console.log(`Atividade '${act.name}' salva com sucesso no Google Sheets!`);
      } else {
        console.warn('Falha ao adicionar registro de atividade na planilha Google.');
      }
    } catch (e) {
      console.error('Erro de envio ao Google Sheets:', e);
    }
  };

  const handleBulkSyncToSheets = async () => {
    if (!googleToken) {
      alert("Por favor, conecte sua conta Google primeiro.");
      return;
    }
    if (!config.googleSheetsSpreadsheetId) {
      alert("Por favor, crie ou associe uma planilha Google primeiro.");
      return;
    }

    const completedExecs = executions.filter(e => e.status === 'CONCLUIDO');
    if (completedExecs.length === 0) {
      alert("Não há atividades concluídas hoje para exportar.");
      return;
    }

    setIsConnectingSheets(true);
    try {
      const rows = completedExecs.map(exec => {
        const act = routineActivities.find(a => a.id === exec.activityId);
        const elapsedSeconds = exec.durationSeconds || 0;
        const formattedDuration = `${Math.floor(elapsedSeconds / 60)}m ${elapsedSeconds % 60}s`;
        return [
          exec.date,
          exec.scheduledTime,
          exec.startedAt ? new Date(exec.startedAt).toLocaleTimeString('pt-BR') : '',
          exec.completedAt ? new Date(exec.completedAt).toLocaleTimeString('pt-BR') : '',
          act?.name || 'Atividade Desconhecida',
          act?.biRelacionado || 'Nenhum',
          act?.prioridade || 'P2',
          formattedDuration,
          exec.delaySeconds || 0,
          exec.delayReason || '',
          exec.status,
          exec.informedPerson || '',
          exec.helperPerson || '',
          exec.notes || ''
        ];
      });

      const ok = await googleSheetsService.synchronizeRows(config.googleSheetsSpreadsheetId, rows, googleToken);
      if (ok) {
        alert(`Sincronização em lote finalizada! ${rows.length} registros operacionais gravados com sucesso no Google Sheets.`);
      } else {
        alert("Falha ao sincronizar dados em lote. Certifique se o ID da planilha do Google Sheets é válido.");
      }
    } catch (e: any) {
      alert("Erro ao realizar sincronização em lote: " + e.message);
    } finally {
      setIsConnectingSheets(false);
    }
  };

  // Sync state to LocalStorage when changed
  useEffect(() => {
    if (!isReadOnly) {
      storageService.saveState(appState);
    }
  }, [appState, isReadOnly]);

  // Sync state to Firebase in real-time when changed (only for operator)
  useEffect(() => {
    if (isReadOnly) return;
    const todayStr = storageService.getTodayDateString();
    syncService.saveStateToFirebase(todayStr, appState);
  }, [appState, isReadOnly]);

  // Subscribe to Firebase real-time updates (critical for Gestor View / synchronizing screens)
  useEffect(() => {
    const todayStr = storageService.getTodayDateString();
    const unsubscribe = syncService.subscribeToState(todayStr, (data) => {
      if (isReadOnly && data) {
        setAppState(prev => ({
          ...prev,
          executions: data.executions || prev.executions,
          currentExecutionId: data.currentExecutionId !== undefined ? data.currentExecutionId : prev.currentExecutionId,
          activeBreak: data.activeBreak !== undefined ? data.activeBreak : prev.activeBreak,
          config: { ...prev.config, ...data.config }
        }));
      }
    });
    return () => unsubscribe();
  }, [isReadOnly]);

  // Keep digital clock ticking
  useEffect(() => {
    const clockInterval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(clockInterval);
  }, []);

  // Update document title dynamically depending on active execution
  useEffect(() => {
    const activeExec = appState.executions.find(e => e.status === 'EM_EXECUCAO');
    if (activeExec) {
      const act = dynamicActivities.find(a => a.id === activeExec.activityId);
      document.title = `⏱️ [Ativo: ${activeExec.scheduledTime}] - ${act?.name || 'Rotina'} | ${systemConfig.teamBrand.name}`;
    } else {
      const pendingCount = appState.executions.filter(e => e.status === 'PENDENTE' || e.status === 'ATRASADO').length;
      document.title = pendingCount > 0 
        ? `📋 (${pendingCount}) Rotinas Pendentes | ${systemConfig.teamBrand.name}`
        : `🎉 Tudo Pronto! | ${systemConfig.teamBrand.name}`;
    }
  }, [appState.executions, dynamicActivities, systemConfig]);

  // Derived state selections
  const executions = appState.executions;
  const config = appState.config;
  const history = appState.history;

  // Selected execution
  const selectedExecution = useMemo(() => {
    if (!selectedExecutionId) return null;
    return executions.find(e => e.id === selectedExecutionId) || null;
  }, [selectedExecutionId, executions]);

  const selectedActivity = useMemo(() => {
    if (!selectedExecution) return null;
    return dynamicActivities.find(a => a.id === selectedExecution.activityId) || null;
  }, [selectedExecution, dynamicActivities]);

  // Identify active execution (if any)
  const activeExecution = useMemo(() => {
    return executions.find(e => e.status === 'EM_EXECUCAO') || null;
  }, [executions]);

  const activeActivity = useMemo(() => {
    if (!activeExecution) return null;
    return dynamicActivities.find(a => a.id === activeExecution.activityId) || null;
  }, [activeExecution, dynamicActivities]);

  // Select next upcoming execution for Spotlight Card
  const nextSpotlightExecution = useMemo(() => {
    // 1. If an execution is active, spotlight that
    if (activeExecution) return activeExecution;

    // 2. Find the earliest non-concluded execution (Pendente or Atrasado)
    const pendingAndAtrasado = executions.filter(e => e.status === 'PENDENTE' || e.status === 'ATRASADO');
    if (pendingAndAtrasado.length > 0) {
      // Sort chronologically (should already be sorted but safe-check)
      return pendingAndAtrasado[0];
    }

    return null;
  }, [executions, activeExecution]);

  const nextSpotlightActivity = useMemo(() => {
    if (!nextSpotlightExecution) return null;
    return dynamicActivities.find(a => a.id === nextSpotlightExecution.activityId) || null;
  }, [nextSpotlightExecution, dynamicActivities]);

  // Calculate next execution after the spotlight for Modo Foco
  const nextUpcomingExecution = useMemo(() => {
    if (!nextSpotlightExecution) return null;
    const currentIndex = executions.findIndex(e => e.id === nextSpotlightExecution.id);
    if (currentIndex !== -1 && currentIndex < executions.length - 1) {
      return executions[currentIndex + 1];
    }
    return null;
  }, [executions, nextSpotlightExecution]);

  const nextUpcomingActivity = useMemo(() => {
    if (!nextUpcomingExecution) return null;
    return dynamicActivities.find(a => a.id === nextUpcomingExecution.activityId) || null;
  }, [nextUpcomingExecution, dynamicActivities]);

  // TIMER / CRONÔMETRO EVENTS
  const startExecution = (execId: string) => {
    if (isReadOnly) {
      alert("Acesso Negado: Este cockpit está em modo de Apenas Leitura para gestores. Modificações não são permitidas.");
      return;
    }
    const nowStr = new Date().toISOString();
    
    setAppState(prev => {
      // Find current execution
      const list: Execution[] = prev.executions.map(e => {
        if (e.id === execId) {
          // Calculate if we are starting with an anomaly / delay
          const [schedHour, schedMin] = e.scheduledTime.split(':').map(Number);
          const schedDate = new Date();
          schedDate.setHours(schedHour, schedMin, 0, 0);
          
          const actualStart = new Date(nowStr);
          const delayMs = actualStart.getTime() - schedDate.getTime();
          const delaySecs = delayMs > 0 ? Math.floor(delayMs / 1000) : 0;
          
          let statusStr: ExecutionStatus = e.status;
          let delaySecondsValue = e.delaySeconds;

          // If delayed more than 5 minutes (300s) and config is enabled, mark delayed
          if (delaySecs > 300) {
            statusStr = 'ATRASADO' as ExecutionStatus;
            delaySecondsValue = delaySecs;
          }

          return {
            ...e,
            status: 'EM_EXECUCAO' as ExecutionStatus,
            startedAt: nowStr,
            delaySeconds: delaySecondsValue > 0 ? delaySecondsValue : undefined
          };
        }
        return e;
      });

      return {
        ...prev,
        executions: list,
        currentExecutionId: execId
      };
    });

    // Automatically set focus screen if it wasn't opened
    setSelectedExecutionId(execId);
  };

  const pauseExecution = (execId: string) => {
    if (isReadOnly) {
      alert("Acesso Negado: Este cockpit está em modo de Apenas Leitura para gestores. Modificações não são permitidas.");
      return;
    }
    setAppState(prev => {
      const list: Execution[] = prev.executions.map(e => {
        if (e.id === execId) {
          // Calculate duration accumulated so far
          let accumulatedSecs = e.durationSeconds || 0;
          if (e.startedAt) {
            const start = new Date(e.startedAt).getTime();
            const now = Date.now();
            accumulatedSecs += Math.floor((now - start) / 1000);
          }

          return {
            ...e,
            status: 'PENDENTE' as ExecutionStatus,
            startedAt: undefined, // pause clears active running state
            durationSeconds: accumulatedSecs > 0 ? accumulatedSecs : undefined
          };
        }
        return e;
      });

      return {
        ...prev,
        executions: list,
        currentExecutionId: null
      };
    });
  };

  const resetExecution = (execId: string) => {
    if (isReadOnly) {
      alert("Acesso Negado: Este cockpit está em modo de Apenas Leitura para gestores. Modificações não são permitidas.");
      return;
    }
    setAppState(prev => {
      const list: Execution[] = prev.executions.map(e => {
        if (e.id === execId) {
          return {
            id: e.id,
            activityId: e.activityId,
            date: e.date,
            scheduledTime: e.scheduledTime,
            status: 'PENDENTE' as ExecutionStatus
          };
        }
        return e;
      });
      return {
        ...prev,
        executions: list,
        currentExecutionId: prev.currentExecutionId === execId ? null : prev.currentExecutionId
      };
    });
  };

  const completeExecution = (execId: string, elapsedSeconds: number) => {
    if (isReadOnly) {
      alert("Acesso Negado: Este cockpit está em modo de Apenas Leitura para gestores. Modificações não são permitidas.");
      return;
    }
    const nowStr = new Date().toISOString();
    const exec = executions.find(e => e.id === execId);
    const act = dynamicActivities.find(a => a.id === exec?.activityId);

    if (!exec || !act) return;

    // Check if there was an active delay
    const [schedHour, schedMin] = exec.scheduledTime.split(':').map(Number);
    const schedDate = new Date();
    schedDate.setHours(schedHour, schedMin, 0, 0);
    
    const actualEnd = new Date(nowStr);
    const delayMs = actualEnd.getTime() - schedDate.getTime();
    const delaySecs = delayMs > 0 ? Math.floor(delayMs / 1000) : 0;

    const isAtrasado = delaySecs > 300; // delay is more than 5 minutes

    if (isAtrasado && config.enableDelayAlerts && !exec.delayReason) {
      // Trigger delay prompt modal before final confirmation!
      setTempCompletedExecId(execId);
      setTempElapsed(elapsedSeconds);
      setModalActivity(act);
      
      const enrichedExec: Execution = {
        ...exec,
        durationSeconds: elapsedSeconds,
        delaySeconds: delaySecs,
        status: 'ATRASADO' as ExecutionStatus
      };
      setModalExecution(enrichedExec);
      setModalType('delay_prompt');
    } else {
      // Complete directly
      finalizeExecutionSave(execId, elapsedSeconds, delaySecs);
    }
  };

  const finalizeExecutionSave = (
    execId: string, 
    elapsedSeconds: number, 
    delaySecs: number, 
    delayDetails?: { reason: string; explanation: string; informed: string; helper: string }
  ) => {
    const nowStr = new Date().toISOString();
    const exec = executions.find(e => e.id === execId);
    const act = dynamicActivities.find(a => a.id === exec?.activityId);

    if (!exec || !act) return;

    setAppState(prev => {
      const list: Execution[] = prev.executions.map(e => {
        if (e.id === execId) {
          return {
            ...e,
            status: 'CONCLUIDO' as ExecutionStatus,
            completedAt: nowStr,
            durationSeconds: elapsedSeconds,
            delaySeconds: delaySecs > 0 ? delaySecs : undefined,
            delayReason: delayDetails?.reason || e.delayReason,
            notes: delayDetails?.explanation 
              ? `[DESVIO] Motivo: ${delayDetails.reason}. Explicação: ${delayDetails.explanation}. Informado: ${delayDetails.informed}. Resolvido com: ${delayDetails.helper}`
              : e.notes,
            informedPerson: delayDetails?.informed || e.informedPerson,
            helperPerson: delayDetails?.helper || e.helperPerson
          };
        }
        return e;
      });

      return {
        ...prev,
        executions: list,
        currentExecutionId: null
      };
    });

    // Load congratulation pop-up
    const finalizedExec: Execution = {
      ...exec,
      status: 'CONCLUIDO' as ExecutionStatus,
      completedAt: nowStr,
      durationSeconds: elapsedSeconds,
      delaySeconds: delaySecs > 0 ? delaySecs : undefined,
      delayReason: delayDetails?.reason,
      informedPerson: delayDetails?.informed,
      helperPerson: delayDetails?.helper
    };

    setModalActivity(act);
    setModalExecution(finalizedExec);
    setModalType('congratulations');

    // Trigger Google Sheets SheetDB automatic logging in real-time
    sheetsService.appendRow(finalizedExec, act);
  };

  // SUBMIT DELAY FORM
  const handleDelayPromptSubmit = (data: {
    reason: string;
    explanation: string;
    informed: string;
    helper: string;
  }) => {
    if (!tempCompletedExecId) return;
    
    // Finalize
    finalizeExecutionSave(tempCompletedExecId, tempElapsed, modalExecution?.delaySeconds || 0, data);
    
    // Clear temp states
    setTempCompletedExecId(null);
    setTempElapsed(0);
  };

  // SCHEDULER TRIGGER ACTIONS
  const handleSchedulerAlertTrigger = (exec: Execution, act: Activity) => {
    if (config.popupEnabled) {
      setModalActivity(act);
      setModalExecution(exec);
      setModalType('alert');
    }
  };

  // MODAL BUTTON ACTIONS
  const handleModalStartActivity = () => {
    if (modalExecution) {
      startExecution(modalExecution.id);
      setModalType(null);
    }
  };

  const handleModalPostponeActivity = (minutes: number) => {
    if (modalExecution) {
      setAppState(prev => {
        const list = prev.executions.map(e => {
          if (e.id === modalExecution.id) {
            // Postpone: push scheduledTime minutes ahead
            const [h, m] = e.scheduledTime.split(':').map(Number);
            const d = new Date();
            d.setHours(h, m + minutes, 0, 0);
            const newTime = `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
            return {
              ...e,
              scheduledTime: newTime
            };
          }
          return e;
        });
        return { ...prev, executions: list };
      });
      setModalType(null);
    }
  };

  const handleModalNextActivity = () => {
    setModalType(null);
    if (nextSpotlightExecution) {
      setSelectedExecutionId(nextSpotlightExecution.id);
      setIsFocoActive(true); // jump back into focuser
    }
  };

  // CONFIGURATION SAVE
  const handleSaveConfig = (newConfig: UserConfig) => {
    if (isReadOnly) {
      alert("Acesso Negado: Alteração de configuração desabilitada no modo de visualização de gestores.");
      return;
    }
    setAppState(prev => ({
      ...prev,
      config: newConfig
    }));
  };

  const handleTriggerBreak = (breakType: 'LUNCH' | 'COFFEE') => {
    if (isReadOnly) return;
    setAppState(prev => {
      const newState = {
        ...prev,
        activeBreak: breakType
      };
      storageService.saveState(newState);
      return newState;
    });
  };

  const handleEndBreak = () => {
    if (isReadOnly) return;
    setAppState(prev => {
      const newState = {
        ...prev,
        activeBreak: null
      };
      storageService.saveState(newState);
      return newState;
    });
  };

  const handleResetAllData = () => {
    if (isReadOnly) {
      alert("Acesso Negado: Limpeza de dados desabilitada no modo de visualização de gestores.");
      return;
    }
    const cleared = storageService.resetTodayExecutions();
    setAppState(prev => ({
      ...prev,
      executions: cleared,
      currentExecutionId: null
    }));
    setSelectedExecutionId(null);
    setIsFocoActive(false);
  };

  // FORCE MANUAL EXECUTION CREATION
  const handleForceCreateExecution = (activityId: string, scheduledTime: string) => {
    const todayStr = storageService.getTodayDateString();
    const newExec: Execution = {
      id: `${activityId}-${scheduledTime}-${Date.now()}`,
      activityId,
      date: todayStr,
      scheduledTime,
      status: 'PENDENTE'
    };
    
    setAppState(prev => {
      const exists = prev.executions.some(e => e.activityId === activityId && e.scheduledTime === scheduledTime);
      if (exists) return prev;
      
      const updatedList = [...prev.executions, newExec].sort((a, b) => a.scheduledTime.localeCompare(b.scheduledTime));
      return {
        ...prev,
        executions: updatedList
      };
    });
  };

  return (
    <div className="min-h-screen bg-[#F2F2F2] flex flex-col lg:flex-row font-inter">
      
      {/* Background Active Scheduler (Silent Web Audio chime inside) */}
      <SchedulerAlerts
        executions={executions}
        activities={dynamicActivities}
        soundEnabled={config.soundEnabled}
        onTriggerAlert={handleSchedulerAlertTrigger}
        alertOffsetMinutes={config.alertOffsetMinutes}
        isPaused={isReadOnly}
      />

      {/* Main Corporate Sidebar Navbar */}
      <Navbar
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        soundEnabled={config.soundEnabled}
        toggleSound={() => handleSaveConfig({ ...config, soundEnabled: !config.soundEnabled })}
        isFocoActive={isFocoActive}
        setIsFocoActive={setIsFocoActive}
        isReadOnly={isReadOnly}
        brand={systemConfig.teamBrand}
        role={systemConfig.user.role}
        onChangeRole={handleRoleChange}
      />

      {/* RIGHT WORKSPACE PANELS CONTAINER */}
      <div className="flex-1 flex flex-col min-w-0">
        
        {/* Manager View Mode persistent banner */}
        {isReadOnly && (
          <div className="bg-[#0339A6] text-white px-6 py-3.5 flex items-center justify-between border-b border-[#022b80] shadow-md animate-fade-in relative z-20 shrink-0">
            <div className="flex items-center gap-3">
              <span className="text-base">👁️</span>
              <div>
                <span className="text-xs font-black font-sora uppercase tracking-wider block">
                  Painel do Gestor · Modo de Visualização Ativo
                </span>
                <span className="text-[10px] text-blue-200 block mt-0.5 font-medium">
                  Acompanhamento em tempo real (Apenas Leitura). A integridade das rotinas operacionais está protegida de edições acidentais.
                </span>
              </div>
            </div>

            {/* Blinking Pause Alert for the Manager when an active break is set */}
            {appState.activeBreak ? (
              <div className="flex items-center gap-2 bg-[#F21D2F] border border-red-500 px-3.5 py-2 rounded-lg animate-pulse text-white shadow-lg shrink-0">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-white"></span>
                </span>
                <span className="text-xs font-black uppercase tracking-wider font-sora flex items-center gap-1.5">
                  ⚠️ OPERADOR EM PAUSA: {appState.activeBreak === 'LUNCH' ? 'ALMOÇO 🥪' : 'CAFÉ ☕'}
                </span>
              </div>
            ) : (
              <span className="text-[10px] bg-white/20 border border-white/20 px-2.5 py-1 rounded-full font-bold uppercase tracking-wider font-mono shrink-0">
                🔒 Modo Seguro
              </span>
            )}
          </div>
        )}

        {/* MODAL POPUPS CONTROLLER */}
        <ActiveModal
          isOpen={modalType !== null}
          type={modalType || 'alert'}
          activity={modalActivity}
          execution={modalExecution}
          onClose={() => setModalType(null)}
          onStartActivity={handleModalStartActivity}
          onPostponeActivity={handleModalPostponeActivity}
          onSubmitDelay={handleDelayPromptSubmit}
          onNextActivity={handleModalNextActivity}
        />

        {/* MAIN ROUTER LAYOUT */}
        {isFocoActive && nextSpotlightExecution && nextSpotlightActivity ? (
          <FlippedFocuser
            execution={nextSpotlightExecution}
            activity={nextSpotlightActivity}
            nextExecution={nextUpcomingExecution}
            nextActivity={nextUpcomingActivity}
            onStartExecution={startExecution}
            onPauseExecution={pauseExecution}
            onResetExecution={resetExecution}
            onCompleteExecution={completeExecution}
            onUpdateExecutionNotes={(id, val) => {
              setAppState(prev => {
                const list = prev.executions.map(e => e.id === id ? { ...e, notes: val } : e);
                return { ...prev, executions: list };
              });
            }}
            activeExecutionId={appState.currentExecutionId}
            setIsFocoActive={setIsFocoActive}
          />
        ) : (
          <main className="flex-1 w-full p-4 md:p-6 space-y-6">
            
            {/* TAB: DASHBOARD (HOME) */}
            {currentTab === 'dashboard' && (
              <div className="space-y-6 animate-fade-in">
                
                {/* HERO GREETING BLOCK */}
                <div className="bg-white rounded-xl shadow border border-gray-100 p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 relative overflow-hidden">
                  <div className="absolute right-0 top-0 opacity-10 pointer-events-none transform translate-x-12 -translate-y-4">
                    <Sparkles size={160} className="text-[#0339A6]" />
                  </div>
                  
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-bold text-green-600 bg-green-50 border border-green-200 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                        🟢 Copiloto Ativo
                      </span>
                      <span className="text-xs text-gray-400 font-mono">
                        {currentTime.toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'short' })}
                      </span>
                    </div>
                    <div className="flex flex-col sm:flex-row sm:items-center gap-3 mt-2">
                      <h1 className="font-sora font-black text-2xl text-gray-900 leading-tight">
                        Bom dia, {config.name}! 👋
                      </h1>
                      {!isReadOnly && (
                        <button
                          onClick={handleCopyGestorLink}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition duration-200 flex items-center gap-1.5 shadow-sm shrink-0 ${
                            copiedLink
                              ? 'bg-green-600 border-green-600 text-white animate-pulse'
                              : 'bg-white hover:bg-gray-50 border-gray-200 text-gray-700 hover:text-[#0339A6]'
                          }`}
                          title="Copiar link especial de visualização em tempo real sem permissão de alteração para seus gestores"
                        >
                          <span>🔗 {copiedLink ? 'Link do Gestor Copiado!' : 'Copiar Link para Gestores'}</span>
                        </button>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 mt-1 max-w-xl">
                      Seu cockpit inteligente para controle e auditoria da rotina de faturamento da retaguarda Hapvida.
                    </p>
                  </div>

                  {/* System digital clock display */}
                  <div className="bg-gray-50 border border-gray-100 p-3 rounded-xl flex items-center gap-3">
                    <Clock className="h-6 w-6 text-[#0339A6] animate-pulse" />
                    <div>
                      <span className="block text-[10px] text-gray-400 uppercase font-bold tracking-wider leading-none">Hora de Brasília</span>
                      <span className="font-mono text-xl font-bold text-gray-800 tracking-tight block mt-1">
                        {currentTime.toLocaleTimeString('pt-BR')}
                      </span>
                    </div>
                  </div>
                </div>

                {/* STATUS & BREAKS PANEL */}
                <div className="bg-white rounded-xl shadow border border-gray-100 p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-green-50 rounded-lg text-[#1B5E20]">
                      <Clock size={24} className="animate-spin duration-3000" />
                    </div>
                    <div>
                      <span className="block text-[10px] text-gray-400 uppercase font-black tracking-wider">Status Operacional Atual</span>
                      <div className="flex items-center gap-2 mt-1">
                        {appState.activeBreak === 'LUNCH' ? (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-green-100 text-[#1B5E20] border border-[#1B5E20]/20 animate-pulse">
                            🥪 Pausa Almoço: "Karine está em pausa"
                          </span>
                        ) : appState.activeBreak === 'COFFEE' ? (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-amber-100 text-amber-800 border border-amber-600/20 animate-pulse">
                            ☕ Hora do Café: Volto logo!
                          </span>
                        ) : appState.currentExecutionId !== null ? (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-blue-100 text-[#0339A6] border border-blue-600/20 animate-pulse">
                            ⚡ Em Atividade: {activeActivity?.nome || 'Processando'}
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-green-100 text-green-700 border border-green-600/20">
                            🟢 Disponível para Tarefas
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {!isReadOnly && (
                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={() => handleTriggerBreak('LUNCH')}
                        className="px-4 py-2 text-xs font-extrabold rounded-lg transition-all duration-200 flex items-center gap-1.5 shadow-sm bg-[#1B5E20] hover:bg-[#2E7D32] text-white border border-[#1B5E20]/30"
                        title="Acionar pausa para almoço. Exibirá mensagem ao gestor"
                      >
                        <span>🥪 Pausa para Almoço</span>
                      </button>
                      <button
                        onClick={() => handleTriggerBreak('COFFEE')}
                        className="px-4 py-2 text-xs font-extrabold rounded-lg transition-all duration-200 flex items-center gap-1.5 shadow-sm bg-white hover:bg-amber-50 text-amber-800 border border-amber-300"
                        title="Acionar hora do café"
                      >
                        <span>☕ Hora do Café! Volto logo!</span>
                      </button>
                    </div>
                  )}
                </div>

                {/* SPOTLIGHT: DEVO FAZER AGORA? */}
                {nextSpotlightExecution && nextSpotlightActivity && (
                  <div className="bg-gradient-to-r from-[#0339A6] to-[#122A44] rounded-xl shadow-lg border border-blue-900/40 p-5 md:p-6 text-white flex flex-col md:flex-row items-start md:items-center justify-between gap-5 relative overflow-hidden">
                    {/* Glowing dynamic badge */}
                    <span className="absolute -right-8 -bottom-8 bg-[#F21D2F] opacity-10 h-32 w-32 rounded-full pointer-events-none" />
                    
                    <div className="space-y-1.5 flex-1">
                      <span className="text-[10px] uppercase font-black text-[#F2B705] tracking-widest block">Spotlight · Recomendação de Foco</span>
                      <h2 className="font-sora font-extrabold text-lg flex items-center gap-2">
                        <span>{nextSpotlightActivity.nome}</span>
                        <span className="text-xs font-mono font-bold bg-[#F21D2F] text-white px-2 py-0.5 rounded">
                          Previsto: {nextSpotlightExecution.scheduledTime}
                        </span>
                      </h2>
                      <p className="text-xs text-blue-100 line-clamp-1 max-w-2xl font-medium">
                        {nextSpotlightActivity.objetivo}
                      </p>
                      <div className="flex flex-wrap gap-2 pt-1 text-[10px] text-blue-200">
                        <span>Prazo estimado: <b>{nextSpotlightActivity.estimatedTime || '15'} min</b></span>
                        <span>•</span>
                        <span>Categoria: <b>{nextSpotlightActivity.categoria.toUpperCase()}</b></span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 w-full md:w-auto">
                      <button
                        onClick={() => {
                          setSelectedExecutionId(nextSpotlightExecution.id);
                          setIsFocoActive(true);
                        }}
                        className="w-full md:w-auto px-6 py-3 font-extrabold text-xs text-gray-900 bg-[#F2B705] hover:bg-[#d4a004] rounded-lg transition shadow-md flex items-center justify-center gap-1.5"
                      >
                        <Sparkles className="h-4 w-4" /> COMEÇAR NO MODO FOCO
                      </button>
                      <button
                        onClick={() => {
                          setSelectedExecutionId(nextSpotlightExecution.id);
                        }}
                        className="w-full md:w-auto px-4 py-3 font-bold text-xs text-white bg-white/10 hover:bg-white/20 border border-white/20 rounded-lg transition"
                      >
                        Ver Passos
                      </button>
                    </div>
                  </div>
                )}

                {/* KEY STATS INDICATORS BAR */}
                <Indicators executions={executions} activities={dynamicActivities} />

                {/* CORE DASHBOARD GRID: LEFT RESUMO BIs / RIGHT INSTRUCTIONS */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                  
                  {/* Resumo de BIs Panel */}
                  <div className="lg:col-span-8 flex flex-col">
                    <BiSummary
                      executions={executions}
                      activities={dynamicActivities}
                      onSelectExecution={(execId) => setSelectedExecutionId(execId)}
                      onForceCreateExecution={handleForceCreateExecution}
                      onCompleteExecution={completeExecution}
                    />
                  </div>

                  {/* Detail Panel */}
                  <div className="lg:col-span-4 h-[620px] sticky top-20">
                    {selectedExecution && selectedActivity ? (
                      <ActivityDetail
                        activity={selectedActivity}
                        execution={selectedExecution}
                        onStartExecution={startExecution}
                        onPauseExecution={pauseExecution}
                        onResetExecution={resetExecution}
                        onCompleteExecution={completeExecution}
                        onUpdateExecutionNotes={(id, notes) => {
                          setAppState(prev => {
                            const list = prev.executions.map(e => e.id === id ? { ...e, notes } : e);
                            return { ...prev, executions: list };
                          });
                        }}
                        onClose={() => setSelectedExecutionId(null)}
                        isRunningGlobal={appState.currentExecutionId !== null}
                        activeExecutionId={appState.currentExecutionId}
                      />
                    ) : (
                      <div className="bg-white rounded-xl border border-dashed border-gray-200 h-full flex flex-col items-center justify-center text-center p-8 text-gray-400">
                        <LayoutGrid className="h-10 w-10 text-gray-300 stroke-1 mb-3" />
                        <h4 className="font-sora font-semibold text-gray-700 text-sm">Nenhum BI Selecionado</h4>
                        <p className="text-xs text-gray-400 mt-1 max-w-[240px]">
                          Clique em qualquer linha na tabela de Resumo de BIs à esquerda para visualizar instruções, caminhos, robôs e iniciar o cronômetro.
                        </p>
                      </div>
                    )}
                  </div>

                </div>

              </div>
            )}

            {/* TAB: AGENDA (TIMELINE FILTER EXPANDED) */}
            {currentTab === 'agenda' && (
              <div className="animate-fade-in">
                <Timeline
                  executions={executions}
                  activities={dynamicActivities}
                  onStartExecution={startExecution}
                  onPauseExecution={pauseExecution}
                  onResetExecution={resetExecution}
                  onCompleteExecution={completeExecution}
                  onSelectExecution={(exec) => {
                    setSelectedExecutionId(exec.id);
                  }}
                  currentExecutionId={selectedExecutionId}
                  isReadOnly={isReadOnly}
                />
              </div>
            )}

            {/* TAB: BIs (CHECKLIST OPERACIONAL) */}
            {currentTab === 'bis' && (
              <BisTable
                executions={executions}
                activities={dynamicActivities}
                onStartExecution={startExecution}
                onPauseExecution={pauseExecution}
                onResetExecution={resetExecution}
                onCompleteExecution={completeExecution}
                onSelectExecution={(id) => {
                  setSelectedExecutionId(id);
                }}
                currentExecutionId={appState.currentExecutionId}
                onForceCreateExecution={handleForceCreateExecution}
                isReadOnly={isReadOnly}
              />
            )}

            {/* TAB: DIRECTORIES (MAPA DE PASTAS E SERVIDORES) */}
            {currentTab === 'directories' && (
              <DirectoriesPanel
                activities={dynamicActivities}
                onSelectExecutionByActivityId={(actId) => {
                  const exec = executions.find(e => e.activityId === actId);
                  if (exec) {
                    setSelectedExecutionId(exec.id);
                    setCurrentTab('dashboard');
                  } else {
                    handleForceCreateExecution(actId, '12:00');
                    alert('Atividade gerada no painel! Criamos uma execução manual para você auditá-la no cockpit.');
                    setCurrentTab('dashboard');
                  }
                }}
              />
            )}

            {/* TAB: MARCOS DO MÊS */}
            {currentTab === 'marcos' && (
              <MonthlyMilestones
                executions={executions}
                activities={dynamicActivities}
                onForceCreateExecution={handleForceCreateExecution}
                onSelectExecutionByActivityId={(actId) => {
                  const exec = executions.find(e => e.activityId === actId);
                  if (exec) {
                    setSelectedExecutionId(exec.id);
                    setCurrentTab('dashboard');
                  } else {
                    handleForceCreateExecution(actId, '10:00');
                    alert('Uma execução manual avulsa foi aberta no seu painel para auditoria deste marco contábil!');
                    setCurrentTab('dashboard');
                  }
                }}
              />
            )}

            {/* TAB: ADMIN PANEL */}
            {currentTab === 'admin' && systemConfig.user.role === 'ADMIN' && (
              <div className="animate-fade-in">
                <AdminPanel
                  appState={appState}
                  setAppState={setAppState}
                  onSaveConfig={(updatedState) => {
                    setAppState(updatedState);
                    storageService.saveState(updatedState);
                  }}
                />
              </div>
            )}

            {/* TAB: MONITORING PANEL */}
            {currentTab === 'monitoring_panel' && (
              <div className="animate-fade-in">
                <MonitoringPanel
                  appState={appState}
                  setAppState={setAppState}
                  onSaveConfig={(updatedState) => {
                    setAppState(updatedState);
                    storageService.saveState(updatedState);
                  }}
                />
              </div>
            )}

            {/* TAB: SETTINGS PANEL */}
            {currentTab === 'config' && (
              <div className="animate-fade-in">
                <ConfigPanel
                  config={config}
                  onSaveConfig={handleSaveConfig}
                  onResetAllData={handleResetAllData}
                  googleUser={googleUser}
                  googleToken={googleToken}
                  isConnectingSheets={isConnectingSheets}
                  onGoogleLogin={handleGoogleLogin}
                  onGoogleLogout={handleGoogleLogout}
                  onCreateNewSheet={handleCreateNewSheet}
                  onBulkSync={handleBulkSyncToSheets}
                />
              </div>
            )}

          </main>
        )}

        {/* FOOTER */}
        <footer className="bg-white border-t border-gray-200 mt-auto py-6 text-center text-xs text-gray-400 print:hidden">
          <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <span><b>{systemConfig.teamBrand.name}</b> · {systemConfig.teamBrand.subtitle}</span>
            <span>Desenvolvido para auditoria interna e monitoramento operacional · {systemConfig.user.name}</span>
          </div>
        </footer>

      </div>

      {/* FLASHING BREAK OVERLAY POPUP */}
      {appState.activeBreak && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className={`p-8 rounded-2xl max-w-lg w-full text-center border-4 ${
            appState.activeBreak === 'LUNCH'
              ? 'border-[#1B5E20] bg-green-950 text-green-100 shadow-[0_0_60px_rgba(27,94,32,0.8)]'
              : 'border-amber-600 bg-amber-950 text-amber-100 shadow-[0_0_60px_rgba(217,119,6,0.8)]'
          } animate-pulse duration-1000 relative overflow-hidden`}>
            
            {/* Blinking animated light rings */}
            <div className="absolute inset-0 pointer-events-none opacity-10 flex items-center justify-center">
              <div className="h-64 w-64 rounded-full border-8 border-current animate-ping" />
            </div>

            {/* Glowing Icon */}
            <div className="mx-auto h-20 w-20 rounded-full flex items-center justify-center mb-6 bg-white/10 animate-bounce">
              {appState.activeBreak === 'LUNCH' ? (
                <span className="text-5xl">🥪</span>
              ) : (
                <span className="text-5xl">☕</span>
              )}
            </div>

            {/* Blinking / Flashing title */}
            <h2 className="font-sora font-black text-3xl tracking-tight uppercase leading-tight mb-4 animate-pulse">
              {appState.activeBreak === 'LUNCH' ? (
                <span className="text-[#66BB6A] drop-shadow-[0_2px_10px_rgba(102,187,106,0.5)]">
                  Pausa Almoço Ativa
                </span>
              ) : (
                <span className="text-amber-400 drop-shadow-[0_2px_10px_rgba(251,191,36,0.5)]">
                  Hora do Café!
                </span>
              )}
            </h2>

            {/* Core Message */}
            <div className="bg-black/30 rounded-xl p-4 border border-white/5 mb-6 text-sm">
              <span className="font-mono text-xs font-bold uppercase text-white/50 block mb-1">
                Mensagem transmitida ao Gestor:
              </span>
              <p className="font-black text-lg text-white font-sora">
                {appState.activeBreak === 'LUNCH' 
                  ? 'Karine está em pausa'
                  : 'Hora do café! Volto logo!'
                }
              </p>
            </div>

            <p className="text-xs text-white/70 mb-8 max-w-sm mx-auto leading-relaxed">
              {appState.activeBreak === 'LUNCH'
                ? 'Seu cockpit operacional está pausado para que você possa almoçar com tranquilidade. Seu progresso está salvo e protegido de modificações.'
                : 'Pausa para recarregar as energias! Aproveite seu cafezinho. Volte assim que terminar para retomar as auditorias.'
              }
            </p>

            {/* Return button (Karine only) */}
            {isReadOnly ? (
              <div className="bg-blue-900/30 border border-blue-500/30 p-3 rounded-lg">
                <span className="text-xs font-bold text-blue-300 block">
                  🛡️ Painel de Gestor (Modo Leitura)
                </span>
                <span className="text-[10px] text-blue-400 block mt-0.5">
                  Você está visualizando o status de pausa em tempo real.
                </span>
              </div>
            ) : (
              <button
                onClick={handleEndBreak}
                className={`w-full py-4 px-6 text-sm font-black rounded-xl shadow-lg transition-all transform hover:scale-[1.02] flex items-center justify-center gap-1.5 ${
                  appState.activeBreak === 'LUNCH'
                    ? 'bg-[#66BB6A] hover:bg-[#81C784] text-green-950'
                    : 'bg-amber-400 hover:bg-amber-300 text-amber-950'
                }`}
              >
                <span>VOLTAR AO TRABALHO ⚡</span>
              </button>
            )}

          </div>
        </div>
      )}

    </div>
  );
}
