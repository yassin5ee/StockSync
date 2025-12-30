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

  if (!user || !userRole) {
    return <Navigate to="/login" replace />;
  }

  if (isAdminOrLogisticAdmin()) {
    return children;
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(userRole)) {
    const defaultPage = getDefaultPageForRole(userRole);
    return <Navigate to={defaultPage} replace />;
  }

  return children;
}

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

