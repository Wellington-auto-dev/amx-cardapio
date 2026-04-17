import { useQuery } from '@tanstack/react-query';
import { fetchCardapio } from '@/services/api';
import type { Merchant } from '@/types/catalog';

export function useCatalog(slug: string) {
  return useQuery<Merchant, Error>({
    queryKey: ['catalog', slug],
    queryFn: () => fetchCardapio(slug),
    staleTime: 5 * 60 * 1000, // 5 minutos
    retry: 2,
    enabled: !!slug,
  });
}
