import { useQuery } from '@tanstack/react-query';
import { auditLogService } from '@/services/audit-logs.service';
import { AuditLogQuery } from '@bizflow/types';

export function useAuditLogs(params?: AuditLogQuery) {
  const {
    data,
    isLoading,
    isError,
    error,
    refetch,
    isFetching,
    isPlaceholderData,
  } = useQuery({
    queryKey: ['audit-logs', params],
    queryFn: () => auditLogService.getAll(params),
    placeholderData: (previousData) => previousData,
  });

  return {
    auditLogs: data?.data || [],
    meta: data?.meta,
    summary: data?.summary,
    isLoading,
    isError,
    error,
    refetch,
    isFetching,
    isPlaceholderData,
  };
}
