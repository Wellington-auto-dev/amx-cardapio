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

const TABS = ['Dashboard', 'Importar', 'Meu Cardápio', 'Adicionar Item'] as const;

export default function AdminPage() {
  const { slug = '' } = useParams<{ slug: string }>();
  const { authState, session } = useAdmin(slug);
  const { data: merchant, refetch } = useCatalog(slug);
  const { toasts, addToast, removeToast } = useToast();

  const [activeTab, setActiveTab] = useState(0);
  const [logoUrl, setLogoUrl] = useState('');

  const currentLogo = logoUrl || merchant?.logo_url || '';
  const nomeLoja = merchant?.nome_loja ?? '';
  const categorias = merchant?.categorias ?? [];
  const categoriasExistentes = categorias.map((c) => c.nome);

  const toast = (type: 'success' | 'error', title: string, msg?: string) => addToast(type, title, msg);
  const handleRefresh = () => { refetch(); };
  const logoInitial = nomeLoja.charAt(0).toUpperCase();

  return (
    <TokenGuard state={authState}>
      <div className="min-h-screen" style={{ backgroundColor: 'var(--color-background)' }}>

        {/* Header */}
        <header
          className="sticky top-0 z-20"
          style={{
            backgroundColor: 'var(--color-surface)',
            borderBottom: '1px solid var(--color-border)',
          }}
        >
          <div className="max-w-4xl mx-auto px-4 py-3 flex items-center gap-3">
            {currentLogo ? (
              <img
                src={currentLogo}
                alt={nomeLoja}
                className="w-10 h-10 rounded-full object-cover flex-shrink-0"
                style={{ border: '1px solid var(--color-border)' }}
              />
            ) : (
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center text-base font-700 flex-shrink-0"
                style={{ backgroundColor: 'var(--color-primary)', color: '#0D0D0D' }}
              >
                {logoInitial}
              </div>
            )}
            <div className="min-w-0">
              <h1 className="font-700 text-sm truncate" style={{ color: 'var(--color-text)' }}>
                {nomeLoja || 'Minha Loja'}
              </h1>
              <span className="text-xs font-500" style={{ color: 'var(--color-text-muted)' }}>Painel de Gestão</span>
            </div>
          </div>
        </header>

        <main className="max-w-4xl mx-auto px-4 py-5 space-y-4">
          {/* Configurações */}
          {session && (
            <StoreSettings
              session={session}
              nomeLoja={nomeLoja}
              logoUrl={currentLogo}
              onLogoUpdated={(url) => { setLogoUrl(url); handleRefresh(); }}
              onToast={toast}
            />
          )}

          {/* Tabs */}
          <div
            className="rounded-2xl overflow-hidden"
            style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)' }}
          >
            {/* Tab bar */}
            <div className="flex" style={{ borderBottom: '1px solid var(--color-border)' }}>
              {TABS.map((tab, i) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(i)}
                  className="flex-1 py-3.5 text-sm font-600 transition-colors relative"
                  style={{
                    color: activeTab === i ? 'var(--color-text)' : 'var(--color-text-secondary)',
                    backgroundColor: 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                  }}
                >
                  {tab}
                  {activeTab === i && (
                    <div
                      className="absolute bottom-0 left-3 right-3 h-0.5 rounded-full"
                      style={{ backgroundColor: 'var(--color-primary)' }}
                    />
                  )}
                </button>
              ))}
            </div>

            {/* Conteúdo */}
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
                      style={{ color: 'var(--color-text-secondary)', backgroundColor: 'transparent', border: 'none' }}
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

        <ToastContainer toasts={toasts} onClose={removeToast} />
      </div>
    </TokenGuard>
  );
}
