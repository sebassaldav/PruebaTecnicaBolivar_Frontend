import { InvoiceType } from './invoice.model';

export interface InvoiceRequest {
  type: InvoiceType;
  subtotal: number;
  customsCode?: string;
}