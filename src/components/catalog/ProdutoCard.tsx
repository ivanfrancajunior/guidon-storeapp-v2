import React from 'react';
import { Eye, ExternalLink, CheckCircle2, XCircle, AlertTriangle } from 'lucide-react';
import type { Produto } from '@/lib/schemas/produto';
import { IMAGEM_FALLBACK_RODA } from '@/lib/assets';

interface Props {
  produto: Produto;
  onPreview: (produto: Produto) => void;
}

export function ProdutoCard({ produto, onPreview }: Props) {
  const capa = produto.imagens && produto.imagens.length > 0 
    ? produto.imagens[0] 
    : IMAGEM_FALLBACK_RODA;

  const precoFormatado = new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(produto.preco || 0);

  // Status de disponibilidade e estoque
  const isAtivo = produto.status === 'Ativo';
  const isEsgotado = (produto.estoque ?? 0) === 0;
  const isDisponivel = isAtivo && !isEsgotado;

  return (
    <article className="group bg-white border border-slate-200/90 rounded-[18px] overflow-hidden flex flex-col shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-200 relative">
      {/* 
        DIRETRIZ DE DESIGN FUNDAMENTAL:
        - Proporção estrita 1:1 quadrada (aspect-square)
        - object-fit: contain
        - Fundo neutro (#F8FAFC ou bg-slate-50) para nunca cortar nem distorcer a roda
        - Imagem ocupa ~65-70% da área útil do card
      */}
      <div 
        onClick={() => onPreview(produto)}
        className="aspect-square w-full bg-slate-50 flex items-center justify-center p-6 relative border-b border-slate-100 overflow-hidden cursor-pointer select-none"
      >
        <img
          src={capa}
          alt={produto.titulo}
          className={`w-full h-full aspect-square object-contain drop-shadow-md group-hover:scale-105 transition-transform duration-200 ${
            !isAtivo ? 'opacity-70 grayscale' : isEsgotado ? 'opacity-85' : ''
          }`}
          loading="lazy"
        />

        {/* Badge da Marca */}
        <span className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm text-slate-800 text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-full border border-slate-200/60 shadow-xs">
          {produto.marca}
        </span>

        {/* Badge de Status no Topo Direito */}
        <div className="absolute top-3 right-3 flex items-center gap-1.5">
          {/* Condição */}
          {produto.condicao && produto.condicao !== 'Nova' && (
            <span className="bg-amber-100/90 text-amber-900 text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full shadow-xs">
              {produto.condicao}
            </span>
          )}

          {/* Status Ativo / Inativo / Esgotado */}
          {!isAtivo ? (
            <span className="inline-flex items-center gap-1 bg-slate-800/90 backdrop-blur-sm text-white text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full shadow-xs">
              <XCircle className="w-3 h-3" />
              Inativo
            </span>
          ) : isEsgotado ? (
            <span className="inline-flex items-center gap-1 bg-red-600/90 backdrop-blur-sm text-white text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full shadow-xs">
              <AlertTriangle className="w-3 h-3" />
              Esgotado
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 bg-emerald-500/90 backdrop-blur-sm text-white text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full shadow-xs">
              <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
              Ativo
            </span>
          )}
        </div>

        {/* Quantidade de Imagens se houver mais de 1 */}
        {produto.imagens.length > 1 && (
          <span className="absolute bottom-3 right-3 bg-slate-900/70 text-white text-[10px] font-bold px-2 py-0.5 rounded-full backdrop-blur-xs">
            +{produto.imagens.length - 1} foto{produto.imagens.length > 2 ? 's' : ''}
          </span>
        )}
      </div>

      {/* Conteúdo do Card */}
      <div className="p-4 flex flex-col flex-1 gap-2">
        <div>
          <a
            href={`/produto/${produto.sku}`}
            className="font-bold text-slate-900 text-sm sm:text-base hover:text-yellow-400 transition-colors"
            title={produto.titulo}
          >
            {produto.titulo}
          </a>
          <div className="flex items-center justify-between text-xs text-slate-500 font-mono mt-0.5">
            <span>SKU: {produto.sku}</span>
            <span className="font-sans text-[11px] font-semibold text-slate-400">
              {produto.modelo} • {produto.acabamento || 'Padrão'}
            </span>
          </div>
        </div>

        {/* Facetas Técnicas / Chips */}
        <div className="flex flex-wrap gap-1.5 my-0.5">
          <span className="text-[11px] font-bold px-2.5 py-0.5 bg-slate-100 text-slate-800 rounded-full border border-slate-200/50">
            Aro {produto.aro}"
          </span>
          <span className="text-[11px] font-bold px-2.5 py-0.5 bg-slate-100 text-slate-800 rounded-full border border-slate-200/50">
            Tala {produto.tala}"
          </span>
          <span className="text-[11px] font-bold px-2.5 py-0.5 bg-yellow-50 text-yellow-700 rounded-full border border-yellow-100">
            {produto.furacao}
          </span>
          <span className="text-[11px] font-bold px-2 py-0.5 bg-slate-100 text-slate-600 rounded-full">
            {produto.cabeca_chave}
          </span>
        </div>

        {/* Preço e Saldo de Estoque no Depósito */}
        <div className="flex items-end justify-between pt-2.5 mt-auto border-t border-slate-100">
          <div className="flex flex-col">
            <span className="text-[10px] uppercase font-semibold text-slate-400">Preço</span>
            <span className="text-base font-extrabold text-slate-900 tracking-tight">
              {precoFormatado}
            </span>
          </div>

          <div className="flex flex-col items-end">
            <span className="text-[10px] uppercase font-semibold text-slate-400">Depósito</span>
            <span
              className={`text-xs font-bold ${
                isEsgotado
                  ? 'text-red-600 font-extrabold'
                  : (produto.estoque ?? 0) <= 3
                  ? 'text-amber-600'
                  : 'text-emerald-700'
              }`}
            >
              {isEsgotado ? 'Sem estoque' : `${produto.estoque} un.`}
            </span>
          </div>
        </div>

        {/* Ações Rápidas */}
        <div className="grid grid-cols-2 gap-2 pt-2.5 border-t border-slate-100">
          <button
            type="button"
            onClick={() => onPreview(produto)}
            className="inline-flex items-center justify-center gap-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold py-2 px-3 rounded-full transition-colors"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Espiar</span>
          </button>
          <a
            href={`/produto/${produto.sku}`}
            className="inline-flex items-center justify-center gap-1.5 border border-slate-200 hover:bg-slate-100 text-slate-800 text-xs font-semibold py-2 px-3 rounded-full transition-colors text-center"
          >
            <span>Ficha</span>
            <ExternalLink className="w-3 h-3 text-slate-400" />
          </a>
        </div>
      </div>
    </article>
  );
}
