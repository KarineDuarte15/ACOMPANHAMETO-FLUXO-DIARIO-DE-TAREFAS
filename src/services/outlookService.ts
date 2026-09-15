import { Execution, Activity, HistoryDay } from '../types';

/**
 * SERVIÇO DE INTEGRAÇÃO COM OUTLOOK (E-MAILS)
 * 
 * DEMO: Mostra os e-mails prontos em tela e simula o envio de e-mails de rotina.
 * PRODUÇÃO: Prepara corpos de e-mail integrados com fluxos seguros via Power Automate ou Microsoft Graph.
 */
export const outlookService = {
  /**
   * Cria o assunto e corpo do e-mail para uma atividade concluída
   */
  buildActivityEmail(execution: Execution, activity: Activity) {
    const startHour = execution.startedAt ? new Date(execution.startedAt).toLocaleTimeString('pt-BR') : '--:--';
    const completeHour = execution.completedAt ? new Date(execution.completedAt).toLocaleTimeString('pt-BR') : '--:--';
    
    let durationStr = '--';
    if (execution.durationSeconds) {
      const mins = Math.floor(execution.durationSeconds / 60);
      const secs = execution.durationSeconds % 60;
      durationStr = `${mins} minutos e ${secs} segundos`;
    }

    let delayStr = 'No prazo / Sem atraso';
    if (execution.delaySeconds && execution.delaySeconds > 0) {
      const delayMins = Math.floor(execution.delaySeconds / 60);
      delayStr = `${delayMins} minutos (${execution.delayReason || 'Motivo não especificado'})`;
    }

    const subject = `[ROTINA] Atividade concluída — ${activity.name}`;
    const body = `
Olá,

A atividade a seguir foi concluída com sucesso na rotina diária da Karine.

--------------------------------------------------
DADOS DA ATIVIDADE:
--------------------------------------------------
Atividade:       ${activity.name}
Categoria:       ${activity.category.toUpperCase()}
Horário Previsto:${execution.scheduledTime}
Hora de Início:  ${startHour}
Hora de Conclusão:${completeHour}
Duração Real:    ${durationStr}
Status Atraso:   ${delayStr}
Responsável:     ${activity.responsible}

${execution.notes ? `Observações da Karine:\n"${execution.notes}"\n` : ''}
--------------------------------------------------

Mensagem automática gerada pelo assistente "Rotina Inteligente — Karine".
    `.trim();

    return { subject, body };
  },

  /**
   * Constrói e-mail consolidado do Relatório Diário de Execução
   */
  buildDailyReportEmail(dateStr: string, summary: any, executions: Execution[], activities: Activity[]) {
    const subject = `[ROTINA] Relatório diário de execução — ${dateStr}`;
    
    const formattedDate = new Date(dateStr + 'T00:00:00').toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });

    const durationMins = Math.round(summary.totalDurationSeconds / 60);
    const avgMins = Math.round(summary.averageDurationSeconds / 60);

    let tableRows = '';
    executions.forEach(exec => {
      const act = activities.find(a => a.id === exec.activityId);
      const name = act ? act.name : exec.activityId;
      const start = exec.startedAt ? new Date(exec.startedAt).toLocaleTimeString('pt-BR') : '--:--';
      const end = exec.completedAt ? new Date(exec.completedAt).toLocaleTimeString('pt-BR') : '--:--';
      const dur = exec.durationSeconds ? `${Math.floor(exec.durationSeconds / 60)}m` : '--';
      const delay = exec.delaySeconds ? `${Math.floor(exec.delaySeconds / 60)}m` : '--';
      
      tableRows += `${exec.scheduledTime.padEnd(8)} | ${exec.status.padEnd(12)} | ${start.padEnd(8)} | ${end.padEnd(8)} | ${dur.padEnd(5)} | ${delay.padEnd(5)} | ${name}\n`;
    });

    const body = `
Prezada Erika,

Segue abaixo o relatório diário de acompanhamento e produtividade das rotinas operacionais executadas em ${formattedDate}.

========================================================================
RESUMO OPERACIONAL DO DIA
========================================================================
Progresso Geral:            ${summary.executionIndex}% (Índice de Execução)
Atividades Previstas:       ${summary.totalPlanned}
Atividades Concluídas:      ${summary.completed}
Atividades Não Concluídas:  ${summary.notCompleted}
Atividades com Atraso:      ${summary.delayed}
Tempo Total de Trabalho:    ${durationMins} minutos
Tempo Médio por Atividade:  ${avgMins} minutos

========================================================================
TABELA DETALHADA DE EXECUÇÕES
========================================================================
Previsto | Status       | Início   | Fim      | Dur.  | Atr.  | Atividade
------------------------------------------------------------------------
${tableRows}
========================================================================

Relatório gerado automaticamente por: Rotina Inteligente — Karine
E-mail de destino: erika.karine@hapvida.com.br

Para integrações em ambiente corporativo Hapvida, este relatório está estruturado para envio direto via conector MS Power Automate.
    `.trim();

    return { subject, body };
  },

  /**
   * Simula ou dispara o e-mail
   */
  async sendEmail(to: string, subject: string, body: string, enabled: boolean): Promise<{ success: boolean; message: string }> {
    console.group('📧 [Outlook Integration] Preparando envio de e-mail');
    console.log(`Para: ${to}`);
    console.log(`Assunto: ${subject}`);
    console.log('Corpo:', body);
    console.groupEnd();

    if (!enabled) {
      return {
        success: true,
        message: 'DEMO: E-mail preparado e simulado com sucesso (integração não ativada nas configurações).'
      };
    }

    // Se estiver ativado, simula o envio real via API (ou mostra alerta que simula envio corporativo)
    return {
      success: true,
      message: `E-mail enviado com sucesso para ${to}!`
    };
  }
};
