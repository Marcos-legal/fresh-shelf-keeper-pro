import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Edit, Eye, Printer, X, Calendar, EyeOff } from "lucide-react";
import { Product, StorageLocation } from "@/types/product";
import { EtiquetaPreview } from "./EtiquetaPreview";
import { TextInputField } from "@/components/form/TextInputField";
import { DatePickerField } from "@/components/form/DatePickerField";
import { NumberInputField } from "@/components/form/NumberInputField";
import { SelectField } from "@/components/form/SelectField";
import { ValidadeField } from "@/components/form/ValidadeField";
import { ResponsavelSelectField } from "@/components/form/ResponsavelSelectField";

interface EtiquetaEditorProps {
  product: Product;
  largura: number;
  altura: number;
  onPrint: (editedProduct: Product, responsavel: string, quantity: number) => void;
  onClose: () => void;
}

interface EditableProduct {
  nome: string;
  lote: string;
  marca: string;
  dataFabricacao: string;
  validade: string;
  dataAbertura: string;
  diasParaVencer: number;
  utilizarAte: Date | undefined;
  localArmazenamento: StorageLocation | '';
  responsavel: string;
  showOptionalDates: boolean;
}

const storageOptions: { value: StorageLocation; label: string }[] = [
  { value: 'refrigerado', label: 'Refrigerado' },
  { value: 'congelado', label: 'Congelado' },
  { value: 'ambiente', label: 'Ambiente' },
  { value: 'camara-fria', label: 'Câmara Fria' },
];

// Helper to format Date to string (YYYY-MM-DD)
const formatDateToString = (date: Date | string | undefined): string => {
  if (!date) return '';
  if (typeof date === 'string') {
    if (date.includes('/')) return date;
    return date;
  }
  if (date instanceof Date && !isNaN(date.getTime())) {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  }
  return '';
};

// Helper to parse string to Date
const parseStringToDate = (dateStr: string): Date | undefined => {
  if (!dateStr) return undefined;
  
  // Handle ISO format YYYY-MM-DD
  if (dateStr.includes('-')) {
    const [year, month, day] = dateStr.split('-').map(Number);
    if (year && month && day) {
      return new Date(year, month - 1, day);
    }
  }
  
  // Handle DD/MM/YYYY or MM/YYYY or DD/MM/YY
  if (dateStr.includes('/')) {
    const parts = dateStr.split('/');
    
    // Case MES/ANO (e.g., NOVEMBRO/2025)
    if (isNaN(Number(parts[0]))) {
      const meses = [
        'JANEIRO', 'FEVEREIRO', 'MARÇO', 'ABRIL', 'MAIO', 'JUNHO',
        'JULHO', 'AGOSTO', 'SETEMBRO', 'OUTUBRO', 'NOVEMBRO', 'DEZEMBRO'
      ];
      const mesIndex = meses.indexOf(parts[0].toUpperCase());
      const year = Number(parts[1]);
      if (mesIndex !== -1 && year) {
        return new Date(year, mesIndex, 1);
      }
      return undefined;
    }

    if (parts.length === 3) {
      // DD/MM/YYYY
      const day = Number(parts[0]);
      const month = Number(parts[1]);
      let year = Number(parts[2]);
      if (year < 100) year += 2000;
      return new Date(year, month - 1, day);
    } else if (parts.length === 2) {
      // MM/YYYY
      const month = Number(parts[0]);
      let year = Number(parts[1]);
      if (year < 100) year += 2000;
      return new Date(year, month - 1, 1);
    }
  }
  
  return undefined;
};

export function EtiquetaEditor({ product, largura, altura, onPrint, onClose }: EtiquetaEditorProps) {
  const [editedProduct, setEditedProduct] = useState<EditableProduct>({
    nome: product.nome || '',
    lote: product.lote || '',
    marca: product.marca || '',
    dataFabricacao: formatDateToString(product.dataFabricacao),
    validade: formatDateToString(product.validade),
    dataAbertura: formatDateToString(product.dataAbertura),
    diasParaVencer: product.diasParaVencer || 0,
    utilizarAte: product.utilizarAte,
    localArmazenamento: product.localArmazenamento || '',
    responsavel: '',
    showOptionalDates: false
  });
  
  const [quantity, setQuantity] = useState(1);

  const handleInputChange = (field: keyof EditableProduct, value: string) => {
    setEditedProduct(prev => {
      const updated = { ...prev, [field]: value };
      
      // Recalculate utilizarAte when dataAbertura or diasParaVencer changes
      if (field === 'dataAbertura' || field === 'diasParaVencer') {
        const abertura = field === 'dataAbertura' ? value : prev.dataAbertura;
        const dias = field === 'diasParaVencer' ? parseInt(value) || 0 : prev.diasParaVencer;
        
        if (abertura && dias > 0) {
          const [year, month, day] = abertura.split('-').map(Number);
          if (year && month && day) {
            const useBy = new Date(year, month - 1, day + dias);
            updated.utilizarAte = useBy;
          }
        } else {
          updated.utilizarAte = undefined;
        }
      }
      
      return updated;
    });
  };

  const handleNumberInputChange = (field: keyof EditableProduct, value: number) => {
    setEditedProduct(prev => {
      const updated = { ...prev, [field]: value };
      
      // Recalculate utilizarAte when diasParaVencer changes
      if (field === 'diasParaVencer' && prev.dataAbertura && value > 0) {
        const [year, month, day] = prev.dataAbertura.split('-').map(Number);
        if (year && month && day) {
          const useBy = new Date(year, month - 1, day + value);
          updated.utilizarAte = useBy;
        }
      } else if (field === 'diasParaVencer') {
        updated.utilizarAte = undefined;
      }
      
      return updated;
    });
  };

  const handleToggleOptionalDates = (show: boolean) => {
    setEditedProduct(prev => ({ ...prev, showOptionalDates: show }));
  };

  const handleUpdateDates = () => {
    const today = new Date().toISOString().split('T')[0];
    setEditedProduct(prev => {
      const updated = {
        ...prev,
        dataFabricacao: today,
        dataAbertura: today
      };
      
      // Recalculate utilizarAte
      if (prev.diasParaVencer > 0) {
        const [year, month, day] = today.split('-').map(Number);
        const useBy = new Date(year, month - 1, day + prev.diasParaVencer);
        updated.utilizarAte = useBy;
      }
      
      return updated;
    });
  };

  const handlePrint = () => {
    if (!editedProduct.responsavel.trim()) {
      return;
    }

    const productToPrint: Product = {
      ...product,
      nome: editedProduct.nome,
      lote: editedProduct.lote,
      marca: editedProduct.marca,
      dataFabricacao: parseStringToDate(editedProduct.dataFabricacao),
      validade: parseStringToDate(editedProduct.validade),
      dataAbertura: parseStringToDate(editedProduct.dataAbertura),
      diasParaVencer: editedProduct.diasParaVencer,
      utilizarAte: editedProduct.utilizarAte,
      localArmazenamento: editedProduct.localArmazenamento as StorageLocation || 'ambiente',
      responsavel: editedProduct.responsavel
    };

    onPrint(productToPrint, editedProduct.responsavel, quantity);
  };

  // Build preview product
  const previewProduct: Product = {
    ...product,
    nome: editedProduct.nome,
    lote: editedProduct.lote,
    marca: editedProduct.marca,
    dataFabricacao: parseStringToDate(editedProduct.dataFabricacao),
    validade: parseStringToDate(editedProduct.validade),
    dataAbertura: parseStringToDate(editedProduct.dataAbertura),
    diasParaVencer: editedProduct.diasParaVencer,
    utilizarAte: editedProduct.utilizarAte,
    localArmazenamento: editedProduct.localArmazenamento as StorageLocation || 'ambiente',
    responsavel: editedProduct.responsavel
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Edit className="w-5 h-5 text-primary" />
          <h3 className="font-semibold text-lg">Editar Etiqueta</h3>
        </div>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="w-4 h-4" />
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Formulário de Edição - Seguindo o padrão do ProductForm */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Edit className="w-4 h-4" />
              Informações da Etiqueta
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Botões de ação */}
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 sm:justify-between items-stretch sm:items-center mb-4">
              <Button 
                type="button" 
                variant="outline" 
                onClick={handleUpdateDates}
                className="text-primary w-full sm:w-auto text-sm"
                size="sm"
              >
                <Calendar className="w-4 h-4 mr-2" />
                <span className="hidden sm:inline">Atualizar Datas (Hoje)</span>
                <span className="sm:hidden">Datas (Hoje)</span>
              </Button>
              
              <Button
                type="button"
                variant="outline"
                onClick={() => handleToggleOptionalDates(!editedProduct.showOptionalDates)}
                className="text-muted-foreground w-full sm:w-auto text-sm"
                size="sm"
              >
                {editedProduct.showOptionalDates ? (
                  <>
                    <EyeOff className="w-4 h-4 mr-2" />
                    <span className="hidden sm:inline">Ocultar Datas Opcionais</span>
                    <span className="sm:hidden">Ocultar Opcionais</span>
                  </>
                ) : (
                  <>
                    <Eye className="w-4 h-4 mr-2" />
                    <span className="hidden sm:inline">Mostrar Datas Opcionais</span>
                    <span className="sm:hidden">Mostrar Opcionais</span>
                  </>
                )}
              </Button>
            </div>

            {/* Campos do formulário - Layout igual ao ProductForm */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <TextInputField
                id="nome"
                label="Nome do Produto (Opcional)"
                value={editedProduct.nome}
                onChange={(value) => handleInputChange('nome', value)}
                placeholder="Digite o nome do produto"
              />

              <TextInputField
                id="lote"
                label="Lote (Opcional)"
                value={editedProduct.lote}
                onChange={(value) => handleInputChange('lote', value)}
                placeholder="Digite o lote"
              />

              <TextInputField
                id="marca"
                label="Marca (Opcional)"
                value={editedProduct.marca}
                onChange={(value) => handleInputChange('marca', value)}
                placeholder="Digite a marca"
              />

              {editedProduct.showOptionalDates && (
                <>
                  <DatePickerField
                    id="dataFabricacao"
                    label="Data de Fabricação (Opcional)"
                    value={editedProduct.dataFabricacao}
                    onChange={(value) => handleInputChange('dataFabricacao', value)}
                    required={false}
                  />

                  <ValidadeField
                    label="Data de Validade (Opcional)"
                    value={editedProduct.validade}
                    onChange={(value) => handleInputChange('validade', value)}
                    required={false}
                  />
                </>
              )}

              <DatePickerField
                id="dataAbertura"
                label="Data de Abertura (Opcional)"
                value={editedProduct.dataAbertura}
                onChange={(value) => handleInputChange('dataAbertura', value)}
                required={false}
              />

              <NumberInputField
                id="diasParaVencer"
                label="Dias para Vencer após Abertura (Opcional)"
                value={editedProduct.diasParaVencer}
                onChange={(value) => handleNumberInputChange('diasParaVencer', value)}
                min={0}
                required={false}
              />

              <SelectField
                label="Local de Armazenamento (Opcional)"
                value={editedProduct.localArmazenamento}
                onChange={(value: StorageLocation) => handleInputChange('localArmazenamento', value)}
                options={storageOptions}
                placeholder="Selecione o local"
                required={false}
              />
            </div>

            {/* Responsável e Quantidade */}
            <div className="pt-4 border-t space-y-4">
              <ResponsavelSelectField
                label="Responsável"
                value={editedProduct.responsavel}
                onChange={(value) => handleInputChange('responsavel', value)}
                required={true}
              />

              <div className="space-y-2">
                <Label htmlFor="quantity">Quantidade de Etiquetas</Label>
                <Input
                  id="quantity"
                  type="number"
                  min="1"
                  max="99"
                  value={quantity}
                  onChange={(e) => setQuantity(Math.max(1, Math.min(99, parseInt(e.target.value) || 1)))}
                  className="w-24"
                />
              </div>

              {/* Botão de Imprimir */}
              <Button 
                onClick={handlePrint} 
                className="w-full gradient-blue text-white"
                disabled={!editedProduct.responsavel.trim()}
              >
                <Printer className="w-4 h-4 mr-2" />
                Imprimir {quantity} Etiqueta{quantity > 1 ? 's' : ''}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Preview em Tempo Real */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Eye className="w-4 h-4" />
              Preview da Etiqueta ({largura}×{altura}mm)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex justify-center items-center p-4 bg-muted/30 rounded-lg min-h-[300px]">
              <EtiquetaPreview 
                product={previewProduct} 
                largura={largura} 
                altura={altura} 
              />
            </div>
            <div className="mt-4 p-3 bg-primary/5 rounded-lg">
              <p className="text-xs text-muted-foreground text-center">
                As alterações são refletidas automaticamente no preview acima
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
