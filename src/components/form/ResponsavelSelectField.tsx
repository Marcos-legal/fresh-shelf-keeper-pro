
import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Trash2 } from "lucide-react";
import { useResponsaveis } from "@/contexts/ResponsaveisContext";

interface ResponsavelSelectFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  required?: boolean;
}

export function ResponsavelSelectField({
  label,
  value,
  onChange,
  error,
  required = false,
}: ResponsavelSelectFieldProps) {
  const { responsaveis, addResponsavel, removeResponsavel } = useResponsaveis();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [novoResponsavel, setNovoResponsavel] = useState('');

  const handleAddResponsavel = () => {
    if (novoResponsavel.trim()) {
      addResponsavel(novoResponsavel.trim());
      setNovoResponsavel('');
    }
  };

  const handleRemoveResponsavel = (nome: string) => {
    removeResponsavel(nome);
    if (value === nome) {
      onChange('');
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label>{label} {required && '*'}</Label>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm">
              <Plus className="w-4 h-4 mr-1" />
              Gerenciar
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Gerenciar Responsáveis</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="flex space-x-2">
                <Input
                  value={novoResponsavel}
                  onChange={(e) => setNovoResponsavel(e.target.value)}
                  placeholder="Nome do responsável"
                  onKeyPress={(e) => e.key === 'Enter' && handleAddResponsavel()}
                />
                <Button onClick={handleAddResponsavel}>
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
              <div className="space-y-2">
                {responsaveis.map((responsavel) => (
                  <div key={responsavel} className="flex items-center justify-between p-2 border rounded">
                    <span>{responsavel}</span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleRemoveResponsavel(responsavel)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger className={error ? 'border-red-500' : ''}>
          <SelectValue placeholder="Selecione um responsável" />
        </SelectTrigger>
        <SelectContent>
          {responsaveis.map((responsavel) => (
            <SelectItem key={responsavel} value={responsavel}>
              {responsavel}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  );
}
