/**
 * User context and authentication utilities
 */

export function getCurrentUser() {
  try {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  } catch {
    return null;
  }
}

export function getUserWarehouses() {
  // Warehouses are no longer part of user model
  // This function is kept for backward compatibility
  // All authenticated users can access all warehouses for now
  return [];
}

export function getUserId() {
  const user = getCurrentUser();
  return user?.id;
}

export function getUserRole() {
  const user = getCurrentUser();
  return user?.role || '';
}

export function getUserRoles() {
  // Backward compatibility - return array with single role
  const role = getUserRole();
  return role ? [role] : [];
}

export function isAdmin() {
  const role = getUserRole();
  return role === 'admin';
}

export function isLogisticAdmin() {
  const role = getUserRole();
  return role === 'logistic_admin';
}

export function isAdminOrLogisticAdmin() {
  return isAdmin() || isLogisticAdmin();
}

export function isAgent() {
  const role = getUserRole();
  return role === 'agent de reception' || role === 'preparateur commend';
}

export function canAccessWarehouse(warehouseName) {
  // For now, all authenticated users can access all warehouses
  // This can be customized based on role requirements
  if (isAdmin()) return true;
  return true; // All users can access all warehouses
}

export function getFilteredWarehouses(allWarehouses) {
  // For now, all authenticated users can see all warehouses
  // This can be customized based on role requirements
  if (isAdmin()) return allWarehouses;
  return allWarehouses;
}

export function getFilteredTransfers(allTransfers) {
  // For now, all authenticated users can see all transfers
  // This can be customized based on role requirements
  if (isAdmin()) return allTransfers;
  return allTransfers;
}
