# ESPECIFICAÇÃO DE ARQUITETURA COMPLETA (PRD TÉCNICO EXAUSTIVO)
## Sistema: Catálogo Visual, Ficha Individual e Gestão de Rodas Automotivas
### Stack: Astro (Islands) + React + Tailwind CSS + TanStack Query + Turso (LibSQL)

---

## 1. VISÃO GERAL E OBJETIVO DO PRODUTO

O sistema foi desenhado para equipes de vendas automotivas e operadores de balcão que necessitam:
1. **Identificar visualmente uma roda em menos de 3 segundos** através de fotografias grandes, bem iluminadas e sem distorções.
2. **Consultar estoque e especificações técnicas** (Aro, Tala, Furação, Offset, SKU) de forma instantânea.
3. **Buscar por combinações livres de palavras-chave** (ex: `Scorro Opala`, `14x5,5`, `5x114,3`, `Kromma 17` ou SKU exato).
4. **Visualizar a ficha individual completa de cada produto** com galeria quadrada, dados técnicos e compatibilidade automotiva.
5. **Cadastrar produtos manualmente** com prévia em tempo real (*Live Preview* quadrado 1:1).
6. **Importar dezenas ou centenas de produtos em lote** via planilhas CSV/Excel diretamente para o banco de dados.

---

## 2. MAPA GERAL DE ROTAS E TELAS DA APLICAÇÃO

| Rota | Arquivo Astro | Finalidade |
| :--- | :--- | :--- |
| `/` | `src/pages/index.astro` | **Tela 1: Catálogo Visual & Busca Rápida** (Menu lateral, filtros reativos, grade responsiva e modal rápido) |
| `/rodas/[id]` | `src/pages/rodas/[id].astro` | **Tela 2: Ficha Técnica Individual da Roda** (Galeria quadrada, dados completos, descrição do modelo, especificações e compatibilidade) |
| `/rodas/novo` | `src/pages/rodas/novo.astro` | **Tela 3: Criação de Produto** (Aba Manual com Live Preview 1:1 + Aba Importação via Planilha CSV/XLSX) |
| `/rodas/[id]/editar` | `src/pages/rodas/[id]/editar.astro` | **Tela 4: Edição de Produto** (Ajuste de medidas, controle de estoque com botões rápidos `+` / `-`, troca de foto e Live Preview) |
| `/api/wheels` | `src/pages/api/wheels/index.ts` | **API GET / POST:** Consulta com filtros multi-termo e cadastro individual no Turso |
| `/api/wheels/[id]` | `src/pages/api/wheels/[id].ts` | **API GET / PUT / DELETE:** Consulta detalhada, atualização e remoção de uma roda específica |
| `/api/wheels/batch` | `src/pages/api/wheels/batch.ts` | **API POST:** Inserção em lote atômica para planilhas usando `turso.batch` |

---

## 3. DESIGN TOKENS E REGRAS VISUAIS INVIOLÁVEIS

### 3.1. Regra Absoluta da Fotografia
> **REGRA CRÍTICA:** Toda e qualquer imagem de roda **deve ter proporção 1:1 estritamente quadrada** com `object-fit: contain` centralizado sobre fundo neutro muito claro (`#f8fafc` ou `bg-slate-50`). A fotografia nunca pode ser cortada, esticada ou achatada para priorizar textos ou diminuir a altura do card.

```html
<!-- Padrão obrigatório para exibição de imagens em toda a aplicação -->
<div class="aspect-square w-full bg-slate-50 flex items-center justify-center p-4 overflow-hidden rounded-t-[16px] border-b border-slate-100">
  <img src="..." alt="..." class="w-full h-full aspect-square object-contain drop-shadow-md transition-transform duration-200 hover:scale-105" loading="lazy" />
</div>
```

### 3.2. Configuração do Tailwind CSS
```javascript
// tailwind.config.mjs
/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        canvas: '#f8fafc',
        surface: '#ffffff',
        border: '#e2e8f0',
        brand: {
          DEFAULT: '#0f172a',
          hover: '#1e293b',
          accent: '#2563eb',
          'accent-light': '#eff6ff',
        },
        stock: {
          ok: '#16a34a',
          'ok-bg': '#ecfdf5',
          low: '#d97706',
          'low-bg': '#fffbeb',
          out: '#dc2626',
          'out-bg': '#fef2f2',
        }
      },
      borderRadius: {
        card: '18px',
        pill: '9999px',
      }
    }
  },
  plugins: [],
};
```

### 3.3. Distribuição da Grade
- **Mobile/Telas Médias (< 1024px):** 2 a 3 colunas (`grid-cols-1 sm:grid-cols-2 md:grid-cols-3`).
- **Desktop Padrão (1024px - 1439px):** 4 colunas (`lg:grid-cols-4`).
- **Monitores Amplos (>= 1440px):** 5 colunas (`2xl:grid-cols-5`), mantendo o espaçamento e largura mínima por card de ~280-310px.

---

## 4. ESTRUTURA DE ARQUIVOS E COMPONENTIZAÇÃO COMPLETA

```
src/
├── layouts/
│   └── BaseLayout.astro                 # Shell global com Header, Navbar, fontes e container
├── types/
│   └── wheel.ts                         # Schemas Zod e tipagens TypeScript completas
├── lib/
│   └── turso.ts                         # Cliente LibSQL configurado com variáveis de ambiente
├── hooks/
│   ├── useDebounce.ts                   # Debounce para busca sem engasgos
│   ├── useWheelsQuery.ts                # React Query para listagem e filtros
│   ├── useWheelDetailQuery.ts           # React Query para item individual
│   └── useWheelMutations.ts             # Mutações (Criar, Editar, Excluir, Lote)
├── components/
│   ├── providers/
│   │   └── QueryProvider.tsx            # Contexto global do TanStack Query
│   ├── navigation/
│   │   ├── Navbar.astro                 # Barra superior com logo, rotas e botão "+ Nova Roda"
│   │   └── Breadcrumb.astro             # Navegação hierárquica (ex: Catálogo > Scorro Opala)
│   ├── catalog/
│   │   ├── CatalogView.tsx              # ILHA: Integra Sidebar, Busca, Grid e Modal rápido
│   │   ├── SearchBar.tsx                # Campo amplo com ícone e limpeza rápida
│   │   ├── FilterSidebar.tsx            # Menu lateral com checkboxes de marca, aro, PCD e estoque
│   │   ├── WheelGrid.tsx                # Grade de produtos calibrada (3, 4 e 5 colunas)
│   │   ├── WheelCard.tsx                # Card quadrado 1:1 com etiquetas e saldo de estoque
│   │   └── QuickDetailModal.tsx         # Modal de conferência rápida sem sair do catálogo
│   ├── detail/
│   │   └── WheelDetailView.tsx          # Ficha individual completa: galeria, descrição e especificações
│   └── product-form/
│       ├── CreateProductTabs.tsx        # Alternador de abas (Manual vs Planilha)
│       ├── ManualCreateForm.tsx         # Formulário com inputs técnicos e upload
│       ├── EditProductForm.tsx          # Formulário de edição com ajuste de estoque +/-
│       ├── LiveCardPreview.tsx          # Espelho 1:1 que atualiza em tempo real
│       └── SheetImporter.tsx            # Parser de CSV/Excel com tabela de conferência
```

---

## 5. BANCO DE DADOS TURSO: DDL COMPLETO

Execute este SQL no Turso (`turso db shell <database>`) para suportar a descrição longa, dados de compatibilidade e especificações completas:

```sql
CREATE TABLE IF NOT EXISTS wheels (
  id TEXT PRIMARY KEY,
  titulo TEXT NOT NULL,
  marca TEXT NOT NULL,
  modelo TEXT NOT NULL,
  aro INTEGER NOT NULL,
  tala TEXT NOT NULL,
  furacao TEXT NOT NULL,
  sku TEXT NOT NULL UNIQUE,
  cabeca_chave TEXT NOT NULL,
  imagens TEXT NOT NULL, -- Array serializado em JSON com as URLs das fotos quadradas 1:1
  descricao TEXT DEFAULT '',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_wheels_sku ON wheels(sku);
CREATE INDEX IF NOT EXISTS idx_wheels_brand ON wheels(brand);
CREATE INDEX IF NOT EXISTS idx_wheels_aro ON wheels(aro);
CREATE INDEX IF NOT EXISTS idx_wheels_furacao ON wheels(furacao);
CREATE INDEX IF NOT EXISTS idx_wheels_stock ON wheels(stock);
```

---

## 6. CONTRATOS DE DADOS TYPESCRIPT (`src/types/wheel.ts`)

```typescript
// src/types/wheel.ts
import { z } from 'zod';

export const WheelSchema = z.object({
  id: z.string().optional(),
  titulo: z.string().min(2, "Título do produto é obrigatório"),
  marca: z.string().min(2, "Marca é obrigatória"),
  modelo: z.string().min(1, "Modelo é obrigatório"),
  aro: z.coerce.number().int().min(12).max(24, "Aro inválido"),
  tala: z.string().min(1, "Tala é obrigatória (ex: 5.5, 7.0)"),
  furacao: z.string().min(3, "Furação é obrigatória (ex: 4x100, 5x114,3)"),
  sku: z.string().min(3, "SKU é obrigatório"),
  cabeca_chave: z.string().min(1, "Cabeça de chave é obrigatória (ex: 17mm, 19mm, 21mm, Allen)"),
  imagens: z.array(z.string().url("URL de imagem inválida").or(z.string().min(1)))
    .min(1, "Pelo menos uma imagem quadrada (1:1) é obrigatória"),
  descricao: z.string().default(""),
  created_at: z.string().optional(),
  updated_at: z.string().optional(),
});

export type Wheel = z.infer<typeof WheelSchema>;

export interface FilterState {
  search: string;
  brand?: string;
  aro?: number;
  furacao?: string;
  onlyInStock: boolean;
  sortBy: 'featured' | 'aro-asc' | 'aro-desc' | 'stock-desc';
}
```

---

## 7. CLIENTE TURSO E ENDPOINTS DE BACKEND (ASTRO SSR)

### 7.1. Conexão (`src/lib/turso.ts`)
```typescript
// src/lib/turso.ts
import { createClient } from "@libsql/client";

export const turso = createClient({
  url: import.meta.env.TURSO_DATABASE_URL,
  authToken: import.meta.env.TURSO_AUTH_TOKEN,
});
```

### 7.2. API Coleção: Consulta com Filtros e Criação (`src/pages/api/wheels/index.ts`)
```typescript
// src/pages/api/wheels/index.ts
import type { APIRoute } from 'astro';
import { turso } from '../../../lib/turso';

export const GET: APIRoute = async ({ request }) => {
  const url = new URL(request.url);
  const q = url.searchParams.get('q') || '';
  const brand = url.searchParams.get('brand');
  const aro = url.searchParams.get('aro');
  const furacao = url.searchParams.get('furacao');
  const inStock = url.searchParams.get('inStock') === 'true';
  const sortBy = url.searchParams.get('sortBy') || 'featured';

  let sql = `SELECT * FROM wheels WHERE 1=1`;
  const args: any[] = [];

  if (q.trim()) {
    const terms = q.trim().split(/\s+/);
    terms.forEach(term => {
      sql += ` AND (
        LOWER(name) LIKE ? OR 
        LOWER(sku) LIKE ? OR 
        LOWER(brand) LIKE ? OR 
        LOWER(furacao) LIKE ? OR 
        CAST(aro AS TEXT) LIKE ? OR 
        LOWER(finish) LIKE ?
      )`;
      const wild = `%${term.toLowerCase()}%`;
      args.push(wild, wild, wild, wild, wild, wild);
    });
  }

  if (brand) {
    sql += ` AND LOWER(brand) = LOWER(?)`;
    args.push(brand);
  }

  if (aro) {
    sql += ` AND aro = ?`;
    args.push(parseInt(aro));
  }

  if (furacao) {
    sql += ` AND LOWER(furacao) = LOWER(?)`;
    args.push(furacao);
  }

  if (inStock) {
    sql += ` AND stock > 0`;
  }

  if (sortBy === 'aro-asc') sql += ` ORDER BY aro ASC, name ASC`;
  else if (sortBy === 'aro-desc') sql += ` ORDER BY aro DESC, name ASC`;
  else if (sortBy === 'stock-desc') sql += ` ORDER BY stock DESC, name ASC`;
  else sql += ` ORDER BY stock DESC, updated_at DESC`;

  sql += ` LIMIT 150`;

  const result = await turso.execute({ sql, args });
  return new Response(JSON.stringify(result.rows), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
};

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const id = body.id || crypto.randomUUID();

    await turso.execute({
      sql: `INSERT INTO wheels (
        id, name, sku, brand, aro, tala, furacao, offset, cb_furo_central, 
        finish, material, weight_kg, stock, min_stock_alert, image_url, 
        description, compatibility_notes
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [
        id,
        body.name,
        body.sku,
        body.brand.toUpperCase(),
        body.aro,
        body.tala,
        body.furacao,
        body.offset || 'ET0',
        body.cb_furo_central || 'N/D',
        body.finish || 'Padrão',
        body.material || 'LIGA_LEVE',
        body.weight_kg || 0,
        body.stock || 0,
        body.min_stock_alert || 4,
        body.image_url,
        body.description || '',
        body.compatibility_notes || ''
      ]
    });

    return new Response(JSON.stringify({ id, success: true }), { status: 201 });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
};
```

### 7.3. API Item Individual: Detalhe, Atualização e Exclusão (`src/pages/api/wheels/[id].ts`)
```typescript
// src/pages/api/wheels/[id].ts
import type { APIRoute } from 'astro';
import { turso } from '../../../lib/turso';

export const GET: APIRoute = async ({ params }) => {
  const { id } = params;
  const result = await turso.execute({
    sql: `SELECT * FROM wheels WHERE id = ? OR sku = ? LIMIT 1`,
    args: [id!, id!]
  });

  if (result.rows.length === 0) {
    return new Response(JSON.stringify({ error: 'Roda não encontrada' }), { status: 404 });
  }

  return new Response(JSON.stringify(result.rows[0]), {
    status: 200,
    headers: { 'Content-Type': 'application/json' }
  });
};

export const PUT: APIRoute = async ({ params, request }) => {
  const { id } = params;
  const body = await request.json();

  await turso.execute({
    sql: `UPDATE wheels SET 
      name = ?, sku = ?, brand = ?, aro = ?, tala = ?, furacao = ?, 
      offset = ?, cb_furo_central = ?, finish = ?, material = ?, 
      weight_kg = ?, stock = ?, min_stock_alert = ?, image_url = ?, 
      description = ?, compatibility_notes = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?`,
    args: [
      body.name,
      body.sku,
      body.brand.toUpperCase(),
      body.aro,
      body.tala,
      body.furacao,
      body.offset,
      body.cb_furo_central || 'N/D',
      body.finish,
      body.material,
      body.weight_kg || 0,
      body.stock,
      body.min_stock_alert,
      body.image_url,
      body.description || '',
      body.compatibility_notes || '',
      id!
    ]
  });

  return new Response(JSON.stringify({ success: true }), { status: 200 });
};

export const DELETE: APIRoute = async ({ params }) => {
  const { id } = params;
  await turso.execute({
    sql: `DELETE FROM wheels WHERE id = ?`,
    args: [id!]
  });
  return new Response(JSON.stringify({ success: true }), { status: 200 });
};
```

### 7.4. API Lote: Importação em Massa de Planilha (`src/pages/api/wheels/batch.ts`)
```typescript
// src/pages/api/wheels/batch.ts
import type { APIRoute } from 'astro';
import { turso } from '../../../lib/turso';

export const POST: APIRoute = async ({ request }) => {
  try {
    const { items } = await request.json();

    if (!Array.isArray(items) || items.length === 0) {
      return new Response(JSON.stringify({ error: "Nenhum item enviado" }), { status: 400 });
    }

    const statements = items.map(item => ({
      sql: `INSERT OR REPLACE INTO wheels (
        id, name, sku, brand, aro, tala, furacao, offset, cb_furo_central,
        finish, material, weight_kg, stock, min_stock_alert, image_url,
        description, compatibility_notes
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [
        item.id || crypto.randomUUID(),
        item.name,
        item.sku,
        item.brand.toUpperCase(),
        parseInt(item.aro),
        item.tala.toString(),
        item.furacao.toString(),
        item.offset || 'ET0',
        item.cb_furo_central || 'N/D',
        item.finish || 'Padrão',
        item.material || 'LIGA_LEVE',
        item.weight_kg || 0,
        parseInt(item.stock) || 0,
        item.min_stock_alert || 4,
        item.image_url || 'https://images.unsplash.com/photo-1578844251758-2f71da64c96f?auto=format&fit=crop&w=600&q=80',
        item.description || '',
        item.compatibility_notes || ''
      ]
    }));

    await turso.batch(statements, 'write');
    return new Response(JSON.stringify({ importedCount: items.length, success: true }), { status: 200 });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
};
```

---

## 8. HOOKS E ESTADO DO TANSTACK QUERY

### 8.1. Hook de Debounce (`src/hooks/useDebounce.ts`)
```typescript
// src/hooks/useDebounce.ts
import { useState, useEffect } from 'react';

export function useDebounce<T>(value: T, delay = 150): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);

  return debouncedValue;
}
```

### 8.2. Hook de Busca do Catálogo (`src/hooks/useWheelsQuery.ts`)
```typescript
// src/hooks/useWheelsQuery.ts
import { useQuery } from '@tanstack/react-query';
import type { Wheel, FilterState } from '../types/wheel';

export function useWheelsQuery(filters: FilterState) {
  return useQuery<Wheel[]>({
    queryKey: ['wheels', filters],
    queryFn: async () => {
      const p = new URLSearchParams();
      if (filters.search) p.set('q', filters.search);
      if (filters.brand) p.set('brand', filters.brand);
      if (filters.aro) p.set('aro', filters.aro.toString());
      if (filters.furacao) p.set('furacao', filters.furacao);
      if (filters.onlyInStock) p.set('inStock', 'true');
      if (filters.sortBy) p.set('sortBy', filters.sortBy);

      const res = await fetch(`/api/wheels?${p.toString()}`);
      if (!res.ok) throw new Error('Erro ao carregar catálogo');
      return res.json();
    },
    placeholderData: (prev) => prev,
  });
}
```

### 8.3. Hook de Item Individual (`src/hooks/useWheelDetailQuery.ts`)
```typescript
// src/hooks/useWheelDetailQuery.ts
import { useQuery } from '@tanstack/react-query';
import type { Wheel } from '../types/wheel';

export function useWheelDetailQuery(id: string) {
  return useQuery<Wheel>({
    queryKey: ['wheel', id],
    queryFn: async () => {
      const res = await fetch(`/api/wheels/${id}`);
      if (!res.ok) throw new Error('Roda não encontrada');
      return res.json();
    },
    enabled: !!id,
  });
}
```

### 8.4. Hook de Mutações (`src/hooks/useWheelMutations.ts`)
```typescript
// src/hooks/useWheelMutations.ts
import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { Wheel } from '../types/wheel';

export function useWheelMutations() {
  const qc = useQueryClient();

  const createWheel = useMutation({
    mutationFn: async (wheel: Partial<Wheel>) => {
      const res = await fetch('/api/wheels', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(wheel),
      });
      if (!res.ok) throw new Error('Erro ao salvar roda');
      return res.json();
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['wheels'] }),
  });

  const updateWheel = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<Wheel> }) => {
      const res = await fetch(`/api/wheels/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error('Erro ao atualizar roda');
      return res.json();
    },
    onSuccess: (_, { id }) => {
      qc.invalidateQueries({ queryKey: ['wheels'] });
      qc.invalidateQueries({ queryKey: ['wheel', id] });
    },
  });

  const deleteWheel = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/wheels/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Erro ao excluir roda');
      return res.json();
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['wheels'] }),
  });

  const batchImport = useMutation({
    mutationFn: async (items: Partial<Wheel>[]) => {
      const res = await fetch('/api/wheels/batch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items }),
      });
      if (!res.ok) throw new Error('Erro ao importar planilha');
      return res.json();
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['wheels'] }),
  });

  return { createWheel, updateWheel, deleteWheel, batchImport };
}
```

---

## 9. COMPONENTES DO SISTEMA

### 9.1. Shell Global (`src/layouts/BaseLayout.astro`)
```astro
---
// src/layouts/BaseLayout.astro
import Navbar from '../components/navigation/Navbar.astro';

interface Props {
  title?: string;
  description?: string;
}

const { 
  title = "Catálogo Visual de Rodas Automotivas", 
  description = "Consulta rápida de rodas, especificações e estoque." 
} = Astro.props;
---
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>{title}</title>
  <meta name="description" content={description} />
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet">
</head>
<body class="bg-slate-50 text-slate-900 font-sans antialiased min-h-screen flex flex-col">
  <Navbar />
  <slot />
</body>
</html>
```

### 9.2. Barra Superior (`src/components/navigation/Navbar.astro`)
```astro
---
// src/components/navigation/Navbar.astro
const pathname = Astro.url.pathname;
---
<header class="bg-white border-b border-slate-200 sticky top-0 z-30">
  <div class="max-w-[1720px] mx-auto px-6 py-4 flex items-center justify-between">
    <div class="flex items-center gap-8">
      <a href="/" class="flex items-center gap-2 group">
        <div class="w-8 h-8 rounded-lg bg-slate-900 flex items-center justify-center text-white font-extrabold text-sm">
          R
        </div>
        <div class="flex flex-col">
          <span class="font-extrabold text-base tracking-tight text-slate-900 group-hover:text-blue-600 transition-colors">
            WHEEL CATALOG
          </span>
          <span class="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
            Consulta Rápida & Estoque
          </span>
        </div>
      </a>

      <nav class="hidden md:flex items-center gap-2">
        <a 
          href="/" 
          class={`text-xs font-bold uppercase tracking-wider px-3.5 py-2 rounded-full transition-colors ${
            pathname === '/' ? 'bg-slate-100 text-slate-900' : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          Catálogo
        </a>
      </nav>
    </div>

    <div class="flex items-center gap-3">
      <a 
        href="/rodas/novo" 
        class="inline-flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold uppercase tracking-wider px-4 py-2.5 rounded-full transition-all shadow-sm hover:shadow"
      >
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.2" d="M12 4v16m8-8H4"></path>
        </svg>
        Nova Roda
      </a>
    </div>
  </div>
</header>
```

### 9.3. Card do Produto com Aspecto 1:1 (`src/components/catalog/WheelCard.tsx`)
```tsx
// src/components/catalog/WheelCard.tsx
import React from 'react';
import type { Wheel } from '../../types/wheel';

interface Props {
  wheel: Wheel;
  onOpenQuickDetail: (wheel: Wheel) => void;
}

export function WheelCard({ wheel, onOpenQuickDetail }: Props) {
  const isOutOfStock = wheel.stock === 0;
  const isLowStock = wheel.stock > 0 && wheel.stock <= 3;

  return (
    <article className="group bg-white border border-slate-200 rounded-[18px] overflow-hidden flex flex-col shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-200">
      
      {/* IMAGEM ESTRITAMENTE QUADRADA 1:1 COM OBJECT-FIT CONTAIN */}
      <a href={`/rodas/${wheel.id}`} className="w-full aspect-square bg-slate-50 flex items-center justify-center p-6 relative border-b border-slate-100 overflow-hidden cursor-pointer">
        <img 
          src={wheel.image_url} 
          alt={wheel.name} 
          className="w-full h-full aspect-square object-contain drop-shadow-md group-hover:scale-105 transition-transform duration-200" 
          loading="lazy" 
        />
      </a>

      <div className="p-5 flex flex-col flex-grow gap-2">
        <a href={`/rodas/${wheel.id}`} className="font-bold text-slate-900 text-base truncate hover:text-blue-600 transition-colors" title={wheel.name}>
          {wheel.name}
        </a>
        <span className="text-xs font-mono text-slate-500">
          SKU: {wheel.sku}
        </span>

        {/* Pílulas de Especificações */}
        <div className="flex flex-wrap gap-1.5 my-1">
          <span className="text-xs font-bold px-2.5 py-1 bg-slate-100 text-slate-800 rounded-full">
            ARO {wheel.aro}
          </span>
          <span className="text-xs font-bold px-2.5 py-1 bg-slate-100 text-slate-800 rounded-full">
            TALA {wheel.tala}
          </span>
          <span className="text-xs font-bold px-2.5 py-1 bg-slate-100 text-slate-800 rounded-full">
            {wheel.furacao}
          </span>
        </div>

        {/* Rodapé: Estoque e Marca */}
        <div className="flex items-end justify-between pt-2.5 mt-auto border-t border-slate-100">
          <div className="flex flex-col">
            <span className="text-[10px] uppercase font-semibold text-slate-400">Estoque</span>
            <span className={`text-sm font-bold ${
              isOutOfStock ? 'text-red-600' : isLowStock ? 'text-amber-600' : 'text-slate-900'
            }`}>
              {isOutOfStock ? 'Sem estoque' : isLowStock ? `${wheel.stock} un. (Baixo)` : `${wheel.stock} unidades`}
            </span>
          </div>

          <div className="flex flex-col items-end">
            <span className="text-[10px] uppercase font-semibold text-slate-400">Marca</span>
            <span className="text-sm font-extrabold uppercase text-slate-900 tracking-wide">
              {wheel.brand}
            </span>
          </div>
        </div>

        {/* Ações */}
        <div className="grid grid-cols-2 gap-2 pt-3 mt-1 border-t border-slate-100">
          <button 
            type="button"
            onClick={() => onOpenQuickDetail(wheel)}
            className="bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold py-2 px-3 rounded-full transition-colors text-center"
          >
            Consulta Rápida
          </button>
          <a 
            href={`/rodas/${wheel.id}`}
            className="border border-slate-200 hover:bg-slate-100 text-slate-900 text-xs font-semibold py-2 px-3 rounded-full transition-colors text-center"
          >
            Ficha Completa
          </a>
        </div>
      </div>
    </article>
  );
}
```

### 9.4. Menu Lateral de Filtros (`src/components/catalog/FilterSidebar.tsx`)
```tsx
// src/components/catalog/FilterSidebar.tsx
import React from 'react';
import { Search } from 'lucide-react';

interface Props {
  searchQuery: string;
  onSearchChange: (q: string) => void;
  selectedBrand?: string;
  onBrandChange: (brand?: string) => void;
  selectedAro?: number;
  onAroChange: (aro?: number) => void;
  selectedFuracao?: string;
  onFuracaoChange: (furacao?: string) => void;
  onlyInStock: boolean;
  onInStockChange: (inStock: boolean) => void;
  onClear: () => void;
}

export function FilterSidebar({
  searchQuery,
  onSearchChange,
  selectedBrand,
  onBrandChange,
  selectedAro,
  onAroChange,
  selectedFuracao,
  onFuracaoChange,
  onlyInStock,
  onInStockChange,
  onClear,
}: Props) {
  return (
    <aside className="w-[290px] shrink-0 flex flex-col gap-5">
      <div className="flex flex-col gap-2">
        <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
          Pesquisa Rápida
        </label>
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Modelo, marca, SKU, aro..."
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100 transition-all shadow-sm"
            autoFocus
          />
        </div>
      </div>

      <div className="flex items-center justify-between pb-2 border-b border-slate-200">
        <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Filtros</span>
        <button 
          onClick={onClear} 
          className="text-xs font-bold uppercase text-slate-400 hover:text-blue-600 transition-colors"
        >
          Limpar
        </button>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl p-4 flex flex-col gap-2 shadow-sm">
        <span className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">Marca</span>
        {['SCORRO', 'KROMMA', 'TSW', 'VOLCANO', 'ENKEI', 'BBS'].map((brand) => (
          <label key={brand} className="flex items-center gap-2.5 text-sm cursor-pointer select-none">
            <input
              type="checkbox"
              checked={selectedBrand === brand}
              onChange={() => onBrandChange(selectedBrand === brand ? undefined : brand)}
              className="w-4 h-4 accent-blue-600 rounded cursor-pointer"
            />
            <span className="text-slate-800">{brand}</span>
          </label>
        ))}
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl p-4 flex flex-col gap-2 shadow-sm">
        <span className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">Aro (Diâmetro)</span>
        {[13, 14, 15, 17, 18, 19, 20].map((aro) => (
          <label key={aro} className="flex items-center gap-2.5 text-sm cursor-pointer select-none">
            <input
              type="checkbox"
              checked={selectedAro === aro}
              onChange={() => onAroChange(selectedAro === aro ? undefined : aro)}
              className="w-4 h-4 accent-blue-600 rounded cursor-pointer"
            />
            <span className="text-slate-800">Aro {aro}"</span>
          </label>
        ))}
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl p-4 flex flex-col gap-2 shadow-sm">
        <span className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">Furação (PCD)</span>
        {['4x100', '5x114,3', '5x100', '4x108', '5x112', '5x120'].map((pcd) => (
          <label key={pcd} className="flex items-center gap-2.5 text-sm cursor-pointer select-none">
            <input
              type="checkbox"
              checked={selectedFuracao === pcd}
              onChange={() => onFuracaoChange(selectedFuracao === pcd ? undefined : pcd)}
              className="w-4 h-4 accent-blue-600 rounded cursor-pointer"
            />
            <span className="text-slate-800">{pcd}</span>
          </label>
        ))}
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl p-4 flex flex-col gap-2 shadow-sm">
        <span className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">Disponibilidade</span>
        <label className="flex items-center gap-2.5 text-sm cursor-pointer select-none">
          <input
            type="checkbox"
            checked={onlyInStock}
            onChange={(e) => onInStockChange(e.target.checked)}
            className="w-4 h-4 accent-blue-600 rounded cursor-pointer"
          />
          <span className="text-slate-800 font-medium">Apenas em Estoque</span>
        </label>
      </div>
    </aside>
  );
}
```

### 9.5. Ilha Principal do Catálogo (`src/components/catalog/CatalogView.tsx`)
```tsx
// src/components/catalog/CatalogView.tsx
import React, { useState } from 'react';
import { FilterSidebar } from './FilterSidebar';
import { WheelCard } from './WheelCard';
import { QuickDetailModal } from './QuickDetailModal';
import { useDebounce } from '../../hooks/useDebounce';
import { useWheelsQuery } from '../../hooks/useWheelsQuery';
import type { Wheel, FilterState } from '../../types/wheel';

export function CatalogView() {
  const [searchInput, setSearchInput] = useState('');
  const debouncedSearch = useDebounce(searchInput, 150);

  const [filters, setFilters] = useState<Omit<FilterState, 'search'>>({
    brand: undefined,
    aro: undefined,
    furacao: undefined,
    onlyInStock: false,
    sortBy: 'featured',
  });

  const [quickWheel, setQuickWheel] = useState<Wheel | null>(null);

  const { data: wheels = [], isLoading } = useWheelsQuery({
    search: debouncedSearch,
    ...filters,
  });

  return (
    <div className="max-w-[1720px] mx-auto px-6 py-8 flex gap-9">
      <FilterSidebar
        searchQuery={searchInput}
        onSearchChange={setSearchInput}
        selectedBrand={filters.brand}
        onBrandChange={(brand) => setFilters(f => ({ ...f, brand }))}
        selectedAro={filters.aro}
        onAroChange={(aro) => setFilters(f => ({ ...f, aro }))}
        selectedFuracao={filters.furacao}
        onFuracaoChange={(furacao) => setFilters(f => ({ ...f, furacao }))}
        onlyInStock={filters.onlyInStock}
        onInStockChange={(onlyInStock) => setFilters(f => ({ ...f, onlyInStock }))}
        onClear={() => {
          setSearchInput('');
          setFilters({ brand: undefined, aro: undefined, furacao: undefined, onlyInStock: false, sortBy: 'featured' });
        }}
      />

      <main className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-5">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
            {isLoading ? 'Consultando...' : `Exibindo ${wheels.length} rodas disponíveis`}
          </span>

          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Ordenar:</span>
            <select
              value={filters.sortBy}
              onChange={(e) => setFilters(f => ({ ...f, sortBy: e.target.value as any }))}
              className="bg-white border border-slate-200 text-xs font-semibold px-3 py-1.5 rounded-lg outline-none cursor-pointer"
            >
              <option value="featured">Destaques</option>
              <option value="aro-asc">Menor Aro</option>
              <option value="aro-desc">Maior Aro</option>
              <option value="stock-desc">Maior Estoque</option>
            </select>
          </div>
        </div>

        {wheels.length === 0 && !isLoading ? (
          <div className="bg-white border border-dashed border-slate-300 rounded-[18px] p-16 text-center text-slate-500">
            <h3 className="font-bold text-slate-800 text-base mb-1">Nenhuma roda encontrada</h3>
            <p className="text-xs">Tente buscar por termos mais genéricos ou limpar os filtros laterais.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-5 gap-5">
            {wheels.map((wheel) => (
              <WheelCard 
                key={wheel.id} 
                wheel={wheel} 
                onOpenQuickDetail={setQuickWheel} 
              />
            ))}
          </div>
        )}
      </main>

      {quickWheel && (
        <QuickDetailModal 
          wheel={quickWheel} 
          onClose={() => setQuickWheel(null)} 
        />
      )}
    </div>
  );
}
```

### 9.6. Modal Rápido de Balcão (`src/components/catalog/QuickDetailModal.tsx`)
```tsx
// src/components/catalog/QuickDetailModal.tsx
import React, { useEffect } from 'react';
import type { Wheel } from '../../types/wheel';

interface Props {
  wheel: Wheel;
  onClose: () => void;
}

export function QuickDetailModal({ wheel, onClose }: Props) {
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-[20px] max-w-xl w-full overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-150">
        <div className="p-6">
          <div className="flex justify-between items-start mb-4">
            <div>
              <span className="text-xs font-mono text-slate-500">SKU: {wheel.sku}</span>
              <h2 className="text-xl font-extrabold text-slate-900 mt-0.5">{wheel.name}</h2>
            </div>
            <button onClick={onClose} className="text-slate-400 hover:text-slate-700 text-2xl leading-none">&times;</button>
          </div>

          <div className="w-full max-w-[260px] aspect-square mx-auto bg-slate-50 rounded-xl p-4 flex items-center justify-center border border-slate-100 mb-5">
            <img src={wheel.image_url} alt={wheel.name} className="w-full h-full aspect-square object-contain" />
          </div>

          <table className="w-full text-xs text-left mb-5">
            <tbody className="divide-y divide-slate-100">
              <tr><td className="py-2 text-slate-400 font-semibold">Marca</td><td className="py-2 font-bold text-slate-900">{wheel.brand}</td></tr>
              <tr><td className="py-2 text-slate-400 font-semibold">Aro e Tala</td><td className="py-2 font-bold text-slate-900">Aro {wheel.aro}" | Tala {wheel.tala}"</td></tr>
              <tr><td className="py-2 text-slate-400 font-semibold">Furação (PCD)</td><td className="py-2 font-bold text-slate-900">{wheel.furacao}</td></tr>
              <tr><td className="py-2 text-slate-400 font-semibold">Offset (ET)</td><td className="py-2 font-bold text-slate-900">{wheel.offset}</td></tr>
              <tr><td className="py-2 text-slate-400 font-semibold">Furo Central (CB)</td><td className="py-2 font-bold text-slate-900">{wheel.cb_furo_central}</td></tr>
              <tr><td className="py-2 text-slate-400 font-semibold">Estoque Pronta Entrega</td><td className="py-2 font-extrabold text-blue-600 text-sm">{wheel.stock} unidades</td></tr>
            </tbody>
          </table>

          <div className="flex gap-2">
            <a 
              href={`/rodas/${wheel.id}`} 
              className="flex-1 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs py-2.5 rounded-full text-center transition-colors"
            >
              Abrir Ficha Completa
            </a>
            <a 
              href={`/rodas/${wheel.id}/editar`} 
              className="px-5 border border-slate-200 hover:bg-slate-100 text-slate-700 font-bold text-xs py-2.5 rounded-full text-center transition-colors"
            >
              Editar Roda
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
```

---

## 10. TELA DE FICHA INDIVIDUAL (`/rodas/[id]`)

### 10.1. Página Astro (`src/pages/rodas/[id].astro`)
```astro
---
// src/pages/rodas/[id].astro
import BaseLayout from '../../layouts/BaseLayout.astro';
import { QueryProvider } from '../../components/providers/QueryProvider';
import { WheelDetailView } from '../../components/detail/WheelDetailView';

const { id } = Astro.params;
---
<BaseLayout title={`Detalhes da Roda | Wheel Catalog`}>
  <QueryProvider client:load>
    <WheelDetailView id={id!} client:load />
  </QueryProvider>
</BaseLayout>
```

### 10.2. Componente de Ficha Individual (`src/components/detail/WheelDetailView.tsx`)
```tsx
// src/components/detail/WheelDetailView.tsx
import React from 'react';
import { ArrowLeft, Edit3, Box, Info } from 'lucide-react';
import { useWheelDetailQuery } from '../../hooks/useWheelDetailQuery';

export function WheelDetailView({ id }: { id: string }) {
  const { data: wheel, isLoading, isError } = useWheelDetailQuery(id);

  if (isLoading) {
    return <div className="max-w-6xl mx-auto px-6 py-20 text-center text-slate-400">Carregando ficha da roda...</div>;
  }

  if (isError || !wheel) {
    return (
      <div className="max-w-6xl mx-auto px-6 py-20 text-center">
        <h2 className="text-xl font-bold text-slate-800">Roda não encontrada</h2>
        <a href="/" className="inline-block mt-4 text-xs font-bold text-blue-600 uppercase underline">Voltar ao Catálogo</a>
      </div>
    );
  }

  return (
    <main className="max-w-6xl mx-auto px-6 py-8">
      <div className="flex items-center justify-between mb-8 pb-4 border-b border-slate-200">
        <a href="/" className="inline-flex items-center gap-2 text-xs font-bold uppercase text-slate-500 hover:text-slate-900 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Voltar ao Catálogo
        </a>
        <a 
          href={`/rodas/${wheel.id}/editar`}
          className="inline-flex items-center gap-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-900 text-xs font-bold uppercase px-4 py-2 rounded-full transition-colors shadow-sm"
        >
          <Edit3 className="w-3.5 h-3.5" /> Editar Informações
        </a>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        <div className="lg:col-span-5">
          <div className="w-full aspect-square bg-white border border-slate-200 rounded-[20px] p-8 flex items-center justify-center shadow-sm">
            <img 
              src={wheel.image_url} 
              alt={wheel.name} 
              className="w-full h-full aspect-square object-contain drop-shadow-xl" 
            />
          </div>
          <p className="text-[11px] text-center text-slate-400 mt-2 font-medium">
            Fotografia oficial em proporção 1:1 sem distorção dimensional
          </p>
        </div>

        <div className="lg:col-span-7 flex flex-col gap-6">
          <div>
            <div className="flex items-center gap-3">
              <span className="text-xs font-mono bg-slate-100 text-slate-600 px-2.5 py-0.5 rounded-md">
                SKU: {wheel.sku}
              </span>
              <span className="text-xs font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-2.5 py-0.5 rounded-md">
                {wheel.brand}
              </span>
            </div>
            <h1 className="text-3xl font-extrabold text-slate-900 mt-2 tracking-tight">
              {wheel.name}
            </h1>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-5 flex items-center justify-between shadow-sm">
            <div className="flex items-center gap-3">
              <Box className="w-6 h-6 text-slate-400" />
              <div>
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Saldo Físico</span>
                <span className="text-xl font-extrabold text-slate-900">
                  {wheel.stock} unidades disponíveis
                </span>
              </div>
            </div>
            <span className={`text-xs font-bold uppercase px-3 py-1.5 rounded-full ${
              wheel.stock > 0 ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'
            }`}>
              {wheel.stock > 0 ? 'Pronta Entrega' : 'Esgotado'}
            </span>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4">
              Especificações Técnicas
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs">
              <div className="bg-slate-50 p-3 rounded-xl">
                <span className="text-slate-400 block font-semibold mb-0.5">Aro (Diâmetro)</span>
                <span className="font-extrabold text-slate-900 text-sm">{wheel.aro}"</span>
              </div>
              <div className="bg-slate-50 p-3 rounded-xl">
                <span className="text-slate-400 block font-semibold mb-0.5">Tala (Largura)</span>
                <span className="font-extrabold text-slate-900 text-sm">{wheel.tala}"</span>
              </div>
              <div className="bg-slate-50 p-3 rounded-xl">
                <span className="text-slate-400 block font-semibold mb-0.5">Furação (PCD)</span>
                <span className="font-extrabold text-slate-900 text-sm">{wheel.furacao}</span>
              </div>
              <div className="bg-slate-50 p-3 rounded-xl">
                <span className="text-slate-400 block font-semibold mb-0.5">Offset (ET)</span>
                <span className="font-extrabold text-slate-900 text-sm">{wheel.offset}</span>
              </div>
              <div className="bg-slate-50 p-3 rounded-xl">
                <span className="text-slate-400 block font-semibold mb-0.5">Furo Central (CB)</span>
                <span className="font-extrabold text-slate-900 text-sm">{wheel.cb_furo_central}</span>
              </div>
              <div className="bg-slate-50 p-3 rounded-xl">
                <span className="text-slate-400 block font-semibold mb-0.5">Acabamento</span>
                <span className="font-extrabold text-slate-900 text-sm">{wheel.finish}</span>
              </div>
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1.5">
              <Info className="w-3.5 h-3.5" /> Descrição do Modelo
            </h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              {wheel.description || "Nenhuma descrição técnica detalhada informada para este produto."}
            </p>
          </div>

          {wheel.compatibility_notes && (
            <div className="bg-blue-50/50 border border-blue-100 rounded-2xl p-5 text-xs text-blue-900">
              <span className="font-bold block mb-1 uppercase tracking-wider text-blue-700">
                Compatibilidade e Aplicações:
              </span>
              <p className="leading-relaxed">{wheel.compatibility_notes}</p>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
```

---

## 11. TELA DE CRIAÇÃO E IMPORTAÇÃO (`/rodas/novo`)

### 11.1. Página Astro (`src/pages/rodas/novo.astro`)
```astro
---
// src/pages/rodas/novo.astro
import BaseLayout from '../../layouts/BaseLayout.astro';
import { QueryProvider } from '../../components/providers/QueryProvider';
import { CreateProductTabs } from '../../components/product-form/CreateProductTabs';
---
<BaseLayout title="Cadastrar Nova Roda | Wheel Catalog">
  <QueryProvider client:load>
    <CreateProductTabs client:load />
  </QueryProvider>
</BaseLayout>
```

### 11.2. Alternador de Abas (`src/components/product-form/CreateProductTabs.tsx`)
```tsx
// src/components/product-form/CreateProductTabs.tsx
import React, { useState } from 'react';
import { ManualCreateForm } from './ManualCreateForm';
import { SheetImporter } from './SheetImporter';
import { FileEdit, FileSpreadsheet } from 'lucide-react';

export function CreateProductTabs() {
  const [activeTab, setActiveTab] = useState<'manual' | 'sheet'>('manual');

  return (
    <main className="max-w-[1440px] mx-auto px-6 py-8">
      <div className="flex items-center justify-between mb-8 pb-4 border-b border-slate-200">
        <div>
          <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Cadastro de Produtos</span>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Adicionar Rodas</h1>
        </div>

        <div className="inline-flex bg-slate-200/80 p-1 rounded-full border border-slate-200">
          <button
            onClick={() => setActiveTab('manual')}
            className={`inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider px-4 py-2 rounded-full transition-all ${
              activeTab === 'manual' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <FileEdit className="w-3.5 h-3.5" /> Cadastro Manual
          </button>
          <button
            onClick={() => setActiveTab('sheet')}
            className={`inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider px-4 py-2 rounded-full transition-all ${
              activeTab === 'sheet' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <FileSpreadsheet className="w-3.5 h-3.5" /> Importar da Planilha
          </button>
        </div>
      </div>

      {activeTab === 'manual' ? <ManualCreateForm /> : <SheetImporter />}
    </main>
  );
}
```

### 11.3. Importador em Massa (`src/components/product-form/SheetImporter.tsx`)
```tsx
// src/components/product-form/SheetImporter.tsx
import React, { useState } from 'react';
import Papa from 'papaparse';
import * as XLSX from 'xlsx';
import { UploadCloud, CheckCircle2 } from 'lucide-react';
import { useWheelMutations } from '../../hooks/useWheelMutations';
import type { Wheel } from '../../types/wheel';

export function SheetImporter() {
  const [parsedItems, setParsedItems] = useState<Partial<Wheel>[]>([]);
  const { batchImport } = useWheelMutations();

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.name.endsWith('.csv')) {
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          mapAndSetItems(results.data);
        },
      });
    } else {
      const reader = new FileReader();
      reader.onload = (evt) => {
        const bstr = evt.target?.result;
        const wb = XLSX.read(bstr, { type: 'binary' });
        const wsName = wb.SheetNames[0];
        const data = XLSX.utils.sheet_to_json(wb.Sheets[wsName]);
        mapAndSetItems(data);
      };
      reader.readAsBinaryString(file);
    }
  };

  const mapAndSetItems = (rawRows: any[]) => {
    const normalized = rawRows.map((r) => ({
      name: r.Modelo || r.modelo || r.Nome || r.nome || 'Roda Sem Nome',
      sku: r.SKU || r.sku || `ROD-${Math.floor(Math.random() * 100000)}`,
      brand: (r.Marca || r.marca || 'SCORRO').toUpperCase(),
      aro: parseInt(r.Aro || r.aro || '14'),
      tala: (r.Tala || r.tala || '5.5').toString(),
      furacao: (r.Furacao || r.furacao || r.PCD || r.pcd || '4x100').toString(),
      offset: (r.Offset || r.offset || 'ET25').toString(),
      stock: parseInt(r.Estoque || r.estoque || '0'),
      image_url: r.Imagem || r.imagem || r.imageUrl || 'https://images.unsplash.com/photo-1578844251758-2f71da64c96f?auto=format&fit=crop&w=600&q=80',
    }));
    setParsedItems(normalized);
  };

  const handleConfirmBatch = () => {
    if (!parsedItems.length) return;
    batchImport.mutate(parsedItems, {
      onSuccess: () => {
        alert(`${parsedItems.length} rodas importadas com sucesso no Turso!`);
        window.location.href = '/';
      },
    });
  };

  return (
    <div className="flex flex-col gap-6 max-w-4xl mx-auto w-full">
      <div 
        className="border-2 border-dashed border-slate-300 hover:border-blue-600 bg-white hover:bg-blue-50/50 rounded-2xl p-10 text-center cursor-pointer transition-all"
        onClick={() => document.getElementById('sheetFile')?.click()}
      >
        <input 
          type="file" 
          id="sheetFile" 
          accept=".csv, .xlsx, .xls" 
          className="hidden" 
          onChange={handleFileUpload} 
        />
        <UploadCloud className="w-12 h-12 text-blue-600 mx-auto mb-3" />
        <h3 className="font-extrabold text-slate-900 text-lg">
          Clique ou arraste sua planilha CSV ou Excel (.xlsx)
        </h3>
        <p className="text-xs text-slate-500 mt-1">
          Colunas recomendadas: Modelo, SKU, Marca, Aro, Tala, Furacao, Offset, Estoque
        </p>
      </div>

      {parsedItems.length > 0 && (
        <div className="bg-white border border-slate-200 rounded-[18px] p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              <span className="font-bold text-slate-900">{parsedItems.length} rodas prontas para importação</span>
            </div>
            <button
              onClick={handleConfirmBatch}
              disabled={batchImport.isPending}
              className="bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs py-2.5 px-6 rounded-full transition-colors"
            >
              {batchImport.isPending ? 'Gravando no Turso...' : 'Confirmar Importação'}
            </button>
          </div>

          <div className="max-h-[340px] overflow-y-auto border border-slate-200 rounded-xl">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 sticky top-0 border-b border-slate-200 text-slate-500 font-bold uppercase">
                <tr>
                  <th className="p-3">Modelo</th>
                  <th className="p-3">SKU</th>
                  <th className="p-3">Marca</th>
                  <th className="p-3">Aro</th>
                  <th className="p-3">Tala</th>
                  <th className="p-3">Furação</th>
                  <th className="p-3">Estoque</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {parsedItems.slice(0, 50).map((row, i) => (
                  <tr key={i} className="hover:bg-slate-50">
                    <td className="p-3 font-semibold text-slate-900">{row.name}</td>
                    <td className="p-3 font-mono text-slate-500">{row.sku}</td>
                    <td className="p-3">{row.brand}</td>
                    <td className="p-3">Aro {row.aro}"</td>
                    <td className="p-3">{row.tala}"</td>
                    <td className="p-3">{row.furacao}</td>
                    <td className="p-3 font-bold text-slate-900">{row.stock} un.</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
```

---

## 12. TELA DE EDIÇÃO COM AJUSTE DE ESTOQUE (`/rodas/[id]/editar`)

### 12.1. Página Astro (`src/pages/rodas/[id]/editar.astro`)
```astro
---
// src/pages/rodas/[id]/editar.astro
import BaseLayout from '../../../layouts/BaseLayout.astro';
import { QueryProvider } from '../../../components/providers/QueryProvider';
import { EditProductForm } from '../../../components/product-form/EditProductForm';

const { id } = Astro.params;
---
<BaseLayout title="Editar Roda | Wheel Catalog">
  <QueryProvider client:load>
    <EditProductForm id={id!} client:load />
  </QueryProvider>
</BaseLayout>
```

---

## 13. DIRETRIZES DE IMPLEMENTAÇÃO E QUALIDADE DE CÓDIGO

1. **Aspect Ratio Sagrado:** A regra `aspect-square` combinada com `object-contain` e `bg-slate-50` é mandatória para manter a consistência visual do catálogo.
2. **Debounce em Leitura:** A busca utiliza debounce de 150ms no cliente para consultas suaves ao Turso.
3. **Escrita em Lote:** A importação de planilhas usa `turso.batch` para garantir atomicidade e tempo de resposta veloz no banco.
