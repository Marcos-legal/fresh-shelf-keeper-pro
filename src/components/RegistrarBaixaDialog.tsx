import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import { Trash2 } from "lucide-react";

const MOTIVOS = [
  "Vencido",
  "Contaminado / impróprio",
  "Quebra ou avaria",
  "Sobra de produção",
  "Erro de preparo",
  "Outro",
];

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  productName: string;
  onConfirm: (motivo: string) => Promise<void> | void;
}

export function RegistrarBaixaDialog({ open, onOpenChange, productName, onConfirm }: Props) {
  const [motivoBase, setMotivoBase] = useState<string>(MOTIVOS[0]);
  const [obs, setObs] = useState("");
  const [loading, setLoading] = useState(false);

  const handleConfirm = async () => {
    setLoading(true);
    try {
      const motivo = obs.trim() ? `${motivoBase} — ${obs.trim()}` : motivoBase;
      await onConfirm(motivo);
      setObs("");
      setMotivoBase(MOTIVOS[0]);
      onOpenChange(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Trash2 className="w-5 h-5 text-destructive" /> Descartar produto
          </DialogTitle>
          <DialogDescription>
            Registrar baixa por descarte: <strong>{productName}</strong>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Motivo do descarte</Label>
            <Select value={motivoBase} onValueChange={setMotivoBase}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {MOTIVOS.map((m) => (
                  <SelectItem key={m} value={m}>
                    {m}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Observação (opcional)</Label>
            <Textarea
              value={obs}
              onChange={(e) => setObs(e.target.value)}
              placeholder="Detalhes adicionais..."
              rows={3}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
            Cancelar
          </Button>
          <Button variant="destructive" onClick={handleConfirm} disabled={loading}>
            {loading ? "Registrando..." : "Confirmar descarte"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
