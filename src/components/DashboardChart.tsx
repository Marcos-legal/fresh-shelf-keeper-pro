import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, PieChart, Pie, Cell } from "recharts"
import { TrendingUp } from "lucide-react"

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

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
      <Card className="animate-fade-in">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Produtos por Local
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig}>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={barData}>
                <XAxis 
                  dataKey="name" 
                  tick={{ fontSize: 12 }}
                  angle={-45}
                  textAnchor="end"
                  height={60}
                />
                <YAxis tick={{ fontSize: 12 }} />
                <ChartTooltip 
                  content={<ChartTooltipContent />}
                />
                <Bar dataKey="value" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>

      <Card className="animate-fade-in">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Status dos Produtos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig}>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  dataKey="value"
                  label={({ name, value }) => `${name}: ${value}`}
                  labelLine={false}
                />
                <ChartTooltip 
                  content={<ChartTooltipContent />}
                />
              </PieChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>
    </div>
  )
}