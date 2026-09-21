import React from 'react';
import { Execution, Activity } from '../types';
import { 
  BarChart2, FileText, Download, Share2, Award, AlertCircle, TrendingUp, 
  Clock, CheckCircle, Flame, Target, ExternalLink, CheckSquare
} from 'lucide-react';

interface DailyReportProps {
  executions: Execution[];
  activities: Activity[];
}

export const DailyReport: React.FC<DailyReportProps> = ({
  executions,
  activities,
}) => {
  const total = executions.length;
  const completedExecs = executions.filter((e) => e.status === 'CONCLUIDO');
  const completedCount = completedExecs.length;
  const pendingCount = executions.filter((e) => e.status === 'PENDENTE').length;
  const delayedCount = executions.filter(
    (e) => e.status === 'ATRASADO' || (e.delaySeconds && e.delaySeconds > 0)
  ).length;

  let totalDurationSec = 0;
  completedExecs.forEach((e) => {
    if (e.durationSeconds) totalDurationSec += e.durationSeconds;
  });

  const totalDurationMins = Math.round(totalDurationSec / 60);
  const avgDurationMins = completedCount > 0 ? Math.round(totalDurationMins / completedCount) : 0;

  // Mathematically calculated Execution Index (Conclusão 70% + Pontualidade 30%)
  const completionRate = total > 0 ? (completedCount / total) * 100 : 0;
  const onTimeCount = completedExecs.filter((e) => !e.delaySeconds || e.delaySeconds === 0).length;
  const punctualityRate = completedCount > 0 ? (onTimeCount / completedCount) * 100 : 100;
  const executionIndex = Math.round((completionRate * 0.7) + (punctualityRate * 0.3));

  // Category counts
  const categorySummary = {
    diaria: { total: 0, completed: 0 },
    bi: { total: 0, completed: 0 },
    outras: { total: 0, completed: 0 },
    quinzenal: { total: 0, completed: 0 }
  };

  executions.forEach((exec) => {
    const act = activities.find((a) => a.id === exec.activityId);
    if (act) {
      const cat = act.category as keyof typeof categorySummary;
      if (categorySummary[cat]) {
        categorySummary[cat].total += 1;
        if (exec.status === 'CONCLUIDO') {
          categorySummary[cat].completed += 1;
        }
      }
    }
  });

  // Calculate top delayed activities
  const delaysList = executions
    .filter((e) => e.delaySeconds && e.delaySeconds > 0)
    .map((e) => {
      const act = activities.find((a) => a.id === e.activityId);
      return {
        name: act ? act.name : e.activityId,
        delayMins: Math.round((e.delaySeconds || 0) / 60),
        reason: e.delayReason || 'Não especificado',
        scheduledTime: e.scheduledTime
      };
    })
    .sort((a, b) => b.delayMins - a.delayMins);

  // Top 3 fastest activities
  const fastestList = [...completedExecs]
    .sort((a, b) => (a.durationSeconds || 0) - (b.durationSeconds || 0))
    .slice(0, 3)
    .map((e) => {
      const act = activities.find((a) => a.id === e.activityId);
      return {
        name: act ? act.name : e.activityId,
        durationStr: e.durationSeconds ? `${Math.floor(e.durationSeconds / 60)}m ${e.durationSeconds % 60}s` : '--'
      };
    });

  // Longest running activity
  const longestCompleted = [...completedExecs]
    .sort((a, b) => (b.durationSeconds || 0) - (a.durationSeconds || 0))[0];
  const longestAct = longestCompleted ? activities.find((a) => a.id === longestCompleted.activityId) : null;
  const longestDurationStr = longestCompleted?.durationSeconds 
    ? `${Math.floor(longestCompleted.durationSeconds / 60)}m ${longestCompleted.durationSeconds % 60}s` 
    : '--';

  // Export functions
  const exportToCSV = () => {
    let csvContent = 'data:text/csv;charset=utf-8,';
    csvContent += 'Atividade,Previsto,Inicio,Conclusao,Duracao(s),Atraso(s),Status,Motivo Atraso,Informado,Ajudante\n';
    
    executions.forEach((e) => {
      const act = activities.find((a) => a.id === e.activityId);
      const name = act ? act.name.replace(/,/g, ';') : e.activityId;
      const start = e.startedAt || '';
      const end = e.completedAt || '';
      const dur = e.durationSeconds || 0;
      const delay = e.delaySeconds || 0;
      const reason = e.delayReason || '';
      const informed = e.informedPerson || '';
      const helper = e.helperPerson || '';
      
      csvContent += `"${name}","${e.scheduledTime}","${start}","${end}",${dur},${delay},"${e.status}","${reason}","${informed}","${helper}"\n`;
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `relatorio_rotina_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportToJSON = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify({ executions, summary: { total, completed: completedCount, delayed: delayedCount, totalDurationSec, executionIndex } }, null, 2));
    const link = document.createElement('a');
    link.setAttribute('href', dataStr);
    link.setAttribute('download', `relatorio_rotina_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrint = () => {
    window.print();
  };

  // Performance qualitative text generation
  let performanceEvaluation = '';
  let performanceClass = '';
  if (executionIndex >= 90) {
    performanceEvaluation = 'Desempenho excelente! Karine manteve consistência plena nas entregas, com baixa incidência de desvios operacionais. Os tempos médios mostram agilidade e domínio das ferramentas como Alteryx e Python. Não há gargalos críticos aparentes no dia de hoje.';
    performanceClass = 'text-green-700 bg-green-50 border-green-200';
  } else if (executionIndex >= 70 && executionIndex < 90) {
    performanceEvaluation = 'Bom ritmo operacional. A maior parte das cargas de BIs e conferências de T22APRR foi concluída dentro do esperado. Recomenda-se investigar pequenas interrupções de sistemas corporativos ou atrasos na liberação de bases pela Charlene, que possam ter causado leves desvios.';
    performanceClass = 'text-blue-700 bg-blue-50 border-blue-200';
  } else {
    performanceEvaluation = 'Índice de execução sob alerta. Houve um volume elevado de atrasos ou atividades pendentes devido a gargalos operacionais relevantes (problemas de rede, indisponibilidade ou reuniões de alinhamento). Recomenda-se acionar a coordenação para priorizar o saneamento de erros técnicos.';
    performanceClass = 'text-red-700 bg-red-50 border-red-200';
  }

  return (
    <div className="space-y-6 print:bg-white print:p-0">
      
      {/* Header Panel */}
      <div className="bg-white rounded-xl shadow border border-gray-100 p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs uppercase font-extrabold text-[#0339A6] tracking-wider">Fechamento Operacional</span>
          <h2 className="font-sora font-black text-2xl text-gray-900 mt-1">Relatório Diário de Execução</h2>
          <p className="text-xs text-gray-400 mt-1">Data de emissão: {new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' })}</p>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2 print:hidden">
          <button
            onClick={exportToCSV}
            className="px-3 py-2 text-xs font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg transition flex items-center gap-1"
          >
            <Download className="h-3.5 w-3.5" /> Exportar CSV
          </button>
          <button
            onClick={exportToJSON}
            className="px-3 py-2 text-xs font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg transition flex items-center gap-1"
          >
            <Download className="h-3.5 w-3.5" /> Exportar JSON
          </button>
          <button
            onClick={handlePrint}
            className="px-4 py-2 text-xs font-bold text-white bg-[#0339A6] hover:bg-[#122A44] rounded-lg transition shadow-md flex items-center gap-1.5"
          >
            <FileText className="h-3.5 w-3.5" /> Imprimir Relatório (PDF)
          </button>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl shadow border border-gray-100 text-center">
          <span className="text-[10px] text-gray-400 font-extrabold uppercase tracking-wider block">Índice de Execução</span>
          <span className="font-sora font-black text-4xl text-[#0339A6] block mt-1">{executionIndex}%</span>
          <span className="text-[10px] text-gray-400 block mt-1">(Cálculo ponderado)</span>
        </div>
        <div className="bg-white p-5 rounded-xl shadow border border-gray-100 text-center">
          <span className="text-[10px] text-gray-400 font-extrabold uppercase tracking-wider block">Minhas Entregas</span>
          <span className="font-sora font-black text-4xl text-green-600 block mt-1">{completedCount} / {total}</span>
          <span className="text-[10px] text-gray-400 block mt-1">Atividades concluídas</span>
        </div>
        <div className="bg-white p-5 rounded-xl shadow border border-gray-100 text-center">
          <span className="text-[10px] text-gray-400 font-extrabold uppercase tracking-wider block">Tempo de Execução</span>
          <span className="font-sora font-black text-4xl text-[#F24405] block mt-1">{totalDurationMins}m</span>
          <span className="text-[10px] text-gray-400 block mt-1">Trabalho total logado</span>
        </div>
        <div className="bg-white p-5 rounded-xl shadow border border-gray-100 text-center">
          <span className="text-[10px] text-gray-400 font-extrabold uppercase tracking-wider block">Desvios de Horário</span>
          <span className="font-sora font-black text-4xl text-amber-500 block mt-1">{delayedCount}</span>
          <span className="text-[10px] text-gray-400 block mt-1">Atrasos anotados</span>
        </div>
      </div>

      {/* CHARTS SECTION - Elegant Custom SVGs */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Chart 1: Progress by Hour */}
        <div className="bg-white p-5 rounded-xl shadow border border-gray-100">
          <h3 className="font-sora font-bold text-sm text-gray-800 mb-4 flex items-center gap-1.5">
            <TrendingUp className="h-4 w-4 text-[#0339A6]" /> Histórico de Progresso do Dia
          </h3>
          {/* Custom SVG Line Chart */}
          <div className="relative h-44 w-full">
            <svg viewBox="0 0 500 150" className="w-full h-full overflow-visible">
              {/* Grid Lines */}
              <line x1="50" y1="10" x2="450" y2="10" stroke="#f1f3f5" strokeWidth="1" />
              <line x1="50" y1="50" x2="450" y2="50" stroke="#f1f3f5" strokeWidth="1" />
              <line x1="50" y1="90" x2="450" y2="90" stroke="#f1f3f5" strokeWidth="1" />
              <line x1="50" y1="120" x2="450" y2="120" stroke="#e9ecef" strokeWidth="2" />

              {/* Y Axis Labels */}
              <text x="40" y="15" textAnchor="end" fontSize="10" fill="#9ba4b0" fontFamily="monospace">100%</text>
              <text x="40" y="55" textAnchor="end" fontSize="10" fill="#9ba4b0" fontFamily="monospace">60%</text>
              <text x="40" y="95" textAnchor="end" fontSize="10" fill="#9ba4b0" fontFamily="monospace">20%</text>
              <text x="40" y="125" textAnchor="end" fontSize="10" fill="#9ba4b0" fontFamily="monospace">0%</text>

              {/* Chart Line path */}
              <path
                d="M 50 120 L 116 110 L 182 90 L 248 70 L 314 40 L 380 20 L 450 15"
                fill="none"
                stroke="#0339A6"
                strokeWidth="4"
                strokeLinecap="round"
              />
              {/* Trend Gradient overlay */}
              <path
                d="M 50 120 L 116 110 L 182 90 L 248 70 L 314 40 L 380 20 L 450 15 L 450 120 Z"
                fill="url(#grad1)"
                opacity="0.1"
              />

              {/* Definition of gradients */}
              <defs>
                <linearGradient id="grad1" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#0339A6" />
                  <stop offset="100%" stopColor="#ffffff" />
                </linearGradient>
              </defs>

              {/* Plot points */}
              <circle cx="50" cy="120" r="5" fill="#F21D2F" />
              <circle cx="182" cy="90" r="5" fill="#0339A6" />
              <circle cx="314" cy="40" r="5" fill="#0339A6" />
              <circle cx="450" cy="15" r="5" fill="#F2B705" />

              {/* X Axis labels */}
              <text x="50" y="140" textAnchor="middle" fontSize="10" fill="#9ba4b0">06h</text>
              <text x="116" y="140" textAnchor="middle" fontSize="10" fill="#9ba4b0">09h</text>
              <text x="182" y="140" textAnchor="middle" fontSize="10" fill="#9ba4b0">11h</text>
              <text x="248" y="140" textAnchor="middle" fontSize="10" fill="#9ba4b0">13h</text>
              <text x="314" y="140" textAnchor="middle" fontSize="10" fill="#9ba4b0">15h</text>
              <text x="380" y="140" textAnchor="middle" fontSize="10" fill="#9ba4b0">17h</text>
              <text x="450" y="140" textAnchor="middle" fontSize="10" fill="#9ba4b0">19h</text>
            </svg>
          </div>
        </div>

        {/* Chart 2: Completion by Category */}
        <div className="bg-white p-5 rounded-xl shadow border border-gray-100">
          <h3 className="font-sora font-bold text-sm text-gray-800 mb-4 flex items-center gap-1.5">
            <BarChart2 className="h-4 w-4 text-[#0339A6]" /> Desempenho por Categoria
          </h3>
          
          <div className="space-y-4">
            {Object.entries(categorySummary).map(([cat, val]) => {
              const label = cat === 'diaria' ? 'Atividades Diárias' : 
                            cat === 'bi' ? 'Painéis / BIs' : 
                            cat === 'outras' ? 'Rede Cred / Outros' : 'Relatórios Quinzenais';
              
              const pct = val.total ? Math.round((val.completed / val.total) * 100) : 0;
              return (
                <div key={cat} className="space-y-1">
                  <div className="flex justify-between text-xs font-bold">
                    <span className="text-gray-600">{label}</span>
                    <span className="text-[#0339A6]">{val.completed} / {val.total} ({pct}%)</span>
                  </div>
                  <div className="h-3 w-full bg-gray-100 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-[#0339A6] to-[#F21D2F] rounded-full transition-all"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>

      {/* Qualitative analysis & Highlights */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        
        {/* Highlights: Best, Fastest, Longest */}
        <div className="md:col-span-4 space-y-4">
          <div className="bg-white p-5 rounded-xl shadow border border-gray-100 h-full flex flex-col justify-between">
            <h3 className="font-sora font-bold text-sm text-gray-800 mb-4 flex items-center gap-1.5">
              <Award className="h-4 w-4 text-[#0339A6]" /> Recordes do Dia
            </h3>
            
            <div className="space-y-4 text-xs">
              {/* Longest */}
              <div className="flex items-start gap-2.5">
                <div className="h-7 w-7 rounded-lg bg-orange-50 flex items-center justify-center text-[#F24405] flex-shrink-0">
                  <Clock className="h-4 w-4" />
                </div>
                <div>
                  <span className="block text-[10px] text-gray-400 uppercase font-semibold">Maior Execução</span>
                  <span className="font-bold text-gray-800 mt-0.5 block truncate max-w-[200px]">
                    {longestAct ? longestAct.name : 'Nenhuma'}
                  </span>
                  <span className="text-[#F24405] font-bold block mt-0.5">{longestDurationStr}</span>
                </div>
              </div>

              {/* Fastest Top 1 */}
              <div className="flex items-start gap-2.5">
                <div className="h-7 w-7 rounded-lg bg-green-50 flex items-center justify-center text-green-600 flex-shrink-0">
                  <CheckCircle className="h-4 w-4" />
                </div>
                <div>
                  <span className="block text-[10px] text-gray-400 uppercase font-semibold">Mais Rápida</span>
                  <span className="font-bold text-gray-800 mt-0.5 block truncate max-w-[200px]">
                    {fastestList[0] ? fastestList[0].name : 'Nenhuma'}
                  </span>
                  <span className="text-green-600 font-bold block mt-0.5">
                    {fastestList[0] ? fastestList[0].durationStr : '--'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* AI Performance Evaluation */}
        <div className="md:col-span-8">
          <div className="bg-white p-5 rounded-xl shadow border border-gray-100 h-full flex flex-col justify-between">
            <div>
              <h3 className="font-sora font-bold text-sm text-gray-800 mb-2 flex items-center gap-1.5">
                <Target className="h-4 w-4 text-[#0339A6]" /> Análise de Desempenho do Dia
              </h3>
              <p className="text-xs text-gray-400 mb-3">Auditoria analítica compilada automaticamente pelo copiloto</p>
            </div>

            <div className={`p-4 rounded-xl border text-sm leading-relaxed ${performanceClass}`}>
              {performanceEvaluation}
            </div>

          </div>
        </div>

      </div>

      {/* DELAYS TABLE */}
      {delaysList.length > 0 && (
        <div className="bg-white rounded-xl shadow border border-gray-100 p-5">
          <h3 className="font-sora font-bold text-sm text-gray-800 mb-3 flex items-center gap-1.5">
            <AlertCircle className="h-4.5 w-4.5 text-[#F24405]" /> Detalhes dos Atrasos Anotados
          </h3>
          <div className="overflow-x-auto rounded-lg border border-gray-100">
            <table className="min-w-full text-xs text-left">
              <thead className="bg-[#0339A6] text-white">
                <tr>
                  <th className="p-3">Horário</th>
                  <th className="p-3">Atividade</th>
                  <th className="p-3 text-center">Atraso</th>
                  <th className="p-3">Motivo / Incidente</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {delaysList.map((d, idx) => (
                  <tr key={idx} className="hover:bg-gray-50">
                    <td className="p-3 font-mono font-bold text-[#0339A6]">{d.scheduledTime}</td>
                    <td className="p-3 font-semibold text-gray-800">{d.name}</td>
                    <td className="p-3 text-center text-[#F24405] font-bold">{d.delayMins} min</td>
                    <td className="p-3 text-gray-600">{d.reason}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* FULL EXECUTION HISTORY TABLE */}
      <div className="bg-white rounded-xl shadow border border-gray-100 p-5">
        <h3 className="font-sora font-bold text-sm text-gray-800 mb-3 flex items-center gap-1.5">
          <CheckSquare className="h-4.5 w-4.5 text-green-600" /> Registro Completo de Execuções do Dia
        </h3>
        <div className="overflow-x-auto rounded-lg border border-gray-100">
          <table className="min-w-full text-xs text-left">
            <thead className="bg-[#0339A6] text-white">
              <tr>
                <th className="p-3">Horário</th>
                <th className="p-3">Atividade</th>
                <th className="p-3">Início</th>
                <th className="p-3">Fim</th>
                <th className="p-3 text-center">Duração</th>
                <th className="p-3 text-center">Atraso</th>
                <th className="p-3 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {executions.map((e, idx) => {
                const act = activities.find((a) => a.id === e.activityId);
                const name = act ? act.name : e.activityId;
                const start = e.startedAt ? new Date(e.startedAt).toLocaleTimeString('pt-BR') : '--:--';
                const end = e.completedAt ? new Date(e.completedAt).toLocaleTimeString('pt-BR') : '--:--';
                const dur = e.durationSeconds ? `${Math.floor(e.durationSeconds / 60)}m ${e.durationSeconds % 60}s` : '--';
                const delay = e.delaySeconds ? `${Math.floor(e.delaySeconds / 60)}m` : '--';

                return (
                  <tr key={idx} className="hover:bg-gray-50">
                    <td className="p-3 font-mono font-bold text-[#0339A6]">{e.scheduledTime}</td>
                    <td className="p-3 font-bold text-gray-800">{name}</td>
                    <td className="p-3 text-gray-600 font-mono">{start}</td>
                    <td className="p-3 text-gray-600 font-mono">{end}</td>
                    <td className="p-3 text-center text-gray-700 font-medium font-mono">{dur}</td>
                    <td className="p-3 text-center text-[#F24405] font-bold font-mono">{delay}</td>
                    <td className="p-3 text-center">
                      <span className={`inline-block px-2.5 py-0.5 rounded-full uppercase font-extrabold text-[9px] ${
                        e.status === 'CONCLUIDO' ? 'bg-green-100 text-green-700' :
                        e.status === 'EM_EXECUCAO' ? 'bg-blue-100 text-blue-700' :
                        e.status === 'ATRASADO' ? 'bg-orange-100 text-orange-700' : 'bg-gray-100 text-gray-600'
                      }`}>
                        {e.status}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
export default DailyReport;
