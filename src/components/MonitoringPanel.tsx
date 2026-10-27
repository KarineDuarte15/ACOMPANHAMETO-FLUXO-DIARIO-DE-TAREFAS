import React, { useState, useEffect } from 'react';
import * as XLSX from 'xlsx';
import { db } from '../services/firebase';
import { collection, doc, setDoc, onSnapshot, query, where, getDocs, deleteDoc } from 'firebase/firestore';

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
  const [selectedHour, setSelectedHour] = useState<string>('now');
  const [showAlertModal, setShowAlertModal] = useState<boolean>(false);
  const [alertMessages, setAlertMessages] = useState<string[]>([]);

  // Limpeza automática de dados com mais de 30 dias no Firebase
  const limparDadosAntigosFirebase = async () => {
    try {
      const trintaDiasAtras = Date.now() - (30 * 24 * 60 * 60 * 1000);
      const q = query(collection(db, "optimusbi_monitoramento"), where("timestampMs", "<", trintaDiasAtras));
      const snapshot = await getDocs(q);
      const apagar = snapshot.docs.map(d => deleteDoc(doc(db, "optimusbi_monitoramento", d.id)));
      await Promise.all(apagar);
    } catch (e) {
      console.error("Erro na retenção de 30 dias:", e);
    }
  };

  // Escuta em tempo real o Firebase Firestore
  useEffect(() => {
    limparDadosAntigosFirebase();
    const unsub = onSnapshot(collection(db, "optimusbi_monitoramento"), (snapshot) => {
      if (!snapshot.empty) {
        // Pega o documento mais recente baseado no timestamp
        const docs = snapshot.docs.map(d => d.data());
        docs.sort((a, b) => b.timestampMs - a.timestampMs);
        const maisRecente = docs[0];
        if (maisRecente && maisRecente.rows) {
          setRows(maisRecente.rows);
          setLastUpload(maisRecente.lastUpload || '');

          // Verifica se há erros críticos para disparar o Pop-up de Alerta
          const errosCriticos = maisRecente.rows
            .filter((r: MonitorRow) => r['Status'] === 'ERRO' || r['Status'] === 'ERR')
            .map((r: MonitorRow) => `${r['Processo']}: ${r['Alertas / Erros']}`);
          
          if (errosCriticos.length > 0) {
            setAlertMessages(errosCriticos);
            setShowAlertModal(true);
          }
        }
      }
    });

    return () => unsub();
  }, []);

  // Upload manual ou automatizado via input
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (evt) => {
      const bstr = evt.target?.result;
      const wb = XLSX.read(bstr, { type: 'binary' });
      const wsname = wb.SheetNames[0];
      const ws = wb.Sheets[wsname];
      const data = XLSX.utils.sheet_to_json<MonitorRow>(ws);

      const nowStr = new Date().toLocaleString('pt-BR');
      const payload = {
        id: 'painel_atual',
        rows: data,
        lastUpload: nowStr,
        timestampMs: Date.now()
      };

      // Salva no Firestore para atualizar todas as telas da Vercel em tempo real
      await setDoc(doc(db, "optimusbi_monitoramento", "painel_atual"), payload);
    };
    reader.readAsBinaryString(file);
  };

  const filteredRows = rows.filter(r =>
    activeCategory === 'all' ? true : r['Categoria'] === activeCategory
  );

  const countStatus = (st: string) => filteredRows.filter(r => r['Status'] === st).length;

  // Mapeamento dos relatórios na pasta public/docs/
  const getDocLink = (processo: string) => {
    const map: { [key: string]: string } = {
      'BI Alerta Vagas v2': 'Relatorio_Completo_BI_Relatorio_Alerta_de_Vagas_v2.html',
      'BI Alerta Vagas Tele Saúde': 'Relatorio_Completo_BI_BI_Alerta_Vagas_TeleSaude.html',
      'BI Necessidade de Compra': 'Relatorio_Completo_BI_BI_NECESSIDADE_COMPRA.html',
      'Estoque e Abastecimento': 'Relatorio_Completo_BI_Relatorio_de_Estoque_e_Abastecimento_v2.html',
      'BI Relatório de Consultas Disponibilizadas': 'Relatorio_Completo_BI_Relatorio_de_Consultas_Disponibilizadas_v2.html',
      'BI Farol ICH (DGE)': 'Relatorio_Completo_BI_Farol_de_Indice_Consultas_por_Hora_ICH.html',
      'BI Relatório de Consultas em Transferência': 'Relatorio_Completo_BI_RELATORIO_DE_CONSULTAS_EM_TRANSFERENCIA.html',
      'BI Relatório de Cirurgias': 'Relatorio_Completo_BI_Relatorio_de_Cirurgias.html',
      'BI Relatório Atraso dos Médicos': 'Relatorio_Completo_BI_Relatorio_Atraso_dos_Medicos.html',
      'BI Relatório de Acompanhamento de Mensageria': 'Relatorio_Completo_BI_Relatorio_de_Acompanhamento_de_Mensageria.html',
      'BI Relatorio_SAC': 'Relatorio_Completo_BI_Relatorio_SAC.html',
      'BI INDICADORES REDE CRED': 'Relatorio_Completo_BI_Relatorio_Indicadores_Rede_Cred.html'
    };
    return map[processo] ? `/docs/${map[processo]}` : null;
  };

  return (
    <div className="min-h-screen bg-[#F2F2F2] text-[#1F2937] p-6">
      {/* Modal / Pop-up de Alerta Crítico */}
      {showAlertModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-lg w-full p-6 border-t-8 border-[#F21D2F] shadow-2xl">
            <h3 className="text-lg font-bold text-[#F21D2F] mb-2 flex items-center gap-2">
              🚨 Alerta Crítico de Monitoramento
            </h3>
            <p className="text-xs text-slate-500 mb-4">Foram detetadas falhas ativas nos processos abaixo:</p>
            <div className="max-h-60 overflow-y-auto space-y-2 mb-5">
              {alertMessages.map((msg, idx) => (
                <div key={idx} className="bg-red-50 text-[#F21D2F] p-2.5 rounded text-xs font-semibold border-l-4 border-[#F21D2F]">
                  {msg}
                </div>
              ))}
            </div>
            <button
              onClick={() => setShowAlertModal(false)}
              className="w-full bg-[#0339A6] hover:bg-[#122A44] text-white font-bold py-2 rounded-lg text-sm transition"
            >
              Compreendido / Fechar Alerta
            </button>
          </div>
        </div>
      )}

      {/* Cabeçalho */}
      <div className="bg-[#0339A6] text-white rounded-xl p-5 shadow-md mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight">Monitoramento OptimusBI (Tempo Real - Vercel)</h2>
          <p className="text-xs text-slate-200 mt-1">
            Informação atualizada pela última vez no horário registrado: <span className="font-mono bg-[#122A44] text-[#F2B705] px-2 py-0.5 rounded">{lastUpload || 'Aguardando sincronização...'}</span>
          </p>
        </div>
        <div className="flex items-center gap-3">
          <label htmlFor="upload-xlsx" className="cursor-pointer bg-[#F2B705] hover:bg-[#122A44] hover:text-[#F2B705] text-[#122A44] font-bold text-sm px-4 py-2 rounded-lg transition">
            📥 Enviar Planilha (.xlsx)
          </label>
          <input id="upload-xlsx" type="file" accept=".xlsx" onChange={handleFileUpload} className="hidden" />
        </div>
      </div>

      {/* Filtro de Horário e Abas */}
      <div className="bg-white p-3 rounded-lg border border-slate-200 mb-5 flex flex-wrap items-center justify-between gap-4">
        <div className="flex gap-2">
          {(['all', 'Painel BI', 'Base de Dados'] as const).map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition ${
                activeCategory === cat ? 'bg-[#0339A6] text-white shadow' : 'bg-slate-100 text-slate-700 hover:bg-[#122A44] hover:text-white'
              }`}
            >
              {cat === 'all' ? 'Visão Geral' : cat}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2 text-xs">
          <span className="font-semibold text-slate-600">⏱️ Filtro de Horário:</span>
          <select value={selectedHour} onChange={(e) => setSelectedHour(e.target.value)} className="border border-slate-300 rounded px-2 py-1 bg-white">
            <option value="now">Tempo Real (Atual)</option>
            <option value="06:00">06:00</option>
            <option value="09:00">09:00</option>
            <option value="12:00">12:00</option>
            <option value="18:00">18:00</option>
          </select>
        </div>
      </div>

      {/* Cards de Indicadores (KPIs) */}
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
          <span className="text-xs text-slate-500">Com Erro</span>
        </div>
      </div>

      {/* Grid de Cards com Botão de Relatório */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredRows.map((r, i) => {
          const docLink = getDocLink(r['Processo']);
          return (
            <div key={i} className="bg-white rounded-lg border border-slate-200 p-4 shadow-sm relative">
              <div className="flex justify-between items-start gap-2 mb-2">
                <h3 className="font-bold text-[#0339A6] text-base">{r['Processo']}</h3>
                <span className="text-xs font-bold text-white px-2.5 py-0.5 rounded-full bg-slate-700">
                  {r['Status']}
                </span>
              </div>
              <div className="text-xs space-y-1 mb-4 text-slate-600">
                <div>Execuções: {r['Execuções Hoje']} ({r['Sucessos Hoje']} ok / {r['Erros Hoje']} erro)</div>
                <div>Tempo Médio: {r['Tempo Médio Processo (min)']} min</div>
                <div>Meta: {r['Meta Diária / Mensal']}</div>
              </div>
              {docLink && (
                <a
                  href={docLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block w-full text-center bg-[#122A44] hover:bg-[#0339A6] text-[#F2B705] font-semibold text-xs py-2 rounded transition"
                >
                  📄 Abrir Relatório Técnico
                </a>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};