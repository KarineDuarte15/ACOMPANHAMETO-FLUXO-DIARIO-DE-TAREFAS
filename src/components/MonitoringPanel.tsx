import React, { useState, useEffect } from 'react';
import * as XLSX from 'xlsx';

interface MonitorRow {
  'Data/Hora (HH:MM:SS)': string;
  'Categoria': string;
  'Processo': string;
  'Prioridade': string;
  'Status': string;
  'Execuções Hoje': number;
  'Sucessos Hoje': number;
  'Erros Hoje': number;
  'Último Fim (HH:MM:SS)': string;
  'Tempo Médio Processo (min)': string | number;
  'Tempo Médio / Arquivo (min)': string | number;
  'Meta Diária / Mensal': string;
  'Alertas / Erros': string;
}

export const MonitoringPanel: React.FC = () => {
  const [rows, setRows] = useState<MonitorRow[]>([]);
  const [lastUpload, setLastUpload] = useState<string>('');
  const [activeCategory, setActiveCategory] = useState<'all' | 'Painel BI' | 'Base de Dados'>('all');

  useEffect(() => {
    const savedData = localStorage.getItem('optimusbi_vercel_rows');
    const savedTime = localStorage.getItem('optimusbi_vercel_time');
    if (savedData) setRows(JSON.parse(savedData));
    if (savedTime) setLastUpload(savedTime);
  }, []);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      const bstr = evt.target?.result;
      const wb = XLSX.read(bstr, { type: 'binary' });
      const wsname = wb.SheetNames[0]; // Lê a aba "Resumo_Diario" gerada pelo Python
      const ws = wb.Sheets[wsname];
      const data = XLSX.utils.sheet_to_json<MonitorRow>(ws);

      const nowStr = new Date().toLocaleString('pt-BR');
      setRows(data);
      setLastUpload(nowStr);
      localStorage.setItem('optimusbi_vercel_rows', JSON.stringify(data));
      localStorage.setItem('optimusbi_vercel_time', nowStr);
    };
    reader.readAsBinaryString(file);
  };

  const filteredRows = rows.filter(r =>
    activeCategory === 'all' ? true : r['Categoria'] === activeCategory
  );

  const countStatus = (st: string) => filteredRows.filter(r => r['Status'] === st).length;

  const getStatusColor = (st: string) => {
    switch (st?.toUpperCase()) {
      case 'OK': return 'border-emerald-500 bg-emerald-500';
      case 'ERRO':
      case 'ERR': return 'border-[#F21D2F] bg-[#F21D2F]';
      case 'ALERTA':
      case 'WARN': return 'border-[#F2B705] bg-[#F2B705]';
      case 'RODANDO':
      case 'RUN': return 'border-[#0339A6] bg-[#0339A6]';
      default: return 'border-slate-400 bg-slate-400';
    }
  };

  const getPrioBadge = (prio: string) => {
    if (prio === 'P0') return 'bg-[#F21D2F] text-white';
    if (prio === 'P1') return 'bg-[#F24405] text-white';
    if (prio === 'P2') return 'bg-[#F2B705] text-[#1F2937]';
    return 'bg-[#0339A6] text-white';
  };

  return (
    <div className="min-h-screen bg-[#F2F2F2] text-[#1F2937] p-6">
      {/* Cabeçalho Homogêneo OptimusBI */}
      <div className="bg-[#0339A6] text-white rounded-xl p-5 shadow-md mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight">Monitoramento OptimusBI (Sincronizado via Python)</h2>
          <p className="text-xs text-slate-200 mt-1">
            Última carga (.xlsx): <span className="font-mono bg-[#122A44] text-[#F2B705] px-2 py-0.5 rounded">{lastUpload || 'Aguardando arquivo...'}</span>
          </p>
        </div>

        {/* Input de Arquivo usado pelo Robô Python a cada 30 minutos */}
        <div className="flex items-center gap-3">
          <label
            htmlFor="upload-monitoramento-xlsx"
            className="cursor-pointer bg-[#F2B705] hover:bg-[#122A44] hover:text-[#F2B705] text-[#122A44] font-bold text-sm px-4 py-2 rounded-lg transition"
          >
            📥 Incluir Relatório (.xlsx)
          </label>
          <input
            id="upload-monitoramento-xlsx"
            data-testid="upload-monitoramento-xlsx"
            type="file"
            accept=".xlsx,.xls"
            onChange={handleFileUpload}
            className="hidden"
          />
        </div>
      </div>

      {/* Sub-abas Homogêneas */}
      <div className="flex gap-2 mb-5">
        {(['all', 'Painel BI', 'Base de Dados'] as const).map(cat => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition ${
              activeCategory === cat
                ? 'bg-[#0339A6] text-white shadow'
                : 'bg-white text-slate-700 border border-slate-200 hover:bg-[#122A44] hover:text-white'
            }`}
          >
            {cat === 'all' ? 'Visão Geral (Todos)' : cat}
          </button>
        ))}
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg border border-slate-200 border-l-4 border-l-[#0339A6]">
          <b className="text-2xl block">{filteredRows.length}</b>
          <span className="text-xs text-slate-500">Total Monitorado</span>
        </div>
        <div className="bg-white p-4 rounded-lg border border-slate-200 border-l-4 border-l-emerald-500">
          <b className="text-2xl block">{countStatus('OK')}</b>
          <span className="text-xs text-slate-500">Status OK</span>
        </div>
        <div className="bg-white p-4 rounded-lg border border-slate-200 border-l-4 border-l-[#0339A6]">
          <b className="text-2xl block">{countStatus('RUN')}</b>
          <span className="text-xs text-slate-500">Rodando</span>
        </div>
        <div className="bg-white p-4 rounded-lg border border-slate-200 border-l-4 border-l-[#F2B705]">
          <b className="text-2xl block">{countStatus('WARN')}</b>
          <span className="text-xs text-slate-500">Em Alerta</span>
        </div>
        <div className="bg-white p-4 rounded-lg border border-slate-200 border-l-4 border-l-[#F21D2F]">
          <b className="text-2xl block">{countStatus('ERR')}</b>
          <span className="text-xs text-slate-500">Crítico / Erro</span>
        </div>
      </div>

      {/* Cards Detalhados */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredRows.map((r, i) => {
          const stColor = getStatusColor(r['Status']);
          return (
            <div key={i} className={`bg-white rounded-lg border border-slate-200 border-t-4 ${stColor.split(' ')[0]} p-4 shadow-sm`}>
              <div className="flex justify-between items-start gap-2 mb-2">
                <h3 className="font-bold text-[#0339A6] text-base">{r['Processo']}</h3>
                <span className={`text-xs font-bold text-white px-2.5 py-0.5 rounded-full ${stColor.split(' ')[1]}`}>
                  {r['Status']}
                </span>
              </div>

              <div className="flex gap-2 mb-3 text-xs font-bold">
                <span className={`px-2 py-0.5 rounded ${getPrioBadge(r['Prioridade'])}`}>
                  Prioridade {r['Prioridade']}
                </span>
                <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded">
                  {r['Categoria']}
                </span>
              </div>

              <div className="text-xs space-y-1.5 divide-y divide-dashed divide-slate-200">
                <div className="flex justify-between py-1">
                  <span className="text-slate-500">Execuções Hoje:</span>
                  <span className="font-medium">{r['Execuções Hoje']} ({r['Sucessos Hoje']} ok / {r['Erros Hoje']} erro)</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-500">Último Fim:</span>
                  <span className="font-medium">{r['Último Fim (HH:MM:SS)']}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-500">Tempo Médio Processo:</span>
                  <span className="font-medium">{r['Tempo Médio Processo (min)']} min</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-500">Tempo Médio / Arquivo:</span>
                  <span className="font-medium">{r['Tempo Médio / Arquivo (min)']} min/arq</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-500">Meta Diária / Mensal:</span>
                  <span className="font-medium text-right">{r['Meta Diária / Mensal']}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-500">Verificado em:</span>
                  <span className="font-bold">{r['Data/Hora (HH:MM:SS)']}</span>
                </div>
              </div>

              {r['Alertas / Erros'] && (
                <div className="mt-3 p-2 rounded bg-red-50 text-[#F21D2F] border-l-4 border-[#F21D2F] text-xs font-medium">
                  {r['Alertas / Erros']}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};