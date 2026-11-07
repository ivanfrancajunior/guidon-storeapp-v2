# 🛞 Catálogo Visual e Gestão de Rodas Automotivas

Sistema de catálogo visual e gestão de rodas automotivas de alta performance desenvolvido com foco na **identificação imediata do produto pela imagem** através de proporção estrita 1:1 sem distorções, busca multi-termo instantânea, filtros facetados, ficha técnica completa e importador em massa via planilhas Excel/CSV.

---

## 🚀 Stack Tecnológica

- **Framework:** [Astro 5](https://astro.build/) com Server Side Rendering (SSR) e ilhas interativas em [React 18](https://react.dev/).
- **Estilização e Componentes:** [Tailwind CSS v3](https://tailwindcss.com/) com design tokens shadcn/ui e ícones [Lucide React](https://lucide.dev/).
- **Estado e Requisições:** [TanStack React Query v5](https://tanstack.com/query/latest) com debounce de 150ms na busca e invalidação inteligente de cache.
- **Banco de Dados:** [Turso / LibSQL](https://turso.tech/) (`@libsql/client`) com suporte nativo a banco de dados em nuvem ou arquivo local (`file:local.db`).
- **Validação de Dados:** [Zod](https://zod.dev/) para validação estrita em runtime tanto nos endpoints de API quanto na importação de planilhas.
- **Processamento de Planilhas:** [PapaParse](https://www.papaparse.com/) (CSV) e [SheetJS (xlsx)](https://sheetjs.com/) (Excel).

---

## 🎨 Diretrizes de Design e UX

- **Regra da Imagem 1:1:** O card do produto utiliza proporção estrita quadrada (`aspect-square`), `object-fit: contain` e fundo neutro (`#F8FAFC` / `bg-slate-50`), garantindo que nenhuma roda seja cortada, achatada ou distorcida.
- **Ocupação Visual:** A fotografia da roda ocupa entre 65% a 70% da área útil do card com transições suaves e sombras automotivas.
- **Grade Responsiva Calibrada:**
  - **Mobile (< 640px):** 1 coluna (`grid-cols-1`) com cards amplos para visualização e toque confortáveis.
  - **Tablet Pequeno (>= 640px):** 2 colunas (`sm:grid-cols-2`).
  - **Tablet (>= 768px):** 3 colunas (`md:grid-cols-3`).
  - **Desktop Normal (>= 1024px):** 4 colunas (`lg:grid-cols-4`).
  - **Monitores Amplos (>= 1536px):** 5 colunas (`2xl:grid-cols-5`).

---

## 📋 Schema Oficial do Produto (15 Colunas na Planilha e Turso)

| # | Coluna da Planilha | Campo no Banco | Tipo | Obrigatório? | Descrição / Exemplo |
| :-: | :--- | :--- | :--- | :-: | :--- |
| 1 | **SKU** | `sku` | `TEXT` | **Sim** | Código único de identificação (ex: `SCR-S250-15`) |
| 2 | **Marca** | `marca` | `TEXT` | **Sim** | Fabricante da roda (ex: `SCORRO`, `VOLCANO`, `TSW`) |
| 3 | **Modelo** | `modelo` | `TEXT` | **Sim** | Linha / Modelo (ex: `S-250`, `Santa Monica`, `RPF1`) |
| 4 | **Aro** | `aro` | `INTEGER` | **Sim** | Diâmetro em polegadas (ex: `15`, `17`, `18`, `20`) |
| 5 | **Tala** | `tala` | `REAL` | **Sim** | Largura da roda em polegadas (ex: `6.0`, `7.5`, `8.0`) |
| 6 | **Furação** | `furacao` | `TEXT` | **Sim** | Padrão PCD (ex: `4x100`, `5x114.3`, `5x100`) |
| 7 | **Cabeça de Chave** | `cabeca_chave` | `TEXT` | **Sim** | Medida do parafuso (ex: `17mm`, `19mm`, `21mm`) |
| 8 | **Título** | `titulo` | `TEXT` | **Sim** | Nome de apresentação do produto |
| 9 | **Acabamento** | `acabamento` | `TEXT` | Não | Acabamento estético (ex: `Diamantada Prata`, `Grafite Fosco`) |
| 10 | **Estoque no depósito** | `estoque` | `INTEGER` | **Sim** | Quantidade física disponível em depósito |
| 11 | **Preço** | `preco` | `REAL` | **Sim** | Preço de venda (R$) |
| 12 | **Condição** | `condicao` | `TEXT` | Não | `Nova`, `Seminova`, `Usada` ou `Restaurada` |
| 13 | **Descrição** | `descricao` | `TEXT` | Não | Detalhes adicionais e notas de aplicação |
| 14 | **Status** | `status` | `TEXT` | **Sim** | `Ativo` ou `Inativo` |
| 15 | **Imagens** | `imagens` | `TEXT` (JSON) | **Sim** | URLs das fotos separadas por `;` ou `,` |

---

## 📊 Arquivo Modelo para Importação

Um arquivo Excel pronto com exatamente esses 15 cabeçalhos está disponível na raiz:
- [`modelo_importacao_rodas.xlsx`](file:///c:/Users/Junior/Desktop/store-catalog/modelo_importacao_rodas.xlsx)

Você pode baixá-lo também diretamente pela tela **`/novo` -> Aba "Importar da Planilha"**.

---

## 🛠️ Como Executar o Projeto Localmente

```bash
# Instalar dependências
npm install

# Modo desenvolvimento
npm run dev

# Build de produção
npm run build

# Preview da produção
npm run preview
```
