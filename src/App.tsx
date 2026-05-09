import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { lazy, Suspense } from 'react';
import { SignedIn, SignedOut } from '@clerk/clerk-react';

const CatalogPage   = lazy(() => import('@/pages/CatalogPage'));
const AdminPage     = lazy(() => import('@/pages/AdminPage'));
const OperadorPage  = lazy(() => import('@/pages/OperadorPage'));
const LoginPage     = lazy(() => import('@/pages/LoginPage'));
const NotFound      = lazy(() => import('@/pages/NotFound'));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      staleTime: 5 * 60 * 1000,
    },
    mutations: {
      retry: 0,
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
            <Route path="/operador/login" element={<LoginPage />} />
            <Route
              path="/operador"
              element={
                <>
                  <SignedIn>
                    <OperadorPage />
                  </SignedIn>
                  <SignedOut>
                    <Navigate to="/operador/login" replace />
                  </SignedOut>
                </>
              }
            />
            <Route path="/:slug" element={<CatalogPage />} />
            <Route path="/:slug/admin" element={<AdminPage />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </QueryClientProvider>
  );
}
