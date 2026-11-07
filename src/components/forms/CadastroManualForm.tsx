import React, { useState } from 'react';
import { Plus, Trash2, CheckCircle2 } from 'lucide-react';
import { LiveCardPreview } from './LiveCardPreview';
import { useProdutoMutations } from '@/hooks/useProdutoMutations';
import { ProdutoSchema, type Produto } from '@/lib/schemas/produto';

export function CadastroManualForm() {
  const { criarProduto } = useProdutoMutations();

  const [formData, setFormData] = useState<Partial<Produto>>({
    titulo: '',
    marca: '',
    modelo: '',
    aro: 15,
    tala: 6.0,
    furacao: '4x100',
    sku: '',
    cabeca_chave: '17mm',
    imagens: [''],
    descricao: '',
  });

  const [erros, setErros] = useState<Record<string, string>>({});
  const [sucesso, setSucesso] = useState(false);

  const handleInputChange = (field: keyof Produto, val: any) => {
    setFormData((prev) => ({ ...prev, [field]: val }));
    if (erros[field]) {
      setErros((prev) => {
        const copy = { ...prev };
        delete copy[field];
        return copy;
      });
    }
  };

  const handleAddImageUrl = () => {
    setFormData((prev) => ({
      ...prev,
      imagens: [...(prev.imagens || []), ''],
    }));
  };

  const handleUpdateImageUrl = (index: number, val: string) => {
    const updated = [...(formData.imagens || [])];
    updated[index] = val;
    setFormData((prev) => ({ ...prev, imagens: updated }));
  };

  const handleRemoveImageUrl = (index: number) => {
    const updated = (formData.imagens || []).filter((_, i) => i !== index);
    setFormData((prev) => ({
      ...prev,
      imagens: updated.length > 0 ? updated : [''],
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErros({});

    // Normaliza URLs de imagens
    const cleanedImgs = (formData.imagens || []).map((s) => s.trim()).filter((s) => s.length > 0);

    const parseResult = ProdutoSchema.safeParse({
      ...formData,
      imagens: cleanedImgs.length > 0 ? cleanedImgs : ['https://images.unsplash.com/photo-1578844251758-2f71da64c96f?auto=format&fit=crop&w=800&q=80'],
    });

    if (!parseResult.success) {
      const fieldErrors: Record<string, string> = {};
      parseResult.error.errors.forEach((err) => {
        const fieldName = err.path[0] as string;
        fieldErrors[fieldName] = err.message;
      });
      setErros(fieldErrors);
      return;
    }

    criarProduto.mutate(parseResult.data, {
      onSuccess: () => {
        setSucesso(true);
        setTimeout(() => {
          window.location.href = '/';
        }, 1200);
      },
      onError: (err) => {
        setErros({ submit: err.message });
      },
    });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
      {/* Formulário à Esquerda */}
      <div className="lg:col-span-7 bg-white border border-slate-200/90 rounded-[20px] p-6 sm:p-8 shadow-xs">
        <h2 className="text-lg font-extrabold text-slate-900 mb-6 pb-3 border-b border-slate-100">
          Dados Técnicos da Roda
        </h2>

        {sucesso && (
          <div className="mb-6 p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-center gap-2.5 text-sm font-semibold">
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            Produto cadastrado com sucesso! Redirecionando para o catálogo...
          </div>
        )}

        {erros.submit && (
          <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm font-semibold">
            {erros.submit}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Título */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
              Título do Produto <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={formData.titulo || ''}
              onChange={(e) => handleInputChange('titulo', e.target.value)}
              placeholder="Ex: Roda Esportiva Scorro S-250 Aro 15"
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-blue-600 focus:bg-white transition-all"
            />
            {erros.titulo && <span className="text-xs text-red-600 mt-1 block">{erros.titulo}</span>}
          </div>

          {/* Marca e Modelo */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                Marca <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.marca || ''}
                onChange={(e) => handleInputChange('marca', e.target.value.toUpperCase())}
                placeholder="Ex: SCORRO, BBS, TSW"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-blue-600 focus:bg-white uppercase transition-all"
              />
              {erros.marca && <span className="text-xs text-red-600 mt-1 block">{erros.marca}</span>}
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                Modelo <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.modelo || ''}
                onChange={(e) => handleInputChange('modelo', e.target.value)}
                placeholder="Ex: S-250, Santa Monica"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-blue-600 focus:bg-white transition-all"
              />
              {erros.modelo && <span className="text-xs text-red-600 mt-1 block">{erros.modelo}</span>}
            </div>
          </div>

          {/* Aro, Tala, Furação */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                Aro (pol) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                min="10"
                max="30"
                required
                value={formData.aro || ''}
                onChange={(e) => handleInputChange('aro', Number(e.target.value))}
                placeholder="Ex: 15"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-blue-600 focus:bg-white transition-all"
              />
              {erros.aro && <span className="text-xs text-red-600 mt-1 block">{erros.aro}</span>}
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                Tala (pol) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                step="0.1"
                min="3"
                max="16"
                required
                value={formData.tala || ''}
                onChange={(e) => handleInputChange('tala', Number(e.target.value))}
                placeholder="Ex: 6.0 ou 7.5"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-blue-600 focus:bg-white transition-all"
              />
              {erros.tala && <span className="text-xs text-red-600 mt-1 block">{erros.tala}</span>}
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                Furação (PCD) <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.furacao || ''}
                onChange={(e) => handleInputChange('furacao', e.target.value)}
                placeholder="Ex: 4x100, 5x114.3"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-blue-600 focus:bg-white transition-all"
              />
              {erros.furacao && <span className="text-xs text-red-600 mt-1 block">{erros.furacao}</span>}
            </div>
          </div>

          {/* SKU e Cabeça de Chave */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                SKU (Código Único) <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.sku || ''}
                onChange={(e) => handleInputChange('sku', e.target.value.toUpperCase())}
                placeholder="Ex: SCR-S250-15"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-mono focus:outline-none focus:border-blue-600 focus:bg-white uppercase transition-all"
              />
              {erros.sku && <span className="text-xs text-red-600 mt-1 block">{erros.sku}</span>}
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                Cabeça de Chave <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.cabeca_chave || ''}
                onChange={(e) => handleInputChange('cabeca_chave', e.target.value)}
                placeholder="Ex: 17mm, 19mm, 21mm"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-blue-600 focus:bg-white transition-all"
              />
              {erros.cabeca_chave && (
                <span className="text-xs text-red-600 mt-1 block">{erros.cabeca_chave}</span>
              )}
            </div>
          </div>

          {/* Imagens (Múltiplas URLs) */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600">
                Imagens Quadradas 1:1 (URLs) <span className="text-red-500">*</span>
              </label>
              <button
                type="button"
                onClick={handleAddImageUrl}
                className="inline-flex items-center gap-1 text-xs font-bold text-blue-600 hover:text-blue-700"
              >
                <Plus className="w-3.5 h-3.5" /> Adicionar mais fotos
              </button>
            </div>

            <div className="space-y-2">
              {(formData.imagens || ['']).map((url, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <input
                    type="url"
                    value={url}
                    onChange={(e) => handleUpdateImageUrl(idx, e.target.value)}
                    placeholder={`https://exemplo.com/roda-foto-${idx + 1}.jpg`}
                    className="flex-1 px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-blue-600 focus:bg-white transition-all"
                  />
                  {(formData.imagens || []).length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveImageUrl(idx)}
                      className="p-2.5 text-slate-400 hover:text-red-600 rounded-xl border border-slate-200 hover:bg-red-50 transition-colors"
                      title="Remover foto"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
            {erros.imagens && <span className="text-xs text-red-600 mt-1 block">{erros.imagens}</span>}
          </div>

          {/* Descrição */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
              Descrição Detalhada (Opcional)
            </label>
            <textarea
              rows={3}
              value={formData.descricao || ''}
              onChange={(e) => handleInputChange('descricao', e.target.value)}
              placeholder="Informações adicionais sobre acabamento, compatibilidade veicular, furação e pintura..."
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-blue-600 focus:bg-white transition-all"
            />
          </div>

          {/* Botão de Envio */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
            <a
              href="/"
              className="px-5 py-2.5 text-xs font-bold text-slate-600 hover:text-slate-900 transition-colors uppercase tracking-wider"
            >
              Cancelar
            </a>
            <button
              type="submit"
              disabled={criarProduto.isPending}
              className="bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold uppercase tracking-wider px-6 py-3 rounded-full transition-all shadow-sm active:scale-95 disabled:opacity-50"
            >
              {criarProduto.isPending ? 'Salvando Roda...' : 'Salvar e Publicar Roda'}
            </button>
          </div>
        </form>
      </div>

      {/* Espelho em Tempo Real (Live Preview) à Direita */}
      <div className="lg:col-span-5">
        <div className="sticky top-24">
          <LiveCardPreview dados={formData} />
        </div>
      </div>
    </div>
  );
}
