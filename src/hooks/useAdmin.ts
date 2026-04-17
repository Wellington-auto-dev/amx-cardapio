import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { validarToken } from '@/services/api';
import type { AdminSession } from '@/types/admin';

type AuthState = 'loading' | 'authorized' | 'unauthorized';

export function useAdmin(merchantSlug: string) {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') ?? '';

  const [authState, setAuthState] = useState<AuthState>('loading');
  const [session, setSession] = useState<AdminSession | null>(null);

  useEffect(() => {
    if (!token || !merchantSlug) {
      setAuthState('unauthorized');
      return;
    }

    let cancelled = false;

    validarToken(merchantSlug, token)
      .then((res) => {
        if (cancelled) return;
        if (res.valido) {
          setSession({ merchant_id: res.merchant_id, merchant_slug: merchantSlug, token });
          setAuthState('authorized');
        } else {
          setAuthState('unauthorized');
        }
      })
      .catch(() => {
        if (!cancelled) setAuthState('unauthorized');
      });

    return () => { cancelled = true; };
  }, [merchantSlug, token]);

  return { authState, session };
}
