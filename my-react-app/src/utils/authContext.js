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
  if (isAdmin()) return true;
  return true;
}

export function getFilteredWarehouses(allWarehouses) {
  if (isAdmin()) return allWarehouses;
  return allWarehouses;
}

export function getFilteredTransfers(allTransfers) {
  if (isAdmin()) return allTransfers;
  return allTransfers;
}
