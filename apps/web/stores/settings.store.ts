import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

interface SettingsState {
  dateFormat: string;
  setDateFormat: (format: string) => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      dateFormat: 'DD/MM/YYYY',
      setDateFormat: (format: string) => set({ dateFormat: format }),
    }),
    {
      name: 'bizflow-settings',
      storage: createJSONStorage(() => localStorage),
    },
  ),
);
