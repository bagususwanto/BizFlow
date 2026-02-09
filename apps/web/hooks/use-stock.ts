import { useQuery } from '@tanstack/react-query';
import { stockService } from '@/services/stock.service';
import { useAuthStore } from '@/stores/auth.store';
import { QueryStockValues } from '@bizflow/types';

export function useStocks(params?: QueryStockValues) {
  const token = useAuthStore((state) => state.accessToken);

  return useQuery({
    queryKey: ['stocks', params],
    queryFn: () => stockService.getAll(params),
    enabled: !!token,
    placeholderData: (previousData) => previousData,
  });
}

export function useStockByVariant(variantId: string) {
  const token = useAuthStore((state) => state.accessToken);

  return useQuery({
    queryKey: ['stock', 'variant', variantId],
    queryFn: () => stockService.getByVariant(variantId),
    enabled: !!token && !!variantId,
  });
}

export function useStockByWarehouse(warehouseId: string) {
  const token = useAuthStore((state) => state.accessToken);

  return useQuery({
    queryKey: ['stock', 'warehouse', warehouseId],
    queryFn: () => stockService.getByWarehouse(warehouseId),
    enabled: !!token && !!warehouseId,
  });
}
