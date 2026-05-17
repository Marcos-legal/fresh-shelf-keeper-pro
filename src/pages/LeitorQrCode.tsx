import { useEffect, useRef, useState } from "react";
import { Html5Qrcode } from "html5-qrcode";
import { PageLayout } from "@/components/PageLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { QrCode, Camera, CameraOff, Trash2, CheckCircle2, XCircle } from "lucide-react";
import { useProductsSupabase } from "@/hooks/useProductsSupabase";
import { parseEtiquetaQrPayload, EtiquetaQrData } from "@/lib/qrcode";
import { toast } from "@/hooks/use-toast";
import { EtiquetaView } from "@/components/EtiquetaView";
import { cn } from "@/lib/utils";
import { Product } from "@/types/product";

const READER_ID = "valicontrol-qr-reader";

interface ScanItem {
  key: string;
  raw: string;
  parsed: EtiquetaQrData | null;
  product: Product | null;
  scannedAt: number;
}

export default function LeitorQrCode() {
  const { products } = useProductsSupabase();
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const productsRef = useRef(products);
  const startingRef = useRef(false);
  const mountedRef = useRef(true);
  const scansRef = useRef<Set<string>>(new Set());
  const [scanning, setScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [scans, setScans] = useState<ScanItem[]>([]);

  useEffect(() => {
    productsRef.current = products;
    setScans((prev) =>
      prev.map((scan) => {
        if (scan.product || !scan.parsed?.id) return scan;
        const product = products.find((p) => String(p.id) === String(scan.parsed?.id)) || null;
        return product ? { ...scan, product } : scan;
      })
    );
  }, [products]);

  const isProductWithinValidity = (product: Product) => {
    const targetDate = product.utilizarAte instanceof Date
      ? product.utilizarAte
      : product.validade instanceof Date
        ? product.validade
        : undefined;

    if (!targetDate || isNaN(targetDate.getTime())) return true;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const validityDay = new Date(targetDate);
    validityDay.setHours(0, 0, 0, 0);

    return validityDay >= today;
  };

  const stop = async () => {
    try {
      if (scannerRef.current) {
        await scannerRef.current.stop();
        await scannerRef.current.clear();
      }
    } catch {
      // ignore
    } finally {
      scannerRef.current = null;
      setScanning(false);
    }
  };

  const start = async () => {
    if (scannerRef.current || startingRef.current) return;
    setError(null);
    startingRef.current = true;
    try {
      const html5 = new Html5Qrcode(READER_ID);
      scannerRef.current = html5;
      await html5.start(
        { facingMode: "environment" },
        { fps: 10, qrbox: { width: 240, height: 240 } },
        (decoded) => {
          const parsed = parseEtiquetaQrPayload(decoded);
          const key = parsed?.id ? `id:${parsed.id}` : `raw:${decoded}`;
          if (scansRef.current.has(key)) return;
          scansRef.current.add(key);
          const product = parsed?.id
            ? productsRef.current.find((p) => String(p.id) === String(parsed.id)) || null
            : null;
          setScans((prev) => [
            { key, raw: decoded, parsed, product, scannedAt: Date.now() },
            ...prev,
          ]);
          toast({
            title: "QR Code lido",
            description: product ? product.nome : "Etiqueta registrada na lista.",
          });
        },
        () => {
          // ignore per-frame failures
        }
      );
      if (mountedRef.current) setScanning(true);
    } catch (err: any) {
      scannerRef.current = null;
      setError(err?.message || "Não foi possível acessar a câmera.");
      setScanning(false);
    } finally {
      startingRef.current = false;
    }
  };

  const clearAll = () => {
    scansRef.current.clear();
    setScans([]);
  };

  const removeScan = (key: string) => {
    scansRef.current.delete(key);
    setScans((prev) => prev.filter((s) => s.key !== key));
  };

  useEffect(() => {
    mountedRef.current = true;
    start();
    return () => {
      mountedRef.current = false;
      stop();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <PageLayout
      title="Leitor de QR Code"
      description="Escaneie várias etiquetas em sequência sem fechar a câmera"
      icon={QrCode}
    >
      <div className="space-y-4 sm:space-y-6">
        <Card>
          <CardHeader className="p-4 sm:p-6">
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <CardTitle className="flex items-center gap-2 text-sm sm:text-base">
                <Camera className="w-4 h-4 sm:w-5 sm:h-5" />
                Câmera
                {scanning && (
                  <Badge variant="secondary" className="text-xs">Lendo...</Badge>
                )}
              </CardTitle>
              <div className="flex gap-2">
                {scanning ? (
                  <Button variant="outline" size="sm" onClick={stop}>
                    <CameraOff className="w-4 h-4 mr-1.5" /> Parar
                  </Button>
                ) : (
                  <Button size="sm" onClick={start}>
                    <Camera className="w-4 h-4 mr-1.5" /> Iniciar leitura
                  </Button>
                )}
                {scans.length > 0 && (
                  <Button variant="ghost" size="sm" onClick={clearAll}>
                    <Trash2 className="w-4 h-4 mr-1.5" /> Limpar ({scans.length})
                  </Button>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-4 sm:p-6 pt-0">
            <div
              id={READER_ID}
              className="w-full max-w-md mx-auto rounded-lg overflow-hidden bg-muted/30 aspect-square"
            />
            {error && (
              <p className="mt-3 text-sm text-destructive text-center">{error}</p>
            )}
            {scanning && (
              <p className="mt-3 text-xs text-muted-foreground text-center">
                Aponte para cada etiqueta. Já lidas são ignoradas automaticamente.
              </p>
            )}
          </CardContent>
        </Card>

        {scans.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-sm font-semibold text-muted-foreground">
              Etiquetas lidas ({scans.length})
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {scans.map((scan) => {
                const product = scan.product;
                const isValid = product?.status === "valido";
                return (
                  <Card key={scan.key} className="overflow-hidden">
                    <CardHeader className="p-3 sm:p-4">
                      <div className="flex items-center justify-between gap-2">
                        {product ? (
                          <div
                            className={cn(
                              "flex items-center gap-2 rounded-md border-2 px-2 py-1 text-xs font-semibold",
                              isValid
                                ? "border-green-600 bg-green-50 text-green-700 dark:bg-green-950/40 dark:text-green-400"
                                : "border-red-600 bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-400"
                            )}
                          >
                            {isValid ? <CheckCircle2 className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                            <span>{isValid ? "VÁLIDA" : "INVÁLIDA"}</span>
                          </div>
                        ) : (
                          <Badge variant="outline" className="text-xs">Não cadastrada</Badge>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeScan(scan.key)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent className="p-3 sm:p-4 pt-0">
                      {product ? (
                        <div
                          className={cn(
                            "flex justify-center rounded-lg border-4 p-2 bg-white",
                            isValid ? "border-green-600" : "border-red-600"
                          )}
                        >
                          <EtiquetaView product={product} />
                        </div>
                      ) : scan.parsed?.id ? (
                        <p className="text-sm text-muted-foreground">
                          Etiqueta identificada (id: {scan.parsed.id}), mas não está no cadastro atual.
                        </p>
                      ) : (
                        <pre className="text-xs bg-muted/40 p-2 rounded-md break-all whitespace-pre-wrap">
                          {scan.raw}
                        </pre>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </PageLayout>
  );
}
