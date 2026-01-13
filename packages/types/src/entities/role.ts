import { BaseEntity } from './base';

export interface PermissionNode {
  module: string;
  action: string;
}

export interface Role extends BaseEntity {
  name: string;
  description?: string;
  userCount: number;
  isSystemRole: boolean;

  // Relations/Populated fields
  permissions: PermissionNode[];
}
