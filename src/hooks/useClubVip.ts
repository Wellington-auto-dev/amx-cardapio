import { useState, useEffect } from 'react';
import { buscarSaldoClubVip } from '@/services/api';
import type { EnderecoCliente } from '@/types/catalog';

interface ProximoNivel {
  meta_pontos: number;
  brinde: string;
  faltam?: number;
}

interface NivelResgatavel {
  id: string;
  meta_pontos: number;
  brinde: string;
}

export function useClubVip(merchantId: string, phone: string | null) {
  const [isLoading, setIsLoading] = useState(false);
  const [hasChecked, setHasChecked] = useState(false);
  const [clubAtivo, setClubAtivo] = useState(false);
  const [pontosAtuais, setPontosAtuais] = useState(0);
  const [pontosPorCompra, setPontosPorCompra] = useState(1);
  const [proximoNivel, setProximoNivel] = useState<ProximoNivel | null>(null);
  const [endereco, setEndereco] = useState<EnderecoCliente | null>(null);
  const [resgateDisponivel, setResgateDisponivel] = useState(false);
  const [nivelResgatavel, setNivelResgatavel] = useState<NivelResgatavel | null>(null);
  const [nivelMaximoAtingido, setNivelMaximoAtingido] = useState(false);
  const [resgateEscolhido, setResgateEscolhido] = useState<string | null>(null);

  useEffect(() => {
    if (!phone || !merchantId) {
      setClubAtivo(false);
      setPontosAtuais(0);
      setProximoNivel(null);
      setEndereco(null);
      setHasChecked(false);
      setResgateDisponivel(false);
      setNivelResgatavel(null);
      setNivelMaximoAtingido(false);
      setResgateEscolhido(null);
      return;
    }

    let cancelled = false;
    setIsLoading(true);
    setHasChecked(false);
    setResgateEscolhido(null);

    buscarSaldoClubVip(merchantId, phone)
      .then((res) => {
        if (cancelled) return;
        if (res.sucesso && res.club_ativo) {
          setClubAtivo(true);
          setPontosAtuais(res.pontos_atuais ?? 0);
          setPontosPorCompra(res.pontos_por_compra ?? 1);
          setProximoNivel(res.proximo_nivel ?? null);
          setResgateDisponivel(res.resgate_disponivel ?? false);
          setNivelResgatavel(res.nivel_resgatavel ?? null);
          setNivelMaximoAtingido(res.nivel_maximo_atingido ?? false);
        } else {
          setClubAtivo(false);
          setPontosAtuais(0);
          setProximoNivel(null);
          setResgateDisponivel(false);
          setNivelResgatavel(null);
          setNivelMaximoAtingido(false);
        }
        setEndereco(res.endereco ?? null);
      })
      .catch(() => {
        if (!cancelled) {
          setClubAtivo(false);
          setPontosAtuais(0);
          setProximoNivel(null);
          setEndereco(null);
          setResgateDisponivel(false);
          setNivelResgatavel(null);
          setNivelMaximoAtingido(false);
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

  return {
    clubAtivo,
    pontosAtuais,
    pontosPorCompra,
    proximoNivel,
    endereco,
    isLoading,
    hasChecked,
    resgateDisponivel,
    nivelResgatavel,
    nivelMaximoAtingido,
    resgateEscolhido,
    setResgateEscolhido,
  };
}
