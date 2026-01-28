import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts"
import { TrendingUp, Package, AlertTriangle } from "lucide-react"

interface DashboardChartProps {
  categoryData: Record<string, number>
  statusData: {
    validos: number
    proximoVencimento: number
    vencidos: number
  }
}

const chartConfig = {
  refrigerado: {
    label: "Refrigerado",
    color: "hsl(var(--chart-1))",
  },
  congelado: {
    label: "Congelado", 
    color: "hsl(var(--chart-2))",
  },
  ambiente: {
    label: "Ambiente",
    color: "hsl(var(--chart-3))",
  },
  camaraFria: {
    label: "Câmara Fria",
    color: "hsl(var(--chart-4))",
  },
  validos: {
    label: "Válidos",
    color: "hsl(var(--success))",
  },
  proximoVencimento: {
    label: "Próx. Vencimento",
    color: "hsl(var(--warning))",
  },
  vencidos: {
    label: "Vencidos",
    color: "hsl(var(--destructive))",
  },
} satisfies ChartConfig

export function DashboardChart({ categoryData, statusData }: DashboardChartProps) {
  const barData = [
    { name: "Refrigerado", value: categoryData.refrigerado || 0, fill: "hsl(var(--chart-1))" },
    { name: "Congelado", value: categoryData.congelado || 0, fill: "hsl(var(--chart-2))" },
    { name: "Ambiente", value: categoryData.ambiente || 0, fill: "hsl(var(--chart-3))" },
    { name: "Câmara Fria", value: categoryData["camara-fria"] || 0, fill: "hsl(var(--chart-4))" },
  ]

  const pieData = [
    { name: "Válidos", value: statusData.validos, fill: "hsl(var(--success))" },
    { name: "Próx. Vencimento", value: statusData.proximoVencimento, fill: "hsl(var(--warning))" },
    { name: "Vencidos", value: statusData.vencidos, fill: "hsl(var(--destructive))" },
  ]

  const totalProducts = Object.values(categoryData).reduce((acc, val) => acc + val, 0)
  const totalStatus = statusData.validos + statusData.proximoVencimento + statusData.vencidos

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mb-4 sm:mb-8">
      <Card className="animate-fade-in hover-scale gradient-border">
        <CardHeader className="pb-2 p-3 sm:p-6">
          <CardTitle className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Package className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
              <span className="gradient-text text-sm sm:text-base">Distribuição por Local</span>
            </div>
            <div className="text-xs sm:text-sm text-muted-foreground bg-muted px-2 py-1 rounded-full w-fit">
              Total: {totalProducts}
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-2 sm:p-6">
          <ChartContainer config={chartConfig}>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={barData} margin={{ top: 10, right: 10, left: 0, bottom: 50 }}>
                <defs>
                  <linearGradient id="barGradient1" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="hsl(var(--chart-1))" stopOpacity={0.8} />
                    <stop offset="100%" stopColor="hsl(var(--chart-1))" stopOpacity={0.3} />
                  </linearGradient>
                  <linearGradient id="barGradient2" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="hsl(var(--chart-2))" stopOpacity={0.8} />
                    <stop offset="100%" stopColor="hsl(var(--chart-2))" stopOpacity={0.3} />
                  </linearGradient>
                  <linearGradient id="barGradient3" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="hsl(var(--chart-3))" stopOpacity={0.8} />
                    <stop offset="100%" stopColor="hsl(var(--chart-3))" stopOpacity={0.3} />
                  </linearGradient>
                  <linearGradient id="barGradient4" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="hsl(var(--chart-4))" stopOpacity={0.8} />
                    <stop offset="100%" stopColor="hsl(var(--chart-4))" stopOpacity={0.3} />
                  </linearGradient>
                </defs>
                <XAxis 
                  dataKey="name" 
                  tick={{ fontSize: 9, fill: "hsl(var(--muted-foreground))" }}
                  angle={-45}
                  textAnchor="end"
                  height={50}
                  stroke="hsl(var(--border))"
                  interval={0}
                />
                <YAxis 
                  tick={{ fontSize: 9, fill: "hsl(var(--muted-foreground))" }}
                  stroke="hsl(var(--border))"
                  width={30}
                />
                <ChartTooltip 
                  content={<ChartTooltipContent />}
                  cursor={{ fill: "hsl(var(--muted))", opacity: 0.3 }}
                />
                <Bar 
                  dataKey="value" 
                  radius={[4, 4, 0, 0]}
                >
                  {barData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={`url(#barGradient${(index % 4) + 1})`} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>

      <Card className="animate-fade-in hover-scale gradient-border">
        <CardHeader className="pb-2 p-3 sm:p-6">
          <CardTitle className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 sm:w-5 sm:h-5 text-warning" />
              <span className="gradient-text text-sm sm:text-base">Status de Validade</span>
            </div>
            <div className="text-xs sm:text-sm text-muted-foreground bg-muted px-2 py-1 rounded-full w-fit">
              Total: {totalStatus}
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-2 sm:p-6">
          <ChartContainer config={chartConfig}>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <defs>
                  <linearGradient id="pieGradient1" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="hsl(var(--success))" stopOpacity={0.8} />
                    <stop offset="100%" stopColor="hsl(var(--success))" stopOpacity={0.4} />
                  </linearGradient>
                  <linearGradient id="pieGradient2" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="hsl(var(--warning))" stopOpacity={0.8} />
                    <stop offset="100%" stopColor="hsl(var(--warning))" stopOpacity={0.4} />
                  </linearGradient>
                  <linearGradient id="pieGradient3" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="hsl(var(--destructive))" stopOpacity={0.8} />
                    <stop offset="100%" stopColor="hsl(var(--destructive))" stopOpacity={0.4} />
                  </linearGradient>
                </defs>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="45%"
                  outerRadius={70}
                  innerRadius={30}
                  dataKey="value"
                  stroke="hsl(var(--background))"
                  strokeWidth={2}
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
                  height={36}
                  wrapperStyle={{ fontSize: '11px' }}
                  formatter={(value, entry) => (
                    <span style={{ color: entry.color, fontWeight: 500, fontSize: '11px' }}>
                      {value}: {entry.payload.value}
                    </span>
                  )}
                />
              </PieChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>
    </div>
  )
}