import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { lazy, Suspense } from 'react';

const CatalogPage = lazy(() => import('@/pages/CatalogPage'));
const AdminPage   = lazy(() => import('@/pages/AdminPage'));
const NotFound    = lazy(() => import('@/pages/NotFound'));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      staleTime: 5 * 60 * 1000,
    },
    mutations: {
      retry: 0, // Não faz retry em mutações para evitar duplicação
    },
  },
});

function PageLoader() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div
        className="w-10 h-10 border-4 border-gray-200 rounded-full animate-spin"
        style={{ borderTopColor: 'var(--color-primary)' }}
      />
    </div>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Suspense fallback={<PageLoader />}>
          <Routes>
            <Route path="/:slug" element={<CatalogPage />} />
            <Route path="/:slug/admin" element={<AdminPage />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </QueryClientProvider>
  );
}
