import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingDown, AlertTriangle, Trash2, Printer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { useProductEvents } from "@/hooks/useProductEvents";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

const fmtBRL = (n: number) =>
  n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

const escapeHtml = (value: unknown) =>
  String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");

export function DesperdicioSection() {
  const { events, loading } = useProductEvents();

  const { mesAtual, ano, ultimos12, recentes, perdas, totalEventos } = useMemo(() => {
    const losses = events.filter((e) => e.tipo === "descartado" || e.tipo === "vencido");
    const now = new Date();
    const startMes = new Date(now.getFullYear(), now.getMonth(), 1);
    const startAno = new Date(now.getFullYear(), 0, 1);

    const sum = (arr: typeof losses) =>
      arr.reduce((acc, e) => acc + Number(e.custo_snapshot ?? 0), 0);

    const monthly: Record<string, number> = {};
    for (let i = 11; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      monthly[key] = 0;
    }
    losses.forEach((e) => {
      const d = new Date(e.created_at);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      if (key in monthly) monthly[key] += Number(e.custo_snapshot ?? 0);
    });

    const ultimos12Arr = Object.entries(monthly).map(([k, v]) => {
      const [y, m] = k.split("-");
      return {
        mes: `${m}/${y.slice(2)}`,
        valor: Number(v.toFixed(2)),
      };
    });

    return {
      mesAtual: sum(losses.filter((e) => new Date(e.created_at) >= startMes)),
      ano: sum(losses.filter((e) => new Date(e.created_at) >= startAno)),
      ultimos12: ultimos12Arr,
      recentes: losses.slice(0, 20),
      perdas: losses,
      totalEventos: losses.length,
    };
  }, [events]);

  const imprimirRelatorio = () => {
    if (perdas.length === 0) {
      toast({
        title: "Nenhum desperdício para imprimir",
        description: "Registre um descarte ou vencimento para gerar o relatório.",
        variant: "destructive",
      });
      return;
    }

    const printWindow = window.open("", "_blank");
    if (!printWindow) {
      toast({
        title: "Não foi possível abrir a impressão",
        description: "Permita pop-ups para este site e tente novamente.",
        variant: "destructive",
      });
      return;
    }
    printWindow.opener = null;

    const tipoLabel = (t: string) =>
      t === "vencido" ? "Vencido" : t === "descartado" ? "Descartado" : t;

    const totalGeral = perdas.reduce((acc, e) => acc + Number(e.custo_snapshot ?? 0), 0);

    const porTipo = perdas.reduce<Record<string, { qtd: number; valor: number }>>((acc, e) => {
      const k = e.tipo;
      acc[k] = acc[k] || { qtd: 0, valor: 0 };
      acc[k].qtd += 1;
      acc[k].valor += Number(e.custo_snapshot ?? 0);
      return acc;
    }, {});

    const porProduto = Object.entries(
      perdas.reduce<Record<string, { qtd: number; valor: number }>>((acc, e) => {
        const k = e.product_nome || "Sem nome";
        acc[k] = acc[k] || { qtd: 0, valor: 0 };
        acc[k].qtd += 1;
        acc[k].valor += Number(e.custo_snapshot ?? 0);
        return acc;
      }, {})
    ).sort((a, b) => b[1].valor - a[1].valor);

    const rows = perdas
      .map((event, i) => {
        const d = new Date(event.created_at);
        return `
      <tr>
        <td>${i + 1}</td>
        <td>${escapeHtml(d.toLocaleDateString("pt-BR"))}<br><small>${escapeHtml(
          d.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })
        )}</small></td>
        <td>${escapeHtml(event.product_nome || "—")}</td>
        <td>${escapeHtml(event.product_lote || "—")}</td>
        <td>${escapeHtml(tipoLabel(event.tipo))}</td>
        <td>${escapeHtml(event.motivo || "—")}</td>
        <td class="amount">${escapeHtml(fmtBRL(Number(event.custo_snapshot ?? 0)))}</td>
      </tr>`;
      })
      .join("");

    const rowsTipo = Object.entries(porTipo)
      .map(
        ([tipo, v]) => `
      <tr>
        <td>${escapeHtml(tipoLabel(tipo))}</td>
        <td class="amount">${v.qtd}</td>
        <td class="amount">${escapeHtml(fmtBRL(v.valor))}</td>
      </tr>`
      )
      .join("");

    const rowsProduto = porProduto
      .map(
        ([nome, v]) => `
      <tr>
        <td>${escapeHtml(nome)}</td>
        <td class="amount">${v.qtd}</td>
        <td class="amount">${escapeHtml(fmtBRL(v.valor))}</td>
        <td class="amount">${totalGeral > 0 ? ((v.valor / totalGeral) * 100).toFixed(1) : "0.0"}%</td>
      </tr>`
      )
      .join("");

    const generatedAt = new Date().toLocaleString("pt-BR");
    printWindow.document.open();
    printWindow.document.write(`<!doctype html>
      <html lang="pt-BR">
        <head>
          <meta charset="utf-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <title>Relatório de desperdício — ValiControl</title>
          <style>
            @page { size: A4 portrait; margin: 14mm; }
            * { box-sizing: border-box; }
            body { margin: 0; color: #111827; font-family: Arial, Helvetica, sans-serif; font-size: 11px; }
            header { display: flex; align-items: flex-end; justify-content: space-between; gap: 16px; padding-bottom: 10px; border-bottom: 2px solid #111827; }
            h1 { margin: 0 0 4px; font-size: 21px; }
            h2 { margin: 16px 0 6px; font-size: 13px; }
            p { margin: 0; color: #4b5563; }
            small { color: #6b7280; }
            .generated { text-align: right; font-size: 10px; }
            .summary { display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px; margin: 14px 0; }
            .metric { border: 1px solid #d1d5db; padding: 10px; break-inside: avoid; }
            .metric span { display: block; margin-bottom: 5px; color: #6b7280; font-size: 9px; text-transform: uppercase; }
            .metric strong { font-size: 15px; }
            table { width: 100%; border-collapse: collapse; }
            th, td { padding: 6px; border: 1px solid #d1d5db; text-align: left; vertical-align: top; }
            th { background: #f3f4f6; font-size: 9px; text-transform: uppercase; }
            tfoot td { background: #f3f4f6; font-weight: 700; }
            tr { break-inside: avoid; }
            thead { display: table-header-group; }
            .amount { text-align: right; white-space: nowrap; }
            footer { margin-top: 12px; padding-top: 6px; border-top: 1px solid #d1d5db; color: #6b7280; font-size: 9px; }
            @media print { body { print-color-adjust: exact; -webkit-print-color-adjust: exact; } }
          </style>
        </head>
        <body>
          <header>
            <div><h1>Relatório detalhado de desperdício</h1><p>ValiControl — produtos dados baixa como descarte ou vencimento</p></div>
            <p class="generated">Gerado em<br><strong>${escapeHtml(generatedAt)}</strong></p>
          </header>
          <section class="summary">
            <div class="metric"><span>Prejuízo no mês</span><strong>${escapeHtml(fmtBRL(mesAtual))}</strong></div>
            <div class="metric"><span>Prejuízo no ano</span><strong>${escapeHtml(fmtBRL(ano))}</strong></div>
            <div class="metric"><span>Prejuízo total</span><strong>${escapeHtml(fmtBRL(totalGeral))}</strong></div>
            <div class="metric"><span>Total de baixas</span><strong>${totalEventos}</strong></div>
          </section>

          <h2>Resumo por tipo de baixa</h2>
          <table>
            <thead><tr><th>Tipo</th><th class="amount">Qtd.</th><th class="amount">Valor</th></tr></thead>
            <tbody>${rowsTipo}</tbody>
          </table>

          <h2>Resumo por produto</h2>
          <table>
            <thead><tr><th>Produto</th><th class="amount">Qtd.</th><th class="amount">Valor</th><th class="amount">% do total</th></tr></thead>
            <tbody>${rowsProduto}</tbody>
          </table>

          <h2>Detalhamento das baixas</h2>
          <table>
            <thead><tr><th>#</th><th>Data / hora</th><th>Produto</th><th>Lote</th><th>Tipo</th><th>Motivo</th><th class="amount">Valor</th></tr></thead>
            <tbody>${rows}</tbody>
            <tfoot><tr><td colspan="6">Total</td><td class="amount">${escapeHtml(fmtBRL(totalGeral))}</td></tr></tfoot>
          </table>

          <footer>Relatório com ${perdas.length} registro(s) de descarte ou vencimento — ValiControl.</footer>
          <script>window.addEventListener('load', () => { window.print(); });<\/script>
        </body>
      </html>`);

    printWindow.document.close();
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-sm text-muted-foreground">
          Carregando relatório de desperdício...
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={imprimirRelatorio} variant="outline" disabled={perdas.length === 0}>
          <Printer className="w-4 h-4 mr-2" />
          Imprimir relatório
        </Button>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground flex items-center gap-2">
              <TrendingDown className="w-4 h-4 text-destructive" />
              Prejuízo no mês
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-destructive">{fmtBRL(mesAtual)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" />
              Prejuízo no ano
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{fmtBRL(ano)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground flex items-center gap-2">
              <Trash2 className="w-4 h-4" />
              Total de descartes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{totalEventos}</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Prejuízo mensal — últimos 12 meses</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="w-full h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={ultimos12} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                <XAxis dataKey="mes" fontSize={11} />
                <YAxis fontSize={11} tickFormatter={(v) => `R$${v}`} />
                <Tooltip formatter={(v: number) => fmtBRL(v)} />
                <Bar dataKey="valor" fill="hsl(var(--destructive))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Últimos descartes</CardTitle>
        </CardHeader>
        <CardContent>
          {recentes.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-6">
              Nenhum descarte registrado ainda. Use o Leitor de QR Code para registrar baixas.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-xs text-muted-foreground border-b">
                    <th className="py-2 pr-3">Data</th>
                    <th className="py-2 pr-3">Produto</th>
                    <th className="py-2 pr-3">Lote</th>
                    <th className="py-2 pr-3">Motivo</th>
                    <th className="py-2 pr-3 text-right">Valor</th>
                  </tr>
                </thead>
                <tbody>
                  {recentes.map((e) => (
                    <tr key={e.id} className="border-b last:border-0">
                      <td className="py-2 pr-3 whitespace-nowrap">
                        {new Date(e.created_at).toLocaleDateString("pt-BR")}
                      </td>
                      <td className="py-2 pr-3">{e.product_nome ?? "—"}</td>
                      <td className="py-2 pr-3">{e.product_lote ?? "—"}</td>
                      <td className="py-2 pr-3">{e.motivo ?? e.tipo}</td>
                      <td className="py-2 pr-3 text-right font-medium">
                        {fmtBRL(Number(e.custo_snapshot ?? 0))}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
