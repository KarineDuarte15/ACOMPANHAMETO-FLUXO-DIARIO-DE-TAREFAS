import { AppState, Execution, UserConfig, HistoryDay, ExecutionStatus } from '../types';
import { routineActivities } from '../data/activities';

const STORAGE_KEY = 'rotina_inteligente_state_v1';

const defaultConfig: UserConfig = {
  name: 'Karine',
  email: 'erika.karine@hapvida.com.br',
  enableTimeAlerts: true,
  enableDelayAlerts: true,
  soundEnabled: true,
  popupEnabled: true,
  teamsEnabled: false,
  outlookEnabled: false,
  dailyReportEnabled: true,
  alertOffsetMinutes: 0,
  teamsWebhookUrl: ''
};

export const storageService = {
  getTodayDateString(): string {
    // Return date in local timezone YYYY-MM-DD
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  },

  generateDefaultExecutions(dateStr: string): Execution[] {
    const executions: Execution[] = [];
    
    routineActivities.forEach(activity => {
      activity.schedule.forEach(time => {
        executions.push({
          id: `${activity.id}-${time}`,
          activityId: activity.id,
          date: dateStr,
          scheduledTime: time,
          status: 'PENDENTE'
        });
      });
    });

    // Sort executions by scheduled time chronologically
    return executions.sort((a, b) => {
      return a.scheduledTime.localeCompare(b.scheduledTime);
    });
  },

  loadState(): AppState {
    const todayStr = this.getTodayDateString();
    try {
      const serialized = localStorage.getItem(STORAGE_KEY);
      if (serialized) {
        const state: AppState = JSON.parse(serialized);
        
        // Ensure config is complete
        state.config = { ...defaultConfig, ...state.config };
        
        // Ensure there are executions for today
        const hasTodayExecutions = state.executions && state.executions.length > 0 && state.executions[0].date === todayStr;
        
        if (!hasTodayExecutions) {
          // If we had prior executions, save them to history before resetting for the new day
          if (state.executions && state.executions.length > 0) {
            const oldDate = state.executions[0].date;
            const alreadyInHistory = state.history.some(h => h.date === oldDate);
            
            if (!alreadyInHistory) {
              const summary = this.calculateSummaryForExecutions(state.executions);
              const historyDay: HistoryDay = {
                date: oldDate,
                executions: [...state.executions],
                summary
              };
              state.history.unshift(historyDay); // Prepend to history
            }
          }

          // Generate new executions for today
          state.executions = this.generateDefaultExecutions(todayStr);
          state.currentExecutionId = null;
          this.saveState(state);
        }
        
        return state;
      }
    } catch (e) {
      console.error('Error loading state from localStorage:', e);
    }

    // Default first-run state
    const todayExecutions = this.generateDefaultExecutions(todayStr);
    const newState: AppState = {
      executions: todayExecutions,
      currentExecutionId: null,
      history: this.generateDemoHistory(), // Provide some historical data for comparison
      config: defaultConfig
    };
    this.saveState(newState);
    return newState;
  },

  saveState(state: AppState): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (e) {
      console.error('Error saving state to localStorage:', e);
    }
  },

  calculateSummaryForExecutions(executions: Execution[]) {
    const totalPlanned = executions.length;
    const completedExecs = executions.filter(e => e.status === 'CONCLUIDO');
    const completed = completedExecs.length;
    
    // Delayed are ones where delayedSeconds > 0 or status is ATRASADO
    const delayed = executions.filter(e => e.status === 'ATRASADO' || (e.delaySeconds && e.delaySeconds > 0)).length;
    const notCompleted = totalPlanned - completed;
    
    let totalDurationSeconds = 0;
    completedExecs.forEach(e => {
      if (e.durationSeconds) totalDurationSeconds += e.durationSeconds;
    });

    const averageDurationSeconds = completed > 0 ? Math.round(totalDurationSeconds / completed) : 0;
    
    // ÍNDICE DE EXECUÇÃO: Combination of completion rate (70%) and punctuality (30%)
    const completionRate = totalPlanned > 0 ? (completed / totalPlanned) * 100 : 0;
    const punctualityRate = completed > 0 
      ? ((completed - executions.filter(e => e.status === 'CONCLUIDO' && e.delaySeconds && e.delaySeconds > 0).length) / completed) * 100 
      : 100;
    const executionIndex = Math.round((completionRate * 0.7) + (punctualityRate * 0.3));

    return {
      totalPlanned,
      completed,
      delayed,
      notCompleted,
      totalDurationSeconds,
      averageDurationSeconds,
      executionIndex
    };
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
    } catch (e) {
      console.error('Error resetting executions:', e);
    }
    return defaults;
  },

  generateDemoHistory(): HistoryDay[] {
    // Generate realistic historical data for yesterday and past days for demo metrics and comparison
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
      // Simulate completions: 80% to 100%
      const rawExecs = this.generateDefaultExecutions(dateStr);
      const executions = rawExecs.map((exec, eidx) => {
        const statusRand = Math.random();
        
        // Create realistic durations and start times
        let status: ExecutionStatus = 'CONCLUIDO';
        let durationSeconds = Math.round(300 + Math.random() * 600); // 5-15 mins
        let startedAt: string | undefined;
        let completedAt: string | undefined;
        let delaySeconds = 0;
        let delayReason = '';
        let helperPerson = '';
        let informedPerson = '';

        if (statusRand < 0.08) {
          status = 'NAO_REALIZADO';
          delayReason = 'Sistema indisponível';
          informedPerson = 'Rafael Fernandes';
        } else {
          // Calculate realistic timestamps
          const [hour, min] = exec.scheduledTime.split(':').map(Number);
          const schedDate = new Date();
          schedDate.setHours(hour, min, 0, 0);
          
          // Random offset (either early, exact, or delayed)
          const offsetMin = Math.round((Math.random() - 0.3) * 12); // mostly on-time or slight delay
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
          ...exec,
          status,
          startedAt,
          completedAt,
          durationSeconds: status === 'CONCLUIDO' ? durationSeconds : undefined,
          delaySeconds: delaySeconds > 0 ? delaySeconds : undefined,
          delayReason: delayReason || undefined,
          informedPerson: informedPerson || undefined,
          helperPerson: helperPerson || undefined
        };
      });

      const summary = this.calculateSummaryForExecutions(executions);
      history.push({
        date: dateStr,
        executions,
        summary
      });
    });

    return history;
  }
};
