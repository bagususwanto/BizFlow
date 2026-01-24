import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
  UseInterceptors,
} from '@nestjs/common';
import { JwtAuthGuard, PermissionsGuard } from '../../../common/guards';
import { CurrentUser } from '../../../common/decorators';
import { Permissions } from '../../../common/decorators/permissions.decorator';
import { AuditLog } from '../../../common/decorators/audit-log.decorator';
import { AuditLogInterceptor } from '../../../common/interceptors/audit-log.interceptor';
import type { JwtPayload } from '../../core/auth/strategies/jwt.strategy';
import {
  Permission,
  PermissionType,
  Module,
  AuditAction,
  ApiResponse,
} from '@bizflow/types';
import { CustomersService } from './customers.service';
import { CreateCustomerDto, UpdateCustomerDto, QueryCustomersDto } from './dto';
import { Prisma } from '@bizflow/database';

@Controller('master-data/customers')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class CustomersController {
  constructor(private readonly customersService: CustomersService) {}

  @Get()
  @Permissions(Permission.Customers.Read)
  async findAll(
    @Query() query: QueryCustomersDto,
  ): Promise<
    ApiResponse<Prisma.CustomerGetPayload<object>[]> & { summary?: any }
  > {
    return this.customersService.findAll(query);
  }

  @Get('list/active')
  @Permissions(Permission.Customers.Read)
  async findActiveList() {
    return this.customersService.findActiveList();
  }

  @Get('generate-code')
  @Permissions(Permission.Customers.Read)
  async generateCode() {
    const code = await this.customersService.generateCode();
    return { data: { code } };
  }

  @Get(':id')
  @Permissions(Permission.Customers.Read)
  async findById(
    @Param('id') id: string,
  ): Promise<ApiResponse<Prisma.CustomerGetPayload<object>>> {
    return this.customersService.findById(id);
  }

  @Get(':id/financial-info')
  @Permissions(Permission.Customers.Read)
  async getFinancialInfo(@Param('id') id: string) {
    return this.customersService.getFinancialInfo(id);
  }

  @Post()
  @Permissions(Permission.Customers.Create as PermissionType)
  @UseInterceptors(AuditLogInterceptor)
  @AuditLog({
    module: Module.CUSTOMERS,
    action: AuditAction.CREATE,
    entityType: 'customer',
  })
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Body() dto: CreateCustomerDto,
    @CurrentUser() user: JwtPayload,
  ): Promise<ApiResponse<Prisma.CustomerGetPayload<object>>> {
    return this.customersService.create(dto, user.sub);
  }

  @Patch(':id')
  @Permissions(Permission.Customers.Update as PermissionType)
  @UseInterceptors(AuditLogInterceptor)
  @AuditLog({
    module: Module.CUSTOMERS,
    action: AuditAction.UPDATE,
    entityType: 'customer',
  })
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateCustomerDto,
    @CurrentUser() user: JwtPayload,
  ): Promise<ApiResponse<Prisma.CustomerGetPayload<object>>> {
    return this.customersService.update(id, dto, user.sub);
  }

  @Delete(':id')
  @Permissions(Permission.Customers.Delete as PermissionType)
  @UseInterceptors(AuditLogInterceptor)
  @AuditLog({
    module: Module.CUSTOMERS,
    action: AuditAction.DELETE,
    entityType: 'customer',
  })
  @HttpCode(HttpStatus.OK)
  async delete(@Param('id') id: string, @CurrentUser() user: JwtPayload) {
    return this.customersService.delete(id, user.sub);
  }

  @Post('bulk-delete')
  @Permissions(Permission.Customers.Delete as PermissionType)
  @UseInterceptors(AuditLogInterceptor)
  @AuditLog({
    module: Module.CUSTOMERS,
    action: AuditAction.DELETE,
    entityType: 'customer (bulk)',
  })
  @HttpCode(HttpStatus.OK)
  async bulkDelete(
    @Body() body: { ids: string[] },
    @CurrentUser() user: JwtPayload,
  ) {
    return this.customersService.bulkDelete(body.ids, user.sub);
  }
}
