import type { ActiveEntity } from './base';

export interface Warehouse extends ActiveEntity {
  code: string;
  name: string;
  address?: string | null;
  isDefault: boolean;
}

export interface WarehouseListResponse {
  data: Warehouse[];
  meta: {
    page: number;
    pageSize: number;
    totalItems: number;
    totalPages: number;
  };
  summary?: {
    totalWarehouses: number;
    activeWarehouses: number;
    inactiveWarehouses: number;
    defaultWarehouse?: string;
  };
}
