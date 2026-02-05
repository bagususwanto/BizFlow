import { ApiResponse } from '@bizflow/types';
import { apiClient } from '@/lib/fetch-client';

export interface Promotion {
  id: string;
  code?: string;
  name: string;
  type: 'percentage' | 'fixed' | 'buy_x_get_y';
  value?: number;
  minPurchase?: number;
  maxDiscount?: number;
  applyTo: 'all' | 'category' | 'product';
  targetIds?: string; // JSON string
  startDate: string;
  endDate: string;
  isActive: boolean;
}

export const promotionsService = {
  getActivePromotions: async () => {
    return apiClient.get<ApiResponse<Promotion[]>>(
      '/master-data/promotions/active',
    );
  },
};
