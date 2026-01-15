import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  UseGuards,
  Get,
  Req,
  Param,
} from '@nestjs/common';
import type { Request } from 'express';

import { JwtAuthGuard, JwtRefreshGuard } from '../../../common/guards';
import { successResponse } from '../../../common/utils';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { AuditLog } from '../../../common/decorators/audit-log.decorator';
import { AuditLogInterceptor } from '../../../common/interceptors/audit-log.interceptor';
import { UseInterceptors } from '@nestjs/common';
import { AuditAction, Module } from '@bizflow/types';

import { AuthService } from './auth.service';
import {
  LoginDto,
  PinLoginDto,
  RefreshTokenDto,
  ForgotPasswordDto,
  ResetPasswordDto,
} from './dto';
import type { JwtPayload } from './strategies/jwt.strategy';
import type { RefreshTokenPayload } from './strategies/jwt-refresh.strategy';

@Controller('core/auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @UseInterceptors(AuditLogInterceptor)
  @AuditLog({
    module: Module.AUTH,
    action: AuditAction.LOGIN,
    entityType: 'user',
  })
  async login(@Body() dto: LoginDto, @Req() req: Request) {
    const ipAddress = req.ip || req.socket.remoteAddress;
    const userAgent = req.get('User-Agent');

    return this.authService.login(dto, ipAddress, userAgent);
  }

  @Post('pin-login')
  @HttpCode(HttpStatus.OK)
  @UseInterceptors(AuditLogInterceptor)
  @AuditLog({
    module: Module.AUTH,
    action: AuditAction.LOGIN,
    entityType: 'user',
  })
  async pinLogin(@Body() dto: PinLoginDto, @Req() req: Request) {
    const ipAddress = req.ip || req.socket.remoteAddress;
    const userAgent = req.get('User-Agent');

    return this.authService.pinLogin(dto, ipAddress, userAgent);
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtRefreshGuard)
  async refresh(
    @CurrentUser() user: RefreshTokenPayload & { refreshToken: string },
  ) {
    return this.authService.refreshTokens(user.sub, user.refreshToken);
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @UseInterceptors(AuditLogInterceptor)
  @AuditLog({
    module: Module.AUTH,
    action: AuditAction.LOGOUT,
    entityType: 'user',
  })
  @UseGuards(JwtAuthGuard)
  async logout(@CurrentUser() user: JwtPayload, @Req() req: Request) {
    const ipAddress = req.ip || req.socket.remoteAddress;
    const userAgent = req.get('User-Agent');

    return this.authService.logout(user.sub, ipAddress, userAgent);
  }

  @Get('users-for-pin')
  async getUsersForPinLogin() {
    return this.authService.getUsersForPinLogin();
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  getMe(@CurrentUser() user: JwtPayload) {
    return successResponse({
      id: user.sub,
      username: user.username,
      role: user.role,
      permissions: user.permissions,
      outlets: user.outlets,
    });
  }

  // Password Reset Endpoints

  @Post('forgot-password')
  @HttpCode(HttpStatus.OK)
  async forgotPassword(@Body() dto: ForgotPasswordDto) {
    return this.authService.requestPasswordReset(dto.email);
  }

  @Get('verify-reset-token/:token')
  async verifyResetToken(@Param('token') token: string) {
    return this.authService.verifyResetToken(token);
  }

  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  @UseInterceptors(AuditLogInterceptor)
  @AuditLog({
    module: Module.AUTH,
    action: AuditAction.UPDATE,
    entityType: 'user',
  })
  async resetPassword(@Body() dto: ResetPasswordDto) {
    return this.authService.resetPassword(dto.token, dto.password);
  }
}
