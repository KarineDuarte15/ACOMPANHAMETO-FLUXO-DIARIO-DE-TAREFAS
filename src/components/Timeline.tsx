import React from 'react';
import { Execution, Activity } from '../types';
import { Clock, Play, CheckCircle2, AlertCircle, Eye, ChevronRight } from 'lucide-react';

interface TimelineProps {
  executions: Execution[];
  activities: Activity[];
  onSelectExecution: (execution: Execution) => void;
  currentExecutionId: string | null;
}

export const Timeline: React.FC<TimelineProps> = ({
  executions,
  activities,
  onSelectExecution,
  currentExecutionId
}) => {
  // Sort executions by scheduledTime
  const sortedExecutions = [...executions].sort((a, b) => {
    return a.scheduledTime.localeCompare(b.scheduledTime);
  });

  return (
    <div className="bg-white rounded-xl shadow border border-gray-100 p-5 md:p-6">
      <div className="flex items-center justify-between mb-6 pb-3 border-b border-gray-100">
        <div>
          <h3 className="font-sora font-bold text-[#0339A6] text-base">Agenda Operacional</h3>
          <p className="text-xs text-gray-400 mt-0.5">Visão cronológica de atividades diárias</p>
        </div>
        <span className="text-xs font-bold text-gray-500 bg-[#F2F2F2] px-3 py-1 rounded-full">
          {sortedExecutions.length} Instâncias
        </span>
      </div>

      <div className="relative border-l-2 border-gray-100 ml-3 pl-6 space-y-6">
        {sortedExecutions.map((exec) => {
          const act = activities.find((a) => a.id === exec.activityId);
          if (!act) return null;

          const isActive = currentExecutionId === exec.id;
          const isCompleted = exec.status === 'CONCLUIDO';
          const isAtrasado = exec.status === 'ATRASADO';
          const isRunning = exec.status === 'EM_EXECUCAO';

          // Determine status visual attributes
          let markerColor = 'bg-gray-200 border-gray-300';
          let textColor = 'text-gray-500';
          let borderHighlight = 'border-gray-100 hover:border-gray-200';
          let statusText = 'Pendente';
          let statusBg = 'bg-gray-100 text-gray-600';

          if (isCompleted) {
            markerColor = 'bg-[#0339A6] border-blue-400 text-white';
            textColor = 'text-gray-800';
            borderHighlight = 'border-green-100 bg-green-50/10 hover:border-green-200';
            statusText = 'Concluído';
            statusBg = 'bg-green-100 text-green-700';
          } else if (isRunning) {
            markerColor = 'bg-[#F21D2F] border-red-300 text-white animate-pulse';
            textColor = 'text-gray-900';
            borderHighlight = 'border-[#F21D2F]/20 bg-[#F21D2F]/5 hover:border-[#F21D2F]/35 shadow-sm';
            statusText = 'Em Execução';
            statusBg = 'bg-red-100 text-[#F21D2F] font-bold';
          } else if (isAtrasado) {
            markerColor = 'bg-[#F24405] border-orange-300 text-white';
            textColor = 'text-[#F24405] font-semibold';
            borderHighlight = 'border-[#F24405]/20 bg-orange-50/20 hover:border-[#F24405]/30';
            statusText = 'Atrasado';
            statusBg = 'bg-orange-100 text-[#F24405] font-bold';
          } else if (isActive) {
            markerColor = 'bg-blue-600 border-blue-400 text-white';
            textColor = 'text-blue-900 font-semibold';
            borderHighlight = 'border-blue-200 bg-blue-50/30';
            statusText = 'Foco Ativo';
            statusBg = 'bg-blue-100 text-blue-700';
          }

          // Format duration if available
          let durationStr = '';
          if (exec.durationSeconds) {
            const mins = Math.floor(exec.durationSeconds / 60);
            const secs = exec.durationSeconds % 60;
            durationStr = `${mins}m ${secs}s`;
          }

          return (
            <div key={exec.id} className="relative group">
              {/* Timeline Bullet Marker */}
              <span className={`absolute -left-[33px] top-1.5 flex h-5 w-5 items-center justify-center rounded-full border-2 text-[10px] font-bold shadow-sm transition-all ${markerColor}`}>
                {isCompleted ? (
                  <CheckCircle2 className="h-3 w-3" />
                ) : isAtrasado ? (
                  <AlertCircle className="h-3 w-3" />
                ) : isRunning ? (
                  <Clock className="h-3 w-3 animate-spin" />
                ) : (
                  '•'
                )}
              </span>

              {/* Agenda Card */}
              <div
                onClick={() => onSelectExecution(exec)}
                className={`p-4 rounded-xl border transition text-left cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${borderHighlight}`}
              >
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono text-sm font-bold text-[#0339A6]">
                      {exec.scheduledTime}
                    </span>
                    <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full uppercase ${statusBg}`}>
                      {statusText}
                    </span>
                    {act.priority === 'high' && (
                      <span className="text-[10px] font-bold bg-red-50 text-[#F21D2F] border border-red-100 px-1.5 py-0.5 rounded">
                        Crítica
                      </span>
                    )}
                  </div>
                  
                  <h4 className={`text-sm font-bold font-sora mt-1 ${textColor}`}>
                    {act.name}
                  </h4>

                  {/* Context paths reference snippet */}
                  <p className="text-xs text-gray-400 mt-1 line-clamp-1 max-w-md">
                    {act.objective || 'Sem descrição.'}
                  </p>

                  {/* Duration and delay tags */}
                  {(durationStr || exec.delaySeconds) && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {durationStr && (
                        <span className="text-[10px] bg-gray-100 text-gray-600 font-medium px-2 py-0.5 rounded">
                          Duração: {durationStr}
                        </span>
                      )}
                      {exec.delaySeconds && exec.delaySeconds > 0 && (
                        <span className="text-[10px] bg-red-50 text-[#F24405] font-semibold px-2 py-0.5 rounded">
                          Atraso: {Math.floor(exec.delaySeconds / 60)}min
                        </span>
                      )}
                    </div>
                  )}
                </div>

                {/* Right Action Trigger */}
                <div className="flex items-center gap-2 justify-end">
                  <button className="text-xs font-bold text-[#0339A6] hover:text-[#122A44] bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg transition flex items-center gap-1">
                    {isRunning ? (
                      <>
                        <Clock className="h-3 w-3 animate-spin text-[#F21D2F]" />
                        <span>Ver Cronômetro</span>
                      </>
                    ) : (
                      <>
                        <Eye className="h-3 w-3" />
                        <span>Ver Instruções</span>
                      </>
                    )}
                    <ChevronRight className="h-3 w-3" />
                  </button>
                </div>

              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
