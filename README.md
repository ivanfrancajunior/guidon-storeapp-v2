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

## 📋 Schema do Produto (Zod e Turso)

| Campo | Tipo | Descrição |
| :--- | :--- | :--- |
| `id` | `TEXT` (UUID) | Chave primária única |
| `titulo` | `TEXT` | Título comercial completo do produto |
| `marca` | `TEXT` | Marca do fabricante (ex: `SCORRO`, `VOLCANO`, `TSW`, `BBS`) |
| `modelo` | `TEXT` | Nome do modelo (ex: `S-250`, `Santa Monica`, `RPF1`) |
| `aro` | `INTEGER` | Diâmetro nominal da roda (ex: `15`, `17`, `18`, `20`) |
| `tala` | `REAL` | Largura da roda em polegadas (ex: `6.0`, `7.5`, `8.0`) |
| `furacao` | `TEXT` | Padrão de furação / PCD (ex: `4x100`, `5x114.3`, `5x100`) |
| `sku` | `TEXT` | Código único de identificação e chave de conflito de importação |
| `cabeca_chave` | `TEXT` | Medida do parafuso/porca (ex: `17mm`, `19mm`, `21mm`, `Allen`) |
| `preco` | `REAL` | Preço de venda em Reais (R$) |
| `estoque` | `INTEGER` | Saldo físico de unidades em estoque |
| `disponivel` | `INTEGER` (0/1) | Status de disponibilidade comercial (ativo/pausado) |
| `imagens` | `TEXT` (JSON) | Array serializado com URLs públicas das fotos |
| `descricao` | `TEXT` | Detalhes adicionais, acabamento e compatibilidade veicular |
| `created_at` | `DATETIME` | Data e hora de inclusão |
| `updated_at` | `DATETIME` | Data e hora da última modificação |

---

## 🗺️ Rotas e Módulos da Aplicação

### Páginas do Frontend
- **`/`**: Catálogo visual principal com Sidebar de busca instantânea (debounce de 150ms), filtros combináveis (Marca, Aro, Tala, PCD, Chave, Estoque), alternador de visualização (Grade Visual vs. Tabela) e modal de consulta rápida (*Quick Preview*).
- **`/produto/[sku]`**: Ficha técnica completa de engenharia, galeria de imagens 1:1 com seletor de miniaturas, preço em destaque e ações de edição/exclusão.
- **`/novo`**: Cadastro de produtos com duas abas:
  - **Aba 1 (Manual):** Cadastro com espelho em tempo real (*Live Preview* 1:1) e upload de múltiplas URLs de imagens.
  - **Aba 2 (Importador de Planilha):** Drag-and-drop para arquivos `.xlsx`, `.xls` e `.csv`, validação prévia de linhas com Zod, tabela de conferência de erros e botão para baixar planilha modelo.
- **`/editar/[id]`**: Edição dos dados da roda, ajuste rápido de estoque com botões `+` e `-`, e atualização otimista via React Query.

### Endpoints de API REST
- `GET /api/produtos`: Listagem com filtros dinâmicos via query params (`q`, `marca`, `aro`, `tala`, `furacao`, `cabeca_chave`, `disponivel`, `apenasEstoque`, `ordenacao`).
- `POST /api/produtos`: Cadastro individual com validação via Zod.
- `GET /api/produtos/[id]`: Consulta individual por ID ou SKU.
- `PUT /api/produtos/[id]`: Atualização completa do produto.
- `DELETE /api/produtos/[id]`: Exclusão de produto.
- `POST /api/produtos/importar`: Inserção em lote atômica usando transação `turso.batch()` com resolução de conflito (`ON CONFLICT(sku) DO UPDATE`).

---

## 📊 Modelo para Importação de Planilha

Um arquivo modelo já está disponível na raiz do repositório: [`modelo_importacao_rodas.xlsx`](file:///c:/Users/Junior/Desktop/store-catalog/modelo_importacao_rodas.xlsx).

### Estrutura das Colunas:
```csv
titulo,marca,modelo,aro,tala,furacao,sku,cabeca_chave,preco,estoque,disponivel,imagens,descricao
Roda Scorro S-250 Aro 15,SCORRO,S-250,15,6.0,4x100,SCR-S250-15,17mm,2890.00,8,SIM,https://exemplo.com/foto1.jpg;https://exemplo.com/foto2.jpg,Roda diamantada esportiva
```

> **Dica para Imagens:** O campo `imagens` suporta múltiplas URLs separadas por ponto-e-vírgula (`;`) ou vírgula (`,`).

---

## 🛠️ Como Executar o Projeto Localmente

### 1. Pré-requisitos
- Node.js versão 18 ou superior
- Gerenciador de pacotes npm

### 2. Configuração de Variáveis de Ambiente
Crie ou edite o arquivo `.env` na raiz do projeto:
```env
TURSO_DATABASE_URL="file:local.db"
TURSO_AUTH_TOKEN=""
```
*(Para utilizar o banco Turso na nuvem, basta informar a URL `libsql://seu-banco.turso.io` e o respectivo token).*

### 3. Instalar Dependências
```bash
npm install
```

### 4. Executar em Modo de Desenvolvimento
```bash
npm run dev
```
Acesse em seu navegador: [http://localhost:4321](http://localhost:4321)

### 5. Build e Preview de Produção
```bash
npm run build
npm run preview
```
