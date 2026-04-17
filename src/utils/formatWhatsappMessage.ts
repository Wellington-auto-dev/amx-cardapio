import { formatCurrency } from './formatCurrency';

export function formatWhatsappMessage(linhas: string[], total: number): string {
  return [
    'Novo pedido via cardapio digital:',
    '',
    ...linhas,
    '',
    `Total: ${formatCurrency(total)}`,
    '',
    'Por favor, confirme meu pedido!',
  ].join('\n');
}