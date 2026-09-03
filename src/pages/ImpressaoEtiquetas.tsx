import { useEffect, useMemo, useRef, useState } from "react";
import { PageLayout } from "@/components/PageLayout";
import { useProductsSupabase } from "@/hooks/useProductsSupabase";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Printer, Package, Eye, Settings, Ruler, Edit, Search, CheckCircle2, Minus, Plus, Layers, Sparkles } from "lucide-react";
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
  await Promise.all(products.map(async (p) => {
    try { map.set(String(p.id), await QRCode.toDataURL(buildEtiquetaQrPayload(p), { margin: 2, width: 512, errorCorrectionLevel: "L" })); }
    catch (err) { console.warn("QR generation failed", err); }
  }));
  return map;
}
const clamp = (value: number) => Math.max(1, Math.min(99, value || 1));

export default function ImpressaoEtiquetas() {
  const { products } = useProductsSupabase();
  const navigate = useNavigate();
  const editorRef = useRef<HTMLDivElement>(null);
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [search, setSearch] = useState("");
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [responsavel, setResponsavel] = useState("");
  const [responsavelOpen, setResponsavelOpen] = useState(false);
  const [printAction, setPrintAction] = useState<"batch" | "single" | null>(null);
  const [singleProduct, setSingleProduct] = useState<Product | null>(null);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [showEditor, setShowEditor] = useState(false);
  const [largura, setLargura] = useState(() => Number(localStorage.getItem("etiqueta-largura")) || 52);
  const [altura, setAltura] = useState(() => Number(localStorage.getItem("etiqueta-altura")) || 50);

  const filteredProducts = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return products;
    return products.filter((p) => [p.nome, p.lote, p.marca, p.localArmazenamento].some(v => String(v || "").toLowerCase().includes(term)));
  }, [products, search]);
  const selectedData = useMemo(() => products.filter(p => selectedProducts.includes(String(p.id))), [products, selectedProducts]);
  const totalLabels = useMemo(() => selectedData.reduce((sum, p) => sum + (quantities[String(p.id)] || 1), 0), [selectedData, quantities]);
  const allVisibleSelected = filteredProducts.length > 0 && filteredProducts.every(p => selectedProducts.includes(String(p.id)));
  const previewProduct = selectedData[0] || filteredProducts[0] || products[0];

  useEffect(() => { if (showEditor) setTimeout(() => editorRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 80); }, [showEditor]);
  const toggleProduct = (id: string) => {
    setSelectedProducts(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
    setQuantities(prev => ({ ...prev, [id]: prev[id] || 1 }));
  };
  const toggleAll = () => {
    if (allVisibleSelected) { const ids = new Set(filteredProducts.map(p => String(p.id))); setSelectedProducts(prev => prev.filter(id => !ids.has(id))); return; }
    setSelectedProducts(prev => Array.from(new Set([...prev, ...filteredProducts.map(p => String(p.id))])));
  };
  const changeQuantity = (id: string, delta: number) => setQuantities(prev => ({ ...prev, [id]: clamp((prev[id] || 1) + delta) }));
  const setQuantity = (id: string, value: number) => setQuantities(prev => ({ ...prev, [id]: clamp(value) }));
  const openPrint = (action: "batch" | "single", product?: Product) => {
    if (action === "batch" && !selectedData.length) { toast({ title: "Selecione os produtos", description: "Marque pelo menos um produto para continuar.", variant: "destructive" }); return; }
    setPrintAction(action); setSingleProduct(product || null); setResponsavelOpen(true);
  };
  const executePrint = async () => {
    if (!responsavel.trim()) { toast({ title: "Responsável obrigatório", description: "Selecione o responsável pela etiqueta.", variant: "destructive" }); return; }
    const source = printAction === "single" && singleProduct ? [singleProduct] : selectedData;
    const expanded = source.flatMap(p => Array(quantities[String(p.id)] || 1).fill(p));
    const qrMap = await buildQrMap(source);
    const html = buildEtiquetaPrintHTML({ products: expanded, largura, altura, responsavel, qrMap, title: `ValiControl • ${expanded.length} etiqueta(s)` });
    const printWindow = window.open("", "_blank");
    if (!printWindow) { toast({ title: "Bloqueio do navegador", description: "Permita pop-ups para abrir a impressão.", variant: "destructive" }); return; }
    printWindow.document.write(html); printWindow.document.close(); setTimeout(() => printWindow.print(), 450);
    toast({ title: "Impressão preparada", description: `${expanded.length} etiqueta(s) pronta(s) para imprimir.` });
    setResponsavelOpen(false); setResponsavel(""); setPrintAction(null); setSingleProduct(null);
  };
  const saveSize = (w: number, h: number) => { setLargura(w); setAltura(h); localStorage.setItem("etiqueta-largura", String(w)); localStorage.setItem("etiqueta-altura", String(h)); };

  return <PageLayout title="Etiquetas e Impressão" description="Cadastre, selecione, visualize e imprima suas etiquetas com poucos toques." icon={Printer}>
    <div className="space-y-5 pb-8">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <Card className="overflow-hidden border-0 bg-gradient-to-br from-blue-600 via-indigo-600 to-violet-600 text-white shadow-lg md:col-span-2"><CardContent className="p-5 sm:p-6"><div className="flex items-start justify-between gap-4"><div><Badge className="mb-3 border-white/20 bg-white/15 text-white hover:bg-white/20"><Sparkles className="mr-1 h-3.5 w-3.5" /> Fluxo rápido</Badge><h2 className="text-xl font-bold sm:text-2xl">Prepare suas etiquetas sem complicação</h2><p className="mt-1 max-w-xl text-sm text-white/80">Escolha os produtos, defina a quantidade e imprima. A prévia acompanha suas seleções.</p></div><Printer className="hidden h-12 w-12 shrink-0 opacity-80 sm:block" /></div><div className="mt-5 flex flex-wrap gap-2"><Button onClick={() => navigate("/cadastro-produtos")} className="bg-white text-blue-700 hover:bg-white/90"><Package className="mr-2 h-4 w-4" /> Cadastrar produto</Button><Button onClick={() => navigate("/visualizar-etiquetas")} variant="outline" className="border-white/30 bg-white/10 text-white hover:bg-white/20"><Eye className="mr-2 h-4 w-4" /> Ver etiquetas</Button></div></CardContent></Card>
        <Card className="border-0 shadow-md"><CardContent className="flex h-full flex-col justify-between p-5"><div className="flex items-center justify-between"><span className="text-sm font-medium text-muted-foreground">Selecionados</span><CheckCircle2 className="h-5 w-5 text-emerald-500" /></div><div><div className="mt-2 text-3xl font-bold">{selectedProducts.length}</div><p className="text-xs text-muted-foreground">{totalLabels} etiqueta(s) no total</p></div><Button className="mt-4 w-full" disabled={!selectedData.length} onClick={() => openPrint("batch")}><Printer className="mr-2 h-4 w-4" /> Imprimir selecionados</Button></CardContent></Card>
      </div>

      <Card className="border-border/60 shadow-sm"><CardHeader className="gap-3 border-b border-border/50 bg-muted/20 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5"><div><CardTitle className="flex items-center gap-2 text-base sm:text-lg"><Layers className="h-5 w-5 text-primary" /> Seleção para impressão</CardTitle><p className="mt-1 text-xs text-muted-foreground">Marque, ajuste a quantidade e imprima. Tudo em uma única tela.</p></div><div className="flex flex-col gap-2 sm:flex-row"><div className="relative"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" /><Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar produto, lote ou marca" className="w-full pl-9 sm:w-64" /></div><Button variant="outline" onClick={toggleAll}>{allVisibleSelected ? "Desmarcar visíveis" : "Selecionar visíveis"}</Button><Button variant="outline" onClick={() => setSettingsOpen(true)}><Settings className="mr-2 h-4 w-4" /> Tamanho</Button></div></CardHeader><CardContent className="p-3 sm:p-5">{filteredProducts.length === 0 ? <div className="rounded-xl border border-dashed p-8 text-center text-sm text-muted-foreground">Nenhum produto encontrado.</div> : <div className="space-y-2">{filteredProducts.map(product => { const id=String(product.id), selected=selectedProducts.includes(id), qty=quantities[id]||1; return <div key={id} className={`rounded-xl border p-3 transition ${selected ? "border-primary/40 bg-primary/[0.04] shadow-sm" : "border-border/60"}`}><div className="flex items-center gap-3"><Checkbox checked={selected} onCheckedChange={() => toggleProduct(id)} className="h-5 w-5" /><div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-2"><p className="truncate font-semibold">{product.nome || "Produto sem nome"}</p>{product.localArmazenamento && <Badge variant="secondary" className="text-[10px] capitalize">{String(product.localArmazenamento).replace("camara-fria", "câmara fria")}</Badge>}</div><p className="mt-0.5 truncate text-xs text-muted-foreground">{product.marca || "Sem marca"}{product.lote ? ` • Lote ${product.lote}` : ""}</p></div><div className="hidden items-center gap-1 rounded-lg border bg-background p-1 sm:flex"><Button variant="ghost" size="icon" className="h-7 w-7" disabled={!selected} onClick={() => changeQuantity(id,-1)}><Minus className="h-3.5 w-3.5" /></Button><Input value={qty} onChange={e=>setQuantity(id,Number(e.target.value))} disabled={!selected} className="h-7 w-10 border-0 p-0 text-center text-xs" /><Button variant="ghost" size="icon" className="h-7 w-7" disabled={!selected} onClick={() => changeQuantity(id,1)}><Plus className="h-3.5 w-3.5" /></Button></div><Button variant="outline" size="sm" className="hidden sm:flex" onClick={()=>{setEditingProduct(product);setShowEditor(true)}}><Edit className="mr-2 h-3.5 w-3.5"/> Editar</Button><Button size="sm" className="hidden sm:flex" onClick={()=>openPrint("single",product)}><Printer className="mr-2 h-3.5 w-3.5"/> Imprimir</Button></div><div className="mt-3 flex items-center justify-between gap-2 sm:hidden"><div className="flex items-center gap-1 rounded-lg border bg-background p-1"><Button variant="ghost" size="icon" className="h-8 w-8" disabled={!selected} onClick={()=>changeQuantity(id,-1)}><Minus className="h-3.5 w-3.5"/></Button><span className="w-8 text-center text-sm font-semibold">{qty}</span><Button variant="ghost" size="icon" className="h-8 w-8" disabled={!selected} onClick={()=>changeQuantity(id,1)}><Plus className="h-3.5 w-3.5"/></Button></div><div className="flex gap-2"><Button variant="outline" size="sm" onClick={()=>{setEditingProduct(product);setShowEditor(true)}}><Edit className="mr-1.5 h-3.5 w-3.5"/> Editar</Button><Button size="sm" onClick={()=>openPrint("single",product)}><Printer className="mr-1.5 h-3.5 w-3.5"/> Imprimir</Button></div></div></div>})}</div>}</CardContent></Card>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-[1fr_320px]"><Card className="overflow-hidden border-border/60 shadow-sm"><CardHeader className="border-b bg-muted/20 p-4"><CardTitle className="flex items-center gap-2 text-base"><Eye className="h-5 w-5 text-primary"/> Prévia rápida</CardTitle></CardHeader><CardContent className="flex min-h-[280px] items-center justify-center bg-slate-50 p-6 dark:bg-slate-950">{previewProduct ? <div className="w-full max-w-[360px] rounded-xl border-2 border-slate-900 bg-white p-5 text-slate-900 shadow-xl"><div className="text-center text-lg font-black uppercase">{previewProduct.nome || "NOME DO PRODUTO"}</div><div className="mt-3 space-y-1.5 border-t-2 border-slate-900 pt-3 text-sm"><div><b>Marca:</b> {previewProduct.marca || "—"}</div><div><b>Lote:</b> {previewProduct.lote || "—"}</div><div><b>Validade:</b> {previewProduct.validade ? String(previewProduct.validade) : "—"}</div><div><b>Abertura:</b> {previewProduct.dataAbertura ? String(previewProduct.dataAbertura) : "—"}</div><div><b>Utilizar até:</b> {previewProduct.utilizarAte ? String(previewProduct.utilizarAte) : "—"}</div><div className="mt-3 rounded-md bg-slate-100 p-2 text-center text-xs font-bold uppercase">{String(previewProduct.localArmazenamento || "Armazenamento não definido").replace("camara-fria", "Câmara Fria")}</div></div></div> : <p className="text-sm text-muted-foreground">Selecione um produto para visualizar.</p>}</CardContent></Card><Card className="border-border/60 shadow-sm"><CardHeader className="border-b bg-muted/20 p-4"><CardTitle className="text-base">Resumo da impressão</CardTitle></CardHeader><CardContent className="space-y-4 p-4"><div className="flex justify-between text-sm"><span className="text-muted-foreground">Produtos</span><b>{selectedProducts.length}</b></div><div className="flex justify-between text-sm"><span className="text-muted-foreground">Etiquetas</span><b>{totalLabels}</b></div><div className="flex justify-between text-sm"><span className="text-muted-foreground">Tamanho</span><b>{largura} × {altura} mm</b></div><Button className="w-full" disabled={!selectedData.length} onClick={()=>openPrint("batch")}><Printer className="mr-2 h-4 w-4"/> Imprimir agora</Button></CardContent></Card></div>

      {showEditor && editingProduct && <div ref={editorRef} className="rounded-xl border border-primary/20 bg-primary/[0.02] p-3 sm:p-5"><EtiquetaEditor product={editingProduct} largura={largura} altura={altura} onPrint={async (edited, resp, quantity) => { const expanded=Array(quantity).fill(edited); const qrMap=await buildQrMap([edited]); const html=buildEtiquetaPrintHTML({products:expanded,largura,altura,responsavel:resp,qrMap,title:`ValiControl • ${quantity} etiqueta(s)`}); const w=window.open("","_blank"); if(w){w.document.write(html);w.document.close();setTimeout(()=>w.print(),450)} setShowEditor(false);setEditingProduct(null)}} onClose={()=>{setShowEditor(false);setEditingProduct(null)}}/></div>}
    </div>

    <Dialog open={settingsOpen} onOpenChange={setSettingsOpen}><DialogContent className="sm:max-w-md"><DialogHeader><DialogTitle className="flex items-center gap-2"><Ruler className="h-5 w-5"/> Tamanho da etiqueta</DialogTitle></DialogHeader><div className="grid grid-cols-2 gap-3"><Button variant="outline" onClick={()=>saveSize(52,50)}>57 mm<br/><span className="text-xs text-muted-foreground">52 × 50 mm</span></Button><Button variant="outline" onClick={()=>saveSize(72,100)}>80 mm<br/><span className="text-xs text-muted-foreground">72 × 100 mm</span></Button></div><div className="grid grid-cols-2 gap-3"><label className="text-sm font-medium">Largura (mm)<Input type="number" min="30" max="100" value={largura} onChange={e=>saveSize(Number(e.target.value)||52,altura)}/></label><label className="text-sm font-medium">Altura (mm)<Input type="number" min="20" max="150" value={altura} onChange={e=>saveSize(largura,Number(e.target.value)||50)}/></label></div></DialogContent></Dialog>
    <Dialog open={responsavelOpen} onOpenChange={setResponsavelOpen}><DialogContent className="sm:max-w-md"><DialogHeader><DialogTitle>Quem é o responsável pela etiqueta?</DialogTitle></DialogHeader><ResponsavelSelectField label="Responsável" value={responsavel} onChange={setResponsavel}/><div className="flex justify-end gap-2 pt-2"><Button variant="outline" onClick={()=>setResponsavelOpen(false)}>Cancelar</Button><Button onClick={executePrint}><Printer className="mr-2 h-4 w-4"/> Continuar para imprimir</Button></div></DialogContent></Dialog>
  </PageLayout>;
}
