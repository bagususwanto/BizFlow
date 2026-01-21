import {
  CreateProductValues,
  UpdateProductValues,
  QueryProductsValues,
  Product,
  ApiResponse,
} from '@bizflow/types';
import { apiClient } from '@/lib/fetch-client';
import { buildSearchParams } from '@/lib/utils';

export interface ProductWithRelations
  extends Omit<Product, 'category' | 'unit'> {
  category?: { id: string; name: string };
  unit?: { id: string; name: string; symbol: string };
  variantCount?: number;
  priceLevelCount?: number;
}

export interface ProductsResponse {
  data: ProductWithRelations[];
  meta: {
    page: number;
    pageSize: number;
    totalItems: number;
    totalPages: number;
  };
  summary: {
    totalProducts: number;
    activeProducts: number;
    inactiveProducts: number;
    serviceProducts: number;
    lowStockProducts: number;
  };
}

class ProductsService {
  async getAll(params?: QueryProductsValues): Promise<ProductsResponse> {
    const searchParams = buildSearchParams(params || {});
    return apiClient.get<ProductsResponse>(
      `/master-data/products?${searchParams.toString()}`,
    );
  }

  async getActiveList(): Promise<
    {
      id: string;
      sku: string;
      name: string;
      sellPrice: number;
      unit?: { symbol: string };
    }[]
  > {
    const res = await apiClient.get<
      ApiResponse<
        {
          id: string;
          sku: string;
          name: string;
          sellPrice: number;
          unit?: { symbol: string };
        }[]
      >
    >('/master-data/products/list/active');
    return res.data!;
  }

  async getLowStock(): Promise<
    {
      id: string;
      sku: string;
      name: string;
      category: string;
      unit: string;
      minStock: number;
      currentStock: number;
    }[]
  > {
    const res = await apiClient.get<
      ApiResponse<
        {
          id: string;
          sku: string;
          name: string;
          category: string;
          unit: string;
          minStock: number;
          currentStock: number;
        }[]
      >
    >('/master-data/products/low-stock');
    return res.data!;
  }

  async generateSku(categoryId?: string): Promise<string> {
    const params = categoryId ? `?categoryId=${categoryId}` : '';
    const res = await apiClient.get<ApiResponse<{ sku: string }>>(
      `/master-data/products/generate-sku${params}`,
    );
    return res.data!.sku;
  }

  async getById(id: string): Promise<ProductWithRelations> {
    const res = await apiClient.get<ApiResponse<ProductWithRelations>>(
      `/master-data/products/${id}`,
    );
    return res.data!;
  }

  async create(data: CreateProductValues): Promise<Product> {
    const res = await apiClient.post<ApiResponse<Product>>(
      '/master-data/products',
      data,
    );
    return res.data!;
  }

  async update(id: string, data: UpdateProductValues): Promise<Product> {
    const res = await apiClient.patch<ApiResponse<Product>>(
      `/master-data/products/${id}`,
      data,
    );
    return res.data!;
  }

  async delete(id: string): Promise<void> {
    await apiClient.delete<ApiResponse<void>>(`/master-data/products/${id}`);
  }

  async bulkDelete(ids: string[]): Promise<void> {
    await apiClient.post<ApiResponse<void>>(
      '/master-data/products/bulk-delete',
      {
        ids,
      },
    );
  }
}

export const productsService = new ProductsService();
