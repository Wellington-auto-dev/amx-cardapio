import { useState, useRef, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { useCatalog } from '@/hooks/useCatalog';
import { useCart } from '@/hooks/useCart';
import { useToast } from '@/hooks/useToast';
import { CategoryTabs } from '@/components/catalog/CategoryTabs';
import { ItemCard } from '@/components/catalog/ItemCard';
import { ItemModal } from '@/components/catalog/ItemModal';
import { CartButton } from '@/components/catalog/CartButton';
import { CartDrawer, CartSidebar } from '@/components/catalog/CartDrawer';
import { ToastContainer } from '@/components/ui/Toast';
import { ItemCardSkeleton, HeaderSkeleton, TabsSkeleton } from '@/components/ui/Skeleton';
import { abrirWhatsApp } from '@/services/whatsapp';
import type { Item } from '@/types/catalog';
import type { OpcaoSelecionada } from '@/types/cart';

// ─── Desktop category sidebar ──────────────────────────────────────────────

function CategorySidebar({
  categorias,
  active,
  onChange,
}: {
  categorias: string[];
  active: string;
  onChange: (cat: string) => void;
}) {
  return (
    <aside className="hidden md:block w-44 flex-shrink-0">
      <nav className="sticky top-36 space-y-0.5">
        <p
          className="text-[10px] font-700 uppercase tracking-widest px-3 pb-2"
          style={{ color: 'var(--color-text-muted)' }}
        >
          Categorias
        </p>
        {categorias.map((cat) => {
          const isActive = active === cat;
          return (
            <button
              key={cat}
              onClick={() => onChange(cat)}
              className="w-full text-left px-3 py-2 rounded-xl text-sm transition-all"
              style={{
                backgroundColor: isActive ? 'rgb(245 166 35 / 0.12)' : 'transparent',
                color: isActive ? 'var(--color-primary)' : 'var(--color-text-secondary)',
                fontWeight: isActive ? 700 : 500,
                border: 'none',
                cursor: 'pointer',
              }}
            >
              {isActive && (
                <span
                  className="inline-block w-1 h-1 rounded-full mr-2 align-middle"
                  style={{ backgroundColor: 'var(--color-primary)' }}
                />
              )}
              {cat}
            </button>
          );
        })}
      </nav>
    </aside>
  );
}

// ─── Page ──────────────────────────────────────────────────────────────────

export default function CatalogPage() {
  const { slug = '' } = useParams<{ slug: string }>();
  const { data: merchant, isLoading, isError } = useCatalog(slug);
  const cart = useCart();
  const { toasts, addToast, removeToast } = useToast();

  const [activeCategory, setActiveCategory] = useState('');
  const [modalItem, setModalItem] = useState<Item | null>(null);
  const [cartOpen, setCartOpen] = useState(false);

  const sectionRefs = useRef<Record<string, HTMLElement>>({});
  const isScrolling = useRef(false);

  const categorias = merchant?.categorias ?? [];
  const categoriaNomes = categorias.map((c) => c.nome);

  useEffect(() => {
    if (categoriaNomes.length > 0 && !activeCategory) {
      setActiveCategory(categoriaNomes[0]);
    }
  }, [categoriaNomes, activeCategory]);

  const handleTabChange = (cat: string) => {
    setActiveCategory(cat);
    const el = sectionRefs.current[cat];
    if (el) {
      isScrolling.current = true;
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      setTimeout(() => { isScrolling.current = false; }, 800);
    }
  };

  useEffect(() => {
    if (categoriaNomes.length === 0) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (isScrolling.current) return;
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const cat = entry.target.getAttribute('data-category');
            if (cat) setActiveCategory(cat);
          }
        });
      },
      { rootMargin: '-40% 0px -55% 0px' },
    );
    Object.values(sectionRefs.current).forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [categoriaNomes]);

  const categoriaPorItemId = useCallback((): Record<string, string> => {
    const map: Record<string, string> = {};
    categorias.forEach((cat) => {
      cat.itens.forEach((item) => { map[item.id] = cat.nome; });
    });
    return map;
  }, [categorias]);

  const handleAddToCart = (item: Item, quantidade: number, opcoes: OpcaoSelecionada[]) => {
    const cat = categoriaPorItemId()[item.id] ?? '';
    cart.addItem(item, quantidade, opcoes, cat);
    addToast('success', `${item.nome} adicionado!`);
  };

  const handleFinalize = () => {
    if (!merchant) return;
    abrirWhatsApp(merchant.whatsapp_numero, cart.items, cart.total);
    cart.clearCart();
  };

  if (isError) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4" style={{ backgroundColor: 'var(--color-background)' }}>
        <div className="text-center">
          <p className="text-5xl mb-4">😔</p>
          <h1 className="text-xl font-700 mb-2" style={{ color: 'var(--color-text)' }}>Loja não encontrada</h1>
          <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
            O cardápio que você está procurando não existe ou está temporariamente indisponível.
          </p>
        </div>
      </div>
    );
  }

  const logoInitial = merchant?.nome_loja.charAt(0).toUpperCase() ?? '';

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--color-background)' }}>

      {/* Header sticky */}
      <header
        className="sticky top-0 z-30"
        style={{
          backgroundColor: 'var(--color-surface)',
          borderBottom: '1px solid var(--color-border)',
        }}
      >
        {isLoading ? (
          <HeaderSkeleton />
        ) : (
          <div className="flex flex-col items-center px-4 pt-5 pb-3 gap-2">
            {merchant?.logo_url ? (
              <div
                className="rounded-full overflow-hidden"
                style={{
                  width: 72, height: 72,
                  border: '2px solid var(--color-border)',
                  boxShadow: '0 0 16px rgb(245 166 35 / 0.2)',
                }}
              >
                <img
                  src={merchant.logo_url}
                  alt={`Logo ${merchant.nome_loja}`}
                  className="w-full h-full object-cover"
                />
              </div>
            ) : (
              <div
                className="w-[72px] h-[72px] rounded-full flex items-center justify-center text-2xl font-700"
                style={{
                  backgroundColor: 'var(--color-primary)',
                  color: '#0D0D0D',
                  boxShadow: '0 0 16px rgb(245 166 35 / 0.3)',
                }}
              >
                {logoInitial}
              </div>
            )}
            <h1 className="text-base font-700" style={{ color: 'var(--color-text)' }}>
              {merchant?.nome_loja}
            </h1>
          </div>
        )}

        {/* Tabs — mobile only */}
        <div className="md:hidden">
          {isLoading ? <TabsSkeleton /> : (
            <CategoryTabs
              categorias={categoriaNomes}
              active={activeCategory}
              onChange={handleTabChange}
            />
          )}
        </div>
      </header>

      {/* Layout */}
      <div className="max-w-6xl mx-auto flex gap-0 md:gap-5 p-0 md:p-4 md:pt-6">

        {/* Desktop category sidebar */}
        {!isLoading && categoriaNomes.length > 0 && (
          <CategorySidebar
            categorias={categoriaNomes}
            active={activeCategory}
            onChange={handleTabChange}
          />
        )}

        {/* Items */}
        <main className="flex-1 min-w-0 p-4 md:p-0 space-y-8 pb-28 md:pb-8">
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3, 4].map((i) => <ItemCardSkeleton key={i} />)}
            </div>
          ) : (
            categorias.map((cat) => (
              <section
                key={cat.nome}
                ref={(el) => { if (el) sectionRefs.current[cat.nome] = el; }}
                data-category={cat.nome}
                aria-label={cat.nome}
              >
                <div className="flex items-center gap-3 mb-3">
                  <h2 className="text-base font-700" style={{ color: 'var(--color-text)' }}>
                    {cat.nome}
                  </h2>
                  <div className="flex-1 h-px" style={{ backgroundColor: 'var(--color-border)' }} />
                  <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
                    {cat.itens.length} {cat.itens.length === 1 ? 'item' : 'itens'}
                  </span>
                </div>
                <div className="space-y-3">
                  {cat.itens.map((item) => (
                    <ItemCard key={item.id} item={item} onAdd={setModalItem} />
                  ))}
                </div>
              </section>
            ))
          )}
        </main>

        {/* Cart sidebar desktop */}
        <CartSidebar
          items={cart.items}
          total={cart.total}
          onUpdateQuantity={cart.updateQuantity}
          onRemove={cart.removeItem}
          onFinalize={handleFinalize}
        />
      </div>

      {/* Mobile floating button */}
      <CartButton
        totalItems={cart.totalItems}
        total={cart.total}
        onClick={() => setCartOpen(true)}
      />

      {/* Mobile bottom sheet */}
      <CartDrawer
        items={cart.items}
        total={cart.total}
        open={cartOpen}
        onClose={() => setCartOpen(false)}
        onUpdateQuantity={cart.updateQuantity}
        onRemove={cart.removeItem}
        onFinalize={handleFinalize}
      />

      <ItemModal
        item={modalItem}
        open={!!modalItem}
        onClose={() => setModalItem(null)}
        onAddToCart={handleAddToCart}
      />

      <ToastContainer toasts={toasts} onClose={removeToast} />
    </div>
  );
}
