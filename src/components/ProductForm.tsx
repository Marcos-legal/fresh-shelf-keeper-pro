import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Package, Save, Calendar, EyeOff, Eye, Zap, Snowflake, Thermometer, Warehouse } from "lucide-react";
import { ProductFormData, StorageLocation } from "@/types/product";
import { validateProductForm } from "@/utils/productValidation";
import { TextInputField } from "@/components/form/TextInputField";
import { DatePickerField } from "@/components/form/DatePickerField";
import { NumberInputField } from "@/components/form/NumberInputField";
import { SelectField } from "@/components/form/SelectField";
import { ValidadeField } from "@/components/form/ValidadeField";

interface ProductFormProps { onSubmit: (data: ProductFormData) => void; initialData?: Partial<ProductFormData>; title?: string; submitLabel?: string; }

const storageOptions: { value: StorageLocation; label: string }[] = [
  { value: "refrigerado", label: "Refrigerado" }, { value: "congelado", label: "Congelado" },
  { value: "ambiente", label: "Ambiente" }, { value: "camara-fria", label: "Câmara Fria" },
];

const storageCards = [
  { value: "refrigerado" as StorageLocation, label: "Refrigerado", icon: Thermometer, className: "border-cyan-200 bg-cyan-50 text-cyan-700" },
  { value: "congelado" as StorageLocation, label: "Congelado", icon: Snowflake, className: "border-blue-200 bg-blue-50 text-blue-700" },
  { value: "ambiente" as StorageLocation, label: "Ambiente", icon: Package, className: "border-amber-200 bg-amber-50 text-amber-700" },
  { value: "camara-fria" as StorageLocation, label: "Câmara Fria", icon: Warehouse, className: "border-violet-200 bg-violet-50 text-violet-700" },
];

export function ProductForm({ onSubmit, initialData, title = "Cadastro de Produto", submitLabel = "Salvar Produto" }: ProductFormProps) {
  const [formData, setFormData] = useState<ProductFormData>({
    nome: initialData?.nome || "", lote: initialData?.lote || "", marca: initialData?.marca || "",
    dataFabricacao: initialData?.dataFabricacao || "", validade: initialData?.validade || "", dataAbertura: initialData?.dataAbertura || "",
    diasParaVencer: initialData?.diasParaVencer || undefined, localArmazenamento: initialData?.localArmazenamento || undefined,
    precoCusto: initialData?.precoCusto, showOptionalDates: initialData?.showOptionalDates ?? false,
  });
  const [errors, setErrors] = useState<Partial<Record<keyof ProductFormData, string>>>({});

  const update = (field: keyof ProductFormData, value: string | number | undefined) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: "" }));
  };
  const handleUpdateDates = () => {
    const today = new Date().toISOString().split("T")[0];
    setFormData(prev => ({ ...prev, dataFabricacao: today, dataAbertura: today }));
  };
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const validationErrors = validateProductForm(formData);
    if (Object.keys(validationErrors).length === 0) onSubmit(formData); else setErrors(validationErrors);
  };

  return <Card className="overflow-hidden border-border/60 shadow-md animate-fade-in">
    <CardHeader className="border-b bg-gradient-to-r from-primary/[0.08] via-background to-violet-500/[0.07] p-4 sm:p-6">
      <div className="flex items-center gap-3"><div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-violet-600 text-white shadow-md"><Package className="h-5 w-5" /></div><div><CardTitle className="text-lg sm:text-xl">{title}</CardTitle><p className="mt-1 text-xs text-muted-foreground">Cadastre o básico primeiro. Os detalhes opcionais ficam escondidos para deixar o fluxo rápido.</p></div></div>
    </CardHeader>
    <CardContent className="p-4 sm:p-6"><form onSubmit={handleSubmit} className="space-y-6">
      <section className="rounded-2xl border border-primary/15 bg-primary/[0.025] p-4 sm:p-5">
        <div className="mb-4 flex items-center gap-2"><div className="rounded-lg bg-primary/10 p-2 text-primary"><Zap className="h-4 w-4" /></div><div><h3 className="text-sm font-bold">Cadastro rápido para etiqueta</h3><p className="text-xs text-muted-foreground">Nome + validade + armazenamento já deixam a etiqueta pronta.</p></div></div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2"><TextInputField id="nome" label="Nome do Produto" value={formData.nome || ""} onChange={v => update("nome", v)} placeholder="Ex.: Molho de tomate" error={errors.nome} /><TextInputField id="marca" label="Marca" value={formData.marca || ""} onChange={v => update("marca", v)} placeholder="Ex.: Heinz" error={errors.marca} /></div>
        <div className="mt-4"><p className="mb-2 text-xs font-semibold text-muted-foreground">Onde o produto ficará?</p><div className="grid grid-cols-2 gap-2 lg:grid-cols-4">{storageCards.map(({ value, label, icon: Icon, className }) => <button type="button" key={value} onClick={() => update("localArmazenamento", value)} className={`flex min-h-16 items-center gap-2 rounded-xl border p-3 text-left text-xs font-semibold transition hover:-translate-y-0.5 hover:shadow-sm ${className} ${formData.localArmazenamento === value ? "ring-2 ring-primary ring-offset-2" : ""}`}><Icon className="h-4 w-4 shrink-0" /><span>{label}</span></button>)}</div></div>
      </section>

      <section className="rounded-2xl border border-border/60 p-4 sm:p-5"><div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"><div><h3 className="text-sm font-bold">Validade e abertura</h3><p className="mt-1 text-xs text-muted-foreground">Use os atalhos para preencher datas sem digitação.</p></div><div className="flex flex-col gap-2 sm:flex-row"><Button type="button" variant="outline" onClick={handleUpdateDates} className="h-9"><Calendar className="mr-2 h-4 w-4" /> Hoje</Button><Button type="button" variant={formData.showOptionalDates ? "secondary" : "outline"} onClick={() => setFormData(prev => ({ ...prev, showOptionalDates: !prev.showOptionalDates }))} className="h-9">{formData.showOptionalDates ? <EyeOff className="mr-2 h-4 w-4" /> : <Eye className="mr-2 h-4 w-4" />}{formData.showOptionalDates ? "Ocultar detalhes" : "Mais detalhes"}</Button></div></div>
        <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2"><DatePickerField id="dataAbertura" label="Data de Abertura" value={formData.dataAbertura || ""} onChange={v => update("dataAbertura", v)} error={errors.dataAbertura} required={false} /><NumberInputField id="diasParaVencer" label="Dias para Vencer após Abertura" value={formData.diasParaVencer || 0} onChange={v => update("diasParaVencer", v)} error={errors.diasParaVencer} min={0} required={false} /></div>
        {formData.showOptionalDates && <div className="mt-4 grid grid-cols-1 gap-4 rounded-xl border border-dashed bg-muted/20 p-4 md:grid-cols-2"><div className="md:col-span-2 flex items-center gap-2 text-xs font-semibold text-muted-foreground"><Eye className="h-4 w-4" /> Detalhes adicionais</div><DatePickerField id="dataFabricacao" label="Data de Fabricação" value={formData.dataFabricacao || ""} onChange={v => update("dataFabricacao", v)} error={errors.dataFabricacao} required={false} /><ValidadeField label="Data de Validade" value={formData.validade || ""} onChange={v => update("validade", v)} error={errors.validade} required={false} /><TextInputField id="lote" label="Lote" value={formData.lote || ""} onChange={v => update("lote", v)} placeholder="Ex.: LT202609" error={errors.lote} /></div>}
      </section>

      <section className="grid grid-cols-1 gap-4 md:grid-cols-2"><SelectField label="Local de Armazenamento" value={formData.localArmazenamento || ""} onChange={(value: StorageLocation) => update("localArmazenamento", value)} options={storageOptions} placeholder="Selecione o local" required={false} /><div className="space-y-2"><label className="text-sm font-medium" htmlFor="precoCusto">Preço de Custo (R$) — opcional</label><input id="precoCusto" type="number" inputMode="decimal" step="0.01" min={0} value={formData.precoCusto ?? ""} onChange={e => update("precoCusto", e.target.value === "" ? undefined : Number(e.target.value))} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" placeholder="Ex.: 12,90" /></div></section>

      <div className="flex flex-col-reverse gap-3 border-t pt-5 sm:flex-row sm:items-center sm:justify-between"><p className="text-xs text-muted-foreground">Depois de salvar, você poderá gerar a etiqueta na tela de impressão.</p><Button type="submit" className="h-11 w-full bg-gradient-to-r from-primary to-violet-600 text-white shadow-md hover:opacity-95 sm:w-auto sm:min-w-48"><Save className="mr-2 h-4 w-4" /> {submitLabel}</Button></div>
    </form></CardContent>
  </Card>;
}
