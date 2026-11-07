import React from 'react';
import { Search, RotateCcw, Filter, CheckCircle2, Box } from 'lucide-react';
import type { FiltrosCatalogo, Produto } from '@/lib/schemas/produto';
import type { CatalogoProdutosResponse } from '@/hooks/useProdutosQuery';

interface Props {
  filtros: FiltrosCatalogo;
  onFiltrosChange: (filtros: FiltrosCatalogo) => void;
  produtos: Produto[];
  facetas?: CatalogoProdutosResponse['facetas'];
}

export function SidebarFiltros({ filtros, onFiltrosChange, produtos, facetas }: Props) {
  // Extrai facetas dinâmicas e calcula contadores
  const marcasDisponiveis = Array.from(new Set(produtos.map((p) => p.marca.toUpperCase()))).sort();
  const arosDisponiveis = Array.from(new Set(produtos.map((p) => p.aro))).sort((a, b) => a - b);
  const talasDisponiveis = Array.from(new Set(produtos.map((p) => p.tala))).sort((a, b) => a - b);
  const furacoesDisponiveis = Array.from(new Set(produtos.map((p) => p.furacao))).sort();
  const acabamentosDisponiveis = Array.from(
    new Set(produtos.map((p) => p.acabamento || 'Padrão').filter((v) => v.length > 0))
  ).sort();
  const condicoesDisponiveis = Array.from(
    new Set(produtos.map((p) => p.condicao || 'Nova').filter((v) => v.length > 0))
  ).sort();
  const cabecasChaveDisponiveis = (facetas?.cabecasChave ?? [])
    .map((faceta) => String(faceta.valor))
    .filter((valor) => valor.length > 0)
    .sort();

  const handleSearch = (q: string) => {
    onFiltrosChange({ ...filtros, q });
  };

  const limparFiltros = () => {
    onFiltrosChange({
      q: '',
      marca: undefined,
      aro: undefined,
      tala: undefined,
      furacao: undefined,
      cabeca_chave: undefined,
      acabamento: undefined,
      condicao: undefined,
      status: undefined,
      apenasEstoque: false,
      ordenacao: 'recentes',
    });
  };

  const temFiltroAtivo = !!(
    filtros.q ||
    filtros.marca ||
    filtros.aro ||
    filtros.tala ||
    filtros.furacao ||
    filtros.cabeca_chave ||
    filtros.acabamento ||
    filtros.condicao ||
    filtros.status !== undefined ||
    filtros.apenasEstoque
  );

  return (
    <aside className="w-full lg:w-[280px] shrink-0 flex flex-col gap-5">
      {/* Input de Busca Multi-termo Instantâneo */}
      <div className="flex flex-col gap-1.5">
        <label className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500">
          Busca Instantânea
        </label>
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={filtros.q || ''}
            onChange={(e) => handleSearch(e.target.value)}
            placeholder="Ex: Scorro 15 4x100, SKU..."
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-yellow-400 focus:ring-2 focus:ring-yellow-100 transition-all shadow-xs"
          />
        </div>
      </div>

      {/* Filtro Rápido de Status e Estoque */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs flex flex-col gap-3">
        <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400 block">
          Status & Estoque
        </span>
        
        {/* Toggle Status Ativo / Inativo */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
          <button
            type="button"
            onClick={() => onFiltrosChange({ ...filtros, status: undefined })}
            className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${
              filtros.status === undefined ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
            }`}
          >
            Todos
          </button>
          <button
            type="button"
            onClick={() => onFiltrosChange({ ...filtros, status: 'Ativo' })}
            className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${
              filtros.status === 'Ativo' ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-600'
            }`}
          >
            Ativos
          </button>
          <button
            type="button"
            onClick={() => onFiltrosChange({ ...filtros, status: 'Inativo' })}
            className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${
              filtros.status === 'Inativo' ? 'bg-slate-800 text-white shadow-xs' : 'text-slate-600'
            }`}
          >
            Inativos
          </button>
        </div>

        <label className="flex items-center gap-2.5 text-xs font-semibold text-slate-800 cursor-pointer select-none pt-1 border-t border-slate-100">
          <input
            type="checkbox"
            checked={!!filtros.apenasEstoque}
            onChange={(e) =>
              onFiltrosChange({
                ...filtros,
                apenasEstoque: e.target.checked,
              })
            }
            className="w-4 h-4 accent-emerald-600 rounded cursor-pointer"
          />
          <span className="flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            Apenas com saldo em depósito
          </span>
        </label>
      </div>

      {/* Cabeçalho da Sidebar */}
      <div className="flex items-center justify-between pb-2 border-b border-slate-200">
        <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-700">
          <Filter className="w-3.5 h-3.5 text-yellow-400" />
          <span>Filtros Facetados</span>
        </div>
        {temFiltroAtivo && (
          <button
            onClick={limparFiltros}
            className="inline-flex items-center gap-1 text-[11px] font-bold text-red-600 hover:text-red-700 transition-colors"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Limpar</span>
          </button>
        )}
      </div>

      {/* Acordeão / Grupo: Marca */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs">
        <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400 mb-2.5 block">
          Marca
        </span>
        <div className="flex flex-col gap-1.5 max-h-48 overflow-y-auto pr-1">
          {marcasDisponiveis.map((marca) => {
            const count = produtos.filter((p) => p.marca.toUpperCase() === marca).length;
            const isSelected = filtros.marca?.toUpperCase() === marca;
            return (
              <label
                key={marca}
                className="flex items-center justify-between text-xs cursor-pointer select-none py-1 hover:text-yellow-400 group"
              >
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() =>
                      onFiltrosChange({
                        ...filtros,
                        marca: isSelected ? undefined : marca,
                      })
                    }
                    className="w-3.5 h-3.5 accent-yellow-400 rounded cursor-pointer"
                  />
                  <span className={isSelected ? 'font-bold text-yellow-400' : 'text-slate-700'}>
                    {marca}
                  </span>
                </div>
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-slate-100 text-slate-500 group-hover:bg-yellow-50 group-hover:text-yellow-400">
                  {count}
                </span>
              </label>
            );
          })}
        </div>
      </div>

      {/* Acordeão / Grupo: Aro (Diâmetro) */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs">
        <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400 mb-2.5 block">
          Aro (Diâmetro)
        </span>
        <div className="flex flex-wrap gap-1.5">
          {arosDisponiveis.map((aro) => {
            const count = produtos.filter((p) => p.aro === aro).length;
            const isSelected = filtros.aro === aro;
            return (
              <button
                key={aro}
                type="button"
                onClick={() =>
                  onFiltrosChange({
                    ...filtros,
                    aro: isSelected ? undefined : aro,
                  })
                }
                className={`text-xs px-3 py-1.5 rounded-xl border transition-all flex items-center gap-1.5 ${
                  isSelected
                    ? 'bg-slate-900 border-slate-900 text-white font-bold shadow-xs'
                    : 'bg-slate-50 border-slate-200 hover:border-slate-300 text-slate-700'
                }`}
              >
                <span>Aro {aro}"</span>
                <span
                  className={`text-[10px] px-1 rounded-full ${
                    isSelected ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-600'
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Acordeão / Grupo: Furação (PCD) */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs">
        <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400 mb-2.5 block">
          Furação (PCD)
        </span>
        <div className="flex flex-col gap-1.5 max-h-48 overflow-y-auto pr-1">
          {furacoesDisponiveis.map((furacao) => {
            const count = produtos.filter((p) => p.furacao === furacao).length;
            const isSelected = filtros.furacao === furacao;
            return (
              <label
                key={furacao}
                className="flex items-center justify-between text-xs cursor-pointer select-none py-1 hover:text-yellow-400 group"
              >
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() =>
                      onFiltrosChange({
                        ...filtros,
                        furacao: isSelected ? undefined : furacao,
                      })
                    }
                    className="w-3.5 h-3.5 accent-yellow-400 rounded cursor-pointer"
                  />
                  <span className={isSelected ? 'font-bold text-yellow-400' : 'text-slate-700'}>
                    {furacao}
                  </span>
                </div>
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-slate-100 text-slate-500 group-hover:bg-yellow-50 group-hover:text-yellow-400">
                  {count}
                </span>
              </label>
            );
          })}
        </div>
      </div>

      {/* Acordeão / Grupo: Condição */}
      {condicoesDisponiveis.length > 0 && (
        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs">
          <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400 mb-2.5 block">
            Condição
          </span>
          <div className="flex flex-wrap gap-1.5">
            {condicoesDisponiveis.map((cond) => {
              const isSelected = filtros.condicao === cond;
              return (
                <button
                  key={cond}
                  type="button"
                  onClick={() =>
                    onFiltrosChange({
                      ...filtros,
                      condicao: isSelected ? undefined : cond,
                    })
                  }
                  className={`text-xs px-2.5 py-1 rounded-xl border transition-all ${
                    isSelected
                      ? 'bg-slate-900 border-slate-900 text-white font-bold'
                      : 'bg-slate-50 border-slate-200 hover:border-slate-300 text-slate-700'
                  }`}
                >
                  {cond}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Acordeão / Grupo: Cabeça de Chave */}
      {cabecasChaveDisponiveis.length > 0 && (
        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs">
          <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400 mb-2.5 block">
            Cabeça de Chave
          </span>
          <div className="flex flex-col gap-1.5 max-h-48 overflow-y-auto pr-1">
            {cabecasChaveDisponiveis.map((cabeca) => {
              const faceta = facetas?.cabecasChave.find((item) => String(item.valor) === cabeca);
              const isSelected = filtros.cabeca_chave?.toUpperCase() === cabeca.toUpperCase();
              return (
                <label
                  key={cabeca}
                  className="flex items-center justify-between text-xs cursor-pointer select-none py-1 hover:text-yellow-400 group"
                >
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() =>
                        onFiltrosChange({
                          ...filtros,
                          cabeca_chave: isSelected ? undefined : cabeca,
                        })
                      }
                      className="w-3.5 h-3.5 accent-yellow-400 rounded cursor-pointer"
                    />
                    <span className={isSelected ? 'font-bold text-yellow-400' : 'text-slate-700'}>
                      {cabeca}
                    </span>
                  </div>
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-slate-100 text-slate-500 group-hover:bg-yellow-50 group-hover:text-yellow-400">
                    {faceta?.total ?? 0}
                  </span>
                </label>
              );
            })}
          </div>
        </div>
      )}

      {/* Acordeão / Grupo: Tala */}
      {talasDisponiveis.length > 0 && (
        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs">
          <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400 mb-2.5 block">
            Tala (Largura)
          </span>
          <div className="flex flex-wrap gap-1.5">
            {talasDisponiveis.map((tala) => {
              const count = produtos.filter((p) => p.tala === tala).length;
              const isSelected = filtros.tala === tala;
              return (
                <button
                  key={tala}
                  type="button"
                  onClick={() =>
                    onFiltrosChange({
                      ...filtros,
                      tala: isSelected ? undefined : tala,
                    })
                  }
                  className={`text-xs px-2.5 py-1 rounded-xl border transition-all flex items-center gap-1 ${
                    isSelected
                      ? 'bg-slate-900 border-slate-900 text-white font-bold'
                      : 'bg-slate-50 border-slate-200 hover:border-slate-300 text-slate-700'
                  }`}
                >
                  <span>{tala}"</span>
                  <span
                    className={`text-[10px] px-1 rounded-full ${
                      isSelected ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-600'
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </aside>
  );
}
