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

  // Baixa modelo de exemplo CSV/Excel atualizado com preco, estoque e disponivel
  const baixarPlanilhaModelo = () => {
    const cabecalhos = [
      {
        titulo: 'Roda Esportiva Exemplo Aro 17',
        marca: 'SCORRO',
        modelo: 'S-300',
        aro: 17,
        tala: 7.0,
        furacao: '4x100',
        sku: 'SCR-S300-17',
        cabeca_chave: '17mm',
        preco: 3200.00,
        estoque: 4,
        disponivel: 'SIM',
        imagens: 'https://images.unsplash.com/photo-1578844251758-2f71da64c96f;https://images.unsplash.com/photo-1611821064430-0d40291d0f0b',
        descricao: 'Roda esportiva diamantada modelo de teste',
      },
      {
        titulo: 'Roda Esportiva Exemplo Aro 18',
        marca: 'VOLCANO',
        modelo: 'Concept',
        aro: 18,
        tala: 7.5,
        furacao: '5x114.3',
        sku: 'VOL-CONC-18',
        cabeca_chave: '19mm',
        preco: 4100.00,
        estoque: 8,
        disponivel: 'SIM',
        imagens: 'https://images.unsplash.com/photo-1589148938909-4d241c91ee52',
        descricao: 'Roda aro 18 para sedãs',
      },
    ];

    const ws = XLSX.utils.json_to_sheet(cabecalhos);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Modelo');
    XLSX.writeFile(wb, 'planilha_modelo_rodas.xlsx');
  };

  const processarDadosPlanilha = (rawRows: any[]) => {
    const processadas: LinhaValidada[] = rawRows.map((r) => {
      const rawImagens = r.imagens || r.Imagens || r.imagem || r.Imagem || r.image_url || r.fotos || '';
      let imagensArr: string[] = [];

      if (typeof rawImagens === 'string') {
        imagensArr = rawImagens
          .split(/[;,]/)
          .map((s) => s.trim())
          .filter((s) => s.length > 0);
      } else if (Array.isArray(rawImagens)) {
        imagensArr = rawImagens;
      }

      if (imagensArr.length === 0) {
        imagensArr = ['https://images.unsplash.com/photo-1578844251758-2f71da64c96f?auto=format&fit=crop&w=800&q=80'];
      }

      const rawDisponivel = r.disponivel ?? r.Disponivel ?? r.ativo ?? r.Ativo ?? true;
      const isDisponivel =
        typeof rawDisponivel === 'boolean'
          ? rawDisponivel
          : String(rawDisponivel).trim().toUpperCase() !== 'NAO' &&
            String(rawDisponivel).trim().toUpperCase() !== 'NÃO' &&
            String(rawDisponivel).trim() !== '0' &&
            String(rawDisponivel).trim().toLowerCase() !== 'false';

      const itemCandidate = {
        titulo: String(r.titulo || r.Titulo || r.nome || r.Nome || r.modelo || r.Modelo || '').trim(),
        marca: String(r.marca || r.Marca || 'SCORRO').trim().toUpperCase(),
        modelo: String(r.modelo || r.Modelo || r.linha || r.Linha || 'Padrão').trim(),
        aro: Number(r.aro || r.Aro || 15),
        tala: Number(r.tala || r.Tala || 6.0),
        furacao: String(r.furacao || r.Furacao || r.pcd || r.PCD || '4x100').trim(),
        sku: String(r.sku || r.SKU || `ROD-${Math.floor(10000 + Math.random() * 90000)}`).trim().toUpperCase(),
        cabeca_chave: String(r.cabeca_chave || r.cabecaChave || r.chave || r.Chave || '17mm').trim(),
        preco: Number(r.preco || r.Preco || r.valor || r.Valor || 0),
        estoque: Number(r.estoque || r.Estoque || r.quantidade || r.Quantidade || 0),
        disponivel: isDisponivel,
        imagens: imagensArr,
        descricao: String(r.descricao || r.Descricao || '').trim(),
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
    <div className="flex flex-col gap-6 max-w-5xl mx-auto w-full">
      {/* Botão Baixar Modelo */}
      <div className="flex justify-between items-center bg-white border border-slate-200 rounded-2xl p-4 shadow-xs">
        <div>
          <span className="font-extrabold text-slate-900 text-sm block">
            Planilha Modelo para Cadastro
          </span>
          <span className="text-xs text-slate-500">
            Formato oficial com suporte a preço, saldo em estoque e disponibilidade.
          </span>
        </div>
        <button
          type="button"
          onClick={baixarPlanilhaModelo}
          className="inline-flex items-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold px-4 py-2.5 rounded-full transition-colors"
        >
          <Download className="w-4 h-4 text-slate-600" />
          <span>Baixar Planilha Modelo (.xlsx)</span>
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
        <p className="text-xs text-slate-500 max-w-md mx-auto">
          Colunas suportadas: <code>titulo, marca, modelo, aro, tala, furacao, sku, cabeca_chave, preco, estoque, disponivel, imagens, descricao</code>.
        </p>
      </div>

      {/* Feedback de Sucesso */}
      {resultadoFinal && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 flex items-center justify-between text-xs font-semibold">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            <span>
              Sucesso! {resultadoFinal.importados} rodas foram gravadas no banco Turso. Redirecionando...
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
                  <th className="p-3">Status</th>
                  <th className="p-3">Título</th>
                  <th className="p-3">Marca / Modelo</th>
                  <th className="p-3">Aro</th>
                  <th className="p-3">Preço</th>
                  <th className="p-3">Estoque</th>
                  <th className="p-3">Disponível</th>
                  <th className="p-3">SKU</th>
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
                      <td className="p-3 font-semibold text-slate-900 max-w-xs truncate">
                        {item.titulo}
                      </td>
                      <td className="p-3">
                        <span className="font-extrabold text-slate-800">{item.marca}</span>{' '}
                        <span className="text-slate-500">{item.modelo}</span>
                      </td>
                      <td className="p-3 font-semibold text-slate-800">Aro {item.aro}"</td>
                      <td className="p-3 font-extrabold text-slate-900 font-mono">
                        R$ {Number(item.preco ?? 0).toFixed(2)}
                      </td>
                      <td className="p-3 font-bold text-slate-800">{item.estoque ?? 0} un.</td>
                      <td className="p-3">
                        {item.disponivel !== false && (item.estoque ?? 0) > 0 ? (
                          <span className="text-emerald-700 font-bold">Sim</span>
                        ) : (
                          <span className="text-red-600 font-bold">Não</span>
                        )}
                      </td>
                      <td className="p-3 font-mono text-slate-500">{item.sku}</td>
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
