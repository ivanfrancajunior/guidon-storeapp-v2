import { initDatabase, turso } from './turso';

const INITIAL_PRODUTOS = [
  {
    id: 'f1b9a540-1011-4cb3-911e-b81600100001',
    titulo: 'Roda Esportiva Scorro S-250 Aro 15',
    marca: 'SCORRO',
    modelo: 'S-250',
    aro: 15,
    tala: 6.0,
    furacao: '4x100',
    sku: 'SCR-S250-15-4100',
    cabeca_chave: '17mm',
    imagens: JSON.stringify([
      'https://images.unsplash.com/photo-1578844251758-2f71da64c96f?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1611821064430-0d40291d0f0b?auto=format&fit=crop&w=800&q=80'
    ]),
    descricao: 'Roda de liga leve de alta performance Scorro S-250 com acabamento diamantado brilhante. Ideal para linha GM, VW e Honda.',
  },
  {
    id: 'f1b9a540-1011-4cb3-911e-b81600100002',
    titulo: 'Roda Volcano Santa Monica Aro 18',
    marca: 'VOLCANO',
    modelo: 'Santa Monica',
    aro: 18,
    tala: 7.0,
    furacao: '5x100',
    sku: 'VOL-SMON-18-5100',
    cabeca_chave: '19mm',
    imagens: JSON.stringify([
      'https://images.unsplash.com/photo-1589148938909-4d241c91ee52?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=800&q=80'
    ]),
    descricao: 'Clássica roda Santa Monica Volcano Aro 18 com acabamento prata diamantada, acabamento impecável e alta durabilidade.',
  },
  {
    id: 'f1b9a540-1011-4cb3-911e-b81600100003',
    titulo: 'Roda TSW Nurburgring Aro 19 Grafite Fosco',
    marca: 'TSW',
    modelo: 'Nurburgring',
    aro: 19,
    tala: 8.5,
    furacao: '5x114.3',
    sku: 'TSW-NURB-19-5114',
    cabeca_chave: '17mm',
    imagens: JSON.stringify([
      'https://images.unsplash.com/photo-1616422285623-13ff0162193c?auto=format&fit=crop&w=800&q=80'
    ]),
    descricao: 'Linha forjada esportiva TSW com acabamento grafite fosco. Projeto leve e resistente para carros esportivos e sedãs premium.',
  },
  {
    id: 'f1b9a540-1011-4cb3-911e-b81600100004',
    titulo: 'Roda BBS Super RS Aro 17 Dourada',
    marca: 'BBS',
    modelo: 'Super RS',
    aro: 17,
    tala: 7.5,
    furacao: '4x100',
    sku: 'BBS-SUPRS-17-4100',
    cabeca_chave: '17mm',
    imagens: JSON.stringify([
      'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=800&q=80'
    ]),
    descricao: 'Design retrô clássico da BBS alemã com centro em dourado e borda polida e parafusos estéticos cromados.',
  },
  {
    id: 'f1b9a540-1011-4cb3-911e-b81600100005',
    titulo: 'Roda Kromma KR-1450 Aro 14 Prata',
    marca: 'KROMMA',
    modelo: 'KR-1450',
    aro: 14,
    tala: 5.5,
    furacao: '4x108',
    sku: 'KRM-KR1450-14-4108',
    cabeca_chave: '19mm',
    imagens: JSON.stringify([
      'https://images.unsplash.com/photo-1563720223185-11003d516935?auto=format&fit=crop&w=800&q=80'
    ]),
    descricao: 'Roda para reposição e personalização Kromma Aro 14 compatível com Ford e Peugeot.',
  },
  {
    id: 'f1b9a540-1011-4cb3-911e-b81600100006',
    titulo: 'Roda Enkei RPF1 Aro 17 Silver Racing',
    marca: 'ENKEI',
    modelo: 'RPF1',
    aro: 17,
    tala: 8.0,
    furacao: '5x114.3',
    sku: 'ENK-RPF1-17-5114',
    cabeca_chave: '17mm',
    imagens: JSON.stringify([
      'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=800&q=80'
    ]),
    descricao: 'Famoso design motorsport japonês com tecnologia MAT que reduz drasticamente o peso não suspenso.',
  }
];

export async function seedDatabase() {
  await initDatabase();
  const count = await turso.execute('SELECT COUNT(*) as total FROM produtos');
  const total = Number(count.rows[0]?.total ?? 0);

  if (total === 0) {
    for (const prod of INITIAL_PRODUTOS) {
      await turso.execute({
        sql: `INSERT INTO produtos (id, titulo, marca, modelo, aro, tala, furacao, sku, cabeca_chave, imagens, descricao)
              VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        args: [
          prod.id,
          prod.titulo,
          prod.marca,
          prod.modelo,
          prod.aro,
          prod.tala,
          prod.furacao,
          prod.sku,
          prod.cabeca_chave,
          prod.imagens,
          prod.descricao
        ],
      });
    }
  }
}
