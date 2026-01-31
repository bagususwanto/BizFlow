import { createZodDto } from 'nestjs-zod';
import {
  createReturnSchema,
  queryReturnsSchema,
  processReturnRefundSchema,
  approveReturnSchema,
  rejectReturnSchema,
} from '@bizflow/types';

export class CreateReturnDto extends createZodDto(createReturnSchema) {}

export class QueryReturnsDto extends createZodDto(queryReturnsSchema) {}

export class ProcessReturnRefundDto extends createZodDto(
  processReturnRefundSchema,
) {}

export class ApproveReturnDto extends createZodDto(approveReturnSchema) {}

export class RejectReturnDto extends createZodDto(rejectReturnSchema) {}
