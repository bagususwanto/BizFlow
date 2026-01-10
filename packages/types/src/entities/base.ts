/**
 * Base entity with common fields
 */
export interface BaseEntity {
  id: string;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Entity with soft delete support
 */
export interface SoftDeletableEntity extends BaseEntity {
  deletedAt?: Date | null;
}

/**
 * Entity with active status
 */
export interface ActiveEntity extends BaseEntity {
  isActive: boolean;
}

/**
 * Timestamps for audit
 */
export interface Timestamps {
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Entity with creator tracking
 */
export interface CreatedByEntity {
  createdBy: string;
}

/**
 * Entity with approval workflow
 */
export interface ApprovableEntity {
  approvedBy?: string | null;
  approvedAt?: Date | null;
}

/**
 * Monetary value type using string for precision
 * (Decimal in Prisma is returned as string)
 */
export type Decimal = string;

/**
 * JSON type for flexible attributes
 */
export type JsonValue =
  | string
  | number
  | boolean
  | null
  | JsonObject
  | JsonArray;
export interface JsonObject {
  [key: string]: JsonValue;
}
export type JsonArray = JsonValue[];
