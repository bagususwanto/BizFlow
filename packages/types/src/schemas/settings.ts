import { z } from 'zod';

// ========================================
// Settings Enums
// ========================================

export const SettingCategory = {
  COMPANY: 'company',
  TAX: 'tax',
  RECEIPT: 'receipt',
  DISPLAY: 'display',
  GENERAL: 'general',
} as const;

export type SettingCategoryType =
  (typeof SettingCategory)[keyof typeof SettingCategory];

export const SettingType = {
  STRING: 'string',
  NUMBER: 'number',
  BOOLEAN: 'boolean',
  JSON: 'json',
} as const;

export type SettingTypeValue = (typeof SettingType)[keyof typeof SettingType];

// ========================================
// App Setting Schema
// ========================================

export const appSettingSchema = z.object({
  id: z.string(),
  key: z.string(),
  value: z.string(),
  type: z.enum(['string', 'number', 'boolean', 'json']),
  category: z.enum(['company', 'tax', 'receipt', 'display', 'general']),
  label: z.string().nullable(),
  createdAt: z.string().or(z.date()),
  updatedAt: z.string().or(z.date()),
});

export type AppSetting = z.infer<typeof appSettingSchema>;

// ========================================
// Query Settings Schema
// ========================================

export const querySettingsSchema = z.object({
  category: z
    .enum(['company', 'tax', 'receipt', 'display', 'general'])
    .optional(),
});

export type QuerySettingsValues = z.infer<typeof querySettingsSchema>;

// ========================================
// Update Settings Schema (Batch)
// ========================================

export const updateSettingItemSchema = z.object({
  key: z.string().min(1, { message: 'Key wajib diisi' }),
  value: z.string(),
});

export type UpdateSettingItem = z.infer<typeof updateSettingItemSchema>;

export const updateSettingsSchema = z.object({
  settings: z
    .array(updateSettingItemSchema)
    .min(1, { message: 'Minimal 1 setting untuk diupdate' }),
});

export type UpdateSettingsValues = z.infer<typeof updateSettingsSchema>;

// ========================================
// Settings Response Types
// ========================================

export interface SettingsSummary {
  totalSettings: number;
  categoryCounts: {
    company: number;
    tax: number;
    receipt: number;
    display: number;
    general: number;
  };
}

export interface SettingsResponse {
  data: AppSetting[];
  meta: {
    totalItems: number;
  };
  summary: SettingsSummary;
}

export interface UpdateSettingsResponse {
  success: boolean;
  message: string;
  data: {
    updated: number;
  };
}
