import { SetMetadata } from '@nestjs/common';

export const PERMISSIONS_KEY = 'permissions';

/**
 * Decorator to define required permissions for a route.
 *
 * Usage:
 * @Permissions('users:create', 'users:update')
 * @UseGuards(JwtAuthGuard, PermissionsGuard)
 * async createUser() { ... }
 *
 * The user must have at least ONE of the specified permissions to access the route.
 */
export const Permissions = (...permissions: string[]) =>
  SetMetadata(PERMISSIONS_KEY, permissions);
