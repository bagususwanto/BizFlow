import { useQuery } from '@tanstack/react-query';
import { stockValuationService } from '../services/stock-valuation.service';
import { QueryStockValuationValues } from '@bizflow/types';

export const stockValuationKeys = {
  all: ['stockValuation'] as const,
  lists: () => [...stockValuationKeys.all, 'list'] as const,
  list: (filters: string) => [...stockValuationKeys.lists(), { filters }] as const,
};

export function useStockValuation(query: QueryStockValuationValues) {
  return useQuery({
    queryKey: stockValuationKeys.list(JSON.stringify(query)),
    queryFn: () => stockValuationService.getValuation(query),
  });
}
