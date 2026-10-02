import React from 'react';
import { Execution, Activity } from '../types';
import { CheckCircle2, AlertTriangle, PlayCircle, Clock, Percent, TrendingUp } from 'lucide-react';

interface IndicatorsProps {
  executions: Execution[];
  activities: Activity[];
}

export const Indicators: React.FC<IndicatorsProps> = ({ executions, activities }) => {
  const total = executions.length;
  const completed = executions.filter((e) => e.status === 'CONCLUIDO').length;
  const delayed = executions.filter(
    (e) => e.status === 'ATRASADO' || (e.delaySeconds && e.delaySeconds > 0)
  ).length;
  const pending = executions.filter((e) => e.status === 'PENDENTE').length;

  const progressPercent = total ? Math.round((completed / total) * 100) : 0;

  // Calculate work time
  let totalWorkSeconds = 0;
  executions.forEach((e) => {
    if (e.durationSeconds && e.status === 'CONCLUIDO') {
      totalWorkSeconds += e.durationSeconds;
    }
  });

  const hoursWorked = Math.floor(totalWorkSeconds / 3600);
  const minutesWorked = Math.floor((totalWorkSeconds % 3600) / 60);
  const timeWorkedStr = `${String(hoursWorked).padStart(2, '0')}h${String(minutesWorked).padStart(2, '0')}min`;

  // Average time
  const averageSeconds = completed ? Math.round(totalWorkSeconds / completed) : 0;
  const averageMins = Math.floor(averageSeconds / 60);
  const averageSecs = averageSeconds % 60;
  const averageStr = completed ? `${averageMins}m ${averageSecs}s` : '0 min';

  // Dynamic message based on progress
  let progressMessage = 'Vamos começar o dia! Selecione uma atividade para iniciar.';
  if (progressPercent > 0 && progressPercent < 30) {
    progressMessage = 'Bom início! Primeiro passo concluído com sucesso.';
  } else if (progressPercent >= 30 && progressPercent < 60) {
    progressMessage = 'Ótimo ritmo, Karine! Já passou de um terço do caminho.';
  } else if (progressPercent >= 60 && progressPercent < 90) {
    progressMessage = `Você concluiu ${progressPercent}% do seu trabalho. Quase lá!`;
  } else if (progressPercent >= 90 && progressPercent < 100) {
    progressMessage = 'Foco total nas últimas atividades para fechar o dia!';
  } else if (progressPercent === 100) {
    progressMessage = 'Rotina concluída! Você fechou 100% das atividades previstas.';
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-6">
      
      {/* Indicator Card: PROGRESS */}
      <div className="col-span-2 md:col-span-3 lg:col-span-2 bg-[#0339A6] text-white p-5 rounded-xl shadow-md border-b-4 border-[#F21D2F] flex flex-col justify-between relative overflow-hidden">
        {/* Subtle background graphics */}
        <div className="absolute right-0 bottom-0 opacity-10 pointer-events-none">
          <Percent size={120} />
        </div>
        
        <div>
          <span className="text-[10px] uppercase font-bold tracking-wider text-blue-200">Progresso do Dia</span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-4xl font-black font-sora tracking-tight">{progressPercent}%</span>
            <span className="text-xs text-green-300 font-bold flex items-center gap-0.5">
              <TrendingUp className="h-3 w-3" /> Real-time
            </span>
          </div>

          {/* Barra de Progresso elegante e de alto contraste */}
          <div className="w-full bg-blue-900/50 rounded-full h-2.5 mt-3 overflow-hidden border border-blue-800/30">
            <div 
              className="bg-[#F2B705] h-full rounded-full transition-all duration-500 ease-out"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
        <p className="text-xs text-blue-100 mt-3 font-medium line-clamp-2 leading-relaxed">
          "{progressMessage}"
        </p>
      </div>

      {/* Indicator Card: COMPLETED */}
      <div className="bg-white p-4 rounded-xl shadow border border-gray-100 flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <span className="text-[10px] uppercase font-bold tracking-wider text-gray-400">Concluídas</span>
          <CheckCircle2 className="h-5 w-5 text-green-500" />
        </div>
        <div className="mt-2">
          <span className="text-2xl font-extrabold font-sora block text-gray-800">{completed}</span>
          <span className="text-[10px] text-gray-400 block mt-0.5">Previstas: {total}</span>
        </div>
      </div>

      {/* Indicator Card: PENDING */}
      <div className="bg-white p-4 rounded-xl shadow border border-gray-100 flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <span className="text-[10px] uppercase font-bold tracking-wider text-gray-400">Pendentes</span>
          <PlayCircle className="h-5 w-5 text-blue-500" />
        </div>
        <div className="mt-2">
          <span className="text-2xl font-extrabold font-sora block text-gray-800">{pending}</span>
          <span className="text-[10px] text-gray-400 block mt-0.5">Aguardando início</span>
        </div>
      </div>

      {/* Indicator Card: TIME WORKED */}
      <div className="bg-white p-4 rounded-xl shadow border border-gray-100 flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <span className="text-[10px] uppercase font-bold tracking-wider text-gray-400">Tempo Execução</span>
          <Clock className="h-5 w-5 text-indigo-500" />
        </div>
        <div className="mt-2">
          <span className="text-xl font-extrabold font-sora block text-gray-800 truncate">{timeWorkedStr}</span>
          <span className="text-[10px] text-gray-400 block mt-0.5">Média: {averageStr}</span>
        </div>
      </div>

    </div>
  );
};
