import { useQuery } from '@tanstack/react-query';
import { stockService } from '@/services/stock.service';
import { useAuthStore } from '@/stores/auth.store';
import { QueryStockMovementValues, QueryStockCardValues } from '@bizflow/types';

export function useStockMovements(params?: QueryStockMovementValues) {
  const token = useAuthStore((state) => state.accessToken);

  return useQuery({
    queryKey: ['stock-movements', params],
    queryFn: () => stockService.getMovements(params),
    enabled: !!token,
    placeholderData: (previousData) => previousData,
  });
}

export function useStockCard(variantId: string, params?: QueryStockCardValues) {
  const token = useAuthStore((state) => state.accessToken);

  return useQuery({
    queryKey: ['stock-card', variantId, params],
    queryFn: () => stockService.getStockCard(variantId, params),
    enabled: !!token && !!variantId,
  });
}
