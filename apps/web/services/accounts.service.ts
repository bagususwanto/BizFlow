import { ApiResponse } from '@bizflow/types';
import { apiClient } from '@/lib/fetch-client';

export interface Account {
  id: string;
  name: string;
  code: string;
  balance: number;
  isActive: boolean;
}

class AccountsService {
  async getAll(): Promise<Account[]> {
    const res =
      await apiClient.get<ApiResponse<Account[]>>('/finance/accounts');
    return res.data!;
  }
}

export const accountsService = new AccountsService();
