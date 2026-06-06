import { Product } from "@/types/product";
import { QRCodeSVG } from "qrcode.react";
import { buildEtiquetaQrPayload } from "@/lib/qrcode";
import { formatEtiquetaDate, getPresetForWidth } from "@/lib/etiquetaLayout";

interface EtiquetaViewProps {
  product: Product;
  /** Largura em mm (travada pelo preset: ≤60 → 52mm · >60 → 72mm). */
  largura?: number;
  /** Altura em mm (ajustável). Se omitida usa a altura padrão do preset. */
  altura?: number;
}

/**
 * Etiqueta térmica VERTICAL profissional.
 * - Largura fixa pelo preset de bobina
 * - Altura ajustável pelo usuário
 * - QR Code escala proporcionalmente à largura e altura desejadas
 * - Bloco "Responsável" compacto (altura mínima) para permitir reduzir a etiqueta
 * - Compatível com Chrome e Edge (sem propriedades não-padrão)
 */
export function EtiquetaView({ product, largura = 52, altura }: EtiquetaViewProps) {
  const preset = getPresetForWidth(largura);
  const w = preset.largura;
  const h = altura && altura > 20 ? altura : preset.altura;
  const nomeSize = preset.nomeFontSize;

  // QR proporcional: cabe na largura útil e ~28% da altura. Mínimo 14mm.
  const qrMm = Math.max(
    14,
    Math.min(w - 28, h * 0.28, preset.qrSize * 1.6)
  );

  const px = (mm: number) => `${(mm * 3.78).toFixed(2)}px`;

  const armaz = product.localArmazenamento;
  const checkbox = (active: boolean) => (
    <span
      style={{
        display: "inline-block",
        width: px(2.6),
        height: px(2.6),
        border: "1px solid #000",
        background: active ? "#000" : "#fff",
        marginRight: px(1.2),
        verticalAlign: "middle",
      }}
    />
  );

  const cellLabel: React.CSSProperties = {
    fontSize: "8px",
    fontWeight: 800,
    lineHeight: 1,
    color: "#000",
    textTransform: "uppercase",
    letterSpacing: "0.3px",
  };
  const cellContent: React.CSSProperties = {
    fontSize: "9px",
    fontWeight: 700,
    lineHeight: 1.15,
    color: "#000",
    textTransform: "uppercase",
    marginTop: "2px",
    overflow: "hidden",
    whiteSpace: "nowrap",
    textOverflow: "ellipsis",
  };
  const cellBox: React.CSSProperties = {
    border: "1px solid #000",
    padding: "3px 4px",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    overflow: "hidden",
  };

  return (
    <div
      className="etiqueta-termica"
      style={{
        width: px(w),
        height: px(h),
        background: "#fff",
        color: "#000",
        fontFamily: "Arial, Helvetica, sans-serif",
        border: "1px solid #000",
        padding: "3px",
        boxSizing: "border-box",
        display: "flex",
        flexDirection: "column",
        gap: "2px",
        overflow: "hidden",
      }}
    >
      {/* Cabeçalho — Nome do produto COMPLETO */}
      <div
        style={{
          background: "#000",
          color: "#fff",
          textAlign: "center",
          fontWeight: 900,
          fontSize: `${nomeSize}px`,
          lineHeight: 1.15,
          textTransform: "uppercase",
          letterSpacing: "0.4px",
          padding: "5px 4px",
          border: "1px solid #000",
          wordBreak: "break-word",
          whiteSpace: "normal",
          overflowWrap: "break-word",
        }}
      >
        {product.nome || "—"}
      </div>

      <div style={cellBox}>
        <span style={cellLabel}>LOTE:</span>
        <span style={cellContent}>{product.lote || ""}</span>
      </div>

      <div style={cellBox}>
        <span style={cellLabel}>MARCA:</span>
        <span style={cellContent}>{product.marca || ""}</span>
      </div>

      <div style={{ display: "flex", gap: "2px" }}>
        <div style={{ ...cellBox, flex: 1, minWidth: 0 }}>
          <span style={cellLabel}>FABRIC.:</span>
          <span style={cellContent}>{formatEtiquetaDate(product.dataFabricacao)}</span>
        </div>
        <div style={{ ...cellBox, flex: 1, minWidth: 0 }}>
          <span style={cellLabel}>VALID.:</span>
          <span style={cellContent}>{formatEtiquetaDate(product.validade)}</span>
        </div>
      </div>

      <div style={{ display: "flex", gap: "2px" }}>
        <div style={{ ...cellBox, flex: 1, minWidth: 0 }}>
          <span style={cellLabel}>ABERTURA:</span>
          <span style={cellContent}>{formatEtiquetaDate(product.dataAbertura)}</span>
        </div>
        <div style={{ ...cellBox, flex: 1, minWidth: 0 }}>
          <span style={cellLabel}>USAR ATÉ:</span>
          <span style={cellContent}>{formatEtiquetaDate(product.utilizarAte)}</span>
        </div>
      </div>

      <div
        style={{
          ...cellBox,
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-around",
          fontSize: "10px",
          fontWeight: 800,
          padding: "2px 4px",
        }}
      >
        <span style={{ display: "inline-flex", alignItems: "center" }}>
          {checkbox(armaz === "refrigerado")} REF
        </span>
        <span style={{ display: "inline-flex", alignItems: "center" }}>
          {checkbox(armaz === "congelado")} CON
        </span>
        <span style={{ display: "inline-flex", alignItems: "center" }}>
          {checkbox(armaz === "ambiente")} AMB
        </span>
      </div>

      {/* Espaçador flexível para permitir altura variável sem distorcer */}
      <div style={{ flex: 1, minHeight: 0 }} />

      {/* Responsável (compacto) + QR Code */}
      <div style={{ display: "flex", gap: "2px", alignItems: "stretch" }}>
        <div
          style={{
            ...cellBox,
            flex: 1,
            minWidth: 0,
            padding: "2px 4px",
            height: px(qrMm),
          }}
        >
          <span style={cellLabel}>RESPONSÁVEL:</span>
          <span style={cellContent}>{product.responsavel || ""}</span>
        </div>
        <div
          style={{
            width: px(qrMm),
            height: px(qrMm),
            border: "1px solid #000",
            background: "#fff",
            padding: "1px",
            boxSizing: "border-box",
            flexShrink: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <QRCodeSVG
            value={buildEtiquetaQrPayload(product)}
            size={Math.max(40, qrMm * 3.78 - 2)}
            level="M"
            marginSize={0}
            style={{ width: "100%", height: "100%", display: "block" }}
          />
        </div>
      </div>
    </div>
  );
}
