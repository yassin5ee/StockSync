import { Navigate } from 'react-router-dom';
import { getCurrentUser, getUserRole, isAdminOrLogisticAdmin } from '../utils/authContext';

/**
 * ProtectedRoute component that enforces role-based access control
 * 
 * Access rules:
 * - admin: Can access ALL pages
 * - logistic_admin: Can access ALL pages
 * - Other roles: Can only access their own page
 */
function ProtectedRoute({ children, allowedRoles = [] }) {
  const user = getCurrentUser();
  const userRole = getUserRole();

  // If no user is logged in, redirect to login
  if (!user || !userRole) {
    return <Navigate to="/login" replace />;
  }

  // Admin and logistic_admin can access all pages (bypass allowedRoles check)
  if (isAdminOrLogisticAdmin()) {
    return children;
  }

  // Check if user's role is in the allowed roles list
  if (allowedRoles.length > 0 && !allowedRoles.includes(userRole)) {
    // Redirect to user's default page based on their role
    const defaultPage = getDefaultPageForRole(userRole);
    return <Navigate to={defaultPage} replace />;
  }

  return children;
}

/**
 * Get the default page for a user role
 */
function getDefaultPageForRole(role) {
  const rolePageMap = {
    'admin': '/home',
    'logistic_admin': '/home',
    'data_analyst': '/data-analyst',
    'warehouse_supervisor': '/gestionnaire-entrepot',
    'preparateur commend': '/preparateur-commandes',
    'agent de reception': '/agent-reception'
  };

  return rolePageMap[role] || '/home';
}

export default ProtectedRoute;

