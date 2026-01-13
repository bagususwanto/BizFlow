import { PaginationParams, ApiResponse } from './index';
import { Role } from '../entities';

export interface RolesQuery extends PaginationParams {
  search?: string;
  isSystemRole?: boolean;
}

export interface RolesSummary {
  totalRoles: number;
  systemRoles: number;
  customRoles: number;
  totalUsersAssigned: number;
}

export interface PermissionData {
  modules: string[];
  actions: string[];
  permissions: Role['permissions']; // Reuse PermissionNode[] from Role or define PermissionNode exported from entity
}

export interface RolesResponse extends ApiResponse<Role[]> {
  summary: RolesSummary;
}
