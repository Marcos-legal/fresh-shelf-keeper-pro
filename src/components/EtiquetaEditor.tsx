import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon, Edit, Eye, Printer, X } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { Product, StorageLocation } from "@/types/product";
import { EtiquetaPreview } from "./EtiquetaPreview";
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
  dataFabricacao: Date | undefined;
  validade: Date | undefined;
  dataAbertura: Date | undefined;
  utilizarAte: Date | undefined;
  localArmazenamento: StorageLocation;
  responsavel: string;
}

export function EtiquetaEditor({ product, largura, altura, onPrint, onClose }: EtiquetaEditorProps) {
  const [editedProduct, setEditedProduct] = useState<EditableProduct>({
    nome: product.nome || '',
    lote: product.lote || '',
    marca: product.marca || '',
    dataFabricacao: product.dataFabricacao ? new Date(product.dataFabricacao) : undefined,
    validade: product.validade ? (typeof product.validade === 'string' ? new Date(product.validade) : product.validade) : undefined,
    dataAbertura: product.dataAbertura ? new Date(product.dataAbertura) : undefined,
    utilizarAte: product.utilizarAte ? new Date(product.utilizarAte) : undefined,
    localArmazenamento: product.localArmazenamento || 'ambiente',
    responsavel: ''
  });
  
  const [quantity, setQuantity] = useState(1);

  const handleFieldChange = (field: keyof EditableProduct, value: any) => {
    setEditedProduct(prev => ({
      ...prev,
      [field]: value
    }));
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
      dataFabricacao: editedProduct.dataFabricacao,
      validade: editedProduct.validade,
      dataAbertura: editedProduct.dataAbertura,
      utilizarAte: editedProduct.utilizarAte,
      localArmazenamento: editedProduct.localArmazenamento,
      responsavel: editedProduct.responsavel
    };

    onPrint(productToPrint, editedProduct.responsavel, quantity);
  };

  const previewProduct: Product = {
    ...product,
    nome: editedProduct.nome,
    lote: editedProduct.lote,
    marca: editedProduct.marca,
    dataFabricacao: editedProduct.dataFabricacao,
    validade: editedProduct.validade,
    dataAbertura: editedProduct.dataAbertura,
    utilizarAte: editedProduct.utilizarAte,
    localArmazenamento: editedProduct.localArmazenamento,
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
        {/* Formulário de Edição */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Edit className="w-4 h-4" />
              Informações da Etiqueta
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Nome do Produto */}
            <div className="space-y-2">
              <Label htmlFor="nome">Nome do Produto</Label>
              <Input
                id="nome"
                value={editedProduct.nome}
                onChange={(e) => handleFieldChange('nome', e.target.value)}
                placeholder="Nome do produto"
              />
            </div>

            {/* Lote e Marca */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="lote">Lote</Label>
                <Input
                  id="lote"
                  value={editedProduct.lote}
                  onChange={(e) => handleFieldChange('lote', e.target.value)}
                  placeholder="Nº do lote"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="marca">Marca</Label>
                <Input
                  id="marca"
                  value={editedProduct.marca}
                  onChange={(e) => handleFieldChange('marca', e.target.value)}
                  placeholder="Marca"
                />
              </div>
            </div>

            {/* Data de Fabricação e Validade */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Data de Fabricação</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !editedProduct.dataFabricacao && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {editedProduct.dataFabricacao ? (
                        format(editedProduct.dataFabricacao, "dd/MM/yyyy", { locale: ptBR })
                      ) : (
                        <span>Selecionar</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={editedProduct.dataFabricacao}
                      onSelect={(date) => handleFieldChange('dataFabricacao', date)}
                      initialFocus
                      className="pointer-events-auto"
                      locale={ptBR}
                    />
                  </PopoverContent>
                </Popover>
              </div>
              <div className="space-y-2">
                <Label>Validade</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !editedProduct.validade && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {editedProduct.validade ? (
                        format(editedProduct.validade, "dd/MM/yyyy", { locale: ptBR })
                      ) : (
                        <span>Selecionar</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={editedProduct.validade}
                      onSelect={(date) => handleFieldChange('validade', date)}
                      initialFocus
                      className="pointer-events-auto"
                      locale={ptBR}
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            {/* Data de Abertura e Utilizar Até */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Data de Abertura</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !editedProduct.dataAbertura && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {editedProduct.dataAbertura ? (
                        format(editedProduct.dataAbertura, "dd/MM/yyyy", { locale: ptBR })
                      ) : (
                        <span>Selecionar</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={editedProduct.dataAbertura}
                      onSelect={(date) => handleFieldChange('dataAbertura', date)}
                      initialFocus
                      className="pointer-events-auto"
                      locale={ptBR}
                    />
                  </PopoverContent>
                </Popover>
              </div>
              <div className="space-y-2">
                <Label>Utilizar Até</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !editedProduct.utilizarAte && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {editedProduct.utilizarAte ? (
                        format(editedProduct.utilizarAte, "dd/MM/yyyy", { locale: ptBR })
                      ) : (
                        <span>Selecionar</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={editedProduct.utilizarAte}
                      onSelect={(date) => handleFieldChange('utilizarAte', date)}
                      initialFocus
                      className="pointer-events-auto"
                      locale={ptBR}
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            {/* Local de Armazenamento */}
            <div className="space-y-2">
              <Label>Local de Armazenamento</Label>
              <Select
                value={editedProduct.localArmazenamento}
                onValueChange={(value: StorageLocation) => handleFieldChange('localArmazenamento', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o local" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="refrigerado">Refrigerado</SelectItem>
                  <SelectItem value="congelado">Congelado</SelectItem>
                  <SelectItem value="ambiente">Ambiente</SelectItem>
                  <SelectItem value="camara-fria">Câmara Fria</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Responsável */}
            <ResponsavelSelectField
              label="Responsável"
              value={editedProduct.responsavel}
              onChange={(value) => handleFieldChange('responsavel', value)}
              required={true}
            />

            {/* Quantidade */}
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
