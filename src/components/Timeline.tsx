import React, { useState } from 'react';
import { Execution, Activity } from '../types';
import { 
  Clock, Play, Pause, CheckCircle2, AlertCircle, Eye, ChevronDown, ChevronUp, 
  Copy, FileCode, Folder, HelpCircle, AlertOctagon, CheckCircle, X, Check, RotateCcw
} from 'lucide-react';

interface TimelineProps {
  executions: Execution[];
  activities: Activity[];
  onStartExecution: (execId: string) => void;
  onPauseExecution: (execId: string) => void;
  onResetExecution: (execId: string) => void;
  onCompleteExecution: (execId: string, elapsed: number) => void;
  onSelectExecution: (execution: Execution) => void;
  currentExecutionId: string | null;
  isReadOnly?: boolean;
}

export const Timeline: React.FC<TimelineProps> = ({
  executions,
  activities,
  onStartExecution,
  onPauseExecution,
  onResetExecution,
  onCompleteExecution,
  onSelectExecution,
  currentExecutionId,
  isReadOnly = false
}) => {
  const [expandedExecId, setExpandedExecId] = useState<string | null>(null);
  const [completedSteps, setCompletedSteps] = useState<Record<string, Record<number, boolean>>>({});
  const [copiedPath, setCopiedPath] = useState<string | null>(null);
  const [popupExecId, setPopupExecId] = useState<string | null>(null);

  // Sort executions by scheduledTime
  const sortedExecutions = [...executions].sort((a, b) => {
    return a.scheduledTime.localeCompare(b.scheduledTime);
  });

  const toggleExpand = (execId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setExpandedExecId(expandedExecId === execId ? null : execId);
  };

  const toggleStep = (execId: string, stepIdx: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setCompletedSteps(prev => {
      const execSteps = prev[execId] || {};
      return {
        ...prev,
        [execId]: {
          ...execSteps,
          [stepIdx]: !execSteps[stepIdx]
        }
      };
    });
  };

  const handleCopyPath = (path: string, e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(path);
    setCopiedPath(path);
    setTimeout(() => setCopiedPath(null), 2000);
  };

  // Calculations for progress & active execution
  const completedCount = executions.filter(e => e.status === 'CONCLUIDO').length;
  const totalCount = executions.length;
  const progressPercent = totalCount ? Math.round((completedCount / totalCount) * 100) : 0;

  const runningExecutions = executions.filter(e => e.status === 'EM_EXECUCAO');

  // Encontrar o BI selecionado para o popup local
  const selectedPopupExecution = executions.find(e => e.id === popupExecId);
  const selectedPopupActivity = selectedPopupExecution 
    ? activities.find(a => a.id === selectedPopupExecution.activityId) 
    : null;

  return (
    <div className="space-y-6">
      
      {/* HEADER */}
      <div className="bg-white rounded-xl shadow border border-gray-100 p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="font-sora font-black text-[#0339A6] text-lg">Agenda Operacional Detalhada</h3>
          <p className="text-xs text-gray-400 mt-0.5">Visão cronológica e guia passo a passo para execução de rotinas</p>
        </div>
        <span className="text-xs font-bold text-blue-800 bg-blue-50 px-3 py-1 rounded-full border border-blue-100 self-start sm:self-auto">
          {totalCount} Atividades Hoje
        </span>
      </div>

      {/* TOP DASHBOARD CONTROLS FOR TIMELINE (BOX DE PROGRESSE E ATIVIDADES EM EXECUÇÃO) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* PROGRESS BOX */}
        <div className="bg-white rounded-xl shadow border border-gray-100 p-5 flex flex-col justify-between">
          <div>
            <span className="text-[10px] uppercase font-black tracking-wider text-gray-400">Progresso da Agenda</span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-3xl font-black font-sora text-[#0339A6]">{progressPercent}%</span>
              <span className="text-xs text-gray-500 font-semibold">({completedCount} de {totalCount} concluídos)</span>
            </div>
            
            <div className="w-full bg-gray-100 rounded-full h-3.5 mt-4 overflow-hidden border border-gray-200">
              <div 
                className="bg-[#2E7D32] h-full rounded-full transition-all duration-500 ease-out"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
          <p className="text-xs text-gray-400 mt-4 leading-relaxed font-medium">
            Siga o cronograma planejado para garantir a publicação dos relatórios sem atrasos.
          </p>
        </div>

        {/* ACTIVE RUNNING BOX */}
        <div className="bg-white rounded-xl shadow border border-gray-100 p-5 flex flex-col justify-between">
          <div>
            <span className="text-[10px] uppercase font-black tracking-wider text-gray-400 block mb-3">
              Atividades Em Execução Ativa ⚡
            </span>

            {runningExecutions.length > 0 ? (
              <div className="space-y-3 max-h-[140px] overflow-y-auto pr-1">
                {runningExecutions.map(exec => {
                  const act = activities.find(a => a.id === exec.activityId);
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
                <span className="text-xs font-semibold">Nenhuma atividade sendo executada</span>
                <span className="text-[10px] text-gray-400 mt-0.5">Clique em "Iniciar" nas tarefas da agenda abaixo</span>
              </div>
            )}
          </div>
        </div>

      </div>

      {/* TIMELINE LIST */}
      <div className="bg-white rounded-xl shadow border border-gray-100 p-5 md:p-6">
        <div className="relative border-l-2 border-gray-100 ml-3 pl-6 space-y-6">
          {sortedExecutions.map((exec) => {
            const act = activities.find((a) => a.id === exec.activityId);
            if (!act) return null;

            const isCompleted = exec.status === 'CONCLUIDO';
            const isAtrasado = exec.status === 'ATRASADO';
            const isRunning = exec.status === 'EM_EXECUCAO';
            const isExpanded = expandedExecId === exec.id;

            // Determine status visual attributes
            let markerColor = 'bg-gray-200 border-gray-300 text-gray-400';
            let textColor = 'text-gray-500';
            let borderHighlight = 'border-gray-100 hover:border-gray-200 bg-white';
            let statusText = 'Pendente';
            let statusBg = 'bg-gray-100 text-gray-600 border border-gray-200';

            if (isCompleted) {
              markerColor = 'bg-green-600 border-green-400 text-white shadow-sm';
              textColor = 'text-gray-800';
              borderHighlight = 'border-green-100 bg-green-50/10 hover:border-green-200';
              statusText = 'Concluído';
              statusBg = 'bg-green-50 text-green-700 border border-green-100';
            } else if (isRunning) {
              markerColor = 'bg-[#1B5E20] border-green-300 text-white animate-pulse shadow-md';
              textColor = 'text-gray-900 font-bold';
              borderHighlight = 'border-green-200 bg-green-50/10 hover:border-green-300 shadow-sm';
              statusText = 'Em Execução';
              statusBg = 'bg-green-100 text-green-800 border border-green-200 font-bold animate-pulse';
            } else if (isAtrasado) {
              markerColor = 'bg-orange-600 border-orange-300 text-white shadow-sm';
              textColor = 'text-orange-700 font-bold';
              borderHighlight = 'border-orange-100 bg-orange-50/10 hover:border-orange-200';
              statusText = 'Atrasado';
              statusBg = 'bg-orange-50 text-orange-700 border border-orange-100 font-bold';
            }

            // Format duration if available
            let durationStr = '';
            if (exec.durationSeconds) {
              const mins = Math.floor(exec.durationSeconds / 60);
              const secs = exec.durationSeconds % 60;
              durationStr = `${mins}m ${secs}s`;
            }

            const steps = completedSteps[exec.id] || {};
            const totalStepsCount = act.instrucoes ? act.instrucoes.length : 0;
            const completedStepsCount = Object.values(steps).filter(Boolean).length;

            return (
              <div key={exec.id} className="relative group transition-all duration-200">
                {/* Timeline Bullet Marker */}
                <span className={`absolute -left-[33px] top-1.5 flex h-5 w-5 items-center justify-center rounded-full border-2 text-[10px] font-bold shadow-sm transition-all ${markerColor}`}>
                  {isCompleted ? (
                    <CheckCircle2 className="h-3 w-3" />
                  ) : isRunning ? (
                    <Clock className="h-3 w-3 animate-spin" />
                  ) : (
                    '•'
                  )}
                </span>

                {/* Agenda Card Container */}
                <div
                  className={`p-4 rounded-xl border transition flex flex-col gap-3 ${borderHighlight}`}
                >
                  {/* Header Information Line */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-mono text-sm font-bold text-[#0339A6] bg-blue-50/50 px-2 py-0.5 rounded border border-blue-100">
                          🕒 Horário: {exec.scheduledTime}
                        </span>
                        <span className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider ${statusBg}`}>
                          {statusText}
                        </span>
                        {act.prioridade && (
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                            act.prioridade === 'P0' 
                              ? 'bg-red-50 text-red-600 border-red-100'
                              : act.prioridade === 'P1'
                              ? 'bg-orange-50 text-orange-600 border-orange-100'
                              : 'bg-yellow-50 text-yellow-700 border-yellow-100'
                          }`}>
                            {act.prioridade === 'P0' ? '🔴 P0' : act.prioridade === 'P1' ? '🟠 P1' : '🟡 P2'}
                          </span>
                        )}
                        {totalStepsCount > 0 && (
                          <span className="text-[10px] bg-slate-100 text-slate-600 font-bold px-2 py-0.5 rounded border border-slate-200">
                            Passos: {completedStepsCount}/{totalStepsCount}
                          </span>
                        )}
                      </div>
                      
                      {/* Clicar no título abre popup de instruções diretamente sem redirecionar */}
                      <button 
                        onClick={() => setPopupExecId(exec.id)}
                        className={`text-base font-bold font-sora mt-1.5 transition-colors text-left block hover:text-[#0339A6] hover:underline focus:outline-none ${textColor}`}
                      >
                        {act.name}
                      </button>

                      <p className="text-xs text-gray-500 mt-1 max-w-2xl leading-relaxed">
                        {act.objetivo || 'Sem descrição cadastrada.'}
                      </p>

                      {/* Tags for duration & delay */}
                      {(durationStr || (exec.delaySeconds && exec.delaySeconds > 0)) && (
                        <div className="flex flex-wrap gap-2 mt-2">
                          {durationStr && (
                            <span className="text-[10px] bg-gray-100 text-gray-600 font-medium px-2 py-0.5 rounded border border-gray-200 flex items-center gap-1">
                              ⏱️ Auditado em: <strong>{durationStr}</strong>
                            </span>
                          )}
                          {exec.delaySeconds && exec.delaySeconds > 0 && (
                            <span className="text-[10px] bg-red-50 text-red-600 font-semibold px-2 py-0.5 rounded border border-red-100 flex items-center gap-1">
                              ⚠️ Atraso Operacional: <strong>{Math.floor(exec.delaySeconds / 60)}min</strong>
                            </span>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Actions Area with Dynamic Status controls, avoiding page jumps */}
                    <div className="flex items-center gap-2 justify-end shrink-0">
                      
                      {/* Botão de popup de instruções diretamente na página */}
                      <button
                        onClick={() => setPopupExecId(exec.id)}
                        className="p-1.8 bg-gray-50 border border-gray-200 hover:bg-gray-100 text-gray-600 rounded-lg transition"
                        title="Ver instruções completas em Popup"
                      >
                        <Eye className="h-4 w-4" />
                      </button>

                      {/* Botões In-Place */}
                      {!isReadOnly && !isCompleted && (
                        <>
                          {!isRunning ? (
                            <button 
                              onClick={() => onStartExecution(exec.id)}
                              className="text-xs font-bold text-white bg-[#0339A6] hover:bg-[#122A44] px-4 py-2 rounded-lg shadow-sm transition flex items-center gap-1.5"
                            >
                              <Play className="h-3.5 w-3.5 fill-current" />
                              <span>Iniciar</span>
                            </button>
                          ) : (
                            <div className="flex items-center gap-1.5">
                              <button 
                                onClick={() => onPauseExecution(exec.id)}
                                className="px-3 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg shadow-sm transition flex items-center gap-1.5 text-xs font-bold"
                                title="Pausar atividade"
                              >
                                <Pause className="h-3.5 w-3.5" /> Pausar
                              </button>
                              <button 
                                onClick={() => onCompleteExecution(exec.id, 0)}
                                className="px-4 py-2 bg-[#2E7D32] hover:bg-[#1B5E20] text-white rounded-lg shadow-sm transition flex items-center gap-1.5 text-xs font-bold"
                                title="Concluir atividade"
                              >
                                <Check className="h-3.5 w-3.5" /> Concluir
                              </button>
                            </div>
                          )}
                        </>
                      )}

                      {isCompleted && !isReadOnly && (
                        <button
                          onClick={() => onResetExecution(exec.id)}
                          className="p-2 border border-red-100 text-red-500 hover:bg-red-50 rounded-lg transition text-xs font-bold flex items-center gap-1"
                          title="Resetar atividade"
                        >
                          <RotateCcw className="h-3.5 w-3.5" /> Reabrir
                        </button>
                      )}

                      {/* Botão Expandir Checklist Local */}
                      <button
                        onClick={(e) => toggleExpand(exec.id, e)}
                        className={`text-xs font-bold px-3 py-2 rounded-lg border transition duration-200 flex items-center gap-1.5 ${
                          isExpanded 
                            ? 'bg-slate-100 text-slate-700 border-slate-300' 
                            : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50 hover:border-gray-300'
                        }`}
                        title="Acompanhar sub-passos no painel"
                      >
                        <span>{isExpanded ? 'Ocultar Checklist' : 'Checklist Etapas'}</span>
                        {isExpanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
                      </button>
                    </div>
                  </div>

                  {/* EXPANDED FLOW SHEET: STEP BY STEP GUIDE */}
                  {isExpanded && (
                    <div 
                      onClick={(e) => e.stopPropagation()} 
                      className="mt-4 pt-4 border-t border-slate-100 space-y-4 text-xs animate-slide-down"
                    >
                      {/* 1. Passo a Passo Interativo */}
                      {act.instrucoes && act.instrucoes.length > 0 && (
                        <div className="bg-slate-50/55 rounded-xl border border-slate-100 p-4">
                          <h5 className="font-sora font-bold text-slate-800 flex items-center gap-1.5 mb-2.5">
                            <CheckCircle className="h-4 w-4 text-green-600" />
                            Roteiro de Etapas da Operação (Checklist Interno)
                          </h5>
                          <div className="space-y-2">
                            {act.instrucoes.map((inst, idx) => {
                              const isStepDone = !!steps[idx];
                              return (
                                <div 
                                  key={idx}
                                  onClick={(e) => toggleStep(exec.id, idx, e)}
                                  className={`flex items-start gap-3 p-2 rounded-lg cursor-pointer border transition-all duration-150 ${
                                    isStepDone 
                                      ? 'bg-green-50/40 border-green-100 text-gray-500 line-through' 
                                      : 'bg-white border-slate-200/60 hover:bg-slate-50/50 hover:border-slate-300 text-gray-700'
                                  }`}
                                >
                                  <span className={`h-4.5 w-4.5 rounded border flex items-center justify-center shrink-0 mt-0.5 transition-all duration-150 ${
                                    isStepDone 
                                      ? 'bg-green-600 border-green-600 text-white' 
                                      : 'border-gray-300 bg-white'
                                  }`}>
                                    {isStepDone && <CheckCircle2 className="h-3 w-3 stroke-[3]" />}
                                  </span>
                                  <span className="leading-normal">
                                    <strong>{idx + 1}.</strong> {inst}
                                  </span>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      {/* 2. Diretórios e Caminhos UNC do Servidor */}
                      {act.diretorios && act.diretorios.length > 0 && (
                        <div className="bg-blue-50/20 rounded-xl border border-blue-100/50 p-4 space-y-2">
                          <h5 className="font-sora font-bold text-[#0339A6] flex items-center gap-1.5 mb-2">
                            <Folder className="h-4 w-4" />
                            Diretórios UNC de Rede (Servidor)
                          </h5>
                          <div className="space-y-1.5">
                            {act.diretorios.map((dir, idx) => (
                              <div key={idx} className="flex items-center justify-between gap-4 p-2 bg-white rounded-lg border border-slate-100">
                                <span className="font-mono text-[10.5px] text-slate-600 truncate flex-1 block" title={dir}>
                                  {dir}
                                </span>
                                <button
                                  onClick={(e) => handleCopyPath(dir, e)}
                                  className={`px-2.5 py-1 rounded text-[10px] font-bold border transition shrink-0 flex items-center gap-1 ${
                                    copiedPath === dir
                                      ? 'bg-green-600 border-green-600 text-white'
                                      : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100 hover:border-slate-300'
                                  }`}
                                >
                                  <Copy className="h-3 w-3" />
                                  <span>{copiedPath === dir ? 'Copiado!' : 'Copiar Caminho'}</span>
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Grid com scripts e contingência */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* 3. Scripts Envolvidos */}
                        {act.scripts && act.scripts.length > 0 && (
                          <div className="bg-slate-50/50 rounded-xl border border-slate-100 p-4">
                            <h5 className="font-sora font-bold text-slate-800 flex items-center gap-1.5 mb-2">
                              <FileCode className="h-4 w-4 text-[#F24405]" />
                              Scripts / Automações
                            </h5>
                            <div className="flex flex-wrap gap-1.5">
                              {act.scripts.map((scr, idx) => (
                                <span key={idx} className="font-mono text-[10px] bg-[#F24405]/5 text-[#F24405] font-bold px-2.5 py-1 rounded-md border border-[#F24405]/15 flex items-center gap-1">
                                  ⚡ {scr}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* 4. Plano de Contingência */}
                        {act.contingencia && act.contingencia.length > 0 && (
                          <div className="bg-red-50/15 rounded-xl border border-red-100/50 p-4">
                            <h5 className="font-sora font-bold text-red-800 flex items-center gap-1.5 mb-2">
                              <AlertOctagon className="h-4 w-4 text-red-600" />
                              Plano de Contingência (Erros)
                            </h5>
                            <div className="space-y-1">
                              {act.contingencia.map((cont, idx) => (
                                <p key={idx} className="text-slate-600 leading-normal bg-white p-1.5 rounded border border-red-100/20">
                                  💡 {cont}
                                </p>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* 5. Regras de Negócio Importantes */}
                      {act.regrasNegocio && act.regrasNegocio.length > 0 && (
                        <div className="bg-[#F2B705]/5 rounded-xl border border-[#F2B705]/20 p-4">
                          <h5 className="font-sora font-bold text-amber-800 flex items-center gap-1.5 mb-2">
                            <HelpCircle className="h-4 w-4 text-amber-600" />
                            Regras de Negócio e Críticas Operacionais
                          </h5>
                          <ul className="list-disc pl-4 space-y-1 text-slate-600 leading-normal">
                            {act.regrasNegocio.map((rule, idx) => (
                              <li key={idx}>{rule}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  )}

                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* POPUP DE INSTRUÇÕES LOCAL (ABRE DIRETAMENTE NA MESMA TELA) */}
      {popupExecId && selectedPopupExecution && selectedPopupActivity && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-gray-100 flex flex-col max-h-[85vh] overflow-hidden text-left">
            
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
            <div className="p-6 overflow-y-auto space-y-6 text-gray-800">
              
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
                          onClick={(e) => handleCopyPath(p.path, e)}
                          className="px-3 py-1.5 text-xs font-extrabold rounded border border-gray-200 bg-white hover:bg-gray-50 text-gray-600 shadow-sm flex items-center gap-1 justify-center shrink-0"
                        >
                          <Copy className="h-3 w-3" />
                          <span>Copiar</span>
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

    </div>
  );
};
