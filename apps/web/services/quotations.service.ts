import {
  CreateQuotationValues,
  UpdateQuotationValues,
  QueryQuotationsValues,
  UpdateQuotationStatusValues,
  ConvertQuotationValues,
  ApiResponse,
} from '@bizflow/types';
import { apiClient } from '@/lib/fetch-client';
import { buildSearchParams } from '@/lib/utils';
// Note: We use any for Quotation since the type isn't fully exported to FE yet,
// but it'll match Prisma.QuotationGetPayload<object>

export interface QuotationListResponse {
  data: any[];
  meta: {
    page: number;
    pageSize: number;
    totalItems: number;
    totalPages: number;
  };
  summary: {
    totalQuotations: number;
    draftCount: number;
    sentCount: number;
    acceptedCount: number;
    rejectedCount: number;
    expiredCount: number;
  };
}

class QuotationsService {
  async getAll(
    params?: QueryQuotationsValues,
  ): Promise<QuotationListResponse> {
    const searchParams = buildSearchParams(params || {});
    return apiClient.get<QuotationListResponse>(
      `/sales/quotations?${searchParams.toString()}`,
    );
  }

  async getById(id: string): Promise<any> {
    const res = await apiClient.get<ApiResponse<any>>(
      `/sales/quotations/${id}`,
    );
    return res.data!;
  }

  async create(data: CreateQuotationValues): Promise<any> {
    const res = await apiClient.post<ApiResponse<any>>(
      '/sales/quotations',
      data,
    );
    return res.data!;
  }

  async update(
    id: string,
    data: UpdateQuotationValues,
  ): Promise<any> {
    const res = await apiClient.patch<ApiResponse<any>>(
      `/sales/quotations/${id}`,
      data,
    );
    return res.data!;
  }

  async updateStatus(
    id: string,
    data: UpdateQuotationStatusValues,
  ): Promise<any> {
    const res = await apiClient.patch<ApiResponse<any>>(
      `/sales/quotations/${id}/status`,
      data,
    );
    return res.data!;
  }

  async convertToSalesOrder(
    id: string,
    data: ConvertQuotationValues,
  ): Promise<any> {
    const res = await apiClient.post<ApiResponse<any>>(
      `/sales/quotations/${id}/convert`,
      data,
    );
    return res.data!;
  }

  async delete(id: string): Promise<ApiResponse<void>> {
    return apiClient.delete<ApiResponse<void>>(`/sales/quotations/${id}`);
  }

  async bulkDelete(ids: string[]): Promise<ApiResponse<void>> {
    return apiClient.post<ApiResponse<void>>('/sales/quotations/bulk-delete', {
      ids,
    });
  }

  async generateQuotationNumber(): Promise<string> {
    const res = await apiClient.get<ApiResponse<{ quotationNumber: string }>>(
      '/sales/quotations/generate-quotation-number',
    );
    return res.data!.quotationNumber;
  }
}

export const quotationsService = new QuotationsService();
