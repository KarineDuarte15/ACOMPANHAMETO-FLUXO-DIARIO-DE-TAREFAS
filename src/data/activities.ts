import { Activity } from '../types';

export const routineActivities: Activity[] = [
  {
    id: 't22aprr-bases',
    name: 'T22APRR / Alerta de Vagas (Checagem de Bases)',
    category: 'diaria',
    schedule: ['06:00', '09:00', '11:00', '13:00', '15:00', '17:00'],
    recurrence: 'Diariamente (Vários horários)',
    objective: 'Checar se as bases da T22APRR baixaram nos horários previstos e estão íntegras.',
    instructions: [
      'Verificar se os arquivos correspondentes foram baixados automaticamente pela Charlene nas pastas de destino.',
      'Em caso de duplicidade de arquivos, apagar os mais antigos, rodar os scripts Python/Alteryx e depois atualizar o BI.',
      'Se der erro: renomear a coluna "Encaixe_normal" para "QTE_ENCAIXES" (coluna I) e apagar a coluna J.'
    ],
    paths: [
      { label: 'T22APRR - DIARIA', path: '\\\\10.1.17.4\\Usuarios\\Credenciamento Medico\\NUCLEO DE AGENDAS\\RAFAEL FERNANDES\\7 - BASES DE RELATORIOS\\T22APRR - DIARIA' },
      { label: 'T22APRR_PROC - DIARIA', path: '\\\\10.1.17.4\\Usuarios\\Credenciamento Medico\\NUCLEO DE AGENDAS\\RAFAEL FERNANDES\\7 - BASES DE RELATORIOS\\T22APRR_PROC - DIARIA' },
      { label: 'T22APRR_VS - DIARIA', path: '\\\\10.1.17.4\\Usuarios\\Credenciamento Medico\\NUCLEO DE AGENDAS\\RAFAEL FERNANDES\\7 - BASES DE RELATORIOS\\T22APRR_VS - DIARIA' }
    ],
    scripts: [],
    contingency: 'Renomear a coluna Encaixe_normal para QTE_ENCAIXES (coluna I) e apagar a coluna J. Apagar duplicados antigos.',
    priority: 'high',
    responsible: 'Charlene (automático)',
    estimatedTime: '10'
  },
  {
    id: 't22aprr-fluxo',
    name: 'Checar Fluxo APRR no Agendador',
    category: 'diaria',
    schedule: ['07:50', '10:50', '12:50', '14:50', '16:50', '17:45'],
    recurrence: 'Diariamente (Vários horários)',
    objective: 'Conferir e processar os fluxos APRR para atualização dos relatórios de vagas.',
    instructions: [
      'A Charlene gera os arquivos da T22APRR automaticamente — só conferir se baixou.',
      'No agendador é só rodar o FLUXO (ou o orquestrador, para rodar tudo); se der problema, dá pra rodar direto na mão pelo agendador de tarefas.'
    ],
    paths: [],
    scripts: [],
    contingency: 'Caso dê erro, rodar diretamente o fluxo ou o orquestrador no Agendador de Tarefas do Windows corporativo.',
    priority: 'high',
    responsible: 'Karine',
    estimatedTime: '15'
  },
  {
    id: 't22aprr-bi-sub',
    name: 'BI Alerta de Vagas V2 / Alerta Diário_Sub',
    category: 'diaria',
    schedule: ['07:55', '10:55', '12:55', '14:55', '16:55', '17:45'],
    recurrence: 'Diariamente (Após checagem do fluxo)',
    objective: 'Validar se os dados subiram corretamente no Power BI e, se necessário, rodar o Alteryx.',
    instructions: [
      'Se as bases estiverem ok, só conferir se os dados subiram no BI de acordo com o horário.',
      'Se der erro na atualização do agendador, ir na pasta 39 - Relatorio alerta de Sub e rodar os 4 Alteryx na sequência — são eles que alimentam esse BI.'
    ],
    paths: [
      { label: 'Pasta 39 - Relatório Alerta de Sub', path: '\\\\10.1.17.4\\Usuarios\\Credenciamento Medico\\NUCLEO DE AGENDAS\\RAFAEL FERNANDES\\1 - RELATORIOS\\39 - Relatorio alerta de Sub' }
    ],
    scripts: ['Os 4 fluxos Alteryx da pasta 39 rodados em sequência.'],
    contingency: 'Acessar a pasta 39 e rodar manualmente os 4 fluxos do Alteryx de forma sequencial.',
    priority: 'high',
    responsible: 'Karine',
    estimatedTime: '12'
  },
  {
    id: 'bi-telesaude',
    name: 'BI_ALERTA_VAGAS_TELESAUDE',
    category: 'bi',
    schedule: ['08:00', '10:00', '12:00', '14:00', '16:00'],
    recurrence: 'A cada 2 horas',
    objective: 'Atualizar e publicar o painel de vagas da TeleSaúde no Workspace.',
    instructions: [
      'O Bob roda a consulta no banco de hora em hora. Atualizar o arquivo PBIX no Power BI Desktop.',
      'Verificar se o arquivo FATO_ATUAL foi gerado e salvo com sucesso na pasta.'
    ],
    paths: [
      { label: 'PBIX OFICIAL', path: 'G:\\Credenciamento Medico\\NUCLEO DE AGENDAS\\RAFAEL FERNANDES\\3 - ATUALIZAÇÃO PBIX\\PBIX OFICIAL' },
      { label: 'FATO_ATUAL', path: '\\\\10.1.17.4\\Usuarios\\Credenciamento Medico\\NUCLEO DE AGENDAS\\RAFAEL FERNANDES\\1 - RELATORIOS\\47 - BI_TELESSAUDE\\FATO' }
    ],
    scripts: ['FLUXO_BI_TELESAUDE.py', 'FLUXO_BI_TELESAUDE_HIST.py', 'Query_Vagas_Ult_2_meses.txt'],
    contingency: 'Rodar manualmente FLUXO_BI_TELESAUDE.py na pasta BI_TELESAUDE. Na virada do mês, ajustar a query de -6 para -7 meses no arquivo Query_Vagas_Ult_2_meses.txt e rodar o script HIST.',
    priority: 'high',
    responsible: 'Karine / Bob',
    estimatedTime: '10'
  },
  {
    id: 'ronda-relatorios',
    name: 'Ronda nos Relatórios Automáticos',
    category: 'diaria',
    schedule: ['08:15'],
    recurrence: 'Diariamente (Manhã)',
    objective: 'Fazer ronda nos relatórios automáticos para ver se atualizaram corretamente.',
    instructions: [
      'Abrir os painéis do Power BI que são atualizados de forma automática e validar as datas de carga e integridade geral.'
    ],
    paths: [],
    scripts: [],
    contingency: 'Caso haja atraso, acionar a infraestrutura ou reprocessar individualmente conforme os procedimentos específicos de cada BI.',
    priority: 'medium',
    responsible: 'Karine',
    estimatedTime: '15'
  },
  {
    id: 'logs-projetos',
    name: 'Logs Projetos (Pasta 52)',
    category: 'diaria',
    schedule: ['08:30'],
    recurrence: 'Diariamente (Manhã)',
    objective: 'Validar se os logs das rotinas automatizadas rodaram com sucesso.',
    instructions: [
      'Abrir a pasta 52 - LOGS PROJETOS no servidor.',
      'Validar se os logs correspondentes rodaram com sucesso.',
      'Se o arquivo não for gerado, rodar o respectivo fluxo manual de contingência correspondente ao log.'
    ],
    paths: [
      { label: '52 - LOGS PROJETOS', path: '\\\\10.1.17.4\\Usuarios\\Credenciamento Medico\\NUCLEO DE AGENDAS\\RAFAEL FERNANDES\\1 - RELATORIOS\\52 - LOGS PROJETOS' }
    ],
    scripts: [
      'log_Script_Tabela_Captados_Fora_Alerta (Pode ignorar erro)',
      'log_execucao_consultas_em_transferencia',
      'log_execucao_relatorio_de_cancelamento',
      'log_relatorio_mensageria',
      'log_monitoramento_marcacao_ans'
    ],
    contingency: 'Se consultas_em_transferencia falhar: rodar os scripts da pasta 42. Se cancelamento falhar: executar a JOB_CANCELAMENTO pelo python CancelamentoDiario.py. Se mensageria falhar: rodar scripts na pasta BI MENSAGERIA. Se monitoramento_ans falhar: rodar o script e republicar.',
    priority: 'high',
    responsible: 'Karine',
    estimatedTime: '20'
  },
  {
    id: 'download-t22j2',
    name: 'Download T22J2',
    category: 'diaria',
    schedule: ['10:00'],
    recurrence: 'Diariamente (Manhã)',
    objective: 'Iniciar download das bases T22J2 (mês atual, seguinte e subsequente) APÓS o Agenor atualizar as bases.',
    instructions: [
      'Confirmar se o Agenor já atualizou as bases no sistema.',
      'Abrir o sistema corporativo e exportar as bases T22J2 para as 5 empresas.',
      'Copiar e salvar os arquivos exportados na pasta anual de 2026.'
    ],
    paths: [
      { label: 'T22J2 - BASE MENSAL 2026', path: '\\\\10.1.17.4\\Usuarios\\Credenciamento Medico\\NUCLEO DE AGENDAS\\RAFAEL FERNANDES\\7 - BASES DE RELATORIOS\\T22J2 - BASE MENSAL\\2026' }
    ],
    scripts: [],
    contingency: 'Caso o download de lote falhar, exportar individualmente cada uma das 5 empresas pelo sistema.',
    priority: 'medium',
    responsible: 'Karine / Agenor',
    estimatedTime: '25'
  },
  {
    id: 'checagem-bases',
    name: 'Checagem T22J3 / T9075 / T9033',
    category: 'diaria',
    schedule: ['09:05'],
    recurrence: 'Diariamente (Manhã)',
    objective: 'Verificar se as bases T22J3, T9075 e T9033 baixaram corretamente na Charlene.',
    instructions: [
      'Verificar a presença e data de modificação das planilhas T9075, T9033 e T22J3 nas respectivas pastas anuais.'
    ],
    paths: [
      { label: 'T9075 (Atraso Médico)', path: '\\\\10.1.17.4\\Usuarios\\Credenciamento Medico\\NUCLEO DE AGENDAS\\RAFAEL FERNANDES\\7 - BASES DE RELATORIOS\\BASE_PAINEL DOS MEDICOS\\BASE_ATRASO MEDICO\\2026' },
      { label: 'T9033 (Horas Médicos)', path: '\\\\10.1.17.4\\Usuarios\\Credenciamento Medico\\NUCLEO DE AGENDAS\\RAFAEL FERNANDES\\7 - BASES DE RELATORIOS\\BASE_PAINEL DOS MEDICOS\\BASE HORAS MEDICOS\\2026' },
      { label: 'T22J3 (Base Diária)', path: '\\\\10.1.17.4\\Usuarios\\Credenciamento Medico\\NUCLEO DE AGENDAS\\RAFAEL FERNANDES\\7 - BASES DE RELATORIOS\\T22J3 - BASE DIARIA\\2026' }
    ],
    scripts: [],
    contingency: 'Caso a Charlene não tenha baixado as bases, acioná-la ou solicitar exportação direta.',
    priority: 'medium',
    responsible: 'Charlene',
    estimatedTime: '10'
  },
  {
    id: 'faltas-espera',
    name: 'Base Marcação Falta Espera',
    category: 'diaria',
    schedule: ['09:15'],
    recurrence: 'Diariamente (Manhã)',
    objective: 'Rodar os scripts de tratamento e consolidação anual de marcações, faltas e esperas.',
    instructions: [
      'Acessar a pasta de scripts PYTHON correspondente.',
      'Rodar o script 1.CriacaoBaseMarcacaoEsperaFaltas.py.',
      'Rodar o script 2.CriarArquivoAnual.py.',
      'Apenas após rodar ambos com sucesso, iniciar a atualização do Painel dos Médicos.'
    ],
    paths: [
      { label: 'Scripts Faltas/Espera', path: '\\\\10.1.17.4\\Usuarios\\Credenciamento Medico\\NUCLEO DE AGENDAS\\RAFAEL FERNANDES\\25 - PYTHON\\BASE MARCACAO FALTA ESPERA' }
    ],
    scripts: ['1.CriacaoBaseMarcacaoEsperaFaltas.py', '2.CriarArquivoAnual.py'],
    contingency: 'Se houver erros de execução, verificar o console python e depurar caminhos de rede mapeados.',
    priority: 'high',
    responsible: 'Karine',
    estimatedTime: '15'
  },
  {
    id: 'pausa-almoco',
    name: 'Pausa para Almoço',
    category: 'outras',
    schedule: ['12:00'],
    recurrence: 'Diariamente',
    objective: 'Horário reservado para almoço e descanso.',
    instructions: [
      'Pausa operacional. Alertas e cronômetros de atividades regulares não devem ser iniciados neste período.'
    ],
    paths: [],
    scripts: [],
    contingency: 'Não aplicável.',
    priority: 'low',
    responsible: 'Karine',
    estimatedTime: '60'
  },
  {
    id: 'tarde-livre',
    name: 'Período da Tarde (Desenvolvimento / Demandas)',
    category: 'diaria',
    schedule: ['13:30'],
    recurrence: 'Diariamente (Tarde)',
    objective: 'Desenvolvimento de novas atividades, automações e resoluções de demandas adicionais.',
    instructions: [
      'Aproveitar o período livre da tarde para atividades de desenvolvimento, resposta a e-mails e demandas enviadas ao longo do dia.'
    ],
    paths: [],
    scripts: [],
    contingency: 'Não definido na rotina original.',
    priority: 'low',
    responsible: 'Karine',
    estimatedTime: '240'
  },
  {
    id: 'bi-consultas-disponibilizadas',
    name: 'BI Relatório de Consultas Disponibilizadas v2 (3.1)',
    category: 'bi',
    schedule: ['13:00'],
    recurrence: 'Diariamente às 13:00 (Manual)',
    objective: 'Atualizar e publicar o relatório de consultas disponibilizadas.',
    instructions: [
      'Baixar a base T22J2 para as 5 empresas (mês atual, seguinte e subsequente) e salvar na pasta correspondente.',
      'Rodar os scripts 01_FLUXO_UNIFICAR_E_PADRONIZAR_BASES.py, 02_FLUXO_CONSOLIDAR_BASES_DISPONIBILIZADAS.py, e 03_IMPORTA_BANCO.py em ordem.',
      'Atualizar o arquivo Power BI e publicar.'
    ],
    paths: [
      { label: 'T22J2 - BASE MENSAL 2026', path: '\\\\10.1.17.4\\Usuarios\\Credenciamento Medico\\NUCLEO DE AGENDAS\\RAFAEL FERNANDES\\7 - BASES DE RELATORIOS\\T22J2 - BASE MENSAL\\2026' },
      { label: 'Caminho dos Scripts', path: '\\\\10.1.17.4\\Usuarios\\Credenciamento Medico\\NUCLEO DE AGENDAS\\RAFAEL FERNANDES\\1 - RELATORIOS\\37 - RELATORIO DE CONSULTAS DISPONIBILIZADAS V2' }
    ],
    scripts: [
      '01_FLUXO_UNIFICAR_E_PADRONIZAR_BASES.py',
      '02_FLUXO_CONSOLIDAR_BASES_DISPONIBILIZADAS.py',
      '03_IMPORTA_BANCO.py'
    ],
    contingency: 'Verificar se os arquivos foram exportados corretamente e se as planilhas estão abertas ou travadas por outro usuário.',
    priority: 'high',
    responsible: 'Karine',
    estimatedTime: '20'
  },
  {
    id: 'bi-painel-medicos',
    name: 'BI Painel dos Médicos (3.2)',
    category: 'bi',
    schedule: ['10:00'],
    recurrence: 'Diariamente às 10:00 (Manual)',
    objective: 'Atualizar dados de produtividade e horas médicas para carga no Painel dos Médicos.',
    instructions: [
      'Verificar se as bases T9033 e T22J3 foram salvas pela Charlene.',
      'Retirar a coluna "Meta Tipo" da base de Produtividade DGE.',
      'Certificar-se de que os scripts de Faltas/Espera já rodaram.',
      'Rodar o fluxo Alteryx "01 - CONSOLIDAÇÃO BASE_T9033.yxmd".',
      'Rodar o fluxo Alteryx "02 - PROJETO_PAINEL DOS MEDICOS_V3.yxmd".',
      'O gateway atualiza o conjunto de dados automaticamente às 10:30.'
    ],
    paths: [
      { label: 'Fluxos Alteryx', path: '\\\\10.1.17.4\\Usuarios\\Credenciamento Medico\\NUCLEO DE AGENDAS\\RAFAEL FERNANDES\\1 - RELATORIOS\\27 - PAINEL DOS MEDICOS' }
    ],
    scripts: ['01 - CONSOLIDAÇÃO BASE_T9033.yxmd', '02 - PROJETO_PAINEL DOS MEDICOS_V3.yxmd'],
    contingency: 'Não definido na rotina original.',
    priority: 'high',
    responsible: 'Karine',
    estimatedTime: '25'
  },
  {
    id: 'bi-atraso-medicos',
    name: 'BI Relatório Atraso dos Médicos (3.3)',
    category: 'bi',
    schedule: ['10:05'],
    recurrence: 'Diariamente às 10:00 (Automático)',
    objective: 'Verificar a atualização automática do painel de atraso dos médicos.',
    instructions: [
      'Verificar se a Charlene baixou a base T9075.',
      'Verificar se os scripts rodaram com sucesso (consultar log correspondente).',
      'A automação roda às 09:30 e o Gateway atualiza às 10:00.'
    ],
    paths: [
      { label: 'Base T9075', path: '\\\\10.1.17.4\\Usuarios\\Credenciamento Medico\\NUCLEO DE AGENDAS\\RAFAEL FERNANDES\\7 - BASES DE RELATORIOS\\BASE_PAINEL DOS MEDICOS\\BASE_ATRASO MEDICO\\2026' }
    ],
    scripts: ['1-TRATAMENTO BASE.py', '2-CRIAR FATO E DIMENSAO.py'],
    contingency: 'Se houver falha na execução automática pelo Bob, rodar manualmente os scripts de tratamento e dimensão, e publicar o BI.',
    priority: 'medium',
    responsible: 'Bob (automático)',
    estimatedTime: '10'
  },
  {
    id: 'bi-mensageria',
    name: 'BI Relatório de Acompanhamento de Mensageria (3.5)',
    category: 'bi',
    schedule: ['11:30'],
    recurrence: 'Diariamente às 11:30 (Automático com Contingência)',
    objective: 'Garantir a atualização do painel de mensageria diária.',
    instructions: [
      'O painel atualiza sozinho via gateway. Se o log de execução indicar erro, rodar a contingência manual.',
      'Rodar 1. Mensageria Diario.py (extrai do Oracle as mensagens diárias abertas).',
      'Rodar 2. UnificarParaMensal.py (unifica CSVs em Parquet).',
      'Rodar 3. CriarFato.py (consolida fMensageria.parquet).',
      'Atualizar o Power BI e publicar.',
      'Confirmar se e-mail automático do Outlook com resumo de execução foi enviado.'
    ],
    paths: [
      { label: 'Scripts Python', path: '\\\\10.1.17.4\\Usuarios\\Credenciamento Medico\\NUCLEO DE AGENDAS\\RAFAEL FERNANDES\\25 - PYTHON\\BI MENSAGERIA' }
    ],
    scripts: ['1. Mensageria Diario.py', '2. UnificarParaMensal.py', '3. CriarFato.py'],
    contingency: 'Rodar manualmente os scripts Python 1, 2 e 3 na pasta do projeto e republicar o BI.',
    priority: 'medium',
    responsible: 'Karine (Contingência)',
    estimatedTime: '15'
  },
  {
    id: 'bi-consultas-transf',
    name: 'BI Relatório de Consultas em Transferência (3.6)',
    category: 'bi',
    schedule: ['09:00'],
    recurrence: 'Diariamente às 09:00 (Automático com Contingência)',
    objective: 'Monitorar e corrigir a carga de dados de consultas em transferência.',
    instructions: [
      'O painel atualiza sozinho às 09:00. Se houver falha, rodar contingência.',
      'Rodar 01.FluxoDiarioTransf.py.',
      'Rodar 02.UnificarMensalTransf.py.',
      'Rodar fluxo Alteryx 03.FATO E DIMENSAO.yxmd.',
      'Atualizar o Power BI e publicar.'
    ],
    paths: [
      { label: 'Fluxos de Transferência', path: '\\\\10.1.17.4\\Usuarios\\Credenciamento Medico\\NUCLEO DE AGENDAS\\RAFAEL FERNANDES\\1 - RELATORIOS\\42 - RELATORIO DE CONSULTAS EM TRANSFERENCIA' }
    ],
    scripts: ['01.FluxoDiarioTransf.py', '02.UnificarMensalTransf.py', '03.FATO E DIMENSAO.yxmd'],
    contingency: 'Rodar os scripts 01 e 02 (Python) e depois o fluxo Alteryx (03) antes das 09:00 para atualização transparente pelo gateway.',
    priority: 'medium',
    responsible: 'Karine (Contingência)',
    estimatedTime: '15'
  },
  {
    id: 't9016-mensal',
    name: 'Baixar Bases T9016 Mensal',
    category: 'outras',
    schedule: ['08:05'],
    recurrence: '1º e 5º dia útil',
    objective: 'Baixar as bases T9016 mensais de todas as empresas (SEMPRE PEGA O MÊS ANTERIOR) para iniciar a atualização de médicos novos.',
    instructions: [
      'Acessar o sistema, baixar as bases T9016 do mês ANTERIOR de todas as empresas.',
      'Salvar na pasta correspondente do ano de 2026.'
    ],
    paths: [
      { label: 'T9016 - BASE MENSAL 2026', path: '\\\\10.1.17.4\\Usuarios\\Credenciamento Medico\\NUCLEO DE AGENDAS\\RAFAEL FERNANDES\\1 - RELATORIOS\\10 - AGENDA MEDICA MENSAL\\T9016 - BASE MENSAL\\2026' }
    ],
    scripts: [],
    contingency: 'Não definido na rotina original.',
    priority: 'medium',
    responsible: 'Karine',
    estimatedTime: '20'
  },
  {
    id: 'bi-controle-agendas',
    name: 'BI Controle_Agendas',
    category: 'outras',
    schedule: ['16:00'],
    recurrence: 'Manual · ~16h',
    objective: 'Consolidar e unificar planilhas mensais compartilhadas pelo link.',
    instructions: [
      'Baixar as planilhas do mês: AGENDA_<MES>_<ANO>.xlsx, AGENDA_<MES>_RJ_SP_<ANO>.xlsx, AGENDA_MEDPREV_<MES>_<ANO>.xlsx e AGENDA_VS_<MES>_<ANO>.xlsx.',
      'Salvar na pasta correspondente.',
      'No início do mês, ajustar variáveis no script unificar_agendas.py.',
      'Rodar unificar_agendas.py.',
      'Atualizar o BI e publicar.',
      'O script salva automaticamente históricos nos dias úteis 1, 5 e 10.'
    ],
    paths: [
      { label: '9 - BASE COMPRA', path: '\\\\10.1.17.4\\Usuarios\\Credenciamento Medico\\NUCLEO DE AGENDAS\\RAFAEL FERNANDES\\9 - BASE COMPRA\\BASES ORIGINAIS' }
    ],
    scripts: ['unificar_agendas.py'],
    contingency: 'Garantir que os nomes dos arquivos recebidos estejam padronizados e sem espaços extras.',
    priority: 'high',
    responsible: 'Karine',
    estimatedTime: '15'
  },
  {
    id: 'bi-captacao-agendas',
    name: 'BI Captação de Agendas',
    category: 'outras',
    schedule: ['17:00'],
    recurrence: 'Manual · ~17h',
    objective: 'Carregar agendas ativas diárias no Oracle e atualizar a base de monitoramento.',
    instructions: [
      'Baixar a cópia diária do Excel Online (agendas ativas).',
      'Rodar 04_CONSOLIDACAO_STATUS.py (grava AGENDA.xlsx).',
      'Rodar 01_CARGA_INICIAL_AGENDAS.py (insere no Oracle).',
      'Rodar 02_CARGA_MONITORAMENTO.py (calcula janela de 6 meses).',
      'Atualizar o Power BI e publicar.'
    ],
    paths: [
      { label: 'Pasta Base Compra', path: '\\\\10.1.17.4\\Usuarios\\Credenciamento Medico\\NUCLEO DE AGENDAS\\RAFAEL FERNANDES\\9 - BASE COMPRA' }
    ],
    scripts: ['04_CONSOLIDACAO_STATUS.py', '01_CARGA_INICIAL_AGENDAS.py', '02_CARGA_MONITORAMENTO.py'],
    contingency: 'Atenção: forcar_historico deve estar como False em 01_CARGA_INICIAL_AGENDAS.py no uso diário para evitar deleção completa de bases.',
    priority: 'high',
    responsible: 'Karine',
    estimatedTime: '30'
  },
  {
    id: 'listagem-medprev',
    name: 'Listagem Medprev (Quinzenal)',
    category: 'quinzenal',
    schedule: ['09:00'],
    recurrence: 'Todo dia 15',
    objective: 'Gerar o relatório nominal do Medprev para cobrança de agendas da equipe.',
    instructions: [
      'Rodar o script 03_GERACAO_LISTA_ANALISTAS_MEDPREV.py.',
      'Conferir a planilha gerada AGENDA_MEDPREV_<MÊS_ALVO>_26.xlsx.',
      'A janela de cálculo é do mês atual + 2 (ex: em 15/08 gera para Outubro).',
      'Disponibilizar o arquivo em link compartilhado com a equipe.'
    ],
    paths: [
      { label: 'Pasta de Agendas Mensais', path: '\\\\10.1.17.4\\Usuarios\\Credenciamento Medico\\NUCLEO DE AGENDAS\\RAFAEL FERNANDES\\9 - BASE COMPRA\\AGENDAS MENSAIS' }
    ],
    scripts: ['03_GERACAO_LISTA_ANALISTAS_MEDPREV.py'],
    contingency: 'Verificar variáveis STATUS_EXCLUSAO, STATUS_PADRAO_DROPDOWN e caminhos das bases de rede se houver quebra de execução.',
    priority: 'high',
    responsible: 'Karine',
    estimatedTime: '25'
  },
  {
    id: 'listagem-vs',
    name: 'Listagem VS (Quinzenal)',
    category: 'quinzenal',
    schedule: ['09:30'],
    recurrence: 'Todo dia 15',
    objective: 'Gerar o relatório nominal de Venda de Serviços para cobrança de agendas.',
    instructions: [
      'Rodar o script 03_GERACAO_LISTA_ANALISTAS_VS.py.',
      'Conferir a planilha gerada.',
      'A janela de cálculo é do mês atual + 4 (ex: em 15/08 gera para Dezembro).',
      'Puxa unidade de DIM_VS.xlsx e especialidade de DIM_ESPECIALIDADE.xlsx.',
      'Remove ~25 especialidades hardcoded em ESPECIALIDADES_EXCLUIDAS_VS.'
    ],
    paths: [
      { label: 'Bases BI VS', path: '\\\\10.1.17.4\\Usuarios\\Credenciamento Medico\\NUCLEO DE AGENDAS\\RAFAEL FERNANDES\\9 - BASE COMPRA\\BASES BI\\VS' }
    ],
    scripts: ['03_GERACAO_LISTA_ANALISTAS_VS.py'],
    contingency: 'Efetuar validação minuciosa de dados com os analistas antes de compartilhar o link final.',
    priority: 'high',
    responsible: 'Karine',
    estimatedTime: '25'
  },
  {
    id: 'lista-analistas',
    name: 'Lista Mensal para Analistas (Quinzenal)',
    category: 'quinzenal',
    schedule: ['10:00'],
    recurrence: 'Todo dia 15',
    objective: 'Gerar o arquivo Excel de captação nominal para preenchimento analistas no Oracle.',
    instructions: [
      'Rodar o script 03_GERACAO_LISTA_ANALISTAS.py informando o MES_AGENDA (AAAA-MM).',
      'Conferir a planilha AGENDA_ANALISTAS_<MES_AGENDA>.xlsx.',
      'Mover e disponibilizar no Excel Online como link preenchível.'
    ],
    paths: [
      { label: 'Agendas Mensais', path: '\\\\10.1.17.4\\Usuarios\\Credenciamento Medico\\NUCLEO DE AGENDAS\\RAFAEL FERNANDES\\9 - BASE COMPRA\\AGENDAS MENSAIS' }
    ],
    scripts: ['03_GERACAO_LISTA_ANALISTAS.py'],
    contingency: 'Validar se há necessidade de renomeação manual, uma vez que 04_CONSOLIDACAO_STATUS.py lê o arquivo com outro padrão de nome (AGENDA_NOMINAL_<MES_AGENDA>.xlsx).',
    priority: 'high',
    responsible: 'Karine',
    estimatedTime: '25'
  },
  {
    id: 'inclusao-captado',
    name: 'Inclusão de Captado',
    category: 'quinzenal',
    schedule: ['11:00'],
    recurrence: 'Sob demanda (SLA 48h)',
    objective: 'Efetuar cadastro de novos captados ou clínicas no sistema de acordo com as solicitações por e-mail.',
    instructions: [
      'Receber o e-mail de solicitação.',
      'Verificar se o captado não está na planilha DIM_CIDADE.xlsx.',
      'Se não estiver: acessar a tela T2125 no sistema corporativo, preencher as informações e atualizar a planilha.',
      'Rodar ImportarDIMCIDADE.py na pasta de scripts.',
      'Responder e-mail de confirmação ao solicitante em até 48 horas.'
    ],
    paths: [
      { label: 'Planilhas de Dimensões', path: '\\\\10.1.17.4\\Usuarios\\Credenciamento Medico\\NUCLEO DE AGENDAS\\RAFAEL FERNANDES\\13 - DIMENSOES' },
      { label: 'Scripts Python', path: '\\\\10.1.17.4\\Usuarios\\Credenciamento Medico\\NUCLEO DE AGENDAS\\RAFAEL FERNANDES\\25 - PYTHON' }
    ],
    scripts: ['ImportarDIMCIDADE.py'],
    contingency: 'Preencher rigorosamente todos os campos solicitados no Excel para evitar travamento ou erros de indexação nos scripts depuradores.',
    priority: 'medium',
    responsible: 'Karine',
    estimatedTime: '15'
  }
];