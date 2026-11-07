import React, { useState } from 'react';
import { ArrowLeft, Edit3, Trash2, ShieldCheck, Wrench, Layers } from 'lucide-react';
import { useProdutoDetailQuery } from '@/hooks/useProdutosQuery';
import { useProdutoMutations } from '@/hooks/useProdutoMutations';
import { QueryProvider } from '@/components/providers/QueryProvider';

interface Props {
  sku: string;
}

function ProdutoDetalheViewContent({ sku }: Props) {
  const { data: produto, isLoading, isError, error } = useProdutoDetailQuery(sku);
  const { excluirProduto } = useProdutoMutations();
  const [selectedImgIndex, setSelectedImgIndex] = useState(0);

  if (isLoading) {
    return (
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-20 text-center text-slate-500">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-slate-300 border-t-slate-900 mb-3" />
        <p className="text-sm font-semibold">Carregando detalhes do produto...</p>
      </div>
    );
  }

  if (isError || !produto) {
    return (
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-20 text-center">
        <h2 className="text-2xl font-extrabold text-slate-900 mb-2">Produto não encontrado</h2>
        <p className="text-sm text-slate-500 mb-6">
          {(error as Error)?.message || 'Não localizamos uma roda com este código SKU.'}
        </p>
        <a
          href="/"
          className="inline-flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold px-5 py-2.5 rounded-full transition-all"
        >
          <ArrowLeft className="w-4 h-4" /> Voltar ao Catálogo
        </a>
      </div>
    );
  }

  const imagens = produto.imagens && produto.imagens.length > 0
    ? produto.imagens
    : ['https://images.unsplash.com/photo-1578844251758-2f71da64c96f?auto=format&fit=crop&w=800&q=80'];

  const handleDelete = () => {
    if (confirm(`Tem certeza que deseja excluir permanentemente "${produto.titulo}"?`)) {
      excluirProduto.mutate(produto.id || produto.sku, {
        onSuccess: () => {
          alert('Produto excluído com sucesso.');
          window.location.href = '/';
        },
        onError: (err) => {
          alert(`Erro ao excluir: ${err.message}`);
        },
      });
    }
  };

  return (
    <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
      {/* Barra de Navegação Superior */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-8 pb-4 border-b border-slate-200">
        <a
          href="/"
          className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-500 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Voltar ao Catálogo
        </a>

        <div className="flex items-center gap-2">
          <a
            href={`/editar/${produto.id || produto.sku}`}
            className="inline-flex items-center gap-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-900 text-xs font-bold uppercase tracking-wider px-4 py-2 rounded-full transition-colors shadow-xs"
          >
            <Edit3 className="w-3.5 h-3.5 text-slate-600" />
            Editar Produto
          </a>
          <button
            type="button"
            onClick={handleDelete}
            disabled={excluirProduto.isPending}
            className="inline-flex items-center gap-2 bg-red-50 hover:bg-red-100 text-red-700 text-xs font-bold uppercase tracking-wider px-4 py-2 rounded-full transition-colors border border-red-200"
          >
            <Trash2 className="w-3.5 h-3.5" />
            {excluirProduto.isPending ? 'Excluindo...' : 'Excluir'}
          </button>
        </div>
      </div>

      {/* Grid Principal: Galeria 1:1 à Esquerda | Detalhes Técnicos à Direita */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Coluna da Esquerda: Galeria Quadrada 1:1 */}
        <div className="lg:col-span-6 flex flex-col gap-4">
          <div className="w-full aspect-square bg-slate-50 border border-slate-200 rounded-[24px] p-8 flex items-center justify-center shadow-xs overflow-hidden relative">
            <img
              src={imagens[selectedImgIndex] || imagens[0]}
              alt={produto.titulo}
              className="w-full h-full aspect-square object-contain drop-shadow-xl transition-all duration-200"
            />
            <span className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm text-slate-900 text-xs font-extrabold uppercase px-3 py-1 rounded-full border border-slate-200 shadow-xs">
              {produto.marca}
            </span>
          </div>

          {/* Miniaturas da Galeria */}
          {imagens.length > 1 && (
            <div className="flex items-center gap-3 overflow-x-auto pb-2">
              {imagens.map((img, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setSelectedImgIndex(idx)}
                  className={`w-20 h-20 aspect-square rounded-2xl bg-slate-50 p-2 border-2 transition-all shrink-0 flex items-center justify-center overflow-hidden ${
                    selectedImgIndex === idx
                      ? 'border-blue-600 shadow-md ring-2 ring-blue-100'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <img
                    src={img}
                    alt={`${produto.titulo} mini ${idx + 1}`}
                    className="w-full h-full object-contain"
                  />
                </button>
              ))}
            </div>
          )}

          <p className="text-[11px] text-center text-slate-400 font-medium">
            Proporção estritamente quadrada (1:1) com renderização sem distorção dimensional
          </p>
        </div>

        {/* Coluna da Direita: Dados Técnicos e Ficha */}
        <div className="lg:col-span-6 flex flex-col gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-mono font-bold bg-slate-100 text-slate-700 px-3 py-1 rounded-md">
                SKU: {produto.sku}
              </span>
              <span className="text-xs font-extrabold uppercase tracking-wider text-blue-700 bg-blue-50 px-3 py-1 rounded-md border border-blue-100">
                {produto.marca}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight leading-tight">
              {produto.titulo}
            </h1>
            <p className="text-sm font-semibold text-slate-500 mt-1">
              Modelo: <span className="text-slate-800">{produto.modelo}</span>
            </p>
          </div>

          {/* Ficha Técnica Completa em Cards */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs">
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-400 mb-4 flex items-center gap-2">
              <Wrench className="w-4 h-4 text-slate-500" />
              Ficha Técnica de Engenharia
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3.5 text-xs">
              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200/60">
                <span className="text-slate-400 block font-semibold mb-0.5">Aro (Diâmetro)</span>
                <span className="font-extrabold text-slate-900 text-base">{produto.aro}"</span>
              </div>
              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200/60">
                <span className="text-slate-400 block font-semibold mb-0.5">Tala (Largura)</span>
                <span className="font-extrabold text-slate-900 text-base">{produto.tala}"</span>
              </div>
              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200/60">
                <span className="text-slate-400 block font-semibold mb-0.5">Furação (PCD)</span>
                <span className="font-extrabold text-slate-900 text-base">{produto.furacao}</span>
              </div>
              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200/60">
                <span className="text-slate-400 block font-semibold mb-0.5">Cabeça de Chave</span>
                <span className="font-extrabold text-slate-900 text-base">{produto.cabeca_chave}</span>
              </div>
              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200/60">
                <span className="text-slate-400 block font-semibold mb-0.5">Marca Fabricante</span>
                <span className="font-extrabold text-slate-900 text-base">{produto.marca}</span>
              </div>
              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200/60">
                <span className="text-slate-400 block font-semibold mb-0.5">Linha / Modelo</span>
                <span className="font-extrabold text-slate-900 text-base">{produto.modelo}</span>
              </div>
            </div>
          </div>

          {/* Descrição Formatada */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs">
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-2">
              <Layers className="w-4 h-4 text-slate-500" />
              Descrição do Produto
            </h3>
            <div className="text-sm text-slate-600 leading-relaxed whitespace-pre-line">
              {produto.descricao && produto.descricao.trim().length > 0 ? (
                produto.descricao
              ) : (
                <span className="text-slate-400 italic">
                  Nenhuma descrição detalhada informada para esta roda.
                </span>
              )}
            </div>
          </div>

          {/* Garantia & Certificação */}
          <div className="bg-blue-50/60 border border-blue-200/70 rounded-2xl p-4 flex items-center gap-3.5 text-xs text-blue-900">
            <ShieldCheck className="w-6 h-6 text-blue-600 shrink-0" />
            <div>
              <span className="font-bold block">Garantia e Autenticidade Garantida</span>
              <p className="text-blue-700/90 leading-tight">
                Produto original de fábrica inspecionado conforme normas de segurança veicular e balanceamento dimensional.
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

export function ProdutoDetalheView({ sku }: Props) {
  return (
    <QueryProvider>
      <ProdutoDetalheViewContent sku={sku} />
    </QueryProvider>
  );
}

