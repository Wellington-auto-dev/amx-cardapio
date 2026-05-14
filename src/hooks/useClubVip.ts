import { useState, useEffect } from 'react';
import { buscarSaldoClubVip } from '@/services/api';
import type { EnderecoCliente } from '@/types/catalog';

interface ProximoNivel {
  meta_pontos: number;
  brinde: string;
  faltam?: number;
}

export function useClubVip(merchantId: string, phone: string | null) {
  const [isLoading, setIsLoading] = useState(false);
  const [hasChecked, setHasChecked] = useState(false);
  const [clubAtivo, setClubAtivo] = useState(false);
  const [pontosAtuais, setPontosAtuais] = useState(0);
  const [pontosPorCompra, setPontosPorCompra] = useState(1);
  const [proximoNivel, setProximoNivel] = useState<ProximoNivel | null>(null);
  const [endereco, setEndereco] = useState<EnderecoCliente | null>(null);

  useEffect(() => {
    if (!phone || !merchantId) {
      setClubAtivo(false);
      setPontosAtuais(0);
      setProximoNivel(null);
      setEndereco(null);
      setHasChecked(false);
      return;
    }

    let cancelled = false;
    setIsLoading(true);
    setHasChecked(false);

    buscarSaldoClubVip(merchantId, phone)
      .then((res) => {
        if (cancelled) return;
        if (res.sucesso && res.club_ativo) {
          setClubAtivo(true);
          setPontosAtuais(res.pontos_atuais ?? 0);
          setPontosPorCompra(res.pontos_por_compra ?? 1);
          setProximoNivel(res.proximo_nivel ?? null);
        } else {
          setClubAtivo(false);
          setPontosAtuais(0);
          setProximoNivel(null);
        }
        setEndereco(res.endereco ?? null);
      })
      .catch(() => {
        if (!cancelled) {
          setClubAtivo(false);
          setPontosAtuais(0);
          setProximoNivel(null);
          setEndereco(null);
        }
      })
      .finally(() => {
        if (!cancelled) {
          setIsLoading(false);
          setHasChecked(true);
        }
      });

    return () => { cancelled = true; };
  }, [merchantId, phone]);

  return { clubAtivo, pontosAtuais, pontosPorCompra, proximoNivel, endereco, isLoading, hasChecked };
}
