import React, { useState } from 'react';
import { Activity } from '../types';
import { Folder, Copy, Check, ChevronRight } from 'lucide-react';

interface NetworkPathsProps {
  activities: Activity[];
}

export const NetworkPaths: React.FC<NetworkPathsProps> = ({ activities }) => {
  const [copiedPath, setCopiedPath] = useState<string | null>(null);

  const handleCopy = (path: string) => {
    navigator.clipboard.writeText(path);
    setCopiedPath(path);
    setTimeout(() => setCopiedPath(null), 2000);
  };

  // Extrai e unifica todos os caminhos das atividades
  const allPaths = activities.flatMap(act => 
    (act.paths || []).map(p => ({
      activityName: act.name,
      label: p.label,
      path: p.path
    }))
  );

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="bg-white rounded-xl shadow border border-gray-100 p-5 md:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-sora font-black text-xl text-gray-900 flex items-center gap-2">
            <Folder className="h-6 w-6 text-[#0339A6]" /> Diretórios e Pastas de Rede
          </h2>
          <p className="text-xs text-gray-400 mt-1">Central rápida para copiar atalhos corporativos sem precisar abrir as atividades.</p>
        </div>
        <span className="text-xs font-bold text-[#0339A6] bg-blue-50 px-3 py-1.5 rounded-lg border border-blue-100">
          {allPaths.length} caminhos mapeados
        </span>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {allPaths.map((item, idx) => (
          <div key={idx} className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:border-blue-300 transition">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5 mb-1.5">
                <span className="text-[10px] font-extrabold uppercase bg-gray-100 text-gray-500 px-2 py-0.5 rounded">
                  {item.label}
                </span>
                <ChevronRight className="h-3 w-3 text-gray-300" />
                <span className="text-xs font-bold text-gray-700 truncate">
                  {item.activityName}
                </span>
              </div>
              <code className="block text-xs font-mono text-[#0339A6] bg-blue-50/50 p-2 rounded border border-blue-50 truncate">
                {item.path}
              </code>
            </div>
            
            <button
              onClick={() => handleCopy(item.path)}
              className={`flex-shrink-0 px-4 py-2.5 text-xs font-bold rounded-lg transition flex items-center justify-center gap-1.5 min-w-[120px] ${
                copiedPath === item.path
                  ? 'bg-green-100 text-green-700 border border-green-200'
                  : 'bg-[#F2F2F2] hover:bg-gray-200 text-gray-700 border border-gray-200'
              }`}
            >
              {copiedPath === item.path ? (
                <>
                  <Check className="h-4 w-4" /> Copiado!
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4" /> Copiar Caminho
                </>
              )}
            </button>
          </div>
        ))}

        {allPaths.length === 0 && (
          <div className="text-center py-12 text-gray-400">
            Nenhum caminho de rede cadastrado nas atividades atuais.
          </div>
        )}
      </div>
    </div>
  );
};