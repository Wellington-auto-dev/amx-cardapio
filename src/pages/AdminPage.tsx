import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useAdmin } from '@/hooks/useAdmin';
import { useToast } from '@/hooks/useToast';
import { useCatalog } from '@/hooks/useCatalog';
import { TokenGuard } from '@/components/admin/TokenGuard';
import { StoreSettings } from '@/components/admin/StoreSettings';
import { Dashboard } from '@/components/admin/Dashboard';
import { ImportCard } from '@/components/admin/ImportCard';
import { ItemList } from '@/components/admin/ItemList';
import { ManualItemForm } from '@/components/admin/ManualItemForm';
import { ToastContainer } from '@/components/ui/Toast';

// ─── Nav items ─────────────────────────────────────────────────────────────

const NAV_ITEMS = [
  {
    label: 'Dashboard',
    icon: (
      <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 flex-shrink-0">
        <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
      </svg>
    ),
  },
  {
    label: 'Importar',
    icon: (
      <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 flex-shrink-0">
        <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM6.293 6.707a1 1 0 010-1.414l3-3a1 1 0 011.414 0l3 3a1 1 0 01-1.414 1.414L11 5.414V13a1 1 0 11-2 0V5.414L7.707 6.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
      </svg>
    ),
  },
  {
    label: 'Meu Cardápio',
    icon: (
      <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 flex-shrink-0">
        <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
        <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" />
      </svg>
    ),
  },
  {
    label: 'Adicionar Item',
    icon: (
      <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 flex-shrink-0">
        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clipRule="evenodd" />
      </svg>
    ),
  },
] as const;

// ─── Sidebar Nav ───────────────────────────────────────────────────────────

function SidebarNav({
  activeTab,
  onChange,
  nomeLoja,
  logoUrl,
  logoInitial,
}: {
  activeTab: number;
  onChange: (i: number) => void;
  nomeLoja: string;
  logoUrl: string;
  logoInitial: string;
}) {
  return (
    <>
      <div className="p-4 pb-3" style={{ borderBottom: '1px solid var(--color-border)' }}>
        <div className="flex items-center gap-3">
          {logoUrl ? (
            <img
              src={logoUrl}
              alt={nomeLoja}
              className="w-9 h-9 rounded-full object-cover flex-shrink-0"
              style={{ border: '1px solid var(--color-border)' }}
            />
          ) : (
            <div
              className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-700 flex-shrink-0"
              style={{ backgroundColor: 'var(--color-primary)', color: '#0D0D0D' }}
            >
              {logoInitial}
            </div>
          )}
          <div className="min-w-0">
            <p className="text-sm font-700 truncate" style={{ color: 'var(--color-text)' }}>
              {nomeLoja || 'Minha Loja'}
            </p>
            <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>Painel de Gestão</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-3 space-y-0.5">
        {NAV_ITEMS.map((item, i) => (
          <button
            key={item.label}
            onClick={() => onChange(i)}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all"
            style={{
              backgroundColor: activeTab === i ? 'rgb(245 166 35 / 0.12)' : 'transparent',
              color: activeTab === i ? 'var(--color-primary)' : 'var(--color-text-secondary)',
              fontWeight: activeTab === i ? 700 : 500,
              border: 'none',
              cursor: 'pointer',
              textAlign: 'left',
            }}
          >
            <span style={{ color: activeTab === i ? 'var(--color-primary)' : 'var(--color-text-muted)' }}>
              {item.icon}
            </span>
            {item.label}
            {activeTab === i && (
              <div
                className="ml-auto w-1 h-4 rounded-full flex-shrink-0"
                style={{ backgroundColor: 'var(--color-primary)' }}
              />
            )}
          </button>
        ))}
      </nav>
    </>
  );
}

// ─── Page ──────────────────────────────────────────────────────────────────

export default function AdminPage() {
  const { slug = '' } = useParams<{ slug: string }>();
  const { authState, session } = useAdmin(slug);
  const { data: merchant, refetch } = useCatalog(slug);
  const { toasts, addToast, removeToast } = useToast();

  const [activeTab, setActiveTab] = useState(0);
  const [logoUrl, setLogoUrl] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const currentLogo = logoUrl || merchant?.logo_url || '';
  const nomeLoja = merchant?.nome_loja ?? '';
  const categorias = merchant?.categorias ?? [];
  const categoriasExistentes = categorias.map((c) => c.nome);

  const toast = (type: 'success' | 'error', title: string, msg?: string) => addToast(type, title, msg);
  const handleRefresh = () => { refetch(); };
  const logoInitial = nomeLoja.charAt(0).toUpperCase();

  const handleTabChange = (i: number) => {
    setActiveTab(i);
    setSidebarOpen(false);
  };

  return (
    <TokenGuard state={authState}>
      <div className="min-h-screen flex" style={{ backgroundColor: 'var(--color-background)' }}>

        {/* Mobile overlay sidebar */}
        {sidebarOpen && (
          <div className="fixed inset-0 z-40 md:hidden">
            <div
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => setSidebarOpen(false)}
            />
            <aside
              className="absolute left-0 top-0 bottom-0 w-64 flex flex-col"
              style={{ backgroundColor: 'var(--color-surface)', borderRight: '1px solid var(--color-border)' }}
            >
              <SidebarNav
                activeTab={activeTab}
                onChange={handleTabChange}
                nomeLoja={nomeLoja}
                logoUrl={currentLogo}
                logoInitial={logoInitial}
              />
            </aside>
          </div>
        )}

        {/* Desktop sidebar */}
        <aside
          className="hidden md:flex flex-col w-56 flex-shrink-0 sticky top-0 h-screen"
          style={{ backgroundColor: 'var(--color-surface)', borderRight: '1px solid var(--color-border)' }}
        >
          <SidebarNav
            activeTab={activeTab}
            onChange={handleTabChange}
            nomeLoja={nomeLoja}
            logoUrl={currentLogo}
            logoInitial={logoInitial}
          />
        </aside>

        {/* Main area */}
        <div className="flex-1 min-w-0 flex flex-col">

          {/* Mobile header */}
          <header
            className="md:hidden sticky top-0 z-20 flex items-center gap-3 px-4 py-3"
            style={{
              backgroundColor: 'var(--color-surface)',
              borderBottom: '1px solid var(--color-border)',
            }}
          >
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-1.5 rounded-lg transition-opacity hover:opacity-70"
              style={{ color: 'var(--color-text)', backgroundColor: 'transparent', border: 'none', cursor: 'pointer' }}
              aria-label="Abrir menu"
            >
              <svg viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
                <path fillRule="evenodd" d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 15a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
              </svg>
            </button>
            {currentLogo ? (
              <img
                src={currentLogo}
                alt={nomeLoja}
                className="w-7 h-7 rounded-full object-cover flex-shrink-0"
                style={{ border: '1px solid var(--color-border)' }}
              />
            ) : (
              <div
                className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-700 flex-shrink-0"
                style={{ backgroundColor: 'var(--color-primary)', color: '#0D0D0D' }}
              >
                {logoInitial}
              </div>
            )}
            <p className="text-sm font-700 truncate flex-1" style={{ color: 'var(--color-text)' }}>
              {nomeLoja || 'Minha Loja'}
            </p>
            <span className="text-xs font-500 flex-shrink-0" style={{ color: 'var(--color-text-muted)' }}>
              {NAV_ITEMS[activeTab].label}
            </span>
          </header>

          {/* Page content */}
          <main className="flex-1 max-w-4xl w-full mx-auto px-4 py-5 space-y-4">

            {session && (
              <StoreSettings
                session={session}
                nomeLoja={nomeLoja}
                logoUrl={currentLogo}
                onLogoUpdated={(url) => { setLogoUrl(url); handleRefresh(); }}
                onToast={toast}
              />
            )}

            <div
              className="rounded-2xl overflow-hidden"
              style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)' }}
            >
              {/* Section header */}
              <div
                className="px-4 py-3 flex items-center gap-2"
                style={{ borderBottom: '1px solid var(--color-border)', backgroundColor: 'var(--color-surface-2)' }}
              >
                <span style={{ color: 'var(--color-primary)' }}>{NAV_ITEMS[activeTab].icon}</span>
                <h2 className="text-sm font-700" style={{ color: 'var(--color-text)' }}>
                  {NAV_ITEMS[activeTab].label}
                </h2>
              </div>

              <div className="p-4">
                {activeTab === 0 && session && (
                  <Dashboard session={session} nomeLoja={nomeLoja} slug={slug} />
                )}

                {activeTab === 1 && session && (
                  <ImportCard
                    session={session}
                    onSuccess={handleRefresh}
                    onTabChange={(tab) => setActiveTab(tab + 1)}
                    onToast={toast}
                  />
                )}

                {activeTab === 2 && (
                  <div className="space-y-4">
                    <div className="flex justify-end">
                      <button
                        onClick={handleRefresh}
                        className="flex items-center gap-1.5 text-sm font-600 transition-opacity hover:opacity-70"
                        style={{ color: 'var(--color-text-secondary)', backgroundColor: 'transparent', border: 'none', cursor: 'pointer' }}
                      >
                        <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                          <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
                        </svg>
                        Atualizar
                      </button>
                    </div>
                    {session && (
                      <ItemList
                        categorias={categorias}
                        session={session}
                        onRefresh={handleRefresh}
                        onAddFirst={() => setActiveTab(3)}
                        onToast={toast}
                      />
                    )}
                  </div>
                )}

                {activeTab === 3 && session && (
                  <ManualItemForm
                    session={session}
                    categoriasExistentes={categoriasExistentes}
                    onSuccess={() => { handleRefresh(); setActiveTab(2); }}
                    onToast={toast}
                  />
                )}
              </div>
            </div>
          </main>
        </div>

        <ToastContainer toasts={toasts} onClose={removeToast} />
      </div>
    </TokenGuard>
  );
}
