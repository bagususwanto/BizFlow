import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '@/stores/auth.store';
import { reportsService } from '@/services/reports.service';
import { QuerySalesReportValues } from '@bizflow/types';

export function useSalesReport(params: QuerySalesReportValues) {
  const token = useAuthStore((state) => state.accessToken);

  return useQuery({
    queryKey: ['sales-report', params],
    queryFn: () => reportsService.getSalesReport(params),
    enabled: !!token,
  });
}
