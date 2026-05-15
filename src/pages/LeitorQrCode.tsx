import { useEffect, useRef, useState } from "react";
import { Html5Qrcode } from "html5-qrcode";
import { PageLayout } from "@/components/PageLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { QrCode, Camera, CameraOff, RefreshCw, Eye, Pencil } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useProductsSupabase } from "@/hooks/useProductsSupabase";
import { parseEtiquetaQrPayload, EtiquetaQrData } from "@/lib/qrcode";
import { toast } from "@/hooks/use-toast";

const READER_ID = "valicontrol-qr-reader";

export default function LeitorQrCode() {
  const navigate = useNavigate();
  const { products } = useProductsSupabase();
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const [scanning, setScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastRaw, setLastRaw] = useState<string | null>(null);
  const [lastParsed, setLastParsed] = useState<EtiquetaQrData | null>(null);

  const matchedProduct = lastParsed?.id
    ? products.find((p) => String(p.id) === String(lastParsed.id))
    : null;

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
    setError(null);
    setLastRaw(null);
    setLastParsed(null);
    try {
      const html5 = new Html5Qrcode(READER_ID);
      scannerRef.current = html5;
      await html5.start(
        { facingMode: "environment" },
        { fps: 10, qrbox: { width: 240, height: 240 } },
        (decoded) => {
          setLastRaw(decoded);
          setLastParsed(parseEtiquetaQrPayload(decoded));
          toast({ title: "QR Code lido", description: "Verifique os detalhes abaixo." });
          stop();
        },
        () => {
          // per-frame decode failures — ignore
        }
      );
      setScanning(true);
    } catch (err: any) {
      setError(err?.message || "Não foi possível acessar a câmera.");
      setScanning(false);
    }
  };

  useEffect(() => {
    return () => {
      stop();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <PageLayout
      title="Leitor de QR Code"
      description="Escaneie a etiqueta para visualizar o produto"
      icon={QrCode}
    >
      <div className="space-y-4 sm:space-y-6 max-w-3xl">
        <Card>
          <CardHeader className="p-4 sm:p-6">
            <div className="flex items-center justify-between gap-3">
              <CardTitle className="flex items-center gap-2 text-sm sm:text-base">
                <Camera className="w-4 h-4 sm:w-5 sm:h-5" />
                Câmera
              </CardTitle>
              {scanning ? (
                <Button variant="outline" size="sm" onClick={stop}>
                  <CameraOff className="w-4 h-4 mr-1.5" /> Parar
                </Button>
              ) : (
                <Button size="sm" onClick={start}>
                  <Camera className="w-4 h-4 mr-1.5" /> Iniciar leitura
                </Button>
              )}
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
            {!scanning && !error && !lastRaw && (
              <p className="mt-3 text-xs text-muted-foreground text-center">
                Permita o acesso à câmera. Em desktop, use HTTPS para que a câmera funcione.
              </p>
            )}
          </CardContent>
        </Card>

        {lastRaw && (
          <Card>
            <CardHeader className="p-4 sm:p-6">
              <CardTitle className="flex items-center gap-2 text-sm sm:text-base">
                <QrCode className="w-4 h-4 sm:w-5 sm:h-5" />
                Resultado
                {lastParsed?.app === "valicontrol" && (
                  <Badge variant="secondary" className="text-xs">ValiControl</Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 sm:p-6 pt-0 space-y-4">
              {matchedProduct ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                  <Field label="Produto" value={matchedProduct.nome} />
                  <Field label="Lote" value={matchedProduct.lote} />
                  <Field label="Marca" value={matchedProduct.marca} />
                  <Field label="Local" value={matchedProduct.localArmazenamento} />
                  <Field label="Responsável" value={matchedProduct.responsavel} />
                </div>
              ) : lastParsed ? (
                <p className="text-sm text-muted-foreground">
                  Etiqueta ValiControl identificada (id: {lastParsed.id}).
                </p>
              ) : (
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Conteúdo lido:</p>
                  <pre className="text-xs bg-muted/40 p-3 rounded-md break-all whitespace-pre-wrap">
                    {lastRaw}
                  </pre>
                </div>
              )}

              <div className="flex flex-wrap gap-2 pt-2 border-t border-border">
                {matchedProduct && (
                  <>
                    <Button size="sm" onClick={() => navigate("/visualizar-etiquetas")}>
                      <Eye className="w-4 h-4 mr-1.5" /> Ver etiqueta
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => navigate("/cadastro")}>
                      <Pencil className="w-4 h-4 mr-1.5" /> Editar produto
                    </Button>
                  </>
                )}
                <Button size="sm" variant="ghost" onClick={start}>
                  <RefreshCw className="w-4 h-4 mr-1.5" /> Ler outro
                </Button>
              </div>

              {lastParsed?.app === "valicontrol" && !matchedProduct && (
                <p className="text-xs text-muted-foreground">
                  Produto identificado pelo QR não foi encontrado no seu cadastro atual.
                </p>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </PageLayout>
  );
}

function Field({ label, value }: { label: string; value?: string }) {
  return (
    <div className="rounded-md bg-muted/30 p-2">
      <p className="text-[11px] uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="font-medium text-foreground break-words">{value || "—"}</p>
    </div>
  );
}
