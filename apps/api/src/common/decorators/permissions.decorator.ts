import { SetMetadata } from '@nestjs/common';

export const PERMISSIONS_KEY = 'permissions';

import type { PermissionType } from '@bizflow/types';

/**
 * Decorator to define required permissions for a route.
 *
 * Usage:
 * @Permissions(Permission.Users.Create, Permission.Users.Update)
 * @UseGuards(JwtAuthGuard, PermissionsGuard)
 * async createUser() { ... }
 *
 * The user must have at least ONE of the specified permissions to access the route.
 */
export const Permissions = (...permissions: PermissionType[]) =>
  SetMetadata(PERMISSIONS_KEY, permissions);
