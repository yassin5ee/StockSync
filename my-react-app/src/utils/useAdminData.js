import { useState, useEffect } from 'react';
import api from './api';

export default function useAdminData() {
  const [warehouses, setWarehouses] = useState([]);
  const [transfers, setTransfers] = useState([]);
  const [users, setUsers] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [config, setConfig] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    async function reload() {
      setLoading(true);
      try {
        const [wh, tr, us, al, cfg] = await Promise.all([
          api.getWarehouses(),
          api.getTransfers(),
          api.getUsers(),
          api.getAlerts(),
          api.getConfig()
        ]);
        if (!mounted) return;
        setWarehouses(wh);
        setTransfers(tr);
        setUsers(us);
        setAlerts(al);
        setConfig(cfg);
      } catch (err) {
        console.warn('Failed to load admin data', err);
      } finally {
        if (mounted) setLoading(false);
      }
    }
    reload();
    return () => { mounted = false; };
  }, []);

  const metrics = {
    totalWarehouses: warehouses.length,
    activeUsers: users.filter(u => u.status === 'active').length,
    totalProducts: warehouses.reduce((s,w) => s + (w.productsCount||0), 0),
    todayOrders: 0,
    fulfillmentRate: '—',
    transferEfficiency: `${Math.round(((transfers.filter(t=>t.status==='completed').length) / Math.max(1, transfers.length))*100)}%`
  };

  const reload = async () => {
    try {
      setLoading(true);
      const [wh, tr, us, al, cfg] = await Promise.all([
        api.getWarehouses(),
        api.getTransfers(),
        api.getUsers(),
        api.getAlerts(),
        api.getConfig()
      ]);
      setWarehouses(wh);
      setTransfers(tr);
      setUsers(us);
      setAlerts(al);
      setConfig(cfg);
    } catch (err) {
      console.warn('Failed to reload admin data', err);
    } finally {
      setLoading(false);
    }
  };

  return { warehouses, transfers, users, alerts, config, metrics, loading, reload };
}
