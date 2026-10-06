// src/components/AdminPanel.tsx
import React, { useState } from 'react';
import { AppState, User, Activity, TeamSettings, ActivityCategory, ActivityPriority, ActivityCriticism, ActivityFrequency, ActivityExecutionType, UserRole } from '../types';
import { Users, Settings, FolderKanban, Palette, ShieldAlert, Check, AlertTriangle, Plus, Trash2, Edit2, Copy, ToggleLeft, ToggleRight } from 'lucide-react';
import { storageService } from '../services/storageService';

interface AdminPanelProps {
  appState: AppState;
  setAppState: React.Dispatch<React.SetStateAction<AppState>>;
  currentUser: User;
  viewingUserId: string;
  setViewingUserId: (id: string) => void;
}

export function AdminPanel({ appState, setAppState, currentUser, viewingUserId, setViewingUserId }: AdminPanelProps) {
  // Verificação rigorosa de privilégios de Administrador
  const isAuthorized = currentUser.role === 'ADMIN';

  if (!isAuthorized) {
    return (
      <div className="bg-white rounded-xl shadow border border-red-200 p-8 text-center max-w-lg mx-auto my-12 animate-fade-in">
        <ShieldAlert size={64} className="text-[#F21D2F] mx-auto mb-4 animate-bounce" />
        <h2 className="text-xl font-bold font-sora text-gray-900">Acesso Restrito</h2>
        <p className="text-sm text-gray-500 mt-2">
          Somente administradores (Karine e Agenor) têm permissão de acesso à Central de Administração.
        </p>
        <div className="bg-red-50 text-[#F21D2F] text-xs font-semibold px-4 py-2 rounded-lg mt-4 inline-block">
          🔒 Acesso restrito aos administradores.
        </div>
      </div>
    );
  }

  // Sub-abas do painel administrativo
  const [activeSubTab, setActiveSubTab] = useState<'dashboard' | 'users' | 'routines' | 'identity'>('dashboard');

  const usersList = appState.users || [];
  const activitiesList = appState.activities || [];
  const teamSettings = appState.teamSettings || {
    teamName: "Rotina Inteligente Optimus BI",
    logoUrl: "",
    logoAlt: "Logo Rotina Inteligente Optimus BI",
    primaryColor: "#0339A6",
    secondaryColor: "#F21D2F",
    accentColor: "#F2B705",
    backgroundColor: "#F2F2F2"
  };

  // Estatísticas do Dashboard Administrativo
  const totalUsers = usersList.length;
  const adminCount = usersList.filter(u => u.role === 'ADMIN').length;
  const operatorCount = usersList.filter(u => u.role === 'USER').length;
  const totalActivities = activitiesList.length;
  const usersWithoutRoutine = usersList.filter(u => !activitiesList.some(a => a.usuarioId === u.id));

  // --- SEÇÃO 1: GERENCIAMENTO DE USUÁRIOS ---
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const handleToggleUserStatus = (user: User) => {
    if (user.id === currentUser.id) {
      alert("Você não pode desativar o seu próprio usuário logado!");
      return;
    }
    const confirmAction = window.confirm(`Tem certeza que deseja ${user.ativo ? 'DESATIVAR' : 'ATIVAR'} o usuário ${user.nome}?`);
    if (!confirmAction) return;

    setAppState(prev => {
      const updatedUsers = (prev.users || []).map(u => u.id === user.id ? { ...u, ativo: !u.ativo } : u);
      return { ...prev, users: updatedUsers };
    });
  };

  const handleToggleUserRole = (user: User) => {
    if (user.id === currentUser.id) {
      alert("Você não pode alterar o cargo do seu próprio usuário logado!");
      return;
    }
    const nextRole = (user.role === 'ADMIN' ? 'USER' : 'ADMIN') as UserRole;
    const confirmAction = window.confirm(`Tem certeza que deseja alterar o cargo de ${user.nome} para ${nextRole}?`);
    if (!confirmAction) return;

    setAppState(prev => {
      const updatedUsers: User[] = (prev.users || []).map(u => u.id === user.id ? { ...u, role: nextRole } : u);
      return { ...prev, users: updatedUsers };
    });
  };

  const handleSaveUserName = (user: User, newName: string) => {
    if (!newName.trim()) return;
    setAppState(prev => {
      const updatedUsers = (prev.users || []).map(u => u.id === user.id ? { ...u, nome: newName } : u);
      return { ...prev, users: updatedUsers };
    });
    setEditingUser(null);
  };

  // --- SEÇÃO 2: GERENCIAMENTO DE ROTINAS ---
  const [selectedUserRoutine, setSelectedUserRoutine] = useState<string>('karine');
  const [editingActivity, setEditingActivity] = useState<Activity | null>(null);
  const [isAddingNew, setIsAddingNew] = useState(false);

  // Campos do Formulário de Atividade
  const [formNome, setFormNome] = useState('');
  const [formBi, setFormBi] = useState('');
  const [formCategory, setFormCategory] = useState<ActivityCategory>('BI');
  const [formPriority, setFormPriority] = useState<ActivityPriority>('P1');
  const [formCriticism, setFormCriticism] = useState<ActivityCriticism>('ALTA');
  const [formFrequency, setFormFrequency] = useState<ActivityFrequency>('DIARIA');
  const [formExecType, setFormExecType] = useState<ActivityExecutionType>('MANUAL');
  const [formHorario, setFormHorario] = useState('08:30');
  const [formDiasSemana, setFormDiasSemana] = useState('Segunda, Terça, Quarta, Quinta, Sexta');
  const [formImpacto, setFormImpacto] = useState('');
  const [formObjetivo, setFormObjetivo] = useState('');
  const [formInstrucoes, setFormInstrucoes] = useState('');
  const [formDiretorios, setFormDiretorios] = useState('');
  const [formArquivos, setFormArquivos] = useState('');
  const [formScripts, setFormScripts] = useState('');
  const [formContingencia, setFormContingencia] = useState('');
  const [formObservacoes, setFormObservacoes] = useState('');
  const [formRegrasNegocio, setFormRegrasNegocio] = useState('');

  const openEditActivity = (act: Activity) => {
    setEditingActivity(act);
    setIsAddingNew(false);
    setFormNome(act.nome);
    setFormBi(act.biRelacionado);
    setFormCategory(act.categoria);
    setFormPriority(act.prioridade);
    setFormCriticism(act.criticidade);
    setFormFrequency(act.frequencia);
    setFormExecType(act.tipoExecucao);
    setFormHorario(act.horario.join(', '));
    setFormDiasSemana(act.diasSemana.join(', '));
    setFormImpacto(act.impacto);
    setFormObjetivo(act.objetivo);
    setFormInstrucoes(act.instrucoes.join('\n'));
    setFormDiretorios(act.diretorios.join('\n'));
    setFormArquivos(act.arquivos.join('\n'));
    setFormScripts(act.scripts.join('\n'));
    setFormContingencia((act.contingencia || []).join('\n'));
    setFormObservacoes(act.observacoes.join('\n'));
    setFormRegrasNegocio(act.regrasNegocio.join('\n'));
  };

  const openAddNewActivity = () => {
    setEditingActivity(null);
    setIsAddingNew(true);
    setFormNome('');
    setFormBi('');
    setFormCategory('BI');
    setFormPriority('P1');
    setFormCriticism('ALTA');
    setFormFrequency('DIARIA');
    setFormExecType('MANUAL');
    setFormHorario('09:00');
    setFormDiasSemana('Segunda, Terça, Quarta, Quinta, Sexta');
    setFormImpacto('Acompanhamento crítico e auditoria operacional.');
    setFormObjetivo('Garantir consistência dos dados do painel.');
    setFormInstrucoes('1. Acessar o Power BI ou sistema correspondente.\n2. Baixar a base em formato XLSX.\n3. Validar consistência.');
    setFormDiretorios('\\\\10.1.17.4\\Usuarios\\Credenciamento Medico\\NUCLEO DE AGENDAS\\RAFAEL FERNANDES');
    setFormArquivos('base.xlsx');
    setFormScripts('');
    setFormContingencia('Acionar contingência se os servidores estiverem offline.');
    setFormObservacoes('');
    setFormRegrasNegocio('');
  };

  const handleSaveActivity = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formNome.trim()) {
      alert("Por favor, preencha o nome da atividade.");
      return;
    }

    const parseList = (str: string) => str.split('\n').map(x => x.trim()).filter(Boolean);
    const parseCommaList = (str: string) => str.split(',').map(x => x.trim()).filter(Boolean);

    const updatedActivity: Activity = {
      id: editingActivity ? editingActivity.id : `act-${Date.now()}`,
      nome: formNome,
      name: formNome, // retrocompatibilidade
      biRelacionado: formBi || formNome,
      categoria: formCategory,
      category: formCategory, // retrocompatibilidade
      prioridade: formPriority,
      priority: formPriority, // retrocompatibilidade
      criticidade: formCriticism,
      frequencia: formFrequency,
      recurrence: formFrequency, // retrocompatibilidade
      horario: parseCommaList(formHorario),
      schedule: parseCommaList(formHorario), // retrocompatibilidade
      diasSemana: parseCommaList(formDiasSemana),
      ativo: editingActivity ? editingActivity.ativo : true,
      tipoExecucao: formExecType,
      dependencia: [],
      impacto: formImpacto,
      objetivo: formObjetivo,
      instrucoes: parseList(formInstrucoes),
      diretorios: parseList(formDiretorios),
      arquivos: parseList(formArquivos),
      scripts: parseList(formScripts),
      contingencia: parseList(formContingencia),
      observacoes: parseList(formObservacoes),
      regrasNegocio: parseList(formRegrasNegocio),
      condicaoSucesso: ['Execução concluída e registrada com sucesso.'],
      condicaoErro: ['Falha de carregamento ou script inoperante.'],
      status: editingActivity ? editingActivity.status : 'PENDENTE',
      visibilidade: 'AGENDA',
      usuarioId: selectedUserRoutine // Associa diretamente ao usuário selecionado
    };

    setAppState(prev => {
      let updatedList = [...(prev.activities || [])];
      if (editingActivity) {
        // Editando existente
        updatedList = updatedList.map(a => a.id === editingActivity.id ? updatedActivity : a);
      } else {
        // Adicionando nova
        updatedList.push(updatedActivity);
      }

      // Regenerar também as execuções do dia se a atividade for nova ou modificada
      const todayStr = storageService.getTodayDateString();
      const updatedExecs = storageService.generateDefaultExecutions(todayStr, updatedList);

      return {
        ...prev,
        activities: updatedList,
        executions: updatedExecs
      };
    });

    setEditingActivity(null);
    setIsAddingNew(false);
    alert("Atividade salva e sincronizada na rotina do usuário com sucesso!");
  };

  const handleDeleteActivity = (actId: string) => {
    const confirmAction = window.confirm("Tem certeza que deseja REMOVER esta atividade permanentemente? Isso irá apagar todo o histórico de execuções do dia correspondente.");
    if (!confirmAction) return;

    setAppState(prev => {
      const updatedList = (prev.activities || []).filter(a => a.id !== actId);
      const todayStr = storageService.getTodayDateString();
      const updatedExecs = storageService.generateDefaultExecutions(todayStr, updatedList);

      return {
        ...prev,
        activities: updatedList,
        executions: updatedExecs
      };
    });

    alert("Atividade removida com sucesso!");
  };

  const handleDuplicateActivity = (act: Activity) => {
    const duplicated: Activity = {
      ...act,
      id: `act-dup-${Date.now()}`,
      nome: `${act.nome} (Cópia)`,
      name: `${act.nome} (Cópia)`
    };

    setAppState(prev => {
      const updatedList = [...(prev.activities || []), duplicated];
      const todayStr = storageService.getTodayDateString();
      const updatedExecs = storageService.generateDefaultExecutions(todayStr, updatedList);
      return {
        ...prev,
        activities: updatedList,
        executions: updatedExecs
      };
    });

    alert("Atividade duplicada com sucesso!");
  };

  const handleToggleActivityActive = (act: Activity) => {
    setAppState(prev => {
      const updatedList = (prev.activities || []).map(a => a.id === act.id ? { ...a, ativo: !a.ativo } : a);
      const todayStr = storageService.getTodayDateString();
      const updatedExecs = storageService.generateDefaultExecutions(todayStr, updatedList);
      return {
        ...prev,
        activities: updatedList,
        executions: updatedExecs
      };
    });
  };

  // --- SEÇÃO 3: IDENTIDADE VISUAL DA EQUIPE ---
  const [teamNameForm, setTeamNameForm] = useState(teamSettings.teamName);
  const [logoUrlForm, setLogoUrlForm] = useState(teamSettings.logoUrl);
  const [primaryColorForm, setPrimaryColorForm] = useState(teamSettings.primaryColor);
  const [secondaryColorForm, setSecondaryColorForm] = useState(teamSettings.secondaryColor);
  const [accentColorForm, setAccentColorForm] = useState(teamSettings.accentColor);
  const [backgroundColorForm, setBackgroundColorForm] = useState(teamSettings.backgroundColor);

  const handleSaveIdentity = (e: React.FormEvent) => {
    e.preventDefault();
    const updatedSettings: TeamSettings = {
      teamName: teamNameForm,
      logoUrl: logoUrlForm,
      logoAlt: `Logo ${teamNameForm}`,
      primaryColor: primaryColorForm,
      secondaryColor: secondaryColorForm,
      accentColor: accentColorForm,
      backgroundColor: backgroundColorForm
    };

    setAppState(prev => ({
      ...prev,
      teamSettings: updatedSettings
    }));

    alert("Identidade visual da equipe Optimus BI atualizada com sucesso!");
  };

  const handleResetIdentity = () => {
    setTeamNameForm("Rotina Inteligente Optimus BI");
    setLogoUrlForm("");
    setPrimaryColorForm("#0339A6");
    setSecondaryColorForm("#F21D2F");
    setAccentColorForm("#F2B705");
    setBackgroundColorForm("#F2F2F2");
  };

  return (
    <div className="space-y-6">
      {/* HEADER DE BOAS VINDAS */}
      <div className="bg-gradient-to-r from-[#0339A6] to-[#022b80] text-white rounded-xl shadow border border-blue-800 p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black font-sora">⚙️ Central de Administração da Rotina</h1>
          <p className="text-xs text-blue-200 mt-1 max-w-xl">
            Gerencie perfis de acesso, atribua rotinas individuais, customize os horários de BIs e configure a identidade visual da equipe Optimus BI.
          </p>
        </div>
        <div className="flex items-center gap-2 bg-white/10 border border-white/20 px-3 py-1.5 rounded-lg text-xs font-bold uppercase shrink-0">
          <span>👑 Admin Logado: {currentUser.nome}</span>
        </div>
      </div>

      {/* NAVBAR ADMINISTRATIVA INTERNA */}
      <div className="flex flex-wrap border-b border-gray-200 gap-1">
        <button
          onClick={() => setActiveSubTab('dashboard')}
          className={`px-4 py-2 text-xs font-bold flex items-center gap-1.5 transition border-b-2 leading-none ${
            activeSubTab === 'dashboard'
              ? 'border-[#0339A6] text-[#0339A6]'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          <Settings size={14} />
          Painel Inicial
        </button>
        <button
          onClick={() => setActiveSubTab('users')}
          className={`px-4 py-2 text-xs font-bold flex items-center gap-1.5 transition border-b-2 leading-none ${
            activeSubTab === 'users'
              ? 'border-[#0339A6] text-[#0339A6]'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          <Users size={14} />
          👥 Usuários ({totalUsers})
        </button>
        <button
          onClick={() => setActiveSubTab('routines')}
          className={`px-4 py-2 text-xs font-bold flex items-center gap-1.5 transition border-b-2 leading-none ${
            activeSubTab === 'routines'
              ? 'border-[#0339A6] text-[#0339A6]'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          <FolderKanban size={14} />
          📋 Configurar Rotinas
        </button>
        <button
          onClick={() => setActiveSubTab('identity')}
          className={`px-4 py-2 text-xs font-bold flex items-center gap-1.5 transition border-b-2 leading-none ${
            activeSubTab === 'identity'
              ? 'border-[#0339A6] text-[#0339A6]'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          <Palette size={14} />
          🎨 Identidade Visual
        </button>
      </div>

      {/* --- ABA: DASHBOARD GERAL --- */}
      {activeSubTab === 'dashboard' && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 animate-fade-in">
          <div className="bg-white rounded-xl shadow border border-gray-100 p-5 flex items-center gap-4">
            <div className="p-3 bg-blue-50 text-blue-600 rounded-lg">
              <Users size={24} />
            </div>
            <div>
              <span className="block text-[10px] text-gray-400 uppercase font-black tracking-wider leading-none">Usuários Cadastrados</span>
              <span className="text-2xl font-black text-gray-800 font-sora block mt-1">{totalUsers}</span>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow border border-gray-100 p-5 flex items-center gap-4">
            <div className="p-3 bg-red-50 text-red-600 rounded-lg">
              <ShieldAlert size={24} />
            </div>
            <div>
              <span className="block text-[10px] text-gray-400 uppercase font-black tracking-wider leading-none">Administradores</span>
              <span className="text-2xl font-black text-gray-800 font-sora block mt-1">{adminCount}</span>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow border border-gray-100 p-5 flex items-center gap-4">
            <div className="p-3 bg-green-50 text-green-600 rounded-lg">
              <FolderKanban size={24} />
            </div>
            <div>
              <span className="block text-[10px] text-gray-400 uppercase font-black tracking-wider leading-none">Atividades Totais</span>
              <span className="text-2xl font-black text-[#0339A6] font-sora block mt-1">{totalActivities}</span>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow border border-gray-100 p-5 flex items-center gap-4">
            <div className="p-3 bg-amber-50 text-amber-600 rounded-lg">
              <AlertTriangle size={24} />
            </div>
            <div>
              <span className="block text-[10px] text-gray-400 uppercase font-black tracking-wider leading-none">Usuários Sem Rotina</span>
              <span className="text-2xl font-black text-amber-600 font-sora block mt-1">{usersWithoutRoutine.length}</span>
            </div>
          </div>

          <div className="md:col-span-4 bg-white p-6 rounded-xl shadow border border-gray-100 space-y-4">
            <h2 className="text-sm font-black font-sora text-gray-900 uppercase tracking-wider">Status das Equipes</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="border border-gray-100 rounded-lg p-4 bg-gray-50">
                <span className="text-xs font-bold text-[#0339A6] block">👨‍👩‍👧‍👦 Lista Geral de Membros</span>
                <div className="mt-3 space-y-2">
                  {usersList.map(u => {
                    const acts = activitiesList.filter(a => a.usuarioId === u.id).length;
                    return (
                      <div key={u.id} className="flex items-center justify-between bg-white px-3 py-2 rounded border border-gray-100 text-xs">
                        <div className="flex items-center gap-2">
                          <span className={`h-2.5 w-2.5 rounded-full ${u.ativo ? 'bg-green-500' : 'bg-gray-300'}`}></span>
                          <span className="font-bold text-gray-800">{u.nome}</span>
                          <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${u.role === 'ADMIN' ? 'bg-red-50 text-red-600 border border-red-200' : 'bg-blue-50 text-blue-600'}`}>
                            {u.role}
                          </span>
                        </div>
                        <span className="text-gray-500 font-medium">{acts} atividades configuradas</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="border border-gray-100 rounded-lg p-4 bg-gray-50 flex flex-col justify-between">
                <div>
                  <span className="text-xs font-bold text-red-600 block">⚠️ Usuários Sem Rotinas Atribuídas</span>
                  <p className="text-xs text-gray-500 mt-1">
                    Atualmente os seguintes membros da equipe Optimus BI estão cadastrados mas não possuem nenhuma rotina ativa.
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {usersWithoutRoutine.length > 0 ? (
                      usersWithoutRoutine.map(u => (
                        <span key={u.id} className="bg-amber-50 text-amber-800 text-xs font-bold px-3 py-1.5 rounded-lg border border-amber-200">
                          👤 {u.nome}
                        </span>
                      ))
                    ) : (
                      <span className="text-xs text-green-600 font-medium">✨ Todos os usuários possuem atividades ativas.</span>
                    )}
                  </div>
                </div>
                <div className="bg-white p-3 rounded border border-gray-200 text-xs text-gray-500 mt-4 leading-relaxed">
                  <strong>💡 Dica Rápida:</strong> Vá na aba <strong>Configurar Rotinas</strong>, selecione <strong>Miller</strong> ou <strong>Daniel</strong> e clique em <em>+ Adicionar Nova Atividade</em> para configurar suas respectivas tarefas!
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* --- ABA: USUÁRIOS --- */}
      {activeSubTab === 'users' && (
        <div className="bg-white rounded-xl shadow border border-gray-100 overflow-hidden animate-fade-in">
          <div className="p-4 bg-gray-50 border-b border-gray-100">
            <h2 className="text-xs font-black font-sora uppercase tracking-wider text-gray-900">Configuração de Perfis e Permissões</h2>
          </div>
          <div className="divide-y divide-gray-100">
            {usersList.map(u => (
              <div key={u.id} className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-gray-50 transition">
                <div>
                  {editingUser && editingUser.id === u.id ? (
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        defaultValue={u.nome}
                        id={`input-name-${u.id}`}
                        className="text-xs font-bold text-gray-800 border border-gray-300 rounded px-2.5 py-1 focus:outline-none focus:border-[#0339A6]"
                      />
                      <button
                        onClick={() => {
                          const val = (document.getElementById(`input-name-${u.id}`) as HTMLInputElement)?.value;
                          handleSaveUserName(u, val);
                        }}
                        className="bg-green-600 hover:bg-green-700 text-white text-xs px-2.5 py-1 rounded font-bold"
                      >
                        Salvar
                      </button>
                      <button
                        onClick={() => setEditingUser(null)}
                        className="bg-gray-300 hover:bg-gray-400 text-gray-700 text-xs px-2.5 py-1 rounded font-bold"
                      >
                        Cancelar
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-gray-900">{u.nome}</span>
                      <button onClick={() => setEditingUser(u)} className="text-gray-400 hover:text-[#0339A6]">
                        <Edit2 size={12} />
                      </button>
                    </div>
                  )}
                  <span className="block text-[11px] text-gray-400 mt-0.5">ID: {u.id} · Email corporativo cadastrado</span>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  {/* Visualização de Permissões */}
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] text-gray-400 uppercase font-bold">Função:</span>
                    <button
                      onClick={() => handleToggleUserRole(u)}
                      className={`text-xs font-bold px-2.5 py-1 rounded-full border transition ${
                        u.role === 'ADMIN'
                          ? 'bg-red-50 text-red-600 border-red-200 hover:bg-red-100'
                          : 'bg-blue-50 text-blue-600 border-blue-200 hover:bg-blue-100'
                      }`}
                      title="Clique para alternar o cargo"
                    >
                      🛡️ {u.role}
                    </button>
                  </div>

                  {/* Sorte de Atividades */}
                  <span className="text-xs text-gray-500 font-medium">
                    ({activitiesList.filter(a => a.usuarioId === u.id).length}) atividades ativas
                  </span>

                  {/* Status Ativo/Inativo */}
                  <button
                    onClick={() => handleToggleUserStatus(u)}
                    className={`flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded border transition ${
                      u.ativo
                        ? 'bg-green-50 text-green-700 border-green-200 hover:bg-green-100'
                        : 'bg-gray-50 text-gray-500 border-gray-200 hover:bg-gray-100'
                    }`}
                  >
                    {u.ativo ? <ToggleRight size={16} className="text-green-600" /> : <ToggleLeft size={16} className="text-gray-400" />}
                    <span>{u.ativo ? 'Ativo' : 'Desativado'}</span>
                  </button>

                  {/* Visualizar Agenda */}
                  <button
                    onClick={() => {
                      setViewingUserId(u.id);
                      alert(`Alterado para visualizar a rotina diária de ${u.nome}! Verifique as abas do painel.`);
                    }}
                    className={`text-xs font-bold px-2.5 py-1 rounded transition ${
                      viewingUserId === u.id
                        ? 'bg-[#0339A6] text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    👁️ Visualizar Rotina
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* --- ABA: ROTINAS DE USUÁRIOS --- */}
      {activeSubTab === 'routines' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in">
          {/* Seletor de Usuário Operacional */}
          <div className="bg-white rounded-xl shadow border border-gray-100 p-5 space-y-4">
            <h2 className="text-xs font-black font-sora uppercase tracking-wider text-gray-900 block">Atribuir Rotina de Equipe</h2>
            <div className="space-y-2">
              {usersList.map(u => {
                const acts = activitiesList.filter(a => a.usuarioId === u.id);
                return (
                  <button
                    key={u.id}
                    onClick={() => {
                      setSelectedUserRoutine(u.id);
                      setEditingActivity(null);
                      setIsAddingNew(false);
                    }}
                    className={`w-full text-left p-3 rounded-lg border text-xs transition flex items-center justify-between ${
                      selectedUserRoutine === u.id
                        ? 'border-[#0339A6] bg-blue-50/50 font-bold'
                        : 'border-gray-100 hover:border-gray-300'
                    }`}
                  >
                    <div>
                      <span className="block font-bold text-gray-800">{u.nome}</span>
                      <span className="text-[10px] text-gray-400 mt-0.5 block font-normal">{u.role}</span>
                    </div>
                    <span className="bg-gray-100 px-2 py-0.5 rounded text-[10px] text-gray-600 font-bold">
                      {acts.length} rotinas
                    </span>
                  </button>
                );
              })}
            </div>
            <button
              onClick={openAddNewActivity}
              className="w-full text-center bg-[#0339A6] hover:bg-[#022b80] text-white text-xs font-black py-2.5 rounded-lg flex items-center justify-center gap-1.5 transition"
            >
              <Plus size={14} />
              + Adicionar Atividade
            </button>
          </div>

          {/* Lista de Atividades e Editor */}
          <div className="lg:col-span-2 space-y-4">
            {(!editingActivity && !isAddingNew) ? (
              <div className="bg-white rounded-xl shadow border border-gray-100 p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-black font-sora uppercase tracking-wider text-gray-900">
                    Atividades de {usersList.find(u => u.id === selectedUserRoutine)?.nome || selectedUserRoutine}
                  </h3>
                </div>

                {activitiesList.filter(a => a.usuarioId === selectedUserRoutine).length === 0 ? (
                  <div className="text-center py-12 border border-dashed border-gray-200 rounded-lg">
                    <span className="text-4xl block mb-2">📋</span>
                    <span className="text-xs text-gray-400 font-medium block">
                      Atividades ainda não configuradas.
                    </span>
                    <p className="text-[10px] text-gray-400 mt-1 max-w-xs mx-auto">
                      Use o botão "+ Adicionar Atividade" para iniciar a configuração da agenda operacional desse usuário.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {activitiesList.filter(a => a.usuarioId === selectedUserRoutine).map(act => (
                      <div key={act.id} className="flex items-center justify-between border border-gray-100 p-3 rounded-lg hover:border-gray-200 transition">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-xs text-gray-800">{act.nome}</span>
                            <span className={`text-[9px] font-black px-1.5 py-0.5 rounded uppercase font-mono ${
                              act.prioridade === 'P0' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-700'
                            }`}>
                              {act.prioridade}
                            </span>
                          </div>
                          <div className="flex items-center gap-1.5 mt-1 text-[10px] text-gray-400 font-medium">
                            <span>🕒 {act.horario.join(', ')}</span>
                            <span>·</span>
                            <span>🔄 {act.frequencia}</span>
                            <span>·</span>
                            <span className={act.ativo ? 'text-green-600' : 'text-gray-400'}>{act.ativo ? 'Ativa' : 'Pausada'}</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => handleToggleActivityActive(act)}
                            className="text-gray-500 hover:text-[#0339A6] p-1 rounded"
                            title={act.ativo ? 'Desativar Atividade' : 'Ativar Atividade'}
                          >
                            {act.ativo ? <ToggleRight size={18} className="text-green-600" /> : <ToggleLeft size={18} className="text-gray-400" />}
                          </button>
                          <button onClick={() => openEditActivity(act)} className="text-gray-500 hover:text-[#0339A6] p-1 hover:bg-gray-50 rounded" title="Editar Atividade">
                            <Edit2 size={14} />
                          </button>
                          <button onClick={() => handleDuplicateActivity(act)} className="text-gray-500 hover:text-[#0339A6] p-1 hover:bg-gray-50 rounded" title="Duplicar">
                            <Copy size={14} />
                          </button>
                          <button onClick={() => handleDeleteActivity(act.id)} className="text-gray-500 hover:text-red-600 p-1 hover:bg-red-50 rounded" title="Excluir Atividade">
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              /* FORMULÁRIO DE ADICIONAR OU EDITAR ATIVIDADE */
              <form onSubmit={handleSaveActivity} className="bg-white rounded-xl shadow border border-gray-100 p-5 space-y-4 animate-fade-in">
                <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                  <h3 className="text-xs font-black font-sora uppercase tracking-wider text-gray-900">
                    {isAddingNew ? '➕ Cadastrar Nova Atividade' : '📝 Editar Detalhes da Atividade'}
                  </h3>
                  <button
                    type="button"
                    onClick={() => { setEditingActivity(null); setIsAddingNew(false); }}
                    className="text-gray-400 hover:text-gray-600 text-xs font-bold"
                  >
                    Fechar
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Nome */}
                  <div className="space-y-1">
                    <label className="block text-[10px] text-gray-400 uppercase font-bold">Nome da Atividade</label>
                    <input
                      type="text"
                      value={formNome}
                      onChange={(e) => setFormNome(e.target.value)}
                      className="w-full border border-gray-200 text-xs rounded px-2.5 py-2 focus:outline-none focus:border-[#0339A6]"
                      required
                    />
                  </div>

                  {/* BI relacionado */}
                  <div className="space-y-1">
                    <label className="block text-[10px] text-gray-400 uppercase font-bold">BI Relacionado</label>
                    <input
                      type="text"
                      value={formBi}
                      onChange={(e) => setFormBi(e.target.value)}
                      className="w-full border border-gray-200 text-xs rounded px-2.5 py-2 focus:outline-none focus:border-[#0339A6]"
                    />
                  </div>

                  {/* Categoria */}
                  <div className="space-y-1">
                    <label className="block text-[10px] text-gray-400 uppercase font-bold">Categoria</label>
                    <select
                      value={formCategory}
                      onChange={(e) => setFormCategory(e.target.value as ActivityCategory)}
                      className="w-full border border-gray-200 text-xs rounded px-2.5 py-2 focus:outline-none focus:border-[#0339A6]"
                    >
                      <option value="BI">BI (Painel Analítico)</option>
                      <option value="BASE">BASE (Carga Operacional)</option>
                      <option value="LOG">LOG (Atividades de Auditoria)</option>
                      <option value="OUTRA">OUTRA (Rotinas Gerais)</option>
                      <option value="SOB_DEMANDA">SOB_DEMANDA (Não programada)</option>
                    </select>
                  </div>

                  {/* Frequência */}
                  <div className="space-y-1">
                    <label className="block text-[10px] text-gray-400 uppercase font-bold">Frequência</label>
                    <select
                      value={formFrequency}
                      onChange={(e) => setFormFrequency(e.target.value as ActivityFrequency)}
                      className="w-full border border-gray-200 text-xs rounded px-2.5 py-2 focus:outline-none focus:border-[#0339A6]"
                    >
                      <option value="DIARIA">Diária</option>
                      <option value="SEMANAL">Semanal</option>
                      <option value="QUINZENAL">Quinzenal</option>
                      <option value="MENSAL">Mensal</option>
                      <option value="MARCO_MENSAL">Marco Mensal</option>
                      <option value="SOB_DEMANDA">Sob Demanda</option>
                    </select>
                  </div>

                  {/* Horários */}
                  <div className="space-y-1">
                    <label className="block text-[10px] text-gray-400 uppercase font-bold">Horário(s) (separados por vírgula)</label>
                    <input
                      type="text"
                      value={formHorario}
                      onChange={(e) => setFormHorario(e.target.value)}
                      className="w-full border border-gray-200 text-xs rounded px-2.5 py-2 focus:outline-none focus:border-[#0339A6]"
                      placeholder="08:30, 14:00"
                    />
                  </div>

                  {/* Dias da Semana */}
                  <div className="space-y-1">
                    <label className="block text-[10px] text-gray-400 uppercase font-bold">Dias da Semana (separados por vírgula)</label>
                    <input
                      type="text"
                      value={formDiasSemana}
                      onChange={(e) => setFormDiasSemana(e.target.value)}
                      className="w-full border border-gray-200 text-xs rounded px-2.5 py-2 focus:outline-none focus:border-[#0339A6]"
                      placeholder="Segunda, Terça, Quarta..."
                    />
                  </div>

                  {/* Prioridade */}
                  <div className="space-y-1">
                    <label className="block text-[10px] text-gray-400 uppercase font-bold">Prioridade</label>
                    <select
                      value={formPriority}
                      onChange={(e) => setFormPriority(e.target.value as ActivityPriority)}
                      className="w-full border border-gray-200 text-xs rounded px-2.5 py-2 focus:outline-none focus:border-[#0339A6]"
                    >
                      <option value="P0">P0 (Imediata)</option>
                      <option value="P1">P1 (Alta)</option>
                      <option value="P2">P2 (Média)</option>
                      <option value="P3">P3 (Informativa)</option>
                    </select>
                  </div>

                  {/* Criticidade */}
                  <div className="space-y-1">
                    <label className="block text-[10px] text-gray-400 uppercase font-bold">Criticidade</label>
                    <select
                      value={formCriticism}
                      onChange={(e) => setFormCriticism(e.target.value as ActivityCriticism)}
                      className="w-full border border-gray-200 text-xs rounded px-2.5 py-2 focus:outline-none focus:border-[#0339A6]"
                    >
                      <option value="CRITICA">Crítica</option>
                      <option value="ALTA">Alta</option>
                      <option value="MEDIA">Média</option>
                      <option value="BAIXA">Baixa</option>
                    </select>
                  </div>

                  {/* Tipo Execução */}
                  <div className="space-y-1">
                    <label className="block text-[10px] text-gray-400 uppercase font-bold">Tipo de Execução</label>
                    <select
                      value={formExecType}
                      onChange={(e) => setFormExecType(e.target.value as ActivityExecutionType)}
                      className="w-full border border-gray-200 text-xs rounded px-2.5 py-2 focus:outline-none focus:border-[#0339A6]"
                    >
                      <option value="MANUAL">Manual</option>
                      <option value="AUTOMATICA">Automática</option>
                      <option value="SEMIAUTOMATICA">Semiautomática</option>
                      <option value="CONTINGENCIA">Contingência</option>
                    </select>
                  </div>
                </div>

                {/* Objetivos / Impacto */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="block text-[10px] text-gray-400 uppercase font-bold">Objetivo Operacional</label>
                    <textarea
                      value={formObjetivo}
                      onChange={(e) => setFormObjetivo(e.target.value)}
                      className="w-full border border-gray-200 text-xs rounded px-2.5 py-2 h-16 resize-none focus:outline-none focus:border-[#0339A6]"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="block text-[10px] text-gray-400 uppercase font-bold">Impacto no Negócio</label>
                    <textarea
                      value={formImpacto}
                      onChange={(e) => setFormImpacto(e.target.value)}
                      className="w-full border border-gray-200 text-xs rounded px-2.5 py-2 h-16 resize-none focus:outline-none focus:border-[#0339A6]"
                    />
                  </div>
                </div>

                {/* Listas Multi-linha (Diretórios, Scripts, Arquivos, Instruções) */}
                <div className="space-y-3">
                  <div className="space-y-1">
                    <label className="block text-[10px] text-gray-400 uppercase font-bold">Instruções Operacionais (uma por linha)</label>
                    <textarea
                      value={formInstrucoes}
                      onChange={(e) => setFormInstrucoes(e.target.value)}
                      className="w-full border border-gray-200 text-xs rounded px-2.5 py-2 h-24 focus:outline-none focus:border-[#0339A6]"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-1">
                      <label className="block text-[10px] text-gray-400 uppercase font-bold">Caminhos / Diretórios UNC</label>
                      <textarea
                        value={formDiretorios}
                        onChange={(e) => setFormDiretorios(e.target.value)}
                        className="w-full border border-gray-200 text-xs rounded px-2.5 py-2 h-20 focus:outline-none focus:border-[#0339A6]"
                        placeholder="\\\\10.1.17.4\\..."
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="block text-[10px] text-gray-400 uppercase font-bold">Arquivos Associados</label>
                      <textarea
                        value={formArquivos}
                        onChange={(e) => setFormArquivos(e.target.value)}
                        className="w-full border border-gray-200 text-xs rounded px-2.5 py-2 h-20 focus:outline-none focus:border-[#0339A6]"
                        placeholder="dados.xlsx"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="block text-[10px] text-gray-400 uppercase font-bold">Scripts Python / Bat</label>
                      <textarea
                        value={formScripts}
                        onChange={(e) => setFormScripts(e.target.value)}
                        className="w-full border border-gray-200 text-xs rounded px-2.5 py-2 h-20 focus:outline-none focus:border-[#0339A6]"
                        placeholder="script.py"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="block text-[10px] text-gray-400 uppercase font-bold">Instruções de Contingência (uma por linha)</label>
                    <textarea
                      value={formContingencia}
                      onChange={(e) => setFormContingencia(e.target.value)}
                      className="w-full border border-gray-200 text-xs rounded px-2.5 py-2 h-16 focus:outline-none focus:border-[#0339A6]"
                    />
                  </div>
                </div>

                {/* Ações do Form */}
                <div className="flex items-center justify-end gap-2 border-t border-gray-100 pt-3">
                  <button
                    type="button"
                    onClick={() => { setEditingActivity(null); setIsAddingNew(false); }}
                    className="bg-gray-100 text-gray-700 font-bold text-xs px-4 py-2 rounded hover:bg-gray-200 transition"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="bg-[#0339A6] text-white font-black text-xs px-5 py-2 rounded hover:bg-[#022b80] transition"
                  >
                    Salvar Atividade
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* --- ABA: IDENTIDADE VISUAL DA EQUIPE --- */}
      {activeSubTab === 'identity' && (
        <div className="bg-white rounded-xl shadow border border-gray-100 p-6 space-y-6 animate-fade-in">
          <div className="border-b border-gray-100 pb-3 flex items-center justify-between">
            <div>
              <h2 className="text-sm font-black font-sora text-gray-900 uppercase tracking-wider">Identidade da Equipe Optimus BI</h2>
              <p className="text-xs text-gray-400">Personalize o logotipo, paleta de cores e o tema visual do sistema de rotinas.</p>
            </div>
            <button
              onClick={handleResetIdentity}
              className="text-xs text-red-600 hover:text-red-800 border border-red-200 px-3 py-1 rounded-md font-bold"
            >
              Resetar para o Padrão
            </button>
          </div>

          <form onSubmit={handleSaveIdentity} className="space-y-4 max-w-xl">
            {/* Nome da Equipe */}
            <div className="space-y-1">
              <label className="block text-[10px] text-gray-400 uppercase font-bold">Nome da Equipe</label>
              <input
                type="text"
                value={teamNameForm}
                onChange={(e) => setTeamNameForm(e.target.value)}
                className="w-full border border-gray-200 text-xs rounded px-2.5 py-2 focus:outline-none focus:border-[#0339A6]"
                required
              />
            </div>

            {/* URL da Logo */}
            <div className="space-y-1">
              <label className="block text-[10px] text-gray-400 uppercase font-bold">URL do Logotipo da Equipe</label>
              <input
                type="text"
                value={logoUrlForm}
                onChange={(e) => setLogoUrlForm(e.target.value)}
                className="w-full border border-gray-200 text-xs rounded px-2.5 py-2 focus:outline-none focus:border-[#0339A6]"
                placeholder="https://exemplo.com/logo.png (Deixe vazio para placeholder elegante)"
              />
              <span className="text-[10px] text-gray-400 block mt-0.5">Se deixado em branco, mostraremos um banner moderno da Optimus BI no cabeçalho.</span>
            </div>

            {/* Cores */}
            <div className="grid grid-cols-2 gap-4 pt-2">
              <div className="space-y-1">
                <label className="block text-[10px] text-gray-400 uppercase font-bold">Cor Principal (Primária)</label>
                <div className="flex gap-2">
                  <input
                    type="color"
                    value={primaryColorForm}
                    onChange={(e) => setPrimaryColorForm(e.target.value)}
                    className="h-9 w-9 rounded border border-gray-200 cursor-pointer shrink-0"
                  />
                  <input
                    type="text"
                    value={primaryColorForm}
                    onChange={(e) => setPrimaryColorForm(e.target.value)}
                    className="w-full border border-gray-200 text-xs rounded px-2.5 py-1.5 focus:outline-none focus:border-[#0339A6] font-mono"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-[10px] text-gray-400 uppercase font-bold">Cor Secundária</label>
                <div className="flex gap-2">
                  <input
                    type="color"
                    value={secondaryColorForm}
                    onChange={(e) => setSecondaryColorForm(e.target.value)}
                    className="h-9 w-9 rounded border border-gray-200 cursor-pointer shrink-0"
                  />
                  <input
                    type="text"
                    value={secondaryColorForm}
                    onChange={(e) => setSecondaryColorForm(e.target.value)}
                    className="w-full border border-gray-200 text-xs rounded px-2.5 py-1.5 focus:outline-none focus:border-[#0339A6] font-mono"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-[10px] text-gray-400 uppercase font-bold">Cor de Destaque (Accent)</label>
                <div className="flex gap-2">
                  <input
                    type="color"
                    value={accentColorForm}
                    onChange={(e) => setAccentColorForm(e.target.value)}
                    className="h-9 w-9 rounded border border-gray-200 cursor-pointer shrink-0"
                  />
                  <input
                    type="text"
                    value={accentColorForm}
                    onChange={(e) => setAccentColorForm(e.target.value)}
                    className="w-full border border-gray-200 text-xs rounded px-2.5 py-1.5 focus:outline-none focus:border-[#0339A6] font-mono"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-[10px] text-gray-400 uppercase font-bold">Cor de Fundo (Canvas)</label>
                <div className="flex gap-2">
                  <input
                    type="color"
                    value={backgroundColorForm}
                    onChange={(e) => setBackgroundColorForm(e.target.value)}
                    className="h-9 w-9 rounded border border-gray-200 cursor-pointer shrink-0"
                  />
                  <input
                    type="text"
                    value={backgroundColorForm}
                    onChange={(e) => setBackgroundColorForm(e.target.value)}
                    className="w-full border border-gray-200 text-xs rounded px-2.5 py-1.5 focus:outline-none focus:border-[#0339A6] font-mono"
                  />
                </div>
              </div>
            </div>

            <div className="border-t border-gray-100 pt-4 flex items-center justify-end gap-2">
              <button
                type="submit"
                className="bg-[#0339A6] text-white font-black text-xs px-6 py-2.5 rounded-lg hover:bg-[#022b80] transition shadow-sm"
              >
                Aplicar Nova Identidade Visual
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
