import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  UseGuards,
  Get,
  Req,
} from '@nestjs/common';
import type { Request } from 'express';

import { CurrentUser } from '../../common/decorators';
import { JwtAuthGuard, JwtRefreshGuard } from '../../common/guards';

import { AuthService } from './auth.service';
import { LoginDto, PinLoginDto, RefreshTokenDto } from './dto';
import type { JwtPayload } from './strategies/jwt.strategy';
import type { RefreshTokenPayload } from './strategies/jwt-refresh.strategy';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() dto: LoginDto, @Req() req: Request) {
    const ipAddress = req.ip || req.socket.remoteAddress;
    const userAgent = req.get('User-Agent');

    return this.authService.login(dto, ipAddress, userAgent);
  }

  @Post('pin-login')
  @HttpCode(HttpStatus.OK)
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
    return {
      id: user.sub,
      username: user.username,
      role: user.role,
      permissions: user.permissions,
      outlets: user.outlets,
    };
  }
}
