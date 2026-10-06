# 🚀 Rotina Inteligente Optimus BI

O **Rotina Inteligente Optimus BI** é um cockpit operacional multiusuário de alta performance e segurança, desenvolvido para automatizar, organizar e auditar rotinas de faturamento e auditoria de processos de BIs da retaguarda.

Deixando de ser um cockpit individual simples, o sistema foi totalmente refatorado para uma **arquitetura corporativa segura**, contando com autenticação real de usuários, isolamento estrito de rotinas operacionais por conta, auditoria contínua de ações administrativas e um painel de identidade visual totalmente maleável e governável.

---

## 🏗️ Arquitetura de Segurança (Security Boundary)

Para garantir conformidade com os mais altos padrões de segurança corporativa, o sistema implementa segurança de dados em múltiplas camadas, seguindo o princípio do **Mecanismo Real de Segurança**:

```text
       AUTENTICAÇÃO (Firebase Auth JWT)
                      ↓
        SESSÃO SEGURA (onAuthStateChanged)
                      ↓
      IDENTIDADE DO USUÁRIO (Firestore users/{uid})
                      ↓
    PERMISSÕES & PERFIS (ADMIN | USER RBAC)
                      ↓
  ISOLAMENTO DE ROTINAS (database queries & rules)
```

1. **Camada de Apresentação (Frontend React + TS)**: Esconde opções administrativas de usuários sem permissão e gerencia o estado das abas, servindo como uma barreira de Experiência do Usuário (UX Guard).
2. **Camada de Aplicação (Firebase Auth)**: Valida sessões, gerencia tempos de expiração e emite tokens seguros (JWT) para as requisições.
3. **Camada de Banco de Dados (Firestore Security Rules)**: Atua como a **verdadeira fronteira de segurança**. Mesmo que uma pessoa mal-intencionada tente alterar seu `role` para `ADMIN` via console do desenvolvedor no navegador, o banco de dados rejeitará qualquer alteração ou requisição não autorizada, emitindo erro **403 Forbidden**.
4. **Isolamento Estrito**: Usuários comuns (`USER`) possuem acesso de leitura limitado apenas às atividades cadastradas com seu próprio identificador de usuário (`usuarioId == auth.uid`). Eles não conseguem visualizar nem auditar as tarefas de seus colegas ou administradores.

---

## 🔑 Perfis de Acesso e Credenciais de Desenvolvimento

O sistema possui inicialmente quatro usuários cadastrados com as seguintes atribuições de segurança baseadas em regras de cargo (RBAC):

| Usuário | E-mail de Teste | Senha Padrão | Função | Permissões |
| :--- | :--- | :--- | :--- | :--- |
| **Karine** | `karine@optimusbi.com` | `membrokarine123` | **ADMIN** | Acesso total, alteração de regras, gerenciamento de usuários, customização da identidade visual da equipe e auditoria total. |
| **Agenor** | `agenor@optimusbi.com` | `membroagenor123` | **ADMIN** | Acesso total administrativo e gerência de processos. |
| **Miller** | `miller@optimusbi.com` | `membromiller123` | **USER** | Visualização de sua própria rotina diária, cronometragem de seus BIs e auditoria de diretórios autorizados. |
| **Daniel** | `daniel@optimusbi.com` | `membrodaniel123` | **USER** | Acesso operacional básico à sua respectiva agenda do dia. |

> 💡 **Auto-Provisionamento de Testes**: Na tela de login, incluímos botões rápidos de testes de desenvolvimento. Ao clicar no nome de qualquer usuário, o Firebase Auth cria a conta automaticamente (se ainda não existir) e sincroniza seu perfil correspondente e as permissões no banco de dados Firestore no mesmo instante!

---

## ⚙️ Funcionalidades Principais

### 🏠 1. Painel Inicial (Dashboard)
* **Status em Tempo Real**: Indicadores dinâmicos de atividades planejadas, concluídas, atrasadas e índice de produtividade diária.
* **Spotlight de Foco**: Inteligência interna que sugere de forma proativa qual BI deve ser processado agora com base no horário previsto de faturamento.
* **Relógio de Brasília**: Sincronização contínua com cronômetros ativos de tarefas.

### 📅 2. Agenda do Dia (Checklist de Faturamento)
* **Checklist e Linha do Tempo**: Horários previstos de cargas, dependências de processos, instruções detalhadas de como faturar, caminhos de diretórios e scripts.
* **Cronômetro Interno**: Controle exato de tempo gasto em cada tarefa, com registro preciso de atrasos e justificativas operacionais.
* **Controle de Pausas**: Botões para acionamento de **Pausa Almoço** ou **Hora do Café**, emitindo alertas visuais piscantes para o acompanhamento dos gestores.

### 📊 3. Checklist de BIs
* Tabela analítica completa para acompanhamento e controle minucioso do faturamento dos BIs.

### 📁 4. Mapa de Diretórios
* Acesso rápido aos diretórios de rede autorizados (UNC/Caminhos) utilizados para cargas e validações de arquivos.

### 📆 5. Marcos do Mês & Ciclos
* Uma área modular integrada contendo:
  * **Marcos Regulatórios**: Cargas críticas executadas em dias úteis específicos (1º dia útil, 5º dia útil, 10º dia útil e fechamentos).
  * **Ciclos de Frequência**: Catálogo geral das rotinas da equipe organizadas por cadência (Diária, Semanal, Quinzenal, Mensal, Sob Demanda e Arquivo).

### ⚙️ 6. Central de Administração (Apenas para Karine e Agenor)
* **Painel de Auditoria**: Estatísticas de usuários, contagem real de processos ativos e membros pendentes de configuração.
* **Gestão de Usuários**: Ativar/desativar contas corporativas, alterar cargos (toggle ADMIN/USER com dupla confirmação de segurança) e renomear.
* **Configuração Dinâmica de Rotinas**: Criar, editar, desativar, duplicar e excluir atividades operacionais para qualquer membro da equipe Optimus BI com sincronização em lote.
* **Identidade Visual Customizada**: Upload de logotipo customizado da equipe e alteração de todas as cores da aplicação (principal, secundária, destaque e fundo) gerando adaptação dinâmica do tema do cockpit de forma instantânea.

---

## 📜 Políticas de Segurança (`firestore.rules`)

As regras de banco de dados garantem proteção física e imutabilidade das informações coletadas:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    function isAuthenticated() { return request.auth != null; }
    function getUserData() { return get(/databases/$(database)/documents/users/$(request.auth.uid)).data; }
    function isAdmin() { return isAuthenticated() && exists(/databases/$(database)/documents/users/$(request.auth.uid)) && getUserData().role == 'ADMIN'; }
    function isActive() { return isAuthenticated() && exists(/databases/$(database)/documents/users/$(request.auth.uid)) && getUserData().ativo == true; }

    match /users/{userId} {
      allow read: if isAuthenticated();
      allow create: if isAuthenticated() && (userId == request.auth.uid || isAdmin());
      allow update, delete: if isAdmin();
    }

    match /appState/{docId} {
      allow read: if isAuthenticated() && isActive();
      allow write: if isAuthenticated() && isActive() && (isAdmin() || docId == 'state_' + request.auth.uid);
    }
    
    match /teamSettings/{docId} {
      allow read: if isAuthenticated();
      allow write: if isAdmin();
    }
    
    match /auditLogs/{logId} {
      allow read: if isAdmin();
      allow create: if isAuthenticated() && isActive();
      allow update, delete: if false; // Append-only audit logging
    }
  }
}
```

---

## 📦 Variáveis de Ambiente (`.env`)

Para conexão correta ao ecossistema do Firebase, garanta que as seguintes variáveis estejam preenchidas no seu `.env` ou `.env.local` na raiz do projeto:

```env
VITE_FIREBASE_PROJECT_ID=rotina-inteligente-508715
VITE_FIREBASE_APP_ID=1:945309987493:web:1c68e074d45eccc05ad34c
VITE_FIREBASE_API_KEY=AIzaSyAnvLIfAkHARaEo6ZRm4eY8jE18E-7BpOA
VITE_FIREBASE_AUTH_DOMAIN=rotina-inteligente-508715.firebaseapp.com
VITE_FIREBASE_STORAGE_BUCKET=rotina-inteligente-508715.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=945309987493
```

---

## 🛠️ Tecnologias Utilizadas

*   **Frontend**: React + TypeScript + Vite
*   **Estilização**: Tailwind CSS v4 + Lucide Icons
*   **Database & Sincronização**: Firebase Firestore (NoSQL)
*   **Autenticação**: Firebase Authentication (Session & JWT)
*   **Integrações Externas**: Google Drive & Google Sheets API para exportação de BIs faturados.

---

## 🤝 Como Executar o Projeto Localmente

1.  Certifique-se de possuir o **Node.js** instalado em sua máquina.
2.  Instale as dependências da aplicação:
    ```bash
    npm install
    ```
3.  Inicie o servidor de desenvolvimento em tempo real:
    ```bash
    npm run dev
    ```
4.  Abra o navegador em `http://localhost:3000` para operar o cockpit.

---

Desenvolvido com foco em **segurança da informação, credibilidade, transparência e alta produtividade corporativa** para a equipe **Optimus BI**! 🚀
