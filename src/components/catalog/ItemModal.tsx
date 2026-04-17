import { useState, useMemo, useEffect } from 'react';
import type { Item, GrupoItem, OpcaoGrupo } from '@/types/catalog';
import type { OpcaoSelecionada } from '@/types/cart';
import { Modal } from '@/components/ui/Modal';
import { formatCurrency, formatPriceAdditional } from '@/utils/formatCurrency';

interface ItemModalProps {
  item: Item | null;
  open: boolean;
  onClose: () => void;
  onAddToCart: (item: Item, quantidade: number, opcoes: OpcaoSelecionada[]) => void;
}

export function ItemModal({ item, open, onClose, onAddToCart }: ItemModalProps) {
  const [quantidade, setQuantidade] = useState(1);
  const [selecoes, setSelecoes] = useState<Record<string, Set<string>>>({});
  const [imgError, setImgError] = useState(false);

  useEffect(() => {
    if (open) {
      setQuantidade(1);
      setSelecoes({});
      setImgError(false);
    }
  }, [open, item?.id]);

  const toggleOpcao = (grupo: GrupoItem, opcao: OpcaoGrupo) => {
    setSelecoes((prev) => {
      const current = prev[grupo.id] ?? new Set<string>();
      const next = new Set(current);
      if (grupo.maximo === 1) {
        next.clear();
        next.add(opcao.id);
      } else {
        if (next.has(opcao.id)) next.delete(opcao.id);
        else if (next.size < grupo.maximo) next.add(opcao.id);
      }
      return { ...prev, [grupo.id]: next };
    });
  };

  const obrigatoriosCompletos = useMemo(() => {
    if (!item) return false;
    return item.grupos
      .filter((g) => g.obrigatorio)
      .every((g) => { const sel = selecoes[g.id]; return sel && sel.size >= g.minimo; });
  }, [item, selecoes]);

  const subtotal = useMemo(() => {
    if (!item) return 0;
    const adicionais = item.grupos
      .flatMap((g) => g.opcoes.filter((o) => selecoes[g.id]?.has(o.id)))
      .reduce((s, o) => s + o.preco_adicional, 0);
    return (item.preco + adicionais) * quantidade;
  }, [item, selecoes, quantidade]);

  const opcoesSelecionadas = useMemo((): OpcaoSelecionada[] => {
    if (!item) return [];
    return item.grupos.flatMap((g) =>
      g.opcoes
        .filter((o) => selecoes[g.id]?.has(o.id))
        .map((o) => ({
          grupo_id: g.id, grupo_nome: g.nome,
          opcao_id: o.id, opcao_nome: o.nome,
          preco_adicional: o.preco_adicional,
        })),
    );
  }, [item, selecoes]);

  const handleAdd = () => {
    if (!item || !obrigatoriosCompletos) return;
    onAddToCart(item, quantidade, opcoesSelecionadas);
    onClose();
  };

  if (!item) return null;

  return (
    <Modal open={open} onClose={onClose} maxWidth={480} fullscreenMobile>
      {/* Foto */}
      <div className="relative w-full" style={{ aspectRatio: '16/9' }}>
        {item.foto_url && !imgError ? (
          <img
            src={item.foto_url}
            alt={item.nome}
            className="w-full h-full object-cover"
            onError={() => setImgError(true)}
          />
        ) : (
          <div
            className="w-full h-full flex items-center justify-center text-5xl"
            style={{ backgroundColor: 'var(--color-surface-2)' }}
          >
            🍽️
          </div>
        )}
        {/* Gradiente inferior */}
        <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/60 to-transparent" />
        {/* Botão fechar */}
        <button
          onClick={onClose}
          aria-label="Fechar"
          className="absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center text-white transition-colors"
          style={{ backgroundColor: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }}
        >
          <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </button>
      </div>

      {/* Scroll interno */}
      <div className="flex-1 overflow-y-auto">
        {/* Nome e preço */}
        <div className="px-4 pt-4 pb-3" style={{ borderBottom: '1px solid var(--color-border)' }}>
          <h2 className="text-lg font-700" style={{ color: 'var(--color-text)' }}>{item.nome}</h2>
          {item.descricao && (
            <p className="text-sm mt-1" style={{ color: 'var(--color-text-secondary)' }}>{item.descricao}</p>
          )}
          <p className="text-lg font-700 mt-2" style={{ color: 'var(--color-primary)' }}>
            {formatCurrency(item.preco)}
          </p>
        </div>

        {/* Grupos */}
        {item.grupos.map((grupo) => (
          <div key={grupo.id} style={{ borderBottom: '1px solid var(--color-border)' }} className="last:border-0">
            {/* Header do grupo */}
            <div
              className="px-4 py-3 flex items-center justify-between"
              style={{ backgroundColor: 'var(--color-surface-2)' }}
            >
              <span className="font-600 text-sm" style={{ color: 'var(--color-text)' }}>{grupo.nome}</span>
              <div className="flex items-center gap-2">
                {grupo.obrigatorio && (
                  <span
                    className="text-xs px-2 py-0.5 rounded-full font-700"
                    style={{ backgroundColor: 'rgb(245 166 35 / 0.15)', color: 'var(--color-primary)' }}
                  >
                    Obrigatório
                  </span>
                )}
                {grupo.maximo > 1 && (
                  <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
                    máx. {grupo.maximo}
                  </span>
                )}
              </div>
            </div>

            {/* Opções */}
            <div className="px-4 py-1">
              {grupo.opcoes.map((opcao) => {
                const selecionado = selecoes[grupo.id]?.has(opcao.id) ?? false;
                const maxAtingido = grupo.maximo > 1 && !selecionado && (selecoes[grupo.id]?.size ?? 0) >= grupo.maximo;

                return (
                  <button
                    key={opcao.id}
                    disabled={maxAtingido}
                    onClick={() => toggleOpcao(grupo, opcao)}
                    className="w-full flex items-center gap-3 py-3 px-2 rounded-xl transition-colors text-left"
                    style={{
                      backgroundColor: selecionado ? 'rgb(245 166 35 / 0.08)' : 'transparent',
                      opacity: maxAtingido ? 0.4 : 1,
                      cursor: maxAtingido ? 'not-allowed' : 'pointer',
                    }}
                  >
                    {/* Indicador */}
                    <div
                      className={`w-5 h-5 flex-shrink-0 border-2 flex items-center justify-center transition-all ${grupo.maximo === 1 ? 'rounded-full' : 'rounded'}`}
                      style={{
                        backgroundColor: selecionado ? 'var(--color-primary)' : 'transparent',
                        borderColor: selecionado ? 'var(--color-primary)' : 'var(--color-border)',
                      }}
                    >
                      {selecionado && (
                        <svg viewBox="0 0 12 12" className="w-3 h-3" fill="none" stroke="#0D0D0D" strokeWidth="2" strokeLinecap="round">
                          <polyline points="2,6 5,9 10,3" />
                        </svg>
                      )}
                    </div>

                    <span className="flex-1 text-sm" style={{ color: 'var(--color-text)' }}>{opcao.nome}</span>

                    <span
                      className="text-sm font-500"
                      style={{ color: opcao.preco_adicional > 0 ? '#34D399' : 'var(--color-text-muted)' }}
                    >
                      {formatPriceAdditional(opcao.preco_adicional)}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Rodapé fixo */}
      <div
        className="p-4 space-y-3"
        style={{ borderTop: '1px solid var(--color-border)', backgroundColor: 'var(--color-surface)' }}
      >
        {/* Seletor de quantidade */}
        <div className="flex items-center justify-center gap-5">
          <button
            onClick={() => setQuantidade((q) => Math.max(1, q - 1))}
            aria-label="Diminuir"
            className="w-9 h-9 rounded-full flex items-center justify-center font-700 text-lg leading-none transition-colors"
            style={{ border: '1px solid var(--color-border)', color: 'var(--color-text)' }}
          >
            −
          </button>
          <span className="text-xl font-700 w-6 text-center" style={{ color: 'var(--color-text)' }}>
            {quantidade}
          </span>
          <button
            onClick={() => setQuantidade((q) => q + 1)}
            aria-label="Aumentar"
            className="w-9 h-9 rounded-full flex items-center justify-center text-lg font-700 leading-none transition-opacity hover:opacity-85"
            style={{ backgroundColor: 'var(--color-primary)', color: '#0D0D0D' }}
          >
            +
          </button>
        </div>

        {/* Botão adicionar */}
        <button
          onClick={handleAdd}
          disabled={!obrigatoriosCompletos}
          className="w-full py-3.5 rounded-xl text-sm font-700 transition-all active:scale-[0.98]"
          style={{
            backgroundColor: obrigatoriosCompletos ? 'var(--color-primary)' : 'var(--color-surface-2)',
            color: obrigatoriosCompletos ? '#0D0D0D' : 'var(--color-text-muted)',
            cursor: obrigatoriosCompletos ? 'pointer' : 'not-allowed',
            boxShadow: obrigatoriosCompletos ? '0 4px 16px rgb(245 166 35 / 0.35)' : 'none',
          }}
        >
          Adicionar ao carrinho — {formatCurrency(subtotal)}
        </button>
      </div>
    </Modal>
  );
}
