import React, { useState, useMemo } from 'react';
import { Activity, Execution } from '../types';
import { CalendarDays, Clock, Play, AlertTriangle, FileText, CheckCircle2, Archive, HelpCircle } from 'lucide-react';

interface CycleRecurrentsProps {
  executions: Execution[];
  activities: Activity[];
  onForceCreateExecution: (activityId: string, scheduledTime: string) => void;
  onSelectExecutionByActivityId: (actId: string) => void;
}

type TabType = 'DIARIA' | 'SEMANAL' | 'QUINZENAL' | 'MENSAL' | 'SOB_DEMANDA' | 'ARQUIVO';

export const CycleRecurrents: React.FC<CycleRecurrentsProps> = ({
  executions,
  activities,
  onForceCreateExecution,
  onSelectExecutionByActivityId
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('DIARIA');

  const tabs: { id: TabType; label: string; count: number }[] = useMemo(() => {
    return [
      { id: 'DIARIA', label: 'Diário', count: activities.filter(a => a.frequencia === 'DIARIA' && a.ativo).length },
      { id: 'SEMANAL', label: 'Semanal', count: activities.filter(a => a.frequencia === 'SEMANAL' && a.ativo).length },
      { id: 'QUINZENAL', label: 'Quinzenal', count: activities.filter(a => a.frequencia === 'QUINZENAL' && a.ativo).length },
      { id: 'MENSAL', label: 'Mensal', count: activities.filter(a => a.frequencia === 'MENSAL' && a.ativo).length },
      { id: 'SOB_DEMANDA', label: 'Sob Demanda', count: activities.filter(a => a.frequencia === 'SOB_DEMANDA' && a.ativo).length },
      { id: 'ARQUIVO', label: 'Arquivo (Inativo)', count: activities.filter(a => !a.ativo || a.visibilidade === 'ARQUIVO').length }
    ];
  }, [activities]);

  const filteredActivities = useMemo(() => {
    if (activeTab === 'ARQUIVO') {
      return activities.filter(a => !a.ativo || a.visibilidade === 'ARQUIVO');
    }
    return activities.filter(a => a.frequencia === activeTab && a.ativo && a.visibilidade !== 'ARQUIVO');
  }, [activities, activeTab]);

  return (
    <div className="bg-white rounded-xl shadow border border-gray-100 p-6 space-y-6 animate-fade-in">
      <div>
        <h2 className="font-sora font-black text-xl text-gray-900">Cadências Operacionais e Ciclos</h2>
        <p className="text-xs text-gray-400 mt-1">
          Navegue por todo o catálogo de fluxos organizados de acordo com sua frequência estrutural. Ative execuções manuais avulsas quando necessário.
        </p>
      </div>

      {/* Navegação de Abas Internas */}
      <div className="flex flex-wrap gap-1 border-b border-gray-100 pb-1 overflow-x-auto">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-3 border-b-2 font-bold text-xs transition duration-150 whitespace-nowrap ${
              activeTab === tab.id
                ? 'border-[#0339A6] text-[#0339A6] bg-blue-50/20'
                : 'border-transparent text-gray-400 hover:text-gray-700 hover:bg-gray-50'
            }`}
          >
            <span>{tab.label}</span>
            <span className={`inline-block px-1.5 py-0.5 rounded-full text-[9px] font-black leading-none ${
              activeTab === tab.id ? 'bg-[#0339A6] text-white' : 'bg-gray-100 text-gray-500'
            }`}>
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* Grid / List de Atividades do Ciclo */}
      {filteredActivities.length === 0 ? (
        <div className="text-center py-12 text-gray-400 border border-dashed border-gray-200 rounded-xl bg-gray-50/50">
          <CalendarDays className="h-8 w-8 mx-auto text-gray-300 stroke-1 mb-2" />
          <p className="text-sm font-semibold text-gray-600">Nenhum fluxo neste ciclo</p>
          <p className="text-xs text-gray-400 mt-1">Não há rotinas cadastradas ou ativas na cadência operacional selecionada.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredActivities.map(activity => {
            // Verificar se esta atividade possui alguma execução hoje
            const hasExec = executions.some(e => e.activityId === activity.id);
            const isCompleted = executions.some(e => e.activityId === activity.id && e.status === 'CONCLUIDO');
            
            return (
              <div 
                key={activity.id} 
                className={`border rounded-xl p-5 hover:shadow-md transition-all flex flex-col justify-between gap-4 relative overflow-hidden ${
                  !activity.ativo ? 'bg-gray-50 border-gray-100 text-gray-400 opacity-75' : 'bg-white border-gray-100'
                }`}
              >
                {/* Cabeçalho do Card */}
                <div className="flex items-start justify-between gap-2 border-b border-gray-50 pb-3">
                  <div>
                    <span className="text-[9px] font-black uppercase text-[#0339A6] bg-blue-50 px-1.5 py-0.5 rounded border border-blue-100">
                      {activity.categoria}
                    </span>
                    <h3 className={`font-sora font-extrabold text-sm mt-1.5 ${!activity.ativo ? 'text-gray-500' : 'text-gray-900'}`}>
                      {activity.nome}
                    </h3>
                  </div>
                  
                  {/* Prioridade Badge */}
                  <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-bold ${
                    activity.prioridade === 'P0' ? 'bg-red-50 text-red-700 border border-red-100' :
                    activity.prioridade === 'P1' ? 'bg-blue-50 text-blue-700 border border-blue-100' :
                    activity.prioridade === 'P2' ? 'bg-amber-50 text-amber-700 border border-amber-100' :
                    'bg-gray-100 text-gray-600 border border-gray-200'
                  }`}>
                    {activity.prioridade}
                  </span>
                </div>

                {/* Conteúdo */}
                <div className="space-y-2">
                  <p className="text-xs text-gray-500 font-medium leading-relaxed" title={activity.objetivo}>
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
                    <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> Horários: <b className="text-gray-600 font-mono">{activity.horario.join(', ')}</b></span>
                    <span>•</span>
                    <span>Prazo: <b className="text-gray-600">{activity.estimatedTime || 'Sob Demanda'}</b></span>
                  </div>
                </div>

                {/* Ações Inferiores */}
                <div className="flex items-center justify-between gap-2 pt-3 border-t border-gray-50 mt-1">
                  <button
                    onClick={() => onSelectExecutionByActivityId(activity.id)}
                    className="text-[10px] font-bold text-[#0339A6] hover:underline hover:text-[#022b80]"
                  >
                    Ver Detalhes do Script
                  </button>

                  {activity.ativo && (
                    <>
                      {hasExec ? (
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[10px] font-bold ${
                          isCompleted ? 'bg-green-50 text-green-700 border border-green-100' : 'bg-amber-50 text-amber-700 border border-amber-100'
                        }`}>
                          {isCompleted ? <CheckCircle2 className="h-3.5 w-3.5" /> : <Clock className="h-3.5 w-3.5" />}
                          {isCompleted ? 'Feito Hoje' : 'Agendado Hoje'}
                        </span>
                      ) : (
                        <button
                          onClick={() => onForceCreateExecution(activity.id, activity.horario[0] || '12:00')}
                          className="px-2.5 py-1 bg-[#0339A6] text-white text-[10px] font-bold rounded shadow-sm hover:bg-[#022b80] transition flex items-center gap-1"
                          title="Acionar uma execução manual imediata para hoje"
                        >
                          <Play className="h-3 w-3" /> Acionar Hoje
                        </button>
                      )}
                    </>
                  )}

                  {!activity.ativo && (
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-gray-400">
                      <Archive className="h-3.5 w-3.5" /> ARQUIVADO / INATIVO
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Nota corporativa */}
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex gap-3 text-xs text-amber-900 leading-relaxed">
        <AlertTriangle className="h-5 w-5 text-amber-500 flex-shrink-0" />
        <div>
          <strong className="block text-amber-950 font-bold mb-0.5">Gestão de Demandas de Ciclos Operacionais</strong>
          As atividades quinzenais (ex: <strong>MEDPREV</strong>, <strong>Lista VS</strong>) e mensais (ex: <strong>Lista Mensal Analistas</strong>) aparecem automaticamente na Agenda do Dia apenas nas datas correspondentes (ex: todo dia 15 ou 30). Este painel de Ciclos é a garantia de que as diretrizes documentadas estão mantidas integras e catalogadas, fornecendo autonomia operacional para a auditoria em qualquer momento do mês.
        </div>
      </div>
    </div>
  );
};
