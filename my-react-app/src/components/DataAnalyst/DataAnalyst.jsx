import React, { useEffect, useState } from 'react';
import useAdminData from '../../utils/useAdminData';
import { useNavigate } from 'react-router-dom';
import api from '../../utils/api';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import './DataAnalyst.css';

const DataAnalyst = () => {
  const navigate = useNavigate();
  const userName = localStorage.getItem('username') || 'Data Analyst';
  const { warehouses, transfers, users, alerts, config, metrics, loading } = useAdminData();
  
  const [analyticsData, setAnalyticsData] = useState(null);
  const [warehousesSummary, setWarehousesSummary] = useState([]);
  const [transfersSummary, setTransfersSummary] = useState(null);
  const [alertsSummary, setAlertsSummary] = useState(null);
  const [statusMessage, setStatusMessage] = useState('');
  const [showStatus, setShowStatus] = useState(false);
  const [analyticsLoading, setAnalyticsLoading] = useState(true);
  const [chartData, setChartData] = useState([]);
  const [filters, setFilters] = useState({
    warehouseFilter: '',
    statusFilter: 'all',
    dateRangeFilter: 'week'
  });

  useEffect(() => {
    if (!localStorage.getItem('username')) {
      navigate('/login');
    }
  }, [navigate]);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setAnalyticsLoading(true);
        const [metrics, warehouses, transfers, alerts, orderVolume] = await Promise.all([
          api.getAnalyticsMetrics(),
          api.getWarehousesSummary(),
          api.getTransfersSummary(),
          api.getAlertsSummary(),
          api.getOrderVolume()
        ]);
        
        setAnalyticsData(metrics);
        setWarehousesSummary(warehouses || []);
        setTransfersSummary(transfers);
        setAlertsSummary(alerts);
        setChartData(orderVolume || []);
      } catch (err) {
        console.error('Failed to fetch analytics:', err);
        showMessage('Erreur lors du chargement des données analytiques', 'error');
      } finally {
        setAnalyticsLoading(false);
      }
    };
    
    fetchAnalytics();
  }, []);

  const rotationStocks = analyticsData?.stock?.totalProducts || analyticsData?.warehouses?.totalProducts || 0;
  const delaiPreparation = analyticsData?.transfers?.inTransit || 0;
  const tauxErreur = analyticsData?.alerts?.total || 0;
  const remplissageEntrepot = analyticsData?.warehouses?.occupancy || 0;

  const navigateToRole = (roleKey, event) => {
    if (event) event.preventDefault();
    const roleName = getRoleName(roleKey);
    alertUser(`Accès au rôle : ${roleName}`);
    switch (roleKey) {
      case 'data_analyst':
        navigate('/data-analyst');
        break;
      case 'gestionnaire_entrepot':
        navigate('/gestionnaire-entrepot');
        break;
      case 'preparateur_commandes':
        navigate('/preparateur-commandes');
        break;
      case 'admin_logistique':
        navigate('/administration-logistique');
        break;
      case 'agent_reception':
        navigate('/agent-reception');
        break;
      case 'parametres':
        navigate('/parametres');
        break;
      case 'home':
      default:
        navigate('/');
    }
  };

  const getRoleName = (roleKey) => {
    switch(roleKey) {
      case 'home': return 'Accueil';
      case 'data_analyst': return 'Data Analyst / Analyse données';
      case 'admin_logistique': return 'Administrateur Logistique / Administration logistique';
      case 'preparateur_commandes': return 'Préparateur de Commandes / Sorties';
      case 'agent_reception': return 'Agent de Réception / Entrées';
      case 'gestionnaire_entrepot': return 'Gestionnaire d\'Entrepôt / Gestion d\'entrepôts';
      default: return 'Rôle Inconnu';
    }
  };

  const alertUser = (message) => {
    console.log(`[Notification] ${message}`);
  };

  const logout = () => {
    localStorage.removeItem('username');
    localStorage.removeItem('rememberMe');
    navigate('/login');
  };

  const showMessage = (message, type) => {
    setStatusMessage(message);
    setShowStatus(true);
    
    setTimeout(() => {
      setShowStatus(false);
    }, 3000);
  };

  const applyFilters = () => {
    try {
      let filteredWarehouses = warehousesSummary;
      if (filters.warehouseFilter) {
        filteredWarehouses = warehousesSummary.filter(w => 
          w.name.toLowerCase().includes(filters.warehouseFilter.toLowerCase())
        );
      }
      
      let filteredTransfers = transfersSummary?.transfers || [];
      if (filters.statusFilter !== 'all') {
        filteredTransfers = filteredTransfers.filter(t => t.status === filters.statusFilter);
      }
      
      const filtered = `Filtres appliqués:\n- Entrepôt: ${filters.warehouseFilter || 'Tous'}\n- Statut: ${filters.statusFilter}\n- Période: ${filters.dateRangeFilter}\n\nRésultats:\n- Entrepôts: ${filteredWarehouses.length}\n- Transferts: ${filteredTransfers.length}`;
      showMessage(filtered, 'info');
    } catch (err) {
      console.error('Error applying filters:', err);
      showMessage('Erreur lors de l\'application des filtres', 'error');
    }
  };

  const exportData = () => {
    try {
      const data = {
        analytics: analyticsData,
        warehouses: warehousesSummary,
        transfers: transfersSummary,
        alerts: alertsSummary
      };
      
      const csv = 'Métriques Analytiques - Exportation\n\n' +
        'ENTREPÔTS\n' +
        'Nom,Occupation,Capacité,Produits\n' +
        warehousesSummary.map(w => `${w.name},${w.occupancyRate || 0}%,${w.capacity || 0},${w.totalProducts || 0}`).join('\n') +
        '\n\nTRANSFERTS\n' +
        'Source,Destination,Statut,Quantité\n' +
        (transfersSummary?.transfers || []).slice(0, 10).map(t => 
          `${t.fromWarehouse},${t.toWarehouse},${t.status},${t.items?.reduce((s, i) => s + (i.quantity || 0), 0) || 0}`
        ).join('\n');
      
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `stocksync-export-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      showMessage('Données exportées en CSV', 'success');
    } catch (err) {
      console.error('Error exporting data:', err);
      showMessage('Erreur lors de l\'export des données', 'error');
    }
  };

  return (
    <div className="data-analyst">
      {(loading || analyticsLoading) && (
        <div className="status-message default">Chargement des données...</div>
      )}

      <header className="header">
        <div className="header-container">
          <div className="header-left">
            <a 
              href="#" 
              onClick={(e) => navigateToRole('home', e)} 
              title="Retour à l'Accueil" 
              className="back-link"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="m12 19-7-7 7-7"/>
                <path d="M19 12H5"/>
              </svg>
              Retour
            </a>

            <div className="header-left">
              <div className="logo-container">
                <span className="logo-text">StockSync</span>
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="logo-icon">
                  <path d="M2 20V8a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2z"/>
                  <path d="M12 10v4"/>
                  <path d="M9 10v4"/>
                  <path d="M15 10v4"/>
                </svg>
              </div>
              
              <nav className="navigation">
                <a href="#" className="nav-link" onClick={(e) => navigateToRole('home', e)}>
                  Accueil
                </a>
                <a href="#" className="nav-link active">
                  Analyse données
                </a>
                <a href="#" className="nav-link" onClick={(e) => navigateToRole('gestionnaire_entrepot', e)}>
                  Gestion d'entrepôts
                </a>
                <a href="#" className="nav-link" onClick={(e) => navigateToRole('agent_reception', e)}>
                  Entrées
                </a>
                <a href="#" className="nav-link" onClick={(e) => navigateToRole('preparateur_commandes', e)}>
                  Sorties
                </a>
                <a href="#" className="nav-link" onClick={(e) => navigateToRole('admin_logistique', e)}>
                  Administration logistique
                </a>
              </nav>
            </div>
          </div>

          <div className="header-right">
            <div className="utility-buttons">
              <button 
                title="Notifications" 
                className="utility-button"
                onClick={() => alertUser('Notifications : Fonctionnalité à développer')}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
                  <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
                </svg>
              </button>
              <button 
                title="Paramètres" 
                className="utility-button"
                onClick={(e) => { e.preventDefault(); navigate('/parametres'); }}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="3"/>
                  <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/>
                </svg>
              </button>
            </div>
            
            <div className="user-info">
              <span className="user-text">
                Connecté en tant que: <span className="user-name">{userName}</span>
              </span>
              <button 
                onClick={logout} 
                className="logout-button"
              >
                Déconnexion
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="main-content">
        <div className="dashboard-title">
          <h1>Tableau de Bord : Analyse de Performance</h1>
          <p>Visualisation des indicateurs logistiques en temps réel.</p>
        </div>
        
        <div className="metrics-grid">
          <div className="metric-card green">
            <h3>Entrepôts Opérationnels</h3>
            <p className="metric-value green">{analyticsData?.warehouses?.operational || 0}/{analyticsData?.warehouses?.total || 0}</p>
            <div className="metric-change positive">+{Math.round((analyticsData?.warehouses?.operational || 0) / (analyticsData?.warehouses?.total || 1) * 100)}%</div>
            <p className="metric-subtext">Status: Operational</p>
          </div>

          <div className="metric-card blue">
            <h3>Occupancy Entrepôts</h3>
            <p className="metric-value blue">{remplissageEntrepot}%</p>
            <div className="metric-change negative">{analyticsData?.warehouses?.occupancy > 80 ? '⚠️ High' : '✓ Normal'}</div>
            <p className="metric-subtext">Max: 90%</p>
          </div>

          <div className="metric-card red">
            <h3>Transferts en Cours</h3>
            <p className="metric-value red">{analyticsData?.transfers?.inTransit || 0}</p>
            <div className="metric-change positive">Tracking</div>
            <p className="metric-subtext">Total: {analyticsData?.transfers?.total || 0}</p>
          </div>

          <div className="metric-card orange">
            <h3>Alertes Actives</h3>
            <p className="metric-value orange">{alertsSummary?.bySeverity?.high || 0} High</p>
            <div className="metric-change negative">{alertsSummary?.total || 0} total</div>
            <p className="metric-subtext">Attention requise</p>
          </div>
        </div>

        <div className="analytics-section">
          <div className="chart-container">
            <div className="section-header">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 20V10"/>
                <path d="M18 20V4"/>
                <path d="M6 20v-4"/>
              </svg>
              <h3>Volume de Commandes Traitées (Mois)</h3>
            </div>
            <div className="chart-content">
              {analyticsLoading ? (
                <div className="chart-loading">Chargement des données...</div>
              ) : chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis 
                      dataKey="name" 
                      stroke="#6b7280"
                      style={{ fontSize: '0.75rem' }}
                    />
                    <YAxis 
                      stroke="#6b7280"
                      style={{ fontSize: '0.75rem' }}
                    />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'white', 
                        border: '1px solid #e5e7eb',
                        borderRadius: '0.5rem',
                        fontSize: '0.875rem'
                      }}
                      labelStyle={{ color: '#374151', fontWeight: 600 }}
                    />
                    <Bar 
                      dataKey="value" 
                      fill="#3b82f6"
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="chart-empty">Aucune donnée disponible</div>
              )}
            </div>
          </div>

          <div className="references-container">
            <div className="section-header">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="m16 18 6-6-6-6"/>
                <path d="M8 6v12"/>
              </svg>
              <h3>Entrepôts (Récapitulatif)</h3>
            </div>
            <div className="references-list">
              {warehousesSummary.slice(0, 5).map((w, index) => (
                <div key={w.id} className="reference-item">
                  <div className="reference-rank">{index + 1}</div>
                  <div className="reference-info">
                    <div className="reference-id">{w.name}</div>
                    <div className="reference-name">{w.location}</div>
                  </div>
                  <div className="reference-quantity">{w.occupancyRate}% used</div>
                </div>
              ))}
            </div>
          </div>
        </div>
        
        <div className="filters-section">
          <div className="section-header">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/>
            </svg>
            <h3>Filtres et Segmentation</h3>
          </div>
          
          <div className="filters-controls">
            <select className="select-control">
              <option>Sélectionner Entrepôt</option>
              <option>Entrepôt A</option>
              <option>Entrepôt B</option>
              <option>Entrepôt C</option>
            </select>
            
            <select className="select-control">
              <option>Période</option>
              <option>7 derniers jours</option>
              <option>30 derniers jours</option>
              <option>3 derniers mois</option>
              <option>Année en cours</option>
            </select>
            
            <input 
              type="date" 
              className="date-input"
              placeholder="Date de début"
            />
            
            <input 
              type="date" 
              className="date-input"
              placeholder="Date de fin"
            />
            
            <div className="filter-actions">
              <button 
                onClick={applyFilters}
                className="apply-button"
              >
                Appliquer les Filtres
              </button>
              
              <button 
                onClick={exportData}
                className="export-button"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                  <polyline points="7 10 12 15 17 10"/>
                  <line x1="12" y1="15" x2="12" y2="3"/>
                </svg>
                Exporter
              </button>
            </div>
          </div>
        </div>
      </main>

      <footer className="footer">
        <div className="footer-content">
          <p>&copy; 2025 StockSync. Optimisation Logistique. Version 1.0</p>
        </div>
      </footer>
    </div>
  );
};

export default DataAnalyst;