import React, { useState } from 'react';
import { Execution, Activity } from '../types';
import { AlertCircle, CheckCircle, Clock, Info, HelpCircle, Users, Check, X } from 'lucide-react';

interface ActiveModalProps {
  isOpen: boolean;
  type: 'alert' | 'delay_prompt' | 'congratulations';
  activity: Activity | null;
  execution: Execution | null;
  onClose: () => void;
  onStartActivity?: () => void;
  onPostponeActivity?: (minutes: number) => void;
  onSubmitDelay?: (data: {
    reason: string;
    explanation: string;
    informed: string;
    helper: string;
  }) => void;
  onNextActivity?: () => void;
}

export const ActiveModal: React.FC<ActiveModalProps> = ({
  isOpen,
  type,
  activity,
  execution,
  onClose,
  onStartActivity,
  onPostponeActivity,
  onSubmitDelay,
  onNextActivity
}) => {
  if (!isOpen || !activity || !execution) return null;

  const [delayReason, setDelayReason] = useState('Problema técnico');
  const [explanation, setExplanation] = useState('');
  const [informedPerson, setInformedPerson] = useState('');
  const [helperPerson, setHelperPerson] = useState('');

  const delayReasons = [
    'Problema técnico',
    'Dependência de outra pessoa',
    'Sistema indisponível',
    'Arquivo/base não disponível',
    'Outra atividade ocupou o horário',
    'Reunião',
    'Demanda urgente',
    'Outro'
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSubmitDelay) {
      onSubmitDelay({
        reason: delayReason,
        explanation,
        informed: informedPerson,
        helper: helperPerson
      });
    }
  };

  const isAtrasado = execution.status === 'ATRASADO';
  const isCritical = activity.priority === 'high' && isAtrasado;

  let alertColor = 'border-[#F2B705] bg-amber-50 text-[#C97C3B]';
  if (isCritical) {
    alertColor = 'border-[#F21D2F] bg-red-50 text-[#F21D2F]';
  } else if (isAtrasado) {
    alertColor = 'border-[#F24405] bg-orange-50 text-[#F24405]';
  } else if (activity.priority === 'high') {
    alertColor = 'border-[#0339A6] bg-blue-50 text-[#0339A6]';
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="fixed inset-0 bg-black/60 transition-opacity" onClick={onClose} />

      <div className="relative w-full max-w-lg overflow-hidden rounded-xl bg-white shadow-2xl transition-all border border-gray-200">
        
        {/* SCHEDULE ALERT */}
        {type === 'alert' && (
          <div>
            <div className={`p-5 border-b-4 flex items-center gap-3 ${alertColor}`}>
              <AlertCircle className="h-7 w-7 flex-shrink-0 animate-bounce" />
              <div>
                <span className="text-xs uppercase font-bold tracking-wider opacity-90">Atividade Programada</span>
                <h3 className="font-sora text-lg font-bold">Karine, já são {execution.scheduledTime}</h3>
              </div>
            </div>

            <div className="p-6">
              <p className="text-gray-800 font-medium text-base mb-4">
                Hora de executar: <span className="text-[#0339A6] font-bold">{activity.name}</span>
              </p>

              <div className="mb-6 rounded-lg bg-[#F2F2F2] p-4 border border-gray-200">
                <h4 className="font-sora font-semibold text-xs text-gray-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <Info className="h-3.5 w-3.5 text-[#0339A6]" /> O que você precisa fazer:
                </h4>
                <ul className="space-y-1.5 text-sm text-gray-700">
                  {(activity.instrucoes || []).slice(0, 3).map((inst, idx) => (
                    <li key={idx} className="flex gap-1.5 items-start">
                      <span className="text-[#0339A6] font-bold">{idx + 1}.</span>
                      <span>{inst}</span>
                    </li>
                  ))}
                  {(activity.instrucoes || []).length > 3 && (
                    <li className="text-xs italic text-gray-500 font-medium pl-4">
                      + {(activity.instrucoes || []).length - 3} mais instruções no painel...
                    </li>
                  )}
                </ul>
              </div>

              <div className="grid grid-cols-2 gap-4 text-xs text-gray-600 mb-6">
                <div>
                  <span className="block text-gray-400 uppercase font-semibold">Prioridade</span>
                  <span className={`inline-block px-2 py-0.5 mt-0.5 rounded-full font-bold ${
                    activity.priority === 'high' ? 'bg-red-100 text-[#F21D2F]' : 
                    activity.priority === 'medium' ? 'bg-yellow-100 text-[#C97C3B]' : 'bg-gray-100 text-gray-600'
                  }`}>
                    {activity.priority === 'high' ? 'Crítica' : activity.priority === 'medium' ? 'Média' : 'Baixa'}
                  </span>
                </div>
                <div>
                  <span className="block text-gray-400 uppercase font-semibold">Responsável</span>
                  <span className="font-medium text-gray-800 mt-0.5 block">{activity.responsible}</span>
                </div>
              </div>

              <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
                <button
                  onClick={() => onPostponeActivity && onPostponeActivity(5)}
                  className="px-4 py-2 text-sm font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg transition"
                >
                  Adiar 5 minutos
                </button>
                <button
                  onClick={onStartActivity}
                  className="px-6 py-2 text-sm font-bold text-white bg-[#0339A6] hover:bg-[#122A44] rounded-lg shadow-md transition flex items-center justify-center gap-1.5"
                >
                  <Clock className="h-4 w-4" /> INICIAR ATIVIDADE
                </button>
              </div>
            </div>
          </div>
        )}

        {/* DELAY REPORTING DIALOGUE */}
        {type === 'delay_prompt' && (
          <form onSubmit={handleSubmit}>
            <div className="p-5 border-b border-gray-200 bg-orange-50 text-[#F24405] flex items-center gap-3">
              <AlertCircle className="h-6 w-6 flex-shrink-0" />
              <div>
                <span className="text-xs uppercase font-bold tracking-wider text-orange-700">Acompanhamento de Desvio</span>
                <h3 className="font-sora text-lg font-bold">⚠️ Atividade em Atraso</h3>
              </div>
            </div>

            <div className="p-6 space-y-4">
              <p className="text-sm text-gray-600">
                Karine, detectamos que a atividade <span className="font-bold text-gray-800">{activity.name}</span> está iniciando ou terminando com atraso em relação ao cronograma previsto das <span className="font-bold">{execution.scheduledTime}</span>.
              </p>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1 flex items-center gap-1">
                  <HelpCircle className="h-3.5 w-3.5 text-gray-400" /> Por que a atividade está atrasada?
                </label>
                <select
                  value={delayReason}
                  onChange={(e) => setDelayReason(e.target.value)}
                  className="w-full text-sm rounded-lg border border-gray-300 p-2 focus:ring-2 focus:ring-[#0339A6] focus:border-transparent outline-none bg-white text-gray-800"
                >
                  {delayReasons.map((reason) => (
                    <option key={reason} value={reason}>{reason}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">
                  Explique o motivo detalhadamente:
                </label>
                <textarea
                  value={explanation}
                  onChange={(e) => setExplanation(e.target.value)}
                  placeholder="Descreva o incidente ou a pendência..."
                  rows={2}
                  className="w-full text-sm rounded-lg border border-gray-300 p-2 focus:ring-2 focus:ring-[#0339A6] focus:border-transparent outline-none text-gray-800"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Informed Person Select */}
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1 flex items-center gap-1">
                    <Users className="h-3.5 w-3.5 text-gray-400" /> Quem foi informado?
                  </label>
                  <select
                    value={informedPerson}
                    onChange={(e) => setInformedPerson(e.target.value)}
                    className="w-full text-sm rounded-lg border border-gray-300 p-2 focus:ring-2 focus:ring-[#0339A6] focus:border-transparent outline-none text-gray-800 bg-white"
                  >
                    <option value="">Selecione...</option>
                    <option value="Agenor">Agenor</option>
                    <option value="Carla">Carla</option>
                    <option value="Miller">Miller</option>
                    <option value="Outro">Outro Departamento...</option>
                  </select>
                </div>

                {/* Helper Person Select */}
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1 flex items-center gap-1">
                    <HelpCircle className="h-3.5 w-3.5 text-gray-400" /> Quem ajudou a resolver?
                  </label>
                  <select
                    value={helperPerson}
                    onChange={(e) => setHelperPerson(e.target.value)}
                    className="w-full text-sm rounded-lg border border-gray-300 p-2 focus:ring-2 focus:ring-[#0339A6] focus:border-transparent outline-none text-gray-800 bg-white"
                  >
                    <option value="">Ninguém</option>
                    <option value="Agenor">Agenor</option>
                    <option value="Carla">Carla</option>
                    <option value="Miller">Miller</option>
                    <option value="Outro">Outro Departamento...</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="submit"
                  className="w-full sm:w-auto px-6 py-2.5 text-sm font-bold text-white bg-[#F24405] hover:bg-[#d63a04] rounded-lg shadow-md transition"
                >
                  REGISTRAR DESVIO E SALVAR
                </button>
              </div>
            </div>
          </form>
        )}

        {/* CONGRATULATIONS ON COMPLETION */}
        {type === 'congratulations' && (
          <div className="text-center p-8">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-green-100 mb-4 text-[#0339A6]">
              <CheckCircle className="h-10 w-10 text-green-600 animate-pulse" />
            </div>
            
            <h3 className="font-sora text-2xl font-bold text-gray-900 mb-1">🎉 Atividade Concluída!</h3>
            <p className="text-sm text-gray-500 mb-6">Excelente ritmo, Karine!</p>

            <div className="bg-[#F2F2F2] rounded-xl p-4 border border-gray-200 mb-6 text-left space-y-3">
              <div className="flex justify-between items-center pb-2 border-b border-gray-200">
                <span className="text-xs text-gray-500 uppercase font-bold">Atividade</span>
                <span className="text-sm font-bold text-gray-800 max-w-[250px] truncate">{activity.name}</span>
              </div>
              
              <div className="flex justify-between items-center text-sm">
                <span className="text-xs text-gray-400 font-medium">Tempo Gasto:</span>
                <span className="font-semibold text-gray-700">
                  {execution.durationSeconds ? (
                    `${Math.floor(execution.durationSeconds / 60)}m ${execution.durationSeconds % 60}s`
                  ) : (
                    '--'
                  )}
                </span>
              </div>

              <div className="flex justify-between items-center text-sm">
                <span className="text-xs text-gray-400 font-medium">Diferença de Horário:</span>
                <span className={`font-semibold ${execution.delaySeconds && execution.delaySeconds > 0 ? 'text-[#F24405]' : 'text-green-600'}`}>
                  {execution.delaySeconds && execution.delaySeconds > 0 ? (
                    `+${Math.floor(execution.delaySeconds / 60)}min de atraso`
                  ) : (
                    'Pontual / No prazo'
                  )}
                </span>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              {onNextActivity && (
                <button
                  onClick={onNextActivity}
                  className="w-full py-3 px-4 text-sm font-bold text-white bg-[#0339A6] hover:bg-[#122A44] rounded-lg shadow-md transition flex items-center justify-center gap-1"
                >
                  CONTINUAR PARA PRÓXIMA
                </button>
              )}
              <button
                onClick={onClose}
                className="w-full py-2.5 px-4 text-sm font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg transition"
              >
                VOLTAR AO DASHBOARD
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};