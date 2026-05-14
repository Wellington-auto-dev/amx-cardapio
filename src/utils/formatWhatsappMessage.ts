import { formatCurrency, toMoney } from './formatCurrency';
import type { EnderecoCliente } from '@/types/catalog';

interface DeliveryInfo {
  endereco: EnderecoCliente | null;
  taxaEntregaTipo: string;
  taxaEntregaValor: number;
}

export function formatWhatsappMessage(
  linhas: string[],
  subtotal: number,
  delivery?: DeliveryInfo,
): string {
  const taxaAtiva = delivery?.taxaEntregaTipo === 'fixa' && toMoney(delivery?.taxaEntregaValor ?? 0) > 0;
  const taxaValor = taxaAtiva ? toMoney(delivery?.taxaEntregaValor ?? 0) : 0;
  const total = toMoney(subtotal) + taxaValor;

  const partes: string[] = [
    'Novo pedido via cardapio digital:',
    '',
    ...linhas,
    '',
  ];

  if (taxaAtiva) {
    partes.push(`Subtotal: ${formatCurrency(subtotal)}`);
    partes.push(`Taxa de entrega: ${formatCurrency(taxaValor)}`);
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

  partes.push('');
  partes.push('Por favor, confirme meu pedido!');

  return partes.join('\n');
}
