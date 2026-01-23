import {
  CreateCategoryValues,
  UpdateCategoryValues,
  QueryCategoriesValues,
  Category,
  CategoryTreeNode,
  CategoryWithRelations,
  ApiResponse,
} from '@bizflow/types';
import { apiClient } from '@/lib/fetch-client';
import { buildSearchParams } from '@/lib/utils';

export interface CategoriesResponse {
  data: CategoryWithRelations[];
  meta: {
    page: number;
    pageSize: number;
    totalItems: number;
    totalPages: number;
  };
  summary: {
    totalCategories: number;
    activeCategories: number;
    inactiveCategories: number;
    rootCategories: number;
  };
}

class CategoriesService {
  async getAll(params?: QueryCategoriesValues): Promise<CategoriesResponse> {
    const searchParams = buildSearchParams(params || {});
    return apiClient.get<CategoriesResponse>(
      `/master-data/categories?${searchParams.toString()}`,
    );
  }

  async getTree(): Promise<CategoryTreeNode[]> {
    const res = await apiClient.get<ApiResponse<CategoryTreeNode[]>>(
      '/master-data/categories/tree',
    );
    return res.data!;
  }

  async getActiveList(): Promise<{ id: string; name: string }[]> {
    const res = await apiClient.get<
      ApiResponse<{ id: string; name: string }[]>
    >('/master-data/categories/list/active');
    return res.data!;
  }

  async getById(id: string): Promise<CategoryWithRelations> {
    const res = await apiClient.get<ApiResponse<CategoryWithRelations>>(
      `/master-data/categories/${id}`,
    );
    return res.data!;
  }

  async create(data: CreateCategoryValues): Promise<Category> {
    const res = await apiClient.post<ApiResponse<Category>>(
      '/master-data/categories',
      data,
    );
    return res.data!;
  }

  async update(id: string, data: UpdateCategoryValues): Promise<Category> {
    const res = await apiClient.patch<ApiResponse<Category>>(
      `/master-data/categories/${id}`,
      data,
    );
    return res.data!;
  }

  async delete(id: string): Promise<ApiResponse<void>> {
    return apiClient.delete<ApiResponse<void>>(`/master-data/categories/${id}`);
  }

  async bulkDelete(ids: string[]): Promise<ApiResponse<void>> {
    return apiClient.post<ApiResponse<void>>(
      '/master-data/categories/bulk-delete',
      {
        ids,
      },
    );
  }

  async reorder(
    id: string,
    parentId: string | null,
    index: number,
  ): Promise<void> {
    await apiClient.patch<ApiResponse<void>>(
      `/master-data/categories/${id}/reorder`,
      {
        parentId,
        index,
      },
    );
  }
}

export const categoriesService = new CategoriesService();
