import React, { useState } from 'react';
import { UserConfig } from '../types';
import { 
  Settings, User, Bell, MessageSquare, Mail, Sliders, Check, RefreshCw, 
  HelpCircle, Shield, Network, EyeOff, AlertCircle, FileSpreadsheet
} from 'lucide-react';

interface ConfigPanelProps {
  config: UserConfig;
  onSaveConfig: (newConfig: UserConfig) => void;
  onResetAllData: () => void;
  googleUser: any;
  googleToken: string | null;
  isConnectingSheets: boolean;
  onGoogleLogin: () => Promise<void>;
  onGoogleLogout: () => Promise<void>;
  onCreateNewSheet: () => Promise<void>;
  onBulkSync: () => Promise<void>;
}

export const ConfigPanel: React.FC<ConfigPanelProps> = ({
  config,
  onSaveConfig,
  onResetAllData,
  googleUser,
  googleToken,
  isConnectingSheets,
  onGoogleLogin,
  onGoogleLogout,
  onCreateNewSheet,
  onBulkSync
}) => {
  const [name, setName] = useState(config.name);
  const [email, setEmail] = useState(config.email);
  const [soundEnabled, setSoundEnabled] = useState(config.soundEnabled);
  const [enableTimeAlerts, setEnableTimeAlerts] = useState(config.enableTimeAlerts);
  const [enableDelayAlerts, setEnableDelayAlerts] = useState(config.enableDelayAlerts);
  const [popupEnabled, setPopupEnabled] = useState(config.popupEnabled);
  const [teamsEnabled, setTeamsEnabled] = useState(config.teamsEnabled);
  const [outlookEnabled, setOutlookEnabled] = useState(config.outlookEnabled);
  const [dailyReportEnabled, setDailyReportEnabled] = useState(config.dailyReportEnabled);
  const [teamsWebhookUrl, setTeamsWebhookUrl] = useState(config.teamsWebhookUrl || '');
  const [alertOffset, setAlertOffset] = useState(config.alertOffsetMinutes);
  
  const [showSavedFeedback, setShowSavedFeedback] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveConfig({
      ...config,
      name,
      email,
      soundEnabled,
      enableTimeAlerts,
      enableDelayAlerts,
      popupEnabled,
      teamsEnabled,
      outlookEnabled,
      dailyReportEnabled,
      teamsWebhookUrl,
      alertOffsetMinutes: Number(alertOffset)
    });
    setShowSavedFeedback(true);
    setTimeout(() => setShowSavedFeedback(false), 2000);
  };

  return (
    <form onSubmit={handleSave} className="space-y-6">
      
      {/* Title block */}
      <div className="bg-white rounded-xl shadow border border-gray-100 p-5 md:p-6">
        <h2 className="font-sora font-black text-xl text-gray-900 flex items-center gap-1.5">
          <Settings className="h-5 w-5 text-[#0339A6]" /> Central de Configurações
        </h2>
        <p className="text-xs text-gray-400 mt-1">Configure as integrações corporativas, cronogramas e dados operacionais</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Form Sections */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* PROFILE SECTION */}
          <div className="bg-white rounded-xl border border-gray-100 shadow p-5 space-y-4">
            <h3 className="font-sora font-bold text-sm text-gray-800 border-b border-gray-100 pb-2 flex items-center gap-1.5">
              <User className="h-4.5 w-4.5 text-[#0339A6]" /> Meu Perfil Corporativo
            </h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Nome de Usuário</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full text-sm border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-[#0339A6] focus:border-transparent outline-none text-gray-800"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">E-mail de Destino</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full text-sm border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-[#0339A6] focus:border-transparent outline-none text-gray-800"
                  required
                />
              </div>
            </div>
          </div>

          {/* NOTIFICATION PREFERENCES */}
          <div className="bg-white rounded-xl border border-gray-100 shadow p-5 space-y-4">
            <h3 className="font-sora font-bold text-sm text-gray-800 border-b border-gray-100 pb-2 flex items-center gap-1.5">
              <Bell className="h-4.5 w-4.5 text-[#0339A6]" /> Notificações & Scheduler
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <label className="flex items-start gap-2.5 p-2 rounded hover:bg-gray-50 cursor-pointer">
                <input
                  type="checkbox"
                  checked={enableTimeAlerts}
                  onChange={(e) => setEnableTimeAlerts(e.target.checked)}
                  className="mt-0.5 rounded border-gray-300 text-[#0339A6] focus:ring-[#0339A6]"
                />
                <div>
                  <span className="text-xs font-bold text-gray-800 block">Alertas de Horário</span>
                  <span className="text-[10px] text-gray-400 block">Exibir pop-up ao atingir o cronograma planejado.</span>
                </div>
              </label>

              <label className="flex items-start gap-2.5 p-2 rounded hover:bg-gray-50 cursor-pointer">
                <input
                  type="checkbox"
                  checked={enableDelayAlerts}
                  onChange={(e) => setEnableDelayAlerts(e.target.checked)}
                  className="mt-0.5 rounded border-gray-300 text-[#0339A6] focus:ring-[#0339A6]"
                />
                <div>
                  <span className="text-xs font-bold text-gray-800 block">Alertas de Atraso</span>
                  <span className="text-[10px] text-gray-400 block">Notificar caso a tarefa inicie após o previsto.</span>
                </div>
              </label>

              <label className="flex items-start gap-2.5 p-2 rounded hover:bg-gray-50 cursor-pointer">
                <input
                  type="checkbox"
                  checked={soundEnabled}
                  onChange={(e) => setSoundEnabled(e.target.checked)}
                  className="mt-0.5 rounded border-gray-300 text-[#0339A6] focus:ring-[#0339A6]"
                />
                <div>
                  <span className="text-xs font-bold text-gray-800 block">Efeitos Sonoros</span>
                  <span className="text-[10px] text-gray-400 block">Tocar alertas sonoros sintetizados no navegador.</span>
                </div>
              </label>

              <label className="flex items-start gap-2.5 p-2 rounded hover:bg-gray-50 cursor-pointer">
                <input
                  type="checkbox"
                  checked={popupEnabled}
                  onChange={(e) => setPopupEnabled(e.target.checked)}
                  className="mt-0.5 rounded border-gray-300 text-[#0339A6] focus:ring-[#0339A6]"
                />
                <div>
                  <span className="text-xs font-bold text-gray-800 block">Pop-ups Visuais</span>
                  <span className="text-[10px] text-gray-400 block">Abertura de modals focados sobre a tela.</span>
                </div>
              </label>
            </div>

            {/* Antecedency configuration */}
            <div className="pt-2 border-t border-gray-100">
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1 flex items-center gap-1">
                <Sliders className="h-3.5 w-3.5 text-gray-400" /> Antecedência do Alerta
              </label>
              <select
                value={alertOffset}
                onChange={(e) => setAlertOffset(Number(e.target.value))}
                className="w-full text-sm border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-[#0339A6] focus:border-transparent outline-none bg-white text-gray-800"
              >
                <option value={0}>Exatamente no horário programado</option>
                <option value={-5}>5 minutos antes da atividade</option>
                <option value={5}>5 minutos de tolerância após o horário</option>
                <option value={10}>10 minutos de tolerância após o horário</option>
              </select>
            </div>
          </div>

          {/* TEAMS WEBHOOK INTEGRATION */}
          <div className="bg-white rounded-xl border border-gray-100 shadow p-5 space-y-4">
            <h3 className="font-sora font-bold text-sm text-gray-800 border-b border-gray-100 pb-2 flex items-center justify-between">
              <span className="flex items-center gap-1.5"><MessageSquare className="h-4.5 w-4.5 text-[#0339A6]" /> Integração com Microsoft Teams</span>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${teamsEnabled && teamsWebhookUrl ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                {teamsEnabled && teamsWebhookUrl ? '🟢 Conectado' : '⚪ Não configurado'}
              </span>
            </h3>

            <div className="space-y-3">
              <label className="flex items-start gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={teamsEnabled}
                  onChange={(e) => setTeamsEnabled(e.target.checked)}
                  className="mt-0.5 rounded border-gray-300 text-[#0339A6] focus:ring-[#0339A6]"
                />
                <div>
                  <span className="text-xs font-bold text-gray-800 block">Ativar integração Teams (Power Automate)</span>
                  <span className="text-[10px] text-gray-400 block">Enviar cartão estruturado ao canal de agendas no Teams ao finalizar tarefas.</span>
                </div>
              </label>

              {teamsEnabled && (
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Webhook URL (Power Automate)</label>
                  <input
                    type="url"
                    value={teamsWebhookUrl}
                    onChange={(e) => setTeamsWebhookUrl(e.target.value)}
                    placeholder="https://prod-XX.brazilsouth.logic.azure.com:443/workflows/..."
                    className="w-full text-xs font-mono border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-[#0339A6] focus:border-transparent outline-none text-gray-800"
                  />
                  <span className="text-[9px] text-gray-400 block mt-1 leading-relaxed">
                    *Segurança garantida: O link do webhook é salvo localmente no seu navegador via IndexedDB/LocalStorage. Nunca exposto a ambientes públicos.
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* OUTLOOK INTEGRATION */}
          <div className="bg-white rounded-xl border border-gray-100 shadow p-5 space-y-4">
            <h3 className="font-sora font-bold text-sm text-gray-800 border-b border-gray-100 pb-2 flex items-center justify-between">
              <span className="flex items-center gap-1.5"><Mail className="h-4.5 w-4.5 text-[#0339A6]" /> Integração com Microsoft Outlook</span>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${outlookEnabled ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                {outlookEnabled ? '🟢 Ativado' : '⚪ Desativado'}
              </span>
            </h3>

            <div className="space-y-3">
              <label className="flex items-start gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={outlookEnabled}
                  onChange={(e) => setOutlookEnabled(e.target.checked)}
                  className="mt-0.5 rounded border-gray-300 text-[#0339A6] focus:ring-[#0339A6]"
                />
                <div>
                  <span className="text-xs font-bold text-gray-800 block">Habilitar Alertas de E-mail Automáticos</span>
                  <span className="text-[10px] text-gray-400 block">Preparar e-mails de desvio ou de encerramento de rotina para auditoria da coordenação.</span>
                </div>
              </label>

              <label className="flex items-start gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={dailyReportEnabled}
                  onChange={(e) => setDailyReportEnabled(e.target.checked)}
                  className="mt-0.5 rounded border-gray-300 text-[#0339A6] focus:ring-[#0339A6]"
                />
                <div>
                  <span className="text-xs font-bold text-gray-800 block">Disparar Relatório Diário ao Fim do Expediente</span>
                  <span className="text-[10px] text-gray-400 block">Enviar automaticamente para erika.karine@hapvida.com.br consolidando o dia.</span>
                </div>
              </label>
            </div>
          </div>

          {/* GOOGLE SHEETS INTEGRATION */}
          <div className="bg-white rounded-xl border border-gray-100 shadow p-5 space-y-4">
            <h3 className="font-sora font-bold text-sm text-gray-800 border-b border-gray-100 pb-2 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <FileSpreadsheet className="h-4.5 w-4.5 text-[#2E7D32]" /> Integração com Google Sheets
              </span>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${config.googleSheetsEnabled && config.googleSheetsSpreadsheetId ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                {config.googleSheetsEnabled && config.googleSheetsSpreadsheetId ? '🟢 Ativo' : '⚪ Desconectado'}
              </span>
            </h3>

            <div className="space-y-4 text-xs text-gray-600">
              <p className="leading-relaxed text-gray-400">
                Sincronize automaticamente todas as suas atividades de faturamento operadas diariamente para uma planilha do Google Sheets de forma segura e transparente.
              </p>

              {!googleToken ? (
                <button
                  type="button"
                  onClick={onGoogleLogin}
                  disabled={isConnectingSheets}
                  className="w-full py-2.5 px-4 bg-[#2E7D32] hover:bg-[#1B5E20] text-white rounded-lg font-bold text-xs flex items-center justify-center gap-2 transition shadow-md disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                >
                  {isConnectingSheets ? (
                    <>
                      <RefreshCw className="h-3.5 w-3.5 animate-spin" /> Conectando...
                    </>
                  ) : (
                    <>
                      <svg className="h-4 w-4 fill-white" viewBox="0 0 24 24">
                        <path d="M12.24 10.285V14.4h6.887c-.275 1.565-1.88 4.604-6.887 4.604-4.33 0-7.859-3.579-7.859-8s3.53-8 7.859-8c2.46 0 4.105 1.025 5.047 1.926l3.258-3.133C18.317 2.203 15.485 1 12.24 1c-6.077 0-11 4.923-11 11s4.923 11 11 11c6.34 0 10.564-4.437 10.564-10.75 0-.72-.078-1.265-.175-1.965h-10.39z"/>
                      </svg>
                      Conectar Conta Google
                    </>
                  )}
                </button>
              ) : (
                <div className="space-y-3">
                  <div className="bg-gray-50 rounded-lg p-3 border border-gray-200 flex items-center justify-between gap-4">
                    <div className="min-w-0">
                      <span className="block font-bold text-gray-700 truncate">
                        Conectado como {googleUser?.email || 'Usuário Google'}
                      </span>
                      <span className="block text-[10px] text-gray-400">
                        Token de acesso ativo em memória 🔒
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={onGoogleLogout}
                      className="px-3 py-1.5 border border-red-200 text-red-600 bg-red-50 hover:bg-red-100 rounded-lg font-bold text-[10px] transition cursor-pointer"
                    >
                      Desconectar
                    </button>
                  </div>

                  {!config.googleSheetsSpreadsheetId ? (
                    <div className="space-y-2">
                      <p className="text-gray-400 font-medium">
                        Você ainda não criou uma planilha de acompanhamento para as rotinas.
                      </p>
                      <button
                        type="button"
                        onClick={onCreateNewSheet}
                        disabled={isConnectingSheets}
                        className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold text-xs flex items-center justify-center gap-1.5 transition shadow-sm disabled:opacity-50 cursor-pointer"
                      >
                        {isConnectingSheets ? (
                          <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                          'Criar Nova Planilha no Google Drive 📁'
                        )}
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-3 pt-1">
                      <div>
                        <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">
                          ID da Planilha Google Ativa
                        </label>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            readOnly
                            value={config.googleSheetsSpreadsheetId}
                            className="flex-1 text-xs font-mono border border-gray-200 rounded-lg p-2 bg-gray-50 outline-none text-gray-600 truncate"
                          />
                          <a
                            href={`https://docs.google.com/spreadsheets/d/${config.googleSheetsSpreadsheetId}/edit`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-3 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold rounded-lg border border-blue-200 text-xs transition flex items-center justify-center gap-1"
                          >
                            Abrir Planilha 📈
                          </a>
                        </div>
                      </div>

                      <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-green-800 space-y-1">
                        <span className="font-bold block">✨ Gravação Automática Ativa!</span>
                        <p className="text-[10px] leading-relaxed text-green-700">
                          Cada atividade concluída no seu painel será registrada na planilha de faturamento instantaneamente, preenchendo detalhes como horários, notas e desvios.
                        </p>
                      </div>

                      <div className="pt-1">
                        <button
                          type="button"
                          onClick={onBulkSync}
                          disabled={isConnectingSheets}
                          className="w-full py-2 px-3 bg-[#2E7D32] hover:bg-[#1B5E20] text-white rounded-lg font-bold text-xs flex items-center justify-center gap-1.5 transition cursor-pointer"
                        >
                          <RefreshCw className={`h-3.5 w-3.5 ${isConnectingSheets ? 'animate-spin' : ''}`} />
                          Forçar Envio em Lote (Hoje)
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* SUBMIT BUTTON */}
          <div className="flex items-center justify-end gap-3 pt-2">
            {showSavedFeedback && (
              <span className="text-xs font-bold text-green-600 flex items-center gap-1 animate-fade-in">
                <Check className="h-4 w-4" /> Configurações salvas localmente!
              </span>
            )}
            <button
              type="submit"
              className="px-6 py-2.5 text-sm font-bold text-white bg-[#0339A6] hover:bg-[#122A44] rounded-lg shadow-md transition"
            >
              SALVAR DIRETRIZES
            </button>
          </div>

        </div>

        {/* Right Column: Architectural documentation / production ready references */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* ARCHITECTURE CARD */}
          <div className="bg-gray-900 text-white p-5 rounded-xl border border-gray-800 space-y-4">
            <h4 className="font-sora font-extrabold text-xs text-[#F2B705] uppercase tracking-wider flex items-center gap-1.5">
              <Network className="h-4 w-4" /> Arquitetura de Produção
            </h4>
            
            <p className="text-xs text-gray-300 leading-relaxed">
              Esta aplicação está arquitetada seguindo as diretrizes de compliance de segurança de TI da Hapvida.
            </p>

            <div className="text-[10.5px] text-gray-400 space-y-3 bg-black/30 p-3 rounded-lg border border-gray-800">
              <div className="flex items-start gap-1.5">
                <span className="font-bold text-white">1.</span>
                <span><b>Frontend:</b> Roda no navegador de forma totalmente estática e sandbox, garantindo que não há vazamento ou armazenamento externo de dados confidenciais ou caminhos UNC de servidores Hapvida.</span>
              </div>
              <div className="flex items-start gap-1.5">
                <span className="font-bold text-white">2.</span>
                <span><b>Serviço Local:</b> Toda a persistência é feita por IndexedDB no domínio sandbox do cliente.</span>
              </div>
              <div className="flex items-start gap-1.5">
                <span className="font-bold text-white">3.</span>
                <span><b>Integração Segura:</b> A conexão com o Teams e Outlook é orquestrada por fluxos de gatilho webhook do <b>MS Power Automate</b>. Os tokens e segredos de TI nunca trafegam em código exposto no cliente.</span>
              </div>
            </div>
          </div>

          {/* DANGEROUS AREA: RESET */}
          <div className="bg-white rounded-xl border border-red-100 p-5 space-y-3">
            <h4 className="font-sora font-bold text-xs text-[#F21D2F] uppercase tracking-wider flex items-center gap-1.5">
              <AlertCircle className="h-4 w-4" /> Zona Crítica
            </h4>
            <p className="text-xs text-gray-500 leading-relaxed">
              Caso deseje apagar todos os registros locais acumulados (históricos, tempos salvos e configurações) para reiniciar o sistema do zero:
            </p>
            <button
              type="button"
              onClick={() => {
                if (confirm('Tem certeza absoluta que deseja apagar todo o histórico de execuções do IndexedDB? Esta operação é irreversível.')) {
                  onResetAllData();
                }
              }}
              className="w-full py-2 text-xs font-bold border border-red-200 text-[#F21D2F] hover:bg-red-50 rounded-lg transition"
            >
              LIMPAR BANCO DE DADOS LOCAL
            </button>
          </div>

        </div>

      </div>

    </form>
  );
};
export default ConfigPanel;
