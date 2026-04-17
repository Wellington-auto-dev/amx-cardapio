import * as XLSX from 'xlsx';
import type { PlanilhaItemRow, PlanilhaGrupoRow } from '@/types/admin';

// ─── Gerador do modelo Excel para download ─────────────────────────────────

export function gerarModeloExcel(): void {
  const wb = XLSX.utils.book_new();

  // ── Aba "Itens" ──
  const itensHeader = [
    ['Substitua os exemplos abaixo com os dados da sua loja. Não altere os nomes das colunas.'],
    ['categoria', 'nome', 'descricao', 'preco', 'disponivel'],
    ['Pizzas', 'Pizza Portuguesa', 'Presunto, ovos, mussarela', 49.90, 'sim'],
    ['Pizzas', 'Pizza Margherita', 'Molho, mussarela, manjericão', 44.90, 'sim'],
    ['Hambúrgueres', 'Classic Burger', 'Blend 180g, cheddar, alface', 32.90, 'sim'],
    ['Bebidas', 'Coca-Cola Lata', 'Lata 350ml gelada', 7.90, 'sim'],
  ];
  const wsItens = XLSX.utils.aoa_to_sheet(itensHeader);

  // Formatação dos cabeçalhos
  wsItens['A1'].s = { font: { italic: true, color: { rgb: '888888' } } };
  ['A2','B2','C2','D2','E2'].forEach((ref) => {
    if (wsItens[ref]) wsItens[ref].s = { font: { bold: true } };
  });

  // Cor cinza claro nas linhas de exemplo (linhas 3-6 → índices 2-5)
  for (let r = 2; r <= 5; r++) {
    ['A','B','C','D','E'].forEach((col) => {
      const ref = `${col}${r + 1}`;
      if (wsItens[ref]) wsItens[ref].s = { fill: { fgColor: { rgb: 'F3F4F6' } } };
    });
  }

  wsItens['!cols'] = [{ wch: 18 }, { wch: 22 }, { wch: 32 }, { wch: 10 }, { wch: 12 }];
  wsItens['!merges'] = [{ s: { r: 0, c: 0 }, e: { r: 0, c: 4 } }];
  XLSX.utils.book_append_sheet(wb, wsItens, 'Itens');

  // ── Aba "Grupos e Opcoes" ──
  const gruposHeader = [
    ['Substitua os exemplos abaixo com os dados da sua loja. Não altere os nomes das colunas.'],
    ['item_nome', 'grupo_nome', 'obrigatorio', 'opcao_nome', 'preco_adicional'],
    ['Pizza Portuguesa', 'Tamanho', 'sim', 'Broto', -10],
    ['Pizza Portuguesa', 'Tamanho', 'sim', 'Média', 0],
    ['Pizza Portuguesa', 'Tamanho', 'sim', 'Grande', 10],
    ['Pizza Portuguesa', 'Borda', 'nao', 'Sem borda', 0],
    ['Pizza Portuguesa', 'Borda', 'nao', 'Catupiry', 8],
    ['Pizza Portuguesa', 'Borda', 'nao', 'Cheddar', 8],
    ['Classic Burger', 'Ponto da Carne', 'sim', 'Mal passado', 0],
    ['Classic Burger', 'Ponto da Carne', 'sim', 'Ao ponto', 0],
    ['Classic Burger', 'Acompanhamento', 'nao', 'Fritas', 0],
    ['Classic Burger', 'Acompanhamento', 'nao', 'Onion Rings', 5],
  ];
  const wsGrupos = XLSX.utils.aoa_to_sheet(gruposHeader);

  wsGrupos['A1'].s = { font: { italic: true, color: { rgb: '888888' } } };
  ['A2','B2','C2','D2','E2'].forEach((ref) => {
    if (wsGrupos[ref]) wsGrupos[ref].s = { font: { bold: true } };
  });

  wsGrupos['!cols'] = [{ wch: 22 }, { wch: 18 }, { wch: 12 }, { wch: 20 }, { wch: 16 }];
  wsGrupos['!merges'] = [{ s: { r: 0, c: 0 }, e: { r: 0, c: 4 } }];
  XLSX.utils.book_append_sheet(wb, wsGrupos, 'Grupos e Opcoes');

  XLSX.writeFile(wb, 'modelo-cardapio-amx.xlsx');
}

// ─── Parser da planilha enviada pelo lojista ───────────────────────────────

export interface ParsedPlanilha {
  itens: PlanilhaItemRow[];
  grupos: PlanilhaGrupoRow[];
}

export function parsePlanilha(file: File): Promise<ParsedPlanilha> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        const wb = XLSX.read(data, { type: 'array' });

        // Aba Itens
        const wsItens = wb.Sheets[wb.SheetNames[0]];
        const rawItens = XLSX.utils.sheet_to_json<Record<string, unknown>>(wsItens, {
          defval: '',
        });
        const itens: PlanilhaItemRow[] = rawItens.map((row) => ({
          categoria: String(row['categoria'] ?? '').trim(),
          nome: String(row['nome'] ?? '').trim(),
          descricao: String(row['descricao'] ?? '').trim(),
          preco: Number(row['preco'] ?? 0),
          disponivel: String(row['disponivel'] ?? 'sim').trim().toLowerCase(),
        }));

        // Aba Grupos e Opcoes (pode não existir)
        const wsGrupos = wb.Sheets[wb.SheetNames[1]];
        let grupos: PlanilhaGrupoRow[] = [];
        if (wsGrupos) {
          const rawGrupos = XLSX.utils.sheet_to_json<Record<string, unknown>>(wsGrupos, {
            defval: '',
          });
          grupos = rawGrupos.map((row) => ({
            item_nome: String(row['item_nome'] ?? '').trim(),
            grupo_nome: String(row['grupo_nome'] ?? '').trim(),
            obrigatorio: String(row['obrigatorio'] ?? 'nao').trim().toLowerCase(),
            opcao_nome: String(row['opcao_nome'] ?? '').trim(),
            preco_adicional: Number(row['preco_adicional'] ?? 0),
          }));
        }

        resolve({ itens, grupos });
      } catch (err) {
        reject(new Error('Não foi possível ler a planilha. Verifique o formato do arquivo.'));
      }
    };
    reader.onerror = () => reject(new Error('Erro ao ler o arquivo.'));
    reader.readAsArrayBuffer(file);
  });
}

/**
 * Combina as duas abas da planilha no formato esperado pelo endpoint.
 */
export function montarPayloadPlanilha(parsed: ParsedPlanilha): unknown[] {
  return parsed.itens
    .filter((item) => item.nome)
    .map((item) => {
      const gruposDoItem = parsed.grupos.filter(
        (g) => g.item_nome.toLowerCase() === item.nome.toLowerCase(),
      );

      // Agrupa as opções por grupo_nome
      const gruposMap = new Map<string, { obrigatorio: string; opcoes: { opcao_nome: string; preco_adicional: number }[] }>();
      gruposDoItem.forEach((g) => {
        if (!gruposMap.has(g.grupo_nome)) {
          gruposMap.set(g.grupo_nome, { obrigatorio: g.obrigatorio, opcoes: [] });
        }
        gruposMap.get(g.grupo_nome)!.opcoes.push({
          opcao_nome: g.opcao_nome,
          preco_adicional: g.preco_adicional,
        });
      });

      return {
        categoria: item.categoria,
        nome: item.nome,
        descricao: item.descricao,
        preco: item.preco,
        disponivel: item.disponivel === 'sim' ? 'sim' : 'nao',
        grupos: Array.from(gruposMap.entries()).map(([nome, val]) => ({
          grupo_nome: nome,
          obrigatorio: val.obrigatorio,
          opcoes: val.opcoes,
        })),
      };
    });
}
