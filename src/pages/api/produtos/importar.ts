import type { APIRoute } from 'astro';
import { turso, initDatabase } from '@/lib/turso';
import { ProdutoSchema } from '@/lib/schemas/produto';

export const POST: APIRoute = async ({ request }) => {
  await initDatabase();

  try {
    const { items } = await request.json();

    if (!Array.isArray(items) || items.length === 0) {
      return new Response(JSON.stringify({ error: 'Nenhum item fornecido para importação' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const statements = [];
    const errors: { index: number; sku?: string; error: string }[] = [];

    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      try {
        if (typeof item.imagens === 'string') {
          item.imagens = item.imagens
            .split(/[;,]/)
            .map((url: string) => url.trim())
            .filter((url: string) => url.length > 0);
        }

        const validItem = ProdutoSchema.parse(item);
        const id = validItem.id || crypto.randomUUID();
        const imagensJson = JSON.stringify(validItem.imagens);

        statements.push({
          sql: `INSERT INTO produtos (id, titulo, marca, modelo, aro, tala, furacao, sku, cabeca_chave, preco, estoque, disponivel, imagens, descricao)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                ON CONFLICT(sku) DO UPDATE SET
                  titulo = excluded.titulo,
                  marca = excluded.marca,
                  modelo = excluded.modelo,
                  aro = excluded.aro,
                  tala = excluded.tala,
                  furacao = excluded.furacao,
                  cabeca_chave = excluded.cabeca_chave,
                  preco = excluded.preco,
                  estoque = excluded.estoque,
                  disponivel = excluded.disponivel,
                  imagens = excluded.imagens,
                  descricao = excluded.descricao,
                  updated_at = CURRENT_TIMESTAMP`,
          args: [
            id,
            validItem.titulo,
            validItem.marca,
            validItem.modelo,
            validItem.aro,
            validItem.tala,
            validItem.furacao,
            validItem.sku,
            validItem.cabeca_chave,
            validItem.preco,
            validItem.estoque,
            validItem.disponivel ? 1 : 0,
            imagensJson,
            validItem.descricao ?? '',
          ],
        });
      } catch (err: any) {
        errors.push({
          index: i + 1,
          sku: item.sku,
          error: err.errors ? err.errors.map((e: any) => `${e.path.join('.')}: ${e.message}`).join(', ') : err.message,
        });
      }
    }

    if (errors.length > 0 && statements.length === 0) {
      return new Response(
        JSON.stringify({
          error: 'Falha na validação de todos os itens da planilha',
          detalhes: errors,
        }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    if (statements.length > 0) {
      await turso.batch(statements, 'write');
    }

    return new Response(
      JSON.stringify({
        success: true,
        importados: statements.length,
        erros: errors,
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error: any) {
    return new Response(
      JSON.stringify({ error: error.message || 'Erro durante a importação em lote' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
