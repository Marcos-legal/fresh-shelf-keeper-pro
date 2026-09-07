/**
 * Regra única de cálculo de "Utilizar até".
 * Data de abertura + dias para vencer após abertura.
 * Mesma regra já usada no cadastro/edição (useProductsSupabase) e no editor de etiquetas.
 */
export function calcularUtilizarAte(abertura: Date | undefined | null, dias: number): Date | undefined {
  if (!abertura || isNaN(abertura.getTime())) return undefined;
  const d = Number(dias) || 0;
  if (d <= 0) return undefined;
  return new Date(abertura.getFullYear(), abertura.getMonth(), abertura.getDate() + d);
}
