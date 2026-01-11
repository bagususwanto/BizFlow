import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';

import { PERMISSIONS_KEY } from '../decorators/permissions.decorator';

interface JwtPayload {
  sub: string;
  username: string;
  role: string;
  permissions: string[];
  outlets: string[];
}

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredPermissions = this.reflector.getAllAndOverride<string[]>(
      PERMISSIONS_KEY,
      [context.getHandler(), context.getClass()],
    );

    // If no permissions are required, allow access
    if (!requiredPermissions || requiredPermissions.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user as JwtPayload;

    if (!user || !user.permissions) {
      throw new ForbiddenException('Akses ditolak: Tidak ada izin');
    }

    // Check if user has at least one of the required permissions
    const hasPermission = requiredPermissions.some((permission) =>
      this.checkPermission(user.permissions, permission),
    );

    if (!hasPermission) {
      throw new ForbiddenException(
        'Akses ditolak: Anda tidak memiliki izin untuk melakukan aksi ini',
      );
    }

    return true;
  }

  private checkPermission(
    userPermissions: string[],
    requiredPermission: string,
  ): boolean {
    // Direct match
    if (userPermissions.includes(requiredPermission)) {
      return true;
    }

    // Check for wildcard permission (e.g., 'users:*' matches 'users:create')
    const [module] = requiredPermission.split(':');
    if (userPermissions.includes(`${module}:*`)) {
      return true;
    }

    // Check for full wildcard (e.g., '*:*' matches everything)
    if (userPermissions.includes('*:*')) {
      return true;
    }

    return false;
  }
}
