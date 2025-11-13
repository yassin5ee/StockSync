import React, { useState } from 'react';
import './AdministrationLogistique.css';

const AdministrationLogistique = () => {
  const [userName] = useState('Admin Logistique');
  const [statusMessage, setStatusMessage] = useState('');
  const [showStatus, setShowStatus] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  // Données mock
  const [globalMetrics] = useState({
    totalWarehouses: 8,
    activeUsers: 47,
    totalProducts: 12500,
    todayOrders: 342,
    fulfillmentRate: '98.2%',
    transferEfficiency: '94.5%'
  });

  const [warehouses] = useState([
    {
      id: 1,
      name: 'Entrepôt Paris Nord',
      location: 'Roissy, France',
      capacity: 10000,
      used: 7842,
      status: 'operational',
      manager: 'Sophie Martin',
      products: 2450,
      performance: '97.8%'
    },
    {
      id: 2,
      name: 'Entrepôt Lyon Est',
      location: 'Lyon, France',
      capacity: 8000,
      used: 6120,
      status: 'operational',
      manager: 'Thomas Bernard',
      products: 1890,
      performance: '96.2%'
    },
    {
      id: 3,
      name: 'Entrepôt Marseille Sud',
      location: 'Marseille, France',
      capacity: 6000,
      used: 4230,
      status: 'maintenance',
      manager: 'Julie Petit',
      products: 1560,
      performance: '95.1%'
    },
    {
      id: 4,
      name: 'Entrepôt Bordeaux Ouest',
      location: 'Bordeaux, France',
      capacity: 5000,
      used: 2980,
      status: 'operational',
      manager: 'Marc Dubois',
      products: 980,
      performance: '98.5%'
    }
  ]);

  const [users] = useState([
    {
      id: 1,
      name: 'Sophie Martin',
      email: 'sophie.martin@stocksync.com',
      role: 'gestionnaire',
      warehouses: ['Paris Nord'],
      lastLogin: '2025-01-15 08:30',
      status: 'active'
    },
    {
      id: 2,
      name: 'Thomas Bernard',
      email: 'thomas.bernard@stocksync.com',
      role: 'gestionnaire',
      warehouses: ['Lyon Est'],
      lastLogin: '2025-01-15 09:15',
      status: 'active'
    },
    {
      id: 3,
      name: 'Julie Petit',
      email: 'julie.petit@stocksync.com',
      role: 'gestionnaire',
      warehouses: ['Marseille Sud'],
      lastLogin: '2025-01-14 16:45',
      status: 'active'
    },
    {
      id: 4,
      name: 'Marc Dubois',
      email: 'marc.dubois@stocksync.com',
      role: 'gestionnaire',
      warehouses: ['Bordeaux Ouest'],
      lastLogin: '2025-01-15 07:20',
      status: 'active'
    },
    {
      id: 5,
      name: 'Laura Moreau',
      email: 'laura.moreau@stocksync.com',
      role: 'analyste',
      warehouses: ['Tous'],
      lastLogin: '2025-01-15 10:10',
      status: 'active'
    }
  ]);

  const [transfers] = useState([
    {
      id: 1,
      from: 'Paris Nord',
      to: 'Lyon Est',
      products: 150,
      status: 'in_transit',
      scheduledDate: '2025-01-15',
      estimatedArrival: '2025-01-16'
    },
    {
      id: 2,
      from: 'Lyon Est',
      to: 'Marseille Sud',
      products: 85,
      status: 'planned',
      scheduledDate: '2025-01-16',
      estimatedArrival: '2025-01-17'
    },
    {
      id: 3,
      from: 'Bordeaux Ouest',
      to: 'Paris Nord',
      products: 200,
      status: 'completed',
      scheduledDate: '2025-01-14',
      estimatedArrival: '2025-01-15'
    }
  ]);

  const [alerts] = useState([
    {
      id: 1,
      type: 'stock',
      severity: 'medium',
      message: 'Stock faible pour produit SKU-7842 à Paris Nord',
      timestamp: '2025-01-15 09:30',
      warehouse: 'Paris Nord'
    },
    {
      id: 2,
      type: 'performance',
      severity: 'low',
      message: 'Performance picking en baisse à Lyon Est',
      timestamp: '2025-01-15 08:45',
      warehouse: 'Lyon Est'
    },
    {
      id: 3,
      type: 'system',
      severity: 'high',
      message: 'Maintenance planifiée pour Marseille Sud',
      timestamp: '2025-01-14 16:20',
      warehouse: 'Marseille Sud'
    }
  ]);

  const [systemConfig] = useState({
    lowStockThreshold: 50,
    performanceAlertThreshold: 90,
    autoReorder: true,
    transferAutoApprove: false,
    integrationEcommerce: ['Shopify', 'WooCommerce', 'PrestaShop'],
    backupFrequency: 'daily'
  });

  // Fonctions de navigation
  const navigateToRole = (roleKey, event) => {
    if (event) event.preventDefault();
    const roleName = getRoleName(roleKey);
    alertUser(`Accès au rôle : ${roleName}`);
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
    console.log("Déconnexion de l'utilisateur. Retour à la page de connexion.");
    showMessage("Vous avez été déconnecté.", 'info');
  };

  const showMessage = (message, type) => {
    setStatusMessage(message);
    setShowStatus(true);
    
    setTimeout(() => {
      setShowStatus(false);
    }, 3000);
  };

  const manageUser = (userId, action) => {
    alertUser(`Action: ${action} sur l'utilisateur ${userId}`);
    showMessage(`Action ${action} effectuée sur l'utilisateur`, 'info');
  };

  const manageWarehouse = (warehouseId, action) => {
    alertUser(`Action: ${action} sur l'entrepôt ${warehouseId}`);
    showMessage(`Action ${action} effectuée sur l'entrepôt`, 'info');
  };

  const manageTransfer = (transferId, action) => {
    alertUser(`Action: ${action} sur le transfert ${transferId}`);
    showMessage(`Action ${action} effectuée sur le transfert`, 'info');
  };

  const updateSystemConfig = (configKey, value) => {
    alertUser(`Configuration mise à jour: ${configKey} = ${value}`);
    showMessage(`Configuration ${configKey} mise à jour`, 'info');
  };

  // Composants de statut
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

  // Composants de section
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
          <p className="metric-subtext">Personnel connecté</p>
        </div>

        <div className="metric-card purple">
          <h3>Produits Gérés</h3>
          <p className="metric-value purple">{globalMetrics.totalProducts.toLocaleString()}</p>
          <p className="metric-subtext">SKU en stock</p>
        </div>

        <div className="metric-card orange">
          <h3>Taux de Remplissage</h3>
          <p className="metric-value orange">{globalMetrics.fulfillmentRate}</p>
          <p className="metric-subtext">Commandes traitées</p>
        </div>
      </div>

      <div className="dashboard-grid">
        <div className="dashboard-card">
          <h4>Alertes Actives</h4>
          <div className="alerts-list">
            {alerts.slice(0, 3).map(alert => (
              <div key={alert.id} className="alert-item">
                <AlertIcon type={alert.type} />
                <div className="alert-content">
                  <p className="alert-message">{alert.message}</p>
                  <span className="alert-meta">{alert.warehouse} • {alert.timestamp}</span>
                </div>
                <StatusBadge status={alert.severity} />
              </div>
            ))}
          </div>
        </div>

        <div className="dashboard-card">
          <h4>Transferts en Cours</h4>
          <div className="transfers-list">
            {transfers.filter(t => t.status === 'in_transit').map(transfer => (
              <div key={transfer.id} className="transfer-item">
                <div className="transfer-route">
                  <span className="from">{transfer.from}</span>
                  <span className="arrow">→</span>
                  <span className="to">{transfer.to}</span>
                </div>
                <div className="transfer-details">
                  <span>{transfer.products} produits</span>
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
        <button className="action-button primary">
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
              <th>Performance</th>
              <th>Gestionnaire</th>
              <th>Statut</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {warehouses.map(warehouse => (
              <tr key={warehouse.id}>
                <td>
                  <div className="warehouse-info">
                    <strong>{warehouse.name}</strong>
                    <span className="product-count">{warehouse.products} produits</span>
                  </div>
                </td>
                <td>{warehouse.location}</td>
                <td>
                  <div className="capacity-bar">
                    <div className="capacity-fill" style={{width: `${(warehouse.used / warehouse.capacity) * 100}%`}}></div>
                    <span>{warehouse.used}/{warehouse.capacity}</span>
                  </div>
                </td>
                <td>{warehouse.performance}</td>
                <td>{warehouse.manager}</td>
                <td><StatusBadge status={warehouse.status} /></td>
                <td>
                  <div className="action-buttons">
                    <button className="action-button secondary" onClick={() => manageWarehouse(warehouse.id, 'modifier')}>
                      Modifier
                    </button>
                    <button className="action-button warning" onClick={() => manageWarehouse(warehouse.id, 'maintenance')}>
                      Maintenance
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
        <button className="action-button primary">
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
              <th>De → Vers</th>
              <th>Produits</th>
              <th>Date Planifiée</th>
              <th>Arrivée Estimée</th>
              <th>Statut</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {transfers.map(transfer => (
              <tr key={transfer.id}>
                <td>
                  <div className="transfer-route">
                    <span className="from">{transfer.from}</span>
                    <span className="arrow">→</span>
                    <span className="to">{transfer.to}</span>
                  </div>
                </td>
                <td>{transfer.products}</td>
                <td>{transfer.scheduledDate}</td>
                <td>{transfer.estimatedArrival}</td>
                <td><StatusBadge status={transfer.status} /></td>
                <td>
                  <div className="action-buttons">
                    {transfer.status === 'planned' && (
                      <button className="action-button primary" onClick={() => manageTransfer(transfer.id, 'démarrer')}>
                        Démarrer
                      </button>
                    )}
                    {transfer.status === 'in_transit' && (
                      <button className="action-button success" onClick={() => manageTransfer(transfer.id, 'compléter')}>
                        Terminer
                      </button>
                    )}
                    <button className="action-button secondary" onClick={() => manageTransfer(transfer.id, 'détails')}>
                      Détails
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

  const UsersSection = () => (
    <div className="tab-content">
      <div className="section-header">
        <h3>Gestion des Utilisateurs</h3>
        <button className="action-button primary">
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
              <th>Entrepôts</th>
              <th>Dernière Connexion</th>
              <th>Statut</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map(user => (
              <tr key={user.id}>
                <td>
                  <div className="user-info">
                    <strong>{user.name}</strong>
                    <span className="user-email">{user.email}</span>
                  </div>
                </td>
                <td><RoleBadge role={user.role} /></td>
                <td>
                  <div className="warehouses-list">
                    {user.warehouses.map((wh, index) => (
                      <span key={index} className="warehouse-tag">{wh}</span>
                    ))}
                  </div>
                </td>
                <td>{user.lastLogin}</td>
                <td><StatusBadge status={user.status} /></td>
                <td>
                  <div className="action-buttons">
                    <button className="action-button secondary" onClick={() => manageUser(user.id, 'modifier')}>
                      Modifier
                    </button>
                    <button className="action-button warning" onClick={() => manageUser(user.id, user.status === 'active' ? 'désactiver' : 'activer')}>
                      {user.status === 'active' ? 'Désactiver' : 'Activer'}
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
          <div className="config-value">{systemConfig.lowStockThreshold} unités</div>
          <button className="action-button secondary" onClick={() => updateSystemConfig('lowStockThreshold', 75)}>
            Modifier
          </button>
        </div>

        <div className="config-card">
          <h4>Performance Minimum</h4>
          <div className="config-value">{systemConfig.performanceAlertThreshold}%</div>
          <button className="action-button secondary" onClick={() => updateSystemConfig('performanceAlertThreshold', 85)}>
            Modifier
          </button>
        </div>

        <div className="config-card">
          <h4>Réapprovisionnement Auto</h4>
          <div className="config-value">{systemConfig.autoReorder ? 'Activé' : 'Désactivé'}</div>
          <button className="action-button secondary" onClick={() => updateSystemConfig('autoReorder', !systemConfig.autoReorder)}>
            {systemConfig.autoReorder ? 'Désactiver' : 'Activer'}
          </button>
        </div>

        <div className="config-card">
          <h4>Sauvegarde</h4>
          <div className="config-value">{systemConfig.backupFrequency}</div>
          <button className="action-button secondary" onClick={() => updateSystemConfig('backupFrequency', 'hourly')}>
            Modifier
          </button>
        </div>
      </div>

      <div className="integrations-section">
        <h4>Intégrations E-commerce</h4>
        <div className="integrations-list">
          {systemConfig.integrationEcommerce.map(platform => (
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
        {alerts.map(alert => (
          <div key={alert.id} className={`alert-card ${alert.severity}`}>
            <div className="alert-header">
              <AlertIcon type={alert.type} />
              <div className="alert-title">
                <h4>{alert.message}</h4>
                <span className="alert-meta">{alert.warehouse} • {alert.timestamp}</span>
              </div>
              <StatusBadge status={alert.severity} />
            </div>
            <div className="alert-actions">
              <button className="action-button secondary">Marquer comme lu</button>
              <button className="action-button primary">Résoudre</button>
            </div>
          </div>
        ))}
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
      {/* Status Message */}
      {showStatus && (
        <div className={`status-message ${statusMessage.includes('déconnecté') ? 'info' : 'default'}`}>
          {statusMessage}
        </div>
      )}

      {/* Header */}
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
                onClick={() => alertUser('Paramètres : Fonctionnalité à développer')}
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

      {/* Main Content */}
      <main className="main-content">
        
        {/* Dashboard Title */}
        <div className="dashboard-title">
          <h1>Administration Logistique</h1>
          <p>Supervision multi-sites et coordination des opérations logistiques</p>
        </div>

        {/* Navigation Tabs */}
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

        {/* Tab Content */}
        {renderTabContent()}
      </main>

      {/* Footer */}
      <footer className="footer">
        <div className="footer-content">
          <p>&copy; 2025 StockSync. Administration Logistique Multi-Sites. Version 1.0</p>
        </div>
      </footer>
    </div>
  );
};

export default AdministrationLogistique;