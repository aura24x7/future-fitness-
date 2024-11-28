import { GroupRole, DEFAULT_ROLE_PERMISSIONS } from '../types/group';

export const hasPermission = (
  userRole: GroupRole,
  permission: keyof typeof DEFAULT_ROLE_PERMISSIONS.admin
): boolean => {
  return DEFAULT_ROLE_PERMISSIONS[userRole][permission];
};

export const canManageRole = (
  currentUserRole: GroupRole,
  targetUserRole: GroupRole,
  newRole: GroupRole
): boolean => {
  // Admin can manage all roles except other admins
  if (currentUserRole === 'admin') {
    return targetUserRole !== 'admin';
  }

  // Moderator can only manage members and can't promote to admin
  if (currentUserRole === 'moderator') {
    return targetUserRole === 'member' && newRole !== 'admin';
  }

  // Members can't manage roles
  return false;
};

export const getRoleHierarchy = (role: GroupRole): number => {
  switch (role) {
    case 'admin':
      return 3;
    case 'moderator':
      return 2;
    case 'member':
      return 1;
    default:
      return 0;
  }
};

export const isRoleHigherOrEqual = (
  role1: GroupRole,
  role2: GroupRole
): boolean => {
  return getRoleHierarchy(role1) >= getRoleHierarchy(role2);
};
