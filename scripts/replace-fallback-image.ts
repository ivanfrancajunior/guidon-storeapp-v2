import { turso } from '../src/lib/turso';

const oldFallback = 'https://images.unsplash.com/photo-1578844251758-2f71da64c96f?auto=format&fit=crop&w=800&q=80';
const newFallback = '/fallback-roda.jpg';

const result = await turso.execute({
  sql: `UPDATE produtos SET imagens = REPLACE(imagens, ?, ?) WHERE imagens LIKE ?`,
  args: [oldFallback, newFallback, `%${oldFallback}%`],
});

console.log(`Imagem fallback atualizada em ${result.rowsAffected} produto(s).`);
