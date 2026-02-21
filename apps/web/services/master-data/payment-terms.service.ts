import {
  CreatePaymentTermValues,
  UpdatePaymentTermValues,
  PaymentTerm,
  ApiResponse,
  PaymentTermListResponse,
  PaymentTermsQuery,
} from '@bizflow/types';
import { apiClient } from '@/lib/fetch-client';
import { buildSearchParams } from '@/lib/utils';

class PaymentTermsService {
  async getAll(params?: PaymentTermsQuery): Promise<PaymentTermListResponse> {
    const searchParams = buildSearchParams(params || {});
    return apiClient.get<PaymentTermListResponse>(
      `/master-data/payment-terms?${searchParams.toString()}`,
    );
  }

  async getById(id: string): Promise<PaymentTerm> {
    const res = await apiClient.get<ApiResponse<PaymentTerm>>(
      `/master-data/payment-terms/${id}`,
    );
    return res.data!;
  }

  async create(data: CreatePaymentTermValues): Promise<PaymentTerm> {
    const res = await apiClient.post<ApiResponse<PaymentTerm>>(
      '/master-data/payment-terms',
      data,
    );
    return res.data!;
  }

  async update(
    id: string,
    data: UpdatePaymentTermValues,
  ): Promise<PaymentTerm> {
    const res = await apiClient.patch<ApiResponse<PaymentTerm>>(
      `/master-data/payment-terms/${id}`,
      data,
    );
    return res.data!;
  }

  async delete(id: string): Promise<ApiResponse<void>> {
    return apiClient.delete<ApiResponse<void>>(
      `/master-data/payment-terms/${id}`,
    );
  }

  async bulkDelete(ids: string[]): Promise<ApiResponse<void>> {
    return apiClient.post<ApiResponse<void>>(
      '/master-data/payment-terms/bulk-delete',
      { ids },
    );
  }

  async getActiveList(): Promise<PaymentTerm[]> {
    const res = await apiClient.get<ApiResponse<PaymentTerm[]>>(
      '/master-data/payment-terms/list/active',
    );
    return res.data!;
  }
}

export const paymentTermsService = new PaymentTermsService();
