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
  const acabamento = url.searchParams.get('acabamento');
  const condicao = url.searchParams.get('condicao');
  const status = url.searchParams.get('status');
  const apenasEstoque = url.searchParams.get('apenasEstoque') === 'true';
  const ordenacao = url.searchParams.get('ordenacao') || 'recentes';
  const page = Math.max(1, Number.parseInt(url.searchParams.get('page') || '1', 10) || 1);
  const limit = Math.min(100, Math.max(1, Number.parseInt(url.searchParams.get('limit') || '100', 10) || 100));

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
        LOWER(cabeca_chave) LIKE ? OR
        LOWER(acabamento) LIKE ? OR
        LOWER(condicao) LIKE ?
      )`;
      const wild = `%${term.toLowerCase()}%`;
      args.push(wild, wild, wild, wild, wild, wild, wild, wild, wild, wild);
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

  if (acabamento) {
    sql += ' AND LOWER(acabamento) = LOWER(?)';
    args.push(acabamento);
  }

  if (condicao) {
    sql += ' AND LOWER(condicao) = LOWER(?)';
    args.push(condicao);
  }

  if (status) {
    sql += ' AND LOWER(status) = LOWER(?)';
    args.push(status);
  }

  if (apenasEstoque) {
    sql += " AND estoque > 0 AND status = 'Ativo'";
  }

  // Ordenação
  if (ordenacao === 'preco-asc') {
    sql += ' ORDER BY preco ASC';
  } else if (ordenacao === 'preco-desc') {
    sql += ' ORDER BY preco DESC';
  } else if (ordenacao === 'aro-asc') {
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
    const countResult = await turso.execute({
      sql: sql.replace('SELECT *', 'SELECT COUNT(*) AS total'),
      args,
    });
    const total = Number(countResult.rows[0]?.total ?? 0);

    const distinctQueries = await Promise.all([
      turso.execute("SELECT marca AS valor, COUNT(*) AS total FROM produtos WHERE marca IS NOT NULL AND TRIM(marca) <> '' GROUP BY marca ORDER BY marca"),
      turso.execute("SELECT aro AS valor, COUNT(*) AS total FROM produtos WHERE aro IS NOT NULL GROUP BY aro ORDER BY aro"),
      turso.execute("SELECT tala AS valor, COUNT(*) AS total FROM produtos WHERE tala IS NOT NULL GROUP BY tala ORDER BY tala"),
      turso.execute("SELECT furacao AS valor, COUNT(*) AS total FROM produtos WHERE furacao IS NOT NULL AND TRIM(furacao) <> '' GROUP BY furacao ORDER BY furacao"),
      turso.execute("SELECT cabeca_chave AS valor, COUNT(*) AS total FROM produtos WHERE cabeca_chave IS NOT NULL AND TRIM(cabeca_chave) <> '' GROUP BY cabeca_chave ORDER BY cabeca_chave"),
    ]);
    const facetas = distinctQueries.map((result) =>
      result.rows.map((row) => ({
        valor: row.valor,
        total: Number(row.total),
      }))
    );

    sql += ` LIMIT ${limit} OFFSET ${(page - 1) * limit}`;
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
        preco: Number(row.preco ?? 0),
        estoque: Number(row.estoque ?? 0),
        status: (row.status as string) || 'Ativo',
        condicao: (row.condicao as string) || 'Nova',
        acabamento: (row.acabamento as string) || 'Padrão',
        imagens: imagensArr,
      };
    });

    const totalPages = Math.max(1, Math.ceil(total / limit));
    return new Response(JSON.stringify({
      produtos,
      total,
      page,
      limit,
      totalPages,
      facetas: {
        marcas: facetas[0],
        aros: facetas[1],
        talas: facetas[2],
        furacoes: facetas[3],
        cabecasChave: facetas[4],
      },
    }), {
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
      sql: `INSERT INTO produtos (id, sku, marca, modelo, aro, tala, furacao, cabeca_chave, titulo, acabamento, estoque, preco, condicao, descricao, status, imagens)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [
        id,
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
