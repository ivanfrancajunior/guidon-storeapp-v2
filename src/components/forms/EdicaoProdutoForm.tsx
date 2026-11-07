import React, { useState, useEffect } from 'react';
import { ArrowLeft, Plus, Trash2, CheckCircle2 } from 'lucide-react';
import { LiveCardPreview } from './LiveCardPreview';
import { useProdutoDetailQuery } from '@/hooks/useProdutosQuery';
import { useProdutoMutations } from '@/hooks/useProdutoMutations';
import { ProdutoSchema, type Produto } from '@/lib/schemas/produto';
import { IMAGEM_FALLBACK_RODA } from '@/lib/assets';
import { QueryProvider } from '@/components/providers/QueryProvider';
import { UploadImagemCloudinary } from './UploadImagemCloudinary';

interface Props {
  id: string;
}

function EdicaoProdutoFormContent({ id }: Props) {
  const { data: initialProduto, isLoading, isError } = useProdutoDetailQuery(id);
  const { atualizarProduto } = useProdutoMutations();

  const [formData, setFormData] = useState<Partial<Produto>>({});
  const [erros, setErros] = useState<Record<string, string>>({});
  const [sucesso, setSucesso] = useState(false);

  useEffect(() => {
    if (initialProduto) {
      setFormData(initialProduto);
    }
  }, [initialProduto]);

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center text-slate-500">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-slate-300 border-t-slate-900 mb-3" />
        <p className="text-sm font-semibold">Carregando dados para edição...</p>
      </div>
    );
  }

  if (isError || !formData.sku) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <h2 className="text-2xl font-extrabold text-slate-900 mb-2">Produto não encontrado</h2>
        <a
          href="/"
          className="inline-flex items-center gap-2 bg-slate-900 text-white text-xs font-bold px-4 py-2 rounded-full mt-4"
        >
          <ArrowLeft className="w-4 h-4" /> Voltar ao Catálogo
        </a>
      </div>
    );
  }

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

    const cleanedImgs = (formData.imagens || []).map((s) => s.trim()).filter((s) => s.length > 0);

    const parseResult = ProdutoSchema.safeParse({
      ...formData,
      imagens: cleanedImgs.length > 0 ? cleanedImgs : [IMAGEM_FALLBACK_RODA],
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

    atualizarProduto.mutate(
      { id, dados: parseResult.data },
      {
        onSuccess: () => {
          setSucesso(true);
          setTimeout(() => {
            window.location.href = `/produto/${parseResult.data.sku}`;
          }, 1200);
        },
        onError: (err) => {
          setErros({ submit: err.message });
        },
      }
    );
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
      <div className="lg:col-span-7 bg-white border border-slate-200/90 rounded-[20px] p-6 sm:p-8 shadow-xs">
        <div className="flex items-center justify-between mb-6 pb-3 border-b border-slate-100">
          <div>
            <span className="text-[10px] font-mono text-slate-400">ID: {id}</span>
            <h2 className="text-lg font-extrabold text-slate-900">Editar Especificações e Estoque</h2>
          </div>
          <span className="text-xs font-bold uppercase tracking-wider text-yellow-400 bg-yellow-50 px-3 py-1 rounded-full">
            {formData.marca}
          </span>
        </div>

        {sucesso && (
          <div className="mb-6 p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-center gap-2.5 text-sm font-semibold">
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            Produto atualizado com sucesso! Redirecionando para a ficha técnica...
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
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-yellow-400 focus:bg-white transition-all"
            />
            {erros.titulo && <span className="text-xs text-red-600 mt-1 block">{erros.titulo}</span>}
          </div>

          {/* SKU, Marca e Modelo */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                SKU <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.sku || ''}
                onChange={(e) => handleInputChange('sku', e.target.value.toUpperCase())}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-mono focus:outline-none focus:border-yellow-400 focus:bg-white uppercase transition-all"
              />
              {erros.sku && <span className="text-xs text-red-600 mt-1 block">{erros.sku}</span>}
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                Marca <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.marca || ''}
                onChange={(e) => handleInputChange('marca', e.target.value.toUpperCase())}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-yellow-400 focus:bg-white uppercase transition-all"
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
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-yellow-400 focus:bg-white transition-all"
              />
              {erros.modelo && <span className="text-xs text-red-600 mt-1 block">{erros.modelo}</span>}
            </div>
          </div>

          {/* Acabamento e Condição */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                Acabamento
              </label>
              <input
                type="text"
                value={formData.acabamento || ''}
                onChange={(e) => handleInputChange('acabamento', e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-yellow-400 focus:bg-white transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                Condição
              </label>
              <select
                value={formData.condicao || 'Nova'}
                onChange={(e) => handleInputChange('condicao', e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:outline-none focus:border-yellow-400 focus:bg-white transition-all cursor-pointer"
              >
                <option value="Nova">Nova</option>
                <option value="Seminova">Seminova</option>
                <option value="Usada">Usada</option>
                <option value="Restaurada">Restaurada</option>
              </select>
            </div>
          </div>

          {/* Aro, Tala, Furação, Cabeça de Chave */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                Aro <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                min="10"
                max="30"
                required
                value={formData.aro || ''}
                onChange={(e) => handleInputChange('aro', Number(e.target.value))}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-yellow-400 focus:bg-white transition-all"
              />
              {erros.aro && <span className="text-xs text-red-600 mt-1 block">{erros.aro}</span>}
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                Tala <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                step="0.1"
                min="3"
                max="16"
                required
                value={formData.tala || ''}
                onChange={(e) => handleInputChange('tala', Number(e.target.value))}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-yellow-400 focus:bg-white transition-all"
              />
              {erros.tala && <span className="text-xs text-red-600 mt-1 block">{erros.tala}</span>}
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                Furação <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.furacao || ''}
                onChange={(e) => handleInputChange('furacao', e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-yellow-400 focus:bg-white transition-all"
              />
              {erros.furacao && <span className="text-xs text-red-600 mt-1 block">{erros.furacao}</span>}
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                Cabeça Chave <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.cabeca_chave || ''}
                onChange={(e) => handleInputChange('cabeca_chave', e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-yellow-400 focus:bg-white transition-all"
              />
              {erros.cabeca_chave && (
                <span className="text-xs text-red-600 mt-1 block">{erros.cabeca_chave}</span>
              )}
            </div>
          </div>

          {/* Preço, Estoque no Depósito e Status */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-slate-50/80 p-4 rounded-2xl border border-slate-200/80">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Preço (R$) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                required
                value={formData.preco || ''}
                onChange={(e) => handleInputChange('preco', Number(e.target.value))}
                className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-semibold focus:outline-none focus:border-yellow-400 transition-all"
              />
              {erros.preco && <span className="text-xs text-red-600 mt-1 block">{erros.preco}</span>}
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Estoque no depósito <span className="text-red-500">*</span>
              </label>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => handleInputChange('estoque', Math.max(0, (formData.estoque || 0) - 1))}
                  className="w-9 h-9 rounded-xl bg-white border border-slate-200 font-extrabold text-slate-700 hover:bg-slate-100 flex items-center justify-center select-none"
                >
                  -
                </button>
                <input
                  type="number"
                  min="0"
                  required
                  value={formData.estoque ?? 0}
                  onChange={(e) => handleInputChange('estoque', Number(e.target.value))}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-center text-sm font-bold focus:outline-none focus:border-yellow-400 transition-all"
                />
                <button
                  type="button"
                  onClick={() => handleInputChange('estoque', (formData.estoque || 0) + 1)}
                  className="w-9 h-9 rounded-xl bg-white border border-slate-200 font-extrabold text-slate-700 hover:bg-slate-100 flex items-center justify-center select-none"
                >
                  +
                </button>
              </div>
              {erros.estoque && <span className="text-xs text-red-600 mt-1 block">{erros.estoque}</span>}
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Status
              </label>
              <select
                value={formData.status || 'Ativo'}
                onChange={(e) => handleInputChange('status', e.target.value)}
                className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-bold focus:outline-none focus:border-yellow-400 transition-all cursor-pointer"
              >
                <option value="Ativo">Ativo (Visível no catálogo)</option>
                <option value="Inativo">Inativo (Pausado)</option>
              </select>
            </div>
          </div>

          {/* Imagens */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600">
                Imagens Quadradas 1:1 (URLs) <span className="text-red-500">*</span>
              </label>
              <button
                type="button"
                onClick={handleAddImageUrl}
                className="inline-flex items-center gap-1 text-xs font-bold text-yellow-400 hover:text-yellow-700"
              >
                <Plus className="w-3.5 h-3.5" /> Adicionar foto
              </button>
            </div>

            <div className="space-y-2">
              <UploadImagemCloudinary
                sku={formData.sku}
                onUpload={(urls) => {
                  setFormData((prev) => ({
                    ...prev,
                    imagens: [...(prev.imagens || []).filter((imagem) => imagem.trim()), ...urls],
                  }));
                }}
              />
              {(formData.imagens || ['']).map((url, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <input
                    type="url"
                    value={url}
                    onChange={(e) => handleUpdateImageUrl(idx, e.target.value)}
                    className="flex-1 px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-yellow-400 focus:bg-white transition-all"
                  />
                  {(formData.imagens || []).length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveImageUrl(idx)}
                      className="p-2.5 text-slate-400 hover:text-red-600 rounded-xl border border-slate-200 hover:bg-red-50 transition-colors"
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
              Descrição do Modelo
            </label>
            <textarea
              rows={3}
              value={formData.descricao || ''}
              onChange={(e) => handleInputChange('descricao', e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-yellow-400 focus:bg-white transition-all"
            />
          </div>

          {/* Botões de Ação */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
            <a
              href={`/produto/${formData.sku || ''}`}
              className="px-5 py-2.5 text-xs font-bold text-slate-600 hover:text-slate-900 transition-colors uppercase tracking-wider"
            >
              Cancelar
            </a>
            <button
              type="submit"
              disabled={atualizarProduto.isPending}
              className="bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold uppercase tracking-wider px-6 py-3 rounded-full transition-all shadow-sm active:scale-95 disabled:opacity-50"
            >
              {atualizarProduto.isPending ? 'Salvando Alterações...' : 'Salvar Alterações'}
            </button>
          </div>
        </form>
      </div>

      {/* Live Preview à Direita */}
      <div className="lg:col-span-5">
        <div className="sticky top-24">
          <LiveCardPreview dados={formData} />
        </div>
      </div>
    </div>
  );
}

export function EdicaoProdutoForm({ id }: Props) {
  return (
    <QueryProvider>
      <EdicaoProdutoFormContent id={id} />
    </QueryProvider>
  );
}
