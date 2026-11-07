import React, { useState } from 'react';
import { PenTool, FileSpreadsheet } from 'lucide-react';
import { CadastroManualForm } from './CadastroManualForm';
import { PlanilhaImportador } from './PlanilhaImportador';

export function NovoProdutoTabs() {
  const [activeTab, setActiveTab] = useState<'manual' | 'planilha'>('manual');

  return (
    <main className="max-w-[1520px] mx-auto px-4 sm:px-6 py-8">
      {/* Top Header com Toggle de Abas */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 pb-5 border-b border-slate-200">
        <div>
          <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400">
            Módulo de Entrada
          </span>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Cadastrar Rodas Automotivas
          </h1>
        </div>

        {/* Abas */}
        <div className="inline-flex bg-slate-200/80 p-1 rounded-full border border-slate-200 self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setActiveTab('manual')}
            className={`inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider px-4 py-2 rounded-full transition-all ${
              activeTab === 'manual'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <PenTool className="w-3.5 h-3.5" />
            <span>Cadastro Manual & Preview</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('planilha')}
            className={`inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider px-4 py-2 rounded-full transition-all ${
              activeTab === 'planilha'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span>Importação em Massa (CSV/Excel)</span>
          </button>
        </div>
      </div>

      {/* Conteúdo da Aba */}
      {activeTab === 'manual' ? <CadastroManualForm /> : <PlanilhaImportador />}
    </main>
  );
}
