import { Product } from "@/types/product";
import { escapeHtml } from "@/lib/security";
import { formatEtiquetaDate } from "@/lib/etiquetaLayout";

interface BuildA4Options {
  products: Product[];
  largura: number;
  altura: number;
  responsavel: string;
  qrMap: Map<string, string>;
  title: string;
}

/**
 * HTML de impressão em FOLHA A4 (210×297mm) com várias etiquetas por página,
 * organizadas em grade. Cada etiqueta mantém a largura/altura configuradas em mm.
 * Ideal para gerar PDF ("Salvar como PDF" no diálogo de impressão).
 */
export function buildEtiquetaA4PrintHTML({
  products,
  largura,
  altura,
  responsavel,
  qrMap,
  title,
}: BuildA4Options): string {
  const margin = 8; // mm de margem da folha
  const gap = 2; // mm entre etiquetas
  const w = Math.max(30, Math.min(largura || 52, 190));
  const h = Math.max(25, Math.min(altura || 60, 280));

  const usableW = 210 - margin * 2;
  const usableH = 297 - margin * 2;
  const cols = Math.max(1, Math.floor((usableW + gap) / (w + gap)));
  const rows = Math.max(1, Math.floor((usableH + gap) / (h + gap)));
  const perPage = cols * rows;

  const scale = Math.max(0.65, Math.min(1.25, h / 80));
  const nomeSize = Math.max(8, 11 * scale);
  const lblSize = Math.max(6, 8 * scale);
  const valSize = Math.max(7, 9 * scale);
  const chkSize = Math.max(7, 9 * scale);
  const qrMm = Math.max(11, Math.min(w - 28, h * 0.24, 20));

  const labelHtml = (p: Product) => {
    const qr = qrMap.get(String(p.id));
    const armaz = p.localArmazenamento;
    const cb = (active: boolean) =>
      `<span class="cb" style="background:${active ? "#000" : "#fff"}"></span>`;

    return `
      <div class="etiqueta">
        <div class="header">${escapeHtml((p.nome || "—").toUpperCase())}</div>
        <div class="cell">
          <div class="lbl">LOTE:</div>
          <div class="val">${escapeHtml((p.lote || "").toUpperCase())}</div>
        </div>
        <div class="cell">
          <div class="lbl">MARCA:</div>
          <div class="val">${escapeHtml((p.marca || "").toUpperCase())}</div>
        </div>
        <div class="row">
          <div class="cell">
            <div class="lbl">FABRIC.:</div>
            <div class="val">${escapeHtml(formatEtiquetaDate(p.dataFabricacao))}</div>
          </div>
          <div class="cell">
            <div class="lbl">VALID.:</div>
            <div class="val">${escapeHtml(formatEtiquetaDate(p.validade))}</div>
          </div>
        </div>
        <div class="row">
          <div class="cell">
            <div class="lbl">ABERTURA:</div>
            <div class="val">${escapeHtml(formatEtiquetaDate(p.dataAbertura))}</div>
          </div>
          <div class="cell">
            <div class="lbl">USAR ATÉ:</div>
            <div class="val">${escapeHtml(formatEtiquetaDate(p.utilizarAte))}</div>
          </div>
        </div>
        <div class="cell checkboxes">
          <span class="chk">${cb(armaz === "refrigerado")} REF</span>
          <span class="chk">${cb(armaz === "congelado")} CON</span>
          <span class="chk">${cb(armaz === "ambiente")} AMB</span>
        </div>
        <div class="bottom">
          <div class="cell resp">
            <div class="lbl">RESPONSÁVEL:</div>
            <div class="val">${escapeHtml((responsavel || p.responsavel || "").toUpperCase())}</div>
          </div>
          <div class="qr-box">${qr ? `<img src="${qr}" alt="qr" />` : ""}</div>
        </div>
      </div>
    `;
  };

  const pages: Product[][] = [];
  for (let i = 0; i < products.length; i += perPage) {
    pages.push(products.slice(i, i + perPage));
  }
  if (pages.length === 0) pages.push([]);

  const pagesHtml = pages
    .map((items) => `<div class="folha">${items.map(labelHtml).join("\n")}</div>`)
    .join("\n");

  return `<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <title>${escapeHtml(title)}</title>
    <style>
      @page { size: A4 portrait; margin: ${margin}mm; }
      * { box-sizing: border-box; }
      html, body {
        margin: 0; padding: 0;
        font-family: Arial, Helvetica, sans-serif;
        color: #000; background: #fff;
        -webkit-print-color-adjust: exact;
        print-color-adjust: exact;
      }
      .folha {
        display: flex;
        flex-wrap: wrap;
        align-content: flex-start;
        gap: ${gap}mm;
        width: ${usableW}mm;
        page-break-after: always;
      }
      .folha:last-child { page-break-after: auto; }
      .etiqueta {
        width: ${w}mm;
        height: ${h}mm;
        border: 1px solid #000;
        padding: 3px;
        display: flex;
        flex-direction: column;
        gap: 2px;
        background: #fff;
        page-break-inside: avoid;
        overflow: hidden;
      }
      .header {
        background: #000;
        color: #fff;
        text-align: center;
        font-weight: 900;
        font-size: ${nomeSize}px;
        line-height: 1.15;
        text-transform: uppercase;
        letter-spacing: 0.4px;
        padding: 3px;
        border: 1px solid #000;
        word-break: break-word;
        overflow-wrap: break-word;
      }
      .row { display: flex; gap: 2px; }
      .row > .cell { flex: 1; min-width: 0; }
      .cell {
        border: 1px solid #000;
        padding: 2px 4px;
        display: flex;
        flex-direction: column;
        justify-content: center;
        overflow: hidden;
      }
      .lbl {
        font-size: ${lblSize}px;
        font-weight: 800;
        line-height: 1;
        text-transform: uppercase;
        letter-spacing: 0.3px;
      }
      .val {
        font-size: ${valSize}px;
        font-weight: 700;
        line-height: 1.15;
        text-transform: uppercase;
        margin-top: 1px;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      .checkboxes {
        flex-direction: row;
        align-items: center;
        justify-content: space-around;
        font-size: ${chkSize}px;
        font-weight: 800;
      }
      .chk { display: inline-flex; align-items: center; gap: 3px; }
      .cb { display: inline-block; width: 2.4mm; height: 2.4mm; border: 1px solid #000; }
      .bottom { display: flex; gap: 2px; align-items: stretch; height: ${qrMm}mm; }
      .bottom .resp { flex: 1; min-width: 0; padding: 2px 4px; height: ${qrMm}mm; }
      .qr-box {
        width: ${qrMm}mm; height: ${qrMm}mm; min-width: ${qrMm}mm;
        border: 1px solid #000; padding: 0.5mm; background: #fff;
        flex-shrink: 0; display: flex; align-items: center; justify-content: center;
      }
      .qr-box img { width: 100%; height: 100%; display: block; }
    </style>
  </head>
  <body>
    ${pagesHtml}
  </body>
</html>`;
}
