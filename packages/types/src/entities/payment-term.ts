import { z } from 'zod';
import { queryPaymentTermsSchema } from '../schemas/payment-term';

export interface PaymentTerm {
  id: string;
  name: string;
  daysDue: number;
  description: string | null;
  isActive: boolean;
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface PaymentTermListResponse {
  data: PaymentTerm[];
  meta: {
    page: number;
    pageSize: number;
    totalItems: number;
    totalPages: number;
  };
  summary: {
    total: number;
    active: number;
    inactive: number;
  };
}

export type PaymentTermsQuery = z.infer<typeof queryPaymentTermsSchema>;
