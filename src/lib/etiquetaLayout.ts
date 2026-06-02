/**
 * Layout compartilhado das etiquetas térmicas — orientação VERTICAL (retrato).
 *
 * Padrões oficiais (área útil dentro da bobina, com margem lateral):
 *   - Bobina 57mm → 52 x 80 mm (margem 2,5mm lateral) · QR 20mm
 *   - Bobina 80mm → 72 x 100 mm (margem 4mm lateral)  · QR 28mm
 *
 * Compatível com impressoras térmicas: Elgin, Bematech, Tanca, Control ID
 * e modelos térmicos genéricos.
 */

export interface BobinaPreset {
  id: "57mm" | "80mm";
  bobina: number;
  largura: number;
  altura: number;
  qrSize: number; // mm
  nomeFontSize: number; // px
  description: string;
}

export const BOBINA_57: BobinaPreset = {
  id: "57mm",
  bobina: 57,
  largura: 52,
  altura: 80,
  qrSize: 20,
  nomeFontSize: 11,
  description: "Bobina 57mm · área útil 52×80mm (vertical)",
};

export const BOBINA_80: BobinaPreset = {
  id: "80mm",
  bobina: 80,
  largura: 72,
  altura: 100,
  qrSize: 28,
  nomeFontSize: 14,
  description: "Bobina 80mm · área útil 72×100mm (vertical)",
};

export const BOBINA_PRESETS: BobinaPreset[] = [BOBINA_57, BOBINA_80];

/**
 * Detecta automaticamente o preset adequado a partir da largura escolhida.
 * Qualquer largura ≤ 60mm cai no preset de 57mm; o restante usa 80mm.
 */
export function getPresetForWidth(largura: number): BobinaPreset {
  return largura <= 60 ? BOBINA_57 : BOBINA_80;
}

/**
 * Formata uma data em pt-BR aceitando Date, ISO (yyyy-mm-dd) ou strings já
 * formatadas (dd/mm/aaaa, mm/aaaa, MES/aaaa).
 */
export function formatEtiquetaDate(date: Date | string | undefined | null): string {
  if (!date) return "";
  try {
    if (typeof date === "string") {
      if (date.includes("/")) return date;
      const [year, month, day] = date.split("-").map(Number);
      if (year && month && day) {
        const d = new Date(year, month - 1, day);
        if (!isNaN(d.getTime())) return d.toLocaleDateString("pt-BR");
      }
      return date;
    }
    if (date instanceof Date && !isNaN(date.getTime())) {
      return date.toLocaleDateString("pt-BR");
    }
  } catch {
    /* ignore */
  }
  return "";
}
