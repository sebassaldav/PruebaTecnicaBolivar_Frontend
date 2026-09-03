export type InvoiceType =
  | 'NACIONAL'
  | 'EXPORTACION'
  | 'GUBERNAMENTAL';

export interface Invoice {
  id: number;
  consecutive: string;
  customsCode: string | null;
  type: InvoiceType;
  subtotal: number;
  iva: number;
  withholding: number;
  total: number;
  totalInWords: string;
  createdAt: string;
  createdBy: string;
}