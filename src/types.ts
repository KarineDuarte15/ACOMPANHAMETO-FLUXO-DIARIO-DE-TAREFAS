export type ActivityCategory = 'diaria' | 'bi' | 'outras' | 'quinzenal' | 'virada' | 'contingencia';
export type ActivityPriority = 'high' | 'medium' | 'low';

export interface ActivityPath {
  label: string;
  path: string;
}

export interface Activity {
  id: string;
  name: string;
  category: ActivityCategory;
  schedule: string[]; // e.g. ["08:00", "10:00"]
  recurrence: string; // e.g. "Diariamente", "Segunda-feira", "Dia 15", "A cada 2 horas"
  objective: string;
  instructions: string[];
  paths: ActivityPath[];
  scripts: string[];
  contingency: string;
  priority: ActivityPriority;
  responsible: string;
  estimatedTime?: string; // in minutes, e.g. "15 min"
}

export type ExecutionStatus = 
  | 'PENDENTE'
  | 'EM_EXECUCAO'
  | 'CONCLUIDO'
  | 'ATRASADO' // when scheduled time has passed and execution hasn't started or finished
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
}

export interface AppState {
  executions: Execution[];
  currentExecutionId: string | null; // currently running cronômetro
  history: HistoryDay[];
  config: UserConfig;
}
