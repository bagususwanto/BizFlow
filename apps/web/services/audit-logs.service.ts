import { apiClient } from '@/lib/fetch-client';
import { buildSearchParams } from '@/lib/utils';
import { AuditLogQuery, ApiResponse } from '@bizflow/types';

export interface AuditLogUser {
  id: string;
  username: string;
  name: string;
}

export interface AuditLog {
  id: string;
  userId: string;
  action: string;
  module: string;
  entityId?: string;
  entityType?: string;
  oldValue?: string;
  newValue?: string;
  ipAddress?: string;
  userAgent?: string;
  createdAt: string;
  user: AuditLogUser;
}

export interface AuditLogSummary {
  totalLogs: number;
  logsToday: number;
  uniqueUsers: number;
  topModules: {
    module: string;
    count: number;
  }[];
}

export interface AuditLogsResponse {
  data: AuditLog[];
  meta: {
    page: number;
    pageSize: number;
    totalItems: number;
    totalPages: number;
  };
  summary: AuditLogSummary;
}

class AuditLogService {
  async getAll(params?: AuditLogQuery): Promise<AuditLogsResponse> {
    const searchParams = buildSearchParams(params || {});
    const res = await apiClient.get<AuditLogsResponse>(
      `/core/audit-logs?${searchParams.toString()}`,
    );
    return res;
  }

  async exportAll(
    params?: Partial<Omit<AuditLogQuery, 'page' | 'limit'>>,
  ): Promise<AuditLog[]> {
    const searchParams = buildSearchParams({
      ...params,
      page: 1,
      limit: 10000, // Large limit to get all records
    });
    const res = await apiClient.get<AuditLogsResponse>(
      `/core/audit-logs?${searchParams.toString()}`,
    );
    return res.data;
  }
}

export const auditLogService = new AuditLogService();
