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

---

## 🔐 Variaveis de Ambiente

Copie `.env.example` para `.env` e configure:

```env
TURSO_DATABASE_URL="libsql://seu-banco.turso.io"
TURSO_AUTH_TOKEN="seu-token-turso"
CLOUDINARY_CLOUD_NAME="seu-cloud-name"
CLOUDINARY_API_KEY="sua-api-key"
CLOUDINARY_API_SECRET="seu-api-secret"
```

- `TURSO_DATABASE_URL` e `TURSO_AUTH_TOKEN`: acesso ao banco Turso.
- As credenciais Cloudinary sao usadas pelo servidor para uploads seguros; nunca exponha o segredo em codigo ou variaveis `PUBLIC_*`.
- Para desenvolvimento local, `TURSO_DATABASE_URL="file:local.db"` permite usar SQLite local.

## 🖼️ Upload de Imagens

Os formularios de cadastro e edicao permitem selecionar varias imagens JPG, PNG ou WEBP por vez.

O upload ocorre pelo endpoint interno `/api/imagens/cloudinary`, que:

- valida tipo e tamanho dos arquivos;
- limita cada arquivo a 8 MB;
- envia a imagem ao Cloudinary;
- redimensiona para ate 1600 x 1600 px;
- retorna URLs otimizadas para serem gravadas no produto.

## ☁️ Deploy na Netlify

O projeto usa SSR com o adaptador oficial da Netlify para Astro.

1. Importar o repositorio na Netlify.
2. Usar o comando de build `npm run build`.
3. Publicar o diretorio `dist` (configurado em `netlify.toml`).
4. Cadastrar as variaveis de ambiente da Turso e Cloudinary no painel da Netlify:
   - `TURSO_DATABASE_URL`
   - `TURSO_AUTH_TOKEN`
   - `CLOUDINARY_CLOUD_NAME`
   - `CLOUDINARY_API_KEY`
   - `CLOUDINARY_API_SECRET`
5. Fazer o deploy.

Nunca faca commit do arquivo `.env`, dos arquivos `base_final*.xlsx` ou de credenciais reais.
