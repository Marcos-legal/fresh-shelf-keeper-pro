
export type StorageLocation = 'refrigerado' | 'congelado' | 'ambiente' | 'camara-fria';

export type ProductStatus = 'valido' | 'proximo-vencimento' | 'vencido';

export interface Product {
  id: string;
  nome: string;
  lote: string;
  marca: string;
  dataFabricacao?: Date;
  validade?: Date | string;
  dataAbertura?: Date;
  diasParaVencer: number;
  utilizarAte?: Date;
  localArmazenamento: StorageLocation;
  responsavel: string;
  status: ProductStatus;
  criadoEm: Date;
  atualizadoEm: Date;
  showOptionalDates?: boolean; // Nova propriedade para controle individual
}

export interface ProductFormData {
  nome: string;
  lote: string;
  marca: string;
  dataFabricacao?: string;
  validade?: string;
  dataAbertura?: string;
  diasParaVencer: number;
  localArmazenamento: StorageLocation;
  responsavel: string;
  showOptionalDates?: boolean; // Nova propriedade para o formulário
}

export interface ProductStats {
  total: number;
  validos: number;
  proximoVencimento: number;
  vencidos: number;
  porCategoria: Record<StorageLocation, number>;
}
