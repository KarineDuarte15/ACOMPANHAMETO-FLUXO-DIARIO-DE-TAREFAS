export type ActivityCategory = 'BI' | 'BASE' | 'LOG' | 'OUTRA' | 'SOB_DEMANDA';
export type ActivityPriority = 'P0' | 'P1' | 'P2' | 'P3';
export type ActivityCriticism = 'CRITICA' | 'ALTA' | 'MEDIA' | 'BAIXA';
export type ActivityFrequency = 'DIARIA' | 'SEMANAL' | 'QUINZENAL' | 'MENSAL' | 'MARCO_MENSAL' | 'SOB_DEMANDA';
export type ActivityExecutionType = 'AUTOMATICA' | 'MANUAL' | 'SEMIAUTOMATICA' | 'CONTINGENCIA';
export type ActivityVisibility = 'AGENDA' | 'CICLO' | 'CONTINGENCIA' | 'ARQUIVO';

export interface ActivityPath {
  label: string;
  path: string;
}

export interface Activity {
  id: string;
  nome: string;
  biRelacionado: string;
  categoria: ActivityCategory;
  prioridade: ActivityPriority;
  criticidade: ActivityCriticism;
  frequencia: ActivityFrequency;
  horario: string[];
  diasSemana: string[];
  ativo: boolean;
  tipoExecucao: ActivityExecutionType;
  dependencia: string[];
  impacto: string;
  objetivo: string;
  instrucoes: string[];
  diretorios: string[];
  arquivos: string[];
  scripts: string[];
  contingencia?: string[];
  observacoes: string[];
  regrasNegocio: string[];
  condicaoSucesso: string[];
  condicaoErro: string[];
  status: 'PENDENTE' | 'EM_ANDAMENTO' | 'CONCLUIDA' | 'ATRASADA' | 'BLOQUEADA' | 'NAO_APLICAVEL';
  horarioPrevisto?: string;
  iniciadoEm?: string;
  concluidoEm?: string;
  duracaoSegundos?: number;
  atrasoSegundos?: number;
  motivoAtraso?: string;
  pessoaInformada?: string;
  pessoaAjuda?: string;
  observacaoExecucao?: string;
  visibilidade: ActivityVisibility;

  // Propriedades legadas mantidas para retrocompatibilidade
  name: string;
  category: string;
  schedule: string[];
  recurrence: string;
  priority: string;
  paths?: ActivityPath[];
  estimatedTime?: string;
  contingency?: string[];
  responsible?: string;
  responsavel?: string;
}

export type ExecutionStatus = 
  | 'PENDENTE'
  | 'EM_EXECUCAO'
  | 'CONCLUIDO'
  | 'ATRASADO'
  | 'BLOQUEADO'
  | 'NAO_REALIZADO';

export interface Execution {
  id: string; // e.g. "activityId-time"
  activityId: string;
  date: string; // YYYY-MM-DD
  scheduledTime: string; // HH:MM
  startedAt?: string; // ISO string
  completedAt?: string; // ISO string
  durationSeconds?: number;
  delaySeconds?: number;
  status: ExecutionStatus;
  delayReason?: string;
  informedPerson?: string;
  helperPerson?: string;
  notes?: string;
}

export interface HistoryDay {
  date: string; // YYYY-MM-DD
  executions: Execution[];
  summary: {
    totalPlanned: number;
    completed: number;
    delayed: number;
    notCompleted: number;
    totalDurationSeconds: number;
    averageDurationSeconds: number;
    executionIndex: number; // 0 to 100
  };
}

export interface UserConfig {
  name: string;
  email: string;
  enableTimeAlerts: boolean;
  enableDelayAlerts: boolean;
  soundEnabled: boolean;
  popupEnabled: boolean;
  teamsEnabled: boolean;
  outlookEnabled: boolean;
  dailyReportEnabled: boolean;
  alertOffsetMinutes: number; // e.g., 0 (on time), -5 (5 mins before)
  teamsWebhookUrl: string;
  googleSheetsSpreadsheetId?: string;
  googleSheetsEnabled?: boolean;
}

export interface SystemConfig {
  teamBrand: {
    name: string;
    subtitle: string;
    logo?: string;
    logoCompact?: string;
    primaryColor: string;
    secondaryColor: string;
  };
  monitoring: {
    enabled: boolean;
    intervalMinutes: number;
    mode: 'MOCK' | 'LOCAL_AGENT';
  };
  user: {
    name: string;
    role: "ADMIN" | "OPERACIONAL";
  };
}

export interface PriorityConfig {
  id: "P0" | "P1" | "P2" | "P3";
  nome: string;
  descricao: string;
  cor: string;
  ordem: number;
  criticidadePadrao: string;
}

export interface LogConfig {
  id: string;
  status: "OK" | "ATENCAO" | "ERRO" | "NAO_MONITORADO";
  processo: string;
  bi: string;
  diretorio: string;
  ultimaAtualizacao: string;
  ultimaVerificacao: string;
  acao: string;
  tipoExcecao?: "EXCECAO_CONHECIDA" | null;
  atividadeId?: string;
}

export interface AppState {
  executions: Execution[];
  currentExecutionId: string | null; // currently running cronômetro
  history: HistoryDay[];
  config: UserConfig;
  activeBreak?: 'LUNCH' | 'COFFEE' | null;
  
  // Novas propriedades da plataforma Optimus BI
  activities?: Activity[];
  directories?: Directory[];
  systemConfig?: SystemConfig;
  priorities?: PriorityConfig[];
  logs?: LogConfig[];
}

export interface Directory {
  id: string;
  nome: string;
  caminho: string;
  atividadeId: string;
  biRelacionado: string;
  prioridade: string;
  tipo: string;
  uso: string;
  contingencia: boolean;
  ativo?: boolean;
  observacao?: string;
}

export interface User {
  id: string;
  name?: string;
  nome?: string;
  email: string;
  role: 'ADMIN' | 'OPERACIONAL' | 'USER';
  ativo: boolean;
}

export interface TeamSettings {
  teamBrand?: {
    name: string;
    subtitle: string;
    logo?: string;
    logoCompact?: string;
    primaryColor: string;
    secondaryColor: string;
  };
  backgroundColor?: string;
  primaryColor?: string;
  secondaryColor?: string;
  logoUrl?: string;
  logoAlt?: string;
  teamName?: string;
}
