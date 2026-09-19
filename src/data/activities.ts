import { Activity } from '../types';

export const routineActivities: Activity[] = [
  {
    id: 't22aprr-alerta',
    nome: 'T22APRR / Alerta de Vagas',
    name: 'T22APRR / Alerta de Vagas', // retrocompatibilidade
    biRelacionado: 'BI Alerta de Vagas V2',
    categoria: 'BASE',
    category: 'BASE', // retrocompatibilidade
    prioridade: 'P0',
    priority: 'high', // retrocompatibilidade
    criticidade: 'CRITICA',
    frequencia: 'DIARIA',
    recurrence: 'Diária', // retrocompatibilidade
    horario: [
      '06:00', '07:50', '09:00', '10:50', '11:00', '12:50', 
      '13:00', '14:50', '15:00', '16:50', '17:00', '17:50', '18:50'
    ],
    schedule: [
      '06:00', '07:50', '09:00', '10:50', '11:00', '12:50', 
      '13:00', '14:50', '15:00', '16:50', '17:00', '17:50', '18:50'
    ], // retrocompatibilidade
    diasSemana: ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta'],
    ativo: true,
    tipoExecucao: 'SEMIAUTOMATICA',
    dependencia: ['Download automático das bases'],
    impacto: 'Impacta diretamente a detecção de vagas ociosas nas clínicas e hospitais do plano.',
    objetivo: 'Monitorar e validar a recepção das bases APRR e o processamento dos fluxos automáticos de ociosidade.',
    instrucoes: [
      'Verificar se os arquivos da T22APRR foram baixados automaticamente pela Charlene.',
      'Conferir as pastas de destino correspondentes às bases.',
      'Verificar a execução correta do fluxo APRR no agendador de tarefas nos horários mapeados.',
      'Confirmar se o painel BI recebeu os dados atualizados sem duplicidades.',
      'Se houver arquivos duplicados mais antigos, efetuar a remoção manual.',
      'Caso ocorra travamento do orquestrador, executar Pythons/Alteryx via contingência.',
      'Validar a correta atualização do BI após a limpeza das bases.'
    ],
    diretorios: [
      '\\\\10.1.17.4\\Usuarios\\Credenciamento Medico\\NUCLEO DE AGENDAS\\RAFAEL FERNANDES\\7 - BASES DE RELATORIOS\\T22APRR - DIARIA',
      '\\\\10.1.17.4\\Usuarios\\Credenciamento Medico\\NUCLEO DE AGENDAS\\RAFAEL FERNANDES\\7 - BASES DE RELATORIOS\\T22APRR_PROC - DIARIA',
      '\\\\10.1.17.4\\Usuarios\\Credenciamento Medico\\NUCLEO DE AGENDAS\\RAFAEL FERNANDES\\7 - BASES DE RELATORIOS\\T22APRR_VS - DIARIA'
    ],
    arquivos: [
      'T22APRR.xlsx',
      'T22APRR_PROC.xlsx',
      'T22APRR_VS.xlsx'
    ],
    scripts: ['Orquestrador_APRR.bat'],
    contingencia: [
      'Se houver problema de estrutura na base: renomear a coluna "Encaixe_normal" para "QTE_ENCAIXES" na coluna I, e excluir integralmente a coluna J.',
      'Não aplicar essa alteração estrutural como rotina diária; executar apenas na ocorrência de erros estruturais.'
    ],
    observacoes: [
      'A Charlene baixa as planilhas automaticamente em servidores dedicados. A ação humana primária é de auditoria de presença.',
      'Evitar processamento concorrente no Alteryx para não corromper os arquivos parquet.'
    ],
    regrasNegocio: [
      'Coluna I: Encaixe_normal -> QTE_ENCAIXES (em caso de erro de leitura)',
      'Coluna J: Excluir se o validador de colunas do Alteryx quebrar por layout.'
    ],
    condicaoSucesso: ['Presença das 3 planilhas do dia com data de modificação recente e sem linhas duplicadas.'],
    condicaoErro: ['Planilha vazia, arquivo corrompido ou layout quebrado por alteração no sistema de extração.'],
    status: 'PENDENTE',
    visibilidade: 'AGENDA'
  },
  {
    id: 'bi-alerta-vagas-v2',
    nome: 'BI Alerta de Vagas V2',
    name: 'BI Alerta de Vagas V2',
    biRelacionado: 'BI Alerta de Vagas V2',
    categoria: 'BI',
    category: 'BI',
    prioridade: 'P0',
    priority: 'high',
    criticidade: 'CRITICA',
    frequencia: 'DIARIA',
    recurrence: 'Diária',
    horario: ['06:15', '09:15', '11:15', '13:15', '15:15', '17:15'],
    schedule: ['06:15', '09:15', '11:15', '13:15', '15:15', '17:15'],
    diasSemana: ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta'],
    ativo: true,
    tipoExecucao: 'SEMIAUTOMATICA',
    dependencia: ['T22APRR / Alerta de Vagas'],
    impacto: 'Painel crítico consumido pela diretoria e gerência para liberação imediata de agendas e remanejamento.',
    objetivo: 'Manter o Power BI Service atualizado com a última posição de ociosidade das agendas.',
    instrucoes: [
      'Garantir que as bases T22APRR do horário correspondente já foram validadas.',
      'Verificar se o gateway ou agendador automático de tarefas executou o processamento do fluxo.',
      'Confirmar que os novos dados subiram corretamente no Power BI Service.',
      'Se houver problemas com o agendador automático, rodar os scripts python e fluxos alteryx manuais.',
      'Remover arquivos antigos da pasta de carga se detectada duplicidade.'
    ],
    diretorios: [
      '\\\\10.1.17.4\\Usuarios\\Credenciamento Medico\\NUCLEO DE AGENDAS\\RAFAEL FERNANDES\\7 - BASES DE RELATORIOS\\T22APRR - DIARIA'
    ],
    arquivos: ['Alerta_Vagas_v2.pbix'],
    scripts: ['Orquestrador_Alerta_Vagas.py'],
    contingency: [
      'Em caso de falha do agendador automático: abrir o Agendador de Tarefas do Windows corporativo.',
      'Localizar a tarefa "Atualizacao_Alerta_Vagas" e clicar em Executar manualmente.',
      'Se falhar na rede, rodar os scripts python locais de extração e forçar atualização manual no Power BI Desktop.'
    ],
    observacoes: ['O orquestrador automático roda as atualizações e faz o bypass se os arquivos de base não mudaram.'],
    regrasNegocio: ['Janelas de atualização indexadas com os horários de carga da Charlene.'],
    condicaoSucesso: ['Data de última atualização do BI no Power BI Service batendo com a janela horária corrente.'],
    condicaoErro: ['Gateway de dados offline ou credenciais do Oracle expiradas.'],
    status: 'PENDENTE',
    visibilidade: 'AGENDA'
  },
  {
    id: 'bi-alerta-vagas-sub',
    nome: 'BI Alerta Diário de Vagas_Sub',
    name: 'BI Alerta Diário de Vagas_Sub',
    biRelacionado: 'BI Alerta Diário de Vagas_Sub',
    categoria: 'BI',
    category: 'BI',
    prioridade: 'P0',
    priority: 'high',
    criticidade: 'CRITICA',
    frequencia: 'DIARIA',
    recurrence: 'Diária',
    horario: ['07:55', '10:55', '12:55', '14:55', '16:55', '17:55', '18:55'],
    schedule: ['07:55', '10:55', '12:55', '14:55', '16:55', '17:55', '18:55'],
    diasSemana: ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta'],
    ativo: true,
    tipoExecucao: 'CONTINGENCIA',
    dependencia: ['Agendador'],
    impacto: 'Alimentação dos dados secundários de vagas substitutas ociosas.',
    objetivo: 'Monitorar e, em caso de erro, restaurar os fluxos automáticos do Alteryx.',
    instrucoes: [
      'Esta atividade é primordialmente automática via Agendador de Tarefas do Alteryx Server.',
      'O operador deve realizar apenas o monitoramento passivo do status de atualização.',
      'NÃO executar manualmente na rotina padrão.',
      'Se o agendador de tarefas falhar: executar a contingência manual de reprocessamento.'
    ],
    diretorios: [
      '\\\\10.1.17.4\\Usuarios\\Credenciamento Medico\\NUCLEO DE AGENDAS\\RAFAEL FERNANDES\\1 - RELATORIOS\\39 - Relatorio alerta de Sub'
    ],
    arquivos: ['Alerta_Sub.pbix'],
    scripts: [
      '01_Carga_Sub_Etapa1.yxmd',
      '02_Processa_Sub_Etapa2.yxmd',
      '03_Trata_Sub_Etapa3.yxmd',
      '04_Consolida_Sub_Etapa4.yxmd'
    ],
    contingency: [
      'Abrir a pasta "39 - Relatorio alerta de Sub" no servidor corporativo.',
      'Executar manualmente os 4 fluxos Alteryx (.yxmd) rigorosamente na sequência numérica de 01 a 04.',
      'Aguardar o término completo de cada etapa antes de iniciar a subsequente para evitar concorrência de escrita no parquet.'
    ],
    observacoes: ['O diretório de contingência e os scripts devem ser manipulados com cautela devido ao volume de dados.'],
    regrasNegocio: ['Os 4 arquivos do Alteryx devem obrigatoriamente rodar de forma síncrona/sequencial.'],
    condicaoSucesso: ['Carga dos dados gerada na tabela de destino e parquet atualizado.'],
    condicaoErro: ['Erro de trava de arquivo (lock de escrita do parquet) ou falha no disco de rede.'],
    status: 'PENDENTE',
    visibilidade: 'CONTINGENCIA'
  },
  {
    id: 'bi-alerta-vagas-telesaude',
    nome: 'BI Alerta Vagas TeleSaúde',
    name: 'BI Alerta Vagas TeleSaúde',
    biRelacionado: 'BI Alerta Vagas TeleSaúde',
    categoria: 'BI',
    category: 'BI',
    prioridade: 'P0',
    priority: 'high',
    criticidade: 'CRITICA',
    frequencia: 'DIARIA',
    recurrence: 'A cada 2 horas',
    horario: ['08:00', '10:00', '12:00', '14:00', '16:00'],
    schedule: ['08:00', '10:00', '12:00', '14:00', '16:00'],
    diasSemana: ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta'],
    ativo: true,
    tipoExecucao: 'SEMIAUTOMATICA',
    dependencia: ['FATO_ATUAL'],
    impacto: 'Impacta o agendamento de consultas virtuais de todo o sistema de telemedicina do grupo.',
    objetivo: 'Consolidar as vagas disponíveis no módulo de TeleSaúde do plano.',
    instrucoes: [
      'O Bob executa a query de extração no banco de hora em hora automaticamente.',
      'Verificar se o arquivo "FATO_ATUAL" foi gerado na pasta FATO.',
      'Abrir o painel Power BI Desktop correspondente ao Telesaúde.',
      'Atualizar o arquivo PBIX oficial e publicar no Workspace corporativo.'
    ],
    diretorios: [
      '\\\\10.1.17.4\\Usuarios\\Credenciamento Medico\\NUCLEO DE AGENDAS\\RAFAEL FERNANDES\\1 - RELATORIOS\\47 - BI_TELESSAUDE\\FATO',
      'G:\\Credenciamento Medico\\NUCLEO DE AGENDAS\\RAFAEL FERNANDES\\3 - ATUALIZAÇÃO PBIX\\PBIX OFICIAL',
      '\\\\10.1.17.4\\Usuarios\\Credenciamento Medico\\NUCLEO DE AGENDAS\\RAFAEL FERNANDES\\25 - PYTHON\\BI_TELESAUDE\\BI_Telesaude'
    ],
    arquivos: ['Telesaude_Vagas.pbix', 'FATO_ATUAL.csv'],
    scripts: ['FLUXO_BI_TELESAUDE.py'],
    contingency: [
      'Caso a consulta automática falhe ou a base não atualize, acessar a pasta do script Python.',
      'Executar manualmente o script "FLUXO_BI_TELESAUDE.py".',
      'Verificar se o CSV de fato foi atualizado antes de forçar a carga no PBIX.'
    ],
    observacoes: [
      'Na virada do mês existe uma regra estrita de alteração de janela histórica.',
      'A regra de virada não deve aparecer na rotina de controle diária padrão.'
    ],
    regrasNegocio: [
      'A query padrão utiliza uma janela histórica dinâmica de fotos dos últimos 6 meses.'
    ],
    condicaoSucesso: ['Dados consolidados no PBIX oficial com a data de referência atualizada.'],
    condicaoErro: ['Erro de login ou timeout na execução da query SQL no Oracle corporativo.'],
    status: 'PENDENTE',
    visibilidade: 'AGENDA'
  },
  {
    id: 'base-t9075',
    nome: 'T9075 (Atraso Médico)',
    name: 'T9075 (Atraso Médico)',
    biRelacionado: 'BI Painel dos Médicos',
    categoria: 'BASE',
    category: 'BASE',
    prioridade: 'P3',
    priority: 'low',
    criticidade: 'BAIXA',
    frequencia: 'DIARIA',
    recurrence: 'Diária',
    horario: ['08:00'],
    schedule: ['08:00'],
    diasSemana: ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta'],
    ativo: true,
    tipoExecucao: 'AUTOMATICA',
    dependencia: [],
    impacto: 'Alimenta a base histórica de atraso do BI Atraso dos Médicos.',
    objetivo: 'Assegurar que a planilha T9075 diária de atraso dos médicos foi baixada pela Charlene.',
    instrucoes: [
      'Abrir o diretório anual de 2026 correspondente ao processo T9075.',
      'Verificar se o arquivo da data de hoje foi gerado com sucesso pela Charlene.',
      'Marcar a tarefa como concluída se o arquivo estiver íntegro.'
    ],
    diretorios: [
      '\\\\10.1.17.4\\Usuarios\\Credenciamento Medico\\NUCLEO DE AGENDAS\\RAFAEL FERNANDES\\7 - BASES DE RELATORIOS\\BASE_PAINEL DOS MEDICOS\\BASE_ATRASO MEDICO\\2026'
    ],
    arquivos: ['T9075.xlsx'],
    scripts: [],
    contingency: [
      'Caso a Charlene não tenha baixado ou o arquivo esteja quebrado, acioná-la ou solicitar exportação direta do sistema corporativo.'
    ],
    observacoes: ['Esta base é de controle automático, sendo a Karine responsável apenas por auditar.'],
    regrasNegocio: ['Mapeada sob o diretório do painel dos médicos.'],
    condicaoSucesso: ['Arquivo T9075 com timestamp de criação correspondente ao dia de hoje.'],
    condicaoErro: ['Ausência do arquivo na pasta após as 08:30.'],
    status: 'PENDENTE',
    visibilidade: 'AGENDA'
  },
  {
    id: 'base-t9033',
    nome: 'T9033 (Horas Médicos)',
    name: 'T9033 (Horas Médicos)',
    biRelacionado: 'BI Painel dos Médicos',
    categoria: 'BASE',
    category: 'BASE',
    prioridade: 'P3',
    priority: 'low',
    criticidade: 'BAIXA',
    frequencia: 'DIARIA',
    recurrence: 'Diária',
    horario: ['08:00'],
    schedule: ['08:00'],
    diasSemana: ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta'],
    ativo: true,
    tipoExecucao: 'AUTOMATICA',
    dependencia: [],
    impacto: 'Alimenta as horas produtivas semanais para o BI Painel dos Médicos.',
    objetivo: 'Validar a extração correta das horas médicas acumuladas.',
    instrucoes: [
      'Conferir a pasta de destino anual de 2026 da T9033.',
      'Verificar se o arquivo com as cargas de horas foi baixado corretamente pela automação da Charlene.'
    ],
    diretorios: [
      '\\\\10.1.17.4\\Usuarios\\Credenciamento Medico\\NUCLEO DE AGENDAS\\RAFAEL FERNANDES\\7 - BASES DE RELATORIOS\\BASE_PAINEL DOS MEDICOS\\BASE HORAS MEDICOS\\2026'
    ],
    arquivos: ['T9033.xlsx'],
    scripts: [],
    contingency: ['Solicitar carga emergencial ou exportação individual se o processador estiver offline.'],
    observacoes: ['Indispensável para o fechamento matutino do Painel dos Médicos.'],
    regrasNegocio: ['Alimenta as dependências de faturamento e horas contratadas.'],
    condicaoSucesso: ['Arquivo presente e estruturado.'],
    condicaoErro: ['Arquivo com tamanho zerado (0 KB) ou corrompido.'],
    status: 'PENDENTE',
    visibilidade: 'AGENDA'
  },
  {
    id: 'base-t22j3',
    nome: 'T22J3 (Base Diária)',
    name: 'T22J3 (Base Diária)',
    biRelacionado: 'BI Painel dos Médicos',
    categoria: 'BASE',
    category: 'BASE',
    prioridade: 'P3',
    priority: 'low',
    criticidade: 'BAIXA',
    frequencia: 'DIARIA',
    recurrence: 'Diária',
    horario: ['08:00'],
    schedule: ['08:00'],
    diasSemana: ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta'],
    ativo: true,
    tipoExecucao: 'AUTOMATICA',
    dependencia: [],
    impacto: 'Componente da base de atendimentos diários do Painel dos Médicos.',
    objetivo: 'Monitorar a exportação diária dos atendimentos e faltas.',
    instrucoes: [
      'Auditar o diretório anual da T22J3 no servidor.',
      'Confirmar que a planilha do dia de hoje foi exportada sem anomalias.'
    ],
    diretorios: [
      '\\\\10.1.17.4\\Usuarios\\Credenciamento Medico\\NUCLEO DE AGENDAS\\RAFAEL FERNANDES\\7 - BASES DE RELATORIOS\\T22J3 - BASE DIARIA\\2026'
    ],
    arquivos: ['T22J3.xlsx'],
    scripts: [],
    contingency: ['Efetuar download manual das bases caso a rotina automática da Charlene apresente atraso.'],
    observacoes: ['Esta base é consumida diretamente pelos fluxos Alteryx do Painel dos Médicos.'],
    regrasNegocio: ['Dados consolidados de faltas, agendas ocupadas e cancelamentos.'],
    condicaoSucesso: ['Planilha de dados gerada e salva com sucesso.'],
    condicaoErro: ['Timestamp da planilha desatualizado no diretório.'],
    status: 'PENDENTE',
    visibilidade: 'AGENDA'
  },
  {
    id: 'base-marcacao-falta-espera',
    nome: 'Base Marcação Falta Espera',
    name: 'Base Marcação Falta Espera',
    biRelacionado: 'BI Painel dos Médicos',
    categoria: 'BASE',
    category: 'BASE',
    prioridade: 'P1',
    priority: 'high',
    criticidade: 'ALTA',
    frequencia: 'DIARIA',
    recurrence: 'Diária',
    horario: ['09:15'],
    schedule: ['09:15'],
    diasSemana: ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta'],
    ativo: true,
    tipoExecucao: 'MANUAL',
    dependencia: [],
    impacto: 'Bloqueio crítico para o Painel dos Médicos. Se quebrar, inviabiliza as estatísticas de ociosidade do dia.',
    objetivo: 'Gerar consolidado anual de faltas, esperas e marcações de exames e consultas.',
    instrucoes: [
      'Navegar até a pasta de scripts do Python correspondente.',
      'Executar o primeiro script "1.CriacaoBaseMarcacaoEsperaFaltas.py" e aguardar o encerramento.',
      'Executar o segundo script "2.CriarArquivoAnual.py" que faz o append histórico.',
      'Confirmar a correta geração da base consolidada.',
      'Esta atividade deve obrigatoriamente estar concluída antes de rodar o Alteryx do Painel dos Médicos.'
    ],
    diretorios: [
      '\\\\10.1.17.4\\Usuarios\\Credenciamento Medico\\NUCLEO DE AGENDAS\\RAFAEL FERNANDES\\25 - PYTHON\\BASE MARCACAO FALTA ESPERA'
    ],
    arquivos: ['MarcacaoEsperaFaltas.xlsx', 'FaltasEsperaAnual.parquet'],
    scripts: ['CriacaoBaseMarcacaoEsperaFaltas.py', 'CriarArquivoAnual.py'],
    contingency: [
      'Se falhar a execução de algum script Python, verificar logs do terminal.',
      'Confirmar se não há nenhuma planilha aberta em rede bloqueando a escrita dos pacotes pandas/openpyxl.',
      'Reiniciar a execução local no VS Code corporativo se houver problema com o ambiente virtual.'
    ],
    observacoes: ['A dependência do término desta rotina deve ser estritamente observada pelo orquestrador.'],
    regrasNegocio: ['Filtra e limpa registros de espera duplicados no banco de dados Oracle.'],
    condicaoSucesso: ['Arquivo anual consolidado gerado sem erros e liberado para o Alteryx.'],
    condicaoErro: ['Processo interrompido com erro de memória ou permissão de escrita de rede.'],
    status: 'PENDENTE',
    visibilidade: 'AGENDA'
  },
  {
    id: 'bi-painel-medicos',
    nome: 'BI Painel dos Médicos',
    name: 'BI Painel dos Médicos',
    biRelacionado: 'BI Painel dos Médicos',
    categoria: 'BI',
    category: 'BI',
    prioridade: 'P1',
    priority: 'high',
    criticidade: 'ALTA',
    frequencia: 'DIARIA',
    recurrence: 'Diária às 10:00',
    horario: ['10:00'],
    schedule: ['10:00'],
    diasSemana: ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta'],
    ativo: true,
    tipoExecucao: 'MANUAL',
    dependencia: ['T9033 (Horas Médicos)', 'T22J3 (Base Diária)', 'Base Marcação Falta Espera'],
    impacto: 'Alimenta os indicadores de produtividade médica de todas as operadoras do grupo.',
    objetivo: 'Gerar os arquivos consolidados e atualizar os dados históricos de atendimento dos médicos.',
    instrucoes: [
      'Validar que T9033 e T22J3 foram recebidas na pasta 2026.',
      'Abrir o arquivo Excel da base de Produtividade DGE.',
      'Remover obrigatoriamente a coluna "Meta Tipo" da planilha antes do processamento.',
      'Verificar o status da atividade "Base Marcação Falta Espera" (deve estar como CONCLUÍDA).',
      'Executar no Alteryx o fluxo "01 - CONSOLIDAÇÃO BASE_T9033.yxmd".',
      'Executar o segundo fluxo Alteryx "02 - PROJETO_PAINEL DOS MEDICOS_V3.yxmd".',
      'Aguardar o gateway automático que processa e atualiza o conjunto de dados em produção às 10:30.'
    ],
    diretorios: [
      '\\\\10.1.17.4\\Usuarios\\Credenciamento Medico\\NUCLEO DE AGENDAS\\RAFAEL FERNANDES\\1 - RELATORIOS\\27 - PAINEL DOS MEDICOS'
    ],
    arquivos: ['DGE_Produtividade.xlsx', 'Painel_Medicos_V3.pbix'],
    scripts: ['01 - CONSOLIDAÇÃO BASE_T9033.yxmd', '02 - PROJETO_PAINEL DOS MEDICOS_V3.yxmd'],
    contingency: [
      'Se o Alteryx travar por falta de memória ou as bases em rede falharem, copiar as bases localmente e direcionar as rotas no designer do Alteryx.',
      'Se o gateway das 10:30 falhar, forçar a atualização direta no Workspace do Power BI Service na web.'
    ],
    observacoes: ['O sistema deve emitir um alerta impeditivo visual se a Base de Marcação não estiver finalizada.'],
    regrasNegocio: [
      'Exclusão obrigatória da coluna "Meta Tipo" na base de Produtividade DGE antes da consolidação.'
    ],
    condicaoSucesso: ['Fluxos Alteryx rodados com sucesso e dados publicados no gateway das 10:30.'],
    condicaoErro: ['Erro de tipo de dados decorrente de colunas extras ou não tratadas no Alteryx.'],
    status: 'PENDENTE',
    visibilidade: 'AGENDA'
  },
  {
    id: 'base-t22j2',
    nome: 'T22J2 / Consultas Disponibilizadas',
    name: 'T22J2 / Consultas Disponibilizadas',
    biRelacionado: 'BI Relatório de Consultas Disponibilizadas v2',
    categoria: 'BASE',
    category: 'BASE',
    prioridade: 'P1',
    priority: 'high',
    criticidade: 'ALTA',
    frequencia: 'DIARIA',
    recurrence: 'Diária às 13:00',
    horario: ['13:00'],
    schedule: ['13:00'],
    diasSemana: ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta'],
    ativo: true,
    tipoExecucao: 'MANUAL',
    dependencia: [],
    impacto: 'Base estrutural para a projeção de consultas e agendas abertas de médio prazo.',
    objetivo: 'Exportar e baixar os arquivos da T22J2 do sistema para alimentação do painel de consultas.',
    instrucoes: [
      'Acessar o sistema corporativo de extrações.',
      'Exportar a T22J2 contemplando o mês atual, o mês seguinte e o mês subsequente.',
      'Salvar as exportações estruturadas por empresa no diretório anual de 2026.'
    ],
    diretorios: [
      '\\\\10.1.17.4\\Usuarios\\Credenciamento Medico\\NUCLEO DE AGENDAS\\RAFAEL FERNANDES\\7 - BASES DE RELATORIOS\\T22J2 - BASE MENSAL\\2026'
    ],
    arquivos: ['T22J2_Mes_Atual.xlsx', 'T22J2_Mes_Seguinte.xlsx', 'T22J2_Mes_Subsequente.xlsx'],
    scripts: [],
    contingency: [
      'Caso ocorra lentidão na exportação total, fracionar a exportação por operadora ou empresa de saúde diretamente no painel.'
    ],
    observacoes: ['O download destas bases é manual e depende de ação diária da Karine.'],
    regrasNegocio: ['Contempla rigorosamente a janela móvel de 3 meses de oferta.'],
    condicaoSucesso: ['Os 3 arquivos gerados e salvos com os dados de agendamento na pasta de 2026.'],
    condicaoErro: ['Falha ou timeout na conexão com o sistema de exportação.'],
    status: 'PENDENTE',
    visibilidade: 'AGENDA'
  },
  {
    id: 'bi-consultas-disponibilizadas',
    nome: 'BI Relatório de Consultas Disponibilizadas v2',
    name: 'BI Relatório de Consultas Disponibilizadas v2',
    biRelacionado: 'BI Relatório de Consultas Disponibilizadas v2',
    categoria: 'BI',
    category: 'BI',
    prioridade: 'P1',
    priority: 'high',
    criticidade: 'ALTA',
    frequencia: 'DIARIA',
    recurrence: 'Diária às 13:15',
    horario: ['13:15'],
    schedule: ['13:15'],
    diasSemana: ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta'],
    ativo: true,
    tipoExecucao: 'MANUAL',
    dependencia: ['T22J2 / Consultas Disponibilizadas'],
    impacto: 'Painel consumido para análise de oferta médica em relação à demanda reprimida.',
    objetivo: 'Executar o pipeline de padronização, consolidação e atualização das consultas disponibilizadas.',
    instrucoes: [
      'Verificar se as 3 planilhas da T22J2 foram salvas no diretório anual.',
      'Abrir o terminal ou ferramenta Python.',
      'Executar o pipeline sequencial de 3 etapas:',
      '  1. Rodar "01_FLUXO_UNIFICAR_E_PADRONIZAR_BASES.py" para sanitização.',
      '  2. Rodar "02_FLUXO_CONSOLIDAR_BASES_DISPONIBILIZADAS.py" para agrupamento histórico.',
      '  3. Rodar "03_IMPORTA_BANCO.py" para upload no banco Oracle.',
      'Após o pipeline, abrir o PBIX do painel, atualizar e publicar no workspace.'
    ],
    diretorios: [
      '\\\\10.1.17.4\\Usuarios\\Credenciamento Medico\\NUCLEO DE AGENDAS\\RAFAEL FERNANDES\\1 - RELATORIOS\\37 - RELATORIO DE CONSULTAS DISPONIBILIZADAS V2'
    ],
    arquivos: ['Consultas_Disponibilizadas_v2.pbix'],
    scripts: [
      '01_FLUXO_UNIFICAR_E_PADRONIZAR_BASES.py',
      '02_FLUXO_CONSOLIDAR_BASES_DISPONIBILIZADAS.py',
      '03_IMPORTA_BANCO.py'
    ],
    contingency: [
      'Verificar a formatação das colunas de data e CPF se o script 01 reportar exceção.',
      'Em caso de travamento no banco Oracle (script 03), auditar a conexão local e certificar que não há bloqueio de credenciais.'
    ],
    observacoes: ['O pipeline deve ser tratado como um processo coeso de 3 fases pelo dashboard.'],
    regrasNegocio: ['Estrutura unificada de 5 empresas com campos de data normalizados.'],
    condicaoSucesso: ['Dados atualizados no painel e publicados com sucesso.'],
    condicaoErro: ['Erro de parse de datas em arquivos com formatação inconsistente.'],
    status: 'PENDENTE',
    visibilidade: 'AGENDA'
  },
  {
    id: 'bi-controle-agendas',
    nome: 'BI Controle_Agendas',
    name: 'BI Controle_Agendas',
    biRelacionado: 'BI Controle_Agendas',
    categoria: 'BI',
    category: 'BI',
    prioridade: 'P1',
    priority: 'high',
    criticidade: 'ALTA',
    frequencia: 'DIARIA',
    recurrence: 'Diária às 16:00',
    horario: ['16:00'],
    schedule: ['16:00'],
    diasSemana: ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta'],
    ativo: true,
    tipoExecucao: 'MANUAL',
    dependencia: [],
    impacto: 'Painel corporativo de controle de agendas ociosas e metas de captação.',
    objetivo: 'Consolidar as planilhas de agendas recebidas por links compartilhados dos analistas.',
    instrucoes: [
      'Garantir a presença dos seguintes arquivos recebidos:',
      '  - AGENDA_<MES>_<ANO>.xlsx',
      '  - AGENDA_<MES>_RJ_SP_<ANO>.xlsx',
      '  - AGENDA_MEDPREV_<MES>_<ANO>.xlsx (Gerada na quinzenal)',
      '  - AGENDA_VS_<MES>_<ANO>.xlsx (Gerada na quinzenal)',
      'Salvar as planilhas na pasta "BASES ORIGINIAS" estruturada por ano e mês.',
      'No início de cada mês, abrir o script "unificar_agendas.py" e ajustar as variáveis MES_NOME, MES_NUM, ANO.',
      'Executar o script "unificar_agendas.py".',
      'Atualizar o Power BI Desktop correspondente e publicar no workspace.'
    ],
    diretorios: [
      '...\\9 - BASE COMPRA\\BASES ORIGINAIS\\<ANO>\\<MM - MES>'
    ],
    arquivos: [
      'unificar_agendas.py'
    ],
    scripts: ['unificar_agendas.py'],
    contingency: [
      'Garantir que os nomes dos arquivos recebidos estejam padronizados, sem caracteres especiais ou espaços.',
      'Se o script quebrar, verificar se as planilhas estão no formato .xlsx correto e não corrompidas.'
    ],
    observacoes: [
      'O script salva automaticamente históricos e cortes de fotos de controle nos dias úteis 1, 5 e 10.',
      'Não é necessário criar tarefas manuais adicionais nesses marcos.'
    ],
    regrasNegocio: [
      'A unificação ignora cabeçalhos vazios e padroniza as colunas de data e analistas.'
    ],
    condicaoSucesso: ['Atualização e publicação do BI concluídas sem travamentos de escrita.'],
    condicaoErro: ['Estrutura de colunas alterada por algum analista quebrando a consolidação.'],
    status: 'PENDENTE',
    visibilidade: 'AGENDA'
  },
  {
    id: 'bi-captacao-agendas',
    nome: 'BI Captação de Agendas',
    name: 'BI Captação de Agendas',
    biRelacionado: 'BI Captação de Agendas',
    categoria: 'BI',
    category: 'BI',
    prioridade: 'P1',
    priority: 'high',
    criticidade: 'ALTA',
    frequencia: 'DIARIA',
    recurrence: 'Diária às 17:00',
    horario: ['17:00'],
    schedule: ['17:00'],
    diasSemana: ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta'],
    ativo: true,
    tipoExecucao: 'MANUAL',
    dependencia: [],
    impacto: 'Controla a meta individual de captação de consultas em relação à meta mensal estipulada.',
    objetivo: 'Processar e subir as agendas ativas no Oracle corporativo para atualização do painel de monitoramento.',
    instrucoes: [
      'Baixar a planilha do Excel Online (Agendas Ativas).',
      'Executar o primeiro script "04_CONSOLIDACAO_STATUS.py" para gerar a planilha AGENDA.xlsx.',
      'Executar o segundo script "01_CARGA_INICIAL_AGENDAS.py" (grava os dados no Oracle).',
      'Executar o terceiro script "02_CARGA_MONITORAMENTO.py" (atualiza a fCaptação calculando a janela de 6 meses).',
      'Atualizar o Power BI Desktop correspondente e publicar no workspace.',
      'Nota: Todos os scripts solicitam "MES_AGENDA" (formato AAAA-MM) via prompt.'
    ],
    diretorios: [
      '...\\9 - BASE COMPRA'
    ],
    arquivos: ['AGENDA.xlsx', '04_CONSOLIDACAO_STATUS.py', '01_CARGA_INICIAL_AGENDAS.py', '02_CARGA_MONITORAMENTO.py'],
    scripts: ['04_CONSOLIDACAO_STATUS.py', '01_CARGA_INICIAL_AGENDAS.py', '02_CARGA_MONITORAMENTO.py'],
    contingency: [
      'ATENÇÃO CRÍTICA: Manter sempre a variável "forcar_historico = False" no script 01.',
      'Definir como True apenas se for solicitado reprocessamento completo histórico (isso deleta a base ativa e reconstrói).',
      'Se houver timeout no Oracle, reiniciar a conexão e tentar em horário de menor tráfego.'
    ],
    observacoes: ['A flag forcar_historico deve ser mantida como FALSE na rotina padrão.'],
    regrasNegocio: [
      'O script 02 calcula uma janela móvel de 6 meses para as estatísticas de captação.'
    ],
    condicaoSucesso: ['Publicação do BI efetuada com sucesso com dados históricos preservados.'],
    condicaoErro: ['Flag forcar_historico ativada por engano ou falha de conexão na tabela de captação.'],
    status: 'PENDENTE',
    visibilidade: 'AGENDA'
  },
  {
    id: 'ronda-relatorios',
    nome: 'Ronda nos Relatórios Automáticos',
    name: 'Ronda nos Relatórios Automáticos',
    biRelacionado: 'Múltiplos',
    categoria: 'LOG',
    category: 'LOG',
    prioridade: 'P2',
    priority: 'medium',
    criticidade: 'MEDIA',
    frequencia: 'DIARIA',
    recurrence: 'Diária às 08:15',
    horario: ['08:15'],
    schedule: ['08:15'],
    diasSemana: ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta'],
    ativo: true,
    tipoExecucao: 'AUTOMATICA',
    dependencia: [],
    impacto: 'Garante o funcionamento preventivo dos relatórios sem desperdício de tempo operacional.',
    objetivo: 'Fazer auditoria preventiva para checar se os relatórios automáticos rodaram normalmente.',
    instrucoes: [
      'Fazer ronda visual nos painéis automáticos.',
      'Confirmar que as datas de carga e integridade dos painéis estão corretas.',
      'Não realizar ações manuais pesadas a menos que uma falha seja detectada.',
      'O sistema exibirá a pergunta: "O processo automático ocorreu corretamente?"'
    ],
    diretorios: ['NAO_DOCUMENTADO_NO_HTML'],
    arquivos: [],
    scripts: [],
    contingency: [
      'Em caso de falha de atualização de algum BI automático, acionar suporte de TI corporativo ou o reprocessador dedicado de contingência.'
    ],
    observacoes: ['Visa evitar reprocessamentos manuais desnecessários.'],
    regrasNegocio: ['Evita duplicação de esforço manual.'],
    condicaoSucesso: ['Todos os relatórios confirmados com datas de carga corretas.'],
    condicaoErro: ['Um ou mais painéis apresentando dados desatualizados.'],
    status: 'PENDENTE',
    visibilidade: 'AGENDA'
  },
  {
    id: 'logs-projetos',
    nome: 'Logs Projetos',
    name: 'Logs Projetos (Pasta 52)',
    biRelacionado: 'Múltiplos',
    categoria: 'LOG',
    category: 'LOG',
    prioridade: 'P2',
    priority: 'medium',
    criticidade: 'MEDIA',
    frequencia: 'DIARIA',
    recurrence: 'Diária às 08:30',
    horario: ['08:30'],
    schedule: ['08:30'],
    diasSemana: ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta'],
    ativo: true,
    tipoExecucao: 'AUTOMATICA',
    dependencia: [],
    impacto: 'Informa se os robôs de atualização falharam na retaguarda.',
    objetivo: 'Inspecionar a pasta 52 de logs automáticos e acionar contingências se houver falhas.',
    instrucoes: [
      'Acessar o diretório de LOGS PROJETOS no servidor corporativo.',
      'Verificar o arquivo de log para cada um dos 5 fluxos:',
      '  - log_Script_Tabela_Captados_Fora_Alerta (Exceção: sempre dá erro, pode ignorar/exceção documentada)',
      '  - log_execucao_consultas_em_transferencia',
      '  - log_execucao_relatorio_de_cancelamento',
      '  - log_relatorio_mensageria',
      '  - log_monitoramento_marcacao_ans',
      'Se algum log acusar erro ou não for gerado, acionar a respectiva atividade de contingência!'
    ],
    diretorios: [
      '\\\\10.1.17.4\\Usuarios\\Credenciamento Medico\\NUCLEO DE AGENDAS\\RAFAEL FERNANDES\\1 - RELATORIOS\\52 - LOGS PROJETOS'
    ],
    arquivos: [
      'log_Script_Tabela_Captados_Fora_Alerta.txt',
      'log_execucao_consultas_em_transferencia.txt',
      'log_execucao_relatorio_de_cancelamento.txt',
      'log_relatorio_mensageria.txt',
      'log_monitoramento_marcacao_ans.txt'
    ],
    scripts: [],
    contingency: [
      'Se log_execucao_consultas_em_transferencia falhar: executar a contingência de Consultas em Transferência.',
      'Se log_execucao_relatorio_de_cancelamento falhar: rodar o JOB_CANCELAMENTO pelo python CancelamentoDiario.py.',
      'Se log_relatorio_mensageria falhar: acionar a contingência de Mensageria.',
      'Se log_monitoramento_marcacao_ans falhar: reexecutar script manual e republicar.'
    ],
    observacoes: [
      'O log_Script_Tabela_Captados_Fora_Alerta pode ser marcado como IGNORAR / EXCEÇÃO DOCUMENTADA pois ele sempre gerará falso erro (processo já automatizado).'
    ],
    regrasNegocio: ['Identificação preemptiva de quebra nos fluxos automáticos.'],
    condicaoSucesso: ['Todos os logs auditados com sucesso e rotinas automáticas de retaguarda saudáveis.'],
    condicaoErro: ['Um ou mais logs contendo traços de erro de banco ou rede.'],
    status: 'PENDENTE',
    visibilidade: 'AGENDA'
  },
  {
    id: 'bi-atraso-medicos',
    nome: 'BI Atraso dos Médicos',
    name: 'BI Relatório Atraso dos Médicos (3.3)',
    biRelacionado: 'BI Atraso dos Médicos',
    categoria: 'BI',
    category: 'BI',
    prioridade: 'P2',
    priority: 'medium',
    criticidade: 'MEDIA',
    frequencia: 'DIARIA',
    recurrence: 'Automático às 10:00',
    horario: ['10:00'],
    schedule: ['10:00'],
    diasSemana: ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta'],
    ativo: true,
    tipoExecucao: 'AUTOMATICA',
    dependencia: ['T9075 (Atraso Médico)'],
    impacto: 'Usado para reportar a assiduidade e atrasos da equipe médica de plantão.',
    objetivo: 'Verificar a atualização automática do painel de atrasos.',
    instrucoes: [
      'Esta atividade é automática via gateway.',
      'Auditar que a Charlene salvou a base T9075.',
      'A automação do Bob roda os tratamentos às 09:30.',
      'Checar se o gateway atualizou o painel normalmente às 10:00.',
      'Se tudo correu bem, apenas marcar como auditado.'
    ],
    diretorios: ['NAO_DOCUMENTADO_NO_HTML'],
    arquivos: [],
    scripts: ['1-TRATAMENTO BASE.py', '2-CRIAR FATO E DIMENSAO.py'],
    contingency: [
      'Se houver quebra na automação: acessar o diretório, rodar manualmente os scripts "1-TRATAMENTO BASE.py" e "2-CRIAR FATO E DIMENSAO.py" e subir as bases.'
    ],
    observacoes: ['Preservar como AUTOMÁTICA com monitoramento passivo.'],
    regrasNegocio: ['Indexação e relacionamento histórico de atrasos dos médicos.'],
    condicaoSucesso: ['Dados consolidados e refletidos no painel às 10:00.'],
    condicaoErro: ['Ausência da base T9075 ou falha na rotina do Bob.'],
    status: 'PENDENTE',
    visibilidade: 'AGENDA'
  },
  {
    id: 'bi-cirurgias',
    nome: 'BI Relatório de Cirurgias',
    name: 'BI Relatório de Cirurgias',
    biRelacionado: 'BI Relatório de Cirurgias',
    categoria: 'BI',
    category: 'BI',
    prioridade: 'P2',
    priority: 'medium',
    criticidade: 'MEDIA',
    frequencia: 'DIARIA',
    recurrence: 'Manual às 09:00',
    horario: ['09:00'],
    schedule: ['09:00'],
    diasSemana: ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta'],
    ativo: true,
    tipoExecucao: 'MANUAL',
    dependencia: [],
    impacto: 'Alimenta o acompanhamento de produtividade de salas cirúrgicas e blocos ociosos.',
    objetivo: 'Atualizar manualmente o relatório consolidado de cirurgias.',
    instrucoes: [
      'Verificar o recebimento das bases cirúrgicas do dia anterior.',
      'Efetuar a atualização manual das planilhas cirúrgicas.',
      'Forçar a atualização do PBIX correspondente e publicar.'
    ],
    diretorios: ['NAO_DOCUMENTADO_NO_HTML'],
    arquivos: [],
    scripts: [],
    contingency: ['Solicitar dados residuais de cirurgia ao time de faturamento se houver divergência.'],
    observacoes: ['Esta atividade manual ocorre normalmente no período da manhã.'],
    regrasNegocio: ['Dados de ocupação de centro cirúrgico do grupo.'],
    condicaoSucesso: ['BI cirúrgico publicado e conciliado com faturamento.'],
    condicaoErro: ['Indisponibilidade do banco de dados cirúrgico.'],
    status: 'PENDENTE',
    visibilidade: 'AGENDA'
  },
  {
    id: 'bi-consultas-transferencia',
    nome: 'BI Relatório de Consultas em Transferência',
    name: 'BI Relatório de Consultas em Transferência',
    biRelacionado: 'BI Relatório de Consultas em Transferência',
    categoria: 'BI',
    category: 'BI',
    prioridade: 'P2',
    priority: 'medium',
    criticidade: 'MEDIA',
    frequencia: 'DIARIA',
    recurrence: 'Automático às 09:00',
    horario: ['09:00'],
    schedule: ['09:00'],
    diasSemana: ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta'],
    ativo: true,
    tipoExecucao: 'CONTINGENCIA',
    dependencia: [],
    impacto: 'Controla a transferência ativa de pacientes cujos médicos cancelaram agendas repentinamente.',
    objetivo: 'Auditar a atualização automática do painel. Acionar contingência se o log indicar erro.',
    instrucoes: [
      'Esta atividade roda de forma automática às 09:00.',
      'O operador deve apenas checar se o log de transferência foi gerado sem erros na pasta 52.',
      'Se o log indicar erro ou não existir, o operador deve intervir acionando a contingência manual.'
    ],
    diretorios: [
      '\\\\10.1.17.4\\Usuarios\\Credenciamento Medico\\NUCLEO DE AGENDAS\\RAFAEL FERNANDES\\1 - RELATORIOS\\42 - RELATORIO DE CONSULTAS EM TRANSFERENCIA'
    ],
    arquivos: ['Consultas_Transferência.pbix'],
    scripts: ['01.FluxoDiarioTransf.py', '02.UnificarMensalTransf.py', '03.FATO E DIMENSAO.yxmd'],
    contingency: [
      'Caso ocorra erro na execução automática:',
      '  1. Abrir o console Python e rodar "01.FluxoDiarioTransf.py".',
      '  2. Rodar o segundo script "02.UnificarMensalTransf.py".',
      '  3. Executar o fluxo do Alteryx "03.FATO E DIMENSAO.yxmd".',
      '  4. Abrir o Power BI correspondente, atualizar e publicar.'
    ],
    observacoes: ['A contingência só deve ser exibida ao usuário sob demanda ou sob condição de falha.'],
    regrasNegocio: ['Consolidação de agendas desmarcadas com remarcação pendente.'],
    condicaoSucesso: ['Log gerado sem erros e dados refletidos de forma transparente no painel.'],
    condicaoErro: ['Log de erro ou ausência de atualização na fTransferências.'],
    status: 'PENDENTE',
    visibilidade: 'CONTINGENCIA'
  },
  {
    id: 'bi-mensageria',
    nome: 'BI Mensageria',
    name: 'BI Relatório de Acompanhamento de Mensageria (3.5)',
    biRelacionado: 'BI Mensageria',
    categoria: 'BI',
    category: 'BI',
    prioridade: 'P2',
    priority: 'medium',
    criticidade: 'MEDIA',
    frequencia: 'DIARIA',
    recurrence: 'Automático às 11:30',
    horario: ['11:30'],
    schedule: ['11:30'],
    diasSemana: ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta'],
    ativo: true,
    tipoExecucao: 'CONTINGENCIA',
    dependencia: [],
    impacto: 'Acompanha o envio de e-mails, SMS e notificações eletrônicas para confirmação de consultas.',
    objetivo: 'Assegurar que o painel de mensageria atualizou. Se falhar, rodar o fluxo manual.',
    instrucoes: [
      'O painel atualiza automaticamente via gateway de dados em produção.',
      'Verificar o log de mensageria na pasta 52 para confirmar a execução.',
      'Só intervir caso haja quebra ou arquivo corrompido de mensageria.'
    ],
    diretorios: [
      '\\\\10.1.17.4\\Usuarios\\Credenciamento Medico\\NUCLEO DE AGENDAS\\RAFAEL FERNANDES\\25 - PYTHON\\BI MENSAGERIA'
    ],
    arquivos: ['Mensageria_Controle.pbix', 'fMensageria.parquet'],
    scripts: ['1. Mensageria Diario.py', '2. UnificarParaMensal.py', '3. CriarFato.py'],
    contingency: [
      'Caso a carga automática falhe:',
      '  1. Executar o script Python "1. Mensageria Diario.py" para obter as mensagens do Oracle (ele envia e-mail automático pelo Outlook ao final).',
      '  2. Rodar o script "2. UnificarParaMensal.py" para unificar as bases.',
      '  3. Executar o script "3. CriarFato.py" para construir a tabela fato em parquet.',
      '  4. Abrir o Power BI, atualizar localmente e republicar no workspace.'
    ],
    observacoes: ['O script 01 envia e-mail com relatório de auditoria automática ao terminar.'],
    regrasNegocio: ['Cálculo de taxa de confirmação e no-show dinâmico das agendas.'],
    condicaoSucesso: ['Parquet atualizado e BI sincronizado com o Oracle.'],
    condicaoErro: ['Timeout no script 01 de extração Oracle de mensagens.'],
    status: 'PENDENTE',
    visibilidade: 'CONTINGENCIA'
  },
  {
    id: 'listagem-medprev',
    nome: 'Listagem Medprev',
    name: 'Listagem Medprev (Quinzenal)',
    biRelacionado: 'BI Controle_Agendas',
    categoria: 'BI',
    category: 'BI',
    prioridade: 'P2',
    priority: 'medium',
    criticidade: 'MEDIA',
    frequencia: 'QUINZENAL',
    recurrence: 'Quinzenal (Sob Demanda)',
    horario: ['09:00'],
    schedule: ['09:00'],
    diasSemana: ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta'],
    ativo: true,
    tipoExecucao: 'MANUAL',
    dependencia: [],
    impacto: 'Garante o repasse de agendas e a cobrança nominal da franquia parceira Medprev.',
    objetivo: 'Gerar o arquivo nominal de cobrança de agendas para preenchimento dos analistas.',
    instrucoes: [
      'Executar o script Python "03_GERACAO_LISTA_ANALISTAS_MEDPREV.py".',
      'Informar o mês-alvo desejado.',
      'O script faz a leitura histórica de 3 meses para herança e blacklist do Medprev.',
      'Conferir a planilha gerada "AGENDA_MEDPREV_<MES_ALVO>_26.xlsx".',
      'Disponibilizar a planilha na pasta de rede compartilhada com os analistas.',
      'A planilha gerará abas por responsável com dropdowns padronizados de justificativa.'
    ],
    diretorios: [
      '...\\9 - BASE COMPRA\\AGENDAS MENSAIS'
    ],
    arquivos: ['03_GERACAO_LISTA_ANALISTAS_MEDPREV.py'],
    scripts: ['03_GERACAO_LISTA_ANALISTAS_MEDPREV.py'],
    contingency: [
      'Se o script abortar, auditar as variáveis globais de blacklist de rede no código.',
      'Confirmar que a base unificada de rede "BASE_REDE" está acessível para herança.',
      'Checar se o arquivo "ARQ_DIM_MEDPREV" está na raiz da pasta de dimensões.'
    ],
    observacoes: [
      'A janela de cálculo dos últimos 3 meses deve ser estritamente calculada em relação ao mês-alvo do processamento.'
    ],
    regrasNegocio: [
      'Filtros sensíveis: STATUS_EXCLUSAO, STATUS_PADRAO_DROPDOWN, herança de motivos dos últimos 3 meses.'
    ],
    condicaoSucesso: ['Planilha de agendamento gerada com abas separadas por analista.'],
    condicaoErro: ['Erro ao calcular herança de registros inexistentes ou banco de dados indisponível.'],
    status: 'PENDENTE',
    visibilidade: 'CICLO'
  },
  {
    id: 'listagem-vs',
    nome: 'Listagem VS',
    name: 'Listagem VS (Quinzenal)',
    biRelacionado: 'BI Controle_Agendas',
    categoria: 'BI',
    category: 'BI',
    prioridade: 'P2',
    priority: 'medium',
    criticidade: 'MEDIA',
    frequencia: 'QUINZENAL',
    recurrence: 'Quinzenal (Sob Demanda)',
    horario: ['09:30'],
    schedule: ['09:30'],
    diasSemana: ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta'],
    ativo: true,
    tipoExecucao: 'MANUAL',
    dependencia: [],
    impacto: 'Alimenta o controle e faturamento de consultas vendidas de forma avulsa (Venda de Serviços).',
    objetivo: 'Gerar o arquivo de captação de Venda de Serviços.',
    instrucoes: [
      'Executar o script Python "03_GERACAO_LISTA_ANALISTAS_VS.py".',
      'Informar a janela móvel do mês atual + 4 meses para cálculo.',
      'O script consulta "DIM_VS.xlsx" para depara de unidades e "DIM_ESPECIALIDADE.xlsx" filtrada por STATUS=1.',
      'Unifica e remove aproximadamente 25 especialidades médicas contidas na blacklist hardcoded "ESPECIALIDADES_EXCLUIDAS_VS".',
      'Limpa status do Medprev e registros com justificativa "NÃO DESEJA ATENDER VS".',
      'Salvar o arquivo consolidado "AGENDA_VS_<MÊS>_26.xlsx" no diretório final de saída.'
    ],
    diretorios: [
      '...\\9 - BASE COMPRA\\BASES BI\\VS'
    ],
    arquivos: ['03_GERACAO_LISTA_ANALISTAS_VS.py'],
    scripts: ['03_GERACAO_LISTA_ANALISTAS_VS.py'],
    contingency: [
      'Revisar a blacklist de especialidades no script caso haja reclamação de analistas sobre exames indevidos carregados.',
      'Auditar o campo "VALIDAR EM PRODUÇÃO" antes do envio definitivo do arquivo de captação.'
    ],
    observacoes: ['Esta atividade é altamente complexa e requer conformidade regulatória interna.'],
    regrasNegocio: [
      'Depara unidade: DIM_VS.xlsx. Status ativo especialidades: DIM_ESPECIALIDADE (STATUS = 1).'
    ],
    condicaoSucesso: ['Planilha de venda de serviços salva no diretório de saída com o layout exato esperado.'],
    condicaoErro: ['Especialidades ativas incorretas geradas devido a falha na dimensão.'],
    status: 'PENDENTE',
    visibilidade: 'CICLO'
  },
  {
    id: 'lista-mensal-analistas',
    nome: 'Lista Mensal para Analistas',
    name: 'Lista Mensal para Analistas (Quinzenal)',
    biRelacionado: 'BI Captação de Agendas',
    categoria: 'BI',
    category: 'BI',
    prioridade: 'P2',
    priority: 'medium',
    criticidade: 'MEDIA',
    frequencia: 'MENSAL',
    recurrence: 'Mensal (Referência dia 15)',
    horario: ['10:00'],
    schedule: ['10:00'],
    diasSemana: ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta'],
    ativo: true,
    tipoExecucao: 'MANUAL',
    dependencia: [],
    impacto: 'Componente inicial de digitação das metas nominais mensais no sistema.',
    objetivo: 'Gerar arquivo unificado de analistas para digitação no Excel Online.',
    instrucoes: [
      'Executar o script Python "03_GERACAO_LISTA_ANALISTAS.py".',
      'Preencher a entrada do mês-agenda alvo no formato AAAA-MM.',
      'O script calculará as metas para o mês atual + 2 meses à frente no Oracle.',
      'O arquivo gerado de saída é "AGENDA_ANALISTAS_<MES_AGENDA>.xlsx".',
      'Mover o arquivo gerado e disponibilizá-lo como link preenchível na rede corporativa.'
    ],
    diretorios: [
      '...\\9 - BASE COMPRA\\AGENDAS MENSAIS'
    ],
    arquivos: ['03_GERACAO_LISTA_ANALISTAS.py'],
    scripts: ['03_GERACAO_LISTA_ANALISTAS.py'],
    contingency: [
      'ATENÇÃO: Há uma inconsistência documentada entre os sistemas de carga.',
      'O script gera "AGENDA_ANALISTAS_<MES_AGENDA>.xlsx", mas a consolidação diária espera "AGENDA_NOMINAL_<MES_AGENDA>.xlsx" em outra pasta.',
      'Exibir o alerta "CONFIRMAR FLUXO DE RENOMEAÇÃO/MOVIMENTAÇÃO" para que o operador decida a ação correta com base no dia.'
    ],
    observacoes: ['Inconsistência documentada no HTML deve ser exibida como alerta operacional.'],
    regrasNegocio: ['Janela móvel estrutural de preenchimento nominal por analista.'],
    condicaoSucesso: ['Arquivo de captação nominal disponibilizado sem bloqueios de permissão.'],
    condicaoErro: ['Data informada em formato incorreto abortando a execução SQL.'],
    status: 'PENDENTE',
    visibilidade: 'CICLO'
  },
  {
    id: 'inclusao-captado',
    nome: 'Inclusão de Captado',
    name: 'Inclusão de Captado',
    biRelacionado: 'Múltiplos',
    categoria: 'SOB_DEMANDA',
    category: 'SOB_DEMANDA',
    prioridade: 'P3',
    priority: 'low',
    criticidade: 'MEDIA',
    frequencia: 'SOB_DEMANDA',
    recurrence: 'Sob demanda (SLA 48h)',
    horario: ['11:00'],
    schedule: ['11:00'],
    diasSemana: ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta'],
    ativo: true,
    tipoExecucao: 'MANUAL',
    dependencia: [],
    impacto: 'Dificulta e atrasa o cadastro de novos profissionais caso o cadastro de cidades de captação esteja quebrado.',
    objetivo: 'Gerenciar inclusões de novas cidades de captação para os analistas no Excel e Oracle.',
    instrucoes: [
      'Gatilho: e-mail recebido solicitando inclusão de nova clínica/captado.',
      'Abrir a planilha de dimensões "DIM_CIDADE.xlsx" no servidor.',
      'Auditar se a cidade ou captado já está inserido (se sim, ignorar para não duplicar).',
      'Se for novo: acessar a tela corporativa T2125, obter o código cadastral e preencher as colunas no Excel.',
      'Salvar a planilha e executar o script Python "ImportarDIMCIDADE.py".',
      'Responder o e-mail confirmando o encerramento da solicitação (SLA de 48 horas).'
    ],
    diretorios: [
      '\\\\10.1.17.4\\Usuarios\\Credenciamento Medico\\NUCLEO DE AGENDAS\\RAFAEL FERNANDES\\13 - DIMENSOES',
      '\\\\10.1.17.4\\Usuarios\\Credenciamento Medico\\NUCLEO DE AGENDAS\\RAFAEL FERNANDES\\25 - PYTHON'
    ],
    arquivos: ['DIM_CIDADE.xlsx', 'ImportarDIMCIDADE.py'],
    scripts: ['ImportarDIMCIDADE.py'],
    contingency: [
      'Garantir preenchimento minucioso do Excel para não crashar o leitor do Pandas.',
      'Se o banco travar, reexecutar o script localmente no terminal.'
    ],
    observacoes: ['Atividade sob demanda para manutenção preventiva das dimensões cadastrais.'],
    regrasNegocio: ['Tabela cadastral T2125 do banco Oracle corporativo.'],
    condicaoSucesso: ['Novo captado inserido no banco de dados e e-mail respondido ao remetente.'],
    condicaoErro: ['Duplicidade de registros inseridos no Oracle por falta de auditoria na planilha.'],
    status: 'PENDENTE',
    visibilidade: 'CONTINGENCIA'
  },

  // ==========================================
  // PROCESSOS REMOVIDOS DA ROTINA ATIVA
  // (ativo: false, visibilidade: "ARQUIVO")
  // ==========================================
  {
    id: 'bi-medicos-novos',
    nome: 'BI Médicos Novos',
    name: 'BI Médicos Novos',
    biRelacionado: 'BI Médicos Novos',
    categoria: 'BI',
    category: 'BI',
    prioridade: 'P2',
    priority: 'medium',
    criticidade: 'MEDIA',
    frequencia: 'SEMANAL',
    recurrence: 'Segunda-feira (manhã)',
    horario: ['08:35'],
    schedule: ['08:35'],
    diasSemana: ['Segunda'],
    ativo: false,
    tipoExecucao: 'SEMIAUTOMATICA',
    dependencia: ['Baixar Bases T9016 Mensal'],
    impacto: 'Processo arquivado por instrução direta. Apenas para fins históricos.',
    objetivo: 'Processar e publicar o BI de Médicos Novos.',
    instrucoes: [
      'Garantir que as planilhas T9016 de todas as empresas estejam na pasta.',
      'Rodar o script historico_loader.py.',
      'Rodar o script transform.py.',
      'Atualizar o Power BI e publicar.'
    ],
    diretorios: [
      '...\\1 - RELATORIOS\\11 - MEDICOS NOVOS\\2 - FLUXO PHYTON MEDICOS NOVOS'
    ],
    arquivos: ['historico_loader.py', 'transform.py'],
    scripts: ['historico_loader.py', 'transform.py'],
    contingency: [],
    observacoes: ['ATIVIDADE REMOVIDA DA ROTINA ATIVA.'],
    regrasNegocio: [],
    condicaoSucesso: [],
    condicaoErro: [],
    status: 'NAO_APLICAVEL',
    visibilidade: 'ARQUIVO'
  },
  {
    id: 'base-t9016-mensal',
    nome: 'Baixar Bases T9016 Mensal',
    name: 'Baixar Bases T9016 Mensal',
    biRelacionado: 'BI Médicos Novos',
    categoria: 'BASE',
    category: 'BASE',
    prioridade: 'P3',
    priority: 'low',
    criticidade: 'BAIXA',
    frequencia: 'SEMANAL',
    recurrence: 'Segunda-feira (manhã)',
    horario: ['08:05'],
    schedule: ['08:05'],
    diasSemana: ['Segunda'],
    ativo: false,
    tipoExecucao: 'MANUAL',
    dependencia: [],
    impacto: 'Processo arquivado por instrução direta. Apenas para fins históricos.',
    objetivo: 'Baixar as bases T9016 mensais do sistema de faturamento.',
    instrucoes: [
      'Exportar as bases T9016 mensais de todas as operadoras do plano.',
      'Salvar na pasta do ano correspondente no servidor.'
    ],
    diretorios: [
      '\\\\10.1.17.4\\Usuarios\\Credenciamento Medico\\NUCLEO DE AGENDAS\\RAFAEL FERNANDES\\1 - RELATORIOS\\10 - AGENDA MEDICA MENSAL\\T9016 - BASE MENSAL\\2026'
    ],
    arquivos: [],
    scripts: [],
    contingency: [],
    observacoes: ['ATIVIDADE REMOVIDA DA ROTINA ATIVA.'],
    regrasNegocio: [],
    condicaoSucesso: [],
    condicaoErro: [],
    status: 'NAO_APLICAVEL',
    visibilidade: 'ARQUIVO'
  },
  {
    id: 'rede-cred',
    nome: 'Bases REDE CRED',
    name: 'Bases REDE CRED',
    biRelacionado: 'Rede Cred',
    categoria: 'BASE',
    category: 'BASE',
    prioridade: 'P2',
    priority: 'medium',
    criticidade: 'MEDIA',
    frequencia: 'DIARIA',
    recurrence: 'Diariamente',
    horario: ['14:00'],
    schedule: ['14:00'],
    diasSemana: ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta'],
    ativo: false,
    tipoExecucao: 'MANUAL',
    dependencia: [],
    impacto: 'Processo arquivado por instrução direta. Apenas para fins históricos.',
    objetivo: 'Atualizar manualmente as planilhas da Rede Cred.',
    instrucoes: [
      'Efetuar o preenchimento manual das quatro bases correspondentes à Rede Cred.',
      'As bases são: BASE_ALERTA_CRED, BASE_ALERTA_CRED_DIA_A_DIA, BASE_ALERTA_CRED(DESVIOS) e BASE_ALERTA_CRED(PONTOS).'
    ],
    diretorios: ['NAO_DOCUMENTADO_NO_HTML'],
    arquivos: [
      'BASE_ALERTA_CRED.xlsx',
      'BASE_ALERTA_CRED_DIA_A_DIA.xlsx',
      'BASE_ALERTA_CRED(DESVIOS).xlsx',
      'BASE_ALERTA_CRED(PONTOS).xlsx'
    ],
    scripts: [],
    contingency: [],
    observacoes: ['ATIVIDADE REMOVIDA DA ROTINA ATIVA.'],
    regrasNegocio: [],
    condicaoSucesso: [],
    condicaoErro: [],
    status: 'NAO_APLICAVEL',
    visibilidade: 'ARQUIVO'
  }
];
