import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { stockLotsService, CreateStockLotDto, UpdateStockLotDto } from '../services/stock-lots.service';
import type { QueryStockLotsValues } from '@bizflow/types';

export const stockLotsKeys = {
  all: ['stockLots'] as const,
  lists: () => [...stockLotsKeys.all, 'list'] as const,
  list: (filters: string) => [...stockLotsKeys.lists(), { filters }] as const,
  details: () => [...stockLotsKeys.all, 'detail'] as const,
  detail: (id: string) => [...stockLotsKeys.details(), id] as const,
};

export function useStockLots(query: QueryStockLotsValues) {
  return useQuery({
    queryKey: stockLotsKeys.list(JSON.stringify(query)),
    queryFn: () => stockLotsService.getStockLots(query),
  });
}

export function useStockLot(id: string) {
  return useQuery({
    queryKey: stockLotsKeys.detail(id),
    queryFn: () => stockLotsService.getStockLotById(id),
    enabled: !!id,
  });
}

export function useCreateStockLot() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateStockLotDto) => stockLotsService.createStockLot(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: stockLotsKeys.lists() });
    },
  });
}

export function useUpdateStockLot() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateStockLotDto }) =>
      stockLotsService.updateStockLot(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: stockLotsKeys.lists() });
      queryClient.invalidateQueries({ queryKey: stockLotsKeys.detail(variables.id) });
    },
  });
}
