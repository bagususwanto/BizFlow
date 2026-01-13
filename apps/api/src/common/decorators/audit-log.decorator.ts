import { SetMetadata } from '@nestjs/common';
import type { Module, AuditAction } from '@bizflow/types';

export const AUDIT_LOG_KEY = 'audit_log';

export interface AuditLogOptions {
  module: Module | string;
  action: AuditAction | string;
  entityType: string;
}

export const AuditLog = (options: AuditLogOptions) =>
  SetMetadata(AUDIT_LOG_KEY, options);
