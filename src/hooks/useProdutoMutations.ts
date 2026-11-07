import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { Produto } from '@/lib/schemas/produto';

export function useProdutoMutations() {
  const qc = useQueryClient();

  const criarProduto = useMutation({
    mutationFn: async (dados: Partial<Produto>) => {
      const res = await fetch('/api/produtos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dados),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Erro ao criar produto');
      }
      return res.json();
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['produtos'] });
    },
  });

  const atualizarProduto = useMutation({
    mutationFn: async ({ id, dados }: { id: string; dados: Partial<Produto> }) => {
      const res = await fetch(`/api/produtos/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dados),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Erro ao atualizar produto');
      }
      return res.json();
    },
    onSuccess: (_, { id }) => {
      qc.invalidateQueries({ queryKey: ['produtos'] });
      qc.invalidateQueries({ queryKey: ['produto', id] });
    },
  });

  const excluirProduto = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/produtos/${id}`, {
        method: 'DELETE',
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Erro ao excluir produto');
      }
      return res.json();
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['produtos'] });
    },
  });

  const importarLote = useMutation({
    mutationFn: async (items: Partial<Produto>[]) => {
      const res = await fetch('/api/produtos/importar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Erro ao importar lote');
      }
      return res.json();
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['produtos'] });
    },
  });

  return { criarProduto, atualizarProduto, excluirProduto, importarLote };
}
