-- Create produtos_estoque table
CREATE TABLE public.produtos_estoque (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  nome TEXT NOT NULL,
  unidade_medida TEXT NOT NULL,
  quantidade_por_unidade INTEGER NOT NULL DEFAULT 1,
  unidade_conteudo TEXT NOT NULL,
  user_id UUID NOT NULL DEFAULT auth.uid(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create contagens_estoque table
CREATE TABLE public.contagens_estoque (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  produto_id UUID NOT NULL REFERENCES public.produtos_estoque(id) ON DELETE CASCADE,
  quantidade INTEGER NOT NULL DEFAULT 0,
  quantidade_extra INTEGER NOT NULL DEFAULT 0,
  unidade_quantidade_extra TEXT NOT NULL DEFAULT 'porcoes' CHECK (unidade_quantidade_extra IN ('porcoes', 'unidades')),
  quantidade_total DECIMAL(10,2) NOT NULL DEFAULT 0,
  data_contagem TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  responsavel TEXT,
  observacoes TEXT,
  user_id UUID NOT NULL DEFAULT auth.uid(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.produtos_estoque ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contagens_estoque ENABLE ROW LEVEL SECURITY;

-- RLS policies for produtos_estoque
CREATE POLICY "Users can view their own stock products" 
ON public.produtos_estoque 
FOR SELECT 
USING (auth.uid() = user_id OR has_role(auth.uid(), 'admin'));

CREATE POLICY "Users can create their own stock products" 
ON public.produtos_estoque 
FOR INSERT 
WITH CHECK (auth.uid() = user_id OR has_role(auth.uid(), 'admin'));

CREATE POLICY "Users can update their own stock products" 
ON public.produtos_estoque 
FOR UPDATE 
USING (auth.uid() = user_id OR has_role(auth.uid(), 'admin'));

CREATE POLICY "Users can delete their own stock products" 
ON public.produtos_estoque 
FOR DELETE 
USING (auth.uid() = user_id OR has_role(auth.uid(), 'admin'));

-- RLS policies for contagens_estoque
CREATE POLICY "Users can view their own stock counts" 
ON public.contagens_estoque 
FOR SELECT 
USING (auth.uid() = user_id OR has_role(auth.uid(), 'admin'));

CREATE POLICY "Users can create their own stock counts" 
ON public.contagens_estoque 
FOR INSERT 
WITH CHECK (auth.uid() = user_id OR has_role(auth.uid(), 'admin'));

CREATE POLICY "Users can update their own stock counts" 
ON public.contagens_estoque 
FOR UPDATE 
USING (auth.uid() = user_id OR has_role(auth.uid(), 'admin'));

CREATE POLICY "Users can delete their own stock counts" 
ON public.contagens_estoque 
FOR DELETE 
USING (auth.uid() = user_id OR has_role(auth.uid(), 'admin'));

-- Create trigger for produtos_estoque updated_at
CREATE TRIGGER update_produtos_estoque_updated_at
BEFORE UPDATE ON public.produtos_estoque
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX idx_produtos_estoque_user_id ON public.produtos_estoque(user_id);
CREATE INDEX idx_produtos_estoque_nome ON public.produtos_estoque(nome);
CREATE INDEX idx_contagens_estoque_user_id ON public.contagens_estoque(user_id);
CREATE INDEX idx_contagens_estoque_produto_id ON public.contagens_estoque(produto_id);
CREATE INDEX idx_contagens_estoque_data ON public.contagens_estoque(data_contagem DESC);