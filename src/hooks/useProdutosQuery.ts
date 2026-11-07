import { useQuery } from '@tanstack/react-query';
import type { Produto, FiltrosCatalogo } from '@/lib/schemas/produto';

export function useProdutosQuery(filtros: FiltrosCatalogo) {
  return useQuery<Produto[]>({
    queryKey: ['produtos', filtros],
    queryFn: async () => {
      const p = new URLSearchParams();
      if (filtros.q) p.set('q', filtros.q);
      if (filtros.marca) p.set('marca', filtros.marca);
      if (filtros.aro) p.set('aro', filtros.aro.toString());
      if (filtros.tala) p.set('tala', filtros.tala.toString());
      if (filtros.furacao) p.set('furacao', filtros.furacao);
      if (filtros.cabeca_chave) p.set('cabeca_chave', filtros.cabeca_chave);
      if (filtros.ordenacao) p.set('ordenacao', filtros.ordenacao);

      const res = await fetch(`/api/produtos?${p.toString()}`);
      if (!res.ok) {
        throw new Error('Falha ao consultar produtos no banco de dados');
      }
      return res.json();
    },
    placeholderData: (prev) => prev,
  });
}

export function useProdutoDetailQuery(idOrSku: string) {
  return useQuery<Produto>({
    queryKey: ['produto', idOrSku],
    queryFn: async () => {
      const res = await fetch(`/api/produtos/${idOrSku}`);
      if (!res.ok) {
        throw new Error('Produto não encontrado');
      }
      return res.json();
    },
    enabled: !!idOrSku,
  });
}
