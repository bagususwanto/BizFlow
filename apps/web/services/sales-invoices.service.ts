import {
  CreateInvoiceValues,
  UpdateInvoiceValues,
  QueryInvoicesValues,
  UpdateInvoiceStatusValues,
  ApiResponse,
  Invoice,
} from '@bizflow/types';
import { apiClient } from '@/lib/fetch-client';
import { buildSearchParams } from '@/lib/utils';

export interface InvoiceListResponse {
  data: Invoice[];
  meta: {
    page: number;
    pageSize: number;
    totalItems: number;
    totalPages: number;
  };
  summary: {
    totalInvoices: number;
    draftInvoices: number;
    sentInvoices: number;
    partialInvoices: number;
    paidInvoices: number;
    cancelledInvoices: number;
  };
}

class SalesInvoicesService {
  async getAll(
    params?: QueryInvoicesValues,
  ): Promise<InvoiceListResponse> {
    const searchParams = buildSearchParams(params || {});
    return apiClient.get<InvoiceListResponse>(
      `/sales/invoices?${searchParams.toString()}`,
    );
  }

  async getById(id: string): Promise<Invoice> {
    const res = await apiClient.get<ApiResponse<Invoice>>(
      `/sales/invoices/${id}`,
    );
    return res.data!;
  }

  async create(data: CreateInvoiceValues): Promise<Invoice> {
    const res = await apiClient.post<ApiResponse<Invoice>>(
      '/sales/invoices',
      data,
    );
    return res.data!;
  }

  async update(
    id: string,
    data: UpdateInvoiceValues,
  ): Promise<Invoice> {
    const res = await apiClient.patch<ApiResponse<Invoice>>(
      `/sales/invoices/${id}`,
      data,
    );
    return res.data!;
  }

  async updateStatus(
    id: string,
    data: UpdateInvoiceStatusValues,
  ): Promise<Invoice> {
    const res = await apiClient.patch<ApiResponse<Invoice>>(
      `/sales/invoices/${id}/status`,
      data,
    );
    return res.data!;
  }

  async delete(id: string): Promise<ApiResponse<void>> {
    return apiClient.delete<ApiResponse<void>>(`/sales/invoices/${id}`);
  }

  async bulkDelete(ids: string[]): Promise<ApiResponse<void>> {
    return apiClient.post<ApiResponse<void>>('/sales/invoices/bulk-delete', {
      ids,
    });
  }

  async generateInvoiceNumber(): Promise<string> {
    const res = await apiClient.get<ApiResponse<{ invoiceNumber: string }>>(
      '/sales/invoices/generate-invoice-number',
    );
    return res.data!.invoiceNumber;
  }
}

export const salesInvoicesService = new SalesInvoicesService();
