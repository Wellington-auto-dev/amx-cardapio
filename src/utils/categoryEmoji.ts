const EMOJI_MAP: Array<[RegExp, string]> = [
  [/pizza/i, '🍕'],
  [/hambúrguer|hamburger|burguer|burger/i, '🍔'],
  [/bebida/i, '🥤'],
  [/sobremesa|doce/i, '🍰'],
  [/salgado/i, '🥙'],
  [/frango/i, '🍗'],
  [/peixe|frutos do mar/i, '🐟'],
  [/salada/i, '🥗'],
  [/macarrão|massa|pasta/i, '🍝'],
  [/sanduíche|sanduiche|lanche/i, '🥪'],
];

export function getCategoryEmoji(categoria: string): string {
  for (const [regex, emoji] of EMOJI_MAP) {
    if (regex.test(categoria)) return emoji;
  }
  return '🍽️';
}
