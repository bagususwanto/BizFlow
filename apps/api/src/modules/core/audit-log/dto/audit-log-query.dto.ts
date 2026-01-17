import { createZodDto } from 'nestjs-zod';
import { auditLogQuerySchema } from '@bizflow/types';

export class AuditLogQueryDto extends createZodDto(auditLogQuerySchema) {}
