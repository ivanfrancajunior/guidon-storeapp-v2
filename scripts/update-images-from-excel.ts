import { createClient } from '@libsql/client';
import xlsx from 'xlsx';
import * as dotenv from 'dotenv';

const XLSX = (xlsx as any).default || xlsx;

dotenv.config();

const workbookPath = process.argv[2] || 'base_final_produtos_com_imagens.xlsx';
const workbook = XLSX.readFile(workbookPath);
const sheetName = workbook.SheetNames[0];
const rows: Record<string, unknown>[] = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);

const turso = createClient({
  url: process.env.TURSO_DATABASE_URL!,
  authToken: process.env.TURSO_AUTH_TOKEN || undefined,
});

function getValue(row: Record<string, unknown>, names: string[]) {
  for (const name of names) {
    const value = row[name];
    if (value !== undefined && value !== null && String(value).trim()) {
      return String(value).trim();
    }
  }
  return '';
}

const imagesBySku = new Map<string, string[]>();
const conflictingSkus = new Set<string>();

for (const row of rows) {
  const sku = getValue(row, ['SKU', 'sku', 'Codigo', 'Codigo do anuncio']).toUpperCase();
  const rawImages = getValue(row, ['Imagens', 'imagens', 'imagem', 'Imagem', 'fotos']);
  if (!sku || !rawImages) continue;

  const images = rawImages
    .split(/[;,]/)
    .map((image: string) => image.trim())
    .filter((image: string) => /^https?:\/\/.+/i.test(image));
  if (images.length === 0) continue;

  const previous = imagesBySku.get(sku);
  if (previous && previous.join('|') !== images.join('|')) {
    conflictingSkus.add(sku);
  } else {
    imagesBySku.set(sku, images);
  }
}

const statements = [];
for (const [sku, images] of imagesBySku) {
  if (conflictingSkus.has(sku)) continue;
  statements.push({
    sql: 'UPDATE produtos SET imagens = ?, updated_at = CURRENT_TIMESTAMP WHERE sku = ?',
    args: [JSON.stringify(images), sku],
  });
}

let updated = 0;
for (let index = 0; index < statements.length; index += 100) {
  const chunk = statements.slice(index, index + 100);
  const result = await turso.batch(chunk, 'write');
  updated += result.filter((operation) => operation.rowsAffected > 0).length;
}

console.log(JSON.stringify({
  workbook: workbookPath,
  urlsFound: imagesBySku.size,
  conflictingSkusSkipped: conflictingSkus.size,
  productsUpdated: updated,
  productsNotFound: statements.length - updated,
}, null, 2));
