import { z } from 'zod';

export const ProdutoSchema = z.object({
  id: z.string().uuid().or(z.string().min(1)).optional(),
  titulo: z.string().min(2, 'O título é obrigatório'),
  marca: z.string().min(1, 'A marca é obrigatória'),
  modelo: z.string().min(1, 'O modelo é obrigatório'),
  aro: z.coerce.number().int().min(10, 'Aro inválido').max(30, 'Aro inválido'),
  tala: z.coerce.number().min(3, 'Tala inválida').max(16, 'Tala inválida'),
  furacao: z.string().min(3, 'Furação é obrigatória (ex: 4x100, 5x114.3)'),
  sku: z.string().min(2, 'SKU é obrigatório'),
  cabeca_chave: z.string().min(1, 'Cabeça de chave é obrigatória (ex: 17mm, 19mm)'),
  preco: z.coerce.number().min(0, 'Preço deve ser positivo').default(0),
  estoque: z.coerce.number().int().min(0, 'Estoque deve ser positivo').default(0),
  disponivel: z.coerce.boolean().default(true),
  imagens: z.array(z.string().url('URL de imagem inválida').or(z.string().min(1)))
    .min(1, 'Pelo menos 1 imagem válida é obrigatória'),
  descricao: z.string().default('').optional().transform((v) => v ?? ''),
  created_at: z.string().optional(),
  updated_at: z.string().optional(),
});

export type Produto = z.infer<typeof ProdutoSchema>;

// Filtros de busca no catálogo
export interface FiltrosCatalogo {
  q?: string;
  marca?: string;
  aro?: number;
  tala?: number;
  furacao?: string;
  cabeca_chave?: string;
  disponivel?: boolean;
  apenasEstoque?: boolean;
  ordenacao?: 'recentes' | 'preco-asc' | 'preco-desc' | 'aro-asc' | 'aro-desc' | 'titulo-asc' | 'titulo-desc';
}

// Opções para filtros no frontend
export interface OpcaoFiltro {
  valor: string | number;
  label: string;
  contagem?: number;
}
