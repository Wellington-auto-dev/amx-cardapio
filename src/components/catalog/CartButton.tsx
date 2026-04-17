import { formatCurrency } from '@/utils/formatCurrency';

interface CartButtonProps {
  totalItems: number;
  total: number;
  onClick: () => void;
}

export function CartButton({ totalItems, total, onClick }: CartButtonProps) {
  if (totalItems === 0) return null;

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 md:hidden">
      <button
        onClick={onClick}
        className="flex items-center gap-3 px-5 py-3.5 rounded-full font-600 text-sm hover:opacity-90 active:scale-[0.97] transition-all whitespace-nowrap animate-pulse-glow"
        style={{
          backgroundColor: 'var(--color-primary)',
          color: '#0D0D0D',
          boxShadow: '0 8px 24px rgb(245 166 35 / 0.45)',
        }}
        aria-label={`Ver carrinho com ${totalItems} itens`}
      >
        <span
          className="rounded-full w-6 h-6 flex items-center justify-center text-xs font-700"
          style={{ backgroundColor: 'rgba(0,0,0,0.2)' }}
        >
          {totalItems}
        </span>
        Ver carrinho
        <span className="font-700">{formatCurrency(total)}</span>
      </button>
    </div>
  );
}
