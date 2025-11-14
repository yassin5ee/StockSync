const API = import.meta.env.VITE_API_URL || '';

async function fetchJson(path, opts = {}) {
  const res = await fetch(`${API}${path}`, opts);
  if (!res.ok) throw new Error(`API error ${res.status}`);
  return res.json();
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

export default {
  getWarehouses, getTransfers, getUsers, getAlerts, getConfig
};
