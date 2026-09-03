export interface TotalFacturas {
  type: 'NACIONAL' | 'EXPORTACION' | 'GUBERNAMENTAL';
  total: number;
}