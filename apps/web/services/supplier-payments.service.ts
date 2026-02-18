import {
  CreateSupplierPaymentValues,
  UpdateSupplierPaymentValues,
  QuerySupplierPaymentsValues,
  ApiResponse,
  SupplierPayment,
} from '@bizflow/types';
import { apiClient } from '@/lib/fetch-client';
import { buildSearchParams } from '@/lib/utils';

export interface SupplierPaymentListResponse {
  data: SupplierPayment[];
  meta: {
    page: number;
    pageSize: number;
    totalItems: number;
    totalPages: number;
  };
  summary: {
    totalPayments: number;
    totalAmount: number;
  };
}

class SupplierPaymentsService {
  async getAll(
    params?: QuerySupplierPaymentsValues,
  ): Promise<SupplierPaymentListResponse> {
    const searchParams = buildSearchParams(params || {});
    return apiClient.get<SupplierPaymentListResponse>(
      `/purchases/payments?${searchParams.toString()}`,
    );
  }

  async getById(id: string): Promise<SupplierPayment> {
    const res = await apiClient.get<ApiResponse<SupplierPayment>>(
      `/purchases/payments/${id}`,
    );
    return res.data!;
  }

  async create(data: CreateSupplierPaymentValues): Promise<SupplierPayment> {
    const res = await apiClient.post<ApiResponse<SupplierPayment>>(
      '/purchases/payments',
      data,
    );
    return res.data!;
  }

  async update(
    id: string,
    data: UpdateSupplierPaymentValues,
  ): Promise<SupplierPayment> {
    const res = await apiClient.patch<ApiResponse<SupplierPayment>>(
      `/purchases/payments/${id}`,
      data,
    );
    return res.data!;
  }

  async delete(id: string): Promise<ApiResponse<void>> {
    return apiClient.delete<ApiResponse<void>>(`/purchases/payments/${id}`);
  }

  async bulkDelete(ids: string[]): Promise<ApiResponse<void>> {
    return apiClient.post<ApiResponse<void>>(
      '/purchases/payments/bulk-delete',
      {
        ids,
      },
    );
  }

  async generatePaymentNumber(): Promise<string> {
    const res = await apiClient.get<ApiResponse<{ paymentNumber: string }>>(
      '/purchases/payments/generate-payment-number',
    );
    return res.data!.paymentNumber;
  }
}

export const supplierPaymentsService = new SupplierPaymentsService();
