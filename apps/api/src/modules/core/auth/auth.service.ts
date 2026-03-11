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
import { randomBytes } from 'crypto';

import { PrismaService } from '../../../prisma';
import { successResponse } from '../../../common/utils';
import { LoginDto, PinLoginDto, ChangePasswordDto } from './dto';
import type { JwtPayload } from './strategies/jwt.strategy';
import { AuditLogService } from '../audit-log';

import {
  RATE_LIMITER,
  RateLimiter,
} from '../../../common/interfaces/rate-limiter.interface';

const MAX_LOGIN_ATTEMPTS = 5;
const LOCK_DURATION_MINUTES = 30;
const RESET_TOKEN_EXPIRY_HOURS = 1;

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
      throw new UnauthorizedException(`messages.error.notFound|{"name": "User"}`);
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

    return successResponse({ message: `messages.success.updated|{"name": "Logout"}` });
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

  /**
   * Change password for logged in user
   */
  async changePassword(userId: string, dto: ChangePasswordDto) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new UnauthorizedException(`messages.error.notFound|{"name": "User"}`);
    }

    // Verify current password
    const isPasswordValid = await bcrypt.compare(
      dto.currentPassword,
      user.password,
    );
    if (!isPasswordValid) {
      throw new UnauthorizedException('Password saat ini tidak valid');
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(dto.newPassword, 12);

    // Update password
    await this.prisma.user.update({
      where: { id: user.id },
      data: { password: hashedPassword },
    });

    this.logger.log(`Password changed for user: ${user.username}`);

    return successResponse({
      message: `messages.success.updated|{"name": "Password"}`,
    });
  }

  /**
   * Request password reset - generates a token and returns it
   * In a production environment with SMTP, this would send an email
   */
  async requestPasswordReset(email: string) {
    // Find user by email
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    // Always return success to prevent email enumeration
    if (!user) {
      this.logger.log(
        `Password reset requested for non-existent email: ${email}`,
      );
      return successResponse({
        message: 'Jika email terdaftar, instruksi reset password akan dikirim.',
      });
    }

    if (!user.isActive) {
      this.logger.log(
        `Password reset requested for inactive user: ${user.username}`,
      );
      return successResponse({
        message: 'Jika email terdaftar, instruksi reset password akan dikirim.',
      });
    }

    // Invalidate existing tokens for this user
    await this.prisma.passwordResetToken.updateMany({
      where: {
        userId: user.id,
        usedAt: null,
      },
      data: { usedAt: new Date() },
    });

    // Generate secure token
    const token = randomBytes(32).toString('hex');
    const expiresAt = new Date(
      Date.now() + RESET_TOKEN_EXPIRY_HOURS * 60 * 60 * 1000,
    );

    // Save token
    await this.prisma.passwordResetToken.create({
      data: {
        token,
        userId: user.id,
        expiresAt,
      },
    });

    this.logger.log(
      `Password reset token generated for user: ${user.username}`,
    );

    // TODO: Send email if SMTP is configured
    // For now, return token for display (on-premise mode)
    return successResponse({
      message: 'Instruksi reset password telah dikirim.',
      resetToken: token, // For on-premise mode without SMTP
      expiresAt,
    });
  }

  /**
   * Verify if a reset token is valid
   */
  async verifyResetToken(token: string) {
    const resetToken = await this.prisma.passwordResetToken.findUnique({
      where: { token },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            name: true,
            email: true,
          },
        },
      },
    });

    if (!resetToken) {
      throw new UnauthorizedException('Token tidak valid');
    }

    if (resetToken.usedAt) {
      throw new UnauthorizedException(`messages.error.conflict|{"name": "Token"}`);
    }

    if (new Date() > resetToken.expiresAt) {
      throw new UnauthorizedException('Token sudah kadaluarsa');
    }

    return successResponse({
      valid: true,
      user: {
        username: resetToken.user.username,
        name: resetToken.user.name,
      },
    });
  }

  /**
   * Reset password using a valid token
   */
  async resetPassword(token: string, newPassword: string) {
    const resetToken = await this.prisma.passwordResetToken.findUnique({
      where: { token },
      include: { user: true },
    });

    if (!resetToken) {
      throw new UnauthorizedException('Token tidak valid');
    }

    if (resetToken.usedAt) {
      throw new UnauthorizedException(`messages.error.conflict|{"name": "Token"}`);
    }

    if (new Date() > resetToken.expiresAt) {
      throw new UnauthorizedException('Token sudah kadaluarsa');
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 12);

    // Update password and mark token as used in a transaction
    await this.prisma.$transaction([
      this.prisma.user.update({
        where: { id: resetToken.userId },
        data: { password: hashedPassword },
      }),
      this.prisma.passwordResetToken.update({
        where: { id: resetToken.id },
        data: { usedAt: new Date() },
      }),
    ]);

    this.logger.log(
      `Password reset completed for user: ${resetToken.user.username}`,
    );

    return successResponse({
      message: `messages.success.updated|{"name": "Password"}`,
    });
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
