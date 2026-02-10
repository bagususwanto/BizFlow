import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { QueryDashboardDto } from './dto';
import { JwtAuthGuard, PermissionsGuard } from '../../../common/guards';
import { Permissions } from '../../../common/decorators/permissions.decorator';
import { Permission } from '@bizflow/types';
import { successResponse } from '../../../common/utils';

@Controller('reports/dashboard')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get()
  @Permissions(Permission.Reports.Read)
  async getDashboard(@Query() query: QueryDashboardDto) {
    const data = await this.dashboardService.getDashboard(query);
    return successResponse(data);
  }
}
