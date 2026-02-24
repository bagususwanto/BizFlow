import { createZodDto } from 'nestjs-zod';
import { holdTransactionSchema } from '@bizflow/types';
import type { POSCartItemValues } from '@bizflow/types';

export class HoldTransactionDto extends createZodDto(holdTransactionSchema) {
  declare items: POSCartItemValues[];
  declare customerId?: string;
  declare note?: string;
  declare discountPercent: number;
  declare discountAmount: number;
}
