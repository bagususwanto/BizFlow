import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import type { TokenPayload } from '@bizflow/types';

import { PrismaService } from '../../../../prisma';

// Re-export for convenience (without iat/exp for internal use)
export type JwtPayload = Omit<TokenPayload, 'iat' | 'exp'>;

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(
    private readonly configService: ConfigService,
    private readonly prisma: PrismaService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>(
        'JWT_ACCESS_SECRET',
        'bizflow-secret',
      ),
    });
  }

  async validate(payload: TokenPayload): Promise<JwtPayload> {
    // Verify user still exists and is active
    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
      select: { id: true, isActive: true },
    });

    if (!user || !user.isActive) {
      throw new UnauthorizedException('Akun tidak valid atau dinonaktifkan');
    }

    // Return payload without iat/exp
    return {
      sub: payload.sub,
      username: payload.username,
      role: payload.role,
      permissions: payload.permissions,
      outlets: payload.outlets,
    };
  }
}
