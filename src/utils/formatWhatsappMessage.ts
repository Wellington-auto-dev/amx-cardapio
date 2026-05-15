import { formatCurrency, toMoney } from './formatCurrency';
import type { EnderecoCliente } from '@/types/catalog';

interface DeliveryInfo {
  endereco: EnderecoCliente | null;
  taxaEntregaTipo: string;
  taxaEntregaValor: number;
  taxaKmCalculada?: number | null;
  distanciaKm?: number | null;
}

interface ResgateInfo {
  nivelId: string;
  brinde: string;
}

export function formatWhatsappMessage(
  linhas: string[],
  subtotal: number,
  delivery?: DeliveryInfo,
  resgateInfo?: ResgateInfo | null,
): string {
  const isFixa = delivery?.taxaEntregaTipo === 'fixa' && toMoney(delivery?.taxaEntregaValor ?? 0) > 0;
  const isKm = delivery?.taxaEntregaTipo === 'km' && (delivery?.taxaKmCalculada ?? 0) > 0;
  const taxaValor = isFixa
    ? toMoney(delivery?.taxaEntregaValor ?? 0)
    : isKm
      ? toMoney(delivery?.taxaKmCalculada ?? 0)
      : 0;
  const taxaAtiva = isFixa || isKm;
  const total = toMoney(subtotal) + taxaValor;

  const partes: string[] = [
    'Novo pedido via cardapio digital:',
    '',
    ...linhas,
    '',
  ];

  if (taxaAtiva) {
    partes.push(`Subtotal: ${formatCurrency(subtotal)}`);
    const distStr = isKm && delivery?.distanciaKm != null
      ? ` (${Number(delivery.distanciaKm).toFixed(1)} km)`
      : '';
    partes.push(`Taxa de entrega: ${formatCurrency(taxaValor)}${distStr}`);
  }
  partes.push(`Total: ${formatCurrency(total)}`);

  if (delivery?.endereco) {
    const e = delivery.endereco;
    const endStr = [e.endereco_logradouro, e.endereco_numero, e.cidade].filter(Boolean).join(', ');
    if (endStr) {
      partes.push('');
      partes.push(`Endereco: ${endStr}`);
    }
  }

  if (resgateInfo) {
    partes.push('');
    partes.push(`*Resgate Club VIP: ${resgateInfo.brinde}*`);
  }

  partes.push('');
  partes.push('Por favor, confirme meu pedido!');

  return partes.join('\n');
}
