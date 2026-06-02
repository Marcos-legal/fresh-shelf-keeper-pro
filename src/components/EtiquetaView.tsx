import { Product } from "@/types/product";
import { QRCodeSVG } from "qrcode.react";
import { buildEtiquetaQrPayload } from "@/lib/qrcode";
import { formatEtiquetaDate, getPresetForWidth } from "@/lib/etiquetaLayout";

interface EtiquetaViewProps {
  product: Product;
  /** Largura em mm. ≤60 → preset 57mm (52×80). >60 → preset 80mm (72×100). */
  largura?: number;
  altura?: number;
}

/**
 * Etiqueta térmica VERTICAL profissional para controle de validade.
 * Nome do produto exibido completo (com quebra de linha), respeitando margens.
 * QR Code sempre dentro da etiqueta.
 */
export function EtiquetaView({ product, largura = 52 }: EtiquetaViewProps) {
  const preset = getPresetForWidth(largura);
  const w = preset.largura;
  const h = preset.altura;
  const qrMm = preset.qrSize;
  const nomeSize = preset.nomeFontSize;

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
    fontSize: "7px",
    fontWeight: 700,
    lineHeight: 1,
    color: "#000",
    textTransform: "uppercase",
    letterSpacing: "0.2px",
  };
  const cellContent: React.CSSProperties = {
    fontSize: "9px",
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
    padding: "2px 3px",
    minHeight: px(5),
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
      {/* Cabeçalho — Nome do produto COMPLETO (com quebra de linha) */}
      <div
        style={{
          background: "#000",
          color: "#fff",
          textAlign: "center",
          fontWeight: 900,
          fontSize: `${nomeSize}px`,
          lineHeight: 1.15,
          textTransform: "uppercase",
          letterSpacing: "0.3px",
          padding: "4px 4px",
          border: "1px solid #000",
          wordBreak: "break-word",
          whiteSpace: "normal",
          overflowWrap: "break-word",
          hyphens: "auto",
        }}
      >
        {product.nome || "—"}
      </div>

      {/* Lote */}
      <div style={cellBox}>
        <span style={cellLabel}>Lote</span>
        <span style={cellContent}>{product.lote || ""}</span>
      </div>

      {/* Marca */}
      <div style={cellBox}>
        <span style={cellLabel}>Marca</span>
        <span style={cellContent}>{product.marca || ""}</span>
      </div>

      {/* Fabricação / Validade */}
      <div style={{ display: "flex", gap: "2px" }}>
        <div style={{ ...cellBox, flex: 1 }}>
          <span style={cellLabel}>Fabric.</span>
          <span style={cellContent}>{formatEtiquetaDate(product.dataFabricacao)}</span>
        </div>
        <div style={{ ...cellBox, flex: 1 }}>
          <span style={cellLabel}>Valid.</span>
          <span style={cellContent}>{formatEtiquetaDate(product.validade)}</span>
        </div>
      </div>

      {/* Abertura / Usar até */}
      <div style={{ display: "flex", gap: "2px" }}>
        <div style={{ ...cellBox, flex: 1 }}>
          <span style={cellLabel}>Abertura</span>
          <span style={cellContent}>{formatEtiquetaDate(product.dataAbertura)}</span>
        </div>
        <div style={{ ...cellBox, flex: 1 }}>
          <span style={cellLabel}>Usar até</span>
          <span style={cellContent}>{formatEtiquetaDate(product.utilizarAte)}</span>
        </div>
      </div>

      {/* Armazenamento */}
      <div
        style={{
          ...cellBox,
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-around",
          fontSize: "9px",
          fontWeight: 800,
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

      {/* Responsável */}
      <div style={cellBox}>
        <span style={cellLabel}>Responsável</span>
        <span style={cellContent}>{product.responsavel || ""}</span>
      </div>

      {/* QR Code centralizado dentro da etiqueta */}
      <div
        style={{
          flex: 1,
          minHeight: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div
          style={{
            width: px(qrMm),
            height: px(qrMm),
            border: "1px solid #000",
            background: "#fff",
            padding: "1px",
            boxSizing: "border-box",
          }}
        >
          <QRCodeSVG
            value={buildEtiquetaQrPayload(product)}
            size={qrMm * 3.78 - 2}
            level="M"
            marginSize={0}
            style={{ width: "100%", height: "100%", display: "block" }}
          />
        </div>
      </div>
    </div>
  );
}
