const API = import.meta.env.VITE_API_URL || 'http://127.0.0.1:4000';

function getAccessToken() {
  return localStorage.getItem('accessToken');
}

function getRefreshToken() {
  return localStorage.getItem('refreshToken');
}

function setTokens(accessToken, refreshToken) {
  if (accessToken) localStorage.setItem('accessToken', accessToken);
  if (refreshToken) localStorage.setItem('refreshToken', refreshToken);
}

function clearTokens() {
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
}

function isAuthEndpoint(path) {
  return (
    path === '/api/users/login' ||
    path === '/api/users/refresh' ||
    path === '/api/users' 
  );
}

async function refreshAccessToken() {
  const refreshToken = getRefreshToken();
  if (!refreshToken) {
    throw new Error('No refresh token available');
  }

  try {
    const res = await fetch(`${API}/api/users/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken })
    });

    if (!res.ok) {
      throw new Error('Token refresh failed');
    }

    const data = await res.json();
    if (data.success && data.data) {
      setTokens(data.data.accessToken, data.data.refreshToken);
      return data.data.accessToken;
    }
    throw new Error('Invalid refresh response');
  } catch (error) {
    clearTokens();
    if (window.location.pathname !== '/login') {
      window.location.href = '/login';
    }
    throw error;
  }
}

async function authenticatedFetch(path, opts = {}) {
  const isAuth = isAuthEndpoint(path);
  const headers = { ...opts.headers };
  
  if (!isAuth) {
    const token = getAccessToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  }

  if (opts.body && !headers['Content-Type']) {
    headers['Content-Type'] = 'application/json';
  }

  const fullUrl = `${API}${path}`;
  console.log(`[API Request] ${opts.method || 'GET'} ${fullUrl}`);

  try {
    let res = await fetch(fullUrl, {
      ...opts,
      headers
    });

    if (res.status === 401 && !isAuth) {
      try {
        const newToken = await refreshAccessToken();
        headers['Authorization'] = `Bearer ${newToken}`;
        res = await fetch(fullUrl, {
          ...opts,
          headers
        });
      } catch (refreshError) {
      }
    }

    if (!res.ok) {
      const errorText = await res.text().catch(() => 'Unknown error');
      console.error(`[API Error] ${res.status}: ${errorText}`);
      throw new Error(`API error ${res.status}`);
    }
    return res.json();

  } catch (error) {
    console.error("[Network Error] Connection failed:", error);
    throw error;
  }
}

async function fetchJson(path, opts = {}) {
  return authenticatedFetch(path, { ...opts, method: 'GET' });
}

async function postJson(path, body) {
  return authenticatedFetch(path, {
    method: 'POST',
    body: JSON.stringify(body)
  });
}

async function putJson(path, body) {
  return authenticatedFetch(path, {
    method: 'PUT',
    body: JSON.stringify(body)
  });
}

async function deleteJson(path) {
  return authenticatedFetch(path, {
    method: 'DELETE'
  });
}

export async function getWarehouses() {
  const j = await fetchJson('/api/warehouses');
  return j.data || [];
}

export async function getTransfers() {
  const j = await fetchJson('/api/transfers');
  return j.data || [];
}

export async function getUsers() {
  const j = await fetchJson('/api/users');
  return j.data || [];
}

export async function getAlerts() {
  const j = await fetchJson('/api/alerts');
  return j.data || [];
}

export async function getConfig() {
  const j = await fetchJson('/api/config');
  return j.data || {};
}

export async function createWarehouse(payload) {
  const j = await postJson('/api/warehouses', payload);
  return j.data;
}

export async function createTransfer(payload) {
  const j = await postJson('/api/transfers', payload);
  return j.data;
}

export async function createUser(payload) {
  const j = await postJson('/api/users', payload);
  return j.data;
}

export async function login(payload) {
  const j = await postJson('/api/users/login', payload);
  const userData = j.data;
  
  if (userData.accessToken && userData.refreshToken) {
    setTokens(userData.accessToken, userData.refreshToken);
  }
  
  return userData;
}

export function logout() {
  clearTokens();
  localStorage.removeItem('user');
  localStorage.removeItem('username');
  localStorage.removeItem('rememberMe');
}

export async function getAnalyticsMetrics() {
  const j = await fetchJson('/api/analytics/metrics');
  return j.data;
}

export async function getWarehousesSummary() {
  const j = await fetchJson('/api/analytics/warehouses-summary');
  return j.data;
}

export async function getTransfersSummary() {
  const j = await fetchJson('/api/analytics/transfers-summary');
  return j.data;
}

export async function getAlertsSummary() {
  const j = await fetchJson('/api/analytics/alerts-summary');
  return j.data;
}

export async function getWarehouseDetail(name) {
  const j = await fetchJson(`/api/analytics/warehouse/${encodeURIComponent(name)}`);
  return j.data;
}

export async function getStockStatistics() {
  const j = await fetchJson('/api/analytics/stock-statistics');
  return j.data;
}

export async function getStockByWarehouse(warehouseId) {
  const j = await fetchJson(`/api/analytics/stock/${warehouseId}`);
  return j.data;
}

export async function getOrderVolume() {
  const j = await fetchJson('/api/analytics/order-volume');
  return j.data;
}

export async function createAlert(payload) {
  const j = await postJson('/api/alerts', payload);
  return j.data;
}

export async function updateConfig(payload) {
  const j = await putJson('/api/config', payload);
  return j.data;
}

export async function deleteWarehouse(id) {
  const j = await deleteJson(`/api/warehouses/${id}`);
  return j.data;
}

export async function updateWarehouse(id, payload) {
  const j = await putJson(`/api/warehouses/${id}`, payload);
  return j.data;
}

export async function updateTransfer(id, payload) {
  const j = await putJson(`/api/transfers/${id}`, payload);
  return j.data;
}

export async function deleteTransfer(id) {
  const j = await deleteJson(`/api/transfers/${id}`);
  return j.data;
}

export async function updateUser(id, payload) {
  const j = await putJson(`/api/users/${id}`, payload);
  return j.data;
}

export async function deleteUser(id) {
  const j = await deleteJson(`/api/users/${id}`);
  return j.data;
}

export default {
  getWarehouses,
  getTransfers,
  getUsers,
  getAlerts,
  getConfig,
  createWarehouse,
  createTransfer,
  createUser,
  login,
  logout,
  getAnalyticsMetrics,
  getWarehousesSummary,
  getTransfersSummary,
  getAlertsSummary,
  getWarehouseDetail,
  getStockStatistics,
  getStockByWarehouse,
  getOrderVolume,
  createAlert,
  updateConfig,
  deleteWarehouse,
  updateWarehouse,
  updateTransfer,
  deleteTransfer,
  updateUser,
  deleteUser
};