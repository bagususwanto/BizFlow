import { createZodDto } from 'nestjs-zod';
import {
  createPOSTransactionSchema,
  queryPOSTransactionsSchema,
} from '@bizflow/types';

export class CreatePOSTransactionDto extends createZodDto(
  createPOSTransactionSchema,
) {}

export class QueryPOSTransactionsDto extends createZodDto(
  queryPOSTransactionsSchema,
) {}
