import React, { useState } from 'react';
import { HistoryDay, Execution, Activity } from '../types';
import { History, Calendar, Award, AlertCircle, Clock, Zap, BarChart2 } from 'lucide-react';

interface HistoryViewProps {
  history: HistoryDay[];
  todayExecutions: Execution[];
  activities: Activity[];
}

export const HistoryView: React.FC<HistoryViewProps> = ({
  history,
  todayExecutions,
  activities
}) => {
  const [filterPeriod, setFilterPeriod] = useState<'all' | 'last7' | 'last30'>('all');

  // Compute stats for today
  const todayTotal = todayExecutions.length;
  const todayCompleted = todayExecutions.filter((e) => e.status === 'CONCLUIDO').length;
  const todayCompletionRate = todayTotal > 0 ? Math.round((todayCompleted / todayTotal) * 100) : 0;
  
  let todayDurationSec = 0;
  todayExecutions.forEach((e) => {
    if (e.durationSeconds && e.status === 'CONCLUIDO') todayDurationSec += e.durationSeconds;
  });
  const todayAverageMins = todayCompleted > 0 ? Math.round((todayDurationSec / todayCompleted) / 60) : 0;

  // Filter history based on period
  const filteredHistory = history.slice(0, filterPeriod === 'last7' ? 7 : filterPeriod === 'last30' ? 30 : history.length);

  // Compute historical average metrics
  const totalDays = filteredHistory.length;
  let totalExecutionIndex = 0;
  let totalCompleted = 0;
  let totalPlanned = 0;
  let totalDurationSecs = 0;
  let totalDelayed = 0;

  filteredHistory.forEach((day) => {
    totalExecutionIndex += day.summary.executionIndex;
    totalCompleted += day.summary.completed;
    totalPlanned += day.summary.totalPlanned;
    totalDurationSecs += day.summary.totalDurationSeconds;
    totalDelayed += day.summary.delayed;
  });

  const avgExecutionIndex = totalDays > 0 ? Math.round(totalExecutionIndex / totalDays) : 0;
  const avgCompletionRate = totalPlanned > 0 ? Math.round((totalCompleted / totalPlanned) * 100) : 0;
  const avgDurationMins = totalCompleted > 0 ? Math.round((totalDurationSecs / totalCompleted) / 60) : 0;
  const avgDelayedPerDay = totalDays > 0 ? Number((totalDelayed / totalDays).toFixed(1)) : 0;

  return (
    <div className="space-y-6">
      
      {/* Filters and Header */}
      <div className="bg-white rounded-xl shadow border border-gray-100 p-5 md:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-sora font-black text-xl text-gray-900 flex items-center gap-1.5">
            <History className="h-5 w-5 text-[#0339A6]" /> Histórico de Rotina
          </h2>
          <p className="text-xs text-gray-400 mt-1">Acompanhamento de consistência e produtividade histórica</p>
        </div>

        <div className="flex bg-[#F2F2F2] p-1 rounded-lg border border-gray-200">
          <button
            onClick={() => setFilterPeriod('all')}
            className={`px-3 py-1.5 text-xs font-bold rounded-md transition ${
              filterPeriod === 'all' ? 'bg-[#0339A6] text-white' : 'text-gray-500 hover:text-gray-800'
            }`}
          >
            Últimos Dias
          </button>
          <button
            onClick={() => setFilterPeriod('last7')}
            className={`px-3 py-1.5 text-xs font-bold rounded-md transition ${
              filterPeriod === 'last7' ? 'bg-[#0339A6] text-white' : 'text-gray-500 hover:text-gray-800'
            }`}
          >
            Últimos 7 Dias
          </button>
          <button
            onClick={() => setFilterPeriod('last30')}
            className={`px-3 py-1.5 text-xs font-bold rounded-md transition ${
              filterPeriod === 'last30' ? 'bg-[#0339A6] text-white' : 'text-gray-500 hover:text-gray-800'
            }`}
          >
            Últimos 30 Dias
          </button>
        </div>
      </div>

      {/* Grid: Comparison Box Today vs History */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        
        {/* Comparison: Today vs Past Days */}
        <div className="md:col-span-4 bg-white p-5 rounded-xl border border-gray-100 shadow flex flex-col justify-between">
          <h3 className="font-sora font-bold text-sm text-gray-800 mb-4 flex items-center gap-1">
            <Zap className="h-4 w-4 text-[#F2B705]" /> Hoje x Média do Histórico
          </h3>

          <div className="space-y-4">
            {/* Completion Index */}
            <div>
              <div className="flex justify-between text-xs text-gray-500">
                <span>Índice de Execução</span>
                <span>Média: {avgExecutionIndex}%</span>
              </div>
              <div className="flex items-center gap-2 mt-1">
                <span className="font-sora font-extrabold text-xl text-[#0339A6]">
                  {todayCompletionRate}%
                </span>
                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                  todayCompletionRate >= avgExecutionIndex ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                }`}>
                  {todayCompletionRate >= avgExecutionIndex ? 'Acima' : 'Abaixo'}
                </span>
              </div>
            </div>

            {/* Average time */}
            <div>
              <div className="flex justify-between text-xs text-gray-500">
                <span>Duração Média por Atividade</span>
                <span>Média: {avgDurationMins}m</span>
              </div>
              <div className="flex items-center gap-2 mt-1">
                <span className="font-sora font-extrabold text-xl text-gray-800">
                  {todayAverageMins} min
                </span>
                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                  todayAverageMins <= avgDurationMins ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                }`}>
                  {todayAverageMins <= avgDurationMins ? 'Mais rápido' : 'Mais lento'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Aggregated stats */}
        <div className="md:col-span-8 bg-white p-5 rounded-xl border border-gray-100 shadow">
          <h3 className="font-sora font-bold text-sm text-gray-800 mb-4 flex items-center gap-1.5">
            <BarChart2 className="h-4 w-4 text-[#0339A6]" /> Métricas Consolidadas do Período
          </h3>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
            <div className="p-3 bg-gray-50 rounded-lg border border-gray-100">
              <span className="text-[10px] uppercase font-bold text-gray-400 block">Índice Médio</span>
              <span className="font-sora font-black text-2xl text-[#0339A6] block mt-1">{avgExecutionIndex}%</span>
            </div>
            <div className="p-3 bg-gray-50 rounded-lg border border-gray-100">
              <span className="text-[10px] uppercase font-bold text-gray-400 block">Taxa Conclusão</span>
              <span className="font-sora font-black text-2xl text-green-600 block mt-1">{avgCompletionRate}%</span>
            </div>
            <div className="p-3 bg-gray-50 rounded-lg border border-gray-100">
              <span className="text-[10px] uppercase font-bold text-gray-400 block">Tempo Médio</span>
              <span className="font-sora font-black text-2xl text-indigo-600 block mt-1">{avgDurationMins}m</span>
            </div>
            <div className="p-3 bg-gray-50 rounded-lg border border-gray-100">
              <span className="text-[10px] uppercase font-bold text-gray-400 block">Média Atrasos</span>
              <span className="font-sora font-black text-2xl text-amber-500 block mt-1">{avgDelayedPerDay}/dia</span>
            </div>
          </div>
        </div>

      </div>

      {/* History log days */}
      <div className="bg-white rounded-xl shadow border border-gray-100 p-5">
        <h3 className="font-sora font-bold text-sm text-gray-800 mb-4 flex items-center gap-1.5">
          <Calendar className="h-4.5 w-4.5 text-[#0339A6]" /> Arquivo de Dias Anteriores
        </h3>

        {filteredHistory.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            Nenhum histórico disponível no período.
          </div>
        ) : (
          <div className="space-y-3">
            {filteredHistory.map((day) => {
              const formattedDate = new Date(day.date + 'T00:00:00').toLocaleDateString('pt-BR', {
                weekday: 'long',
                day: '2-digit',
                month: 'long'
              });

              return (
                <div key={day.date} className="p-4 rounded-xl border border-gray-100 hover:border-gray-200 bg-gray-50/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition">
                  <div>
                    <span className="text-xs font-bold text-gray-500 capitalize block">{formattedDate}</span>
                    <div className="flex flex-wrap items-center gap-3 mt-1.5 text-xs text-gray-500">
                      <span>Concluídas: <b className="text-green-600">{day.summary.completed}</b> / {day.summary.totalPlanned}</span>
                      <span>Duração Total: <b className="text-gray-700">{Math.round(day.summary.totalDurationSeconds / 60)}m</b></span>
                      <span>Atrasos: <b className="text-amber-600">{day.summary.delayed}</b></span>
                    </div>
                  </div>

                  <div className="text-right flex items-center gap-4">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-gray-400 block">Eficiência</span>
                      <span className="font-sora font-extrabold text-lg text-[#0339A6] block">
                        {day.summary.executionIndex}%
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

    </div>
  );
};
export default HistoryView;
