import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './AdministrationLogistique.css';
import api from '../../utils/api';

const AdministrationLogistique = () => {
  const navigate = useNavigate();
  const [userName] = useState(localStorage.getItem('username') || 'Admin Logistique');
  const [statusMessage, setStatusMessage] = useState('');
  const [showStatus, setShowStatus] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  
  const [analyticsData, setAnalyticsData] = useState(null);
  const [warehousesList, setWarehousesList] = useState([]);
  const [transfersList, setTransfersList] = useState(null);
  const [alertsList, setAlertsList] = useState(null);
  const [usersList, setUsersList] = useState([]);
  const [systemConfig, setSystemConfig] = useState({});
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [metrics, warehouses, transfers, alerts, users] = await Promise.all([
          api.getAnalyticsMetrics(),
          api.getWarehousesSummary(),
          api.getTransfersSummary(),
          api.getAlertsSummary(),
          api.getUsers()
        ]);
        
        setAnalyticsData(metrics);
        setWarehousesList(warehouses || []);
        setTransfersList(transfers);
        setAlertsList(alerts);
        setUsersList(users || []);
      } catch (err) {
        console.error('Failed to fetch admin data:', err);
        showMessage('Erreur lors du chargement des données', 'error');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

  const globalMetrics = {
    totalWarehouses: analyticsData?.warehouses?.total || 0,
    activeUsers: usersList.length || 0,
    totalProducts: analyticsData?.stock?.totalProducts || analyticsData?.warehouses?.totalProducts || 0,
    totalStockQuantity: analyticsData?.stock?.totalQuantity || 0,
    totalEntries: analyticsData?.stock?.totalEntries || 0,
    totalExits: analyticsData?.stock?.totalExits || 0,
    fulfillmentRate: `${analyticsData?.transfers?.completed || 0}/${analyticsData?.transfers?.total || 0}`
  };

  const reload = async () => {
    const [metrics, warehouses, transfers, alerts, users] = await Promise.all([
      api.getAnalyticsMetrics(),
      api.getWarehousesSummary(),
      api.getTransfersSummary(),
      api.getAlertsSummary(),
      api.getUsers()
    ]);
    
    setAnalyticsData(metrics);
    setWarehousesList(warehouses || []);
    setTransfersList(transfers);
    setAlertsList(alerts);
    setUsersList(users || []);
  };

  const handleCreateWarehouse = async () => {
    const name = window.prompt("Nom de l'entrepôt :");
    if (!name) return showMessage('Création annulée', 'info');
    const location = window.prompt('Localisation (optionnel) :') || '';
    const capacityRaw = window.prompt('Capacité (nombre) :', '100');
    const capacity = parseInt(capacityRaw, 10) || 0;
    try {
      await api.createWarehouse({ name, location, capacity, used: 0, productsCount: 0 });
      await reload();
      showMessage("Entrepôt créé", 'info');
    } catch (err) {
      console.error(err);
      showMessage("Échec de la création de l'entrepôt", 'error');
    }
  };

  const handleCreateTransfer = async () => {
    const from = window.prompt('Entrepôt source (nom) :');
    if (!from) return showMessage('Création annulée', 'info');
    const to = window.prompt('Entrepôt destination (nom) :');
    if (!to) return showMessage('Création annulée', 'info');
    const sku = window.prompt('SKU du produit (ex: SKU-123) :');
    const qtyRaw = window.prompt('Quantité :', '1');
    const qty = parseInt(qtyRaw, 10) || 1;
    const payload = { fromWarehouse: from, toWarehouse: to, items: [{ sku, quantity: qty }], status: 'planned' };
    try {
      await api.createTransfer(payload);
      await reload();
      showMessage('Transfert créé', 'info');
    } catch (err) {
      console.error(err);
      showMessage('Échec de la création du transfert', 'error');
    }
  };

  const handleCreateUser = async () => {
    const name = window.prompt("Nom de l'utilisateur :");
    if (!name) return showMessage('Création annulée', 'info');
    const email = window.prompt('Email :');
    if (!email) return showMessage('Création annulée', 'info');
    const password = window.prompt('Mot de passe (sera hashé) :', 'changeme');
    try {
      await api.createUser({ name, email, password });
      await reload();
      showMessage("Utilisateur créé", 'info');
    } catch (err) {
      console.error(err);
      showMessage("Échec de la création de l'utilisateur", 'error');
    }
  };

  const navigateToRole = (roleKey, event) => {
    if (event) event.preventDefault();
    const roleName = getRoleName(roleKey);
    alertUser(`Accès au rôle : ${roleName}`);
    switch (roleKey) {
      case 'home':
        navigate('/home');
        break;
      case 'data_analyst':
        navigate('/data-analyst');
        break;
      case 'admin_logistique':
        navigate('/administration-logistique');
        break;
      case 'preparateur_commandes':
        navigate('/preparateur-commandes');
        break;
      case 'agent_reception':
        navigate('/agent-reception');
        break;
      case 'gestionnaire_entrepot':
        navigate('/gestionnaire-entrepot');
        break;
      default:
        break;
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

  const manageUser = async (userId, action) => {
    try {
      if (action === 'modifier') {
        const name = window.prompt("Nouveau nom de l'utilisateur :");
        if (!name) return showMessage('Modification annulée', 'info');
        const email = window.prompt('Nouvel email :');
        if (!email) return showMessage('Modification annulée', 'info');
        
        await api.updateUser(userId, { name, email });
        await reload();
        showMessage(`Utilisateur ${userId} modifié`, 'success');
      } else if (action === 'désactiver') {
        if (window.confirm('Êtes-vous sûr de vouloir désactiver cet utilisateur ?')) {
          await api.deleteUser(userId);
          await reload();
          showMessage(`Utilisateur ${userId} supprimé`, 'success');
        }
      }
    } catch (err) {
      console.error('Error managing user:', err);
      showMessage(`Erreur lors de la ${action} de l'utilisateur`, 'error');
    }
  };

  const manageWarehouse = async (warehouseId, action) => {
    try {
      if (action === 'modifier') {
        const name = window.prompt("Nouveau nom de l'entrepôt :");
        if (!name) return showMessage('Modification annulée', 'info');
        const capacity = window.prompt('Nouvelle capacité (nombre) :');
        if (!capacity) return showMessage('Modification annulée', 'info');
        
        await api.updateWarehouse(warehouseId, { name, capacity: parseInt(capacity) });
        await reload();
        showMessage(`Entrepôt ${warehouseId} modifié`, 'success');
      }
    } catch (err) {
      console.error('Error managing warehouse:', err);
      showMessage(`Erreur lors de la ${action} de l'entrepôt`, 'error');
    }
  };

  const manageTransfer = async (transferId, action) => {
    try {
      if (action === 'démarrer') {
        await api.updateTransfer(transferId, { status: 'in_transit' });
        await reload();
        showMessage(`Transfert ${transferId} démarré`, 'success');
      } else if (action === 'compléter') {
        await api.updateTransfer(transferId, { status: 'completed' });
        await reload();
        showMessage(`Transfert ${transferId} complété`, 'success');
      } else if (action === 'détails') {
        showMessage(`Détails du transfert ${transferId} - Consultez la liste complète`, 'info');
      }
    } catch (err) {
      console.error('Error managing transfer:', err);
      showMessage(`Erreur lors de la ${action} du transfert`, 'error');
    }
  };

  const updateSystemConfig = async (configKey, value) => {
    try {
      const newCfg = { ...(systemConfig || {}), [configKey]: value };
      await api.updateConfig(newCfg);
      await reload();
      showMessage(`Configuration ${configKey} mise à jour`, 'info');
    } catch (err) {
      console.error(err);
      showMessage('Échec de la mise à jour de la configuration', 'error');
    }
  };

  const StatusBadge = ({ status, type }) => {
    const getStatusConfig = () => {
      switch(status) {
        case 'active':
        case 'operational':
        case 'completed':
        case 'low':
          return { bg: 'badge-success', text: 'badge-success-text' };
        case 'in_transit':
        case 'medium':
          return { bg: 'badge-warning', text: 'badge-warning-text' };
        case 'maintenance':
        case 'planned':
        case 'high':
          return { bg: 'badge-info', text: 'badge-info-text' };
        case 'offline':
        case 'cancelled':
        case 'critical':
          return { bg: 'badge-error', text: 'badge-error-text' };
        default:
          return { bg: 'badge-default', text: 'badge-default-text' };
      }
    };

    const config = getStatusConfig();
    const statusText = getStatusText(status);
    return (
      <span className={`status-badge ${config.bg} ${config.text}`}>
        {statusText}
      </span>
    );
  };

  const getStatusText = (status) => {
    const statusMap = {
      'operational': 'Opérationnel',
      'maintenance': 'Maintenance',
      'offline': 'Hors ligne',
      'active': 'Actif',
      'inactive': 'Inactif',
      'planned': 'Planifié',
      'in_transit': 'En transit',
      'completed': 'Terminé',
      'cancelled': 'Annulé',
      'low': 'Faible',
      'medium': 'Moyen',
      'high': 'Élevé',
      'critical': 'Critique'
    };
    return statusMap[status] || status;
  };

  const RoleBadge = ({ role }) => {
    const roleConfig = {
      'admin': { bg: 'badge-admin', text: 'badge-admin-text' },
      'gestionnaire': { bg: 'badge-manager', text: 'badge-manager-text' },
      'analyste': { bg: 'badge-analyst', text: 'badge-analyst-text' },
      'preparateur': { bg: 'badge-preparer', text: 'badge-preparer-text' }
    };

    const config = roleConfig[role] || { bg: 'badge-default', text: 'badge-default-text' };
    const roleText = {
      'admin': 'Administrateur',
      'gestionnaire': 'Gestionnaire',
      'analyste': 'Analyste',
      'preparateur': 'Préparateur'
    }[role] || role;

    return (
      <span className={`status-badge ${config.bg} ${config.text}`}>
        {roleText}
      </span>
    );
  };

  const AlertIcon = ({ type }) => {
    const icons = {
      'stock': '📦',
      'performance': '📊',
      'system': '⚙️',
      'security': '🔒'
    };
    return <span className="alert-icon">{icons[type]}</span>;
  };

  const OverviewSection = () => (
    <div className="tab-content">
      <div className="metrics-grid">
        <div className="metric-card blue">
          <h3>Entrepôts Actifs</h3>
          <p className="metric-value blue">{globalMetrics.totalWarehouses}</p>
          <p className="metric-subtext">Sites opérationnels</p>
        </div>

        <div className="metric-card green">
          <h3>Utilisateurs Actifs</h3>
          <p className="metric-value green">{globalMetrics.activeUsers}</p>
          <p className="metric-subtext">Personnel en système</p>
        </div>

        <div className="metric-card purple">
          <h3>Produits Gérés</h3>
          <p className="metric-value purple">{(globalMetrics.totalProducts || 0).toLocaleString()}</p>
          <p className="metric-subtext">{globalMetrics.totalStockQuantity ? `${globalMetrics.totalStockQuantity.toLocaleString()} unités` : 'SKU en stock'}</p>
        </div>

        <div className="metric-card orange">
          <h3>Transferts</h3>
          <p className="metric-value orange">{globalMetrics.fulfillmentRate}</p>
          <p className="metric-subtext">Complétés/Total</p>
        </div>

        {globalMetrics.totalEntries > 0 && (
          <div className="metric-card teal">
            <h3>Entrées Stock</h3>
            <p className="metric-value teal">{globalMetrics.totalEntries}</p>
            <p className="metric-subtext">Enregistrements d'entrée</p>
          </div>
        )}

        {globalMetrics.totalExits > 0 && (
          <div className="metric-card indigo">
            <h3>Sorties Stock</h3>
            <p className="metric-value indigo">{globalMetrics.totalExits}</p>
            <p className="metric-subtext">Enregistrements de sortie</p>
          </div>
        )}
      </div>

      <div className="dashboard-grid">
        <div className="dashboard-card">
          <h4>Alertes Actives ({alertsList?.total || 0})</h4>
          <div className="alerts-list">
            {alertsList?.recent?.slice(0, 3).map((alert, idx) => (
              <div key={idx} className="alert-item">
                <AlertIcon type={alert.type} />
                <div className="alert-content">
                  <p className="alert-message">{alert.message}</p>
                  <span className="alert-meta">{new Date(alert.timestamp || Date.now()).toLocaleString('fr-FR')}</span>
                </div>
                <StatusBadge status={alert.severity} />
              </div>
            ))}
          </div>
        </div>

        <div className="dashboard-card">
          <h4>Transferts en Cours ({transfersList?.byStatus?.in_transit || 0})</h4>
          <div className="transfers-list">
            {transfersList?.transfers?.filter(t => t.status === 'in_transit').slice(0, 3).map((transfer, idx) => (
              <div key={idx} className="transfer-item">
                <div className="transfer-route">
                  <span className="from">{transfer.fromWarehouse?.slice(0, 20) || 'Source'}</span>
                  <span className="arrow">→</span>
                  <span className="to">{transfer.toWarehouse?.slice(0, 20) || 'Destination'}</span>
                </div>
                <div className="transfer-details">
                  <span>{transfer.items?.reduce((s, i) => s + (i.quantity || 0), 0) || 0} items</span>
                  <StatusBadge status={transfer.status} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const WarehousesSection = () => (
    <div className="tab-content">
      <div className="section-header">
        <h3>Gestion des Entrepôts</h3>
        <button className="action-button primary" onClick={handleCreateWarehouse}>
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 5v14"/><path d="M5 12h14"/>
          </svg>
          Nouvel Entrepôt
        </button>
      </div>

      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Entrepôt</th>
              <th>Localisation</th>
              <th>Capacité</th>
              <th>Occupation</th>
              <th>Produits</th>
              <th>Gestionnaire</th>
              <th>Statut</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {warehousesList.map((warehouse, idx) => (
              <tr key={idx}>
                <td>
                  <div className="warehouse-info">
                    <strong>{warehouse.name}</strong>
                  </div>
                </td>
                <td>{warehouse.location || 'N/A'}</td>
                <td>{warehouse.capacity?.toLocaleString() || 0}</td>
                <td>
                  <div className="capacity-bar">
                    <div className="capacity-fill" style={{width: `${warehouse.occupancyRate || 0}%`}}></div>
                    <span>{warehouse.occupancyRate || 0}%</span>
                  </div>
                </td>
                <td>{warehouse.totalProducts?.toLocaleString() || 0}</td>
                <td>{warehouse.manager || 'N/A'}</td>
                <td><StatusBadge status={warehouse.status} /></td>
                <td>
                  <div className="action-buttons">
                    <button className="action-button secondary" onClick={() => manageWarehouse(warehouse.id, 'modifier')}>
                      Modifier
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const TransfersSection = () => (
    <div className="tab-content">
      <div className="section-header">
        <h3>Coordination des Transferts</h3>
        <button className="action-button primary" onClick={handleCreateTransfer}>
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 5v14"/><path d="M5 12h14"/>
          </svg>
          Nouveau Transfert
        </button>
      </div>

      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Référence</th>
              <th>Source</th>
              <th>Destination</th>
              <th>Quantité</th>
              <th>Date Départ</th>
              <th>Statut</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {transfersList?.transfers?.map((transfer, idx) => (
              <tr key={idx}>
                <td>
                  <strong>{transfer.id || `TRANS-${idx + 1}`}</strong>
                </td>
                <td>{transfer.fromWarehouse || 'N/A'}</td>
                <td>{transfer.toWarehouse || 'N/A'}</td>
                <td>{transfer.items?.reduce((sum, item) => sum + (item.quantity || 0), 0) || 0} unités</td>
                <td>{transfer.departureDate ? new Date(transfer.departureDate).toLocaleDateString('fr-FR') : 'N/A'}</td>
                <td><StatusBadge status={transfer.status} /></td>
                <td>
                  <div className="action-buttons">
                    {transfer.status === 'planned' && (
                      <button className="action-button primary" onClick={() => manageTransfer(transfer._id, 'démarrer')}>
                        Démarrer
                      </button>
                    )}
                    {transfer.status === 'in_transit' && (
                      <button className="action-button success" onClick={() => manageTransfer(transfer._id, 'compléter')}>
                        Terminer
                      </button>
                    )}
                    <button className="action-button secondary" onClick={() => manageTransfer(transfer._id, 'détails')}>
                      Détails
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {transfersList?.summary && (
        <div className="transfers-summary">
          <h4>Résumé des Transferts</h4>
          <div className="summary-grid">
            <div className="summary-card">
              <span className="summary-label">Planifiés</span>
              <span className="summary-value">{transfersList.summary.planned || 0}</span>
            </div>
            <div className="summary-card">
              <span className="summary-label">En Transit</span>
              <span className="summary-value">{transfersList.summary.in_transit || 0}</span>
            </div>
            <div className="summary-card">
              <span className="summary-label">Complétés</span>
              <span className="summary-value">{transfersList.summary.completed || 0}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const UsersSection = () => (
    <div className="tab-content">
      <div className="section-header">
        <h3>Gestion des Utilisateurs</h3>
        <button className="action-button primary" onClick={handleCreateUser}>
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
            <circle cx="9" cy="7" r="4"/>
            <path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
          </svg>
          Nouvel Utilisateur
        </button>
      </div>

      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Utilisateur</th>
              <th>Rôle</th>
              <th>Entrepôts Assignés</th>
              <th>Dernière Connexion</th>
              <th>Statut</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {usersList.map((user, idx) => (
              <tr key={idx}>
                <td>
                  <div className="user-info">
                    <strong>{user.name || user.username}</strong>
                    <span className="user-email">{user.email}</span>
                  </div>
                </td>
                <td>
                  <div className="roles-list">
                    <RoleBadge role={user.role || 'user'} />
                  </div>
                </td>
                <td>
                  <div className="warehouses-list">
                    <span className="warehouse-tag">Tous</span>
                  </div>
                </td>
                <td>{user.lastLogin ? new Date(user.lastLogin).toLocaleDateString('fr-FR') : 'Jamais'}</td>
                <td><StatusBadge status="active" /></td>
                <td>
                  <div className="action-buttons">
                    <button className="action-button secondary" onClick={() => manageUser(user._id || user.id, 'modifier')}>
                      Modifier
                    </button>
                    <button className="action-button warning" onClick={() => manageUser(user._id || user.id, 'désactiver')}>
                      Désactiver
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const SystemSection = () => (
    <div className="tab-content">
      <div className="section-header">
        <h3>Configuration Système</h3>
      </div>

      <div className="config-grid">
        <div className="config-card">
          <h4>Seuils d'Alerte Stock</h4>
          <div className="config-value">{(systemConfig && systemConfig.lowStockThreshold) ? systemConfig.lowStockThreshold : '—'} unités</div>
          <button className="action-button secondary" onClick={() => updateSystemConfig('lowStockThreshold', 75)}>
            Modifier
          </button>
        </div>

        <div className="config-card">
          <h4>Performance Minimum</h4>
          <div className="config-value">{(systemConfig && systemConfig.performanceAlertThreshold) ? systemConfig.performanceAlertThreshold : '—'}%</div>
          <button className="action-button secondary" onClick={() => updateSystemConfig('performanceAlertThreshold', 85)}>
            Modifier
          </button>
        </div>

        <div className="config-card">
          <h4>Réapprovisionnement Auto</h4>
          <div className="config-value">{(systemConfig && typeof systemConfig.autoReorder !== 'undefined') ? (systemConfig.autoReorder ? 'Activé' : 'Désactivé') : '—'}</div>
          <button className="action-button secondary" onClick={() => updateSystemConfig('autoReorder', !(systemConfig && systemConfig.autoReorder))}>
            {(systemConfig && systemConfig.autoReorder) ? 'Désactiver' : 'Activer'}
          </button>
        </div>

        <div className="config-card">
          <h4>Sauvegarde</h4>
          <div className="config-value">{(systemConfig && systemConfig.backupFrequency) ? systemConfig.backupFrequency : '—'}</div>
          <button className="action-button secondary" onClick={() => updateSystemConfig('backupFrequency', 'hourly')}>
            Modifier
          </button>
        </div>
      </div>

      <div className="integrations-section">
        <h4>Intégrations E-commerce</h4>
        <div className="integrations-list">
          {(systemConfig && Array.isArray(systemConfig.integrationEcommerce) ? systemConfig.integrationEcommerce : []).map(platform => (
            <div key={platform} className="integration-item">
              <span className="platform-name">{platform}</span>
              <StatusBadge status="active" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const AlertsSection = () => (
    <div className="tab-content">
      <div className="section-header">
        <h3>Monitoring des Alertes</h3>
        <div className="section-controls">
          <select className="select-control">
            <option>Toutes les sévérités</option>
            <option>Critique</option>
            <option>Élevé</option>
            <option>Moyen</option>
            <option>Faible</option>
          </select>
        </div>
      </div>

      <div className="alerts-container">
        {(alertsList && (Array.isArray(alertsList.alerts) ? alertsList.alerts : (Array.isArray(alertsList.recent) ? alertsList.recent : []))).map(alert => (
          <div key={alert._id || alert.id} className={`alert-card ${alert.severity || 'info'}`}>
            <div className="alert-header">
              <div className="alert-title">
                <h4>{alert.message}</h4>
                <span className="alert-meta">{alert.warehouse || 'N/A'} • {alert.createdAt ? new Date(alert.createdAt).toLocaleString('fr-FR') : new Date().toLocaleString('fr-FR')}</span>
              </div>
            </div>
            <div className="alert-actions">
              <button className="action-button secondary">Marquer comme lu</button>
              <button className="action-button primary">Résoudre</button>
            </div>
          </div>
        ))}
        {(!alertsList || (!alertsList.alerts && !alertsList.recent) || (alertsList.alerts && alertsList.alerts.length === 0 && alertsList.recent && alertsList.recent.length === 0)) && (
          <div className="empty-state">
            <p>Aucune alerte actuellement</p>
          </div>
        )}
      </div>
    </div>
  );

  const renderTabContent = () => {
    switch(activeTab) {
      case 'overview': return <OverviewSection />;
      case 'warehouses': return <WarehousesSection />;
      case 'transfers': return <TransfersSection />;
      case 'users': return <UsersSection />;
      case 'system': return <SystemSection />;
      case 'alerts': return <AlertsSection />;
      default: return <OverviewSection />;
    }
  };

  return (
    <div className="admin-logistique">
      {showStatus && (
        <div className={`status-message ${statusMessage.includes('déconnecté') ? 'info' : 'default'}`}>
          {statusMessage}
        </div>
      )}

      {loading && (
        <div className="status-message default">Chargement des données d'administration...</div>
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
                  <circle cx="8" cy="20" r="1"/>
                  <circle cx="17" cy="20" r="1"/>
                  <path d="M20 4.4 17 6H4l-1.5 8h17l-2.7-8h-11"/>
                  <path d="M10 9l.9 3.4"/>
                </svg>
              </div>
              
              <nav className="navigation">
                <a href="#" className="nav-link" onClick={(e) => navigateToRole('home', e)}>
                  Accueil
                </a>
                <a href="#" className="nav-link" onClick={(e) => navigateToRole('data_analyst', e)}>
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
                <a href="#" className="nav-link active">
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
          <h1>Administration Logistique</h1>
          <p>Supervision multi-sites et coordination des opérations logistiques</p>
        </div>

        <div className="admin-tabs">
          <button 
            className={`tab-button ${activeTab === 'overview' ? 'active' : ''}`}
            onClick={() => setActiveTab('overview')}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>
            </svg>
            Vue d'ensemble
          </button>
          <button 
            className={`tab-button ${activeTab === 'warehouses' ? 'active' : ''}`}
            onClick={() => setActiveTab('warehouses')}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="m7.5 4.27 9 5.15"/><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/><path d="m3.3 7 8.7 5 9-5"/><path d="M12 22V12"/>
            </svg>
            Entrepôts
          </button>
          <button 
            className={`tab-button ${activeTab === 'transfers' ? 'active' : ''}`}
            onClick={() => setActiveTab('transfers')}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 16H6"/><path d="M18 8H6"/><path d="M20 6 12 2 4 6"/><path d="M20 18l-8 4-8-4"/><path d="m4 6 8 4 8-4"/><path d="m4 18 8 4 8-4"/><path d="M8 2v4"/><path d="M16 2v4"/>
            </svg>
            Transferts
          </button>
          <button 
            className={`tab-button ${activeTab === 'users' ? 'active' : ''}`}
            onClick={() => setActiveTab('users')}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
            </svg>
            Utilisateurs
          </button>
          <button 
            className={`tab-button ${activeTab === 'system' ? 'active' : ''}`}
            onClick={() => setActiveTab('system')}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18"/><path d="M9 21V9"/>
            </svg>
            Configuration
          </button>
          <button 
            className={`tab-button ${activeTab === 'alerts' ? 'active' : ''}`}
            onClick={() => setActiveTab('alerts')}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><path d="M12 9v4"/><path d="M12 17h.01"/>
            </svg>
            Alertes
          </button>
        </div>

        {renderTabContent()}
      </main>

      <footer className="footer">
        <div className="footer-content">
          <p>&copy; 2025 StockSync. Administration Logistique Multi-Sites. Version 1.0</p>
        </div>
      </footer>
    </div>
  );
};

export default AdministrationLogistique;