import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/auth-options';
import { RoleName } from '@/lib/models/Role';

export type PermissionAction =
  | 'viewRestaurants'
  | 'createOrder'
  | 'checkout'
  | 'cancelOrder'
  | 'updatePaymentMethod';

export interface UserSession {
  id: string;
  name: string;
  email: string;
  role: {
    id: string;
    name: RoleName;
    permissions: Record<PermissionAction, boolean>;
  };
  country: {
    id: string;
    name: string;
    code: string;
  };
}

/**
 * Get current user session
 */
export async function getCurrentUser(): Promise<UserSession | null> {
  const session = await getServerSession(authOptions);
  return session?.user || null;
}

/**
 * Check if user has a specific role
 */
export function checkRole(userRole: RoleName, allowedRoles: RoleName[]): boolean {
  return allowedRoles.includes(userRole);
}

/**
 * Check if user has permission for an action
 */
export function checkPermission(
  permissions: Record<PermissionAction, boolean>,
  action: PermissionAction
): boolean {
  return permissions[action] === true;
}

/**
 * Check if user can access resource from a specific country
 * Admin: can access all countries
 * Manager/Member: can only access their own country
 */
export function checkCountryAccess(
  userRole: RoleName,
  userCountryId: string,
  resourceCountryId: string
): boolean {
  // Admin has access to all countries
  if (userRole === 'Admin') {
    return true;
  }

  // Manager and Member can only access their own country
  return userCountryId === resourceCountryId;
}

/**
 * Require authentication - throws error if not authenticated
 */
export async function requireAuth(): Promise<UserSession> {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error('Unauthorized - Please login');
  }
  return user;
}

/**
 * Require specific role - throws error if user doesn't have required role
 */
export async function requireRole(allowedRoles: RoleName[]): Promise<UserSession> {
  const user = await requireAuth();
  if (!checkRole(user.role.name, allowedRoles)) {
    throw new Error(`Forbidden - Required roles: ${allowedRoles.join(', ')}`);
  }
  return user;
}

/**
 * Require specific permission - throws error if user doesn't have permission
 */
export async function requirePermission(action: PermissionAction): Promise<UserSession> {
  const user = await requireAuth();
  if (!checkPermission(user.role.permissions, action)) {
    throw new Error(`Forbidden - You don't have permission to ${action}`);
  }
  return user;
}

/**
 * Build country filter for database queries
 * Admin: no filter (can see all)
 * Manager/Member: filter by their country
 */
export function buildCountryFilter(user: UserSession): Record<string, any> {
  if (user.role.name === 'Admin') {
    return {};
  }
  return { country: user.country.id };
}

/**
 * Validate country access for a specific resource
 */
export function validateCountryAccess(
  user: UserSession,
  resourceCountryId: string
): void {
  if (!checkCountryAccess(user.role.name, user.country.id, resourceCountryId)) {
    throw new Error('Forbidden - You can only access resources from your country');
  }
}
