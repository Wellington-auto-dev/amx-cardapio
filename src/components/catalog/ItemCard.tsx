import { useState } from 'react';
import type { Item } from '@/types/catalog';
import { formatCurrency } from '@/utils/formatCurrency';

interface ItemCardProps {
  item: Item;
  onAdd: (item: Item) => void;
}

export function ItemCard({ item, onAdd }: ItemCardProps) {
  const [imgError, setImgError] = useState(false);

  return (
    <div
      className="flex gap-3 p-4 rounded-2xl transition-all duration-200 hover:translate-y-[-1px] group"
      style={{
        backgroundColor: 'var(--color-surface)',
        border: '1px solid var(--color-border)',
        boxShadow: 'var(--shadow-sm)',
      }}
    >
      {/* Informações */}
      <div className="flex-1 flex flex-col gap-1.5 min-w-0 py-0.5">
        <h3 className="font-600 text-sm leading-snug" style={{ color: 'var(--color-text)' }}>
          {item.nome}
        </h3>
        {item.descricao && (
          <p className="text-xs leading-relaxed line-clamp-2" style={{ color: 'var(--color-text-secondary)' }}>
            {item.descricao}
          </p>
        )}
        <p
          className="text-base font-700 mt-auto pt-1"
          style={{ color: 'var(--color-primary)' }}
        >
          {formatCurrency(item.preco)}
        </p>
      </div>

      {/* Foto + botão */}
      <div className="relative flex-shrink-0 w-24 h-24">
        {item.foto_url && !imgError ? (
          <img
            src={item.foto_url}
            alt={item.nome}
            className="w-full h-full object-cover rounded-xl"
            loading="lazy"
            onError={() => setImgError(true)}
          />
        ) : (
          <div
            className="w-full h-full rounded-xl flex items-center justify-center text-2xl"
            style={{ backgroundColor: 'var(--color-surface-2)' }}
          >
            🍽️
          </div>
        )}

        {/* Overlay indisponível */}
        {!item.disponivel && (
          <div className="absolute inset-0 rounded-xl bg-black/65 flex items-center justify-center">
            <span
              className="text-[10px] font-700 px-1.5 py-0.5 rounded-full"
              style={{ backgroundColor: 'var(--color-surface-2)', color: 'var(--color-text-secondary)' }}
            >
              Indisponível
            </span>
          </div>
        )}

        {/* Botão + */}
        {item.disponivel && (
          <button
            onClick={() => onAdd(item)}
            aria-label={`Adicionar ${item.nome} ao carrinho`}
            className="absolute -bottom-2.5 -right-2.5 w-8 h-8 rounded-full text-white flex items-center justify-center shadow-md text-lg font-700 leading-none transition-all hover:scale-110 active:scale-95 focus:outline-none"
            style={{
              backgroundColor: 'var(--color-primary)',
              color: '#0D0D0D',
              boxShadow: '0 4px 12px rgb(245 166 35 / 0.4)',
            }}
          >
            +
          </button>
        )}
      </div>
    </div>
  );
}
