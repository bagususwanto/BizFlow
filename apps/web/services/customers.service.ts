import {
  CreateCustomerValues,
  UpdateCustomerValues,
  Customer,
  ApiResponse,
  CustomerListResponse,
} from '@bizflow/types';
import { apiClient } from '@/lib/fetch-client';
import { buildSearchParams } from '@/lib/utils';

export interface CustomersQuery {
  page?: number;
  pageSize?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  isActive?: boolean;
}

export interface FinancialInfo {
  creditLimit: number;
  currentBalance: number;
  availableCredit: number;
  isOverLimit: boolean;
}

class CustomersService {
  async getAll(params?: CustomersQuery): Promise<CustomerListResponse> {
    const searchParams = buildSearchParams(params || {});
    return apiClient.get<CustomerListResponse>(
      `/master-data/customers?${searchParams.toString()}`,
    );
  }

  async getById(id: string): Promise<Customer> {
    const res = await apiClient.get<ApiResponse<Customer>>(
      `/master-data/customers/${id}`,
    );
    return res.data!;
  }

  async create(data: CreateCustomerValues): Promise<Customer> {
    const res = await apiClient.post<ApiResponse<Customer>>(
      '/master-data/customers',
      data,
    );
    return res.data!;
  }

  async update(id: string, data: UpdateCustomerValues): Promise<Customer> {
    const res = await apiClient.patch<ApiResponse<Customer>>(
      `/master-data/customers/${id}`,
      data,
    );
    return res.data!;
  }

  async delete(id: string): Promise<ApiResponse<void>> {
    return apiClient.delete<ApiResponse<void>>(`/master-data/customers/${id}`);
  }

  async bulkDelete(ids: string[]): Promise<ApiResponse<void>> {
    return apiClient.post<ApiResponse<void>>(
      '/master-data/customers/bulk-delete',
      {
        ids,
      },
    );
  }

  async getActiveList(): Promise<Customer[]> {
    const res = await apiClient.get<ApiResponse<Customer[]>>(
      '/master-data/customers/list/active',
    );
    return res.data!;
  }

  async getFinancialInfo(id: string): Promise<FinancialInfo> {
    const res = await apiClient.get<ApiResponse<FinancialInfo>>(
      `/master-data/customers/${id}/financial-info`,
    );
    return res.data!;
  }

  async generateCode(): Promise<string> {
    const res = await apiClient.get<ApiResponse<{ code: string }>>(
      '/master-data/customers/generate-code',
    );
    return res.data!.code;
  }
}

export const customersService = new CustomersService();
