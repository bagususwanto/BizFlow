import {
  AppSetting,
  ApiResponse,
  UpdateSettingsValues,
  SettingsResponse,
  UpdateSettingsResponse,
  QuerySettingsValues,
} from '@bizflow/types';
import { apiClient } from '@/lib/fetch-client';
import { buildSearchParams } from '@/lib/utils';

export interface GroupedSettings {
  [key: string]: AppSetting[];
}

class SettingsService {
  async getAll(params?: QuerySettingsValues): Promise<SettingsResponse> {
    const searchParams = buildSearchParams(params || {});
    const queryString = searchParams.toString();
    const url = queryString
      ? `/core/settings?${queryString}`
      : '/core/settings';

    return apiClient.get<SettingsResponse>(url);
  }

  async getGrouped(): Promise<ApiResponse<GroupedSettings>> {
    return apiClient.get<ApiResponse<GroupedSettings>>(
      '/core/settings/grouped',
    );
  }

  async getByKey(key: string): Promise<AppSetting> {
    const res = await apiClient.get<ApiResponse<AppSetting>>(
      `/core/settings/${key}`,
    );
    return res.data!;
  }

  async updateBatch(
    data: UpdateSettingsValues,
  ): Promise<UpdateSettingsResponse> {
    const res = await apiClient.patch<ApiResponse<UpdateSettingsResponse>>(
      '/core/settings',
      data,
    );
    return res.data!;
  }
}

export const settingsService = new SettingsService();
