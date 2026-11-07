import React from 'react';
import type { Produto } from '@/lib/schemas/produto';

interface Props {
  dados: Partial<Produto>;
}

export function LiveCardPreview({ dados }: Props) {
  const capa =
    dados.imagens && dados.imagens.length > 0 && dados.imagens[0].trim().length > 0
      ? dados.imagens[0]
      : 'https://images.unsplash.com/photo-1578844251758-2f71da64c96f?auto=format&fit=crop&w=800&q=80';

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
          Pré-visualização em Tempo Real (Live 1:1)
        </span>
        <span className="text-[10px] font-bold uppercase bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
          Card no Catálogo
        </span>
      </div>

      <div className="bg-white border border-slate-200/90 rounded-[18px] overflow-hidden flex flex-col shadow-md max-w-sm w-full mx-auto">
        {/* Quadrado estrito 1:1 com object-contain */}
        <div className="aspect-square w-full bg-slate-50 flex items-center justify-center p-6 relative border-b border-slate-100 overflow-hidden">
          <img
            src={capa}
            alt={dados.titulo || 'Prévia da Roda'}
            className="w-full h-full aspect-square object-contain drop-shadow-md"
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).src =
                'https://images.unsplash.com/photo-1578844251758-2f71da64c96f?auto=format&fit=crop&w=800&q=80';
            }}
          />
          <span className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm text-slate-800 text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-full border border-slate-200 shadow-xs">
            {dados.marca || 'MARCA'}
          </span>
          {dados.imagens && dados.imagens.length > 1 && (
            <span className="absolute bottom-3 right-3 bg-slate-900/70 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
              +{dados.imagens.length - 1} foto{dados.imagens.length > 2 ? 's' : ''}
            </span>
          )}
        </div>

        <div className="p-4 flex flex-col gap-2">
          <div>
            <h4 className="font-bold text-slate-900 text-base line-clamp-1">
              {dados.titulo || 'Título da Roda Automotiva'}
            </h4>
            <div className="flex items-center justify-between text-xs text-slate-500 font-mono mt-0.5">
              <span>SKU: {dados.sku || 'SKU-0000'}</span>
              <span className="font-sans text-[11px] font-semibold text-slate-400">
                {dados.modelo || 'Modelo'}
              </span>
            </div>
          </div>

          <div className="flex flex-wrap gap-1.5 my-1">
            <span className="text-[11px] font-bold px-2.5 py-1 bg-slate-100 text-slate-800 rounded-full">
              Aro {dados.aro || 15}"
            </span>
            <span className="text-[11px] font-bold px-2.5 py-1 bg-slate-100 text-slate-800 rounded-full">
              Tala {dados.tala || 6.0}"
            </span>
            <span className="text-[11px] font-bold px-2.5 py-1 bg-blue-50 text-blue-700 rounded-full border border-blue-100">
              {dados.furacao || '4x100'}
            </span>
            <span className="text-[11px] font-bold px-2 py-1 bg-slate-100 text-slate-600 rounded-full">
              {dados.cabeca_chave || '17mm'}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-3 mt-auto border-t border-slate-100">
            <button
              type="button"
              disabled
              className="bg-slate-900 text-white text-xs font-semibold py-2 px-3 rounded-full opacity-90 text-center cursor-default"
            >
              Espiar
            </button>
            <button
              type="button"
              disabled
              className="border border-slate-200 text-slate-700 text-xs font-semibold py-2 px-3 rounded-full opacity-90 text-center cursor-default"
            >
              Ficha
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
