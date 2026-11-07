import { createClient } from '@libsql/client';

const url = process.env.TURSO_DATABASE_URL || 'file:local.db';
const authToken = process.env.TURSO_AUTH_TOKEN || undefined;

export const turso = createClient({
  url,
  authToken: authToken && authToken.trim().length > 0 ? authToken : undefined,
});

/**
 * Inicializa a tabela de produtos e garante que as colunas
 * acabamento, condicao, status, preco e estoque existam.
 */
export async function initDatabase() {
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
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // Migrações dinâmicas
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
  await turso.execute(`CREATE INDEX IF NOT EXISTS idx_produtos_furacao ON produtos(furacao);`);
  await turso.execute(`CREATE INDEX IF NOT EXISTS idx_produtos_status ON produtos(status);`);
  await turso.execute(`CREATE INDEX IF NOT EXISTS idx_produtos_condicao ON produtos(condicao);`);
}
