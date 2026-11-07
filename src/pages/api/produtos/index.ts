import type { APIRoute } from 'astro';
import { turso, initDatabase } from '@/lib/turso';
import { seedDatabase } from '@/lib/seed';
import { ProdutoSchema } from '@/lib/schemas/produto';

export const GET: APIRoute = async ({ request }) => {
  await seedDatabase();

  const url = new URL(request.url);
  const q = url.searchParams.get('q') || '';
  const marca = url.searchParams.get('marca');
  const aro = url.searchParams.get('aro');
  const tala = url.searchParams.get('tala');
  const furacao = url.searchParams.get('furacao');
  const cabeca_chave = url.searchParams.get('cabeca_chave');
  const ordenacao = url.searchParams.get('ordenacao') || 'recentes';

  let sql = 'SELECT * FROM produtos WHERE 1=1';
  const args: (string | number)[] = [];

  // Busca multi-termo instantânea
  if (q.trim()) {
    const terms = q.trim().split(/\s+/);
    terms.forEach((term) => {
      sql += ` AND (
        LOWER(titulo) LIKE ? OR
        LOWER(marca) LIKE ? OR
        LOWER(modelo) LIKE ? OR
        LOWER(sku) LIKE ? OR
        LOWER(furacao) LIKE ? OR
        CAST(aro AS TEXT) LIKE ? OR
        CAST(tala AS TEXT) LIKE ? OR
        LOWER(cabeca_chave) LIKE ?
      )`;
      const wild = `%${term.toLowerCase()}%`;
      args.push(wild, wild, wild, wild, wild, wild, wild, wild);
    });
  }

  if (marca) {
    sql += ' AND LOWER(marca) = LOWER(?)';
    args.push(marca);
  }

  if (aro) {
    sql += ' AND aro = ?';
    args.push(Number(aro));
  }

  if (tala) {
    sql += ' AND tala = ?';
    args.push(Number(tala));
  }

  if (furacao) {
    sql += ' AND LOWER(furacao) = LOWER(?)';
    args.push(furacao);
  }

  if (cabeca_chave) {
    sql += ' AND LOWER(cabeca_chave) = LOWER(?)';
    args.push(cabeca_chave);
  }

  // Ordenação
  if (ordenacao === 'aro-asc') {
    sql += ' ORDER BY aro ASC, titulo ASC';
  } else if (ordenacao === 'aro-desc') {
    sql += ' ORDER BY aro DESC, titulo ASC';
  } else if (ordenacao === 'titulo-asc') {
    sql += ' ORDER BY titulo ASC';
  } else if (ordenacao === 'titulo-desc') {
    sql += ' ORDER BY titulo DESC';
  } else {
    sql += ' ORDER BY created_at DESC';
  }

  try {
    const result = await turso.execute({ sql, args });
    const produtos = result.rows.map((row) => {
      let imagensArr: string[] = [];
      try {
        imagensArr = JSON.parse(row.imagens as string);
      } catch {
        imagensArr = [row.imagens as string];
      }
      return {
        ...row,
        aro: Number(row.aro),
        tala: Number(row.tala),
        imagens: imagensArr,
      };
    });

    return new Response(JSON.stringify(produtos), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};

export const POST: APIRoute = async ({ request }) => {
  await initDatabase();

  try {
    const rawBody = await request.json();
    const validated = ProdutoSchema.parse(rawBody);

    const id = validated.id || crypto.randomUUID();
    const imagensJson = JSON.stringify(validated.imagens);

    await turso.execute({
      sql: `INSERT INTO produtos (id, titulo, marca, modelo, aro, tala, furacao, sku, cabeca_chave, imagens, descricao)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [
        id,
        validated.titulo,
        validated.marca,
        validated.modelo,
        validated.aro,
        validated.tala,
        validated.furacao,
        validated.sku,
        validated.cabeca_chave,
        imagensJson,
        validated.descricao ?? '',
      ],
    });

    return new Response(JSON.stringify({ id, success: true }), {
      status: 201,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error: any) {
    return new Response(
      JSON.stringify({ error: error.message || 'Erro de validação ou inserção' }),
      {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
};
