/**
 * Label Size Presets for Thermal Printers
 * Optimized configurations for 57mm and 80mm thermal printers
 */

export interface LabelScaleConfig {
  fontSize: number;
  nameFontSize: number;
  spacing: number;
  padding: number;
  lineHeight: number;
  nameLineHeight: number;
  qrSize: number;
  isCompactMode: boolean;
  abbreviateLabels: boolean;
}

export interface LabelPreset {
  name: string;
  width: number;
  height: number;
  description: string;
}

export const LABEL_PRESETS: LabelPreset[] = [
  {
    name: '57mm Compacta',
    width: 57,
    height: 40,
    description: 'Ultra compacta - 57×40mm'
  },
  {
    name: '57mm Padrão',
    width: 57,
    height: 50,
    description: 'Equilibrada - 57×50mm'
  },
  {
    name: '80mm Compacta',
    width: 80,
    height: 40,
    description: 'Compacta - 80×40mm'
  },
  {
    name: '80mm Padrão',
    width: 80,
    height: 50,
    description: 'Recomendada - 80×50mm'
  },
  {
    name: '80mm Estendida',
    width: 80,
    height: 60,
    description: 'Máximo espaço - 80×60mm'
  },
  {
    name: '100mm Padrão',
    width: 100,
    height: 50,
    description: 'Impressoras maiores - 100×50mm'
  }
];

/**
 * Calcula a escala e tamanhos de fonte otimizados para impressoras térmicas
 * Detecta automaticamente o modo compacto e ajusta o layout
 */
export function calculateLabelScale(
  largura: number,
  altura: number
): LabelScaleConfig {
  // Detecta o tipo de impressora
  const isUltraCompact = largura <= 57 && altura <= 40;
  const isCompact = largura <= 57 || (largura <= 80 && altura <= 40);
  const area = largura * altura;

  // Base de referência: 70x50mm
  const baseWidth = 70;
  const baseHeight = 50;
  const baseArea = baseWidth * baseHeight;
  const scaleFactor = largura / baseWidth;
  const areaFactor = area / baseArea;

  let fontSize: number;
  let nameFontSize: number;
  let spacing: number;
  let padding: number;
  let lineHeight: number;
  let nameLineHeight: number;
  let qrSize: number;
  let isCompactMode: boolean;
  let abbreviateLabels: boolean;

  if (isUltraCompact) {
    // 57×40mm - Modo ultra compacto (extrema compactação)
    fontSize = 6.5;
    nameFontSize = 8;
    spacing = 0.6;
    padding = 1.5;
    lineHeight = 7;
    nameLineHeight = 9;
    qrSize = 20;
    isCompactMode = true;
    abbreviateLabels = true;
  } else if (isCompact) {
    // 57×50mm ou 80×40mm - Modo compacto (alta compactação)
    fontSize = Math.max(7, Math.min(8.5, areaFactor * 8));
    nameFontSize = fontSize * 1.2;
    spacing = 0.8;
    padding = 2;
    lineHeight = fontSize + 0.8;
    nameLineHeight = nameFontSize + 1;
    qrSize = 24;
    isCompactMode = true;
    abbreviateLabels = true;
  } else if (largura >= 80 && altura <= 40) {
    // 80×40mm e similares - Largura normal, altura reduzida
    fontSize = 8;
    nameFontSize = fontSize * 1.3;
    spacing = 0.9;
    padding = 2.5;
    lineHeight = fontSize + 1;
    nameLineHeight = nameFontSize + 1.2;
    qrSize = 28;
    isCompactMode = true;
    abbreviateLabels = false;
  } else if (largura >= 80) {
    // 80×50mm ou maior - Modo normal com escalagem
    fontSize = 10 * scaleFactor;
    nameFontSize = fontSize * 1.5;
    spacing = 1.2 * scaleFactor;
    padding = 3 * scaleFactor;
    lineHeight = fontSize + 1.5;
    nameLineHeight = nameFontSize + 2;
    qrSize = Math.max(28, Math.min(40, fontSize * 3.5));
    isCompactMode = false;
    abbreviateLabels = false;
  } else {
    // Fallback - Escalagem proporcional genérica
    fontSize = Math.max(7, 10 * scaleFactor);
    nameFontSize = fontSize * 1.4;
    spacing = Math.max(0.8, 1.2 * scaleFactor);
    padding = Math.max(2, 3 * scaleFactor);
    lineHeight = fontSize + 1;
    nameLineHeight = nameFontSize + 1.5;
    qrSize = Math.max(20, Math.min(35, fontSize * 3));
    isCompactMode = area < 3000;
    abbreviateLabels = largura <= 57;
  }

  // Garante que valores não fiquem muito pequenos
  fontSize = Math.max(5.5, fontSize);
  nameFontSize = Math.max(6.5, nameFontSize);
  spacing = Math.max(0.5, spacing);
  padding = Math.max(1, padding);
  lineHeight = Math.max(6, lineHeight);
  nameLineHeight = Math.max(7, nameLineHeight);
  qrSize = Math.max(16, Math.min(45, qrSize));

  return {
    fontSize,
    nameFontSize,
    spacing,
    padding,
    lineHeight,
    nameLineHeight,
    qrSize,
    isCompactMode,
    abbreviateLabels
  };
}

/**
 * Retorna o label abreviado ou completo baseado no contexto
 */
export function getLabelText(
  fullText: string,
  abbreviatedText: string,
  shouldAbbreviate: boolean
): string {
  return shouldAbbreviate ? abbreviatedText : fullText;
}

/**
 * Calcula a altura recomendada para impressoras 57mm
 */
export function getRecommendedHeight(width: number): number {
  if (width <= 57) {
    return 50; // 57mm padrão: 50mm de altura
  } else if (width <= 80) {
    return 50; // 80mm padrão: 50mm de altura
  } else {
    return 50; // Padrão geral: 50mm
  }
}

/**
 * Valida se as dimensões são adequadas para o tamanho de impressora
 */
export function validateLabelDimensions(
  width: number,
  height: number
): { valid: boolean; reason?: string } {
  // Tamanhos mínimos
  if (width < 40 || height < 25) {
    return {
      valid: false,
      reason: 'Tamanho mínimo: 40×25mm'
    };
  }

  // Tamanhos máximos (para impressoras comuns)
  if (width > 120 || height > 100) {
    return {
      valid: false,
      reason: 'Tamanho máximo: 120×100mm'
    };
  }

  return { valid: true };
}

/**
 * Retorna informações sobre a qualidade de impressão esperada
 */
export function getLabelQualityInfo(width: number, height: number) {
  const area = width * height;
  
  if (area < 2000) {
    return {
      quality: 'Alta compactação',
      level: 'extreme',
      warning: 'Redução significativa de espaço. Verifique legibilidade.'
    };
  } else if (area < 2500) {
    return {
      quality: 'Compacta',
      level: 'compact',
      warning: 'Espaço limitado. Datas em formato curto (DD/MM/AAAA).'
    };
  } else if (area < 4000) {
    return {
      quality: 'Equilibrada',
      level: 'balanced',
      warning: null
    };
  } else {
    return {
      quality: 'Espaçosa',
      level: 'spacious',
      warning: null
    };
  }
}
