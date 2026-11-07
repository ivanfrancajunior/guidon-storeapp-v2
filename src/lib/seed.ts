import { initDatabase, turso } from './turso';

const INITIAL_PRODUTOS = [
  {
    id: 'f1b9a540-1011-4cb3-911e-b81600100001',
    sku: 'SCR-S250-15-4100',
    marca: 'SCORRO',
    modelo: 'S-250',
    aro: 15,
    tala: 6.0,
    furacao: '4x100',
    cabeca_chave: '17mm',
    titulo: 'Roda Esportiva Scorro S-250 Aro 15 Diamantada',
    acabamento: 'Diamantada Prata',
    estoque: 8,
    preco: 2890.00,
    condicao: 'Nova',
    descricao: 'Roda de liga leve de alta performance Scorro S-250 com acabamento diamantado brilhante. Ideal para linha GM, VW e Honda.',
    status: 'Ativo',
    imagens: JSON.stringify([
      'https://images.unsplash.com/photo-1578844251758-2f71da64c96f?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1611821064430-0d40291d0f0b?auto=format&fit=crop&w=800&q=80'
    ]),
  },
  {
    id: 'f1b9a540-1011-4cb3-911e-b81600100002',
    sku: 'VOL-SMON-18-5100',
    marca: 'VOLCANO',
    modelo: 'Santa Monica',
    aro: 18,
    tala: 7.0,
    furacao: '5x100',
    cabeca_chave: '19mm',
    titulo: 'Roda Volcano Santa Monica Aro 18',
    acabamento: 'Prata Diamantada',
    estoque: 4,
    preco: 3750.00,
    condicao: 'Nova',
    descricao: 'Clássica roda Santa Monica Volcano Aro 18 com acabamento prata diamantada, acabamento impecável e alta durabilidade.',
    status: 'Ativo',
    imagens: JSON.stringify([
      'https://images.unsplash.com/photo-1589148938909-4d241c91ee52?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=800&q=80'
    ]),
  },
  {
    id: 'f1b9a540-1011-4cb3-911e-b81600100003',
    sku: 'TSW-NURB-19-5114',
    marca: 'TSW',
    modelo: 'Nurburgring',
    aro: 19,
    tala: 8.5,
    furacao: '5x114.3',
    cabeca_chave: '17mm',
    titulo: 'Roda TSW Nurburgring Aro 19 Grafite Fosco',
    acabamento: 'Grafite Fosco',
    estoque: 0,
    preco: 5990.00,
    condicao: 'Nova',
    descricao: 'Linha esportiva TSW com acabamento grafite fosco. Projeto leve e resistente para carros esportivos e sedãs premium.',
    status: 'Inativo',
    imagens: JSON.stringify([
      'https://images.unsplash.com/photo-1616422285623-13ff0162193c?auto=format&fit=crop&w=800&q=80'
    ]),
  },
  {
    id: 'f1b9a540-1011-4cb3-911e-b81600100004',
    sku: 'BBS-SUPRS-17-4100',
    marca: 'BBS',
    modelo: 'Super RS',
    aro: 17,
    tala: 7.5,
    furacao: '4x100',
    cabeca_chave: '17mm',
    titulo: 'Roda BBS Super RS Aro 17 Dourada com Borda Polida',
    acabamento: 'Dourado / Polido',
    estoque: 2,
    preco: 4200.00,
    condicao: 'Seminova',
    descricao: 'Design retrô clássico da BBS alemã com centro em dourado, borda polida e parafusos estéticos cromados.',
    status: 'Ativo',
    imagens: JSON.stringify([
      'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=800&q=80'
    ]),
  },
  {
    id: 'f1b9a540-1011-4cb3-911e-b81600100005',
    sku: 'KRM-KR1450-14-4108',
    marca: 'KROMMA',
    modelo: 'KR-1450',
    aro: 14,
    tala: 5.5,
    furacao: '4x108',
    cabeca_chave: '19mm',
    titulo: 'Roda Kromma KR-1450 Aro 14 Prata',
    acabamento: 'Prata Tradicional',
    estoque: 12,
    preco: 1980.00,
    condicao: 'Nova',
    descricao: 'Roda para reposição e personalização Kromma Aro 14 compatível com Ford e Peugeot.',
    status: 'Ativo',
    imagens: JSON.stringify([
      'https://images.unsplash.com/photo-1563720223185-11003d516935?auto=format&fit=crop&w=800&q=80'
    ]),
  },
  {
    id: 'f1b9a540-1011-4cb3-911e-b81600100006',
    sku: 'ENK-RPF1-17-5114',
    marca: 'ENKEI',
    modelo: 'RPF1',
    aro: 17,
    tala: 8.0,
    furacao: '5x114.3',
    cabeca_chave: '17mm',
    titulo: 'Roda Enkei RPF1 Aro 17 Silver Racing',
    acabamento: 'Silver Racing',
    estoque: 6,
    preco: 4850.00,
    condicao: 'Nova',
    descricao: 'Famoso design motorsport japonês com tecnologia MAT que reduz drasticamente o peso não suspenso.',
    status: 'Ativo',
    imagens: JSON.stringify([
      'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=800&q=80'
    ]),
  }
];

export async function seedDatabase() {
  await initDatabase();
  const count = await turso.execute('SELECT COUNT(*) as total FROM produtos');
  const total = Number(count.rows[0]?.total ?? 0);

  if (total === 0) {
    for (const prod of INITIAL_PRODUTOS) {
      await turso.execute({
        sql: `INSERT INTO produtos (id, sku, marca, modelo, aro, tala, furacao, cabeca_chave, titulo, acabamento, estoque, preco, condicao, descricao, status, imagens)
              VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        args: [
          prod.id,
          prod.sku,
          prod.marca,
          prod.modelo,
          prod.aro,
          prod.tala,
          prod.furacao,
          prod.cabeca_chave,
          prod.titulo,
          prod.acabamento,
          prod.estoque,
          prod.preco,
          prod.condicao,
          prod.descricao,
          prod.status,
          prod.imagens,
        ],
      });
    }
  } else {
    for (const prod of INITIAL_PRODUTOS) {
      await turso.execute({
        sql: `UPDATE produtos SET 
                acabamento = COALESCE(acabamento, ?),
                condicao = COALESCE(condicao, ?),
                status = COALESCE(status, ?)
              WHERE id = ?`,
        args: [prod.acabamento, prod.condicao, prod.status, prod.id]
      });
    }
  }
}
