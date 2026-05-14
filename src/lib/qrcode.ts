import { Product } from "@/types/product";

const formatDateForQr = (date: Date | string | undefined): string => {
  if (!date) return "";
  if (typeof date === "string") return date;
  if (date instanceof Date && !isNaN(date.getTime())) {
    return date.toISOString().slice(0, 10);
  }
  return "";
};

/**
 * Builds the QR payload for a product label. JSON-encoded so the scanner can
 * detect ValiControl labels and route the user to the matching product.
 */
export function buildEtiquetaQrPayload(product: Product): string {
  return JSON.stringify({
    app: "valicontrol",
    v: 1,
    id: product.id,
    nome: product.nome ?? "",
    lote: product.lote ?? "",
    marca: product.marca ?? "",
    fab: formatDateForQr(product.dataFabricacao),
    val: formatDateForQr(product.validade as Date | string | undefined),
    abert: formatDateForQr(product.dataAbertura),
    uso: formatDateForQr(product.utilizarAte),
    local: product.localArmazenamento ?? "",
    resp: product.responsavel ?? "",
  });
}

export interface EtiquetaQrData {
  app?: string;
  v?: number;
  id?: string | number;
  nome?: string;
  lote?: string;
  marca?: string;
  fab?: string;
  val?: string;
  abert?: string;
  uso?: string;
  local?: string;
  resp?: string;
}

export function parseEtiquetaQrPayload(raw: string): EtiquetaQrData | null {
  try {
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed === "object") return parsed as EtiquetaQrData;
  } catch {
    // not JSON — could be plain text/url
  }
  return null;
}
