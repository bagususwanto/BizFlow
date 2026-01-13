import {
  Injectable,
  UnauthorizedException,
  ForbiddenException,
  Inject,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';

import { PrismaService } from '../../../prisma';
import { successResponse } from '../../../common/utils';
import { LoginDto, PinLoginDto } from './dto';
import type { JwtPayload } from './strategies/jwt.strategy';
import { AuditLogService } from '../audit-log';

import {
  RATE_LIMITER,
  RateLimiter,
} from '../../../common/interfaces/rate-limiter.interface';

const MAX_LOGIN_ATTEMPTS = 5;
const LOCK_DURATION_MINUTES = 30;

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly auditLogService: AuditLogService,
    @Inject(RATE_LIMITER) private readonly rateLimiter: RateLimiter,
  ) {}

  async login(dto: LoginDto, ipAddress?: string, userAgent?: string) {
    const { username, password } = dto;

    // Check if account is locked
    await this.checkAccountLock(username);

    // Find user with role and permissions
    const user = await this.prisma.user.findUnique({
      where: { username },
      include: {
        role: {
          include: {
            permissions: true,
          },
        },
        outlets: {
          select: {
            outletId: true,
          },
        },
      },
    });

    if (!user) {
      await this.recordFailedAttempt(username);
      throw new UnauthorizedException('Username atau password tidak valid');
    }

    if (!user.isActive) {
      throw new ForbiddenException(
        'Akun Anda dinonaktifkan. Hubungi administrator',
      );
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      await this.recordFailedAttempt(username);
      throw new UnauthorizedException('Username atau password tidak valid');
    }

    // Clear failed attempts on successful login
    await this.clearFailedAttempts(username);

    // Generate tokens
    const tokens = await this.generateTokens(user);

    // Update last login
    await this.prisma.user.update({
      where: { id: user.id },
      data: { lastLogin: new Date() },
    });

    this.logger.log(`User ${user.username} logged in successfully`);

    return successResponse({
      ...tokens,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        name: user.name,
        role: user.role.name,
        permissions: user.role.permissions.map(
          (p) => `${p.module}:${p.action}`,
        ),
        outlets: user.outlets.map((o) => o.outletId),
      },
    });
  }

  async pinLogin(dto: PinLoginDto, ipAddress?: string, userAgent?: string) {
    const { userId, pin } = dto;

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        role: {
          include: {
            permissions: true,
          },
        },
        outlets: {
          select: {
            outletId: true,
          },
        },
      },
    });

    if (!user) {
      throw new UnauthorizedException('User tidak ditemukan');
    }

    if (!user.isActive) {
      throw new ForbiddenException(
        'Akun Anda dinonaktifkan. Hubungi administrator',
      );
    }

    if (!user.pin) {
      throw new UnauthorizedException('PIN belum diatur untuk akun ini');
    }

    // Verify PIN (stored as hashed)
    const isPinValid = await bcrypt.compare(pin, user.pin);
    if (!isPinValid) {
      throw new UnauthorizedException('PIN tidak valid');
    }

    // Generate tokens
    const tokens = await this.generateTokens(user);

    // Update last login
    await this.prisma.user.update({
      where: { id: user.id },
      data: { lastLogin: new Date() },
    });

    this.logger.log(`User ${user.username} logged in with PIN`);

    return successResponse({
      ...tokens,
      user: {
        id: user.id,
        username: user.username,
        name: user.name,
        role: user.role.name,
        permissions: user.role.permissions.map(
          (p) => `${p.module}:${p.action}`,
        ),
        outlets: user.outlets.map((o) => o.outletId),
      },
    });
  }

  async refreshTokens(userId: string, refreshToken: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        role: {
          include: {
            permissions: true,
          },
        },
        outlets: {
          select: {
            outletId: true,
          },
        },
      },
    });

    if (!user || !user.isActive) {
      throw new ForbiddenException('Access Denied');
    }

    // In a production environment, you would validate the refresh token
    // against a stored hashed version in the database

    const tokens = await this.generateTokens(user);
    return successResponse(tokens);
  }

  async logout(userId: string, ipAddress?: string, userAgent?: string) {
    // In a production environment, you would invalidate the refresh token
    // by removing it from the database or adding it to a blacklist

    this.logger.log(`User ${userId} logged out`);

    return successResponse({ message: 'Logout berhasil' });
  }

  async getUsersForPinLogin() {
    const users = await this.prisma.user.findMany({
      where: {
        isActive: true,
        pin: { not: null },
      },
      select: {
        id: true,
        username: true,
        name: true,
      },
      orderBy: { name: 'asc' },
    });

    return successResponse(users);
  }

  private async generateTokens(user: {
    id: string;
    username: string;
    role: { name: string; permissions: { module: string; action: string }[] };
    outlets: { outletId: string }[];
  }) {
    const payload: JwtPayload = {
      sub: user.id,
      username: user.username,
      role: user.role.name,
      permissions: user.role.permissions.map((p) => `${p.module}:${p.action}`),
      outlets: user.outlets.map((o) => o.outletId),
    };

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret: this.configService.get('JWT_ACCESS_SECRET', 'bizflow-secret'),
        expiresIn: '15m',
      }),
      this.jwtService.signAsync(
        { sub: user.id, username: user.username, type: 'refresh' },
        {
          secret: this.configService.get(
            'JWT_REFRESH_SECRET',
            'bizflow-refresh-secret',
          ),
          expiresIn: '7d',
        },
      ),
    ]);

    return {
      accessToken,
      refreshToken,
      expiresIn: 900, // 15 minutes in seconds
    };
  }

  private async checkAccountLock(username: string) {
    const key = `login_attempt:${username}`;
    const windowMs = LOCK_DURATION_MINUTES * 60 * 1000;

    // Check limit (this increments count)
    const allowed = await this.rateLimiter.check(
      key,
      MAX_LOGIN_ATTEMPTS,
      windowMs,
    );

    if (!allowed) {
      throw new ForbiddenException(
        `Akun terkunci sementara karena terlalu banyak percobaan login. Silakan coba lagi dalam ${LOCK_DURATION_MINUTES} menit.`,
      );
    }
  }

  private async recordFailedAttempt(username: string) {
    // Basic RateLimiter check() already increments.
    // So we don't strictly need to do anything here if we call check() on every login attempt.
    // However, if we want to log it or if we change strategy later:
    this.logger.warn(`Failed login attempt for ${username}`);
  }

  private async clearFailedAttempts(username: string) {
    const key = `login_attempt:${username}`;
    await this.rateLimiter.reset(key);
  }
}
