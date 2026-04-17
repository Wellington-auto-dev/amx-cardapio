import { useState } from 'react';
import type { Categoria, Item } from '@/types/catalog';
import type { AdminSession } from '@/types/admin';
import { atualizarDisponibilidade, deletarItem } from '@/services/api';
import { Toggle } from '@/components/ui/Toggle';
import { Badge } from '@/components/ui/Badge';
import { formatCurrency } from '@/utils/formatCurrency';

interface ItemListProps {
  categorias: Categoria[];
  session: AdminSession;
  onRefresh: () => void;
  onAddFirst: () => void;
  onToast: (type: 'success' | 'error', title: string, msg?: string) => void;
}

function DeleteModal({ item, onConfirm, onCancel }: { item: Item | null; onConfirm: () => void; onCancel: () => void }) {
  if (!item) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onCancel} />
      <div
        className="relative rounded-2xl p-6 max-w-xs w-full z-10"
        style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)' }}
      >
        <h3 className="font-700 text-base mb-2" style={{ color: 'var(--color-text)' }}>Excluir item</h3>
        <p className="text-sm mb-5" style={{ color: 'var(--color-text-secondary)' }}>
          Tem certeza que deseja excluir <strong style={{ color: 'var(--color-text)' }}>{item.nome}</strong>? Esta ação não pode ser desfeita.
        </p>
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 py-2.5 rounded-xl text-sm font-600 transition-colors"
            style={{ border: '1px solid var(--color-border)', color: 'var(--color-text-secondary)', backgroundColor: 'transparent' }}
          >
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 py-2.5 rounded-xl text-sm font-600 hover:opacity-90"
            style={{ backgroundColor: '#EF4444', color: '#fff' }}
          >
            Excluir
          </button>
        </div>
      </div>
    </div>
  );
}

function ItemRow({ item, session, onDelete, onToast }: {
  item: Item;
  session: AdminSession;
  onDelete: (item: Item) => void;
  onToast: ItemListProps['onToast'];
}) {
  const [disponivel, setDisponivel] = useState(item.disponivel);
  const [loading, setLoading] = useState(false);

  const handleToggle = async (checked: boolean) => {
    setDisponivel(checked);
    setLoading(true);
    try {
      await atualizarDisponibilidade(session.merchant_id, session.token, item.id, checked);
    } catch {
      setDisponivel(!checked);
      onToast('error', 'Erro ao atualizar disponibilidade');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center gap-3 py-3" style={{ borderBottom: '1px solid var(--color-border-subtle)' }}>
      {item.foto_url && (
        <img
          src={item.foto_url}
          alt={item.nome}
          className="w-10 h-10 rounded-lg object-cover flex-shrink-0"
          loading="lazy"
        />
      )}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-600 truncate" style={{ color: 'var(--color-text)' }}>{item.nome}</p>
        <p className="text-xs" style={{ color: 'var(--color-primary)' }}>{formatCurrency(item.preco)}</p>
      </div>
      <Badge variant={disponivel ? 'success' : 'error'}>
        {disponivel ? 'Disponível' : 'Indisponível'}
      </Badge>
      <Toggle
        checked={disponivel}
        onChange={handleToggle}
        disabled={loading}
        ariaLabel={`Disponibilidade de ${item.nome}`}
      />
      <button
        onClick={() => onDelete(item)}
        aria-label={`Excluir ${item.nome}`}
        className="transition-opacity opacity-30 hover:opacity-100 ml-1"
        style={{ color: '#F87171' }}
      >
        <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
          <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
        </svg>
      </button>
    </div>
  );
}

export function ItemList({ categorias, session, onRefresh, onAddFirst, onToast }: ItemListProps) {
  const [itemToDelete, setItemToDelete] = useState<Item | null>(null);
  const [deleting, setDeleting] = useState(false);

  const totalItens = categorias.reduce((s, c) => s + c.itens.length, 0);

  const confirmDelete = async () => {
    if (!itemToDelete) return;
    setDeleting(true);
    try {
      await deletarItem(session.merchant_id, session.token, itemToDelete.id);
      onToast('success', `"${itemToDelete.nome}" excluído.`);
      onRefresh();
    } catch {
      onToast('error', 'Erro ao excluir item');
    } finally {
      setDeleting(false);
      setItemToDelete(null);
    }
  };

  if (totalItens === 0) {
    return (
      <div className="flex flex-col items-center py-16 gap-4">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-14 h-14 opacity-20" style={{ color: 'var(--color-text-secondary)' }}>
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
        <p className="text-sm font-500" style={{ color: 'var(--color-text-secondary)' }}>Nenhum item cadastrado ainda</p>
        <button
          onClick={onAddFirst}
          className="px-4 py-2 rounded-xl text-sm font-600 hover:opacity-85 transition-opacity"
          style={{ backgroundColor: 'var(--color-primary)', color: '#0D0D0D' }}
        >
          Adicionar primeiro item
        </button>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-3">
        {categorias.map((cat) => (
          <div
            key={cat.nome}
            className="rounded-2xl overflow-hidden"
            style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)' }}
          >
            <div
              className="px-4 py-3 flex items-center justify-between"
              style={{ backgroundColor: 'var(--color-surface-2)', borderBottom: '1px solid var(--color-border)' }}
            >
              <h3 className="font-700 text-sm" style={{ color: 'var(--color-text)' }}>{cat.nome}</h3>
              <span
                className="text-xs px-2 py-0.5 rounded-full"
                style={{ backgroundColor: 'var(--color-surface-3)', color: 'var(--color-text-secondary)' }}
              >
                {cat.itens.length} {cat.itens.length === 1 ? 'item' : 'itens'}
              </span>
            </div>
            <div className="px-4">
              {cat.itens.map((item) => (
                <ItemRow
                  key={item.id}
                  item={item}
                  session={session}
                  onDelete={setItemToDelete}
                  onToast={onToast}
                />
              ))}
            </div>
          </div>
        ))}
      </div>

      <DeleteModal
        item={itemToDelete}
        onConfirm={confirmDelete}
        onCancel={() => !deleting && setItemToDelete(null)}
      />
    </>
  );
}
