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
  createdAt: string;
  createdBy: string;
}