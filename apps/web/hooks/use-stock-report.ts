import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '@/stores/auth.store';
import { reportsService } from '@/services/reports.service';
import { QueryStockReportValues } from '@bizflow/types';

export function useStockReport(params: QueryStockReportValues) {
  const token = useAuthStore((state) => state.accessToken);

  return useQuery({
    queryKey: ['stock-report', params],
    queryFn: () => reportsService.getStockReport(params),
    enabled: !!token,
  });
}
