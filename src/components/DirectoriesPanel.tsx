import React, { useState, useMemo } from 'react';
import { Directory, Activity } from '../types';
import { storageService } from '../services/storageService';
import { Search, Copy, Check, Folder, Info, Filter, ArrowUpRight } from 'lucide-react';

interface DirectoriesPanelProps {
  activities: Activity[];
  onSelectExecutionByActivityId: (actId: string) => void;
}

export const DirectoriesPanel: React.FC<DirectoriesPanelProps> = ({
  activities,
  onSelectExecutionByActivityId
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterPriority, setFilterPriority] = useState<string>('ALL');
  const [filterBi, setFilterBi] = useState<string>('ALL');
  const [filterType, setFilterType] = useState<string>('ALL');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Carregar os diretórios dinamicamente a partir do storageService
  const directories: Directory[] = useMemo(() => {
    return storageService.getAllDirectories();
  }, [activities]);

  // Lista única de BIs relacionados para o dropdown de filtros
  const uniqueBis = useMemo(() => {
    const list = directories.map(d => d.biRelacionado).filter(b => b && b !== 'Múltiplos');
    return Array.from(new Set(list)).sort();
  }, [directories]);

  // Lista única de tipos para o dropdown de filtros
  const uniqueTypes = useMemo(() => {
    const list = directories.map(d => d.tipo);
    return Array.from(new Set(list)).sort();
  }, [directories]);

  // Função para copiar caminho
  const handleCopyPath = (pathStr: string, dirId: string) => {
    navigator.clipboard.writeText(pathStr);
    setCopiedId(dirId);
    setTimeout(() => {
      setCopiedId(null);
    }, 2000);
  };

  // Filtragem inteligente
  const filteredDirectories = useMemo(() => {
    return directories.filter(dir => {
      // 1. Busca textual (nome ou caminho)
      const matchesSearch = 
        dir.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
        dir.caminho.toLowerCase().includes(searchTerm.toLowerCase()) ||
        dir.uso.toLowerCase().includes(searchTerm.toLowerCase());

      // 2. Filtro de prioridade
      const matchesPriority = filterPriority === 'ALL' || dir.prioridade === filterPriority;

      // 3. Filtro de BI relacionado
      const matchesBi = filterBi === 'ALL' || dir.biRelacionado === filterBi;

      // 4. Filtro de tipo de processo
      const matchesType = filterType === 'ALL' || dir.tipo === filterType;

      return matchesSearch && matchesPriority && matchesBi && matchesType;
    });
  }, [directories, searchTerm, filterPriority, filterBi, filterType]);

  return (
    <div className="bg-white rounded-xl shadow border border-gray-100 p-6 space-y-6 animate-fade-in">
      <div>
        <h2 className="font-sora font-black text-xl text-gray-900">Mapa e Repositório de Diretórios</h2>
        <p className="text-xs text-gray-400 mt-1">
          Lista e caminhos de pastas de rede, servidores SQL, orquestradores e executáveis mapeados para as auditorias da Karine.
        </p>
      </div>

      {/* Busca e Barra de Filtros */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-gray-50 p-4 rounded-xl border border-gray-100">
        {/* Input de Busca */}
        <div className="relative md:col-span-2">
          <Search className="absolute left-3.5 top-3 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Pesquisar diretório, servidor, finalidade..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-lg text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#0339A6] focus:border-transparent transition-all"
          />
        </div>

        {/* Filtro Prioridade */}
        <div className="relative">
          <select
            value={filterPriority}
            onChange={e => setFilterPriority(e.target.value)}
            className="w-full pl-3 pr-8 py-2.5 bg-white border border-gray-200 rounded-lg text-xs font-bold text-gray-600 focus:outline-none focus:ring-2 focus:ring-[#0339A6] focus:border-transparent appearance-none"
          >
            <option value="ALL">Prioridade: Todas</option>
            <option value="P0">P0 (Crítica)</option>
            <option value="P1">P1 (Alta)</option>
            <option value="P2">P2 (Média)</option>
            <option value="P3">P3 (Baixa)</option>
          </select>
          <Filter className="absolute right-3 top-3.5 h-3.5 w-3.5 text-gray-400 pointer-events-none" />
        </div>

        {/* Filtro BI */}
        <div className="relative">
          <select
            value={filterBi}
            onChange={e => setFilterBi(e.target.value)}
            className="w-full pl-3 pr-8 py-2.5 bg-white border border-gray-200 rounded-lg text-xs font-bold text-gray-600 focus:outline-none focus:ring-2 focus:ring-[#0339A6] focus:border-transparent appearance-none"
          >
            <option value="ALL">Power BI: Todos</option>
            {uniqueBis.map((biName, idx) => (
              <option key={idx} value={biName}>{biName}</option>
            ))}
          </select>
          <Filter className="absolute right-3 top-3.5 h-3.5 w-3.5 text-gray-400 pointer-events-none" />
        </div>
      </div>

      {/* Grid de Cards de Diretórios (Não aninhados, design clean flat) */}
      {filteredDirectories.length === 0 ? (
        <div className="text-center py-12 text-gray-400 border border-dashed border-gray-200 rounded-xl bg-gray-50/50">
          <Info className="h-8 w-8 mx-auto text-gray-300 stroke-1 mb-2" />
          <p className="text-sm font-semibold text-gray-600">Nenhum diretório encontrado</p>
          <p className="text-xs text-gray-400 mt-1">Experimente alterar as palavras-chave ou remover filtros.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredDirectories.map(dir => (
            <div 
              key={dir.id}
              className="bg-white border border-gray-100 rounded-xl p-5 hover:shadow-md hover:border-gray-200 transition-all flex flex-col justify-between gap-4 relative overflow-hidden"
            >
              {/* Badge Categoria */}
              <div className="flex items-center justify-between gap-2 border-b border-gray-50 pb-3">
                <span className="text-[10px] font-black uppercase text-[#0339A6] flex items-center gap-1.5">
                  <Folder className="h-3.5 w-3.5 text-[#F2B705]" />
                  {dir.tipo}
                </span>
                <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-bold ${
                  dir.prioridade === 'P0' ? 'bg-red-50 text-red-700 border border-red-100' :
                  dir.prioridade === 'P1' ? 'bg-blue-50 text-blue-700 border border-blue-100' :
                  dir.prioridade === 'P2' ? 'bg-amber-50 text-amber-700 border border-amber-100' :
                  'bg-gray-100 text-gray-600 border border-gray-200'
                }`}>
                  {dir.prioridade}
                </span>
              </div>

              {/* Informações Principais */}
              <div className="space-y-1">
                <h3 className="font-sora font-extrabold text-sm text-gray-900 truncate" title={dir.nome}>
                  {dir.nome}
                </h3>
                <p className="text-xs text-gray-500 font-medium line-clamp-2 leading-relaxed" title={dir.uso}>
                  {dir.uso}
                </p>
                {dir.biRelacionado && (
                  <span className="inline-block text-[10px] text-[#0339A6] bg-blue-50/50 font-bold px-2 py-0.5 rounded border border-blue-50 mt-1">
                    BI: {dir.biRelacionado}
                  </span>
                )}
              </div>

              {/* Box do Caminho literal e Cópia */}
              <div className="bg-gray-50 border border-gray-100 rounded-lg p-2.5 flex items-center justify-between gap-3 font-mono text-[10px] text-gray-600 overflow-hidden">
                <span className="truncate select-all leading-relaxed" title={dir.caminho}>
                  {dir.caminho}
                </span>
                <button
                  onClick={() => handleCopyPath(dir.caminho, dir.id)}
                  className="flex-shrink-0 p-1.5 rounded-md hover:bg-gray-200 text-gray-400 hover:text-gray-800 transition"
                  title="Copiar caminho para área de transferência"
                >
                  {copiedId === dir.id ? (
                    <Check className="h-3.5 w-3.5 text-green-600" />
                  ) : (
                    <Copy className="h-3.5 w-3.5" />
                  )}
                </button>
              </div>

              {/* Botão de Link de Atividade */}
              <div className="flex justify-end pt-1 border-t border-gray-50">
                <button
                  onClick={() => onSelectExecutionByActivityId(dir.atividadeId)}
                  className="text-[10px] font-bold text-[#0339A6] hover:text-[#022b80] flex items-center gap-1 transition"
                >
                  Abrir Atividade Vinculada <ArrowUpRight className="h-3 w-3" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Nota corporativa */}
      <div className="bg-[#E8F5E9]/50 border border-green-100 rounded-xl p-4 flex gap-3 text-[11px] text-green-900 leading-relaxed">
        <Info className="h-5 w-5 text-green-600 flex-shrink-0" />
        <div>
          <strong className="block text-green-950 font-bold mb-0.5">Segurança de Rede e Sandbox do Navegador</strong>
          Os caminhos listados acima representam diretórios UNC do servidor ou unidades mapeadas no Windows da retaguarda Hapvida (ex: <strong>G:\Credenciamento Medico\...</strong>). Por limitações de segurança e sandbox do protocolo de navegação web, pastas locais e de rede não podem ser iniciadas ou exploradas diretamente pelo browser. Use os botões de cópia para colar rapidamente as rotas no seu Windows Explorer corporativo.
        </div>
      </div>
    </div>
  );
};
