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
 * - Altura ajustável (fontes e QR escalam proporcionalmente)
 * - Sem espaçador entre checkboxes e responsável (layout compacto)
 * - Compatível com Chrome e Edge (somente propriedades CSS padrão)
 */
export function EtiquetaView({ product, largura = 52, altura }: EtiquetaViewProps) {
  const preset = getPresetForWidth(largura);
  const w = preset.largura;
  const h = altura && altura > 20 ? altura : preset.altura;

  // Fator de escala proporcional à altura (referência: altura padrão do preset)
  const scale = Math.max(0.7, Math.min(1.25, h / preset.altura));

  const nomeSize = Math.max(8, preset.nomeFontSize * scale);
  const lblSize = Math.max(6, 8 * scale);
  const valSize = Math.max(7, 9 * scale);
  const chkSize = Math.max(7, 9 * scale);

  // QR menor: cabe na largura útil e ~22% da altura. Mínimo 12mm, máximo 22mm.
  const qrMm = Math.max(
    12,
    Math.min(w - 30, h * 0.22, 22)
  );

  const px = (mm: number) => `${(mm * 3.78).toFixed(2)}px`;

  const armaz = product.localArmazenamento;
  const checkbox = (active: boolean) => (
    <span
      style={{
        display: "inline-block",
        width: px(2.4),
        height: px(2.4),
        border: "1px solid #000",
        background: active ? "#000" : "#fff",
        marginRight: px(1),
        verticalAlign: "middle",
      }}
    />
  );

  const cellLabel: React.CSSProperties = {
    fontSize: `${lblSize}px`,
    fontWeight: 800,
    lineHeight: 1,
    color: "#000",
    textTransform: "uppercase",
    letterSpacing: "0.3px",
  };
  const cellContent: React.CSSProperties = {
    fontSize: `${valSize}px`,
    fontWeight: 700,
    lineHeight: 1.15,
    color: "#000",
    textTransform: "uppercase",
    marginTop: "1px",
    overflow: "hidden",
    whiteSpace: "nowrap",
    textOverflow: "ellipsis",
  };
  const cellBox: React.CSSProperties = {
    border: "1px solid #000",
    padding: "2px 4px",
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
          padding: "4px 4px",
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
          fontSize: `${chkSize}px`,
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

      {/* Responsável (compacto) + QR Code — sem espaçador acima */}
      <div style={{ display: "flex", gap: "2px", alignItems: "stretch", height: px(qrMm) }}>
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
            minWidth: px(qrMm),
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
            size={Math.max(36, qrMm * 3.78 - 2)}
            level="M"
            marginSize={0}
            style={{ width: "100%", height: "100%", display: "block" }}
          />
        </div>
      </div>
    </div>
  );
}
