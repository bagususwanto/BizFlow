import {
  CreateCustomerPaymentValues,
  UpdateCustomerPaymentValues,
  QueryCustomerPaymentsValues,
  ApiResponse,
  Payment as CustomerPayment,
} from '@bizflow/types';
import { apiClient } from '@/lib/fetch-client';
import { buildSearchParams } from '@/lib/utils';

export interface CustomerPaymentListResponse {
  data: CustomerPayment[];
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

class CustomerPaymentsService {
  async getAll(
    params?: QueryCustomerPaymentsValues,
  ): Promise<CustomerPaymentListResponse> {
    const searchParams = buildSearchParams(params || {});
    return apiClient.get<CustomerPaymentListResponse>(
      `/sales/payments?${searchParams.toString()}`,
    );
  }

  async getById(id: string): Promise<CustomerPayment> {
    const res = await apiClient.get<ApiResponse<CustomerPayment>>(
      `/sales/payments/${id}`,
    );
    return res.data!;
  }

  async create(data: CreateCustomerPaymentValues): Promise<CustomerPayment> {
    const res = await apiClient.post<ApiResponse<CustomerPayment>>(
      '/sales/payments',
      data,
    );
    return res.data!;
  }

  async update(
    id: string,
    data: UpdateCustomerPaymentValues,
  ): Promise<CustomerPayment> {
    const res = await apiClient.patch<ApiResponse<CustomerPayment>>(
      `/sales/payments/${id}`,
      data,
    );
    return res.data!;
  }

  async delete(id: string): Promise<ApiResponse<void>> {
    return apiClient.delete<ApiResponse<void>>(`/sales/payments/${id}`);
  }

  async bulkDelete(ids: string[]): Promise<ApiResponse<void>> {
    return apiClient.post<ApiResponse<void>>(
      '/sales/payments/bulk-delete',
      {
        ids,
      },
    );
  }

  async generatePaymentNumber(): Promise<string> {
    const res = await apiClient.get<ApiResponse<{ paymentNumber: string }>>(
      '/sales/payments/generate-payment-number',
    );
    return res.data!.paymentNumber;
  }
}

export const customerPaymentsService = new CustomerPaymentsService();
