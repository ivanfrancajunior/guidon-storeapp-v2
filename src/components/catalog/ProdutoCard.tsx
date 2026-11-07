import React from 'react';
import { Eye, ExternalLink } from 'lucide-react';
import type { Produto } from '@/lib/schemas/produto';

interface Props {
  produto: Produto;
  onPreview: (produto: Produto) => void;
}

export function ProdutoCard({ produto, onPreview }: Props) {
  const capa = produto.imagens && produto.imagens.length > 0 
    ? produto.imagens[0] 
    : 'https://images.unsplash.com/photo-1578844251758-2f71da64c96f?auto=format&fit=crop&w=800&q=80';

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
          className="w-full h-full aspect-square object-contain drop-shadow-md group-hover:scale-105 transition-transform duration-200"
          loading="lazy"
        />

        {/* Badge da Marca */}
        <span className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm text-slate-800 text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-full border border-slate-200/60 shadow-xs">
          {produto.marca}
        </span>

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
            className="font-bold text-slate-900 text-sm sm:text-base line-clamp-1 hover:text-blue-600 transition-colors"
            title={produto.titulo}
          >
            {produto.titulo}
          </a>
          <div className="flex items-center justify-between text-xs text-slate-500 font-mono mt-0.5">
            <span>SKU: {produto.sku}</span>
            <span className="font-sans text-[11px] font-semibold text-slate-400">{produto.modelo}</span>
          </div>
        </div>

        {/* Facetas Técnicas / Chips */}
        <div className="flex flex-wrap gap-1.5 my-1">
          <span className="text-[11px] font-bold px-2.5 py-1 bg-slate-100 text-slate-800 rounded-full border border-slate-200/50">
            Aro {produto.aro}"
          </span>
          <span className="text-[11px] font-bold px-2.5 py-1 bg-slate-100 text-slate-800 rounded-full border border-slate-200/50">
            Tala {produto.tala}"
          </span>
          <span className="text-[11px] font-bold px-2.5 py-1 bg-blue-50 text-blue-700 rounded-full border border-blue-100">
            {produto.furacao}
          </span>
          <span className="text-[11px] font-bold px-2 py-1 bg-slate-100 text-slate-600 rounded-full">
            {produto.cabeca_chave}
          </span>
        </div>

        {/* Ações Rápidas */}
        <div className="grid grid-cols-2 gap-2 pt-3 mt-auto border-t border-slate-100">
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
