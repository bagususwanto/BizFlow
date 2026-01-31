import { createZodDto } from 'nestjs-zod';
import {
  createPaymentSchema,
  queryPaymentsSchema,
  processRefundSchema,
  splitPaymentSchema,
} from '@bizflow/types';

export class CreatePaymentDto extends createZodDto(createPaymentSchema) {}

export class QueryPaymentsDto extends createZodDto(queryPaymentsSchema) {}

export class ProcessRefundDto extends createZodDto(processRefundSchema) {}

export class SplitPaymentDto extends createZodDto(splitPaymentSchema) {}
