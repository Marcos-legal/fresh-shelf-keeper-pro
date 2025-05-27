
export type StorageLocation = 'refrigerado' | 'congelado' | 'ambiente' | 'camara-fria';

export interface Product {
  id: string;
  nome: string;
  lote: string;
  marca: string;
  dataFabricacao: Date;
  validade: Date;
  dataAbertura?: Date;
  diasParaVencer: number;
  utilizarAte?: Date;
  localArmazenamento: StorageLocation;
  responsavel: string;
  status: 'valido' | 'proximo-vencimento' | 'vencido';
  criadoEm: Date;
  atualizadoEm: Date;
}

export interface ProductFormData {
  nome: string;
  lote: string;
  marca: string;
  dataFabricacao: string;
  validade: string;
  dataAbertura?: string;
  diasParaVencer: number;
  localArmazenamento: StorageLocation;
  responsavel: string;
}

export interface ProductStats {
  total: number;
  validos: number;
  proximoVencimento: number;
  vencidos: number;
  porCategoria: {
    refrigerado: number;
    congelado: number;
    ambiente: number;
    'camara-fria': number;
  };
}
