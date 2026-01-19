import type { Product } from './product';

export interface UnitOfMeasure {
  id: string;
  name: string;
  symbol: string;
  baseUnitId?: string | null;
  conversionRate?: number | null;
  createdAt: Date;

  // Relations
  baseUnit?: UnitOfMeasure | null;
  derivedUnits?: UnitOfMeasure[];
  products?: Product[];
  _count?: {
    derivedUnits: number;
    products: number;
  };
}

export type CreateUnitValues = {
  name: string;
  symbol: string;
  baseUnitId?: string;
  conversionRate?: number;
};

export type UpdateUnitValues = Partial<CreateUnitValues>;

export interface UnitListResponse {
  data: UnitOfMeasure[];
  meta: {
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
  };
  summary: {
    totalUnits: number;
    baseUnits: number;
    derivedUnits: number;
  };
}
