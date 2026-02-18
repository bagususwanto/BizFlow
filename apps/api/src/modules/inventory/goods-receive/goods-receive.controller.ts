import {
  Controller,
  Get,
  Post,
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
import { GoodsReceiveService } from './goods-receive.service';
import { CreateGoodsReceiveDto, QueryGoodsReceivesDto } from './dto';
import { Prisma } from '@bizflow/database';

@Controller('inventory/goods-receive')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class GoodsReceiveController {
  constructor(private readonly goodsReceiveService: GoodsReceiveService) {}

  @Get()
  @Permissions(Permission.GoodsReceive.Read)
  async findAll(
    @Query() query: QueryGoodsReceivesDto,
  ): Promise<ApiResponse<Prisma.GoodsReceiveGetPayload<object>[]>> {
    return this.goodsReceiveService.findAll(query);
  }

  @Get('generate-receive-number')
  @Permissions(Permission.GoodsReceive.Read)
  async generateReceiveNumber() {
    const receiveNumber =
      await this.goodsReceiveService.generateReceiveNumber();
    return { data: { receiveNumber } };
  }

  @Get(':id')
  @Permissions(Permission.GoodsReceive.Read)
  async findById(
    @Param('id') id: string,
  ): Promise<ApiResponse<Prisma.GoodsReceiveGetPayload<object>>> {
    return this.goodsReceiveService.findById(id);
  }

  @Post()
  @Permissions(Permission.GoodsReceive.Create as PermissionType)
  @UseInterceptors(AuditLogInterceptor)
  @AuditLog({
    module: Module.GOODS_RECEIVE,
    action: AuditAction.CREATE,
    entityType: 'goods_receive',
  })
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Body() dto: CreateGoodsReceiveDto,
    @CurrentUser() user: JwtPayload,
  ): Promise<ApiResponse<Prisma.GoodsReceiveGetPayload<object>>> {
    return this.goodsReceiveService.create(dto, user.sub);
  }

  @Delete(':id')
  @Permissions(Permission.GoodsReceive.Delete as PermissionType)
  @UseInterceptors(AuditLogInterceptor)
  @AuditLog({
    module: Module.GOODS_RECEIVE,
    action: AuditAction.DELETE,
    entityType: 'goods_receive',
  })
  @HttpCode(HttpStatus.OK)
  async delete(@Param('id') id: string, @CurrentUser() user: JwtPayload) {
    return this.goodsReceiveService.delete(id, user.sub);
  }
}
