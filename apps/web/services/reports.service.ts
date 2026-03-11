import { apiClient } from '@/lib/fetch-client';
import {
  QueryDashboardValues,
  QuerySalesReportValues,
  QueryStockReportValues,
  QueryStockValuationValues,
  ApiMeta,
  ApiResponse,
} from '@bizflow/types';

// ========================================
// Dashboard Types
// ========================================

export interface DashboardSummary {
  totalSalesToday: number;
  transactionCountToday: number;
  averagePerTransaction: number;
  salesChange: number; // percentage vs yesterday
  transactionChange: number; // percentage vs yesterday
}

export interface TopProduct {
  variantId: string;
  productName: string;
  variantName: string;
  sku: string;
  quantity: number;
}

export interface StockAlertItem {
  variantId: string;
  productName: string;
  variantName: string;
  sku: string;
  warehouse: string;
  currentStock: number;
  minStock: number;
}

export interface RecentTransaction {
  id: string;
  orderNumber: string;
  orderDate: string; // ISO date
  customerName: string;
  cashierName: string;
  total: number;
  status: string;
  paymentStatus: string;
}

export interface DashboardData {
  summary: DashboardSummary;
  topProducts: TopProduct[];
  stockAlerts: {
    count: number;
    items: StockAlertItem[];
  };
  recentTransactions: RecentTransaction[];
}

// ========================================
// Sales Report Types
// ========================================

export interface SalesSummary {
  totalSales: number;
  totalTransactions: number;
  totalDiscount: number;
  totalTax: number;
  averagePerTransaction: number;
  salesChange: number; // percentage vs previous period
  transactionChange: number; // percentage vs previous period
}

export interface DailyBreakdown {
  date: string; // YYYY-MM-DD
  total: number;
  count: number;
}

export interface SalesDetailItem {
  productName: string;
  variantName: string;
  categoryName: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
}

export interface SalesOrder {
  id: string;
  orderNumber: string;
  orderDate: string; // ISO date
  customerName: string;
  cashierName: string;
  outletName: string;
  subtotal: number;
  discountAmount: number;
  taxAmount: number;
  total: number;
  status: string;
  paymentStatus: string;
  items: SalesDetailItem[];
}

export interface SalesReportResponse {
  summary: SalesSummary;
  dailyBreakdown: DailyBreakdown[];
  details: SalesOrder[];
  meta: ApiMeta;
}

// ========================================
// Stock Report Types
// ========================================

export interface StockSummary {
  totalSku: number;
  totalStockValue: number;
  lowStockCount: number;
  outOfStockCount: number;
}

export interface StockData {
  id: string;
  variantId: string;
  sku: string;
  productName: string;
  variantName: string;
  categoryName: string;
  warehouseName: string;
  quantity: number;
  minStock: number;
  costPrice: number;
  totalValue: number;
  isLowStock: boolean;
  isOutOfStock: boolean;
}

export interface StockReportResponse {
  summary: StockSummary;
  data: StockData[];
  meta: ApiMeta;
}

// ========================================
// Service Class
// ========================================

export class ReportsService {
  private buildQueryString(params: any): string {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        searchParams.append(key, String(value));
      }
    });
    return searchParams.toString();
  }

  async getDashboard(params?: QueryDashboardValues): Promise<DashboardData> {
    const queryString = params ? `?${this.buildQueryString(params)}` : '';
    const response = await apiClient.get<ApiResponse<DashboardData>>(
      `/reports/dashboard${queryString}`,
    );
    return response.data!;
  }

  async getSalesReport(
    params: QuerySalesReportValues,
  ): Promise<SalesReportResponse> {
    const queryString = this.buildQueryString(params);
    // The backend returns successResponse({ summary, dailyBreakdown, details }, meta)
    // So response.data is fields excluding meta.
    const response = await apiClient.get<
      ApiResponse<Omit<SalesReportResponse, 'meta'>>
    >(`/reports/sales?${queryString}`);

    return {
      summary: response.data!.summary,
      dailyBreakdown: response.data!.dailyBreakdown,
      details: response.data!.details,
      meta: response.meta!,
    };
  }

  async getStockReport(
    params: QueryStockReportValues,
  ): Promise<StockReportResponse> {
    const queryString = this.buildQueryString(params);
    // The backend returns paginatedResponse(data, meta, summary)
    // So response.data is StockData[], response.summary is StockSummary
    const response = await apiClient.get<
      ApiResponse<StockData[]> & { summary?: StockSummary }
    >(`/reports/inventory?${queryString}`);

    return {
      summary: response.summary!,
      data: response.data!,
      meta: response.meta!,
    };
  }

  async exportSales(
    params: QuerySalesReportValues,
    format: 'excel' | 'pdf',
  ): Promise<void> {
    const queryString = this.buildQueryString(params);
    const blob = await apiClient.getBlob(
      `/reports/export/sales/${format}?${queryString}`,
    );

    // Create download link
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `sales-report.${format === 'excel' ? 'xlsx' : 'pdf'}`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  }

  async exportStock(
    params: QueryStockReportValues,
    format: 'excel' | 'pdf',
  ): Promise<void> {
    const queryString = this.buildQueryString(params);
    const blob = await apiClient.getBlob(
      `/reports/export/inventory/${format}?${queryString}`,
    );

    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `stock-report.${format === 'excel' ? 'xlsx' : 'pdf'}`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  }

  async exportValuation(
    params: QueryStockValuationValues,
    format: 'excel' | 'pdf',
  ): Promise<void> {
    const queryString = this.buildQueryString(params);
    const blob = await apiClient.getBlob(
      `/reports/export/valuation/${format}?${queryString}`,
    );

    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `valuation-report.${format === 'excel' ? 'xlsx' : 'pdf'}`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  }
}

export const reportsService = new ReportsService();
