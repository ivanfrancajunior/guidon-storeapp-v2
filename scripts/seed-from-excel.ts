import { createClient } from '@libsql/client';
import xlsx from 'xlsx';
import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';
import { ProdutoSchema } from '../src/lib/schemas/produto.js';

const XLSX = (xlsx as any).default || xlsx;

// Carrega variáveis do arquivo .env
dotenv.config();

const url = process.env.TURSO_DATABASE_URL || 'file:local.db';
const authToken = process.env.TURSO_AUTH_TOKEN || undefined;

console.log(`🔌 Conectando ao Turso em: ${url}`);
const turso = createClient({
  url,
  authToken: authToken && authToken.trim().length > 0 ? authToken : undefined,
});

async function main() {
  const filePath = process.argv[2] || 'modelo_importacao_rodas.xlsx';
  const resolvedPath = path.resolve(process.cwd(), filePath);

  if (!fs.existsSync(resolvedPath)) {
    console.error(`❌ Arquivo não encontrado: ${resolvedPath}`);
    console.log(`ℹ️ Uso: npm run seed:excel <caminho-do-arquivo.xlsx>`);
    process.exit(1);
  }

  console.log(`📖 Lendo planilha: ${resolvedPath}`);
  const workbook = XLSX.readFile(resolvedPath);
  const firstSheet = workbook.SheetNames[0];
  const rows: any[] = XLSX.utils.sheet_to_json(workbook.Sheets[firstSheet]);

  console.log(`📊 Total de linhas encontradas na planilha: ${rows.length}`);

  if (rows.length === 0) {
    console.log('⚠️ Planilha vazia. Nada a importar.');
    return;
  }

  // 1. Garante que a tabela existe com o schema oficial
  console.log('🛠️ Verificando e criando tabela "produtos" no Turso se necessário...');
  await turso.execute(`
    CREATE TABLE IF NOT EXISTS produtos (
      id TEXT PRIMARY KEY,
      sku TEXT NOT NULL UNIQUE,
      marca TEXT NOT NULL,
      modelo TEXT NOT NULL,
      aro INTEGER NOT NULL,
      tala REAL NOT NULL,
      furacao TEXT NOT NULL,
      cabeca_chave TEXT NOT NULL,
      titulo TEXT NOT NULL,
      acabamento TEXT DEFAULT 'Padrão',
      estoque INTEGER DEFAULT 0,
      preco REAL DEFAULT 0,
      condicao TEXT DEFAULT 'Nova',
      descricao TEXT DEFAULT '',
      status TEXT DEFAULT 'Ativo',
      imagens TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // Migrações dinâmicas caso o banco já existisse
  const colunasExtras = [
    `ALTER TABLE produtos ADD COLUMN acabamento TEXT DEFAULT 'Padrão';`,
    `ALTER TABLE produtos ADD COLUMN condicao TEXT DEFAULT 'Nova';`,
    `ALTER TABLE produtos ADD COLUMN status TEXT DEFAULT 'Ativo';`,
    `ALTER TABLE produtos ADD COLUMN preco REAL DEFAULT 0;`,
    `ALTER TABLE produtos ADD COLUMN estoque INTEGER DEFAULT 0;`,
  ];
  for (const alterSql of colunasExtras) {
    try {
      await turso.execute(alterSql);
    } catch {}
  }

  await turso.execute(`CREATE INDEX IF NOT EXISTS idx_produtos_sku ON produtos(sku);`);
  await turso.execute(`CREATE INDEX IF NOT EXISTS idx_produtos_marca ON produtos(marca);`);
  await turso.execute(`CREATE INDEX IF NOT EXISTS idx_produtos_aro ON produtos(aro);`);
  await turso.execute(`CREATE INDEX IF NOT EXISTS idx_produtos_status ON produtos(status);`);

  // 2. Normaliza e valida com Zod
  const statements: any[] = [];
  const erros: { linha: number; sku?: string; erros: string[] }[] = [];

  for (let i = 0; i < rows.length; i++) {
    const r = rows[i];
    const linhaNum = i + 2; // Linha 1 no excel é o header

    const getVal = (...keys: string[]) => {
      for (const k of keys) {
        if (r[k] !== undefined && r[k] !== null && String(r[k]).trim() !== '') {
          return r[k];
        }
      }
      return undefined;
    };

    const rawImagens = getVal('Imagens', 'imagens', 'imagem', 'Imagem', 'fotos') || '';
    let imagensArr: string[] = [];

    if (typeof rawImagens === 'string') {
      imagensArr = rawImagens
        .split(/[;,]/)
        .map((s: string) => s.trim())
        .filter((s: string) => s.length > 0);
    } else if (Array.isArray(rawImagens)) {
      imagensArr = rawImagens;
    }

    if (imagensArr.length === 0) {
      imagensArr = ['https://images.unsplash.com/photo-1578844251758-2f71da64c96f?auto=format&fit=crop&w=800&q=80'];
    }

    const rawStatus = getVal('Status', 'status', 'situacao');
    let statusFormatado = 'Ativo';
    if (rawStatus !== undefined) {
      const s = String(rawStatus).trim().toLowerCase();
      if (s === 'inativo' || s === 'inactive' || s === 'nao' || s === 'não' || s === '0' || s === 'false') {
        statusFormatado = 'Inativo';
      }
    }

    const rawPreco = getVal('Preço', 'Preco', 'preco', 'valor', 'Valor') || 0;
    const precoNum = typeof rawPreco === 'string' 
      ? Number(rawPreco.replace('R$', '').replace(/\./g, '').replace(',', '.').trim())
      : Number(rawPreco);

    const itemCandidate = {
      sku: String(getVal('SKU', 'sku', 'Codigo') || `ROD-${Math.floor(10000 + Math.random() * 90000)}`).trim().toUpperCase(),
      marca: String(getVal('Marca', 'marca') || 'SCORRO').trim().toUpperCase(),
      modelo: String(getVal('Modelo', 'modelo', 'linha') || 'Padrão').trim(),
      aro: Number(getVal('Aro', 'aro') || 15),
      tala: Number(getVal('Tala', 'tala') || 6.0),
      furacao: String(getVal('Furação', 'Furacao', 'furacao', 'pcd', 'PCD') || '4x100').trim(),
      cabeca_chave: String(getVal('Cabeça de Chave', 'Cabeca de Chave', 'cabeca_chave', 'chave') || '17mm').trim(),
      titulo: String(getVal('Título', 'Titulo', 'titulo', 'nome', 'Nome') || '').trim(),
      acabamento: String(getVal('Acabamento', 'acabamento') || 'Padrão').trim(),
      estoque: Number(getVal('Estoque no depósito', 'Estoque no deposito', 'estoque', 'Estoque') || 0),
      preco: isNaN(precoNum) ? 0 : precoNum,
      condicao: String(getVal('Condição', 'Condicao', 'condicao') || 'Nova').trim(),
      descricao: String(getVal('Descrição', 'Descricao', 'descricao') || '').trim(),
      status: statusFormatado,
      imagens: imagensArr,
    };

    const res = ProdutoSchema.safeParse(itemCandidate);
    if (res.success) {
      const valid = res.data;
      const id = crypto.randomUUID();
      const imagensJson = JSON.stringify(valid.imagens);

      statements.push({
        sql: `INSERT INTO produtos (id, sku, marca, modelo, aro, tala, furacao, cabeca_chave, titulo, acabamento, estoque, preco, condicao, descricao, status, imagens)
              VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
              ON CONFLICT(sku) DO UPDATE SET
                marca = excluded.marca,
                modelo = excluded.modelo,
                aro = excluded.aro,
                tala = excluded.tala,
                furacao = excluded.furacao,
                cabeca_chave = excluded.cabeca_chave,
                titulo = excluded.titulo,
                acabamento = excluded.acabamento,
                estoque = excluded.estoque,
                preco = excluded.preco,
                condicao = excluded.condicao,
                descricao = excluded.descricao,
                status = excluded.status,
                imagens = excluded.imagens,
                updated_at = CURRENT_TIMESTAMP`,
        args: [
          id,
          valid.sku,
          valid.marca,
          valid.modelo,
          valid.aro,
          valid.tala,
          valid.furacao,
          valid.cabeca_chave,
          valid.titulo,
          valid.acabamento ?? 'Padrão',
          valid.estoque ?? 0,
          valid.preco ?? 0,
          valid.condicao ?? 'Nova',
          valid.descricao ?? '',
          valid.status ?? 'Ativo',
          imagensJson,
        ],
      });
    } else {
      erros.push({
        linha: linhaNum,
        sku: itemCandidate.sku,
        erros: res.error.errors.map((e) => `${e.path.join('.')}: ${e.message}`),
      });
    }
  }

  if (erros.length > 0) {
    console.warn(`⚠️ Foram encontrados erros de validação em ${erros.length} linha(s):`);
    erros.slice(0, 10).forEach((err) => {
      console.warn(`  - Linha ${err.linha} (SKU: ${err.sku || 'N/D'}): ${err.erros.join(' | ')}`);
    });
    if (erros.length > 10) console.warn(`  ... e mais ${erros.length - 10} linha(s) com erro.`);
  }

  if (statements.length === 0) {
    console.error('❌ Nenhuma linha válida para importar no Turso.');
    process.exit(1);
  }

  // 3. Executa em lote atômico no Turso
  console.log(`🚀 Gravando ${statements.length} rodas no Turso via transação atômica (batch)...`);
  
  // Divide em lotes de 100 para garantir estabilidade se a planilha tiver milhares de linhas
  const BATCH_SIZE = 100;
  for (let i = 0; i < statements.length; i += BATCH_SIZE) {
    const chunk = statements.slice(i, i + BATCH_SIZE);
    await turso.batch(chunk, 'write');
    console.log(`  ✓ Lote gravado: ${Math.min(i + BATCH_SIZE, statements.length)}/${statements.length}`);
  }

  console.log(`\n🎉 Seed concluído com sucesso no Turso!`);
  console.log(`📦 Total importado/atualizado: ${statements.length} produtos.`);
  if (erros.length > 0) {
    console.log(`⚠️ Total ignorado com erro: ${erros.length}`);
  }
}

main().catch((err) => {
  console.error('❌ Erro durante o seed do Turso:', err);
  process.exit(1);
});
