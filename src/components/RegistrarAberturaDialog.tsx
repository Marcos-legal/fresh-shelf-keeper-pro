import { useEffect, useMemo, useState } from "react";
import { Check, ChevronsUpDown, CalendarCheck } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Product, ProductFormData } from "@/types/product";
import { calcularUtilizarAte } from "@/lib/utilizarAte";
import { cn } from "@/lib/utils";

interface RegistrarAberturaDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  products: Product[];
  /** Mesma função de atualização já usada no sistema (useProductsSupabase.updateProduct) */
  onSave: (id: string, data: ProductFormData) => void | Promise<void>;
  /** Ação existente de impressão de etiquetas — recebe o produto recém-aberto */
  onPrintLabel: (product: Product) => void;
}

function todayInput() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function parseInputDate(value: string): Date | undefined {
  if (!value) return undefined;
  const [year, month, day] = value.split("-").map(Number);
  if (!year || !month || !day) return undefined;
  const date = new Date(year, month - 1, day);
  return isNaN(date.getTime()) ? undefined : date;
}

function toInput(value?: Date | string): string {
  if (!value) return "";
  if (value instanceof Date && !isNaN(value.getTime())) {
    return `${value.getFullYear()}-${String(value.getMonth() + 1).padStart(2, "0")}-${String(value.getDate()).padStart(2, "0")}`;
  }
  if (typeof value === "string") return value.slice(0, 10);
  return "";
}

export function RegistrarAberturaDialog({ open, onOpenChange, products, onSave, onPrintLabel }: RegistrarAberturaDialogProps) {
  const [productId, setProductId] = useState<string>("");
  const [pickerOpen, setPickerOpen] = useState(false);
  const [dataAbertura, setDataAbertura] = useState(todayInput());
  const [dias, setDias] = useState<number>(0);
  const [lote, setLote] = useState<string>("");
  const [dataFabricacao, setDataFabricacao] = useState<string>("");
  const [validade, setValidade] = useState<string>("");
  const [saving, setSaving] = useState(false);

  const selected = useMemo(() => products.find((p) => p.id === productId), [products, productId]);

  useEffect(() => {
    if (!open) {
      setProductId("");
      setDataAbertura(todayInput());
      setDias(0);
      setLote("");
      setDataFabricacao("");
      setValidade("");
      setSaving(false);
    }
  }, [open]);

  useEffect(() => {
    if (selected) {
      setDias(selected.diasParaVencer || 0);
      setLote(selected.lote || "");
      setDataFabricacao(toInput(selected.dataFabricacao));
      setValidade(toInput(selected.validade));
    }
  }, [selected]);

  const semFabricacao = !!selected && !selected.dataFabricacao;
  const semValidade = !!selected && !selected.validade;
  const semLote = !!selected && !(selected.lote && selected.lote.trim());

  const utilizarAte = calcularUtilizarAte(parseInputDate(dataAbertura), dias);

  const handleSave = async () => {
    if (!selected) return;
    setSaving(true);
    await onSave(selected.id, {
      dataAbertura,
      diasParaVencer: dias,
      lote,
      ...(semFabricacao ? { dataFabricacao: dataFabricacao || undefined } : {}),
      ...(semValidade ? { validade: validade || undefined } : {}),
    });
    setSaving(false);
    onPrintLabel(selected);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-base">
            <CalendarCheck className="h-4 w-4 text-primary" /> Registrar abertura
          </DialogTitle>
          <DialogDescription>Selecione o produto e a data de abertura para calcular o "Utilizar até".</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label>Produto</Label>
            <Popover open={pickerOpen} onOpenChange={setPickerOpen}>
              <PopoverTrigger asChild>
                <Button variant="outline" role="combobox" aria-expanded={pickerOpen} className="h-12 w-full justify-between text-left font-normal">
                  <span className="truncate">{selected ? selected.nome || "Produto sem nome" : "Selecionar produto"}</span>
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
                <Command>
                  <CommandInput placeholder="Buscar produto..." />
                  <CommandList className="max-h-64 overflow-y-auto">
                    <CommandEmpty>Nenhum produto encontrado.</CommandEmpty>
                    <CommandGroup>
                      {products.map((product) => (
                        <CommandItem
                          key={product.id}
                          value={`${product.nome || "sem nome"} ${product.lote || ""} ${product.marca || ""}`}
                          onSelect={() => { setProductId(product.id); setPickerOpen(false); }}
                        >
                          <Check className={cn("mr-2 h-4 w-4", productId === product.id ? "opacity-100" : "opacity-0")} />
                          <span className="truncate">{product.nome || "Produto sem nome"}{product.lote ? ` · ${product.lote}` : ""}</span>
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          </div>

          {selected && (semFabricacao || semValidade || semLote) && (
            <div className="space-y-3 rounded-lg border border-dashed border-border/70 bg-muted/20 p-3">
              <p className="text-xs font-medium text-muted-foreground">Este produto está sem algumas informações — preencha para completar o cadastro.</p>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {semLote && (
                  <div className="space-y-1.5">
                    <Label htmlFor="abertura-lote">Lote</Label>
                    <Input id="abertura-lote" className="h-12" placeholder="Ex.: L2024-001" value={lote} onChange={(e) => setLote(e.target.value)} />
                  </div>
                )}
                {semFabricacao && (
                  <div className="space-y-1.5">
                    <Label htmlFor="abertura-fabricacao">Data de fabricação</Label>
                    <Input id="abertura-fabricacao" type="date" className="h-12" value={dataFabricacao} onChange={(e) => setDataFabricacao(e.target.value)} />
                  </div>
                )}
                {semValidade && (
                  <div className="space-y-1.5">
                    <Label htmlFor="abertura-validade">Data de validade</Label>
                    <Input id="abertura-validade" type="date" className="h-12" value={validade} onChange={(e) => setValidade(e.target.value)} />
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="abertura-data">Data de abertura</Label>
              <Input id="abertura-data" type="date" className="h-12" value={dataAbertura} onChange={(e) => setDataAbertura(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="abertura-dias">Dias para vencer após abertura</Label>
              <Input id="abertura-dias" type="number" min={0} className="h-12" value={dias} onChange={(e) => setDias(Number(e.target.value) || 0)} />
            </div>
          </div>

          <div className="rounded-lg border border-border bg-muted/40 p-3">
            <p className="text-xs text-muted-foreground">Utilizar até</p>
            <p className="text-lg font-semibold tabular-nums">
              {utilizarAte ? utilizarAte.toLocaleDateString("pt-BR") : "—"}
            </p>
            {!utilizarAte && <p className="mt-1 text-xs text-muted-foreground">Informe a data de abertura e os dias para vencer.</p>}
          </div>
        </div>

        <DialogFooter className="flex-col gap-2 sm:flex-row">
          <Button variant="outline" className="h-12 w-full sm:h-10 sm:w-auto" onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button className="h-12 w-full sm:h-10 sm:w-auto" disabled={!selected || !dataAbertura || saving} onClick={handleSave}>
            {saving ? "Salvando..." : "Salvar e imprimir etiqueta"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
