import {
  CreatePrinterValues,
  UpdatePrinterValues,
  QueryPrintersValues,
  ApiResponse,
} from '@bizflow/types';
import { apiClient } from '@/lib/fetch-client';
import { buildSearchParams } from '@/lib/utils';
import { Outlet } from './outlets.service';

// Define response type locally
export interface Printer {
  id: string;
  name: string;
  type: 'network' | 'usb';
  address?: string | null;
  width: 58 | 80;
  isDefault: boolean;
  isActive: boolean;
  outletId: string;
  outlet?: Pick<Outlet, 'id' | 'name'>;
  createdAt: string;
  updatedAt: string;
}

export interface PrintersResponse {
  data: Printer[];
  meta: {
    page: number;
    pageSize: number;
    totalItems: number;
    totalPages: number;
  };
  summary: {
    total: number;
    active: number;
    inactive: number;
  };
}

class PrintersService {
  async getAll(params?: QueryPrintersValues): Promise<PrintersResponse> {
    const searchParams = buildSearchParams(params || {});
    return apiClient.get<PrintersResponse>(
      `/core/printers?${searchParams.toString()}`,
    );
  }

  async getById(id: string): Promise<Printer> {
    const res = await apiClient.get<ApiResponse<Printer>>(
      `/core/printers/${id}`,
    );
    return res.data!;
  }

  async create(data: CreatePrinterValues): Promise<Printer> {
    const res = await apiClient.post<ApiResponse<Printer>>(
      '/core/printers',
      data,
    );
    return res.data!;
  }

  async update(id: string, data: UpdatePrinterValues): Promise<Printer> {
    const res = await apiClient.patch<ApiResponse<Printer>>(
      `/core/printers/${id}`,
      data,
    );
    return res.data!;
  }

  async delete(id: string): Promise<ApiResponse<void>> {
    return apiClient.delete<ApiResponse<void>>(`/core/printers/${id}`);
  }

  async bulkDelete(ids: string[]): Promise<ApiResponse<void>> {
    return apiClient.post<ApiResponse<void>>(`/core/printers/bulk-delete`, {
      ids,
    });
  }

  async testPrint(id: string): Promise<ApiResponse<void>> {
    return apiClient.post<ApiResponse<void>>(`/core/printers/${id}/test`, {});
  }

  async openCashDrawer(id: string): Promise<ApiResponse<void>> {
    return apiClient.post<ApiResponse<void>>(
      `/core/printers/${id}/cash-drawer`,
      {},
    );
  }
}

export const printersService = new PrintersService();
