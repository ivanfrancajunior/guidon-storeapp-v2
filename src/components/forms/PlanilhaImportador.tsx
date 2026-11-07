import React, { useState } from 'react';
import Papa from 'papaparse';
import * as XLSX from 'xlsx';
import { UploadCloud, CheckCircle2, AlertCircle, Download, FileSpreadsheet } from 'lucide-react';
import { useProdutoMutations } from '@/hooks/useProdutoMutations';
import { ProdutoSchema, type Produto } from '@/lib/schemas/produto';

interface LinhaValidada {
  raw: any;
  normalizado?: Partial<Produto>;
  valido: boolean;
  erros?: string[];
}

export function PlanilhaImportador() {
  const [linhas, setLinhas] = useState<LinhaValidada[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [resultadoFinal, setResultadoFinal] = useState<{
    importados?: number;
    erros?: any[];
  } | null>(null);

  const { importarLote } = useProdutoMutations();

  // Baixa modelo de exemplo com a ordem e nomes exatos solicitados
  const baixarPlanilhaModelo = () => {
    const cabecalhos = [
      {
        SKU: 'SCR-S250-15',
        Marca: 'SCORRO',
        Modelo: 'S-250',
        Aro: 15,
        Tala: 6.0,
        'Furação': '4x100',
        'Cabeça de Chave': '17mm',
        'Título': 'Roda Esportiva Scorro S-250 Aro 15 Diamantada',
        Acabamento: 'Diamantada Prata',
        'Estoque no depósito': 8,
        'Preço': 2890.00,
        'Condição': 'Nova',
        'Descrição': 'Roda de liga leve de alta performance Scorro S-250',
        Status: 'Ativo',
        Imagens: 'https://images.unsplash.com/photo-1578844251758-2f71da64c96f;https://images.unsplash.com/photo-1611821064430-0d40291d0f0b',
      },
      {
        SKU: 'VOL-SMON-18',
        Marca: 'VOLCANO',
        Modelo: 'Santa Monica',
        Aro: 18,
        Tala: 7.0,
        'Furação': '5x100',
        'Cabeça de Chave': '19mm',
        'Título': 'Roda Volcano Santa Monica Aro 18',
        Acabamento: 'Prata Diamantada',
        'Estoque no depósito': 4,
        'Preço': 3750.00,
        'Condição': 'Nova',
        'Descrição': 'Clássica Santa Monica aro 18',
        Status: 'Ativo',
        Imagens: 'https://images.unsplash.com/photo-1589148938909-4d241c91ee52',
      },
    ];

    const ws = XLSX.utils.json_to_sheet(cabecalhos);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Rodas');
    XLSX.writeFile(wb, 'planilha_modelo_rodas.xlsx');
  };

  const processarDadosPlanilha = (rawRows: any[]) => {
    const processadas: LinhaValidada[] = rawRows.map((r) => {
      // Normalização tolerante a variações com e sem acento / maiúsculas
      const getVal = (...keys: string[]) => {
        for (const k of keys) {
          if (r[k] !== undefined && r[k] !== null && String(r[k]).trim() !== '') {
            return r[k];
          }
        }
        return undefined;
      };

      const rawImagens = getVal('Imagens', 'imagens', 'imagem', 'Imagem', 'image_url', 'fotos') || '';
      let imagensArr: string[] = [];

      if (typeof rawImagens === 'string') {
        imagensArr = rawImagens
          .split(/[;,]/)
          .map((s: string) => s.trim())
          .filter((s: string) => s.length > 0);
      } else if (Array.isArray(rawImagens)) {
        imagensArr = rawImagens;
      }

      if (imagensArr.length === 0) {
        imagensArr = ['https://images.unsplash.com/photo-1578844251758-2f71da64c96f?auto=format&fit=crop&w=800&q=80'];
      }

      const rawStatus = getVal('Status', 'status', 'situacao', 'Situação');
      let statusFormatado = 'Ativo';
      if (rawStatus !== undefined) {
        const s = String(rawStatus).trim().toLowerCase();
        if (s === 'inativo' || s === 'inactive' || s === 'nao' || s === 'não' || s === '0' || s === 'false') {
          statusFormatado = 'Inativo';
        }
      }

      const itemCandidate = {
        sku: String(getVal('SKU', 'sku', 'Codigo', 'Código') || `ROD-${Math.floor(10000 + Math.random() * 90000)}`).trim().toUpperCase(),
        marca: String(getVal('Marca', 'marca') || 'SCORRO').trim().toUpperCase(),
        modelo: String(getVal('Modelo', 'modelo', 'linha') || 'Padrão').trim(),
        aro: Number(getVal('Aro', 'aro') || 15),
        tala: Number(getVal('Tala', 'tala') || 6.0),
        furacao: String(getVal('Furação', 'Furacao', 'furacao', 'pcd', 'PCD') || '4x100').trim(),
        cabeca_chave: String(getVal('Cabeça de Chave', 'Cabeca de Chave', 'cabeca_chave', 'chave') || '17mm').trim(),
        titulo: String(getVal('Título', 'Titulo', 'titulo', 'nome', 'Nome') || '').trim(),
        acabamento: String(getVal('Acabamento', 'acabamento', 'finish') || 'Padrão').trim(),
        estoque: Number(getVal('Estoque no depósito', 'Estoque no deposito', 'estoque', 'Estoque', 'quantidade') || 0),
        preco: Number(getVal('Preço', 'Preco', 'preco', 'valor', 'Valor') || 0),
        condicao: String(getVal('Condição', 'Condicao', 'condicao') || 'Nova').trim(),
        descricao: String(getVal('Descrição', 'Descricao', 'descricao') || '').trim(),
        status: statusFormatado,
        imagens: imagensArr,
      };

      const res = ProdutoSchema.safeParse(itemCandidate);
      if (res.success) {
        return {
          raw: r,
          normalizado: res.data,
          valido: true,
        };
      } else {
        return {
          raw: r,
          normalizado: itemCandidate,
          valido: false,
          erros: res.error.errors.map((e) => `${e.path.join('.')}: ${e.message}`),
        };
      }
    });

    setLinhas(processadas);
    setResultadoFinal(null);
  };

  const handleFileUpload = (file: File) => {
    if (file.name.endsWith('.csv')) {
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          processarDadosPlanilha(results.data);
        },
      });
    } else {
      const reader = new FileReader();
      reader.onload = (e) => {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        const json = XLSX.utils.sheet_to_json(worksheet);
        processarDadosPlanilha(json);
      };
      reader.readAsArrayBuffer(file);
    }
  };

  const handleConfirmarImportacao = () => {
    const validas = linhas.filter((l) => l.valido && l.normalizado).map((l) => l.normalizado!);

    if (validas.length === 0) {
      alert('Nenhuma linha válida para importar!');
      return;
    }

    importarLote.mutate(validas, {
      onSuccess: (data) => {
        setResultadoFinal(data);
        setTimeout(() => {
          window.location.href = '/';
        }, 1500);
      },
      onError: (err) => {
        alert(`Erro na importação em lote: ${err.message}`);
      },
    });
  };

  const totalValidas = linhas.filter((l) => l.valido).length;
  const totalErros = linhas.filter((l) => !l.valido).length;

  return (
    <div className="flex flex-col gap-6 max-w-6xl mx-auto w-full">
      {/* Botão Baixar Modelo */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white border border-slate-200 rounded-2xl p-4 shadow-xs">
        <div>
          <span className="font-extrabold text-slate-900 text-sm block">
            Planilha Modelo Oficial
          </span>
          <span className="text-xs text-slate-500">
            Contém exatamente as 15 colunas: SKU, Marca, Modelo, Aro, Tala, Furação, Cabeça de Chave, Título, Acabamento, Estoque no depósito, Preço, Condição, Descrição, Status, Imagens.
          </span>
        </div>
        <button
          type="button"
          onClick={baixarPlanilhaModelo}
          className="inline-flex items-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold px-4 py-2.5 rounded-full transition-colors shrink-0"
        >
          <Download className="w-4 h-4 text-slate-600" />
          <span>Baixar Modelo (.xlsx)</span>
        </button>
      </div>

      {/* Área de Drag and Drop */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setIsDragging(false);
          const file = e.dataTransfer.files[0];
          if (file) handleFileUpload(file);
        }}
        onClick={() => document.getElementById('sheetFileInput')?.click()}
        className={`border-2 border-dashed rounded-[20px] p-10 text-center cursor-pointer transition-all ${
          isDragging
            ? 'border-blue-600 bg-blue-50/80 shadow-md'
            : 'border-slate-300 hover:border-blue-500 bg-white hover:bg-slate-50 shadow-xs'
        }`}
      >
        <input
          type="file"
          id="sheetFileInput"
          accept=".csv, .xlsx, .xls"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleFileUpload(file);
          }}
        />
        <UploadCloud className="w-12 h-12 text-blue-600 mx-auto mb-3" />
        <h3 className="font-extrabold text-slate-900 text-base mb-1">
          Clique ou arraste sua planilha CSV ou Excel (.xlsx)
        </h3>
        <p className="text-xs text-slate-500 max-w-2xl mx-auto">
          Reconhece automaticamente as colunas da sua planilha. Múltiplas imagens podem ser separadas por ponto-e-vírgula (<code>;</code>) ou vírgula.
        </p>
      </div>

      {/* Feedback de Sucesso */}
      {resultadoFinal && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 flex items-center justify-between text-xs font-semibold">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            <span>
              Sucesso! {resultadoFinal.importados} rodas foram gravadas no Turso. Redirecionando...
            </span>
          </div>
        </div>
      )}

      {/* Tabela de Revisão com Validação Zod */}
      {linhas.length > 0 && (
        <div className="bg-white border border-slate-200 rounded-[20px] p-6 shadow-xs flex flex-col gap-4">
          <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100">
            <div className="flex items-center gap-4">
              <span className="text-xs font-extrabold uppercase tracking-wider text-slate-900">
                Revisão dos Registros ({linhas.length})
              </span>
              <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                {totalValidas} Válidas
              </span>
              {totalErros > 0 && (
                <span className="text-xs font-bold text-red-700 bg-red-50 px-2.5 py-1 rounded-full border border-red-200">
                  {totalErros} Com Erro
                </span>
              )}
            </div>

            <button
              type="button"
              onClick={handleConfirmarImportacao}
              disabled={importarLote.isPending || totalValidas === 0}
              className="inline-flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold uppercase tracking-wider px-5 py-2.5 rounded-full transition-all shadow-sm disabled:opacity-50"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>
                {importarLote.isPending
                  ? 'Importando no Turso...'
                  : `Confirmar Importação (${totalValidas} rodas)`}
              </span>
            </button>
          </div>

          <div className="max-h-[380px] overflow-y-auto border border-slate-200 rounded-xl">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 sticky top-0 border-b border-slate-200 text-slate-500 font-extrabold uppercase tracking-wider">
                <tr>
                  <th className="p-3">Status Validação</th>
                  <th className="p-3">SKU</th>
                  <th className="p-3">Título</th>
                  <th className="p-3">Marca / Modelo</th>
                  <th className="p-3">Aro</th>
                  <th className="p-3">Acabamento</th>
                  <th className="p-3">Preço</th>
                  <th className="p-3">Depósito</th>
                  <th className="p-3">Condição</th>
                  <th className="p-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {linhas.map((linha, idx) => {
                  const item = linha.normalizado || {};
                  return (
                    <tr
                      key={idx}
                      className={
                        linha.valido
                          ? 'hover:bg-slate-50'
                          : 'bg-red-50/50 hover:bg-red-50'
                      }
                    >
                      <td className="p-3">
                        {linha.valido ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> OK
                          </span>
                        ) : (
                          <div className="flex flex-col gap-0.5" title={linha.erros?.join('\n')}>
                            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-red-600">
                              <AlertCircle className="w-3.5 h-3.5 text-red-600" /> Inválido
                            </span>
                            <span className="text-[10px] text-red-500 line-clamp-1 max-w-[140px]">
                              {linha.erros?.[0]}
                            </span>
                          </div>
                        )}
                      </td>
                      <td className="p-3 font-mono font-bold text-slate-600">{item.sku}</td>
                      <td className="p-3 font-semibold text-slate-900 max-w-xs truncate">
                        {item.titulo}
                      </td>
                      <td className="p-3">
                        <span className="font-extrabold text-slate-800">{item.marca}</span>{' '}
                        <span className="text-slate-500">{item.modelo}</span>
                      </td>
                      <td className="p-3 font-semibold text-slate-800">Aro {item.aro}"</td>
                      <td className="p-3 text-slate-700">{item.acabamento || 'Padrão'}</td>
                      <td className="p-3 font-extrabold text-slate-900 font-mono">
                        R$ {Number(item.preco ?? 0).toFixed(2)}
                      </td>
                      <td className="p-3 font-bold text-slate-800">{item.estoque ?? 0} un.</td>
                      <td className="p-3 text-slate-700 font-semibold">{item.condicao || 'Nova'}</td>
                      <td className="p-3">
                        <span className={`font-bold ${item.status === 'Ativo' ? 'text-emerald-700' : 'text-slate-500'}`}>
                          {item.status}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
