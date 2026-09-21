// src/services/sheetsService.ts
import { Execution, Activity } from '../types';

// Substitua pela sua URL gerada no SheetDB
const SHEETDB_URL = 'https://sheetdb.io/api/v1/AIzaSyDrCBEFgflkR9wI2N3U5LhYQWKk8bKvfnk';

export const sheetsService = {
  /**
   * Envia os dados da atividade concluída para o Google Sheets
   */
  async appendRow(execution: Execution, activity: Activity): Promise<void> {
    try {
      // Montamos o objeto exatamente com os nomes das colunas da sua planilha
      const data = {
        data: [
          {
            Data: execution.date,
            Horario: execution.scheduledTime,
            Atividade: activity.nome,
            Categoria: activity.categoria,
            Status: execution.status,
            DuracaoSegundos: execution.durationSeconds || 0,
            AtrasoSegundos: execution.delaySeconds || 0,
            MotivoAtraso: execution.delayReason || '-',
          }
        ]
      };

      // Disparamos a requisição POST para o SheetDB
      const response = await fetch(SHEETDB_URL, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      });

      if (!response.ok) {
        throw new Error('Falha ao gravar na planilha');
      }
      
      console.log('✅ Linha inserida no Google Sheets com sucesso!');
    } catch (error) {
      console.error('❌ Erro ao enviar para o SheetDB:', error);
    }
  }
};