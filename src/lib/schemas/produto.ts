import { z } from 'zod';

export const ProdutoSchema = z.object({
  id: z.string().uuid().or(z.string().min(1)).optional(),
  sku: z.string().min(2, 'SKU é obrigatório'),
  marca: z.string().min(1, 'A marca é obrigatória'),
  modelo: z.string().min(1, 'O modelo é obrigatório'),
  aro: z.coerce.number().int().min(10, 'Aro inválido').max(30, 'Aro inválido'),
  tala: z.coerce.number().min(3, 'Tala inválida').max(16, 'Tala inválida'),
  furacao: z.string().min(3, 'Furação é obrigatória (ex: 4x100, 5x114.3)'),
  cabeca_chave: z.string().min(1, 'Cabeça de chave é obrigatória (ex: 17mm, 19mm)'),
  titulo: z.string().min(2, 'O título é obrigatório'),
  acabamento: z.string().default('Padrão').optional().transform((v) => v || 'Padrão'),
  estoque: z.coerce.number().int().min(0, 'Estoque deve ser positivo').default(0),
  preco: z.coerce.number().min(0, 'Preço deve ser positivo').default(0),
  condicao: z.enum(['Nova', 'Seminova', 'Usada', 'Restaurada']).default('Nova').or(z.string()).transform((v) => v || 'Nova'),
  descricao: z.string().default('').optional().transform((v) => v ?? ''),
  status: z.enum(['Ativo', 'Inativo']).default('Ativo').or(z.string()).transform((v) => {
    const s = String(v).trim().toLowerCase();
    if (s === 'inativo' || s === 'inactive' || s === 'nao' || s === 'não' || s === '0' || s === 'false') {
      return 'Inativo';
    }
    return 'Ativo';
  }),
  imagens: z.array(z.string().url('URL de imagem inválida').or(z.string().min(1)))
    .min(1, 'Pelo menos 1 imagem válida é obrigatória'),
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
  acabamento?: string;
  condicao?: string;
  status?: 'Ativo' | 'Inativo';
  apenasEstoque?: boolean;
  ordenacao?: 'recentes' | 'preco-asc' | 'preco-desc' | 'aro-asc' | 'aro-desc' | 'titulo-asc' | 'titulo-desc';
  page?: number;
}

// Opções para filtros no frontend
export interface OpcaoFiltro {
  valor: string | number;
  label: string;
  contagem?: number;
}
