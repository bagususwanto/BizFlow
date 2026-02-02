import { createZodDto } from 'nestjs-zod';
import { holdTransactionSchema } from '@bizflow/types';
import type { POSCartItemValues } from '@bizflow/types';

export class HoldTransactionDto extends createZodDto(holdTransactionSchema) {
  items: POSCartItemValues[];
  customerId?: string;
  note?: string;
  discountPercent: number;
  discountAmount: number;
}
