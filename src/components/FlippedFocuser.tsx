import React, { useState, useEffect, useRef } from 'react';
import { Execution, Activity } from '../types';
import { 
  Play, Pause, Check, RotateCcw, Copy, AlertTriangle, FileCode, Clock, 
  HelpCircle, Eye, Info, ChevronRight, CheckSquare, Trash2, ArrowLeft 
} from 'lucide-react';

interface FlippedFocuserProps {
  execution: Execution;
  activity: Activity;
  nextExecution: Execution | null;
  nextActivity: Activity | null;
  onPauseExecution: (execId: string) => void;
  onStartExecution: (execId: string) => void;
  onResetExecution: (execId: string) => void;
  onCompleteExecution: (execId: string, durationSec: number) => void;
  onUpdateExecutionNotes: (execId: string, notes: string) => void;
  activeExecutionId: string | null;
  setIsFocoActive: (active: boolean) => void;
}

export const FlippedFocuser: React.FC<FlippedFocuserProps> = ({
  execution,
  activity,
  nextExecution,
  nextActivity,
  onPauseExecution,
  onStartExecution,
  onResetExecution,
  onCompleteExecution,
  onUpdateExecutionNotes,
  activeExecutionId,
  setIsFocoActive
}) => {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [notes, setNotes] = useState(execution.notes || '');
  const [elapsed, setElapsed] = useState(0);
  const [currentTime, setCurrentTime] = useState(new Date());
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Synchronize internal state
  useEffect(() => {
    setNotes(execution.notes || '');
  }, [execution.notes, execution.id]);

  // Handle current clock time
  useEffect(() => {
    const timeInterval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timeInterval);
  }, []);

  const isRunningThis = activeExecutionId === execution.id;
  const isCompleted = execution.status === 'CONCLUIDO';

  // Elapsed chronometer logic
  useEffect(() => {
    if (isRunningThis) {
      const calculateElapsed = () => {
        if (!execution.startedAt) return 0;
        const start = new Date(execution.startedAt).getTime();
        const now = Date.now();
        return Math.floor((now - start) / 1000);
      };

      setElapsed(calculateElapsed());

      timerRef.current = setInterval(() => {
        setElapsed(calculateElapsed());
      }, 1000);
    } else {
      if (execution.durationSeconds) {
        setElapsed(execution.durationSeconds);
      } else {
        setElapsed(0);
      }
      if (timerRef.current) clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRunningThis, execution.startedAt, execution.durationSeconds, execution.id]);

  const formatTime = (totalSeconds: number) => {
    const hrs = Math.floor(totalSeconds / 3600);
    const mins = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;
    return `${String(hrs).padStart(2, '0')}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const handleCopy = (pathStr: string, idx: number) => {
    navigator.clipboard.writeText(pathStr);
    setCopiedIndex(idx);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-gray-900 text-white p-6 flex flex-col justify-between">
      
      {/* Top Header */}
      <div className="flex items-center justify-between pb-4 border-b border-gray-800">
        <button
          onClick={() => setIsFocoActive(false)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-gray-800 hover:bg-gray-700 text-gray-300 transition"
        >
          <ArrowLeft className="h-4 w-4" /> Sair do Modo Foco
        </button>

        <div className="text-right">
          <span className="text-xs uppercase font-extrabold tracking-widest text-[#F2B705] block">Relógio do Sistema</span>
          <span className="font-mono text-lg font-bold text-gray-200">
            {currentTime.toLocaleTimeString('pt-BR')}
          </span>
        </div>
      </div>

      {/* Main Content Layout */}
      <div className="my-8 max-w-4xl mx-auto w-full grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
        
        {/* Left: Focus Details & Steps */}
        <div className="md:col-span-7 space-y-6">
          <div>
            <span className="text-xs text-[#F2B705] font-extrabold tracking-wider uppercase block">Atividade em Foco</span>
            <h1 className="font-sora font-black text-2xl text-white mt-1 leading-tight">{activity.name}</h1>
            <p className="text-sm text-gray-400 mt-2 font-medium">{activity.objetivo}</p>
          </div>

          {/* Steps */}
          <div className="bg-gray-800 rounded-xl p-5 border border-gray-700 space-y-4 shadow-xl">
            <h3 className="font-sora font-bold text-sm text-gray-200 border-b border-gray-700 pb-2">Procedimento de Execução</h3>
            <div className="space-y-3">
              {(activity.instrucoes || []).map((inst, idx) => (
                <div key={idx} className="flex gap-3 items-start text-sm text-gray-300">
                  <span className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-blue-900 text-xs font-bold text-[#F2B705]">
                    {idx + 1}
                  </span>
                  <span className="pt-0.5 leading-relaxed">{inst}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Paths Reference */}
          {activity.paths && activity.paths.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-gray-500 uppercase tracking-widest">Caminhos Rápidos</h4>
              <div className="space-y-2">
                {activity.paths.map((p, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 rounded-lg bg-gray-800 border border-gray-700 gap-2">
                    <div className="min-w-0 flex-1">
                      <span className="block text-[9px] uppercase font-bold text-gray-500">{p.label}</span>
                      <code className="text-xs text-blue-400 block truncate font-mono mt-0.5">{p.path}</code>
                    </div>
                    <button
                      onClick={() => handleCopy(p.path, idx)}
                      className={`px-2.5 py-1 text-xs font-bold rounded border transition flex items-center gap-1 ${
                        copiedIndex === idx
                          ? 'bg-green-950 border-green-800 text-green-400'
                          : 'bg-gray-700 hover:bg-gray-600 border-gray-600 text-gray-200'
                      }`}
                    >
                      <Copy className="h-3 w-3" />
                      <span>{copiedIndex === idx ? 'Copiado!' : 'Copiar'}</span>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right: Big Chronometer Control */}
        <div className="md:col-span-5 bg-gray-800 rounded-2xl border border-gray-700 p-6 shadow-2xl flex flex-col items-center justify-center text-center space-y-6">
          
          <div>
            <span className="text-[10px] uppercase font-extrabold tracking-widest text-gray-500 block">Tempo Decorrido</span>
            <span className="font-mono text-5xl font-black text-[#F2B705] tracking-tight block mt-1">
              {formatTime(elapsed)}
            </span>
            <span className="text-xs font-bold text-gray-400 bg-gray-900 border border-gray-700 px-3 py-1 rounded-full inline-block mt-3">
              Previsto: {execution.scheduledTime}
            </span>
          </div>

          {/* Giant Buttons */}
          <div className="w-full space-y-3">
            {!isCompleted && !isRunningThis && (
              <button
                onClick={() => onStartExecution(execution.id)}
                className="w-full py-4 rounded-xl text-sm font-bold bg-green-600 hover:bg-green-700 text-white transition shadow-lg flex items-center justify-center gap-1.5"
              >
                <Play className="h-4.5 w-4.5" /> INICIAR CRONÔMETRO
              </button>
            )}

            {isRunningThis && (
              <button
                onClick={() => onPauseExecution(execution.id)}
                className="w-full py-4 rounded-xl text-sm font-bold bg-amber-500 hover:bg-amber-600 text-white transition shadow-lg flex items-center justify-center gap-1.5 animate-pulse"
              >
                <Pause className="h-4.5 w-4.5" /> PAUSAR CRONÔMETRO
              </button>
            )}

            {!isCompleted && (
              <button
                onClick={() => onCompleteExecution(execution.id, elapsed)}
                disabled={!execution.startedAt && elapsed === 0}
                className={`w-full py-3.5 rounded-xl text-sm font-bold transition shadow flex items-center justify-center gap-1.5 ${
                  !execution.startedAt && elapsed === 0
                    ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                    : 'bg-[#0339A6] hover:bg-[#122A44] text-white'
                }`}
              >
                <Check className="h-4.5 w-4.5" /> FINALIZAR ATIVIDADE
              </button>
            )}

            {isCompleted && (
              <div className="text-center space-y-2 py-4">
                <span className="text-sm font-bold text-green-400 bg-green-950/50 border border-green-800 px-4 py-2 rounded-xl inline-flex items-center gap-1.5">
                  <CheckSquare className="h-4.5 w-4.5" /> Atividade Concluída
                </span>
                <p className="text-xs text-gray-400 font-medium">Os dados foram arquivados para o relatório.</p>
              </div>
            )}
          </div>

          {/* Quick Notes Textarea */}
          <div className="w-full text-left">
            <label className="block text-[10px] uppercase font-bold text-gray-500 tracking-wider mb-1.5">Anotações rápidas</label>
            <textarea
              value={notes}
              onChange={(e) => {
                setNotes(e.target.value);
                onUpdateExecutionNotes(execution.id, e.target.value);
              }}
              placeholder="Descreva problemas ou notas operacionais..."
              rows={2}
              className="w-full text-xs bg-gray-900 border border-gray-700 rounded-lg p-2 text-gray-200 focus:outline-none focus:ring-1 focus:ring-[#F2B705] focus:border-transparent"
            />
          </div>

        </div>

      </div>

      {/* Bottom Footer Section: Next Planned Task */}
      {nextExecution && nextActivity ? (
        <div className="max-w-4xl mx-auto w-full p-4 rounded-xl bg-gray-800/40 border border-gray-800 flex items-center justify-between text-xs mt-auto">
          <div className="flex items-center gap-2">
            <span className="text-[10px] uppercase font-bold bg-[#F2B705] text-gray-900 px-2 py-0.5 rounded-full">Próxima</span>
            <span className="text-gray-300 font-medium">
              {nextExecution.scheduledTime} — <b className="text-white">{nextActivity.name}</b>
            </span>
          </div>
          <span className="text-gray-500 italic">Previsão: {nextActivity.estimatedTime || '15'} min</span>
        </div>
      ) : (
        <div className="max-w-4xl mx-auto w-full text-center text-xs text-gray-600 mt-auto">
          Fim da rotina diária. Nenhuma atividade planejada restante.
        </div>
      )}

    </div>
  );
};
