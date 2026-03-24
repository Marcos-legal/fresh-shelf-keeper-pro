import { CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts"
import { BarChart3, PieChart as PieChartIcon } from "lucide-react"

interface DashboardChartProps {
  categoryData: Record<string, number>
  statusData: {
    validos: number
    proximoVencimento: number
    vencidos: number
  }
}

const chartConfig = {
  refrigerado: { label: "Refrigerado", color: "hsl(var(--chart-1))" },
  congelado: { label: "Congelado", color: "hsl(var(--chart-2))" },
  ambiente: { label: "Ambiente", color: "hsl(var(--chart-3))" },
  camaraFria: { label: "Câmara Fria", color: "hsl(var(--chart-4))" },
  validos: { label: "Válidos", color: "hsl(var(--success))" },
  proximoVencimento: { label: "Próx. Vencimento", color: "hsl(var(--warning))" },
  vencidos: { label: "Vencidos", color: "hsl(var(--destructive))" },
} satisfies ChartConfig

const COLORS = [
  "hsl(var(--chart-1))",
  "hsl(var(--chart-2))",
  "hsl(var(--chart-3))",
  "hsl(var(--chart-4))",
]

export function DashboardChart({ categoryData, statusData }: DashboardChartProps) {
  const barData = [
    { name: "Refrigerado", value: categoryData.refrigerado || 0 },
    { name: "Congelado", value: categoryData.congelado || 0 },
    { name: "Ambiente", value: categoryData.ambiente || 0 },
    { name: "Câmara Fria", value: categoryData["camara-fria"] || 0 },
  ]

  const pieData = [
    { name: "Válidos", value: statusData.validos, fill: "hsl(var(--success))" },
    { name: "Próx. Vencimento", value: statusData.proximoVencimento, fill: "hsl(var(--warning))" },
    { name: "Vencidos", value: statusData.vencidos, fill: "hsl(var(--destructive))" },
  ]

  const totalProducts = Object.values(categoryData).reduce((acc, val) => acc + val, 0)
  const totalStatus = statusData.validos + statusData.proximoVencimento + statusData.vencidos

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mb-6">
      {/* Bar Chart */}
      <div className="bg-card rounded-xl border border-border/60 animate-fade-in">
        <CardHeader className="pb-2 p-4 sm:p-6">
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm font-semibold text-foreground">Por Local de Armazenamento</span>
            </div>
            <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded-md">
              {totalProducts} total
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-3 sm:p-6 pt-0">
          <ChartContainer config={chartConfig}>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={barData} margin={{ top: 8, right: 8, left: -8, bottom: 40 }}>
                <XAxis 
                  dataKey="name" 
                  tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
                  angle={-35}
                  textAnchor="end"
                  height={45}
                  stroke="hsl(var(--border))"
                  interval={0}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis 
                  tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
                  stroke="hsl(var(--border))"
                  width={28}
                  tickLine={false}
                  axisLine={false}
                />
                <ChartTooltip 
                  content={<ChartTooltipContent />}
                  cursor={{ fill: "hsl(var(--muted))", opacity: 0.3 }}
                />
                <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                  {barData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} opacity={0.85} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </div>

      {/* Pie Chart */}
      <div className="bg-card rounded-xl border border-border/60 animate-fade-in">
        <CardHeader className="pb-2 p-4 sm:p-6">
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <PieChartIcon className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm font-semibold text-foreground">Status de Validade</span>
            </div>
            <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded-md">
              {totalStatus} total
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-3 sm:p-6 pt-0">
          <ChartContainer config={chartConfig}>
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="45%"
                  outerRadius={70}
                  innerRadius={35}
                  dataKey="value"
                  stroke="hsl(var(--card))"
                  strokeWidth={3}
                />
                <ChartTooltip 
                  content={<ChartTooltipContent 
                    formatter={(value, name) => [
                      `${value} produto${value !== 1 ? 's' : ''}`,
                      name
                    ]}
                  />}
                />
                <Legend 
                  verticalAlign="bottom" 
                  height={32}
                  wrapperStyle={{ fontSize: '11px' }}
                  formatter={(value, entry) => (
                    <span style={{ color: 'hsl(var(--muted-foreground))', fontWeight: 500, fontSize: '11px' }}>
                      {value}: {(entry as any).payload?.value}
                    </span>
                  )}
                />
              </PieChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </div>
    </div>
  )
}
