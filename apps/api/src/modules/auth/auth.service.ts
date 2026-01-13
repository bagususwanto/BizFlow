import {
  Injectable,
  UnauthorizedException,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';

import { PrismaService } from '../../prisma';
import { successResponse } from '../../common/utils';
import { LoginDto, PinLoginDto } from './dto';
import type { JwtPayload } from './strategies/jwt.strategy';
import { AuditLogService } from '../audit-log';

interface LoginAttempt {
  count: number;
  lockedUntil: Date | null;
}

// In-memory store for login attempts (could be replaced with Redis in production)
const loginAttempts = new Map<string, LoginAttempt>();

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
  ) {}

  async login(dto: LoginDto, ipAddress?: string, userAgent?: string) {
    const { username, password } = dto;

    // Check if account is locked
    this.checkAccountLock(username);

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
      this.recordFailedAttempt(username);
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
      this.recordFailedAttempt(username);
      throw new UnauthorizedException('Username atau password tidak valid');
    }

    // Clear failed attempts on successful login
    this.clearFailedAttempts(username);

    // Generate tokens
    const tokens = await this.generateTokens(user);

    // Update last login
    await this.prisma.user.update({
      where: { id: user.id },
      data: { lastLogin: new Date() },
    });

    // Create audit log
    await this.auditLogService.create({
      userId: user.id,
      action: 'login',
      module: 'auth',
      ipAddress,
      userAgent,
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

    // Create audit log
    await this.auditLogService.create({
      userId: user.id,
      action: 'login',
      module: 'auth',
      ipAddress,
      userAgent,
      newValue: JSON.stringify({ method: 'pin' }),
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

    // Create audit log
    await this.auditLogService.create({
      userId,
      action: 'logout',
      module: 'auth',
      ipAddress,
      userAgent,
    });

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

  private checkAccountLock(username: string) {
    const attempt = loginAttempts.get(username);
    if (attempt?.lockedUntil && new Date() < attempt.lockedUntil) {
      const remainingMinutes = Math.ceil(
        (attempt.lockedUntil.getTime() - Date.now()) / 1000 / 60,
      );
      throw new ForbiddenException(
        `Akun terkunci. Coba lagi dalam ${remainingMinutes} menit`,
      );
    }
  }

  private recordFailedAttempt(username: string) {
    const attempt = loginAttempts.get(username) || {
      count: 0,
      lockedUntil: null,
    };
    attempt.count++;

    if (attempt.count >= MAX_LOGIN_ATTEMPTS) {
      attempt.lockedUntil = new Date(
        Date.now() + LOCK_DURATION_MINUTES * 60 * 1000,
      );
      this.logger.warn(
        `Account ${username} locked due to too many failed attempts`,
      );
    }

    loginAttempts.set(username, attempt);
  }

  private clearFailedAttempts(username: string) {
    loginAttempts.delete(username);
  }
}
