import React, { useState, useEffect, useRef } from 'react';
import { Execution, Activity } from '../types';
import { 
  Play, Pause, RotateCcw, Check, Copy, FileCode, HelpCircle, 
  ChevronRight, AlertTriangle, Info, Clock, CheckSquare, Trash2, Image as ImageIcon
} from 'lucide-react';

interface ActivityDetailProps {
  activity: Activity;
  execution: Execution;
  onStartExecution: (execId: string) => void;
  onPauseExecution: (execId: string) => void;
  onResetExecution: (execId: string) => void;
  onCompleteExecution: (execId: string, durationSec: number) => void;
  onUpdateExecutionNotes: (execId: string, notes: string) => void;
  onClose: () => void;
  isRunningGlobal: boolean;
  activeExecutionId: string | null;
}

export const ActivityDetail: React.FC<ActivityDetailProps> = ({
  activity,
  execution,
  onStartExecution,
  onPauseExecution,
  onResetExecution,
  onCompleteExecution,
  onUpdateExecutionNotes,
  onClose,
  activeExecutionId
}) => {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [notes, setNotes] = useState(execution.notes || '');
  const [elapsed, setElapsed] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    setNotes(execution.notes || '');
  }, [execution.notes, execution.id]);

  const isRunningThis = execution.status === 'EM_EXECUCAO';
  const isCompleted = execution.status === 'CONCLUIDO';

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

  const handleNotesChange = (val: string) => {
    setNotes(val);
    onUpdateExecutionNotes(execution.id, val);
  };

  const handleCopy = (pathStr: string, idx: number) => {
    navigator.clipboard.writeText(pathStr);
    setCopiedIndex(idx);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const formatTime = (totalSeconds: number) => {
    const hrs = Math.floor(totalSeconds / 3600);
    const mins = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;
    return `${String(hrs).padStart(2, '0')}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const formattedStartTime = execution.startedAt 
    ? new Date(execution.startedAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
    : '--:--:--';
  const formattedEndTime = execution.completedAt 
    ? new Date(execution.completedAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
    : '--:--:--';

  return (
    <div className="bg-white rounded-xl shadow border border-gray-100 flex flex-col h-full overflow-hidden">
      
      {/* Detail Header */}
      <div className="p-5 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
        <div>
          <span className="text-[10px] uppercase font-bold tracking-wider text-gray-400">Instruções Operacionais</span>
          <h3 className="font-sora font-bold text-[#0339A6] text-base">{activity.name}</h3>
        </div>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600 font-bold p-1 rounded hover:bg-gray-200 transition"
        >
          Fechar
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-5 space-y-6">
        
        {/* SECTION: TIMER PANEL */}
        <div className="rounded-xl border border-gray-100 p-4 shadow-sm bg-gradient-to-r from-gray-50 to-white relative overflow-hidden">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs uppercase font-extrabold text-[#0339A6] tracking-wider flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" /> Cronômetro de Atividade
            </span>
            <span className="text-xs font-mono font-bold text-gray-500 bg-white border border-gray-100 px-2 py-0.5 rounded shadow-sm">
              Previsto: {execution.scheduledTime}
            </span>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mt-2">
            <div>
              <span className="font-mono text-4xl font-black text-gray-800 tracking-tight block">
                {formatTime(elapsed)}
              </span>
              <div className="flex items-center gap-4 text-[10px] text-gray-400 mt-1">
                <span>Início: <b className="text-gray-600">{formattedStartTime}</b></span>
                <span>Fim: <b className="text-gray-600">{formattedEndTime}</b></span>
              </div>
            </div>

            {/* Timer Actions */}
            <div className="flex flex-wrap items-center gap-1.5">
              {!isCompleted && !isRunningThis && (
                <button
                  onClick={() => onStartExecution(execution.id)}
                  className="px-4 py-2 text-xs font-bold rounded-lg transition shadow-md flex items-center gap-1 bg-green-600 hover:bg-green-700 text-white"
                  title="Iniciar cronômetro"
                >
                  <Play className="h-3.5 w-3.5" /> Iniciar
                </button>
              )}

              {isRunningThis && (
                <button
                  onClick={() => onPauseExecution(execution.id)}
                  className="px-4 py-2 text-xs font-bold bg-amber-500 hover:bg-amber-600 text-white rounded-lg transition shadow-md flex items-center gap-1 animate-pulse"
                >
                  <Pause className="h-3.5 w-3.5" /> Pausar
                </button>
              )}

              {!isCompleted && (execution.startedAt || elapsed > 0) && (
                <button
                  onClick={() => onResetExecution(execution.id)}
                  className="p-2 bg-gray-100 hover:bg-gray-200 text-gray-500 rounded-lg transition"
                  title="Reiniciar tempo"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                </button>
              )}

              {!isCompleted && (
                <button
                  onClick={() => onCompleteExecution(execution.id, elapsed)}
                  disabled={!execution.startedAt && elapsed === 0}
                  className={`px-4 py-2 text-xs font-bold rounded-lg transition shadow-md flex items-center gap-1 ${
                    !execution.startedAt && elapsed === 0
                      ? 'bg-gray-100 text-gray-300 cursor-not-allowed'
                      : 'bg-[#0339A6] hover:bg-[#122A44] text-white'
                  }`}
                >
                  <Check className="h-3.5 w-3.5" /> Concluir
                </button>
              )}

              {isCompleted && (
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-green-600 bg-green-50 border border-green-200 px-3 py-1.5 rounded-lg flex items-center gap-1">
                    <CheckSquare className="h-3.5 w-3.5" /> Concluída
                  </span>
                  <button
                    onClick={() => onResetExecution(execution.id)}
                    className="p-2 bg-red-50 hover:bg-red-100 text-[#F21D2F] rounded-lg border border-red-100 transition"
                    title="Resetar conclusão (Voltar para Pendente)"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* SECTION: OBJECTIVE */}
        <div className="space-y-1">
          <h4 className="text-xs uppercase font-extrabold text-gray-400 tracking-wider">Objetivo Operacional</h4>
          <p className="text-sm text-gray-700 leading-relaxed bg-gray-50 p-3 rounded-lg border border-gray-100 font-medium">
            {activity.objetivo || 'Sem descrição cadastrada.'}
          </p>
        </div>

        {/* SECTION: STEPS / INSTRUCTIONS */}
        <div className="space-y-2">
          <h4 className="text-xs uppercase font-extrabold text-gray-400 tracking-wider">Passo a Passo Normal</h4>
          <div className="space-y-2.5">
            {(activity.instrucoes || []).map((inst, idx) => (
              <div key={idx} className="flex gap-3 items-start text-sm text-gray-700 bg-white">
                <span className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-blue-50 text-xs font-bold text-[#0339A6]">
                  {idx + 1}
                </span>
                <span className="pt-0.5 leading-relaxed">{inst}</span>
              </div>
            ))}
          </div>
        </div>

        {/* SECTION: PATHS */}
        {activity.paths && activity.paths.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-xs uppercase font-extrabold text-gray-400 tracking-wider">Caminhos de Rede</h4>
            <div className="space-y-2">
              {activity.paths.map((p, idx) => (
                <div key={idx} className="flex flex-col sm:flex-row sm:items-center justify-between p-2.5 rounded-lg border border-gray-100 bg-gray-50/50 gap-2">
                  <div className="min-w-0 flex-1">
                    <span className="block text-[10px] uppercase font-bold text-gray-400">{p.label}</span>
                    <code className="text-xs text-[#0339A6] block truncate font-mono mt-0.5">{p.path}</code>
                  </div>
                  <button
                    onClick={() => handleCopy(p.path, idx)}
                    className={`px-2.5 py-1.5 text-xs font-bold rounded border transition flex items-center gap-1 justify-center ${
                      copiedIndex === idx
                        ? 'bg-green-50 border-green-200 text-green-700'
                        : 'bg-white hover:bg-gray-50 border-gray-200 text-gray-600'
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

        {/* SECTION: SCRIPTS */}
        {activity.scripts && activity.scripts.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-xs uppercase font-extrabold text-gray-400 tracking-wider">Scripts Envolvidos</h4>
            <div className="flex flex-wrap gap-1.5">
              {activity.scripts.map((script, idx) => (
                <span key={idx} className="inline-flex items-center gap-1 text-xs font-semibold bg-gray-100 border border-gray-200 text-[#0339A6] px-2.5 py-1 rounded-md font-mono">
                  <FileCode className="h-3.5 w-3.5 text-[#F21D2F]" /> {script}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* SECTION: CONTINGENCY */}
        {activity.contingency && (
          <div className="rounded-xl border border-red-100 bg-red-50/30 p-4 space-y-2">
            <h4 className="text-xs uppercase font-extrabold text-[#F21D2F] tracking-wider flex items-center gap-1.5">
              <AlertTriangle className="h-4 w-4" /> Procedimento de Contingência (Em caso de erro)
            </h4>
            <p className="text-sm text-red-950 font-medium leading-relaxed">
              {activity.contingency}
            </p>
          </div>
        )}

        {/* SECTION: EXECUTION NOTES AND IMAGES */}
        <div className="space-y-3 pt-2 border-t border-gray-100">
          <div>
            <label className="block text-xs uppercase font-extrabold text-gray-400 tracking-wider mb-2">
              Observações / Logs desta Execução
            </label>
            <textarea
              value={notes}
              onChange={(e) => handleNotesChange(e.target.value)}
              placeholder="Registre ocorrências, atrasos ou avisos operacionais aqui..."
              rows={3}
              className="w-full text-sm border border-gray-200 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-[#0339A6] focus:border-transparent text-gray-800"
            />
          </div>

          <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
            <label className="flex items-center gap-1.5 text-xs font-bold text-[#0339A6] uppercase tracking-wider mb-2">
              <ImageIcon className="h-4 w-4" /> Anexar Evidências (Opcional)
            </label>
            <input 
              type="file" 
              accept="image/*" 
              multiple 
              className="block w-full text-xs text-gray-500
                file:mr-4 file:py-1.5 file:px-4
                file:rounded-lg file:border-0
                file:text-xs file:font-semibold
                file:bg-[#0339A6] file:text-white
                hover:file:bg-[#122A44] transition cursor-pointer"
            />
          </div>
        </div>

      </div>
    </div>
  );
};