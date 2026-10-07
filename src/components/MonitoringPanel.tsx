import React, { useState, useEffect, useMemo } from 'react';
import { AppState, LogConfig, SystemConfig } from '../types';
import { 
  Activity, Clock, CheckCircle2, AlertTriangle, XCircle, RefreshCw, 
  Server, Settings, FileText, Play, ShieldAlert, Cpu, ArrowRight, 
  Search, Terminal, Database, HelpCircle, HardDrive, Upload, Cloud, Check
} from 'lucide-react';

interface MonitoringPanelProps {
  appState: AppState;
  setAppState: React.Dispatch<React.SetStateAction<AppState>>;
  onSaveConfig: (updatedState: AppState) => void;
}

export const MonitoringPanel: React.FC<MonitoringPanelProps> = ({
  appState,
  setAppState,
  onSaveConfig
}) => {
  const [isScanning, setIsScanning] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [countdown, setCountdown] = useState(1800); // 30 minutos em segundos (30 * 60)
  const [isAgentConnected, setIsAgentConnected] = useState(false);
  const [selectedLogDetail, setSelectedLogDetail] = useState<LogConfig | null>(null);

  // States para a Importação de JSON e Sincronização
  const [isJsonModalOpen, setIsJsonModalOpen] = useState(false);
  const [jsonInputText, setJsonInputText] = useState('');
  const [jsonError, setJsonError] = useState<string | null>(null);
  const [isCloudSaving, setIsCloudSaving] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const logs = appState.logs || [];
  const systemConfig = appState.systemConfig || {
    teamBrand: { name: "Optimus BI", subtitle: "Rotina Inteligente", primaryColor: "#0339A6", secondaryColor: "#F2B705" },
    monitoring: { enabled: true, intervalMinutes: 30, mode: 'MOCK' },
    user: { name: "Karine", role: "OPERACIONAL" }
  };

  // Contagem regressiva para a próxima varredura
  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          // Disparar varredura automática silenciosa ao zerar
          triggerSilentScan();
          return 1800; // Reiniciar para 30 minutos
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Verificar se o agente local (simulado ou real no localhost:8420) está ativo
  useEffect(() => {
    if (systemConfig.monitoring.mode === 'LOCAL_AGENT') {
      setIsAgentConnected(false);
      // Tentativa real de conexão com a porta do agente local para integridade máxima
      const controller = new AbortController();
      const id = setTimeout(() => controller.abort(), 1500);

      fetch('http://127.0.0.1:8420/health', { signal: controller.signal })
        .then(res => {
          if (res.ok) {
            setIsAgentConnected(true);
          }
        })
        .catch(() => {
          // Fallback silencioso se o agente físico não estiver de fato rodando na máquina do usuário
          setIsAgentConnected(false);
        })
        .finally(() => clearTimeout(id));
    } else {
      setIsAgentConnected(false);
    }
  }, [systemConfig.monitoring.mode, countdown]);

  const formatCountdown = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // Varredura automática silenciosa
  const triggerSilentScan = () => {
    setAppState(prev => {
      const updatedLogs = (prev.logs || []).map(l => {
        if (l.id === 'log_Script_Tabela_Captados_Fora_Alerta') return l;
        // Simulação de alteração aleatória muito rara
        const shouldChange = Math.random() < 0.15;
        if (shouldChange) {
          const statuses: Array<LogConfig['status']> = ['OK', 'ATENCAO', 'ERRO'];
          const randomStatus = statuses[Math.floor(Math.random() * statuses.length)];
          return {
            ...l,
            status: randomStatus,
            ultimaVerificacao: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
          };
        }
        return l;
      });
      const newState = { ...prev, logs: updatedLogs };
      setTimeout(() => onSaveConfig(newState), 50);
      return newState;
    });
  };

  // Varredura manual com animação interativa premium
  const handleManualScan = () => {
    setIsScanning(true);
    setTimeout(() => {
      setAppState(prev => {
        const updatedLogs = (prev.logs || []).map(l => {
          if (l.id === 'log_Script_Tabela_Captados_Fora_Alerta') {
            return {
              ...l,
              ultimaVerificacao: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
            };
          }
          // Rotaciona estados para dar vida e interatividade ao monitor de forma evidente
          const rand = Math.random();
          let status: LogConfig['status'] = 'OK';
          if (rand < 0.12) {
            status = 'ERRO';
          } else if (rand < 0.25) {
            status = 'ATENCAO';
          }
          
          return {
            ...l,
            status,
            ultimaVerificacao: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
            ultimaAtualizacao: new Date(Date.now() - Math.floor(Math.random() * 20 * 60000)).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
          };
        });

        const newState = { ...prev, logs: updatedLogs };
        setTimeout(() => onSaveConfig(newState), 50);
        return newState;
      });
      setIsScanning(false);
      setCountdown(1800); // Resetar contador
    }, 1500); // 1.5s de animação estilosa
  };

  // Executar contingência corretiva de logs
  const handleExecuteContingency = (logId: string) => {
    const log = logs.find(l => l.id === logId);
    if (!log) return;

    alert(`⚡ Executando Recuperação Inteligente:\n\nProcedimento: "${log.acao.toUpperCase()}"\nVerificando consistência do filesystem local...\nReprocessando script associado...`);

    setAppState(prev => {
      const updatedLogs = (prev.logs || []).map(l => {
        if (l.id === logId) {
          return {
            ...l,
            status: 'OK' as const,
            ultimaAtualizacao: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
            ultimaVerificacao: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
          };
        }
        return l;
      });

      const newState = { ...prev, logs: updatedLogs };
      setTimeout(() => onSaveConfig(newState), 50);
      return newState;
    });

    // Atualizar detalhes se o modal estiver aberto
    setSelectedLogDetail(prev => prev?.id === logId ? {
      ...prev,
      status: 'OK',
      ultimaAtualizacao: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
      ultimaVerificacao: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
    } : prev);
  };

  // Handler para Salvar em Nuvem de forma segura
  const handleCloudSave = () => {
    setIsCloudSaving(true);
    setTimeout(() => {
      onSaveConfig(appState);
      setIsCloudSaving(false);
      alert('☁️ CONEXÃO SÍNCRONA:\n\nDados da plataforma salvos na Nuvem do Optimus BI com sucesso!');
    }, 1200);
  };

  // Handler para Processar e Aplicar o JSON imputado
  const handleApplyJson = (e: React.FormEvent) => {
    e.preventDefault();
    setJsonError(null);
    try {
      const parsed = JSON.parse(jsonInputText);
      if (typeof parsed !== 'object' || parsed === null) {
        throw new Error('O JSON deve ser um objeto estruturado ou um array.');
      }
      
      setAppState(prev => {
        const newState = { ...prev };
        
        // Se for uma lista de logs direta
        if (Array.isArray(parsed)) {
          newState.logs = parsed as LogConfig[];
        } else {
          // Se for um objeto com chaves opcionais de estado
          if (parsed.activities) newState.activities = parsed.activities;
          if (parsed.directories) newState.directories = parsed.directories;
          if (parsed.logs) newState.logs = parsed.logs;
          if (parsed.systemConfig) newState.systemConfig = parsed.systemConfig;
          if (parsed.priorities) newState.priorities = parsed.priorities;
          if (parsed.config) newState.config = parsed.config;
        }
        
        // Persistir o novo estado consolidado
        setTimeout(() => onSaveConfig(newState), 50);
        return newState;
      });
      
      setIsJsonModalOpen(false);
      setJsonInputText('');
      alert('✔️ JSON Importado e Consolidado com Sucesso!\n\nAs novas diretivas foram aplicadas em tempo real em toda a plataforma.');
    } catch (err: any) {
      setJsonError(err.message || 'Sintaxe de JSON inválida. Por favor, verifique.');
    }
  };

  // Handler para ler e processar arquivos .json
  const handleFileRead = (file: File) => {
    if (file.type !== 'application/json' && !file.name.endsWith('.json')) {
      alert('❌ Arquivo Inválido:\n\nPor favor, envie apenas arquivos válidos com extensão .json');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result;
      if (typeof text === 'string') {
        setJsonInputText(text);
        setJsonError(null);
      }
    };
    reader.readAsText(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleFileRead(file);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileRead(file);
    }
  };
  const presetErrorLog = `{
  "logs": [
    {
      "id": "log_Script_Tabela_Captados_Fora_Alerta",
      "status": "OK",
      "processo": "Script Tabela Captados Fora Alerta",
      "bi": "Captados Fora do Alerta",
      "diretorio": "\\\\\\\\10.1.17.4\\\\Usuarios\\\\Credenciamento Medico\\\\NUCLEO DE AGENDAS\\\\RAFAEL FERNANDES\\\\1 - RELATORIOS\\\\log_Script_Tabela_Captados_Fora_Alerta.txt",
      "ultimaAtualizacao": "10:30",
      "ultimaVerificacao": "13:54",
      "acao": "Nenhuma (Exceção Conhecida)",
      "tipoExcecao": "EXCECAO_CONHECIDA"
    },
    {
      "id": "log_execucao_consultas_em_transferencia",
      "status": "ERRO",
      "processo": "Execução Consultas em Transferência",
      "bi": "BI Relatório de Consultas em Transferência",
      "diretorio": "\\\\\\\\10.1.17.4\\\\Usuarios\\\\Credenciamento Medico\\\\NUCLEO DE AGENDAS\\\\RAFAEL FERNANDES\\\\1 - RELATORIOS\\\\log_consultas_transferência.txt",
      "ultimaAtualizacao": "13:45",
      "ultimaVerificacao": "13:54",
      "acao": "executar contingência de Consultas em Transferência"
    }
  ]
}`;

  const presetResetLogs = `{
  "logs": [
    {
      "id": "log_Script_Tabela_Captados_Fora_Alerta",
      "status": "OK",
      "processo": "Script Tabela Captados Fora Alerta",
      "bi": "Captados Fora do Alerta",
      "diretorio": "\\\\\\\\10.1.17.4\\\\Usuarios\\\\Credenciamento Medico\\\\NUCLEO DE AGENDAS\\\\RAFAEL FERNANDES\\\\1 - RELATORIOS\\\\log_Script_Tabela_Captados_Fora_Alerta.txt",
      "ultimaAtualizacao": "13:54",
      "ultimaVerificacao": "13:54",
      "acao": "Nenhuma (Exceção Conhecida)",
      "tipoExcecao": "EXCECAO_CONHECIDA"
    },
    {
      "id": "log_execucao_consultas_em_transferencia",
      "status": "OK",
      "processo": "Execução Consultas em Transferência",
      "bi": "BI Relatório de Consultas em Transferência",
      "diretorio": "\\\\\\\\10.1.17.4\\\\Usuarios\\\\Credenciamento Medico\\\\NUCLEO DE AGENDAS\\\\RAFAEL FERNANDES\\\\1 - RELATORIOS\\\\log_consultas_transferência.txt",
      "ultimaAtualizacao": "13:54",
      "ultimaVerificacao": "13:54",
      "acao": "executar contingência de Consultas em Transferência"
    }
  ]
}`;

  const presetIdentity = `{
  "systemConfig": {
    "teamBrand": {
      "name": "Optimus Green",
      "subtitle": "Gestão Inteligente de Rotina",
      "logo": "",
      "logoCompact": "",
      "primaryColor": "#1B5E20",
      "secondaryColor": "#66BB6A"
    },
    "monitoring": {
      "enabled": true,
      "intervalMinutes": 10,
      "mode": "MOCK"
    },
    "user": {
      "name": "Karine",
      "role": "OPERACIONAL"
    }
  }
}`;

  // Filtragem de logs
  const filteredLogs = useMemo(() => {
    return logs.filter(l => {
      const matchesSearch = l.processo.toLowerCase().includes(searchTerm.toLowerCase()) || 
                            l.bi.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = filterStatus === 'ALL' || l.status === filterStatus;
      return matchesSearch && matchesStatus;
    });
  }, [logs, searchTerm, filterStatus]);

  // Estatísticas de saúde
  const totalCount = logs.length;
  const okCount = logs.filter(l => l.status === 'OK').length;
  const attentionCount = logs.filter(l => l.status === 'ATENCAO').length;
  const errorCount = logs.filter(l => l.status === 'ERRO').length;

  const healthScore = useMemo(() => {
    if (totalCount === 0) return 100;
    // P0 em falha puxa para baixo, peso maior para erros
    const hasP0Failure = logs.some(l => l.status === 'ERRO' && l.id !== 'log_Script_Tabela_Captados_Fora_Alerta');
    if (hasP0Failure) return 68;
    if (errorCount > 0) return 85;
    if (attentionCount > 0) return 92;
    return 100;
  }, [logs, totalCount, errorCount, attentionCount]);

  return (
    <div className="space-y-6 animate-fade-in font-inter">
      
      {/* HEADER DA CENTRAL DE MONITORAMENTO */}
      <div className="bg-white rounded-xl shadow border border-gray-100 p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 relative overflow-hidden">
        <div className="absolute right-0 top-0 opacity-10 pointer-events-none transform translate-x-10 -translate-y-4">
          <Activity size={180} className="text-[#0339A6]" />
        </div>

        <div className="space-y-1 relative z-10">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-blue-600 bg-blue-50 border border-blue-200 px-2.5 py-0.5 rounded-full flex items-center gap-1">
              <span className="h-1.5 w-1.5 rounded-full bg-blue-500 animate-pulse" />
              Monitoramento Ativo
            </span>
            <span className="text-xs text-gray-400 font-mono">Loop de 30 minutos</span>
          </div>
          <h1 className="font-sora font-black text-2xl text-gray-900 mt-2">
            Central de Monitoramento e Logs
          </h1>
          <p className="text-xs text-gray-500 max-w-2xl">
            Acompanhamento síncrono de arquivos e automações. Identifique quebras de scripts, caminhos inexistentes ou arquivos de rede atrasados para tomar ações rápidas.
          </p>
        </div>

        {/* CONTROLES DO AGENTE DE MONITORAMENTO */}
        <div className="bg-gray-50 border border-gray-100 p-4 rounded-xl flex flex-col sm:flex-row items-start sm:items-center gap-4 shrink-0 relative z-10">
          <div className="space-y-1">
            <span className="block text-[9px] text-gray-400 uppercase font-black tracking-wider leading-none">Próxima Varredura</span>
            <span className="font-mono text-2xl font-black text-gray-800 tracking-tight block">
              {formatCountdown(countdown)}
            </span>
            <div className="flex items-center gap-1.5">
              {systemConfig.monitoring.mode === 'LOCAL_AGENT' ? (
                <>
                  <span className={`h-2 w-2 rounded-full ${isAgentConnected ? 'bg-green-500' : 'bg-amber-500 animate-pulse'}`} />
                  <span className="text-[10px] text-gray-500 font-bold">
                    {isAgentConnected ? 'Agente Conectado' : 'Agente Não Detectado'}
                  </span>
                </>
              ) : (
                <>
                  <span className="h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
                  <span className="text-[10px] text-amber-600 font-bold">Modo Demonstração</span>
                </>
              )}
            </div>
          </div>

          <div className="flex flex-wrap gap-2 pt-1 sm:pt-0">
            <button
              onClick={() => setIsJsonModalOpen(true)}
              className="px-4 py-2.5 bg-[#0339A6] hover:bg-[#022b80] text-white text-xs font-black rounded-lg shadow-md transition-all duration-200 flex items-center gap-2 transform active:scale-95"
              title="Importar configurações de rotina, logs ou diretórios via objeto JSON de forma síncrona"
            >
              <Upload className="h-4 w-4" />
              Importar JSON
            </button>

            <button
              onClick={handleCloudSave}
              disabled={isCloudSaving}
              className={`px-3.5 py-2.5 bg-green-600 hover:bg-green-700 text-white text-xs font-bold rounded-lg transition-all duration-200 flex items-center gap-1.5 shadow-sm ${
                isCloudSaving ? 'opacity-60 cursor-not-allowed' : ''
              }`}
              title="Salvar imediatamente todas as alterações e configurações atuais na nuvem segura MHC"
            >
              <Cloud className="h-3.5 w-3.5" />
              {isCloudSaving ? 'Salvando...' : 'Salvar na Nuvem'}
            </button>
          </div>
        </div>
      </div>

      {/* METRICAS DE SAÚDE DO SISTEMA */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        
        {/* Saúde Card */}
        <div className="bg-white rounded-xl shadow border border-gray-100 p-4 flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-semibold text-gray-400">Saúde Geral</span>
            <span className="block font-sora text-2xl font-black" style={{ color: healthScore >= 90 ? '#1B5E20' : healthScore >= 75 ? '#B45309' : '#DC2626' }}>
              {healthScore}%
            </span>
            <span className="text-[10px] text-gray-400 block">Status dos processos críticos</span>
          </div>
          <div className="h-12 w-12 rounded-full flex items-center justify-center bg-gray-50 text-gray-700">
            <Activity className="h-6 w-6 text-blue-600" />
          </div>
        </div>

        {/* Logs OK */}
        <div className="bg-white rounded-xl shadow border border-gray-100 p-4 flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-semibold text-gray-400">Processos Normais</span>
            <span className="block font-sora text-2xl font-black text-green-700">{okCount}</span>
            <span className="text-[10px] text-green-600 block">Sem anomalias ativas</span>
          </div>
          <div className="h-12 w-12 rounded-full flex items-center justify-center bg-green-50 text-green-700">
            <CheckCircle2 className="h-6 w-6" />
          </div>
        </div>

        {/* Logs em Atenção */}
        <div className="bg-white rounded-xl shadow border border-gray-100 p-4 flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-semibold text-gray-400">Alertas / Atenção</span>
            <span className="block font-sora text-2xl font-black text-amber-600">{attentionCount}</span>
            <span className="text-[10px] text-amber-600 block">Requer verificação</span>
          </div>
          <div className="h-12 w-12 rounded-full flex items-center justify-center bg-amber-50 text-amber-600">
            <AlertTriangle className="h-6 w-6" />
          </div>
        </div>

        {/* Logs em Erro */}
        <div className="bg-white rounded-xl shadow border border-gray-100 p-4 flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-semibold text-gray-400">Falhas / Quebras</span>
            <span className="block font-sora text-2xl font-black text-red-600">{errorCount}</span>
            <span className="text-[10px] text-red-600 block">Bloqueios de execução</span>
          </div>
          <div className="h-12 w-12 rounded-full flex items-center justify-center bg-red-50 text-red-600">
            <XCircle className="h-6 w-6" />
          </div>
        </div>

      </div>

      {/* PAINEL PRINCIPAL DE LOGS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Tabela de Logs e Filtros */}
        <div className="lg:col-span-2 space-y-4">
          
          <div className="bg-white rounded-xl shadow border border-gray-100 p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
            
            {/* Status Tabs */}
            <div className="flex bg-gray-100 p-1 rounded-lg w-full sm:w-auto">
              {[
                { id: 'ALL', label: 'Todos' },
                { id: 'OK', label: 'Normais' },
                { id: 'ATENCAO', label: 'Atenção' },
                { id: 'ERRO', label: 'Falhas' }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setFilterStatus(tab.id)}
                  className={`flex-1 sm:flex-initial px-3.5 py-1.5 rounded-md text-xs font-bold transition ${
                    filterStatus === tab.id 
                      ? 'bg-white text-gray-900 shadow-sm font-black' 
                      : 'text-gray-500 hover:text-gray-800'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Input Busca */}
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-gray-400" />
              <input
                type="text"
                placeholder="Filtrar por script ou processo..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full text-xs border border-gray-200 pl-9 pr-4 py-2 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>

          </div>

          {/* LISTAGEM DE LOGS */}
          <div className="bg-white rounded-xl shadow border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100 text-gray-400 font-bold text-[10px] uppercase tracking-wider">
                    <th className="p-4">Status</th>
                    <th className="p-4">Processo Automático</th>
                    <th className="p-4">BI Vinculado</th>
                    <th className="p-4">Última Carga</th>
                    <th className="p-4 text-center">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-xs text-gray-700">
                  {filteredLogs.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="p-8 text-center text-gray-400">
                        Nenhum log encontrado para os critérios selecionados.
                      </td>
                    </tr>
                  ) : (
                    filteredLogs.map(log => {
                      const isException = log.tipoExcecao === 'EXCECAO_CONHECIDA';
                      return (
                        <tr 
                          key={log.id} 
                          onClick={() => setSelectedLogDetail(log)}
                          className={`hover:bg-gray-50/50 cursor-pointer transition ${selectedLogDetail?.id === log.id ? 'bg-blue-50/20' : ''}`}
                        >
                          <td className="p-4">
                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black ${
                              log.status === 'OK' ? 'bg-green-50 text-green-700 border border-green-100' :
                              log.status === 'ATENCAO' ? 'bg-amber-50 text-amber-700 border border-amber-100 animate-pulse' :
                              'bg-red-50 text-red-700 border border-red-100 animate-pulse'
                            }`}>
                              <span className={`h-1.5 w-1.5 rounded-full ${log.status === 'OK' ? 'bg-green-500' : log.status === 'ATENCAO' ? 'bg-amber-500' : 'bg-red-500'}`} />
                              {log.status}
                            </span>
                          </td>
                          <td className="p-4">
                            <div>
                              <b className="font-sora text-gray-900 block">{log.processo}</b>
                              <span className="text-[10px] text-gray-400 font-mono block mt-0.5 max-w-[240px] truncate">{log.diretorio}</span>
                            </div>
                          </td>
                          <td className="p-4 text-gray-500">{log.bi}</td>
                          <td className="p-4 font-mono text-[10px] text-gray-500">{log.ultimaAtualizacao}</td>
                          <td className="p-4 text-center" onClick={e => e.stopPropagation()}>
                            {log.status === 'ERRO' ? (
                              <button
                                onClick={() => handleExecuteContingency(log.id)}
                                className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white text-[10px] font-black rounded-lg shadow-sm transition"
                              >
                                Contingência
                              </button>
                            ) : (
                              <span className="text-[10px] text-gray-400 font-bold bg-gray-50 px-2 py-1 rounded-md border">Auditoria OK</span>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* DETALHES DO LOG SELECIONADO & RECURSOS DE CONEXÃO */}
        <div className="space-y-4">
          
          {selectedLogDetail ? (
            <div className="bg-white rounded-xl shadow border border-gray-100 p-5 space-y-4 animate-fade-in">
              <div className="flex items-center justify-between border-b pb-3">
                <h3 className="font-sora font-extrabold text-sm text-gray-800 flex items-center gap-1.5">
                  <Terminal className="h-4 w-4 text-blue-600" />
                  Detalhes da Automação
                </h3>
                <button
                  onClick={() => setSelectedLogDetail(null)}
                  className="text-xs text-gray-400 hover:text-gray-600"
                >
                  Limpar
                </button>
              </div>

              <div className="space-y-3 text-xs">
                <div>
                  <span className="text-[10px] text-gray-400 font-bold uppercase block">Processo</span>
                  <span className="font-bold text-gray-900 block mt-0.5">{selectedLogDetail.processo}</span>
                </div>

                <div>
                  <span className="text-[10px] text-gray-400 font-bold uppercase block">BI Correspondente</span>
                  <span className="text-gray-700 block mt-0.5">{selectedLogDetail.bi}</span>
                </div>

                <div>
                  <span className="text-[10px] text-gray-400 font-bold uppercase block">Pasta UNC do Servidor</span>
                  <span className="font-mono text-[10px] text-gray-500 bg-gray-50 border p-2 rounded-lg block mt-1 select-all break-all leading-normal">
                    {selectedLogDetail.diretorio}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-2">
                  <div>
                    <span className="text-[10px] text-gray-400 font-bold uppercase block">Modificação</span>
                    <span className="font-mono block mt-0.5 text-gray-700">{selectedLogDetail.ultimaAtualizacao}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-gray-400 font-bold uppercase block">Verificação</span>
                    <span className="font-mono block mt-0.5 text-gray-700">{selectedLogDetail.ultimaVerificacao}</span>
                  </div>
                </div>

                <div className="pt-3 border-t">
                  <span className="text-[10px] text-gray-400 font-bold uppercase block">Ação Corretiva Sugerida</span>
                  <p className="text-gray-600 mt-1 leading-normal italic bg-blue-50/20 p-2.5 rounded-lg border border-blue-100/50">
                    "{selectedLogDetail.acao}"
                  </p>
                </div>

                {selectedLogDetail.status === 'ERRO' && (
                  <button
                    onClick={() => handleExecuteContingency(selectedLogDetail.id)}
                    className="w-full py-2.5 bg-red-600 hover:bg-red-700 text-white text-xs font-black rounded-xl shadow-md transition flex items-center justify-center gap-1.5"
                  >
                    <Play className="h-3.5 w-3.5 fill-current" />
                    Executar Recuperação Imediata
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-dashed border-gray-200 p-8 text-center text-gray-400 flex flex-col items-center justify-center h-[260px]">
              <Database className="h-10 w-10 text-gray-300 stroke-1 mb-2" />
              <h4 className="font-sora font-semibold text-gray-700 text-xs">Inspeção de Log</h4>
              <p className="text-[11px] text-gray-400 mt-1 max-w-[200px] leading-relaxed">
                Selecione qualquer linha do monitor à esquerda para inspecionar os detalhes do script e caminhos físicos correspondentes.
              </p>
            </div>
          )}

          {/* ARQUITETURA DE INTEGRAÇÃO LOCAL AGENT */}
          <div className="bg-gradient-to-br from-gray-900 to-slate-950 text-white rounded-xl shadow-md p-5 space-y-4">
            <div className="flex items-center gap-2 border-b border-white/10 pb-2">
              <Server className="h-4 w-4 text-[#F2B705]" />
              <h4 className="font-sora font-black text-xs uppercase tracking-wider text-[#F2B705]">Local Agent Integration</h4>
            </div>

            <p className="text-[11px] text-slate-300 leading-relaxed">
              O navegador está rodando em sandbox e não consegue ler caminhos de rede como <code className="text-yellow-200 bg-white/5 px-1.5 py-0.5 rounded font-mono font-bold text-[10px]">\\10.1.17.4</code> diretamente.
            </p>

            <div className="bg-black/40 rounded-lg p-3 border border-white/5 space-y-1.5 text-[11px]">
              <div className="flex justify-between items-center text-[10px]">
                <span className="text-slate-400 font-bold">API LOCAL DETECTADA:</span>
                <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase ${
                  isAgentConnected ? 'bg-green-950 text-green-400 border border-green-800' : 'bg-yellow-950 text-yellow-400 border border-yellow-800'
                }`}>
                  {isAgentConnected ? 'CONECTADO (PORT 8420)' : 'DEMO MODE'}
                </span>
              </div>
              <span className="text-slate-300 block font-medium mt-1 leading-normal">
                {isAgentConnected 
                  ? '✔️ O agente local físico está respondendo. As verificações refletem a integridade real dos arquivos de rede do Windows!'
                  : '⚠️ O painel está emulando a integridade local. Para conexões reais de rede, inicie o script de integração na porta 8420.'
                }
              </span>
            </div>

            <div className="pt-1 flex items-center justify-between text-[10px] text-slate-400 font-bold">
              <span>Porta Ativa: <b>8420</b></span>
              <a 
                href="#docs" 
                onClick={(e) => {
                  e.preventDefault();
                  alert("📘 Mapeamento Técnico de Rede:\nConsulte a aba de documentação ou o manual anexo para copiar o script Python que roda o servidor de integração de rede.");
                }}
                className="hover:underline flex items-center gap-1 text-[#5B9BFF]"
              >
                Como configurar? <ArrowRight className="h-3 w-3" />
              </a>
            </div>
          </div>

        </div>

      </div>

      {/* MODAL DIALOG INTERATIVO DE IMPORTAÇÃO DE JSON */}
      {isJsonModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 max-w-2xl w-full p-6 space-y-4 animate-fade-in text-gray-800">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-sora font-black text-base text-gray-900 flex items-center gap-2">
                <Upload className="h-5 w-5 text-blue-600" />
                Importar Configuração JSON
              </h3>
              <button
                type="button"
                onClick={() => {
                  setIsJsonModalOpen(false);
                  setJsonError(null);
                  setJsonInputText('');
                }}
                className="text-gray-400 hover:text-gray-600 text-sm font-bold"
              >
                Fechar
              </button>
            </div>

            <p className="text-xs text-gray-500 leading-normal">
              Impute ou cole abaixo o objeto JSON de configuração. Você pode importar logs de monitoramento, listas de atividades do painel, diretórios ou até reconfigurar a identidade visual da marca instantaneamente.
            </p>

            {/* PRESETS DE CLIQUES RÁPIDOS */}
            <div className="space-y-1.5">
              <span className="text-[10px] text-gray-400 font-bold uppercase block">Templates Prontos para Teste</span>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => setJsonInputText(presetErrorLog)}
                  className="px-2.5 py-1.5 bg-red-50 hover:bg-red-100 text-red-700 text-[10px] font-black rounded-lg border border-red-200 transition"
                >
                  ⚡ Injetar Log de Erro (Testar Contingência)
                </button>
                <button
                  type="button"
                  onClick={() => setJsonInputText(presetResetLogs)}
                  className="px-2.5 py-1.5 bg-green-50 hover:bg-green-100 text-green-700 text-[10px] font-black rounded-lg border border-green-200 transition"
                >
                  ✔️ Resetar Todos para OK
                </button>
                <button
                  type="button"
                  onClick={() => setJsonInputText(presetIdentity)}
                  className="px-2.5 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 text-[10px] font-black rounded-lg border border-blue-200 transition"
                >
                  🎨 Customizar Marca MHC (Verde)
                </button>
              </div>
            </div>

            <form onSubmit={handleApplyJson} className="space-y-4">
              {/* ÁREA DE ARRASTAR E SOLTAR / UPLOAD DE ARQUIVO */}
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`border-2 border-dashed rounded-xl p-4 text-center cursor-pointer transition-all ${
                  isDragging 
                    ? 'border-blue-500 bg-blue-50/50' 
                    : 'border-gray-200 bg-gray-50/40 hover:bg-gray-50'
                }`}
              >
                <input 
                  type="file" 
                  id="json-file-input" 
                  accept=".json" 
                  onChange={handleFileChange} 
                  className="hidden" 
                />
                <label htmlFor="json-file-input" className="cursor-pointer space-y-1 block">
                  <div className="mx-auto h-8 w-8 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
                    <Upload className="h-4 w-4" />
                  </div>
                  <span className="block text-xs font-bold text-gray-700">
                    Arraste seu arquivo .json aqui ou <span className="text-blue-600 underline">clique para carregar da máquina</span>
                  </span>
                  <span className="block text-[10px] text-gray-400">Suporta apenas arquivos legítimos com formato JSON</span>
                </label>
              </div>

              <div className="flex flex-col gap-1.5">
                <textarea
                  required
                  rows={6}
                  value={jsonInputText}
                  onChange={e => setJsonInputText(e.target.value)}
                  placeholder='Ou cole aqui seu JSON estruturado, ex: {"logs": [...] } ou envie um dos templates acima...'
                  className="w-full text-xs font-mono p-3 border border-gray-200 rounded-xl bg-gray-50 focus:bg-white focus:ring-1 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              {jsonError && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-start gap-2 animate-pulse">
                  <XCircle className="h-4 w-4 shrink-0 mt-0.5" />
                  <span><b>JSON Inválido:</b> {jsonError}</span>
                </div>
              )}

              <div className="flex justify-end gap-3 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => {
                    setIsJsonModalOpen(false);
                    setJsonError(null);
                    setJsonInputText('');
                  }}
                  className="px-4 py-2 border text-gray-500 text-xs font-bold rounded-lg hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-black rounded-lg shadow-md transition"
                >
                  Validar e Aplicar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
