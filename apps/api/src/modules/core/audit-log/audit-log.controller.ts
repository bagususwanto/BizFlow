import { Controller, Get, Query, UseGuards } from '@nestjs/common';

import { JwtAuthGuard, PermissionsGuard } from '../../../common/guards';
import { Permissions } from '../../../common/decorators/permissions.decorator';
import { AuditLogService } from './audit-log.service';
import { AuditLogQueryDto } from './dto';

@Controller('core/audit-logs')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class AuditLogController {
  constructor(private readonly auditLogService: AuditLogService) {}

  /**
   * Get all audit logs with pagination and filters
   */
  @Get()
  @Permissions('audit-log:read')
  async findAll(@Query() query: AuditLogQueryDto) {
    return this.auditLogService.findAll(query);
  }
}
