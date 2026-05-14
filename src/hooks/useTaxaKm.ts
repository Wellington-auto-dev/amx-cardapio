import { useState, useEffect } from 'react';
import type { Merchant, EnderecoCliente } from '@/types/catalog';
import { calcularDistanciaKm } from '@/services/googleMaps';
import { toMoney } from '@/utils/formatCurrency';

interface UseTaxaKmResult {
  taxaCalculada: number | null;
  distanciaKm: number | null;
  calculando: boolean;
}

export function useTaxaKm(
  merchant: Merchant | null | undefined,
  endereco: EnderecoCliente | null | undefined,
): UseTaxaKmResult {
  const [taxaCalculada, setTaxaCalculada] = useState<number | null>(null);
  const [distanciaKm, setDistanciaKm] = useState<number | null>(null);
  const [calculando, setCalculando] = useState(false);

  const isKm = merchant?.taxa_entrega_tipo === 'km';
  const lat = merchant?.lat ?? null;
  const lng = merchant?.lng ?? null;
  const taxaValorPorKm = toMoney(merchant?.taxa_entrega_valor ?? 0);
  const enderecoStr = endereco
    ? [endereco.endereco_logradouro, endereco.endereco_numero, endereco.cidade]
        .filter(Boolean)
        .join(', ')
    : null;

  useEffect(() => {
    if (!isKm || !lat || !lng || !enderecoStr) {
      setTaxaCalculada(null);
      setDistanciaKm(null);
      setCalculando(false);
      return;
    }

    let cancelled = false;
    setCalculando(true);

    calcularDistanciaKm(lat, lng, enderecoStr).then((km) => {
      if (cancelled) return;
      if (km !== null) {
        setDistanciaKm(km);
        setTaxaCalculada(Math.ceil(km) * taxaValorPorKm);
      } else {
        setDistanciaKm(null);
        setTaxaCalculada(null);
      }
      setCalculando(false);
    });

    return () => { cancelled = true; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isKm, lat, lng, enderecoStr, taxaValorPorKm]);

  return { taxaCalculada, distanciaKm, calculando };
}
