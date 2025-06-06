
import { useState, useEffect, useMemo } from "react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { useProducts } from "@/hooks/useProducts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { PackageSearch, FileDown, XCircle } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import * as XLSX from 'xlsx';
import { DatePicker } from "@/components/ui/date-picker";
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const Relatorios = () => {
  const { products } = useProducts();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [filteredProducts, setFilteredProducts] = useState(products);
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);

  useEffect(() => {
    let results = products.filter(product =>
      product.nome.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (selectedCategory && selectedCategory !== "all") {
      results = results.filter(product => product.localArmazenamento === selectedCategory);
    }

    if (startDate && endDate) {
      results = results.filter(product => {
        if (product.criadoEm) {
          const productDate = new Date(product.criadoEm);
          return productDate >= startDate && productDate <= endDate;
        }
        return false;
      });
    }

    setFilteredProducts(results);
  }, [searchTerm, selectedCategory, products, startDate, endDate]);

  const exportToExcel = () => {
    if (filteredProducts.length === 0) {
      toast({
        title: "Nenhum produto para exportar",
        description: "Não há produtos para serem exportados.",
        variant: "destructive",
      });
      return;
    }

    // Preparar dados para a planilha com formatação melhorada
    const excelData = filteredProducts.map((product, index) => {
      const formatDate = (date: any) => {
        if (!date) return '';
        try {
          if (typeof date === 'string') {
            if (date.includes('/')) return date;
            const [year, month, day] = date.split('-').map(Number);
            if (year && month && day) {
              const dateObj = new Date(year, month - 1, day);
              return dateObj.toLocaleDateString('pt-BR');
            }
          }
          if (date instanceof Date && !isNaN(date.getTime())) {
            return date.toLocaleDateString('pt-BR');
          }
          return String(date);
        } catch {
          return '';
        }
      };

      const getStatusDescription = (status: string) => {
        switch (status) {
          case 'valido': return '✅ VÁLIDO';
          case 'proximo-vencimento': return '⚠️ PRÓXIMO VENCIMENTO';
          case 'vencido': return '❌ VENCIDO';
          default: return status.toUpperCase();
        }
      };

      const getLocalDescription = (local: string) => {
        switch (local) {
          case 'refrigerado': return '🧊 REFRIGERADO';
          case 'congelado': return '❄️ CONGELADO';
          case 'ambiente': return '🌡️ AMBIENTE';
          case 'camara-fria': return '🧊 CÂMARA FRIA';
          default: return local.toUpperCase();
        }
      };

      return {
        'ITEM': index + 1,
        'PRODUTO': product.nome || '',
        'LOTE': product.lote || '',
        'MARCA': product.marca || '',
        'DATA FABRICAÇÃO': formatDate(product.dataFabricacao),
        'DATA VALIDADE': formatDate(product.validade),
        'DATA ABERTURA': formatDate(product.dataAbertura),
        'UTILIZAR ATÉ': formatDate(product.utilizarAte),
        'DIAS RESTANTES': product.utilizarAte ? Math.ceil((new Date(product.utilizarAte).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)) : '',
        'LOCAL ARMAZENAMENTO': getLocalDescription(product.localArmazenamento),
        'RESPONSÁVEL': product.responsavel || '',
        'STATUS': getStatusDescription(product.status),
        'CRIADO EM': formatDate(product.criadoEm),
        'ATUALIZADO EM': formatDate(product.atualizadoEm)
      };
    });

    // Criar workbook e worksheet
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(excelData);

    // Configurar largura das colunas
    const colWidths = [
      { wch: 6 },   // ITEM
      { wch: 25 },  // PRODUTO
      { wch: 15 },  // LOTE
      { wch: 15 },  // MARCA
      { wch: 15 },  // DATA FABRICAÇÃO
      { wch: 15 },  // DATA VALIDADE
      { wch: 15 },  // DATA ABERTURA
      { wch: 15 },  // UTILIZAR ATÉ
      { wch: 15 },  // DIAS RESTANTES
      { wch: 20 },  // LOCAL ARMAZENAMENTO
      { wch: 20 },  // RESPONSÁVEL
      { wch: 20 },  // STATUS
      { wch: 15 },  // CRIADO EM
      { wch: 15 }   // ATUALIZADO EM
    ];
    ws['!cols'] = colWidths;

    // Adicionar formatação condicional para o cabeçalho
    const headerRange = XLSX.utils.decode_range(ws['!ref'] || 'A1');
    for (let col = headerRange.s.c; col <= headerRange.e.c; col++) {
      const cellAddress = XLSX.utils.encode_cell({ r: 0, c: col });
      if (!ws[cellAddress]) continue;
      
      ws[cellAddress].s = {
        font: { bold: true, sz: 12, color: { rgb: "FFFFFF" } },
        fill: { fgColor: { rgb: "366092" } },
        alignment: { horizontal: "center", vertical: "center" },
        border: {
          top: { style: "thin", color: { rgb: "000000" } },
          bottom: { style: "thin", color: { rgb: "000000" } },
          left: { style: "thin", color: { rgb: "000000" } },
          right: { style: "thin", color: { rgb: "000000" } }
        }
      };
    }

    // Adicionar bordas para todas as células
    const range = XLSX.utils.decode_range(ws['!ref'] || 'A1');
    for (let row = range.s.r; row <= range.e.r; row++) {
      for (let col = range.s.c; col <= range.e.c; col++) {
        const cellAddress = XLSX.utils.encode_cell({ r: row, c: col });
        if (!ws[cellAddress]) continue;
        
        if (!ws[cellAddress].s) ws[cellAddress].s = {};
        ws[cellAddress].s.border = {
          top: { style: "thin", color: { rgb: "000000" } },
          bottom: { style: "thin", color: { rgb: "000000" } },
          left: { style: "thin", color: { rgb: "000000" } },
          right: { style: "thin", color: { rgb: "000000" } }
        };
        
        // Alternar cores das linhas
        if (row > 0) {
          ws[cellAddress].s.fill = {
            fgColor: { rgb: row % 2 === 0 ? "F8F9FA" : "FFFFFF" }
          };
        }
      }
    }

    XLSX.utils.book_append_sheet(wb, ws, "Relatório de Produtos");

    // Gerar nome do arquivo com data/hora
    const now = new Date();
    const timestamp = now.toLocaleString('pt-BR').replace(/[/:]/g, '-').replace(', ', '_');
    const filename = `relatorio_produtos_${timestamp}.xlsx`;

    XLSX.writeFile(wb, filename);

    toast({
      title: "Relatório exportado com sucesso!",
      description: `Arquivo "${filename}" foi baixado com ${filteredProducts.length} produto(s).`,
    });
  };

  const clearFilters = () => {
    setSearchTerm("");
    setSelectedCategory("all");
    setStartDate(undefined);
    setEndDate(undefined);
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-gradient-to-br from-gray-50 to-blue-50">
        <AppSidebar />
        <main className="flex-1">
          <div className="p-6">
            <div className="flex items-center space-x-4 mb-8">
              <SidebarTrigger className="lg:hidden" />
              <div className="flex items-center space-x-4">
                <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-3 rounded-xl shadow-lg">
                  <PackageSearch className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-blue-600 bg-clip-text text-transparent">
                    📊 Relatórios
                  </h1>
                  <p className="text-gray-600 mt-1 text-lg">
                    Visualize e exporte os dados dos seus produtos
                  </p>
                </div>
              </div>
            </div>

            {/* Filtros e Exportação */}
            <Card className="mb-6 shadow-lg border-0 bg-gradient-to-r from-white to-gray-50">
              <CardHeader className="bg-gradient-to-r from-gray-800 to-gray-900 text-white rounded-t-lg">
                <CardTitle className="flex items-center space-x-2">
                  <PackageSearch className="w-5 h-5" />
                  <span>Filtros e Exportação</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="search" className="text-sm text-gray-600">
                      Pesquisar Produto
                    </Label>
                    <Input
                      type="search"
                      id="search"
                      placeholder="Nome do produto..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="category" className="text-sm text-gray-600">
                      Filtrar por Categoria
                    </Label>
                    <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Todas as categorias" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todas as categorias</SelectItem>
                        <SelectItem value="refrigerado">Refrigerado</SelectItem>
                        <SelectItem value="congelado">Congelado</SelectItem>
                        <SelectItem value="ambiente">Ambiente</SelectItem>
                        <SelectItem value="camara-fria">Câmara Fria</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-sm text-gray-600">
                      Filtrar por Data de Criação
                    </Label>
                    <div className="flex items-center space-x-2">
                      <DatePicker
                        id="start-date"
                        placeholderText="Data inicial"
                        selected={startDate}
                        onChange={(date: Date | undefined) => setStartDate(date)}
                        dateFormat="dd/MM/yyyy"
                        locale={ptBR}
                      />
                      <DatePicker
                        id="end-date"
                        placeholderText="Data final"
                        selected={endDate}
                        onChange={(date: Date | undefined) => setEndDate(date)}
                        dateFormat="dd/MM/yyyy"
                        locale={ptBR}
                      />
                    </div>
                  </div>
                </div>
                <div className="flex justify-between items-center mt-4">
                  <Button
                    onClick={clearFilters}
                    variant="ghost"
                    className="text-gray-600 hover:bg-gray-100"
                  >
                    <XCircle className="w-4 h-4 mr-2" />
                    Limpar Filtros
                  </Button>
                  <Button
                    onClick={exportToExcel}
                    className="gradient-blue text-white font-bold shadow-lg"
                  >
                    <FileDown className="w-4 h-4 mr-2" />
                    Exportar para Excel ({filteredProducts.length})
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Lista de Produtos Filtrados */}
            {filteredProducts.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredProducts.map((product) => (
                  <Card key={product.id} className="shadow-sm">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">{product.nome}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-sm text-gray-600 space-y-1">
                        <p>
                          <span className="font-bold">Lote:</span> {product.lote}
                        </p>
                        <p>
                          <span className="font-bold">Marca:</span> {product.marca}
                        </p>
                        <p>
                          <span className="font-bold">Validade:</span>{" "}
                          {product.validade ? format(new Date(product.validade), 'dd/MM/yyyy', { locale: ptBR }) : 'N/A'}
                        </p>
                        <p>
                          <span className="font-bold">Local:</span> {product.localArmazenamento}
                        </p>
                        <p>
                          <span className="font-bold">Responsável:</span> {product.responsavel}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="shadow-sm">
                <CardContent className="text-center py-8">
                  <PackageSearch className="w-10 h-10 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Nenhum produto encontrado
                  </h3>
                  <p className="text-gray-600">
                    Altere os filtros ou adicione novos produtos.
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
};

export default Relatorios;
