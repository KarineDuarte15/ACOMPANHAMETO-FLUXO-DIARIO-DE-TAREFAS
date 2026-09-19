import React from 'react';
import { Execution, Activity, ExecutionStatus } from '../types';
import { CheckSquare, Square, Play, Eye, AlertCircle, HelpCircle, ShieldAlert } from 'lucide-react';

interface BisTableProps {
  executions: Execution[];
  activities: Activity[];
  onStartExecution: (execId: string) => void;
  onCompleteExecution: (execId: string, elapsed: number) => void;
  onSelectExecution: (execId: string) => void;
  currentExecutionId: string | null;
  onForceCreateExecution: (activityId: string, scheduledTime: string) => void;
}

export const BisTable: React.FC<BisTableProps> = ({
  executions,
  activities,
  onStartExecution,
  onCompleteExecution,
  onSelectExecution,
  currentExecutionId,
  onForceCreateExecution
}) => {
  // Filtrar apenas atividades que representem "BI" e estejam ativas na rotina
  const biActivities = activities.filter(act => act.categoria === 'BI' && act.ativo);

  return (
    <div className="bg-white rounded-xl shadow border border-gray-100 overflow-hidden animate-fade-in space-y-6 p-6">
      <div>
        <h2 className="font-sora font-black text-xl text-gray-900">Checklist Operacional de BIs</h2>
        <p className="text-xs text-gray-400 mt-1">
          Painel centralizador para acompanhamento, auditoria e controle de publicação dos BIs da diretoria e gerência.
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[900px]">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100 text-[11px] font-bold text-gray-400 uppercase tracking-wider">
              <th className="py-4 px-4 w-12 text-center">✓</th>
              <th className="py-4 px-4 w-28">Prioridade</th>
              <th className="py-4 px-4">BI / Processo</th>
              <th className="py-4 px-4">Horário/Cadência</th>
              <th className="py-4 px-4">Dependências</th>
              <th className="py-4 px-4">Tipo</th>
              <th className="py-4 px-4">Criticidade</th>
              <th className="py-4 px-4">Status</th>
              <th className="py-4 px-4 text-center">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 text-sm">
            {biActivities.map(activity => {
              // Buscar se existe alguma execução de hoje para esta atividade
              const activeExecs = executions.filter(e => e.activityId === activity.id);
              const isP0 = activity.prioridade === 'P0';
              const isP1 = activity.prioridade === 'P1';
              const isP2 = activity.prioridade === 'P2';

              // Se houver múltiplas execuções, listar de forma expandida ou colapsada
              if (activeExecs.length === 0) {
                // Atividade fora do ciclo hoje (ex: quinzenais ou mensais)
                return (
                  <tr key={activity.id} className="hover:bg-gray-50/50 bg-gray-50/10 text-gray-400 transition-colors">
                    <td className="py-4 px-4 text-center opacity-40">
                      <Square className="h-4 w-4 mx-auto text-gray-300" />
                    </td>
                    <td className="py-4 px-4">
                      <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-bold ${
                        isP0 ? 'bg-red-50 text-red-700 border border-red-100' :
                        isP1 ? 'bg-blue-50 text-blue-700 border border-blue-100' :
                        isP2 ? 'bg-amber-50 text-amber-700 border border-amber-100' :
                        'bg-gray-100 text-gray-700 border border-gray-200'
                      }`}>
                        {activity.prioridade}
                      </span>
                    </td>
                    <td className="py-4 px-4 font-semibold text-gray-500">
                      {activity.nome}
                      <span className="block text-[10px] text-gray-400 font-normal mt-0.5">{activity.objetivo}</span>
                    </td>
                    <td className="py-4 px-4 text-xs font-mono">
                      {activity.frequencia}
                    </td>
                    <td className="py-4 px-4 text-xs max-w-[150px] truncate" title={activity.dependencia.join(', ')}>
                      {activity.dependencia.length > 0 ? activity.dependencia.join(', ') : 'Nenhuma'}
                    </td>
                    <td className="py-4 px-4 text-xs font-medium">
                      {activity.tipoExecucao}
                    </td>
                    <td className="py-4 px-4">
                      <span className={`inline-flex items-center text-[10px] font-bold uppercase ${
                        activity.criticidade === 'CRITICA' ? 'text-red-500' :
                        activity.criticidade === 'ALTA' ? 'text-blue-500' :
                        'text-amber-500'
                      }`}>
                        {activity.criticidade}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-gray-100 text-gray-500">
                        FORA DO CICLO
                      </span>
                    </td>
                    <td className="py-4 px-4 text-center">
                      <button 
                        onClick={() => onForceCreateExecution(activity.id, activity.horario[0] || '09:00')}
                        className="px-2.5 py-1 bg-[#0339A6] text-white text-[10px] font-bold rounded shadow-sm hover:bg-[#022b80] transition"
                        title="Acionar execução manual avulsa para hoje"
                      >
                        Acionar Hoje
                      </button>
                    </td>
                  </tr>
                );
              }

              return activeExecs.map(exec => {
                const isCompleted = exec.status === 'CONCLUIDO';
                const isRunning = exec.status === 'EM_EXECUCAO';
                const isBlocked = exec.status === 'BLOQUEADO';
                
                // Checar dependências bloqueantes
                const hasPendingDependencies = activity.dependencia.some(depName => {
                  // Achar atividade que gera essa dependência
                  const depAct = activities.find(a => a.nome === depName || a.biRelacionado === depName);
                  if (!depAct) return false;
                  // Checar se as execuções de hoje da dependência estão concluídas
                  const depExecs = executions.filter(e => e.activityId === depAct.id);
                  if (depExecs.length === 0) return false; // se não gerou hoje, não bloqueia
                  return depExecs.some(e => e.status !== 'CONCLUIDO');
                });

                return (
                  <tr key={exec.id} className={`hover:bg-gray-50 transition-colors ${isRunning ? 'bg-blue-50/20' : ''}`}>
                    <td className="py-4 px-4 text-center">
                      <button
                        onClick={() => {
                          if (isCompleted) return;
                          if (hasPendingDependencies) return;
                          
                          if (isRunning) {
                            onCompleteExecution(exec.id, 300); // concluir
                          } else {
                            onStartExecution(exec.id); // iniciar
                          }
                        }}
                        disabled={isCompleted}
                        className={`text-center focus:outline-none ${isCompleted ? 'text-green-600 cursor-not-allowed' : 'text-[#0339A6] hover:text-[#022b80]'}`}
                      >
                        {isCompleted ? (
                          <CheckSquare className="h-5 w-5 mx-auto" />
                        ) : (
                          <Square className="h-5 w-5 mx-auto text-gray-300 hover:border-gray-400" />
                        )}
                      </button>
                    </td>
                    <td className="py-4 px-4">
                      <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-bold ${
                        isP0 ? 'bg-red-50 text-red-700 border border-red-100' :
                        isP1 ? 'bg-blue-50 text-blue-700 border border-blue-100' :
                        isP2 ? 'bg-amber-50 text-amber-700 border border-amber-100' :
                        'bg-gray-100 text-gray-700 border border-gray-200'
                      }`}>
                        {activity.prioridade}
                      </span>
                    </td>
                    <td className="py-4 px-4 font-semibold text-gray-900">
                      <button 
                        onClick={() => onSelectExecution(exec.id)}
                        className="text-left font-bold text-gray-900 hover:text-[#0339A6] hover:underline block focus:outline-none"
                      >
                        {activity.nome}
                      </button>
                      <span className="block text-[10px] text-gray-400 font-normal mt-0.5">{activity.objetivo}</span>
                    </td>
                    <td className="py-4 px-4 text-xs font-mono font-bold text-gray-600">
                      {exec.scheduledTime} ({activity.frequencia})
                    </td>
                    <td className="py-4 px-4 text-xs text-gray-500">
                      {activity.dependencia.length > 0 ? (
                        <div className="flex flex-col gap-0.5">
                          {activity.dependencia.map((dep, idx) => (
                            <span key={idx} className="inline-block truncate max-w-[150px]" title={dep}>• {dep}</span>
                          ))}
                        </div>
                      ) : (
                        <span className="text-gray-300">Nenhuma</span>
                      )}
                    </td>
                    <td className="py-4 px-4 text-xs text-gray-600">
                      {activity.tipoExecucao}
                    </td>
                    <td className="py-4 px-4">
                      <span className={`inline-flex items-center text-[10px] font-bold uppercase ${
                        activity.criticidade === 'CRITICA' ? 'text-red-600 bg-red-50 px-1.5 py-0.5 rounded border border-red-100' :
                        activity.criticidade === 'ALTA' ? 'text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-100' :
                        'text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-100'
                      }`}>
                        {activity.criticidade}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      {isCompleted ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-green-50 text-green-700 border border-green-200">
                          CONCLUÍDA
                        </span>
                      ) : isRunning ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200 animate-pulse">
                          EM EXECUÇÃO
                        </span>
                      ) : hasPendingDependencies ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-red-50 text-red-700 border border-red-200" title="Dependência bloqueante pendente">
                          🔒 BLOQUEADA
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-gray-100 text-gray-500 border border-gray-200">
                          PENDENTE
                        </span>
                      )}
                    </td>
                    <td className="py-4 px-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => onSelectExecution(exec.id)}
                          className="p-1.5 text-gray-500 hover:text-[#0339A6] hover:bg-gray-100 rounded transition"
                          title="Ver Instruções completas"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        {!isCompleted && !isRunning && (
                          <button
                            onClick={() => onStartExecution(exec.id)}
                            disabled={hasPendingDependencies}
                            className={`p-1.5 rounded transition ${hasPendingDependencies ? 'text-gray-300 cursor-not-allowed' : 'text-green-600 hover:bg-green-50'}`}
                            title="Iniciar Cronômetro"
                          >
                            <Play className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              });
            })}
          </tbody>
        </table>
      </div>

      {/* Regra de Bloqueio Explícita */}
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex gap-3 text-amber-900 text-xs">
        <ShieldAlert className="h-5 w-5 text-amber-500 flex-shrink-0" />
        <div className="space-y-1">
          <p className="font-bold">Regra de Foco e Bloqueio Operacional</p>
          <p className="leading-relaxed">
            Se um BI possui dependência de uma base ou outro script anterior (ex: <strong>BI Painel dos Médicos</strong> depende de <strong>Base Marcação Falta Espera</strong>), o sistema impede a conclusão ou dispara um aviso visual de bloqueio 🔒. Certifique-se de seguir a sequência cronológica para garantir integridade analítica nos dados de faturamento.
          </p>
        </div>
      </div>
    </div>
  );
};
