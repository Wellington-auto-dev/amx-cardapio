import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { validarOperador } from '@/services/api';

type Operador = { id: string; nome: string; email: string };

type Loja = {
  merchant_id: string;
  nome: string;
  slug: string;
  logo_url: string | null;
  loja_aberta: boolean;
  cardapio_ativo: boolean;
  token_admin: string;
};

export function useOperador() {
  const [searchParams] = useSearchParams();
  const tokenMaster = searchParams.get('token_master') ?? '';

  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const [operador, setOperador] = useState<Operador | null>(null);
  const [lojas, setLojas] = useState<Loja[]>([]);

  useEffect(() => {
    if (!tokenMaster) {
      setIsError(true);
      setIsLoading(false);
      return;
    }

    let cancelled = false;

    validarOperador(tokenMaster)
      .then((res) => {
        if (cancelled) return;
        if (res.sucesso && res.operador) {
          setOperador(res.operador);
          setLojas(res.lojas ?? []);
        } else {
          setIsError(true);
        }
      })
      .catch(() => {
        if (!cancelled) setIsError(true);
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => { cancelled = true; };
  }, [tokenMaster]);

  return { operador, lojas, isLoading, isError };
}
