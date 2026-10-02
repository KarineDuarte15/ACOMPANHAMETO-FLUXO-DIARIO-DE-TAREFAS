import React, { useState } from 'react';
import { Execution, Activity, ExecutionStatus } from '../types';
import { 
  CheckSquare, Square, Play, Pause, Eye, AlertCircle, HelpCircle, 
  ShieldAlert, Clock, CheckCircle2, ChevronRight, X, Copy, Check, RotateCcw
} from 'lucide-react';

interface BisTableProps {
  executions: Execution[];
  activities: Activity[];
  onStartExecution: (execId: string) => void;
  onPauseExecution: (execId: string) => void;
  onResetExecution: (execId: string) => void;
  onCompleteExecution: (execId: string, elapsed: number) => void;
  onSelectExecution: (execId: string) => void;
  currentExecutionId: string | null;
  onForceCreateExecution: (activityId: string, scheduledTime: string) => void;
  isReadOnly?: boolean;
}

export const BisTable: React.FC<BisTableProps> = ({
  executions,
  activities,
  onStartExecution,
  onPauseExecution,
  onResetExecution,
  onCompleteExecution,
  onSelectExecution,
  currentExecutionId,
  onForceCreateExecution,
  isReadOnly = false
}) => {
  // local states for popup and quick-copy
  const [popupExecId, setPopupExecId] = useState<string | null>(null);
  const [copiedPathIndex, setCopiedPathIndex] = useState<number | null>(null);

  // Filtrar apenas atividades que representem "BI" e estejam ativas na rotina
  const biActivities = activities.filter(act => act.categoria === 'BI' && act.ativo);

  // 1. Calcular progresso do Checklist Operacional
  const completedBIsCount = biActivities.filter(activity => {
    const activeExecs = executions.filter(e => e.activityId === activity.id);
    return activeExecs.length > 0 && activeExecs.every(e => e.status === 'CONCLUIDO');
  }).length;
  const totalBIsCount = biActivities.length;
  const progressPercent = totalBIsCount ? Math.round((completedBIsCount / totalBIsCount) * 100) : 0;

  // 2. Filtrar tudo que está em execução no momento (apenas categoria BI)
  const runningBIs = executions.filter(e => 
    e.status === 'EM_EXECUCAO' && 
    biActivities.some(act => act.id === e.activityId)
  );

  const handleCopyPath = (pathStr: string, idx: number) => {
    navigator.clipboard.writeText(pathStr);
    setCopiedPathIndex(idx);
    setTimeout(() => setCopiedPathIndex(null), 2000);
  };

  // Encontrar o BI/Atividade e Execução selecionada para exibir o popup local
  const selectedPopupExecution = executions.find(e => e.id === popupExecId);
  const selectedPopupActivity = selectedPopupExecution 
    ? biActivities.find(a => a.id === selectedPopupExecution.activityId) 
    : null;

  return (
    <div className="space-y-6 animate-fade-in">
      
      {/* HEADER */}
      <div className="bg-white rounded-xl shadow border border-gray-100 p-6">
        <h2 className="font-sora font-black text-xl text-gray-900">Checklist Operacional de BIs</h2>
        <p className="text-xs text-gray-400 mt-1">
          Painel centralizador para acompanhamento, auditoria e controle de publicação dos BIs da diretoria e gerência.
        </p>
      </div>

      {/* BOX DE PROGRESSE E ATIVIDADES EM EXECUÇÃO */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* PROGRESS BOX */}
        <div className="bg-white rounded-xl shadow border border-gray-100 p-5 flex flex-col justify-between">
          <div>
            <span className="text-[10px] uppercase font-black tracking-wider text-gray-400">Progresso do Checklist</span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-3xl font-black font-sora text-[#0339A6]">{progressPercent}%</span>
              <span className="text-xs text-gray-500 font-semibold">({completedBIsCount} de {totalBIsCount} concluídos)</span>
            </div>
            
            <div className="w-full bg-gray-100 rounded-full h-3.5 mt-4 overflow-hidden border border-gray-200">
              <div 
                className="bg-[#2E7D32] h-full rounded-full transition-all duration-500 ease-out"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
          <p className="text-xs text-gray-400 mt-4 leading-relaxed font-medium">
            Complete todos os BIs programados seguindo a ordem de precedência operacional.
          </p>
        </div>

        {/* CURRENTLY RUNNING BOX */}
        <div className="bg-white rounded-xl shadow border border-gray-100 p-5 flex flex-col justify-between">
          <div>
            <span className="text-[10px] uppercase font-black tracking-wider text-gray-400 block mb-3">
              BIs Em Execução Ativa ⚡
            </span>

            {runningBIs.length > 0 ? (
              <div className="space-y-3 max-h-[140px] overflow-y-auto pr-1">
                {runningBIs.map(exec => {
                  const act = biActivities.find(a => a.id === exec.activityId);
                  return (
                    <div key={exec.id} className="flex items-center justify-between p-3 rounded-lg bg-green-50/50 border border-green-100">
                      <div className="min-w-0 flex-1">
                        <span className="font-bold text-xs text-gray-800 block truncate">{act?.nome}</span>
                        <span className="text-[10px] text-green-700 font-medium block mt-0.5">
                          Iniciado às: {exec.startedAt ? new Date(exec.startedAt).toLocaleTimeString('pt-BR') : '--:--'}
                        </span>
                      </div>
                      
                      {!isReadOnly && (
                        <div className="flex items-center gap-1.5 ml-3">
                          <button
                            onClick={() => onPauseExecution(exec.id)}
                            className="p-1.5 bg-amber-500 hover:bg-amber-600 text-white text-[10px] font-bold rounded shadow transition flex items-center gap-1"
                            title="Pausar Atividade"
                          >
                            <Pause className="h-3 w-3" />
                          </button>
                          <button
                            onClick={() => onCompleteExecution(exec.id, 0)}
                            className="px-2.5 py-1.5 bg-[#2E7D32] hover:bg-[#1B5E20] text-white text-[10px] font-bold rounded shadow transition flex items-center gap-1"
                            title="Concluir Atividade"
                          >
                            <Check className="h-3 w-3" /> Concluir
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-6 text-center text-gray-400 border border-dashed border-gray-200 rounded-lg">
                <Clock className="h-6 w-6 text-gray-300 stroke-1 mb-1.5 animate-pulse" />
                <span className="text-xs font-semibold">Nenhum BI sendo executado</span>
                <span className="text-[10px] text-gray-400 mt-0.5">Use as ações na tabela abaixo para iniciar</span>
              </div>
            )}
          </div>
        </div>

      </div>

      {/* TABLE BOX */}
      <div className="bg-white rounded-xl shadow border border-gray-100 overflow-hidden p-6">
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
                const activeExecs = executions.filter(e => e.activityId === activity.id);
                const isP0 = activity.prioridade === 'P0';
                const isP1 = activity.prioridade === 'P1';
                const isP2 = activity.prioridade === 'P2';

                if (activeExecs.length === 0) {
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
                        <button 
                          onClick={() => {
                            onForceCreateExecution(activity.id, activity.horario[0] || '09:00');
                            setTimeout(() => {
                              const updatedExec = executions.find(e => e.activityId === activity.id);
                              if (updatedExec) {
                                setPopupExecId(updatedExec.id);
                              }
                            }, 300);
                          }}
                          className="text-left font-bold text-gray-600 hover:text-[#0339A6] hover:underline"
                        >
                          {activity.nome}
                        </button>
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
                  
                  const hasPendingDependencies = activity.dependencia.some(depName => {
                    const depAct = activities.find(a => a.nome === depName || a.biRelacionado === depName);
                    if (!depAct) return false;
                    const depExecs = executions.filter(e => e.activityId === depAct.id);
                    if (depExecs.length === 0) return false;
                    return depExecs.some(e => e.status !== 'CONCLUIDO');
                  });

                  return (
                    <tr key={exec.id} className={`hover:bg-gray-50 transition-colors ${isRunning ? 'bg-blue-50/20' : ''}`}>
                      <td className="py-4 px-4 text-center">
                        <div className="text-center">
                          {isCompleted ? (
                            <CheckSquare className="h-5 w-5 mx-auto text-green-600" />
                          ) : isRunning ? (
                            <span className="flex h-3 w-3 mx-auto rounded-full bg-green-500 animate-ping" />
                          ) : (
                            <Square className="h-5 w-5 mx-auto text-gray-300" />
                          )}
                        </div>
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
                        {/* Clicar no título abre o popup diretamente */}
                        <button 
                          onClick={() => setPopupExecId(exec.id)}
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
                        <div className="flex items-center justify-center gap-1.5">
                          {/* Botão de Instrução (Popup Local) */}
                          <button
                            onClick={() => setPopupExecId(exec.id)}
                            className="p-1.5 text-gray-500 hover:text-[#0339A6] hover:bg-gray-100 rounded transition"
                            title="Ver Instruções completas"
                          >
                            <Eye className="h-4 w-4" />
                          </button>

                          {/* Botões dinâmicos de início/pausa e conclusão direta conforme solicitado */}
                          {!isReadOnly && !isCompleted && (
                            <>
                              {!isRunning ? (
                                <button
                                  onClick={() => onStartExecution(exec.id)}
                                  disabled={hasPendingDependencies}
                                  className={`px-2.5 py-1 rounded text-xs font-bold transition flex items-center gap-1 ${
                                    hasPendingDependencies 
                                      ? 'bg-gray-100 text-gray-300 cursor-not-allowed' 
                                      : 'bg-[#0339A6] hover:bg-[#022b80] text-white shadow-sm'
                                  }`}
                                  title="Iniciar Atividade"
                                >
                                  <Play className="h-3.5 w-3.5" /> Iniciar
                                </button>
                              ) : (
                                <>
                                  <button
                                    onClick={() => onPauseExecution(exec.id)}
                                    className="p-1.5 bg-amber-500 hover:bg-amber-600 text-white rounded shadow transition flex items-center gap-1"
                                    title="Pausar Atividade"
                                  >
                                    <Pause className="h-3.5 w-3.5" />
                                  </button>
                                  <button
                                    onClick={() => onCompleteExecution(exec.id, 0)}
                                    className="px-2.5 py-1 bg-[#2E7D32] hover:bg-[#1B5E20] text-white text-xs font-bold rounded shadow transition flex items-center gap-1"
                                    title="Concluir Atividade"
                                  >
                                    <Check className="h-3.5 w-3.5" /> Concluir
                                  </button>
                                </>
                              )}
                            </>
                          )}

                          {isCompleted && !isReadOnly && (
                            <button
                              onClick={() => onResetExecution(exec.id)}
                              className="p-1.5 text-red-500 hover:bg-red-50 rounded transition"
                              title="Resetar conclusão"
                            >
                              <RotateCcw className="h-3.5 w-3.5" />
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
      </div>

      {/* COMPONENT POPUP MODAL (ABRE DIRETAMENTE NA ABA DE ROTINA) */}
      {popupExecId && selectedPopupExecution && selectedPopupActivity && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-gray-100 flex flex-col max-h-[85vh] overflow-hidden">
            
            {/* Modal Header */}
            <div className="p-5 border-b border-gray-100 bg-gray-50 flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase font-black tracking-wider text-gray-400">Instruções de Execução</span>
                <h3 className="font-sora font-extrabold text-[#0339A6] text-lg leading-tight mt-0.5">
                  {selectedPopupActivity.nome}
                </h3>
              </div>
              <button 
                onClick={() => setPopupExecId(null)}
                className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-200 rounded-lg transition"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-6">
              
              {/* Objective */}
              <div className="space-y-1">
                <span className="text-[10px] uppercase font-black tracking-wider text-gray-400">Objetivo</span>
                <p className="text-sm font-medium text-gray-700 bg-gray-50 border border-gray-100 p-3 rounded-lg leading-relaxed">
                  {selectedPopupActivity.objetivo}
                </p>
              </div>

              {/* Procedures / Steps */}
              <div className="space-y-3">
                <span className="text-[10px] uppercase font-black tracking-wider text-gray-400 block">Passo a Passo</span>
                <div className="space-y-2">
                  {selectedPopupActivity.instrucoes.map((inst, idx) => (
                    <div key={idx} className="flex gap-3 items-start text-sm text-gray-700 bg-white">
                      <span className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-blue-50 text-xs font-bold text-[#0339A6]">
                        {idx + 1}
                      </span>
                      <span className="pt-0.5 leading-relaxed">{inst}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Quick Copy Paths */}
              {selectedPopupActivity.paths && selectedPopupActivity.paths.length > 0 && (
                <div className="space-y-2 pt-2 border-t border-gray-100">
                  <span className="text-[10px] uppercase font-black tracking-wider text-gray-400 block">Caminhos e Servidores</span>
                  <div className="space-y-2">
                    {selectedPopupActivity.paths.map((p, idx) => (
                      <div key={idx} className="flex flex-col sm:flex-row sm:items-center justify-between p-2.5 rounded-lg border border-gray-100 bg-gray-50/50 gap-2">
                        <div className="min-w-0 flex-1">
                          <span className="block text-[9px] uppercase font-black text-gray-400">{p.label}</span>
                          <code className="text-xs text-[#0339A6] block truncate font-mono mt-0.5">{p.path}</code>
                        </div>
                        <button
                          onClick={() => handleCopyPath(p.path, idx)}
                          className={`px-3 py-1.5 text-xs font-extrabold rounded border transition flex items-center gap-1 justify-center shrink-0 ${
                            copiedPathIndex === idx
                              ? 'bg-green-50 border-green-200 text-green-700 animate-pulse'
                              : 'bg-white hover:bg-gray-50 border-gray-200 text-gray-600 shadow-sm'
                          }`}
                        >
                          <Copy className="h-3 w-3" />
                          <span>{copiedPathIndex === idx ? 'Copiado!' : 'Copiar'}</span>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Scripts */}
              {selectedPopupActivity.scripts && selectedPopupActivity.scripts.length > 0 && (
                <div className="space-y-2 pt-2 border-t border-gray-100">
                  <span className="text-[10px] uppercase font-black tracking-wider text-gray-400 block">Scripts Envolvidos</span>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedPopupActivity.scripts.map((script, idx) => (
                      <span key={idx} className="inline-flex items-center gap-1.5 text-xs font-bold bg-blue-50 border border-blue-100 text-[#0339A6] px-2.5 py-1 rounded-md font-mono">
                        📁 {script}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Contingency Procedure */}
              {selectedPopupActivity.contingency && (
                <div className="bg-red-50/50 border border-red-100 rounded-xl p-4 space-y-1.5">
                  <span className="text-[10px] uppercase font-black tracking-wider text-red-700 block">Procedimento de Contingência</span>
                  <p className="text-xs text-red-950 font-medium leading-relaxed">
                    {selectedPopupActivity.contingency}
                  </p>
                </div>
              )}

            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-gray-100 bg-gray-50 flex justify-end gap-2">
              <button
                onClick={() => setPopupExecId(null)}
                className="px-5 py-2 text-xs font-bold bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-lg transition"
              >
                Fechar
              </button>
            </div>

          </div>
        </div>
      )}

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
