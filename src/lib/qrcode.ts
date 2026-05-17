import { Product } from "@/types/product";

/**
 * QR payload for product labels.
 *
 * IMPORTANT: keep the payload as small as possible. The label QR is printed
 * at ~13mm — a long JSON string makes the QR extremely dense and unreadable
 * by phone cameras. We encode only a short prefix + product id; the scanner
 * looks up the rest from the product list.
 */
const PREFIX = "VC:";

export function buildEtiquetaQrPayload(product: Product): string {
  return `${PREFIX}${product.id}`;
}

export interface EtiquetaQrData {
  app: "valicontrol";
  id: string;
}

export function parseEtiquetaQrPayload(raw: string): EtiquetaQrData | null {
  if (!raw) return null;
  const trimmed = raw.trim();

  // New short format: "VC:<id>"
  if (trimmed.toUpperCase().startsWith(PREFIX)) {
    const id = trimmed.slice(PREFIX.length).trim();
    if (id) return { app: "valicontrol", id };
  }

  // Some scanners return the QR payload as a URL-safe or plain numeric value.
  const urlMatch = trimmed.match(/(?:^|[?&#/])(?:vc:|produto=|product=|id=)?(\d+)(?:$|[&#/?])/i);
  if (urlMatch?.[1]) {
    return { app: "valicontrol", id: urlMatch[1] };
  }

  if (/^\d+$/.test(trimmed)) {
    return { app: "valicontrol", id: trimmed };
  }

  // Backwards compatibility: legacy JSON payloads
  try {
    const parsed = JSON.parse(trimmed);
    if (parsed && typeof parsed === "object" && parsed.app === "valicontrol" && parsed.id) {
      return { app: "valicontrol", id: String(parsed.id) };
    }
  } catch {
    // not JSON
  }

  return null;
}
