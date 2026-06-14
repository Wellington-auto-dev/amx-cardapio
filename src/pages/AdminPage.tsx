import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAdmin } from '@/hooks/useAdmin';
import { useToast } from '@/hooks/useToast';
import { useCatalog } from '@/hooks/useCatalog';
import { TokenGuard } from '@/components/admin/TokenGuard';
import { StoreSettings } from '@/components/admin/StoreSettings';
import { Configuracoes } from '@/components/admin/Configuracoes';
import { Dashboard } from '@/components/admin/Dashboard';
import { Carteira } from '@/components/admin/Carteira';
import { Chat } from '@/components/admin/Chat';
import { Pedidos } from '@/components/admin/Pedidos';
import { ImportCard } from '@/components/admin/ImportCard';
import { ItemList } from '@/components/admin/ItemList';
import { CategoriaList } from '@/components/admin/CategoriaList';
import { ManualItemForm } from '@/components/admin/ManualItemForm';
import { Promocoes } from '@/components/admin/Promocoes';
import { ToastContainer } from '@/components/ui/Toast';

// ─── Nav items ─────────────────────────────────────────────────────────────

const NAV_ITEMS = [
  {
    label: 'Dashboard',
    icon: (
      <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 shrink-0">
        <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
      </svg>
    ),
  },
  {
    label: 'Carteira',
    icon: (
      <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 shrink-0">
        <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
      </svg>
    ),
  },
  {
    label: 'Chat',
    icon: (
      <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 shrink-0">
        <path d="M2 5a2 2 0 012-2h7a2 2 0 012 2v4a2 2 0 01-2 2H9l-3 3v-3H4a2 2 0 01-2-2V5z" />
        <path d="M15 7v2a4 4 0 01-4 4H9.828l-1.766 1.767c.28.149.599.233.938.233h2l3 3v-3h2a2 2 0 002-2V9a2 2 0 00-2-2h-1z" />
      </svg>
    ),
  },
  {
    label: 'Pedidos',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-4 h-4 shrink-0">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
      </svg>
    ),
  },
  {
    label: 'Importar',
    icon: (
      <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 shrink-0">
        <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM6.293 6.707a1 1 0 010-1.414l3-3a1 1 0 011.414 0l3 3a1 1 0 01-1.414 1.414L11 5.414V13a1 1 0 11-2 0V5.414L7.707 6.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
      </svg>
    ),
  },
  {
    label: 'Meu Cardápio',
    icon: (
      <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 shrink-0">
        <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
        <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" />
      </svg>
    ),
  },
  {
    label: 'Adicionar Item',
    icon: (
      <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 shrink-0">
        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clipRule="evenodd" />
      </svg>
    ),
  },
  {
    label: 'Promocoes',
    icon: (
      <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 shrink-0">
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
      </svg>
    ),
  },
  {
    label: 'Configurações',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-4 h-4 shrink-0">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.065 2.571c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.572-1.065c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.571c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.065-2.572c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065zM15 12a3 3 0 11-6 0 3 3 0 016 0z" />
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
  collapsed = false,
  onVoltar,
}: {
  activeTab: number;
  onChange: (i: number) => void;
  nomeLoja: string;
  logoUrl: string;
  logoInitial: string;
  collapsed?: boolean;
  onVoltar?: () => void;
}) {
  const [hovered, setHovered] = useState<number | null>(null);

  return (
    <>
      {/* Header */}
      <div className="shrink-0 px-4 py-3" style={{ borderBottom: '1px solid var(--color-border)' }}>
        {collapsed ? (
          <div className="flex justify-center">
            {logoUrl ? (
              <img
                src={logoUrl}
                alt={nomeLoja}
                className="w-8 h-8 rounded-full object-cover"
                style={{ border: '1px solid var(--color-border)' }}
              />
            ) : (
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-700"
                style={{ backgroundColor: 'var(--color-primary)', color: '#0D0D0D' }}
              >
                {logoInitial}
              </div>
            )}
          </div>
        ) : (
          <div className="flex items-center gap-3">
            {logoUrl ? (
              <img
                src={logoUrl}
                alt={nomeLoja}
                className="w-9 h-9 rounded-full object-cover shrink-0"
                style={{ border: '1px solid var(--color-border)' }}
              />
            ) : (
              <div
                className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-700 shrink-0"
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
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
        {onVoltar && (
          <>
            <button
              onClick={onVoltar}
              className="w-full flex items-center rounded-xl text-sm transition-all"
              style={{
                justifyContent: collapsed ? 'center' : 'flex-start',
                padding: collapsed ? '10px 0' : '10px 12px',
                gap: collapsed ? 0 : 12,
                backgroundColor: 'transparent',
                color: 'var(--color-text-secondary)',
                fontWeight: 500,
                border: 'none',
                cursor: 'pointer',
                textAlign: 'left',
              }}
            >
              <span style={{ color: 'var(--color-text-muted)', flexShrink: 0 }}>
                <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                  <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
                </svg>
              </span>
              {!collapsed && 'Voltar ao Painel'}
            </button>
            <div style={{ height: '1px', margin: '2px 0 6px', backgroundColor: 'var(--color-border)' }} />
          </>
        )}
        {NAV_ITEMS.map((item, i) => (
          <div
            key={item.label}
            className="relative"
            onMouseEnter={() => setHovered(i)}
            onMouseLeave={() => setHovered(null)}
          >
            <button
              onClick={() => onChange(i)}
              className="w-full flex items-center rounded-xl text-sm transition-all"
              style={{
                justifyContent: collapsed ? 'center' : 'flex-start',
                padding: collapsed ? '10px 0' : '10px 12px',
                gap: collapsed ? 0 : 12,
                backgroundColor: activeTab === i ? 'rgb(245 166 35 / 0.12)' : 'transparent',
                color: activeTab === i ? 'var(--color-primary)' : 'var(--color-text-secondary)',
                fontWeight: activeTab === i ? 700 : 500,
                border: 'none',
                cursor: 'pointer',
                textAlign: 'left',
              }}
            >
              <span style={{ color: activeTab === i ? 'var(--color-primary)' : 'var(--color-text-muted)', flexShrink: 0 }}>
                {item.icon}
              </span>
              {!collapsed && item.label}
              {!collapsed && activeTab === i && (
                <div
                  className="ml-auto w-1 h-4 rounded-full shrink-0"
                  style={{ backgroundColor: 'var(--color-primary)' }}
                />
              )}
            </button>

            {/* Tooltip — desktop collapsed mode only */}
            {collapsed && (
              <div
                className="pointer-events-none absolute left-full top-1/2 -translate-y-1/2 ml-3 px-2.5 py-1.5 rounded-lg text-xs font-600 whitespace-nowrap transition-opacity duration-150"
                style={{
                  opacity: hovered === i ? 1 : 0,
                  backgroundColor: 'var(--color-surface-2)',
                  border: '1px solid var(--color-border)',
                  color: 'var(--color-text)',
                  zIndex: 100,
                  boxShadow: '0 4px 12px rgb(0 0 0 / 0.35)',
                }}
              >
                {item.label}
              </div>
            )}
          </div>
        ))}
      </nav>
    </>
  );
}

// ─── Page ──────────────────────────────────────────────────────────────────

export default function AdminPage() {
  const { slug = '' } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { authState, session } = useAdmin(slug);
  const { data: merchant, refetch } = useCatalog(slug);
  const { toasts, addToast, removeToast } = useToast();

  const [activeTab, setActiveTab] = useState(0);
  const [logoUrl, setLogoUrl] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [tema, setTema] = useState<'dark' | 'light'>(
    () => (localStorage.getItem('amx-tema') as 'dark' | 'light') || 'dark',
  );

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', tema);
    localStorage.setItem('amx-tema', tema);
  }, [tema]);

  const currentLogo = logoUrl || merchant?.logo_url || '';
  const nomeLoja = merchant?.nome_loja ?? '';
  const categorias = merchant?.categorias ?? [];
  const categoriasExistentes = categorias.map((c) => c.nome);

  const toast = (type: 'success' | 'error', title: string, msg?: string) => addToast(type, title, msg);
  const handleRefresh = () => { refetch(); };
  const logoInitial = (nomeLoja ?? '?').charAt(0).toUpperCase();

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
                onVoltar={() => navigate('/operador')}
              />
            </aside>
          </div>
        )}

        {/* Desktop sidebar */}
        <aside
          className="hidden md:flex flex-col shrink-0 sticky top-0 h-screen transition-all duration-300"
          style={{
            width: sidebarCollapsed ? 64 : 224,
            backgroundColor: 'var(--color-surface)',
            borderRight: '1px solid var(--color-border)',
            overflow: 'visible',
          }}
        >
          {/* Toggle button */}
          <div
            className="shrink-0 flex px-2 pt-2.5 pb-1"
            style={{ justifyContent: sidebarCollapsed ? 'center' : 'flex-end' }}
          >
            <button
              onClick={() => setSidebarCollapsed((c) => !c)}
              className="w-7 h-7 rounded-lg flex items-center justify-center transition-opacity hover:opacity-60"
              style={{
                backgroundColor: 'var(--color-surface-2)',
                border: '1px solid var(--color-border)',
                color: 'var(--color-text-muted)',
                cursor: 'pointer',
                flexShrink: 0,
              }}
              aria-label={sidebarCollapsed ? 'Expandir menu' : 'Recolher menu'}
            >
              <svg viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5">
                {sidebarCollapsed ? (
                  <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                ) : (
                  <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                )}
              </svg>
            </button>
          </div>

          <SidebarNav
            activeTab={activeTab}
            onChange={handleTabChange}
            nomeLoja={nomeLoja}
            logoUrl={currentLogo}
            logoInitial={logoInitial}
            collapsed={sidebarCollapsed}
            onVoltar={() => navigate('/operador')}
          />

          {/* Theme toggle footer */}
          <div
            className="shrink-0 flex items-center px-3 py-3"
            style={{
              borderTop: '1px solid var(--color-border)',
              justifyContent: sidebarCollapsed ? 'center' : 'flex-start',
              gap: sidebarCollapsed ? 0 : 10,
            }}
          >
            <button
              onClick={() => setTema((t) => (t === 'dark' ? 'light' : 'dark'))}
              className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-opacity hover:opacity-60"
              style={{
                backgroundColor: 'var(--color-surface-2)',
                border: '1px solid var(--color-border)',
                color: 'var(--color-text-muted)',
                cursor: 'pointer',
              }}
              aria-label={tema === 'dark' ? 'Tema claro' : 'Tema escuro'}
            >
              {tema === 'dark' ? (
                <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                  <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" />
                </svg>
              ) : (
                <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                  <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
                </svg>
              )}
            </button>
            {!sidebarCollapsed && (
              <span className="text-xs font-500" style={{ color: 'var(--color-text-muted)' }}>
                {tema === 'dark' ? 'Tema Claro' : 'Tema Escuro'}
              </span>
            )}
          </div>
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
                className="w-7 h-7 rounded-full object-cover shrink-0"
                style={{ border: '1px solid var(--color-border)' }}
              />
            ) : (
              <div
                className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-700 shrink-0"
                style={{ backgroundColor: 'var(--color-primary)', color: '#0D0D0D' }}
              >
                {logoInitial}
              </div>
            )}
            <p className="text-sm font-700 truncate flex-1" style={{ color: 'var(--color-text)' }}>
              {nomeLoja || 'Minha Loja'}
            </p>
            <span className="text-xs font-500 shrink-0" style={{ color: 'var(--color-text-muted)' }}>
              {NAV_ITEMS[activeTab].label}
            </span>
            <button
              onClick={() => setTema((t) => (t === 'dark' ? 'light' : 'dark'))}
              className="p-1.5 rounded-lg shrink-0 transition-opacity hover:opacity-70"
              style={{ color: 'var(--color-text-muted)', backgroundColor: 'transparent', border: 'none', cursor: 'pointer' }}
              aria-label={tema === 'dark' ? 'Tema claro' : 'Tema escuro'}
            >
              {tema === 'dark' ? (
                <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                  <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" />
                </svg>
              ) : (
                <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                  <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
                </svg>
              )}
            </button>
          </header>

          {/* Page content */}
          <main className="flex-1 w-full px-6 py-5 space-y-4">

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
                  <Carteira session={session} />
                )}

                {activeTab === 2 && session && (
                  <Chat session={session} />
                )}

                {activeTab === 3 && session && (
                  <Pedidos session={session} />
                )}

                {activeTab === 4 && session && (
                  <ImportCard
                    session={session}
                    onSuccess={handleRefresh}
                    onTabChange={(tab) => setActiveTab(tab + 4)}
                    onToast={toast}
                  />
                )}

                {/* Tab 5 — Meu Cardápio: mantido montado para preservar estado local de disponibilidade */}
                <div style={{ display: activeTab === 5 ? undefined : 'none' }}>
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

                    {session && categorias.length > 0 && (
                      <div>
                        <p className="text-xs font-700 uppercase tracking-widest mb-2" style={{ color: 'var(--color-text-muted)' }}>
                          Ordem das Categorias
                        </p>
                        <CategoriaList
                          categorias={categorias}
                          session={session}
                          onToast={toast}
                        />
                      </div>
                    )}

                    <div style={{ borderTop: '1px solid var(--color-border)' }} />

                    {session && (
                      <ItemList
                        categorias={categorias}
                        session={session}
                        onRefresh={handleRefresh}
                        onAddFirst={() => setActiveTab(6)}
                        onToast={toast}
                      />
                    )}
                  </div>
                </div>

                {activeTab === 6 && session && (
                  <ManualItemForm
                    session={session}
                    categoriasExistentes={categoriasExistentes}
                    onSuccess={() => { handleRefresh(); setActiveTab(5); }}
                    onToast={toast}
                  />
                )}

                {activeTab === 7 && session && (
                  <Promocoes session={session} />
                )}

                {activeTab === 8 && session && (
                  <div className="space-y-4">
                    <StoreSettings
                      session={session}
                      nomeLoja={nomeLoja}
                      logoUrl={currentLogo}
                      onLogoUpdated={(url) => { setLogoUrl(url); handleRefresh(); }}
                      onToast={toast}
                    />
                    {merchant ? (
                      <Configuracoes
                        key={merchant.merchant_id}
                        session={session}
                        slug={slug}
                        lojaAberta={merchant.loja_aberta}
                        mensagemFechado={merchant.mensagem_fechado}
                        horarios={merchant.horarios}
                        taxaEntregaTipo={merchant.taxa_entrega_tipo}
                        taxaEntregaValor={merchant.taxa_entrega_valor}
                        pedidoMinimo={merchant.pedido_minimo}
                        lat={merchant.lat}
                        lng={merchant.lng}
                        stripeAtivo={merchant.stripe_ativo}
                        stripePublicKey={merchant.stripe_public_key}
                        pagamentoNaEntrega={merchant.pagamento_na_entrega}
                        onToast={toast}
                      />
                    ) : (
                      <div
                        style={{
                          backgroundColor: 'var(--color-surface)',
                          border: '1px solid var(--color-border)',
                          borderRadius: 16,
                          padding: 20,
                        }}
                      >
                        <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
                          Carregando configuracoes...
                        </p>
                      </div>
                    )}
                  </div>
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
