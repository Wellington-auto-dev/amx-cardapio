import type { CartItem } from '@/types/cart';
import { BottomSheet } from '@/components/ui/BottomSheet';
import { formatCurrency } from '@/utils/formatCurrency';

interface CartDrawerProps {
  items: CartItem[];
  total: number;
  open: boolean;
  onClose: () => void;
  onUpdateQuantity: (cartItemId: string, quantidade: number) => void;
  onRemove: (cartItemId: string) => void;
  onFinalize: () => void;
}

function CartItemRow({
  item,
  onUpdateQuantity,
  onRemove,
}: {
  item: CartItem;
  onUpdateQuantity: (id: string, q: number) => void;
  onRemove: (id: string) => void;
}) {
  const opcoesStr = item.opcoes_selecionadas.map((o) => o.opcao_nome).join(', ');

  return (
    <div className="flex gap-3 py-3.5" style={{ borderBottom: '1px solid var(--color-border)' }}>
      {item.foto_url && (
        <img
          src={item.foto_url}
          alt={item.nome}
          className="w-12 h-12 rounded-lg object-cover flex-shrink-0"
          loading="lazy"
        />
      )}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-600 leading-snug" style={{ color: 'var(--color-text)' }}>{item.nome}</p>
        {opcoesStr && (
          <p className="text-xs mt-0.5 leading-snug" style={{ color: 'var(--color-text-secondary)' }}>{opcoesStr}</p>
        )}
        <p className="text-sm font-700 mt-1" style={{ color: 'var(--color-primary)' }}>
          {formatCurrency(item.preco_unitario * item.quantidade)}
        </p>
      </div>

      <div className="flex flex-col items-end justify-between">
        <button
          onClick={() => onRemove(item.cart_item_id)}
          aria-label={`Remover ${item.nome}`}
          className="transition-colors opacity-40 hover:opacity-100"
          style={{ color: '#F87171' }}
        >
          <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
            <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
        </button>

        <div className="flex items-center gap-2 mt-1">
          <button
            onClick={() => onUpdateQuantity(item.cart_item_id, item.quantidade - 1)}
            aria-label="Diminuir"
            className="w-7 h-7 rounded-full flex items-center justify-center font-700 text-sm transition-colors"
            style={{ border: '1px solid var(--color-border)', color: 'var(--color-text)' }}
          >
            −
          </button>
          <span className="text-sm font-700 w-4 text-center" style={{ color: 'var(--color-text)' }}>
            {item.quantidade}
          </span>
          <button
            onClick={() => onUpdateQuantity(item.cart_item_id, item.quantidade + 1)}
            aria-label="Aumentar"
            className="w-7 h-7 rounded-full flex items-center justify-center text-sm font-700 hover:opacity-85 transition-opacity"
            style={{ backgroundColor: 'var(--color-primary)', color: '#0D0D0D' }}
          >
            +
          </button>
        </div>
      </div>
    </div>
  );
}

function EmptyCart() {
  return (
    <div className="flex flex-col items-center py-10 gap-2">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-10 h-10 opacity-20" style={{ color: 'var(--color-text-secondary)' }}>
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-1.5 5h11M9 19a1 1 0 100 2 1 1 0 000-2zm8 0a1 1 0 100 2 1 1 0 000-2z" />
      </svg>
      <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>Seu carrinho está vazio</p>
    </div>
  );
}

function CartFooter({ total, onFinalize }: { total: number; onFinalize: () => void }) {
  return (
    <div className="px-4 pb-6 pt-3" style={{ borderTop: '1px solid var(--color-border)' }}>
      <div className="flex justify-between items-center mb-3">
        <span className="font-600" style={{ color: 'var(--color-text-secondary)' }}>Total</span>
        <span className="font-700 text-lg" style={{ color: 'var(--color-text)' }}>{formatCurrency(total)}</span>
      </div>
      <button
        onClick={onFinalize}
        className="w-full py-3.5 rounded-xl font-700 text-sm flex items-center justify-center gap-2 hover:opacity-90 active:scale-[0.98] transition-all"
        style={{
          backgroundColor: 'var(--color-whatsapp)',
          color: '#fff',
          boxShadow: '0 4px 16px rgb(37 211 102 / 0.3)',
        }}
      >
        <WhatsAppIcon />
        Finalizar pelo WhatsApp
      </button>
    </div>
  );
}

/** Sidebar — desktop */
export function CartSidebar({
  items, total, onUpdateQuantity, onRemove, onFinalize,
}: Omit<CartDrawerProps, 'open' | 'onClose'>) {
  return (
    <aside
      className="hidden md:flex w-80 flex-shrink-0 flex-col rounded-2xl h-fit sticky top-4"
      style={{
        backgroundColor: 'var(--color-surface)',
        border: '1px solid var(--color-border)',
        boxShadow: 'var(--shadow-sm)',
      }}
    >
      <div className="p-4" style={{ borderBottom: '1px solid var(--color-border)' }}>
        <h2 className="font-700 text-base" style={{ color: 'var(--color-text)' }}>Seu pedido</h2>
      </div>

      {items.length === 0 ? (
        <EmptyCart />
      ) : (
        <>
          <div className="flex-1 overflow-y-auto px-4 max-h-[60vh]">
            {items.map((item) => (
              <CartItemRow key={item.cart_item_id} item={item} onUpdateQuantity={onUpdateQuantity} onRemove={onRemove} />
            ))}
          </div>
          <CartFooter total={total} onFinalize={onFinalize} />
        </>
      )}
    </aside>
  );
}

/** Bottom sheet — mobile */
export function CartDrawer({
  items, total, open, onClose, onUpdateQuantity, onRemove, onFinalize,
}: CartDrawerProps) {
  const handleFinalize = () => { onFinalize(); onClose(); };

  return (
    <BottomSheet open={open} onClose={onClose} title="Seu pedido">
      <div className="px-4">
        {items.length === 0 ? (
          <EmptyCart />
        ) : (
          items.map((item) => (
            <CartItemRow key={item.cart_item_id} item={item} onUpdateQuantity={onUpdateQuantity} onRemove={onRemove} />
          ))
        )}
      </div>
      {items.length > 0 && <CartFooter total={total} onFinalize={handleFinalize} />}
    </BottomSheet>
  );
}

function WhatsAppIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.886 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  );
}
