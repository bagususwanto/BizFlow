import { createZodDto } from 'nestjs-zod';
import {
  createPrinterSchema,
  updatePrinterSchema,
  queryPrintersSchema,
  printReceiptSchema,
} from '@bizflow/types';

export class CreatePrinterDto extends createZodDto(createPrinterSchema) {}

export class UpdatePrinterDto extends createZodDto(updatePrinterSchema) {}

export class QueryPrintersDto extends createZodDto(queryPrintersSchema) {}

export class PrintReceiptDto extends createZodDto(printReceiptSchema) {
  transactionId!: string;
  printerId!: string;
  outletId!: string;
}
