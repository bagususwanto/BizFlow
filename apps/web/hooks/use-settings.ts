import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { settingsService } from '@/services/settings.service';
import { QuerySettingsValues, UpdateSettingsValues } from '@bizflow/types';
import { toast } from 'sonner';

export const useSettings = (params?: QuerySettingsValues) => {
  const query = useQuery({
    queryKey: ['settings', params],
    queryFn: () => settingsService.getAll(params),
  });

  return {
    ...query,
    settings: query.data?.data,
    meta: query.data?.meta,
    summary: query.data?.summary,
  };
};

export const useGroupedSettings = () => {
  const query = useQuery({
    queryKey: ['settings', 'grouped'],
    queryFn: () => settingsService.getGrouped(),
  });

  return {
    ...query,
    settings: query.data?.data,
  };
};

import { useAuthStore } from '@/stores/auth.store';

export const useUpdateSettings = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateSettingsValues) =>
      settingsService.updateBatch(data),
    onSuccess: (data, variables) => {
      toast.success(data.message || 'Pengaturan berhasil diperbarui');

      // If language was updated, sync it with the global auth store immediately
      const langUpdate = variables.settings?.find((s) => s.key === 'language');
      if (langUpdate && langUpdate.value) {
        useAuthStore.getState().setLanguage(langUpdate.value as 'id' | 'en');
      }

      queryClient.invalidateQueries({ queryKey: ['settings'] });
    },
    onError: (error: any) => {
      toast.error(
        error.response?.data?.message || 'Gagal memperbarui pengaturan',
      );
    },
  });
};
