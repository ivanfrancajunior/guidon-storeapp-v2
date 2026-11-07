import React, { useState } from 'react';
import { LayoutGrid, List, SearchX, ArrowUpDown } from 'lucide-react';
import { SidebarFiltros } from './SidebarFiltros';
import { ProdutoCard } from './ProdutoCard';
import { ProdutoPreviewModal } from './ProdutoPreviewModal';
import { useDebounce } from '@/hooks/useDebounce';
import { useProdutosQuery } from '@/hooks/useProdutosQuery';
import { QueryProvider } from '@/components/providers/QueryProvider';
import type { Produto, FiltrosCatalogo } from '@/lib/schemas/produto';

function CatalogoPrincipalContent() {
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [filtros, setFiltros] = useState<FiltrosCatalogo>({
    q: '',
    marca: undefined,
    aro: undefined,
    tala: undefined,
    furacao: undefined,
    cabeca_chave: undefined,
    disponivel: undefined,
    apenasEstoque: false,
    ordenacao: 'recentes',
  });

  const [previewProduto, setPreviewProduto] = useState<Produto | null>(null);

  // Debounce de 150ms no termo de busca conforme especificado
  const debouncedQ = useDebounce(filtros.q, 150);

  const queryFiltros: FiltrosCatalogo = {
    ...filtros,
    q: debouncedQ,
  };

  const { data: produtos = [], isLoading, isError, error } = useProdutosQuery(queryFiltros);

  return (
    <div className="max-w-[1720px] mx-auto px-4 sm:px-6 py-6 sm:py-8 flex flex-col lg:flex-row gap-8">
      {/* Sidebar com filtros facetados e busca reativa */}
      <SidebarFiltros
        filtros={filtros}
        onFiltrosChange={setFiltros}
        produtos={produtos}
      />

      {/* Conteúdo Principal do Catálogo */}
      <main className="flex-1 min-w-0">
        {/* Header do Catálogo com Ordenação e Alternador de Visão */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-4 mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs">
          <div>
            <h1 className="text-lg font-extrabold text-slate-900 tracking-tight">
              Catálogo Visual de Rodas
            </h1>
            <p className="text-xs font-medium text-slate-500">
              {isLoading ? (
                'Carregando produtos do estoque...'
              ) : (
                <span>
                  Mostrando <strong className="text-slate-900">{produtos.length}</strong> modelo{produtos.length === 1 ? '' : 's'} de roda
                </span>
              )}
            </p>
          </div>

          <div className="flex items-center gap-3 self-end sm:self-auto">
            {/* Alternador de Ordenação */}
            <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs">
              <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
              <select
                value={filtros.ordenacao || 'recentes'}
                onChange={(e) =>
                  setFiltros({
                    ...filtros,
                    ordenacao: e.target.value as FiltrosCatalogo['ordenacao'],
                  })
                }
                className="bg-transparent text-slate-700 font-semibold focus:outline-none cursor-pointer"
              >
                <option value="recentes">Mais recentes</option>
                <option value="preco-asc">Preço: Menor para Maior</option>
                <option value="preco-desc">Preço: Maior para Menor</option>
                <option value="aro-asc">Aro: Menor primeiro</option>
                <option value="aro-desc">Aro: Maior primeiro</option>
                <option value="titulo-asc">Título (A - Z)</option>
                <option value="titulo-desc">Título (Z - A)</option>
              </select>
            </div>

            {/* Alternador Grid / Tabela */}
            <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200">
              <button
                type="button"
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded-lg transition-colors ${
                  viewMode === 'grid'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
                title="Visualização em Grade Visual"
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setViewMode('table')}
                className={`p-1.5 rounded-lg transition-colors ${
                  viewMode === 'table'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
                title="Visualização em Tabela"
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Estado de Carregamento (Skeleton) */}
        {isLoading && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-5 gap-5">
            {Array.from({ length: 8 }).map((_, idx) => (
              <div
                key={idx}
                className="bg-white border border-slate-200 rounded-[18px] overflow-hidden animate-pulse flex flex-col"
              >
                <div className="aspect-square bg-slate-100 w-full" />
                <div className="p-4 space-y-3">
                  <div className="h-4 bg-slate-100 rounded w-3/4" />
                  <div className="h-3 bg-slate-100 rounded w-1/2" />
                  <div className="flex gap-2">
                    <div className="h-5 bg-slate-100 rounded-full w-12" />
                    <div className="h-5 bg-slate-100 rounded-full w-12" />
                  </div>
                  <div className="h-8 bg-slate-100 rounded-full mt-4" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Estado de Erro */}
        {isError && (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-8 text-center text-red-700">
            <h3 className="font-bold text-base mb-1">Falha na consulta ao banco de dados</h3>
            <p className="text-xs">{(error as Error)?.message || 'Erro desconhecido.'}</p>
          </div>
        )}

        {/* Estado Vazio */}
        {!isLoading && !isError && produtos.length === 0 && (
          <div className="bg-white border border-dashed border-slate-300 rounded-[20px] p-16 text-center text-slate-500">
            <div className="w-14 h-14 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-3 text-slate-400">
              <SearchX className="w-7 h-7" />
            </div>
            <h3 className="font-bold text-slate-900 text-base mb-1">
              Nenhuma roda encontrada
            </h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto mb-5">
              Não encontramos nenhum produto correspondente aos filtros atuais. Tente buscar por termos mais genéricos ou limpar os filtros da barra lateral.
            </p>
            <button
              onClick={() =>
                setFiltros({
                  q: '',
                  marca: undefined,
                  aro: undefined,
                  tala: undefined,
                  furacao: undefined,
                  cabeca_chave: undefined,
                  disponivel: undefined,
                  apenasEstoque: false,
                  ordenacao: 'recentes',
                })
              }
              className="inline-flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold px-4 py-2 rounded-full transition-colors"
            >
              Limpar todos os filtros
            </button>
          </div>
        )}

        {/* Visualização em Grade (Grid) */}
        {!isLoading && !isError && produtos.length > 0 && viewMode === 'grid' && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-5 gap-4 sm:gap-5">
            {produtos.map((produto) => (
              <ProdutoCard
                key={produto.id || produto.sku}
                produto={produto}
                onPreview={setPreviewProduto}
              />
            ))}
          </div>
        )}

        {/* Visualização em Tabela Alternativa */}
        {!isLoading && !isError && produtos.length > 0 && viewMode === 'table' && (
          <div className="bg-white border border-slate-200 rounded-[18px] overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-extrabold uppercase tracking-wider">
                  <tr>
                    <th className="p-3.5 pl-5">Roda</th>
                    <th className="p-3.5">Título</th>
                    <th className="p-3.5">Marca / Modelo</th>
                    <th className="p-3.5">Aro / Tala</th>
                    <th className="p-3.5">Furação</th>
                    <th className="p-3.5">Preço</th>
                    <th className="p-3.5">Estoque</th>
                    <th className="p-3.5">Status</th>
                    <th className="p-3.5 text-right pr-5">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {produtos.map((produto) => {
                    const capa =
                      produto.imagens && produto.imagens.length > 0
                        ? produto.imagens[0]
                        : 'https://images.unsplash.com/photo-1578844251758-2f71da64c96f?auto=format&fit=crop&w=800&q=80';
                    const precoFormatado = new Intl.NumberFormat('pt-BR', {
                      style: 'currency',
                      currency: 'BRL',
                    }).format(produto.preco || 0);

                    const isDisponivel = produto.disponivel !== false && (produto.estoque ?? 0) > 0;

                    return (
                      <tr key={produto.id || produto.sku} className="hover:bg-slate-50/80 transition-colors">
                        <td className="p-3 pl-5">
                          <div
                            onClick={() => setPreviewProduto(produto)}
                            className="w-12 h-12 aspect-square bg-slate-50 rounded-lg p-1 border border-slate-200 flex items-center justify-center cursor-pointer hover:border-blue-500 transition-colors"
                          >
                            <img
                              src={capa}
                              alt={produto.titulo}
                              className="w-full h-full object-contain"
                            />
                          </div>
                        </td>
                        <td className="p-3 font-bold text-slate-900 max-w-xs truncate">
                          <a
                            href={`/produto/${produto.sku}`}
                            className="hover:text-blue-600 transition-colors"
                          >
                            {produto.titulo}
                          </a>
                        </td>
                        <td className="p-3">
                          <span className="font-extrabold text-slate-800">{produto.marca}</span>
                          <span className="text-slate-400 block">{produto.modelo}</span>
                        </td>
                        <td className="p-3 font-semibold text-slate-800">
                          Aro {produto.aro}" | Tala {produto.tala}"
                        </td>
                        <td className="p-3">
                          <span className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded-md font-mono font-bold">
                            {produto.furacao}
                          </span>
                        </td>
                        <td className="p-3 font-extrabold text-slate-900 font-mono">
                          {precoFormatado}
                        </td>
                        <td className="p-3">
                          <span className={`font-bold ${(produto.estoque ?? 0) === 0 ? 'text-red-600' : 'text-slate-800'}`}>
                            {produto.estoque ?? 0} un.
                          </span>
                        </td>
                        <td className="p-3">
                          {isDisponivel ? (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-50 text-emerald-700 border border-emerald-200">
                              Disponível
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-red-50 text-red-700 border border-red-200">
                              {(produto.estoque ?? 0) === 0 ? 'Esgotado' : 'Indisponível'}
                            </span>
                          )}
                        </td>
                        <td className="p-3 text-right pr-5">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              type="button"
                              onClick={() => setPreviewProduto(produto)}
                              className="text-xs bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold px-2.5 py-1 rounded-md"
                            >
                              Espiar
                            </button>
                            <a
                              href={`/produto/${produto.sku}`}
                              className="text-xs bg-slate-900 hover:bg-slate-800 text-white font-semibold px-2.5 py-1 rounded-md"
                            >
                              Ver
                            </a>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>

      {/* Modal de Pré-visualização Rápida */}
      {previewProduto && (
        <ProdutoPreviewModal
          produto={previewProduto}
          onClose={() => setPreviewProduto(null)}
        />
      )}
    </div>
  );
}

export function CatalogoPrincipal() {
  return (
    <QueryProvider>
      <CatalogoPrincipalContent />
    </QueryProvider>
  );
}
