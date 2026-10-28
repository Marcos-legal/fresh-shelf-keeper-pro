import { useEffect, useMemo, useState } from "react";
import { Check, ChevronsUpDown, CalendarCheck, Plus, ArrowLeft } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { SelectField } from "@/components/form/SelectField";
import { Product, ProductFormData, StorageLocation } from "@/types/product";
import { calcularUtilizarAte } from "@/lib/utilizarAte";
import { cn } from "@/lib/utils";

interface RegistrarAberturaDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  products: Product[];
  /** Mesma função de atualização já usada no sistema (useProductsSupabase.updateProduct) */
  onSave: (id: string, data: ProductFormData) => void | Promise<void>;
  /** Mesma função de cadastro já usada no sistema (useProductsSupabase.addProduct) — retorna o id do novo produto */
  onCreateProduct?: (data: ProductFormData) => Promise<string | undefined | null | void> | string | undefined | void;
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
    return `${value.getFullYear()}-${String(value.getMonth() + 1).padStart(2, "0")}-${value.getDate().toString().padStart(2, "0")}`;
  }
  if (typeof value === "string") return value.slice(0, 10);
  return "";
}

const storageOptions: { value: string; label: string }[] = [
  { value: 'refrigerado', label: 'Refrigerado' },
  { value: 'congelado', label: 'Congelado' },
  { value: 'ambiente', label: 'Ambiente' },
  { value: 'camara-fria', label: 'Câmara Fria' },
];

export function RegistrarAberturaDialog({ open, onOpenChange, products, onSave, onCreateProduct, onPrintLabel }: RegistrarAberturaDialogProps) {
  const [mode, setMode] = useState<'existing' | 'new'>('existing');
  const [productId, setProductId] = useState<string>("");
  const [pickerOpen, setPickerOpen] = useState(false);
  const [dataAbertura, setDataAbertura] = useState(todayInput());
  const [dias, setDias] = useState<number>(0);
  const [lote, setLote] = useState<string>("");
  const [localArmazenamento, setLocalArmazenamento] = useState<StorageLocation>('ambiente');
  const [dataFabricacao, setDataFabricacao] = useState<string>("");
  const [validade, setValidade] = useState<string>("");
  const [saving, setSaving] = useState(false);
  // Novo produto
  const [novoNome, setNovoNome] = useState("");
  const [novoLote, setNovoLote] = useState("");
  const [novoLocal, setNovoLocal] = useState<string>('ambiente');
  const [novoNomeError, setNovoNomeError] = useState<string>("");

  const selected = useMemo(() => products.find((p) => p.id === productId), [products, productId]);

  useEffect(() => {
    if (!open) {
      setMode('existing');
      setProductId("");
      setDataAbertura(todayInput());
      setDias(0);
      setLote("");
      setLocalArmazenamento('ambiente');
      setDataFabricacao("");
      setValidade("");
      setSaving(false);
      setNovoNome("");
      setNovoLote("");
      setNovoLocal('ambiente');
      setNovoNomeError("");
    }
  }, [open]);

  useEffect(() => {
    if (selected) {
      setDias(selected.diasParaVencer || 0);
      setLote(selected.lote || "");
      setLocalArmazenamento(selected.localArmazenamento || 'ambiente');
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
      localArmazenamento,
      ...(semFabricacao ? { dataFabricacao: dataFabricacao || undefined } : {}),
      ...(semValidade ? { validade: validade || undefined } : {}),
    });
    setSaving(false);
    onPrintLabel({ ...selected, localArmazenamento });
    onOpenChange(false);
  };

  const handleSaveNew = async () => {
    const nome = novoNome.trim();
    if (!nome) { setNovoNomeError("Informe o nome do produto."); return; }
    setSaving(true);
    const newId = await onCreateProduct?.({
      nome,
      lote: novoLote,
      localArmazenamento: novoLocal as StorageLocation,
      dataAbertura,
      diasParaVencer: dias,
    });
    setSaving(false);
    if (!newId) return; // falha no cadastro: o erro já foi mostrado pelo hook
    onPrintLabel({ id: newId, nome, lote: novoLote } as Product);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md pb-[max(1rem,env(safe-area-inset-bottom))]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-base">
            <CalendarCheck className="h-4 w-4 text-primary" /> Registrar abertura
          </DialogTitle>
          <DialogDescription>Selecione o produto e a data de abertura para calcular o "Utilizar até".</DialogDescription>
        </DialogHeader>

        {mode === 'existing' ? (
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label>Produto</Label>
              <Popover modal open={pickerOpen} onOpenChange={setPickerOpen}>
                <PopoverTrigger asChild>
                  <Button variant="outline" role="combobox" aria-expanded={pickerOpen} className="h-12 w-full justify-between text-left font-normal">
                    <span className="truncate">{selected ? selected.nome || "Produto sem nome" : "Selecionar produto"}</span>
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[var(--radix-popover-trigger-width)] max-w-[calc(100vw-2rem)] p-0" align="start" sideOffset={6} collisionPadding={12}>
                  <Command>
                    <CommandInput placeholder="Buscar produto..." />
                     <CommandList>
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
              <button
                type="button"
                onClick={() => { setMode('new'); setNovoNomeError(""); }}
                className="flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
              >
                <Plus className="h-3.5 w-3.5" /> Produto ainda não cadastrado? Cadastrar novo
              </button>
            </div>

            {selected && (
              <SelectField
                label="Local de armazenamento"
                value={localArmazenamento}
                onChange={(value) => setLocalArmazenamento(value as StorageLocation)}
                options={storageOptions}
                placeholder="Selecione o local"
              />
            )}

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
        ) : (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Button type="button" variant="ghost" size="sm" className="h-8 px-2 text-xs" onClick={() => setMode('existing')}>
                <ArrowLeft className="h-3.5 w-3.5" /> Voltar
              </Button>
              <span className="text-xs text-muted-foreground">Cadastrando novo produto</span>
            </div>

            <div className="space-y-3 rounded-lg border border-dashed border-border/70 bg-muted/20 p-3">
              <div className="space-y-1.5">
                <Label htmlFor="novo-produto-nome">Nome do produto</Label>
                <Input
                  id="novo-produto-nome"
                  className="h-12"
                  placeholder="Ex.: Molho de tomate"
                  value={novoNome}
                  onChange={(e) => { setNovoNome(e.target.value); if (novoNomeError) setNovoNomeError(""); }}
                />
                {novoNomeError && <p className="text-sm text-red-500">{novoNomeError}</p>}
              </div>
              <SelectField
                label="Local de armazenamento"
                value={novoLocal}
                onChange={(value) => setNovoLocal(value)}
                options={storageOptions}
                placeholder="Selecione o local"
                required
              />
              <div className="space-y-1.5">
                <Label htmlFor="novo-produto-lote">Lote (Opcional)</Label>
                <Input id="novo-produto-lote" className="h-12" placeholder="Ex.: L2024-001" value={novoLote} onChange={(e) => setNovoLote(e.target.value)} />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="novo-abertura-data">Data de abertura</Label>
                <Input id="novo-abertura-data" type="date" className="h-12" value={dataAbertura} onChange={(e) => setDataAbertura(e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="novo-abertura-dias">Dias para vencer após abertura</Label>
                <Input id="novo-abertura-dias" type="number" min={0} className="h-12" value={dias} onChange={(e) => setDias(Number(e.target.value) || 0)} />
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
        )}

         <DialogFooter className="flex-col-reverse gap-2 sm:flex-row">
          <Button variant="outline" className="h-12 w-full sm:h-10 sm:w-auto" onClick={() => onOpenChange(false)}>Cancelar</Button>
          {mode === 'existing' ? (
            <Button className="h-12 w-full sm:h-10 sm:w-auto" disabled={!selected || !dataAbertura || saving} onClick={handleSave}>
              {saving ? "Salvando..." : "Salvar e imprimir etiqueta"}
            </Button>
          ) : (
            <Button className="h-12 w-full sm:h-10 sm:w-auto" disabled={!novoNome.trim() || !dataAbertura || saving} onClick={handleSaveNew}>
              {saving ? "Salvando..." : "Cadastrar, abrir e imprimir etiqueta"}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
