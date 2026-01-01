
import React from 'react';
import { UserRole } from '../../types';

interface RoleGuardProps {
  children: React.ReactNode;
  allowedRoles: UserRole[];
  currentRole: UserRole;
  fallback?: React.ReactNode;
}

/**
 * RoleGuard selectively renders children based on the user's role.
 * In a real app, 'currentRole' would come from an Auth Context or Hook.
 */
const RoleGuard: React.FC<RoleGuardProps> = ({ 
  children, 
  allowedRoles, 
  currentRole, 
  fallback = null 
}) => {
  if (allowedRoles.includes(currentRole)) {
    return <>{children}</>;
  }

  return <>{fallback}</>;
};

export default RoleGuard;
