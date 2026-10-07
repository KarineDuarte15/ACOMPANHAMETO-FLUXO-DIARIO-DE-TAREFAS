import React, { useMemo, useState } from 'react';
import { Activity, Execution } from '../types';
import { storageService } from '../services/storageService';
import { 
  Calendar, AlertCircle, Clock, CheckCircle2, ChevronRight, HelpCircle, 
  BadgeInfo, CalendarDays, Play, AlertTriangle, FileText, Archive,
  ListFilter, RefreshCw
} from 'lucide-react';

interface MonthlyMilestonesProps {
  executions: Execution[];
  activities: Activity[];
  onForceCreateExecution: (activityId: string, scheduledTime: string) => void;
  onSelectExecutionByActivityId: (actId: string) => void;
}

type InnerViewType = 'MARCOS' | 'CICLOS';
type CycleTabType = 'DIARIA' | 'SEMANAL' | 'QUINZENAL' | 'MENSAL' | 'SOB_DEMANDA' | 'ARQUIVO';

export const MonthlyMilestones: React.FC<MonthlyMilestonesProps> = ({
  executions,
  activities,
  onForceCreateExecution,
  onSelectExecutionByActivityId
}) => {
  const [currentView, setCurrentView] = useState<InnerViewType>('MARCOS');
  const [activeCycleTab, setActiveCycleTab] = useState<CycleTabType>('DIARIA');

  const today = new Date();
  const dayOfMonth = today.getDate();
  const currentMonthName = today.toLocaleDateString('pt-BR', { month: 'long' });
  const currentYear = today.getFullYear();

  // Calcular marcos do dia de hoje dinamicamente
  const nthBusinessDay = useMemo(() => storageService.getBusinessDayOfMonth(today), []);
  const isLastDayOfMonth = useMemo(() => storageService.isLastDayOfMonth(today), []);

  // Filtrar as atividades mapeadas para Marcos Mensais
  const milestoneActivities = activities.filter(
    act => act.frequencia === 'MARCO_MENSAL' || act.id === 'bi-alerta-vagas-telesaude-virada'
  );

  // Ciclos internos
  const cycleTabs: { id: CycleTabType; label: string; count: number }[] = useMemo(() => {
    return [
      { id: 'DIARIA', label: 'Diário', count: activities.filter(a => a.frequencia === 'DIARIA' && a.ativo).length },
      { id: 'SEMANAL', label: 'Semanal', count: activities.filter(a => a.frequencia === 'SEMANAL' && a.ativo).length },
      { id: 'QUINZENAL', label: 'Quinzenal', count: activities.filter(a => a.frequencia === 'QUINZENAL' && a.ativo).length },
      { id: 'MENSAL', label: 'Mensal', count: activities.filter(a => a.frequencia === 'MENSAL' && a.ativo).length },
      { id: 'SOB_DEMANDA', label: 'Sob Demanda', count: activities.filter(a => a.frequencia === 'SOB_DEMANDA' && a.ativo).length },
      { id: 'ARQUIVO', label: 'Arquivo (Inativo)', count: activities.filter(a => !a.ativo || a.visibilidade === 'ARQUIVO').length }
    ];
  }, [activities]);

  const filteredCycleActivities = useMemo(() => {
    if (activeCycleTab === 'ARQUIVO') {
      return activities.filter(a => !a.ativo || a.visibilidade === 'ARQUIVO');
    }
    return activities.filter(a => a.frequencia === activeCycleTab && a.ativo && a.visibilidade !== 'ARQUIVO');
  }, [activities, activeCycleTab]);

  return (
    <div className="space-y-6 animate-fade-in">
      
      {/* View Switcher Top Header */}
      <div className="bg-white rounded-xl shadow border border-gray-100 p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="p-2.5 bg-blue-50 text-[#0339A6] rounded-lg">
            <CalendarRange size={24} className="h-5 w-5 text-[#0339A6]" />
          </div>
          <div>
            <h2 className="font-sora font-black text-lg text-gray-900 leading-tight">Rotina & Frequências</h2>
            <p className="text-[11px] text-gray-400 mt-0.5">Navegue pelas rotinas organizadas por marcos regulatórios ou cadências cíclicas.</p>
          </div>
        </div>

        {/* Sliding Tab Switcher */}
        <div className="flex bg-gray-100 p-1 rounded-xl w-full sm:w-auto max-w-sm">
          <button
            onClick={() => setCurrentView('MARCOS')}
            className={`flex-1 sm:flex-initial px-5 py-2 rounded-lg text-xs font-bold transition duration-150 flex items-center justify-center gap-2 ${
              currentView === 'MARCOS' 
                ? 'bg-white text-[#0339A6] shadow-sm font-black' 
                : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            <Calendar className="h-3.5 w-3.5" />
            <span>Marcos do Mês</span>
          </button>
          <button
            onClick={() => setCurrentView('CICLOS')}
            className={`flex-1 sm:flex-initial px-5 py-2 rounded-lg text-xs font-bold transition duration-150 flex items-center justify-center gap-2 ${
              currentView === 'CICLOS' 
                ? 'bg-white text-[#0339A6] shadow-sm font-black' 
                : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            <RefreshCw className="h-3.5 w-3.5" />
            <span>Ciclos</span>
          </button>
        </div>
      </div>

      {/* RENDER VIEW: MARCOS */}
      {currentView === 'MARCOS' && (
        <div className="bg-white rounded-xl shadow border border-gray-100 p-6 space-y-6 animate-fade-in">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-gray-100">
            <div>
              <h3 className="font-sora font-black text-lg text-gray-900">Marcos de Fechamento</h3>
              <p className="text-xs text-gray-400 mt-1">
                Garantia de conformidade para fluxos críticos disparados em cadências específicas de dias úteis e fechamento de competência.
              </p>
            </div>
            
            {/* Status Tracker Widget */}
            <div className="bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 flex items-center gap-3 shrink-0">
              <Calendar className="h-5 w-5 text-[#0339A6]" />
              <div className="text-xs leading-none">
                <span className="text-gray-400 uppercase font-bold text-[9px] tracking-wider block">Hoje é</span>
                <span className="font-bold text-gray-800 text-sm block mt-1">Dia {dayOfMonth} de {currentMonthName} ({currentYear})</span>
                <span className="text-[10px] text-[#0339A6] font-medium block mt-1">
                  {nthBusinessDay}º Dia Útil do Mês {isLastDayOfMonth && '· ⚠️ Fechamento hoje!'}
                </span>
              </div>
            </div>
          </div>

          {/* Grid de Marcos */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Card: 1º Dia Útil */}
            <div className={`p-4 rounded-xl border ${nthBusinessDay === 1 ? 'bg-blue-50/50 border-[#0339A6]' : 'bg-gray-50 border-gray-100'} flex flex-col justify-between gap-3`}>
              <div>
                <span className="text-[9px] font-black uppercase text-[#0339A6]">1º Dia Útil</span>
                <h3 className="font-sora font-extrabold text-sm text-gray-900 mt-1">Médicos Novos</h3>
                <p className="text-[11px] text-gray-500 mt-1 leading-relaxed">
                  Consolidação de listagens e faturamento de novas contratações médicas na rede Hapvida.
                </p>
              </div>
              <span className="text-[10px] font-bold text-gray-400 bg-gray-200/50 px-2 py-0.5 rounded border border-gray-200 self-start">
                Status: Arquivado/Inativo
              </span>
            </div>

            {/* Card: 5º Dia Útil */}
            <div className={`p-4 rounded-xl border ${nthBusinessDay === 5 ? 'bg-blue-50/50 border-[#0339A6]' : 'bg-gray-50 border-gray-100'} flex flex-col justify-between gap-3`}>
              <div>
                <span className="text-[9px] font-black uppercase text-[#0339A6]">5º Dia Útil</span>
                <h3 className="font-sora font-extrabold text-sm text-gray-900 mt-1">Vagas TeleSaúde</h3>
                <p className="text-[11px] text-gray-500 mt-1 leading-relaxed">
                  Disparo do robô Python para checagem e upload de agendas no portal TeleSaúde Hapvida.
                </p>
              </div>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded self-start ${
                nthBusinessDay === 5 ? 'bg-green-100 text-green-700 border border-green-200 animate-pulse' : 'bg-blue-50 text-blue-700 border border-blue-100'
              }`}>
                {nthBusinessDay === 5 ? 'Ativo Hoje!' : 'Agendado'}
              </span>
            </div>

            {/* Card: 10º Dia Útil */}
            <div className={`p-4 rounded-xl border ${nthBusinessDay === 10 ? 'bg-blue-50/50 border-[#0339A6]' : 'bg-gray-50 border-gray-100'} flex flex-col justify-between gap-3`}>
              <div>
                <span className="text-[9px] font-black uppercase text-[#0339A6]">10º Dia Útil</span>
                <h3 className="font-sora font-extrabold text-sm text-gray-900 mt-1">Agendas Excluídas</h3>
                <p className="text-[11px] text-gray-500 mt-1 leading-relaxed">
                  Fluxo Alteryx focado na varredura e auditoria de consultas deletadas retroativamente.
                </p>
              </div>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded self-start ${
                nthBusinessDay === 10 ? 'bg-green-100 text-green-700 border border-green-200' : 'bg-blue-50 text-blue-700 border border-blue-100'
              }`}>
                {nthBusinessDay === 10 ? 'Ativo Hoje!' : 'Agendado'}
              </span>
            </div>

            {/* Card: Virada de Mês */}
            <div className={`p-4 rounded-xl border ${isLastDayOfMonth ? 'bg-blue-50/50 border-[#0339A6]' : 'bg-gray-50 border-gray-100'} flex flex-col justify-between gap-3`}>
              <div>
                <span className="text-[9px] font-black uppercase text-red-600">Fechamento</span>
                <h3 className="font-sora font-extrabold text-sm text-gray-900 mt-1">Virada do Mês</h3>
                <p className="text-[11px] text-gray-500 mt-1 leading-relaxed">
                  Consolidação analítica de relatórios de TeleSaúde e controle final de vagas disponíveis.
                </p>
              </div>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded self-start ${
                isLastDayOfMonth ? 'bg-green-100 text-green-700 border border-green-200 animate-pulse' : 'bg-red-50 text-red-700 border border-red-100'
              }`}>
                {isLastDayOfMonth ? 'Ativo Hoje!' : 'Último Dia do Mês'}
              </span>
            </div>
          </div>

          {/* Tabela de Atividades de Marcos */}
          <div className="border border-gray-100 rounded-xl overflow-hidden mt-6">
            <div className="bg-gray-50 border-b border-gray-100 p-4">
              <h4 className="font-sora font-extrabold text-sm text-gray-800">Processos de Marcos Regulatórios</h4>
            </div>
            <div className="divide-y divide-gray-100">
              {milestoneActivities.length === 0 ? (
                <div className="p-8 text-center text-gray-400">Nenhum marco configurado.</div>
              ) : (
                milestoneActivities.map(activity => {
                  const hasExec = executions.some(e => e.activityId === activity.id);
                  const isCompleted = executions.some(e => e.activityId === activity.id && e.status === 'CONCLUIDO');

                  return (
                    <div key={activity.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-gray-50/50 transition">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-sora font-bold text-sm text-gray-900">{activity.nome}</h4>
                          {!activity.ativo && (
                            <span className="text-[9px] font-bold bg-gray-100 text-gray-400 border border-gray-200 px-1.5 py-0.5 rounded uppercase">
                              ARQUIVADO
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-gray-500 leading-relaxed max-w-2xl">{activity.objetivo}</p>
                        <div className="flex flex-wrap gap-3 pt-1 text-[10px] text-gray-400">
                          <span>Horário: <b className="text-gray-600">{(activity.horario || []).join(' / ')}</b></span>
                          <span>•</span>
                          <span>Tipo: <b className="text-gray-600">{activity.tipoExecucao}</b></span>
                          <span>•</span>
                          <span>Criticidade: <b className="text-red-500 font-bold">{activity.criticidade}</b></span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2.5 shrink-0">
                        {activity.ativo && (
                          <>
                            {hasExec ? (
                              <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold ${
                                isCompleted ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-amber-50 text-amber-700 border border-amber-200 animate-pulse'
                              }`}>
                                {isCompleted ? <CheckCircle2 className="h-4 w-4" /> : <Clock className="h-4 w-4" />}
                                {isCompleted ? 'Finalizada Hoje' : 'Agendada para Hoje'}
                              </span>
                            ) : (
                              <button
                                onClick={() => onForceCreateExecution(activity.id, activity.horario[0] || '10:00')}
                                className="px-4 py-2 bg-[#0339A6] text-white text-xs font-bold rounded-lg shadow-sm hover:bg-[#022b80] transition flex items-center gap-1.5"
                              >
                                Ativar Manualmente
                              </button>
                            )}
                          </>
                        )}
                        <button
                          onClick={() => onSelectExecutionByActivityId(activity.id)}
                          className="p-2 text-gray-400 hover:text-[#0339A6] hover:bg-gray-100 rounded-lg transition"
                          title="Ver detalhes do processo"
                        >
                          <ChevronRight className="h-5 w-5" />
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex gap-3 text-xs text-blue-900 leading-relaxed">
            <BadgeInfo className="h-5 w-5 text-blue-500 flex-shrink-0" />
            <div>
              <strong className="block text-blue-950 font-bold mb-0.5">Metodologia de Auditoria de Cargas</strong>
              Essas rotinas regulam e validam grandes volumes gerados ao longo de competências contábeis e de regulação da Hapvida. Elas possuem prazos rígidos de execução devido a dependências críticas de terceiros. Use o acionamento manual em caso de contingência de rede ou se as bases de dados estiverem atrasadas.
            </div>
          </div>
        </div>
      )}

      {/* RENDER VIEW: CICLOS */}
      {currentView === 'CICLOS' && (
        <div className="bg-white rounded-xl shadow border border-gray-100 p-6 space-y-6 animate-fade-in">
          <div>
            <h3 className="font-sora font-black text-lg text-gray-900">Cadências Operacionais e Ciclos</h3>
            <p className="text-xs text-gray-400 mt-1">
              Navegue por todo o catálogo de fluxos organizados de acordo com sua frequência estrutural. Ative execuções manuais avulsas quando necessário.
            </p>
          </div>

          {/* Navegação de Abas Internas dos Ciclos */}
          <div className="flex flex-wrap gap-1 border-b border-gray-100 pb-1 overflow-x-auto">
            {cycleTabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveCycleTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-3 border-b-2 font-bold text-xs transition duration-150 whitespace-nowrap ${
                  activeCycleTab === tab.id
                    ? 'border-[#0339A6] text-[#0339A6] bg-blue-50/20'
                    : 'border-transparent text-gray-400 hover:text-gray-700 hover:bg-gray-50'
                }`}
              >
                <span>{tab.label}</span>
                <span className={`inline-block px-1.5 py-0.5 rounded-full text-[9px] font-black leading-none ${
                  activeCycleTab === tab.id ? 'bg-[#0339A6] text-white' : 'bg-gray-100 text-gray-500'
                }`}>
                  {tab.count}
                </span>
              </button>
            ))}
          </div>

          {/* Lista de Atividades do Ciclo Selecionado */}
          {filteredCycleActivities.length === 0 ? (
            <div className="text-center py-12 text-gray-400 border border-dashed border-gray-200 rounded-xl bg-gray-50/50">
              <CalendarDays className="h-8 w-8 mx-auto text-gray-300 stroke-1 mb-2" />
              <p className="text-sm font-semibold text-gray-600">Nenhum fluxo neste ciclo</p>
              <p className="text-xs text-gray-400 mt-1">Não há rotinas cadastradas ou ativas na cadência operacional selecionada.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredCycleActivities.map(activity => {
                const hasExec = executions.some(e => e.activityId === activity.id);
                const isCompleted = executions.some(e => e.activityId === activity.id && e.status === 'CONCLUIDO');

                return (
                  <div 
                    key={activity.id}
                    className={`border rounded-xl p-5 hover:shadow-md transition-all flex flex-col justify-between gap-4 relative overflow-hidden ${
                      !activity.ativo ? 'bg-gray-50 border-gray-100 text-gray-400 opacity-75' : 'bg-white border-gray-100'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2 border-b border-gray-50 pb-3">
                      <div>
                        <span className="text-[9px] font-black uppercase text-[#0339A6] bg-blue-50 px-1.5 py-0.5 rounded border border-blue-100">
                          {activity.categoria}
                        </span>
                        <h3 className={`font-sora font-extrabold text-sm mt-1.5 ${!activity.ativo ? 'text-gray-500' : 'text-gray-900'}`}>
                          {activity.nome}
                        </h3>
                      </div>
                      
                      <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-bold ${
                        activity.prioridade === 'P0' ? 'bg-red-50 text-red-700 border border-red-100' :
                        activity.prioridade === 'P1' ? 'bg-blue-50 text-blue-700 border border-blue-100' :
                        activity.prioridade === 'P2' ? 'bg-amber-50 text-amber-700 border border-amber-100' :
                        'bg-gray-100 text-gray-600 border border-gray-200'
                      }`}>
                        {activity.prioridade}
                      </span>
                    </div>

                    <div className="space-y-2">
                      <p className="text-xs text-gray-500 font-medium leading-relaxed">
                        {activity.objetivo}
                      </p>

                      {activity.diasSemana && activity.diasSemana.length > 0 && (
                        <div className="flex flex-wrap gap-1 items-center">
                          <span className="text-[10px] text-gray-400 font-bold mr-1">Dias:</span>
                          {activity.diasSemana.map((d, idx) => (
                            <span key={idx} className="inline-block text-[9px] font-semibold bg-gray-100 text-gray-600 px-1.5 py-0.2 rounded border border-gray-200">
                              {d}
                            </span>
                          ))}
                        </div>
                      )}

                      <div className="flex flex-wrap gap-3 text-[10px] text-gray-400 pt-1">
                        <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> Horários: <b className="text-gray-600 font-mono">{(activity.horario || []).join(', ')}</b></span>
                        <span>•</span>
                        <span>Prazo: <b className="text-gray-600">{activity.estimatedTime || '15'} min</b></span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between gap-2 pt-3 border-t border-gray-50 mt-1">
                      <button
                        onClick={() => onSelectExecutionByActivityId(activity.id)}
                        className="text-[10px] font-bold text-[#0339A6] hover:underline"
                      >
                        Ver Detalhes do Script
                      </button>

                      {activity.ativo && (
                        <>
                          {hasExec ? (
                            <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[10px] font-bold ${
                              isCompleted ? 'bg-green-50 text-green-700 border border-green-100' : 'bg-amber-50 text-amber-700 border border-amber-100 animate-pulse'
                            }`}>
                              {isCompleted ? <CheckCircle2 className="h-3.5 w-3.5" /> : <Clock className="h-3.5 w-3.5" />}
                              {isCompleted ? 'Feito Hoje' : 'Agendado Hoje'}
                            </span>
                          ) : (
                            <button
                              onClick={() => onForceCreateExecution(activity.id, activity.horario[0] || '12:00')}
                              className="px-2.5 py-1 bg-[#0339A6] hover:bg-[#022b80] text-white text-[10px] font-bold rounded shadow-sm transition flex items-center gap-1"
                            >
                              <Play className="h-3 w-3" /> Executar Hoje
                            </button>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

    </div>
  );
};

// Component helper
const CalendarRange: React.FC<any> = ({ size, className }) => {
  return <CalendarDays size={size} className={className} />;
};
