import { createClient } from '@libsql/client';

const url = process.env.TURSO_DATABASE_URL || 'file:local.db';
const authToken = process.env.TURSO_AUTH_TOKEN || undefined;

export const turso = createClient({
  url,
  authToken: authToken && authToken.trim().length > 0 ? authToken : undefined,
});

/**
 * Inicializa a tabela de produtos e garante que as colunas preco, estoque e disponivel existam.
 */
export async function initDatabase() {
  await turso.execute(`
    CREATE TABLE IF NOT EXISTS produtos (
      id TEXT PRIMARY KEY,
      titulo TEXT NOT NULL,
      marca TEXT NOT NULL,
      modelo TEXT NOT NULL,
      aro INTEGER NOT NULL,
      tala REAL NOT NULL,
      furacao TEXT NOT NULL,
      sku TEXT NOT NULL UNIQUE,
      cabeca_chave TEXT NOT NULL,
      preco REAL DEFAULT 0,
      estoque INTEGER DEFAULT 0,
      disponivel INTEGER DEFAULT 1,
      imagens TEXT NOT NULL,
      descricao TEXT DEFAULT '',
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // Migrações dinâmicas para caso a tabela já tenha sido criada previamente
  try {
    await turso.execute(`ALTER TABLE produtos ADD COLUMN preco REAL DEFAULT 0;`);
  } catch {}

  try {
    await turso.execute(`ALTER TABLE produtos ADD COLUMN estoque INTEGER DEFAULT 0;`);
  } catch {}

  try {
    await turso.execute(`ALTER TABLE produtos ADD COLUMN disponivel INTEGER DEFAULT 1;`);
  } catch {}

  await turso.execute(`CREATE INDEX IF NOT EXISTS idx_produtos_sku ON produtos(sku);`);
  await turso.execute(`CREATE INDEX IF NOT EXISTS idx_produtos_marca ON produtos(marca);`);
  await turso.execute(`CREATE INDEX IF NOT EXISTS idx_produtos_aro ON produtos(aro);`);
  await turso.execute(`CREATE INDEX IF NOT EXISTS idx_produtos_furacao ON produtos(furacao);`);
  await turso.execute(`CREATE INDEX IF NOT EXISTS idx_produtos_disponivel ON produtos(disponivel);`);
}
