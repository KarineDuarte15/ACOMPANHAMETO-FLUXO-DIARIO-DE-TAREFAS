// src/services/storageService.ts
import { AppState, Execution, UserConfig, HistoryDay, ExecutionStatus, Directory } from '../types';
import { routineActivities } from '../data/activities';

import { doc, getDoc, setDoc, onSnapshot } from 'firebase/firestore';
import { db } from './firebase'; 

const STORAGE_KEY = 'rotina_inteligente_state_v1';

const defaultConfig: UserConfig = {
  name: 'Karine',
  email: 'erika.karine@hapvida.com.br',
  enableTimeAlerts: true,
  enableDelayAlerts: true,
  soundEnabled: true,
  popupEnabled: true,
  outlookEnabled: false,
  dailyReportEnabled: true,
  alertOffsetMinutes: 0,

};

export const storageService = {
  getTodayDateString(): string {
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  },

  isBusinessDay(date: Date): boolean {
    const day = date.getDay();
    return day !== 0 && day !== 6;
  },

  getBusinessDayOfMonth(date: Date): number {
    const tempDate = new Date(date.getTime());
    tempDate.setDate(1);
    let businessDayCount = 0;
    const targetDay = date.getDate();
    
    for (let d = 1; d <= targetDay; d++) {
      tempDate.setDate(d);
      if (this.isBusinessDay(tempDate)) {
        businessDayCount++;
      }
    }
    return businessDayCount;
  },

  isLastDayOfMonth(date: Date): boolean {
    const tempDate = new Date(date.getTime());
    const currentMonth = tempDate.getMonth();
    tempDate.setDate(tempDate.getDate() + 1);
    return tempDate.getMonth() !== currentMonth;
  },

  generateDefaultExecutions(dateStr: string): Execution[] {
    const executions: Execution[] = [];
    const dateObj = new Date(dateStr + 'T12:00:00');
    const dayOfMonth = dateObj.getDate();
    const dayOfWeek = dateObj.getDay();
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
    
    const nthBusinessDay = this.getBusinessDayOfMonth(dateObj);
    const isLastDay = this.isLastDayOfMonth(dateObj);
    
    routineActivities.forEach(activity => {
      if (!activity.ativo || activity.visibilidade === 'ARQUIVO') return;
      
      let isApplicable = false;
      
      if (activity.frequencia === 'DIARIA') {
        if (!isWeekend) isApplicable = true;
      } else if (activity.frequencia === 'SEMANAL') {
        const daysMap: Record<string, number> = { 'Segunda': 1, 'Terça': 2, 'Quarta': 3, 'Quinta': 4, 'Sexta': 5 };
        const activeWeekdays = activity.diasSemana.map(d => daysMap[d]).filter(v => v !== undefined);
        if (activeWeekdays.includes(dayOfWeek)) isApplicable = true;
      } else if (activity.frequencia === 'QUINZENAL') {
        if (dayOfMonth === 15 || dayOfMonth === 30) isApplicable = true;
      } else if (activity.frequencia === 'MENSAL') {
        if (dayOfMonth === 15) isApplicable = true;
      } else if (activity.frequencia === 'MARCO_MENSAL') {
        if (activity.id.includes('primeiro') && nthBusinessDay === 1) isApplicable = true;
        if (activity.id.includes('quinto') && nthBusinessDay === 5) isApplicable = true;
        if (activity.id.includes('decimo') && nthBusinessDay === 10) isApplicable = true;
      } else if (activity.frequencia === 'SOB_DEMANDA') {
        isApplicable = false;
      }

      if (isLastDay && activity.id === 'bi-alerta-vagas-telesaude-virada') isApplicable = true;
      
      if (isApplicable) {
        activity.horario.forEach(time => {
          executions.push({
            id: `${activity.id}-${time}`,
            activityId: activity.id,
            date: dateStr,
            scheduledTime: time,
            status: 'PENDENTE'
          });
        });
      }
    });

    return executions.sort((a, b) => a.scheduledTime.localeCompare(b.scheduledTime));
  },

  // GRAVAÇÃO NA NUVEM COM AVISO DE ERRO
  async saveStateCloud(state: AppState): Promise<void> {
    try {
      const docRef = doc(db, 'rotinas', 'estado_karine');
      await setDoc(docRef, state);
    } catch (e) {
      console.error('Erro ao guardar no Firebase:', e);
      // Este alerta é vital para sabermos se as Regras do Firestore estão a bloquear a escrita
      alert(`Erro crítico: O Firebase bloqueou a gravação! Verifica as permissões (Rules). Detalhe: ${(e as Error).message}`);
    }
  },

  processIncomingState(state: AppState): AppState {
    const todayStr = this.getTodayDateString();
    state.config = { ...defaultConfig, ...state.config };
    
    const hasTodayExecutions = state.executions && state.executions.length > 0 && state.executions[0].date === todayStr;
    
    if (!hasTodayExecutions) {
      if (state.executions && state.executions.length > 0) {
        const oldDate = state.executions[0].date;
        const alreadyInHistory = state.history.some(h => h.date === oldDate);
        if (!alreadyInHistory) {
          const summary = this.calculateSummaryForExecutions(state.executions);
          state.history.unshift({
            date: oldDate,
            executions: [...state.executions],
            summary
          });
        }
      }
      state.executions = this.generateDefaultExecutions(todayStr);
      state.currentExecutionId = null;
      this.saveStateCloud(state);
    }
    return state;
  },

  listenToStateCloud(onSuccess: (state: AppState) => void, onFallback: () => void): () => void {
    const docRef = doc(db, 'rotinas', 'estado_karine');
    
    const unsubscribe = onSnapshot(docRef, 
      (docSnap) => {
        if (docSnap.exists()) {
          let state = docSnap.data() as AppState;
          state = this.processIncomingState(state);
          this.saveState(state); // Backup local
          onSuccess(state);
        } else {
          let newState = this.loadState();
          newState = this.processIncomingState(newState);
          this.saveStateCloud(newState);
          onSuccess(newState);
        }
      },
      (error) => {
        console.error("Erro na escuta do Firebase (Modo Offline):", error);
        onFallback();
      }
    );
    
    return unsubscribe;
  },

  loadState(): AppState {
    const todayStr = this.getTodayDateString();
    try {
      const serialized = localStorage.getItem(STORAGE_KEY);
      if (serialized) {
        const state: AppState = JSON.parse(serialized);
        state.config = { ...defaultConfig, ...state.config };
        return state;
      }
    } catch (e) {}

    const todayExecutions = this.generateDefaultExecutions(todayStr);
    const newState: AppState = {
      executions: todayExecutions,
      currentExecutionId: null,
      history: this.generateDemoHistory(),
      config: defaultConfig
    };
    this.saveState(newState);
    return newState;
  },

  saveState(state: AppState): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (e) {}
  },

  calculateSummaryForExecutions(executions: Execution[]) {
    const totalPlanned = executions.length;
    const completedExecs = executions.filter(e => e.status === 'CONCLUIDO');
    const completed = completedExecs.length;
    const delayed = executions.filter(e => e.status === 'ATRASADO' || (e.delaySeconds && e.delaySeconds > 0)).length;
    const notCompleted = totalPlanned - completed;
    
    let totalDurationSeconds = 0;
    completedExecs.forEach(e => {
      if (e.durationSeconds) totalDurationSeconds += e.durationSeconds;
    });

    const averageDurationSeconds = completed > 0 ? Math.round(totalDurationSeconds / completed) : 0;
    const completionRate = totalPlanned > 0 ? (completed / totalPlanned) * 100 : 0;
    const punctualityRate = completed > 0 
      ? ((completed - executions.filter(e => e.status === 'CONCLUIDO' && e.delaySeconds && e.delaySeconds > 0).length) / completed) * 100 
      : 100;
    const executionIndex = Math.round((completionRate * 0.7) + (punctualityRate * 0.3));

    return { totalPlanned, completed, delayed, notCompleted, totalDurationSeconds, averageDurationSeconds, executionIndex };
  },

  resetTodayExecutions(): Execution[] {
    const todayStr = this.getTodayDateString();
    const defaults = this.generateDefaultExecutions(todayStr);
    try {
      const serialized = localStorage.getItem(STORAGE_KEY);
      if (serialized) {
        const state: AppState = JSON.parse(serialized);
        state.executions = defaults;
        state.currentExecutionId = null;
        this.saveState(state);
      }
    } catch (e) {}
    return defaults;
  },

  generateDemoHistory(): HistoryDay[] {
    const history: HistoryDay[] = [];
    const dates = [];
    const d = new Date();
    
    for (let i = 1; i <= 5; i++) {
      const prevDate = new Date();
      prevDate.setDate(d.getDate() - i);
      const year = prevDate.getFullYear();
      const month = String(prevDate.getMonth() + 1).padStart(2, '0');
      const day = String(prevDate.getDate()).padStart(2, '0');
      dates.push(`${year}-${month}-${day}`);
    }

    dates.forEach((dateStr, idx) => {
      const rawExecs = this.generateDefaultExecutions(dateStr);
      const executions = rawExecs.map((exec, eidx) => {
        const statusRand = Math.random();
        let status: ExecutionStatus = 'CONCLUIDO';
        let durationSeconds = Math.round(300 + Math.random() * 600);
        let startedAt: string | undefined;
        let completedAt: string | undefined;
        let delaySeconds = 0;
        let delayReason = '';

        if (statusRand < 0.08) {
          status = 'NAO_REALIZADO';
          delayReason = 'Sistema indisponível';
        } else {
          const [hour, min] = exec.scheduledTime.split(':').map(Number);
          const schedDate = new Date();
          schedDate.setHours(hour, min, 0, 0);
          const offsetMin = Math.round((Math.random() - 0.3) * 12);
          const startDateObj = new Date(schedDate.getTime() + offsetMin * 60 * 1000);
          const endDateObj = new Date(startDateObj.getTime() + durationSeconds * 1000);
          startedAt = startDateObj.toISOString();
          completedAt = endDateObj.toISOString();
          if (offsetMin > 5) {
            delaySeconds = offsetMin * 60;
            delayReason = idx % 2 === 0 ? 'Demanda urgente' : 'Problema técnico';
          }
        }
        return {
          ...exec, status, startedAt, completedAt,
          durationSeconds: status === 'CONCLUIDO' ? durationSeconds : undefined,
          delaySeconds: delaySeconds > 0 ? delaySeconds : undefined,
          delayReason: delayReason || undefined
        };
      });

      history.push({ date: dateStr, executions, summary: this.calculateSummaryForExecutions(executions) });
    });
    return history;
  },

  getAllDirectories(): Directory[] {
    const list: Directory[] = [];
    routineActivities.forEach(act => {
      act.diretorios.forEach((pathStr, index) => {
        list.push({
          id: `${act.id}-dir-${index}`,
          nome: pathStr.split('\\').pop() || pathStr.split('/').pop() || 'Caminho de Rede',
          caminho: pathStr,
          atividadeId: act.id,
          biRelacionado: act.biRelacionado,
          prioridade: act.prioridade,
          tipo: act.categoria,
          uso: act.objetivo,
          contingencia: act.tipoExecucao === 'CONTINGENCIA'
        });
      });
    });
    return list;
  }
};