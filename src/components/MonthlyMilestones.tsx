import React, { useMemo, useState } from 'react';
import { Activity, Execution } from '../types';
import { storageService } from '../services/storageService';
import { Calendar, AlertCircle, Clock, CheckCircle2, ChevronRight, HelpCircle, BadgeInfo, CalendarDays, RefreshCw } from 'lucide-react';
import { CycleRecurrents } from './CycleRecurrents';

interface MonthlyMilestonesProps {
  executions: Execution[];
  activities: Activity[];
  onForceCreateExecution: (activityId: string, scheduledTime: string) => void;
  onSelectExecutionByActivityId: (actId: string) => void;
}

export const MonthlyMilestones: React.FC<MonthlyMilestonesProps> = ({
  executions,
  activities,
  onForceCreateExecution,
  onSelectExecutionByActivityId
}) => {
  const [activeMode, setActiveMode] = useState<'marcos' | 'ciclos'>('marcos');
  
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

  return (
    <div className="space-y-6">
      {/* SELETOR DE MODO INTERNO */}
      <div className="flex bg-gray-100 p-1 rounded-xl w-fit gap-1 shadow-sm border border-gray-200">
        <button
          onClick={() => setActiveMode('marcos')}
          className={`px-5 py-2 text-xs font-black rounded-lg transition duration-200 flex items-center gap-2 leading-none ${
            activeMode === 'marcos'
              ? 'bg-[#0339A6] text-white shadow'
              : 'text-gray-500 hover:text-gray-800'
          }`}
        >
          <Calendar size={14} />
          Marcos do Mês
        </button>
        <button
          onClick={() => setActiveMode('ciclos')}
          className={`px-5 py-2 text-xs font-black rounded-lg transition duration-200 flex items-center gap-2 leading-none ${
            activeMode === 'ciclos'
              ? 'bg-[#0339A6] text-white shadow'
              : 'text-gray-500 hover:text-gray-800'
          }`}
        >
          <RefreshCw size={14} className={activeMode === 'ciclos' ? 'animate-spin' : ''} />
          Ciclos Operacionais
        </button>
      </div>

      {activeMode === 'ciclos' ? (
        <CycleRecurrents
          executions={executions}
          activities={activities}
          onForceCreateExecution={onForceCreateExecution}
          onSelectExecutionByActivityId={onSelectExecutionByActivityId}
        />
      ) : (
        <div className="bg-white rounded-xl shadow border border-gray-100 p-6 space-y-6 animate-fade-in">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-gray-100">
            <div>
              <h2 className="font-sora font-black text-xl text-gray-900">Marcos do Mês</h2>
              <p className="text-xs text-gray-400 mt-1">
                Garantia de conformidade para fluxos críticos disparados em cadências específicas de dias úteis e fechamento de competência.
              </p>
            </div>
            
            {/* Status Tracker Widget */}
            <div className="bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 flex items-center gap-3">
              <Calendar className="h-5 w-5 text-[#0339A6]" />
              <div className="text-xs leading-none">
                <span className="text-gray-400 uppercase font-bold text-[9px] tracking-wider block">Hoje é</span>
                <span className="font-bold text-gray-800 text-sm block mt-1">Dia {dayOfMonth} de {currentMonthName} ({currentYear})</span>
                <span className="text-[10px] text-[#0339A6] font-medium block mt-1">
                  {nthBusinessDay}º Dia Útil do Mês {isLastDayOfMonth && '· ⚠️ Virada de Mês hoje!'}
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
                nthBusinessDay === 5 ? 'bg-green-100 text-green-700 border border-green-200' : 'bg-blue-50 text-blue-700 border border-blue-100'
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
                isLastDayOfMonth ? 'bg-green-100 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-100'
              }`}>
                {isLastDayOfMonth ? 'Ativo Hoje!' : 'Último Dia do Mês'}
              </span>
            </div>
          </div>

          {/* Tabela de Atividades de Marcos */}
          <div className="border border-gray-100 rounded-xl overflow-hidden mt-6">
            <div className="bg-gray-50 border-b border-gray-100 p-4">
              <h3 className="font-sora font-extrabold text-sm text-gray-800">Processos de Marcos Regulatórios</h3>
            </div>
            <div className="divide-y divide-gray-100">
              {milestoneActivities.map(activity => {
                // Verificar se esta atividade possui alguma execução hoje
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
                        <span>Horário: <b className="text-gray-600">{activity.horario.join(' / ')}</b></span>
                        <span>•</span>
                        <span>Tipo: <b className="text-gray-600">{activity.tipoExecucao}</b></span>
                        <span>•</span>
                        <span>Criticidade: <b className="text-red-500 font-bold">{activity.criticidade}</b></span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2.5">
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
              })}
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
    </div>
  );
};
