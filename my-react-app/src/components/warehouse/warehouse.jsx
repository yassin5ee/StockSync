import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './warehouse.css';
import useAdminData from '../../utils/useAdminData';

const Warehouse = () => {
  const navigate = useNavigate();
  const [userName] = useState(localStorage.getItem('username') || 'Gestionnaire');
  const { warehouses, loading } = useAdminData();
  const [statusMessage, setStatusMessage] = useState('');
  const [showStatus, setShowStatus] = useState(false);
  const [warehouse, setWarehouse] = useState('A');

  // Sample data (fallback)
  const [stockData] = useState([
    {
      location: 'Aisle-05-R03-L2',
      sku: 'REF-007Z',
      description: 'Support Téléphone Premium',
      quantity: 850,
      status: 'ok'
    },
    {
      location: 'Aisle-12-R01-L1',
      sku: 'REF-112A',
      description: 'Écouteurs sans fil (BLEU)',
      quantity: 120,
      status: 'low'
    },
    {
      location: 'Aisle-03-R05-L3',
      sku: 'REF-045Y',
      description: 'Batterie Externe 10000mAh',
      quantity: 2100,
      status: 'ok'
    },
    {
      location: 'Aisle-07-R02-L4',
      sku: 'REF-999K',
      description: 'Rupture (Commande en cours)',
      quantity: 0,
      status: 'rupture'
    }
  ]);

  // Navigation functions
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
    navigate('/');
  };

  const showMessage = (message, type) => {
    setStatusMessage(message);
    setShowStatus(true);
    
    setTimeout(() => {
      setShowStatus(false);
    }, 3000);
  };

  const startInventory = () => {
    alertUser("Action: Lancement d'un nouvel inventaire");
    showMessage('Nouvel inventaire lancé avec succès', 'info');
  };

  const viewLocations = () => {
    alertUser("Action: Consultation des emplacements");
    showMessage('Planification des emplacements ouverte', 'info');
  };

  const handleWarehouseChange = (e) => {
    setWarehouse(e.target.value);
    showMessage(`Entrepôt changé pour ${e.target.value}`, 'info');
  };

  useEffect(() => {
    console.log("Page Gestionnaire d'Entrepôt chargée. Tableau de bord prêt.");
    // You could map `warehouses` into stock locations if backend provides inventory per location
    if (!loading) console.log(`Loaded ${warehouses.length} warehouses`);
  }, []);

  // Status Badge component
  const StatusBadge = ({ status }) => {
    const statusConfig = {
      ok: { label: 'OK', class: 'badge-ok' },
      low: { label: 'Faible', class: 'badge-low' },
      rupture: { label: 'Rupture', class: 'badge-rupture' }
    };

    const config = statusConfig[status] || { label: 'Inconnu', class: 'badge-unknown' };

    return (
      <span className={`status-badge ${config.class}`}>
        {config.label}
      </span>
    );
  };

  return (
    <div className="warehouse">
      {/* Status Message */}
      {showStatus && (
        <div className={`status-message ${statusMessage.includes('déconnecté') ? 'info' : 'default'}`}>
          {statusMessage}
        </div>
      )}

      {/* Header */}
      <header className="header">
        <div className="header-container">
          
          {/* Left Section: Back + Logo + Navigation */}
          <div className="header-left">
            
            {/* Back Link */}
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

            {/* Logo and Navigation Container */}
            <div className="header-left">
              {/* Logo */}
              <div className="logo-container">
                <span className="logo-text">StockSync</span>
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="logo-icon">
                  <rect width="18" height="18" x="3" y="3" rx="2"/>
                  <path d="M3 9h18"/>
                  <path d="M9 21V9"/>
                </svg>
              </div>
              
              {/* Main Navigation */}
              <nav className="navigation">
                <a href="#" className="nav-link" onClick={(e) => navigateToRole('home', e)}>
                  Accueil
                </a>
                <a href="#" className="nav-link" onClick={(e) => navigateToRole('data_analyst', e)}>
                  Analyse données
                </a>
                <a href="#" className="nav-link active">
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

          {/* Right Section: Utilities and User */}
          <div className="header-right">
            {/* Notifications and Settings */}
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
            
            {/* User Info and Logout */}
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
          <h1>Gestion Opérationnelle des Entrepôts</h1>
          <p>Vue en temps réel des stocks, emplacements et inventaires en cours.</p>
        </div>

        {/* Warehouse Actions */}
        <div className="warehouse-actions">
          <div className="warehouse-select">
            <label className="select-label">Entrepôt Actuel :</label>
            <select 
              value={warehouse} 
              onChange={handleWarehouseChange}
              className="select-control"
            >
              <option value="A">Entrepôt A - Paris (Principal)</option>
              <option value="B">Entrepôt B - Lyon</option>
              <option value="C">Entrepôt C - Bordeaux</option>
            </select>
          </div>
          <div className="action-buttons">
            <button 
              onClick={startInventory}
              className="action-button primary"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 12a9 9 0 0 1-9 9m9-9a9 9 0 0 0-9-9m9 9H3m9 9v-9m0-9v9"/>
              </svg>
              Nouvel Inventaire
            </button>
            <button 
              onClick={viewLocations}
              className="action-button secondary"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="3 11 22 2 13 21 11 13 3 11"/>
              </svg>
              Planification des Emplacements
            </button>
          </div>
        </div>
        
        {/* Performance Metrics */}
        <div className="metrics-grid">
          
          {/* Stock Général */}
          <div className="metric-card blue">
            <h3>Stock Général</h3>
            <p className="metric-value blue">125,400</p>
            <p className="metric-subtext">Total Unités Physiques</p>
            <div className="metric-details">
              <div className="metric-detail">
                <span>Nombre de Références (SKUs):</span>
                <strong>4,120</strong>
              </div>
              <div className="metric-detail">
                <span>Valorisation Estimée:</span>
                <strong>€ 4,5 M</strong>
              </div>
            </div>
          </div>

          {/* Inventaires Cycliques */}
          <div className="metric-card orange">
            <h3>Inventaires Cycliques</h3>
            <p className="metric-value orange">8</p>
            <p className="metric-subtext">Inventaires à Traiter (Aujourd'hui)</p>
            <div className="metric-details">
              <div className="metric-detail">
                <span>Références Contrôlées (Semaine):</span>
                <strong>450</strong>
              </div>
              <div className="metric-detail">
                <span>Taux de Précision Moyen:</span>
                <strong>99.8%</strong>
              </div>
            </div>
          </div>

          {/* Alerte Stock / Capacité */}
          <div className="metric-card red">
            <h3>Alerte Stock / Capacité</h3>
            <p className="metric-value red">12</p>
            <p className="metric-subtext">Références en rupture imminente</p>
            <div className="metric-details">
              <div className="metric-detail">
                <span>Emplacements saturés (&gt;95%):</span>
                <strong>48</strong>
              </div>
              <div className="metric-detail">
                <span>Mouvements de stock en attente:</span>
                <strong>210</strong>
              </div>
            </div>
          </div>
        </div>

        {/* Stock Table */}
        <div className="stock-section">
          <div className="section-header">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect width="18" height="18" x="3" y="3" rx="2" ry="2"/>
              <line x1="3" x2="21" y1="9" y2="9"/>
              <line x1="9" x2="9" y1="21" y2="9"/>
            </svg>
            <h3>Liste des Emplacements Actuels (Entrepôt {warehouse})</h3>
          </div>
          
          <div className="table-container">
            <table className="stock-table">
              <thead>
                <tr>
                  <th>Localisation</th>
                  <th>Réf. SKU</th>
                  <th>Description</th>
                  <th className="text-right">Qté. Disponible</th>
                  <th>Statut</th>
                </tr>
              </thead>
              <tbody>
                {stockData.map((item, index) => (
                  <tr key={index}>
                    <td>
                      <span className="location-id">{item.location}</span>
                    </td>
                    <td>
                      <span className="sku-id">{item.sku}</span>
                    </td>
                    <td>
                      <span className="item-description">{item.description}</span>
                    </td>
                    <td className="text-right">
                      <span className="quantity">{item.quantity.toLocaleString()}</span>
                    </td>
                    <td>
                      <StatusBadge status={item.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="footer">
        <div className="footer-content">
          <p>&copy; 2025 StockSync. Optimisation Logistique. Version 1.0</p>
        </div>
      </footer>
    </div>
  );
};

export default Warehouse;