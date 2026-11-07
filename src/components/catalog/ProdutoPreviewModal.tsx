import React, { useEffect, useState } from 'react';
import { X, ExternalLink, Edit3, ChevronLeft, ChevronRight, CheckCircle2, AlertTriangle, XCircle, Box, DollarSign } from 'lucide-react';
import type { Produto } from '@/lib/schemas/produto';

interface Props {
  produto: Produto;
  onClose: () => void;
}

export function ProdutoPreviewModal({ produto, onClose }: Props) {
  const [activeImgIndex, setActiveImgIndex] = useState(0);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const imagens = produto.imagens && produto.imagens.length > 0 
    ? produto.imagens 
    : ['https://images.unsplash.com/photo-1578844251758-2f71da64c96f?auto=format&fit=crop&w=800&q=80'];

  const precoFormatado = new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(produto.preco || 0);

  const isDisponivel = produto.disponivel !== false && (produto.estoque ?? 0) > 0;
  const isEsgotado = (produto.estoque ?? 0) === 0;

  const nextImg = () => setActiveImgIndex((prev) => (prev + 1) % imagens.length);
  const prevImg = () => setActiveImgIndex((prev) => (prev - 1 + imagens.length) % imagens.length);

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div 
        className="fixed inset-0" 
        onClick={onClose} 
        aria-hidden="true" 
      />

      <div className="bg-white rounded-[24px] max-w-2xl w-full overflow-hidden shadow-2xl relative z-10 border border-slate-100 flex flex-col max-h-[90vh]">
        {/* Top Header */}
        <div className="p-5 pb-3 flex justify-between items-start border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold bg-slate-100 text-slate-700 px-2.5 py-0.5 rounded-md">
                SKU: {produto.sku}
              </span>
              <span className="text-xs font-bold uppercase text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md">
                {produto.marca}
              </span>
              {isDisponivel ? (
                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Disponível
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-red-700 bg-red-50 px-2.5 py-0.5 rounded-full border border-red-200">
                  <AlertTriangle className="w-3.5 h-3.5 text-red-600" /> {isEsgotado ? 'Esgotado' : 'Indisponível'}
                </span>
              )}
            </div>
            <h2 className="text-xl font-extrabold text-slate-900 mt-1">{produto.titulo}</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Visualizador 1:1 Quadrado */}
          <div className="relative w-full max-w-[300px] mx-auto aspect-square bg-slate-50 rounded-2xl p-6 flex items-center justify-center border border-slate-200/80 shadow-xs">
            <img
              src={imagens[activeImgIndex]}
              alt={produto.titulo}
              className="w-full h-full aspect-square object-contain drop-shadow-md select-none transition-all duration-200"
            />
            {imagens.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={prevImg}
                  className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/90 shadow-md flex items-center justify-center text-slate-700 hover:bg-white"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={nextImg}
                  className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/90 shadow-md flex items-center justify-center text-slate-700 hover:bg-white"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
                <div className="absolute bottom-2 left-1/2 -translate-x-1/2 bg-slate-900/70 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                  {activeImgIndex + 1} / {imagens.length}
                </div>
              </>
            )}
          </div>

          {/* Destaque Comercial: Preço e Saldo em Estoque */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-slate-900 text-white p-3.5 rounded-2xl flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Preço de Venda</span>
                <span className="text-lg font-extrabold text-white">{precoFormatado}</span>
              </div>
              <DollarSign className="w-5 h-5 text-emerald-400" />
            </div>

            <div className="bg-slate-50 border border-slate-200 p-3.5 rounded-2xl flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Saldo em Estoque</span>
                <span className={`text-lg font-extrabold ${isEsgotado ? 'text-red-600' : 'text-slate-900'}`}>
                  {produto.estoque} unidades
                </span>
              </div>
              <Box className="w-5 h-5 text-slate-400" />
            </div>
          </div>

          {/* Especificações Técnicas Rápidas */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div className="bg-slate-50 border border-slate-200/60 p-3 rounded-xl">
              <span className="text-slate-400 block font-semibold mb-0.5">Aro</span>
              <span className="font-extrabold text-slate-900 text-sm">{produto.aro}"</span>
            </div>
            <div className="bg-slate-50 border border-slate-200/60 p-3 rounded-xl">
              <span className="text-slate-400 block font-semibold mb-0.5">Tala</span>
              <span className="font-extrabold text-slate-900 text-sm">{produto.tala}"</span>
            </div>
            <div className="bg-slate-50 border border-slate-200/60 p-3 rounded-xl">
              <span className="text-slate-400 block font-semibold mb-0.5">Furação</span>
              <span className="font-extrabold text-slate-900 text-sm">{produto.furacao}</span>
            </div>
            <div className="bg-slate-50 border border-slate-200/60 p-3 rounded-xl">
              <span className="text-slate-400 block font-semibold mb-0.5">Cabeça Chave</span>
              <span className="font-extrabold text-slate-900 text-sm">{produto.cabeca_chave}</span>
            </div>
          </div>

          {/* Descrição Curta */}
          {produto.descricao && (
            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100 text-xs text-slate-600 leading-relaxed">
              <p className="line-clamp-3">{produto.descricao}</p>
            </div>
          )}
        </div>

        {/* Footer com Ações */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-3">
          <a
            href={`/editar/${produto.id || produto.sku}`}
            className="inline-flex items-center gap-1.5 px-4 py-2 border border-slate-200 hover:bg-white text-slate-700 text-xs font-bold rounded-full transition-colors"
          >
            <Edit3 className="w-3.5 h-3.5" />
            Editar Produto
          </a>

          <a
            href={`/produto/${produto.sku}`}
            className="inline-flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold px-5 py-2.5 rounded-full transition-all shadow-sm"
          >
            <span>Ver Ficha Completa</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>
    </div>
  );
}
