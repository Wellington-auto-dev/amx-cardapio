const formatter = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
  minimumFractionDigits: 2,
});

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
