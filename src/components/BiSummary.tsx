import React, { useState } from 'react';
import { Search, AlertCircle, CheckCircle2, Clock, Lock, ArrowUpRight } from 'lucide-react';
import { Activity, Execution } from '../types';

interface BiItem {
  id: string;
  name: string;
  priority: 'P0' | 'P1' | 'P2';
  priorityLabel: string;
  time: string;
  type: string;
  dependency: string;
  status: 'OK' | 'Bloqueado' | 'Pendente' | 'Próximo ciclo';
  activityId: string;
}

interface BiSummaryProps {
  executions: Execution[];
  activities: Activity[];
  onSelectExecution: (executionId: string) => void;
  onForceCreateExecution?: (activityId: string, time: string) => void;
  onCompleteExecution: (execId: string, elapsedSeconds: number) => void;
}

export const BiSummary: React.FC<BiSummaryProps> = ({
  executions,
  activities,
  onSelectExecution,
  onForceCreateExecution,
  onCompleteExecution,
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  // Estrita lógica de dados solicitada pelo usuário
  const bisData: BiItem[] = [
    {
      id: '1',
      name: 'BI_Alerta_Vagas_TeleSaude',
      priority: 'P0',
      priorityLabel: '🔴 P0',
      time: '6x/dia',
      type: 'Manual',
      dependency: 'FATO_ATUAL',
      status: 'OK',
      activityId: 'bi-alerta-vagas-telesaude',
    },
    {
      id: '2',
      name: 'BI_Alerta_Vagas_v2',
      priority: 'P0',
      priorityLabel: '🔴 P0',
      time: '6x/dia',
      type: 'Monitoramento',
      dependency: 'Bases + fluxo',
      status: 'OK',
      activityId: 'bi-alerta-vagas-v2',
    },
    {
      id: '3',
      name: 'BI_Alerta_Vagas_sub',
      priority: 'P0',
      priorityLabel: '🔴 P0',
      time: '6x/dia',
      type: 'Monitoramento',
      dependency: 'Alteryx',
      status: 'OK',
      activityId: 'bi-alerta-vagas-sub',
    },
    {
      id: '4',
      name: 'BI Painel dos Médicos',
      priority: 'P1',
      priorityLabel: '规格 P1',
      time: '10:00',
      type: 'Manual',
      dependency: 'T9033 + T22J3 + Base Falta Espera',
      status: 'Bloqueado',
      activityId: 'bi-painel-medicos',
    },
    {
      id: '5',
      name: 'BI Relatório de Consultas Disponibilizadas v2',
      priority: 'P1',
      priorityLabel: '🟠 P1',
      time: '13:00',
      type: 'Manual',
      dependency: 'T22J2 + scripts',
      status: 'Pendente',
      activityId: 'bi-consultas-disponibilizadas',
    },
    {
      id: '6',
      name: 'BI Controle_Agendas',
      priority: 'P1',
      priorityLabel: '🟠 P1',
      time: '16:00',
      type: 'Manual',
      dependency: '4 bases',
      status: 'Pendente',
      activityId: 'bi-controle-agendas',
    },
    {
      id: '7',
      name: 'BI Captação de Agendas',
      priority: 'P1',
      priorityLabel: '🟠 P1',
      time: '17:00',
      type: 'Manual',
      dependency: 'Excel + Oracle',
      status: 'Pendente',
      activityId: 'bi-captacao-agendas',
    },
    {
      id: '8',
      name: 'BI Relatório de Cancelamento v2',
      priority: 'P2',
      priorityLabel: '🟡 P2',
      time: '06:00',
      type: 'Automática',
      dependency: 'Automação',
      status: 'OK',
      activityId: 'bi-cancelamento',
    },
    {
      id: '9',
      name: 'BI Relatório de Consultas em Transferência',
      priority: 'P2',
      priorityLabel: '🟡 P2',
      time: '09:00',
      type: 'Automática',
      dependency: 'Automação',
      status: 'OK',
      activityId: 'bi-consultas-transferencia',
    },
    {
      id: '10',
      name: 'BI Relatório de Cirurgias',
      priority: 'P2',
      priorityLabel: '🟡 P2',
      time: '09:00',
      type: 'Manual',
      dependency: '—',
      status: 'Pendente',
      activityId: 'bi-cirurgias',
    },
    {
      id: '11',
      name: 'BI Relatório Atraso dos Médicos',
      priority: 'P2',
      priorityLabel: '🟡 P2',
      time: '10:00',
      type: 'Automática',
      dependency: 'Automação',
      status: 'OK',
      activityId: 'bi-atraso-medicos',
    },
    {
      id: '12',
      name: 'BI Relatório de Acompanhamento de Mensageria',
      priority: 'P2',
      priorityLabel: '🟡 P2',
      time: '11:30',
      type: 'Automática',
      dependency: 'Automação',
      status: 'OK',
      activityId: 'bi-acompanhamento-mensageria',
    },
    {
      id: '13',
      name: 'Listagem MEDPREV',
      priority: 'P2',
      priorityLabel: '🟡 P2',
      time: 'Quinzenal',
      type: 'Quinzenal',
      dependency: 'Regras de negócio',
      status: 'Próximo ciclo',
      activityId: 'listagem-medprev',
    },
    {
      id: '14',
      name: 'Listagem VS',
      priority: 'P2',
      priorityLabel: '🟡 P2',
      time: 'Quinzenal',
      type: 'Quinzenal',
      dependency: 'DIM_VS + especialidades',
      status: 'Próximo ciclo',
      activityId: 'listagem-vs',
    },
  ];

  const handleRowClick = (item: BiItem) => {
    // Tenta encontrar uma execução ativa para o dia de hoje correspondente
    const matchExec = executions.find(
      (e) => e.activityId.toLowerCase() === item.activityId.toLowerCase()
    );
    if (matchExec) {
      onSelectExecution(matchExec.id);
    } else {
      // Se não houver, e o callback for fornecido, cria ou alerta
      const act = activities.find(
        (a) => a.id.toLowerCase() === item.activityId.toLowerCase()
      );
      if (act && onForceCreateExecution) {
        const timeStr = item.time.includes(':') ? item.time : '08:00';
        onForceCreateExecution(act.id, timeStr);
        // Após criar, busca novamente
        setTimeout(() => {
          const freshExec = executions.find(
            (e) => e.activityId.toLowerCase() === item.activityId.toLowerCase()
          );
          if (freshExec) {
            onSelectExecution(freshExec.id);
          }
        }, 100);
      } else {
        alert(
          `BI "${item.name}" não possui execução diária aberta para hoje ou está fora do escopo do ciclo atual. Verifique a aba de Ciclos ou use "Acionar Hoje" para forçar.`
        );
      }
    }
  };

  const handleCheckClick = (e: React.MouseEvent, item: BiItem) => {
    e.stopPropagation(); // Evita carregar o detalhe da linha
    
    const matchExec = executions.find(
      (exec) => exec.activityId.toLowerCase() === item.activityId.toLowerCase()
    );

    if (matchExec) {
      if (matchExec.status === 'CONCLUIDO') {
        alert(`Este BI "${item.name}" já está concluído e auditado para hoje!`);
      } else {
        // Conclui imediatamente
        onCompleteExecution(matchExec.id, matchExec.durationSeconds || 60);
      }
    } else {
      // Força a criação e conclui imediatamente
      const act = activities.find(
        (a) => a.id.toLowerCase() === item.activityId.toLowerCase()
      );
      if (act && onForceCreateExecution) {
        const timeStr = item.time.includes(':') ? item.time : '08:00';
        onForceCreateExecution(act.id, timeStr);
        setTimeout(() => {
          const freshExec = executions.find(
            (exec) => exec.activityId.toLowerCase() === item.activityId.toLowerCase()
          );
          if (freshExec) {
            onCompleteExecution(freshExec.id, 60);
          }
        }, 150);
      } else {
        alert(`Não foi possível criar e concluir esta atividade automaticamente.`);
      }
    }
  };

  const filteredBis = bisData.filter((bi) => {
    const text = searchTerm.toLowerCase();
    return (
      bi.name.toLowerCase().includes(text) ||
      bi.dependency.toLowerCase().includes(text) ||
      bi.priority.toLowerCase().includes(text) ||
      bi.status.toLowerCase().includes(text)
    );
  });

  return (
    <div className="bg-white rounded-xl shadow border border-gray-100 p-6 flex flex-col h-full animate-fade-in">
      {/* Header com pesquisa */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-100">
        <div>
          <h2 className="font-sora font-black text-lg text-gray-900">
            Resumo de Power BIs do Faturamento
          </h2>
          <p className="text-xs text-gray-400 mt-0.5">
            Marque diretamente no check para auditar ou clique na linha para carregar diretrizes UNC.
          </p>
        </div>

        {/* Input de Busca elegante */}
        <div className="relative">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Pesquisar BI..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 pr-4 py-1.5 text-xs rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#0339A6] w-64 bg-gray-50/50"
          />
        </div>
      </div>

      {/* Tabela Responsiva */}
      <div className="overflow-x-auto flex-1 mt-4">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-gray-100 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
              <th className="py-3 px-4 text-center w-12">Check</th>
              <th className="py-3 px-4">BI / Painel</th>
              <th className="py-3 px-3 text-center">Prioridade</th>
              <th className="py-3 px-3">Horário</th>
              <th className="py-3 px-3">Tipo</th>
              <th className="py-3 px-4">Dependência</th>
              <th className="py-3 px-4 text-right">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50 text-xs">
            {filteredBis.map((bi) => {
              const isActive = activities.some(
                (a) => a.id.toLowerCase() === bi.activityId.toLowerCase()
              );
              
              const matchExec = executions.find(
                (e) => e.activityId.toLowerCase() === bi.activityId.toLowerCase()
              );
              
              const isDone = matchExec?.status === 'CONCLUIDO';

              return (
                <tr
                  key={bi.id}
                  onClick={() => handleRowClick(bi)}
                  className={`hover:bg-gray-50 transition cursor-pointer group ${
                    isDone ? 'bg-green-50/25' : isActive ? 'opacity-100' : 'opacity-85'
                  }`}
                >
                  {/* Coluna do Botão de Check */}
                  <td className="py-3 px-4 text-center">
                    <button
                      onClick={(e) => handleCheckClick(e, bi)}
                      className={`h-5 w-5 rounded border flex items-center justify-center transition-all duration-200 ${
                        isDone 
                          ? 'bg-green-600 border-green-600 text-white shadow-sm'
                          : 'border-gray-300 hover:border-[#0339A6] bg-white text-transparent hover:text-gray-200'
                      }`}
                      title={isDone ? "BI Concluído!" : "Marcar como concluído instantaneamente"}
                    >
                      <CheckCircle2 className="h-3.5 w-3.5 stroke-[3]" />
                    </button>
                  </td>

                  <td className="py-3 px-4 font-bold text-gray-800 group-hover:text-[#0339A6] flex items-center gap-1.5 min-w-[200px]">
                    <span className="truncate">{bi.name}</span>
                    <ArrowUpRight className="h-3 w-3 text-gray-300 group-hover:text-[#0339A6] opacity-0 group-hover:opacity-100 transition-opacity" />
                  </td>
                  <td className="py-3 px-3 text-center">
                    <span
                      className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        bi.priority === 'P0'
                          ? 'bg-red-50 text-red-600 border border-red-100'
                          : bi.priority === 'P1'
                          ? 'bg-orange-50 text-orange-600 border border-orange-100'
                          : 'bg-yellow-50 text-yellow-700 border border-yellow-100'
                      }`}
                    >
                      {bi.priority === 'P0' ? '🔴 P0' : bi.priority === 'P1' ? '🟠 P1' : '🟡 P2'}
                    </span>
                  </td>
                  <td className="py-3 px-3 font-mono text-gray-600 min-w-[80px]">
                    {bi.time}
                  </td>
                  <td className="py-3 px-3 text-gray-500">
                    {bi.type}
                  </td>
                  <td className="py-3 px-4 text-gray-600 max-w-[220px] truncate" title={bi.dependency}>
                    {bi.dependency}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <span
                      className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-0.5 rounded-full ${
                        isDone || bi.status === 'OK'
                          ? 'bg-green-50 text-green-700 border border-green-100'
                          : bi.status === 'Bloqueado'
                          ? 'bg-red-50 text-red-700 border border-red-100'
                          : bi.status === 'Pendente'
                          ? 'bg-amber-50 text-amber-700 border border-amber-100'
                          : 'bg-blue-50 text-blue-700 border border-blue-100'
                      }`}
                    >
                      {isDone || bi.status === 'OK' ? (
                        <>
                          <CheckCircle2 className="h-3 w-3 text-green-500" />
                          <span>OK</span>
                        </>
                      ) : bi.status === 'Bloqueado' ? (
                        <>
                          <Lock className="h-3 w-3 text-red-500" />
                          <span>Bloqueado</span>
                        </>
                      ) : bi.status === 'Pendente' ? (
                        <>
                          <Clock className="h-3 w-3 text-amber-500 animate-pulse" />
                          <span>Pendente</span>
                        </>
                      ) : (
                        <>
                          <span>📅 Próximo ciclo</span>
                        </>
                      )}
                    </span>
                  </td>
                </tr>
              );
            })}
            {filteredBis.length === 0 && (
              <tr>
                <td colSpan={7} className="text-center py-8 text-gray-400">
                  Nenhum BI correspondente à pesquisa.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      
      {/* Rodapé de instrução rápida */}
      <div className="bg-gray-50 border border-gray-100 rounded-lg p-3 mt-4 flex items-start gap-2">
        <AlertCircle className="h-4 w-4 text-[#0339A6] shrink-0 mt-0.5" />
        <span className="text-[10px] text-gray-500 leading-normal">
          <b>Check Rápido:</b> Clique no quadradinho de check para marcar a atividade como concluída e auditada instantaneamente, registrando a conformidade no relatório diário de produtividade.
        </span>
      </div>
    </div>
  );
};
