import { QueryStockLotsValues } from '@bizflow/types';

export interface LotsTableProps {
  data: any[];
  isLoading?: boolean;
  onRefresh?: () => void;
  query: QueryStockLotsValues;
  meta: {
    page: number;
    pageSize: number;
    totalItems: number;
    totalPages: number;
  };
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
  onSortChange: (sortBy: string, sortOrder: 'asc' | 'desc') => void;
}
