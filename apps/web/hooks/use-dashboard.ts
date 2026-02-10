import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '@/stores/auth.store';
import { reportsService } from '@/services/reports.service';
import { QueryDashboardValues } from '@bizflow/types';

export function useDashboard(params?: QueryDashboardValues) {
  const token = useAuthStore((state) => state.accessToken);
  const outletId = params?.outletId;

  return useQuery({
    queryKey: ['dashboard', params],
    queryFn: () => reportsService.getDashboard(params),
    enabled: !!token,
    refetchInterval: 60000, // 60 seconds
  });
}
