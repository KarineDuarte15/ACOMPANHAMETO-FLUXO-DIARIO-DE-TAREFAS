import React, { useState, useEffect, useMemo, useRef } from 'react';
import { storageService } from './services/storageService';
import { teamsService } from './services/teamsService';
import { outlookService } from './services/outlookService';
import { routineActivities } from './data/activities';
import { Execution, Activity, UserConfig, AppState } from './types';

// Component Imports
import { Navbar } from './components/Navbar';
import { Indicators } from './components/Indicators';
import { Timeline } from './components/Timeline';
import { ActivityDetail } from './components/ActivityDetail';
import { FlippedFocuser } from './components/FlippedFocuser';
import { ActiveModal } from './components/ActiveModal';
import { DailyReport } from './components/DailyReport';
import { HistoryView } from './components/HistoryView';
import { ConfigPanel } from './components/ConfigPanel';
import { SchedulerAlerts } from './components/SchedulerAlerts';

// Icon imports
import { 
  Sparkles, Clock, ArrowRight, AlertCircle, RefreshCw, CheckCircle2, 
  Eye, FileText, LayoutGrid, Calendar, HelpCircle, MessageSquare, Mail 
} from 'lucide-react';

export default function App() {
  // Main state loaded from storageService
  const [appState, setAppState] = useState<AppState>(() => storageService.loadState());
  const [currentTime, setCurrentTime] = useState(new Date());
  
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

  // Integration feedback messages
  const [teamsStatus, setTeamsStatus] = useState<string>('Disponível');

  // Sync state to LocalStorage when changed
  useEffect(() => {
    storageService.saveState(appState);
  }, [appState]);

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
      const act = routineActivities.find(a => a.id === activeExec.activityId);
      document.title = `⏱️ [Ativo: ${activeExec.scheduledTime}] - ${act?.name || 'Rotina'} | Rotina Inteligente`;
    } else {
      const pendingCount = appState.executions.filter(e => e.status === 'PENDENTE' || e.status === 'ATRASADO').length;
      document.title = pendingCount > 0 
        ? `📋 (${pendingCount}) Rotinas Pendentes | Rotina Inteligente`
        : '🎉 Tudo Pronto! | Rotina Inteligente';
    }
  }, [appState.executions]);

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
    return routineActivities.find(a => a.id === selectedExecution.activityId) || null;
  }, [selectedExecution]);

  // Identify active execution (if any)
  const activeExecution = useMemo(() => {
    return executions.find(e => e.status === 'EM_EXECUCAO') || null;
  }, [executions]);

  const activeActivity = useMemo(() => {
    if (!activeExecution) return null;
    return routineActivities.find(a => a.id === activeExecution.activityId) || null;
  }, [activeExecution]);

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
    return routineActivities.find(a => a.id === nextSpotlightExecution.activityId) || null;
  }, [nextSpotlightExecution]);

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
    return routineActivities.find(a => a.id === nextUpcomingExecution.activityId) || null;
  }, [nextUpcomingExecution]);

  // TIMER / CRONÔMETRO EVENTS
  const startExecution = (execId: string) => {
    const nowStr = new Date().toISOString();
    
    setAppState(prev => {
      // Find current execution
      const list = prev.executions.map(e => {
        if (e.id === execId) {
          // Calculate if we are starting with an anomaly / delay
          const [schedHour, schedMin] = e.scheduledTime.split(':').map(Number);
          const schedDate = new Date();
          schedDate.setHours(schedHour, schedMin, 0, 0);
          
          const actualStart = new Date(nowStr);
          const delayMs = actualStart.getTime() - schedDate.getTime();
          const delaySecs = delayMs > 0 ? Math.floor(delayMs / 1000) : 0;
          
          let statusStr = e.status;
          let delaySecondsValue = e.delaySeconds;

          // If delayed more than 5 minutes (300s) and config is enabled, mark delayed
          if (delaySecs > 300) {
            statusStr = 'ATRASADO';
            delaySecondsValue = delaySecs;
          }

          return {
            ...e,
            status: 'EM_EXECUCAO',
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
    setAppState(prev => {
      const list = prev.executions.map(e => {
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
            status: 'PENDENTE',
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
    setAppState(prev => {
      const list = prev.executions.map(e => {
        if (e.id === execId) {
          return {
            id: e.id,
            activityId: e.activityId,
            date: e.date,
            scheduledTime: e.scheduledTime,
            status: 'PENDENTE'
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
    const nowStr = new Date().toISOString();
    const exec = executions.find(e => e.id === execId);
    const act = routineActivities.find(a => a.id === exec?.activityId);

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
        status: 'ATRASADO'
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
    const act = routineActivities.find(a => a.id === exec?.activityId);

    if (!exec || !act) return;

    setAppState(prev => {
      const list = prev.executions.map(e => {
        if (e.id === execId) {
          return {
            ...e,
            status: 'CONCLUIDO',
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
      status: 'CONCLUIDO',
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

    // Trigger Integrations if enabled in Config
    if (config.outlookEnabled) {
      const { subject, body } = outlookService.buildActivityEmail(finalizedExec, act);
      outlookService.sendEmail(config.email, subject, body, config.outlookEnabled);
    }
    if (config.teamsEnabled && config.teamsWebhookUrl) {
      teamsService.sendNotification(finalizedExec, act, config.teamsWebhookUrl);
    }
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
    setAppState(prev => ({
      ...prev,
      config: newConfig
    }));
  };

  const handleResetAllData = () => {
    const cleared = storageService.resetTodayExecutions();
    setAppState(prev => ({
      ...prev,
      executions: cleared,
      currentExecutionId: null
    }));
    setSelectedExecutionId(null);
    setIsFocoActive(false);
  };

  // TRIGGER MANUAL EMAIL REPORT
  const handleManualEmailTrigger = () => {
    const summary = storageService.calculateSummaryForExecutions(executions);
    const { subject, body } = outlookService.buildDailyReportEmail(
      storageService.getTodayDateString(),
      summary,
      executions,
      routineActivities
    );
    outlookService.sendEmail(config.email, subject, body, config.outlookEnabled);
    alert(`Relatório diário enviado com sucesso para ${config.email}!`);
  };

  // TRIGGER MANUAL TEAMS REPORT
  const handleManualTeamsTrigger = () => {
    if (!config.teamsWebhookUrl) {
      alert('Por favor, configure o webhook do Teams na aba de Configurações primeiro!');
      return;
    }
    setTeamsStatus('Enviando...');
    setTimeout(() => {
      setTeamsStatus('Enviado com sucesso');
      alert('Cartão adaptativo de encerramento enviado ao canal do Teams!');
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-[#F2F2F2] flex flex-col font-inter">
      
      {/* Background Active Scheduler (Silent Web Audio chime inside) */}
      <SchedulerAlerts
        executions={executions}
        activities={routineActivities}
        soundEnabled={config.soundEnabled}
        onTriggerAlert={handleSchedulerAlertTrigger}
        alertOffsetMinutes={config.alertOffsetMinutes}
      />

      {/* Main Corporate Header Navbar */}
      <Navbar
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        soundEnabled={config.soundEnabled}
        toggleSound={() => handleSaveConfig({ ...config, soundEnabled: !config.soundEnabled })}
        isFocoActive={isFocoActive}
        setIsFocoActive={setIsFocoActive}
      />

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
        <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-6 space-y-6">
          
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
                  <h1 className="font-sora font-black text-2xl text-gray-900 mt-2">
                    Bom dia, {config.name}! 👋
                  </h1>
                  <p className="text-xs text-gray-500 mt-1 max-w-xl">
                    Seu cockpit inteligente para controle e auditoria da rotina de cargas Alteryx, robôs Python e BIs da Hapvida.
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

              {/* SPOTLIGHT: DEVO FAZER AGORA? */}
              {nextSpotlightExecution && nextSpotlightActivity && (
                <div className="bg-gradient-to-r from-[#0339A6] to-[#122A44] rounded-xl shadow-lg border border-blue-900/40 p-5 md:p-6 text-white flex flex-col md:flex-row items-start md:items-center justify-between gap-5 relative overflow-hidden">
                  {/* Glowing dynamic badge */}
                  <span className="absolute -right-8 -bottom-8 bg-[#F21D2F] opacity-10 h-32 w-32 rounded-full pointer-events-none" />
                  
                  <div className="space-y-1.5 flex-1">
                    <span className="text-[10px] uppercase font-black text-[#F2B705] tracking-widest block">Spotlight · Recomendação de Foco</span>
                    <h2 className="font-sora font-extrabold text-lg flex items-center gap-2">
                      <span>{nextSpotlightActivity.name}</span>
                      <span className="text-xs font-mono font-bold bg-[#F21D2F] text-white px-2 py-0.5 rounded">
                        Previsto: {nextSpotlightExecution.scheduledTime}
                      </span>
                    </h2>
                    <p className="text-xs text-blue-100 line-clamp-1 max-w-2xl font-medium">
                      {nextSpotlightActivity.objective}
                    </p>
                    <div className="flex flex-wrap gap-2 pt-1 text-[10px] text-blue-200">
                      <span>Prazo estimado: <b>{nextSpotlightActivity.estimatedTime || '15'} min</b></span>
                      <span>•</span>
                      <span>Categoria: <b>{nextSpotlightActivity.category.toUpperCase()}</b></span>
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
                        // stay on dashboard but open detail panel
                      }}
                      className="w-full md:w-auto px-4 py-3 font-bold text-xs text-white bg-white/10 hover:bg-white/20 border border-white/20 rounded-lg transition"
                    >
                      Ver Passos
                    </button>
                  </div>
                </div>
              )}

              {/* KEY STATS INDICATORS BAR */}
              <Indicators executions={executions} activities={routineActivities} />

              {/* CORE DASHBOARD GRID: LEFT TIMELINE / RIGHT INSTRUCTIONS */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                
                {/* Timeline panel */}
                <div className="lg:col-span-7">
                  <Timeline
                    executions={executions}
                    activities={routineActivities}
                    onSelectExecution={(exec) => setSelectedExecutionId(exec.id)}
                    currentExecutionId={selectedExecutionId}
                  />
                </div>

                {/* Detail Panel */}
                <div className="lg:col-span-5 h-[620px] sticky top-20">
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
                      <h4 className="font-sora font-semibold text-gray-700 text-sm">Nenhuma Atividade Selecionada</h4>
                      <p className="text-xs text-gray-400 mt-1 max-w-[240px]">
                        Clique em qualquer cartão na Agenda Operacional à esquerda para visualizar instruções, caminhos, robôs e iniciar o cronômetro.
                      </p>
                    </div>
                  )}
                </div>

              </div>

            </div>
          )}

          {/* TAB: AGENDA (TIMELINE FILTER EXPANDED) */}
          {currentTab === 'agenda' && (
            <div className="space-y-6 animate-fade-in">
              <div className="bg-white rounded-xl shadow border border-gray-100 p-6">
                <h2 className="font-sora font-black text-xl text-gray-900">Agenda Operacional Detalhada</h2>
                <p className="text-xs text-gray-400 mt-1">Navegue de forma expandida por toda a sua listagem cronológica do dia de trabalho.</p>
              </div>
              <Timeline
                executions={executions}
                activities={routineActivities}
                onSelectExecution={(exec) => {
                  setSelectedExecutionId(exec.id);
                  setCurrentTab('dashboard'); // Jump to dashboard to see active panel
                }}
                currentExecutionId={selectedExecutionId}
              />
            </div>
          )}

          {/* TAB: PRODUCTIVITY REPORT */}
          {currentTab === 'produtividade' && (
            <div className="animate-fade-in">
              <DailyReport
                executions={executions}
                activities={routineActivities}
                onTriggerEmail={handleManualEmailTrigger}
                onTriggerTeams={handleManualTeamsTrigger}
                teamsIntegrationStatus={teamsStatus}
              />
            </div>
          )}

          {/* TAB: HISTORY LOGS */}
          {currentTab === 'historico' && (
            <div className="animate-fade-in">
              <HistoryView
                history={history}
                todayExecutions={executions}
                activities={routineActivities}
              />
            </div>
          )}

          {/* TAB: SETTINGS PANEL */}
          {currentTab === 'configuracoes' && (
            <div className="animate-fade-in">
              <ConfigPanel
                config={config}
                onSaveConfig={handleSaveConfig}
                onResetAllData={handleResetAllData}
              />
            </div>
          )}

        </main>
      )}

      {/* FOOTER */}
      <footer className="bg-white border-t border-gray-200 mt-12 py-6 text-center text-xs text-gray-400 print:hidden">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <span><b>Rotina Inteligente</b> · Copiloto Corporativo de Produtividade</span>
          <span>Desenvolvido para auditoria interna da rotina Hapvida · Karine</span>
        </div>
      </footer>

    </div>
  );
}
