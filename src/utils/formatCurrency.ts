const formatter = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
  minimumFractionDigits: 2,
});

/**
 * Converte qualquer valor monetário para número seguro antes de operar.
 * Obrigatório em toda soma, subtração ou comparação de valores monetários,
 * pois a API pode retornar strings com R$, espaços ou vírgula decimal.
 */
export function toMoney(value: unknown): number {
  if (typeof value === 'number') return parseFloat(value.toFixed(10)) || 0;
  const str = String(value ?? 0)
    .replace(/R\$\s?/g, '')
    .replace(/\s/g, '')
    .replace(',', '.');
  return parseFloat(str) || 0;
}

export function formatCurrency(value: number): string {
  return formatter.format(value);
}

/** Formata somente o número, sem o símbolo R$ */
export function formatCurrencyNumber(value: number): string {
  return value.toLocaleString('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

/** Preço adicional formatado: "+R$ X,XX", "Grátis" ou "-R$ X,XX" */
export function formatPriceAdditional(value: number): string {
  if (value === 0) return 'Grátis';
  if (value > 0) return `+${formatCurrency(value)}`;
  return formatCurrency(value);
}
