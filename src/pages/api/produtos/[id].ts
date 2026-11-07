import type { APIRoute } from 'astro';
import { turso, initDatabase } from '@/lib/turso';
import { ProdutoSchema } from '@/lib/schemas/produto';

export const GET: APIRoute = async ({ params }) => {
  await initDatabase();
  const { id } = params;

  if (!id) {
    return new Response(JSON.stringify({ error: 'ID ou SKU não informado' }), { status: 400 });
  }

  try {
    const result = await turso.execute({
      sql: 'SELECT * FROM produtos WHERE id = ? OR sku = ? LIMIT 1',
      args: [id, id],
    });

    if (result.rows.length === 0) {
      return new Response(JSON.stringify({ error: 'Produto não encontrado' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const row = result.rows[0];
    let imagensArr: string[] = [];
    try {
      imagensArr = JSON.parse(row.imagens as string);
    } catch {
      imagensArr = [row.imagens as string];
    }

    const produto = {
      ...row,
      aro: Number(row.aro),
      tala: Number(row.tala),
      preco: Number(row.preco ?? 0),
      estoque: Number(row.estoque ?? 0),
      status: (row.status as string) || 'Ativo',
      condicao: (row.condicao as string) || 'Nova',
      acabamento: (row.acabamento as string) || 'Padrão',
      imagens: imagensArr,
    };

    return new Response(JSON.stringify(produto), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
};

export const PUT: APIRoute = async ({ params, request }) => {
  await initDatabase();
  const { id } = params;

  if (!id) {
    return new Response(JSON.stringify({ error: 'ID não informado' }), { status: 400 });
  }

  try {
    const rawBody = await request.json();
    const validated = ProdutoSchema.parse(rawBody);
    const imagensJson = JSON.stringify(validated.imagens);

    const result = await turso.execute({
      sql: `UPDATE produtos SET
              sku = ?,
              marca = ?,
              modelo = ?,
              aro = ?,
              tala = ?,
              furacao = ?,
              cabeca_chave = ?,
              titulo = ?,
              acabamento = ?,
              estoque = ?,
              preco = ?,
              condicao = ?,
              descricao = ?,
              status = ?,
              imagens = ?,
              updated_at = CURRENT_TIMESTAMP
            WHERE id = ? OR sku = ?`,
      args: [
        validated.sku,
        validated.marca,
        validated.modelo,
        validated.aro,
        validated.tala,
        validated.furacao,
        validated.cabeca_chave,
        validated.titulo,
        validated.acabamento ?? 'Padrão',
        validated.estoque ?? 0,
        validated.preco ?? 0,
        validated.condicao ?? 'Nova',
        validated.descricao ?? '',
        validated.status ?? 'Ativo',
        imagensJson,
        id,
        id,
      ],
    });

    if (result.rowsAffected === 0) {
      return new Response(JSON.stringify({ error: 'Produto não encontrado para atualização' }), {
        status: 404,
      });
    }

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error: any) {
    return new Response(
      JSON.stringify({ error: error.message || 'Erro ao atualizar produto' }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    );
  }
};

export const DELETE: APIRoute = async ({ params }) => {
  await initDatabase();
  const { id } = params;

  if (!id) {
    return new Response(JSON.stringify({ error: 'ID não fornecido' }), { status: 400 });
  }

  try {
    const result = await turso.execute({
      sql: 'DELETE FROM produtos WHERE id = ? OR sku = ?',
      args: [id, id],
    });

    return new Response(
      JSON.stringify({ success: true, rowsAffected: result.rowsAffected }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
};
