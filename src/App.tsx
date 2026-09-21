// src/App.tsx
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { storageService } from './services/storageService';
import { sheetsService } from './services/sheetsService'; 
import { routineActivities } from './data/activities';
import { Execution, Activity, UserConfig, AppState, ExecutionStatus } from './types';

// Importação dos Componentes
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
import { BisTable } from './components/BisTable';
import { DirectoriesPanel } from './components/DirectoriesPanel';
import { MonthlyMilestones } from './components/MonthlyMilestones';
import { CycleRecurrents } from './components/CycleRecurrents';
import { BiSummary } from './components/BiSummary';

import { Clock, LayoutGrid } from 'lucide-react';

export default function App() {
  // 1. ESTADOS DO REACT (HOOKS) - Sempre no topo!
  const [appState, setAppState] = useState<AppState | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());
  
  const [currentTab, setCurrentTab] = useState('dashboard');
  const [isFocoActive, setIsFocoActive] = useState(false);
  const [selectedExecutionId, setSelectedExecutionId] = useState<string | null>(null);
  
  const [modalType, setModalType] = useState<'alert' | 'delay_prompt' | 'congratulations' | null>(null);
  const [modalActivity, setModalActivity] = useState<Activity | null>(null);
  const [modalExecution, setModalExecution] = useState<Execution | null>(null);
  const [tempCompletedExecId, setTempCompletedExecId] = useState<string | null>(null);
  const [tempElapsed, setTempElapsed] = useState<number>(0);
  
  const [isReadOnly, setIsReadOnly] = useState<boolean>(() => {
    const params = new URLSearchParams(window.location.search);
    const view = params.get('view') || params.get('mode');
    return view === 'gestor' || view === 'viewer' || view === 'readonly';
  });

  // 2. EFEITOS (USEEFFECT)
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const cloudData = await storageService.loadStateCloud();
        if (cloudData) {
          setAppState(cloudData);
        } else {
          const defaultData = storageService.loadState();
          setAppState(defaultData);
          storageService.saveStateCloud(defaultData);
        }
      } catch (error) {
        console.error("Modo Offline Ativado:", error);
        setAppState(storageService.loadState());
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchInitialData();
  }, []);

  useEffect(() => {
    if (!isReadOnly && appState) {
      storageService.saveStateCloud(appState);
      storageService.saveState(appState);
    }
  }, [appState, isReadOnly]);

  useEffect(() => {
    const clockInterval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(clockInterval);
  }, []);

  useEffect(() => {
    if (!appState) return;
    const activeExec = appState.executions.find(e => e.status === 'EM_EXECUCAO');
    if (activeExec) {
      const act = routineActivities.find(a => a.id === activeExec.activityId);
      document.title = `▶ [Ativo: ${activeExec.scheduledTime}] - ${act?.name || 'Rotina'} | Rotina Inteligente`;
    } else {
      const pendingCount = appState.executions.filter(e => e.status === 'PENDENTE' || e.status === 'ATRASADO').length;
      document.title = pendingCount > 0 
        ? `⏳ (${pendingCount}) Rotinas Pendentes | Rotina Inteligente`
        : '✅ Tudo Pronto! | Rotina Inteligente';
    }
  }, [appState?.executions]);

  // 3. MEMÓRIAS (USEMEMO) - Extração segura para evitar erros caso appState seja nulo no carregamento
  const executions = appState?.executions || [];
  const config = appState?.config;
  const history = appState?.history || [];

  const selectedExecution = useMemo(() => {
    if (!selectedExecutionId) return null;
    return executions.find(e => e.id === selectedExecutionId) || null;
  }, [selectedExecutionId, executions]);

  const selectedActivity = useMemo(() => {
    if (!selectedExecution) return null;
    return routineActivities.find(a => a.id === selectedExecution.activityId) || null;
  }, [selectedExecution]);

  const activeExecution = useMemo(() => {
    return executions.find(e => e.status === 'EM_EXECUCAO') || null;
  }, [executions]);

  const activeActivity = useMemo(() => {
    if (!activeExecution) return null;
    return routineActivities.find(a => a.id === activeExecution.activityId) || null;
  }, [activeExecution]);

  const nextSpotlightExecution = useMemo(() => {
    if (activeExecution) return activeExecution;
    const pendingAndAtrasado = executions.filter(e => e.status === 'PENDENTE' || e.status === 'ATRASADO');
    if (pendingAndAtrasado.length > 0) {
      return pendingAndAtrasado[0];
    }
    return null;
  }, [executions, activeExecution]);

  const nextSpotlightActivity = useMemo(() => {
    if (!nextSpotlightExecution) return null;
    return routineActivities.find(a => a.id === nextSpotlightExecution.activityId) || null;
  }, [nextSpotlightExecution]);

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

  // 4. FUNÇÕES DE AÇÃO
  const startExecution = (execId: string) => {
    if (isReadOnly) return;
    const nowStr = new Date().toISOString();
    setAppState(prev => {
      if (!prev) return prev;
      const list = prev.executions.map(e => {
        if (e.id === execId) {
          const [schedHour, schedMin] = e.scheduledTime.split(':').map(Number);
          const schedDate = new Date();
          schedDate.setHours(schedHour, schedMin, 0, 0);
          
          const actualStart = new Date(nowStr);
          const delayMs = actualStart.getTime() - schedDate.getTime();
          const delaySecs = delayMs > 0 ? Math.floor(delayMs / 1000) : 0;
          
          let statusStr = e.status;
          let delaySecondsValue = e.delaySeconds || 0;
          if (delaySecs > 300) {
            statusStr = 'ATRASADO';
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
      return { ...prev, executions: list, currentExecutionId: execId };
    });
    setSelectedExecutionId(execId);
  };

  const pauseExecution = (execId: string) => {
    if (isReadOnly) return;
    setAppState(prev => {
      if (!prev) return prev;
      const list = prev.executions.map(e => {
        if (e.id === execId) {
          let accumulatedSecs = e.durationSeconds || 0;
          if (e.startedAt) {
            const start = new Date(e.startedAt).getTime();
            const now = Date.now();
            accumulatedSecs += Math.floor((now - start) / 1000);
          }
          return {
            ...e,
            status: 'PENDENTE' as ExecutionStatus,
            startedAt: undefined,
            durationSeconds: accumulatedSecs > 0 ? accumulatedSecs : undefined
          };
        }
        return e;
      });
      return { ...prev, executions: list, currentExecutionId: null };
    });
  };

  const resetExecution = (execId: string) => {
    if (isReadOnly) return;
    setAppState(prev => {
      if (!prev) return prev;
      const list = prev.executions.map(e => {
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
    if (isReadOnly || !config) return;
    const nowStr = new Date().toISOString();
    const exec = executions.find(e => e.id === execId);
    const act = routineActivities.find(a => a.id === exec?.activityId);
    if (!exec || !act) return;

    const [schedHour, schedMin] = exec.scheduledTime.split(':').map(Number);
    const schedDate = new Date();
    schedDate.setHours(schedHour, schedMin, 0, 0);
    
    const actualEnd = new Date(nowStr);
    const delayMs = actualEnd.getTime() - schedDate.getTime();
    const delaySecs = delayMs > 0 ? Math.floor(delayMs / 1000) : 0;
    const isAtrasado = delaySecs > 300;

    if (isAtrasado && config.enableDelayAlerts && !exec.delayReason) {
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
      if (!prev) return prev;
      const list = prev.executions.map(e => {
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
      return { ...prev, executions: list, currentExecutionId: null };
    });

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

    // INTEGRAÇÃO SHEETDB
    sheetsService.appendRow(finalizedExec, act);
  };

  const handleDelayPromptSubmit = (data: { reason: string; explanation: string; informed: string; helper: string; }) => {
    if (!tempCompletedExecId) return;
    finalizeExecutionSave(tempCompletedExecId, tempElapsed, modalExecution?.delaySeconds || 0, data);
    setTempCompletedExecId(null);
    setTempElapsed(0);
  };

  const handleSchedulerAlertTrigger = (exec: Execution, act: Activity) => {
    if (config?.popupEnabled) {
      setModalActivity(act);
      setModalExecution(exec);
      setModalType('alert');
    }
  };

  const handleModalStartActivity = () => {
    if (modalExecution) {
      startExecution(modalExecution.id);
      setModalType(null);
    }
  };

  const handleModalPostponeActivity = (minutes: number) => {
    if (modalExecution) {
      setAppState(prev => {
        if (!prev) return prev;
        const list = prev.executions.map(e => {
          if (e.id === modalExecution.id) {
            const [h, m] = e.scheduledTime.split(':').map(Number);
            const d = new Date();
            d.setHours(h, m + minutes, 0, 0);
            const newTime = `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
            return { ...e, scheduledTime: newTime };
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
      setIsFocoActive(true);
    }
  };

  const handleSaveConfig = (newConfig: UserConfig) => {
    if (isReadOnly) return;
    setAppState(prev => prev ? ({ ...prev, config: newConfig }) : prev);
  };

  const handleResetAllData = () => {
    if (isReadOnly) return;
    const cleared = storageService.resetTodayExecutions();
    setAppState(prev => prev ? ({ ...prev, executions: cleared, currentExecutionId: null }) : prev);
    setSelectedExecutionId(null);
    setIsFocoActive(false);
  };

  const handleForceCreateExecution = (activityId: string, scheduledTime: string) => {
    const todayStr = storageService.getTodayDateString();
    const newExec: Execution = {
      id: `${activityId}-${scheduledTime}-${Date.now()}`,
      activityId,
      date: todayStr,
      scheduledTime,
      status: 'PENDENTE' as ExecutionStatus
    };
    
    setAppState(prev => {
      if (!prev) return prev;
      const exists = prev.executions.some(e => e.activityId === activityId && e.scheduledTime === scheduledTime);
      if (exists) return prev;
      
      const updatedList = [...prev.executions, newExec].sort((a, b) => a.scheduledTime.localeCompare(b.scheduledTime));
      return { ...prev, executions: updatedList };
    });
  };

  // 5. RENDERIZAÇÃO CONDICIONAL - AGORA DE FORMA SEGURA (SEM QUEBRAR O REACT)
  if (isLoading || !appState || !config) {
    return (
      <div className="min-h-screen bg-[#F2F2F2] flex items-center justify-center font-inter">
        <div className="text-center space-y-4">
           <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-[#0339A6] mx-auto"></div>
           <p className="text-[#0339A6] font-bold font-sora">A sincronizar rotinas operacionais...</p>
        </div>
      </div>
    );
  }

  // 6. INTERFACE PRINCIPAL
  return (
    <div className="min-h-screen bg-[#F2F2F2] flex flex-col lg:flex-row font-inter">
      <SchedulerAlerts
        executions={executions}
        activities={routineActivities}
        soundEnabled={config.soundEnabled}
        onTriggerAlert={handleSchedulerAlertTrigger}
        alertOffsetMinutes={config.alertOffsetMinutes}
        isPaused={false}
      />
      
      <Navbar
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        soundEnabled={config.soundEnabled}
        toggleSound={() => handleSaveConfig({ ...config, soundEnabled: !config.soundEnabled })}
        isFocoActive={isFocoActive}
        setIsFocoActive={setIsFocoActive}
        isReadOnly={isReadOnly}
      />
      
      <div className="flex-1 flex flex-col min-w-0">
        {isReadOnly && (
          <div className="bg-[#0339A6] text-white px-6 py-3.5 flex items-center justify-between border-b border-[#022b80] shadow-md animate-fade-in relative z-20 shrink-0">
            <div className="flex items-center gap-3">
              <span className="text-xs font-black font-sora uppercase tracking-wider block">
                Painel do Gestor – Modo de Visualização Ativo
              </span>
            </div>
          </div>
        )}

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
                if (!prev) return prev;
                const list = prev.executions.map(e => e.id === id ? { ...e, notes: val } : e);
                return { ...prev, executions: list };
              });
            }}
            activeExecutionId={appState.currentExecutionId}
            setIsFocoActive={setIsFocoActive}
          />
        ) : (
          <main className="flex-1 w-full p-4 md:p-6 space-y-6">
            {currentTab === 'dashboard' && (
              <div className="space-y-6 animate-fade-in">
                <div className="bg-white rounded-xl shadow border border-gray-100 p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 relative overflow-hidden">
                  <div>
                    <h1 className="font-sora font-black text-2xl text-gray-900 leading-tight">
                      Bom dia, {config.name}!
                    </h1>
                  </div>
                  <div className="bg-gray-50 border border-gray-100 p-3 rounded-xl flex items-center gap-3">
                    <Clock className="h-6 w-6 text-[#0339A6] animate-pulse" />
                    <span className="font-mono text-xl font-bold text-gray-800 tracking-tight block">
                      {currentTime.toLocaleTimeString('pt-BR')}
                    </span>
                  </div>
                </div>

                <Indicators executions={executions} activities={routineActivities} />

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                  <div className="lg:col-span-8 flex flex-col">
                    <BiSummary
                      executions={executions}
                      activities={routineActivities}
                      onSelectExecution={(execId) => setSelectedExecutionId(execId)}
                      onForceCreateExecution={handleForceCreateExecution}
                      onCompleteExecution={completeExecution}
                    />
                  </div>
                  
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
                            if (!prev) return prev;
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
                          Clique numa linha na tabela à esquerda para visualizar instruções e iniciar o cronómetro.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {currentTab === 'agenda' && (
              <div className="space-y-6 animate-fade-in">
                <Timeline
                  executions={executions}
                  activities={routineActivities}
                  onSelectExecution={(exec) => {
                    setSelectedExecutionId(exec.id);
                    setCurrentTab('dashboard');
                  }}
                  currentExecutionId={selectedExecutionId}
                />
              </div>
            )}

            {currentTab === 'bis' && (
              <BisTable
                executions={executions}
                activities={routineActivities}
                onStartExecution={startExecution}
                onCompleteExecution={completeExecution}
                onSelectExecution={(id) => {
                  setSelectedExecutionId(id);
                  setCurrentTab('dashboard');
                }}
                currentExecutionId={appState.currentExecutionId}
                onForceCreateExecution={handleForceCreateExecution}
              />
            )}

            {currentTab === 'directories' && (
              <DirectoriesPanel
                activities={routineActivities}
                onSelectExecutionByActivityId={(actId) => {
                  const exec = executions.find(e => e.activityId === actId);
                  if (exec) {
                    setSelectedExecutionId(exec.id);
                    setCurrentTab('dashboard');
                  }
                }}
              />
            )}

            {currentTab === 'marcos' && (
              <MonthlyMilestones
                executions={executions}
                activities={routineActivities}
                onForceCreateExecution={handleForceCreateExecution}
                onSelectExecutionByActivityId={(actId) => {
                  const exec = executions.find(e => e.activityId === actId);
                  if (exec) {
                    setSelectedExecutionId(exec.id);
                    setCurrentTab('dashboard');
                  }
                }}
              />
            )}

            {currentTab === 'ciclos' && (
              <CycleRecurrents
                executions={executions}
                activities={routineActivities}
                onForceCreateExecution={handleForceCreateExecution}
                onSelectExecutionByActivityId={(actId) => {
                  const exec = executions.find(e => e.activityId === actId);
                  if (exec) {
                    setSelectedExecutionId(exec.id);
                    setCurrentTab('dashboard');
                  }
                }}
              />
            )}

            {currentTab === 'history' && (
              <HistoryView history={history} todayExecutions={executions} activities={routineActivities} />
            )}

            {currentTab === 'reports' && (
              <DailyReport
                executions={executions}
                activities={routineActivities}
               
              />  
            )}

            {currentTab === 'config' && (
              <ConfigPanel
                config={config}
                onSaveConfig={handleSaveConfig}
                onResetAllData={handleResetAllData}
              />
            )}
          </main>
        )}
      </div>
    </div>
  );
}