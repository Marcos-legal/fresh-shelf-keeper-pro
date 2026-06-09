import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingDown, AlertTriangle, Trash2 } from "lucide-react";
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

export function DesperdicioSection() {
  const { events, loading } = useProductEvents();

  const { mesAtual, ano, ultimos12, recentes, totalEventos } = useMemo(() => {
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
      totalEventos: losses.length,
    };
  }, [events]);

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
