const BRL = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

const QTY = new Intl.NumberFormat("pt-BR", {
  minimumFractionDigits: 0,
  maximumFractionDigits: 3,
});

export function formatBRL(value: number): string {
  return BRL.format(value);
}

export function formatQuantity(value: number): string {
  return QTY.format(value);
}

/**
 * Aceita "10", "10,50", "10.50", "1.234,56" e devolve número.
 * Retorna NaN para entrada inválida.
 */
export function parseDecimalPtBR(input: string): number {
  const trimmed = input.trim();
  if (trimmed.length === 0) return NaN;
  // Se contém vírgula, assumimos formato pt-BR: ponto = milhar, vírgula = decimal.
  // Sem vírgula, ponto pode ser decimal (ex.: scanner ou colar de outro lugar).
  const normalized = trimmed.includes(",")
    ? trimmed.replace(/\./g, "").replace(",", ".")
    : trimmed;
  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : NaN;
}
