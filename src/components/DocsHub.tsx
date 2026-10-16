import React, { useEffect, useRef, useState } from 'react';

// Lista dos relatórios disponíveis para navegação rápida no topo do componente
const BI_DOCS_LIST = [
  { id: 'pagamentos', title: 'Acompanhamento de Pagamentos Prestadores', file: 'Relatorio_Completo_BI_Acompanhamento_de_Pagamentos_Prestadores_Sem_bases_dinamicas.html' },
  { id: 'alerta-sub', title: 'Alerta Diário de Vagas_Sub', file: 'Relatorio_Completo_BI_Alerta_Diario_de_Vagas_Sub.html' },
  { id: 'telesaude', title: 'BI_Alerta_Vagas_TeleSaude', file: 'Relatorio_Completo_BI_BI_Alerta_Vagas_TeleSaude.html' },
  { id: 'necessidade', title: 'BI_NECESSIDADE_COMPRA', file: 'Relatorio_Completo_BI_BI_NECESSIDADE_COMPRA.html' },
  { id: 'captacao', title: 'Captacao_de_Agendas', file: 'Relatorio_Completo_BI_Captacao_de_Agendas.html' },
  { id: 'controle', title: 'Controle_Agendas', file: 'Relatorio_Completo_BI_Controle_Agendas.html' },
  { id: 'farol', title: 'Farol de Indice Consultas por Hora - ICH', file: 'Relatorio_Completo_BI_Farol_de_Indice_Consultas_por_Hora_ICH.html' },
  { id: 'painel-medicos', title: 'Painel Médicos Hapclinicas V2', file: 'Relatorio_Completo_BI_Painel_Medicos_Hapclinicas_V2.html' },
  { id: 'transferencia', title: 'RELATORIO DE CONSULTAS EM TRANSFERENCIA', file: 'Relatorio_Completo_BI_RELATORIO_DE_CONSULTAS_EM_TRANSFERENCIA.html' },
  { id: 'sac', title: 'Relatorio_SAC', file: 'Relatorio_Completo_BI_Relatorio_SAC.html' },
  { id: 'alerta-vagas-v2', title: 'Relatório Alerta de Vagas v2', file: 'Relatorio_Completo_BI_Relatorio_Alerta_de_Vagas_v2.html' },
  { id: 'atraso', title: 'Relatório Atraso dos Médicos', file: 'Relatorio_Completo_BI_Relatorio_Atraso_dos_Medicos.html' },
  { id: 'rede-cred', title: 'Relatório Indicadores Rede Cred', file: 'Relatorio_Completo_BI_Relatorio_Indicadores_Rede_Cred.html' },
  { id: 'mensageria', title: 'Relatório de Acompanhamento de Mensageria', file: 'Relatorio_Completo_BI_Relatorio_de_Acompanhamento_de_Mensageria.html' },
  { id: 'cancelamento', title: 'Relatório de Cancelamento v2', file: 'Relatorio_Completo_BI_Relatorio_de_Cancelamento_v2.html' },
  { id: 'cirurgias', title: 'Relatório de Cirurgias', file: 'Relatorio_Completo_BI_Relatorio_de_Cirurgias.html' },
  { id: 'consultas-disp', title: 'Relatório de Consultas Disponibilizadas v2', file: 'Relatorio_Completo_BI_Relatorio_de_Consultas_Disponibilizadas_v2.html' },
  { id: 'estoque', title: 'Relatório de Estoque e Abastecimento v2', file: 'Relatorio_Completo_BI_Relatorio_de_Estoque_e_Abastecimento_v2.html' },
];

const DOCS_BASE_PATH = '/docs';

export const DocsHub: React.FC = () => {
  const [currentFile, setCurrentFile] = useState<string>('index.html');
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const iframeSrc = `${DOCS_BASE_PATH}/${currentFile}`;

  useEffect(() => {
    const iframe = iframeRef.current;
    if (!iframe) return;

    const handleLoad = () => {
      const pathname = iframe.contentWindow?.location.pathname;
      if (!pathname?.startsWith(`${DOCS_BASE_PATH}/`)) return;

      const loadedFile = pathname.slice(`${DOCS_BASE_PATH}/`.length);
      if (BI_DOCS_LIST.some((doc) => doc.file === loadedFile) || loadedFile === 'index.html') {
        setCurrentFile(loadedFile);
      }
    };

    iframe.addEventListener('load', handleLoad);
    return () => iframe.removeEventListener('load', handleLoad);
  }, [iframeSrc]);

  const navigateIframe = (action: 'back' | 'forward' | 'reload') => {
    const frameWindow = iframeRef.current?.contentWindow;
    if (!frameWindow) return;

    if (action === 'back') frameWindow.history.back();
    if (action === 'forward') frameWindow.history.forward();
    if (action === 'reload') frameWindow.location.reload();
  };

  return (
    <div className="flex flex-col bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden h-[calc(100vh-130px)] min-h-[650px]">
      {/* Barra de ferramentas superior */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-50 px-4 py-3 border-b border-slate-200">
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-[#FF5001]" />
          <h2 className="text-sm font-bold text-[#1D40A8]">Hub de Documentações Técnicas BI</h2>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => navigateIframe('back')}
            className="px-2.5 py-1.5 text-xs font-semibold rounded-lg bg-white text-slate-700 border border-slate-300 hover:bg-slate-100 transition"
            aria-label="Voltar no relatório"
            title="Voltar"
          >
            ←
          </button>
          <button
            type="button"
            onClick={() => navigateIframe('forward')}
            className="px-2.5 py-1.5 text-xs font-semibold rounded-lg bg-white text-slate-700 border border-slate-300 hover:bg-slate-100 transition"
            aria-label="Avançar no relatório"
            title="Avançar"
          >
            →
          </button>
          <button
            type="button"
            onClick={() => navigateIframe('reload')}
            className="px-2.5 py-1.5 text-xs font-semibold rounded-lg bg-white text-slate-700 border border-slate-300 hover:bg-slate-100 transition"
            aria-label="Recarregar relatório"
            title="Recarregar"
          >
            ↻
          </button>
          <button
            type="button"
            onClick={() => setCurrentFile('index.html')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition cursor-pointer ${
              currentFile === 'index.html' ? 'bg-[#1D40A8] text-white' : 'bg-white text-slate-700 border border-slate-300 hover:bg-slate-100'
            }`}
          >
            Visão Geral (Hub)
          </button>

          <select
            value={currentFile}
            onChange={(e) => setCurrentFile(e.target.value)}
            aria-label="Selecionar relatório técnico"
            className="px-3 py-1.5 text-xs font-medium bg-white border border-slate-300 rounded-lg text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#1D40A8]"
          >
            <option value="index.html">📄 Selecionar Relatório Específico...</option>
            {BI_DOCS_LIST.map((doc) => (
              <option key={doc.id} value={doc.file}>
                {doc.title}
              </option>
            ))}
          </select>

          <a
            href={iframeSrc}
            target="_blank"
            rel="noopener noreferrer"
            className="px-3 py-1.5 text-xs font-semibold bg-[#FF5001] text-white hover:opacity-90 rounded-lg transition"
          >
            Expandir ↗
          </a>
        </div>
      </div>

      {/* Frame que exibe o arquivo HTML */}
      <iframe
        ref={iframeRef}
        key={iframeSrc}
        src={iframeSrc}
        title="Hub de Documentações"
        className="w-full flex-1 border-0 bg-white"
      />
    </div>
  );
};

export default DocsHub;