import type { BaseEntity, ActiveEntity, JsonValue } from './base';
import type { UserRole, Module, PermissionAction, AuditAction } from '../enums';

// ========================================
// User & Access Entities
// ========================================

export interface User extends ActiveEntity {
  username: string;
  email?: string | null;
  password: string;
  pin?: string | null;
  name: string;
  roleId: string;
  outletIds: string[];
  lastLogin?: Date | null;

  // Relations
  role?: Role;
  auditLogs?: AuditLog[];
}

export interface Role extends BaseEntity {
  name: string;
  description?: string | null;

  // Relations
  permissions?: Permission[];
  users?: User[];
}

export interface Permission {
  id: string;
  module: Module | string;
  action: PermissionAction | string;
  roleId: string;

  // Relations
  role?: Role;
}

export interface AuditLog {
  id: string;
  userId: string;
  action: AuditAction | string;
  module: string;
  entityId?: string | null;
  entityType?: string | null;
  oldValue?: JsonValue | null;
  newValue?: JsonValue | null;
  ipAddress?: string | null;
  userAgent?: string | null;
  createdAt: Date;

  // Relations
  user?: User;
}

// ========================================
// Outlet Entity
// ========================================

export interface Outlet extends ActiveEntity {
  code: string;
  name: string;
  address?: string | null;
  phone?: string | null;
}

// ========================================
// DTOs for User Operations
// ========================================

export interface CreateUserInput {
  username: string;
  email?: string;
  password: string;
  pin?: string;
  name: string;
  roleId: string;
  outletIds?: string[];
}

export interface UpdateUserInput {
  email?: string;
  name?: string;
  roleId?: string;
  outletIds?: string[];
  isActive?: boolean;
}

export interface ChangePasswordInput {
  currentPassword: string;
  newPassword: string;
}

export interface ChangePinInput {
  currentPin?: string;
  newPin: string;
}

export interface CreateRoleInput {
  name: string;
  description?: string;
  permissions?: { module: string; action: string }[];
}

export interface UpdateRoleInput {
  name?: string;
  description?: string;
  permissions?: { module: string; action: string }[];
}
