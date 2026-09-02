import { useMemo, useRef, useState, useEffect } from "react";
import { PageLayout } from "@/components/PageLayout";
import { useProductsSupabase } from "@/hooks/useProductsSupabase";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Printer, Package, Eye, FileText, Settings, Ruler, Edit, Search, Minus, Plus, CheckCircle2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { ResponsavelSelectField } from "@/components/form/ResponsavelSelectField";
import { EtiquetaEditor } from "@/components/EtiquetaEditor";
import { Product } from "@/types/product";
import QRCode from "qrcode";
import { buildEtiquetaQrPayload } from "@/lib/qrcode";
import { buildEtiquetaPrintHTML } from "@/lib/etiquetaPrintTemplate";

async function buildQrMap(products: Product[]): Promise<Map<string, string>> {
  const map = new Map<string, string>();
  await Promise.all(
    Array.from(new Map(products.map((p) => [String(p.id), p])).values()).map(async (p) => {
      try {
        const dataUrl = await QRCode.toDataURL(buildEtiquetaQrPayload(p), {
          margin: 2,
          width: 512,
          errorCorrectionLevel: "L",
        });
        map.set(String(p.id), dataUrl);
      } catch (err) {
        console.warn("QR generation failed", err);
      }
    })
  );
  return map;
}

const clampQuantity = (value: number) => Math.max(1, Math.min(99, Number.isFinite(value) ? value : 1));

const formatDate = (value: unknown) => {
  if (!value) return "";
  if (typeof value !== "string") return String(value);
  if (/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(value) || /^\d{1,2}\/\d{4}$/.test(value)) return value;
  const parts = value.split("-").map(Number);
  if (parts.length === 3 && parts.every(Boolean)) {
    return new Date(parts[0], parts[1] - 1, parts[2]).toLocaleDateString("pt-BR");
  }
  return value;
};

const ImpressaoEtiquetas = () => {
  const { products } = useProductsSupabase();
  const navigate = useNavigate();
  const editorRef = useRef<HTMLDivElement>(null);

  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [productQuantities, setProductQuantities] = useState<Record<string, number>>({});
  const [quickPrintQuantities, setQuickPrintQuantities] = useState<Record<string, number>>({});
  const [quickSearchTerm, setQuickSearchTerm] = useState("");
  const [largura, setLargura] = useState(() => parseInt(localStorage.getItem("etiqueta-largura") || "52"));
  const [altura, setAltura] = useState(() => parseInt(localStorage.getItem("etiqueta-altura") || "50"));
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [responsavel, setResponsavel] = useState("");
  const [showResponsavelDialog, setShowResponsavelDialog] = useState(false);
  const [printAction, setPrintAction] = useState<"batch" | "single" | null>(null);
  const [singleProductToPrint, setSingleProductToPrint] = useState<Product | null>(null);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [showEditor, setShowEditor] = useState(false);

  const selectedData = useMemo(
    () => products.filter((product) => selectedProducts.includes(String(product.id))),
    [products, selectedProducts]
  );

  const totalLabels = useMemo(
    () => selectedData.reduce((sum, product) => sum + (productQuantities[String(product.id)] || 1), 0),
    [selectedData, productQuantities]
  );

  const allSelected = products.length > 0 && selectedProducts.length === products.length;
  const previewProduct = selectedData[0] || products[0];

  useEffect(() => {
    if (showEditor && editorRef.current) {
      setTimeout(() => editorRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 100);
    }
  }, [showEditor]);

  const setQuantity = (productId: string, quantity: number) => {
    setProductQuantities((current) => ({ ...current, [productId]: clampQuantity(quantity) }));
  };

  const setQuickQuantity = (productId: string, quantity: number) => {
    setQuickPrintQuantities((current) => ({ ...current, [productId]: clampQuantity(quantity) }));
  };

  const toggleProduct = (productId: string) => {
    setSelectedProducts((current) => {
      if (current.includes(productId)) return current.filter((id) => id !== productId);
      setQuantity(productId, productQuantities[productId] || 1);
      return [...current, productId];
    });
  };

  const toggleAll = () => {
    if (allSelected) {
      setSelectedProducts([]);
      return;
    }
    setSelectedProducts(products.map((product) => String(product.id)));
    setProductQuantities((current) => {
      const next = { ...current };
      products.forEach((product) => { next[String(product.id)] = current[String(product.id)] || 1; });
      return next;
    });
  };

  const handleLarguraChange = (value: string) => {
    const next = parseInt(value) || 52;
    setLargura(next);
    localStorage.setItem("etiqueta-largura", String(next));
  };

  const handleAlturaChange = (value: string) => {
    const next = parseInt(value) || 50;
    setAltura(next);
    localStorage.setItem("etiqueta-altura", String(next));
  };

  const openBatchPrint = () => {
    if (!selectedData.length) {
      toast({ title: "Nenhum produto selecionado", description: "Selecione pelo menos um produto para imprimir.", variant: "destructive" });
      return;
    }
    setPrintAction("batch");
    setShowResponsavelDialog(true);
  };

  const openSinglePrint = (product: Product) => {
    setSingleProductToPrint(product);
    setPrintAction("single");
    setShowResponsavelDialog(true);
  };

  const printProducts = async (items: Product[], quantities: Record<string, number>, title: string) => {
    const expandedProducts = items.flatMap((product) => Array(quantities[String(product.id)] || 1).fill(product));
    const qrMap = await buildQrMap(items);
    const html = buildEtiquetaPrintHTML({ products: expandedProducts, largura, altura, responsavel, qrMap, title });
    const printWindow = window.open("", "_blank");
    if (!printWindow) {
      toast({ title: "Não foi possível abrir a impressão", description: "Permita pop-ups para imprimir as etiquetas.", variant: "destructive" });
      return;
    }
    printWindow.document.write(html);
    printWindow.document.close();
    setTimeout(() => printWindow.print(), 500);
    toast({ title: "Etiquetas prontas para impressão", description: `${expandedProducts.length} etiqueta(s) enviadas.` });
  };

  const executePrint = async () => {
    if (!responsavel.trim()) {
      toast({ title: "Responsável obrigatório", description: "Selecione um responsável antes de imprimir.", variant: "destructive" });
      return;
    }

    if (printAction === "batch") {
      await printProducts(selectedData, productQuantities, `Etiquetas Térmicas - ${totalLabels} etiquetas`);
    } else if (printAction === "single" && singleProductToPrint) {
      const quantity = quickPrintQuantities[String(singleProductToPrint.id)] || 1;
      await printProducts([singleProductToPrint], { [String(singleProductToPrint.id)]: quantity }, `Etiquetas - ${singleProductToPrint.nome || "Produto"} (${quantity}x)`);
    }

    setShowResponsavelDialog(false);
    setResponsavel("");
    setPrintAction(null);
    setSingleProductToPrint(null);
  };

  const handleEditorPrint = async (product: Product, editorResponsavel: string, quantity: number) => {
    const qrMap = await buildQrMap([product]);
    const expandedProducts = Array(clampQuantity(quantity)).fill(product);
    const html = buildEtiquetaPrintHTML({
      products: expandedProducts,
      largura,
      altura,
      responsavel: editorResponsavel,
      qrMap,
      title: `Etiquetas - ${product.nome || "Produto"} (${quantity}x)`,
    });
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;
    printWindow.document.write(html);
    printWindow.document.close();
    setTimeout(() => printWindow.print(), 500);
    setShowEditor(false);
    setEditingProduct(null);
  };

  const filteredProducts = products.filter((product) => {
    const term = quickSearchTerm.toLowerCase().trim();
    if (!term) return true;
    return [product.nome, product.lote, product.marca].some((value) => String(value || "").toLowerCase().includes(term));
  });

  return (
    <PageLayout title="Impressão de Etiquetas" description="Selecione, revise e imprima suas etiquetas térmicas" icon={Printer}>
      <div className="space-y-6">
        <Card className="overflow-hidden border-primary/20 shadow-sm">
          <CardHeader className="border-b bg-muted/20 p-4 sm:p-5">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                  <Printer className="h-5 w-5 text-primary" />
                  Preparar impressão
                </CardTitle>
                <p className="mt-1 text-xs sm:text-sm text-muted-foreground">Escolha os produtos e a quantidade de etiquetas.</p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Dialog open={settingsOpen} onOpenChange={setSettingsOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm"><Settings className="mr-2 h-4 w-4" />Configurações</Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-md">
                    <DialogHeader><DialogTitle className="flex items-center gap-2"><Ruler className="h-5 w-5" />Tamanho da etiqueta</DialogTitle></DialogHeader>
                    <div className="space-y-4 pt-2">
                      <div className="grid grid-cols-2 gap-2">
                        <Button type="button" variant={largura <= 60 ? "default" : "outline"} onClick={() => { handleLarguraChange("52"); handleAlturaChange("80"); }} className="h-auto py-3">Bobina 57 mm<span className="text-xs font-normal">52 × 80 mm</span></Button>
                        <Button type="button" variant={largura > 60 ? "default" : "outline"} onClick={() => { handleLarguraChange("72"); handleAlturaChange("100"); }} className="h-auto py-3">Bobina 80 mm<span className="text-xs font-normal">72 × 100 mm</span></Button>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div><Label htmlFor="largura">Largura (mm)</Label><Input id="largura" value={largura} disabled className="mt-1 bg-muted text-center" /></div>
                        <div><Label htmlFor="altura">Altura (mm)</Label><Input id="altura" type="number" min="40" max="150" value={altura} onChange={(e) => handleAlturaChange(e.target.value)} className="mt-1 text-center" /></div>
                      </div>
                      <div className="rounded-lg border bg-muted/40 p-3 text-xs text-muted-foreground">Para impressoras térmicas, use margem <strong>Nenhuma</strong>, escala <strong>100%</strong> e desative cabeçalho/rodapé.</div>
                    </div>
                  </DialogContent>
                </Dialog>
                <Button variant="outline" size="sm" onClick={() => navigate("/visualizar-etiquetas")}><Eye className="mr-2 h-4 w-4" />Visualizar</Button>
                <Button onClick={openBatchPrint} disabled={!selectedData.length} size="sm" className="min-w-[150px] gradient-blue text-white">
                  <Printer className="mr-2 h-4 w-4" />Imprimir selecionadas{selectedData.length ? ` (${totalLabels})` : ""}
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-4 sm:p-5">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <button type="button" onClick={toggleAll} className="flex min-h-10 items-center gap-3 rounded-lg border px-3 text-left hover:bg-muted/50">
                <Checkbox checked={allSelected} onCheckedChange={toggleAll} />
                <span className="text-sm font-medium">Selecionar todos</span>
                <span className="text-xs text-muted-foreground">{products.length} produto(s)</span>
              </button>
              <div className="flex items-center gap-2 rounded-lg bg-primary/5 px-3 py-2 text-sm">
                <CheckCircle2 className="h-4 w-4 text-primary" />
                <strong>{selectedData.length}</strong> selecionado(s)
                <span className="text-muted-foreground">•</span>
                <strong>{totalLabels}</strong> etiqueta(s)
              </div>
            </div>
          </CardContent>
        </Card>

        {selectedData.length > 0 && (
          <Card className="border-primary/20 bg-primary/[0.03]">
            <CardContent className="p-4 sm:p-5">
              <div className="grid gap-5 lg:grid-cols-[1fr_280px] lg:items-center">
                <div>
                  <div className="mb-3 flex items-center gap-2 text-sm font-semibold"><FileText className="h-4 w-4 text-primary" />Resumo da impressão</div>
                  <div className="flex flex-wrap gap-2">
                    {selectedData.map((product) => (
                      <div key={product.id} className="flex items-center gap-2 rounded-full border bg-background px-3 py-1.5 text-xs">
                        <span className="max-w-[180px] truncate font-medium">{product.nome || "Produto"}</span>
                        <span className="rounded-full bg-primary/10 px-1.5 py-0.5 font-semibold text-primary">{productQuantities[String(product.id)] || 1}x</span>
                      </div>
                    ))}
                  </div>
                </div>
                {previewProduct && (
                  <div className="mx-auto w-full max-w-[280px] rounded-xl border-2 border-foreground/15 bg-white p-4 text-black shadow-sm">
                    <div className="mb-2 border-b border-dashed pb-2 text-center text-[10px] font-bold uppercase tracking-wider">Pré-visualização</div>
                    <div className="text-center text-lg font-bold leading-tight">{previewProduct.nome || "Produto"}</div>
                    {previewProduct.marca && <div className="mt-1 text-center text-xs">{previewProduct.marca}</div>}
                    {previewProduct.validade && <div className="mt-3 text-center text-sm font-semibold">Validade: {formatDate(previewProduct.validade)}</div>}
                    {previewProduct.lote && <div className="mt-1 text-center text-[11px]">Lote: {previewProduct.lote}</div>}
                    <div className="mt-3 border-t border-dashed pt-2 text-center text-[9px] text-gray-500">{largura} × {altura} mm</div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {showEditor && editingProduct && (
          <div ref={editorRef}>
            <Card className="border-2 border-primary shadow-lg">
              <CardContent className="p-4 sm:p-6">
                <EtiquetaEditor product={editingProduct} largura={largura} altura={altura} onPrint={handleEditorPrint} onClose={() => { setShowEditor(false); setEditingProduct(null); }} />
              </CardContent>
            </Card>
          </div>
        )}

        <Card>
          <CardHeader className="p-4 sm:p-5">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <CardTitle className="text-base sm:text-lg">Produtos para impressão</CardTitle>
                <p className="mt-1 text-xs sm:text-sm text-muted-foreground">Ajuste a quantidade individual antes de imprimir.</p>
              </div>
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input value={quickSearchTerm} onChange={(e) => setQuickSearchTerm(e.target.value)} placeholder="Buscar produto..." className="pl-9" />
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-4 sm:p-5">
            {products.length === 0 ? (
              <div className="py-12 text-center text-muted-foreground"><Package className="mx-auto mb-3 h-12 w-12 opacity-40" /><p>Nenhum produto cadastrado ainda.</p></div>
            ) : (
              <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                {filteredProducts.map((product) => {
                  const id = String(product.id);
                  const selected = selectedProducts.includes(id);
                  const quantity = productQuantities[id] || 1;
                  return (
                    <div key={id} className={`rounded-xl border p-4 transition-all ${selected ? "border-primary bg-primary/[0.04] shadow-sm" : "hover:border-primary/40"}`}>
                      <div className="flex items-start gap-3">
                        <Checkbox checked={selected} onCheckedChange={() => toggleProduct(id)} className="mt-1" />
                        <button type="button" onClick={() => toggleProduct(id)} className="min-w-0 flex-1 text-left">
                          <div className="flex items-center gap-2"><div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary"><Package className="h-4 w-4" /></div><div className="min-w-0"><div className="truncate font-semibold">{product.nome || "Produto sem nome"}</div><div className="truncate text-xs text-muted-foreground">{product.marca || "Sem marca"} • Lote {product.lote || "N/A"}</div></div></div>
                        </button>
                      </div>
                      <div className="mt-4 flex items-center justify-between gap-3 border-t pt-3">
                        <div className="flex items-center gap-2"><Label className="text-xs text-muted-foreground">Quantidade</Label><div className="flex items-center rounded-lg border bg-background"><Button type="button" variant="ghost" size="icon" className="h-8 w-8" onClick={() => setQuantity(id, quantity - 1)} disabled={quantity <= 1}><Minus className="h-3.5 w-3.5" /></Button><Input value={quantity} onChange={(e) => setQuantity(id, parseInt(e.target.value) || 1)} className="h-8 w-12 border-0 p-0 text-center text-sm focus-visible:ring-0" inputMode="numeric" /><Button type="button" variant="ghost" size="icon" className="h-8 w-8" onClick={() => setQuantity(id, quantity + 1)} disabled={quantity >= 99}><Plus className="h-3.5 w-3.5" /></Button></div></div>
                        <div className="flex gap-2"><Button type="button" variant="outline" size="sm" onClick={() => { setEditingProduct(product); setShowEditor(true); }}><Edit className="mr-1.5 h-3.5 w-3.5" />Editar</Button><Button type="button" size="sm" onClick={() => openSinglePrint(product)}><Printer className="mr-1.5 h-3.5 w-3.5" />Imprimir</Button></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
            {products.length > 0 && filteredProducts.length === 0 && <div className="py-10 text-center text-sm text-muted-foreground">Nenhum produto encontrado para “{quickSearchTerm}”.</div>}
          </CardContent>
        </Card>

        <Dialog open={showResponsavelDialog} onOpenChange={setShowResponsavelDialog}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader><DialogTitle>Confirmar impressão</DialogTitle></DialogHeader>
            <div className="space-y-5 pt-2">
              <div className="rounded-xl border bg-muted/30 p-4">
                <div className="text-sm font-semibold">O que será impresso</div>
                <div className="mt-1 text-sm text-muted-foreground">{printAction === "single" ? `${quickPrintQuantities[String(singleProductToPrint?.id)] || 1} etiqueta(s)` : `${selectedData.length} produto(s) • ${totalLabels} etiqueta(s)`}</div>
                <div className="mt-1 text-xs text-muted-foreground">Formato: {largura} × {altura} mm</div>
              </div>
              <ResponsavelSelectField label="Responsável" value={responsavel} onChange={setResponsavel} required />
              <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end"><Button variant="outline" onClick={() => { setShowResponsavelDialog(false); setResponsavel(""); setPrintAction(null); setSingleProductToPrint(null); }}>Cancelar</Button><Button onClick={executePrint}><Printer className="mr-2 h-4 w-4" />Confirmar impressão</Button></div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </PageLayout>
  );
};

export default ImpressaoEtiquetas;
