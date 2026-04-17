import { useRef, useEffect } from 'react';

interface CategoryTabsProps {
  categorias: string[];
  active: string;
  onChange: (cat: string) => void;
}

export function CategoryTabs({ categorias, active, onChange }: CategoryTabsProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const activeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (activeRef.current && containerRef.current) {
      activeRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
        inline: 'center',
      });
    }
  }, [active]);

  return (
    <div
      ref={containerRef}
      className="flex gap-2 px-4 py-3 overflow-x-auto scrollbar-hide"
      style={{ backgroundColor: 'var(--color-background)' }}
      role="tablist"
      aria-label="Categorias do cardápio"
    >
      {categorias.map((cat) => {
        const isActive = cat === active;
        return (
          <button
            key={cat}
            ref={isActive ? activeRef : undefined}
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange(cat)}
            className="flex-shrink-0 px-4 py-2 rounded-full text-sm transition-all duration-200 whitespace-nowrap focus:outline-none"
            style={
              isActive
                ? {
                    backgroundColor: 'var(--color-primary)',
                    color: '#0D0D0D',
                    fontWeight: 700,
                    boxShadow: '0 0 14px rgb(245 166 35 / 0.35)',
                  }
                : {
                    backgroundColor: 'var(--color-surface)',
                    color: 'var(--color-text-secondary)',
                    fontWeight: 500,
                    border: '1px solid var(--color-border)',
                  }
            }
          >
            {cat}
          </button>
        );
      })}
    </div>
  );
}
