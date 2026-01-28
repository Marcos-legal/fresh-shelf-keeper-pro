import { useLocation, Link } from "react-router-dom"
import { ChevronRight, Home } from "lucide-react"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"

const routeLabels: Record<string, string> = {
  "/": "Dashboard",
  "/refrigerado": "Refrigerado",
  "/congelado": "Congelado", 
  "/ambiente": "Ambiente",
  "/camara-fria": "Câmara Fria",
  "/cadastro": "Cadastro",
  "/relatorios": "Relatórios",
  "/impressao-etiquetas": "Impressão de Etiquetas",
  "/visualizar-etiquetas": "Visualizar Etiquetas", 
  "/contagem-estoque": "Contagem de Estoque"
}

export function Breadcrumbs() {
  const location = useLocation()
  const pathSegments = location.pathname.split("/").filter(Boolean)
  
  return (
    <Breadcrumb className="text-xs sm:text-sm">
      <BreadcrumbList className="flex-wrap">
        <BreadcrumbItem>
          <BreadcrumbLink asChild>
            <Link to="/" className="flex items-center">
              <Home className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
              <span className="hidden sm:inline">Home</span>
            </Link>
          </BreadcrumbLink>
        </BreadcrumbItem>
        
        {pathSegments.map((segment, index) => {
          const path = "/" + pathSegments.slice(0, index + 1).join("/")
          const label = routeLabels[path] || segment
          const isLast = index === pathSegments.length - 1
          
          return (
            <div key={path} className="flex items-center">
              <BreadcrumbSeparator>
                <ChevronRight className="w-3 h-3 sm:w-4 sm:h-4" />
              </BreadcrumbSeparator>
              <BreadcrumbItem>
                {isLast ? (
                  <BreadcrumbPage className="truncate max-w-[120px] sm:max-w-none">{label}</BreadcrumbPage>
                ) : (
                  <BreadcrumbLink asChild>
                    <Link to={path} className="truncate max-w-[80px] sm:max-w-none">{label}</Link>
                  </BreadcrumbLink>
                )}
              </BreadcrumbItem>
            </div>
          )
        })}
      </BreadcrumbList>
    </Breadcrumb>
  )
}