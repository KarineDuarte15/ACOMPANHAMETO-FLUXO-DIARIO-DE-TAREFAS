import { Execution, Activity } from '../types';

/**
 * SERVIÇO DE INTEGRAÇÃO COM MICROSOFT TEAMS
 * 
 * DEMO: Mostra logs de payload gerados no console e simula o disparo de alertas.
 * PRODUÇÃO: Pronto para conexão com webhook de entrada do Teams ou fluxo do Power Automate.
 */
export const teamsService = {
  /**
   * Constrói o corpo da mensagem formatada em formato Adaptive Cards (JSON padrão do MS Teams)
   */
  buildAdaptiveCardPayload(execution: Execution, activity: Activity) {
    const startHour = execution.startedAt ? new Date(execution.startedAt).toLocaleTimeString('pt-BR') : '--:--';
    const completeHour = execution.completedAt ? new Date(execution.completedAt).toLocaleTimeString('pt-BR') : '--:--';
    
    let durationStr = '--';
    if (execution.durationSeconds) {
      const mins = Math.floor(execution.durationSeconds / 60);
      const secs = execution.durationSeconds % 60;
      durationStr = `${mins}m ${secs}s`;
    }

    let delayStr = 'No prazo';
    if (execution.delaySeconds && execution.delaySeconds > 0) {
      const delayMins = Math.floor(execution.delaySeconds / 60);
      delayStr = `${delayMins} minutos de atraso`;
    }

    const title = `✅ ROTINA CONCLUÍDA — ${activity.name}`;
    const subtitle = `Karine concluiu a atividade planejada para as **${execution.scheduledTime}**.`;

    return {
      type: 'message',
      attachments: [
        {
          contentType: 'application/vnd.microsoft.card.adaptive',
          content: {
            type: 'AdaptiveCard',
            version: '1.4',
            msteams: { width: 'Full' },
            body: [
              {
                type: 'TextBlock',
                text: title,
                weight: 'Bolder',
                size: 'Medium',
                color: 'Good'
              },
              {
                type: 'TextBlock',
                text: subtitle,
                wrap: true,
                spacing: 'Small'
              },
              {
                type: 'FactSet',
                facts: [
                  { title: 'Atividade:', value: activity.name },
                  { title: 'Horário Previsto:', value: execution.scheduledTime },
                  { title: 'Hora de Início:', value: startHour },
                  { title: 'Hora de Conclusão:', value: completeHour },
                  { title: 'Duração Total:', value: durationStr },
                  { title: 'Status do Atraso:', value: delayStr },
                  { title: 'Responsável:', value: activity.responsible }
                ],
                spacing: 'Medium'
              },
              {
                type: 'TextBlock',
                text: execution.notes ? `**Observações:** ${execution.notes}` : '',
                wrap: true,
                fontType: 'Default',
                size: 'Small',
                isSubtle: true,
                spacing: 'Medium'
              }
            ]
          }
        }
      ]
    };
  },

  /**
   * Envia uma notificação para o Teams.
   * Em modo DEMO, exibe o payload formatado e simula o sucesso.
   * Em modo PRODUÇÃO, envia uma requisição POST HTTP para a URL configurada de Webhook.
   */
  async sendNotification(execution: Execution, activity: Activity, webhookUrl?: string): Promise<{ success: boolean; message: string }> {
    const payload = this.buildAdaptiveCardPayload(execution, activity);
    
    // Log para fins de auditoria e depuração
    console.group('🔔 [Teams Integration] Disparando Notificação');
    console.log('Payload gerado:', payload);
    console.groupEnd();

    if (!webhookUrl || webhookUrl.trim() === '') {
      return {
        success: true, // Retorna sucesso na simulação para não quebrar a UX
        message: 'DEMO: Notificação Teams simulada com sucesso (webhook não configurado).'
      };
    }

    try {
      // PRODUÇÃO: Requisição real ao Webhook do Microsoft Teams ou Power Automate
      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error(`Erro na resposta do servidor Teams: ${response.statusText}`);
      }

      return {
        success: true,
        message: 'Notificação enviada ao Teams com sucesso!'
      };
    } catch (error: any) {
      console.error('Falha ao enviar webhook ao Teams:', error);
      return {
        success: false,
        message: `Erro na integração real: ${error.message}`
      };
    }
  }
};
