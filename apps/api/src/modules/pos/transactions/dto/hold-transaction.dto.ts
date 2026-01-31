import { createZodDto } from 'nestjs-zod';
import { holdTransactionSchema } from '@bizflow/types';

export class HoldTransactionDto extends createZodDto(holdTransactionSchema) {}
