import {
  CreateProductValues,
  UpdateProductValues,
  QueryProductsValues,
  CreateVariantValues,
  UpdateVariantValues,
  CreatePriceLevelValues,
  UpdatePriceLevelValues,
  Product,
  ProductVariant,
  ApiResponse,
} from '@bizflow/types';
import { apiClient } from '@/lib/fetch-client';
import { buildSearchParams } from '@/lib/utils';

export interface ProductWithRelations
  extends Omit<Product, 'category' | 'unit'> {
  category?: { id: string; name: string };
  unit?: { id: string; name: string; symbol: string };
  images?: { id: string; url: string; order: number }[];
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
      costPrice: number;
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
          costPrice: number;
          sellPrice: number;
          unit?: { symbol: string };
        }[]
      >
    >('/master-data/products/list/active');
    return res.data!;
  }

  async getLowStock(params?: { page?: number; pageSize?: number }): Promise<{
    data: {
      id: string;
      variantId: string;
      warehouseId: string;
      sku: string;
      name: string;
      variantName: string;
      warehouseName: string;
      category: string;
      unit: string;
      minStock: number;
      currentStock: number;
    }[];
    meta: {
      page: number;
      pageSize: number;
      totalItems: number;
      totalPages: number;
    };
  }> {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.set('page', String(params.page));
    if (params?.pageSize) searchParams.set('pageSize', String(params.pageSize));

    const queryString = searchParams.toString();
    const url = `/master-data/products/low-stock${queryString ? `?${queryString}` : ''}`;

    return apiClient.get(url);
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

  async delete(id: string): Promise<ApiResponse<void>> {
    return apiClient.delete<ApiResponse<void>>(`/master-data/products/${id}`);
  }

  async bulkDelete(ids: string[]): Promise<ApiResponse<void>> {
    return apiClient.post<ApiResponse<void>>(
      '/master-data/products/bulk-delete',
      {
        ids,
      },
    );
  }

  // ========================================
  // Variants
  // ========================================

  async getVariants(productId: string): Promise<ProductVariant[]> {
    const res = await apiClient.get<ApiResponse<ProductVariant[]>>(
      `/master-data/products/${productId}/variants`,
    );
    return res.data!;
  }

  async getVariantById(id: string): Promise<ProductVariant> {
    const res = await apiClient.get<ApiResponse<ProductVariant>>(
      `/master-data/products/variants/${id}`,
    );
    return res.data!;
  }

  async createVariant(
    productId: string,
    data: CreateVariantValues,
  ): Promise<ProductVariant> {
    const res = await apiClient.post<ApiResponse<ProductVariant>>(
      `/master-data/products/${productId}/variants`,
      data,
    );
    return res.data!;
  }

  async updateVariant(
    id: string,
    data: UpdateVariantValues,
  ): Promise<ProductVariant> {
    const res = await apiClient.patch<ApiResponse<ProductVariant>>(
      `/master-data/products/variants/${id}`,
      data,
    );
    return res.data!;
  }

  async deleteVariant(id: string): Promise<ApiResponse<void>> {
    return apiClient.delete<ApiResponse<void>>(
      `/master-data/products/variants/${id}`,
    );
  }

  async bulkDeleteVariants(ids: string[]): Promise<ApiResponse<void>> {
    return apiClient.post<ApiResponse<void>>(
      '/master-data/products/variants/bulk-delete',
      {
        ids,
      },
    );
  }

  async generateVariantSku(productId: string): Promise<string> {
    const response = await apiClient.get<{ data: { sku: string } }>(
      `/master-data/products/${productId}/variants/generate-sku`,
    );
    return response.data.sku;
  }

  // ========================================
  // PRICE LEVELS
  // ========================================

  async getPriceLevels(productId: string): Promise<any[]> {
    const res = await apiClient.get<ApiResponse<any[]>>(
      `/master-data/products/${productId}/price-levels`,
    );
    return res.data || [];
  }

  async getPriceLevelById(id: string): Promise<any> {
    const res = await apiClient.get<ApiResponse<any>>(
      `/master-data/products/price-levels/${id}`,
    );
    return res.data!;
  }

  async createPriceLevel(
    productId: string,
    data: CreatePriceLevelValues,
  ): Promise<any> {
    const res = await apiClient.post<ApiResponse<any>>(
      `/master-data/products/${productId}/price-levels`,
      data,
    );
    return res.data!;
  }

  async updatePriceLevel(
    id: string,
    data: UpdatePriceLevelValues,
  ): Promise<any> {
    const res = await apiClient.patch<ApiResponse<any>>(
      `/master-data/products/price-levels/${id}`,
      data,
    );
    return res.data!;
  }

  async deletePriceLevel(id: string): Promise<ApiResponse<void>> {
    return apiClient.delete<ApiResponse<void>>(
      `/master-data/products/price-levels/${id}`,
    );
  }

  async bulkDeletePriceLevels(ids: string[]): Promise<ApiResponse<void>> {
    return apiClient.post<ApiResponse<void>>(
      '/master-data/products/price-levels/bulk-delete',
      {
        ids,
      },
    );
  }
}

export const productsService = new ProductsService();
